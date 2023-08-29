import { get_version } from "./mod.ts";

Deno.bench(function get_version_bench() {
  get_version();
});
