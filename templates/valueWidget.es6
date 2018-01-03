/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery'
import 'kendo.binder';

const kendo = window.kendo;
const ui = kendo.ui;
const CHANGE = 'change';

/**
 * ValueWidget
 */
export class ValueWidget extends ui.Widget {

    /**
     * ValueWidget constructor
     * @param element
     * @param options
     */
    constructor(element, options) {
        super(element, Object.assign({}, ValueWidget.options, options));
        this.events = ValueWidget.events;
        this.wrapper = this.element;
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
     * @param value
     */
    value(value){
        if ($.type(value) === 'undefined') {
            return this._value;
        } else if (this._value !== value) {
            this._value = value;
            this.refresh();

            // TODO add a clear button that sets this.trigger(CHANGE);
        }
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
    }
}

// Create a jQuery plugin, this calls ValueWidget.fn.options.name
ui.plugin(ValueWidget);
