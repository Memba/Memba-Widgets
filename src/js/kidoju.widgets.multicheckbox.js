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
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var ObservableArray = kendo.data.ObservableArray;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.multicheckbox');
        var NS = '.kendoMultiCheckBox';
        var NULL = 'null';
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var CLICK = 'click';
        // var ACTIVE = 'k-state-active';
        var DISABLE = 'k-state-disabled';
        var WIDGET_CLASS = 'kj-multicheckbox'; // 'k-widget kj-multicheckbox',
        var CHECKBOX = '<div class="kj-multicheckbox-item"><input id="{1}_{2}" name="{1}" type="checkbox" class="k-checkbox" value="{0}"><label class="k-checkbox-label" for="{1}_{2}">{0}</label></div>';
        var CHECKBOX_SELECTOR = 'input[type="checkbox"]';
        var CHECKED = 'checked';
        var READONLY = 'readonly';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * Build a random hex string of length characters
         * @param length
         * @returns {string}
         */
        function randomString(length) {
            var s = new Array(length + 1).join('x');
            return s.replace(/x/g, function (c) {
                /* jshint -W016 */
                return (Math.random() * 16|0).toString(16);
                /* jshint +W016 */
            });
        }

        /**
         * Get a random id
         * @returns {string}
         */
        function randomId() {
            return 'id_' + randomString(6);
        }

        /**
         * Format a style string into a style object
         * @param style
         * @returns {*}
         */
        function formatStyle(style) {
            if ($.isPlainObject(style)) {
                return style;
            } else if ($.type(style) === STRING) {
                var ret = {};
                var styleArray = style.split(';');
                for (var i = 0; i < styleArray.length; i++) {
                    var styleKeyValue = styleArray[i].split(':');
                    if ($.isArray(styleKeyValue) && styleKeyValue.length === 2) {
                        var key = styleKeyValue[0].trim();
                        var value = styleKeyValue[1].trim();
                        if (key.length && value.length) {
                            ret[key] = value;
                        }
                    }
                }
                return ret;
            } else {
                return {};
            }
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * MultiCheckBox widget
         */
        var MultiCheckBox = Widget.extend({

            /**
             * Constructor
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                logger.debug('widget initialized');
                that._value = that.options.value;
                that._randomId = randomId();
                that.setOptions(that.options);
                that._layout();
                that._dataSource();
                that.enable(that.options.enable);
            },

            /**
             * Widget options
             */
            options: {
                name: 'MultiCheckBox',
                autoBind: true,
                dataSource: [],
                itemStyle: {},
                selectedStyle: {},
                value: [],
                enable: true
            },

            /**
             *
             * @param options
             */
            setOptions: function (options) {
                var that = this;
                Widget.fn.setOptions.call(that, options);
                options = that.options;
                options.groupStyle = formatStyle(options.groupStyle);
                options.itemStyle = formatStyle(options.itemStyle);
                options.selectedStyle = formatStyle(options.selectedStyle);
            },

            /**
             * Widget events
             */
            events: [
                CHANGE
            ],

            /**
             * Gets/sets the value
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.isArray(value) || value instanceof ObservableArray) {
                    // Note, we are expecting an array of strings which is not checked here
                    that._value = value;
                    that._toggleUI();
                } else if ($.type(value) === NULL) {
                    that._value = [];
                    that._toggleUI();
                } else if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else {
                    throw new TypeError('`value` is expected to be a an array or null if not undefined');
                }
            },

            /**
             * Widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element
                    .addClass(WIDGET_CLASS);
                // refresh updates checkboxes
            },


            /**
             * Event handler for click event and radios and buttons
             * Handles
             * @param e
             * @private
             */
            _onClick: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var _value = that._value = that._value || [];
                var target = $(e.target);
                var val = target.val();
                var index = _value.indexOf(val);
                var checked = target.prop(CHECKED);
                if (checked && index === -1) {
                    _value.push(val);
                } else if (!checked && index >= 0) {
                    _value.splice(index, 1);
                }
                that._toggleUI();
                that.trigger(CHANGE, { value: that._value });
            },

            /**
             * Update UI when value is changed
             * @private
             */
            _toggleUI: function () {
                var that = this;
                var element = this.element;
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                element.children('div')
                    .attr('style', '')
                    .css(that.options.itemStyle);
                if ($.isArray(that._value) || that._value instanceof ObservableArray) {
                    element.find(CHECKBOX_SELECTOR)
                        .prop(CHECKED, false)
                        .parent()
                                .attr('style', '')
                                .css($.extend({}, that.options.itemStyle));
                    $.each(that._value, function (index, val) {
                        element.find(CHECKBOX_SELECTOR + '[value="' + val + '"]')
                            .prop(CHECKED, true)
                            .parent()
                                .attr('style', '')
                                .css($.extend({}, that.options.itemStyle, that.options.selectedStyle));
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
             * Refresh method (called when dataSource is updated)
             * for example to add checkboxes
             * @param e
             */
            refresh: function (e) {
                var that = this;
                var element = that.element;
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                var items = that.dataSource.data();
                if (e && e.items instanceof ObservableArray) {
                    items = e.items;
                }
                // Note: we only add elements here (not modify or remove depending on e.action) and we might have to improve
                that.element.empty();
                $(items).each(function (index, item) {
                    var checkbox = $(kendo.format(CHECKBOX, kendo.htmlEncode(item), that._randomId, item))
                        .css(that.options.itemStyle)
                        .appendTo(that.element);
                });
                // get rid of values that no more have a match in dataSource
                var _value = that._value = that._value || [];
                var data = that.dataSource.data();
                var changed = false;
                $.each(_value, function (index, val) {
                    if (data.indexOf(val) === -1) {
                        _value.splice(index, 1);
                        changed = true;
                    }
                });
                if (changed) {
                    // that._toggleUI(); // not needed
                    that.trigger(CHANGE, { value: that._value });
                }
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
                element.off(NS);
                if (enable) {
                    element.on(CLICK + NS, CHECKBOX_SELECTOR, $.proxy(that._onClick, that));
                } else {
                    // Because input are readonly and not disabled, we need to prevent default (checking checkbox)
                    // and let it bubble to the stage element to display the handle box
                    element.on(CLICK + NS, CHECKBOX_SELECTOR, function (e) {
                        e.preventDefault();
                    });
                }
                element.find(CHECKBOX_SELECTOR)
                    .toggleClass(DISABLE, !enable)
                    // .prop('disabled', !enable) <--- suppresses the click event so elements are no more selectable in design mode
                    .prop(READONLY, !enable);
            },

            /**
             * Destroy widget
             */
            destroy: function () {
                var that = this;
                var element = this.element;
                Widget.fn.destroy.call(that);
                // unbind and destroy kendo
                kendo.unbind(element);
                kendo.destroy(element);
                // unbind all other events
                that.element.find('*').off();
                that.element.off(NS);
                // remove descendants
                that.element.empty();
                // remove element classes
                that.element.removeClass(WIDGET_CLASS);
            }

        });

        ui.plugin(MultiCheckBox);

    })(window.jQuery);

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
