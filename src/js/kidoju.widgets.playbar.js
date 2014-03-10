//Copyright ©2013-2014 Memba® Sarl. All rights reserved.
/*jslint browser:true*/
/*jshint browser:true*/

(function($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        Widget = kendo.ui.Widget;

    /**
     * Toolbar widget
     * @class Playbar
     * @type {*}
     */
    var Playbar = Widget.extend({

        /**
         * Widget constructor
         * @method init
         * @param element
         * @param options
         */
        init: function(element, options) {
            var that = this;
            // base call to widget initialization
            Widget.fn.init.call(that, element, options);
            that._layout();
        },

        /**
         * @property options
         */
        options: {
            name: 'Playbar'
        },

        /**
         * Builds the widget layout
         * @method _layout
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
        },

        /**
         * Destroys the widget including all DOM modifications
         */
        destroy: function() {
            var that = this;
            that._clear();
            Widget.fn.destroy.call(that);
        }

    });

    ui.plugin(Playbar);

}(jQuery));