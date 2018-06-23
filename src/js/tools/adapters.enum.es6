/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

const { attr } = window.kendo;

// TODO EnumAdapter should be localized (i18n)

/**
 * EnumAdapter
 * @class
 */
export default class EnumAdapter extends BaseAdapter {
    /**
     * Constructor
     * @constructor
     * @param options
     * @param attributes
     */
    constructor(options, attributes) {
        super(options); // TODO super(Object.assign())
        this.type = CONSTANTS.STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = 'input';
        this.attributes = $.extend(this.attributes, attributes);
        this.attributes[attr('role')] = 'dropdownlist';
        this.attributes[attr('source')] = JSON.stringify(
            options && options.enum ? options.enum : []
        ); // kendo.htmlEncode??
    }
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.adapters = window.kidoju.adapters || {};
window.kidoju.adapters.EnumAdapter = EnumAdapter;
