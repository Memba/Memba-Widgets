/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function(window, $, undefined) {

    'use strict';

    // shorten references to variables for uglification
    //var fn = Function,
    //    global = fn('return this')(),
    var kendo = window.kendo,
        data = kendo.data,
        Widget = kendo.ui.Widget,

        //Types
        NULL = null,

        //Events
        CHANGE = 'change',

        //Widget
        WIDGET_CLASS = 'k-widget kj-explorer',

        DEBUG = true,
        MODULE = 'kidoju.widgets.designbar: ';

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
     * Designbar widget
     * *class
     * @type {*}
     */
    var Designbar = Widget.extend({

        init: function(element, options) {
            var that = this;
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
            log('widget initialized');
            that._layout();
        },

        options: {
            name: 'Designbar'
        },

        /**
         * Builds the widget layout
         * @private
         */
        _layout: function () {
            var that = this;
            $(that.element).html(that.options.name);
        },

        /**
         * @method _clear
         * @private
         */
        _clear: function() {
            var that = this;
            //unbind kendo
            //kendo.unbind($(that.element));
            //unbind all other events
            $(that.element).find('*').off();
            $(that.element)
                .off()
                .empty()
                .removeClass(WIDGET_CLASS);
        },

        /**
         * Destroys the widget including all DOM modifications
         */
        destroy: function() {
            var that = this;
            Widget.fn.destroy.call(that);
            that._clear();
            //that.setDataSource(NULL);
            kendo.destroy(that.element);
        }

    });

    kendo.ui.plugin(Designbar);

}(this, jQuery));
