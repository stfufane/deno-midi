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

/**
 * Control Change params
 */
interface CCParams {
  channel?: number; // Defaults to 1.
  controller: number;
  value: number;
}

/**
 * Control Change MIDI message.
 * @example
 * ```ts
 * // Send a control change message on channel 3 with controller 0x7B and value 0x7F.
 * midi_out.sendMessage(new ControlChange({ channel: 3, controller: 0x7B, value: 0x7F }));
 * ```
 * @see https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2
 */
export class ControlChange extends Message<CCParams> {
  constructor(params: CCParams) {
    super(MessageType.ControlChange, 3, params);
  }

  getMessage(): number[] {
    return [
      this.type | ((this.params.channel || 1) - 1),
      this.params.controller,
      this.params.value,
    ];
  }
}

/**
 * Program Change params
 */
interface PCParams {
  channel?: number; // Defaults to 1.
  program: number;
}

/**
 * Program Change MIDI message.
 * @example
 * ```ts
 * // Send a program change message on channel 3 with program 0x20.
 * midi_out.sendMessage(new ProgramChange({ channel: 3, program: 0x20 }));
 * ```
 */
export class ProgramChange extends Message<PCParams> {
  constructor(params: PCParams) {
    super(MessageType.ProgramChange, 2, params);
  }

  getMessage(): number[] {
    return [
      this.type | ((this.params.channel || 1) - 1),
      this.params.program,
    ];
  }
}
