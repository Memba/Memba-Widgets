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

// TODO make it a generic combobox adapter with a generic fill callback

/**
 * @class QuestionAdapter
 */
const QuestionAdapter = BaseAdapter.extend({
    init: function (options) {
        BaseAdapter.fn.init.call(this, options);
        this.type = STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        // this.editor = 'input';
        // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
        this.editor = function (container, settings) {
            var binding = {};
            binding[kendo.attr('bind')] = 'value: ' + settings.field;
            var input = $('<input/>')
            .css({ width: '100%' })
            .attr($.extend({}, settings.attributes, binding))
            .appendTo(container);
            input.kendoComboBox({
                autoWidth: true,
                // dataSource: { data: [] }, // We need a non-empty dataSource otherwise open is not triggered
                /**
                 * Fill the drop down list when opening the popup (always up-to-date when adding/removing connectors)
                 * @param e
                 */
                open: function (e) {
                    var texts = [];
                    // find the design (mode) stage, avoiding navigation
                    var stage = $('[' + kendo.attr('role') + '="stage"][' + kendo.attr('mode') + '="design"]');
                    // find all labels
                    var labels = stage.find('.kj-element[' + kendo.attr('tool') + '="label"]>div');
                    labels.each(function (index, label) {
                        var text = $(label).html().replace(/<br\/?>/g, ' ');
                        if ($.type(text) === STRING && text.length) {
                            texts.push(text);
                        }
                    });
                    texts.sort();
                    e.sender.setDataSource(texts);
                }
            });
        };
    }
});

/**
 * Default export
 */
export default QuestionAdapter;
