import config from "../deno.json" assert { type: "json" };

/**
 * @returns The path to the RtMidi library according to the OS.
 */
export function getLibUrl(): string {
  return `${config.github}/releases/download/v${config.version}/`;
}

/**
 * Error handling mode.
 */
export enum ErrorHandling {
  Throw,
  Log,
  Silent,
}
