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
        var data = kendo.data;
        var DataSource = data.DataSource;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var Draggable = ui.Draggable;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.dropzone');
        // var STRING = 'string';
        var NULL = 'null';
        // var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DATABINDING = 'dataBinding';
        var DATABOUND = 'dataBound';
        // var NS = '.kendoDropZone';
        var WIDGET_CLASS = 'kj-dropzone'; // 'k-widget kj-dropzone';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var ID = 'id';
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
                that._addDraggable();
                // kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'DropZone',
                autoBind: true,
                dataSource: [],
                scaler: 'div.kj-stage',
                container: 'div.kj-stage>div[data-role="stage"]',
                draggable: 'div.kj-element:has([data-draggable="true"])' // The draggable actually is the parent stage element - use http://www.w3schools.com/jquery/sel_has.asp
                // TODO Axis?????
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE,
                DATABINDING,
                DATABOUND
            ],

            /**
             * Value for MVVM binding
             */
            value: function () {
                var that = this;
                return [];
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                that.element.kendoDropTarget({
                    // dragenter: $.noop,
                    dragleave: function (e) {
                        // Remove value to drop target??
                        $.noop();
                    },
                    drop: function (e) {
                        // Add value to drop target??
                        $.noop();
                    }
                });
            },

            /**
             * Add draggable (there may be several)
             * @private
             */
            _addDraggable: function () {
                var dropZoneWidget = this; // not using that here makes code clearer
                var options = dropZoneWidget.options;
                var container = dropZoneWidget.element.closest(options.container);
                dropZoneWidget.draggable = container.find(options.draggable);
                dropZoneWidget.draggable.kendoDraggable({
                    // container: not used, see boundaries below
                    hint: function (draggable) {
                        assert.instanceof($, draggable, kendo.format(assert.messages.instanceof.default, 'draggable', 'jQuery'));
                        var scaler = dropZoneWidget.element.closest(dropZoneWidget.options.scaler);
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
                        var scaler = dropZoneWidget.element.closest(dropZoneWidget.options.scaler);
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
                        var scaler = dropZoneWidget.element.closest(dropZoneWidget.options.scaler);
                        var scale = util.getTransformScale(scaler);
                        var draggableWidget = e.sender;
                        var draggable = draggableWidget.element; // draggable is a .kj-element which contains something (image, label, ...)
                        var hint = draggableWidget.hint;
                        var position = hint.position();
                        hint.hide();
                        // TODO the following goes in refresh
                        var left = (position.left - container.offset().left) / scale;
                        var top = (position.top - container.offset().top) / scale;
                        draggable.css({ left: left, top: top }).show();
                        if (draggableWidget.dropped) {
                            // TODO: ensure within dropZone
                            /*
                            var dropZoneParent = dropZoneWidget.element.parent();
                            var boundaries = { // boundaries of the .kj-element containing the dropZone
                                x: {
                                    min: dropZoneParent.position().left,
                                    max: dropZoneParent.position().left + dropZoneParent.width() - draggable.width()
                                },
                                y: {
                                    min: dropZoneParent.position().top,
                                    max:dropZoneParent.position().top + dropZoneParent.height() - draggable.height()
                                }
                            };
                            // Ensure draggable within dropZone boundaries (magnet feature)
                            if (left < boundaries.x.min) {
                                left = boundaries.x.min;
                            } else if (left > boundaries.x.max) {
                                left = boundaries.x.max;
                            }
                            if (top < boundaries.y.min) {
                                top = boundaries.y.min;
                            } else if (left > boundaries.y.max) {
                                top = boundaries.y.max;
                            }
                            */
                            // Add/Update value to dataSource
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
                            // draggable.animate({ left: left, top: top });
                        }
                    }
                });
            },

            /**
             * Changes the dataSource
             * @method setDataSource
             * @param dataSource
             */
            setDataSource: function (dataSource) {
                // set the internal datasource equal to the one passed in by MVVM
                this.options.dataSource = dataSource;
                // rebuild the datasource if necessary, or just reassign
                this._dataSource();
            },

            /**
             * Binds the widget to the change event of the dataSource
             * See http://docs.telerik.com/kendo-ui/howto/create-custom-kendo-widget
             * @method _dataSource
             * @private
             */
            _dataSource: function () {
                var that = this;
                // if the DataSource is defined and the _refreshHandler is wired up, unbind because
                // we need to rebuild the DataSource

                // There is no reason why, in its current state, it would not work with any dataSource
                // if ( that.dataSource instanceof data.DataSource && that._refreshHandler ) {
                if (that.dataSource instanceof DataSource && that._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                }

                if (that.options.dataSource !== NULL) {  // use null to explicitly destroy the dataSource bindings

                    // returns the datasource OR creates one if using array or configuration object
                    that.dataSource = DataSource.create(that.options.dataSource);

                    that._refreshHandler = $.proxy(that.refresh, that);

                    // bind to the change event to refresh the widget
                    that.dataSource.bind(CHANGE, that._refreshHandler);

                    if (that.options.autoBind) {
                        that.dataSource.fetch();
                    }
                }
            },

            /**
             * Items required for MVVM source binding
             */
            items: function () {
                // TODO return the list of elements corresponding to dropped items
                return;
            },

            /**
             * Refresh the display
             */
            refresh: function (e) {
                var dropZoneWidget = this;
                var dropZone = dropZoneWidget.element;
                var container = dropZone.closest(dropZoneWidget.options.container);
                // var parent = dropZone.parent(); // The absolutely positioned kj-element containing the dropZone
                if ($.isPlainObject(e) && $.isArray(e.items)) {
                    $.each(e.items, function (index, item) {
                        var draggable = container.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr(ID), item.id)).parent();
                        var position = draggable.position();
                        var css = {};
                        if (position.left !== item.left) {
                            css.left = item.left;
                        }
                        if (position.top !== item.top) {
                            css.top = item.top;
                        }
                        if (!$.isEmptyObject(css)) {
                            draggable.css(css);
                        }
                    });
                }
                $.noop();
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

        kendo.ui.plugin(DropZone);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
