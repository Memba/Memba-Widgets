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
        './vendor/kendo/kendo.popup'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.splitbutton');
        var outerWidth = kendo._outerWidth;
        var NS = '.kendoSplitButton';
        var UNDEFINED = 'undefined';
        var CLICK = 'click' + NS;
        var WIDGET_CLASS = 'kj-split-button';
        var DISABLED_CLASS = 'k-state-disabled';
        var BUTTON_TMPL = '<a class="k-button">{0}</a>';
        // var ARROW_BUTTON_TMPL = '<a class="k-button kj-split-button-arrow"><span class="' + (options.mobile ? 'km-icon km-arrowdown' : 'k-icon k-i-arrow-60-down') + '"></span></a>';
        var ARROW_BUTTON_TMPL = '<a class="k-button kj-split-button-arrow"><span class="k-icon k-i-arrow-60-down"></span></a>';
        var ICON_TMPL = '<span class="k-icon k-i-{0}"></span>';
        var POPUP_TMPL = '<ul class="k-list-container k-split-container"></ul>';
        var BUTTON_SELECTOR = '.k-button';
        var ARROW_BUTTON_SELECTOR = '.kj-split-button-arrow';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * adjustPopupWidth can be found in kendo.toolbar.js
         */
        function adjustPopupWidth() {
            var anchor = this.options.anchor, computedWidth = outerWidth(anchor), width;
            kendo.wrap(this.element).addClass('k-split-wrapper');
            if (this.element.css('box-sizing') !== 'border-box') {
                width = computedWidth - (outerWidth(this.element) - this.element.width());
            } else {
                width = computedWidth;
            }
            this.element.css({
                fontFamily: anchor.css('font-family'),
                'min-width': width
            });
        }

        /**
        function toggleActive(e) {
            if (!e.target.is('.k-toggle-button')) {
                e.target.toggleClass(STATE_ACTIVE, e.type == 'press');
            }
        }

        function actionSheetWrap(element) {
            element = $(element);
            return element.hasClass('km-actionsheet') ? element.closest('.km-popup-wrapper') : element.addClass('km-widget km-actionsheet').wrap('<div class="km-actionsheet-wrapper km-actionsheet-tablet km-widget km-popup"></div>').parent().wrap('<div class="km-popup-wrapper k-popup"></div>').parent();
        }
        */

        function preventClick(e) {
            e.preventDefault();
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * SplitButton (kendoSplitButton)
         * @class SplitButton
         * @extend Widget
         */
        var SplitButton = Widget.extend({

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
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._layout();
                that.enable(that.options.enable);
                kendo.notify(that);
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CLICK
            ],

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'SplitButton',
                enable: true,
                text: 'Button',
                icon: '',
                menuButtons: [],
                click: $.noop // TODO
            },

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                var element = this.element;
                var options = this.options;
                if (!element.is('div')) {
                    throw new Error('Please instantiate a split button with a div');
                }
                this.wrapper = element;
                element.addClass(WIDGET_CLASS).prop('tabIndex', 0);
                var icon = options.icon ? kendo.format(ICON_TMPL, options.icon) : '';
                this.mainButton = $(kendo.format(BUTTON_TMPL, icon + options.text)).appendTo(element);
                this.arrowButton = $(ARROW_BUTTON_TMPL).appendTo(element);
                this._createPopup();
            },

            /**
             * Adds button popup
             * @private
             */
            _createPopup: function () {
                var options = this.options;
                var element = this.element;
                var items = options.menuButtons;
                this.popupElement = $(POPUP_TMPL).appendTo(element);
                /*
                if (options.mobile) {
                    this.popupElement = actionSheetWrap(this.popupElement);
                }
                */
                for (var i = 0, length = items.length, item, icon; i < items.length; i++) {
                    item = items[i];
                    icon = item.icon ? kendo.format(ICON_TMPL, item.icon) : '';
                    $(kendo.format(BUTTON_TMPL, icon + item.text)).wrap('<li></li>').parent().appendTo(this.popupElement);
                }
                this.popup = this.popupElement.kendoPopup({
                    // appendTo: options.mobile ? $(options.mobile).children('.km-pane') : null,
                    anchor: element,
                    // isRtl: this.toolbar._isRtl,
                    copyAnchorStyles: false,
                    animation: options.animation,
                    open: adjustPopupWidth,
                    activate: function () {
                        this.element.find(':kendoFocusable').first().focus();
                    },
                    close: function () {
                        element.focus();
                    }
                }).data('kendoPopup');
                this.popup.element.on(CLICK + NS, 'a.k-button', preventClick);
            },

            _navigatable: function () {
                var that = this;
                that.popupElement.on('keydown', '.' + BUTTON, function (e) {
                    var li = $(e.target).parent();
                    e.preventDefault();
                    if (e.keyCode === keys.ESC || e.keyCode === keys.TAB || e.altKey && e.keyCode === keys.UP) {
                        that.toggle();
                        that.focus();
                    } else if (e.keyCode === keys.DOWN) {
                        findFocusableSibling(li, 'next').focus();
                    } else if (e.keyCode === keys.UP) {
                        findFocusableSibling(li, 'prev').focus();
                    } else if (e.keyCode === keys.SPACEBAR || e.keyCode === keys.ENTER) {
                        that.toolbar.userEvents.trigger('tap', { target: $(e.target) });
                    }
                });
            },

            /**
             * Toggle popup
             */
            toggle: function () {
                this.popup.toggle();
            },

            /**
             * Focus
             */
            focus: function () {
                this.element.focus();
            },

            /**
             * Function called by the enabled/disabled bindings
             * @param enable
             */
            enable: function (enabled) {
                var that = this;
                var element = that.element;
                enabled = $.type(enabled) === UNDEFINED ? true : !!enabled;
                element.toggleClass(DISABLED_CLASS, !enabled);
                element.off(CLICK + NS);
                if (enabled) {
                    element.on(CLICK + NS, BUTTON_SELECTOR, function (e) {
                        e.preventDefault();
                        if ($(e.currentTarget).is(ARROW_BUTTON_SELECTOR)) {
                            that.toggle();
                        } else {
                            that.trigger(CLICK);
                        }
                    });
                }
            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                // Unbind events
                that.enable(false);

                // Clear references

                // Destroy widget
                Widget.fn.destroy.call(that);
                kendo.destroy(element);
            }
        });

        ui.plugin(SplitButton);

    } (window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
