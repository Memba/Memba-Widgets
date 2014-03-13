/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        data = kendo.data,
        Widget = kendo.ui.Widget,

        DEBUG = true,
        MODULE = 'kidoju.widgets.explorer: ';

    /**
     * Explorer widget
     * *class
     * @type {*}
     */
    var Explorer = Widget.extend({

        init: function(element, options) {
            var that = this;
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'widget initialized');
            }
            that._layout();
        },

        options: {
            name: 'Explorer'
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
         * Destroys the widget including all DOM modifications
         */
        destroy: function() {
        }

    });

    kendo.ui.plugin(Explorer);

}(jQuery));