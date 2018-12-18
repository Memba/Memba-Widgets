/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.dropdownlist';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getValueBinding } from '../data/data.util.es6';

const { attr } = window.kendo;

/**
 * Select
 * @param container
 * @param options
 */
function select(container, options) {
    assert.isNonEmptyPlainObject(
        options,
        assert.format(assert.messages.isNonEmptyPlainObject.default, 'options')
    );
    assert.type(
        CONSTANTS.STRING,
        options.field,
        assert.format(
            assert.messages.type.default,
            'options.field',
            CONSTANTS.STRING
        )
    );
    const attributes = $.extend({}, options.attributes);
    if ($.type(attributes[attr('role')]) === CONSTANTS.UNDEFINED) {
        attributes[attr('role')] = 'dropdownlist';
    }
    if (options.source) {
        attributes[attr('source')] = JSON.stringify(options.source || {});
    }
    $('<select style="width: 100%;"/>')
        .attr('name', options.field)
        .attr($.extend(attributes, getValueBinding(options.field)))
        .appendTo(container);
}

/**
 * Default export
 */
export default select;
