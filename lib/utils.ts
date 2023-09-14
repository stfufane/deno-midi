import config from "../deno.json" assert { type: "json" };

/**
 * @returns The path to the RtMidi library according to the OS.
 */
export function getLibPath(): string {
  // Determine library file based on the user's OS.
  let lib = "";
  switch (Deno.build.os) {
    case "windows":
      lib = "RtMidi.dll";
      break;
    case "darwin":
      lib = "librtmidi.dylib";
      break;
    default:
      lib = "librtmidi.so";
      break;
  }

  return `${config.github}/releases/download/v${config.version}/${lib}`;
}

/**
 * Error handling mode.
 */
export enum ErrorHandling {
  Throw,
  Log,
  Silent,
}
