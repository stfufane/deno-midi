import { midi } from "../mod.ts";

const midi_in = new midi.Input();

console.log("in ports : ", midi_in.getPorts());

// Tells the library to ignore sysex and active sensing messages.
midi_in.ignoreTypes({ sysex: true, activeSensing: true });

midi_in.openPort(1);

// Set a callback to be called when a message is received.
midi_in.onMessage(({ message }) => {
  console.log(midi.MessageType[message.type]);
  console.log(message.data);
});

// Cancel the callback and close the device after 10 seconds.
setTimeout(() => {
  midi_in.offMessage();
  midi_in.closePort();
}, 10000);
