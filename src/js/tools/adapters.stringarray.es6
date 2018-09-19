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
 * @class StringArrayAdapter
 */
const StringArrayAdapter = BaseAdapter.extend({
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
            // formula: kendo.format(VALIDATION_CUSTOM, 'return String(value.sort()) === String(solution.trim().split("\\n").sort());')
            // With the formula here above, each string in the array cannot be trimmed properly
            // because String(arr) is the same as join(',') and each value might contain commas
            // So we use }-{ because there is little chance any value would contain this sequence
            formula: kendo.format(VALIDATION_CUSTOM, '// Note: value is an array and solution is a multiline string\n\t' +
                'return (value || []).sort().join("}-{").trim().replace(/\\s*}-{\\s*/g, "}-{") === String(solution).trim().split("\\n").sort().join("}-{").replace(/\\s*}-{\\s*/g, "}-{");')
        },
        {
            name: 'ignoreCaseEqual',
            formula: kendo.format(VALIDATION_CUSTOM, '// Note: value is an array and solution is a multiline string\n\t' +
                'return (value || []).sort().join("}-{").trim().replace(/\\s*}-{\\s*/g, "}-{").toLowerCase() === String(solution).trim().split("\\n").sort().join("}-{").replace(/\\s*}-{\\s*/g, "}-{").toLowerCase();')
        },
        {
            name: 'sumEqual',
            formula: kendo.format(VALIDATION_CUSTOM, '// Note: value is an array and solution is a multiline string\n\t' +
                'var ret = 0;\t' +
                '(value || []).forEach(function(val){ ret += parseFloat((val || "").trim() || 0); });\t' +
                'return ret === parseFloat(String(solution).trim());')
        }
    ],
    libraryDefault: 'equal'
});

/**
 * Default export
 */
export default StringArrayAdapter;
