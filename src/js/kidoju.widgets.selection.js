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
        './vendor/kendo/kendo.drawing'
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
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.selection');
        var NUMBER = 'number';
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DOT = '.';
        var WIDGET = 'kendoSelection';
        var NS = DOT + WIDGET;
        var MOUSEDOWN = 'mousedown' + NS + ' ' + 'touchstart' + NS;
        var MOUSEMOVE = 'mousemove' + NS + ' ' + 'touchmove' + NS;
        var MOUSEUP = 'mouseup' + NS + ' ' + 'touchend' + NS;
        var COLOR = 'color' + NS;
        var DIV = '<div/>';
        var ROLE = 'selection';
        var WIDGET_CLASS = 'kj-selection';
        var INNER_CLASS = 'kj-selection-inner';
        var DRAGGABLE_CLASS = 'kj-draggable';
        var SURFACE_CLASS = WIDGET_CLASS + '-surface';
        var SURFACE = 'selectionSurface';
        var DATA_SOURCE = 'selectionDataSource';
        var REFRESH_HANDLER = 'selectionRefreshHandler';
        var DATA_COLOR = 'selectionColor';
        var COLOR_HANDLER = 'selectioColorHandler';
        var DEFAULT_STROKE = {
            COLOR: '#000000',
            WIDTH: 4
        };
        var MIN_DIAGONAL = 20;
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var ID = 'id';

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
            }

        };

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * Selection
         * @class Selection Widget (kendoSelection)
         */
        var Selection = Widget.extend({

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
                that._ensureSurface();
                that._dataSource();
                that._addMouseHandlers();
                // TODO: use variable on container
                that._enabled = that.element.prop('disabled') ? false : that.options.enable;
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Selection',
                id: null,
                autoBind: true,
                dataSource: [],
                scaler: 'div.kj-stage',
                container: 'div.kj-stage>div[data-role="stage"]',
                color: '#FF0000',
                hasSurface: true, // TODO connectors have it but I am not sure what it is intended for ?
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
                var element = this.element;
                var options = this.options;
                var container = element.closest(options.container);
                var scaler = container.closest(options.scaler);
                var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                var rect = element.get(0).getBoundingClientRect();
                var ownerDocument = $(container.get(0).ownerDocument);
                var stageOffset = container.offset();
                var elementBox = {
                    origin: {
                        x: (rect.left - stageOffset.left + ownerDocument.scrollLeft()) / scale,
                        y: (rect.top - stageOffset.top + ownerDocument.scrollTop()) / scale
                    },
                    size: {
                        height: rect.height / scale, // getBoundingClientRect includes borders
                        width: rect.width / scale
                    }
                };
                var containerDataSource = container.data(DATA_SOURCE);
                assert.instanceof(DataSource, containerDataSource, kendo.format(assert.messages.instanceof.default, 'containerDataSource', 'kendo.data.DataSource'));
                var selections = containerDataSource.data().filter(function (selection) {
                    return selection.type === ROLE && kendo.parseColor(selection.data.color).equals(options.color);
                });
                if ($.isArray(selections) && selections.length) {
                    if (selections.length > container.find(kendo.roleSelector(ROLE) + kendo.format(ATTRIBUTE_SELECTOR, kendo.attr('color'), options.color)).length) {
                        // TODO we also need to consider widgets that use the colour by default
                        return 0;
                    }
                    var found = 0;
                    for (var i = 0, length = selections.length; i < length; i++) {
                        var selectionBox = selections[i].data;
                        if (selectionBox.origin.x >= elementBox.origin.x &&
                            selectionBox.origin.x <= elementBox.origin.x + elementBox.size.width &&
                            selectionBox.origin.y >= elementBox.origin.y &&
                            selectionBox.origin.y <= elementBox.origin.y + elementBox.size.height) {
                            // TODO: Consider making sur the center of elementBox is inside selectionBox
                            found++;
                        }
                    }
                    return found;
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
                // DRAGGABLE_WIDGET (which might be shared with other widgets) is used to position the drawing surface below draggable elements
                that.element
                    .addClass(WIDGET_CLASS)
                    // .addClass(DRAGGABLE_CLASS) // Contrary to connectors, Circlings are not draggables
                    .css({ touchAction: 'none', borderColor: that.options.color })
                    .append($(DIV).addClass(INNER_CLASS).css({ touchAction: 'none', borderColor: that.options.color }));
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
                    var container = this;
                    try {
                        container.data(DATA_COLOR, kendo.parseColor(color).toCss());
                    } catch (ex) {
                        container.data(DATA_COLOR, DEFAULT_STROKE.COLOR);
                    }
                }
            },

            /**
             * Ensure connection surface for all selections
             * @private
             */
            _ensureSurface: function () {
                var options = this.options;
                var container = this.element.closest(options.container);
                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, options.container));
                // initialize pen color
                var colorHandler = container.data(COLOR_HANDLER);
                if ($.type(colorHandler) === UNDEFINED) {
                    colorHandler = $.proxy(this._onColorChange, container);
                    $(document).on(COLOR, colorHandler);
                    container.data(COLOR_HANDLER, colorHandler);
                    container.data(DATA_COLOR, DEFAULT_STROKE.COLOR);
                }
                // ensure surface
                var surface = container.data(SURFACE);
                if (options.hasSurface && !(surface instanceof Surface)) {
                    var surfaceElement = container.find(DOT + SURFACE_CLASS);
                    if (surfaceElement.length === 0) {
                        // assert.ok(this.element.hasClass(WIDGET_CLASS), 'this._layout should be called before this._ensureSurface');
                        var firstElementWithDraggable = container.children().has(DOT + DRAGGABLE_CLASS).first();
                        // assert.hasLength(firstElementWithDraggable, kendo.format(assert.messages.hasLength.default, 'firstElementWithDraggable'));
                        surfaceElement = $(DIV)
                            .addClass(SURFACE_CLASS)
                            .css({ position: 'absolute', top: 0, left: 0 })
                            .height(container.height())
                            .width(container.width());
                        // Circlings are not draggables so we have to consider that there is no firstElementWithDraggable
                        if (firstElementWithDraggable instanceof $ && firstElementWithDraggable.length) {
                            surfaceElement.insertBefore(firstElementWithDraggable);
                        } else {
                            surfaceElement.appendTo(container);
                        }
                        surfaceElement.empty();
                        surface = kendo.drawing.Surface.create(surfaceElement);
                        container.data(SURFACE, surface);
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
                // So we cannot use `this`, which is specific to this selection
                var options = this.options;
                var path;
                $(document)
                    .off(NS, options.container)
                    .on(MOUSEDOWN, options.container, function (e) {
                        e.preventDefault(); // prevents from selecting the div
                        var container = $(e.currentTarget);
                        var scaler = container.closest(options.scaler);
                        var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                        var mouse = util.getMousePosition(e, container);
                        var surface = container.data(SURFACE);
                        assert.instanceof(Surface, surface, kendo.format(assert.messages.instanceof.default, 'surface', 'kendo.drawing.Surface'));
                        var mousePoint = new geometry.Point(mouse.x / scale, mouse.y / scale);
                        var containerDataSource = container.data(DATA_SOURCE);
                        assert.instanceof(DataSource, containerDataSource, kendo.format(assert.messages.instanceof.default, 'containerDataSource', 'kendo.data.DataSource'));
                        var selectionDeletion = containerDataSource.data().filter(function (selection) {
                            var selectionBox = selection.data;
                            return (mousePoint.x >= selectionBox.origin.x &&
                                mousePoint.x <= selectionBox.origin.x + selectionBox.size.width &&
                                mousePoint.y >= selectionBox.origin.y &&
                                mousePoint.y <= selectionBox.origin.y + selectionBox.size.height);
                        });
                        if ($.isArray(selectionDeletion) && selectionDeletion.length) {
                            selectionDeletion.forEach(function(selection) {
                                containerDataSource.remove(selection);
                            });
                        } else {
                            path = new drawing.Path({
                                stroke: {
                                    color: container.data(DATA_COLOR),
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
                            var scaler = container.closest(options.scaler);
                            var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                            var mouse = util.getMousePosition(e, container);
                            path.lineTo(mouse.x / scale, mouse.y / scale);
                        }
                    })
                    .on(MOUSEUP, options.container, function (e) {
                        if (path instanceof drawing.Path) {
                            var container = $(e.currentTarget);
                            var dataSource = container.data(DATA_SOURCE);
                            if (dataSource instanceof kendo.data.DataSource) {
                                var bbox = path.bbox();
                                var height = Math.floor(bbox.size.height);
                                var width = Math.floor(bbox.size.width);
                                if (Math.sqrt(Math.pow(height, 2) + Math.pow(width, 2)) >= MIN_DIAGONAL) {
                                    // Only draw a minimal selection (defined by a minimum diagonal)
                                    dataSource.add({
                                        type: ROLE, data: {
                                            color: container.data(DATA_COLOR),
                                            origin: {x: Math.floor(bbox.origin.x), y: Math.floor(bbox.origin.y)},
                                            size: {height: height, width: width}
                                        }
                                    });
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

                var that = this;
                var options = that.options;
                var container = that.element.closest(options.container);

                // returns the datasource OR creates one if using array or configuration
                that.dataSource = DataSource.create(that.options.dataSource);

                var containerDataSource = container.data(DATA_SOURCE);

                if (containerDataSource instanceof DataSource) {

                    // trigger a read on the dataSource if one hasn't happened yet
                    // that.dataSource.fetch();
                    // if (containerDataSource.data() !== that.dataSource.data()) {
                    //    throw new Error('All selections within the same container/stage should share the same data.');
                    // }
                    that.dataSource = containerDataSource;

                } else {

                    // Set container containerDataSource
                    container.data(DATA_SOURCE, that.dataSource);

                    var refreshHandler = container.data(REFRESH_HANDLER);
                    // bind to the change event to refresh the widget
                    if (refreshHandler) {
                        that.dataSource.unbind(CHANGE, refreshHandler);
                    }
                    refreshHandler = $.proxy(that.refresh, container);
                    that.dataSource.bind(CHANGE, refreshHandler);

                    if (that.options.autoBind) {
                        that.dataSource.fetch();
                    }
                }
            },

            /**
             * Sets the dataSource for source binding
             * Note: The dataSource is shared by all selection widgets in the same container
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
                var container = this;
                var containerDataSource = container.data(DATA_SOURCE);
                assert.instanceof($, container, kendo.format(assert.messages.instanceof.default, 'container', 'jQuery'));
                assert.instanceof(DataSource, containerDataSource, kendo.format(assert.messages.instanceof.default, 'containerDataSource', 'kendo.data.DataSource'));
                var selections = containerDataSource.data(); // TODO: filter
                var surface = container.data(SURFACE);
                if (surface instanceof kendo.drawing.Surface) {
                    // Clear surface
                    surface.clear();
                    // Draw
                    for (var i = 0, total = selections.length; i < total; i++) {
                        var selection = selections[i];
                        if (selection.type === ROLE) {
                            var selectionBox = selection.data; // bbox with color
                            var center = [selectionBox.origin.x + selectionBox.size.width / 2, selectionBox.origin.y + selectionBox.size.height / 2];
                            var arcGeometry = new geometry.Arc(
                                center,
                                {
                                    radiusX: selectionBox.size.width / 2,
                                    radiusY: selectionBox.size.height / 2,
                                    startAngle: 0,
                                    endAngle: 360,
                                    anticlockwise: false
                                }
                            );
                            var arc = new drawing.Arc(arcGeometry).stroke(selectionBox.color, DEFAULT_STROKE.WIDTH);
                            surface.draw(arc);
                        }
                    }
                }
                // Trigger a change after refreshing to recalculate databound values
                container.find(kendo.roleSelector(ROLE)).each(function (index, element) {
                    var selectionWidget = $(element).data(WIDGET);
                    if (selectionWidget instanceof kendo.ui.Selection) {
                        selectionWidget.trigger(CHANGE);
                    }
                });
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
                var surface = container.data(SURFACE);
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
                    container.removeData(SURFACE);
                }
            }
        });

        kendo.ui.plugin(Selection);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
