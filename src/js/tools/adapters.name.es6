/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

// TODO rename as readonly adapter

/**
 * @class NameAdapter
 */
const NameAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes, { type: 'text', class: 'k-textbox k-state-disabled',  disabled: true });
    }
});

/**
 * Default export
 */
export default NameAdapter;
