/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
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
import { CUSTOM } from './util.libraries.es6';

const { htmlEncode, ns, ui } = window.kendo;

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
    init(options, attributes) {
        const that = this;
        BaseAdapter.fn.init.call(that, options);
        that.library = (options || {}).library; // For showDialog
        that.type = CONSTANTS.STRING;
        // this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        that.editor = (container, settings) => {
            const { field, model } = settings;
            // Add library to model for MVVM bindings
            model._library = that.library;
            // Add code input
            // We need a wrapper because container has { display: table-cell; }
            const wrapper = $(`<${CONSTANTS.DIV}/>`)
                .css({ display: 'flex', alignItems: 'center' })
                .appendTo(container);
            $(
                `<div data-${ns}role="codeinput" data-${ns}default="${model.properties.defaults.validation}" />`
            )
                .attr(
                    $.extend(
                        true,
                        {},
                        settings.attributes,
                        getValueBinding(field, '_library'),
                        attributes
                    )
                )
                .css({ flex: 'auto' })
                .appendTo(wrapper);
            // Add button to open code editor
            $(`<${CONSTANTS.BUTTON}/>`)
                .text(CONSTANTS.ELLIPSIS)
                .addClass('k-button')
                .css({
                    alignSelf: 'stretch',
                    flex: 'none',
                    marginBottom: 0,
                    marginRight: 0,
                    marginTop: 0
                })
                .appendTo(wrapper)
                .on(CONSTANTS.CLICK, that.showDialog.bind(that, settings));
        };
    },

    /**
     * Show dialog
     * @param options
     */
    showDialog(options = {} /* , evt */) {
        const that = this;
        openCodeEditor({
            title: options.title || this.title,
            // defaultValue: that.defaultValue,
            default: that.defaultValue,
            solution: htmlEncode(
                JSON.stringify(options.model.get('properties.solution'))
            ),
            data: {
                value: options.model.get(options.field),
                library: [CUSTOM].concat(that.library)
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
            .catch($.noop); // TODO error management
    }
});

/**
 * Default export
 */
export default ValidationAdapter;
