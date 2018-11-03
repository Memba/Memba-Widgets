/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import { getValueBinding } from '../data/data.util.es6';
import BaseAdapter from './adapters.base.es6';

const { attr } = window.kendo;

/**
 * MathInputAdapter
 * @class MathInputAdapter
 * @extends BaseAdapter
 */
const MathInputAdapter = BaseAdapter.extend({
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
        this.editor = function(container, settings) {
            const input = $('<div/>')
                .css({
                    width: '100%',
                    fontSize: '1.25em',
                    minHeight: '4.6em'
                })
                // .attr($.extend(binding, attributes))
                .attr($.extend({}, settings.attributes, getValueBinding(settings.field)))
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
export default MathInputAdapter;
