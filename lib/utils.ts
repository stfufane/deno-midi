import {
  dirname,
  fromFileUrl,
} from "https://deno.land/std@0.201.0/path/mod.ts";

/**
 * @returns The path to the RtMidi library according to the OS.
 */
export function getLibPath(): string {
  // Determine library extension based on the user's OS.
  let lib_suffix = "";
  switch (Deno.build.os) {
    case "windows":
      lib_suffix = "dll";
      break;
    case "darwin":
      lib_suffix = "dylib";
      break;
    default:
      lib_suffix = "so";
      break;
  }

  const module_url = new URL(import.meta.url);
  let lib_prefix = ".";
  if (module_url.protocol === "file:") {
    lib_prefix = dirname(fromFileUrl(import.meta.url));
  }
  return `${lib_prefix}/vendor/rtmidi.${lib_suffix}`;
}

/**
 * Error handling mode.
 */
export enum ErrorHandling {
  Throw,
  Log,
  Silent,
}
