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
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.color',
        './vendor/kendo/kendo.drawing',
        './vendor/kendo/kendo.toolbar'
        // './vendor/kendo/kendo.multiselect' // required because of a test in kendo.binder.js
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
        // var STRING = 'string';
        // var NULL = 'null';
        // var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DOT = '.';
        var WIDGET = 'kendoSelector';
        var NS = DOT + WIDGET;
        var MOUSEDOWN = 'mousedown' + NS + ' ' + 'touchstart' + NS;
        var MOUSEMOVE = 'mousemove' + NS + ' ' + 'touchmove' + NS;
        var MOUSEUP = 'mouseup' + NS + ' ' + 'touchend' + NS;
        var COLOR = 'color' + NS;
        var DIV = '<div/>';
        var ROLE = 'selector';
        var WIDGET_CLASS = 'kj-selector';
        var SURFACE_CLASS = WIDGET_CLASS + '-surface';
        var DRAGGABLE_CLASS = 'kj-draggable';
        var DATA_TYPE = 'selection';
        var DEFAULT_STROKE = {
            COLOR: '#000000',
            WIDTH: 4
        };
        var MIN_DIAGONAL = 30;
        var LINE_HW_PROPORTION = 0.2;
        var SHAPE_HIT_DISTANCE = 10;
        var CROSS_CURVE = 0.5;

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        var util = {

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

            /**
             * Detect the shape of a path (circle, cross, line)
             * @param path
             */
            detectShape: function (path) {
                assert.instanceof(drawing.Path, path, kendo.format(assert.messages.instanceof.default, 'path', 'kendo.drawing.Path'));
                var bbox = path.bbox();
                var x = Math.floor(bbox.origin.x);
                var y = Math.floor(bbox.origin.y);
                var height = Math.floor(bbox.size.height);
                var width = Math.floor(bbox.size.width);
                // Detect a line (height/width ratio)
                if (height/width < LINE_HW_PROPORTION) {
                    return SelectorSurface.fn.shapes.line;
                }
                // Detect a circle (shape nears top, right, bottom and left)
                var topPoint = new geometry.Point(x + width / 2, y);
                var rightPoint = new geometry.Point(x + width, y + height / 2);
                var bottomPoint = new geometry.Point(x + width / 2, y + height);
                var leftPoint = new geometry.Point(x, y + height / 2);
                var hitTop = false;
                var hitRight = false;
                var hitBottom = false;
                var hitLeft = false;
                for (var i = 0, length =  path.segments.length; i < length; i++) {
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
            },

            /**
             * Get a selection data item for dataSource from a user-drawn path
             * @param path
             * @param color
             */
            getDataItem: function (path, color) {
                assert.instanceof(drawing.Path, path, kendo.format(assert.messages.instanceof.default, 'path', 'kendo.drawing.Path'));
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
                            shape: util.detectShape(path),
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
             */
            getSelectionDrawing: function (dataItem) {
                assert.instanceof(kendo.data.ObservableObject, dataItem, kendo.format(assert.messages.instanceof.default, 'dataItem', 'kendo.data.ObservableObject'));
                var color = dataItem.data.color;
                var shape = dataItem.data.shape;
                var rect = new geometry.Rect([dataItem.data.origin.x, dataItem.data.origin.y], [dataItem.data.size.width, dataItem.data.size.height]);
                var options = { stroke: { color: color,  width: DEFAULT_STROKE.WIDTH } };
                if (shape === SelectorSurface.fn.shapes.line) {
                    return util.getHorizontalLineDrawing(rect, options);
                } else if (shape === SelectorSurface.fn.shapes.circle) {
                    return util.getCircleDrawing(rect, options)
                } else {
                    return util.getCrossDrawing(rect, options);
                }
            }

        };

        /*********************************************************************************
         * SelectorToolBar Widget
         *********************************************************************************/

        var SelectorToolBar = ToolBar.extend({

            options: {
                name: 'SelectorToolBar'
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
                logger.debug('widget initialized');
                that._layout();
                that._dataSource();
                that._addMouseHandlers();
                that._color = DEFAULT_STROKE.COLOR; // TODO
                that._enabled = that.element.prop('disabled') ? false : that.options.enable;
                kendo.notify(that);
            },

            /**
             * Options
             */
            options: {
                name: 'SelectorSurface',
                scaler: 'div.kj-stage',
                container: 'div.kj-stage>div[data-role="stage"]'
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

                // initialize pen color
                /*
                var colorHandler = container.data(COLOR_HANDLER);
                if ($.type(colorHandler) === UNDEFINED) {
                    colorHandler = $.proxy(this._onColorChange, container);
                    $(document).on(COLOR, colorHandler);
                    container.data(COLOR_HANDLER, colorHandler);
                    container.data(DATA_COLOR, DEFAULT_STROKE.COLOR);
                }
                */
            },

            /**
             * Register a selector
             * @param selector
             * @private
             */
            _registerSelector: function (selector) {
                var that = this;
                var options = that.options;
                assert.instanceof(Selector, selector, kendo.format(assert.messages.instanceof.default, 'selector', 'Selector'));
                assert.equal(options.container, selector.options.container, kendo.format(assert.messages.equal.default, 'selector.options.container', 'this.options.container'));
                assert.equal(options.scaler, selector.options.scaler, kendo.format(assert.messages.equal.default, 'selector.options.scaler', 'this.options.scaler'));
                // TODO assert.equal(options.dataSource, selector.options.dataSource, kendo.format(assert.messages.equal.default, 'selector.options.dataSource', 'this.options.dataSource'));
                if (!$.isArray(that._selectors)) {
                    that._selectors = [];
                }
                if (that._selectors.indexOf(selector) === -1) {
                    that._selectors.push(selector);
                }
            },

            /**
             * Document event handler for the color event
             * TODO: Check adding the event handler to the container
             * @private
             */
            _onColorChange: function (e, color) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                // We need to check the event namespace because raising the color event without namespace will trigger the handler
                if (e.namespace === NS.substr(1)) {
                    try {
                        this._color = kendo.parseColor(color).toCss();
                    } catch (ex) {
                        this._color = DEFAULT_STROKE.COLOR;
                    }
                }
            },

            /**
             * Add mouse event handlers to draw on surface
             * @private
             */
            _addMouseHandlers: function () {
                // IMPORTANT
                // We can have several widgets for selections on a page
                // But we only have one set of event handlers shared across all selections
                // So we cannot use `this` within handlers, which is specific to this selector surface
                var options = this.options;
                var path;
                $(document)
                    .off(NS, options.container)
                    .on(MOUSEDOWN, options.container, function (e) {
                        e.preventDefault(); // prevents from selecting the div
                        var container = $(e.currentTarget);
                        // Although this is unavailable, surfaceElement and surfaceWidget give us the drawing surface and dataSoruce
                        var surfaceElement = container.find(DOT + SURFACE_CLASS);
                        assert.hasLength(surfaceElement, kendo.format(assert.messages.hasLength.default, surfaceElement));
                        var surfaceWidget = surfaceElement.data('kendoSelectorSurface');
                        assert.instanceof(SelectorSurface, surfaceWidget, kendo.format(assert.messages.instanceof.default, 'that._surfaceWidget', 'kendo.ui.SelectorSurface'));
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
                            dataItems2Delete.forEach(function(dataItem) {
                                dataSource.remove(dataItem);
                            });
                        } else {
                            path = new drawing.Path({
                                stroke: {
                                    color: surfaceWidget._color,
                                    width: DEFAULT_STROKE.WIDTH
                                }
                            });
                            path.moveTo(mousePoint);
                            surface.draw(path);
                        }
                    })
                    .on(MOUSEMOVE, options.container, function (e) {
                        if (path instanceof kendo.drawing.Path) {
                            var container = $(e.currentTarget);
                            // Although this is unavailable, surfaceElement and surfaceWidget give us the drawing surface and dataSoruce
                            var surfaceElement = container.find(DOT + SURFACE_CLASS);
                            assert.hasLength(surfaceElement, kendo.format(assert.messages.hasLength.default, surfaceElement));
                            var surfaceWidget = surfaceElement.data('kendoSelectorSurface');
                            assert.instanceof(SelectorSurface, surfaceWidget, kendo.format(assert.messages.instanceof.default, 'that._surfaceWidget', 'kendo.ui.SelectorSurface'));
                            var scaler = container.closest(surfaceWidget.options.scaler);
                            var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                            var mouse = util.getMousePosition(e, container);
                            path.lineTo(mouse.x / scale, mouse.y / scale);
                        }
                    })
                    .on(MOUSEUP, options.container, function (e) {
                        if (path instanceof drawing.Path) {
                            var container = $(e.currentTarget);
                            // Although this is unavailable, surfaceElement and surfaceWidget give us the drawing surface and dataSoruce
                            var surfaceElement = container.find(DOT + SURFACE_CLASS);
                            assert.hasLength(surfaceElement, kendo.format(assert.messages.hasLength.default, surfaceElement));
                            var surfaceWidget = surfaceElement.data('kendoSelectorSurface');
                            assert.instanceof(SelectorSurface, surfaceWidget, kendo.format(assert.messages.instanceof.default, 'that._surfaceWidget', 'kendo.ui.SelectorSurface'));
                            var dataSource = surfaceWidget.dataSource;
                            if (dataSource instanceof kendo.data.DataSource) {
                                var dataItem = util.getDataItem(path, surfaceWidget._color);
                                if ($.isPlainObject(dataItem)) {
                                    dataSource.add(dataItem);
                                } else {
                                    // Refresh (to remove the failed attempt at drawing a selection)
                                    dataSource.trigger(CHANGE);
                                }
                            }
                        }
                        path = undefined;
                    });
            },

            /**
             * _dataSource function to bind the refresh handler to the change event
             * @private
             */
            _dataSource: function () {

                //debugger; // SelectorSurface

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
            },

            /**
             * Sets the dataSource for source binding
             * @param dataSource
             */
            setDataSource: function (dataSource) {
                //debugger; // Selector Surface
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
                var dataSource = that.dataSource;
                var surface = that.surface;
                var selectors = that._selectors;
                assert.instanceof(DataSource, dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                assert.instanceof(Surface, surface, kendo.format(assert.messages.instanceof.default, 'this.surface', 'kendo.data.Surface'));
                var dataView = dataSource.view(); // This is filtered
                // showSurface??
                if (surface instanceof kendo.drawing.Surface) {
                    // Clear surface
                    surface.clear();
                    // Draw
                    for (var i = 0, total = dataView.length; i < total; i++) {
                        var dataItem = dataView[i];
                        if (dataItem.type === DATA_TYPE) {
                            surface.draw(util.getSelectionDrawing(dataItem));
                        }
                    }
                }
                // Trigger a change on all selector widgets to recalculate databound values
                if ($.isArray(selectors)) {
                    for (i = 0, length = selectors.length; i < length; i++) {
                        assert.instanceof(Selector, selectors[i], kendo.format(assert.messages.instanceof.default, 'selectors[i]', 'kendo.ui.Selector'));
                        selectors[i].trigger(CHANGE);
                    }
                }
            },

            /**
             * Scan registered selectors for all shapes
             */
            getSelectorShapes: function () {
                var selectors = this._selectors;
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
                var selectors = this._selectors;
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
             * Enable/disable user interactivity on container
             */
            enable: function (enabled) {
                // this._enabled is checked in _addMouseHandlers
                // use a variable on container
                this._enabled = enabled;
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                var container = element.closest(that.options.container);
                Widget.fn.destroy.call(that);
                // unbind document events
                $(document).off(NS);
                // unbind and destroy all descendants
                kendo.unbind(element);
                kendo.destroy(element);
                // unbind all other events (probably redundant)
                element.find('*').off();
                element.off();
                // remove descendants
                element.empty();
                // remove widget class
                element.removeClass(WIDGET_CLASS);
                // If last connector on stage, remove surface
                if (container.find(DOT + WIDGET_CLASS).length === 0 && surface instanceof Surface) {
                    kendo.destroy(surface.element);
                    surface.element.remove();
                }
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
                logger.debug('widget initialized');
                debugger;
                that._layout();
                that._ensureSurface();
                that._drawPlaceholder(); // TODO: use variable showPlaceHolder on container
                that._enabled = that.element.prop('disabled') ? false : that.options.enable;
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
                container: 'div.kj-stage>div[data-role="stage"]',
                shape: 'circle',
                color: '#FF0000',
                frameColor: '#8a8a8a',
                // in design mode: showSurface = false, enable = false
                // in play mode: showSurface = true, enabled = true
                // in review mode: showSurface = true, enable = false
                showSurface: true,
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
             * - If there is no selection of the corresponding options.color, value returns undefined
             * - If there are more selections than the number of widgets of the same color, value returns 0
             * -
             * @param value
             */
            value: function () {
                /*
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
                var containerDataSource = container.data(DATA_SOURCE);
                assert.instanceof(DataSource, containerDataSource, kendo.format(assert.messages.instanceof.default, 'containerDataSource', 'kendo.data.DataSource'));
                var matchingSelections = containerDataSource.view().filter(function (selection) {
                    return selection.type === DATA_TYPE && // This one might not be useful considering dataSource should already be filtered
                        selection.data.shape === options.shape &&
                        kendo.parseColor(selection.data.color).equals(options.color);
                });
                if ($.isArray(matchingSelections) && matchingSelections.length) {
                    var similarSelectorElements = container.find(kendo.roleSelector(ROLE)).filter(function(index, element) {
                        var selectorWidget = $(element).data('kendoSelector');
                        if (selectorWidget instanceof kendo.ui.Selector) {
                            return selectorWidget.options.shape === options.shape &&
                                selectorWidget.options.color === options.color;
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
                */
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
                // DRAGGABLE_WIDGET (which might be shared with other widgets) is used to position the drawing surface below draggable elements
                element
                    .addClass(WIDGET_CLASS)
                    // .addClass(DRAGGABLE_CLASS) // Contrary to connectors, selections are not draggables
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
                var shape = options.shape;
                var color = options.color;
                var frameColor = options.frameColor;
                var element = that.element;
                var group = new drawing.Group();
                var bbox = new geometry.Rect([0, 0], [element.width(), element.height()]);
                var center = new geometry.Point(bbox.origin.x + bbox.size.width / 2, bbox.origin.y + bbox.size.height / 2);
                var options = { stroke: { color: color, dashType: 'longDashDot', width: DEFAULT_STROKE.WIDTH, opacity: 0.6 } };
                var frameOptions = { stroke: { color: frameColor, dashType: 'dot', width: 2, opacity: 0.4 } };
                var outerRect = new drawing.Rect(bbox, frameOptions);
                group.append(outerRect);
                if (shape === SelectorSurface.fn.shapes.line) {
                    group.append(util.getHorizontalLineDrawing(bbox, options));
                } else if (shape === SelectorSurface.fn.shapes.circle) {
                    group.append(util.getCircleDrawing(bbox, options));
                } else {
                    group.append(util.getCrossDrawing(bbox, options));
                }
                var innerCircleGeometry = new geometry.Circle(center, MIN_DIAGONAL / 2);
                var innerCircle = new drawing.Circle(innerCircleGeometry, frameOptions);
                group.append(innerCircle);
                that.surface.clear();
                that.surface.draw(group);
            },

            /**
             * Ensure drawing surface for all selections
             * @private
             */
            _ensureSurface: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                var container = element.closest(options.container);
                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, options.container));
                var surfaceElement = container.find(DOT + SURFACE_CLASS);
                if (options.showSurface && !surfaceElement.length) {
                    assert.isUndefined(that._surfaceWidget, kendo.format(assert.messages.isUndefined.default, 'that._surfaceWidget'));
                    var firstElementWithDraggable = container.children().has(DOT + DRAGGABLE_CLASS).first();
                    surfaceElement = $(DIV)
                        .addClass(SURFACE_CLASS)
                        .css({ position: 'absolute', top: 0, left: 0 })
                        .height(container.height())
                        .width(container.width());
                    // Selections are not draggables so we have to consider that there might be no firstElementWithDraggable
                    if (firstElementWithDraggable.length) {
                        surfaceElement.insertBefore(firstElementWithDraggable);
                    } else {
                        surfaceElement.appendTo(container);
                    }
                    //debugger;
                    surfaceElement.kendoSelectorSurface({
                        container: options.container,
                        dataSource: options.dataSource,
                        scaler: options.scaler
                        // TODO: Other options to pass on?
                    });
                }
                that._surfaceWidget = surfaceElement.data('kendoSelectorSurface');
                assert.instanceof(SelectorSurface, that._surfaceWidget, kendo.format(assert.messages.instanceof.default, 'that._surfaceWidget', 'kendo.ui.SelectorSurface'));
                that._surfaceWidget._registerSelector(that);
            },

            /**
             * Sets the dataSource for source binding
             * @param dataSource
             */
            setDataSource: function (dataSource) {
                debugger; // Selector
                var that = this;
                // set the internal datasource equal to the one passed in by MVVM
                that.options.dataSource = dataSource;
            },

            /**
             * Enable/disable user interactivity on container
             */
            enable: function (enabled) {
                // this._enabled is checked in _addMouseHandlers
                // use a variable on container
                this._enabled = enabled;
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                var container = element.closest(that.options.container);
                Widget.fn.destroy.call(that);
                // unbind document events
                $(document).off(NS);
                // unbind and destroy all descendants
                kendo.unbind(element);
                kendo.destroy(element);
                // unbind all other events (probably redundant)
                element.find('*').off();
                element.off();
                // remove descendants
                element.empty();
                // remove widget class
                element.removeClass(WIDGET_CLASS);
                // If last connector on stage, remove surface
                if (container.find(DOT + WIDGET_CLASS).length === 0 && surface instanceof Surface) {
                    kendo.destroy(surface.element);
                    surface.element.remove();
                }
            }

        });

        kendo.ui.plugin(Selector);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
