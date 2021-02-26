/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import TOOLS from './util.constants.es6';

/**
 * Turn a property name/value into an input which can be tested
 * in data.Model validation rules
 * @function makeInput
 * @param name
 * @param value
 */
export function makeInput(name, value) {
    return $(`<${CONSTANTS.INPUT}>`).attr({ name }).val(value);
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
 * Alternate text validation
 * @const altValidator
 */
const altValidator = {
    required: true,
    // the pattern rule requires type="text" which does not fit textareas
    // pattern: TOOLS.RX_TEXT
    alt(input) {
        if (input.is('[name="attributes.alt"]')) {
            return false; // TOOLS.RX_TEXT.test(input.val());
        }
        return true;
    },
};

/**
 * Constant validation
 * @const constantValidator
 */
const constantValidator = {
    required: true,
    constant(input) {
        return !!input;
    },
};

/**
 * Question validation
 * @const questionValidator
 */
const questionValidator = {
    required: true,
    pattern: TOOLS.RX_TEXT,
};

/**
 * Score validation
 * @const scoreValidator
 */
const scoreValidator = {
    score(input) {
        return !!input;
    },
};

/**
 * Solution validation
 * @const solutionValidator
 */
const solutionValidator = {
    // TODO depends on the solution
    solution(input) {
        return !!input;
    },
};

/**
 * Style validation
 * @const styleValidator
 */
const styleValidator = {
    // required: true,
    // pattern: TOOLS.RX_STYLE
    style(input) {
        if (
            input.is('[name="attributes.style"]') ||
            input.is('[name="attributes.groupStyle"]') ||
            input.is('[name="attributes.itemStyle"]') ||
            input.is('[name="attributes.selectedStyle"]') ||
            input.is('[name="attributes.highlightStyle"]')
        ) {
            return (
                input.val() === CONSTANTS.EMPTY ||
                TOOLS.RX_STYLE.test(input.val())
            );
        }
        return true;
    },
};

/**
 * Text validation
 * @const textValidator
 */
const textValidator = {
    required: true,
    // the pattern rule requires type="text" which does not fit textareas
    // pattern: TOOLS.RX_TEXT
    text(input) {
        if (input.is('[name="attributes.text"]')) {
            return TOOLS.RX_TEXT.test(input.val());
        }
        return true;
    },
};

/**
 * Validation validator
 * @const validationValidator
 * Beware: we have a kind of a mix here between Kendo UI validation
 * and our own test validation formulas, which are both called validation
 */
const validationValidator = {
    validation(input) {
        return !!input;
    },
};

/**
 * Export
 */
export {
    altValidator,
    constantValidator,
    questionValidator,
    scoreValidator,
    solutionValidator,
    styleValidator,
    textValidator,
    validationValidator,
};
