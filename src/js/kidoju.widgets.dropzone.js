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
        './vendor/kendo/kendo.binder'
        // './vendor/kendo/kendo.multiselect' // required because of a test in kendo.binder.js
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
        var BOOLEAN = 'boolean';
        var STRING = 'string';
        var NUMBER = 'number';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var NS = '.kendoDropZone';
        var MOUSEDOWN = 'mousedown' + NS + ' ' + 'touchstart' + NS;
        var MOUSEMOVE = 'mousemove' + NS + ' ' + 'touchmove' + NS;
        var MOUSEUP = 'mouseup' + NS + ' ' + 'touchend' + NS;
        var DATA_TYPE = 'draggable';
        var TOP = 'top';
        var LEFT = 'left';
        var WIDGET_CLASS = 'kj-dropzone'; // 'k-widget kj-dropzone';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var STATE = 'state';
        var ID = 'id';
        var VALUE = 'dropValue';
        var CONTENT_SELECTOR = '[' + kendo.attr(ID) +  ']';


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
             * Get the rotation angle (in degrees) of an element's CSS transformation
             * @param element
             * @returns {Number|number}
             */
            getTransformRotation: function (element) {
                // $(element).css('transform') returns a matrix, so we have to read the style attribute
                var match = ($(element).attr('style') || '').match(/rotate\([\s]*([0-9\.]+)[deg\s]*\)/);
                return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 0 : 0;
            },

            /**
             * Snapping consists in rounding the value to the closest multiple of snapValue
             * @param value
             * @param snapValue
             * @returns {*}
             */
            snap: function (value, snapValue) {
                if (snapValue) {
                    return value % snapValue < snapValue / 2 ? value - value % snapValue : value + snapValue - value % snapValue;
                } else {
                    return value;
                }
            }

        };

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
                logger.debug({method: 'init', message: 'widget initialized'});
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
                    assert.instanceof($, container, kendo.format(assert.messages.instanceof.default, 'this.container', 'jQuery'));
                    assert.hasLength(container, kendo.format(assert.messages.hasLength.default, 'this.container'));
                    var ret = [];
                    if ($.isArray(that._ids)) {
                        $.each(that._ids, function (index, id) {
                            var val = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), id)).attr(kendo.attr(kendo.toHyphens(VALUE)));
                            ret.push(val);
                        });
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
                assert.type(BOOLEAN, enable, kendo.format(assert.messages.type.default, 'enable', BOOLEAN));
                that._enabled = enable;
                // Yield some time for all drop zones to get enabled/disabled before we init event handlers
                setTimeout(function () {
                    $.proxy(that._initDragEventHandlers, that)();
                }, 100);
            },

            /**
             * Initialize drag event handlers
             * @private
             */
            _initDragEventHandlers: function () {
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
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var container = that.container;
                assert.instanceof($, container, kendo.format(assert.messages.instanceof.default, 'this.container', 'jQuery'));
                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, 'this.container'));
                var stageElement = $(e.target).closest(this.options.draggable);
                if (stageElement instanceof $ && stageElement.length) {
                    e.preventDefault(); // prevent text selection;
                    var scaler = that.scaler;
                    assert.instanceof($, scaler, kendo.format(assert.messages.instanceof.default, 'this.scaler', 'jQuery'));
                    assert.hasLength(scaler, kendo.format(assert.messages.hasLength.default, 'this.scaler'));
                    var mouse = util.getMousePosition(e, container);
                    var id = stageElement.children(CONTENT_SELECTOR).attr(kendo.attr(ID));
                    assert.type(STRING, id, kendo.format(assert.messages.type.default, 'id', STRING));
                    var rotation = util.getTransformRotation(stageElement);
                    var scale = util.getTransformScale(scaler);
                    var offset = container.offset();
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
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var container = that.container;
                assert.instanceof($, container, kendo.format(assert.messages.instanceof.default, 'this.container', 'jQuery'));
                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, 'this.container'));
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
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var container = that.container;
                assert.instanceof($, container, kendo.format(assert.messages.instanceof.default, 'this.container', 'jQuery'));
                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, 'this.container'));
                var startState = container.data(STATE);
                if ($.isPlainObject(startState)) {
                    // e.preventDefault(); // prevent text selection;
                    // Update position (same as _onMouseMove)
                    var mouse = util.getMousePosition(e, container);
                    var scale = startState.scale;
                    var boundaries = startState.boundaries;
                    var left = util.snap(startState.left + (mouse.x - startState.mouseX) / startState.scale, startState.snapGrid);
                    var top = util.snap(startState.top + (mouse.y - startState.mouseY) / startState.scale, startState.snapGrid);
                    // Set the data source and let the refresh method position the element
                    that._setDataItem(startState.id, left, top);

                    // Check drop zone hits
                    var draggableStageElement = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), startState.id)).closest(that.options.draggable);
                    assert.hasLength(draggableStageElement, kendo.format(assert.messages.hasLength.default, 'draggableStageElement'));
                    var draggableStageElementCenter = util.getElementCenter(draggableStageElement, container, scale);
                    var id = startState.id;
                    var dropZoneCollection = container.find(kendo.roleSelector('dropzone'));
                    // There might be several drop zones on the stage
                    dropZoneCollection.each(function (index, htmlElement) {
                        var dropZoneElement = $(htmlElement);
                        var dropZoneWidget = dropZoneElement.data('kendoDropZone');
                        assert.instanceof(DropZone, dropZoneWidget, kendo.format(assert.messages.instanceof.default, 'dropZoneWidget', 'kendo.ui.DropZone'));
                        var dropZoneStageElement = dropZoneElement.closest('.kj-element'); // Avoid hard coding .kj-element
                        // TODO: we should also consider rotation of the dropzone which is not taken into account here
                        // It is a bit complicated because the bounding box rect is much larger than the rotated square drop zone contained within
                        var dropZonePosition = dropZoneStageElement.position();
                        var dropZoneRect = {
                            left: {
                                min: dropZonePosition.left / scale,
                                max: dropZonePosition.left / scale + dropZoneStageElement.width()
                            },
                            top: {
                                min: dropZonePosition.top / scale,
                                max: dropZonePosition.top / scale + dropZoneStageElement.height()
                            }
                        };
                        var _ids;
                        if (draggableStageElementCenter.left >= dropZoneRect.left.min && draggableStageElementCenter.left <= dropZoneRect.left.max &&
                            draggableStageElementCenter.top >= dropZoneRect.top.min && draggableStageElementCenter.top <= dropZoneRect.top.max) {
                            // if the stageElementCenter option is enabled, move the draggable to the stageElementCenter of the drop zone
                            if (dropZoneWidget.options.center) {
                                var dropZoneStageElementCenter = util.getElementCenter(dropZoneStageElement, container, scale);
                                // Set the data source and let the refresh method position the element
                                // TODO: not sure this works when the stage element is rotated
                                that._setDataItem(
                                    startState.id,
                                    left + dropZoneStageElementCenter.left - draggableStageElementCenter.left,
                                    top + dropZoneStageElementCenter.top - draggableStageElementCenter.top
                                );
                            }
                            // If the draggable enters the drop zone, add the value
                            _ids = dropZoneWidget._ids = dropZoneWidget._ids || [];
                            if (_ids.indexOf(id) === -1) {
                                _ids.push(id);
                                logger.info({ message: 'id added', method: '_onMouseUp', data: { id: id } });
                                dropZoneWidget.trigger(CHANGE);
                            }
                        } else {
                            // If the draggable exits the drop zone, remove the value
                            _ids = dropZoneWidget._ids = dropZoneWidget._ids || [];
                            var pos = _ids.indexOf(id);
                            if (pos >= 0) {
                                _ids.splice(pos, 1);
                                logger.info({ message: 'id removed', method: '_onMouseUp', data: { id: id } });
                                dropZoneWidget.trigger(CHANGE);
                            }
                        }
                    });
                }
                container.removeData(STATE);
            },

            /**
             * set (add/update) data item in data source
             * @param id
             * @param left
             * @param top
             * @private
             */
            _setDataItem: function (id, left, top) {
                assert.type(STRING, id, kendo.format(assert.messages.type.default, 'id', STRING));
                assert.type(NUMBER, left, kendo.format(assert.messages.type.default, 'left', NUMBER));
                assert.type(NUMBER, top, kendo.format(assert.messages.type.default, 'top', NUMBER));
                var dataSource = this.dataSource;
                assert.instanceof(DataSource, dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                var dataItem = dataSource.get(id);
                if (dataItem) {
                    dataItem.set('data.' + LEFT, left);
                    dataItem.set('data.' + TOP, top);
                } else {
                    dataSource.add({
                        type: DATA_TYPE,
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

            /**
             * Refresh the display
             */
            refresh: function (e) {
                var that = this;
                var container = that.container;
                var items = that.dataSource.view(); // dataSource is filtered
                if ($.isPlainObject(e) && $.isArray(e.items)) {
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
