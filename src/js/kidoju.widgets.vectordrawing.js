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
        './vendor/kendo/kendo.userevents',
        './vendor/kendo/kendo.drawing',
        './vendor/kendo/kendo.dataviz.diagram',
        './kidoju.widgets.vectordrawing.toolbar'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.vectordrawing');
        var kendo = window.kendo;
        var deepExtend = kendo.deepExtend;
        var isFunction = kendo.isFunction;
        var Widget = kendo.ui.Widget;
        var Class = kendo.Class;
        var drawing = kendo.drawing;
        var createPromise = drawing.util.createPromise;
        var encodeBase64 = drawing.util.encodeBase64;
        var geometry = kendo.geometry;
        var Transformation = geometry.Transformation;
        var RootNode = drawing.svg.RootNode;
        var dataviz = kendo.dataviz;
        var diagram = dataviz.diagram;
        var ui = dataviz.ui;
        var Diagram = ui.Diagram;
        var Cursors = diagram.Cursors;
        Cursors.crosshair = 'crosshair';
        var Circle = diagram.Circle;
        var Group = diagram.Group;
        var Image = diagram.Image;
        var Path = diagram.Path;
        var Polyline = diagram.Polyline
        var Point = diagram.Point;
        var Rectangle = diagram.Rectangle;
        var Selector = diagram.Selector;
        var Shape = diagram.Shape;
        var CompositeTransform = diagram.CompositeTransform;
        var ShapesQuadTree = diagram.ShapesQuadTree;
        var TextBlock = diagram.TextBlock;
        var ToolService = diagram.ToolService;
        var ConnectorsAdorner = diagram.ConnectorsAdorner;
        var ResizingAdorner = diagram.ResizingAdorner;
        var STRING = 'string';
        var CHANGE = 'change';
        var DRAG = 'drag';
        var DRAG_END = 'dragEnd';
        var DRAG_START = 'dragStart';
        var SVG_NS = 'http://www.w3.org/2000/svg';
        var RX_URL = /^https?:\/\//;
        var DEFAULT_SNAP_SIZE = 10;
        var MIN_SNAP_SIZE = 5;
        var LINE_PATH =  'M {0} {1} L {2} {3}';
        var ARTBOARD_GUIDE = 20;

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        // From kendo.drawing.js
        function transform(matrix) {
            if (matrix === null) {
                return null;
            }
            if (matrix instanceof Transformation) {
                return matrix;
            }
            return new Transformation(matrix);
        }
        function exportGroup(group) {
            var root = new RootNode();
            var bbox = group.clippedBBox();
            var rootGroup = group;
            if (bbox) {
                var origin = bbox.getOrigin();
                var exportRoot = new drawing.Group();
                exportRoot.transform(transform().translate(-origin.x, -origin.y));
                exportRoot.children.push(group);
                rootGroup = exportRoot;
            }
            root.load([rootGroup]);
            var svg = '<?xml version=\'1.0\' ?><svg xmlns=\'' + SVG_NS + '\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' version=\'1.1\'>' + root.render() + '</svg>';
            // TODO add viewBox
            root.destroy();
            return svg;
        }
        function exportImage(group, options) {
            var defaults = {
                width: '800px',
                height: '600px',
                cors: 'Anonymous'
            };
            var exportRoot = group;
            var bbox = group.clippedBBox();
            if (bbox) {
                var origin = bbox.getOrigin();
                exportRoot = new drawing.Group(); // new Group();
                exportRoot.transform(transform().translate(-origin.x, -origin.y));
                exportRoot.children.push(group);
                var size = bbox.getSize();
                defaults.width = size.width + 'px';
                defaults.height = size.height + 'px';
            }
            var surfaceOptions = $.extend(defaults, options);
            var container = document.createElement('div');
            var style = container.style;
            style.display = 'none';
            style.width = surfaceOptions.width;
            style.height = surfaceOptions.height;
            document.body.appendChild(container);
            // var surface = new Surface$3(container, surfaceOptions);
            var surface = new drawing.canvas.Surface(container, surfaceOptions);
            surface.suspendTracking();
            surface.draw(exportRoot);
            var promise = surface.image();
            var destroy = function () {
                surface.destroy();
                document.body.removeChild(container);
            };
            promise.then(destroy, destroy);
            return promise;
        }
        function exportSVG (group, options) {
            var svg = exportGroup(group);
            // BEGIN: Add json of shapes and connections
            if (options.json) {
                var defs = '<defs>';
                var pos = svg.indexOf(defs);
                if (pos > -1) {
                    svg = svg.substr(0, pos + defs.length) +
                        '<script type="application/json">' + JSON.stringify(options.json) + '</script>' +
                        svg.substr(pos + defs.length);
                }
            }
            // END: Add json
            if (!options || !options.raw) {
                svg = 'data:image/svg+xml;base64,' + window.btoa(svg);
            }
            return createPromise().resolve(svg);
        }
        // From kendo.dataviz.diagram.js
        function canDrag(element) {
            var editable = element.options.editable;
            return editable && editable.drag !== false;
        }
        function translateToOrigin(visual) {
            var bbox = visual.drawingContainer().clippedBBox(null);
            if (bbox.origin.x !== 0 || bbox.origin.y !== 0) {
                visual.position(-bbox.origin.x, -bbox.origin.y);
            }
        }

        /*********************************************************************************
         * Tools
         *********************************************************************************/

        /**
         * Vector Shape
         */
        var VectorShape = Shape.extend({
            init: function (options, diagram) {
                Shape.fn.init.call(this, options, diagram);
            },
            _visualOptions: function (options) {
                return {
                    // From Shape.fn._visualOptions
                     data: options.path,
                     source: options.source,
                     hover: options.hover,
                     fill: options.fill,
                     stroke: options.stroke,
		                 // For text blocks
		                 text: options.text,
		                 // color: options.content.color,
		                 // fontFamily: options.content.fontFamily,
		                 // fontSize: options.content.fontSize,
		                 // fontStyle: options.content.fontStyle,
		                 // fontWeight: options.content.fontWeight,
		                 // For pen and polyline
		                 points: options.points,
		                 startCap: options.startCap,
		                 endCap: options.endCap
                 };
                 // return options;
            },
            createShapeVisual: function () {
                var options = this.options;
                var visualOptions = this._visualOptions(options);
                var visualTemplate = options.visual;
                var type = (options.type + '').toLocaleLowerCase();
                var shapeVisual;
                visualOptions.width = options.width;
                visualOptions.height = options.height;
                if (isFunction(visualTemplate)) {
                    shapeVisual = visualTemplate.call(this, options);
                } else if (visualOptions.data) {
                    shapeVisual = new Path(visualOptions);
                    translateToOrigin(shapeVisual);
                } else if (type == 'rectangle') {
                    shapeVisual = new Rectangle(visualOptions);
                } else if (type == 'circle') {
                    shapeVisual = new Circle(visualOptions);
                } else if (type == 'text') {
                    shapeVisual = new TextBlock(visualOptions);
                } else if (type == 'image') {
                    shapeVisual = new Image(visualOptions);
                // BEGIN Added polyline
                } else if (type == 'polyline') {
                    shapeVisual = new Polyline(visualOptions);
                    // END Added polyline
                } else {
                    shapeVisual = new Path(visualOptions);
                }
                this.shapeVisual = shapeVisual;
                this.visual.append(this.shapeVisual);
            }
        });

        /**
         * Pen tool
         */
        var PenTool = Class.extend({
            init: function (toolService) {
                this.toolService = toolService;
                this.type = 'PenTool';
            },
            tryActivate: function (p, meta) {
                if (meta.type === this.type) {
                    this.options === meta.options;
                    return true;
                }
            },
            start: function (p, meta) {
                var toolService = this.toolService;
                var diagram = toolService.diagram;
                var shape = toolService.activeShape = diagram._createShape({}, {
                    type: 'polyline',
                    points: [{x: 0, y: 0}],
                    x: p.x,
                    y: p.y,
                    height: 0,
                    width: 0,
                    minHeight: 0,
                    minWidth: 0,
                    // TODO configuration options
                    fill: {
                        color: '#0000ff'
                    },
                    stroke: {
                        color: '#000000',
                        width: 5
                    }
                    // startCap
                    // endCap
                });
                if (canDrag(shape) && !diagram.trigger(DRAG_START, {
                        shapes: [shape],
                        connections: []
                    }) && diagram._addShape(shape)) {
                    toolService.activeShape = shape;
                    toolService._removeHover();
                    toolService.selectSingle(toolService.activeShape, meta);
                    /*
                     if (meta.type == 'touchmove') {
                     diagram._cachedTouchTarget = connector.visual;
                     }
                     */
                } else {
                    // connection.source(null);
                    toolService.end(p);
                }
            },
            move: function (p) {
                var toolService = this.toolService;
                var shape = toolService.activeShape;
                var bounds = shape.bounds();
                var left = Math.min(bounds.x, p.x);
                var right = Math.max(bounds.x + bounds.width, p.x);
                var top = Math.min(bounds.y, p.y);
                var bottom = Math.max(bounds.y + bounds.height, p.y);
                var newBounds = new diagram.Rect(left, top, right - left, bottom - top);
                var offset = new diagram.Point(
                    bounds.x - newBounds.x,
                    bounds.y - newBounds.y
                );
                var points = shape.shapeVisual.points().slice();
                for (var i = 0, length = points.length; i < length; i++) {
                    points[i].x += offset.x;
                    points[i].y += offset.y;
                }
                points.push(p.minus(newBounds.topLeft()));
                shape.redraw({
                    type: 'polyline',
                    points: points,
                    x: newBounds.x,
                    y: newBounds.y,
                    minHeight: 0,
                    height: newBounds.height,
                    minWidth: 0,
                    width: newBounds.width,
                    // TODO configuration options
                    fill: {
                        color: '#0000ff'
                    },
                    stroke: {
                        color: '#000000',
                        width: 5
                    }
                    // startCap
                    // endCap); // TODO
                });
                // TODO: should we update model?
                // shape._setOptionsFromModel({ x: x, y: y, width: width, height: height });
                return true;
            },
            end: function (p) {
                var toolService = this.toolService;
                var shape = toolService.activeShape;
                var d = toolService.diagram;
                // TODO close the shape when applicable!
                /*
                 var connection = toolService.activeConnection;
                 var hoveredItem = toolService.hoveredItem;
                 var connector = toolService._hoveredConnector;
                 var target;
                 var cachedTouchTarget = d._cachedTouchTarget;
                 if (!connection) {
                 return;
                 }
                 if (connector && connector._c != connection.sourceConnector) {
                 target = connector._c;
                 } else if (hoveredItem && hoveredItem instanceof diagram.Shape) {
                 target = hoveredItem.getConnector(AUTO) || hoveredItem.getConnector(p);
                 } else {
                 target = p;
                 }
                 connection.target(target);
                 */
                var shape = toolService.activeShape;
                // Modify position
                if (!shape) {
                    return;
                }
                if (!d.trigger(DRAG_END, {
                        shapes: [shape],
                        connections: []
                    })) {
                    shape.updateModel();
                    d._syncShapeChanges();
                    toolService.selectSingle(shape, {});
                } else {
                    d.remove(shape, false);
                    d.undoRedoService.pop();
                }
                toolService._resetTool(); // Sets the pointer tool
            },
            getCursor: function () {
                return Cursors.crosshair;
            }
        });

        /**
         * PolyLine tool
         */
        var PolylineTool = Class.extend({
            init: function (toolService) {
                this.toolService = toolService;
                this.type = 'PolylineTool';
            },
            tryActivate: function (p, meta) {
                if (meta.type === this.type) {
                    this.options === meta.options;
                    return true;
                }
            },
            start: function (p, meta) {
                var toolService = this.toolService;
                var diagram = toolService.diagram;
                var shape = toolService.activeShape = diagram._createShape({}, {
                    type: 'polyline',
                    points: [{x: 0, y: 0}],
                    x: p.x,
                    y: p.y,
                    height: 0,
                    width: 0,
                    minHeight: 0,
                    minWidth: 0,
                    // TODO configuration options
                    fill: {
                        color: '#0000ff'
                    },
                    stroke: {
                        color: '#000000',
                        width: 5
                    }
                    // startCap
                    // endCap
                });
                if (canDrag(shape) && !diagram.trigger(DRAG_START, {
                        shapes: [shape],
                        connections: []
                    }) && diagram._addShape(shape)) {
                    toolService.activeShape = shape;
                    toolService._removeHover();
                    toolService.selectSingle(toolService.activeShape, meta);
                    /*
                     if (meta.type == 'touchmove') {
                     diagram._cachedTouchTarget = connector.visual;
                     }
                     */
                } else {
                    // connection.source(null);
                    toolService.end(p);
                }
            },
            move: function (p) {
                var toolService = this.toolService;
                var shape = toolService.activeShape;
                var bounds = shape.bounds();
                var left = Math.min(bounds.x, p.x);
                var right = Math.max(bounds.x + bounds.width, p.x);
                var top = Math.min(bounds.y, p.y);
                var bottom = Math.max(bounds.y + bounds.height, p.y);
                var newBounds = new diagram.Rect(left, top, right - left, bottom - top);
                var offset = new diagram.Point(
                    bounds.x - newBounds.x,
                    bounds.y - newBounds.y
                );
                var points = shape.shapeVisual.points().slice();
                for (var i = 0, length = points.length; i < length; i++) {
                    points[i].x += offset.x;
                    points[i].y += offset.y;
                }
                points.push(p.minus(newBounds.topLeft()));
                shape.redraw({
                    type: 'polyline',
                    points: points,
                    x: newBounds.x,
                    y: newBounds.y,
                    minHeight: 0,
                    height: newBounds.height,
                    minWidth: 0,
                    width: newBounds.width,
                    // TODO configuration options
                    fill: {
                        color: '#0000ff'
                    },
                    stroke: {
                        color: '#000000',
                        width: 5
                    }
                    // startCap
                    // endCap); // TODO
                });
                // TODO: should we update model?
                // shape._setOptionsFromModel({ x: x, y: y, width: width, height: height });
                return true;
            },
            end: function (p) {
                var toolService = this.toolService;
                var shape = toolService.activeShape;
                var d = toolService.diagram;
                /*
                 var connection = toolService.activeConnection;
                 var hoveredItem = toolService.hoveredItem;
                 var connector = toolService._hoveredConnector;
                 var target;
                 var cachedTouchTarget = d._cachedTouchTarget;
                 if (!connection) {
                 return;
                 }
                 if (connector && connector._c != connection.sourceConnector) {
                 target = connector._c;
                 } else if (hoveredItem && hoveredItem instanceof diagram.Shape) {
                 target = hoveredItem.getConnector(AUTO) || hoveredItem.getConnector(p);
                 } else {
                 target = p;
                 }
                 connection.target(target);
                 */
                var shape = toolService.activeShape;
                // Modify position
                if (!shape) {
                    return;
                }
                if (!d.trigger(DRAG_END, {
                        shapes: [shape],
                        connections: []
                    })) {
                    shape.updateModel();
                    d._syncShapeChanges();
                    toolService.selectSingle(shape, {});
                } else {
                    d.remove(shape, false);
                    d.undoRedoService.pop();
                }
                toolService._resetTool(); // Sets the pointer tool
            },
            getCursor: function () {
                return Cursors.crosshair;
            }
        });

        /**
         * Shape tool
         */
        var ShapeTool = Class.extend({
            init: function (toolService) {
                this.toolService = toolService;
                this.type = 'ShapeTool';
            },
            tryActivate: function (p, meta) {
                if (meta.type === this.type) {
                    this.options === meta.options;
                    return true;
                }
            },
            start: function (p, meta) {
                var toolService = this.toolService;
                var diagram = toolService.diagram;
                var pos = this._truncateDistance(p);
                // var connector = toolService._hoveredConnector;
                // var connection = diagram._createConnection({}, connector._c, p);
                var shape = diagram._createShape({}, deepExtend(
                    this.toolService.options,
                    {
                        x: pos.x,
                        y: pos.y,
                        minWidth: 0,
                        width: 0,
                        minHeight: 0,
                        height: 0,
                        radius: 0
                    }
                ));
                if (canDrag(shape) && !diagram.trigger(DRAG_START, {
                        shapes: [shape],
                        connections: []
                    }) && diagram._addShape(shape)) {
                    // toolService._connectionManipulation(connection, connector._c.shape, true);
                    toolService.activeShape = shape;
                    toolService._removeHover();
                    toolService.selectSingle(toolService.activeShape, meta);
                    /*
                     if (meta.type == 'touchmove') {
                        diagram._cachedTouchTarget = connector.visual;
                     }
                     */
                } else {
                    // connection.source(null);
                    toolService.end(p);
                }
            },
            move: function (p) {
                var toolService = this.toolService;
                var shape = toolService.activeShape;
                var pos = this._truncateDistance(p);
                var x = pos.x > shape._bounds.x ? shape._bounds.x : pos.x;
                var y = pos.y > shape._bounds.y ? shape._bounds.y : pos.y;
                var width = pos.x > shape._bounds.x ? pos.x - shape._bounds.x : shape._bounds.x + shape._bounds.width - pos.x;
                var height = pos.y > shape._bounds.y ? pos.y - shape._bounds.y : shape._bounds.y + shape._bounds.height - pos.y;
                shape._setOptionsFromModel({ x: x, y: y, width: width, height: height });
                // connection.target(p);
                toolService.diagram.trigger(DRAG, {
                    shapes: [shape],
                    connections: []
                });
                return true;
            },
            end: function (p) {
                var toolService = this.toolService;
                var d = toolService.diagram;
                /*
                 var connection = toolService.activeConnection;
                 var hoveredItem = toolService.hoveredItem;
                 var connector = toolService._hoveredConnector;
                 var target;
                 var cachedTouchTarget = d._cachedTouchTarget;
                 if (!connection) {
                 return;
                 }
                 if (connector && connector._c != connection.sourceConnector) {
                 target = connector._c;
                 } else if (hoveredItem && hoveredItem instanceof diagram.Shape) {
                 target = hoveredItem.getConnector(AUTO) || hoveredItem.getConnector(p);
                 } else {
                 target = p;
                 }
                 connection.target(target);
                 */
                var shape = toolService.activeShape;
                // Modify position
                if (!shape) {
                    return;
                }
                if (!d.trigger(DRAG_END, {
                        shapes: [shape],
                        connections: []
                    })) {
                    shape.updateModel();
                    d._syncShapeChanges();
                } else {
                    d.remove(shape, false);
                    d.undoRedoService.pop();
                }
                /*
                 toolService._connectionManipulation();
                 if (cachedTouchTarget) {
                 d._connectorsAdorner.visual.remove(cachedTouchTarget);
                 d._cachedTouchTarget = null;
                 }
                 */
                toolService._resetTool(); // Sets the pointer tool
            },
            _truncateDistance: function (d) {
                if (d instanceof diagram.Point) {
                    return new diagram.Point(this._truncateDistance(d.x), this._truncateDistance(d.y));
                } else {
                    var snap = this.snapOptions() || {};
                    var snapSize = Math.max(snap.size || DEFAULT_SNAP_SIZE, MIN_SNAP_SIZE);
                    return snap ? Math.floor(d / snapSize) * snapSize : d;
                }
            },
            snapOptions: function () {
                var editable = this.toolService.diagram.options.editable;
                var snap = ((editable || {}).drag || {}).snap || {};
                return snap;
            },
            shouldSnap: function () {
                var editable = this.toolService.diagram.options.editable;
                var drag = (editable || {}).drag;
                var snap = (drag || {}).snap;
                return editable !== false && drag !== false && snap !== false;
            },
            getCursor: function () {
                return Cursors.crosshair;
            }
        });

        /**
         * VectorToolService
         */
        var VectorToolService = ToolService.extend({

            /**
             * Constructor
             * @param diagram
             */
            init: function (diagram) {
                ToolService.fn.init.call(this, diagram);
                // Add new tools here
                this.tools.unshift(new PenTool(this));
                this.tools.unshift(new PolylineTool(this));
                this.tools.unshift(new ShapeTool(this));
            },

            /**
             * The base class _activeTool functoin only determines the tool to be used form mous e event corrdinates and keyboard options (meta ctrlKey, shiftKey, altKey)
             * We need to enrich meta with the the selected tool and configuration from the toolbar
             * @param p
             * @param meta
             * @private
             */
            _activateTool: function (p, meta) {
                meta = meta || {};

                ToolService.fn._activateTool.call(this, p, meta);
            },

            /**
             * Reset tool
             * @private
             */
            _resetTool: function () {
                // TODO
            }
        });

        /**
         * VectorResizingAdorner with rotation thumb
         */
        var VectorResizingAdorner = ResizingAdorner.extend({
            init: function (diagram, options) {
                ResizingAdorner.fn.init.call(this, diagram, options);
            },
            options: {
                editable: {
                    rotate: {
                        thumb: {
                            data: "M7.115,16C3.186,16,0,12.814,0,8.885C0,5.3,2.65,2.336,6.099,1.843V0l4.85,2.801l-4.85,2.8V3.758 c-2.399,0.473-4.21,2.588-4.21,5.126c0,2.886,2.34,5.226,5.226,5.226s5.226-2.34,5.226-5.226c0-1.351-0.513-2.582-1.354-3.51 l1.664-0.961c0.988,1.222,1.581,2.777,1.581,4.472C14.23,12.814,11.045,16,7.115,16L7.115,16z",
                            y: -30,
                            width: 16
                        }
                    }
                },
                offset: 10
            },
            _rotatable: function () {
                return this.options.editable && this.options.editable.rotate !== false;
            },
            _createHandles: function () {
                ResizingAdorner.fn._createHandles.call(this);
                this._createThumb();
            },
            _createThumb: function() {
                if (this._rotatable()) {
                    this.rotationThumb = new Path(this.options.editable.rotate.thumb);
                    this.visual.append(this.rotationThumb);
                }
            },
            _hitTest: function (p) {
                var tp = this.diagram.modelToLayer(p), i, hit, handleBounds, handlesCount = this.map.length, handle;
                if (this._angle) {
                    tp = tp.clone().rotate(this._bounds.center(), this._angle);
                }
                // BEGIN Added to handle rotation
                if (this._rotatable()) {
                    if (this._rotationThumbBounds && this._rotationThumbBounds.contains(tp)) {
                        return new Point(-1, -2);
                    }
                }
                // END Added to handle rotation
                if (this._resizable()) {
                    for (i = 0; i < handlesCount; i++) {
                        handle = this.map[i];
                        hit = new Point(handle.x, handle.y);
                        handleBounds = this._getHandleBounds(hit);
                        handleBounds.offset(this._bounds.x, this._bounds.y);
                        if (handleBounds.contains(tp)) {
                            return hit;
                        }
                    }
                }
                if (this._bounds.contains(tp)) {
                    return new Point(0, 0);
                }
            },
            redraw: function () {
                ResizingAdorner.fn.redraw.call(this);
                if (this.rotationThumb) {
                    this.rotationThumb.visible(this._rotatable());
                }
            }
        });

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * VectorDrawing widget
         */
        var VectorDrawing = Diagram.extend({
            init: function (element, options) {
                var that = this;
                kendo.destroy(element);
                Widget.fn.init.call(that, element, options);
                that._initTheme();
                that._initElements();
                that._extendLayoutOptions(that.options);
                that._initDefaults(options);
                that._interactionDefaults();
                that._initCanvas();
                // BEGIN: Add background layer
                this._artboard = $.extend(true, {}, this.options.artboard);
                that.backgroundLayer = new Group({ id: 'background-layer' });
                that.canvas.append(that.backgroundLayer);
                // END: Add background layer
                that.mainLayer = new Group({ id: 'main-layer' });
                that.canvas.append(that.mainLayer);
                // BEGIN: Add guide layer
                that.guideLayer = new Group({ id: 'guide-layer' });
                that.canvas.append(that.guideLayer);
                // END: Add guide layer
                that._shapesQuadTree = new ShapesQuadTree(that);
                that._pan = new Point();
                that._adorners = [];
                that.adornerLayer = new Group({ id: 'adorner-layer' });
                that.canvas.append(that.adornerLayer);
                that._createHandlers();
                that._initialize();
                // BEGIN Replace ResizingAdorner by VectorResizingAdorner
                that._resizingAdorner = new VectorResizingAdorner(that, { editable: that.options.editable });
                // END Replace ResizingAdorner by VectorResizingAdorner
                that._connectorsAdorner = new ConnectorsAdorner(that);
                that._adorn(that._resizingAdorner, true);
                that._adorn(that._connectorsAdorner, true);
                that.selector = new Selector(that);
                that._clipboard = [];
                that.pauseMouseHandlers = false;
                that._createGlobalToolBar();
                that._fetchFreshData();
                // that._createGlobalToolBar(); // Moved above
                that._createOptionElements();
                // BEGIN Update background layer
                that.scrollable.addClass('k-group');
                that._updateBackgroundLayer();
                that._updateGuideLayer();
                // END Update background layer
                that.zoom(that.options.zoom);
                that.canvas.draw();
                // Resize after drawing especially to center
                that._resize();
            },
            options: {
                name: 'VectorDrawing',
                toolbar: {},
                // TODO: fileName
                artboard: {
                    height: 480,
                    width: 640,
                    stroke: { // stroke is not exported to SVG or PNG, just shown for screen guides
                        width: 1,
                        color: '#808080'
                    },
                    fill: { // fill is exported to SVG and PNG
                        color: 'transparent'
                    }
                },
                connectionDefaults: {
                    stroke: {
                        color: '#808080',
                        width: 1
                    }
                },
                shapeDefaults: {
                    content: {
                        color: '#808080'
                    },
                    fill: {
                        color: 'transparent',
                        opacity: 1
                    },
                    stroke: {
                        color: '#808080',
                        width: 1
                    }
                }
            },
            /**
             * Update background layer
             * @private
             */
            _updateBackgroundLayer: function () {
                var height = this._artboard.height;
                var width = this._artboard.width;
                var fill = this._artboard.fill;
                var noStroke = { width: 0 };
                var backgroundOptions = {
                    x: 0,
                    y: 0,
                    height: height,
                    width: width,
                    fill: fill,
                    stroke: noStroke
                };
                if (this.backgroundLayer.children.length === 0) {
                    this.backgroundLayer.append(new Rectangle(backgroundOptions));
                } else {
                    this.backgroundLayer.children[0].redraw(backgroundOptions);
                }
            },
            _updateGuideLayer: function () {
                var height = this._artboard.height;
                var width = this._artboard.width;
                var stroke = this._artboard.stroke;
                var topGuideOptions = {
                    data: kendo.format(LINE_PATH, -ARTBOARD_GUIDE, 0, width + ARTBOARD_GUIDE, 0),
                    stroke: stroke
                }
                var rightGuideOptions = {
                    data: kendo.format(LINE_PATH, width, -ARTBOARD_GUIDE, width, height + ARTBOARD_GUIDE),
                    stroke: stroke
                }
                var bottomGuideOptions = {
                    data: kendo.format(LINE_PATH, -ARTBOARD_GUIDE, height, width + ARTBOARD_GUIDE, height),
                    stroke: stroke
                }
                var leftGuideOptions = {
                    data: kendo.format(LINE_PATH, 0, -ARTBOARD_GUIDE, 0, height + ARTBOARD_GUIDE),
                    stroke: stroke
                }
                var size = kendo.format('{0}x{1}', width, height);
                var sizeBox = new TextBlock({ text: size }).drawingElement.bbox();
                var sizeOptions = {
                    x: width - sizeBox.width() - ARTBOARD_GUIDE + sizeBox.height(),
                    y: height + ARTBOARD_GUIDE - sizeBox.height(),
                    text: size,
                    fill: { color: stroke.color } // Yep! same color as artboard guides
                };
                if (this.guideLayer.children.length === 0) {
                    this.guideLayer.append(new Path(topGuideOptions));
                    this.guideLayer.append(new Path(rightGuideOptions));
                    this.guideLayer.append(new Path(bottomGuideOptions));
                    this.guideLayer.append(new Path(leftGuideOptions));
                    this.guideLayer.append(new TextBlock(sizeOptions));
                } else {
                    this.guideLayer.children[0].redraw(topGuideOptions);
                    this.guideLayer.children[1].redraw(rightGuideOptions);
                    this.guideLayer.children[2].redraw(bottomGuideOptions);
                    this.guideLayer.children[3].redraw(leftGuideOptions);
                    this.guideLayer.children[4].redraw(sizeOptions);
                }
            },
            _panToCenter: function () {
                if (this.backgroundLayer && $.isArray(this.backgroundLayer.children) && this.backgroundLayer.children.length) {
                    var viewportBox = this.viewport();
                    var backgroundBox = this.backgroundLayer.drawingElement.bbox();
                    this.pan(
                        new diagram.Point(-(viewportBox.width - backgroundBox.width()) / 2, -(viewportBox.height - backgroundBox.height()) / 2)
                    );
                }
            },
            _zoomMainLayer: function () {
                var zoom = this._zoom;
                var transform = new CompositeTransform(0, 0, zoom, zoom);
                transform.render(this.backgroundLayer);
                transform.render(this.guideLayer);
                Diagram.fn._zoomMainLayer.call(this);
            },
            _transformMainLayer: function () {
                var pan = this._pan;
                var zoom = this._zoom;
                var transform = new CompositeTransform(pan.x, pan.y, zoom, zoom);
                transform.render(this.backgroundLayer);
                transform.render(this.guideLayer);
                Diagram.fn._transformMainLayer.call(this);
            },
            clear: function () {
                Diagram.fn.clear.call(this);
                // Keep the current artboard height/width
                this._artboard.fill.color = this.options.artboard.fill.color;
                this._updateBackgroundLayer();
            },
            /**
             * Replace ToolService with VectorToolService
             * @private
             */
            _createHandlers: function () {
                Diagram.fn._createHandlers.call(this);
                this.toolService = new VectorToolService(this);
            },
            /**
             * Replace Shape with VectorShape
             * @param dataItem
             * @param options
             * @private
             */
            _createShape: function (dataItem, options) {
                options = deepExtend({}, this.options.shapeDefaults, options);
                options.dataItem = dataItem;
                var shape = new VectorShape(options, this);
                return shape;
            },
            addShape: function (item, undoable) {
                var shape, shapeDefaults = this.options.shapeDefaults;
                if (item instanceof Shape) {
                    shape = item;
                } else if (!(item instanceof kendo.Class)) {
                    shapeDefaults = deepExtend({}, shapeDefaults, item || {});
                    shape = new VectorShape(shapeDefaults, this);
                } else {
                    return;
                }
                if (undoable !== false) {
                    this.undoRedoService.add(new diagram.AddShapeUnit(shape, this), false);
                }
                this.shapes.push(shape);
                if (shape.diagram !== this) {
                    this._shapesQuadTree.insert(shape);
                    shape.diagram = this;
                }
                this.mainLayer.append(shape.visual);
                this.trigger(CHANGE, {
                    added: [shape],
                    removed: []
                });
                return shape;
            },
            _addDataItem: function (dataItem, undoable) {
                if (!defined(dataItem)) {
                    return;
                }
                var shape = this._dataMap[dataItem.id];
                if (shape) {
                    return shape;
                }
                var options = deepExtend({}, this.options.shapeDefaults);
                options.dataItem = dataItem;
                shape = new VectorShape(options, this);
                this.addShape(shape, undoable !== false);
                this._dataMap[dataItem.id] = shape;
                return shape;
            },
            _addDataItemByUid: function (dataItem) {
                if (!defined(dataItem)) {
                    return;
                }
                var shape = this._dataMap[dataItem.uid];
                if (shape) {
                    return shape;
                }
                var options = deepExtend({}, this.options.shapeDefaults);
                options.dataItem = dataItem;
                shape = new VectorShape(options, this);
                this.addShape(shape);
                this._dataMap[dataItem.uid] = shape;
                return shape;
            },
            clone: function () {
                var json = this.serialize();
                json.options.id = diagram.randomId();
                if (this.diagram && this.diagram._isEditable && defined(this.dataItem)) {
                    json.options.dataItem = cloneDataItem(this.dataItem);
                }
                return new VectorShape(json.options);
            },
            /**
             * Replace DiagramToolBar with VectorDrawingToolBar
             * @private
             */
            _createGlobalToolBar: function () {
                this.toolBar = $('<div/>')
                    .prependTo(this.element)
                    .kendoVectorDrawingToolBar({
                        tools: this.options.toolbar.tools,
                        resizable: this.options.toolbar.resizable,
                        // click: $.proxy(this._toolBarClick, this),
                        action: $.proxy(this._onToolBarAction, this),
                        dialog: $.proxy(this._onToolBarDialog, this),
                        connectionDefaults: this.options.connectionDefaults,
                        shapeDefaults: this.options.shapeDefaults
                    })
                    .data('kendoVectorDrawingToolBar');
                // TODO implement toolBarClick for hooks!!!!!!!!!!!!!!!!
            },
            _selectionChanged: function (selected, deselected) {
                this.toolBar.refresh(selected);
                Diagram.fn._selectionChanged.call(this, selected, deselected);
            },
            _onToolBarDialog: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                this._openDialog(e.name, e.options);
            },
            _openDialog: function (name, options) {
                var dialog = kendo.vectordrawing.dialogs.create(name, options);
                if (!$.isArray(this._dialogs)) {
                    this._dialogs = [];
                }
                if (dialog) {
                    dialog.bind('action', this._onToolBarAction.bind(this));
                    dialog.bind('deactivate', this._destroyDialog.bind(this));
                    this._dialogs.push(dialog);
                    dialog.open();
                    return dialog;
                }
            },
            _onToolBarAction: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                // Note: as long as it is not too complex, we can use a dispatcher as below
                // In the future, maybe consider Command classes with execute methods that apply to a selection like in kendo.ui.spreadsheet
                switch (e.command) {
                    case 'ToolbarNewCommand':
                        this._onToolbarNew(e.params);
                        break;
                    case 'ToolbarOpenCommand':
                        this._onToolbarOpen(e.params);
                        break;
                    case 'ToolbarSaveCommand':
                        this._onToolbarSave(e.params);
                        break;
                    case 'DrawingToolChangeCommand':
                        this._onDrawingToolChange(e.params);
                        break;
                    case 'PropertyChangeCommand':
                        this._onPropertyChange(e.params);
                        break;
                    case 'ToolbarArrangeCommand':
                        this._onToolbarArrange(e.params);
                        break;
                    case 'ToolbarRemoveCommand':
                        this._onToolbarRemove(e.params);
                        break;
                    case 'GuidesChangeCommand':
                        this._onGuidesChange(e.params);
                        break;
                    default:
                        $.noop();
                }
            },
            _onToolbarNew: function () {
                this.clear();
            },
            _onToolbarOpen: function (params) {
                this.clear();
                this.open(params.file);
            },
            _onToolbarSave: function () {
                var that = this;
                that.exportSVG({ json: true })
                    .done(function (data) {
                        kendo.saveAs({
                            dataURI: data,
                            fileName: that._file && that._file.name || 'untitle.svg'
                        });
                    });
            },
            _onDrawingToolChange: function (params) {
                // the tool to be used is set by this.toolService._activateTool which is triggered by mouse events
            },
            _onPropertyChange: function (params) {
                assert.isPlainObject(params, kendo.format(assert.messages.isPlainObject.default, 'params'));
                if (params.property === 'background') {
                    this._artboard.fill.color = $.type(params.value) === STRING ? params.value : this.options.artboard.fill.color;
                    this._updateBackgroundLayer();
                } else {
                    var toolBar = this.toolBar;
                    toolBar._configuration[params.property] = params.value;
                    var selected = this.select();
                    for (var i = 0, length = selected.length; i < length; i++) {
                        selected[i].redraw(
                            toolBar.getConfiguration(selected[i]));
                    }
                }
            },
            _onToolbarArrange: function (params) {
                assert.isPlainObject(params, kendo.format(assert.messages.isPlainObject.default, 'params'));
                switch (params.value) {
                    case 'forward':
                        alert('Not yet implemented!');
                        break;
                    case 'front':
                        this.toFront(this.select());
                        break;
                    case 'back':
                        this.toBack(this.select());
                        break;
                    case 'backward':
                        alert('Not yet implemented!');
                        break;
                }
            },
            _onToolbarRemove: function (params) {
                this.remove(this.select());
            },
            _onGuidesChange: function (params) {
                // TODO Remember snap params.
                this.options.editable.drag.snap = false;
            },
            /**
             * Resizing
             */
            _resize: function () {
                this.toolBar.resize();
                Diagram.fn._resize.call(this);
                this._panToCenter();
            },
            /**
             * Export functions
             * Note: we need our own export functions:
             * 1) To add an svg viewBox, otherwise preserveAspectRatio won't work to resize images
             * 2) To account for panning and zooming so as to export WYSIWYG
             * 3) To clip to the bounds of the artboard
             * 4) To add a <script type:"application/json"> tag within <defs> so as to roundtrip persisted files
             * @param group
             * @returns {string}
             * @private
             */
            exportVisual: function () {
                var scale = geometry.transform().scale(1 / this._zoom);
                var wrap = new drawing.Group({ transform: scale });
                var root = this.mainLayer.drawingElement;
                var height = this._artboard.height;
                var width = this._artboard.width;
                var background = new drawing.Rect(
                    new geometry.Rect([0, 0], [width, height]),
                    { fill: this._artboard.fill, stroke: { width: 0 } }
                );
                var clipPath = new drawing.Path().moveTo(0, 0).lineTo(width, 0).lineTo(width, height).lineTo(0, height).close();
                wrap.children.push(background);
                wrap.children.push(root);
                wrap.clip(clipPath);
                return wrap;
            },
            exportSVG: function (options) {
                // return drawing.exportSVG(this.exportVisual(), options);
                if (options.json) { // options.json === true
                    options.json = this.save();
                    options.json.artboard = {
                        fill: this._artboard.fill,
                        height: this._artboard.height,
                        // stroke: this._artboard.stroke,
                        width: this._artboard.width
                    };
                }
                return exportSVG(this.exportVisual(), options);
            },
            exportImage: function (options) {
                // return drawing.exportImage(this.exportVisual(options), options);
                return exportImage(this.exportVisual(options), options);
            },
            /*
            exportPDF: function (options) {
                return draw.exportPDF(this.exportVisual(), options);
            }
            */
            /**
             * Open function
             * Preferably we have one import function which detects svg from other image file formats (gif, png, jpg)
             * 1) If an svg file contains a <script type:"application/json">, shapes and connectiosn are read from json and svg is discarded
             * 2) Otherwise (svg without script) or any other image format, a new image shape is added to the canvas/surface
             * @returns {string}
             * @private
             */
            open: function (source) {
                var that = this;
                // this.clear();
                if (source instanceof window.File) {
                    return that._openFile(source)
                        .always(function () {
                            that.toolBar._resetFileInput();
                        });
                } else if (RX_URL.test(source)) {
                    return that._openUrl(source);
                }
            },
            _openFile: function (file) {
                assert.instanceof(window.File, file, kendo.format(assert.messages.instanceof.default, 'file', 'window.File'));
                var dfd = $.Deferred();
                var that = this;
                if (file.type.match(/^image\//)) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var source = e.target.result;
                        var json = false;
                        var prefix = 'data:image/svg+xml;base64,';
                        var pos0 = source.indexOf(prefix);
                        if (file.type === 'image/svg+xml' && pos0 === 0) {
                            var svg = window.atob(source.substr(prefix.length));
                            var tag1 = '<script type="application/json">';
                            var tag2 = '</script>';
                            var pos1 = svg.indexOf(tag1);
                            var pos2 = svg.indexOf(tag2);
                            if (pos1 > -1 && pos2 > pos1 + tag1.length) {
                                json = svg.substr(pos1 + tag1.length, pos2 - pos1 - tag1.length);
                            }
                        }
                        if (json) {
                            try {
                                that.load(JSON.parse(json));
                                that._updateBackgroundLayer();
                                that._updateGuideLayer();
                                that._resize();
                                dfd.resolve();
                            } catch (e) {
                                dfd.reject(e);
                            }
                        }
                        else {
                            that._loadImage(source)
                                .done(dfd.resolve)
                                .fail(dfd.reject);
                        }
                    };
                    reader.onerror = function (e) {
                        dfd.reject(new Error('Unable to load file'));
                    };
                    // Read in the image file as a data URL.
                    reader.readAsDataURL(file);
                } else {
                    dfd.reject(new Error(kendo.format('`[0]` has unsupported type `{1}`', file.name, file.type)));
                }
                return dfd.promise();
            },
            _openUrl: function (url) {
                assert.match(RX_URL, url, kendo.format(assert.messages.match.default, 'url', RX_URL));
                var that = this;
                var dfd = $.deferred();
                $.get({
                    url: url
                    // TODO cache and cors
                })
                    .done(function (data) {
                        debugger;
                    })
                    fail(function (xhr, status, error) {
                        debugger;
                    });
                return dfd.promise();
            },
            _loadImage: function (source) {
                var that = this;
                var dfd = $.Deferred();
                // Note: we could have added the shape directly
                // but we would not have detected a load error
                var img = $('<img/>')
                    .appendTo('body')
                    .css({
                        position: 'absolute',
                        top: 0,
                        left: -10000
                    })
                    .on('load', function (e) {
                        that._artboard.height = img.height();
                        that._artboard.width = img.width();
                        that._artboard.fill.color = that.options.artboard.fill.color;
                        that.addShape({
                            type: 'image',
                            x: 0,
                            y: 0,
                            height: img.height(),
                            width: img.width(),
                            source: source
                        });
                        that._updateBackgroundLayer();
                        that._updateGuideLayer();
                        that.resize(true);
                        img.off().remove();
                        dfd.resolve();
                    })
                    .on('error', function () {
                        dfd.reject(new Error('Unable to load image data'));
                    })
                    .attr('src', source);
                return dfd.promise();
            },
            /**
             * Destroy functions
             * @private
             */
            _destroyDialog: function () {
                this._dialogs.pop();
            },
            _destroyGlobalToolBar: function () {
                if (this.toolBar) {
                    this.toolBar.hide();
                    this.toolBar.destroy();
                    this.toolBar = null;
                }
            }
        });

        ui.plugin(VectorDrawing);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
