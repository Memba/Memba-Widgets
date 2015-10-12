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
        './window.assert',
        './window.log'
    ], f);
})(function () {

    'use strict';

    // TODO: copy certain styles (width?, ...) from input to wrapper
    // TODO implement regex match
    // TODO: implement _clear() properly

    (function ($, undefined) {

        // shorten references to variables for uglification
        // var fn = Function;
        // var global = fn('return this')();
        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var ObservableArray = kendo.data.ObservableArray;
        // var assert = window.assert;
        var logger = new window.Log('kidoju.widgets.multiinput');
        // var NUMBER = 'number';
        var STRING = 'string';
        var ns = '.kendoMultiInput';
        var CHANGE = 'change';
        var CLICK = 'click' + ns;
        var KEYPRESS = 'keypress' + ns;
        var FOCUSOUT = 'focusout' + ns;
        var MOUSEENTER = 'mouseenter' + ns;
        var MOUSELEAVE = 'mouseleave' + ns;
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
         * Widget
         *******************************************************************************************/

        // TODO: hide k-delete when readonly

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
                that.ns = ns;
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
                value: null,
                match: null, // RegExp match like email address, cancels separator
                readonly: true,
                separators: ',;' // string of separators
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
                var initialValue = that.element.val();
                var value = that.options.value || initialValue;

                if ($.type(initialValue) === STRING && initialValue.trim().length) {
                    that._initialValue = initialValue;
                    that.element.val(null);
                }

                if ($.type(value) === STRING && initialValue.trim().length) {
                    try {
                        value = $.parseJSON(value);
                    } catch (ex) {
                        value = [value];
                    }
                }

                that._oldValues = [];
                that._values = [];

                if (Array.isArray(value)) {
                    that._oldValues = value;
                    that._values = value;
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
                if (value) {
                    if (!$.isArray(value) && !(value instanceof ObservableArray)) {
                        throw new TypeError();
                    }
                    if (!compare(value, that._values)) {
                        that._values = value;
                        that.refresh();
                    }
                }
                else if (value === null) {
                    that._values = [];
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
                    ariaOwns: id ? id + '_taglist' : ''
                });
                element.wrap('<div class="k-multiselect-wrap k-floatwrap" unselectable="on"/>');
                that._innerWrapper = element.parent();
                that._innerWrapper.wrap('<div class="k-widget k-multiselect k-header" unselectable="on">');
                that.wrapper = that._innerWrapper.parent();
                that.tagList = $('<ul role="listbox" unselectable="on" class="k-reset"/>');
                if (id) {
                    that.tagList.attr('id', id + '_taglist');
                }
                that._innerWrapper.prepend(that.tagList);
            },

            /**
             * Toggles between editing modes
             * @param options
             * @private
             */
            _editable: function (options) {
                var that = this;
                var disable = options.disable;
                var readonly = options.readonly;
                var wrapper = that.wrapper.off(ns);
                var tagList = that.tagList.off(ns);
                var input = that.element.off(ns);

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
                        .on(CLICK, '.k-delete', $.proxy(that._onTagClick, that));

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

            focus: function () {
                this.element.focus();
            },

            readonly: function (readonly) {
                this._editable({
                    readonly: readonly === undefined ? true : readonly,
                    disable: false
                });
            },

            enable: function (enable) {
                this._editable({
                    readonly: false,
                    disable: !(enable = enable === undefined ? true : enable)
                });
            },

            /**
             * Refreshes the widget
             * @method refresh
             */
            refresh: function () {
                var that = this;
                that.tagList.empty();
                that._addTags(that._values);
                that._change();
            },

            /**
             * Add a tag(s) to display
             */
            _addTags: function (values) {
                var that = this;
                if (!Array.isArray(values) && !(values instanceof ObservableArray)) {
                    values = [values];
                }
                $.each(values, function (index, value) {
                    var tagItem = $(kendo.format(
                        '<li class="k-button" unselectable="on"><span unselectable="on">{0}</span><span unselectable="on" class="k-icon k-delete">{1}</span></li>',
                        kendo.htmlEncode(value),
                        'delete'                         // TODO: translate delete!
                    ));
                    that.tagList.append(tagItem);
                });
            },

            /**
             * Remove a tag from display
             * @param tag
             * @private
             */
            _removeTag: function (tag) {
                var that = this;
                var index = tag.index();
                tag.remove();
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
             * Event handler for clicking a tag delete icon
             * @param e
             * @private
             */
            _onTagClick: function (e) {
                var that = this;
                var tag = $(e.target).closest(LI);
                var index = that._removeTag(tag);
                that._values.splice(index, 1);
                that._change();
                // that._placeholder();
            },

            /**
             *
             * @param e
             * @private
             */
            _onInputKeyPress: function (e) {
                var that = this;
                var separators = that.options.separators || '';
                var code = e.keyCode || e.which;
                if (separators.indexOf(String.fromCharCode(code)) > -1) {
                    that._fromInputToTag();
                    return false;
                }
            },

            /**
             *
             * @param e
             * @private
             */
            _onInputFocusOut: function () {
                this._fromInputToTag();
            },

            _fromInputToTag: function () {
                var that = this;
                var input = that.element;
                var value = input.val().trim();
                if (value.length) {
                    that._values.push(value);
                    that._addTags(value);
                    that._change();
                }
                input.val(null);
            },

            _toggleHover: function (e) {
                $(e.currentTarget).toggleClass(HOVERCLASS, e.type === 'mouseenter');
            },

            /**
             * Clears the DOM from modifications made by the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                var ns = that.ns;
                // unbind descendant events
                // $(that.element).find('*').off();
                // clear element
                // $(that.element)
                //    .empty()
                //    .off()
                //    .removeClass('k-widget k-multiinput');

                /*
                 element = $(that.element),
                 wrapper = element.parent();
                 that.unbind(CHANGE);
                 // remove wrapper and stars
                 if (wrapper.length > 0 && wrapper[0].tagName.toLowerCase() === SPAN && wrapper.hasClass('k-rating')) {
                 wrapper.find('span.k-rating-star').off().remove();
                 wrapper.off();
                 element.unwrap();
                 element.show();
                 }
                 */


            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                that._clear();
                Widget.fn.destroy.call(this);
            }

        });

        ui.plugin(MultiInput);

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

    } (window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
