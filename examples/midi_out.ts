import { midi } from "../mod.ts";

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

midi_out.closePort();
