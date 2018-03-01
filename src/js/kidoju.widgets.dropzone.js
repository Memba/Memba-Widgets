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
        var BOOLEAN = 'boolean';
        var STRING = 'string';
        var NUMBER = 'number';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var NS = '.kendoDropZone';
        var MOUSEDOWN = 'mousedown' + NS + ' ' + 'touchstart' + NS;
        var MOUSEMOVE = 'mousemove' + NS + ' ' + 'touchmove' + NS;
        var MOUSEUP = 'mouseup' + NS + ' ' + 'touchend' + NS;
        var DRAGGABLE = 'draggable';
        var TOP = 'top';
        var LEFT = 'left';
        var WIDGET_CLASS = 'kj-dropzone'; // 'k-widget kj-dropzone';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var STATE = 'state';
        var ID = 'id';
        var VALUE = 'dropValue';
        var DRAGGABLE_SELECTOR = '[' + kendo.attr(DRAGGABLE) +  '][' + kendo.attr(ID) +  ']';

        /*********************************************************************************
         * Widget
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
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._dataSource();
                that._layout();
                that.enable(that.options.enable);
                kendo.notify(that);
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
                draggable: 'div.kj-element:has([data-' + kendo.ns + 'draggable="true"])', // a stageElement in kidoju.widgets.stage
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
                    var container = that.container;
                    assert.instanceof($, container, assert.format(assert.messages.instanceof.default, 'this.container', 'jQuery'));
                    assert.hasLength(container, assert.format(assert.messages.hasLength.default, 'this.container'));
                    var ret = [];
                    if (Array.isArray(that._ids)) {
                        $.each(that._ids, function (index, id) {
                            var val = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), id)).attr(kendo.attr(kendo.toHyphens(VALUE)));
                            ret.push(val);
                        });
                    }
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
                var that = this;
                var options = that.options;
                var element = that.element;
                that.wrapper = element;
                element.addClass(WIDGET_CLASS);
                that.container = element.closest(options.container);
                that.scaler = element.closest(options.scaler);
            },

            /**
             * Enable/disable the widget
             * Initialize mouse events
             * @param enable
             * @private
             */
            enable: function (enable) {
                var that = this;
                that._enabled = $.type(enable) === UNDEFINED ? true : !!enable;
                // Yield some time for all drop zones and stage elements to actually be loaded and configured
                setTimeout(function () {
                    that._initDraggables();
                    $.proxy(that._initMouseEvents, that)();
                }, 100);
            },

            /**
             * List the draggables that are positioned over initially
             * @private
             */
            _initDraggables: function () {
                if (this._enabled) {
                    var that = this;
                    var options = that.options;
                    var container = that.container;
                    // Trigger a change to update the value in data bindings if the drop zone has an empty value
                    if (that.options.empty) {
                        that.trigger(CHANGE);
                    }
                    assert.instanceof($, container, assert.format(assert.messages.instanceof.default, 'this.container', 'jQuery'));
                    assert.hasLength(container, assert.format(assert.messages.hasLength.default, 'this.container'));
                    var scaler = that.scaler;
                    assert.instanceof($, scaler, assert.format(assert.messages.instanceof.default, 'this.scaler', 'jQuery'));
                    assert.hasLength(scaler, assert.format(assert.messages.hasLength.default, 'this.scaler'));
                    var scale = util.getTransformScale(scaler);
                    // find stageElements containing images or labels with attribute [data-draggable=true]
                    var draggableStageElements = container.children(options.draggable);
                    draggableStageElements.each(function(index, htmlElement) {
                        that._checkHit($(htmlElement), scale);
                    });
                }
            },

            /**
             * Initialize drag event handlers
             * @private
             */
            _initMouseEvents: function () {
                var that = this;
                var options = that.options;
                var container = that.container;
                var dropZoneCollection = container.find(kendo.roleSelector('dropzone'));

                // Event handlers should remain active if there is at least one active dropzone
                var enable = that._enabled;
                $.each(dropZoneCollection, function (index, otherDropZone) {
                    var otherDropZoneWidget = $(otherDropZone).data('kendoDropZone');
                    if (otherDropZoneWidget instanceof kendo.ui.DropZone && otherDropZoneWidget !== that) {
                        enable = enable || otherDropZoneWidget._enabled;
                    }
                });

                // find stageElements containing images or labels with attribute [data-draggable=true]
                container.children(options.draggable)
                    .css({ cursor: 'default' }); // or ''?
                $(document).off(NS);
                if (enable) {
                    container.children(options.draggable)
                        .css({ cursor: 'move' });
                    $(document)
                        .on(MOUSEDOWN, $.proxy(that._onMouseDown, that))
                        .on(MOUSEMOVE, $.proxy(that._onMouseMove, that))
                        .on(MOUSEUP, $.proxy(that._onMouseUp, that));
                }
            },

            /**
             * Mouse down event handler
             * @param e
             * @private
             */
            _onMouseDown: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var container = that.container;
                assert.instanceof($, container, assert.format(assert.messages.instanceof.default, 'this.container', 'jQuery'));
                assert.hasLength(container, assert.format(assert.messages.hasLength.default, 'this.container'));
                var stageElement = $(e.target).closest(this.options.draggable);
                if (stageElement instanceof $ && stageElement.length) {
                    e.preventDefault(); // prevent text selection;
                    var scaler = that.scaler;
                    assert.instanceof($, scaler, assert.format(assert.messages.instanceof.default, 'this.scaler', 'jQuery'));
                    assert.hasLength(scaler, assert.format(assert.messages.hasLength.default, 'this.scaler'));
                    var mouse = util.getMousePosition(e, container);
                    var id = stageElement.children(DRAGGABLE_SELECTOR).attr(kendo.attr(ID));
                    assert.type(STRING, id, assert.format(assert.messages.type.default, 'id', STRING));
                    var rotation = util.getTransformRotation(stageElement);
                    var scale = util.getTransformScale(scaler);
                    container.data(STATE, {
                        top: parseFloat(stageElement.css(TOP)) || 0, // stageElement.position().top does not work when scaled
                        left: parseFloat(stageElement.css(LEFT)) || 0, // stageElement.position().left does not work when scaled
                        height: stageElement.height(),
                        width: stageElement.width(),
                        rotation: rotation,
                        scale: scale,
                        snapGrid: 0, // TODO
                        snapAngle: 0, // TODO
                        mouseX: mouse.x,
                        mouseY: mouse.y,
                        // Note: contrary to kidoju.widgets.stage in design mode where new components have no id until they are saved, thus requiring the use of uid,
                        // kidoju.widgets.dropZone is only enabled in play mode, so we can use id throughout considering also that we store the position of draggables
                        // identified by their ids in database.
                        id: id,
                        boundaries: { // TODO review boundaries when element is rotated
                            left: {
                                min: 0,
                                max: container.width() - stageElement.width()
                            },
                            top: {
                                min: 0,
                                max: container.height() - stageElement.height()
                            }
                        }
                    });
                } else {
                    container.removeData(STATE);
                }
            },

            /**
             * Mouse move event handler
             * @param e
             * @private
             */
            _onMouseMove: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var container = that.container;
                assert.instanceof($, container, assert.format(assert.messages.instanceof.default, 'this.container', 'jQuery'));
                assert.hasLength(container, assert.format(assert.messages.hasLength.default, 'this.container'));
                var startState = container.data(STATE);
                if ($.isPlainObject(startState)) {
                    // e.preventDefault(); // prevent text selection;
                    var mouse = util.getMousePosition(e, container);
                    var boundaries = startState.boundaries;
                    var left = util.snap(startState.left + (mouse.x - startState.mouseX) / startState.scale, startState.snapGrid);
                    var top = util.snap(startState.top + (mouse.y - startState.mouseY) / startState.scale, startState.snapGrid);
                    left = Math.max(boundaries.left.min, Math.min(left, boundaries.left.max));
                    top = Math.max(boundaries.top.min, Math.min(top, boundaries.top.max));
                    // Set the data source and let the refresh method position the element
                    that._setDataItem(startState.id, left, top);
                }
            },

            /**
             * Mouse up event handler
             * @param e
             * @private
             */
            _onMouseUp: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var container = that.container;
                assert.instanceof($, container, assert.format(assert.messages.instanceof.default, 'this.container', 'jQuery'));
                assert.hasLength(container, assert.format(assert.messages.hasLength.default, 'this.container'));
                var startState = container.data(STATE);
                if ($.isPlainObject(startState)) {
                    // e.preventDefault(); // prevent text selection;
                    // Update position (same as _onMouseMove)
                    var mouse = util.getMousePosition(e, container);
                    var scale = startState.scale;
                    // var boundaries = startState.boundaries;
                    var left = util.snap(startState.left + (mouse.x - startState.mouseX) / startState.scale, startState.snapGrid);
                    var top = util.snap(startState.top + (mouse.y - startState.mouseY) / startState.scale, startState.snapGrid);

                    // Set the data source and let the refresh method position the element
                    that._setDataItem(startState.id, left, top);

                    // Check drop zone hits
                    var stageElement = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), startState.id)).closest(that.options.draggable);
                    setTimeout(function () {
                        that._checkHit(stageElement, scale);
                    }, 0);
                }
                container.removeData(STATE);
            },

            /**
             * Check hits (draggable within any drop zone)
             * @param stageElement
             * @param scale
             * @private
             */
            _checkHit: function (stageElement, scale) {
                assert.instanceof($, stageElement, assert.format(assert.messages.instanceof.default, 'stageElement', 'jQuery'));
                assert.hasLength(stageElement, assert.format(assert.messages.hasLength.default, 'stageElement'));
                var that = this;
                var container = that.container;
                assert.instanceof($, container, assert.format(assert.messages.instanceof.default, 'this.container', 'jQuery'));
                assert.hasLength(container, assert.format(assert.messages.hasLength.default, 'this.container'));

                var stageElementCenter = util.getElementCenter(stageElement, container, scale);
                var id = stageElement.children(DRAGGABLE_SELECTOR).attr(kendo.attr(ID));
                var dropZoneCollection = container.find(kendo.roleSelector('dropzone'));
                // There might be several drop zones on the stage
                dropZoneCollection.each(function (index, htmlElement) {
                    var dropZoneElement = $(htmlElement);
                    var dropZoneWidget = dropZoneElement.data('kendoDropZone');
                    if (dropZoneWidget instanceof DropZone) {
                        // TODO: we should also consider rotation of the dropzone which is not taken into account here
                        // It is a bit complicated because the bounding box rect is much larger than the rotated square drop zone contained within
                        var dropZoneParent = dropZoneElement.parent(); // closest('.kj-element'); // Avoid hard coding .kj-element
                        var dropZonePosition = dropZoneParent.position();
                        var dropZoneRect = {
                            left: {
                                min: dropZonePosition.left / scale,
                                max: dropZonePosition.left / scale + dropZoneParent.width()
                            },
                            top: {
                                min: dropZonePosition.top / scale,
                                max: dropZonePosition.top / scale + dropZoneParent.height()
                            }
                        };
                        var _ids;
                        if (stageElementCenter.left >= dropZoneRect.left.min && stageElementCenter.left <= dropZoneRect.left.max &&
                            stageElementCenter.top >= dropZoneRect.top.min && stageElementCenter.top <= dropZoneRect.top.max) {
                            // if the stageElementCenter option is enabled, move the draggable to the stageElementCenter of the drop zone
                            if (dropZoneWidget.options.center) {
                                var dropZoneStageElementCenter = util.getElementCenter(dropZoneParent, container, scale);
                                // Set the data source and let the refresh method position the element
                                // TODO: not sure this works when the stage element is rotated
                                that._setDataItem(
                                    id,
                                    dropZoneStageElementCenter.left - stageElement.width() / 2, // left + dropZoneStageElementCenter.left - stageElementCenter.left,
                                    dropZoneStageElementCenter.top - stageElement.height() / 2 // top + dropZoneStageElementCenter.top - stageElementCenter.top
                                );
                            }
                            // If the draggable enters the drop zone, add the value
                            _ids = dropZoneWidget._ids = dropZoneWidget._ids || [];
                            if (_ids.indexOf(id) === -1) {
                                _ids.push(id);
                                logger.info({message: 'id added', method: '_checkHit', data: { id: id }});
                                dropZoneWidget.trigger(CHANGE);
                            }
                        } else {
                            // If the draggable exits the drop zone, remove the value
                            _ids = dropZoneWidget._ids = dropZoneWidget._ids || [];
                            var pos = _ids.indexOf(id);
                            if (pos >= 0) {
                                _ids.splice(pos, 1);
                                logger.info({message: 'id removed', method: '_checkHit', data: { id: id }});
                                dropZoneWidget.trigger(CHANGE);
                            }
                        }
                    }
                });
            },

            /**
             * set (add/update) data item in data source
             * @param id
             * @param left
             * @param top
             * @private
             */
            _setDataItem: function (id, left, top) {
                assert.type(STRING, id, assert.format(assert.messages.type.default, 'id', STRING));
                assert.type(NUMBER, left, assert.format(assert.messages.type.default, 'left', NUMBER));
                assert.type(NUMBER, top, assert.format(assert.messages.type.default, 'top', NUMBER));
                var dataSource = this.dataSource;
                assert.instanceof(DataSource, dataSource, assert.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                var dataItem = dataSource.get(id);
                if (dataItem) {
                    dataItem.set('data.' + LEFT, left);
                    dataItem.set('data.' + TOP, top);
                } else {
                    dataSource.add({
                        type: DRAGGABLE,
                        id: id,
                        data: {
                            left: left,
                            top: top
                        }
                    });
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

                // Filter dataSource
                that.dataSource.filter({ field: 'type', operator: 'eq', value: DRAGGABLE });

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
             * Refresh the display
             */
            refresh: function (e) {
                var that = this;
                var container = that.container;
                var items = that.dataSource.view(); // dataSource is filtered
                if ($.isPlainObject(e) && Array.isArray(e.items)) {
                    items = e.items;
                }
                $.each(items, function (index, item) {
                    var stageElement = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), item.id)).closest(that.options.draggable);
                    stageElement.css({
                        left: item.data.left,
                        top: item.data.top
                    });
                });
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                // Unbind mouse events
                that.enable(false);
                Widget.fn.destroy.call(that);
                // unbind datasource
                that.dataSource.bind(CHANGE, that._refreshHandler);
                // destroy other elements
                kendo.destroy(element);
                // remove descendants
                element.empty();
                // remove element classes
                element.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(DropZone);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
