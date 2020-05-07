/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import 'kendo.data';
import chai from 'chai';
import BaseModel from '../../../src/js/data/data.base.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';

const {
    attr,
    data: { DataSource },
    toHyphens,
} = window.kendo;
const { expect } = chai;

/**
 * Assert BaseModel
 * @param actual
 * @param expected
 */
function assertBaseModel(actual, expected) {
    expect(actual).to.be.an.instanceof(BaseModel);
    Object.keys(actual.fields).forEach((key) => {
        if (
            actual[key] === null ||
            [
                CONSTANTS.BOOLEAN,
                CONSTANTS.DATE,
                CONSTANTS.NUMBER,
                CONSTANTS.STRING,
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
 * Return a stage element to add to test fixturees
 * height and width apply to teh .kj-element
 * scale
 * @param height
 * @param width
 * @param scale
 */
function getStageElement(height = 50, width = 50, scale = 0.75) {
    // noinspection CssInvalidPropertyValue
    return `<div class="k-widget kj-stage" style="position: relative; height: 480px; width: 640px; transform:scale(${scale});"><div data-role="stage" style="height: 480px; width: 640px;"><div class="kj-element" style="position: absolute; top: 50px; left: 50px; height: ${height}px; width: ${width}px;"></div></div></div>`;
}

/**
 * Converts options into data-* attributes
 * @param options
 */
function options2attributes(options = {}) {
    const attributes = {};
    Object.keys(options).forEach((key) => {
        attributes[attr(toHyphens(key))] = options[key];
    });
    return attributes;
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
export { assertBaseModel, getStageElement, options2attributes, tryCatch };
