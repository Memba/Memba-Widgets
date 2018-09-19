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
import BaseAdapter from './adapters.base.es6';

const { attr, format, htmlEncode, ns, ui } = window.kendo;


// TODO: This is another case of open dialog adapter

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
 * @class ValidationAdapter
 */
const ValidationAdapter = BaseAdapter.extend({
    init: function (options) {
        var that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = STRING;
        // this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        that.editor = function (container, settings) {
            var binding = {};
            // Note: _library is added to the data bound PageComponent in its init method
            binding[kendo.attr('bind')] = 'value: ' + settings.field + ', source: _library';
            // We need a wrapper because container has { display: table-cell; }
            var wrapper = $('<div/>')
            .css({ display: 'flex' })
            .appendTo(container);
            var codeInput = $('<div ' +
                'data-' + kendo.ns + 'role="codeinput" ' +
                'data-' + kendo.ns + 'default="' + settings.model.properties.defaults.validation + '" />')
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
            .on(CLICK, $.proxy(that.showDialog, that, settings));
        };
    },
    showDialog: function (options/*, e*/) {
        var that = this;
        // TODO import('./dialogs/kidoju.dialogs.codeeditor.es6').then(function () {...});
        kidoju.dialogs.openCodeEditor({
            title: options.title,
            data: {
                value: options.model.get(options.field),
                library: [CUSTOM].concat(that.library),
                defaultValue: that.defaultValue, // ????????????????????????
                solution: kendo.htmlEncode(JSON.stringify(options.model.get('properties.solution')))
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
export default ValidationAdapter;
