/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

const { format } = window.kendo;

/**
 * TextAdapter (multiline)
 * @class
 */
export default class TextAdapter extends BaseAdapter {
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
        this.editor = 'textarea';
        this.attributes = $.extend({}, this.attributes, attributes);
    }

    /**
     * library getter
     * @returns {*[]}
     */
    // eslint-disable-next-line class-methods-use-this
    get library() {
        return [
            {
                name: 'equal',
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return String(value).trim() === String(solution).trim();'
                )
            },
            {
                name: 'ignoreSpacesEqual',
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return String(value).replace(/\\s+/g, " ").trim() === String(solution).replace(/\\s+/g, " ").trim();'
                )
            },
            {
                name: 'ignorePunctuationEqual',
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return String(value).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim() === String(solution).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim();'
                )
            }
        ];
    }

    /**
     * default getter
     * @returns {string}
     */
    // eslint-disable-next-line class-methods-use-this
    get libraryDefault() {
        return 'equal';
    }
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.adapters = window.kidoju.adapters || {};
window.kidoju.adapters.TextAdapter = TextAdapter;
