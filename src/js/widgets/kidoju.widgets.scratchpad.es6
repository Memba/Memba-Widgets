/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import 'kendo.binder';
import 'kendo.drawing';

const { kendo } = window;
const { drawing, geometry, ui } = kendo;
const UNDEFINED = 'undefined';
const CHANGE = 'change';
// const CLICK = 'click';
// const NS = '.kendoScratchPad';

/**
 * ScratchPad
 */
export default class ScratchPad extends ui.Widget {
    /**
     * ScratchPad constructor
     * @param element
     * @param options
     */
    constructor(element, options) {
        super(element, Object.assign({}, ScratchPad.options, options));
        this.events = ScratchPad.events;
        this.wrapper = this.element;
        this._render();
        this.enable(this.options.enable);
        // this.value(this.options.value);
    }

    /**
     * fn static getter
     */
    static get fn() {
        return this;
    }

    /**
     * Default events
     */
    static get events() {
        return [CHANGE];
    }

    /**
     * Default options
     */
    static get options() {
        return Object.assign({}, this.prototype.options, {
            name: 'ScratchPad',
            enable: true,
            messages: {},
            value: []
        });
    }

    /**
     * Value
     * Note: get/set won't work
     * @param value
     */
    value() {
        return this._value;
    }

    /**
     * Render the widget
     * @private
     */
    _render() {
        this.element.css({ display: 'flex' });
    }

    /**
     * Enable/disable the widget
     * @param enable
     */
    enable(enable) {
        const isEnabled = $.type(enable) === UNDEFINED ? true : !!enable;
    }

    /**
     * Refresh
     */
    refresh() {
        this.textarea.val(this._value || '');
    }

    /**
     * Destroy
     */
    destroy() {
        super.destroy();
    }
}

// Create a jQuery plugin, this calls ScratchPad.fn.options.name
ui.plugin(ScratchPad);
