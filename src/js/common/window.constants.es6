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
    BEFORECHANGE: 'beforeChange',
    BLUR: 'blur',
    CHANGE: 'change',
    CLICK: 'click',
    CLOSE: 'close',
    DATABINDING: 'dataBinding',
    DATABOUND: 'dataBound',
    ERROR: 'error',
    FOCUS: 'focus',
    FOCUSOUT: 'focusout',
    KEYDOWN: 'keydown',
    KEYPRESS: 'keypress',
    KEYUP: 'keyup',
    LOAD: 'load',
    MOUSEDOWN: 'mousedown',
    MOUSEENTER: 'mouseenter',
    MOUSELEAVE: 'mouseleave',
    MOUSEMOVE: 'mousemove',
    MOUSEOUT: 'mouseout',
    MOUSEOVER: 'mouseover',
    MOUSEUP: 'mouseup',
    POINTERDOWN: 'pointerdown',
    POINTERENTER: 'pointerenter',
    POINTERLEAVE: 'pointerleave',
    POINTERMOVE: 'pointermove',
    POINTEROUT: 'pointerout',
    POINTEROVER: 'pointerover',
    POINTERUP: 'pointerup',
    PROGRESS: 'progress',
    SELECT: 'select',
    TAP: 'tap',
    TOUCHEND: 'touchend',
    // TOUCHLEAVE: 'touchleave', // <-- See https://developer.mozilla.org/en-US/docs/Web/Events/touchleave
    TOUCHMOVE: 'touchmove',
    TOUCHSTART: 'touchstart',
    // To be used with kendo.applyEventMap
    MAPCANCEL: 'cancel',
    MAPDOWN: 'down',
    MAPMOVE: 'move',
    MAPUP: 'up',
    // Custom events
    LOADED: 'i18n.loaded',
    // ERROR: 'error',
    WARNING: 'warning',
    // Errors
    NOT_FOUND_ERR: 'Not found',
    NOT_IMPLEMENTED_ERR: 'Not implemented',
    // Content types
    GIF_CONTENT_TYPE: 'image/gif',
    JSON_CONTENT_TYPE: 'application/json',
    JPEG_CONTENT_TYPE: 'image/jpeg',
    PNG_CONTENT_TYPE: 'image/png',
    TEXT_CONTENT_TYPE: 'plain/text',
    // Cursors
    CROSSHAIR_CURSOR: 'crosshair',
    DEFAULT_CURSOR: 'default',
    // Well-known classes
    ACTIVE_CLASS: 'k-state-active',
    DISABLED_CLASS: 'k-state-disabled',
    FOCUSED_CLASS: 'k-state-focused',
    HIDDEN_CLASS: 'k-hidden',
    HOVER_CLASS: 'k-state-hover',
    SELECTED_CLASS: 'k-state-selected',
    INTERACTIVE_CLASS: 'kj-interactive',
    ELEMENT_CLASS: 'kj-element',
    // CSS Properties
    CURSOR: 'cursor',
    HEIGHT: 'height',
    LEFT: 'left',
    NONE: 'none',
    TOP: 'top',
    WIDTH: 'width',
    // Regular Expressions
    RX_GUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    RX_ISODATE: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|[+|-]([\d|:]*))?$/,
    RX_LANGUAGE: /^[a-z]{2}$/,
    RX_MONGODB_ID: /^[a-f0-9]{24}$/,
    RX_MONGODB_KEY: /^_(i|[a-z]*I)d$/,
    RX_URL: /^https?:\/\//,
    RX_TEST_FIELD_NAME: /^val_[a-z0-9]{6}$/,
    // Characters
    COLON: ':',
    COMMA: ',',
    DOT: '.',
    EMPTY: '',
    HASH: '#',
    HYPHEN: '-',
    SEMICOLON: ';',
    UNDERSCORE: '_',
    // Miscellaneous
    ACTION: 'action',
    ACTIVE: 'active',
    ID: 'id',
    ME: 'me',
    POINTER: 'pointer',
    STAGE_MODES: {
        DESIGN: 'design',
        PLAY: 'play',
        REVIEW: 'review'
    },
    UID: 'uid',
    // HTML tags
    A: 'a',
    BODY: 'body',
    BUTTON: 'button',
    CANVAS: 'canvas',
    DIV: 'div',
    H1: 'h1',
    IMG: 'img',
    INPUT: 'input',
    LI: 'li',
    // SELECT: 'select',
    SPAN: 'span',
    TABLE: 'table',
    TBODY: 'tbody',
    UL: 'ul'
};

/**
 * Default export
 */
export default CONSTANTS;
