import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { assert } from "https://deno.land/std@0.201.0/assert/assert.ts";
import { midi } from "./mod.ts";

Deno.test({ name: "get_version", permissions: { ffi: true } }, () => {
  assertEquals(midi.getVersion(), "6.0.0");
});

Deno.test(
  { name: "create_default_midiin_device", permissions: { ffi: true } },
  () => {
    assert(new midi.Input());
  },
);

Deno.test(
  { name: "create_default_midiout_device", permissions: { ffi: true } },
  () => {
    assert(new midi.Output());
  },
);

Deno.test({ name: "get_ports", permissions: { ffi: true } }, () => {
  const midi_out = new midi.Output();
  assert(midi_out.getPorts());
});
