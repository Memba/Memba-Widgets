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
 * @class DateAdapter
 */
const DateAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = DATE;
        this.defaultValue = this.defaultValue || (this.nullable ? null : new Date());
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes);
        this.attributes[kendo.attr('role')] = 'datepicker';
    },
    library: [
        {
            name: 'equal',
            // TODO: parsing raises a culture issue with MM/DD/YYYY in english and DD/MM/YYYY in french
            // Note: new Date(1994,1,1) !== new Date(1994,1,1) as they are two different objects
            formula: kendo.format(VALIDATION_CUSTOM, 'return new Date(value) - new Date(solution) === 0;')
        }
    ],
    libraryDefault: 'equal'
});

/**
 * Default export
 */
export default DateAdapter;
