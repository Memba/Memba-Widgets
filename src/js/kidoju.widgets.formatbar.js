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
        // TODO TabStrip and ToolBar --------------------------------
        './kidoju.data'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        // shorten references to variables for uglification
        // var fn = Function;
        // var global = fn('return this')();
        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var TabStrip = ui.TabStrip;
        var ToolBar = ui.ToolBar;
        var kidoju = window.kidoju;
        var PageComponent = kidoju.data.PageComponent;
        var adapters = kidoju.adapters;
        var NS = '.kendoFormatBar';
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.formatbar');
        var UNDEFINED = 'undefined';
        var NULL = 'null';
        // var NUMBER = 'number';
        var STRING = 'string';
        var SELECT = 'select';
        // var CLICK = 'click' + NS;
        // var MOUSEENTER = 'mouseenter';
        // var MOUSELEAVE = 'mouseleave';
        // var HOVEREVENTS = MOUSEENTER + NS + ' ' + MOUSELEAVE + NS;
        // var WIDGET_CLASS = 'kj-social';
        // var STATE_DISABLED = 'k-state-disabled';
        // var TEMPLATE = '<a role="button" href="#" data-command="{0}"></a>';
        var DIV = '<div></div>';


        /**
         * Formatting Toolbar
         */
        var FormatToolBar = ToolBar.extend({

        });

        ui.plugin(FormatToolBar);

        /**
         * FormatTabStrip (kendoFormatTabStrip)
         * @class FormatTabStrip
         * @extend Widget
         */
        var FormatTabStrip = Widget.extend({

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
                that._layout();
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'FormatTabStrip',
                messages: {
                    defaultTab: 'Style'
                }
            },

            /**
             * Gets/sets value (a PageComponent)
             * @param value
             * @returns {*}
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else if (value instanceof PageComponent || $.type(value) === NULL) {
                    that._value = value;
                    that.refresh();
                } else {
                    throw new TypeError('`value` should be undefined, null or a PageComponent.');
                }
            },

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                // Add TabStrip
                var tabStripElement = $(DIV);
                that.element.append(tabStripElement);
                that.tabStrip = tabStripElement.kendoTabStrip().data('kendoTabStrip');
                that.tabStrip.bind(SELECT, $.proxy(that._onTabSelect, that));
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Refresh
             * @param e
             */
            refresh: function (e) {
                /* jshint maxcomplexity: 8 */

                var that = this;

                var index = 0;
                // Clear Tabstrip but keep tab 0
                for (var i = 1, length = that.tabStrip.contentElements.length; i < length; i++) {
                    that.tabStrip.remove(i);
                }
                // Find tool and styles
                var tool = that._value instanceof PageComponent ? that._value.tool : undefined;
                var tabs = [];
                if ($.type(tool) === STRING) {
                    // If there is a selected component and therefore a tool
                    assert.instanceof(kendo.Observable, kidoju.tools, kendo.format(assert.messages.instanceof.default, 'kidoju.tools', 'kendo.Observable'));
                    assert.instanceof(kidoju.Tool, kidoju.tools[tool], kendo.format(assert.messages.instanceof.default, 'kidoju.tools[tool]', 'kidoju.Tool'));
                    var attributes = kidoju.tools[tool].attributes;
                    for (var attr in attributes) {
                        if (attributes.hasOwnProperty(attr) && attributes[attr] instanceof adapters.StyleAdapter) {
                            var styleAdapter = attributes[attr];
                            if (index === 0 && that.tabStrip.contentElements.length > 0) {
                                that.tabStrip.tabGroup.find('.k-link').first().text(styleAdapter.title);
                            } else {
                                tabs.push({
                                    text: styleAdapter.title,
                                    content: '<div>Yep</div>'
                                });
                            }
                            index++;
                        }
                    }
                } else if (that.tabStrip.contentElements.length > 0) {
                    // We need a dummy first tab which should be disabled
                    that.tabStrip.tabGroup.find('.k-link').first().text(that.options.messages.defaultTab);
                } else {
                    tabs.push({
                        text: that.options.messages.defaultTab,
                        content: '<div>Yop</div>'
                    });
                }
                that.tabStrip.append(tabs);
                that.tabStrip.select(that.tabStrip.element.find('ul>li:first-child'));
            },

            /* jshint +W074 */

            /**
             * Update the toolbar
             * @private
             */
            _onTabSelect: function () {
                // debugger;
            },

            /**
             * Toggles between enabled and readonly modes
             * @private
             */
            _editable: function (options) {

            },

            /**
             * Function called by the enabled/disabled bindings
             * @param enable
             */
            enable: function (enable) {
                this._editable({
                    disabled: !(enable = enable === undefined ? true : enable)
                });
            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(this);
            }
        });

        ui.plugin(FormatTabStrip);

    } (window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
