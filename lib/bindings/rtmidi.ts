import {
  _Bool,
  buf,
  cstringT,
  double,
  int,
  ptr,
  RtMidiApiT,
  RtMidiCCallbackT,
  RtMidiErrorTypeT,
  RtMidiInPtrT,
  RtMidiOutPtrT,
  RtMidiPtrT,
  size_t,
  unsignedChar,
  unsignedInt,
} from "./typeDefinitions.ts";

/**
 * @brief Return the current RtMidi version.
 * ! See {@linkcode RtMidi::getVersion()}.
 */
export const rtmidi_get_version = {
  parameters: [],
  result: cstringT,
} as const;

/**
 * @brief Determine the available compiled MIDI APIs.
 *
 * If the given `apis` parameter is null, returns the number of available APIs.
 * Otherwise, fill the given apis array with the RtMidi::Api values.
 *
 * @param apis  An array or a null value.
 *
 * @param apis_size  Number of elements pointed to by apis
 *
 * @returns number of items needed for apis array if apis==NULL, or
 *         number of items written to apis array otherwise.  A negative
 *         return value indicates an error.
 *
 * See {@linkcode RtMidi::getCompiledApi()}.
 */
export const rtmidi_get_compiled_api = {
  parameters: [
    buf(RtMidiApiT), // apis
    unsignedInt, // apis_size
  ],
  result: int,
} as const;

/**
 * @brief Return the name of a specified compiled MIDI API.
 * See {@linkcode RtMidi::getApiName()}.
 */
export const rtmidi_api_name = {
  parameters: [
    RtMidiApiT, // api
  ],
  result: cstringT,
} as const;

/**
 * @brief Return the display name of a specified compiled MIDI API.
 * See {@linkcode RtMidi::getApiDisplayName()}.
 */
export const rtmidi_api_display_name = {
  parameters: [
    RtMidiApiT, // api
  ],
  result: cstringT,
} as const;

/**
 * @brief Return the compiled MIDI API having the given name.
 * See {@linkcode RtMidi::getCompiledApiByName()}.
 */
export const rtmidi_compiled_api_by_name = {
  parameters: [
    cstringT, // name
  ],
  result: RtMidiApiT,
} as const;

/**
 * @private
 * Report an error.
 * ```
 */
export const rtmidi_error = {
  parameters: [
    RtMidiErrorTypeT, // type
    cstringT, // errorString
  ],
  result: "void",
  optional: true,
} as const;

/**
 * @brief Open a MIDI port.
 *
 * @param port      Must be greater than 0
 *
 * @param portName  Name for the application port.
 * See RtMidi::openPort().
 */
export const rtmidi_open_port = {
  parameters: [
    RtMidiPtrT, // device
    unsignedInt, // portNumber
    cstringT, // portName
  ],
  result: "void",
} as const;

/**
 * @brief Creates a virtual MIDI port to which other software applications can
 * connect.
 *
 * @param portName  Name for the application port.
 * See RtMidi::openVirtualPort().
 */
export const rtmidi_open_virtual_port = {
  parameters: [
    RtMidiPtrT, // device
    cstringT, // portName
  ],
  result: "void",
} as const;

/**
 * @brief Close a MIDI connection.
 * See RtMidi::closePort().
 */
export const rtmidi_close_port = {
  parameters: [
    RtMidiPtrT, // device
  ],
  result: "void",
} as const;

/**
 * @brief Return the number of available MIDI ports.
 * See RtMidi::getPortCount().
 */
export const rtmidi_get_port_count = {
  parameters: [
    RtMidiPtrT, // device
  ],
  result: unsignedInt,
} as const;

/**
 * @brief Access a string identifier for the specified MIDI input port number.
 *
 * To prevent memory leaks a char buffer must be passed to this function.
 * NULL can be passed as bufOut parameter, and that will write the required buffer length in the bufLen.
 *
 * See RtMidi::getPortName().
 */
export const rtmidi_get_port_name = {
  parameters: [
    RtMidiPtrT, // device
    unsignedInt, // portNumber
    cstringT, // bufOut
    buf(int), // bufLen
  ],
  result: int,
} as const;

/**
 * @brief Create a default RtMidiInPtr value, with no initialization.
 */
export const rtmidi_in_create_default = {
  parameters: [],
  result: RtMidiInPtrT,
} as const;

