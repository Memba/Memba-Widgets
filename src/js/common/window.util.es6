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
 * @function dateReviver
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
 * Clone using JSON
 * @function jsonClone
 * @param obj
 * @returns {any}
 */
export function jsonClone(obj) {
    return JSON.parse(JSON.stringify(obj), dateReviver);
}

/**
 * Escape text for regular expression
 * @see https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
 * @see https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
 * @see https://github.com/lodash/lodash/blob/master/escapeRegExp.js
 * @function escapeRegExp
 * @param str
 * @returns {*}
 */
export function escapeRegExp(str) {
    // From https://github.com/lodash/lodash/blob/master/escapeRegExp.js
    return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

/**
 * Build a random hex string of length characters
 * @function randomHexString
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
 * @function randomId
 * @returns {string}
 */
export function randomId() {
    return `id_${randomHexString(6)}`;
}

/**
 * Get a 6 char random val
 * @function randomVal
 * @returns {string}
 */
export function randomVal() {
    return `val_${randomHexString(6)}`;
}

/**
 * Rounding numbers with precision
 * @function round
 * @param value
 * @param precision
 * @return {Number}
 */
export function round(value, precision = 2) {
    const val = parseFloat(value);
    const p = Math.trunc(10 ** Math.trunc(precision));
    return Math.round(val * p) / p;
}

/**
 * Check an array or a Kendo UI ObservableArray
 * @function isAnyArray
 * @param a
 * @returns {boolean}
 */
export function isAnyArray(a) {
    // return Array.isArray(a) || a instanceof kendo.data.ObservableArray;
    return (
        typeof a === 'object' && // an array is an object
        typeof a.length === 'number' &&
        typeof a.forEach === 'function' &&
        typeof a.join === 'function' &&
        typeof a.push === 'function'
    );
}

/**
 * Compare string arrays
 * @function compareStringArrays
 * @param a
 * @param b
 * @returns {boolean}
 */
export function compareStringArrays(a, b) {
    return (
        isAnyArray(a) &&
        isAnyArray(b) &&
        a.length === b.length &&
        a.join(';') === b.join(';')
    );
}

/**
 * Gets a selection
 * @function getSelection
 * @param htmlElement
 */
export function getSelection(htmlElement) {
    assert.instanceof(
        HTMLDivElement,
        htmlElement,
        assert.format(
            assert.messages.instanceof.default,
            'htmlElement',
            'HTMLDivElement'
        )
    );
    assert.ok(
        htmlElement.childNodes.length === 1 &&
            htmlElement.childNodes[0].nodeType === 3,
        '`htmlElement` should only have on child node of type #Text'
    );
    const cursor = {};
    // document.selection && document.selection.createRange were used in IE < 9
    // All modern browsers support the HTML Selection API, but Safari does not support selection events
    // @see https://caniuse.com/#feat=selection-api
    const selection = window.getSelection();
    if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        if (range.commonAncestorContainer.parentNode === htmlElement) {
            cursor.start = range.startOffset;
            cursor.end = range.endOffset;
        }
    }
    return cursor;
}

/**
 * Sets a selection
 * @function setSelection
 * @param htmlElement
 * @param cursor
 */
export function setSelection(htmlElement, cursor) {
    assert.instanceof(
        HTMLDivElement,
        htmlElement,
        assert.format(
            assert.messages.instanceof.default,
            'htmlElement',
            'HTMLDivElement'
        )
    );
    assert.ok(
        htmlElement.childNodes.length === 1 &&
            htmlElement.childNodes[0].nodeType === 3,
        '`htmlElement` should only have on child node of type #Text'
    );
    assert.isPlainObject(
        cursor,
        assert.format(assert.messages.isPlainObject.default, 'cursor')
    );
    assert.type(
        CONSTANTS.NUMBER,
        cursor.start,
        assert.format(
            assert.messages.type.default,
            'cursor.start',
            CONSTANTS.NUMBER
        )
    );
    assert.type(
        CONSTANTS.NUMBER,
        cursor.end,
        assert.format(
            assert.messages.type.default,
            'cursor.end',
            CONSTANTS.NUMBER
        )
    );
    // document.selection && document.selection.createRange were used in IE < 9
    // All modern browsers support the HTML Selection API, but Safari does not support selection events
    // @see https://caniuse.com/#feat=selection-api
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(htmlElement.childNodes[0], cursor.start);
    range.setEnd(htmlElement.childNodes[0], cursor.end);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

/**
 * Replaces the selection with alternate text
 * @function replaceSelection
 * @param htmlElement
 * @param text
 */
export function replaceSelection(htmlElement, text) {
    assert.instanceof(
        HTMLDivElement,
        htmlElement,
        assert.format(
            assert.messages.instanceof.default,
            'htmlElement',
            'HTMLDivElement'
        )
    );
    assert.ok(
        htmlElement.childNodes.length === 1 &&
            htmlElement.childNodes[0].nodeType === 3,
        '`htmlElement` should only have one child node of type #Text'
    );
    assert.type(
        CONSTANTS.STRING,
        text,
        assert.format(assert.messages.type.default, 'text', CONSTANTS.STRING)
    );
    const selection = window.getSelection();
    const range = document.createRange();

    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}
