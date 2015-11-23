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
        './vendor/kendo/kendo.binder',
        './kidoju.data',
        './kidoju.tools'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var kidoju = window.kidoju;
        var tools = kidoju.tools;
        var Tool = kidoju.Tool;
        // var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.toolbox');
        var STRING = 'string';
        var CLICK = 'click';
        var CHANGE = 'change';
        var NS = '.kendoToolbox';
        var WIDGET_CLASS = 'k-widget k-toolbar kj-toolbox';
        var BUTTON = '<a href="#" class="k-button kj-tool" title="{1}"><img src="{0}" alt="{1}"></a>';
        var SELECTED_CLASS = 'k-state-selected';
        var DISABLED_CLASS = 'k-state-disabled';
        var ROLE = 'role';
        var MENU = 'menu';
        var MENUITEM = 'menuitem';
        var TOOL = 'tool';
        var ACTIVE_TOOL = 'active';
        var POINTER = 'pointer';
        var DEFAULT_EXTENSION = '.svg';
        var DEFAULT_PATH = './styles/images/';
        var DEFAULT_SIZE = 32;

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
                logger.debug('widget initialized');
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
                        that.options.tools.set(ACTIVE_TOOL, id);// the change handler refreshes the widget
                        logger.debug('tool changed for `' + id + '`');
                        that.trigger(CHANGE, { value: id });
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
                    .addClass(WIDGET_CLASS)
                    .attr(ROLE, MENU);
                $.each(that.options.tools, function (index, tool) {
                    if (tool instanceof Tool && that.options.tools.hasOwnProperty(tool.id)) {
                        var button = $(kendo.format(BUTTON, that.options.iconPath + tool.icon + that.options.extension, tool.id))
                            .attr(kendo.attr(TOOL), tool.id)
                            .attr(ROLE, MENUITEM)
                            .css({ lineHeight: 'normal', margin: Math.round(that.options.size / 16) + 'px' });
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
            enable: function (enable) {
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

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
