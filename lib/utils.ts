import config from "../deno.json" assert { type: "json" };
import { Message, MessageData } from "./messages.ts";

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
  message: Message<MessageData>;
  deltaTime?: number;
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
