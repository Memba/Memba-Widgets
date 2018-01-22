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
        './vendor/kendo/kendo.core',
        './vendor/kendo/kendo.userevents'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var UserEvents = kendo.UserEvents;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.cursor');
        var NS = '.kendoCursor';

        /*******************************************************************************************
         * Cursor
         *******************************************************************************************/

        /**
         * Cursor (kendoCursor)
         * @class Cursor
         * @extend Widget
         */
        var Cursor = Widget.extend({

            /**
             * Initializes the widget
             * @method init
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._layout();
                that._initEvents();
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Cursor',
                filter: 'input',
                size: 20,
                friction: 1
                // color or theme
            },

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                var that = this;
                var element = that.wrapper = that.element;
                var options = that.options;
                element
                    .html('<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="100"/></svg>')
                    .css({
                        cursor: 'pointer',
                        position: 'absolute',
                        top: 0,
                        left: 0
                    })
                    .height(options.size)
                    .width(options.size)
                    .hide();
            },

            /**
             *
             * @private
             */
            _initEvents: function () {
                var that = this;
                var options = that.options;
                $(document)
                    .on('focusin' + NS, options.filter, $.proxy(that._onFocusIn, that))
                    .on('focusout' + NS, options.filter, $.proxy(that._onFocusOut, that));
                that.cursorEvents = new UserEvents(
                    that.element,
                    {
                        global: true,
                        start: $.proxy(that._onDragStart, that),
                        move: $.proxy(that._onDrag, that),
                        end: $.proxy(that._onDragEnd, that)
                    }
                );
            },

            /**
             * Event handler for the focusin event
             * @param e
             * @private
             */
            _onFocusIn: function (e) {
                this.element
                    // TODO position
                    .show();
            },

            /**
             * Event handler for the focusout event
             * @param e
             * @private
             */
            _onFocusOut: function (e) {
                this.element.hide();
            },

            /**
             * Event handler for the dragstart event
             * @param e
             * @private
             */
            _onDragStart: function (e) {
                $.noop();
            },

            /**
             * Event handler for the drag event
             * @param e
             * @private
             */
            _onDrag: function (e) {
                // debugger;
                var options = this.options;
                var position = e.target.position();
                var cursorPos = this._getCursorPosition();
                e.target.css({
                    left: position.left + e.x.delta,
                    top: position.top + e.y.delta
                });
                // TODO Set caret
            },

            /**
             * Event handler for the dragend event
             * @param e
             * @private
             */
            _onDragEnd: function (e) {
                // TODO Ease back to cursor position
                $.noop();
            },

            /**
             * Utility method to get the cursor position
             * Note: the cursor is the visual element users can drag to positiuon the caret
             * @param elementWithFocus
             * @private
             */
            _getCursorPosition: function (elementWithFocus) {

            },

            /**
             * Utility method to set the caret position
             * Note: The caret is the text insertion/selection cursor
             * @param elementWithFocus
             * @private
             */
            _setCaretPosition: function (elementWithFocus) {

            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                $(document).off(NS);
                that.cursorEvents.destroy();
                kendo.unbind(wrapper);
                // Release references
                that.cursorEvents = undefined;
                // Destroy widget
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }
        });

        ui.plugin(Cursor);

    } (window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
