/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './common/window.assert.es6',
        './common/window.logger.es6',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.multiselect',
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
        var MultiSelect = ui.MultiSelect;
        var DataSource = kendo.data.DataSource;
        var ObservableArray = kendo.data.ObservableArray;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.multiquiz');
        var util = window.kidoju.util;
        var NS = '.kendoMultiQuiz';
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var CLICK = 'click';
        var TAP = 'tap';
        // var STATE_ACTIVE = 'k-state-active';
        var STATE_DISABLED = 'k-state-disabled';
        var STATE_SELECTED = 'k-state-selected';
        var WIDGET_CLASS = 'kj-multiquiz'; // 'k-widget kj-multiquiz',
        var INTERACTIVE_CLASS = 'kj-interactive';
        var MULTISELECT_TMPL = '<span class="kj-multiquiz-item kj-multiquiz-multiselect"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></span>';
        var BUTTON_TMPL = '<button class="k-button kj-multiquiz-item kj-multiquiz-button" data-' + kendo.ns + 'uid="#: data.uid #" data-' + kendo.ns + 'value="#: data.{0} #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></button>';
        var IMAGE_TMPL = '<div class="k-widget kj-multiquiz-item kj-multiquiz-image" data-' + kendo.ns + 'uid="#: data.uid #" data-' + kendo.ns + 'value="#: data.{0} #"><div class="k-image" style="background-image:url(#: data.{1} #)"></div></div>';
        var LINK_TMPL = '<span class="kj-multiquiz-item kj-multiquiz-link" data-' + kendo.ns + 'uid="#: data.uid #" data-' + kendo.ns + 'value="#: data.{0} #">#: data.{0} #</span>';
        var CHECKBOX_TMPL = '<div class="kj-multiquiz-item kj-multiquiz-checkbox" data-' + kendo.ns + 'uid="#: data.uid #"><input id="{2}_#: data.uid #" name="{2}" type="checkbox" class="k-checkbox" value="#: data.{0} #"><label class="k-checkbox-label" for="{2}_#: data.uid #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></label></div>';
        var BUTTON_SELECTOR = '.kj-multiquiz-item.kj-multiquiz-button';
        var IMAGE_SELECTOR = '.kj-multiquiz-item.kj-multiquiz-image';
        var LINK_SELECTOR = '.kj-multiquiz-item.kj-multiquiz-link';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var CHECKBOX_SELECTOR = '.kj-multiquiz-item.kj-multiquiz-checkbox>input[type="checkbox"]';
        var MODES = {
            BUTTON: 'button',
            CHECKBOX: 'checkbox',
            IMAGE: 'image',
            LINK: 'link',
            MULTISELECT: 'multiselect'
        };
        var CHECKED = 'checked';

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * MultiQuiz widget
         */
        var MultiQuiz = Widget.extend({

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
                checkbox: MODES.CHECKBOX,
                image: MODES.IMAGE,
                link: MODES.LINK,
                multiselect: MODES.MULTISELECT
            },

            /**
             * Widget options
             */
            options: {
                name: 'MultiQuiz',
                autoBind: true,
                dataSource: [],
                mode: MODES.BUTTON,
                shuffle: false,
                textField: 'text',
                imageField: 'image',
                buttonTemplate: BUTTON_TMPL,
                checkboxTemplate: CHECKBOX_TMPL,
                imageTemplate: IMAGE_TMPL,
                linkTemplate: LINK_TMPL,
                multiSelectTemplate: MULTISELECT_TMPL,
                itemStyle: {},
                selectedStyle: {},
                scaler: 'div.kj-stage',
                stageElement: 'div.kj-element',
                value: null,
                enable: true,
                messages: {
                    placeholder: 'Select...'
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
                that._checkboxTemplate = kendo.template(kendo.format(options.checkboxTemplate, options.textField, options.imageField, util.randomId()));
                that._imageTemplate = kendo.template(kendo.format(options.imageTemplate, options.textField, options.imageField));
                that._linkTemplate = kendo.template(kendo.format(options.linkTemplate, options.textField, options.imageField));
                that._multiSelectTemplate = kendo.format(options.multiSelectTemplate, options.textField, options.imageField); // ! not a compiled template
            },

            /**
             * Widget events
             */
            events: [
                CHANGE
            ],

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Gets/sets the value
             * @param value
             */
            value: function (value) {
                var that = this;
                var options = that.options;
                if (Array.isArray(value) || value instanceof ObservableArray) {
                    if (that.dataSource instanceof DataSource) {
                        // finder is used to satisfy jshint which would otherwise complain about making functions within loops
                        var finder = function (value) {
                            return that.dataSource.data().find(function (dataItem) {
                                return dataItem[options.textField] === value;
                            });
                        };
                        // Only retain values that have a match in dataSource
                        for (var i = value.length - 1; i >= 0; i--) {
                            if (!finder(value[i])) {
                                value.splice(i, 1);
                            }
                        }
                    } else {
                        value = [];
                    }
                    that._value = value;
                    that._toggleSelection();
                } else if ($.type(value) === NULL) { // null is the same as [] but we allow it for data bindings
                    if ($.type(that._value) !== NULL) {
                        that._value = null;
                        that._toggleSelection();
                    }
                } else if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else {
                    throw new TypeError('`value` is expected to be a an array if not null or undefined');
                }
            },

            /* jshint +W074 */

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
                if (that.options.mode === MODES.MULTISELECT) {
                    that._layoutMultiSelect();
                }
                // refresh layouts all other modes (buttons, checkboxes, ...)
            },

            /**
             * Widget layout as multiselect list
             * @private
             */
            _layoutMultiSelect: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                that.multiSelect = $('<input>')
                    .width('100%')
                    .appendTo(element)
                    .kendoMultiSelect({
                        autoBind: options.autoBind,
                        change: $.proxy(that._onMultiSelectChange, that), // change is not triggered by multiSelect api calls incl. value()
                        open: $.proxy(that._onMultiSelectOpen, that),
                        dataSource: options.dataSource,
                        dataTextField: options.textField,
                        dataValueField: options.textField,
                        placeholder: options.messages.placeholder,
                        itemTemplate: that._multiSelectTemplate,
                        tagTemplate: that._multiSelectTemplate,
                        value: options.value,
                        height: 400
                    })
                    .data('kendoMultiSelect');
            },

            /**
             * Event handler triggered when changing the value of the drop down list in the header
             * @private
             */
            _onMultiSelectChange: function () {
                assert.instanceof(MultiSelect, this.multiSelect, assert.format(assert.messages.instanceof.default, 'this.multiSelect', 'kendo.ui.MultiSelect'));
                var value = this.multiSelect.value();
                if (Array.isArray(value) || value instanceof ObservableArray) {
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
            _onMultiSelectOpen: function (e) {
                var that = this;
                var element = that.element;
                var options = that.options;
                // We need to scale the popup
                var scaler = element.closest(options.scaler);
                var scale = util.getTransformScale(scaler);
                var width = element.width();
                var height = element.height();
                var fontSize = parseInt(element.css('font-size'), 10);
                var popup = that.multiSelect.popup;
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
             * Event handler for click event on checkbox buttons
             * Handles
             * @param e
             * @private
             */
            _onCheckBoxClick: function (e) {
                assert.instanceof($.Event, e, assert.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var checkbox = $(e.currentTarget);
                var value = checkbox.val();
                if (!Array.isArray(that._value) && !(that._value instanceof ObservableArray)) {
                    that._value = [];
                }
                var index = that._value.indexOf(value);
                // Note: contrary to k-state.selected which would be toggled later, prop checked is true here
                var checked = !!checkbox.prop(CHECKED);
                if (checked && index === -1) {
                    that._value.push(value);
                } else if (!checked && index >= 0) { // clicking the same value resets the button (and value)
                    that._value.splice(index, 1);
                }
                that._toggleCheckBoxes();
                that.trigger(CHANGE, { value: that._value });
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
                if (!Array.isArray(that._value) && !(that._value instanceof ObservableArray)) {
                    that._value = [];
                }
                var index = that._value.indexOf(value);
                var checked = button.hasClass(STATE_SELECTED);
                if (!checked && index === -1) {
                    that._value.push(value);
                } else if (checked && index >= 0) { // clicking the same value resets the button (and value)
                    that._value.splice(index, 1);
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
                if (!Array.isArray(that._value) && !(that._value instanceof ObservableArray)) {
                    that._value = [];
                }
                var index = that._value.indexOf(value);
                var checked = image.hasClass(STATE_SELECTED);
                if (!checked && index === -1) {
                    that._value.push(value);
                } else if (checked && index >= 0) { // clicking the same value resets the button (and value)
                    that._value.splice(index, 1);
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
                if (!Array.isArray(that._value) && !(that._value instanceof ObservableArray)) {
                    that._value = [];
                }
                var index = that._value.indexOf(value);
                var checked = link.hasClass(STATE_SELECTED);
                if (!checked && index === -1) {
                    that._value.push(value);
                } else if (checked && index >= 0) { // clicking the same value resets the button (and value)
                    that._value.splice(index, 1);
                }
                that._toggleLinks();
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
                    case MODES.CHECKBOX:
                        this._toggleCheckBoxes();
                        break;
                    case MODES.IMAGE:
                        this._toggleImages();
                        break;
                    case MODES.LINK:
                        this._toggleLinks();
                        break;
                    case MODES.MULTISELECT:
                        this._toggleMultiSelect();
                        break;
                }
            },

            /**
             * Toggle button selection when value is changed
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
                if (Array.isArray(that._value) || that._value instanceof ObservableArray) {
                    $.each(that._value, function (index, value) {
                        element.find(BUTTON_SELECTOR + kendo.format(ATTRIBUTE_SELECTOR, kendo.attr('value'), value))
                            .addClass(STATE_SELECTED)
                            .attr('style', '')
                            .css($.extend({}, options.itemStyle, options.selectedStyle));
                    });
                }
            },

            /**
             * Toggle checkbox selection when value is changed
             * @private
             */
            _toggleCheckBoxes: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                element.children('div')
                    .attr('style', '')
                    .css(options.itemStyle);
                element.find(CHECKBOX_SELECTOR)
                    .prop(CHECKED, false)
                    .parent()
                    .attr('style', '')
                    .css(options.itemStyle);
                if (Array.isArray(that._value) || that._value instanceof ObservableArray) {
                    $.each(that._value, function (index, value) {
                        element.find(CHECKBOX_SELECTOR + kendo.format(ATTRIBUTE_SELECTOR, 'value', value))
                            .prop(CHECKED, true)
                            .parent()
                            .attr('style', '')
                            .css($.extend({}, options.itemStyle, options.selectedStyle));
                    });
                }
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
                if (Array.isArray(that._value) || that._value instanceof ObservableArray) {
                    $.each(that._value, function (index, value) {
                        element.find(IMAGE_SELECTOR + kendo.format(ATTRIBUTE_SELECTOR, kendo.attr('value'), value))
                            .addClass(STATE_SELECTED)
                            .attr('style', '')
                            .css($.extend({}, options.itemStyle, options.selectedStyle));
                    });
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
                if (Array.isArray(that._value) || that._value instanceof ObservableArray) {
                    $.each(that._value, function (index, value) {
                        element.find(LINK_SELECTOR + kendo.format(ATTRIBUTE_SELECTOR, kendo.attr('value'), value))
                            .addClass(STATE_SELECTED)
                            .attr('style', '')
                            .css($.extend({}, options.itemStyle, options.selectedStyle));
                    });
                }
            },

            /**
             * Select multi selection when value is changed
             * @private
             */
            _toggleMultiSelect: function () {
                assert.instanceof(MultiSelect, this.multiSelect, assert.format(assert.messages.instanceof.default, 'this.multiSelect', 'kendo.ui.MultiSelect'));
                this.multiSelect.value(this._value);
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

                // Assign dataSource to multiSelect
                var multiSelect = that.multiSelect;
                if (multiSelect instanceof MultiSelect && multiSelect.dataSource !== that.dataSource) {
                    multiSelect.setDataSource(that.dataSource);
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
                if (options.mode === MODES.MULTISELECT) {
                    assert.instanceof(MultiSelect, that.multiSelect, assert.format(assert.messages.instanceof.default, 'that.multiSelect', 'kendo.ui.MultiSelect'));
                    that.multiSelect.refresh(e); // Note: shuffle does not apply here.
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
                            case MODES.CHECKBOX:
                                $(that._checkboxTemplate(item))
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
                    case MODES.CHECKBOX:
                        this._enableCheckBoxes(enable);
                        break;
                    case MODES.IMAGE:
                        this._enableImages(enable);
                        break;
                    case MODES.LINK:
                        this._enableLinks(enable);
                        break;
                    case MODES.MULTISELECT:
                        this._enableMultiSelect(enable);
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
                        .on(CLICK + NS + ' ' + TAP + NS, BUTTON_SELECTOR, $.proxy(that._onButtonClick, that));
                }
                element.toggleClass(STATE_DISABLED, !enable);
            },

            /**
             * Enable checkboxes
             * @param enable
             * @private
             */
            _enableCheckBoxes: function (enable) {
                var that = this;
                var element = that.element;
                assert.instanceof($, element, assert.format(assert.messages.instanceof.default, 'this.element', 'jQuery'));
                element.off(NS);
                if (enable) {
                    element
                        .on(CLICK + NS, CHECKBOX_SELECTOR, $.proxy(that._onCheckBoxClick, that));
                } else {
                    // Because input are readonly and not disabled, we need to prevent default (checking options)
                    // and let it bubble to the stage element to display the handle box
                    element
                        .on(CLICK + NS, CHECKBOX_SELECTOR, function (e) {
                            e.preventDefault();
                        })
                        .on(CHANGE + NS, CHECKBOX_SELECTOR, function (e) {
                            // In the very specific case of iOS and only when all checkbox buttons are unchecked
                            // a change event is triggered before the click event and the checkbox clicked is checked
                            // like if iOS wanted one checkbox to always be checked
                            // When one checkbox is checked, the click event handler above does the job
                            // and the change event is not raised
                            // This issue does not occur with checkboxes
                            $(e.target).prop('checked', false);
                        });
                }
                element.find(CHECKBOX_SELECTOR)
                    .toggleClass(STATE_DISABLED, !enable)
                    // .prop('disabled', !enable) <--- suppresses the click event so elements are no more selectable in design mode
                    .prop('readonly', !enable);
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
             * Enable drop down list
             * @param enable
             * @private
             */
            _enableMultiSelect: function (enable) {
                assert.instanceof(MultiSelect, this.multiSelect, assert.format(assert.messages.instanceof.default, 'this.multiSelect', 'kendo.ui.MultiSelect'));
                this.multiSelect.enable(enable);
            },

            /**
             * Destroy widget
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                that.multiSelect = undefined;
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

        ui.plugin(MultiQuiz);

    })(window.jQuery);

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
