import { assertEquals } from "https://deno.land/std@0.198.0/assert/mod.ts";
import { get_version } from "./mod.ts";

Deno.test({ name:"get_version", permissions: { ffi: true } }, () => {
  assertEquals(get_version(), "6.0.0");
});

