/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function(f, define){
    'use strict';
    define(['./vendor/kendo.core', './vendor/kendo.data', './kidoju.tools', './kidoju.data', './kidoju.tools'], f);
})(function() {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo,
            Widget = kendo.ui.Widget,
            kidoju = window.kidoju,

        //TYPES
            STRING = 'string',

        //EVENTS
            CLICK = 'click',
            CHANGE = 'change',

        //Miscellaneous
            WIDGET_CLASS = 'k-widget kj-toolbox',
            IMAGE = '<img src="{0}" alt="{1}">',
            IMAGE_CLASS = 'kj-tool',
            DATA_TOOL = 'data-tool',
            DATA_SELECTED = 'data-selected',
            ACTIVE_TOOL = 'active',
            POINTER = 'pointer',
            DEFAULT_SIZE = 32;


        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.widgets.toolbox: ' + message);
            }
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * @class Toolbox Widget (kendoToolbox)
         */
        var Toolbox = Widget.extend({

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
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Toolbox',
                size: DEFAULT_SIZE,
                iconPath: './styles/images/',
                tools: kidoju.tools
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
                    return $(that.element).find('[' + DATA_SELECTED + ']').attr(DATA_TOOL);
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
                $(that.element).addClass(WIDGET_CLASS);
                $.each(that.options.tools, function (index, tool) {
                    if (tool instanceof kidoju.Tool && that.options.tools.hasOwnProperty(tool.id)) {
                        //TODO Translate tooltips and consider SVG alternatives
                        var toolElement = $(kendo.format(IMAGE, that.options.iconPath + tool.icon + '.svg', 'TODO: Translate'))
                            .attr(DATA_TOOL, tool.id)
                            .addClass(IMAGE_CLASS)
                            .height(that.options.size)
                            .width(that.options.size);
                        $(that.element).append(toolElement);
                    }
                });
                $(that.element).find('img')
                    .on(CLICK, function (e) {
                        var id = $(e.target).attr(DATA_TOOL);
                        that.trigger(CLICK, {value: id});
                        if ($.type(id) === STRING && that.options.tools.hasOwnProperty(id)) {
                            that.tool(id);
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
                $(that.element).find('[' + DATA_SELECTED + ']').removeAttr(DATA_SELECTED);
                $(that.element).find('[' + DATA_TOOL + '=' + that.options.tools.get(ACTIVE_TOOL) + ']').attr(DATA_SELECTED, true);
                //TODO: add/remove k-state-selected class
            },

            /**
             * Clears the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                //unbind kendo
                //kendo.unbind($(that.element));
                //unbind all other events
                $(that.element).find('*').off();
                $(that.element).off();
                //remove descendants
                $(that.element).empty();
                //remove element classes
                $(that.element).removeClass(WIDGET_CLASS);
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

        kendo.ui.plugin(Toolbox);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function(_, f){ 'use strict'; f(); });
