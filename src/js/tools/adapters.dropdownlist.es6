/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.dropdownlist';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

const { attr } = window.kendo;

/**
 * DropDownListAdapter
 * @class DropDownListAdapter
 * @extends BaseAdapter
 */
const DropDownListAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options = {}, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = 'select';
        this.attributes = $.extend({}, this.attributes, attributes);
        this.attributes[attr('role')] = 'dropdownlist';
        this.attributes[attr('text-field')] = 'text';
        this.attributes[attr('value-field')] = 'value';
        this.attributes[attr('value-primitive')] = true;
        this.attributes[attr('source')] = JSON.stringify(
            options && options.source ? options.source : []
        );
    }
});

/**
 * Default export
 */
export default DropDownListAdapter;
