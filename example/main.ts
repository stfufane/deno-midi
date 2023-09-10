import { get_version, MidiInput, MidiOutput } from "../mod.ts";

console.log(get_version());

const midi_in = new MidiInput();
const midi_out = new MidiOutput();

console.log("out ports : ", midi_out.get_ports());

midi_out.open_port(7);

// Send a note on.
midi_out.send_message([0x90, 0x3C, 0x7F]);
// Send a note off after 1 second.
setTimeout(() => {
  midi_out.send_message([0x80, 0x3C, 0x2F]);
}, 1000);

console.log("in ports : ", midi_in.get_ports());

midi_in.open_port(1);
midi_in.on_message((timestamp: number, message: number[]) => {
  console.log(timestamp, message);
  midi_out.send_message(message);
});

// Cancel the callback and close the device after 10 seconds.
setTimeout(() => {
  midi_in.off_message();

  midi_in.close_port();
  midi_out.close_port();
}, 10000);
