/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
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
        './kidoju.util'
    ], f);
})(function (katX) {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.textgaps');
        var util = window.kidoju.util;
        var NULL = 'null';
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var NS = '.kendoTextGaps';
        var CHANGE = 'change';
        var INPUT = 'input';
        var PASTE = 'paste';
        var WIDGET_CLASS = 'kj-textgaps'; // 'k-widget kj-textgaps';
        var INPUT_SELECTOR = '.kj-textgaps-input';
        var INPUT_TEMPLATE = '<div class="{0}" style="{1}"></div>'; // we need a div to set a min-width

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * TextGaps
         * @class TextGaps Widget (kendoTextGaps)
         */
        var TextGaps = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._layout();
                that.value(that.options.value);
                that.enable(that.options.enable);
                // see http://www.telerik.com/forums/kendo-notify()
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'TextGaps',
                value: [],
                text: '',
                input: '\\[\\]', // backslahes are required for regular expressions, but this should be read []
                inputStyle: '',
                enable: true
            },

            /**
             * Widget events
             */
            events: [
                CHANGE
            ],

            /**
             * Value for MVVM binding
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === NULL) {
                    value = [];
                }
                if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else if (util.isAnyArray(value)) {
                    if (!util.compareStringArrays(that._value, value)) {
                        that._value = value;
                        that.refresh();
                    }
                } else {
                    throw new TypeError('`value` is expected to be an array if not null or undefined');
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var options = this.options;
                this.wrapper = this.element;
                this.element.addClass(WIDGET_CLASS);
                var input = kendo.format(INPUT_TEMPLATE, INPUT_SELECTOR.substr(1), options.inputStyle);
                var html = kendo.htmlEncode(options.text).replace(new RegExp(options.input, 'g'), input);
                this.element.html(html);
            },

            /**
             * enable function for bindings
             * @param enable
             */
            enable: function (enable) {
                enable = $.type(enable) === UNDEFINED ? true : !!enable;
                this.element.children(INPUT_SELECTOR).prop('contenteditable', enable);
                this.element.off(NS);
                if (enable) {
                    this.element
                        .on(PASTE + NS, INPUT_SELECTOR, this._onPaste.bind(this))
                        .on(INPUT + NS, INPUT_SELECTOR, this._onInput.bind(this));
                }
            },

            /**
             * Paste envent handler
             * Used to sanitize HTML pasted content
             * @see https://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/6804718#6804718
             * @private
             */
            _onPaste: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(HTMLDivElement, e.target, assert.format(assert.messages.instanceof.default, 'e.target', 'HTMLDivElement'));

                // Stop data actually being pasted into div
                e.stopPropagation();
                e.preventDefault();

                // Get pasted data via clipboard API
                var clipboardData = e.originalEvent.clipboardData || window.clipboardData;
                if (clipboardData && $.isFunction(clipboardData.getData)) {
                    var paste = clipboardData.getData('Text');
                    if ($.type(paste) === STRING) {
                        paste = kendo.htmlEncode(paste);
                        var selection = util.getSelection(e.target);
                        var text = $(e.target).text();
                        var start = text.substr(0, selection.start);
                        var end = text.substr(selection.end);
                        var pos = (start + paste).length;
                        $(e.target).text(start + paste + end);
                        util.setSelection(e.target, { start: pos, end: pos });
                    }
                }
            },

            /**
             * Input event hander
             * @param e
             * @private
             */
            _onInput: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(HTMLDivElement, e.target, assert.format(assert.messages.instanceof.default, 'e.target', 'HTMLDivElement'));
                var input = $(e.target);
                var index = this.element.children(INPUT_SELECTOR).index(input);
                this._value[index] = input.text();
                this.trigger(CHANGE);
            },

            /**
             * Refresh the widget
             */
            refresh: function () {
                var that = this;
                that.element.children(INPUT_SELECTOR).each(function (index, htmlElement) {
                    if ($(htmlElement).text() !== that._value[index]) {
                        $(htmlElement).text(that._value[index]);
                    }
                });
                logger.debug({ method: 'refresh', message: 'widget refreshed' });
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                kendo.unbind(wrapper);
                // Release references
                that.element.off(NS);
                // Destroy kendo
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(TextGaps);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
