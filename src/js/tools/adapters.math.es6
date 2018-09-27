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

const { attr, format } = window.kendo;
const VALIDATION_CUSTOM = 'function validate(value, solution, all) {\n\t{0}\n}'; // TODO remove

/**
 * @class MathAdapter
 */
const MathAdapter = BaseAdapter.extend({
    /**
     * Constructor
     * @constructor
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.STRING;
        this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        this.editor = function(container, settings) {
            const binding = {};
            binding[attr('bind')] = `value: ${settings.field}`;
            const input = $('<div/>')
                .css({
                    width: '100%',
                    fontSize: '1.25em',
                    minHeight: '4.6em'
                })
                .attr($.extend(binding, attributes))
                .appendTo(container);
            const mathInputWidget = input.kendoMathInput({
                toolbar: {
                    // container: '',
                    resizable: true,
                    tools: [
                        // 'backspace',
                        // 'field',
                        'keypad',
                        'basic',
                        'greek',
                        'operators',
                        'expressions',
                        'sets',
                        'matrices',
                        'statistics'
                        // 'units',
                        // 'chemistry'
                    ]
                }
            });
        };
    }
});

/**
 * Default export
 */
export default MathAdapter;
