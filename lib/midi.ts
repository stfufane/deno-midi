/// <reference lib="deno.unstable" />

import { dlopen } from "https://deno.land/x/plug@1.0.2/mod.ts";
import * as rtmidi_bindings from "./bindings/rtmidi.ts";
import { RtMidiCCallbackCallbackDefinition } from "./bindings/typeDefinitions.ts";
import { ErrorHandling, getLibUrl, IgnoreTypeOptions } from "./utils.ts";
import { decodeMessage, Message, MessageData } from "./messages.ts";
import {
  EventBus,
  getMessageEvent,
  MessageEventContract,
  MessageEventHandler,
  MessageEvents,
} from "./events.ts";

// Export the extra types.
export * from "./messages.ts";

const lib = await dlopen({ name: "rtmidi", url: getLibUrl() }, rtmidi_bindings);

const rtmidi = lib.symbols;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * @abstract Get the version of the lib.
 * @returns The current RtMidi version.
 */
export function getVersion(): string {
  const version_buffer = rtmidi.rtmidi_get_version();
  if (version_buffer != null) {
    const version = new Deno.UnsafePointerView(version_buffer);
    return version.getCString();
  }
  return "not found";
}

/**
 * @abstract Generic wrapper around a MIDI device.
 * Encapsulates all the common methods used by Input and Output.
 */
abstract class Device {
  protected device: Deno.PointerValue;
  protected open_port = false;
  protected readonly port_name: string;

  constructor(port_name: string, device_ptr: Deno.PointerValue) {
    this.port_name = port_name;
    if (device_ptr == null) {
      throw new Error("Failed to create default midi in device");
    }
    this.device = device_ptr;
    this.checkError();
  }

  /**
   * @abstract Free the device pointer.
   */
  abstract freeDevice(): void;

  /**
   * Read the device pointer to check is the last operation was successful.
   * @param error_mode How the error message is handled
   */
  protected checkError(error_mode = ErrorHandling.Throw): void {
    // Read the 17th byte of the device to check the error.
    const ok_ptr = Deno.UnsafePointer.offset(this.device!, 16);
    if (ok_ptr == null) {
      throw new Error("Error pointer is null");
    }

    const ok_data = new Uint8Array(
      new Deno.UnsafePointerView(ok_ptr).getArrayBuffer(1),
    );
    if (ok_data[0] == 1) {
      return;
    }

    // Retrieve the error message
    const msg_ptr = new Deno.UnsafePointerView(this.device!).getPointer(24);
    if (msg_ptr != null) {
      const error = Deno.UnsafePointerView.getCString(msg_ptr);
      // Clear the error message pointer for next calls.
      rtmidi.rtmidi_clear_error(this.device);

      // Handle the error according to the error mode.
      switch (error_mode) {
        case ErrorHandling.Throw:
          throw new Error(error);
        case ErrorHandling.Log:
          console.error(error);
          break;
        case ErrorHandling.Silent:
          break;
      }
    }
  }

  /**
   * Get the number of available ports.
   * @returns The number of available ports.
   */
  getPortCount(): number {
    const nb_ports = rtmidi.rtmidi_get_port_count(this.device);
    this.checkError();
    return nb_ports;
  }

  /**
   * Get the name of the available ports for the current device.
   * @returns The name of the available ports.
   */
  getPorts(): string[] {
    const port_name = new Uint8Array(32);
    const port_name_length = new Uint32Array(1).fill(32);
    const ports: string[] = [];
    for (let i = 0; i < this.getPortCount(); i++) {
      // Retrieve the name of the port and the length of the name.
      const success = rtmidi.rtmidi_get_port_name(
        this.device,
        i,
        port_name,
        port_name_length,
      );
      this.checkError();
      ports.push(decoder.decode(port_name).substring(0, success));
    }
    return ports;
  }

  /**
   * Open a MIDI connection given on a given port number.
   * @param port the port number to open (from 0 to get_port_count() - 1)
   * @throws Error if the port number is invalid.
   */
  openPort(port: number): void {
    if (port >= this.getPortCount()) {
      throw new Error("Invalid port number");
    }
    rtmidi.rtmidi_open_port(
      this.device,
      port,
      encoder.encode(this.port_name + "\0"),
    );
    this.checkError();
    this.open_port = true;
  }

  /**
   * Open a MIDI connection given on a given port name.
   * @param port the port name to open
   * @throws Error if the port name is invalid.
   * @example
   * ```ts
   * midi_in.openPortByName("My Midi Port");
   * ```
   */
  openPortByName(port: string): void {
    const ports = this.getPorts();
    // On windows, ports are named "port_name port_number" so we need to parse the port name.
    if (Deno.build.os == "windows") {
      for (let i = 0; i < ports.length; i++) {
        if (ports[i] == (port + " " + i)) {
          this.openPort(i);
          return;
        }
      }
      throw new Error("Invalid port name");
    } else {
      const port_index = ports.indexOf(port);
      if (port_index == -1) {
        throw new Error("Invalid port name");
      }
      this.openPort(port_index);
    }
  }

  /**
   * Opens a virtual MIDI port to allow software to software connections.
   * @summary This method is not supported on Windows.
   */
  openVirtualPort(): void {
    if (Deno.build.os == "windows") {
      throw new Error("Virtual ports are not supported on Windows");
    }

    rtmidi.rtmidi_open_virtual_port(
      this.device,
      encoder.encode("Virtual " + this.port_name + "\0"),
    );
    this.checkError();
  }

  /**
   * Close the current port.
   */
  closePort(): void {
    rtmidi.rtmidi_close_port(this.device);
    this.checkError();
    this.open_port = false;
  }
}

/**
 * Wrapper around a MIDI input device.
 * Allows to receive MIDI messages from a MIDI input device.
 * @extends Device
 * @see Device
 */
