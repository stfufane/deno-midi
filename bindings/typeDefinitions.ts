export const ptr = (_type: unknown) => "pointer" as const;
export const buf = (_type: unknown) => "buffer" as const;
export const func = (_func: unknown) => "function" as const;

export const _Bool = "bool" as const;

/**
 * `const char *`, C string
 */
export const cstringT = "buffer" as const;

export const unsignedInt = "u32" as const;

export const double = "f64" as const;

export const unsignedChar = "u8" as const;

export const int = "i32" as const;

export const size_t = "usize" as const;

/**
 * @brief MIDI API specifier arguments.  See {@linkcode RtMidi::Api}.
 */
export const enum RtMidiApi {
  /**
   * Search for a working compiled API.
   */
  RTMIDI_API_UNSPECIFIED,
  /**
   * Macintosh OS-X CoreMIDI API.
   */
  RTMIDI_API_MACOSX_CORE,
  /**
   * The Advanced Linux Sound Architecture API.
   */
  RTMIDI_API_LINUX_ALSA,
  /**
   * The Jack Low-Latency MIDI Server API.
   */
  RTMIDI_API_UNIX_JACK,
  /**
   * The Microsoft Multimedia MIDI API.
   */
  RTMIDI_API_WINDOWS_MM,
  /**
   * A compilable but non-functional API.
   */
  RTMIDI_API_RTMIDI_DUMMY,
  /**
   * W3C Web MIDI API.
   */
  RTMIDI_API_WEB_MIDI_API,
  /**
   * The Microsoft Universal Windows Platform MIDI API.
   */
  RTMIDI_API_WINDOWS_UWP,
  /**
   * The Android MIDI API.
   */
  RTMIDI_API_ANDROID,
  /**
   * Number of values in this enum.
   */
  RTMIDI_API_NUM,
}
/**
 * @brief MIDI API specifier arguments.  See {@linkcode RtMidi::Api}.
 */
export const RtMidiApiT = unsignedInt;

/**
 * @brief Defined RtMidiError types. See {@linkcode RtMidiError::Type}.
 */
export const enum RtMidiErrorType {
  /**
   * A non-critical error.
   */
  RTMIDI_ERROR_WARNING,
  /**
   * A non-critical error which might be useful for debugging.
   */
  RTMIDI_ERROR_DEBUG_WARNING,
  /**
   * The default, unspecified error type.
   */
  RTMIDI_ERROR_UNSPECIFIED,
  /**
   * No devices found on system.
   */
  RTMIDI_ERROR_NO_DEVICES_FOUND,
  /**
   * An invalid device ID was specified.
   */
  RTMIDI_ERROR_INVALID_DEVICE,
  /**
   * An error occurred during memory allocation.
   */
  RTMIDI_ERROR_MEMORY_ERROR,
  /**
   * An invalid parameter was specified to a function.
   */
  RTMIDI_ERROR_INVALID_PARAMETER,
  /**
   * The function was called incorrectly.
   */
  RTMIDI_ERROR_INVALID_USE,
  /**
   * A system driver error occurred.
   */
  RTMIDI_ERROR_DRIVER_ERROR,
  /**
   * A system error occurred.
   */
  RTMIDI_ERROR_SYSTEM_ERROR,
  /**
   * A thread error occurred.
   */
  RTMIDI_ERROR_THREAD_ERROR,
}
/**
 * @brief Defined RtMidiError types. See {@linkcode RtMidiError::Type}.
 */
export const RtMidiErrorTypeT = unsignedInt;

/**
 * @brief Wraps an RtMidi object for C function return statuses.
 */
export const RtMidiWrapperT = {
  /** Struct size: 32 */
  struct: [
    /**
     * The wrapped RtMidi object.
     */
    ptr("void"), // ptr, offset 0, size 8
    ptr("void"), // data, offset 8, size 8
    /**
     * True when the last function call was OK.
     */
    _Bool, // ok, offset 16, size 1
    /**
     * If an error occurred (ok != true), set to an error message.
     */
    cstringT, // msg, offset 24, size 8
  ],
} as const;

/**
 * @brief Typedef for a generic RtMidi pointer.
 */
export const RtMidiPtrT = ptr(RtMidiWrapperT);

/**
 * @brief Typedef for a generic RtMidiIn pointer.
 */
export const RtMidiInPtrT = ptr(RtMidiWrapperT);

/**
 * @brief Typedef for a generic RtMidiOut pointer.
 */
export const RtMidiOutPtrT = ptr(RtMidiWrapperT);

/**
 * @brief The type of a RtMidi callback function.
 *
 * @param timeStamp   The time at which the message has been received.
 *
 * @param message     The midi message.
 *
 * @param userData    Additional user data for the callback.
 * See {@linkcode RtMidiIn::RtMidiCallback}.
 */
export const RtMidiCCallbackCallbackDefinition = {
  parameters: [
    double, // timeStamp
    buf(unsignedChar), // message
    size_t, // messageSize
    ptr("void"), // userData
  ],
  result: "void",
} as const;
/**
 * @brief The type of a RtMidi callback function.
 *
 * @param timeStamp   The time at which the message has been received.
 *
 * @param message     The midi message.
 *
 * @param userData    Additional user data for the callback.
 * See {@linkcode RtMidiIn::RtMidiCallback}.
 */
export const RtMidiCCallbackT = "function" as const;
