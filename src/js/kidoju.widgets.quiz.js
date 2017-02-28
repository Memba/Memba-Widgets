/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
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
        var DropDownList = ui.DropDownList;
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
        var DROPDOWNLIST_TMPL = '<span class="kj-quiz-item"><span class="k-image" style="background-image:url(#:data.{1}#);"></span><span class="k-text">#:data.{0}#</span></span>';
        var BUTTON = '<button class="k-button kj-quiz-item" data-' + kendo.ns +'uid="{2}" value="{0}"><span class="k-image" style="background-image:url({1});"></span><span class="k-text">{0}</span></button>';
        var RADIO = '<div class="kj-quiz-item" + data-' + kendo.ns + 'uid="{2}"><input id="{3}_{4}" name="{3}" type="radio" class="k-radio" value="{0}"><label class="k-radio-label" for="{3}_{4}"><span class="k-image" style="background-image:url({1});"></span><span class="k-text">{0}</span></label></div>';
        var IMAGE = '<div class="kj-quiz-item" + data-' + kendo.ns + 'uid="{2}"><div class="k-image" style="background:url({1})"></div><div class="k-text">{0}</div></div>';
        var MODES = {
                BUTTON: 'button',
                DROPDOWN: 'dropdown',
                IMAGE: 'image',
                RADIO: 'radio'
            };
        var CHECKED = 'checked';
        var RADIO_SELECTOR = 'input[type="radio"]';
        var BUTTON_SELECTOR = 'button.k-button';

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
             * Fisher-Yates shuffle
             * @see https://bost.ocks.org/mike/shuffle/
             * @param array
             * @returns {*}
             */
            shuffle: function(array) {
                var m = array.length, t, i;

                // While there remain elements to shuffle…
                while (m) {

                    // Pick a remaining element…
                    i = Math.floor(Math.random() * m--);

                    // And swap it with the current element.
                    t = array[m];
                    array[m] = array[i];
                    array[i] = t;
                }

                return array;
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
                logger.debug({ method: 'init', message: 'widget initialized' });
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
                // TODO: link
                image: MODES.IMAGE,
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
                shuffle: false,
                textField: 'text',
                imageField: 'image',
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
                var options = that.options;
                if ($.type(value) === STRING) {
                    // Note: Giving a value to the dropDownList that does not exist in dataSource is discarded without raising an error
                    if (that._value !== value && that.dataSource instanceof kendo.data.DataSource && that.dataSource.data().find(function (item) { return item[options.textField] === value })) {
                        that._value = value;
                        that._toggleSelection();
                    }
                } else if (value === null) {
                    if (that._value !== value) {
                        that._value = null;
                        that._toggleSelection();
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
                var element = that.element;
                var options = that.options;
                that.dropDownList = $('<input>')
                    .width('100%')
                    .appendTo(element)
                    .kendoDropDownList({
                        autoBind: options.autoBind,
                        change: $.proxy(that._onDropDownListChange, that), // change is not triggered by dropDownList api calls incl. value(), text(), ...
                        open: $.proxy(that._onDropDownListOpen, that),
                        dataSource: options.dataSource,
                        dataTextField: options.textField,
                        dataValueField: options.textField,
                        optionLabel: options.messages.optionLabel,
                        template: kendo.format(DROPDOWNLIST_TMPL, options.textField, options.imageField),
                        valueTemplate: kendo.format(DROPDOWNLIST_TMPL, options.textField, options.imageField),
                        value: options.value,
                        height: 400
                    })
                    .data('kendoDropDownList');
            },

            /**
             * Event handler triggered when changing the value of the drop down list in the header
             * @private
             */
            _onDropDownListChange: function () {
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                var value = this.dropDownList.value();
                if ($.type(value) === STRING && value.length) {
                    this._value = value;
                } else {
                    this._value = null;
                }
                this.trigger(CHANGE, { value: this._value });
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
             * Event handler for click event on radio buttons
             * Handles
             * @param e
             * @private
             */
            _onButtonClick: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var button = $(e.currentTarget);
                var value = button.attr('value');
                if (value !== that._value) {
                    that._value = value;
                } else { // clicking the same value resets the button (and value)
                    that._value = null;
                }
                that._toggleButton();
                that.trigger(CHANGE, { value: that._value });
            },

            /**
             * Event handler for click event on radio buttons
             * Handles
             * @param e
             * @private
             */
            _onRadioClick: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var target = $(e.currentTarget);
                var value = target.val();
                if (value !== that._value) {
                    that._value = value;
                } else { // clicking the same value resets the button (and value)
                    that._value = null;
                }
                that._toggleRadio();
                that.trigger(CHANGE, { value: that._value });
            },

            /**
             * Toggle the selection when value is changed
             * @private
             */
            _toggleSelection: function () {
                switch (this.options.mode) {
                    case MODES.BUTTON:
                        this._toggleButton();
                        break;
                    case MODES.DROPDOWN:
                        this._toggleDropDownList();
                        break;
                    case MODES.RADIO:
                        this._toggleRadio();
                        break;
                }
            },

            /**
             * Toggle the button selection when value is changed
             * @private
             */
            _toggleButton: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
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
            },

            /**
             * Select drop down list value
             * @private
             */
            _toggleDropDownList: function () {
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                this.dropDownList.value(this._value);
            },

            /**
             * Toggle the radio selection when value is changed
             * @private
             */
            _toggleRadio: function () {
                var that = this;
                var element = that.element;
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
                if (dropDownList instanceof DropDownList && dropDownList.dataSource !== that.dataSource) {
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
                var element = that.element;
                var options = that.options;
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                if (options.mode === MODES.DROPDOWN) {
                    assert.instanceof(DropDownList, that.dropDownList, kendo.format(assert.messages.instanceof.default, 'that.dropDownList', 'kendo.ui.DropDownList'));
                    that.dropDownList.refresh(e);
                } else {
                    var items = that.dataSource.data();
                    if (e && e.items instanceof kendo.data.ObservableArray) {
                        items = e.items;
                    }
                    // Shuffle
                    if (options.shuffle) {
                        items = util.shuffle(items);
                    }
                    // Note: we only add elements here (not modify or remove depending on e.action) and we might have to improve
                    element.empty();
                    $(items).each(function (index, item) {
                        switch (options.mode) {
                            case MODES.BUTTON:
                                $(kendo.format(BUTTON, kendo.htmlEncode(item.get(options.textField)), kendo.htmlEncode(item.get(options.imageField)), item.uid))
                                    .css(options.itemStyle)
                                    .appendTo(element);
                                break;
                            case MODES.IMAGE:
                                $(kendo.format(IMAGE, kendo.htmlEncode(item.get(options.textField)), kendo.htmlEncode(item.get(options.imageField)),  item.uid))
                                    .css(options.itemStyle)
                                    .appendTo(element);
                                break;
                            case MODES.RADIO:
                                $(kendo.format(RADIO, kendo.htmlEncode(item.get(options.textField)), kendo.htmlEncode(item.get(options.imageField)), item.uid, that._randomId, index))
                                    .css(options.itemStyle)
                                    .appendTo(element);
                                break;
                        }
                    });
                }
                // Get rid of value if there is no match in the dataSource
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
                if ($.type(enable) === UNDEFINED) {
                    enable = true;
                }
                switch(this.options.mode) {
                    case MODES.BUTTON:
                        this._enableButtons(enable);
                        break;
                    case MODES.DROPDOWN:
                        this._enableDropDownList(enable);
                        break;
                    case MODES.RADIO:
                        this._enableRadios(enable);
                        break;
                }
            },

            /**
             * Enable buttons
             * @param enable
             * @private
             */
            _enableButtons: function (enable) {
                var that = this;
                var element = that.element;
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                element.off(NS);
                if (enable) {
                    element
                        .on(CLICK + NS, BUTTON_SELECTOR, $.proxy(that._onButtonClick, that));
                } else {
                    // Because input are readonly and not disabled, we need to prevent default (checking options)
                    // and let it bubble to the stage element to display the handle box
                    element
                        .on(CLICK + NS, BUTTON_SELECTOR, function (e) {
                            e.preventDefault();
                        })
                }
                element.find(BUTTON_SELECTOR)
                    .toggleClass(DISABLE, !enable)
                    // .prop('disabled', !enable) <--- suppresses the click event so elements are no more selectable in design mode
                    .prop('readonly', !enable);
            },

            /**
             * Enable drop down list
             * @param enable
             * @private
             */
            _enableDropDownList: function (enable) {
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                this.dropDownList.enable(enable);
            },

            /**
             * Enable radios
             * @param enable
             * @private
             */
            _enableRadios: function (enable) {
                var that = this;
                var element = that.element;
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                element.off(NS);
                if (enable) {
                    element
                        .on(CLICK + NS, RADIO_SELECTOR, $.proxy(that._onRadioClick, that));
                } else {
                    // Because input are readonly and not disabled, we need to prevent default (checking options)
                    // and let it bubble to the stage element to display the handle box
                    element
                        .on(CLICK + NS, RADIO_SELECTOR, function (e) {
                            e.preventDefault();
                        })
                        .on(CHANGE + NS, RADIO_SELECTOR, function (e) {
                            // In the very specific case of iOS and only when all radio buttons are unchecked
                            // a change event is triggered before the click event and the radio clicked is checked
                            // like if iOS wanted one radio to always be checked
                            // When one radio is checked, the click event handler above does the job
                            // and the change event is not raised
                            // This issue does not occur with checkboxes
                            $(e.target).prop('checked', false);
                        });
                }
                element.find(RADIO_SELECTOR)
                    .toggleClass(DISABLE, !enable)
                    // .prop('disabled', !enable) <--- suppresses the click event so elements are no more selectable in design mode
                    .prop('readonly', !enable);
            },

            /**
             * Destroy widget
             */
            destroy: function () {
                var that = this;
                var element = this.element;
                Widget.fn.destroy.call(that);
                // Destroy the drop down list (especially the popup)
                if (that.dropDownList instanceof DropDownList) {
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
