import { getVersion, MidiInput, MidiOutput } from "../mod.ts";

console.log(getVersion());

const midi_in = new MidiInput();
const midi_out = new MidiOutput();

console.log("out ports : ", midi_out.getPorts());

midi_out.openPort(1);

// Send a note on.
midi_out.sendMessage([0x90, 0x3C, 0x7F]);
// Send a note off after 1 second.
setTimeout(() => {
  midi_out.sendMessage([0x80, 0x3C, 0x2F]);
}, 1000);

console.log("in ports : ", midi_in.getPorts());

midi_in.openPort(0);
// Route incoming midi messages to the output device.
midi_in.onMessage((timestamp: number, message: number[]) => {
  console.log(timestamp, message);
  midi_out.sendMessage(message);
});

// Cancel the callback and close the device after 10 seconds.
setTimeout(() => {
  midi_in.offMessage();

  midi_in.closePort();
  midi_out.closePort();
}, 10000);
