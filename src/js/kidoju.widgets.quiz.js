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
        './vendor/kendo/kendo.dropdownlist'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.quiz');
        var NS = '.kendoQuiz';
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var CLICK = 'click';
        var ACTIVE = 'k-state-active';
        var DISABLE = 'k-state-disabled';
        var WIDGET_CLASS = 'kj-quiz'; // 'k-widget kj-quiz',
        var INTERACTIVE_CLASS = 'kj-interactive';
        var BUTTON = '<input type="button" class="k-button kj-quiz-item" value="{0}">';
        var RADIO = '<div class="kj-quiz-item"><input id="{1}_{2}" name="{1}" type="radio" class="k-radio" value="{0}"><label class="k-radio-label" for="{1}_{2}">{0}</label></div>';
        var MARGIN = '0.2em';
        var MODES = {
                BUTTON: 'button',
                DROPDOWN: 'dropdown',
                RADIO: 'radio'
            };
        var CHECKED = 'checked';
        var INPUT_SELECTOR = 'input';
        var RADIO_SELECTOR = 'input[type="radio"]';
        var BUTTON_SELECTOR = 'input[type="button"]';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        var util = {

            /**
             * Build a random hex string of length characters
             * @param length
             * @returns {string}
             */
            randomString: function (length)
            {
                var s = new Array(length + 1).join('x');
                return s.replace(/x/g, function (c) {
                    /* jshint -W016 */
                    return (Math.random() * 16 | 0).toString(16);
                    /* jshint +W016 */
                });
            },

            /**
             * Get a random id
             * @returns {string}
             */
            randomId: function () {
                return 'id_' + util.randomString(6);
            },

            /**
             * Format style
             * @param style
             * @returns {*}
             */
            formatStyle: function (style) {
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
                logger.debug({method: 'init', message: 'widget initialized'});
                that._value = that.options.value;
                that._randomId = util.randomId();
                that.setOptions(that.options);
                that._layout();
                that._dataSource();
                that.enable(that.options.enable);
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
                itemStyle: {},
                selectedStyle: {},
                value: null,
                enable: true,
                messages: {
                    optionLabel: 'Select...'
                }
            },

            /**
             *
             * @param options
             */
            setOptions: function (options) {
                var that = this;
                Widget.fn.setOptions.call(that, options);
                options = that.options;
                options.groupStyle = util.formatStyle(options.groupStyle);
                options.itemStyle = util.formatStyle(options.itemStyle);
                if (options.mode === MODES.BUTTON) {
                    // Add default space between buttons
                    options.itemStyle = $.extend({ marginRight: MARGIN, marginBottom: MARGIN }, options.itemStyle);
                }
                options.selectedStyle = util.formatStyle(options.selectedStyle);
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
                if ($.type(value) === STRING) {
                    // Note: Giving a value to the dropDownList that does not exist in dataSource is discarded without raising an error
                    if (that._value !== value && that.dataSource instanceof kendo.data.DataSource && that.dataSource.data().indexOf(value) > -1) {
                        that._value = value;
                        that._toggleUI();
                        // that.trigger(CHANGE);
                    }
                } else if (value === null) {
                    if (that._value !== value) {
                        that._value = null;
                        that._toggleUI();
                        // that.trigger(CHANGE);
                    }
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
                // INTERACTIVE_CLASS (which might be shared with other widgets) is used to position any drawing surface underneath interactive widgets
                that.element
                    .addClass(WIDGET_CLASS)
                    .addClass(INTERACTIVE_CLASS);
                if (that.options.mode === MODES.DROPDOWN) {
                    that._layoutDropDown();
                }
                // refresh updates buttons and radios
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
                        open: $.proxy(that._onDropDownListOpen, that),
                        dataSource: that.options.dataSource,
                        optionLabel: that.options.messages.optionLabel,
                        value: that.options.value,
                        height: 400
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
             * Event handler triggered when opening the popup list
             * @param e
             * @private
             */
            _onDropDownListOpen: function (e) {
                var that = this;
                // We need to scale the popup
                var scaler = that.element.closest('.kj-stage');
                var scale = util.getTransformScale(scaler);
                var width = that.element.width();
                var height = that.element.height();
                var fontSize = parseInt(that.element.css('font-size'), 10);
                var popup = that.dropDownList.popup;
                popup.element
                    .css({
                        fontSize: Math.floor(fontSize * scale) + 'px',
                        minWidth: Math.floor(width * scale) + 'px',
                        width: Math.floor(width * scale) + 'px'
                    });
                // And reposition the popup
                // popup.one('open', function () { // the popup is already opened so the open event won't fire
                // popup.one('activate', function () { // activate is only triggered at the end of the open animation which flickers in FF
                setTimeout(function () {
                    var element = that.element.closest('.kj-element');
                    if (scaler.length && element.length) {
                        var top = element.position().top + scaler.offset().top;
                        var popupTop = popup.wrapper.position().top;
                        if (popupTop > top) {
                            popup.wrapper.css('top', popupTop + (scale - 1) * height);
                        }
                    }
                }, 0);
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
                var element = this.element;
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                switch (that.options.mode) {
                    case MODES.BUTTON:
                        element.find(BUTTON_SELECTOR)
                            .removeClass(ACTIVE)
                            .attr('style', '')
                            .css(that.options.itemStyle);
                        if (that._value) {
                            element.find(BUTTON_SELECTOR + '[value="' + that._value + '"]')
                                .addClass(ACTIVE)
                                .attr('style', '')
                                .css($.extend({}, that.options.itemStyle, that.options.selectedStyle));
                        }
                        break;
                    case MODES.DROPDOWN:
                        assert.instanceof(kendo.ui.DropDownList, that.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                        that.dropDownList.text(that._value);
                        break;
                    // case MODES.RADIO:
                    default:
                        element.children('div')
                            .attr('style', '')
                            .css(that.options.itemStyle);
                        if (that._value) {
                            element.find(RADIO_SELECTOR + '[value="' + that._value + '"]')
                                .prop(CHECKED, true)
                                .parent()
                                    .attr('style', '')
                                    .css($.extend({}, that.options.itemStyle, that.options.selectedStyle));
                        } else {
                            element.find(RADIO_SELECTOR + ':checked')
                                .prop(CHECKED, false);
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
                var element = this.element;
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                if (that.options.mode === MODES.DROPDOWN) {
                    assert.instanceof(kendo.ui.DropDownList, that.dropDownList, kendo.format(assert.messages.instanceof.default, 'that.dropDownList', 'kendo.ui.DropDownList'));
                    that.dropDownList.refresh(e);
                } else {
                    var items = that.dataSource.data();
                    if (e && e.items instanceof kendo.data.ObservableArray) {
                        items = e.items;
                    }
                    // Note: we only add elements here (not modify or remove depending on e.action) and we might have to improve
                    that.element.empty();
                    $(items).each(function (index, item) {
                        if (that.options.mode === MODES.BUTTON) {
                            $(kendo.format(BUTTON, kendo.htmlEncode(item)))
                                .css(that.options.itemStyle)
                                .appendTo(that.element);
                        } else if (that.options.mode === MODES.RADIO) {
                            var radio = $(kendo.format(RADIO, kendo.htmlEncode(item), that._randomId, index))
                                .css(that.options.itemStyle)
                                .appendTo(that.element);
                        }
                    });
                }
                // Get rid of value if there is no more a match in the dataSource
                if (that.dataSource.data().indexOf(that._value) === -1) {
                    that._value = null;
                    that.trigger(CHANGE, { value: that._value });
                }
            },

            /**
             * Enable/disable the widget
             * @param enable
             */
            enable: function (enable) {
                var that = this;
                var element = this.element;
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                if ($.type(enable) === UNDEFINED) {
                    enable = true;
                }
                if (that.options.mode === MODES.DROPDOWN) {
                    assert.instanceof(kendo.ui.DropDownList, that.dropDownList, kendo.format(assert.messages.instanceof.default, 'that.dropDownList', 'kendo.ui.DropDownList'));
                    that.dropDownList.enable(enable);
                } else {
                    element.off(NS);
                    if (enable) {
                        element
                            .on(CLICK + NS, INPUT_SELECTOR, $.proxy(that._onClick, that));
                    } else {
                        // Because input are readonly and not disabled, we need to prevent default (checking options)
                        // and let it bubble to the stage element to display the handle box
                        element
                            .on(CLICK + NS, INPUT_SELECTOR, function (e) {
                                e.preventDefault();
                            })
                            .on(CHANGE + NS, INPUT_SELECTOR, function (e) {
                                // In the very specific case of iOS and only when all radio buttons are unchecked
                                // a change event is triggered before the click event and the radio clicked is checked
                                // like if iOS wanted one radio to always be checked
                                // When one radio is checked, the click event handler above does the job
                                // and the change event is not raised
                                // This issue does not occur with checkboxes
                                $(e.target).prop('checked', false);
                            });
                    }
                    element.find(INPUT_SELECTOR)
                        .toggleClass(DISABLE, !enable)
                        // .prop('disabled', !enable) <--- suppresses the click event so elements are no more selectable in design mode
                        .prop('readonly', !enable);
                }
            },

            /**
             * Destroy widget
             */
            destroy: function () {
                var that = this;
                var element = this.element;
                Widget.fn.destroy.call(that);
                // Destroy the drop down list (especially the popup)
                if (that.dropDownList) {
                    that.dropDownList.destroy();
                    that.dropDownList = undefined;
                }
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

        ui.plugin(Quiz);

    })(window.jQuery);

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
