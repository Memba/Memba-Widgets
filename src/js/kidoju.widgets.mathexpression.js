/**
 * Copyright (c) 2013-2016 Memba Sarl. All rights reserved.
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
        './vendor/kendo/kendo.userevents',
        './vendor/kendo/kendo.draganddrop'
        // './vendor/kendo/kendo.multiselect' // required because of a test in kendo.binder.js
    ], f);
})(function () {

    'use strict';

    // Load MathJax 2.6 dynamically - see https://docs.mathjax.org/en/v2.6-latest/advanced/dynamic.html
    // See configuration options - see http://mathjax.readthedocs.org/en/latest/configuration.html
    // And combined configuration options - see http://mathjax.readthedocs.org/en/latest/config-files.html
    (function () {
        var TYPE = 'text/x-mathjax-config';
        var head = document.getElementsByTagName('head')[0];
        var scripts = head.getElementsByTagName('script');
        var found = false;
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].type === TYPE) {
                found = true;
                break;
            }
        }
        if (!found) {
            var script = document.createElement('script');
            script.type = TYPE;
            // TODO OPTIMIZE without MathML input
            script[(window.opera ? 'innerHTML' : 'text')] =
                'MathJax.Hub.Config({\n' +
                '  showMathMenu: false,\n' + // Hide contextual menu
                '  asciimath2jax: { delimiters: [["#","#"], ["`","`"]] }\n' +
                '});';
            head.appendChild(script);
            script = document.createElement('script');
            script.type = 'text/javascript';
            // script.src  = 'https://cdn.mathjax.org/mathjax/2.6-latest/unpacked/MathJax.js?config=TeX-AMS-MML_HTMLorMML';
            script.src = 'https://cdn.mathjax.org/mathjax/2.6-latest/MathJax.js?config=TeX-MML-AM_HTMLorMML';
            script.crossorigin = 'anonymous';
            head.appendChild(script);
        }
    })();

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.mathexpression');
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        // var NS = '.kendoDropZone';
        var WIDGET_CLASS = 'kj-mathexpression'; // 'k-widget kj-mathexpression';

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * MathExpression
         * @class MathExpression Widget (kendoDropZone)
         */
        var MathExpression = Widget.extend({

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
                that.bind(CHANGE, $.proxy(that.refresh, that));
                that._layout();
                that.value(that.options.value);
                // see http://www.telerik.com/forums/kendo-notify()
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'MathExpression',
                value: null
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE
            ],

            /**
             * Value for MVVM binding
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === STRING || $.type(value) === NULL) {
                    if (that._value !== value) {
                        that._value = value;
                        that.trigger(CHANGE, { value: that._value });
                    }
                } else if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else {
                    throw new TypeError('`value` is expected to be a string if not undefined');
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
            },

            /**
             * Refresh the widget
             */
            refresh: function () {
                var element = this.element;
                element.text(this.value() || '');
                // If MathJax is not yet loaded it will parse the page anyway
                var MathJax = window.MathJax;
                if (MathJax) {
                    // See http://mathjax.readthedocs.org/en/latest/advanced/typeset.html
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, element[0]]);
                }
                logger.debug('widget refreshed');
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
                // $(that.element).removeClass(WIDGET_CLASS);
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(MathExpression);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
