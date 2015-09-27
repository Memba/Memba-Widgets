/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.dropdownlist',
        './window.assert',
        './window.log'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Log('kidoju.widgets.quiz');
        var NS = '.kendoQuiz';
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var CLICK = 'click';
        var ACTIVE = 'k-state-active';
        var DISABLE = 'k-state-disabled';
        var WIDGET_CLASS = 'kj-quiz'; // 'k-widget kj-quiz',
        var GROUP_CLASS = 'kj-quiz-group';
        var BUTTON = '<input type="button" class="k-button" value="{0}">';
        var RADIO = '<div><input id="{1}_{2}" name="{1}" type="radio" value="{0}"><label for="{1}_{2}">{0}</label></div>';
        var MARGIN = '0.2em';
        var MODES = {
                BUTTON: 'button',
                DROPDOWN: 'dropdown',
                RADIO: 'radio'
            };

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

        function randomId() {
            return 'id_' + randomString(6);
        }

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
                throw new Error('`style` is expected to be a string or a plain object');
            }
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * Quiz widget
         */
        var Quiz = Widget.extend({

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
                that._enable = true;
                if (!that.options.enable) {
                    that._enable = false;
                    that.wrapper.addClass(DISABLE);
                }
            },

            /**
             * Diplay modes
             */
            modes: {
                button: MODES.BUTTON,
                dropdown: MODES.DROPDOWN,
                radio: MODES.RADIO
            },

            /**
             * Widget options
             */
            options: {
                name: 'Quiz',
                autoBind: true,
                dataSource: [],
                mode: MODES.BUTTON,
                optionLabel: 'Select...',
                groupStyle: {},
                itemStyle: {},
                activeStyle: {},
                value: null,
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
                if (options.mode === MODES.BUTTON) {
                    // Add default space between buttons
                    options.itemStyle = $.extend({ marginRight: MARGIN, marginBottom: MARGIN }, options.itemStyle);
                }
                options.activeStyle = formatStyle(options.activeStyle);
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
                if ($.type(value) === STRING || value === null) {
                    that._value = value;
                    that._toggleUI();
                } else if ($.type(value) === 'undefined') {
                    return that._value;
                } else {
                    throw new TypeError('`value` is expected to be a string if not undefined');
                }
            },

            /**
             * Widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                if (that.options.mode === MODES.DROPDOWN) {
                    that._layoutDropDown();
                } else if (that.options.mode === MODES.BUTTON || that.options.mode === MODES.RADIO) {
                    that._layoutGroup();
                } else {
                    throw new Error('Unknown `mode`');
                }
            },

            /**
             * Widget layout as dropdown list
             * @private
             */
            _layoutDropDown: function () {
                var that = this;
                that.dropDownList = $('<input>')
                    .width('100%')
                    .appendTo(that.element)
                    .kendoDropDownList({
                        autoBind: that.options.autoBind,
                        change: $.proxy(that._onDropDownListChange, that), // change is not triggered by dropDownList api calls incl. value(), text(), ...
                        dataSource: that.options.dataSource,
                        optionLabel: that.options.optionLabel,
                        value: that.options.value
                        // valuePrimitive: true
                    })
                    .data('kendoDropDownList');
            },

            /**
             * Event handler triggered when changing the value of the drop down list in the header
             * @private
             */
            _onDropDownListChange: function () {
                var that = this;
                assert.instanceof(kendo.ui.DropDownList, that.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                var value = that.dropDownList.value();
                if ($.type(value) === STRING && value.length) {
                    that._value = value;
                } else {
                    that._value = null;
                }
                that.trigger(CHANGE, { value: this._value });
            },

            /**
             * Widget layout as buttons or radios
             * @private
             */
            _layoutGroup: function () {
                var that = this;
                that.groupList = $('<div>')
                    .addClass(GROUP_CLASS)
                    .css(that.options.groupStyle)
                    .on(CLICK + NS, 'input', $.proxy(that._onClick, that))
                    .appendTo(that.element);
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
                var target = $(e.target);
                var value = target.val();
                if (value !== that._value) {
                    that._value = value;
                } else { // clicking the same value resets the button (and value)
                    that._value = null;
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
                switch (that.options.mode) {
                    case MODES.BUTTON:
                        assert.instanceof($, that.groupList, kendo.format(assert.messages.instanceof.default, 'this.groupList', 'jQuery'));
                        that.groupList.find('input[type=button]')
                            .removeClass(ACTIVE)
                            .attr('style', '')
                            .css(that.options.itemStyle);
                        if (that._value) {
                            that.groupList.find('input[type=button][value="' + that._value + '"]')
                                .addClass(ACTIVE)
                                .attr('style', '')
                                .css($.extend({}, that.options.itemStyle, that.options.activeStyle));
                        }
                        break;
                    case MODES.DROPDOWN:
                        assert.instanceof(kendo.ui.DropDownList, that.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                        that.dropDownList.text(that._value);
                        break;
                    case MODES.RADIO:
                        assert.instanceof($, that.groupList, kendo.format(assert.messages.instanceof.default, 'this.groupList', 'jQuery'));
                        that.groupList.find('div')
                            .attr('style', '')
                            .css(that.options.itemStyle);
                        if (that._value) {
                            that.groupList.find('input[type=radio][value="' + that._value + '"]')
                                .prop('checked', true)
                                .parent()
                                    .attr('style', '')
                                    .css($.extend({}, that.options.itemStyle, that.options.activeStyle));
                        } else {
                            that.groupList.find('input[type=radio]:checked')
                                .prop('checked', false);
                        }
                        break;
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

                // Assign dataSource to dropDownList
                var dropDownList = that.dropDownList;
                if (dropDownList instanceof kendo.ui.DropDownList && dropDownList.dataSource !== that.dataSource) {
                    dropDownList.setDataSource(that.dataSource);
                }

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
             * for example to add buttons or options
             * @param e
             */
            refresh: function (e) {
                var that = this;
                if (that.options.mode === MODES.DROPDOWN) {
                    assert.instanceof(kendo.ui.DropDownList, that.dropDownList, kendo.format(assert.messages.instanceof.default, 'that.dropDownList', 'kendo.ui.DropDownList'));
                    that.dropDownList.refresh(e);
                } else {
                    assert.instanceof($, that.groupList, kendo.format(assert.messages.instanceof.default, 'that.groupList', 'jQuery'));
                    var items = that.dataSource.data();
                    if (e && e.items instanceof kendo.data.ObservableArray) {
                        items = e.items;
                    }
                    that.groupList.empty();
                    $(e.items).each(function (index, value) {
                        if (that.options.mode === MODES.BUTTON) {
                            $(kendo.format(BUTTON, value))
                                .css(that.options.itemStyle)
                                .appendTo(that.groupList);
                        } else if (that.options.mode === MODES.RADIO) {
                            var radio = $(kendo.format(RADIO, value, that._randomId, index))
                                .css(that.options.itemStyle)
                                .appendTo(that.groupList);
                            var size = parseInt(radio.css('fontSize'));
                            if (!isNaN(size)){
                                // TODO See http://www.telerik.com/forums/font-size-of-styled-radio-buttons-and-checkboxes
                                // TODO consider as part of resize event handler
                                radio.find('input[type=radio]')
                                    .height(0.6 * size)
                                    .width(0.6 * size);
                            }
                        }
                    });
                }
            },

            /**
             * Enable/disable the widget
             * @param enable
             */
            enable: function (enable) {
                var wrapper = this.wrapper;

                if (typeof enable === UNDEFINED) {
                    enable = true;
                }

                if (enable) {
                    wrapper.removeClass(DISABLE);
                } else {
                    wrapper.addClass(DISABLE);
                }

                this._enable = this.options.enable = enable;
            },

            /**
             * Clear layout
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                kendo.unbind($(that.element));
                // unbind all other events
                that.element.find('*').off(NS);
                // remove descendants
                that.element.empty();
                // remove element classes
                that.element.removeClass(WIDGET_CLASS);
            },

            /**
             * Destroy widget
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                kendo.destroy(that.element);
            }

        });

        ui.plugin(Quiz);

    })(window.jQuery);

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
