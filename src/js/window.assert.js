/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var STRING = 'string';
        var UNDEFINED = 'undefined';

        /**
         * Asserts
         * Note: Use asserts where unmet conditions are independent from user entries, and
         * developers should be warned that there is probably something unexpected in their code
         */
        var assert = window.assert = $.extend(
            // By extending assert, we ensure we can call both assert() and assert.ok() for the same result (like in nodeJS)
            function (test, message) {
                if (!test) { throw new Error(message); }
            },
            {
                enum: function (array, value, message) { if (array.indexOf(value) === -1) { throw new Error(message); } },
                equal: function (expected, actual, message) { if (expected !== actual) { throw new Error(message); } },
                instanceof: function (Class, value, message) { if (!(value instanceof Class)) { throw new Error(message); } },
                isOptionalObject: function (value, message) { if ($.type(value) !== UNDEFINED && (!$.isPlainObject(value) || $.isEmptyObject(value))) { throw new Error(message); } },
                isPlainObject: function (value, message) { if (!$.isPlainObject(value) || $.isEmptyObject(value)) { throw new Error(message); } },
                isUndefined: function (value, message) { if ($.type(value) !== UNDEFINED) { throw new Error(message); } },
                match: function (rx, value, message) { if ($.type(value) !== STRING || !rx.test(value)) { throw new Error(message); } },
                ok: function (test, message) { return assert(test, message); },
                type: function (type, value, message) { if ($.type(value) !== type) { throw new TypeError(message); } }
            },
            {
                messages: {
                    enum: {
                        default: '`{0}` is expected to be any of `{1}`'
                    },
                    equal: {
                        default: '`{0}` is expected to equal `{1}`'
                    },
                    instanceof: {
                        default: '`{0}` is expected to be an instance of `{1}`'
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
                    type: {
                        default: '`{0}` is expected to have type `{1}`'
                    }
                }
            }
        );

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
