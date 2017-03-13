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
        './vendor/kendo/kendo.drawing',
        './vendor/kendo/kendo.toolbar'
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
        var Color = kendo.Color;
        var DataSource = data.DataSource;
        var Surface = drawing.Surface;
        var Widget = kendo.ui.Widget;
        var ToolBar = kendo.ui.ToolBar;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.selection');
        var NUMBER = 'number';
        var STRING = 'string';
        // var NULL = 'null';
        var UNDEFINED = 'undefined';
        var DOT = '.';
        var HASH = '#';
        var WIDGET = 'kendoSelector';
        var NS = DOT + WIDGET;
        var CHANGE = 'change';
        var MOUSEDOWN = 'mousedown' + NS + ' ' + 'touchstart' + NS;
        var MOUSEMOVE = 'mousemove' + NS + ' ' + 'touchmove' + NS;
        var MOUSEUP = 'mouseup' + NS + ' ' + 'touchend' + NS;
        var TOGGLE = 'toggle';
        var DIV = '<div/>';
        var ROLE = 'selector';
        var ID = 'id';
        var WIDGET_CLASS = 'kj-selector';
        var SURFACE_CLASS = WIDGET_CLASS + '-surface';
        var INTERACTIVE_CLASS = 'kj-interactive';
        var DATA_TYPE = 'selection';
        var MIN_DIAGONAL = 30;
        var LINE_HW_PROPORTION = 0.2;
        var SHAPE_HIT_DISTANCE = 10;
        var CROSS_CURVE = 0.5;

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        var util = {

            /**
             * Build a random hex string of length characters
             * @param length
             * @returns {string}
             */
            randomString: function (length) {
                var s = new Array(length + 1).join('x');
                return s.replace(/x/g, function (c) {
                    /* jshint -W016 */
                    return (Math.random() * 16|0).toString(16);
                    /* jshint +W016 */
                });
            },

            /**
             * Get the mouse (or touch) position
             * @param e
             * @param stage
             * @returns {{x: *, y: *}}
             */
            getMousePosition: function (e, stage) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof($, stage, kendo.format(assert.messages.instanceof.default, 'stage', 'jQuery'));
                // See http://www.jacklmoore.com/notes/mouse-position/
                // See http://www.jqwidgets.com/community/topic/dragend-event-properties-clientx-and-clienty-are-undefined-on-ios/
                // See http://www.devinrolsen.com/basic-jquery-touchmove-event-setup/
                // ATTENTION: e.originalEvent.changedTouches instanceof TouchList, not Array
                var originalEvent = e.originalEvent;
                var clientX = originalEvent && originalEvent.changedTouches ? originalEvent.changedTouches[0].clientX : e.clientX;
                var clientY = originalEvent && originalEvent.changedTouches ? originalEvent.changedTouches[0].clientY : e.clientY;
                // IMPORTANT: Position is relative to the stage and e.offsetX / e.offsetY do not work in Firefox
                // var stage = $(e.target).closest('.kj-stage').find(kendo.roleSelector('stage'));
                var ownerDocument = $(stage.get(0).ownerDocument);
                var stageOffset = stage.offset();
                var mouse = {
                    x: clientX - stageOffset.left + ownerDocument.scrollLeft(),
                    y: clientY - stageOffset.top + ownerDocument.scrollTop()
                };
                return mouse;
            },

            /**
             * Get the position of the center of an element
             * @param element
             * @param stage
             * @param scale
             */
            getElementCenter: function (element, stage, scale) {
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'element', 'jQuery'));
                assert.instanceof($, stage, kendo.format(assert.messages.instanceof.default, 'stage', 'jQuery'));
                assert.type(NUMBER, scale, kendo.format(assert.messages.type.default, 'scale', NUMBER));
                // We need getBoundingClientRect to especially account for rotation
                var rect = element[0].getBoundingClientRect();
                var ownerDocument = $(stage.get(0).ownerDocument);
                var stageOffset = stage.offset();
                return {
                    left: (rect.left - stageOffset.left + rect.width / 2  + ownerDocument.scrollLeft()) / scale,
                    top: (rect.top - stageOffset.top + rect.height / 2 + ownerDocument.scrollTop()) / scale
                };
            },

            /**
             * Get the scale of an element's CSS transformation
             * Note: the same function is used in kidoju.widgets.stage
             * @param element
             * @returns {Number|number}
             */
            getTransformScale: function (element) {
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'element', 'jQuery'));
                // element.css('transform') returns a matrix, so we have to read the style attribute
                var match = (element.attr('style') || '').match(/scale\([\s]*([0-9\.]+)[\s]*\)/);
                return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 1 : 1;
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Detect the shape of a path (circle, cross, line) among a list of shapes
             * @param path
             * @param shapes
             */
            detectShape: function (path, shapes) {
                assert.instanceof(drawing.Path, path, kendo.format(assert.messages.instanceof.default, 'path', 'kendo.drawing.Path'));
                assert.isArray(shapes, kendo.format(assert.messages.isArray.default, 'shapes'));
                assert.hasLength(shapes, kendo.format(assert.messages.hasLength.default, 'shapes'));
                if (shapes.length === 1) {
                    return shapes[0];
                }
                var bbox = path.bbox();
                var x = Math.floor(bbox.origin.x);
                var y = Math.floor(bbox.origin.y);
                var height = Math.floor(bbox.size.height);
                var width = Math.floor(bbox.size.width);
                // Detect a line (height / width ratio)
                if (height / width < LINE_HW_PROPORTION && shapes.indexOf(SelectorSurface.fn.shapes.line) > -1) {
                    return SelectorSurface.fn.shapes.line;
                }
                if (shapes.indexOf(SelectorSurface.fn.shapes.circle) === -1 && shapes.indexOf(SelectorSurface.fn.shapes.cross) > -1) {
                    return SelectorSurface.fn.shapes.cross;
                } else if (shapes.indexOf(SelectorSurface.fn.shapes.circle) > -1 && shapes.indexOf(SelectorSurface.fn.shapes.cross) === -1) {
                    return SelectorSurface.fn.shapes.circle;
                } else if (shapes.indexOf(SelectorSurface.fn.shapes.circle) > -1 && shapes.indexOf(SelectorSurface.fn.shapes.cross) > -1) {
                    // Detect a circle (shape nears top, right, bottom and left)
                    var topPoint = new geometry.Point(x + width / 2, y);
                    var rightPoint = new geometry.Point(x + width, y + height / 2);
                    var bottomPoint = new geometry.Point(x + width / 2, y + height);
                    var leftPoint = new geometry.Point(x, y + height / 2);
                    var hitTop = false;
                    var hitRight = false;
                    var hitBottom = false;
                    var hitLeft = false;
                    for (var i = 0, length = path.segments.length; i < length; i++) {
                        var segment = path.segments[i];
                        if (!hitTop) {
                            hitTop = segment.anchor().distanceTo(topPoint) < SHAPE_HIT_DISTANCE;
                        }
                        if (!hitRight) {
                            hitRight = segment.anchor().distanceTo(rightPoint) < SHAPE_HIT_DISTANCE;
                        }
                        if (!hitBottom) {
                            hitBottom = segment.anchor().distanceTo(bottomPoint) < SHAPE_HIT_DISTANCE;
                        }
                        if (!hitLeft) {
                            hitLeft = segment.anchor().distanceTo(leftPoint) < SHAPE_HIT_DISTANCE;
                        }
                        if (hitTop && hitRight && hitBottom && hitLeft) {
                            break;
                        }
                    }
                    if (hitTop && hitRight && hitBottom && hitLeft) {
                        return SelectorSurface.fn.shapes.circle;
                    } else {
                        // Otherwise let's assume it is a cross
                        return SelectorSurface.fn.shapes.cross;
                    }
                }
            },

            /* jshint +W074 */

            /**
             * Get a selection data item for dataSource from a user-drawn path
             * @param path
             * @param color
             * @param shapes
             */
            getDataItem: function (path, color, shapes) {
                assert.instanceof(drawing.Path, path, kendo.format(assert.messages.instanceof.default, 'path', 'kendo.drawing.Path'));
                assert.type(STRING, color, kendo.format(assert.messages.type.default, 'color', STRING));
                assert.isArray(shapes, kendo.format(assert.messages.isArray.default, 'shapes'));
                assert.hasLength(shapes, kendo.format(assert.messages.hasLength.default, 'shapes'));
                var bbox = path.bbox();
                var height = Math.floor(bbox.size.height);
                var width = Math.floor(bbox.size.width);
                // If the user-drawn path is too small, discard
                if (Math.sqrt(Math.pow(height, 2) + Math.pow(width, 2)) > MIN_DIAGONAL) {
                    return {
                        type: DATA_TYPE,
                        data: {
                            color: color,
                            origin: { x: Math.floor(bbox.origin.x), y: Math.floor(bbox.origin.y) },
                            shape: util.detectShape(path, shapes),
                            size: { height: height, width: width }
                        }
                    };
                }
            },

            /**
             * Get an horizontal line path within rect
             * @param rect
             * @param options
             */
            getHorizontalLineDrawing: function (rect, options) {
                assert.instanceof(geometry.Rect, rect, kendo.format(assert.messages.instanceof.default, 'rect', 'kendo.geometry.Rect'));
                var path = new drawing.Path(options);
                path.moveTo(rect.origin.x, rect.origin.y + rect.size.height / 2);
                path.lineTo(rect.origin.x + rect.size.width, rect.origin.y + rect.size.height / 2);
                return path;
            },

            /**
             * Get the arc of an ellipsis within rect
             * @param rect
             * @param options
             */
            getCircleDrawing: function (rect, options) {
                assert.instanceof(geometry.Rect, rect, kendo.format(assert.messages.instanceof.default, 'rect', 'kendo.geometry.Rect'));
                var arcGeometry = new geometry.Arc(
                    [rect.origin.x + rect.size.width / 2, rect.origin.y + rect.size.height / 2], // center
                    {
                        radiusX: rect.size.width / 2,
                        radiusY: rect.size.height / 2,
                        startAngle: 0,
                        endAngle: 360,
                        anticlockwise: false
                    }
                );
                return new drawing.Arc(arcGeometry, options);
            },

            /**
             * Get a cross path within rect
             * @param rect
             * @param options
             */
            getCrossDrawing: function (rect, options) {
                assert.instanceof(geometry.Rect, rect, kendo.format(assert.messages.instanceof.default, 'rect', 'kendo.geometry.Rect'));
                var path = new drawing.Path(options);
                var x = rect.origin.x;
                var y = rect.origin.y;
                var height = rect.size.height;
                var width = rect.size.width;
                path.moveTo(x + width, y);
                path.lineTo(x + CROSS_CURVE * width, y + (1 - CROSS_CURVE) * height);
                path.curveTo(
                    [x, y + height],
                    [x, y + height],
                    [x, y + (1 - CROSS_CURVE) * height]
                );
                path.lineTo(x, y + CROSS_CURVE * height);
                path.curveTo(
                    [x, y],
                    [x, y],
                    [x + CROSS_CURVE * width, y + CROSS_CURVE * height]
                );
                path.lineTo(x + width, y + height);
                return path;
            },

            /**
             * Draw a shape from a dataSource dataItem
             * @param dataItem
             * @param strokeOptions
             */
            getSelectionDrawing: function (dataItem, strokeOptions) {
                assert.instanceof(kendo.data.ObservableObject, dataItem, kendo.format(assert.messages.instanceof.default, 'dataItem', 'kendo.data.ObservableObject'));
                var shape = dataItem.data.shape;
                var rect = new geometry.Rect([dataItem.data.origin.x, dataItem.data.origin.y], [dataItem.data.size.width, dataItem.data.size.height]);
                var options = { stroke: $.extend(strokeOptions, { color: dataItem.data.color }) };
                if (shape === SelectorSurface.fn.shapes.line) {
                    return util.getHorizontalLineDrawing(rect, options);
                } else if (shape === SelectorSurface.fn.shapes.circle) {
                    return util.getCircleDrawing(rect, options);
                } else {
                    return util.getCrossDrawing(rect, options);
                }
            }

        };

        /*********************************************************************************
         * SelectorToolBar Widget
         *********************************************************************************/

        var SelectorToolBar = ToolBar.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                ToolBar.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'toolbar initialized' });
                that.bind(TOGGLE, that._onToggle);
                kendo.notify(that);
            },

            /**
             * Widget options
             */
            options: {
                name: 'SelectorToolBar',
                iconSize: 16,
                resizable: false
            },

            /**
             * Add a color to the toolbar
             * @param color
             */
            addColor: function (color) {
                var that = this;
                // k-button-group in kendo.ui & km-buttongroup (wo second -) in kendo.mobile.ui
                var buttonGroup = this.element.children('.k-button-group, .km-buttongroup');
                var toolBarColors = buttonGroup.children('.k-toggle-button').map(function () {
                    return HASH + $(this).attr('id');
                });
                var buttons = [];
                // Rebuild previous buttons;
                for (var i = 0, length = toolBarColors.length; i < length; i++) {
                    buttons.push({
                        type: 'button',
                        group: 'selectorColors',
                        id: toolBarColors[i].substr(1), // removes the hashtag
                        imageUrl: that._createImageUrl(toolBarColors[i]),
                        showText: 'overflow',
                        text: toolBarColors[i],
                        togglable: true
                    });
                }
                // Parse color for what is actually a color
                color = kendo.parseColor(color).toCss(); // might raise an exception
                // Do not add a color that already exists
                var found = buttons.find(function (button) {
                    return button.text === color;
                });
                // Create button
                if ($.type(found) === UNDEFINED) {
                    buttons.push({
                        type: 'button',
                        group: 'selectorColors',
                        id: color.substr(1), // removes the hashtag
                        imageUrl: that._createImageUrl(color),
                        showText: 'overflow',
                        text: color,
                        togglable: true
                    });
                }
                if (buttonGroup.length) {
                    that.remove(buttonGroup);
                }
                that.add({ type: 'buttonGroup', buttons: buttons });
                if (buttons.length) {
                    that.toggle(HASH + buttons[0].id, true);
                    that._onToggle({ id: buttons[0].id });
                }
                that.wrapper.toggle(buttons.length > 1);
            },

            /**
             * Create toolbar icon
             * @param: color
             * @private
             */
            _createImageUrl: function (color) {
                var canvas = document.createElement('canvas');
                canvas.height = this.options.iconSize;
                canvas.width = this.options.iconSize;
                var ctx = canvas.getContext('2d');
                ctx.beginPath();
                ctx.arc(
                    this.options.iconSize / 2,  // center.x
                    this.options.iconSize / 2,  // center.y
                    this.options.iconSize / 2,  // radius
                    0,                          // start angle
                    2 * Math.PI                 // end angle
                );
                ctx.strokeStyle = 'black';
                ctx.fillStyle = color;
                ctx.stroke();
                ctx.fill();
                return canvas.toDataURL();
            },

            /**
             * Register corresponding selector surface, the surface the selected color applies to
             */
            registerSelectorSurface: function (selectorSurface) {
                assert.instanceof(SelectorSurface, selectorSurface, kendo.format(assert.messages.instanceof.default, 'selectorSurface', 'kendo.ui.SelectorSurface'));
                this.selectorSurface = selectorSurface;
            },

            /**
             * Button toggle event handler
             * @private
             */
            _onToggle: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(SelectorSurface, this.selectorSurface, kendo.format(assert.messages.instanceof.default, 'this.selectorSurface', 'kendo.ui.SelectorSurface'));
                this.selectorSurface.color(HASH + e.id);
            },

            /**
             * Destroy widget
             */
            destroy: function () {
                var that = this;
                ToolBar.fn.destroy.call(that);
            }

        });

        kendo.ui.plugin(SelectorToolBar);

        /*********************************************************************************
         * SelectorSurface Widget
         *********************************************************************************/

        var SelectorSurface = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                logger.debug('surface initialized');
                that._layout();
                that._createToolBar();
                that._dataSource();
                kendo.notify(that);
            },

            /**
             * Options
             */
            options: {
                name: 'SelectorSurface',
                container: 'div.kj-stage>div[data-' + kendo.ns + 'role="stage"]',
                scaler: 'div.kj-stage',
                penStroke: {
                    width: 8
                },
                toolbar: ''
            },

            /**
             * Enumeration of possible shapes
             */
            shapes: {
                circle: 'circle',
                cross: 'cross',
                line: 'line'
            },

            /**
             * Layout
             * @private
             */
            _layout: function () {
                var that = this;
                var element = that.element;
                that.wrapper = element;
                element
                    .addClass(SURFACE_CLASS);
                that.surface = drawing.Surface.create(element);
            },

            /**
             * Create toolbar
             * @private
             */
            _createToolBar: function () {
                var that = this;
                var toolbarContainer = $(that.options.toolbar);
                if (toolbarContainer.length) {
                    var toolbarElement = $(DIV).appendTo(toolbarContainer);
                    that.toolbar = toolbarElement.kendoSelectorToolBar().data('kendoSelectorToolBar');
                    that.toolbar.registerSelectorSurface(this);
                }
            },

            /**
             * Register a selector
             * @param selector
             * @private
             */
            registerSelector: function (selector) {
                var that = this;
                var options = that.options;
                assert.instanceof(Selector, selector, kendo.format(assert.messages.instanceof.default, 'selector', 'Selector'));
                assert.equal(options.container, selector.options.container, kendo.format(assert.messages.equal.default, 'selector.options.container', 'this.options.container'));
                assert.equal(options.scaler, selector.options.scaler, kendo.format(assert.messages.equal.default, 'selector.options.scaler', 'this.options.scaler'));
                // assert.equal(options.dataSource, selector.options.dataSource, kendo.format(assert.messages.equal.default, 'selector.options.dataSource', 'this.options.dataSource'));
                if (!$.isArray(that.selectors)) {
                    that.selectors = [];
                }
                if (that.selectors.indexOf(selector) === -1) {
                    that.selectors.push(selector);
                    // Set the prefix for dataSource ids (so as to only draw selections for the current page when played)
                    var selectorId = selector.element.attr(kendo.attr(ID)) || '';
                    if ($.type(that._selectorId) === UNDEFINED) {
                        that._selectorId = selectorId;
                    } else if (that._selectorId > selectorId) {
                        that._selectorId = selectorId;
                    }
                    // Add selector color to toolbar
                    if (that.toolbar instanceof SelectorToolBar) {
                        that.toolbar.addColor(selector.options.shapeStroke.color);
                    }
                    // Reset mouse handlers
                    that._resetMouseHandlers();
                }
            },

            /**
             * Gets/Sets color
             * @private
             */
            color: function (color) {
                if ($.type(color) === UNDEFINED) {
                    return this._color;
                } else {
                    this._color = kendo.parseColor(color).toCss(); // This might raise an exception
                }
            },

            /**
             * Reset mouse event handlers to draw on surface
             * @private
             */
            _resetMouseHandlers: function () {
                // IMPORTANT
                // We can have several widgets for selections on a page
                // But we only have one set of event handlers shared across all selections
                // So we cannot use `this` within handlers, which is specific to this selector surface
                var options = this.options;
                var data = {}; // We need an object so that data is passed by reference between handlers

                // ATTENTION! There might be several options.container on the page as in Kidoju-Mobile
                // So we need to make sure we unbind/bind events to the parent container
                // https://github.com/kidoju/Kidoju-Widgets/issues/162
                var container = this.element.closest(options.container);
                var containers = $(document).find(options.container);
                var selector = options.container + ':eq(' + containers.index(container) + ')';

                $(document)
                    .off(NS, selector);
                if (this.enable()) {
                    $(document)
                        .on(MOUSEDOWN, selector, data, this._onMouseDown)
                        .on(MOUSEMOVE, selector, data, this._onMouseMove)
                        .on(MOUSEUP, selector, data, this._onMouseUp);
                }
            },

            /**
             * Mouse down event handler
             * @param e
             * @private
             */
            _onMouseDown: function  (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                e.preventDefault(); // prevents from selecting the div
                var container = $(e.currentTarget);
                // Although `this` is unavailable, surfaceElement and surfaceWidget give us the drawing surface and dataSource
                var surfaceElement = container.find(DOT + SURFACE_CLASS);
                assert.hasLength(surfaceElement, kendo.format(assert.messages.hasLength.default, surfaceElement));
                var surfaceWidget = surfaceElement.data('kendoSelectorSurface');
                assert.instanceof(SelectorSurface, surfaceWidget, kendo.format(assert.messages.instanceof.default, 'surfaceWidget', 'kendo.ui.SelectorSurface'));
                var scaler = container.closest(surfaceWidget.options.scaler);
                var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                var mouse = util.getMousePosition(e, container);
                var mousePoint = new geometry.Point(mouse.x / scale, mouse.y / scale);
                var surface = surfaceWidget.surface;
                assert.instanceof(Surface, surface, kendo.format(assert.messages.instanceof.default, 'surface', 'kendo.drawing.Surface'));
                var dataSource = surfaceWidget.dataSource;
                assert.instanceof(DataSource, dataSource, kendo.format(assert.messages.instanceof.default, 'dataSource', 'kendo.data.DataSource'));
                var dataItems2Delete = dataSource.view().filter(function (dataItem) {
                    var selectionBox = dataItem.data;
                    return (mousePoint.x >= selectionBox.origin.x &&
                    mousePoint.x <= selectionBox.origin.x + selectionBox.size.width &&
                    mousePoint.y >= selectionBox.origin.y &&
                    mousePoint.y <= selectionBox.origin.y + selectionBox.size.height);
                });
                if ($.isArray(dataItems2Delete) && dataItems2Delete.length) {
                    dataItems2Delete.forEach(function (dataItem) {
                        dataSource.remove(dataItem);
                    });
                } else {
                    var strokeOptions = $.extend({}, surfaceWidget.options.penStroke, { color: surfaceWidget.color() });
                    var path = new drawing.Path({ stroke: strokeOptions });
                    path.moveTo(mousePoint);
                    surface.draw(path);
                    e.data.path = path;
                    logger.debug({
                        method: '_onMouseDown',
                        message: 'Added new path',
                        data: strokeOptions
                    });
                }
            },

            /**
             * Mouse move event handler
             * @param e
             * @private
             */
            _onMouseMove: function  (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var path = e.data.path;
                if (path instanceof kendo.drawing.Path) {
                    var container = $(e.currentTarget);
                    // Although `this` is unavailable, surfaceElement and surfaceWidget give us the drawing surface and dataSource
                    var surfaceElement = container.find(DOT + SURFACE_CLASS);
                    assert.hasLength(surfaceElement, kendo.format(assert.messages.hasLength.default, surfaceElement));
                    var surfaceWidget = surfaceElement.data('kendoSelectorSurface');
                    assert.instanceof(SelectorSurface, surfaceWidget, kendo.format(assert.messages.instanceof.default, 'surfaceWidget', 'kendo.ui.SelectorSurface'));
                    var scaler = container.closest(surfaceWidget.options.scaler);
                    var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                    var mouse = util.getMousePosition(e, container);
                    path.lineTo(mouse.x / scale, mouse.y / scale);
                }
            },

            /**
             * Mouse up event handler
             * @param e
             * @private
             */
            _onMouseUp: function  (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var path = e.data.path;
                if (path instanceof drawing.Path) {
                    var container = $(e.currentTarget);
                    // Although `this` is unavailable, surfaceElement and surfaceWidget give us the drawing surface and dataSouce
                    var surfaceElement = container.find(DOT + SURFACE_CLASS);
                    assert.hasLength(surfaceElement, kendo.format(assert.messages.hasLength.default, surfaceElement));
                    var surfaceWidget = surfaceElement.data('kendoSelectorSurface');
                    assert.instanceof(SelectorSurface, surfaceWidget, kendo.format(assert.messages.instanceof.default, 'surfaceWidget', 'kendo.ui.SelectorSurface'));
                    var dataSource = surfaceWidget.dataSource;
                    if (dataSource instanceof kendo.data.DataSource) {
                        var dataItem = util.getDataItem(path, surfaceWidget.color(), surfaceWidget.getSelectorShapes());
                        if ($.isPlainObject(dataItem)) {
                            // Add random Object Id
                            dataItem.id = util.randomString(24);
                            // Designate a selector to identify the page
                            dataItem.data.selector = surfaceWidget._selectorId;
                            dataSource.add(dataItem);
                        } else {
                            // Refresh (to remove the failed attempt at drawing a selection)
                            dataSource.trigger(CHANGE);
                        }
                    }
                }
                e.data.path = undefined;
            },

            /**
             * _dataSource function to bind the refresh handler to the change event
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

                // Filter dataSource
                that.dataSource.filter({ field: 'type', operator: 'eq', value: DATA_TYPE });

                // trigger a read on the dataSource if one hasn't happened yet
                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }

                var selectors = that.selectors;
                if ($.isArray(selectors)) {
                    for (var i = 0, length = selectors.length; i < length; i++) {
                        if (selectors[i].dataSource !== that.dataSource) {
                            selectors[i].setDataSource(that.dataSource);
                        }
                    }
                }
            },

            /**
             * Sets the dataSource for source binding
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
             * Refresh handler to redraw all selections from dataSource
             */
            refresh: function () {
                var that = this;
                var options = that.options;
                var dataSource = that.dataSource;
                var surface = that.surface;
                var selectors = that.selectors;
                assert.instanceof(DataSource, dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                assert.instanceof(Surface, surface, kendo.format(assert.messages.instanceof.default, 'this.surface', 'kendo.data.Surface'));
                var dataView = dataSource.view(); // This is filtered
                if (surface instanceof kendo.drawing.Surface) {
                    // Clear surface
                    surface.clear();
                    // Draw
                    for (var i = 0, total = dataView.length; i < total; i++) {
                        var dataItem = dataView[i];
                        // Draw the item only if it relates to the prefix
                        if (dataItem.type === DATA_TYPE && dataItem.data.selector === that._selectorId) {
                            surface.draw(util.getSelectionDrawing(dataItem, $.extend({}, options.penStroke)));
                        }
                    }
                }
                // Trigger a change on all selector widgets to recalculate databound values
                if ($.isArray(selectors)) {
                    for (var j = 0, length = selectors.length; j < length; j++) {
                        var selector = selectors[j];
                        assert.instanceof(Selector, selector, kendo.format(assert.messages.instanceof.default, 'selector', 'kendo.ui.Selector'));
                        try {
                            // We might get `Uncaught TypeError: Cannot read property 'value' of undefined`
                            // because a refresh is triggered before test is added to the viewModel in play mode
                            selector.trigger(CHANGE);
                        } catch (ex) {}
                    }
                }
            },

            /**
             * Scan registered selectors for all shapes
             */
            getSelectorShapes: function () {
                var selectors = this.selectors;
                var shapes = [];
                if ($.isArray(selectors)) {
                    for (var i = 0, length = selectors.length; i < length; i++) {
                        var shape = selectors[i].options.shape;
                        if (shapes.indexOf(shape) === -1) {
                            shapes.push(shape); // test a dummy shape
                        }
                    }
                }
                return shapes;
            },

            /**
             * Scan registered selectors for all colors
             */
            getSelectorColors: function () {
                var selectors = this.selectors;
                var colors = [];
                if ($.isArray(colors)) {
                    for (var i = 0, length = selectors.length; i < length; i++) {
                        var color = selectors[i].options.color;
                        if (colors.indexOf(color) === -1) {
                            colors.push(color);
                        }
                    }
                }
                return colors;
            },

            /**
             * Return true if any selector is enabled, false if all selectors are disabled
             */
            enable: function () {
                var selectors = this.selectors;
                var enabled = false;
                if ($.isArray(selectors)) {
                    for (var i = 0, length = selectors.length; i < length; i++) {
                        enabled = enabled || selectors[i]._enabled;
                    }
                }
                return enabled;
            },

            /**
             * Destroy the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var options = that.options;
                Widget.fn.destroy.call(that);
                // unbind document events
                $(document)
                    .off(NS, options.container);
                // unbind dataSource
                that.dataSource.unbind(CHANGE, that._refreshHandler);
                // destroy toolbar
                if (that.toolbar instanceof SelectorToolBar) {
                    that.toolbar.destroy();
                    that.toolbar.wrapper.remove();
                    that.toolbar = undefined;
                }
                // Dereference objects
                that.surface = undefined;
                that.selectors = undefined;
                // Remove class
                // that.element.removeClass(WIDGET_CLASS);
                kendo.destroy(that.element);
            }
        });

        kendo.ui.plugin(SelectorSurface);

        /*********************************************************************************
         * Selector Widget
         *********************************************************************************/

        /**
         * Selector
         * @class Selector Widget (kendoSelector)
         */
        var Selector = Widget.extend({

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
                that._enabled = that.element.prop('disabled') ? false : that.options.enable;
                that._layout();
                that._ensureSurface();
                that._dataSource();
                that._drawPlaceholder();
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Selector',
                id: null,
                autoBind: true,
                dataSource: null,
                scaler: 'div.kj-stage',
                container: 'div.kj-stage>div[data-' + kendo.ns + 'role="stage"]',
                toolbar: '', // This points to a container div for including the toolbar
                shape: 'circle',
                color: '#FF0000',
                frameStroke: { // strokeOptions
                    color: '#8a8a8a',
                    dashType: 'dot',
                    opacity: 0.6,
                    width: 2
                },
                shapeStroke: { // strokeOptions
                    color: '#FF0000',
                    dashType: 'dot',
                    opacity: 0.6,
                    width: 8
                },
                // in design mode: drawPlaceholder = true, createSurface = false, enable = false
                // in play mode: drawPlaceholder = false, createSurface = true, enabled = true
                // in review mode: drawPlaceholder = true, createSurface = true, enable = false
                drawPlaceholder: true,
                createSurface: true,
                // showToolBar === enable
                enable: true
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
             * - If there is no selection of the corresponding options.shapeStroke.color, value returns undefined
             * - If there are more selections than the number of widgets of the same shape and color, value returns 0
             * - If there is no selection of corresponding shape and color within the widget placeholder, value returns 0
             * - If there is a selection of corresponding shape and color within the widget placeholder, value returns 1
             * @param value
             */
            value: function () {
                var element = this.element;
                var options = this.options;
                var container = element.closest(options.container);
                var scaler = container.closest(options.scaler);
                var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                var boundingRect = element.get(0).getBoundingClientRect(); // boundingRect includes transformations, meaning it is scaled
                var ownerDocument = $(container.get(0).ownerDocument);
                var stageOffset = container.offset();
                var elementRect = new geometry.Rect(
                    [(boundingRect.left - stageOffset.left + ownerDocument.scrollLeft()) / scale, (boundingRect.top - stageOffset.top + ownerDocument.scrollTop()) / scale],
                    [boundingRect.width / scale, boundingRect.height / scale] // getBoundingClientRect includes borders
                );
                var dataSource = this.dataSource;
                var matchingSelections = dataSource.view().filter(function (selection) {
                    return selection.type === DATA_TYPE && // This one might not be useful considering dataSource should already be filtered
                        selection.data.shape === options.shape &&
                        kendo.parseColor(selection.data.color).equals(options.shapeStroke.color);
                });
                if ($.isArray(matchingSelections) && matchingSelections.length) {
                    var similarSelectorElements = container.find(kendo.roleSelector(ROLE)).filter(function (index, element) {
                        var selectorWidget = $(element).data('kendoSelector');
                        if (selectorWidget instanceof kendo.ui.Selector) {
                            return selectorWidget.options.shape === options.shape &&
                                selectorWidget.options.shapeStroke.color === options.shapeStroke.color;
                        }
                        return false;
                    });
                    // If we have more matching selections (same shape, same color) than similar widgets (same shape, same color)
                    // We cannot consider we have a match and the widget value is 0 (it would be too easy to multiply selections in hope of getting a match by mere luck)
                    if (matchingSelections.length > similarSelectorElements.length) {
                        return 0;
                    }
                    // If we have less matching selections than similar widgets, we are good to test
                    // all selections to check whether one fits within the current widget
                    var found = 0;
                    for (var i = 0, length = matchingSelections.length; i < length; i++) {
                        var selectionRect = new geometry.Rect(
                            [matchingSelections[i].data.origin.x, matchingSelections[i].data.origin.y],
                            [matchingSelections[i].data.size.width, matchingSelections[i].data.size.height]
                        );
                        if (
                            // Check that the selection rect fits within the element bounding box
                            selectionRect.origin.x >= elementRect.origin.x &&
                            selectionRect.origin.x <= elementRect.origin.x + elementRect.size.width &&
                            selectionRect.origin.y >= elementRect.origin.y &&
                            selectionRect.origin.y <= elementRect.origin.y + elementRect.size.height &&
                            // Also check the distance from center to center
                            new geometry.Point(selectionRect.origin.x + selectionRect.size.width / 2, selectionRect.origin.y + selectionRect.size.height / 2)
                                .distanceTo(new geometry.Point(elementRect.origin.x + elementRect.size.width / 2, elementRect.origin.y + elementRect.size.height / 2)) < MIN_DIAGONAL
                        ) {

                            found++;
                        }
                    }
                    // Two or more selections within the widgets boundaries count as 1
                    return found ? 1 : 0;
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                var element = that.element;
                that.wrapper = element;
                // touch-action: 'none' is for Internet Explorer - https://github.com/jquery/jquery/issues/2987
                // INTERACTIVE_CLASS (which might be shared with other widgets) is used to position any drawing surface underneath interactive widgets
                element
                    .addClass(WIDGET_CLASS)
                    .addClass(INTERACTIVE_CLASS)
                    .css({ touchAction: 'none' });
                that.surface = drawing.Surface.create(element);
            },

            /**
             * Draw the selector placeholder according to options.shape
             * @private
             */
            _drawPlaceholder: function () {
                assert.instanceof(Surface, this.surface, kendo.format(assert.messages.instanceof.default, 'this.surface', 'kendo.drawing.Surface'));
                var that = this; // this is the selection widget
                var options = that.options;
                if (options.drawPlaceholder) {
                    var element = that.element;
                    var shape = options.shape;
                    var frameOptions = { stroke: options.frameStroke };
                    var shapeOptions = { stroke: options.shapeStroke };
                    var group = new drawing.Group();
                    var bbox = new geometry.Rect(
                        [
                            options.shapeStroke.width / 2,
                            options.shapeStroke.width / 2
                        ],
                        [
                            // We cannot have a negative value here, esepcailly when element.width() === 0
                            // https://github.com/kidoju/Kidoju-Widgets/issues/160
                            Math.max(element.width(), options.shapeStroke.width)  - options.shapeStroke.width,
                            Math.max(element.height(), options.shapeStroke.width) - options.shapeStroke.width
                        ]
                    );
                    var outerRect = new drawing.Rect(bbox, frameOptions);
                    group.append(outerRect);
                    if (shape === SelectorSurface.fn.shapes.line) {
                        group.append(util.getHorizontalLineDrawing(bbox, shapeOptions));
                    } else if (shape === SelectorSurface.fn.shapes.circle) {
                        group.append(util.getCircleDrawing(bbox, shapeOptions));
                    } else {
                        group.append(util.getCrossDrawing(bbox, shapeOptions));
                    }
                    var center = new geometry.Point(bbox.origin.x + bbox.size.width / 2, bbox.origin.y + bbox.size.height / 2);
                    var centerShapeOptions = $.extend(true, {}, shapeOptions, { stroke: { dashType: 'solid', width: 2 } });
                    // Add vertical ligne
                    var verticalLine = new drawing.Path(centerShapeOptions)
                        .moveTo(center.x, center.y - MIN_DIAGONAL / 2)
                        .lineTo(center.x, center.y + MIN_DIAGONAL / 2);
                    group.append(verticalLine);
                    // Add horixontal line
                    var horizontalLine = new drawing.Path(centerShapeOptions)
                        .moveTo(center.x - MIN_DIAGONAL / 2, center.y)
                        .lineTo(center.x + MIN_DIAGONAL / 2, center.y);
                    group.append(horizontalLine);
                    // Add inner circle
                    // var innerCircleGeometry = new geometry.Circle(center, MIN_DIAGONAL / 2);
                    // var innerCircle = new drawing.Circle(innerCircleGeometry, centerShapeOptions);
                    // group.append(innerCircle);
                    that.surface.clear();
                    that.surface.draw(group);
                }
            },

            /**
             * Ensure drawing surface for all selections
             * @private
             */
            _ensureSurface: function () {
                var that = this;
                var options = that.options;
                if (options.createSurface) {
                    var element = that.element;
                    var container = element.closest(options.container);
                    assert.hasLength(container, kendo.format(assert.messages.hasLength.default, options.container));
                    var surfaceElement = container.find(DOT + SURFACE_CLASS);
                    if (!surfaceElement.length) {
                        assert.isUndefined(that.selectorSurface, kendo.format(assert.messages.isUndefined.default, 'this.selectorSurface'));
                        var firstInteractiveElement = container.children().has(DOT + INTERACTIVE_CLASS).first();
                        surfaceElement = $(DIV)
                            .addClass(SURFACE_CLASS)
                            .css({ position: 'absolute', top: 0, left: 0 })
                            .height(container.height())
                            .width(container.width());
                        // Selections are not draggables so we have to consider that there might be no firstInteractiveElement
                        if (firstInteractiveElement.length) {
                            surfaceElement.insertBefore(firstInteractiveElement);
                        } else {
                            surfaceElement.appendTo(container);
                        }
                        surfaceElement.kendoSelectorSurface({
                            container: options.container,
                            dataSource: options.dataSource,
                            scaler: options.scaler,
                            toolbar: options.toolbar
                        });
                    }
                    var surfaceWidget = surfaceElement.data('kendoSelectorSurface');
                    assert.instanceof(SelectorSurface, surfaceWidget, kendo.format(assert.messages.instanceof.default, 'surfaceWidget', 'kendo.ui.SelectorSurface'));
                    surfaceWidget.registerSelector(that);
                    that.selectorSurface = surfaceWidget;
                }
            },

            /**
             * _dataSource function to bind the refresh handler to the change event
             * @private
             */
            _dataSource: function () {
                var that = this;

                // returns the datasource OR creates one if using array or configuration
                that.dataSource = DataSource.create(that.options.dataSource);
                // Note: without that.dataSource, source bindings won't work

                // bind to the reset event to reset the dataSource
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
             * Sets the dataSource for source binding
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
             * Refresh event handler for the dataSource
             * @param e
             */
            refresh: function (e) {
                if (e && $.type(e.action) === UNDEFINED) {
                    // When resetting the dataSource, set the new dataSource on the selectorSurface widget
                    var surfaceWidget = this.selectorSurface;
                    if (surfaceWidget instanceof SelectorSurface && surfaceWidget.dataSource !== e.sender) {
                        surfaceWidget.setDataSource(e.sender);
                        logger.debug({
                            method: 'refresh',
                            message: 'reset the surfaceWidget dataSource (if infinite loop, make sure all selectors are bound to the same source)'
                        });
                    }
                }
            },

            /**
             * Enable/disable user interactivity on container
             */
            enable: function (enabled) {
                var selectorSurface = this.selectorSurface;
                this._enabled = enabled;
                if (selectorSurface instanceof SelectorSurface) {
                    selectorSurface._resetMouseHandlers();
                }
            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var options = that.options;
                Widget.fn.destroy.call(that);
                // unbind dataSource
                that.dataSource.unbind(CHANGE, that._refreshHandler);
                // dereference selectors
                if (that.selectorSurface instanceof SelectorSurface && $.isArray(that.selectorSurface.selectors)) {
                    // unregister this selector
                    if (that.selectorSurface.selectors.length > 0) {
                        var index = that.selectorSurface.selectors.indexOf(that);
                        that.selectorSurface.selectors.splice(index, 1);
                    }
                    // if all selectors are unregistered, destroy selector surface (which should destroy the toolbar)
                    if (that.selectorSurface.selectors.length === 0) {
                        that.selectorSurface.destroy();
                        that.selectorSurface.wrapper.remove();
                    }
                    that.selectorSurface = undefined;
                }
                kendo.destroy(that.element);
            }
        });

        kendo.ui.plugin(Selector);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
