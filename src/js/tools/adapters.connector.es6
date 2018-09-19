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

/**
 * @class ConnectorAdapter
 */
const ConnectorAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
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
                // dataSource: { data: [''] }, // We need a non-empty dataSource otherwise open is not triggered
                /**
                 * Fill the drop down list when opening the popup (always up-to-date when adding/removing connectors)
                 * @param e
                 */
                open: function (e) {
                    var solutions = [];
                    // find the design (mode) stage, avoiding navigation
                    var stage = $('[' + kendo.attr('role') + '="stage"][' + kendo.attr('mode') + '="design"]');
                    // find the handle box and the selected uid which should be a connector
                    var handleBox = stage.parent().children('.kj-handle-box');
                    var uid = handleBox.attr(kendo.attr('uid'));
                    // find all unselected connectors
                    assert.instanceof (PageComponent, settings.model, assert.format(assert.messages.instanceof.default, 'settings.model', 'kidoju.data.PageModel'));
                    if (settings.model.parent() instanceof kendo.Observable && settings.model.parent().selectedPage instanceof Page) {
                        var components = settings.model.parent().selectedPage.components;
                        $.each(components.data(), function (index, component) {
                            if (component.tool === 'connector' && component.uid !== uid) {
                                var solution = component.get(settings.field);
                                if ($.type(solution) === STRING && solution.length && solutions.indexOf(solution) === -1) {
                                    solutions.push(solution);
                                }
                            }
                        });
                        solutions.sort();
                    }
                    e.sender.setDataSource(solutions);
                }
            });
        };
    },
    library: [
        {
            name: 'equal',
            formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')
        }
    ],
    libraryDefault: 'equal'
});

/**
 * Default export
 */
export default ConnectorAdapter;
