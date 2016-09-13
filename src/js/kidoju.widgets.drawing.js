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
        var DataSource = data.DataSource;
        var Surface = drawing.Surface;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.drawing');
        var NUMBER = 'number';
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DOT = '.';
        var WIDGET = 'kendoDrawing';
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
         * Drawing
         * @class Drawing Widget (kendoConnector)
         */
        var Drawing = Widget.extend({

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
                that._enabled = that.element.prop('disabled') ? false : that.options.enable;
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Drawing',
                id: null,
                autoBind: true,
                dataSource: [],
                scaler: 'div.kj-stage',
                container: 'div.kj-stage>div[data-role="stage"]',
                color: '#FF0000',
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
                that.element
                    .addClass(WIDGET_CLASS)
                    .css({ touchAction: 'none' });
                that.surface = drawing.Surface.create(that.element);
            },

            /**
             * Add drag and drop handlers
             * @private
             */
            _addDragAndDrop: function () {
                // IMPORTANT
                // We can have several containers containing connectors on a page
                // But we only have one set of event handlers shared across all containers
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
                        if (elementWidget instanceof Drawing && elementWidget._enabled) {
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
                                    color: elementWidget.options.color
                                    // lineCap: PATH_LINECAP,
                                    // width: PATH_WIDTH
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
                            assert.instanceof(Drawing, elementWidget, kendo.format(assert.messages.instanceof.default, 'elementWidget', 'kendo.ui.Drawing'));
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
                            if (element.attr(kendo.attr(ID)) !== target.attr(kendo.attr(ID)) && targetWidget instanceof Drawing && targetWidget._enabled) {
                                var elementWidget = element.data(WIDGET);
                                assert.instanceof(Drawing, elementWidget, kendo.format(assert.messages.instanceof.default, 'elementWidget', 'kendo.ui.Drawing'));
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
                            if (elementWidget instanceof Drawing) {
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
            refresh: function () {
                var that = this;
                var options = that.options;
                var container = that.element.closest(options.container);
                assert.instanceof($, container, kendo.format(assert.messages.instanceof.default, 'container', 'jQuery'));
                assert.instanceof(DataSource, that.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                var connections = this.dataSource.data();
                var surface = container.data(SURFACE);
                if (surface instanceof kendo.drawing.Surface) {
                    // Clear surface
                    surface.clear();

                }
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
                }
            }
        });

        kendo.ui.plugin(Drawing);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
