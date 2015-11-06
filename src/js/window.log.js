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
        var app = window.app;

        /**
         * Log class
         * @class Log
         */
        var Log = window.Log = function (module) {

            this._module = module;

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Generic print function
             * @param message
             * @param level
             * @private
             */
            this._print = function (message, level) {
                var error;
                var logEntry;
                if ($.type(message) === STRING) {
                    logEntry = { message: message };
                } else if (message instanceof Error) {
                    error = message;
                    logEntry = {
                        message: error.message,
                        data: $.extend({}, error)
                    };
                } else {
                    logEntry = $.extend({}, message);
                }
                logEntry.level = (/^(debug|info|warn|error|crit)$/i).test(level) ? level.toUpperCase() : 'INFO';
                logEntry.module = this._module;

                // If we have an app.logger, delegate to app logger
                if (app && app.logger) {
                    $.noop(); // TODO <----------------------------------------------------------------
                // Otherwise use plain old window.console.log
                } else if (window.console && $.isFunction(window.console.log)) {
                    window.console.log(
                        '[' + logEntry.level + '] ' + (logEntry.level.length === 4 ? ' ' : '') +
                        logEntry.module + ': ' +
                        logEntry.message +
                        (logEntry.data ? ' - ' + JSON.stringify(logEntry.data) : '')
                    );
                    if (error instanceof Error && $.isFunction(window.console.error)) {
                        window.console.error(error);
                    }
                }
            };

            /* jshint +W074 */

        };

        /**
         * Print debug message
         * @param message
         */
        Log.prototype.debug = function (message) { return this._print(message, 'debug'); };

        /**
         * Print info message
         * @param message
         */
        Log.prototype.info = function (message) { return this._print(message, 'info'); };

        /**
         * Print warn message
         * @param message
         */
        Log.prototype.warn = function (message) { return this._print(message, 'warn'); };

        /**
         * Print error message
         * @param message
         */
        Log.prototype.error = function (message) { return this._print(message, 'error'); };

        /**
         * Print critical message
         * @param message
         */
        Log.prototype.crit = function (message) { return this._print(message, 'crit'); };


    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
