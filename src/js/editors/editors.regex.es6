/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO use https://github.com/garysieling/jquery-highlighttextarea or https://markjs.io/
// TODO use https://github.com/davisjam/safe-regex/releases

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getAttributeBinding } from '../data/data.util.es6';
// import '../experiments/widgets.regex.es6';

/**
 * regex
 * @param container
 * @param options
 */
function regex(container, options) {
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
    attributes.class = attributes.class || 'k-textbox';
    return $(`<${CONSTANTS.INPUT}/>`)
        .attr(attributes)
        .attr({ name: options.field })
        .css({ width: '100%' })
        .appendTo(container);
}

/**
 * Default export
 */
export default regex;
