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
import BaseAdapter from './adapters.base.es6';

// TODO: there is a refresh problem

const { attr, format } = window.kendo;
const VALIDATION_CUSTOM = 'function validate(value, solution, all) {\n\t{0}\n}'; // TODO remove

/**
 * HighLighterAdapter
 * @class HighLighterAdapter
 * @extends BaseAdapter
 */
const HighLighterAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        const that = this;
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        // TODO: Not Disabled when setting teh Disabled switch
        // And not reset when changing teh value of split => might require a window like chargrid
        this.editor = function(container, settings) {
            const highLighter = $('<div/>')
                .css({
                    width: '100%',
                    fontSize: '1em',
                    minHeight: '4.6em'
                })
                // .attr($.extend(binding, attributes))
                .attr($.extend({}, settings.attributes, getValueBinding(settings.field)))
                .appendTo(container);
            const highLighterWidget = highLighter.kendoHighLighter({
                text: settings.model.get('attributes.text'),
                split: settings.model.get('attributes.split')
            });
        };
    }
});

/**
 * Default export
 */
export default HighLighterAdapter;
