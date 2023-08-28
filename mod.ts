import { rtmidi_bindings } from "./deps.ts"

const lib = Deno.dlopen("../build/rtmidi.dll", rtmidi_bindings);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function get_version() : string {
  const version_buffer = lib.symbols.rtmidi_get_version();
  if (version_buffer != null) {
    const version = new Deno.UnsafePointerView(version_buffer);
    return version.getCString();
  }
  return "not found";
}

export class MidiInput {
  private _device : ArrayBuffer;
  private _port : number;
  private _port_name : string;

  constructor(port : number, port_name : string) {
    const midi_in = lib.symbols.rtmidi_in_create_default();
    if (midi_in != null) {
      const device = Deno.UnsafePointerView.getArrayBuffer(midi_in, 32, 0);
      this._device = device;
    } else {
      throw new Error("Failed to create default midi in device");
    }
    this._port = port;
    this._port_name = port_name;
  }

  open() : void {
    lib.symbols.rtmidi_open_port(this._device, this._port, encoder.encode(this._port_name + "\0"));
  }
}

export class MidiOutput {
  private _device : ArrayBuffer;
  private _port = 0;
  private _port_name = "Deno Midi Port";

  constructor() {
    const midi_out = lib.symbols.rtmidi_out_create_default();
    if (midi_out != null) {
      const device = Deno.UnsafePointerView.getArrayBuffer(midi_out, 32, 0);
      this._device = device;
    } else {
      throw new Error("Failed to create default midi out device");
    }
  }

  get_ports() : string[] {
    const port_count = lib.symbols.rtmidi_get_port_count(this._device);
    const port_name = new Uint8Array(32);
    const port_name_length = new Uint32Array(1).fill(32);
    const ports = [];
    for (let i = 0; i < port_count; i++) {
      // Retrieve the name of the port and the length of the name.
      const success = lib.symbols.rtmidi_get_port_name(this._device, i, port_name, port_name_length);
      ports.push(decoder.decode(port_name).substring(0, success));
    }
    return ports;
  }

  open(port: number) : void {
    this._port = port;
    lib.symbols.rtmidi_open_port(this._device, this._port, encoder.encode(this._port_name + "\0"));
  }

  close(): void {
    lib.symbols.rtmidi_close_port(this._device);
  }

  send_message(message : Uint8Array) : void {
    lib.symbols.rtmidi_out_send_message(this._device, message, message.length);
  }
}