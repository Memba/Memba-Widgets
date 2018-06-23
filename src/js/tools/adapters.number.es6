/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

const { attr, format } = window.kendo;

/**
 * NumberAdapter
 * @class
 */
export default class NumberAdapter extends BaseAdapter {
    /**
     * Costructor
     * @constructor
     * @param options
     * @param attributes // Why not options.attributes???
     */
    constructor(options, attributes) {
        super({
            // TODO super(Object.assign()) of below values (remove $.extend too)
        });
        this.type = CONSTANTS.NUMBER;
        this.defaultValue = this.defaultValue || (this.nullable ? null : 0);
        this.editor = 'input';
        this.attributes = $.extend({}, this.attributes, attributes);
        this.attributes[attr('role')] = 'numerictextbox';
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
                // TODO Add i18n text
                // TODO: parsing raises a culture issue with 5.3 in english and 5,3 in french
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return Number(value) === Number(solution);'
                )
            },
            {
                name: 'greaterThan',
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return Number(value) > Number(solution);'
                )
            },
            {
                name: 'greaterThanOrEqual',
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return Number(value) >= Number(solution);'
                )
            },
            {
                name: 'lowerThan',
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return Number(value) < Number(solution);'
                )
            },
            {
                name: 'lowerThanOrEqual',
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return Number(value) <= Number(solution);'
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
window.kidoju.adapters.NumberAdapter = NumberAdapter;
