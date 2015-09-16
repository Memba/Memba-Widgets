/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define){
    'use strict';
    define(['./vendor/kendo/kendo.binder', './kidoju.data', './kidoju.tools'], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo,
            Widget = kendo.ui.Widget,
            kidoju = window.kidoju,
            tools = kidoju.tools,
            Tool = kidoju.Tool,

        // TYPES
            STRING = 'string',

        // EVENTS
            CLICK = 'click',
            CHANGE = 'change',
            NS = '.kendoToolbox',

        // Miscellaneous
            WIDGET_CLASS = 'k-widget k-toolbar',
            BUTTON = '<a href="#" class="k-button" title="{1}"><img src="{0}" alt="{1}"></a>',
            SELECTED_CLASS = 'k-state-selected',
            DISABLED_CLASS = 'k-state-disabled',
            TOOL = 'tool',
            ACTIVE_TOOL = 'active',
            POINTER = 'pointer',
            DEFAULT_EXTENSION = '.svg',
            DEFAULT_PATH = './styles/images/',
            DEFAULT_SIZE = 32;


        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.widgets.toolbox: ' + message);
            }
        }

        /**
         * Asserts
         * Note: Use asserts where unmet conditions are independent from user entries, and
         * developers should be warned that there is probably something unexpected in their code
         */
        var assert = $.extend(
            // By extending assert, we ensure we can call both assert() and assert.ok() for the same result (like in nodeJS)
            function(test, message) {
                if (!test) { throw new Error(message); }
            },
            {
                enum: function(array, value, message) { if (array.indexOf(value) === -1) { throw new Error(message); } },
                equal: function(expected, actual, message) { if (expected !== actual) { throw new Error(message); } },
                instanceof: function(Class, value, message) { if (!(value instanceof Class)) { throw new Error(message); } },
                isOptionalObject: function(value, message) { if ($.type(value) !== 'undefined' && (!$.isPlainObject(value) || $.isEmptyObject(value))) { throw new Error(message); } },
                isPlainObject: function(value, message) { if (!$.isPlainObject(value) || $.isEmptyObject(value)) { throw new Error(message); } },
                isUndefined: function(value, message) { if ($.type(value) !== 'undefined') { throw new Error(message); } },
                match: function(rx, value, message) { if ($.type(value) !== STRING || !rx.test(value)) { throw new Error(message); } },
                ok: function(test, message) { return assert(test, message); },
                type: function(type, value, message) { if ($.type(value) !== type) { throw new TypeError(message); } }
            },
            {
                messages: {
                    isPlainObject: {
                    },
                    isUndefined: {
                    },
                    match: {
                    }
                }
            }
        );

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * @class ToolBox Widget (kendoToolBox)
         */
        var ToolBox = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                log('widget initialized');
                that._layout();
                that.enable(that.options.enable);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'ToolBox',
                enable: true,
                size: DEFAULT_SIZE,
                iconPath: DEFAULT_PATH,
                extension: DEFAULT_EXTENSION,
                tools: tools
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CLICK,
                CHANGE
            ],

            /**
             * Gets or sets the current tool
             * @param id
             * @returns {value|*|h.value|t.category.value|N.options.value|E.options.value}
             */
            tool: function (id) {
                var that = this;
                if (id !== undefined) {
                    if ($.type(id) !== STRING) {
                        throw new TypeError('A tool id should be a string');
                    }
                    if (!that.options.tools.hasOwnProperty(id)) {
                        throw new RangeError(kendo.format('{0} is not the id of a known tool', id));
                    }
                    if (id !== that.options.tools.get(ACTIVE_TOOL)) {
                        that.options.tools.set(ACTIVE_TOOL, id);//the change handler refreshes the widget
                        log('tool changed for ' + id);
                        that.trigger(CHANGE, {value: id});
                    }
                } else {
                    return that.element.find('.' + SELECTED_CLASS).attr(kendo.attr(TOOL));
                }
            },

            /**
             * Resets the toolbox to selection mode
             */
            reset: function () {
                this.tool(POINTER);
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element
                    .addClass(WIDGET_CLASS);
                $.each(that.options.tools, function (index, tool) {
                    if (tool instanceof Tool && that.options.tools.hasOwnProperty(tool.id)) {
                        var button = $(kendo.format(BUTTON, that.options.iconPath + tool.icon + that.options.extension, tool.id))
                            .attr(kendo.attr(TOOL), tool.id)
                            .css({ lineHeight: 'normal', margin: Math.round(that.options.size/16) + 'px' });
                        button.find('img')
                            .height(that.options.size)
                            .width(that.options.size);
                        that.element.append(button);
                    }
                });
                that.refresh();
                if ($.isFunction(that._refreshHandler)) {
                    that.options.tools.unbind(CHANGE, that._refreshHandler);
                }
                that._refreshHandler = $.proxy(that.refresh, that);
                that.options.tools.bind(CHANGE, that._refreshHandler);
            },

            /**
             * Refreshes the widget
             * @method refresh
             */
            refresh: function () {
                var that = this;
                that.element.find('.' + SELECTED_CLASS).removeClass(SELECTED_CLASS);
                that.element.find('[' + kendo.attr(TOOL) + '=' + that.options.tools.get(ACTIVE_TOOL) + ']').addClass(SELECTED_CLASS);
            },

            /**
             * Enables/disables the widget
             * @param enable
             */
            enable: function(enable) {
                var that = this;
                this.options.enable = enable = !!enable;
                if (enable) {
                    that.element
                        .removeClass(DISABLED_CLASS)
                        .on(CLICK + NS, 'a', function (e) {
                            e.preventDefault();
                            var id = $(e.currentTarget).attr(kendo.attr(TOOL));
                            that.trigger(CLICK, { value: id });
                            if ($.type(id) === STRING && that.options.tools.hasOwnProperty(id)) {
                                that.tool(id);
                            }
                        });
                } else {
                    that.tool(POINTER);
                    that.element
                        .addClass(DISABLED_CLASS)
                        .off(CLICK + NS);
                }
            },

            /**
             * Clears the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                kendo.unbind(that.element);
                // unbind all other events
                that.element.find('*').off(NS);
                that.element.off(NS);
                // remove descendants
                that.element.empty();
                // remove element classes
                that.element.removeClass(WIDGET_CLASS);
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                if ($.isFunction(that._refreshHandler)) {
                    that.options.tools.unbind(CHANGE, that._refreshHandler);
                }
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(ToolBox);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f){ 'use strict'; f(); });
