/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO https://github.com/lonekorean/highlight-within-textarea/tree/master
// TODO https://github.com/davisjam/safe-regex/blob/master/index.js

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';

const {
    destroy,
    ui: { plugin, Widget }
} = window.kendo;
const CHANGE = 'change';
const CLICK = 'click';
const NS = '.kendoRegExpWidget';
const UNDEFINED = 'undefined';
const WIDGET_CLASS = 'k-widget kj-value-widget';

/**
 * RegExpWidget
 * @class RegExpWidget
 * @extends Widget
 */
const RegExpWidget = Widget.extend({
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
        name: 'RegExpWidget',
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
            ret = this._value;
        } else if (this._value !== value) {
            this._value = value;
            this.refresh();
        }
        return ret;
    },

    /**
     * _render
     * @private
     */
    _render() {
        this.wrapper = this.element;
        this.element.addClass(WIDGET_CLASS);
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        this.element.text(this._value);
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
plugin(RegExpWidget);
