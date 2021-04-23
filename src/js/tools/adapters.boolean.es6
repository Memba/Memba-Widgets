/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.switch';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

const { attr } = window.kendo;

/**
 * BooleanAdapter
 * @class BooleanAdapter
 * @extends BaseAdapter
 */
const BooleanAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.BOOLEAN;
        this.defaultValue = this.defaultValue || (this.nullable ? null : false);
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes);
        this.attributes[attr(CONSTANTS.ROLE)] = 'switch';
    },
});

/**
 * Default export
 */
export default BooleanAdapter;
