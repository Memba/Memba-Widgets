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

/**
 * ReadOnlyAdapter
 * Note: We could have used TextBoxAdapter with attributes
 * @class ReadOnlyAdapter
 * @extends BaseAdapter
 */
const ReadOnlyAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = 'input';
        $.extend(this.attributes, attributes, {
            type: 'text',
            class: 'k-input',
            readonly: true
            // TODO check and compare both
            // class: `k-textbox ${CONSTANTS.DISABLED_CLASS}`,
            // disabled: true
        });
    }
});

/**
 * Default export
 */
export default ReadOnlyAdapter;
