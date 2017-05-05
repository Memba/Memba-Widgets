/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

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
        super(element, options);
        this.wrapper = this.element;
        this.value(options.value);
    }

    /**
     * Value getter/setter
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

// Add options
ValueWidget.prototype.options = {
    name: 'ValueWidget',
    value: ''
};
// Add events
ValueWidget.prototype.events = [ CHANGE ];
// Create an alias of the prototype (required by kendo.ui.plugin)
ValueWidget.fn = ValueWidget.prototype;
// Create a jQuery plugin.
ui.plugin(ValueWidget);
