/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
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
        './vendor/kendo/kendo.userevents',
        './vendor/kendo/kendo.draganddrop'
        // './vendor/kendo/kendo.multiselect' // required because of a test in kendo.binder.js
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.dropzone');
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        // var NS = '.kendoDropZone';
        var WIDGET_CLASS = 'k-widget kj-dropzone';

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * DropZone
         * @class DropZone Widget (kendoDropZone)
         */
        var DropZone = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                logger.debug('widget initialized');
                that._layout();
                // kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'DropZone',
                value: null,
                // container:  TODO
                draggable: '[draggable]' // The draggable actually is the parent stage element - use http://www.w3schools.com/jquery/sel_has.asp
                // TODO Axis?????
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE
            ],

            /**
             * Value for MVVM binding
             * Returns either a JS function as a string or a library formula name prefixed as a Javascript comment
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === STRING) {
                    that._toggle(value);
                } else if ($.type(value) === UNDEFINED) {
                    if ($.type(that._value) !== STRING || !that._value.length) {
                        return undefined;
                    } else {
                        return that._value;
                    }
                } else {
                    throw new TypeError('`value` is expected to be a string if not undefined');
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                $(that.options.draggable).kendoDraggable({
                    hint: function(element) {
                        return element.clone();
                    },
                    // TODO container: stage,
                    dragstart: function(e) {
                        $.noop();
                    },
                    dragend: function(e) {
                        $.noop();
                    }
                });
                that.element.kendoDropTarget({
                    dragenter: function(e) {
                        $.noop();
                    },
                    dragleave: function(e) {
                        $.noop();
                    },
                    drop: function(e) {
                        $.noop();
                    }
                });
                that.draggable = $(that.options.draggable).data("kendoDraggable");
            },


            /**
             * Clears the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                // kendo.unbind($(that.element));
                // unbind all other events
                $(that.element).find('*').off();
                $(that.element).off();
                // remove descendants
                $(that.element).empty();
                // remove element classes
                // $(that.element).removeClass(WIDGET_CLASS);
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(DropZone);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
