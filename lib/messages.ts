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
 * Base class for MIDI messages.
 * @template Params the type of params expected to build a message.
 * @property type the type of the message.
 * @property length the length of the message.
 * @property params the params used to build the message.
 */
export abstract class Message<Params> {
  type: MessageType;
  length: number;
  params: Params;

  constructor(type: MessageType, length: number, params: Params) {
    this.type = type;
    this.length = length;
    this.params = params;
  }

  /**
   * Get the message as an array of bytes.
   * @returns the message as an array of bytes.
   */
  abstract getMessage(): number[];
}

/**
 * NoteOn and NoteOff message params.
 */
interface NoteParams {
  channel?: number; // Defaults to 1.
  note: number;
  velocity: number;
}

/**
 * NoteOn MIDI message.
 * @example
 * ```ts
 * // Send a middle C note on channel 3 with velocity 127.
 * midi_out.sendMessage(new NoteOn({ channel: 3, note: 0x3C, velocity: 0x7F }));
 * ```
 */
export class NoteOn extends Message<NoteParams> {
  constructor(params: NoteParams) {
    super(MessageType.NoteOn, 3, params);
  }

  getMessage(): number[] {
    return [
      this.type | ((this.params.channel || 1) - 1),
      this.params.note,
      this.params.velocity,
    ];
  }
}

/**
 * NoteOff MIDI message.
 * @example
 * ```ts
 * // Send a middle C note off channel 3 with velocity 127.
 * midi_out.sendMessage(new NoteOff({ channel: 3, note: 0x3C, velocity: 0x7F }));
 * ```
 */
export class NoteOff extends Message<NoteParams> {
  constructor(params: NoteParams) {
    super(MessageType.NoteOff, 3, params);
  }

  getMessage(): number[] {
    return [
      this.type | ((this.params.channel || 1) - 1),
      this.params.note,
      this.params.velocity,
    ];
  }
}
