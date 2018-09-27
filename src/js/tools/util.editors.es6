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

const { attr, template } = window.kendo;

/**
 * Returns a Kendo UI value data binding
 * @param field
 */
function getValueBinding(field) {
    const binding = {};
    if ($.type(field) === CONSTANTS.STRING && field.length) {
        binding[attr('bind')] = `value: ${field}`;
    }
    return binding;
}

/**
 * Returns a Kendo UI text data binding
 * @param field
 */
function getTextBinding(field) {
    const binding = {};
    if ($.type(field) === CONSTANTS.STRING && field.length) {
        binding[attr('bind')] = `text: ${field}`;
    }
    return binding;
}

/**
 * Standard editors
 */
const editors = {
    /**
     * Input
     * @param container
     * @param options
     */
    input(container, options) {
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
        const { attributes } = options;
        if (
            attributes &&
            $.type(attributes[attr('role')]) === CONSTANTS.UNDEFINED
        ) {
            if (
                [undefined, 'text', 'email', 'search', 'tel', 'url'].indexOf(
                    attributes.type
                ) > -1
            ) {
                attributes.class =
                    $.type(attributes.class) === CONSTANTS.STRING
                        ? attributes.class
                        : 'k-textbox';
            } else if (['button', 'reset'].indexOf(attributes.type) > -1) {
                attributes.class =
                    $.type(attributes.class) === CONSTANTS.STRING
                        ? attributes.class
                        : 'k-button';
            }
        }
        $('<input style="width: 100%;"/>')
            .attr('name', options.field)
            .attr($.extend({}, attributes, getValueBinding(options.field)))
            .appendTo(container);
    },

    /**
     * Span
     * @param container
     * @param options
     */
    span(container, options) {
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
            .attr(
                $.extend({}, options.attributes, getTextBinding(options.field))
            )
            .appendTo(container);
    },

    /**
     * template
     * @param container
     * @param options
     * @private
     */
    template(container, options) {
        assert.isPlainObject(
            options,
            assert.format(assert.messages.isPlainObject.default, 'options')
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
        const tmpl = template(options.template);
        $(tmpl(options)).appendTo(container);
    },

    /**
     * TextArea
     * @param container
     * @param options
     */
    textarea(container, options) {
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
        $(
            '<textarea class="k-textbox" style="width: 100%; resize: vertical;"/>'
        )
            .attr('name', options.field)
            .attr(
                $.extend({}, options.attributes, getValueBinding(options.field))
            )
            .appendTo(container);
    }
};

/**
 * Default export
 */
export default editors;