/**
 * @brief Create a  RtMidiInPtr value, with given api, clientName and queueSizeLimit.
 *
 * @param api            An optional API id can be specified.
 *
 * @param clientName     An optional client name can be specified. This
 *                        will be used to group the ports that are created
 *                        by the application.
 *
 * @param queueSizeLimit An optional size of the MIDI input queue can be
 *                        specified.
 * See RtMidiIn::RtMidiIn().
 */
export const rtmidi_in_create = {
  parameters: [
    RtMidiApiT, // api
    cstringT, // clientName
    unsignedInt, // queueSizeLimit
  ],
  result: RtMidiInPtrT,
} as const;

/**
 * @brief Free the given RtMidiInPtr.
 */
export const rtmidi_in_free = {
  parameters: [
    RtMidiInPtrT, // device
  ],
  result: "void",
} as const;

/**
 * @brief Returns the MIDI API specifier for the given instance of RtMidiIn.
 * See {@linkcode RtMidiIn::getCurrentApi()}.
 */
export const rtmidi_in_get_current_api = {
  parameters: [
    RtMidiPtrT, // device
  ],
  result: RtMidiApiT,
} as const;

/**
 * @brief Set a callback function to be invoked for incoming MIDI messages.
 * See {@linkcode RtMidiIn::setCallback()}.
 */
export const rtmidi_in_set_callback = {
  parameters: [
    RtMidiInPtrT, // device
    RtMidiCCallbackT, // callback
    ptr("void"), // userData
  ],
  result: "void",
} as const;

/**
 * @brief Cancel use of the current callback function (if one exists).
 * See {@linkcode RtMidiIn::cancelCallback()}.
 */
export const rtmidi_in_cancel_callback = {
  parameters: [
    RtMidiInPtrT, // device
  ],
  result: "void",
} as const;

/**
 * @brief Specify whether certain MIDI message types should be queued or ignored during input.
 * See {@linkcode RtMidiIn::ignoreTypes()}.
 */
export const rtmidi_in_ignore_types = {
  parameters: [
    RtMidiInPtrT, // device
    _Bool, // midiSysex
    _Bool, // midiTime
    _Bool, // midiSense
  ],
  result: "void",
} as const;

/**
 * Fill the user-provided array with the data bytes for the next available
 * MIDI message in the input queue and return the event delta-time in seconds.
 *
 * @param message   Must point to a char* that is already allocated.
 *                  SYSEX messages maximum size being 1024, a statically
 *                  allocated array could
 *                  be sufficient.
 *
 * @param size      Is used to return the size of the message obtained.
 *                  Must be set to the size of {@linkcode message} when calling.
 * See RtMidiIn::getMessage().
 */
export const rtmidi_in_get_message = {
  parameters: [
    RtMidiInPtrT, // device
    buf(unsignedChar), // message
    buf(size_t), // size
  ],
  result: double,
} as const;

/**
 * @brief Create a default RtMidiInPtr value, with no initialization.
 */
export const rtmidi_out_create_default = {
  parameters: [],
  result: RtMidiOutPtrT,
} as const;

/**
 * @brief Create a RtMidiOutPtr value, with given and clientName.
 *
 * @param api            An optional API id can be specified.
 *
 * @param clientName     An optional client name can be specified. This
 *                        will be used to group the ports that are created
 *                        by the application.
 * See RtMidiOut::RtMidiOut().
 */
export const rtmidi_out_create = {
  parameters: [
    RtMidiApiT, // api
    cstringT, // clientName
  ],
  result: RtMidiOutPtrT,
} as const;

/**
 * @brief Free the given RtMidiOutPtr.
 */
export const rtmidi_out_free = {
  parameters: [
    RtMidiOutPtrT, // device
  ],
  result: "void",
} as const;

/**
 * @brief Returns the MIDI API specifier for the given instance of RtMidiOut.
 * See {@linkcode RtMidiOut::getCurrentApi()}.
 */
export const rtmidi_out_get_current_api = {
  parameters: [
    RtMidiPtrT, // device
  ],
  result: RtMidiApiT,
} as const;

/**
 * @brief Immediately send a single message out an open MIDI output port.
 * See {@linkcode RtMidiOut::sendMessage()}.
 */
export const rtmidi_out_send_message = {
  parameters: [
    RtMidiOutPtrT, // device
    buf(unsignedChar), // message
    int, // length
  ],
  result: int,
} as const;
