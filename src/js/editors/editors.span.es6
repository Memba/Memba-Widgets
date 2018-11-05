/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getTextBinding } from '../data/data.util.es6';

/**
 * Span
 * @param container
 * @param options
 */
function span(container, options) {
    assert.isPlainObject(
        options,
        assert.format(assert.messages.isPlainObject.default, 'options')
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
    $('<span/>')
        .attr($.extend({}, options.attributes, getTextBinding(options.field)))
        .appendTo(container);
}

/**
 * Default export
 */
export default span;
