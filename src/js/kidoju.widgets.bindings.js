/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define(['./vendor/kendo/kendo.binder'], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo,
            data = kendo.data,
            binders = data.binders,
            Binder = data.Binder,
            ui = kendo.ui,

        // Types
            STRING = 'string',
            NUMBER = 'number',

        // Events
            CHANGE = 'change';

        // For more information, see http://docs.telerik.com/kendo-ui/framework/mvvm/bindings/custom

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.widgets.bindings: ' + message);
            }
        }

        function isGuid(value) {
            // http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
            return ($.type(value) === STRING) && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value));
        }

        /*********************************************************************************
         * Bindings
         *********************************************************************************/

        /**
         * Enable binding the index value of a Playbar widget
         * @type {*|void}
         */
        /*
         binders.widget.index = Binder.extend({
         init: function (widget, bindings, options) {
         Binder.fn.init.call(this, widget.element[0], bindings, options);
         this.widget = widget;
         this._change = $.proxy(this.change, this);
         this.widget.bind(CHANGE, this._change);
         },
         change: function () {
         this.bindings.index.set(this.widget.index());
         },
         refresh: function () {
         var index = this.bindings.index.get();
         if ($.type(index) === NUMBER) { // && index >= 0) {
         this.widget.index(index);
         }
         },
         destroy: function () {
         this.widget.unbind(CHANGE, this._change);
         }
         });
         */

        /**
         * Enable binding the id value of a Playbar widget
         * @type {*|void}
         */
        /*
         binders.widget.id = Binder.extend({
         init: function (widget, bindings, options) {
         Binder.fn.init.call(this, widget.element[0], bindings, options);
         this.widget = widget;
         this._change = $.proxy(this.change, this);
         this.widget.bind(CHANGE, this._change);
         },
         change: function () {
         this.bindings.id.set(this.widget.id());
         },
         refresh: function () {
         var id = this.bindings.id.get();
         if (isGuid(id)) {
         this.widget.id(id);
         }
         },
         destroy: function () {
         this.widget.unbind(CHANGE, this._change);
         }
         });
         */

        /**
         * Enable binding the selection value of a Playbar widget
         * @type {*|void}
         */
        /*
         binders.widget.selection = Binder.extend({
         init: function (widget, bindings, options) {
         Binder.fn.init.call(this, widget.element[0], bindings, options);
         this.widget = widget;
         this._change = $.proxy(this.change, this);
         this.widget.bind(CHANGE, this._change);
         },
         change: function () {
         this.bindings.selection.set(this.widget.selection());
         },
         refresh: function () {
         this.widget.selection(this.bindings.selection.get());
         },
         destroy: function () {
         this.widget.unbind(CHANGE, this._change);
         }
         });
         */

        /**
         * Enable binding the properties value of a Page widget
         * @type {*|void}
         */
        binders.widget.properties = Binder.extend({
            init: function (widget, bindings, options) {
                Binder.fn.init.call(this, widget.element[0], bindings, options);
                this.widget = widget;
                this._change = $.proxy(this.change, this);
                this.widget.bind(CHANGE, this._change);
            },
            change: function () {
                this.bindings.properties.set(this.widget.properties());
            },
            refresh: function () {
                this.widget.properties(this.bindings.properties.get());
            },
            destroy: function () {
                this.widget.unbind(CHANGE, this._change);
            }
        });


    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
