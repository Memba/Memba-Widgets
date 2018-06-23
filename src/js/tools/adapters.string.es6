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
 * StringAdapter
 * @class
 */
export default class StringAdapter extends BaseAdapter {
    /**
     * Constructor
     * @constructor
     * @param options
     * @param attributes
     */
    constructor(options, attributes) {
        super({
            // TODO review attributies
            attributes: $.extend({}, options.attributes, attributes, {
                type: 'text',
                class: 'k-textbox'
            }),
            defaultValue:
                options.defaultValue || (options.nullable ? null : ''),
            editor: 'input',
            type: CONSTANTS.STRING
        });
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
                // TODO Add i18n description
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return String(value).trim() === String(solution).trim();'
                )
            },
            {
                name: 'ignoreCaseEqual',
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return String(value).trim().toUpperCase() === String(solution).trim().toUpperCase();'
                )
            },
            {
                name: 'ignoreCaseMatch',
                // Do not use RegExp constructor because escaping backslashes is a nightmare
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return /{0}/i.test(String(value).trim());'
                ),
                param: 'Regular Expression' // TODO Review to add
            },
            {
                name: 'ignoreDiacriticsEqual',
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return removeDiacritics(String(value).trim().toUpperCase()) === removeDiacritics(String(solution).trim().toUpperCase());'
                )
            },
            {
                name: 'match',
                // Do not use RegExp constructor because escaping backslashes is a nightmare
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return /{0}/.test(String(value).trim());'
                ),
                param: 'Regular Expression'
            },
            {
                name: 'metaphone',
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return metaphone(removeDiacritics(String(value).trim().toUpperCase())) === metaphone(removeDiacritics(String(solution).trim().toUpperCase()));'
                )
            },
            {
                name: 'soundex',
                formula: format(
                    BaseAdapter.validationDeclaration,
                    'return soundex(removeDiacritics(String(value).trim().toUpperCase())) === soundex(removeDiacritics(String(solution).trim().toUpperCase()));'
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
window.kidoju.adapters.StringAdapter = StringAdapter;
