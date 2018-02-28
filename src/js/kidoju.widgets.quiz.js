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
        './vendor/kendo/kendo.dropdownlist',
        './kidoju.util'
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
        var DataSource = kendo.data.DataSource;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.quiz');
        var util = window.kidoju.util;
        var NS = '.kendoQuiz';
        var NULL = 'null';
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var CLICK = 'click';
        // var STATE_ACTIVE = 'k-state-active';
        var STATE_DISABLED = 'k-state-disabled';
        var STATE_SELECTED = 'k-state-selected';
        var WIDGET_CLASS = 'kj-quiz'; // 'k-widget kj-quiz',
        var INTERACTIVE_CLASS = 'kj-interactive';
        var DROPDOWN_TMPL = '<span class="kj-quiz-item kj-quiz-dropdown"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></span>';
        var BUTTON_TMPL = '<button class="k-button kj-quiz-item kj-quiz-button" data-' + kendo.ns + 'uid="#: data.uid #" data-' + kendo.ns + 'value="#: data.{0} #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></button>';
        var IMAGE_TMPL = '<div class="k-widget kj-quiz-item kj-quiz-image" data-' + kendo.ns + 'uid="#: data.uid #" data-' + kendo.ns + 'value="#: data.{0} #"><div class="k-image" style="background-image:url(#: data.{1} #)"></div></div>';
        var LINK_TMPL = '<span class="kj-quiz-item kj-quiz-link" data-' + kendo.ns + 'uid="#: data.uid #" data-' + kendo.ns + 'value="#: data.{0} #">#: data.{0} #</span>';
        var RADIO_TMPL = '<div class="kj-quiz-item kj-quiz-radio" data-' + kendo.ns + 'uid="#: data.uid #"><input id="{2}_#: data.uid #" name="{2}" type="radio" class="k-radio" value="#: data.{0} #"><label class="k-radio-label" for="{2}_#: data.uid #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></label></div>';
        var BUTTON_SELECTOR = '.kj-quiz-item.kj-quiz-button';
        var IMAGE_SELECTOR = '.kj-quiz-item.kj-quiz-image';
        var LINK_SELECTOR = '.kj-quiz-item.kj-quiz-link';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var RADIO_SELECTOR = '.kj-quiz-item.kj-quiz-radio>input[type="radio"]';
        var MODES = {
                BUTTON: 'button',
                DROPDOWN: 'dropdown',
                IMAGE: 'image',
                LINK: 'link',
                RADIO: 'radio'
            };
        var CHECKED = 'checked';

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
                link: MODES.LINK,
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
                buttonTemplate: BUTTON_TMPL,
                dropDownTemplate: DROPDOWN_TMPL,
                imageTemplate: IMAGE_TMPL,
                linkTemplate: LINK_TMPL,
                radioTemplate: RADIO_TMPL,
                itemStyle: {},
                selectedStyle: {},
                scaler: 'div.kj-stage',
                stageElement: 'div.kj-element',
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
                options.groupStyle = util.styleString2CssObject(options.groupStyle);
                options.itemStyle = util.styleString2CssObject(options.itemStyle);
                options.selectedStyle = util.styleString2CssObject(options.selectedStyle);
                that._buttonTemplate = kendo.template(kendo.format(options.buttonTemplate, options.textField, options.imageField));
                that._dropDownTemplate = kendo.format(options.dropDownTemplate, options.textField, options.imageField); // ! not a compiled template
                that._imageTemplate = kendo.template(kendo.format(options.imageTemplate, options.textField, options.imageField));
                that._linkTemplate = kendo.template(kendo.format(options.linkTemplate, options.textField, options.imageField));
                that._radioTemplate = kendo.template(kendo.format(options.radioTemplate, options.textField, options.imageField, util.randomId()));
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
                    if (that._value !== value && that.dataSource instanceof DataSource && that.dataSource.data().find(function (item) { return item[options.textField] === value; })) {
                        that._value = value;
                        that._toggleSelection();
                    }
                } else if ($.type(value) === NULL) {
                    if ($.type(that._value) !== NULL) {
                        that._value = null;
                        that._toggleSelection();
                    }
                } else if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else {
                    throw new TypeError('`value` is expected to be a string if not null or undefined');
                }
            },

            /**
             * Widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                var element = that.element;
                that.wrapper = element;
                element
                    .addClass(WIDGET_CLASS)
                    .addClass(INTERACTIVE_CLASS); // INTERACTIVE_CLASS (which might be shared with other widgets) is used to position any drawing surface underneath interactive widgets
                if (that.options.mode === MODES.DROPDOWN) {
                    that._layoutDropDown();
                }
                // refresh layouts all other modes (buttons, radios, ...)
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
                        template: that._dropDownTemplate,
                        valueTemplate: that._dropDownTemplate,
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
                assert.instanceof(DropDownList, this.dropDownList, assert.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
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
                var element = that.element;
                var options = that.options;
                // We need to scale the popup
                var scaler = element.closest(options.scaler);
                var scale = util.getTransformScale(scaler);
                var width = element.width();
                var height = element.height();
                var fontSize = parseInt(element.css('font-size'), 10);
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
                    var stageElement = element.closest(options.stageElement);
                    if (scaler.length && stageElement.length) {
                        var top = stageElement.position().top + scaler.offset().top;
                        var popupTop = popup.wrapper.position().top;
                        if (popupTop > top) {
                            popup.wrapper.css('top', popupTop + (scale - 1) * height);
                        }
                    }
                }, 0);
            },

            /**
             * Event handler for click event on buttons
             * Handles
             * @param e
             * @private
             */
            _onButtonClick: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var button = $(e.currentTarget);
                var value = button.attr(kendo.attr('value'));
                if (value !== that._value) {
                    that._value = value;
                } else { // clicking the same value resets the button (and value)
                    that._value = null;
                }
                that._toggleButtons();
                that.trigger(CHANGE, { value: that._value });
            },

            /**
             * Event handler for click event on images
             * Handles
             * @param e
             * @private
             */
            _onImageClick: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var image = $(e.currentTarget);
                var value = image.attr(kendo.attr('value'));
                if (value !== that._value) {
                    that._value = value;
                } else { // clicking the same value resets the button (and value)
                    that._value = null;
                }
                that._toggleImages();
                that.trigger(CHANGE, { value: that._value });
            },

            /**
             * Event handler for click event on links
             * Handles
             * @param e
             * @private
             */
            _onLinkClick: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var link = $(e.currentTarget);
                var value = link.attr(kendo.attr('value'));
                if (value !== that._value) {
                    that._value = value;
                } else { // clicking the same value resets the button (and value)
                    that._value = null;
                }
                that._toggleLinks();
                that.trigger(CHANGE, { value: that._value });
            },

            /**
             * Event handler for click event on radio buttons
             * Handles
             * @param e
             * @private
             */
            _onRadioClick: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var radio = $(e.currentTarget);
                var value = radio.val();
                if (value !== that._value) {
                    that._value = value;
                } else { // clicking the same value resets the button (and value)
                    that._value = null;
                }
                that._toggleRadios();
                that.trigger(CHANGE, { value: that._value });
            },

            /**
             * Toggle the selection when value is changed
             * @private
             */
            _toggleSelection: function () {
                switch (this.options.mode) {
                    case MODES.BUTTON:
                        this._toggleButtons();
                        break;
                    case MODES.DROPDOWN:
                        this._toggleDropDownList();
                        break;
                    case MODES.IMAGE:
                        this._toggleImages();
                        break;
                    case MODES.LINK:
                        this._toggleLinks();
                        break;
                    case MODES.RADIO:
                        this._toggleRadios();
                        break;
                }
            },

            /**
             * Toggle the button selection when value is changed
             * @private
             */
            _toggleButtons: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                element.find(BUTTON_SELECTOR)
                    .removeClass(STATE_SELECTED)
                    .attr('style', '')
                    .css(options.itemStyle);
                if ($.type(that._value) === STRING) {
                    element.find(BUTTON_SELECTOR + kendo.format(ATTRIBUTE_SELECTOR, kendo.attr('value'), that._value))
                        .addClass(STATE_SELECTED)
                        .attr('style', '')
                        .css($.extend({}, options.itemStyle, options.selectedStyle));
                }
            },

            /**
             * Select drop down list when value is changed
             * @private
             */
            _toggleDropDownList: function () {
                assert.instanceof(DropDownList, this.dropDownList, assert.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                this.dropDownList.value(this._value);
            },

            /**
             * Select image selection when value is changed
             * @private
             */
            _toggleImages: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                element.find(IMAGE_SELECTOR)
                    .removeClass(STATE_SELECTED)
                    .attr('style', '')
                    .css(options.itemStyle);
                if ($.type(that._value) === STRING) {
                    element.find(IMAGE_SELECTOR + kendo.format(ATTRIBUTE_SELECTOR, kendo.attr('value'), that._value))
                        .addClass(STATE_SELECTED)
                        .attr('style', '')
                        .css($.extend({}, options.itemStyle, options.selectedStyle));
                }
            },

            /**
             * Select link selection when value is changed
             * @private
             */
            _toggleLinks: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                element.find(LINK_SELECTOR)
                    .removeClass(STATE_SELECTED)
                    .attr('style', '')
                    .css(options.itemStyle);
                if ($.type(that._value) === STRING) {
                    element.find(LINK_SELECTOR + kendo.format(ATTRIBUTE_SELECTOR, kendo.attr('value'), that._value))
                        .addClass(STATE_SELECTED)
                        .attr('style', '')
                        .css($.extend({}, options.itemStyle, options.selectedStyle));
                }
            },

            /**
             * Toggle the radio selection when value is changed
             * @private
             */
            _toggleRadios: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                element.children('div')
                    .attr('style', '')
                    .css(options.itemStyle);
                element.find(RADIO_SELECTOR)
                    .prop(CHECKED, false)
                    .parent()
                        .attr('style', '')
                        .css(options.itemStyle);
                if ($.type(that._value) === STRING) {
                    element.find(RADIO_SELECTOR + kendo.format(ATTRIBUTE_SELECTOR, 'value', that._value))
                        .prop(CHECKED, true)
                        .parent()
                            .attr('style', '')
                            .css($.extend({}, options.itemStyle, options.selectedStyle));
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
                assert.instanceof($, element, assert.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                if (options.mode === MODES.DROPDOWN) {
                    assert.instanceof(DropDownList, that.dropDownList, assert.format(assert.messages.instanceof.default, 'that.dropDownList', 'kendo.ui.DropDownList'));
                    that.dropDownList.refresh(e); // Note: shuffle does not apply here.
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
                                $(that._buttonTemplate(item))
                                    .css(options.itemStyle)
                                    .appendTo(element);
                                break;
                            case MODES.IMAGE:
                                $(that._imageTemplate(item))
                                    .css(options.itemStyle)
                                    .appendTo(element);
                                break;
                            case MODES.LINK:
                                $(that._linkTemplate(item))
                                    .css(options.itemStyle)
                                    .appendTo(element);
                                break;
                            case MODES.RADIO:
                                $(that._radioTemplate(item))
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
                logger.debug({ method: 'refresh', message: 'widget refreshed' });
            },

            /**
             * Enable/disable the widget
             * @param enable
             */
            enable: function (enable) {
                if ($.type(enable) === UNDEFINED) {
                    enable = true;
                }
                switch (this.options.mode) {
                    case MODES.BUTTON:
                        this._enableButtons(enable);
                        break;
                    case MODES.DROPDOWN:
                        this._enableDropDownList(enable);
                        break;
                    case MODES.IMAGE:
                        this._enableImages(enable);
                        break;
                    case MODES.LINK:
                        this._enableLinks(enable);
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
                assert.instanceof($, element, assert.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                element.off(NS);
                if (enable) {
                    element
                        .on(CLICK + NS, BUTTON_SELECTOR, $.proxy(that._onButtonClick, that));
                }
                element.toggleClass(STATE_DISABLED, !enable);
            },

            /**
             * Enable drop down list
             * @param enable
             * @private
             */
            _enableDropDownList: function (enable) {
                assert.instanceof(DropDownList, this.dropDownList, assert.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                this.dropDownList.enable(enable);
            },

            /**
             * Enable images
             * @param enable
             * @private
             */
            _enableImages: function (enable) {
                var that = this;
                var element = that.element;
                assert.instanceof($, element, assert.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                element.off(NS);
                if (enable) {
                    element
                        .on(CLICK + NS, IMAGE_SELECTOR, $.proxy(that._onImageClick, that));
                }
                element.toggleClass(STATE_DISABLED, !enable);
            },

            /**
             * Enable links
             * @param enable
             * @private
             */
            _enableLinks: function (enable) {
                var that = this;
                var element = that.element;
                assert.instanceof($, element, assert.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                element.off(NS);
                if (enable) {
                    element
                        .on(CLICK + NS, LINK_SELECTOR, $.proxy(that._onLinkClick, that));
                }
                element.toggleClass(STATE_DISABLED, !enable);
            },

            /**
             * Enable radios
             * @param enable
             * @private
             */
            _enableRadios: function (enable) {
                var that = this;
                var element = that.element;
                assert.instanceof($, element, assert.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
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
                    .toggleClass(STATE_DISABLED, !enable)
                    // .prop('disabled', !enable) <--- suppresses the click event so elements are no more selectable in design mode
                    .prop('readonly', !enable);
            },

            /**
             * Destroy widget
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                that.dropDownList = undefined;
                if (that._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                }
                element
                    .removeClass(WIDGET_CLASS)
                    .removeClass(INTERACTIVE_CLASS)
                    .off(NS);
                Widget.fn.destroy.call(that);
                kendo.destroy(element);
            }

        });

        ui.plugin(Quiz);

    })(window.jQuery);

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
