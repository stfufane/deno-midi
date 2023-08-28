import { get_version, MidiOutput } from "./mod.ts";

console.log(get_version());

const midi_out = new MidiOutput();
console.log(midi_out.get_ports());
midi_out.open(6);

midi_out.send_message(new Uint8Array([0x90, 0x3C, 0x7F]));
midi_out.send_message(new Uint8Array([0x80, 0x3C, 0x2F]));
