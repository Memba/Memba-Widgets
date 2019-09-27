/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import MathLive from '../vendor/arnog/mathlive';
import CONSTANTS from '../common/window.constants.es6';

const {
    destroy,
    ui: { plugin, Widget }
} = window.kendo;
const CHANGE = 'change';
const CLICK = 'click';
const NS = '.kendoMathInput';
const UNDEFINED = 'undefined';
const WIDGET_CLASS = 'k-widget k-multiselect-wrap kj-mathinput';

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
        this._render();
        this.setOptions({
            enabled: this.element.prop('disabled')
                ? false
                : this.options.enabled,
            value: this.options.value
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
        value: ''
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
            ret = this._mathField.$latex();
        } else if (this._value !== value) {
            this._mathField.$latex(value, {
                suppressChangeNotifications: true
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
        const that = this;
        return {
            onContentDidChange(mathField) {
                that.trigger(CONSTANTS.CHANGE);
                mathField.$focus();
            },
            virtualKeyboardMode: 'onfocus'
        };
    },

    /**
     * _render
     * @private
     */
    _render() {
        this.wrapper = this.element;
        this.element.addClass(WIDGET_CLASS);
        this._mathField = MathLive.makeMathField(
            this.element[0],
            this._config()
        );
    },

    /**
     * Enable
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled = $.type(enable) === UNDEFINED ? true : !!enable;
        const { element } = this;
        element.off(NS);
        element.css('cursor', 'default');
        if (enabled) {
            element.on(CLICK + NS, this._onClick.bind(this));
            element.css('cursor', 'pointer');
        }
    },

    /**
     * _onClick
     * @method _onClick
     * @private
     */
    _onClick() {
        this.value('');
        this.trigger(CHANGE);
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        Widget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'MathInput')) {
    // Prevents loading several times in karma
    plugin(MathInput);
}
