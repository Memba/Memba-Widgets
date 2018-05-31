/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */
import $ from 'jquery';
import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';

const MACHINE_POS = 8;
const MACHINE_ID = '000000';

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
 * Get a random id
 * @returns {string}
 */
export function randomId() {
    return `id_${randomHexString(6)}`;
}

/**
 * ObjectId
 * @class
 */
export class ObjectId {
    constructor(id) {
        if ($.type(id) !== CONSTANTS.UNDEFINED) {
            assert.match(
                CONSTANTS.RX_MONGODB_ID,
                id,
                '`id` is expected to be an hexadecimal string with a length of 24 characters or undefined'
            );
            this._id = id;
        } else {
            // Note: we are not using a processID, so random ID is 10 bytes instead of 6 bytes
            this._id =
                ((new Date().getTime() / 1000) | 0).toString(16) + // eslint-disable-line no-bitwise
                MACHINE_ID +
                randomHexString(10);
        }
    }
    equals(objId) {
        // Note consider checking constructor
        return (
            $.type(objId) === CONSTANTS.OBJECT &&
            objId.constructor === ObjectId &&
            this._id === objId._id
        );
    }
    getTimestamp() {
        return new Date(1000 * parseInt(this._id.substr(0, MACHINE_POS), 16));
    }
    isMobileId() {
        return this._id.substr(MACHINE_POS, MACHINE_ID.length) === MACHINE_ID;
    }
    // eslint-disable-next-line class-methods-use-this
    toMobileId() {
        throw new Error('Not yet implemented, see window.pongodb');
    }
    toString() {
        return this._id;
    }
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.util = window.kidoju.util || {};
window.kidoju.util.escapeRegExp = escapeRegExp;
window.kidoju.util.ObjectId = ObjectId;
window.kidoju.util.randomId = randomId;
window.kidoju.util.randomString = randomHexString;
