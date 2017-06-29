/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.window',
        './kidoju.widgets.markeditor.toolbar',
        './kidoju.widgets.markdown'
    ], f);
})(function () {
    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.markeditor');
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var WIDGET_CLASS = 'kj-markeditor'; // 'k-widget kj-markeditor';

        /*******************************************************************************************
         * MarkEditor Widget
         *******************************************************************************************/

        /**
         * MarkEditor (kendoTemplate)
         * @class MarkEditor
         * @extend Widget
         */
        var MarkEditor = Widget.extend({

            /**
             * Initializes the widget
             * @method init
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'Widget initialized' });
                that._layout();
                that.value(that.options.value);
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'MarkEditor',
                value: '',
                // TODO dataValueUpdate='keyup'
                tools: []
            },

            /**
             * Events
             */
            events: [
                CHANGE
            ],

            /**
             * Data to be merged with the template
             * @method value
             * @param value
             * @return {*}
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else if ($.type(value) === STRING) {
                    if (that._value !== value) {
                        that._value = value;
                        that.refresh();
                    }
                } else {
                    throw new TypeError('`value` should be a string');
                }
            },

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                var that = this;
                var element = that.element;
                if (!element.is('textarea')) {

                }
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
            },

            /**
             * Refreshes the widget
             * @method refresh
             */
            refresh: function () {
                var that = this;
                var options = that.options;

                logger.debug({ method: 'refresh', message: 'Widget refreshed' });
            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                kendo.unbind(wrapper);
                // Clear references
                // Destroy widget
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        ui.plugin(MarkEditor);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
