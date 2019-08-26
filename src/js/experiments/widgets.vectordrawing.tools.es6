/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import 'kendo.core';
import 'kendo.drawing';
import 'kendo.dataviz.diagram';

var DRAG = 'drag';
var DRAG_END = 'dragEnd';
var DRAG_START = 'dragStart';
var DEFAULT_SNAP_SIZE = 10;
var MIN_SNAP_SIZE = 5;

const {
    attr,
    Class,
    dataviz: {
        diagram: {
            Circle,
            Cursors,
            Image,
            Path,
            Polyline,
            Point,
            randomId,
            Rectangle,
            ResizingAdorner,
            Shape,
            TextBlock,
            ToolService
        }
    },
    drawing: {
        util: { defined }
    }
} = window.kendo;

Cursors.crosshair = 'crosshair';

/**
 * Vector Shape
 * Note: Specialized diagram.Shape for displaying text in TextBlock and for Polyline tool
 * @class VectorShape
 * @extends Shape
 */
export const VectorShape = Shape.extend({
    /**
     * Constructor
     */
    init(options, diagram) {
        Shape.fn.init.call(this, options, diagram);
    },

    /**
     * _visualOptions
     * @param options
     * @private
     */
    _visualOptions(options) {
        return {
            // From Shape.fn._visualOptions
            data: options.path,
            source: options.source,
            hover: options.hover,
            fill: options.fill,
            stroke: options.stroke,
            // BEGIN Added by JLC
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
            // END Added by JLC
        };
    },

    /**
     * clone
     */
    clone() {
        const json = this.serialize();
        json.options.id = randomId();
        if (
            this.diagram &&
            this.diagram._isEditable &&
            defined(this.dataItem)
        ) {
            json.options.dataItem = cloneDataItem(this.dataItem);
        }
        // return new Shape(json.options);
        return new VectorShape(json.options);
    },

    /* This function's cyclomatic complexity is too high. */
    /* jshint -W074 */

    /**
     * createShapeVisual
     */
    createShapeVisual() {
        /* jshint maxcomplexity: 8 */
        const options = this.options;
        const visualOptions = this._visualOptions(options);
        const visualTemplate = options.visual;
        const type = `${options.type}`.toLocaleLowerCase();
        let shapeVisual;
        visualOptions.width = options.width;
        visualOptions.height = options.height;
        if (isFunction(visualTemplate)) {
            shapeVisual = visualTemplate.call(this, options);
        } else if (visualOptions.data) {
            shapeVisual = new Path(visualOptions);
            translateToOrigin(shapeVisual);
        } else if (type === 'rectangle') {
            shapeVisual = new Rectangle(visualOptions);
        } else if (type === 'circle') {
            shapeVisual = new Circle(visualOptions);
        } else if (type === 'text') {
            shapeVisual = new TextBlock(visualOptions);
        } else if (type === 'image') {
            shapeVisual = new Image(visualOptions);
            // BEGIN Added by JLC
            // polyline
        } else if (type === 'polyline') {
            shapeVisual = new Polyline(visualOptions);
            // END Added by JLC
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
const PenTool = Class.extend({
    init(toolService) {
        this.toolService = toolService;
        this.type = 'PenTool';
    },
    tryActivate(p, meta) {
        let ret;
        if (this.type === this.toolService.selectedTool) {
            this.options === meta.options;
            ret = true;
        }
        return ret;
    },
    start(p, meta) {
        const toolService = this.toolService;
        const diagram = toolService.diagram;
        const shape = (toolService.activeShape = diagram._createShape(
            {},
            {
                type: 'polyline',
                points: [{ x: 0, y: 0 }],
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
            }
        ));
        if (
            canDrag(shape) &&
            !diagram.trigger(DRAG_START, {
                shapes: [shape],
                connections: []
            }) &&
            diagram._addShape(shape)
        ) {
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
    move(p) {
        const toolService = this.toolService;
        const shape = toolService.activeShape;
        const bounds = shape.bounds();
        const left = Math.min(bounds.x, p.x);
        const right = Math.max(bounds.x + bounds.width, p.x);
        const top = Math.min(bounds.y, p.y);
        const bottom = Math.max(bounds.y + bounds.height, p.y);
        const newBounds = new diagram.Rect(
            left,
            top,
            right - left,
            bottom - top
        );
        const offset = new Point(
            bounds.x - newBounds.x,
            bounds.y - newBounds.y
        );
        const points = shape.shapeVisual.points().slice();
        for (let i = 0, length = points.length; i < length; i++) {
            points[i].x += offset.x;
            points[i].y += offset.y;
        }
        points.push(p.minus(newBounds.topLeft()));
        shape.redraw({
            type: 'polyline',
            points,
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
    end(p) {
        const toolService = this.toolService;
        const shape = toolService.activeShape;
        const d = toolService.diagram;
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
         } else if (hoveredItem && hoveredItem instanceof Shape) {
         target = hoveredItem.getConnector(AUTO) || hoveredItem.getConnector(p);
         } else {
         target = p;
         }
         connection.target(target);
         */
        // Modify position
        if (!shape) {
            return;
        }
        if (
            !d.trigger(DRAG_END, {
                shapes: [shape],
                connections: []
            })
        ) {
            shape.updateModel();
            d._syncShapeChanges();
            toolService.selectSingle(shape, {});
        } else {
            d.remove(shape, false);
            d.undoRedoService.pop();
        }
        toolService._resetTool(); // Sets the pointer tool
    },
    getCursor() {
        return Cursors.crosshair;
    }
});

/**
 * Polyline tool
 */
export const PolylineTool = Class.extend({
    init(toolService) {
        this.toolService = toolService;
        this.type = 'PolylineTool';
    },
    tryActivate(p, meta) {
        if (this.type === this.toolService.selectedTool) {
            this.options === meta.options;
            return true;
        }
    },
    start(p, meta) {
        const toolService = this.toolService;
        const diagram = toolService.diagram;
        const shape = (toolService.activeShape = diagram._createShape(
            {},
            {
                type: 'polyline',
                points: [{ x: 0, y: 0 }],
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
            }
        ));
        if (
            canDrag(shape) &&
            !diagram.trigger(DRAG_START, {
                shapes: [shape],
                connections: []
            }) &&
            diagram._addShape(shape)
        ) {
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
    move(p) {
        const toolService = this.toolService;
        const shape = toolService.activeShape;
        const bounds = shape.bounds();
        const left = Math.min(bounds.x, p.x);
        const right = Math.max(bounds.x + bounds.width, p.x);
        const top = Math.min(bounds.y, p.y);
        const bottom = Math.max(bounds.y + bounds.height, p.y);
        const newBounds = new diagram.Rect(
            left,
            top,
            right - left,
            bottom - top
        );
        const offset = new Point(
            bounds.x - newBounds.x,
            bounds.y - newBounds.y
        );
        const points = shape.shapeVisual.points().slice();
        for (let i = 0, length = points.length; i < length; i++) {
            points[i].x += offset.x;
            points[i].y += offset.y;
        }
        points.push(p.minus(newBounds.topLeft()));
        shape.redraw({
            type: 'polyline',
            points,
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
    end(p) {
        const toolService = this.toolService;
        const shape = toolService.activeShape;
        const d = toolService.diagram;
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
         } else if (hoveredItem && hoveredItem instanceof Shape) {
         target = hoveredItem.getConnector(AUTO) || hoveredItem.getConnector(p);
         } else {
         target = p;
         }
         connection.target(target);
         */
        // var shape = toolService.activeShape;
        // Modify position
        if (!shape) {
            return;
        }
        if (
            !d.trigger(DRAG_END, {
                shapes: [shape],
                connections: []
            })
        ) {
            shape.updateModel();
            d._syncShapeChanges();
            toolService.selectSingle(shape, {});
        } else {
            d.remove(shape, false);
            d.undoRedoService.pop();
        }
        toolService._resetTool(); // Sets the pointer tool
    },
    getCursor() {
        return Cursors.crosshair;
    }
});

/**
 * Shape tool
 */
export const ShapeTool = Class.extend({
    init(toolService) {
        this.toolService = toolService;
        this.type = 'ShapeTool';
    },
    tryActivate(p, meta) {
        if (this.type === this.toolService.selectedTool) {
            this.options === meta.options;
            return true;
        }
    },
    start(p, meta) {
        const toolService = this.toolService;
        const diagram = toolService.diagram;
        const pos = this._truncateDistance(p);
        // var connector = toolService._hoveredConnector;
        // var connection = diagram._createConnection({}, connector._c, p);
        const shape = diagram._createShape(
            {},
            deepExtend(
                {
                    x: pos.x,
                    y: pos.y,
                    minWidth: 0,
                    width: 0,
                    minHeight: 0,
                    height: 0,
                    radius: 0
                },
                this.toolService.options
            )
        );
        if (
            canDrag(shape) &&
            !diagram.trigger(DRAG_START, {
                shapes: [shape],
                connections: []
            }) &&
            diagram._addShape(shape)
        ) {
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
    move(p) {
        const toolService = this.toolService;
        const shape = toolService.activeShape;
        const pos = this._truncateDistance(p);
        const x = pos.x > shape._bounds.x ? shape._bounds.x : pos.x;
        const y = pos.y > shape._bounds.y ? shape._bounds.y : pos.y;
        const width =
            pos.x > shape._bounds.x
                ? pos.x - shape._bounds.x
                : shape._bounds.x + shape._bounds.width - pos.x;
        const height =
            pos.y > shape._bounds.y
                ? pos.y - shape._bounds.y
                : shape._bounds.y + shape._bounds.height - pos.y;
        shape._setOptionsFromModel({
            x,
            y,
            width,
            height
        });
        // connection.target(p);
        toolService.diagram.trigger(DRAG, {
            shapes: [shape],
            connections: []
        });
        return true;
    },
    end(p) {
        const toolService = this.toolService;
        const d = toolService.diagram;
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
         } else if (hoveredItem && hoveredItem instanceof Shape) {
            target = hoveredItem.getConnector(AUTO) || hoveredItem.getConnector(p);
         } else {
            target = p;
         }
         connection.target(target);
         */
        const shape = toolService.activeShape;
        // Modify position
        if (!shape) {
            return;
        }
        if (
            !d.trigger(DRAG_END, {
                shapes: [shape],
                connections: []
            })
        ) {
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
    _truncateDistance(d) {
        if (d instanceof Point) {
            return new Point(
                this._truncateDistance(d.x),
                this._truncateDistance(d.y)
            );
        }
        const snap = this.snapOptions() || {};
        const snapSize = Math.max(
            snap.size || DEFAULT_SNAP_SIZE,
            MIN_SNAP_SIZE
        );
        return snap ? Math.floor(d / snapSize) * snapSize : d;
    },
    snapOptions() {
        const editable = this.toolService.diagram.options.editable;
        const snap = ((editable || {}).drag || {}).snap || {};
        return snap;
    },
    shouldSnap() {
        const editable = this.toolService.diagram.options.editable;
        const drag = (editable || {}).drag;
        const snap = (drag || {}).snap;
        return editable !== false && drag !== false && snap !== false;
    },
    getCursor() {
        return Cursors.crosshair;
    }
});

/**
 * VectorToolService
 * Note Specialized diagram.ToolService to add new tools
 */
export const VectorToolService = ToolService.extend({
    /**
     * Constructor
     * @param diagram
     */
    init(diagram) {
        ToolService.fn.init.call(this, diagram);
        // Add new tools here
        this.tools.unshift(new PenTool(this));
        this.tools.unshift(new PolylineTool(this));
        this.tools.unshift(new ShapeTool(this));
    },

    /**
     * The base class _activateTool method only determines the tool to be used form mouse event coordinates and keyboard options (meta ctrlKey, shiftKey, altKey)
     * We need to enrich meta with the the selected tool and configuration from the toolbar
     * @param p
     * @param meta
     * @private
     */
    _activateTool(p, meta) {
        meta = deepExtend({}, meta);

        ToolService.fn._activateTool.call(this, p, meta);
    },

    /**
     * Reset tool
     * @private
     */
    _resetTool() {
        // Note: there would have been a better way if the toolbar state was an observable
        // but we not only need to reset the tool but also change the toolbar selection accordingly
        this.diagram.toolBar.element
            .find(`a[${attr('tool')}="select"]`)
            .click();
    }
});

/**
 * VectorResizingAdorner with rotation thumb
 */
export const VectorResizingAdorner = ResizingAdorner.extend({
    init(diagram, options) {
        ResizingAdorner.fn.init.call(this, diagram, options);
    },
    options: {
        editable: {
            rotate: {
                thumb: {
                    data:
                        'M7.115,16C3.186,16,0,12.814,0,8.885C0,5.3,2.65,2.336,6.099,1.843V0l4.85,2.801l-4.85,2.8V3.758 c-2.399,0.473-4.21,2.588-4.21,5.126c0,2.886,2.34,5.226,5.226,5.226s5.226-2.34,5.226-5.226c0-1.351-0.513-2.582-1.354-3.51 l1.664-0.961c0.988,1.222,1.581,2.777,1.581,4.472C14.23,12.814,11.045,16,7.115,16L7.115,16z',
                    y: -30,
                    width: 16
                }
            }
        },
        offset: 10
    },
    _rotatable() {
        return this.options.editable && this.options.editable.rotate !== false;
    },
    _createHandles() {
        ResizingAdorner.fn._createHandles.call(this);
        this._createThumb();
    },
    _createThumb() {
        if (this._rotatable()) {
            this.rotationThumb = new Path(this.options.editable.rotate.thumb);
            this.visual.append(this.rotationThumb);
        }
    },

    _hitTest(p) {
        let tp = this.diagram.modelToLayer(p);
        let i;
        let hit;
        let handleBounds;
        const handlesCount = this.map.length;
        let handle;
        if (this._angle) {
            tp = tp.clone().rotate(this._bounds.center(), this._angle);
        }
        // BEGIN Added to handle rotation
        if (this._rotatable()) {
            if (
                this._rotationThumbBounds &&
                this._rotationThumbBounds.contains(tp)
            ) {
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

    redraw() {
        ResizingAdorner.fn.redraw.call(this);
        if (this.rotationThumb) {
            this.rotationThumb.visible(this._rotatable());
        }
    }
});
