/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';

const {
    destroy,
    ui: { plugin, Widget }
} = window.kendo;
// const CHANGE = 'change';

/**
 * ValueWidget
 * @class ValueWidget
 * @extends Widget
 */
const ValueWidget = Widget.extend({
    /**
     * Constructor
     * @constructor init
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
     * Events
     * @property events
     */
    // events: [CHANGE],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'ValueWidget',
        // enabled: true,
        value: ''
    },

    /**
     * Value
     * Note: ES6 get/set won't work with MVVM
     * @method value
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
     * @method refresh
     */
    refresh() {
        this.element.text(this._value);
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

// Register widget
plugin(ValueWidget);
