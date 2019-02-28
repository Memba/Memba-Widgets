/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable valid-typeof */

import CONSTANTS from './window.constants.es6';

const { console, Error, ErrorEvent, location } = window;
const plugins = new Set();

/**
 * Format message and data into a log entry object
 * @param message
 * @param data
 */
function preProcess(message, data) {
    if (
        typeof message !== CONSTANTS.STRING &&
        typeof data !== CONSTANTS.UNDEFINED
    ) {
        throw new TypeError('Unexpected data when message is not a string');
    }
    let entry = {};
    if (typeof message === CONSTANTS.STRING) {
        entry = { message, data };
    } else if (message instanceof Error) {
        entry = {
            message: message.message,
            error: message
        };
    } else if (
        typeof ErrorEvent === CONSTANTS.FUNCTION &&
        message instanceof ErrorEvent
    ) {
        // Note: ErrorEvent does not exist in PhantomJS
        entry = {
            message: message.message,
            data: {
                filename: message.filename,
                lineno: message.lineno,
                colno: message.colno
            },
            error: message.error
        };
    } else if (Object.prototype.toString.call(message) === '[object Object]') {
        entry = JSON.parse(JSON.stringify(message));
        if (message.error instanceof Error) {
            // We need to do that because JSON.stringify(new Error('Oops)) === {}
            entry.error = message.error;
        }
    } else {
        entry = {
            message: 'Unknown error',
            data: message
        };
    }
    return entry;
}

/**
 * Enhance the log entry
 * @param logEntry
 * @param module
 * @param level
 */
function enhance(logEntry, module, level) {
    const entry = logEntry;
    const LINEFEED = '\n';
    const LINESEP = ', ';
    const RX_SPACES = /\s+/g;
    const SPACE = ' ';

    if (Object.prototype.toString.call(entry) !== '[object Object]') {
        throw new TypeError('`entry` should be an object');
    }

    // Improve error logging
    if (entry.error instanceof Error) {
        if (typeof entry.message === CONSTANTS.UNDEFINED) {
            entry.message = entry.error.message;
        }
        if (entry.error.originalError instanceof Error) {
            entry.originalMessage = entry.error.originalError.message;
            if (typeof entry.error.originalError.stack === CONSTANTS.STRING) {
                // Note: stack is undefined in PhantomJS
                entry.stack = entry.error.originalError.stack
                    .split(LINEFEED)
                    .join(LINESEP)
                    .replace(RX_SPACES, SPACE);
            }
        } else if (typeof entry.error.stack === CONSTANTS.STRING) {
            // Note: stack is undefined in PhantomJS
            entry.stack = entry.error.stack
                .split(LINEFEED)
                .join(LINESEP)
                .replace(RX_SPACES, SPACE);
        }
    }

    // Add module
    entry.module =
        typeof module === CONSTANTS.STRING ? module : CONSTANTS.UNDEFINED;

    // Add level
    entry.level =
        Object.keys(Logger.levels).indexOf(level) > -1 // eslint-disable-line no-use-before-define
            ? level
            : Logger.levels.default; // eslint-disable-line no-use-before-define

    // If there is a hidden input field named `trace` on the page, read it and add it
    const input = document.getElementById('trace');
    if (input instanceof HTMLInputElement && input.type === 'hidden') {
        entry.trace = input.value;
    }

    // Log the page url (with query string to copy-paste when debugging a logged error)
    const pos = `${location.protocol}//${location.host}`.length;
    entry.url = location.href.substr(pos);

    // Log the query string to improve lisibility
    if (location.search || location.hash) {
        /*
        // Cannot always deparam location.hash especially with kendo.router
        if (window.jQuery && typeof window.jQuery.deparam === 'function') {
            entry.query = {
                search: window.jQuery.deparam(location.search.substr(1)),
                hash: window.jQuery.deparam(location.hash.substr(1))
            };
        } else {
        */
        entry.query = {
            search: location.search,
            hash: location.hash
        };
        /* } */
    } else {
        entry.query = {};
    }
}

/**
 * Print a formatted log entry to the console
 * @param entry
 */
