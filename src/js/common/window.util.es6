/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO consider replacer and reviver for RegExp - see https://stackoverflow.com/questions/12075927/serialization-of-regexp

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
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
 * Check an array or a Kendo UI ObservableArray
 * @function isAnyArray
 * @param a
 * @returns {boolean}
 */
export function isAnyArray(a) {
    // return Array.isArray(a) || a instanceof kendo.data.ObservableArray;
    return (
        typeof a === 'object' && // an array is an object
        a !== null && // because null is an object
        // Symbol.iterator in Object(a) && // not supported in old browsers including IE
        typeof a.length === 'number' &&
        typeof a.forEach === 'function' &&
        typeof a.join === 'function' &&
        typeof a.push === 'function'
    );
}

/**
 * Compare basic type arrays
 * @function compareBasicArrays
 * @param a
 * @param b
 * @returns {boolean}
 */
export function compareBasicArrays(a, b) {
    let ret = false;
    if (isAnyArray(a) && isAnyArray(b) && a.length === b.length) {
        ret = true;
        for (let i = 0, { length } = a; i < length; i++) {
            if (a[i] !== b[i]) {
                ret = false;
                break;
            }
        }
    }
    return ret;
}

/**
 * getLocation
 * @function getLocation
 * @see https://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
 * @param url
 */
export function getLocation(url) {
    const location = document.createElement(CONSTANTS.A);
    location.href = url;
    // IE doesn't populate all link properties when setting .href with a relative URL,
    // however .href will return an absolute URL which then can be used on itself
    // to populate these additional fields.
    if (location.host === '') {
        // eslint-disable-next-line no-self-assign
        location.href = location.href;
    }
    return {
        // @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils
        href: location.href,
        protocol: location.protocol,
        host: location.host,
        hostname: location.hostname,
        port: location.port,
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        username: location.username ? location.username : undefined,
        password: location.password ? location.password : undefined,
        origin: location.origin,
    };
}

/**
 * isGuid
 * @function isGuid
 * @param value
 * @returns {boolean}
 */
export function isGuid(value) {
    // http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
    return (
        // $.type(value) === CONSTANTS.STRING &&
        CONSTANTS.RX_GUID.test(value)
    );
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
 * Get a random pastel color to draw connections
 * @returns {string}
 */
export function randomColor() {
    const r = (Math.round(Math.random() * 127) + 127).toString(16);
    const g = (Math.round(Math.random() * 127) + 127).toString(16);
    const b = (Math.round(Math.random() * 127) + 127).toString(16);
    return `#${r}${g}${b}`;
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
 * Fisher-Yates shuffle
 * @see https://bost.ocks.org/mike/shuffle/
 * @param array
 * @returns {*}
 */
export function shuffle(array) {
    let m = array.length;
    let t;
    let i;

    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        // eslint-disable-next-line no-plusplus
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        // eslint-disable-next-line no-param-reassign
        array[m] = array[i];
        // eslint-disable-next-line no-param-reassign
        array[i] = t;
    }

    return array;
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
    assert.isNonEmptyPlainObject(
        cursor,
        assert.format(assert.messages.isNonEmptyPlainObject.default, 'cursor')
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
