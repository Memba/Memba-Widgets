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
        var drawing = kendo.drawing;
        var geometry = kendo.geometry;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.crossalphanum');
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        // var NS = '.kendoCrossAlphaNum';
        var WIDGET_CLASS = 'k-widget kj-crossalphanum';

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * CrossAlphaNum
         * @class CrossAlphaNum Widget (kendoCrossAlphaNum)
         */
        var CrossAlphaNum = Widget.extend({

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
                name: 'CrossAlphaNum',
                rows: 4,
                columns: 6,
                height: 100,
                width: 150,
                whitelist: '0-9',
                gridStroke: { color: '#9999b6', width: 2 },
                setupStroke: { color: '#9999b6', width: 2 },
                valueStroke: { color: '#9999b6', width: 2 },
                selectColor: '#FF0000',
                setup: [],
                value: []
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
                that.surface = drawing.Surface.create(
                    that.element,
                    { click: $.proxy(that._onSurfaceClick, that) }
                );
                that._grid();
            },

            _onSurfaceClick: function (e) {
                var that = this;
                var offset = that.element.offset();
                var coordinates = {
                    x: e.originalEvent.pageX - offset.left,
                    y: e.originalEvent.pageY - offset.top
                };

            },

            _grid: function () {
                var that = this;
                var height = that.options.height;
                var width = that.options.width;
                var rows = that.options.rows;
                var columns = that.options.columns;
                var grid = new drawing.Group();
                var rectGeometry = new geometry.Rect([0, 0], [width, height]);
                // IMPORTANT: fill is required for the click event to fire everywhere
                var rect = new drawing.Rect(rectGeometry).fill('white');
                grid.append(rect);
                // columns
                for (var col = 1; col < columns; col++) {
                    grid.append(new drawing.Path().moveTo(width * col / columns, 0).lineTo(width * col / columns, height));
                }
                // rows
                for (var row = 1; row < rows; row++) {
                    grid.append(new drawing.Path().moveTo(0, height * row / rows).lineTo(width, height * row / rows));
                }
                that.surface.draw(grid);
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

        kendo.ui.plugin(CrossAlphaNum);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
