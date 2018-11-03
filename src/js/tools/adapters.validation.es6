/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { getValueBinding } from '../data/data.util.es6';
import openCodeEditor from '../dialogs/dialogs.codeeditor.es6';
import '../widgets/widgets.codeinput.es6';
import BaseAdapter from './adapters.base.es6';

const { attr, format, htmlEncode, ns, ui } = window.kendo;

// TODO: This is another case of open dialog adapter

// TODO Review where to store that
const VALIDATION_CUSTOM = 'function validate(value, solution, all) {\n\t{0}\n}';
// const LIB_COMMENT = '// ';
const CUSTOM = {
    name: 'custom', // TODO i18n
    formula: format(
        VALIDATION_CUSTOM, // BaseAdapter.validationDeclaration,
        '// Your code should return true when value is validated against solution.'
    )
};

/**
 * ValidationAdapter
 * @class ValidationAdapter
 * @extends BaseAdapter
 */
const ValidationAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options /* , attributes */) {
        const that = this;
        BaseAdapter.fn.init.call(that, options);
        // TODO Assert library
        that.type = CONSTANTS.STRING;
        // this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        that.editor = function(container, settings) {
            const binding = {}; // TODO use getValueBinding
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
                .attr($.extend({}, settings.attributes, binding)) // TODO use attributes (from init)?
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
                .on(CONSTANTS.CLICK, $.proxy(that.showDialog, that, settings));
        };
    },

    /**
     * Show dialog
     * @param options
     */
    showDialog(options /* , e */) {
        const that = this;
        // TODO import('./dialogs/dialogs.codeeditor.es6').then(function () {...});
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
            .catch(err => {
                // TODO
            });
    }
});

/**
 * Default export
 */
export default ValidationAdapter;
