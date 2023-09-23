import {
  ControlChange,
  Message,
  MessageData,
  MessageType,
  Note,
  PitchBend,
  ProgramChange,
} from "./messages.ts";

// deno-lint-ignore no-explicit-any
export type MessageEventHandler<T = any> = (
  data: { message: T; deltaTime?: number },
) => void;
export type MessageEventContract<T> = { [K in keyof T]: T[K] };

/**
 * An EventBus interface with typed events and callbacks
 */
export interface EventBus<T extends MessageEventContract<T>> {
  /**
   * Register a callback for a specific named event
   */
  on<K extends keyof T>(
    event: K,
    handler: MessageEventHandler<T[K]>,
  ): void;

  /**
   * Unregister a callback for specific named event
   */
  off<K extends keyof T>(
    event: K,
  ): void;

  /**
   * Emit a specific named event with an appropriate payload
   */
  emit<K extends keyof T>(event: K, args: T[K]): void;
}

export type MessageEvents = {
  message: Message<MessageData>;
  note: Note;
  control_change: ControlChange;
  program_change: ProgramChange;
  pitch_bend: PitchBend;
};

/** List of accepted events when using an event listener */
type MessageEvent =
  | "message"
  | "note"
  | "control_change"
  | "program_change"
  | "pitch_bend";

/** Map from message type to events */
const MessageTypeEvents = new Map<MessageType, MessageEvent>([
  [MessageType.NoteOff, "note"],
  [MessageType.NoteOn, "note"],
  [MessageType.ControlChange, "control_change"],
  [MessageType.ProgramChange, "program_change"],
  [MessageType.PitchBend, "pitch_bend"],
]);

/**
 * Get the events associated with a message type.
 */
export function getMessageEvent(type: MessageType): MessageEvent {
  return MessageTypeEvents.get(type) || "message";
}
