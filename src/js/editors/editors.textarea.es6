/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getAttributeBinding } from '../data/data.util.es6';

/**
 * TextArea
 * @param container
 * @param options
 */
function textarea(container, options) {
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
    const attributes = {
        ...options.attributes,
        ...getAttributeBinding(CONSTANTS.BIND, `value: ${options.field}`)
    };
    attributes.class = attributes.class || 'k-textbox';
    return $(`<${CONSTANTS.TEXTAREA}/>`)
        .attr(attributes)
        .attr('name', options.field)
        .css({
            resize: 'vertical',
            width: '100%'
        })
        .appendTo(container);
}

/**
 * Default export
 */
export default textarea;
