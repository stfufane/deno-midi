import config from "../deno.json" assert { type: "json" };

/**
 * @returns The path to the RtMidi library according to the OS.
 */
export function getLibUrl(): string {
  return `${config.github}/releases/download/v${config.version}/`;
}

/**
 * Parameters passed to the callback function when a message is received.
 * The deltaTime parameter is optional to avoid unnecessary verbosity when using the callback.
 */
export interface InputCallbackParams {
  message: number[];
  deltaTime?: number;
}

/**
 * Error handling mode.
 */
export enum ErrorHandling {
  Throw,
  Log,
  Silent,
}
