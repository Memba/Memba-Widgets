//Copyright ©2013-2014 Memba® Sarl. All rights reserved.
/*jslint browser:true*/
/*jshint browser:true*/

(function($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget

    /**
     * Toolbar widget
     * *class
     * @type {*}
     */
    var Toolbar = Widget.extend({

        init: function(element, options) {
            var that = this;
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
            that._layout();
        },

        options: {
            name: 'Toolbar'
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

    ui.plugin(Toolbar);

}(jQuery));