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
    // Well-known classes
    DISABLED_CLASS: 'k-state-disabled',
    FOCUS_CLASS: 'k-state-focus',
    // CSS Properties
    HEIGHT: 'height',
    WIDTH: 'width',
    // Other properties
    ACTION: 'action',
    // Regular Expressions
    RX_MONGODB_ID: /^[a-f0-9]{24}$/,
    RX_URL: /^https?:\/\//, // TODO Review
    // Characters
    DOT: '.',
    HASH: '#',
    HYPHEN: '-',
    // Miscellaneous
    ID: 'id',
    ME: 'me'
};

/**
 * ES6 Default export
 */
export default CONSTANTS;
