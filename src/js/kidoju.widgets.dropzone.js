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
        './vendor/kendo/kendo.userevents',
        './vendor/kendo/kendo.draganddrop'
        // './vendor/kendo/kendo.multiselect' // required because of a test in kendo.binder.js
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var data = kendo.data;
        var DataSource = data.DataSource;
        var ObservableArray = data.ObservableArray;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var Draggable = ui.Draggable;
        var DropTarget = ui.DropTarget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.dropzone');
        // var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        // var NS = '.kendoDropZone';
        var WIDGET_CLASS = 'kj-dropzone'; // 'k-widget kj-dropzone';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var ID = 'id';
        var VALUE = 'value';
        var CONTENT_SELECTOR = '[' + kendo.attr(ID) +  ']';


        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        var util = {

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
                logger.debug('widget initialized');
                that._dataSource();
                that._layout();
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
                scaler: 'div.kj-stage',
                container: 'div.kj-stage>div[data-role="stage"]',
                draggable: 'div.kj-element:has([data-draggable="true"])', // The draggable actually is the parent stage element - use http://www.w3schools.com/jquery/sel_has.asp
                enable: true
                // TODO Axis?????
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
             */
            value: function (value) {
                var that = this;
                if ($.isArray(value) || value instanceof ObservableArray) {
                    // Note, we are expecting an array of strings which is not checked here
                    that._value = value;
                } else if ($.type(value) === NULL) {
                    that._value = [];
                } else if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else {
                    throw new TypeError('`value` is expected to be a an array or null if not undefined');
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                var options = that.options;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                that.enable(options.enable);
            },

            /**
             * Initialize DropTarget
             * @param enable
             * @private
             */
            _initDropTarget: function (enable) {
                var that = this;
                var element = that.element;
                var dropTargetWidget = element.data('kendoDropTarget');
                if (!enable && dropTargetWidget instanceof DropTarget) {
                    dropTargetWidget.destroy();
                    logger.info({ message: 'DropTarget disabled', method: '_initDropTarget' });
                } else if (enable && !(dropTargetWidget instanceof DropTarget)) {
                    element.kendoDropTarget({
                        // On dragging a draggable beyond the edges of a drop target, remove value
                        dragleave: function (e) {
                            assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                            assert.instanceof(DropTarget, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.DropTarget'));
                            assert.instanceof(Draggable, e.draggable, kendo.format(assert.messages.instanceof.default, 'e.draggable', 'kendo.ui.Draggable'));
                            var dropZoneWidget = e.sender.element.data('kendoDropZone');
                            assert.instanceof(DropZone, dropZoneWidget, kendo.format(assert.messages.instanceof.default, 'dropZoneWidget', 'kendo.ui.DropZone'));
                            var draggableContent = e.draggable.element.find(CONTENT_SELECTOR);
                            var val = draggableContent.attr(kendo.attr(VALUE));
                            if (val) {
                                var _value = dropZoneWidget._value = dropZoneWidget._value || [];
                                var index = _value.indexOf(val);
                                if (index >= 0) {
                                    _value.splice(index, 1);
                                    dropZoneWidget.trigger(CHANGE);
                                }
                            }
                        },
                        // On Droppping a draggable on a drop target, add value
                        drop: function (e) {
                            assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                            assert.instanceof(DropTarget, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.DropTarget'));
                            assert.instanceof(Draggable, e.draggable, kendo.format(assert.messages.instanceof.default, 'e.draggable', 'kendo.ui.Draggable'));
                            var dropZoneWidget = e.sender.element.data('kendoDropZone');
                            assert.instanceof(DropZone, dropZoneWidget, kendo.format(assert.messages.instanceof.default, 'dropZoneWidget', 'kendo.ui.DropZone'));
                            var draggableContent = e.draggable.element.find(CONTENT_SELECTOR);
                            var val = draggableContent.attr(kendo.attr(VALUE));
                            if (val) {
                                var _value = dropZoneWidget._value = dropZoneWidget._value || [];
                                if (_value.indexOf(val) === -1) {
                                    _value.push(val);
                                    dropZoneWidget.trigger(CHANGE);
                                }
                            }
                        }
                    });
                    logger.info({ message: 'DropTarget enabled', method: '_initDropTarget' });
                }
            },

            /**
             * Initialize Draggable (there may be several and they might be shared with another dropzone)
             * @param enable
             * @private
             */
            _initDraggable: function (enable) {
                var dropZoneWidget = this; // not using that here makes code clearer
                var options = dropZoneWidget.options;
                var container = dropZoneWidget.element.closest(options.container);
                var dropZoneCollection = container.find(kendo.roleSelector('dropzone'));
                if ($.type(enable) === UNDEFINED) {
                    enable = true;
                }
                // Draggables should remain active if there is at least one active dropzone
                $.each(dropZoneCollection, function (index, otherDropZone) {
                    var otherDropZoneWidget = $(otherDropZone).data('kendoDropZone');
                    if (otherDropZoneWidget instanceof kendo.ui.DropZone && otherDropZoneWidget !== dropZoneWidget) {
                        enable = enable || otherDropZoneWidget._enabled;
                    }
                });
                dropZoneWidget.draggable = container.find(options.draggable);
                $.each(dropZoneWidget.draggable, function (index, htmlElement) {
                    var draggable = $(htmlElement);
                    var draggableContent = draggable.find(CONTENT_SELECTOR);
                    var draggableWidget = $(draggable).data('kendoDraggable');
                    if (!enable && draggableWidget instanceof Draggable) {
                        draggable.css({ cursor: 'default' });
                        draggableWidget.destroy();
                        logger.info({ message: 'Draggable disabled', method: '_initDraggable', data: { id: draggableContent.attr(kendo.attr(ID)), value: draggableContent.attr(kendo.attr(VALUE)) } });
                    } else if (enable && !(draggableWidget instanceof Draggable)) {
                        draggable.css({ cursor: 'move' });
                        draggable.kendoDraggable({
                            // container: cannot be used due to scaling, see boundaries below
                            hint: function (draggable) {
                                assert.instanceof($, draggable, kendo.format(assert.messages.instanceof.default, 'draggable', 'jQuery'));
                                var scaler = dropZoneWidget.element.closest(options.scaler);
                                var scale = util.getTransformScale(scaler);
                                return draggable.clone()
                                    .css({
                                        transformOrigin: '0 0',
                                        transform: kendo.format('scale({0})', scale),
                                        left: container.offset().left + draggable.position().left * scale,
                                        top: container.offset().top + draggable.position().top * scale
                                    });
                            },
                            dragstart: function (e) {
                                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                                assert.instanceof(Draggable, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Draggable'));
                                var scaler = dropZoneWidget.element.closest(options.scaler);
                                var scale = util.getTransformScale(scaler);
                                var draggableWidget = e.sender;
                                var draggable = draggableWidget.element;
                                var hint = draggableWidget.hint;
                                draggable.hide();
                                // Kendo UI apis recommend setting a container on the kendo.ui.Draggable
                                // Unfortunately this would not work because of scaling the stage
                                // Another benefit of setting the boundaries in the event handler
                                // is for changing the scale of the stage after the draggable widgets have been initialized.
                                draggableWidget.boundaries = { // container boundaries
                                    x: {
                                        min: container.offset().left,
                                        max: container.offset().left + scale * (container.width() - hint.width())
                                    },
                                    y: {
                                        min: container.offset().top,
                                        max: container.offset().top + scale * (container.height() - hint.height())
                                    }
                                };
                            },
                            dragend: function (e) {
                                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                                assert.instanceof(Draggable, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Draggable'));
                                var scaler = dropZoneWidget.element.closest(options.scaler);
                                var scale = util.getTransformScale(scaler);
                                var draggableWidget = e.sender;
                                var draggable = draggableWidget.element; // draggable is a .kj-element which contains something (image, label, ...)
                                var hint = draggableWidget.hint;
                                var position = hint.position();
                                hint.hide();
                                // Add/update item into dataSource
                                var left = (position.left - container.offset().left) / scale;
                                var top = (position.top - container.offset().top) / scale;
                                draggable.css({ left: left, top: top }).show();
                                var id = draggable.find(CONTENT_SELECTOR).attr(kendo.attr(ID));
                                var dataItem = dropZoneWidget.dataSource.get(id);
                                if (dataItem) {
                                    dataItem.set('left', left);
                                    dataItem.set('top', top);
                                } else {
                                    dropZoneWidget.dataSource.add({
                                        id: id,
                                        left: left,
                                        top: top
                                    });
                                }
                            }
                        });
                        logger.info({ message: 'Draggable enabled', method: '_initDraggable', data: { id: draggableContent.attr(kendo.attr(ID)), value: draggableContent.attr(kendo.attr(VALUE)) } });
                    }
                });
            },

            /**
             * Enable/disable the widget
             * @param enable
             */
            enable: function (enable) {
                var that = this;
                var element = that.element;
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                if ($.type(enable) === UNDEFINED) {
                    enable = true;
                }
                that._enabled = enable;
                that._initDropTarget(enable);
                // Note: all components might not have been added to the stage yet
                setTimeout(function () {
                    that._initDraggable(enable);
                }, 100);
            },

            /**
             * _dataSource function to bind refresh to the change event
             * @private
             */
            _dataSource: function () {
                var that = this;

                // returns the datasource OR creates one if using array or configuration
                that.dataSource = kendo.data.DataSource.create(that.options.dataSource);

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
             * Refresh the display
             */
            refresh: function (e) {
                var dropZoneWidget = this;
                var options = dropZoneWidget.options;
                var dropZone = dropZoneWidget.element;
                var container = dropZone.closest(options.container);
                var items = dropZoneWidget.dataSource.data();
                if ($.isPlainObject(e) && $.isArray(e.items)) {
                    items = e.items;
                }
                $.each(items, function (index, item) {
                    var draggableContent = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), item.id));
                    var draggable = draggableContent.parent();
                    draggable.css({
                        left: item.left,
                        top: item.top
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
                that.enable(false);
                Widget.fn.destroy.call(that);
                // unbind and destroy kendo
                kendo.unbind(element);
                kendo.destroy(element);
                // unbind all other events
                that.element.find('*').off();
                // remove descendants
                that.element.empty();
                // remove element classes
                that.element.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(DropZone);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
