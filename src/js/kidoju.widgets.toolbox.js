/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

;(function (window, $, undefined) {

    'use strict';

    //var fn = Function,
    //    global = fn('return this')(),
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
        DEFAULT_SIZE = 32,

        DEBUG = true,
        MODULE = 'kidoju.widgets.toolbox: ';


    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function log(message) {
        if (DEBUG && window.console && $.isFunction(window.console.log)) {
            window.console.log(MODULE + message);
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
            path: './styles/images/toolbox/',
            tools: kidoju.tools
        },

        /**
         * Widget events
         * @property events
         */
        events: [

        ],

        /**
         * Gets or sets the current tool
         * @param id
         * @returns {value|*|h.value|t.category.value|N.options.value|E.options.value}
         */
        tool: function(id) {
            var that = this;
            if (id) {
                if ($.type(id) !== STRING) {
                    throw new TypeError();
                }
                if (!that.options.tools.hasOwnProperty(id)) {
                    throw new RangeError();
                }
                if (id !== that.options.tool) {
                    that.options.tools.set(ACTIVE_TOOL, id);
                    //the change handler refreshes the widget
                    log('tool changed for ' + id);
                }
            } else {
                return that.options.tools.get(ACTIVE_TOOL);
            }
        },

        /**
         * Resets the toolbox to selection mode
         */
        reset: function() {
            var that = this;
            that.tool(POINTER);
        },

        /**
         * Builds the widget layout
         * @private
         */
        _layout: function () {
            var that = this;
            that._clear();
            $(that.element).addClass(WIDGET_CLASS);
            $.each(that.options.tools, function(index, tool) {
                if (tool instanceof kidoju.Tool && that.options.tools.hasOwnProperty(tool.id)) {
                    //TODO Translate tooltips and consider SVG alternatives
                    var toolElement = $(kendo.format(IMAGE, that.options.path + tool.icon + '.svg', 'TODO: Translate'))
                        .attr(DATA_TOOL, tool.id)
                        .addClass(IMAGE_CLASS)
                        .height(that.options.size)
                        .width(that.options.size);
                    $(that.element).append(toolElement);
                }
            });
            $(that.element).find('img')
                .on(CLICK, function(e) {
                    var id = $(e.target).attr(DATA_TOOL);
                    if ($.type(id) === STRING) {
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
        refresh: function() {
            var that = this;
            $(that.element).find('[' + DATA_SELECTED + ']').removeProp(DATA_SELECTED);
            $(that.element).find('[' + DATA_TOOL + '=' + that.tool() + ']').prop(DATA_SELECTED, true);
        },

        /**
         * Clears the widget
         * @method _clear
         * @private
         */
        _clear: function() {
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

})(this, jQuery);
