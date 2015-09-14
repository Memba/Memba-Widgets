/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define){
    'use strict';
    define([
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.multiselect' // required becasue of test in kendo.binder.js
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo,
            Widget = kendo.ui.Widget,
            STRING = 'string',
            UNDEFINED = 'undefined',
            CHANGE = 'change',
            JS_COMMENT = '// ',
            NS = '.kendoCodeInput',
            WIDGET_CLASS = 'k-widget kj-codeinput';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.widgets.codeinput: ' + message);
            }
        }

        /**
         * Asserts
         * Note: Use asserts where unmet conditions are independent from user entries, and
         * developers should be warned that there is probably something unexpected in their code
         */
        var assert = $.extend(
            // By extending assert, we ensure we can call both assert() and assert.ok() for the same result (like in nodeJS)
            function(test, message) {
                if (!test) { throw new Error(message); }
            },
            {
                enum: function(array, value, message) { if (array.indexOf(value) === -1) { throw new Error(message); } },
                equal: function(expected, actual, message) { if (expected !== actual) { throw new Error(message); } },
                instanceof: function(Class, value, message) { if (!(value instanceof Class)) { throw new Error(message); } },
                isOptionalObject: function(value, message) { if ($.type(value) !== UNDEFINED && (!$.isPlainObject(value) || $.isEmptyObject(value))) { throw new Error(message); } },
                isPlainObject: function(value, message) { if (!$.isPlainObject(value) || $.isEmptyObject(value)) { throw new Error(message); } },
                isUndefined: function(value, message) { if ($.type(value) !== UNDEFINED) { throw new Error(message); } },
                match: function(rx, value, message) { if ($.type(value) !== STRING || !rx.test(value)) { throw new Error(message); } },
                ok: function(test, message) { return assert(test, message); },
                type: function(type, value, message) { if ($.type(value) !== type) { throw new TypeError(message); } }
            },
            {
                messages: {
                    isPlainObject: {
                    },
                    isUndefined: {
                    },
                    match: {
                    }
                }
            }
        );

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * @class CodeInput Widget (kendoCodeInput)
         */
        var CodeInput = Widget.extend({

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
                that._dataSource();
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'CodeInput',
                autoBind: true,
                //dataSource
                custom: 'custom',
                default: 'equal',
                solution: ''
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
             * Returns either a JS function as a string or a library formula name
             * @param value
             */
            value: function(value) {
                var that = this;
                if ($.type(value) === STRING) {
                    that._value = value;
                    that._toggle(that._value);
                } else if ($.type(value) === UNDEFINED) {
                    return JS_COMMENT + that._value;
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
                that.input = $('<input class="k-textbox k-state-disabled" disabled>')
                    .width('100%')
                    .val(that.options.custom)
                    .appendTo(that.element);
                that.dropDownList = $('<input>')
                    .width('100%')
                    .appendTo(that.element)
                    .kendoDropDownList({
                        autoBind: that.options.autoBind,
                        change: $.proxy(that._onDropDownListChange, that), // change is not triggered by dropDownList api calls incl. value(), text(), ...
                        dataTextField: "name",
                        dataValueField: "formula",
                        dataSource: that.options.dataSource
                    })
                    .data('kendoDropDownList');
            },

            /**
             * Event handler triggered when changing the value of the drop down list in the header
             * @private
             */
            _onDropDownListChange: function() {
                if (this.dropDownList instanceof kendo.ui.DropDownList && this.input instanceof $) {
                    this._value = this.dropDownList.text();
                    this.trigger(CHANGE, { value: this._value });
                }
            },

            /**
             * Toggle UI for custom vs library code
             * @private
             */
            _toggle: function(value) {
                var that = this;
                if ($.type(value) === STRING && that.dropDownList instanceof kendo.ui.DropDownList && that.input instanceof $) {
                    var libraryMatches = value.match(/^\/\/ ([^\n]+)$/),
                        customMatches = value.match(/^function validate\(value, solution\) {[\s\S]+}$/);
                    if ($.isArray(libraryMatches) && libraryMatches.length === 2) {
                        // Find in the code library
                        var found = that.dropDownList.dataSource.data().filter(function(item) {
                            return item.name === libraryMatches[1];
                        });
                        found = $.isArray(found) && found.length ? libraryMatches[1] : that.options.default;
                        that.dropDownList.text(found);
                        that.dropDownList.wrapper.show();
                        that.input.hide();
                    } else if ($.isArray(customMatches) && customMatches.length === 1) {
                        that.dropDownList.wrapper.hide();
                        that.input.show();
                    } else {
                        that.dropDownList.text(that.options.default);
                        that.dropDownList.wrapper.show();
                        that.input.hide();
                    }
                }
            },

            /**
             * _dataSource function to bind refresh to the change event
             * @private
             */
            _dataSource: function() {
                var that = this,
                    dropDownList = that.dropDownList;
                if (dropDownList instanceof kendo.ui.DropDownList && dropDownList.dataSource instanceof kendo.data.DataSource) {
                    // MVVM bindings require that.dataSource
                    that.dataSource = that.dropDownList.dataSource;
                    if (that._refreshHandler) {
                        that.dataSource.unbind(CHANGE, that._refreshHandler);
                    }
                    that._refreshHandler = $.proxy(that.refresh, that);
                    that.dataSource.bind(CHANGE, that._refreshHandler);
                }
            },

            /**
             * sets the dataSource for source binding
             * @param dataSource
             */
            setDataSource: function(dataSource) {
                var that = this,
                    dropDownList = that.dropDownList;
                if (dropDownList instanceof kendo.ui.DropDownList && dropDownList.dataSource !== dataSource ) {
                    dropDownList.setDataSource(dataSource);
                    that._dataSource();
                }
            },

            /**
             * Refresh
             * @param e
             */
            refresh: function(e) {
                this.dropDownList.refresh(e);
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

        kendo.ui.plugin(CodeInput);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f){ 'use strict'; f(); });
