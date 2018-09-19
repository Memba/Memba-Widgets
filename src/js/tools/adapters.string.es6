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
 * @class StringAdapter
 */
const StringAdapter = BaseAdapter.extend({
    /**
     * Constructor
     * @constructor
     * @param options
     * @param attributes
     */
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes, { type: 'text', class: 'k-textbox' });
    },

    /**
     * Library
     */
    library: [
        {
            name: 'equal',
            formula: format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')
        },
        {
            name: 'ignoreCaseEqual',
            formula: format(VALIDATION_CUSTOM, 'return String(value).trim().toUpperCase() === String(solution).trim().toUpperCase();')
        },
        {
            name: 'ignoreCaseMatch',
            // Do not use RegExp constructor because escaping backslashes is a nightmare
            formula: format(VALIDATION_CUSTOM, 'return /{0}/i.test(String(value).trim());'),
            param: 'Regular Expression'
        },
        {
            name: 'ignoreDiacriticsEqual',
            formula: format(VALIDATION_CUSTOM, 'return removeDiacritics(String(value).trim().toUpperCase()) === removeDiacritics(String(solution).trim().toUpperCase());')
        },
        {
            name: 'match',
            // Do not use RegExp constructor because escaping backslashes is a nightmare
            formula: format(VALIDATION_CUSTOM, 'return /{0}/.test(String(value).trim());'),
            param: 'Regular Expression'
        },
        {
            name: 'metaphone',
            formula: format(VALIDATION_CUSTOM, 'return metaphone(removeDiacritics(String(value).trim().toUpperCase())) === metaphone(removeDiacritics(String(solution).trim().toUpperCase()));')
        },
        {
            name: 'soundex',
            formula: format(VALIDATION_CUSTOM, 'return soundex(removeDiacritics(String(value).trim().toUpperCase())) === soundex(removeDiacritics(String(solution).trim().toUpperCase()));')
        }
    ],
    libraryDefault: 'equal'
});

/**
 * Default export
 */
export default StringAdapter;
