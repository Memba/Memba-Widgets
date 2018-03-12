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
        './kidoju.util'
        // './kidoju.widgets.stage'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var data = kendo.data;
        var DataSource = data.DataSource;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.dropzone');
        var util = window.kidoju.util;
        var STRING = 'string';
        var NUMBER = 'number';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DATABOUND = 'dataBound';
        var NS = '.kendoDropZone';
        var MOUSEDOWN = 'mousedown' + NS + ' ' + 'touchstart' + NS;
        var MOUSEMOVE = 'mousemove' + NS + ' ' + 'touchmove' + NS;
        var MOUSELEAVE = 'mouseleave' + NS + ' ' + 'touchleave' + NS;
        var MOUSEUP = 'mouseup' + NS + ' ' + 'touchend' + NS;
        var ROLE_SELECTOR = 'dropzone';
        var DATA_TYPE = 'draggable';
        var WIDGET_CLASS = 'kj-dropzone'; // 'k-widget kj-dropzone';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var ID = 'id';
        var CONSTANT = 'constant';

        /*********************************************************************************
         * DropZoneEvents
         *********************************************************************************/

        /**
         * DropZoneEvents
         */
        var DropZoneEvents = kendo.Class.extend({

            /**
             * Constructor
             * @param options
             */
            init: function (options) {
                assert.isPlainObject(options, assert.format(assert.messages.isPlainObject.default, 'options'));
                assert(STRING, options.container, assert.format(assert.messages.type.default, 'options.container', STRING));
                assert(STRING, options.draggable, assert.format(assert.messages.type.default, 'options.draggable', STRING));
                assert(STRING, options.scaler, assert.format(assert.messages.type.default, 'options.scaler', STRING));
                this._container = options.container;
                this._draggable = options.draggable;
                this._scaler = options.scaler;
            },

            /**
             * Enable/disable events
             * @param enable
             */
            enable: function (enable) {
                enable = $.type(enable) === UNDEFINED ? true : !!enable;

                // We need an object so that data is passed by reference between handlers
                var data = {};

                $(document).off(NS);

                if (enable) {
                    $(document)
                        .on(MOUSEDOWN, this._container, data, this._onMouseDown.bind(this))
                        .on(MOUSEMOVE, this._container, data, this._onMouseMove.bind(this))
                        .on(MOUSELEAVE, this._container, data, this._onMouseEnd.bind(this))
                        .on(MOUSEUP, data, this._onMouseEnd.bind(this));

                }
            },

            /**
             * Check that all drop zones in same container as stageElement are enabled
             * @param stageElement
             */
            enabled: function (stageElement) {
                var container = stageElement instanceof $ ? stageElement.closest(this._container) : $(document.body);
                var dropZones = container.find(kendo.roleSelector(ROLE_SELECTOR));
                container.find(this._draggable).css('cursor', '');
                for (var i = 0, length = dropZones.length; i < length; i++) {
                    var dropZone = $(dropZones[i]);
                    var dropZoneWidget = dropZone.data('kendoDropZone');
                    if (dropZoneWidget instanceof DropZone && dropZoneWidget._enabled) {
                        container.find(this._draggable).css('cursor', 'move');
                        return true;
                    }
                }
                return false;
            },

            /**
             * Get surface point from mouse event
             * Note: this gives us stage coordinates that do not depend on scale
             * @param e
             * @private
             */
            _getStagePoint: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(window.Element, e.target, assert.format(assert.messages.instanceof.default, 'e.target', 'Element'));
                assert.type(STRING, this._container, assert.format(assert.messages.type.default, 'this._container', STRING));
                assert.type(STRING, this._scaler, assert.format(assert.messages.type.default, 'this._scaler', STRING));
                var container = $(e.target).closest(this._container);
                assert.hasLength(container, assert.format(assert.messages.hasLength.default, 'container'));
                var scaler = container.closest(this._scaler);
                var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                var mouse = util.getMousePosition(e, container);
                // var point = new geometry.Point(mouse.x / scale, mouse.y / scale);
                var point = { x: mouse.x / scale, y : mouse.y / scale };
                return point;
            },

            /**
             * Get a stage element
             * @param e
             * @private
             */
            _getStageElement: function (target) {
                var stageElement = $(target).closest(this._draggable);
                if (this.enabled(stageElement)) {
                    return stageElement;
                }
            },

            /**
             * mousedown event handler
             * @param e
             * @private
             */
            _onMouseDown: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(window.Element, e.target, assert.format(assert.messages.instanceof.default, 'e.target', 'Element'));
                var stageElement = this._getStageElement(e.target);
                if (stageElement instanceof $ && stageElement.length) {
                    e.preventDefault(); // prevent text selection;
                    // IMPORTANT: Do not assign e.data directly otherwise the reference
                    // to the data object will be lost across events
                    e.data.initial = {
                        // stageElement.position() does not work when scaled
                        top: parseFloat(stageElement.css('top')) || 0,
                        left: parseFloat(stageElement.css('left')) || 0
                    };
                    e.data.mousedown = this._getStagePoint(e);
                    e.data.stageElement = stageElement;
                    e.data.type = DATA_TYPE;
                    // Note: we do not handle rotation
                }
            },

            /**
             * mousemove event handler
             * @param e
             * @private
             */
            _onMouseMove: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                if ($.isPlainObject(e.data) && e.data.type === DATA_TYPE && e.data.stageElement instanceof $) {
                    e.preventDefault();
                    var stageElement = e.data.stageElement;
                    var container = stageElement.closest(this._container);
                    var initial = e.data.initial;
                    var mousedown = e.data.mousedown;
                    var mouse = this._getStagePoint(e);
                    var left = util.snap(initial.left + mouse.x - mousedown.x, 0);
                    var top = util.snap(initial.top + mouse.y - mousedown.y, 0);
                    // Keep dragging within container
                    left = Math.round(Math.max(0, Math.min(left, container.width() - stageElement.width())));
                    top = Math.round(Math.max(0, Math.min(top, container.height() - stageElement.height())));
                    e.data.position = { left: left, top: top };
                    // Update position
                    window.requestAnimationFrame(function () {
                        // e.data is undefined in this scope
                        stageElement.css({ left: left, top: top });
                    });
                }
            },

            /**
             * mouseleave and mouseup event handler
             * @param e
             * @private
             */
            _onMouseEnd: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                if ($.isPlainObject(e.data) && e.data.type === DATA_TYPE && $.isPlainObject(e.data.position) && e.data.stageElement instanceof $) {
                    this._onMouseMove(e);
                    this._setDataItem(e.data.stageElement, e.data.position);
                    // IMPORTANT: Do not assign e.data directly otherwise the reference
                    // to the data object will be lost across events
                    e.data.initial = undefined;
                    e.data.mousedown = undefined;
                    e.data.position = undefined;
                    e.data.stageElement = undefined;
                    e.data.type = undefined;
                }
            },

            /**
             * Store dragged position
             * @param stageElement
             * @param position
             * @private
             */
            _setDataItem: function (stageElement, position) {
                assert.instanceof($, stageElement, assert.format(assert.messages.instanceof.default, 'element', 'jQuery'));
                assert.hasLength(stageElement, assert.format(assert.messages.hasLength.default, 'stageElement'));
                assert.isPlainObject(position, assert.format(assert.messages.isPlainObject.default, 'position'));
                assert.type(NUMBER, position.left, assert.format(assert.messages.type.default, 'position.left', NUMBER));
                assert.type(NUMBER, position.top, assert.format(assert.messages.type.default, 'position.top', NUMBER));
                var id = stageElement.children('[' + kendo.attr(ID) + ']').attr(kendo.attr(ID));
                assert.type(STRING, id, assert.format(assert.messages.type.default, 'id', STRING));
                var container = stageElement.closest(this._container);
                assert.instanceof($, container, assert.format(assert.messages.instanceof.default, 'this.container', 'jQuery'));
                assert.hasLength(container, assert.format(assert.messages.hasLength.default, 'this.container'));
                container.find(kendo.roleSelector(ROLE_SELECTOR)).each(function (index, dropZone) {
                    var dropZoneWidget = $(dropZone).data('kendoDropZone');
                    if (dropZoneWidget instanceof DropZone && dropZoneWidget.dataSource instanceof kendo.data.DataSource) {
                        var dataSource = dropZoneWidget.dataSource;
                        var dataItem = dataSource.get(id);
                        // Center hits if option is set
                        if (dropZoneWidget.options.center && dropZoneWidget._checkHit(stageElement)) {
                            var dropZoneParent = dropZoneWidget.element.parent();
                            assert.ok(dropZoneParent.hasClass('kj-element'), '`dropZoneParent` should be a satge element');
                            position = {
                                left: Math.round(parseInt(dropZoneParent.css('left'), 10) + (dropZoneParent.width() - stageElement.width()) / 2),
                                top: Math.round(parseInt(dropZoneParent.css('top'), 10) + (dropZoneParent.height() - stageElement.height()) / 2)
                            };
                        }
                        if ($.type(dataItem) === UNDEFINED) {
                            dataSource.add({
                                type: DATA_TYPE,
                                id: id,
                                data: {
                                    left: position.left,
                                    top: position.top
                                }
                            });
                        } else if (dataItem instanceof kendo.data.ObservableObject) {
                            assert.equal(DATA_TYPE, dataItem.type, assert.format(assert.messages.type.default, 'dataItem.type', DATA_TYPE));
                            // Despite iterating over all drop zones, these if conditions ensure we only store once
                            if (dataItem.data.left !== position.left) {
                                dataItem.data.left = position.left;
                            }
                            if (dataItem.data.top !== position.top) {
                                dataItem.data.top = position.top;
                            }
                            dataSource.trigger(CHANGE);
                        }
                        // Ensure we update value on all drop zones
                        dropZoneWidget.trigger(CHANGE);
                    }
                });
            }
        });

        /**
         * Singleton to share DropZoneEvents
         * @param options
         * @returns {DropZoneEvents}
         */
        DropZoneEvents.getSingleton = function (options) {
            assert.isPlainObject(options, assert.format(assert.messages.isPlainObject.default, 'options'));
            assert(STRING, options.container, assert.format(assert.messages.type.default, 'options.container', STRING));
            assert(STRING, options.draggable, assert.format(assert.messages.type.default, 'options.draggable', STRING));
            assert(STRING, options.scaler, assert.format(assert.messages.type.default, 'options.scaler', STRING));
            if (!DropZoneEvents._instance) {
                DropZoneEvents._instance = new DropZoneEvents(options);
            }
            // Note: all dropzones on the same page should have the same options.container and options.scaler
            assert.equal(options.container, DropZoneEvents._instance._container, assert.format(assert.messages.equal.default, 'SelectorEvents._instance._container', 'options.container'));
            assert.equal(options.draggable, DropZoneEvents._instance._draggable, assert.format(assert.messages.equal.default, 'SelectorEvents._instance._draggable', 'options.draggable'));
            assert.equal(options.scaler, DropZoneEvents._instance._scaler, assert.format(assert.messages.equal.default, 'SelectorEvents._instance._scaler', 'options.scaler'));
            return DropZoneEvents._instance;
        };

        /*********************************************************************************
         * DropZone Widget
         *********************************************************************************/

        /**
         * DropZone
         * @class DropZone Widget (kendoDropZone)
         */
        var DropZone = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                options = options || {};
                Widget.fn.init.call(this, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                this._layout();
                this._dataSource();
                this.enable(this.options.enable);
                kendo.notify(this);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'DropZone',
                autoBind: true,
                dataSource: [],
                value: [],
                scaler: 'div.kj-stage', // that.wrapper in kidoju.widgets.stage
                container: 'div.kj-stage>div[data-' + kendo.ns + 'role="stage"]', // that.stage in kidoju.widgets.stage
                draggable: 'div.kj-element:has([data-' + kendo.ns + 'behavior="draggable"])', // a stage element containing a draggable
                center: false,
                empty: '', // to force a value when empty
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
             * Value for MVVM binding (cannot be set)
             */
            value: function (value) {
                if ($.type(value) === UNDEFINED) {
                    var that = this;
                    var ret;
                    var container = that.element.closest(that.options.container);
                    assert.instanceof($, container, assert.format(assert.messages.instanceof.default, 'container', 'jQuery'));
                    assert.hasLength(container, assert.format(assert.messages.hasLength.default, 'container'));
                    // We check the dataSource for draggables which have been moved
                    that.dataSource.view().forEach(function (dataItem) {
                        if (dataItem && dataItem.type === DATA_TYPE && $.type(dataItem.id) === STRING) {
                            ret = ret || [];
                            // Find the corresponding draggable and stageElement, considering it might be on another page this not found
                            var draggable = container.find(that.options.draggable).children(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), dataItem.id));
                            if (draggable.length > 0) {
                                var stageElement = draggable.parent();
                                // Check whether it hits the drop zone
                                if (that._checkHit(stageElement)) {
                                    ret.push(draggable.attr(kendo.attr(CONSTANT)));
                                }
                            }
                        }
                    });
                    // Without hit, check and set the empty option
                    if (ret.length === 0 && that.options.empty) {
                        ret.push(that.options.empty);
                    }
                    return ret;
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                this.wrapper = this.element;
                this.element.addClass(WIDGET_CLASS);
                var stageWidget = this.element.closest(this.options.container).data('kendoStage');
                this._dataBoundHandler = this._resetEvents.bind(this);
                if (ui.Stage && stageWidget instanceof ui.Stage) {
                    // One of the difficulties with this Kendo UI widget, is the fact that it needs to sit below draggables for draggables to move above it
                    // This means it is instantiated before draggable elements, so we need to bind drop zones to the stage DATABOUND event
                    stageWidget.bind(DATABOUND, this._dataBoundHandler);
                } else if (window.app && window.app.DEBUG) {
                    // This is essentially for running/testing without a stage widget
                    setTimeout(this._dataBoundHandler, 100);
                }
            },

            /**
             * Init events
             * @param e
             * @private
             */
            _resetEvents: function () {
                var events = DropZoneEvents.getSingleton(this.options);
                events.enable(events.enabled());
            },

            /**
             * Enable/disable the widget
             * Initialize mouse events
             * @param enable
             * @private
             */
            enable: function (enable) {
                enable = $.type(enable) === UNDEFINED ? true : !!enable;
                if (this._enabled !== enable) {
                    this._enabled = enable;
                    this._resetEvents();
                }
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
                    // Filter dataSource on data type
                    that.dataSource.filter({ field: 'type', operator: 'eq', value: DATA_TYPE });
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
             * Checks whether a stage element hits this drop zone
             * @param stageElement
             * @returns {boolean}
             * @private
             */
            _checkHit: function (stageElement) {
                // Note: this does not account for rotated elements and drop zones
                var element = stageElement[0].getBoundingClientRect();
                var dropzone = this.element[0].getBoundingClientRect();
                var center = {
                    x: element.x + element.width / 2,
                    y: element.y + element.height / 2
                };
                // Check the center is within the drop zone
                return center.x >= dropzone.x && center.x <= dropzone.x + dropzone.width &&
                    center.y >= dropzone.y && center.y <= dropzone.y + dropzone.height;
            },

            /**
             * Check initial positions of draggables and add corresponding data items when they `hit` this drop zone
             * Note: if a draggable is initially positioned within a drop zone, it might not be part of its value since there is no corresponding data item in the data source
             * @private
             */
            _initDraggables: $.noop,

            /**
             * Refresh the display
             */
            refresh: function (e) {
                var that = this;
                // We need setTimeout otherwise options.center does not execute properly
                // requestAnimationFrame(function () {
                setTimeout(function () {
                    var container = that.element.closest(that.options.container);
                    var dataItems = that.dataSource.view(); // dataSource is filtered
                    if ($.isPlainObject(e) && Array.isArray(e.items)) {
                        dataItems = e.items;
                    }
                    $.each(dataItems, function (index, dataItem) {
                        if (dataItem && dataItem.type === DATA_TYPE && $.type(dataItem.id) === STRING) {
                            var draggable = container.find(that.options.draggable).children(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), dataItem.id));
                            // the draggable corresponding to this dataItem might be on another page when the dataSource is share across pages
                            if (draggable.length > 0) {
                                draggable.parent().css({
                                    left: dataItem.data.left,
                                    top: dataItem.data.top
                                });
                            }
                        }
                    });
                }, 100);
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                // Unbind
                if ($.isFunction (this._refreshHandler)) {
                    this.dataSource.unbind(CHANGE, this._refreshHandler);
                    this._refreshHandler = undefined;
                }
                kendo.unbind(this.element);
                var stageWidget = this.element.closest(this.options.container).data('kendoStage');
                if ($.isFunction(this._dataBoundHandler) && ui.Stage && stageWidget instanceof ui.Stage) {
                    stageWidget.unbind(DATABOUND, this._dataBoundHandler);
                    this._dataBoundHandler = undefined;
                }
                // Unref
                this.enable(false);
                // Destroy
                Widget.fn.destroy.call(this);
                kendo.destroy(this.element);
                // remove element classes
                // element.removeClass(WIDGET_CLASS);
            }
        });

        kendo.ui.plugin(DropZone);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
