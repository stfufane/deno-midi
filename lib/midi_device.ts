/// <reference lib="deno.unstable" />

import * as rtmidi_bindings from "./bindings/rtmidi.ts";
import { RtMidiCCallbackCallbackDefinition } from "./bindings/typeDefinitions.ts";
import { ErrorHandling, getLibPath } from "./utils.ts";

const rtmidi = Deno.dlopen(getLibPath(), rtmidi_bindings)
  .symbols;
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
abstract class MidiDevice {
  protected device: Deno.PointerValue;
  protected port = -1;
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
    const error_ptr = Deno.UnsafePointer.offset(this.device!, 16);
    if (error_ptr == null) {
      throw new Error("Error pointer is null");
    }

    const error_data = new Uint8Array(
      new Deno.UnsafePointerView(error_ptr).getArrayBuffer(1),
    );
    if (error_data[0] == 1) {
      return;
    }

    // The library does not reset the ok flag, so we do it here.
    error_data[0] = 1;

    // Handle the error message
    const msg_ptr = new Deno.UnsafePointerView(this.device!).getPointer(24);
    if (msg_ptr != null) {
      const error = Deno.UnsafePointerView.getCString(msg_ptr);
      switch (error_mode) {
        case ErrorHandling.Throw:
          throw new Error(error);
        case ErrorHandling.Log:
          console.error(error);
          break;
        case ErrorHandling.Silent:
          break;
      }

      // Reset the message as well.
      const msg_data = new Uint8Array(
        new Deno.UnsafePointerView(msg_ptr).getArrayBuffer(1),
      );
      msg_data[0] = "\0".charCodeAt(0);
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
    this.port = port;
    rtmidi.rtmidi_open_port(
      this.device,
      this.port,
      encoder.encode(this.port_name + "\0"),
    );
    this.checkError();
  }

  closePort(): void {
    rtmidi.rtmidi_close_port(this.device);
    this.checkError();
  }
}

/**
 * Wrapper around a MIDI input device.
 * Allows to receive MIDI messages from a MIDI input device.
 * @extends MidiDevice
 * @see MidiDevice
 */
export class MidiInput extends MidiDevice {
  private callback:
    | Deno.UnsafeCallback<typeof RtMidiCCallbackCallbackDefinition>
    | null = null;

  constructor() {
    const midi_in = rtmidi.rtmidi_in_create_default();
    super("Deno Midi In Port", midi_in);
  }

  /**
   * Free the device pointer.
   */
  freeDevice(): void {
    rtmidi.rtmidi_in_free(this.device);
  }

  /**
   * Set a callback to be called when a message is received.
   * The runtime stays alive until off_message is called to remove the callback.
   * @param callback the function to be called when a message is received.
   * @example
   * ```ts
   * midi_in.onMessage((deltaTime: number, message: number[]) => {
   *    console.log(deltaTime, message);
   * });
   * ```
   * @throws Error if the callback could not be set.
   * @see offMessage to remove the callback.
   */
  onMessage(callback: (deltaTime: number, message: number[]) => void): void {
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
        callback(deltaTime, Array.from(msg_data));
      },
    );
    rtmidi.rtmidi_in_set_callback(this.device, this.callback!.pointer, null);
    this.checkError();
  }

  /**
   * Remove the callback set by on_message.
   * @throws Error if the callback could not be removed.
   * @see onMessage to set the callback.
   */
  offMessage(): void {
    rtmidi.rtmidi_in_cancel_callback(this.device);
    this.callback?.unref();
    this.callback = null;
    this.checkError();
  }
}

/**
 * Wrapper around a MIDI output device.
 * Allows to send MIDI messages to a MIDI output device.
 * @extends MidiDevice
 * @see MidiDevice
 */
export class MidiOutput extends MidiDevice {
  constructor() {
    const midi_out = rtmidi.rtmidi_out_create_default();
    super("Deno Midi Out Port", midi_out);
  }

  /**
   * Free the device pointer.
   */
  freeDevice(): void {
    rtmidi.rtmidi_out_free(this.device);
  }

  /**
   * Immediately send a single message out an open MIDI output port.
   * @param message an array of bytes describing the MIDI message
   * @example
   * ```ts
   * // Send a middle C note on MIDI channel 1
   * midi_out.sendMessage([0x90, 0x3C, 0x7F]);
   * midi_out.sendMessage([0x80, 0x3C, 0x2F]);
   * ```
   */
  sendMessage(message: number[]): void {
    rtmidi.rtmidi_out_send_message(
      this.device,
      new Uint8Array(message),
      message.length,
    );
    this.checkError(ErrorHandling.Log);
  }
}