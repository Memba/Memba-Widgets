/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define(['./vendor/kendo/kendo.binder'], f);
})(function () {

    'use strict';

    (function($, undefined) {

        var kendo = window.kendo,
            ui = kendo.ui,
            Widget = ui.Widget,
            ACTIVE = 'k-state-active',
            DISABLE = 'k-state-disabled',
            SELECT = 'select',
            MODES = {
                BUTTONS: 'buttons',
                DROPDOWN: 'dropdown',
                OPTIONS: 'options'
            };

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.widgets.quiz: ' + message);
            }
        }

        /**
         * Asserts
         * Note: Use asserts where unmet conditions are independent from user entries, and
         * developers should be warned that there is probably something unexpected in their code
         */
        var assert = $.extend(
            // By extending assert, we ensure we can call both assert() and assert.ok() for the same result (like in nodeJS)
            function(test, message) {
                if (!test) { throw new Error(message); }
            },
            {
                enum: function(array, value, message) { if (array.indexOf(value) === -1) { throw new Error(message); } },
                equal: function(expected, actual, message) { if (expected !== actual) { throw new Error(message); } },
                instanceof: function(Class, value, message) { if (!(value instanceof Class)) { throw new Error(message); } },
                isOptionalObject: function(value, message) { if ($.type(value) !== 'undefined' && (!$.isPlainObject(value) || $.isEmptyObject(value))) { throw new Error(message); } },
                isPlainObject: function(value, message) { if (!$.isPlainObject(value) || $.isEmptyObject(value)) { throw new Error(message); } },
                isUndefined: function(value, message) { if ($.type(value) !== 'undefined') { throw new Error(message); } },
                match: function(rx, value, message) { if ($.type(value) !== STRING || !rx.test(value)) { throw new Error(message); } },
                ok: function(test, message) { return assert(test, message); },
                type: function(type, value, message) { if ($.type(value) !== type) { throw new TypeError(message); } }
            },
            {
                messages: {
                    isPlainObject: {
                    },
                    isUndefined: {
                    },
                    match: {
                    }
                }
            }
        );

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * Quiz widget
         */
        var Quiz = Widget.extend({

            /**
             * Constructor
             * @param element
             * @param options
             */
            init: function(element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                that._layout();
                that._dataSource();

                /*
                that._enable = true;
                that.select(that.options.index);

                if(!that.options.enable) {
                    that._enable = false;
                    that.wrapper.addClass(DISABLE);
                }
                */
            },

            modes: {
                buttons: MODES.BUTTONS,
                options: MODES.OPTIONS,
                dropdown: MODES.DROPDOWN
            },

            options: {
                name: 'Quiz',
                mode: MODES.OPTIONS,
                enable: true
            },

            events: [
                SELECT
            ],

            /**
             * Gets/sets the value
             * @param value
             */
            value: function(value) {

            },

            /**
             * Layout
             * @private
             */
            _layout: function() {
                var that = this;
                that.wrapper = that.element;
            },

            _dataSource: function() {

            },

            refresh: function() {

            },

            enable: function(enable) {
                var wrapper = this.wrapper;

                if(typeof enable == "undefined") {
                    enable = true;
                }

                if(enable) {
                    wrapper.removeClass(DISABLE);
                } else {
                    wrapper.addClass(DISABLE);
                }

                this._enable = this.options.enable = enable;
            },

            _option: function() {

            },

            _button: function() {
                var button = $(this).addClass("km-button"),
                    icon = kendo.attrValue(button, "icon"),
                    badge = kendo.attrValue(button, "badge"),
                    span = button.children("span"),
                    image = button.find("img").addClass("km-image");

                if (!span[0]) {
                    span = button.wrapInner("<span/>").children("span");
                }

                span.addClass("km-text");

                if (!image[0] && icon) {
                    button.prepend($('<span class="km-icon km-' + icon + '"/>'));
                }
            },

            _select: function(e) {
                if (e.which > 1 || e.isDefaultPrevented() || !this._enable) {
                    return;
                }

                this.select(e.currentTarget);
                this.trigger(SELECT, { index: this.selectedIndex });
            }
        });

        ui.plugin(Quiz);

    })(window.jQuery);

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function(_, f){ 'use strict'; f(); });
