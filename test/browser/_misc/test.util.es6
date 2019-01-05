/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import BaseModel from '../../../src/js/data/data.base.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';

const { __karma__, location } = window;
const {
    data: { DataSource }
} = window.kendo;
const { expect } = chai;

/**
 * Base directory for Karma path
 * @type {string}
 */
/* eslint-disable prettier/prettier */
export const base = __karma__
    ? 'base'
    : `${location.protocol}//${location.host}${
        /^\/Kidoju.Widgets\//.test(location.pathname) ? '/Kidoju.Widgets' : ''
    }`;
/* eslint-enable prettier/prettier */

/**
 * Try/catch wrapper for mocha tests
 * @param done
 * @returns {function(*): Function}
 */
export function tryCatch(done) {
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
 * Assert BaseModel
 * @param actual
 * @param expected
 */
export function assertBaseModel(actual, expected) {
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
