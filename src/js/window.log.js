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

        /**
         * Log class
         * @class Log
         */
        var Log = window.Log = function (module) {

            this._module = module;

            /**
             * Generic print function
             * @param message
             * @param level
             * @private
             */
            this._print = function (message, level) {

                message = $.type(message) === STRING ? { message: message } : message;
                level = (/^(debug|info|warn|error|crit)$/i).test(level) ? level.toLowerCase() : 'info';

                var app = window.app;
                var logEntry = $.extend({}, message, { module: this._module });

                // If we have an app.logger, delegate to app logger
                if (app && app.logger) {
                    // TODO ------------------------------------------------------------------------------------
                    $.noop();

                // Otherwise use plain old window.console.log
                } else if (window.console && $.isFunction(window.console.log)) {
                    window.console.log(
                        logEntry.module + ': ' +
                        logEntry.message +
                        (logEntry.data ? ' - ' + JSON.stringify(logEntry.data) : ''));
                }
            };

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
