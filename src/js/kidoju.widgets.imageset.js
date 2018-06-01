/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './common/window.assert.es6',
        './common/window.logger.es6',
        './vendor/kendo/kendo.binder'
    ], f);
})(function () {
    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.imageset');
        // var NUMBER = 'number';
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var NS = '.kendoImageSet';
        var CLICK = 'click';
        var KEYDOWN = 'keydown';
        var CHANGE = 'change';
        var WIDGET_CLASS = 'kj-imageset kj-interactive';
        var KEYSTROKES = {
            ARROW_DOWN: 40,
            ARROW_LEFT: 37,
            ARROW_RIGHT: 39,
            ARROW_UP: 38,
            END: 35,
            HOME: 36,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            SPACE: 32
        };

        /*******************************************************************************************
         * ImageSet Widget
         *******************************************************************************************/

        /**
         * ImageSet (kendoImageSet)
         * @class ImageSet
         * @extend Widget
         */
        var ImageSet = Widget.extend({

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
                that.value(that.options.value || '');
                that.enable(that.element.prop('disabled') ? false : that.options.enabled);
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'ImageSet',
                value: null,
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
                var images = that.options.images;
                if ($.type(value) === UNDEFINED) {
                    if ($.isArray(images) && images[that._index]) {
                        return images[that._index].text;
                    }
                } else if ($.type(value) === STRING || $.type(value) === NULL) {
                    that._index = 0;
                    for (var i = 0, length = images.length; i < length; i++) {
                        if (value === images[i].text) {
                            that._index = i;
                            break;
                        }
                    }
                    that.refresh();
                } else {
                    throw new TypeError('`value` should be a nullable string or undefined.');
                }
            },

            /**
             * Preload images
             * @private
             */
            _preload: function () {
                var images = this.options.images;
                for (var i = 0, length = images.length; i < length; i++) {
                    $('<img>')
                        .attr('src', window.encodeURI(images[i].image));
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
                if (!element.is('div')) {
                    throw new Error('Use a div tag to instantiate an ImageSet widget.');
                }
                that.wrapper = element
                    .css({
                        cursor: 'pointer',
                        outline: 0,
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover'
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
                    this._index = (this._index === 0 ? images.length - 1 : this._index - 1);
                } else {
                    this._index = (this._index === images.length - 1 ? 0 : this._index + 1);
                }
                this.refresh();
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
                        this._index = (this._index === 0 ? images.length - 1 : this._index - 1);
                        break;
                    case KEYSTROKES.ARROW_RIGHT:
                    case KEYSTROKES.ARROW_UP:
                    case KEYSTROKES.SPACE:
                        this._index = (this._index === images.length - 1 ? 0 : this._index + 1);
                        break;
                    case KEYSTROKES.END:
                    case KEYSTROKES.PAGE_UP:
                        this._index = images.length - 1;
                        break;
                    case KEYSTROKES.HOME:
                    case KEYSTROKES.PAGE_DOWN:
                        this._index = 0;
                        break;
                }
                this.refresh();
                this.trigger(CHANGE);
            },

            /* jshint +W074 */

            /**
             * Refresh the widget
             * @method refresh
             */
            refresh: function () {
                var element = this.element;
                var images = this.options.images;
                this._index = (Math.round(Math.abs(this._index)) % images.length) || 0;
                if ($.isArray(images) && images[this._index]) {
                    // element.attr('alt', kendo.htmlEncode(images[this._index].text));
                    // element.attr('src', kendo.htmlEncode(images[this._index].image));
                    element.css({
                        backgroundImage: 'url(' + window.encodeURI(images[this._index].image) + ')'
                    });
                }
                logger.debug({ method: 'refresh', message: 'Widget refreshed' });
            },

            /**
             * Destroy the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                that.element.off(NS);
                kendo.unbind(wrapper);
                // Clear references
                // Destroy widget
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        ui.plugin(ImageSet);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
