/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import pako from '../vendor/nodeca/pako_deflate';
import assert from './window.assert.es6';
import CONSTANTS from './window.constants.es6';

/**
 * Preload an image
 * @method preload
 * @param url
 */
export function preload(url) {
    assert.type(
        CONSTANTS.STRING,
        'url',
        assert.format(assert.messages.type.default, 'url', CONSTANTS.STRING)
    );
    const dfd = $.Deferred();
    $('<img>')
        .attr('src', window.encodeURI(url))
        .on(CONSTANTS.LOAD, dfd.resolve)
        .on(CONSTANTS.ERROR, dfd.reject);
    return dfd.promise();
}

/**
 * inflate (delegated to pako)
 * @param data
 * @returns {*}
 */
export function inflate(data) {
    return pako.inflate(data);
}
