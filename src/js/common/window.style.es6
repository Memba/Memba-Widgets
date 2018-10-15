/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Consider kendo.getComputedStyle and window.getComputedStyle
// TODO Develop whitelist with StyleEditor

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from './window.constants.es6';

const { toCamelCase, toHyphens } = window.kendo;

// https://stackoverflow.com/questions/448981/which-characters-are-valid-in-css-class-names-selectors
// https://www.w3schools.com/cssref/
const RX_STYLE_KEY = /^-?[a-z]+[a-z-]*$/;
const WHITELIST = {
    backgroundColor: value => value,
    border: value => value,
    borderColor: value => value,
    borderStyle: value => value,
    borderWidth: value => value,
    font: value => value,
    fontFamily: value => value,
    fontSize: value => value,
    fontWeight: value => value,
    height: value => value,
    margin: value => value,
    padding: value => value,
    opacity: value => value,
    width: value => value
};

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
        // Note: the map keys are hyphenated CSS style names, like background-color
        this._map = new Map();
        this.parse(options, whitelist);
    }

    /**
     * Parse a style string (hyphenated) or style plain object (camel cased)
     * e.g. we expect background-color in a string but backgroundColor in an object
     * @method parse
     * @param styles
     * @param whitelist
     */
    parse(styles, whitelist = false) {
        const map = this._map;
        map.clear();
        if ($.type(styles) === CONSTANTS.STRING) {
            styles.split(CONSTANTS.SEMICOLON).forEach(style => {
                const keyValue = style.split(CONSTANTS.COLON);
                if (Array.isArray(keyValue) && keyValue.length === 2) {
                    const key = keyValue[0].trim();
                    const k = toCamelCase(key);
                    let value = keyValue[1].trim();
                    if (RX_STYLE_KEY.test(key) && value.length) {
                        if (whitelist) {
                            const parse = WHITELIST[k];
                            value = $.isFunction(parse) ? parse(value) : value;
                        }
                        if (value) {
                            map.set(key, value);
                        }
                    }
                }
            });
        } else if ($.isPlainObject(styles)) {
            Object.keys(styles).forEach(k => {
                const key = toHyphens(k);
                let value = styles[k];
                if (
                    RX_STYLE_KEY.test(key) &&
                    $.type(value) === CONSTANTS.STRING
                ) {
                    value = value.trim();
                    if (value.length) {
                        if (whitelist) {
                            const parse = WHITELIST[k];
                            value = $.isFunction(parse) ? parse(value) : value;
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
