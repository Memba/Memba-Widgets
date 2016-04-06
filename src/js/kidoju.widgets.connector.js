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
        var drawing = kendo.drawing;
        var geometry = kendo.geometry;
        var ObservableArray = kendo.data.ObservableArray;
        var Surface = drawing.Surface;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.connector');
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
        var PATH_WIDTH = 10;
        var PATH_LINECAP = 'round';
        var OBSERVABLE = 'observableArray';
        var SURFACE = 'surface';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var ID = 'id';
        // var VALUE = 'value';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        var util = {

            /**
             * Get a random pastel color to draw connections
             * @returns {string}
             */
            getRandomColor: function ()
            {
                var r = (Math.round(Math.random() * 127) + 127).toString(16);
                var g = (Math.round(Math.random() * 127) + 127).toString(16);
                var b = (Math.round(Math.random() * 127) + 127).toString(16);
                return '#' + r + g + b;
            },

            /**
             * Get the mouse (or touch) position
             * @param e
             * @param stage
             * @returns {{x: *, y: *}}
             */
            getMousePosition: function (e, stage) {
                // See http://www.jacklmoore.com/notes/mouse-position/
                // See http://www.jqwidgets.com/community/topic/dragend-event-properties-clientx-and-clienty-are-undefined-on-ios/
                // See http://www.devinrolsen.com/basic-jquery-touchmove-event-setup/
                // ATTENTION: e.originalEvent.changedTouches instanceof TouchList, not Array
                var clientX = e.originalEvent && e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].clientX : e.clientX;
                var clientY = e.originalEvent && e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].clientY : e.clientY;
                // IMPORTANT: Position is relative to the stage and e.offsetX / e.offsetY do not work in Firefox
                // var stage = $(e.target).closest('.kj-stage').find(kendo.roleSelector('stage'));
                var mouse = {
                    x: clientX - stage.offset().left + $(stage.get(0).ownerDocument).scrollLeft(),
                    y: clientY - stage.offset().top + $(stage.get(0).ownerDocument).scrollTop()
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
                return {
                    left: (element.offset().left - stage.offset().left) / scale + element.width() / 2,
                    top: (element.offset().top - stage.offset().top) / scale + element.height() / 2
                };
            },

            /**
             * Get the scale of an element's CSS transformation
             * Note: the same function is used in kidoju.widgets.stage
             * @param element
             * @returns {Number|number}
             */
            getTransformScale: function (element) {
                // $(element).css('transform') returns a matrix, so we have to read the style attribute
                var match = ($(element).attr('style') || '').match(/scale\([\s]*([0-9\.]+)[\s]*\)/);
                return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 1 : 1;
            }

        };

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
                logger.debug('widget initialized');
                that._layout();
                that._ensureSurface();
                that._bindConnectionArray();
                that._drawConnector();
                that._addDragAndDrop();
                that.value(that.options.value);
                that._enabled = that.element.prop('disabled') ? false : that.options.enable;
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Connector',
                value: null,
                scaler: '', // e.g. '.kj-stage', a parent component that is scaled using CSS transforms
                container: 'body', // e.g. '.kj-stage>div[data-role="stage"]',
                color: '#FF0000',
                hasSurface: true,
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
                if ($.type(value) === STRING || $.type(value) === NULL) { // nullable string
                    if (that._value !== value) {
                        if ($.type(value) === STRING && value.length) {
                            var added = that._addConnection(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), value));
                            if (added) {
                                that._value = value;
                            } else {
                                that._value = undefined;
                            }
                        } else {
                            that._dropConnection();
                            that._value = null;
                        }
                    }
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
                // touch-action: 'none' is for Internet Explorer
                // @see https://github.com/jquery/jquery/issues/2987
                that.element
                    .addClass(WIDGET_CLASS)
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
                // ensure ObservableArray
                var connections = container.data(OBSERVABLE);
                if (!(connections instanceof ObservableArray)) {
                    connections = new ObservableArray([]);
                    container.data(OBSERVABLE, connections);
                }
                // ensure surface
                var surface = container.data(SURFACE);
                if (options.hasSurface && !(surface instanceof Surface)) {
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
                var element = that.element;
                var x = element.width() / 2; // parseInt(options.width, 10) / 2;
                var y = element.height() / 2; // parseInt(options.height, 10) / 2;
                var radius = Math.min(x, y);
                var connector = new drawing.Group();
                var outerCircleGeometry = new geometry.Circle([x, y], 0.8 * radius);
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
             * Note: do not use directly, use container.data(OBSERVABLE).draw
             * @private
             */
            _drawConnections: function () {
                var container = this;
                // The following prevents from using this method directly, in which case `this` is the connector widget
                assert.instanceof($, container, kendo.format(assert.messages.instanceof.default, 'container', 'jQuery'));
                var connections = this.data(OBSERVABLE);
                assert.instanceof(ObservableArray, connections, kendo.format(assert.messages.instanceof.default, 'this.connections', 'kendo.data.ObservableArray'));
                var surface = this.data(SURFACE);
                if (surface instanceof kendo.drawing.Surface) {
                    // Clear surface
                    surface.clear();
                    // Redraw all connections
                    connections.forEach(function (connection) {
                        var origin = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), connection.origin));
                        var originWidget = origin.data(WIDGET);
                        var destination = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), connection.destination));
                        var destinationWidget = destination.data(WIDGET);
                        // Only connector widgets can be connected
                        if (originWidget instanceof Connector && destinationWidget instanceof Connector) {
                            var scaler = origin.closest(originWidget.options.scaler);
                            var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                            var originCenter = util.getElementCenter(origin, container, scale);
                            var destinationCenter = util.getElementCenter(destination, container, scale);
                            var path = new drawing.Path({
                                stroke: {
                                    color: connection.color,
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
            },

            /**
             * Redraw all elements
             */
            refresh: function () {
                // Redraw all connectors
                this._drawConnector();
                // Redraw all connections

            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W073 */

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
                        var connections = container.data(OBSERVABLE);
                        assert.instanceof(ObservableArray, connections, kendo.format(assert.messages.instanceof.default, 'connections', 'kendo.data.ObservableArray'));
                        var origin = id < targetId ? id : targetId;
                        var destination = id < targetId ? targetId : id;
                        var originWidget = id < targetId ? that : targetWidget;
                        var destinationWidget = id < targetId ? targetWidget : that;
                        var originConnection = connections.find(function (connection) {
                            return connection.origin === origin || connection.destination === origin;
                        });
                        var destinationConnection = connections.find(function (connection) {
                            return connection.origin === destination || connection.destination === destination;
                        });
                        if (($.type(originConnection) === UNDEFINED && $.type(destinationConnection) === UNDEFINED) ||
                            (originConnection !== destinationConnection)) {
                            if (originConnection) {
                                // connections.remove(originConnection);
                                originWidget._dropConnection();
                            }
                            if (destinationConnection) {
                                // connections.remove(destinationConnection);
                                destinationWidget._dropConnection();
                            }
                            connections.push({
                                origin: origin,
                                destination: destination,
                                color: util.getRandomColor()
                            });
                            originWidget._value = destination;
                            destinationWidget._value = origin;
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

            /* jshint +W073 */

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
                var connections = container.data(OBSERVABLE);
                assert.instanceof(ObservableArray, connections, kendo.format(assert.messages.instanceof.default, 'connections', 'kendo.data.ObservableArray'));
                var found = connections.find(function (connection) {
                    return connection.origin === id || connection.destination === id;
                });
                if (found) {
                    var targetSelector = found.origin === id ? found.destination : found.origin;
                    var target = container.find(targetSelector);
                    var targetWidget = target.data(WIDGET);
                    connections.remove(found);
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
             * Add drag and drop handlers
             * @param enabled
             * @private
             */
            _addDragAndDrop: function () {
                // IMPORTANT
                // We can have several containers containing connectors
                // But we only have on set of handlers shared across all containers
                // So we cannot use `this`, which is specific to this connector
                var element;
                var path;
                var target;
                $(document)
                    .off(NS)
                    .on(MOUSEDOWN, DOT + WIDGET_CLASS, function (e) {
                        e.preventDefault(); // prevents from selecting the div
                        element = $(e.currentTarget);
                        var elementOffset = element.offset();
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
                            // with touchend target === element
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
                                    var connections = container.data(OBSERVABLE);
                                    assert.instanceof(ObservableArray, connections, kendo.format(assert.messages.instanceof.default, 'connections', 'kendo.data.ObservableArray'));
                                    connections.draw();
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
                                var container = element.closest(elementWidget.options.container);
                                var connections = container.data(OBSERVABLE);
                                assert.instanceof(ObservableArray, connections, kendo.format(assert.messages.instanceof.default, 'connections', 'kendo.data.ObservableArray'));
                                connections.draw();
                            }
                        }
                        path = undefined;
                        element = undefined;
                        target = undefined;
                    });
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
                    container.removeData(OBSERVABLE);
                }
            }
        });

        kendo.ui.plugin(Connector);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
