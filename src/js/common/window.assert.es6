/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// Populate the class2type map
const class2type = {};
'Boolean Number String Function Array Date RegExp Object Error Symbol'
    .split(' ')
    .forEach(name => {
        class2type[`[object ${name}]`] = name.toLowerCase();
    });
const { toString, hasOwnProperty } = class2type;

// jQuery core functions to remove any dependencies
// @see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/core.js
const $ = {
    isArray: Array.isArray,
    isFunction(obj) {
        return $.type(obj) === 'function';
    },
    isEmptyObject(obj) {
        let name;
        // eslint-disable-next-line guard-for-in, no-restricted-syntax
        for (name in obj) {
            return false;
        }
        return true;
    },
    isNumeric(obj) {
        // parseFloat NaNs numeric-cast false positives (null|true|false|"")
        // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
        // subtraction forces infinities to NaN
        // adding 1 corrects loss of precision from parseFloat (#15100)
        return !$.isArray(obj) && obj - parseFloat(obj) + 1 >= 0;
    },
    isPlainObject(obj) {
        // Not plain objects:
        // - Any object or value whose internal [[Class]] property is not "[object Object]"
        // - DOM nodes
        // - window
        if ($.type(obj) !== 'object' || obj.nodeType || $.isWindow(obj)) {
            return false;
        }
        if (
            obj.constructor &&
            !hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')
        ) {
            return false;
        }
        // If the function hasn't returned already, we're confident that
        // |obj| is a plain object, created by {} or constructed with new Object
        return true;
    },
    isWindow(obj) {
        return obj !== null && obj === obj.window;
    },
    type(obj) {
        if (obj === null) {
            return `${obj}`;
        }
        // Support: Android<4.0 (functionish RegExp)
        return typeof obj === 'object' || typeof obj === 'function'
            ? class2type[toString.call(obj)] || 'object'
            : typeof obj;
    }
};

/**
 * Assert
 */
export default function assert(test, message) {
    if (!test) {
        throw new Error(message);
    }
}

// By extending assert, we ensure we can call both assert() and assert.ok() for the same result (like in nodeJS)

/**
 * Assert enumeration
 * @param array
 * @param value
 * @param message
 */
assert.enum = function _enum(array, value, message) {
    if (array.indexOf(value) === -1) {
        throw new RangeError(message);
    }
};

/**
 * Assert equal
 * @param expected
 * @param actual
 * @param message
 */
assert.equal = function _equal(expected, actual, message) {
    if (expected !== actual) {
        throw new RangeError(message);
    }
};

/**
 * Assert format (note: prefer kendo.format when available)
 * @param message
 */
assert.format = function _format(message, ...values) {
    return message.replace(
        /\{(\d+)\}/g,
        (match, index) => `${values[parseInt(index, 10)]}`
    );
};

/**
 * Assert the length property (for Arrays and jQuery)
 * @param el
 * @param message
 */
assert.hasLength = function _hasLength(el, message) {
    if (!el || !el.length) {
        throw new TypeError(message);
    }
};

/**
 * Assert instance of
 * @param Class
 * @param value
 * @param message
 */
assert.instanceof = function _instanceof(Class, value, message) {
    if (!(value instanceof Class)) {
        throw new TypeError(message);
    }
};

/**
 * Assert isArray
 * @param value
 * @param message
 */
assert.isArray = function _isArray(value, message) {
    if (!Array.isArray(value)) {
        throw new TypeError(message);
    }
};

/**
 * Assert not undefined
 * @param value
 * @param message
 */
assert.isDefined = function _isDefined(value, message) {
    if ($.type(value) === 'undefined') {
        throw new TypeError(message);
    }
};

/**
 * Assert empty object (i.e. {})
 * @param value
 * @param message
 */
assert.isEmptyObject = function _isEmptyObject(value, message) {
    if (!$.isEmptyObject(value)) {
        throw new TypeError(message);
    }
};

