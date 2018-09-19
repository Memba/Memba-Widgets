/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

const { format } = window.kendo;

/**
 * @class StyleAdapter
 */
const StyleAdapter = BaseAdapter.extend({
    init: function (options) {
        var that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = STRING;
        that.defaultValue = that.defaultValue || (that.nullable ? null : '');
        // This is the inline editor with a [...] button which triggers this.showDialog
        that.editor = function (container, settings) {
            var binding = {};
            binding[kendo.attr('bind')] = 'value: ' + settings.field;
            // We need a wrapper because container has { display: table-cell; }
            var wrapper = $('<div/>')
            .css({ display: 'flex' })
            .appendTo(container);
            var input = $('<input/>')
            .addClass('k-textbox')
            .css({
                flex: 'auto',
                width: '100%' // 'auto' seems to imply a min-width
            })
            .prop({ readonly: true })
            .attr($.extend({}, settings.attributes, binding))
            .appendTo(wrapper);
            $('<button/>')
            .text('...')
            .addClass('k-button')
            .css({
                flex: 'none',
                marginRight: 0
            })
            .appendTo(wrapper)
            .on(CLICK, $.proxy(that.showDialog, that, settings));
        };
    },
    showDialog: function (options/*, e*/) {
        // TODO wrap in import('./dialogs/kidoju.dialogs.styleedtor.es6').then(function () {...});
        kidoju.dialogs.openStyleEditor({
            title: options.title,
            data: {
                value: options.model.get(options.field)
            }
        })
        .then(function (result) {
            if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action) {
                options.model.set(options.field, result.data.value);
            }
        })
        .fail(function (err) {
            // TODO
        });
    }
});

/**
 * Default export
 */
export default StyleAdapter;
