/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import CONSTANTS from './window.constants.es6';
import { randomHexString } from './window.util.es6';

const MACHINE_POS = 8;
const MACHINE_ID = '000000';

/**
 * Make a 24-bit MongoDB id
 */
function makeId() {
    return (
        ((new Date().getTime() / 1000) | 0).toString(16) + // eslint-disable-line no-bitwise
        MACHINE_ID +
        randomHexString(10)
    );
}

/**
 * ObjectId
 * @class
 */
export default class ObjectId {
    /**
     * Constructor
     * @constructor
     * @param id
     */
    constructor(id) {
        // eslint-disable-next-line valid-typeof
        if (typeof id === CONSTANTS.UNDEFINED) {
            this._id = makeId();
        } else if (CONSTANTS.RX_MONGODB_ID.test(id)) {
            this._id = id;
        } else {
            throw new TypeError(
                '`id` is expected to be an hexadecimal string with a length of 24 characters or undefined'
            );
        }
    }

    /**
     * Equals
     * @param objId
     * @returns {boolean}
     */
    equals(objId) {
        return (
            // eslint-disable-next-line valid-typeof
            typeof objId === CONSTANTS.OBJECT &&
            objId.constructor === ObjectId &&
            this._id === objId._id
        );
    }

    /**
     * getTimestamp
     * @returns {Date}
     */
    getTimestamp() {
        return new Date(1000 * parseInt(this._id.substr(0, MACHINE_POS), 16));
    }

    /**
     * isMobileId
     * @returns {boolean}
     */
    isMobileId() {
        return this._id.substr(MACHINE_POS, MACHINE_ID.length) === MACHINE_ID;
    }

    /**
     * toMobileId
     * @returns {string}
     */
    toMobileId() {
        return new ObjectId(
            this._id.substr(0, MACHINE_POS) +
                MACHINE_ID +
                this._id.substr(MACHINE_POS + MACHINE_ID.length)
        );
    }

    /**
     * toString
     * @returns {*}
     */
    toString() {
        return this._id;
    }
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.util = window.kidoju.util || {};
window.kidoju.util.ObjectId = ObjectId;

window.pongodb = window.pongodb || {};
window.pongodb.ObjectId = ObjectId;
