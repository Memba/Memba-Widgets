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
import { getValueBinding } from '../data/data.util.es6';
import '../widgets/widgets.basiclist.es6';

const { attr } = window.kendo;

/**
 * basiclist
 * @param container
 * @param options
 */
function basiclist(container, options) {
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
    const attributes = getValueBinding(options.field);
    attributes[attr('role')] = 'basiclist';
    attributes[attr('type')] = options.type;
    if (
        $.isPlainObject(options.attributes) &&
        !$.isEmptyObject(options.attributes)
    ) {
        attributes[attr('attributes')] = JSON.stringify(options.attributes);
    }
    return $(`<${CONSTANTS.DIV}/>`)
        .attr('name', options.field)
        .attr(attributes)
        .css({ width: '100%' })
        .appendTo(container);
}

/**
 * Default export
 */
export default basiclist;
