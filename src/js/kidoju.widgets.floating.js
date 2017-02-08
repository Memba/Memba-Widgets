/**
 * Copyright (c) 2013-2016 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.draganddrop',
        './vendor/kendo/kendo.window'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.floating');
        // var UNDEFINED = 'undefined';
        var WIDGET_CLASS = 'k-toolbar kj-floating';

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * Floating
         * @class Floating Widget (kendoFloating)
         */
        var Floating = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                logger.debug({method: 'init', message: 'widget initialized'});
                that._layout();
                that._setMutationObserver();
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Floating',
                content: '' // '.k-toolbar:visible [data-uid]'
            },

            /**
             * Widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                var element = this.element;
                element.addClass(WIDGET_CLASS);
                // Add drag handle
                element.append('<div class="kj-floating-handle"><span class="k-icon k-i-handler-drag"></span></div>');
                element.append('<div class="kj-floating-content"></div>');
                // Create titleless window
                element.kendoWindow({
                    title: false
                });
                that.window = element.data('kendoWindow');
                that.wrapper = that.window.wrapper;
                // Add draggable
                element.kendoDraggable({
                    group: 'kidoju.widgets.floating',
                    ignore: '.kj-floating-content, .kj-floating-content *',
                    hint: $.proxy(that._hint, that),
                    dragstart: $.proxy(that._onDragStart, that),
                    dragend: $.proxy(that._onDragEnd, that)
                });
                that.draggable = element.data('kendoDraggable');
            },

            /**
             * Get dragging hint (the thing that moves around on top of everything thanks to a high zIndex)
             * Note: The original element is not modified and should be hidden or displayed with a low opacity
             * @private
             */
            _hint: function () {
                // element.clone() always sets top=0, left=0 which cannot be updated until the clone is added to the document body
                // which occurs in kendoDraggable before calling _onDragStart
                return this.window.wrapper.clone();
            },

            /**
             * Drag start event handler
             * @private
             */
            _onDragStart: function () {
                // hint (the clone) is now added to the document body and its position can be set via CSS
                var hint = this.draggable.hint;
                var wrapper = this.window.wrapper;
                var position = wrapper.position();
                // hide the original element
                wrapper.hide();
                // position the hint on top of the original element
                hint.css({
                    // position: 'absolute',
                    // zIndex: 15000,
                    top: position.top,
                    left: position.left
                });
                // show the hint
                hint.show();
            },

            /**
             * Drag end event handler
             * @private
             */
            _onDragEnd: function () {
                var hint = this.draggable.hint;
                var wrapper = this.window.wrapper;
                var position = hint.position();
                // hide the hint which has been moved around
                hint.hide();
                // set the position of the original element to the position of the hint
                wrapper.css({
                    position: 'absolute',
                    zIndex: 15000,
                    top: position.top,
                    left: position.left
                });
                // show the original element
                wrapper.show();
            },

            /**
             * Set Mutation Observer
             * to show/hide the floating whether there is relevant content
             * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
             * @private
             */
            _setMutationObserver: function () {
                var that = this;
                var container = that.element.children('.kj-floating-content');
                var content = that.options.content;
                if (content) {
                    that.hide();
                    // create an observer instance (show only if there is content)
                    that.observer = new window.MutationObserver(function () {
                        that.wrapper.toggle(!!container.find(content).length);
                    });
                    // pass in the target node, as well as the observer configuration
                    that.observer.observe(
                        container.get(0),
                        {childList: true, subtree: true}
                    );
                } else {
                    that.show();
                }
            },

            /**
             * Show
             */
            show: function () {
                this.wrapper.show();
            },

            /**
             * Hide
             */
            hide: function () {
                this.wrapper.hide();
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                kendo.destroy(that.element);
                // disconnect the mutation observer
                if (that.observer instanceof window.MutationObserver) {
                    that.observer.disconnect();
                }
            }

        });

        kendo.ui.plugin(Floating);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
