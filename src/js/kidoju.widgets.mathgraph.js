/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/silentmatt/expr-eval',
        // './vendor/mathjs/math',
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.color',
        './vendor/kendo/kendo.drawing'
    ], f);
})(function (math) {

    'use strict';

    // Eval is evil, besides x ^ 2 is better than Math.pow(x, 2)
    // So we have identified two proper math parsers:
    // https://github.com/silentmatt/expr-eval (small and simple)
    // https://github.com/josdejong/mathjs (big and feature-rich)
    math = math || window.exprEval || window.math;

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var data = kendo.data;
        var drawing = kendo.drawing;
        var geometry = kendo.geometry;
        var DataSource = data.DataSource;
        var Group = drawing.Group;
        var Path = drawing.Path;
        var Surface = drawing.Surface;
        var Widget = kendo.ui.Widget;
        // var ToolBar = kendo.ui.ToolBar;
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
                that.surface = Surface.create(that.element);
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
            refresh: function (e) {
                var that = this;
                assert.instanceof(DataSource, that.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                if (that.surface instanceof Surface) {
                    var items = this.dataSource.data();
                    // Clear surface
                    that.surface.clear();
                    // Draw grid
                    that._drawGrid();
                    // Draw axis
                    that._drawAxis();
                    // Draw items
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        var item1;
                        var item2;
                        var pt1;
                        var pt2;
                        if (['point'].indexOf(item.type) > -1) {
                            pt1 = {
                                x: item.x,
                                y: item.y
                            };
                        } else if (['circle', 'line', 'ray', 'segment'].indexOf(item.type) > -1) {
                            item1 = that.dataSource.get(item.pt1).toJSON();
                            pt1 = {
                                x: item1.x,
                                y: item1.y
                            };
                            item2 = that.dataSource.get(item.pt2).toJSON();
                            pt2 = {
                                x: item2.x,
                                y: item2.y
                            };
                        }
                        switch (item.type) {
                            case 'arc':
                                break;
                            case 'circle':
                                that._drawCircle(pt1, pt2, item.name, item.configuration.toJSON());
                                break;
                            case 'function':
                                that._drawMathFunction(item.code, item.name, item.configuration.toJSON());
                                break;
                            case 'line':
                                that._drawLine(pt1, pt2, item.name, item.configuration.toJSON());
                                break;
                            case 'point':
                                that._drawPoint(pt1, item.name, item.configuration.toJSON());
                                break;
                            case 'ray':
                                that._drawRay(pt1, pt2, item.name, item.configuration.toJSON());
                                break;
                            case 'segment':
                                that._drawSegment(pt1, pt2, item.name, item.configuration.toJSON());
                                break;
                        }
                    }
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
                    var group = new Group();
                    var xSize = parseFloat(options.grid.size.x);
                    if (!isNaN(xSize) && xSize > 0) {
                        var xShift = origin.x % xSize;
                        var columns = width / xSize;
                        // TODO: because of xShift, we might need to start at -1
                        for (var c = 0; c < columns ; c++) {
                            var colPath = new Path(options.grid.path).moveTo(c * xSize + xShift, 0).lineTo(c * xSize + xShift, height);
                            group.append(colPath);
                        }
                    }
                    var ySize = parseFloat(options.grid.size.y);
                    if (!isNaN(ySize) && ySize > 0) {
                        var yShift = origin.y % ySize;
                        var rows = height / ySize;
                        for (var r = 0; r < rows ; r++) {
                            var rowPath = new Path(options.grid.path).moveTo(0, r * ySize + yShift).lineTo(width, r * ySize + yShift);
                            group.append(rowPath);
                        }
                    }
                    if ($.isArray(group.children) && group.children.length) {
                        that.surface.draw(group);
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
             * Get the pixel position from top left corner, given a point from origin
             * The point has math cooordinates considering the grid size and position of axis/origin
             * The position has pixel coordinates
             * @param point
             * @private
             */
            _getPixelFromPoint: function (point) {
                var that = this;
                var options = that.options;
                var xSize = parseFloat(options.grid.size.x);
                var ySize = parseFloat(options.grid.size.y);
                var origin = that._getOrigin();
                return {
                    x: point.x * xSize + origin.x,
                    y: - point.y * ySize + origin.y
                };
            },

            /**
             * Get the point from origin, gievn the pixel position from top left corner
             * The point has math cooordinates considering the grid size and position of axis/origin
             * The position has pixel coordinates
             * @param pixel
             * @private
             */
            _getPointFromPixel: function (pixel) {
                var that = this;
                var options = that.options;
                var xSize = parseFloat(options.grid.size.x);
                var ySize = parseFloat(options.grid.size.y);
                var origin = that._getOrigin();
                return {
                    x: (pixel.x - origin.x) / xSize,
                    y: (origin.y - pixel.y) / ySize
                };
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
                    var group = new Group();
                    var xPath = new Path(options.axis.path).moveTo(0, origin.y).lineTo(width, origin.y);
                    group.append(xPath);

                    var yPath = new Path(options.axis.path).moveTo(origin.x, 0).lineTo(origin.x, height);
                    group.append(yPath);
                    that.surface.draw(group);
                    // TODO add end arrows
                    // TODO add graduations
                }
            },

            /**
             * Draw a point
             * @param pt
             * @param name
             * @param configuration
             * @private
             */
            _drawPoint: function (pt, name, configuration) {
                var that = this;
                var px = that._getPixelFromPoint(pt);
                if (isFinite(px.x) && isFinite(px.y)) {
                    var group = new Group;
                    // Outer circle
                    var circleGeometry = new geometry.Circle([px.x, px.y], 10); // TODO configure radius
                    var circle = new drawing.Circle(circleGeometry, $.extend(configuration, { opacity: .25 }));
                    group.append(circle);
                    // Inner circle
                    circleGeometry = new geometry.Circle([px.x, px.y], 3); // TODO configure radius
                    circle = new drawing.Circle(circleGeometry, configuration);
                    group.append(circle);
                    // Add name
                    var text = new drawing.Text(name, new geometry.Point(px.x + 10, px.y - 22));  // TODO configure font size and calculate position
                    group.append(text);
                    that.surface.draw(group);
                }
            },

            /**
             * Draw a segment between pt1 and pt2
             * @param pt1
             * @param pt2
             * @param name
             * @param configuration
             * @private
             */
            _drawSegment: function (pt1, pt2, name, configuration) {
                var that = this;
                var px1 = that._getPixelFromPoint(pt1);
                var px2 = that._getPixelFromPoint(pt2);
                if (isFinite(px1.x) && isFinite(px1.y) &&
                    isFinite(px2.x) && isFinite(px2.y)
                ) {
                    var group = new Group;
                    // Add path
                    var path = new Path(configuration);
                    path.moveTo(px1.x, px1.y);
                    path.lineTo(px2.x, px2.y);
                    group.append(path);
                    // TODO Add name
                    that.surface.draw(group);
                }
            },

            /**
             * Draw a ray starting at pt1 and going through pt2
             * @param pt1
             * @param pt2
             * @param name
             * @param configuration
             * @private
             */
            _drawRay: function (pt1, pt2, name, configuration) {

            },

            /**
             * Draw a line going through pt1 and pt2
             * @param pt1
             * @param pt2
             * @param name
             * @param configuration
             * @private
             */
            _drawLine: function (pt1, pt2, name, configuration) {

            },

            /**
             * Draw a circle centered at pt1 and going through pt2
             * @param pt1
             * @param pt2
             * @param name
             * @param configuration
             * @private
             */
            _drawCircle: function (pt1, pt2, name, configuration) {
                var that = this;
                var px1 = that._getPixelFromPoint(pt1);
                var px2 = that._getPixelFromPoint(pt2);
                if (isFinite(px1.x) && isFinite(px1.y) &&
                    isFinite(px2.x) && isFinite(px2.y)
                ) {
                    var radius = Math.sqrt(Math.pow(px2.x - px1.x, 2) + Math.pow(px2.y - px1.y, 2));
                    var group = new Group();
                    var circleGeometry = new geometry.Circle([px1.x, px1.y], radius);
                    var circle = new drawing.Circle(circleGeometry, configuration);
                    group.append(circle);
                    // TODO Add name
                    that.surface.draw(group);
                }
            },

            /**
             * Draw arc
             * @private
             */
            _drawArc: function (p1, radius, a1, a2, name, configuration) {

            },

            /**
             * Draw math function
             * @param code a math expression with a single variable x
             * @param name
             * @param configuration, a drawing path configuration as documented at http://docs.telerik.com/kendo-ui/api/javascript/drawing/path#configuration
             * @private
             */
            _drawMathFunction: function (code, name, configuration) {
                assert.type(STRING, code, kendo.format(assert.messages.type.default, 'code', STRING));
                var that = this;
                var element = that.element;
                var options = that.options;
                var xSize = parseFloat(options.grid.size.x);
                var ySize = parseFloat(options.grid.size.y);
                var origin = that._getOrigin();
                var width = element.width();
                var group = new Group();
                var path = new Path(configuration);
                var which = false;
                var fn;
                if ($.isFunction(math.Parser)) {
                    // we are using https://github.com/silentmatt/expr-eval
                    var parser = new math.Parser();
                    fn = parser.parse(code);
                } else if ($.isFunction(math.parse)) {
                    // we are using https://github.com/josdejong/mathjs
                    which = true;
                    fn = math.parse(code).compile();
                } else {
                    // we need a math parser
                    throw new Error('You need to reference a math parser');
                }
                for (var x = 0; x <= width; x++) {
                    // x, y represent a pixel with 0,0 in the top left corner
                    // a, b are our coordinates from origin
                    var a = (x - origin.x) / xSize;
                    // Our function uses x but this is actually a, considering x refers to the horizontal position of pixels
                    var b = which ? fn.eval({ x: a }) : fn.evaluate({ x: a });
                    var y = -b * ySize + origin.y;
                    if (isFinite(y) && y >=0 && y <= width) {
                        if (path.segments && path.segments.length === 0) {
                            path.moveTo(x, y);
                        } else {
                            path.lineTo(x, y);
                        }
                        if (x === width - 1) {
                            group.append(path);
                        }
                    } else { // Especially for 1/x and similar functions
                        // We only append to the group if we had one moveTo and at least one lineTo, that is 2 segments
                        if (path.segments && path.segments.length > 1) {
                            group.append(path);
                        }
                        // In all cases (whether the previous one has been added to the group or not), we start a new path
                        path = new Path(configuration);
                    }
                }
                // TODO Add name
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
