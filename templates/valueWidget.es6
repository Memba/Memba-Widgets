/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import 'kendo.binder';

const {
    ui: { plugin, Widget }
} = window.kendo;
// const CHANGE = 'change';

/**
 * ValueWidget
 */
const ValueWidget = Widget.extend({
    /**
     * Constructor
     * @constructor
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        this.wrapper = this.element;
        // this._render();
        // this.enable(this.options.enabled);
        this.value(this.options.value);
    },

    /**
     * Widget events
     */
    // events: [CHANGE],

    /**
     * Widget options
     */
    options: {
        name: 'ValueWidget',
        // enabled: true,
        value: ''
    },

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
        }
        return ret;
    },

    /**
     * Refresh
     */
    refresh() {
        this.element.text(this._value);
    },

    /**
     * Destroy
     */
    destroy() {
        Widget.fn.destroy.call(this);
    }
});

// Register widget
plugin(ValueWidget);
