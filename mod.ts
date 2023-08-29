import { rtmidi_bindings } from "./deps.ts"

const rtmidi = Deno.dlopen("../build/rtmidi.dll", rtmidi_bindings).symbols;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function get_version() : string {
  const version_buffer = rtmidi.rtmidi_get_version();
  if (version_buffer != null) {
    const version = new Deno.UnsafePointerView(version_buffer);
    return version.getCString();
  }
  return "not found";
}

class MidiDevice {
  protected _device! : ArrayBuffer;
  protected _port = -1;
  protected readonly _port_name: string;

  constructor(port_name: string) {
    this._port_name = port_name;
  }

  get_port_count() : number {
    return rtmidi.rtmidi_get_port_count(this._device);
  }
  
  get_ports() : string[] {
    const port_name = new Uint8Array(32);
    const port_name_length = new Uint32Array(1).fill(32);
    const ports: string[] = [];
    for (let i = 0; i < this.get_port_count(); i++) {
      // Retrieve the name of the port and the length of the name.
      const success = rtmidi.rtmidi_get_port_name(this._device, i, port_name, port_name_length);
      ports.push(decoder.decode(port_name).substring(0, success));
    }
    return ports;
  }

  open_port(port: number) : void {
    if (port >= this.get_port_count()) {
      throw new Error("Invalid port number");
    }
    this._port = port;
    rtmidi.rtmidi_open_port(this._device, this._port, encoder.encode(this._port_name + "\0"));
  }

  close_port(): void {
    rtmidi.rtmidi_close_port(this._device);
  }
}

export class MidiInput extends MidiDevice {

  constructor() {
    super("Deno Midi In Port");

    const midi_in = rtmidi.rtmidi_in_create_default();
    if (midi_in != null) {
      this._device = Deno.UnsafePointerView.getArrayBuffer(midi_in, 32, 0);
    } else {
      throw new Error("Failed to create default midi in device");
    }
  }
}

export class MidiOutput extends MidiDevice {

  constructor() {
    super("Deno Midi Out Port");
    const midi_out = rtmidi.rtmidi_out_create_default();
    if (midi_out != null) {
      this._device = Deno.UnsafePointerView.getArrayBuffer(midi_out, 32, 0);
    } else {
      throw new Error("Failed to create default midi out device");
    }
  }

  send_message(message : Uint8Array) : void {
    rtmidi.rtmidi_out_send_message(this._device, message, message.length);
  }
}