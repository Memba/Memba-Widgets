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

// TODO it is in fact an adapters.textarea
// TODO try to make an adapter by type of widget instead of type of data and add the necessary options

// Especially the library algorithms depend on the data, not the widget
// which makes it difficult to reuse adapters across data

/**
 * @class TextAdapter (multiline)
 */
const TextAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = 'textarea';
        this.attributes = $.extend({}, this.attributes, attributes);
    },
    library: [
        {
            name: 'equal',
            formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')
        },
        {
            name: 'ignoreSpacesEqual',
            formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).replace(/\\s+/g, " ").trim() === String(solution).replace(/\\s+/g, " ").trim();')
        },
        {
            name: 'ignorePunctuationEqual',
            formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim() === String(solution).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim();')
        }
    ],
    libraryDefault: 'equal'
});

/**
 * Default export
 */
export default TextAdapter;
