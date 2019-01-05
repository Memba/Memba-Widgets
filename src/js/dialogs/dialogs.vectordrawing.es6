/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.window';
// import CONSTANTS from '../common/window.constants.es6';

/*
const {
    // guid,
    // ns,
    // resize,
    ui: { Window }
} = window.kendo;
*/

/**
 * A shortcut function to display a window with vector drawing
 * @param options
 * @returns {*}
 */
export default function openVectorDrawing(options = {}) {
    const dfd = $.Deferred();
    // TODO
    $.noop(options);
    return dfd.promise();
}
