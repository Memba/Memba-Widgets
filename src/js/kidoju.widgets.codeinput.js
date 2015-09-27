/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.multiselect', // required because of a test in kendo.binder.js
        './window.assert',
        './window.log'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        // var assert = window.assert;
        var logger = new window.Log('kidoju.widgets.codeeditor');
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var JS_COMMENT = '// ';
        // var NS = '.kendoCodeInput';
        // var WIDGET_CLASS = 'k-widget kj-codeinput';

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
                logger.debug('widget initialized');
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
                // dataSource
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
            value: function (value) {
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
                        dataTextField: 'name',
                        dataValueField: 'formula',
                        dataSource: that.options.dataSource
                    })
                    .data('kendoDropDownList');
            },

            /**
             * Event handler triggered when changing the value of the drop down list in the header
             * @private
             */
            _onDropDownListChange: function () {
                if (this.dropDownList instanceof kendo.ui.DropDownList && this.input instanceof $) {
                    this._value = this.dropDownList.text();
                    this.trigger(CHANGE, { value: this._value });
                }
            },

            /**
             * Toggle UI for custom vs library code
             * @private
             */
            _toggle: function (value) {
                var that = this;
                if ($.type(value) === STRING && that.dropDownList instanceof kendo.ui.DropDownList && that.input instanceof $) {
                    var libraryMatches = value.match(/^\/\/ ([^\n]+)$/);
                    // var customMatches = value.match(/^function validate\(value, solution\) {[\s\S]+}$/);
                    var customMatches = value.match(/^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/);
                    if ($.isArray(libraryMatches) && libraryMatches.length === 2) {
                        // Find in the code library
                        var found = that.dropDownList.dataSource.data().filter(function (item) {
                            return item.name === libraryMatches[1];
                        });
                        found = $.isArray(found) && found.length ? libraryMatches[1] : that.options.default;
                        that.dropDownList.text(found);
                        that.dropDownList.wrapper.show();
                        that.input.hide();
                    } else if ($.isArray(customMatches) && customMatches.length === 2) {
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
            _dataSource: function () {
                var that = this;
                var dropDownList = that.dropDownList;
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
            setDataSource: function (dataSource) {
                var that = this;
                var dropDownList = that.dropDownList;
                if (dropDownList instanceof kendo.ui.DropDownList && dropDownList.dataSource !== dataSource) {
                    dropDownList.setDataSource(dataSource);
                    that._dataSource();
                }
            },

            /**
             * Refresh
             * @param e
             */
            refresh: function (e) {
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

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
