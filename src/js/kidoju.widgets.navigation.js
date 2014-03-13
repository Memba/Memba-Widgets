/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        constants = kidoju.constants;


    //TODO: See https://github.com/kendo-labs/kendo-plugins/blob/master/Web/Simple%20Plugin%20Examples/DataSource/kendo.repeater.js
    //See also http://docs.kendoui.com/howto/create-custom-kendo-widget

    /**
     * Navigation widget
     * *class
     * @type {*}
     */
    var Navigation = Widget.extend({

        init: function(element, options) {
            var that = this;
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
            that._layout();
        },

        options: {
            name: 'Navigation',
            autoBind: true
            //dataSource: null
        },

        /**
         *
         * @private
         */
        _dataSource: function() {
            var that = this;
            // returns the datasource OR creates one if using array or configuration object
            that.dataSource = kendo.data.DataSource.create(that.options.dataSource);
            // bind to the change event to refresh the widget
            that.dataSource.bind(constants.CHANGE, function() {
                that.refresh();
            });
            if (that.options.autoBind) {
                that.dataSource.fetch();
            }
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

    ui.plugin(Navigation);

}(jQuery));