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
        './vendor/kendo/kendo.binder'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        // shorten references to variables for uglification
        // var fn = Function;
        // var global = fn('return this')();
        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var ObservableArray = kendo.data.ObservableArray;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.multiinput');
        var STRING = 'string';
        var NS = '.kendoMultiInput';
        var CHANGE = 'change';
        var CLICK = 'click' + NS;
        var KEYPRESS = 'keypress' + NS;
        var FOCUSOUT = 'focusout' + NS;
        var MOUSEENTER = 'mouseenter' + NS;
        var MOUSELEAVE = 'mouseleave' + NS;
        var HOVEREVENTS = MOUSEENTER + ' ' + MOUSELEAVE;
        var ID = 'id';
        var LI = 'li';
        var ARIA_DISABLED = 'aria-disabled';
        var ARIA_READONLY = 'aria-readonly';
        // var FOCUSEDCLASS = 'k-state-focused';
        var HOVERCLASS = 'k-state-hover';
        var STATEDISABLED = 'k-state-disabled';
        var DISABLED = 'disabled';
        var READONLY = 'readonly';

        /*******************************************************************************************
         * Helpers
         *******************************************************************************************/

        /**
         * Compare two arrays of values
         * @param a
         * @param b
         * @returns {boolean}
         */
        function compare(a, b) {
            var length;

            if ((a === null && b !== null) || (a !== null && b === null)) {
                return false;
            }

            length = a.length;
            if (length !== b.length) {
                return false;
            }

            while (length--) {
                if (a[length] !== b[length]) {
                    return false;
                }
            }

            return true;
        }

        /*******************************************************************************************
         * Widget
         *******************************************************************************************/

        /**
         * MultiInput (kendoMultiInput)
         * @class MultiInput
         * @extend Widget
         */
        var MultiInput = Widget.extend({

            /**
             * Initializes the widget
             * @method init
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                that.ns = NS;
                Widget.fn.init.call(that, element, options);
                logger.debug('widget initialized');
                options = $.extend(options, that.options);
                that._initValue();
                that._layout();
                that.refresh();
                that._editable(options);
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'MultiInput',
                value: '',
                enabled: true,
                readonly: false,
                match: null, // RegExp match, e.g. for email addresses: separator does not trigger a new tag element unless there is a match
                separators: ',;', // string of separators
                messages: {
                    delete: 'Delete'
                }
            },

            /**
             * Events
             */
            events: [
                CHANGE
            ],

            /**
             * Initialization of values from HTML markup
             * @private
             */
            _initValue: function () {
                var that = this;
                var value = that.options.value || that.element.val();
                if ($.type(value) === STRING && value.trim().length) {
                    try {
                        value = $.parseJSON(value);
                    } catch (ex) {
                        value = [value];
                    }
                }
                if ($.isArray(value)) {
                    that._oldValues = value;
                    that._values = value;
                } else {
                    that._oldValues = [];
                    that._values = [];
                }
            },

            /**
             * Value containing an email which can be used to find a Gravatar
             * @method value
             * @param value
             * @return {*}
             */
            value: function (value) {
                var that = this;
                if ($.type(value) !== 'undefined') {
                    if (value === null) {
                        value = [];
                    }
                    if (!$.isArray(value) && !(value instanceof ObservableArray)) {
                        throw new TypeError();
                    }
                    // TODO: what in case of a match option ????
                    if (!compare(value, that._values)) {
                        that._values = value.slice();
                        that.refresh();
                    }
                } else {
                    return that._values;
                }
            },

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                var that = this;
                // var options = that.options,
                var element = $(that.element); // the <input> element
                var id = element.attr(ID);
                that._clear();
                element.attr({
                    class: 'k-input',
                    accesskey: '',
                    autocomplete: 'off',
                    tabindex : 0,
                    role: 'listbox',
                    'aria-owns': id ? id + '_taglist' : ''
                });
                element.wrap('<div class="k-multiselect-wrap k-floatwrap" unselectable="on"/>');
                that._innerWrapper = element.parent();
                that._innerWrapper.wrap('<div class="k-widget k-multiselect k-header kj-multiinput" unselectable="on">');
                that.wrapper = that._innerWrapper.parent();
                that.tagList = $('<ul role="listbox" unselectable="on" class="k-reset"/>');
                if (id) {
                    that.tagList.attr('id', id + '_taglist');
                }
                that._innerWrapper.prepend(that.tagList);
            },

            /**
             * Give the widget focus
             */
            focus: function () {
                this.element.focus();
            },

            /**
             * Toggles between enabled and readonly modes
             * @param options
             * @private
             */
            _editable: function (options) {
                // TODO: hide delete icon (k-i-close) when readonly
                var that = this;
                var disable = options.disable;
                var readonly = options.readonly;
                var wrapper = that.wrapper.off(NS);
                var tagList = that.tagList.off(NS);
                var input = that.element.off(NS);

                if (!readonly && !disable) {
                    wrapper
                        .removeClass(STATEDISABLED)
                        .on(HOVEREVENTS, that._toggleHover)
                        .on(CLICK,  $.proxy(that.focus, that));

                    input
                        .removeAttr(DISABLED)
                        .removeAttr(READONLY)
                        .attr(ARIA_DISABLED, false)
                        .attr(ARIA_READONLY, false)
                        .on(KEYPRESS, $.proxy(that._onInputKeyPress, that))
                        .on(FOCUSOUT, $.proxy(that._onInputFocusOut, that));

                    tagList
                        .on(MOUSEENTER, LI, function () { $(this).addClass(HOVERCLASS); })
                        .on(MOUSELEAVE, LI, function () { $(this).removeClass(HOVERCLASS); })
                        .on(CLICK, '.k-i-close', $.proxy(that._onTagClick, that));

                } else {
                    if (disable) {
                        wrapper.addClass(STATEDISABLED);
                    } else {
                        wrapper.removeClass(STATEDISABLED);
                    }
                    input
                        .attr(DISABLED, disable)
                        .attr(READONLY, readonly)
                        .attr(ARIA_DISABLED, disable)
                        .attr(ARIA_READONLY, readonly);
                }
            },

            /**
             * Enable/disable the widget
             * @param enable
             */
            enable: function (enable) {
                this._editable({
                    readonly: false,
                    disable: !(enable = enable === undefined ? true : enable)
                });
            },

            /**
             * Make the widget readonly
             * @param readonly
             */
            readonly: function (readonly) {
                this._editable({
                    readonly: readonly === undefined ? true : readonly,
                    disable: false
                });
            },

            /**
             * Refresh the widget
             * @method refresh
             */
            refresh: function () {
                var that = this;
                that.tagList.empty();
                that._addTagElements(that._values);
                that._change();
            },

            /**
             * Add tag elements from a string or an array of string values
             */
            _addTagElements: function (values) {
                if ($.type(values) === STRING) {
                    values = [values];
                }
                assert.ok($.isArray(values) || values instanceof ObservableArray, '`values` is expected to be an instanceof `Array` or `kendo.data.ObservableArray`');
                var that = this;
                $.each(values, function (index, value) {
                    var tagElement = $(kendo.format(
                        '<li class="k-button" unselectable="on"><span unselectable="on">{0}</span><span unselectable="on" class="k-select"><span unselectable="on" class="k-icon k-i-close">{1}</span></span></li>',
                        kendo.htmlEncode(value),
                        that.options.messages.delete
                    ));
                    that.tagList.append(tagElement);
                });
            },

            /**
             * Remove a tag element
             * @param tagElement
             * @private
             */
            _removeTagElement: function (tagElement) {
                assert.instanceof($, tagElement, kendo.format(assert.messages.instanceof.default, 'tagElement', 'jQuery'));
                var that = this;
                var index = tagElement.index();
                tagElement.remove();
                return index;
            },

            /**
             * Trigger a change event if values have changed
             * @private
             */
            _change: function () {
                var that = this;
                var value = that.value();
                if (!compare(value, that._oldValues)) {
                    that.trigger(CHANGE);
                    that.element.trigger(CHANGE); // also trigger the DOM change event so any subscriber gets notified
                    that._oldValues = value.slice();
                }
            },

            /**
             * Event handler for clicking a tag element delete icon
             * @param e
             * @private
             */
            _onTagClick: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var tagElement = $(e.target).closest(LI);
                var index = that._removeTagElement(tagElement);
                that._values.splice(index, 1);
                that._change();
                // that._placeholder();
            },

            /**
             * Event handler triggered when pressing a key when the input has the focus
             * @param e
             * @private
             */
            _onInputKeyPress: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                var that = this;
                var separators = that.options.separators || '';
                var code = e.keyCode || e.which;
                if (separators.indexOf(String.fromCharCode(code)) > -1) {
                    that._fromInputToTag();
                    return false; // cancel the key
                }
            },

            /**
             * Event handler triggered when the input loses the focus
             * @private
             */
            _onInputFocusOut: function () {
                this._fromInputToTag();
            },

            /**
             * Convert an input entry into a tag element assuming a match
             * @private
             */
            _fromInputToTag: function () {
                var that = this;
                var input = that.element;
                var value = input.val().trim();
                if (value.length) {
                    var match = this.options.match;
                    var isMatch = ($.type(match) === STRING && match.length) ? (new RegExp(match)).test(value) : true;
                    if (isMatch) {
                        that._values.push(value);
                        that._addTagElements(value);
                        input.val('');
                        that._change();
                    }
                }
            },

            /**
             * Event handler triggered when mousing over
             * @param e
             * @private
             */
            _toggleHover: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                $(e.currentTarget).toggleClass(HOVERCLASS, e.type === 'mouseenter');
            },

            /**
             * Clears the DOM from modifications made by the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                if (that.wrapper instanceof $ && that.tagList instanceof $) {
                    // Unbind kendo
                    kendo.unbind(that.element);
                    // Unbind all other events
                    that.element.find('*').off(NS);
                    that.element.off(NS);
                    // Remove tag list
                    that.tagList.remove();
                    // Unwrap and remove class
                    that.element
                        .unwrap()
                        .unwrap()
                        .removeClass('k-widget k-multiinput');
                }
            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                kendo.destroy(that.element);
            }

        });

        ui.plugin(MultiInput);

    } (window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
