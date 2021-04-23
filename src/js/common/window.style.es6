/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from './window.constants.es6';

const { toCamelCase, toHyphens } = window.kendo;

// https://stackoverflow.com/questions/448981/which-characters-are-valid-in-css-class-names-selectors
// https://www.w3schools.com/cssref/
const RX_STYLE_KEY = /^-?[a-z]+[a-z-]*$/;

/**
 * Style
 * @class Style
 */
export default class Style {
    /**
     * constructor
     * @constructor constructor
     * @param options
     * @param whitelist
     */
    constructor(options, whitelist) {
        this.parse(options, whitelist);
    }

    /**
     * Parse a style string (hyphenated) or style plain object (camel cased)
     * e.g. we expect background-color in a string but backgroundColor in an object
     * @param styles
     * @param whitelist
     * @returns {Map<any, any>}
     * @private
     */
    static parse(styles, whitelist = false) {
        const map = new Map();
        if (
            $.type(styles) === CONSTANTS.STRING ||
            $.type(styles) === CONSTANTS.UNDEFINED
        ) {
            (styles || CONSTANTS.EMPTY)
                .split(CONSTANTS.SEMICOLON)
                .forEach((style) => {
                    const keyValue = style.split(CONSTANTS.COLON);
                    if (Array.isArray(keyValue) && keyValue.length === 2) {
                        const key = keyValue[0].trim();
                        let value = keyValue[1].trim();
                        if (RX_STYLE_KEY.test(key) && value.length) {
                            if (
                                Array.isArray(whitelist) &&
                                whitelist.indexOf(key) === -1
                            ) {
                                value = undefined;
                            }
                            if (value) {
                                map.set(key, value);
                            }
                        }
                    }
                });
        } else if ($.isPlainObject(styles)) {
            Object.keys(styles).forEach((k) => {
                const key = toHyphens(k);
                let value = styles[k];
                if (
                    RX_STYLE_KEY.test(key) &&
                    $.type(value) === CONSTANTS.STRING
                ) {
                    value = value.trim();
                    if (value.length) {
                        if (
                            Array.isArray(whitelist) &&
                            whitelist.indexOf(key) === -1
                        ) {
                            value = undefined;
                        }
                        if (value) {
                            map.set(key, value);
                        }
                    }
                }
            });
        } else {
            throw new TypeError(
                '`styles` should be a string or a plain object'
            );
        }
        return map;
    }

    /**
     * Parse a style string (hyphenated) or style plain object (camel cased)
     * e.g. we expect background-color in a string but backgroundColor in an object
     * @method parse
     * @param styles
     * @param whitelist
     */
    parse(styles, whitelist = false) {
        // Note: the map keys are hiphenated CSS style names, like background-color
        this._whitelist = Array.isArray(whitelist) ? whitelist : false;
        this._map = Style.parse(styles, this._whitelist);
    }

    /**
     * Merge additional styles
     * @method merge
     * @param styles
     * @param overwrite existing styles
     * @param ignore styles
     */
    merge(styles, overwrite = false, ignore = []) {
        const m = Style.parse(styles, this._whitelist);
        m.forEach((value, key) => {
            if (overwrite || !this._map.has(key)) {
                if (!Array.isArray(ignore) || ignore.indexOf(key) === -1) {
                    this._map.set(key, value);
                }
            }
        });
    }

    /**
     * Reset styles
     * @param ignore
     */
    reset(ignore = []) {
        this._map.forEach((value, key) => {
            if (Array.isArray(ignore) && ignore.indexOf(key) === -1) {
                this._map.delete(key);
            }
        });
    }

    /**
     * Return styles as string
     * @method toString
     * @returns {string}
     */
    toString() {
        let ret = '';
        this._map.forEach((value, key) => {
            ret += `${key}${CONSTANTS.COLON} ${value}${CONSTANTS.SEMICOLON} `;
        });
        return ret.slice(0, -1);
    }

    /**
     * Returns styles as JSON
     * @method toJSON
     */
    toJSON() {
        const ret = {};
        this._map.forEach((value, key) => {
            // ret[$.camelCase(key)] = value;
            ret[toCamelCase(key)] = value;
        });
        return ret;
    }
}
