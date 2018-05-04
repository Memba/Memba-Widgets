/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import 'kendo.binder';

const { destroy } = window.kendo;
const { plugin, Widget } = window.kendo.ui;
const CHANGE = 'change';

/**
 * ValueWidget
 */
export default class ValueWidget extends Widget {
    /**
     * ValueWidget constructor
     * @param element
     * @param options
     */
    constructor(element, options) {
        super(element, Object.assign({}, ValueWidget.options, options));
        this.events = ValueWidget.events;
        this.wrapper = this.element;
        // this._render();
        // this.enable(this.options.enable);
        this.value(this.options.value);
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
            name: 'ValueWidget',
            value: ''
        });
    }

    /**
     * Value
     * Note: get/set won't work
     * @param value
     */
    value(value) {
        let ret;
        if ($.type(value) === 'undefined') {
            ret = this._value;
        } else if (this._value !== value) {
            this._value = value;
            this.refresh();
            // TODO add a clear button that sets this.trigger(CHANGE);
        }
        return ret;
    }

    /**
     * Refresh
     */
    refresh() {
        this.element.text(this._value);
    }

    /**
     * Destroy
     */
    destroy() {
        super.destroy();
        destroy(this.element); // TODO Review
    }
}

// Create a jQuery plugin, this calls ValueWidget.fn.options.name
plugin(ValueWidget);
