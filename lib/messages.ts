/**
 * MIDI Message Types according to the MIDI specification.
 */
export enum MessageType {
  NoteOff = 0x80,
  NoteOn = 0x90,
  PolyphonicPressure = 0xA0,
  ControlChange = 0xB0,
  ProgramChange = 0xC0,
  ChannelPressure = 0xD0,
  PitchBend = 0xE0,
  SystemExclusive = 0xF0,
  TimeCodeQuarterFrame = 0xF1,
  SongPositionPointer = 0xF2,
  SongSelect = 0xF3,
  TuneRequest = 0xF6,
  TimingClock = 0xF8,
  Start = 0xFA,
  Continue = 0xFB,
  Stop = 0xFC,
  ActiveSensing = 0xFE,
  SystemReset = 0xFF,
}

/**
 * Decode a MIDI message from an array of bytes.
 * @param message an array of bytes describing the MIDI message
 * @returns the decoded MIDI message.
 */
export function decodeMessage(message: Uint8Array): Message<MessageData> {
  if (message.length < 1) {
    throw new Error("Invalid message length");
  }
  const type = message[0] & 0xF0;
  const channel = (message[0] & 0x0F) + 1;
  switch (type) {
    case MessageType.NoteOn:
      return new NoteOn({ channel, note: message[1], velocity: message[2] });
    case MessageType.NoteOff:
      return new NoteOff({ channel, note: message[1], velocity: message[2] });
    case MessageType.ControlChange:
      return new ControlChange({
        channel,
        controller: message[1],
        value: message[2],
      });
    case MessageType.ProgramChange:
      return new ProgramChange({ channel, program: message[1] });
    case MessageType.PitchBend:
      return new PitchBend({
        channel,
        value: (message[2] << 7) | message[1],
      });
    default:
      // Unsupported formats are returned as raw messages.
      return new RawMessage({ message: Array.from(message) });
  }
}

/**
 * Base interface for MIDI message data.
 */
// deno-lint-ignore no-empty-interface
export interface MessageData {}

/**
 * Base class for MIDI messages.
 * @template Data the type of data expected to build a message.
 * @property type the type of the message.
 * @property length the length of the message.
 * @property data the data used to build the message.
 */
export abstract class Message<Data extends MessageData> {
  type: MessageType;
  length: number;
  data: Data;

  constructor(type: MessageType, length: number, data: Data) {
    this.type = type;
    this.length = length;
    this.data = data;
  }

  getType(): string {
    return MessageType[this.type];
  }

  isNoteOn(): boolean {
    return this.type === MessageType.NoteOn;
  }

  isNoteOff(): boolean {
    return this.type === MessageType.NoteOff;
  }

  /**
   * Get the message as an array of bytes.
   * @returns the message as an array of bytes.
   */
  abstract getMessage(): number[];
}

interface RawData extends MessageData {
  message: number[];
}

/**
 * Raw MIDI message.
 * Used for input callbacks.
 */
export class RawMessage extends Message<RawData> {
  constructor(data: RawData) {
    if (data.message.length < 1) {
      throw new Error("Invalid message length");
    }
    super(data.message[0] & 0xF0, data.message.length, data);
  }

  getMessage(): number[] {
    return this.data.message;
  }
}

/**
 * NoteOn and NoteOff message data.
 */
interface NoteData extends MessageData {
  channel?: number; // Defaults to 1.
  note: number;
  velocity: number;
}

/**
 * Wrapper for both note on and note off MIDI messages, useful to handle both in the same callback.
 */
export class Note extends Message<NoteData> {
  constructor(type: MessageType, data: NoteData) {
    super(type, 3, data);
  }

  getMessage(): number[] {
    return [
      this.type | ((this.data.channel || 1) - 1),
      this.data.note,
      this.data.velocity,
    ];
  }
}

/**
 * NoteOn MIDI message.
 * @example
 * ```ts
 * // Send a middle C note on channel 3 with velocity 127.
 * midi_out.sendMessage(new NoteOn({ channel: 3, note: 0x3C, velocity: 0x7F }));
 * ```
 */
export class NoteOn extends Message<NoteData> {
  constructor(data: NoteData) {
    super(MessageType.NoteOn, 3, data);
  }

  getMessage(): number[] {
    return [
      this.type | ((this.data.channel || 1) - 1),
      this.data.note,
      this.data.velocity,
    ];
  }
}

/**
 * NoteOff MIDI message.
 * @example
 * ```ts
 * // Send a middle C note off channel 3 with velocity 127.
 * midi_out.sendMessage(new midi.NoteOff({ channel: 3, note: 0x3C, velocity: 0x7F }));
 * ```
 */
export class NoteOff extends Message<NoteData> {
  constructor(data: NoteData) {
    super(MessageType.NoteOff, 3, data);
  }

  getMessage(): number[] {
    return [
      this.type | ((this.data.channel || 1) - 1),
      this.data.note,
      this.data.velocity,
    ];
  }
}

/**
 * Control Change data
 */
interface CCData extends MessageData {
  channel?: number; // Defaults to 1.
  controller: number;
  value: number;
}

/**
 * Control Change MIDI message.
 * @example
 * ```ts
 * // Send a control change message on channel 3 with controller 0x7B and value 0x7F.
 * midi_out.sendMessage(new midi.ControlChange({ channel: 3, controller: 0x7B, value: 0x7F }));
 * ```
 * @see https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2
 */
export class ControlChange extends Message<CCData> {
  constructor(data: CCData) {
    super(MessageType.ControlChange, 3, data);
  }

  getMessage(): number[] {
    return [
      this.type | ((this.data.channel || 1) - 1),
      this.data.controller,
      this.data.value,
    ];
  }
}

/**
 * Program Change data
 */
interface PCData extends MessageData {
  channel?: number; // Defaults to 1.
  program: number;
}

/**
 * Program Change MIDI message.
 * @example
 * ```ts
 * // Send a program change message on channel 3 with program 0x20.
 * midi_out.sendMessage(new midi.ProgramChange({ channel: 3, program: 0x20 }));
 * ```
 */
export class ProgramChange extends Message<PCData> {
  constructor(data: PCData) {
    super(MessageType.ProgramChange, 2, data);
  }

  getMessage(): number[] {
    return [
      this.type | ((this.data.channel || 1) - 1),
      this.data.program,
    ];
  }
}

interface PitchBendData extends MessageData {
  channel?: number; // Defaults to 1.
  value: number;
}

// Little helper for pitch bend values.
export enum PitchBendValue {
  Min = 0x0000,
  Center = 0x2000,
  Max = 0x3FFF,
}

/**
 * Pitch Bend MIDI message.
 * @example
 * ```ts
 * // Send a pitch bend message on channel 3 at center value.
 * midi_out.sendMessage(new midi.PitchBend({ channel: 3, value: midi.PitchBendValue.Center }));
 * ```
 */
export class PitchBend extends Message<PitchBendData> {
  constructor(data: PitchBendData) {
    super(MessageType.PitchBend, 3, data);
  }

  getMessage(): number[] {
    return [
      this.type | ((this.data.channel || 1) - 1),
      this.data.value & 0x7F,
      (this.data.value >> 7) & 0x7F,
    ];
  }
}
