/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

const { attr, format, htmlEncode, ns, ui } = window.kendo;

// TODO Review where to store that
const LIB_COMMENT = '// ';
const CUSTOM = {
    name: 'custom',
    // TODO 18n description
    formula: format(
        BaseAdapter.validationDeclaration,
        '// Your code should return true when value is validated against solution.'
    )
};

/**
 * ValidationAdapter
 */
export default class ValidationAdapter extends BaseAdapter {
    /**
     * Constructor
     * @constructor
     * @param options
     */
    constructor(options) {
        super(options); // TODO Supper of OBject.Assign of all
        this.type = CONSTANTS.STRING;
        // this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = function editor(container, settings) {
            const binding = {};
            // Note: _library is added to the data bound PageComponent in its init method
            binding[attr('bind')] = `value: ${
                settings.field
            }, source: _library`;
            // We need a wrapper because container has { display: table-cell; }
            const wrapper = $('<div/>')
                .css({ display: 'flex' })
                .appendTo(container);
            $(
                `<div data-${ns}role="codeinput" data-${ns}default="${
                    settings.model.properties.defaults.validation
                }" />`
            )
                .attr($.extend({}, settings.attributes, binding))
                .css({ flex: 'auto' })
                .appendTo(wrapper);
            $('<button/>')
                .text('...')
                .addClass('k-button')
                .css({
                    flex: 'none',
                    marginRight: 0
                })
                .appendTo(wrapper)
                .on(CONSTANTS.CLICK, $.proxy(this.showDialog, this, settings));
        };
    }

    /**
     * Show dialog
     * @param options
     */
    showDialog(options /* , e */) {
        const that = this;
        import('../dialogs/dialogs.codeeditor.es6').then(openCodeEditor => {
            // TODO Check that we get openCodeEditor
            openCodeEditor({
                title: options.title,
                data: {
                    value: options.model.get(options.field),
                    library: [CUSTOM].concat(that.library),
                    defaultValue: that.defaultValue, // ????????????????????????
                    solution: htmlEncode(
                        JSON.stringify(options.model.get('properties.solution'))
                    )
                }
            })
                .then(result => {
                    if (
                        result.action ===
                        ui.BaseDialog.fn.options.messages.actions.ok.action
                    ) {
                        options.model.set(options.field, result.data.value);
                    }
                })
                .fail(err => {
                    // TODO
                });
        });
    }
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.adapters = window.kidoju.adapters || {};
window.kidoju.adapters.ValidationAdapter = ValidationAdapter;