export class Input<T extends MessageEventContract<T> = MessageEvents>
  extends Device
  implements EventBus<T> {
  private callback:
    | Deno.UnsafeCallback<typeof RtMidiCCallbackCallbackDefinition>
    | null = null;
  private event_handlers: Map<string, MessageEventHandler> = new Map();

  constructor() {
    const midi_in = rtmidi.rtmidi_in_create_default();
    super("Deno Midi In Port", midi_in);
  }

  /**
   * Free the device pointer.
   */
  freeDevice(): void {
    // Ensure the port is closed first.
    if (this.open_port) {
      this.closePort();
    }
    rtmidi.rtmidi_in_free(this.device);
  }

  /**
   * Open a MIDI connection given on a given port number.
   * @param port the port number to open (from 0 to get_port_count() - 1)
   * @throws Error if the port number is invalid.
   */
  openPort(port: number): void {
    super.openPort(port);
    this.createCallback();
  }

  /**
   * Declare the callback for input messages.
   * @throws Error if the callback could not be created.
   */
  private createCallback<EventName extends keyof T>(): void {
    this.callback = Deno.UnsafeCallback.threadSafe(
      RtMidiCCallbackCallbackDefinition,
      (
        deltaTime: number,
        message: Deno.PointerValue<unknown>,
        messageSize: number | bigint,
        _userData: Deno.PointerValue<unknown>,
      ) => {
        const msg_data = new Uint8Array(
          new Deno.UnsafePointerView(message!).getArrayBuffer(
            messageSize as number,
          ),
        );
        const msg = decodeMessage(msg_data);

        // By default, emit the message event as a generic message
        this.emit<EventName>("message" as EventName, {
          message: msg as T[EventName],
          deltaTime,
        });
        // Then, emit the specific event for the message type.
        const event_type = getMessageEvent(msg.type);
        if (event_type != "message") {
          this.emit<EventName>(event_type as EventName, {
            message: msg as T[EventName],
            deltaTime,
          });
        }
      },
    );
    rtmidi.rtmidi_in_set_callback(this.device, this.callback!.pointer, null);
    this.checkError();
  }

  /**
   * Set a callback to be called when a message is received.
   * @param event the event to listen to from a list of accepted events
   * @param handler the callback to be called when the event is emitted
   * @example
   * ```ts
   * midi_in.on("message", ({ message }) => {
   *  console.log(message.getType());
   * });
   */
  on<EventName extends keyof T>(
    event: EventName,
    handler: MessageEventHandler<T[EventName]>,
  ): void {
    if (this.event_handlers.has(event as string)) {
      throw new Error("Callback already registered");
    }
    this.event_handlers.set(event as string, handler);
  }

  /**
   * Remove a callback from the list of callbacks.
   * @param event the event to remove from the list of callbacks
   * @example
   * ```ts
   * midi_in.off("message");
   */
  off<EventName extends keyof T>(event: EventName): void {
    this.event_handlers.delete(event as string);
  }

  /**
   * Internal method to emit an event for a given message type.
   */
  emit<EventName extends keyof T>(
    event: EventName,
    data: { message: T[EventName]; deltaTime?: number },
  ): void {
    const handler = this.event_handlers.get(event as string);
    if (handler) {
      handler(data);
    }
  }

  /**
   * Ignore incoming MIDI messages of a given type.
   * @param options the types of messages to ignore (sysex, timing, activeSensing)
   */
  ignoreTypes(options: IgnoreTypeOptions): void {
    rtmidi.rtmidi_in_ignore_types(
      this.device,
      options.sysex || false,
      options.timing || false,
      options.activeSensing || false,
    );
    this.checkError();
  }

  /**
   * Remove the callback created when opening the port.
   * @throws Error if the callback could not be removed.
   */
  closePort(): void {
    this.event_handlers.clear(); // Remove all the user callbacks.
    rtmidi.rtmidi_in_cancel_callback(this.device);
    this.callback?.unref();
    this.callback = null;
    this.checkError();
    super.closePort();
  }
}

/**
 * Wrapper around a MIDI output device.
 * Allows to send MIDI messages to a MIDI output device.
 * @extends Device
 * @see Device
 */
export class Output extends Device {
  constructor() {
    const midi_out = rtmidi.rtmidi_out_create_default();
    super("Deno Midi Out Port", midi_out);
  }

  /**
   * Free the device pointer.
   */
  freeDevice(): void {
    // Ensure the port is closed first.
    if (this.open_port) {
      this.closePort();
    }
    rtmidi.rtmidi_out_free(this.device);
  }

  /**
   * Immediately send a single message out an open MIDI output port.
   * @param message an array of bytes describing the MIDI message
   * @example
   * ```ts
   * // Send a middle C note on MIDI channel 1 with a Message object
   * midi_out.sendMessage(new midi.NoteOn({ note: 0x3C, velocity: 0x7F }));
   * midi_out.sendMessage(new midi.NoteOff({ note: 0x3C, velocity: 0x7F }));
   * // Or as a raw array of bytes
   * midi_out.sendMessage([0x90, 0x3C, 0x7F]);
   * midi_out.sendMessage([0x80, 0x3C, 0x2F]);
   * ```
   */
  sendMessage<T extends MessageData, M extends Message<T>>(
    m: M | number[],
  ): void {
    if (m instanceof Message) {
      this.sendRawMessage(m.getMessage());
    } else {
      this.sendRawMessage(m);
    }
  }

  /**
   * Internal method to send a MIDI message.
   */
  private sendRawMessage(message: number[]): void {
    rtmidi.rtmidi_out_send_message(
      this.device,
      new Uint8Array(message),
      message.length,
    );
    this.checkError(ErrorHandling.Log);
  }
}
