/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';

const { getter } = window.kendo;
const RX_STYLE = /^(([\w-]+)\s*:([^;<>]+);\s*)+$/i;

// TODO: We need a way to redirect to propertygrid when clicking messages in console
// TODO Check how validation works with kendo ui validators in property grid

/**
 * Score validation
 * @param component
 * @param pageIdx
 */
export function validateScores(component, pageIdx) {
    const ret = [];
    const { properties } = component;
    if (
        $.type(properties.failure) === CONSTANTS.NUMBER &&
        $.type(properties.omit) === CONSTANTS.NUMBER &&
        properties.failure > Math.min(properties.omit, 0)
    ) {
        ret.push({
            type: CONSTANTS.WARNING,
            index: pageIdx,
            message: format(
                messages.invalidFailure,
                description,
                name,
                pageIdx + 1
            )
        });
    }
    if (
        $.type(properties.success) === CONSTANTS.NUMBER &&
        $.type(properties.omit) === CONSTANTS.NUMBER &&
        properties.success < Math.max(properties.omit, 0)
    ) {
        ret.push({
            type: CONSTANTS.WARNING,
            index: pageIdx,
            message: format(
                messages.invalidSuccess,
                description,
                name,
                pageIdx + 1
            )
        });
    }
}

/**
 * Style validation
 * @param component
 * @param key
 * @param pageIdx
 */
export function validateStyle(component, key, pageIdx) {
    const value = getter(component, key, true);
    if (!RX_STYLE.test(value)) {
        return {

        }
    }
}

/**
 * Text validation
 * @param component
 * @param key
 * @param pageIdx
 */
export function validateText(component, key, pageIdx) {

}
