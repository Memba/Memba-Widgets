/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './common/window.assert.es6',
        './common/window.logger.es6',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.popup', // Otherwise SystemJS cannot load it properly
        './vendor/kendo/kendo.dropdownlist'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var DropDownList = kendo.ui.DropDownList;
        var DataSource = kendo.data.DataSource;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.codeinput');
        var OBJECT = 'object';
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var LIB_COMMENT = '// ';
        var NS = '.kendoCodeInput';
        var WIDGET_CLASS = /*'k-widget*/ 'kj-codeinput';
        var STATE_DISABLED = 'k-state-disabled';
        var RX_VALIDATION_LIBRARY = /^\/\/ ([^\s\[\n]+)( (\[[^\n]+\]))?$/;
        var RX_VALIDATION_CUSTOM = /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/;

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * CodeInput
         * Displays as a drop down list when value is // xxxxx refering to a library formula
         * Displays as an readonly input containing the word "custom" when value is a validate custom function
         * IMPORTANT: this is not the value that is displayed: it is either `custom` or value stripped of `// `
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
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._layout();
                that._dataSource();
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'CodeInput',
                autoBind: true,
                dataSource: [],
                custom: 'custom',
                default: '// equal',
                nameField: 'name',
                formulaField: 'formula',
                paramField: 'param',
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
             * Init value
             * @private
             */
            _initValue: function () { // Consider making it setOptions(options)
                var options = this.options;
                if ($.type(options.value) === STRING && RX_VALIDATION_CUSTOM.test(options.value)) {
                    this.value(options.value);
                } else if ($.type(options.value) === STRING && RX_VALIDATION_LIBRARY.test(options.value)) {
                    this.value(options.value);
                } else if (this.dataSource instanceof DataSource && this.dataSource.total()) {
                    this.value(options.default);
                }
            },

            /**
             * Value for MVVM binding
             * Returns either a JS function as a string or a library formula name prefixed as a Javascript comment
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === STRING) {
                    if (that._value !== value) {
                        that._value = value;
                        that.refresh();
                    }
                } else if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else {
                    throw new TypeError('`value` is expected to be a string if not undefined');
                }
            },

            /**
             * Check that value refers to a custom function not in the code library
             * @param value
             * @returns {*}
             * @private
             */
            _isCustom: function (value) {
                assert.type(STRING, value, kendo.format(assert.messages.type.default, value, STRING));
                var matches = value.match(RX_VALIDATION_CUSTOM);
                if ($.isArray(matches) && matches.length === 2) {
                    return value;
                }
            },

            /**
             * Returns the library item from the code input widget value (that is `// <name> (<paramValue>)`)
             * @param value
             * @returns {*}
             * @private
             */
            _parseLibraryValue: function (value) {
                assert.type(STRING, value, kendo.format(assert.messages.type.default, value, STRING));
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                assert.instanceof(DataSource, this.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                assert.equal(this.dropDownList.dataSource, this.dataSource, 'this.dropDownList.dataSource and this.dataSource are expected to be the same');
                var options = this.options;
                var ret = {};
                var libraryMatches = value.match(RX_VALIDATION_LIBRARY);
                if ($.isArray(libraryMatches) && libraryMatches.length === 4) {
                    var paramValue = libraryMatches[3];
                    // Array.find is not available in Internet Explorer, thus the use of Array.filter
                    var found = this.dataSource.data().filter(function (item) {
                        return item[options.nameField] === libraryMatches[1];
                    });
                    if ($.isArray(found) && found.length) {
                        ret.item = found[0];
                    }
                    if (ret.item && $.type(ret.item.param) === STRING && $.type(paramValue) === STRING && paramValue.length > '[]'.length) {
                        ret.paramValue = JSON.parse(paramValue)[0];
                    }
                }
                return ret;
            },

            /**
             * Toggle UI for custom vs library code
             * @private
             */
            refresh: function () {
                assert.instanceof($, this.customInput, kendo.format(assert.messages.instanceof.default, 'this.customInput', 'jQuery'));
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                assert.instanceof($, this.paramInput, kendo.format(assert.messages.instanceof.default, 'this.paramInput', 'jQuery'));

                var that = this;
                var options = that.options;

                if (that._isCustom(that._value)) {

                    // If value is in the form `function validate(value, solution[, all]) { ... }`, it is custom
                    that.dropDownList.text('');
                    that.dropDownList.wrapper.hide();
                    that.customInput.show();

                } else {

                    // Otherwise, search the library
                    var parsed = that._parseLibraryValue(that._value);
                    if ($.type(parsed.item) === UNDEFINED) {
                        // and use default if not found
                        parsed = that._parseLibraryValue(options.default);
                        assert.type(OBJECT, parsed.item, '`this.options.default` is expected to exist in the library');
                    }

                    var name = parsed.item[options.nameField];
                    var paramName = parsed.item[options.paramField];
                    var paramValue = parsed.paramValue;

                    // Reset value in case the original value could not be found and we had to fallback to default
                    that._value = LIB_COMMENT + name + (paramName ? ' ' + JSON.stringify([paramValue]) : '');

                    that.customInput.hide();
                    that.dropDownList.wrapper.show();
                    that.dropDownList.text(name);

                    if ($.type(paramName) === STRING && paramName.length) {
                        that.paramInput
                            .attr('placeholder', paramName)
                            .val(paramValue)
                            .show();
                    } else {
                        that.paramInput
                            .removeAttr('placeholder')
                            .val('')
                            .hide();
                    }
                }

                logger.debug({ method: 'refresh', message: 'widget refreshed' });
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                var options = that.options;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);

                // Static input showing `Custom`
                that.customInput = $('<input class="k-textbox k-state-disabled" disabled>')
                    .width('100%')
                    .val(options.custom)
                    .appendTo(that.element);

                // Drop down list to choose from library
                that.dropDownList = $('<select/>')
                    .width('100%')
                    .appendTo(that.element)
                    .kendoDropDownList({
                        autoBind: options.autoBind,
                        autoWidth: true,
                        change: $.proxy(that._onUserInputChange, that),
                        dataBound: $.proxy(that._initValue, that),
                        dataTextField: options.nameField,
                        dataValueField: options.formulaField,
                        dataSource: options.dataSource
                    })
                    .data('kendoDropDownList');

                // Param textbox
                that.paramInput = $('<input class="k-textbox">')
                    .css({ marginTop: '0.25em' })
                    .width('100%')
                    .hide()
                    .appendTo(that.element)
                    .on(CHANGE + NS, $.proxy(that._onUserInputChange, that));
            },

            /**
             * Event handler executed when changing the value of the drop down list in the header or the value of validation param
             * @private
             */
            _onUserInputChange: function () {
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                var that = this;
                var options = that.options;
                var dataItem = that.dropDownList.dataItem();
                if (dataItem) {
                    var name = dataItem[options.nameField];
                    var formula = dataItem[options.formulaField];
                    var paramName = dataItem[options.paramField];
                    var paramValue = that.paramInput.val();
                    if (name === options.custom) {
                        that.value(formula);
                    } else {
                        // Note: We use an array to pass to kendo.format.apply in order to build the formula
                        that.value(LIB_COMMENT + name + (paramName ? ' ' + JSON.stringify([paramValue]) : ''));
                    }
                    that.trigger(CHANGE);
                }
            },

            /**
             * _dataSource function to pass the dataSource to the dropDownList
             * @private
             */
            _dataSource: function () {
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                var that = this;

                // returns the datasource OR creates one if using array or configuration
                that.dataSource = kendo.data.DataSource.create(that.options.dataSource);

                // Pass dataSource to dropDownList
                that.dropDownList.setDataSource(that.dataSource);
            },

            /**
             * sets the dataSource for source binding
             * @param dataSource
             */
            setDataSource: function (dataSource) {
                var that = this;
                // set the internal datasource equal to the one passed in by MVVM
                that.options.dataSource = dataSource;
                // rebuild the datasource if necessary, or just reassign
                that._dataSource();
            },

            /**
             * Enable
             */
            enable: function (enabled) {
                enabled = !!enabled;
                this.dropDownList.enable(enabled);
                this.paramInput.toggleClass(STATE_DISABLED, !enabled);
            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                if (that.paramInput instanceof $) {
                    that.paramInput.off(NS);
                }
                kendo.unbind(wrapper);
                // Release references;
                that.dataSource = undefined;
                that.dropDownList = undefined;
                that.customInput = undefined;
                that.paramInput = undefined;
                // Destroy kendo;
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }
        });

        kendo.ui.plugin(CodeInput);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
