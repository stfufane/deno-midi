import { midi } from "../mod.ts";

console.log(midi.getVersion());

const midi_in = new midi.Input();
const midi_out = new midi.Output();

console.log("out ports : ", midi_out.getPorts());

midi_out.openPort(0);

// Send a note on message on channel 1 (default channel).
midi_out.sendMessage(new midi.NoteOn({ note: 0x3C, velocity: 0x7F }));
// Send a note off after 1 second.
setTimeout(() => {
  midi_out.sendMessage(new midi.NoteOff({ note: 0x3C, velocity: 0x7F }));
}, 1000);

// Send a control change
midi_out.sendMessage(new midi.ControlChange({ controller: 0x7B, value: 0x7F }));
// Send a program change
midi_out.sendMessage(new midi.ProgramChange({ program: 0x01 }));

console.log("in ports : ", midi_in.getPorts());

// Tells the library to ignore sysex and active sensing messages.
midi_in.ignoreTypes({ sysex: true, activeSensing: true });

midi_in.openPort(0);
// Route incoming midi messages to the output device.
midi_in.onMessage(({ message, deltaTime }) => {
  console.log(message, deltaTime);
  midi_out.sendMessage(message);
});

// Cancel the callback and close the device after 10 seconds.
setTimeout(() => {
  midi_in.offMessage();

  midi_in.closePort();
  midi_out.closePort();
}, 10000);
