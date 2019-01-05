/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
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
assert.enum = (array, value, message) => {
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
assert.equal = (expected, actual, message) => {
    if (expected !== actual) {
        throw new RangeError(message);
    }
};

/**
 * Assert extends as in class Child extends Parent
 * @param Parent
 * @param Child
 * @param message
 */
assert.extends = (Parent, Child, message) => {
    if (
        !$.isFunction(Parent) ||
        !$.isFunction(Child) ||
        !Object.prototype.isPrototypeOf.call(Parent.prototype, Child.prototype)
    ) {
        throw new TypeError(message);
    }
};

/**
 * Assert extendsOrUndef
 * @param Parent
 * @param Child
 * @param message
 */
assert.extendsOrUndef = (Parent, Child, message) => {
    if (
        !$.isFunction(Parent) ||
        ($.type(Child) !== 'undefined' &&
            (!$.isFunction(Child) ||
                !Object.prototype.isPrototypeOf.call(
                    Parent.prototype,
                    Child.prototype
                )))
    ) {
        throw new TypeError(message);
    }
};

/**
 * Assert format (note: prefer kendo.format when available)
 * @param message
 * @param values
 * @returns {*}
 */
assert.format = (message, ...values) =>
    message.replace(
        /{(\d+)}/g,
        (match, index) => `${values[parseInt(index, 10)]}`
    );

/**
 * Assert the length property (for Arrays and jQuery)
 * @param el
 * @param message
 */
assert.hasLength = (el, message) => {
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
assert.instanceof = (Class, value, message) => {
    if (!(value instanceof Class)) {
        throw new TypeError(message);
    }
};

/**
 * Assert isArray
 * @param value
 * @param message
 */
assert.isArray = (value, message) => {
    if (!Array.isArray(value)) {
        throw new TypeError(message);
    }
};

/**
 * Assert not undefined
 * @param value
 * @param message
 */
assert.isDefined = (value, message) => {
    if ($.type(value) === 'undefined') {
        throw new TypeError(message);
    }
};

/**
 * Assert empty object (i.e. {})
 * @param value
 * @param message
 */
assert.isEmptyObject = (value, message) => {
    if (!$.isEmptyObject(value)) {
        throw new TypeError(message);
    }
};

/**
 * Assert isFunction
 * @param value
 * @param message
 */
assert.isFunction = (value, message) => {
    if (!$.isFunction(value)) {
        throw new TypeError(message);
    }
};

/**
 * Assert a non-empty plain object
 * @param value
 * @param message
 */
assert.isNonEmptyPlainObject = (value, message) => {
    if (!$.isPlainObject(value) || $.isEmptyObject(value)) {
        throw new TypeError(message);
    }
};

/**
 * Assert optional object (can be undefined but not an empty object, i.e. {})
 * @param value
 * @param message
 */
assert.isNonEmptyPlainObjectOrUndef = (value, message) => {
    if (
        $.type(value) !== 'undefined' &&
        (!$.isPlainObject(value) || $.isEmptyObject(value))
    ) {
        throw new TypeError(message);
    }
};

/**
 * Assert a plain (incl. empty) object
 * @param value
 * @param message
 */
assert.isPlainObject = (value, message) => {
    if (!$.isPlainObject(value)) {
        throw new TypeError(message);
    }
};

/**
 * Assert a plain (incl. empty) object or undefined
 * @param value
 * @param message
 */
assert.isPlainObjectOrUndef = (value, message) => {
    if ($.type(value) !== 'undefined' && !$.isPlainObject(value)) {
        throw new TypeError(message);
    }
};

/**
 * Assert a point (x, y)
 * @param value
 * @param message
 */
assert.isPoint = (value, message) => {
    if (
        $.type(value) !== 'object' ||
        $.type(value.x) !== 'number' ||
        $.type(value.y) !== 'number'
    ) {
        throw new TypeError(message);
    }
};

/**
 * Assert undefined
 * @param value
 * @param message
 */
assert.isUndefined = (value, message) => {
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
assert.match = (rx, value, message) => {
    if ($.type(value) !== 'string' || !rx.test(value)) {
        throw new RangeError(message);
    }
};

/**
 * Assert instance of Class or null or undefined
 * @param Class
 * @param value
 * @param message
 */
assert.nullableInstanceOrUndef = (Class, value, message) => {
    if (
        $.type(value) !== 'undefined' &&
        !(value instanceof Class) &&
        $.type(value) !== 'null'
    ) {
        throw new TypeError(message);
    }
};

/**
 * Assert type or null or undefined
 * @param type
 * @param value
 * @param message
 */
assert.nullableTypeOrUndef = (type, value, message) => {
    if (
        $.type(value) !== 'undefined' &&
        $.type(value) !== type &&
        $.type(value) !== 'null'
    ) {
        throw new TypeError(message);
    }
};

/**
 * Assert true condition
 * @param test
 * @param message
 * @returns {*}
 */
assert.ok = (test, message) => assert(test, message);

/**
 * Assert type
 * @param type
 * @param value
 * @param message
 */
assert.type = (type, value, message) => {
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
assert.typeOrUndef = (type, value, message) => {
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
    extends: {
        default: '`{0}` is expected to extend `{1}`'
    },
    extendsOrUndef: {
        default: '`{0}` is expected to extend `{1}` or be undefined'
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
    isNonEmptyPlainObject: {
        default: '`{0}` is expected to be a plain non-empty object'
    },
    isNonEmptyPlainObjectOrUndef: {
        default: '`{0}` is expected to be undefined or a plain non-empty object'
    },
    isPlainObject: {
        default: '`{0}` is expected to be a plain or empty object'
    },
    isPlainObjectOrUndef: {
        default: '`{0}` is expected to be a plain or empty object or undefined'
    },
    isPoint: {
        default: '`{0}` is expected to be a point {x, y}'
    },
    isUndefined: {
        default: '`{0}` is expected to be undefined'
    },
    match: {
        default: '`{0}` is expected to match `{1}`'
    },
    nullableInstanceOrUndef: {
        default:
            '`{0}` is expected to be an instance of `{1}` or be null or undefined'
    },
    nullableTypeOrUndef: {
        default: '`{0}` is expected to have type `{1}` or be null or undefined'
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
 * Assert data source transport options
 * @param options
 */
assert.crud = options => {
    assert.isNonEmptyPlainObject(
        options,
        assert.format(assert.messages.isNonEmptyPlainObject.default, 'options')
    );
    assert.isPlainObject(
        options.data,
        assert.format(assert.messages.isPlainObject.default, 'options.data')
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
 * Assert rapi interface
 * @param rapi
 */
assert.rapi = rapi => {
    assert.isFunction(
        rapi.create,
        assert.format(assert.messages.isFunction.default, 'rapi.create')
    );
    assert.isFunction(
        rapi.destroy,
        assert.format(assert.messages.isFunction.default, 'rapi.destroy')
    );
    assert.isFunction(
        rapi.get,
        assert.format(assert.messages.isFunction.default, 'rapi.get')
    );
    assert.isFunction(
        rapi.read,
        assert.format(assert.messages.isFunction.default, 'rapi.read')
    );
    assert.isFunction(
        rapi.update,
        assert.format(assert.messages.isFunction.default, 'rapi.update')
    );
};

/**
 * Legacy code
 * @type {assert}
 */
window.assert = assert;
