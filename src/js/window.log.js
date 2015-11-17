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

    (function (undefined) {

        var app = window.app || {};
        var appLogger = app.logger;

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
        var FIRST = '  ';
        var SEPARATOR = '  |  ';

        /**
         * Logger class
         * @class Logger
         */
        var Logger = window.Logger = function (module) {

            this._module = module;

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
                        message: error.message,
                        error: message
                    };
                } else if (message instanceof window.ErrorEvent) {
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
                        logEntry.stack = logEntry.error.originalError.stack.toString().replace(LINEFEEDS, LINESEP);
                    } else {
                        logEntry.stack = logEntry.error.stack.toString().replace(LINEFEEDS, LINESEP);
                    }
                }

                // Add module
                logEntry.module = typeof module === STRING ? module : UNDEFINED;

                // Add level
                level = String(level).toUpperCase();
                logEntry.level = Object.keys(LEVELS).indexOf(level) > -1 ? level : DEFAULT.NAME;

                // If there is a hidden input field named `trace` on the page, read it
                var input = document.getElementById('trace');
                if (input instanceof HTMLInputElement) {
                    logEntry.trace = input.value;
                }
            }

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Print a formatted log entry to the console
             * @param logEntry
             * @private
             */
            function print(logEntry) {
                if (app.DEBUG && window.console && typeof window.console.log === FUNCTION) {
                    var message = label;
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
                    window.console.log(message);
                    if (logEntry.error instanceof Error) {
                        if (typeof window.console.error === FUNCTION) {
                            window.console.error(logEntry.error);
                        } else if (typeof window.console.dir === FUNCTION) {
                            window.console.dir(logEntry.error);
                        }
                    }
                    if (logEntry.originalError instanceof Error) {
                        if (typeof window.console.error === FUNCTION) {
                            window.console.error(logEntry.originalError);
                        } else if (typeof window.console.dir === FUNCTION) {
                            window.console.dir(logEntry.originalError);
                        }
                    }
                }
            }

            /* jshint +W074 */

            /**
             * Debug message
             * @param message
             * @param data
             */
            this.debug = function (message, data) {
                var logEntry = preProcess(message, data);
                enhance(logEntry, this._module, LEVELS.DEBUG.NAME);
                print(logEntry, LEVELS.DEBUG.NAME);
                if (appLogger && typeof appLogger.debug === FUNCTION) {
                    appLogger.debug(logEntry);
                }
                return true;
            };

            /**
             * Info message
             * @param message
             * @param data
             */
            this.info = function (message, data) {
                var logEntry = preProcess(message, data);
                enhance(logEntry, this._module, LEVELS.INFO.NAME);
                print(logEntry, LEVELS.INFO.NAME);
                if (appLogger && typeof appLogger.debug === FUNCTION) {
                    appLogger.debug(logEntry);
                }
                return true;
            };

            /**
             * Warning message
             * @param message
             * @param data
             */
            this.warn = function (message, data) {
                var logEntry = preProcess(message, data);
                enhance(logEntry, this._module, LEVELS.WARN.NAME);
                print(logEntry, LEVELS.WARN.NAME);
                if (appLogger && typeof appLogger.debug === FUNCTION) {
                    appLogger.debug(logEntry);
                }
                return true;
            };

            /**
             * Error message
             * @param message
             * @param data
             */
            this.error = function (message, data) {
                var logEntry = preProcess(message, data);
                enhance(logEntry, this._module, LEVELS.ERROR.NAME);
                print(logEntry, LEVELS.ERROR.NAME);
                if (appLogger && typeof appLogger.debug === FUNCTION) {
                    appLogger.debug(logEntry);
                }
                // TODO Display error
                return true;
            };

            /**
             * Critical message
             * @param message
             * @param data
             */
            this.critical = function (message, data) {
                var logEntry = preProcess(message, data);
                enhance(logEntry, this._module, LEVELS.CRIT.NAME);
                print(logEntry, LEVELS.CRIT.NAME);
                if (appLogger && typeof appLogger.debug === FUNCTION) {
                    appLogger.debug(logEntry);
                }
                // TODO Display error
                return true;
            };

        };

        /**
         * OnError global event handler
         * @see https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
         * @param e
         */
        window.onerror = function (e) {
            var logger = new Logger('global');
            logger.critical(e);
        };

    }());

    return window.Logger;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
