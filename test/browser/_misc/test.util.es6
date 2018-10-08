/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import BaseModel from '../../../src/js/data/models.base.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';

const { expect } = chai;

/**
 * Try/catch wrapper
 * @param done
 * @returns {function(*): Function}
 */
export function tryCatch(done) {
    return function f1(test) {
        return function f2(...args) {
            try {
                test(...args);
                done();
            } catch (ex) {
                done(ex);
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
        } else {
            throw new Error(`actual.${key} has an unexpected value.`);
        }
    });
}
