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

    (function (undefined) {

        var app = window.app = window.app || {};
        var STRING = 'string';
        var FUNCTION = 'function';
        var UNDEFINED = 'undefined';
        var LEVELS = {
            DEBUG: { NAME: 'DEBUG', VALUE: 1 },
            INFO: { NAME: 'INFO', VALUE: 2 },
            WARN: { NAME: 'WARN', VALUE: 4 },
            ERROR: { NAME: 'ERROR', VALUE: 5 },
            CRIT: { NAME: 'CRIT', VALUE: 6 }
        };
        var DEFAULT = LEVELS.INFO;
        var LINEFEED = '\n';
        var LINESEP = ', ';
        var SPACES = /\s+/g;
        var SPACE = ' ';
        var EQ = ': ';
        var FIRST = ' ';
        var SEP = '; '; // '  |  ';

        /**
         * Logger class
         * @class Logger
         */
        var Logger = window.Logger = function (module/*, appLogger*/) {
            this._module = module;
        };

        /**
         * Log message
         * @param level
         * @param message
         * @param data
         * @returns {boolean}
         */
        Logger.prototype.log = function (level, message, data) {

            // Preprocess message + data to return an object
            function preProcess(message, data) {
                if (typeof message !== STRING && typeof data !== UNDEFINED) {
                    throw new TypeError('Unexpected data when message is not a string');
                }
                var entry;
                if (typeof message === STRING) {
                    entry = { message: message, data: data };
                } else if (message instanceof window.Error) {
                    entry = {
                        message: message.message,
                        error: message
                    };
                } else if (typeof window.ErrorEvent === FUNCTION && message instanceof window.ErrorEvent) {
                    // window.ErrorEvent does not exist in PhantomJS
                    entry = {
                        message: message.message,
                        data: { filename: message.filename, lineno: message.lineno, colno: message.colno },
                        error: message.error
                    };
                } else if (Object.prototype.toString.call(message) === '[object Object]') {
                    entry = JSON.parse(JSON.stringify(message));
                    if (message.error instanceof Error) {
                        // We need to do that because JSON.stringify(new Error('Oops)) === {}
                        entry.error = message.error;
                    }
                } else {
                    entry = { data: message };
                }
                return entry;
            }

            // Enhance a log entry
            function enhance(entry, module, level) {
                if (Object.prototype.toString.call(entry) !== '[object Object]') {
                    throw new TypeError('entry is expected to be an object');
                }

                // Improve error logging
                if (entry.error instanceof Error) {
                    if (typeof entry.message === UNDEFINED) {
                        entry.message = entry.error.message;
                    }
                    if (entry.error.originalError instanceof window.Error) {
                        entry.originalMessage = entry.error.originalError.message;
                        if (typeof entry.error.originalError.stack === STRING) { // To care for an exception in PhantomJS
                            entry.stack = entry.error.originalError.stack.split(LINEFEED).join(LINESEP).replace(SPACES, SPACE);
                        }
                    } else {
                        if (typeof entry.error.stack === STRING) { // To care for an exception in PhantomJS
                            entry.stack = entry.error.stack.split(LINEFEED).join(LINESEP).replace(SPACES, SPACE);
                        }
                    }
                }

                // Add module
                entry.module = typeof module === STRING ? module : UNDEFINED;

                // Add level
                level = String(level).toUpperCase();
                entry.level = Object.keys(LEVELS).indexOf(level) > -1 ? level : DEFAULT.NAME;

                // If there is a hidden input field named `trace` on the page, read it and add it
                var input = document.getElementById('trace');
                if (input instanceof HTMLInputElement && input.type === 'hidden') {
                    entry.trace = input.value;
                }

                // Log the page url
                var pos = (window.location.protocol + '//' + window.location.host).length;
                entry.url = window.location.href.substr(pos);

                // Log the query string
                if (window.location.search || window.location.hash) {
                    if (window.jQuery && typeof window.jQuery.deparam === 'function') {
                        entry.query = {
                            search: window.jQuery.deparam(window.location.search.substr(1)),
                            hash: window.jQuery.deparam(window.location.hash)
                        };
                    } else {
                        entry.query = {
                            search: window.location.search.substr(1),
                            hash: window.location.hash
                        };
                    }
                } else {
                    entry.query = {};
                }
            }

            /* This function has too many statements. */
            /* jshint -W071 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            // Print a formatted log entry to the console
            function log2Console(entry) {
                /* jshint maxcomplexity: 24 */
                /* jshint maxstatements: 34 */
                var console = window.console;
                if (console && typeof console.log === FUNCTION) {
                    var message = '[' + entry.level + (entry.level.length === 4 ? ' ' : '') + ']';
                    var first = true;
                    if (entry.message) {
                        message += (first ? FIRST : SEP) + 'message' + EQ + entry.message;
                        first = false;
                    }
                    if (entry.originalMessage) {
                        message += (first ? FIRST : SEP) + 'originalMessage' + EQ + entry.originalMessage;
                        first = false;
                    }
                    if (entry.module) {
                        message += (first ? FIRST : SEP) + 'module' + EQ + entry.module;
                        first = false;
                    }
                    if (entry.method) {
                        message += (first ? FIRST : SEP) + 'method' + EQ + entry.method;
                        first = false;
                    }
                    if (entry.stack) {
                        message += (first ? FIRST : SEP) + 'stack' + EQ + entry.stack;
                        first = false;
                    }
                    if (entry.data) {
                        try {
                            message += (first ? FIRST : SEP) + 'data' + EQ + JSON.stringify(entry.data);
                        } catch (exception) {
                            if (typeof entry.data.toString === FUNCTION) {
                                message += (first ? FIRST : SEP) + 'data' + EQ + entry.data.toString();
                            }
                        }
                    }
                    if (entry.trace) {
                        message += (first ? FIRST : SEP) + 'trace' + EQ + entry.trace;
                        first = false;
                    }
                    console.log(message);
                    if (entry.error instanceof Error) {
                        if (typeof window.console.error === FUNCTION) {
                            window.console.error(entry.error);
                        }
                    }
                    if (entry.originalError instanceof Error) {
                        if (typeof window.console.error === FUNCTION) {
                            window.console.error(entry.originalError);
                        }
                    }
                }
            }

            /* jshint +W074 */
            /* jshint +W071 */


            level = String(level).toUpperCase();
            if (Object.keys(LEVELS).indexOf(level) === -1) {
                throw new TypeError('level is either `debug`, `info`, `warn`, `error` or `crit`');
            }
            if (app.level > LEVELS[level].VALUE) {
                return false;
            }
            var entry = preProcess(message, data);
            enhance(entry, this._module, level);
            if (app.DEBUG) {
                log2Console(entry, level);
            }
            var logger = app.logger;
            if (logger && typeof logger['_' + level.toLowerCase()] === FUNCTION) {
                logger['_' + level.toLowerCase()](entry);
            }
            return true;
        };

        /**
         * Debug message
         * @param message
         * @param data
         */
        Logger.prototype.debug = function (message, data) {
            return this.log(LEVELS.DEBUG.NAME, message, data);
        };

        /**
         * Info message
         * @param message
         * @param data
         */
        Logger.prototype.info = function (message, data) {
            return this.log(LEVELS.INFO.NAME, message, data);
        };

        /**
         * Warning message
         * @param message
         * @param data
         */
        Logger.prototype.warn = function (message, data) {
            return this.log(LEVELS.WARN.NAME, message, data);
        };

        /**
         * Error message
         * @param message
         * @param data
         */
        Logger.prototype.error = function (message, data) {
            return this.log(LEVELS.ERROR.NAME, message, data);
        };

        /**
         * Critical message
         * @param message
         * @param data
         */
        Logger.prototype.crit = Logger.prototype.critical = function (message, data) {
            return this.log(LEVELS.CRIT.NAME, message, data);
        };

        /**
         * OnError global event handler
         * @see https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
         * @param message
         * @param source
         * @param lineno
         * @param colno
         * @param error
         */
        window.onerror = function (message, source, lineno, colno, error) {
            var logger = new Logger('window.logger');
            logger.crit({
                data: { source: source, lineno: lineno, colno: colno },
                error: error,
                message: message
            });
        };

    }());

    return window.Logger;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