/**
 * Assert isFunction
 * @param value
 * @param message
 */
assert.isFunction = function _isFunction(value, message) {
    if (!$.isFunction(value)) {
        throw new TypeError(message);
    }
};

/**
 * Assert optional object (can be undefined but mot an empty object, i.e. {})
 * @param value
 * @param message
 */
assert.isOptionalObject = function _isOptionalObject(value, message) {
    if (
        $.type(value) !== 'undefined' &&
        (!$.isPlainObject(value) || $.isEmptyObject(value))
    ) {
        throw new TypeError(message);
    }
};

/**
 * Assert a plain object (not empty)
 * @param value
 * @param message
 */
assert.isPlainObject = function _isPlainObject(value, message) {
    if (!$.isPlainObject(value) || $.isEmptyObject(value)) {
        throw new TypeError(message);
    }
};

/**
 * Assert undefined
 * @param value
 * @param message
 */
assert.isUndefined = function _isUndefined(value, message) {
    if ($.type(value) !== 'undefined') {
        throw new TypeError(message);
    }
};

/**
 * Assert regular expression match
 * @param rx
 * @param value
 * @param message
 */
assert.match = function _match(rx, value, message) {
    if ($.type(value) !== 'string' || !rx.test(value)) {
        throw new RangeError(message);
    }
};

/**
 * Assert true condition
 * @param test
 * @param message
 * @returns {*}
 */
assert.ok = function _ok(test, message) {
    return assert(test, message);
};

/**
 * Assert type
 * @param type
 * @param value
 * @param message
 */
assert.type = function _type(type, value, message) {
    if ($.type(value) !== type) {
        throw new TypeError(message);
    }
};

/**
 * Assert typeOrUndef
 * @param type
 * @param value
 * @param message
 */
assert.typeOrUndef = function _typeOrUndef(type, value, message) {
    if ($.type(value) !== 'undefined' && $.type(value) !== type) {
        throw new TypeError(message);
    }
};

assert.messages = {
    enum: {
        default: '`{0}` is expected to be any of `{1}`'
    },
    equal: {
        default: '`{0}` is expected to equal `{1}`'
    },
    hasLength: {
        default: '`{0}` has neither length nor any item'
    },
    instanceof: {
        default: '`{0}` is expected to be an instance of `{1}`'
    },
    isArray: {
        default: '`{0}` is expected to be an array'
    },
    isDefined: {
        default: '`{0}` is expected to be not undefined'
    },
    isEmptyObject: {
        default: '`{0}` is expected to be an empty object'
    },
    isFunction: {
        default: '`{0}` is expected to be a function'
    },
    isOptionalObject: {
        default: '`{0}` is expected to be undefined or a plain object'
    },
    isPlainObject: {
        default: '`{0}` is expected to be a plain object'
    },
    isUndefined: {
        default: '`{0}` is expected to be undefined'
    },
    match: {
        default: '`{0}` is expected to match `{1}`'
    },
    ok: {
        default: 'A statement is expected to be true'
    },
    type: {
        default: '`{0}` is expected to have type `{1}`'
    },
    typeOrUndef: {
        default: '`{0}` is expected to have type `{1}` or be undefined'
    }
};

/**
 * Assert crud
 * @param options
 */
assert.crud = function _crud(options) {
    assert.type(
        'object',
        options,
        assert.format(assert.messages.type.default, 'options', 'object')
    );
    assert.type(
        'object',
        options.data,
        assert.format(assert.messages.type.default, 'options.data', 'object')
    );
    assert.isFunction(
        options.success,
        assert.format(assert.messages.isFunction.default, 'options.success')
    );
    assert.isFunction(
        options.error,
        assert.format(assert.messages.isFunction.default, 'options.error')
    );
};

/**
 * Maintain compatibility with legacy code
 * @type {assert}
 */
window.assert = assert;
