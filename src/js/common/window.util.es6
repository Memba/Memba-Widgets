/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';

/**
 * Escape text for regular expression
 * @see https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
 * @param str
 * @returns {*}
 */
export function escapeRegExp(str) {
    return str.replace(/[-[]\/{}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
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
