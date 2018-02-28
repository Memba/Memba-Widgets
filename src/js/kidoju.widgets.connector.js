/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
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
        './kidoju.util'
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
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.connector');
        var util = window.kidoju.util;
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DOT = '.';
        var WIDGET = 'kendoConnector';
        var NS = DOT + WIDGET;
        var MOUSEDOWN = 'mousedown' + NS + ' ' + 'touchstart' + NS;
        var MOUSEMOVE = 'mousemove' + NS + ' ' + 'touchmove' + NS;
        var MOUSEUP = 'mouseup' + NS + ' ' + 'touchend' + NS;
        var DIV = '<div/>';
        var WIDGET_CLASS = 'kj-connector';
        var SURFACE_CLASS = WIDGET_CLASS + '-surface';
        var INTERACTIVE_CLASS = 'kj-interactive';
        var PATH_WIDTH = 10;
        var PATH_LINECAP = 'round';
        var SURFACE = 'surface';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var ID = 'id';
        var DATA_TYPE = 'connection';

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * Connector
         * @class Connector Widget (kendoConnector)
         */
        var Connector = Widget.extend({

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
                that._drawConnector();
                that._addMouseHandlers();
                that.value(that.options.value);
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Connector',
                id: null,
                value: null,
                targetValue: null, // Cannot be undefined otherwise it won't be read
                autoBind: true,
                dataSource: [],
                scaler: 'div.kj-stage',
                container: 'div.kj-stage>div[data-' + kendo.ns + 'role="stage"]',  // TODO: container might not be necessary but we need a Surface Widget??? https://github.com/kidoju/Kidoju-Widgets/issues/166
                color: '#FF0000',
                // in design mode: createSurface = false, enable = false
                // in play mode: createSurface = true, enabled = true
                // in review mode: createSurface = true, enable = false
                createSurface: true,
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
                // INTERACTIVE_CLASS (which might be shared with other widgets) is used to position any drawing surface underneath interactive widgets
                that.element
                    .addClass(WIDGET_CLASS)
                    .addClass(INTERACTIVE_CLASS)
                    .css({ touchAction: 'none' });
                that.surface = drawing.Surface.create(that.element);
            },

            /**
             * Ensure connection surface for all connectors
             * @private
             */
            _ensureSurface: function () {
                var that = this;
                var options = that.options;
                var container = that.element.closest(options.container);
                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, options.container));
                // ensure surface
                var surface = container.data(SURFACE);
                if (options.createSurface && !(surface instanceof Surface)) {
                    var surfaceElement = container.find(DOT + SURFACE_CLASS);
                    if (surfaceElement.length === 0) {
                        // assert.ok(this.element.hasClass(WIDGET_CLASS), 'this._layout should be called before this._ensureSurface');
                        var firstElementWithDraggable = container.children().has(DOT + INTERACTIVE_CLASS).first();
                        assert.hasLength(firstElementWithDraggable, kendo.format(assert.messages.hasLength.default, 'firstElementWithDraggable'));
                        surfaceElement = $(DIV)
                            .addClass(SURFACE_CLASS)
                            .css({ position: 'absolute', top: 0, left: 0 })
                            .height(container.height())
                            .width(container.width());
                        surfaceElement.insertBefore(firstElementWithDraggable);
                        surfaceElement.empty();
                        surface = kendo.drawing.Surface.create(surfaceElement);
                        container.data(SURFACE, surface);
                    }
                }
            },

            /**
             * Draw the connector circle that begins or ends a connection
             * @private
             */
            _drawConnector: function () {
                assert.instanceof(Surface, this.surface, kendo.format(assert.messages.instanceof.default, 'this.surface', 'kendo.drawing.Surface'));
                var that = this; // this is the connector widget
                var options = that.options;
                var color = options.color;
                var element = that.element;
                var x = element.width() / 2; // parseInt(options.width, 10) / 2;
                var y = element.height() / 2; // parseInt(options.height, 10) / 2;
                var radius = Math.max(0, Math.min(x, y) - 10); // Add some space around radius to make it easier to grab on mobile devices
                var group = new drawing.Group();
                var outerCircleGeometry = new geometry.Circle([x, y], 0.8 * radius);
                var outerCircle = new drawing.Circle(outerCircleGeometry).stroke(color, 0.2 * radius);
                group.append(outerCircle);
                var innerCircleGeometry = new geometry.Circle([x, y], 0.5 * radius);
                var innerCircle = new drawing.Circle(innerCircleGeometry).stroke(color, 0.1 * radius).fill(color);
                group.append(innerCircle);
                that.surface.clear();
                that.surface.draw(group);
            },

            /**
             * Add mouse event handlers
             * @private
             */
            _addMouseHandlers: function () {
                // IMPORTANT
                // We can have several containers containing connectors on a page
                // But we only have on set of event handlers shared across all containers
                // So we cannot use `this`, which is specific to this connector
                var element;
                var path;
                var target;
                $(document)
                    .off(NS)
                    .on(MOUSEDOWN, DOT + WIDGET_CLASS, function (e) {
                        e.preventDefault(); // prevents from selecting the div
                        element = $(e.currentTarget);
                        var elementWidget = element.data(WIDGET);
                        if (elementWidget instanceof Connector && elementWidget._enabled) {
                            elementWidget._dropConnection();
                            var scaler = element.closest(elementWidget.options.scaler);
                            var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                            var container = element.closest(elementWidget.options.container);
                            assert.hasLength(container, kendo.format(assert.messages.hasLength.default, elementWidget.options.container));
                            var mouse = util.getMousePosition(e, container);
                            var center = util.getElementCenter(element, container, scale);
                            var surface = container.data(SURFACE);
                            assert.instanceof(Surface, surface, kendo.format(assert.messages.instanceof.default, 'surface', 'kendo.drawing.Surface'));
                            path = new drawing.Path({
                                stroke: {
                                    color: elementWidget.options.color,
                                    lineCap: PATH_LINECAP,
                                    width: PATH_WIDTH
                                }
                            });
                            path.moveTo(center.left, center.top);
                            path.lineTo(mouse.x / scale, mouse.y / scale);
                            surface.draw(path);
                        }
                    })
                    .on(MOUSEMOVE, function (e) {
                        if (element instanceof $ && path instanceof kendo.drawing.Path) {
                            var elementWidget = element.data(WIDGET);
                            assert.instanceof(Connector, elementWidget, kendo.format(assert.messages.instanceof.default, 'elementWidget', 'kendo.ui.Connector'));
                            var scaler = element.closest(elementWidget.options.scaler);
                            var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                            var container = element.closest(elementWidget.options.container);
                            assert.hasLength(container, kendo.format(assert.messages.hasLength.default, elementWidget.options.container));
                            var mouse = util.getMousePosition(e, container);
                            path.segments[1].anchor().move(mouse.x / scale, mouse.y / scale);
                        }
                    })
                    .on(MOUSEUP, DOT + WIDGET_CLASS, function (e) {
                        if (element instanceof $ && path instanceof kendo.drawing.Path) {
                            var targetElement = e.originalEvent && e.originalEvent.changedTouches ?
                                document.elementFromPoint(e.originalEvent.changedTouches[0].clientX, e.originalEvent.changedTouches[0].clientY) :
                                e.currentTarget;
                            target = $(targetElement).closest(DOT + WIDGET_CLASS);
                            var targetWidget = target.data(WIDGET);
                            // with touchend, target === element
                            // BUG REPORT  here: https://github.com/jquery/jquery/issues/2987
                            if (element.attr(kendo.attr(ID)) !== target.attr(kendo.attr(ID)) && targetWidget instanceof Connector && targetWidget._enabled) {
                                var elementWidget = element.data(WIDGET);
                                assert.instanceof(Connector, elementWidget, kendo.format(assert.messages.instanceof.default, 'elementWidget', 'kendo.ui.Connector'));
                                var container = element.closest(elementWidget.options.container);
                                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, elementWidget.options.container));
                                var targetContainer = target.closest(targetWidget.options.container);
                                assert.hasLength(targetContainer, kendo.format(assert.messages.hasLength.default, targetWidget.options.container));
                                if (container[0] === targetContainer[0]) {
                                    elementWidget._addConnection(target);
                                } else {
                                    // We cannot erase so we need to redraw all
                                    elementWidget.refresh();
                                }
                            }  else {
                                target = undefined;
                            }
                        }
                        // Note: The MOUSEUP events bubble and the following handler is always executed after this one
                    })
                    .on(MOUSEUP, function (e) {
                        if (path instanceof kendo.drawing.Path) {
                            path.close();
                        }
                        if (element instanceof $ && $.type(target) === UNDEFINED) {
                            var elementWidget = element.data(WIDGET);
                            if (elementWidget instanceof Connector) {
                                elementWidget.refresh();
                            }
                        }
                        path = undefined;
                        element = undefined;
                        target = undefined;
                    });
            },

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

                // Filter dataSource
                that.dataSource.filter({ field: 'type', operator: 'eq', value: DATA_TYPE });

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

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Add connection
             * Note: use this.value(string)
             * @param target
             */
            _addConnection: function (target) {
                /* jshint maxstatements: 36 */
                /* jshint maxcomplexity: 13 */
                target = $(target);
                var that = this;
                var ret = false;
                var options = that.options;
                var element = that.element;
                var id = element.attr(kendo.attr(ID));
                var container = that.element.closest(options.container);
                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, options.container));
                var targetId = target.attr(kendo.attr(ID));
                var targetWidget = target.data(WIDGET);
                if (id !== targetId && targetWidget instanceof Connector) {
                    var targetContainer = target.closest(targetWidget.options.container);
                    assert.hasLength(targetContainer, kendo.format(assert.messages.hasLength.default, targetWidget.options.container));
                    if (container[0] === targetContainer[0]) {
                        assert.instanceof(DataSource, that.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                        var originId = id < targetId ? id : targetId;
                        var destinationId = id < targetId ? targetId : id;
                        var originWidget = id < targetId ? that : targetWidget;
                        var destinationWidget = id < targetId ? targetWidget : that;
                        var connections = that.dataSource.view();
                        var originConnection = connections.find(function (connection) {
                            return connection.type === DATA_TYPE &&  // The dataSource is already filtered, so this might be redundant
                                (connection.id === originId || connection.data.target === originId);
                        });
                        var destinationConnection = connections.find(function (connection) {
                            return connection.type === DATA_TYPE &&  // The dataSource is already filtered, so this might be redundant
                                (connection.id === destinationId || connection.data.target === destinationId);
                        });
                        if (($.type(originConnection) === UNDEFINED && $.type(destinationConnection) === UNDEFINED) ||
                            (originConnection !== destinationConnection)) {
                            if (originConnection) {
                                that.dataSource.remove(originConnection);
                                originWidget._dropConnection();
                            }
                            if (destinationConnection) {
                                that.dataSource.remove(destinationConnection);
                                destinationWidget._dropConnection();
                            }
                            that.dataSource.add({
                                type: DATA_TYPE,
                                id: originId,
                                data: {
                                    target: destinationId,
                                    color: util.getRandomColor()
                                }
                            });
                            originWidget._value = destinationWidget.options.targetValue;
                            destinationWidget._value = originWidget.options.targetValue;
                            // if (originWidget.element[0].kendoBindingTarget && !(originWidget.element[0].kendoBindingTarget.source instanceof kidoju.data.PageComponent)) {
                            if (originWidget.element[0].kendoBindingTarget && !(originWidget.element[0].kendoBindingTarget.source instanceof kendo.data.Model)) {
                                originWidget.trigger(CHANGE, { value: originWidget._value });
                            }
                            // if (destinationWidget.element[0].kendoBindingTarget && !(destinationWidget.element[0].kendoBindingTarget.source instanceof kidoju.data.PageComponent)) {
                            if (destinationWidget.element[0].kendoBindingTarget && !(destinationWidget.element[0].kendoBindingTarget.source instanceof kendo.data.Model)) {
                                destinationWidget.trigger(CHANGE, { value: destinationWidget._value });
                            }
                        }
                        ret = true;
                    }
                }
                return ret;
            },

            /* jshint +W074 */

            /**
             * Remove connection
             * Note: use this.value(null)
             */
            _dropConnection: function () {
                var that = this;
                var options = that.options;
                var element = that.element;
                var id = element.attr(kendo.attr(ID));
                var container = that.element.closest(options.container);
                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, options.container));
                assert.instanceof(DataSource, that.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                var found = that.dataSource.view().find(function (connection) {
                    return connection.type === DATA_TYPE && // The dataSource is already filtered, so this might be redundant
                        (connection.id === id || connection.data.target === id);
                });
                if (found) {
                    var targetId = found.id === id ? found.data.target : found.id;
                    var target = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), targetId));
                    var targetWidget = target.data(WIDGET);
                    that.dataSource.remove(found);
                    that._value = null;
                    if (targetWidget instanceof Connector) {
                        targetWidget._value = null;
                    }
                    that.trigger(CHANGE, { value: null });
                    if (targetWidget instanceof Connector) {
                        targetWidget.trigger(CHANGE, { value: null });
                    }
                }
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

                var surface = container.data(SURFACE);
                if (surface instanceof kendo.drawing.Surface) {
                    // Clear surface
                    surface.clear();
                    // Redraw all connections
                    that.dataSource.view().forEach(function (connection) {
                        var origin = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), connection.id));
                        var originWidget = origin.data(WIDGET);
                        var destination = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), connection.data.target));
                        var destinationWidget = destination.data(WIDGET);
                        // Only connector widgets can be connected
                        if (originWidget instanceof Connector && destinationWidget instanceof Connector) {
                            var scaler = origin.closest(originWidget.options.scaler);
                            var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                            var originCenter = util.getElementCenter(origin, container, scale);
                            var destinationCenter = util.getElementCenter(destination, container, scale);
                            var path = new drawing.Path({
                                stroke: {
                                    color: connection.data.color,
                                    lineCap: PATH_LINECAP,
                                    width: PATH_WIDTH
                                }
                            })
                                .moveTo(originCenter.left, originCenter.top)
                                .lineTo(destinationCenter.left, destinationCenter.top);
                            surface.draw(path);
                        }
                    });
                }

                logger.debug({ method: 'refresh', message: 'widget refreshed' });
            },

            /**
             * Enable/disable user interactivity on connector
             */
            enable: function (enabled) {
                // this._enabled is checked in _addMouseHandlers
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

        kendo.ui.plugin(Connector);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
