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

// TODO: We need a way to redirect to propertygrid

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
