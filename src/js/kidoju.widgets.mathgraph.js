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
        './vendor/kendo/kendo.color',
        './vendor/kendo/kendo.drawing'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var data = kendo.data;
        var drawing = kendo.drawing;
        var geometry = kendo.geometry;
        var DataSource = data.DataSource;
        var Surface = drawing.Surface;
        var Widget = kendo.ui.Widget;
        var ToolBar = kendo.ui.ToolBar;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.drawing');
        var NUMBER = 'number';
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DOT = '.';
        var WIDGET = 'kendoMathGraph';
        var NS = DOT + WIDGET;
        var MOUSEDOWN = 'mousedown' + NS + ' ' + 'touchstart' + NS;
        var MOUSEMOVE = 'mousemove' + NS + ' ' + 'touchmove' + NS;
        var MOUSEUP = 'mouseup' + NS + ' ' + 'touchend' + NS;
        var DIV = '<div/>';
        var WIDGET_CLASS = 'kj-drawing';
        var SURFACE_CLASS = WIDGET_CLASS + '-surface';
        var SURFACE = 'surface';
        // var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var ID = 'id';

        /*********************************************************************************
         * MathGraph Widget
         *********************************************************************************/

        /**
         * MathGraph
         * @class MathGraph Widget (kendoMathGraph)
         */
        var MathGraph = Widget.extend({

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
                that._dataSource();
                that._enabled = that.element.prop('disabled') ? false : that.options.enable;
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'MathGraph',
                autoBind: true,
                dataSource: [],
                scaler: 'div.kj-stage',
                container: 'div.kj-stage>div[data-' + kendo.ns + 'role="stage"]',
                grid: {
                    size: {
                        x: 50, // Means a value of 1 is represented with 50 pixels on the X axis
                        y: 50  // Means a value of 1 is represented with 50 pixels on the Y axis
                    },
                    path: {
                        opacity: .25,
                        stroke: {
                            color: '#808080'
                        }
                    }
                },
                // TODO: zoom ?
                axis: {
                    position: {
                        x: 50, // In percents
                        y: 50
                    },
                    path: {
                        stroke: {
                            color: '#000000'
                        }
                    }
                },
                enable: true
            },

            /**
             * Set options
             * @param options
             */
            setOptions: function (options) {
                var that = this;
                // TODO
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
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === STRING || $.type(value) === NULL) {
                    that._value = value;
                } else if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else {
                    throw new TypeError('`value` is expected to be a nullable string if not undefined');
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                // touch-action: 'none' is for Internet Explorer - https://github.com/jquery/jquery/issues/2987
                that.element
                    .addClass(WIDGET_CLASS)
                    .css({ touchAction: 'none' });
                that.surface = drawing.Surface.create(that.element);
                // TODO ----------------------
                that._drawGrid();
                that._drawAxis();
                that._drawMathFunction();
            },

            /**
             * Add drag and drop handlers
             * @private
             */
            _addDragAndDrop: function () {
                // TODO use this.enable
                // IMPORTANT
                // We can have several containers containing connectors on a page
                // But we only have one set of event handlers shared across all containers
                // So we cannot use `this`, which is specific to this math graph
                var that = this;
                $(document)
                    .off(NS)
                    .on(MOUSEDOWN, DOT + WIDGET_CLASS, $.proxy(that._onMouseEvent, that))
                    .on(MOUSEMOVE, $.proxy(that._onMouseEvent, that))
                    .on(MOUSEUP, DOT + WIDGET_CLASS, $.proxy(that._onMouseEvent, that))
                    .on(MOUSEUP, $.proxy(that._onMouseEvent, that));
            },

            /**
             * Mouse event handler
             * @param e
             * @private
             */
            _onMouseEvent: $.noop,

            /**
             * _dataSource function to bind refresh to the change event
             * @private
             */
            _dataSource: function () {
                var that = this;

                // returns the datasource OR creates one if using array or configuration
                that.dataSource = DataSource.create(that.options.dataSource);

                // bind to the change event to refresh the widget
                if (that._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                }
                that._refreshHandler = $.proxy(that.refresh, that);
                that.dataSource.bind(CHANGE, that._refreshHandler);

                // trigger a read on the dataSource if one hasn't happened yet
                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
            },

            /**
             * sets the dataSource for source binding
             * @param dataSource
             */
            setDataSource: function (dataSource) {
                var that = this;
                // set the internal datasource equal to the one passed in by MVVM
                that.options.dataSource = dataSource;
                // rebuild the datasource if necessary, or just reassign
                that._dataSource();
            },

            /**
             * Refresh upon changing the dataSource
             * Redraw all connections
             */
            refresh: function () {
                var that = this;
                var options = that.options;
                var container = that.element.closest(options.container);
                assert.instanceof($, container, kendo.format(assert.messages.instanceof.default, 'container', 'jQuery'));
                assert.instanceof(DataSource, that.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                var connections = this.dataSource.data();
                var surface = container.data(SURFACE);
                if (surface instanceof kendo.drawing.Surface) {
                    // Clear surface
                    surface.clear();

                }
            },

            /**
             * Draw grid
             * @private
             */
            _drawGrid: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                if (options.grid && options.grid.size) {
                    var height = element.height();
                    var width = element.width();
                    var origin = that._getOrigin();
                    var grid = new drawing.Group();
                    var xSize = parseFloat(options.grid.size.x);
                    if (!isNaN(xSize) && xSize > 0) {
                        var xShift = origin.x % xSize;
                        var columns = width / xSize;
                        // TODO: because of xShift, we might need to start at -1
                        for (var c = 0; c < columns ; c++) {
                            var colPath = new drawing.Path(options.grid.path).moveTo(c * xSize + xShift, 0).lineTo(c * xSize + xShift, height);
                            grid.append(colPath);
                        }
                    }
                    var ySize = parseFloat(options.grid.size.y);
                    if (!isNaN(ySize) && ySize > 0) {
                        var yShift = origin.y % ySize;
                        var rows = height / ySize;
                        for (var r = 0; r < rows ; r++) {
                            var rowPath = new drawing.Path(options.grid.path).moveTo(0, r * ySize + yShift).lineTo(width, r * ySize + yShift);
                            grid.append(rowPath);
                        }
                    }
                    if ($.isArray(grid.children) && grid.children.length) {
                        that.surface.draw(grid);
                    }
                }
            },

            /**
             * Get the graph origin
             * @private
             */
            _getOrigin: function () {
                var that = this;
                if (!$.isPlainObject(that._origin)) {
                    var element = that.element;
                    var options = that.options;
                    var height = element.height();
                    var width = element.width();
                    // Default value for origin (because we need one)
                    that._origin = {
                        x: width / 2,
                        y: height / 2
                    };
                    if (options.axis && options.axis.position) {
                        var x = parseFloat(options.axis.position.x);
                        if (!isNaN(x) && x >= 0 && x <= 100) {
                            that._origin.x = width * x / 100;
                        }
                        var y = parseFloat(options.axis.position.y);
                        if (!isNaN(y) && y >= 0 && y <= 100) {
                            that._origin.y = height * y / 100;
                        }
                    }
                }
                // Cache the value to avoid repeating the same calculation
                return that._origin;
            },

            /**
             * Draw axis
             * @private
             */
            _drawAxis: function () {
                var that = this;
                var options = that.options;
                if (options.axis && options.axis.position && options.axis.position.x && options.axis.position.y) {
                    var element = that.element;
                    var origin = that._getOrigin();
                    var height = element.height();
                    var width = element.width();
                    var axis = new drawing.Group();
                    var xPath = new drawing.Path(options.axis.path).moveTo(0, origin.y).lineTo(width, origin.y);
                    axis.append(xPath);
                    var yPath = new drawing.Path(options.axis.path).moveTo(origin.x, 0).lineTo(origin.x, height);
                    axis.append(yPath);
                    that.surface.draw(axis);
                }
            },

            /**
             * Draw a point
             * @private
             */
            _drawPoint: function () {

            },

            // Segment, open segment and line
            _drawSegment: function () {

            },

            // Draw circle
            _drawCircle: function () {

            },

            /**
             * Draw arc
             * @private
             */
            _drawArc: function () {

            },

            /**
             * Parse a math function
             * @private
             */
            _parseMathFunction: function () {
                // The function to draw
                return function (x) {
                    // TODO use a simple parser as in
                    // http://stackoverflow.com/questions/31600121/how-do-you-write-an-arithmetic-expression-parser-in-javascript-without-using-ev/31621205#31621205
                    // return x + 3;
                    // return Math.pow(x, 2);
                    // return Math.cos(x);
                    // return 1/x;
                    return 1 / (Math.pow(x, 2) - 1);
                };
            },

            /**
             * Draw math function
             * @private
             */
            _drawMathFunction: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                var xSize = parseFloat(options.grid.size.x);
                var ySize = parseFloat(options.grid.size.y);
                var origin = that._getOrigin();
                var width = element.width();
                var group = new drawing.Group();
                var path = new drawing.Path();
                for (var x = 0; x < width; x++) {
                    // x, y represent a pixel
                    // a, b are our coordinates
                    var a = (x - origin.x) / xSize;
                    var b = that._parseMathFunction()(a);
                    if (isFinite(b)) {
                        var y = -b * ySize + origin.y;
                        if (path.segments && path.segments.length === 0) {
                            path.moveTo(x, y);
                        } else {
                            path.lineTo(x, y);
                        }
                        if (x === width - 1) {
                            group.append(path);
                        }
                    } else { // Especially for 1/x and similar functions
                        // We only append to the group if we had one moveTo and at least one lineTo
                        if (path.segments && path.segments.length > 1) {
                            group.append(path);
                        }
                        // In all cases, we start a new path
                        path = new drawing.Path();
                    }
                }
                that.surface.draw(group);
            },

            /**
             * Enable/disable user interactivity on connector
             */
            enable: function (enabled) {
                // this._enabled is checked in _addDragAndDrop
                this._enabled = enabled;
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                // Unbind events
                $(document).off(NS);
                // Release references
                that.surface = undefined;
                // Destroy kendo
                Widget.fn.destroy.call(that);
                kendo.destroy(element);
                // Remove widget class
                element.removeClass(WIDGET_CLASS);
            }
        });

        kendo.ui.plugin(MathGraph);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
