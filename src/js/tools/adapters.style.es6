/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import { getValueBinding } from '../data/data.util.es6';
import openStyleEditor from '../dialogs/dialogs.styleeditor.es6';
import '../dialogs/widgets.basedialog.es6';
import BaseAdapter from './adapters.base.es6';

const {
    ui: { BaseDialog }
} = window.kendo;

/**
 * StyleAdapter
 * @class StyleAdapter
 * @extends BaseAdapter
 */
const StyleAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        const that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = CONSTANTS.STRING;
        that.defaultValue = that.defaultValue || (that.nullable ? null : '');
        // This is the inline editor with a [...] button which triggers this.showDialog
        that.editor = function(container, settings) {
            // We need a wrapper because container has { display: table-cell; }
            const wrapper = $('<div/>')
                .css({ display: 'flex' })
                .appendTo(container);
            $('<input/>')
                .addClass('k-textbox')
                .css({
                    flex: 'auto',
                    width: '100%' // 'auto' seems to imply a min-width
                })
                .prop({ readonly: true })
                .attr(
                    $.extend(
                        {},
                        settings.attributes,
                        getValueBinding(settings.field)
                    )
                )
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
    showDialog(options /* , e */) {
        // TODO wrap in import('./dialogs/dialogs.styleedtor.es6').then(function () {...});
        openStyleEditor({
            title: options.title,
            data: {
                value: options.model.get(options.field)
            }
        })
            .then(result => {
                if (
                    result.action ===
                    BaseDialog.fn.options.messages.actions.ok.action
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
export default StyleAdapter;
