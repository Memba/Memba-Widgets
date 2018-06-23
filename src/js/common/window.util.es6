/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';

/**
 * Return [xhr, status, errorThrown] from an Error
 */
export function error2xhr(error) {
    assert.instanceof(
        Error,
        error,
        assert.format(assert.messages.instanceof.default, 'error', 'Error')
    );
    assert.type(
        CONSTANTS.STRING,
        error.message,
        assert.format(
            assert.messages.type.default,
            'error.message',
            CONSTANTS.STRING
        )
    );
    // JSON.stringify(error) is always {} - $.extend is a workaround to collect non-undefined error properties
    const obj = $.extend(
        true,
        {},
        {
            name: 'Error',
            message: error.message,
            status: error.status,
            stack: error.stack && error.stack.toString()
            // TODO suberrors - compare with server xhr
        }
    );
    // Possible responseText from rapi calls are:
    // - "{"error":{"name":"ApplicationError","i18n":"errors.http.401","status":401,"message":"Unauthorized"}}"
    return [
        { responseText: JSON.stringify({ error: obj }) }, // TODO Add status from code 404
        'error',
        error.message
    ];
}

/**
 * Converts [xhr, status, errorThrown] to an Error
 * @param xhr
 * @param status
 * @param errorThrown
 * @returns {Error}
 */
export function xhr2error(/* xhr, status, errorThrown */) {
    return new Error('xhr2error'); // TODO
}

/**
 * Date reviver for JSON.parse
 * @see https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates
 * @param key
 * @param value
 */
export function dateReviver(key, value) {
    let ret = value;
    if (CONSTANTS.RX_ISODATE.test(value)) {
        ret = new Date(value);
    }
    return ret;
}

/**
 * Escape text for regular expression
 * @see https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
 * @see https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
 * @see https://github.com/lodash/lodash/blob/master/escapeRegExp.js
 * @param str
 * @returns {*}
 */
export function escapeRegExp(str) {
    // From https://github.com/lodash/lodash/blob/master/escapeRegExp.js
    return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

/**
 * Build a random hex string of length characters
 * @param length
 * @returns {string}
 */
export function randomHexString(length) {
    assert.type(
        CONSTANTS.NUMBER,
        length,
        assert.messages.type.default,
        'length',
        CONSTANTS.NUMBER
    );
    const s = new Array(length + 1).join('x');
    return s.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16)); // eslint-disable-line no-bitwise
}

/**
 * Get a 6 char random id
 * @returns {string}
 */
export function randomId() {
    return `id_${randomHexString(6)}`;
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.util = window.kidoju.util || {};
window.kidoju.util.escapeRegExp = escapeRegExp;
window.kidoju.util.randomId = randomId;
window.kidoju.util.randomString = randomHexString;
