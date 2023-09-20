import { Message, MessageData, MessageType } from "./messages.ts";

export interface MessageEventData {
  message: Message<MessageData>;
  deltaTime?: number;
}

/** Event Handler type */
export type MessageHandler = (
  data: MessageEventData,
) => void;

/** List of accepted events when using an event listener */
export type MessageEvent =
  | "message"
  | "note"
  | "note_on"
  | "note_off"
  | "control_change"
  | "program_change"
  | "pitch_bend";

/** Map from message type to events */
const MessageTypeEvents = new Map<MessageType, MessageEvent[]>([
  [MessageType.NoteOff, ["note", "note_off"]],
  [MessageType.NoteOn, ["note", "note_on"]],
  [MessageType.ControlChange, ["control_change"]],
  [MessageType.ProgramChange, ["program_change"]],
  [MessageType.PitchBend, ["pitch_bend"]],
]);

/**
 * Get the events associated with a message type.
 */
export function getMessageEvent(type: MessageType): MessageEvent[] {
  return MessageTypeEvents.get(type) || [];
}
