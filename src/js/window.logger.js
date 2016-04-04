/**
 * Copyright (c) 2013-2016 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([], f);
})(function () {

    'use strict';

    (function (undefined) {

        var app = window.app = window.app || {};
        var STRING = 'string';
        var FUNCTION = 'function';
        var UNDEFINED = 'undefined';
        var LEVELS = {
            // See https://github.com/logentries/le_node#log-levels
            DEBUG: { NAME: 'DEBUG', VALUE: 1 },
            INFO: { NAME: 'INFO', VALUE: 2 },
            WARN: { NAME: 'WARN', VALUE: 4 },
            ERROR: { NAME: 'ERROR', VALUE: 5 },
            CRIT: { NAME: 'CRIT', VALUE: 6 }
        };
        var DEFAULT = LEVELS.INFO;
        var LINEFEEDS = /\n/g;
        var LINESEP = '; ';
        var EQUAL = ' = ';
        var FIRST = '\t';
        var SEPARATOR = '\t'; // '  |  ';

        /**
         * Logger class
         * @class Logger
         */
        var Logger = window.Logger = function (module/*, appLogger*/) {

            this._module = module;
            this.level = DEFAULT.VALUE;

            /**
             * Preprocess message + data
             * @param message
             * @param data
             */
            function preProcess(message, data) {
                if (typeof message !== STRING && typeof data !== UNDEFINED) {
                    throw new TypeError('Unexpected data when message is not a string');
                }
                var logEntry;
                if (typeof message === STRING) {
                    logEntry = { message: message, data: data };
                } else if (message instanceof window.Error) {
                    logEntry = {
                        message: message.message,
                        error: message
                    };
                } else if (typeof window.ErrorEvent === FUNCTION && message instanceof window.ErrorEvent) {
                    // window.ErrorEvent does not exist in PhantomJS
                    logEntry = {
                        message: message.message,
                        data: { filename: message.filename, lineno: message.lineno, colno: message.colno },
                        error: message.error
                    };
                } else if (Object.prototype.toString.call(message) === '[object Object]') {
                    logEntry = JSON.parse(JSON.stringify(message));
                    if (message.error instanceof Error) {
                        // We need to do that because JSON.stringify(new Error('Oops)) === {}
                        logEntry.error = message.error;
                    }
                } else {
                    logEntry = { data: message };
                }
                return logEntry;
            }

            /**
             * Enhance a log entry
             * @param logEntry
             * @param module
             * @param level
             */
            function enhance(logEntry, module, level) {
                if (Object.prototype.toString.call(logEntry) !== '[object Object]') {
                    throw new TypeError('logEntry is expected to be an object');
                }

                // Improve error logging
                if (logEntry.error instanceof Error) {
                    if (typeof logEntry.message === UNDEFINED) {
                        logEntry.message = logEntry.error.message;
                    }
                    if (logEntry.error.originalError instanceof window.Error) {
                        logEntry.original = logEntry.error.originalError.message;
                        if (typeof logEntry.error.originalError.stack === STRING) { // To care for an exception in PhantomJS
                            logEntry.stack = logEntry.error.originalError.stack.replace(LINEFEEDS, LINESEP);
                        }
                    } else {
                        if (typeof logEntry.error.stack === STRING) { // To care for an exception in PhantomJS
                            logEntry.stack = logEntry.error.stack.replace(LINEFEEDS, LINESEP);
                        }
                    }
                }

                // Add module
                logEntry.module = typeof module === STRING ? module : UNDEFINED;

                // Add level
                level = String(level).toUpperCase();
                logEntry.level = Object.keys(LEVELS).indexOf(level) > -1 ? level : DEFAULT.NAME;

                // If there is a hidden input field named `trace` on the page, read it and add it
                var input = document.getElementById('trace');
                if (input instanceof HTMLInputElement && input.type === 'hidden') {
                    logEntry.trace = input.value;
                }
            }

            /* This function has too many statements. */
            /* jshint -W071 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Print a formatted log entry to the console
             * @param logEntry
             * @private
             */
            function log2Console(logEntry) {
                /* jshint maxcomplexity: 24 */
                /* jshint maxstatements: 34 */
                var console = window.console;
                if (app.DEBUG && console && typeof console.log === FUNCTION) {
                    var message = '[' + logEntry.level + (logEntry.level.length === 4 ? ' ' : '') + ']';
                    var first = true;
                    if (logEntry.message) {
                        message += (first ? FIRST : SEPARATOR) + 'message' + EQUAL + logEntry.message;
                        first = false;
                    }
                    if (logEntry.original) {
                        message += (first ? FIRST : SEPARATOR) + 'original' + EQUAL + logEntry.original;
                        first = false;
                    }
                    if (logEntry.module) {
                        message += (first ? FIRST : SEPARATOR) + 'module' + EQUAL + logEntry.module;
                        first = false;
                    }
                    if (logEntry.method) {
                        message += (first ? FIRST : SEPARATOR) + 'method' + EQUAL + logEntry.method;
                        first = false;
                    }
                    if (logEntry.stack) {
                        message += (first ? FIRST : SEPARATOR) + 'stack' + EQUAL + logEntry.stack;
                        first = false;
                    }
                    if (logEntry.data) {
                        try {
                            message += (first ? FIRST : SEPARATOR) + 'data' + EQUAL + JSON.stringify(logEntry.data);
                        } catch (exception) {
                            if (typeof logEntry.data.toString === FUNCTION) {
                                message += (first ? FIRST : SEPARATOR) + 'data' + EQUAL + logEntry.data.toString();
                            }
                        }
                    }
                    if (logEntry.trace) {
                        message += (first ? FIRST : SEPARATOR) + 'trace' + EQUAL + logEntry.trace;
                        first = false;
                    }
                    console.log(message);
                    if (logEntry.error instanceof Error) {
                        if (typeof window.console.error === FUNCTION) {
                            window.console.error(logEntry.error);
                        }
                    }
                    if (logEntry.originalError instanceof Error) {
                        if (typeof window.console.error === FUNCTION) {
                            window.console.error(logEntry.originalError);
                        }
                    }
                }
            }

            /* jshint +W074 */
            /* jshint +W071 */

            /**
             * Log message
             * @param level
             * @param message
             * @param data
             */
            this.log = function (level, message, data) {
                level = String(level).toUpperCase();
                if (Object.keys(LEVELS).indexOf(level) === -1) {
                    throw new TypeError('level is either `debug`, `info`, `warn`, `error` or `crit`');
                }
                if (this.level > LEVELS[level].VALUE) {
                    return false;
                }
                var logEntry = preProcess(message, data);
                enhance(logEntry, this._module, level);
                log2Console(logEntry, level);
                var logger = app.logger;
                if (logger && typeof logger['_' + level.toLowerCase()] === FUNCTION) {
                    logger['_' + level.toLowerCase()](logEntry);
                }
                return true;
            };

            /**
             * Debug message
             * @param message
             * @param data
             */
            this.debug = function (message, data) {
                return this.log(LEVELS.DEBUG.NAME, message, data);
            };

            /**
             * Info message
             * @param message
             * @param data
             */
            this.info = function (message, data) {
                return this.log(LEVELS.INFO.NAME, message, data);
            };

            /**
             * Warning message
             * @param message
             * @param data
             */
            this.warn = function (message, data) {
                return this.log(LEVELS.WARN.NAME, message, data);
            };

            /**
             * Error message
             * @param message
             * @param data
             */
            this.error = function (message, data) {
                return this.log(LEVELS.ERROR.NAME, message, data);
            };

            /**
             * Critical message
             * @param message
             * @param data
             */
            this.crit = function (message, data) {
                return this.log(LEVELS.CRIT.NAME, message, data);
            };

        };

        /**
         * OnError global event handler
         * @see https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
         * @param e
         */
        window.onerror = function (e) {
            // TODO window.onerror = function (msg, url, line) {
            var gl = new Logger('global');
            gl.crit(e);
        };

    }());

    return window.Logger;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
