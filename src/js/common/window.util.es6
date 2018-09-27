/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
// import $ from 'jquery';
import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';

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
    return s.replace(/x/g, () => Math.trunc(16 * Math.random()).toString(16));
}

/**
 * Get a 6 char random id
 * @returns {string}
 */
export function randomId() {
    return `id_${randomHexString(6)}`;
}

/**
 * Get a 6 char random val
 * @returns {string}
 */
export function randomVal() {
    return `val_${randomHexString(6)}`;
}

/**
 * Rounding numbers with precision
 * @method round
 * @param value
 * @param precision
 * @return {Number}
 */
export function round(value, precision = 2) {
    const val = parseFloat(value);
    const p = Math.trunc(10 ** Math.trunc(precision));
    return Math.round(val * p) / p;
}
