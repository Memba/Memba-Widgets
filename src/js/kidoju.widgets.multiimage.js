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
        './vendor/kendo/kendo.binder'
    ], f);
})(function () {
    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.multiimage');
        var NUMBER = 'number';
        var UNDEFINED = 'undefined';
        var NS = '.kendoMultiImage';
        var CLICK = 'click';
        var KEYDOWN = 'keydown';
        var CHANGE = 'change';
        var WIDGET_CLASS = 'kj-multiimage kj-interactive';
        var KEYSTROKES = {
            ARROW_DOWN: 40,
            ARROW_LEFT: 37,
            ARROW_RIGHT: 39,
            ARROW_UP: 38,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            SPACE: 32
        };

        /*******************************************************************************************
         * MultiImage Widget
         *******************************************************************************************/

        /**
         * MultiImage (kendoMultiImage)
         * @class MultiImage
         * @extend Widget
         */
        var MultiImage = Widget.extend({

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
                that._preload();
                that._layout();
                that.value(that.options.value);
                that.enable(that.element.prop('disabled') ? false : that.options.enabled);
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'MultiImage',
                value: 0,
                images: [],
                enabled: true
            },

            /**
             * Events
             */
            events: [
                CHANGE
            ],

            /**
             * Value
             * @method value
             * @param value
             * @return {*}
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else if ($.type(value) === NUMBER) {
                    value = Math.round(Math.abs(value)) % that.options.images.length;
                    if (that._value !== value) {
                        that._value = value;
                        that.refresh();
                    }
                } else {
                    throw new TypeError('`value` should be a number.');
                }
            },

            /**
             * Preload images
             * @private
             */
            _preload: function () {
                var images = this.options.images;
                for (var i = 0, length = images.length; i < length; i++) {
                    $('<img>').attr('src', images[i]);
                    /*
                    .on('load', function () {
                        debugger; // Yippy! they load
                    });
                    */
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
                if (!element.is('img')) {
                    throw new Error('Use an img tag to instantiate a MultiImage widget.');
                }
                that.wrapper = element
                    .css({
                        cursor: 'pointer',
                        outline: 0
                    })
                    .attr({
                        role: 'button',
                        tabindex: 0 // This is required for the element to get the focus and support keydown events
                    })
                    .addClass(WIDGET_CLASS);
            },

            /**
             * Enable user interactivity
             * @param enabled
             */
            enable: function (enabled) {
                var that = this;
                var element = that.element;
                element.off(NS);
                if ($.type(enabled) === UNDEFINED || !!enabled) {
                    element.on(CLICK + NS, $.proxy(that._onClick, that));
                    element.on(KEYDOWN + NS, $.proxy(that._onKeyDown, that));
                }
            },

            /**
             * Event handler for the click event
             * @private
             */
            _onClick: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var images = this.options.images;
                if (e.altKey || e.ctrlKey || e.shiftKey) {
                    this.value(this.value() === 0 ? images.length - 1 : this.value() - 1);
                } else {
                    this.value(this.value() === images.length - 1 ? 0 : this.value() + 1);
                }
                this.trigger(CHANGE);
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Event handler for the keydown event (which is enabled by tabindex=0)
             * @param e
             * @private
             */
            _onKeyDown: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var images = this.options.images;
                switch (e.which) {
                    // TODO Consider handling numbers to display an image
                    case KEYSTROKES.ARROW_DOWN:
                    case KEYSTROKES.ARROW_LEFT:
                        this.value(this.value() === 0 ? images.length - 1 : this.value() - 1);
                        break;
                    case KEYSTROKES.ARROW_RIGHT:
                    case KEYSTROKES.ARROW_UP:
                    case KEYSTROKES.SPACE:
                        this.value(this.value() === images.length - 1 ? 0 : this.value() + 1);
                        break;
                    case KEYSTROKES.PAGE_UP:
                        this.value(images.length - 1);
                        break;
                    case KEYSTROKES.PAGE_DOWN:
                        this.value(0);
                        break;
                }
                this.trigger(CHANGE);
            },

            /* jshint +W074 */

            /**
             * Refresh the widget
             * @method refresh
             */
            refresh: function () {
                var element = this.element;
                var options = this.options;
                element.attr('src', options.images[this._value]);
                logger.debug({ method: 'refresh', message: 'Widget refreshed' });
            },

            /**
             * Destroy the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                // Unbind events
                element.off(NS);
                // Clear references
                // Destroy widget
                Widget.fn.destroy.call(that);
                kendo.destroy(element);
            }

        });

        ui.plugin(MultiImage);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
