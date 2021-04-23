/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
// import MathLive from '../vendor/arnog/mathlive.mjs'; // <-- does not work
import { MathfieldElement } from '../vendor/arnog/mathlive';

const {
    destroy,
    ui: { plugin, Widget },
} = window.kendo;
const logger = new Logger('widgets.mathlive');
const CHANGE = 'change';
// const CLICK = 'click';
const NS = '.kendoMathInput';
const UNDEFINED = 'undefined';
const WIDGET_CLASS = 'k-widget k-textarea kj-mathinput';

/**
 * MathInput
 * @class MathInput
 * @extends Widget
 */
const MathInput = Widget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', messages: 'widget initialized' });
        this._render();
        this.setOptions({
            enabled: this.element.prop('disabled')
                ? false
                : this.options.enabled,
            value: this.options.value,
        });
    },

    /**
     * Events
     * @property events
     */
    events: [CHANGE],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'MathInput',
        enabled: true,
        value: '',
    },

    /**
     * setOptions
     * @method setOptions
     * @param options
     */
    setOptions(options) {
        this.enable(options.enabled);
        this.value(options.value);
    },

    /**
     * Value
     * Note: ES6 get/set won't work with MVVM
     * @method value
     * @param value
     */
    value(value) {
        let ret;
        if ($.type(value) === UNDEFINED) {
            ret = this._mathField.getValue();
        } else if (this._value !== value) {
            this._mathField.setValue(value, {
                suppressChangeNotifications: true,
            });
        }
        return ret;
    },

    /**
     * MathInput configuration
     * @returns {{virtualKeyboardMode: string}}
     * @private
     */
    _config() {
        return {
            fontsDirectory: '../../../styles/vendor/khan/fonts',
            // fontsDirectory: '../../../styles/vendor/arnog/fonts',
            virtualKeyboardMode: 'onfocus',
        };
    },

    /**
     * _render
     * @private
     */
    _render() {
        this.wrapper = this.element;
        this.element.addClass(WIDGET_CLASS);
        this._mathField = new MathfieldElement(this._config());
        this._mathField.style.width = '100%';
        this.element.append(this._mathField);
    },

    /**
     * Enable
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled = $.type(enable) === UNDEFINED ? true : !!enable;
        const { _mathField } = this;
        $(_mathField).css('cursor', 'default').off(NS);
        if (enabled) {
            $(_mathField)
                .css('cursor', 'text')
                .on(`input${NS}`, (e) => {
                    this.trigger(CONSTANTS.CHANGE);
                    e.target.focus();
                });
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        Widget.fn.destroy.call(this);
        destroy(this.element);
        logger.debug({ method: 'destroy', messages: 'widget destroyed' });
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'MathInput')) {
    // Prevents loading several times in karma
    plugin(MathInput);
}
