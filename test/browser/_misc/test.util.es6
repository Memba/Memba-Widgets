/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import BaseModel from '../../../src/js/data/data.base.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import base from './test.base.es6';

const {
    data: { DataSource }
} = window.kendo;
const { expect } = chai;

/**
 * Assert BaseModel
 * @param actual
 * @param expected
 */
function assertBaseModel(actual, expected) {
    expect(actual).to.be.an.instanceof(BaseModel);
    Object.keys(actual.fields).forEach(key => {
        if (
            actual[key] === null ||
            [
                CONSTANTS.BOOLEAN,
                CONSTANTS.DATE,
                CONSTANTS.NUMBER,
                CONSTANTS.STRING
            ].indexOf(actual.fields[key].type) > -1
        ) {
            expect(actual).to.have.property(key, expected[key]);
        } else if (actual[key] instanceof BaseModel) {
            assertBaseModel(actual[key], (expected || {})[key]);
        } else if (actual[key] instanceof DataSource) {
            actual[key].data().forEach((item, index) => {
                assertBaseModel(item, ((expected || {})[key] || [])[index]);
            });
        } else {
            throw new Error(`actual.${key} has an unexpected value.`);
        }
    });
}

/**
 * Return base url
 * @param path
 */
function baseUrl(path) {
    // Remove / at beginning of path
    const p = (path || '').replace(/^\/(\S+)/, '$1');
    return `${base}/${p}`;
}

/**
 * Try/catch wrapper for mocha tests
 * @param done
 * @returns {function(*): Function}
 */
function tryCatch(done) {
    return function f1(test) {
        return function f2(...args) {
            const resolve =
                typeof done.resolve === 'function' ? done.resolve : done;
            const reject =
                typeof done.reject === 'function' ? done.reject : done;
            try {
                test(...args);
                resolve();
            } catch (ex) {
                reject(ex);
            }
        };
    };
}

/**
 * Exports
 */
export {
    // ---
    assertBaseModel,
    baseUrl,
    tryCatch
};