function log2Console(entry) {
    const EQ = ': ';
    const FIRST = ' ';
    const SEP = '; '; // '  |  ';
    const DATA_LENGTH = 500;
    if (console && typeof console.log === CONSTANTS.FUNCTION) {
        let message = `[${entry.level.toUpperCase()}${
            entry.level.length === 4 ? ' ' : ''
        }]`;
        let first = true;
        if (entry.message) {
            message += `${first ? FIRST : SEP}message${EQ}${entry.message}`;
            first = false;
        }
        if (entry.originalMessage) {
            message += `${first ? FIRST : SEP}originalMessage${EQ}${
                entry.originalMessage
            }`;
            first = false;
        }
        if (entry.module) {
            message += `${first ? FIRST : SEP}module${EQ}${entry.module}`;
            first = false;
        }
        if (entry.method) {
            message += `${first ? FIRST : SEP}method${EQ}${entry.method}`;
            first = false;
        }
        if (entry.stack) {
            message += `${first ? FIRST : SEP}stack${EQ}${entry.stack}`;
            first = false;
        }
        if (entry.data) {
            try {
                message += `${first ? FIRST : SEP}data${EQ}${JSON.stringify(
                    entry.data
                ).substr(0, DATA_LENGTH)}`;
            } catch (exception) {
                if (typeof entry.data.toString === CONSTANTS.FUNCTION) {
                    message += `${
                        first ? FIRST : SEP
                    }data${EQ}${entry.data.toString()}`;
                }
            }
        }
        if (entry.trace) {
            message += `${first ? FIRST : SEP}trace${EQ}${entry.trace}`;
            first = false;
        }
        console.log(message);
        if (entry.error instanceof Error) {
            if (typeof console.error === CONSTANTS.FUNCTION) {
                console.error(entry.error);
            }
        }
        if (entry.originalError instanceof Error) {
            if (typeof console.error === CONSTANTS.FUNCTION) {
                console.error(entry.originalError);
            }
        }
    }
}

/**
 * Logger
 * @class
 */
export default class Logger {
    /**
     * Constructor
     * @constructor
     * @param module
     */
    constructor(module /* , appLogger */) {
        this._module = module;
    }

    /**
     * Add a new plugin
     */
    static register(plugin) {
        /*
        assert.type(
            CONSTANTS.OBJECT,
            plugin,
            assert.format(
                assert.messages.type.default,
                'plugin',
                CONSTANTS.OBJECT
            )
        );
        assert.isFunction(
            plugin.log,
            assert.format(
                assert.messages.isFunction.default,
                'plugin.log'
            )
        );
        */
        plugins.add(plugin);
    }

    /**
     * Logger levels
     * @returns {{debug: {name: string, value: number}, info: {name: string, value: number}, warn: {name: string, value: number}, error: {name: string, value: number}, crit: {name: string, value: number}}}
     */
    static get levels() {
        return {
            debug: { name: 'DEBUG', value: 1 },
            info: { name: 'INFO', value: 2 },
            warn: { name: 'WARN', value: 4 },
            error: { name: 'ERROR', value: 5 },
            crit: { name: 'CRIT', value: 6 },
            default: 'info'
        };
    }

    /**
     * Generic log
     * @param level
     * @param message
     * @param data
     * @returns {boolean} just for tests
     */
    log(level, message, data) {
        const lv = String(level).toLowerCase();
        if (Object.keys(Logger.levels).indexOf(lv) === -1) {
            throw new TypeError(
                '`level` should be one of `debug`, `info`, `warn`, `error` or `crit`'
            );
        }
        // Build log entry
        const entry = preProcess(message, data);
        enhance(entry, this._module, lv);
        // Log to the console any level above window.DEBUG
        if (
            window.DEBUG === true ||
            (typeof window.DEBUG === 'number' &&
                window.DEBUG <= Logger.levels[lv].value)
        ) {
            log2Console(entry, lv);
        }
        // Call registered plugins
        plugins.forEach(plugin => {
            plugin.log(entry, lv);
        });
    }

    /**
     * Debug level log
     * @param message
     * @param data
     * @returns {boolean}
     */
    debug(message, data) {
        return this.log(Logger.levels.debug.name, message, data);
    }

    /**
     * Info level log
     * @param message
     * @param data
     * @returns {boolean}
     */
    info(message, data) {
        return this.log(Logger.levels.info.name, message, data);
    }

    /**
     * Warning level log
     * @param message
     * @param data
     */
    warn(message, data) {
        return this.log(Logger.levels.warn.name, message, data);
    }

    /**
     * Error level log
     * @param message
     * @param data
     */
    error(message, data) {
        return this.log(Logger.levels.error.name, message, data);
    }

    /**
     * Critical level log
     * @param message
     * @param data
     */
    crit(message, data) {
        return this.log(Logger.levels.crit.name, message, data);
    }

    /**
     * Critical level log
     * @param message
     * @param data
     */
    critical(message, data) {
        return this.crit(message, data);
    }
}

/**
 * OnError global event handler
 * @see https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
 * @param message
 * @param source
 * @param lineno
 * @param colno
 * @param error
 */
window.onerror = function onerror(message, source, lineno, colno, error) {
    const logger = new Logger('window.logger');
    logger.crit({
        message,
        error,
        data: { source, lineno, colno }
    });
};

/**
 * Legacy code
 * @type {Logger}
 */
window.Logger = Logger;
