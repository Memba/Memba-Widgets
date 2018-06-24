/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * Constants
 */
const CONSTANTS = {
    // Data types
    BOOLEAN: 'boolean',
    DATE: 'date',
    FUNCTION: 'function',
    NULL: 'null',
    NUMBER: 'number',
    OBJECT: 'object',
    STRING: 'string',
    SYMBOL: 'symbol',
    UNDEFINED: 'undefined',
    // Events
    CHANGE: 'change',
    CLICK: 'click',
    CLOSE: 'close',
    ERROR: 'error',
    KEYDOWN: 'keydown',
    KEYPRESS: 'keypress',
    KEYUP: 'keyup',
    MOUSEDOWN: 'mousedown',
    MOUSEMOVE: 'mousemove',
    MOUSEOUT: 'mouseout',
    MOUSEUP: 'mouseup',
    TOUCHEND: 'touchend',
    TOUCHLEAVE: 'touchleave',
    TOUCHMOVE: 'touchmove',
    TOUCHSTART: 'touchstart',
    // Custom events
    LOADED: 'i18n.loaded',
    // Errors
    NOT_FOUND_ERR: 'Not found',
    NOT_IMPLEMENTED_ERR: 'Not implemented',
    // Content types
    JSON_CONTENT_TYPE: 'application/json',
    // Cursors
    CROSSHAIR_CURSOR: 'crosshair',
    DEFAULT_CURSOR: 'default',
    // Well-known classes
    DISABLED_CLASS: 'k-state-disabled',
    FOCUS_CLASS: 'k-state-focus',
    // CSS Properties
    HEIGHT: 'height',
    WIDTH: 'width',
    // Other properties
    ACTION: 'action',
    // Regular Expressions
    RX_ISODATE: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/,
    RX_LANGUAGE: /^[a-z]{2}$/,
    RX_MONGODB_ID: /^[a-f0-9]{24}$/,
    RX_URL: /^https?:\/\//, // TODO Review
    // Characters
    DOT: '.',
    HASH: '#',
    HYPHEN: '-',
    UNDERSCORE: '_',
    // Miscellaneous
    ID: 'id',
    ME: 'me',
    POINTER: 'pointer'
};

/**
 * ES6 Default export
 */
export default CONSTANTS;
