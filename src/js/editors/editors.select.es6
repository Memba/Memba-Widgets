/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.dropdownlist';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getAttributeBinding } from '../data/data.util.es6';

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
    const attributes = {
        ...options.attributes,
        ...getAttributeBinding(CONSTANTS.BIND, `value: ${options.field}`),
    };
    if ($.type(attributes[attr(CONSTANTS.ROLE)]) === CONSTANTS.UNDEFINED) {
        attributes[attr(CONSTANTS.ROLE)] = 'dropdownlist';
    }
    if (options.source) {
        attributes[attr('source')] = JSON.stringify(options.source || {});
    }
    return $(`<${CONSTANTS.SELECT}/>`)
        .attr(attributes)
        .attr({ name: options.field })
        .css({ width: '100%' })
        .appendTo(container);
}

/**
 * Default export
 */
export default select;
