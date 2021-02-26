/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO: Consider validation of validation

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import { getAttributeBinding } from '../data/data.util.es6';
import openCodeEditor from '../dialogs/dialogs.codeeditor.es6';
import '../widgets/widgets.codeinput.es6';
import BaseAdapter from './adapters.base.es6';
import { CUSTOM } from './util.libraries.es6';

const { getter, ns, ui } = window.kendo;

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
        BaseAdapter.fn.init.call(this, options);
        this.library = (options || {}).library; // For showDialog
        this.type = CONSTANTS.STRING;
        // this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = (container, settings) => {
            const { field, model } = settings;
            // Add library to model for MVVM bindings
            model._library = this.library;
            // Add click event
            model._onClick = this.showDialog.bind(this, settings);
            // Add code input
            $(`<div data-${ns}role="codeinput"/>`)
                .attr({
                    name: settings.field,
                    ...settings.attributes,
                    ...getAttributeBinding(
                        CONSTANTS.BIND,
                        `value: ${field}, source: _library, events: { click: _onClick }`
                    ),
                    ...attributes,
                })
                .appendTo(container);
        };
    },

    /**
     * Show dialog
     * @param options
     */
    showDialog(options = {} /* , evt */) {
        openCodeEditor({
            title: options.title || this.title,
            data: {
                // Note: we need to clone PageComponent not to modify the original one
                // value: options.model.get(options.field),
                value: new PageComponent(options.model.toJSON()),
                library: [CUSTOM].concat(this.library),
            },
        })
            .then((result) => {
                if (
                    result.action ===
                    ui.BaseDialog.fn.options.messages.actions.ok.action
                ) {
                    options.model.set(
                        options.field,
                        getter(options.field)(result.data.value)
                    );
                }
            })
            .catch($.noop); // TODO error management
    },
});

/**
 * Default export
 */
export default ValidationAdapter;
