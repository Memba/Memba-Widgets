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
            STRING = 'string',
            WIDGET_CLASS = 'k-widget kj-assetmanager';

            // EVENTS
            // CLICK = 'click',
            // CHANGE = 'change';


        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.widgets.assetmanager: ' + message);
            }
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * @class AssetManager Widget (kendoAssetManager)
         */
        var AssetManager = Widget.extend({

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
                name: 'AssetManager'
            },

            /**
             * Widget events
             * @property events
             */
            //events: [
            //    CHANGE
            //],

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                that.element.text('bla bla');
            },

            /**
             * Clears the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                // kendo.unbind($(that.element));
                // unbind all other events
                $(that.element).find('*').off();
                $(that.element).off();
                // remove descendants
                $(that.element).empty();
                // remove element classes
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
                // if ($.isFunction(that._refreshHandler)) {
                //    that.options.tools.unbind(CHANGE, that._refreshHandler);
                // }
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(AssetManager);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f){ 'use strict'; f(); });
