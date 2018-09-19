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

// TODO: there is a refresh problem

/**
 * @class HighLighterAdapter
 */
const HighLighterAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        var that = this;
        BaseAdapter.fn.init.call(this, options);
        this.type = STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        // TODO: Not Disabled when setting teh Disabled switch
        // And not reset when changing teh value of split => might require a window like chargrid
        this.editor = function (container, settings) {
            var binding = {};
            binding[kendo.attr('bind')] = 'value: ' + settings.field;
            var highLighter = $('<div/>')
            .css({
                width: '100%',
                fontSize: '1em',
                minHeight: '4.6em'
            })
            .attr($.extend(binding, attributes))
            .appendTo(container);
            var highLighterWidget = highLighter.kendoHighLighter({
                text: settings.model.get('attributes.text'),
                split: settings.model.get('attributes.split')
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
export default HighLighterAdapter;
