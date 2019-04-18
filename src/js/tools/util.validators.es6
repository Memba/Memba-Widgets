/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import TOOLS from './util.constants.es6';

/**
 * Turn a property name/value into an input which can be tested
 * in data.Model validation rules
 * @function makeInput
 * @param prop
 * @param value
 */
export function makeInput(name, value) {
    return $(`<${CONSTANTS.INPUT}>`)
        .attr({ name })
        .val(value);
}

/*
 * Note: Validators shall comply with validation rules
 * @see https://docs.telerik.com/kendo-ui/api/javascript/data/model/methods/define
 * Accordingly, we should not use the following names to avoid collisions with built-on rules:
 * @ see https://docs.telerik.com/kendo-ui/controls/editors/validator/overview#default-validation-rules
 * @see https://github.com/telerik/kendo-ui-core/blob/master/src/kendo.validator.js#L156
 * - date
 * - dateCompare?
 * - email
 * - max
 * - min
 * - pattern
 * - required
 * - step
 * - url
 */

/**
 * Constant validation
 * @const constantValidator
 */
export const constantValidator = {
    required: true,
    constant(input) {
        // debugger;
        return true;
    }
};

/**
 * Question validation
 * @const questionValidator
 */
export const questionValidator = {
    required: true,
    pattern: TOOLS.RX_TEXT
};

/**
 * Score validation
 * @const scoreValidator
 */
export const scoreValidator = {
    score(input) {
        return true;
    }
};

/**
 * Solution validation
 * @const solutionValidator
 */
export const solutionValidator = {
    // TODO depends on the solution
    solution(input) {
        // debugger;
        return true;
    }
};

/**
 * Style validation
 * @const styleValidator
 */
export const styleValidator = {
    // required: true,
    // pattern: TOOLS.RX_STYLE
    style(input) {
        if (input.is('[name="attributes.style"]')) {
            return (
                input.val() === CONSTANTS.EMPTY ||
                TOOLS.RX_STYLE.test(input.val())
            );
        }
        return true;
    }
};

/**
 * Text validation
 * @const textValidator
 */
export const textValidator = {
    required: true,
    // the pattern rule requires type="text" which does not fit textareas
    // pattern: TOOLS.RX_TEXT
    text(input) {
        if (input.is('[name="attributes.text"]')) {
            return TOOLS.RX_TEXT.test(input.val());
        }
        return true;
    }
};

/**
 * Validation validator
 * @const validationValidator
 * Beware: we have a kind of a mix here between Kendo UI validation
 * and our own test validation formulas, which are both called validation
 */
export const validationValidator = {
    validation(input) {
        // debugger;
        return true;
    }
};
