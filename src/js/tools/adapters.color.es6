/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

const { attr } = window.kendo;

/**
 * ColorAdapter
 * @class ColorAdapter
 * @extends BaseAdapter
 */
const ColorAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.STRING;
        this.defaultValue =
            this.defaultValue || (this.nullable ? null : '#000000');
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes);
        this.attributes[attr('role')] = 'colorpicker';
    }
});

/**
 * Default export
 */
export default ColorAdapter;
