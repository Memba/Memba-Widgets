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
        var ObservableArray = kendo.data.ObservableArray;
        var Surface = drawing.Surface;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.connector');
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DOT = '.';
        var HASH = '#';
        var WIDGET = 'kendoConnector';
        var NS = DOT + WIDGET;
        var MOUSEDOWN = 'mousedown' + NS + ' ' + 'touchdown' + NS;
        var MOUSEMOVE = 'mousemove' + NS + ' ' + 'touchmove' + NS;
        var MOUSEUP = 'mouseup' + NS + ' ' + 'touchup' + NS;
        var DIV = '<div/>';
        var WIDGET_CLASS = 'kj-connector';
        var SURFACE_CLASS = WIDGET_CLASS + '-surface';
        var PATH_WIDTH = 5;
        var OBSERVABLE = 'observableArray';
        var SURFACE = 'surface';

        /*********************************************************************************
         * Connector Widget
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
                logger.debug('widget initialized');
                that._layout();
                that._ensureSurface();
                that._bindConnectionArray();
                that._addDragAndDrop();
                that.refresh();
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Connector',
                value: null,
                container: '.k-content', // .kj-stage>div[data-role="stage"]
                color: '#FF0000',
                height: 20,
                width: 20
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
                var options = that.options;
                var height = options.height;
                var width = options.width;
                that.wrapper = that.element;
                that.element
                    .addClass(WIDGET_CLASS)
                    .height(width)
                    .width(height);
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
                // ensure ObservableArray
                var connections = container.data(OBSERVABLE);
                if (!(connections instanceof ObservableArray)) {
                    connections = new ObservableArray([]);
                    container.data(OBSERVABLE, connections);
                }
                // ensure surface
                var surface = container.data(SURFACE);
                if (!(surface instanceof Surface)) {
                    var surfaceElement = container.find(DOT + SURFACE_CLASS);
                    if (surfaceElement.length === 0) {
                        assert.ok(this.element.hasClass(WIDGET_CLASS), 'this._layout should be called before this._ensureSurface');
                        var firstChildWithConnector = container.children().has(DOT + WIDGET_CLASS).first();
                        if (firstChildWithConnector.length) {
                            surfaceElement = $(DIV)
                                .addClass(SURFACE_CLASS)
                                .css({ position: 'absolute', top: 0, left: 0 })
                                .height(container.height())
                                .width(container.width());
                            // TODO: what if elements have been reordered in explorer ?????????
                            // The solution is not to ensure the surface in design mode
                            surfaceElement.insertBefore(firstChildWithConnector);
                        }
                    }
                    surfaceElement.empty();
                    surface = kendo.drawing.Surface.create(surfaceElement);
                    container.data(SURFACE, surface);
                }
            },

            /**
             * Bind connection array
             * @private
             */
            _bindConnectionArray: function () {
                var that = this;
                var options = that.options;
                var container = that.element.closest(options.container);
                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, options.container));
                var connections = container.data(OBSERVABLE);
                assert.instanceof(ObservableArray, connections, kendo.format(assert.messages.instanceof.default, 'connections', 'kendo.data.ObservableArray'));
                if (!$.isFunction(connections.draw)) {
                    connections.draw = $.proxy(that._drawConnections, container);
                    connections.bind(CHANGE, connections.draw);
                }
            },

            /**
             * Draw the connector circle
             * @private
             */
            _drawConnector: function () {
                assert.instanceof(Surface, this.surface, kendo.format(assert.messages.instanceof.default, 'this.surface', 'kendo.drawing.Surface'));
                var that = this; // this is the connector widget
                var options = that.options;
                var color = options.color;
                var x = parseInt(options.width, 10) / 2;
                var y = parseInt(options.height, 10) / 2;
                var radius = Math.min(x, y);
                var connector = new drawing.Group();
                var outerCircleGeometry = new geometry.Circle([x, y], 0.8* radius);
                var outerCircle = new drawing.Circle(outerCircleGeometry).stroke(color, 0.2 * radius);
                connector.append(outerCircle);
                var innerCircleGeometry = new geometry.Circle([x, y], 0.5 * radius);
                var innerCircle = new drawing.Circle(innerCircleGeometry).stroke(color, 0.1 * radius).fill(color);
                connector.append(innerCircle);
                that.surface.clear();
                that.surface.draw(connector);
            },

            /**
             * Draw connections
             * @private
             */
            _drawConnections: function () {
                var container = this;
                // The following prevents from using this method directly, in which case `this` is the connector widget
                assert.instanceof($, container, kendo.format(assert.messages.instanceof.default, 'container', 'jQuery'));
                var connections = this.data(OBSERVABLE);
                assert.instanceof(ObservableArray, connections, kendo.format(assert.messages.instanceof.default, 'this.connections', 'kendo.data.ObservableArray'));
                var surface = this.data(SURFACE);
                assert.instanceof(Surface, surface, kendo.format(assert.messages.instanceof.default, 'this.surface', 'kendo.drawing.Surface'));
                // Clear surface
                surface.clear();
                // Redraw all connections
                connections.forEach(function(connection) {
                    var origin = $(connection.origin);
                    var originWidget = origin.data(WIDGET);
                    var destination = $(connection.destination);
                    var destinationWidget = destination.data(WIDGET);
                    // Only connector widgets can be connected
                    if (originWidget instanceof Connector && destinationWidget instanceof Connector) {
                        var originOffset = origin.offset();
                        var destinationOffset = destination.offset();
                        var containerOffset = container.offset();
                        var path = new drawing.Path({
                            stroke: { color: originWidget.options.color, width: PATH_WIDTH }
                        })
                            .moveTo(originOffset.left - containerOffset.left + origin.width() / 2, originOffset.top - containerOffset.top + origin.height() / 2)
                            .lineTo(destinationOffset.left - containerOffset.left + destination.width() / 2, destinationOffset.top - containerOffset.top + destination.height() / 2);
                        surface.draw(path);
                    }
                });
            },

            /**
             * Add widget connection (check data-target on element)
             * @private
             */
            _addWidgetConnection: function () {
                var that = this;
                var element = that.element;
                var targetId = element.attr(kendo.attr('target'));
                if ($.type(targetId) === STRING) {
                    that.addConnection(HASH + targetId);
                }
            },

            /**
             * Redraw the widget
             */
            refresh: function () {
                this._drawConnector();
                this._addWidgetConnection();
            },

            /**
             * Add connection
             * @param target (with a HASH)
             */
            addConnection: function(target) {
                assert.match(/^#/, target, kendo.format(assert.messages.match.default, 'target', '^#'));
                var that = this;
                var options = that.options;
                var element = that.element;
                var id = HASH + element.attr('id');
                var targetWidget = $(target).data(WIDGET);
                if (targetWidget instanceof Connector && id !== target) {
                    var container = that.element.closest(options.container);
                    assert.hasLength(container, kendo.format(assert.messages.hasLength.default, options.container));
                    var connections = container.data(OBSERVABLE);
                    assert.instanceof(ObservableArray, connections, kendo.format(assert.messages.instanceof.default, 'connections', 'kendo.data.ObservableArray'));
                    var found;
                    if (id < target) {
                        found = connections.find(function (connection) { return connection.origin === id && connection.destination === target });
                        if (!found) {
                            connections.push({
                                origin: id,
                                destination: target
                            });
                        }
                    } else {
                        found = connections.find(function (connection) { return connection.origin === target && connection.destination === id });
                        if (!found) {
                            connections.push({
                                origin: target,
                                destination: id
                            });
                        }
                    }
                }
            },

            /**
             * Remove connection
             */
            removeConnection: function() {
                var found;

            },

            /**
             * Add drag and drop handlers
             * @param enabled
             * @private
             */
            _addDragAndDrop: function (enabled) {
                // IMPORTANT
                // We can have several containers containing connectors
                // But we only have on set of handlers across all containers
                // So we cannot use `this` connector to access the container
                var element, path;
                $(document)
                    .off(NS)
                    .on(MOUSEDOWN, DOT + WIDGET_CLASS, function (e) {
                        element = $(e.currentTarget);
                        var elementOffset = element.offset();
                        var elementWidget = element.data(WIDGET);
                        if (elementWidget instanceof Connector) {
                            var container = element.closest(elementWidget.options.container);
                            assert.hasLength(container, kendo.format(assert.messages.hasLength.default, elementWidget.options.container));
                            var containerOffset = container.offset();
                            var surface = container.data(SURFACE);
                            assert.instanceof(Surface, surface, kendo.format(assert.messages.instanceof.default, 'surface', 'kendo.drawing.Surface'));
                            path = new drawing.Path({ stroke: { color: elementWidget.options.color, width: PATH_WIDTH } });
                            path.moveTo(elementOffset.left - containerOffset.left + element.width() / 2, elementOffset.top - containerOffset.top + element.height() / 2);
                            path.lineTo(e.pageX - containerOffset.left, e.pageY - containerOffset.top);
                            surface.draw(path);
                        } else {
                            element = undefined;
                        }
                    })
                    .on(MOUSEMOVE, function (e) {
                        if (element instanceof $ && path instanceof kendo.drawing.Path) {
                            var elementWidget = element.data(WIDGET);
                            assert.instanceof(Connector, elementWidget, kendo.format(assert.messages.instanceof.default, 'elementWidget', 'kendo.ui.Connector'));
                            var container = element.closest(elementWidget.options.container);
                            assert.hasLength(container, kendo.format(assert.messages.hasLength.default, elementWidget.options.container));
                            var containerOffset = container.offset();
                            path.segments[1].anchor().move(e.pageX - containerOffset.left, e.pageY - containerOffset.top);
                        }
                    })
                    .on(MOUSEUP, DOT + WIDGET_CLASS, function (e) {
                        if (element instanceof $ && path instanceof kendo.drawing.Path) {
                            var elementWidget = element.data(WIDGET);
                            assert.instanceof(Connector, elementWidget, kendo.format(assert.messages.instanceof.default, 'elementWidget', 'kendo.ui.Connector'));
                            var target = $(e.currentTarget);
                            var targetWidget = target.data(WIDGET);
                            if (targetWidget instanceof Connector) {
                                var targetId = $(e.currentTarget).attr('id');
                                // TODO: assert targetId
                                elementWidget.addConnection(HASH + targetId);
                            }
                        }
                        // Note: The MOUSEUP events bubble and the following handler is executed
                    })
                    .on(MOUSEUP, function(e) {
                        if (element instanceof $ && path instanceof kendo.drawing.Path) {
                            path.close();
                            path = undefined;
                            element = undefined;
                            // TODO: redraw
                        }
                    });
            },

            /**
             * Enable/disable user interactivity
             */
            enable: function(enabled) {

                // Attention one connector or all connectors?

                // Remove drag & drop handlers
                if (enabled) {
                    // Add drag & drop handlers
                }
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

        kendo.ui.plugin(Connector);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
