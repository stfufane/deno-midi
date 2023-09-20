import config from "../deno.json" assert { type: "json" };

/**
 * @returns The path to the RtMidi library according to the OS.
 */
export function getLibUrl(): string {
  return `${config.github}/releases/download/v${config.version}/`;
}

/**
 * Parameters to ignore some of the message types.
 */
export interface IgnoreTypeOptions {
  sysex?: boolean;
  timing?: boolean;
  activeSensing?: boolean;
}

/**
 * Error handling mode.
 */
export enum ErrorHandling {
  Throw,
  Log,
  Silent,
}
