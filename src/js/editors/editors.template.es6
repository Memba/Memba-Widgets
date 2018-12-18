/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';

const { kendo } = window;

/**
 * template
 * @param container
 * @param options
 * @private
 */
function template(container, options) {
    assert.isNonEmptyPlainObject(
        options,
        assert.format(assert.messages.isNonEmptyPlainObject.default, 'options')
    );
    assert.type(
        CONSTANTS.STRING,
        options.template,
        assert.format(
            assert.messages.type.default,
            'options.template',
            CONSTANTS.STRING
        )
    );
    const tmpl = kendo.template(options.template);
    $(tmpl(options)).appendTo(container);
}

/**
 * Default export
 */
export default template;
