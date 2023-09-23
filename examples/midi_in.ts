import { midi } from "../mod.ts";

const midi_in = new midi.Input();

console.log("in ports : ", midi_in.getPorts());

// Tells the library to ignore sysex and active sensing messages.
midi_in.ignoreTypes({ sysex: true, activeSensing: true });

midi_in.openPort(0);

// Set a callback to be called when a message is received.
// This is a generic callback, it will be called for all messages.
// The type can still be tested using instanceof.
midi_in.on("message", ({ message, deltaTime }) => {
  console.log("message callback at ", deltaTime);
  console.log(message.getType());
  console.log(message.getMessage());
  if (message instanceof midi.NoteOn) {
    console.log(message.data.note);
  }
});

// Be notified only for note events
midi_in.on("note", ({ message }) => {
  console.log("Note received", message.data.note);
  console.log(message.isNoteOn());
  console.log(message.isNoteOff());
});

// Or CC events.
midi_in.on("control_change", ({ message }) => {
  console.log("control_change", message.data.controller, message.data.value);
});

// Cancel the callback and close the device after 10 seconds.
setTimeout(() => {
  midi_in.off("message");
  midi_in.off("note");
  midi_in.off("control_change");
  midi_in.closePort();
}, 10000);
