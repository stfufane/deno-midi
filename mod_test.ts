import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { assert } from "https://deno.land/std@0.201.0/assert/assert.ts";
import { getVersion, MidiInput, MidiOutput } from "./mod.ts";

Deno.test({ name: "get_version", permissions: { ffi: true } }, () => {
  assertEquals(getVersion(), "6.0.0");
});

Deno.test(
  { name: "create_default_midiin_device", permissions: { ffi: true } },
  () => {
    assert(new MidiInput());
  },
);

Deno.test(
  { name: "create_default_midiout_device", permissions: { ffi: true } },
  () => {
    assert(new MidiOutput());
  },
);

Deno.test({ name: "get_ports", permissions: { ffi: true } }, () => {
  const midi_out = new MidiOutput();
  assert(midi_out.getPorts());
});
