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
        var Class = kendo.Class;
        var dataviz = kendo.dataviz;
        var diagram = dataviz.diagram;
        var ui = dataviz.ui;
        var Widget = kendo.ui.Widget;
        var Diagram = ui.Diagram;
        var Cursors = diagram.Cursors;
        Cursors.crosshair = 'crosshair';
        var Circle = diagram.Circle;
        var Group = diagram.Group;
        var Image = diagram.Image;
        var Path = diagram.Path;
        var Point = diagram.Point;
        var Rectangle = diagram.Rectangle;
        var Selector = diagram.Selector;
        var Shape = diagram.Shape;
        var ShapesQuadTree = diagram.ShapesQuadTree;
        var TextBlock = diagram.TextBlock;
        var ToolService = diagram.ToolService;
        var ConnectorsAdorner = diagram.ConnectorsAdorner;
        var ResizingAdorner = diagram.ResizingAdorner;
        var CHANGE = 'change';
        var DRAG = 'drag';
        var DRAG_END = 'dragEnd';
        var DRAG_START = 'dragStart';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

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
                return deepExtend(
                    Shape.fn._visualOptions.call(this, options),
                    {
                        text: options.text,
                        startCap: options.startCap,
                        endCap: options.endCap
                    }
                );
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
            tryActivate: function () {
                return this.toolService._selectedTool && this.toolService._selectedTool.type === 'PenTool';
            },
            start: function (p, meta) {
                var toolService = this.toolService;
                var diagram = toolService.diagram;
                // var connector = toolService._hoveredConnector;
                // var connection = diagram._createConnection({}, connector._c, p);
                var shape = diagram._createShape({}, {
                    type: 'path',
                    x: p.x,
                    y: p.y,
                    radius: 0,
                    // height: 0,
                    // width: 0,
                    minHeight: 0,
                    maxHeight: 0,
                    fill: {
                        color: '#0000ff'
                    },
                    stroke: {
                        color: '#000000',
                        width: 5
                    }
                });
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
                var x = p.x > shape._bounds.x ? shape._bounds.x : p.x;
                var y = p.y > shape._bounds.y ? shape._bounds.y : p.y;
                var width = p.x > shape._bounds.x ? p.x - shape._bounds.x : shape._bounds.x + shape._bounds.width - p.x;
                var height = p.y > shape._bounds.y ? p.y - shape._bounds.y : shape._bounds.y + shape._bounds.height - p.y;
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
                toolService._selectedTool = undefined;
            },
            getCursor: function () {
                return Cursors.crosshair;
            }
        });

        /**
         * PolyLine tool
         */
        var PolyLineTool = Class.extend({
            init: function (toolService) {
                this.toolService = toolService;
                this.type = 'PolyLineTool';
            },
            tryActivate: function () {
                return this.toolService._selectedTool && this.toolService._selectedTool.type === 'PolyLineTool';
            },
            start: function (p, meta) {
                var toolService = this.toolService;
                var diagram = toolService.diagram;
                // var connector = toolService._hoveredConnector;
                // var connection = diagram._createConnection({}, connector._c, p);
                var shape = diagram._createShape({}, {
                    type: 'path',
                    x: p.x,
                    y: p.y,
                    radius: 0,
                    // height: 0,
                    // width: 0,
                    minHeight: 0,
                    maxHeight: 0,
                    fill: {
                        color: '#0000ff'
                    },
                    stroke: {
                        color: '#000000',
                        width: 5
                    }
                });
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
                var x = p.x > shape._bounds.x ? shape._bounds.x : p.x;
                var y = p.y > shape._bounds.y ? shape._bounds.y : p.y;
                var width = p.x > shape._bounds.x ? p.x - shape._bounds.x : shape._bounds.x + shape._bounds.width - p.x;
                var height = p.y > shape._bounds.y ? p.y - shape._bounds.y : shape._bounds.y + shape._bounds.height - p.y;
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
                toolService._selectedTool = undefined;
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
            tryActivate: function () {
                return this.toolService._selectedTool && this.toolService._selectedTool.type === 'ShapeTool';
            },
            start: function (p, meta) {
                var toolService = this.toolService;
                var diagram = toolService.diagram;
                // var connector = toolService._hoveredConnector;
                // var connection = diagram._createConnection({}, connector._c, p);
                var shape = diagram._createShape({}, deepExtend(
                    this.toolService._selectedTool.options,
                    {
                        x: p.x,
                        y: p.y,
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
                var x = p.x > shape._bounds.x ? shape._bounds.x : p.x;
                var y = p.y > shape._bounds.y ? shape._bounds.y : p.y;
                var width = p.x > shape._bounds.x ? p.x - shape._bounds.x : shape._bounds.x + shape._bounds.width - p.x;
                var height = p.y > shape._bounds.y ? p.y - shape._bounds.y : shape._bounds.y + shape._bounds.height - p.y;
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
                toolService._selectedTool = undefined;
            },
            getCursor: function () {
                return Cursors.crosshair;
            }
        });

        /**
         * VectorToolService
         */
        var VectorToolService = ToolService.extend({
            init: function (diagram) {
                ToolService.fn.init.call(this, diagram);
                // Add new tools here
                this.tools.unshift(new PenTool(this));
                this.tools.unshift(new PolyLineTool(this));
                this.tools.unshift(new ShapeTool(this));
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
                that.mainLayer = new Group({ id: 'main-layer' });
                that.canvas.append(that.mainLayer);
                that._shapesQuadTree = new ShapesQuadTree(that);
                that._pan = new Point();
                that._adorners = [];
                that.adornerLayer = new Group({ id: 'adorner-layer' });
                that.canvas.append(that.adornerLayer);
                that._createHandlers();
                that._initialize();
                // BEGIN Replaced ResizingAdorner by VectorResizingAdorner
                that._resizingAdorner = new VectorResizingAdorner(that, { editable: that.options.editable });
                // END Replaced ResizingAdorner by VectorResizingAdorner
                that._connectorsAdorner = new ConnectorsAdorner(that);
                that._adorn(that._resizingAdorner, true);
                that._adorn(that._connectorsAdorner, true);
                that.selector = new Selector(that);
                that._clipboard = [];
                that.pauseMouseHandlers = false;
                that._fetchFreshData();
                that._createGlobalToolBar();
                that._createOptionElements();
                that.zoom(that.options.zoom);
                that.canvas.draw();
            },
            options: {
                name: 'VectorDrawing',
                toolbar: {}
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
                    action: $.proxy(this._onToolBarAction, this),
                    dialog: $.proxy(this._onToolBarDialog, this)
                })
                .data('kendoVectorDrawingToolBar');
                this._resize();
                // TODO implement toolBarClick!!!!!!!!!!!!!!!!
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
                    var element;
                    if ($.isPlainObject(this._selection)) {
                        element = this._getElementByUid(this._selection.uid);
                    }
                    dialog.open(element);
                    return dialog;
                }
            },
            _onToolBarAction: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                // Note: as long as it is not too complex, we can use a dispatcher like below
                // In the future, maybe consider Command classes with execute methods that apply to a selection like in kendo.ui.spreadsheet
                switch (e.command) {
                    case 'DrawingToolChangeCommand':
                        // TODO: Extend e.params.options with formatting configuration from toolbar here
                        deepExtend(e.params.options, { fill: { color: 'red'} })
                        this._onToolChange(e.params);
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
                    default:
                        $.noop();
                }
            },
            _onToolChange: function (params) {
                this.toolService._selectedTool = {
                    type: params.value,
                    options: params.options
                };
            },
            _onPropertyChange: function (options) {
                assert.isPlainObject(options, kendo.format(assert.messages.isPlainObject.default, 'options'));
                var that = this;
                if (options.property === 'tool')
                    switch (options.property) {
                        case 'fillColor':
                            that._configuration.fill.color = options.value;
                            break;
                        case 'strokeColor':
                            that._configuration.stroke.color = options.value;
                            break;
                        case 'strokeWidth':
                            that._configuration.stroke.width = options.value;
                            break;
                        case 'strokeType':
                            that._configuration.stroke.dashType = options.value;
                            break;
                        case 'bold':
                        case 'italic':
                            that._configuration.fontStyle = options.property;
                            break;
                        case 'fontSize':
                            that._configuration.font.fontSize = options.value;
                            break;
                        case 'fontFamily':
                            that._configuration.font.fontFamily = options.value;
                            break;
                    }
            },
            _onToolbarArrange: function (options) {
                assert.isPlainObject(options, kendo.format(assert.messages.isPlainObject.default, 'options'));
                switch (options.value) {
                    case 'forward':
                        // TODO
                        break;
                    case 'front':
                        this.toFront(this.select());
                        break;
                    case 'back':
                        this.toBack(this.select());
                        break;
                    case 'backward':
                        // TODO
                        break;
                }
            },
            _onToolbarRemove: function (options) {
                this.remove(this.select());
            },
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
