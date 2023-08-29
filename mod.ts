import { rtmidi_bindings } from "./deps.ts";

const rtmidi = Deno.dlopen("../build/rtmidi.dll", rtmidi_bindings).symbols;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Get the version of the lib.
 * @returns The current RtMidi version.
 */
export function get_version(): string {
  const version_buffer = rtmidi.rtmidi_get_version();
  if (version_buffer != null) {
    const version = new Deno.UnsafePointerView(version_buffer);
    return version.getCString();
  }
  return "not found";
}

/**
 * Generic wrapper around a MIDI device. This class should not be used directly.
 * Encapsulates all the common methods used by Input and Output.
 */
class MidiDevice {
  protected _device!: ArrayBuffer;
  protected _port = -1;
  protected readonly _port_name: string;

  constructor(port_name: string, device_ptr: Deno.PointerValue) {
    this._port_name = port_name;
    if (device_ptr != null) {
      this._device = Deno.UnsafePointerView.getArrayBuffer(device_ptr, 32, 0);
    } else {
      throw new Error("Failed to create default midi in device");
    }
  }

  protected check_error(): void {
    // Read the 17th bit of the device to check the error.
    const error = new Uint8Array(this._device)[16];
    console.log(error);
    // TODO: Try to create a pointer from the address at the end of the device buffer and read the string from it.
  }

  get_port_count(): number {
    return rtmidi.rtmidi_get_port_count(this._device);
  }

  get_ports(): string[] {
    const port_name = new Uint8Array(32);
    const port_name_length = new Uint32Array(1).fill(32);
    const ports: string[] = [];
    for (let i = 0; i < this.get_port_count(); i++) {
      // Retrieve the name of the port and the length of the name.
      const success = rtmidi.rtmidi_get_port_name(
        this._device,
        i,
        port_name,
        port_name_length,
      );
      ports.push(decoder.decode(port_name).substring(0, success));
    }
    return ports;
  }

  open_port(port: number): void {
    if (port >= this.get_port_count()) {
      throw new Error("Invalid port number");
    }
    this._port = port;
    rtmidi.rtmidi_open_port(
      this._device,
      this._port,
      encoder.encode(this._port_name + "\0"),
    );
    this.check_error();
  }

  close_port(): void {
    rtmidi.rtmidi_close_port(this._device);
  }
}

export class MidiInput extends MidiDevice {
  constructor() {
    const midi_in = rtmidi.rtmidi_in_create_default();
    super("Deno Midi In Port", midi_in);
  }
}

export class MidiOutput extends MidiDevice {
  constructor() {
    const midi_out = rtmidi.rtmidi_out_create_default();
    super("Deno Midi Out Port", midi_out);
  }

  /**
   * @brief Immediately send a single message out an open MIDI output port.
   * @param message an array of bytes describing the MIDI message
   * @example
   * ```ts
   * // Send a middle C note on MIDI channel 1
   * midi_out.send_message(new Uint8Array([0x90, 0x3C, 0x7F]));
   * midi_out.send_message(new Uint8Array([0x80, 0x3C, 0x2F]));
   * ```
   */
  send_message(message: Uint8Array): void {
    rtmidi.rtmidi_out_send_message(this._device, message, message.length);
  }
}
