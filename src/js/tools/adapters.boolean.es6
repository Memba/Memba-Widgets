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

const { attr, format } = window.kendo;
const VALIDATION_CUSTOM = 'function validate(value, solution, all) {\n\t{0}\n}'; // TODO remove

/**
 * @class BooleanAdapter
 */
const BooleanAdapter = BaseAdapter.extend({
    /**
     * Constructor
     * @constructor
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.BOOLEAN;
        this.defaultValue = this.defaultValue || (this.nullable ? null : false);
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes);
        this.attributes[attr('role')] = 'switch';
    },
    library: [
        {
            name: 'equal',
            formula: format(
                VALIDATION_CUSTOM,
                'return String(value).toLowerCase() === String(solution).toLowerCase();'
            )
        }
    ],
    libraryDefault: 'equal'
});

/**
 * Default export
 */
export default BooleanAdapter;
