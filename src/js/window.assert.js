/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function (undefined) {

        var STRING = 'string';
        var OBJECT = 'object';
        var FUNCTION = 'function';
        var UNDEFINED = 'undefined';

        // Populate the class2type map
        var class2type = {};
        'Boolean Number String Function Array Date RegExp Object Error Symbol'.split(' ').forEach(function (name) {
            class2type[ '[object ' + name + ']' ] = name.toLowerCase();
        });
        var toString = class2type.toString;
        var hasOwn = class2type.hasOwnProperty;

        // jQuery core functions to remove any dependencies
        // @see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/core.js
        var $ = {
            isArray: Array.isArray,
            isFunction: function (obj) {
                return $.type(obj) === FUNCTION;
            },
            isEmptyObject: function (obj) {
                var name;
                for (name in obj) {
                    return false;
                }
                return true;
            },
            isNumeric: function (obj) {
                // parseFloat NaNs numeric-cast false positives (null|true|false|"")
                // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
                // subtraction forces infinities to NaN
                // adding 1 corrects loss of precision from parseFloat (#15100)
                return !$.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
            },
            isPlainObject: function (obj) {
                // Not plain objects:
                // - Any object or value whose internal [[Class]] property is not "[object Object]"
                // - DOM nodes
                // - window
                if ($.type(obj) !== OBJECT || obj.nodeType || $.isWindow(obj)) {
                    return false;
                }
                if (obj.constructor && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                    return false;
                }
                // If the function hasn't returned already, we're confident that
                // |obj| is a plain object, created by {} or constructed with new Object
                return true;
            },
            isWindow: function (obj) {
                return obj !== null && obj === obj.window;
            },
            type: function (obj) {
                if (obj === null) {
                    return obj + '';
                }
                // Support: Android<4.0 (functionish RegExp)
                return typeof obj === OBJECT || typeof obj === FUNCTION ? class2type[toString.call(obj)] || OBJECT : typeof obj;
            }
        };

        /**
         * Asserts
         * Note: Use asserts where unmet conditions are independent from user entries, and
         * developers should be warned that there is probably something unexpected in their code
         */
        var assert = window.assert = function (test, message) {
            if (!test) { throw new Error(message); }
        };

        // By extending assert, we ensure we can call both assert() and assert.ok() for the same result (like in nodeJS)

        /**
         * Assert enumeration
         * @param array
         * @param value
         * @param message
         */
        assert.enum = function (array, value, message) {
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
        assert.equal = function (expected, actual, message) {
            if (expected !== actual) {
                throw new RangeError(message);
            }
        };

        /**
         * Assert format (note: prefer kendo.format when available)
         * @param message
         */
        assert.format = function (message) {
            var values = arguments;
            return message.replace(/\{(\d+)\}/g, function (match, index) {
                var value = values[parseInt(index, 10) + 1];
                return value + '';
            });
        };

        /**
         * Assert the length property (for Arrays and jQuery)
         * @param el
         * @param message
         */
        assert.hasLength = function (el, message) {
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
        assert.instanceof = function (Class, value, message) {
            if (!(value instanceof Class)) {
                throw new TypeError(message);
            }
        };

        /**
         * Assert isArray
         * @param value
         * @param message
         */
        assert.isArray = function (value, message) {
            if (!$.isArray(value)) {
                throw new TypeError(message);
            }
        };

        /**
         * Assert empty object (i.e. {})
         * @param value
         * @param message
         */
        assert.isEmptyObject = function (value, message) {
            if (!$.isEmptyObject(value)) {
                throw new TypeError(message);
            }
        };

        /**
         * Assert isFunction
         * @param value
         * @param message
         */
        assert.isFunction = function (value, message) {
            if (!$.isFunction(value)) {
                throw new TypeError(message);
            }
        };

        /**
         * Assert optional object (can be undefined but mot an empty object, i.e. {})
         * @param value
         * @param message
         */
        assert.isOptionalObject = function (value, message) {
            if ($.type(value) !== UNDEFINED && (!$.isPlainObject(value) || $.isEmptyObject(value))) {
                throw new TypeError(message);
            }
        };

        /**
         * Assert a plain object (not empty)
         * @param value
         * @param message
         */
        assert.isPlainObject = function (value, message) {
            if (!$.isPlainObject(value) || $.isEmptyObject(value)) {
                throw new TypeError(message);
            }
        };

        /**
         * Assert undefined
         * @param value
         * @param message
         */
        assert.isUndefined = function (value, message) {
            if ($.type(value) !== UNDEFINED) {
                throw new TypeError(message);
            }
        };

        /**
         * Assert regular expression match
         * @param rx
         * @param value
         * @param message
         */
        assert.match = function (rx, value, message) {
            if ($.type(value) !== STRING || !rx.test(value)) {
                throw new RangeError(message);
            }
        };

        /**
         * Assert true condition
         * @param test
         * @param message
         * @returns {*}
         */
        assert.ok = function (test, message) {
            return assert(test, message);
        };

        /**
         * Assert type
         * @param type
         * @param value
         * @param message
         */
        assert.type = function (type, value, message) {
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
        assert.typeOrUndef = function (type, value, message) {
            if ($.type(value) !== UNDEFINED && $.type(value) !== type) {
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

    }());

    /* jshint +W071 */

    return window.assert;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
