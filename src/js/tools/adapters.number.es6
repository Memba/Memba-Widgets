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
const VALIDATION_CUSTOM = 'function validate(value, solution, all) {\n\t{0}\n}';

// TODO add a setter for parsing function

/**
 * @class NumberAdapter
 */
const NumberAdapter = BaseAdapter.extend({
    /**
     * Constructor
     * @constructor
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.NUMBER;
        this.defaultValue = this.defaultValue || (this.nullable ? null : 0);
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes);
        this.attributes[attr('role')] = 'numerictextbox';
    },

    /**
     * Library
     */
    library: [
        {
            name: 'equal',
            // TODO: parsing raises a culture issue with 5.3 in english and 5,3 in french
            formula: format(
                VALIDATION_CUSTOM,
                'return Number(value) === Number(solution);'
            )
        },
        {
            name: 'greaterThan',
            formula: format(
                VALIDATION_CUSTOM,
                'return Number(value) > Number(solution);'
            )
        },
        {
            name: 'greaterThanOrEqual',
            formula: format(
                VALIDATION_CUSTOM,
                'return Number(value) >= Number(solution);'
            )
        },
        {
            name: 'lowerThan',
            formula: format(
                VALIDATION_CUSTOM,
                'return Number(value) < Number(solution);'
            )
        },
        {
            name: 'lowerThanOrEqual',
            formula: format(
                VALIDATION_CUSTOM,
                'return Number(value) <= Number(solution);'
            )
        }
    ],
    libraryDefault: 'equal'
});

/**
 * Default export
 */
export default NumberAdapter;
