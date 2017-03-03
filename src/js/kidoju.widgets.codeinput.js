/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
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
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.multiselect' // required because of a test in kendo.binder.js
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
        var LIB_PARAM = ' ({0})';
        var NS = '.kendoCodeInput';
        var WIDGET_CLASS = /*'k-widget*/ 'kj-codeinput';
        var RX_LIBRARY = /^\/\/ ([^\(\n]+)( \([^\n]*\))?$/;
        var RX_CUSTOM = /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/;

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
                // kendo.notify(that);
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
            _initValue: function () { // Consider setOptions
                var options = this.options;
                if ($.type(options.value) === STRING && RX_CUSTOM.test(options.value)) {
                    this.value(options.value);
                } else if ($.type(options.value) === STRING && RX_LIBRARY.test(options.value)) {
                    this.value(options.value);
                } else if (this.dataSource && this.dataSource.total()) {
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
                    that._toggleUI(value);
                } else if ($.type(value) === UNDEFINED) {
                    // if ($.type(that._value) !== STRING || !that._value.length) {
                    //    return undefined;
                    // } else {
                        return that._value;
                    // }
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
                var matches = value.match(RX_CUSTOM);
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
                var matches = value.match(RX_LIBRARY);
                if ($.isArray(matches) && matches.length === 3) {
                    var ret = {};
                    var temp = matches[2];
                    var found = this.dataSource.data().find(function (item) {
                        return item[options.nameField] === matches[1];
                    });
                    if (found) {
                        ret.item = found;
                    }
                    if ($.type(temp) === STRING && temp.length > 2) {
                        // remove ` (` at the beginning and ')' at the end
                        ret.paramValue = temp.substr(2, temp.length - 3)
                    }
                    return ret;
                }
            },

            /**
             * Toggle UI for custom vs library code
             * @private
             */
            _toggleUI: function (value) {
                assert.type(STRING, value, kendo.format(assert.messages.type.default, value, STRING));
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                var that = this;
                var options = that.options;
                if (that._isCustom(value)) {
                    // If value is in the form `function validate(value, solution[, all]) { ... }`, it is custom
                    that._value = value;
                    that.dropDownList.text('');
                    that.dropDownList.wrapper.hide();
                    that.input.show();
                } else {
                    // Otherwise, search the library
                    var parsed = that._parseLibraryValue(value);
                    if ($.type(parsed.item) === UNDEFINED) {
                        // and use default if not found
                        parsed.item = that._parseLibraryValue(LIB_COMMENT + options.default);
                        assert.type(OBJECT, parsed.item, '`this.options.default` is expected to exist in the library');
                    }
                    var name = parsed.item[options.nameField];
                    var paramName = parsed.item[options.paramField];
                    var paramValue = parsed.paramValue;
                    that._value = LIB_COMMENT + name + (paramName ? kendo.format(LIB_PARAM, paramValue) : '');
                    that.input.hide();
                    that.dropDownList.wrapper.show();
                    that.dropDownList.text(name);
                    if ($.type(paramName) === STRING && paramName.length) {
                        that.textBox
                            .attr('placeholder', paramName)
                            .val(paramValue)
                            .show();
                    } else {
                        that.textBox
                            .removeAttr('placeholder')
                            .val('')
                            .hide();
                    }
                }
                that.trigger(CHANGE, { value: that.value() });
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
                that.input = $('<input class="k-textbox k-state-disabled" disabled>')
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
                        change: $.proxy(that._onDropDownListChange, that), // change is not triggered by dropDownList api calls incl. value(), text(), ...
                        dataTextField: options.nameField,
                        dataValueField: options.formulaField,
                        dataSource: options.dataSource
                    })
                    .data('kendoDropDownList');
                that.dropDownList.bind('dataBound', $.proxy(that._initValue, that));
                // Param textbox
                that.textBox = $('<input class="k-textbox">')
                    .css({ marginTop: '0.25em'})
                    .width('100%')
                    .hide()
                    .appendTo(that.element)
                    .on(CHANGE + NS, function (e) {
                        var dataItem = that.dropDownList.dataItem();
                        var name = dataItem.name;
                        var paramName = dataItem.param;
                        var paramValue = that.textBox.val();
                        that._value = LIB_COMMENT + name + (paramName ? kendo.format(LIB_PARAM, paramValue) : '');
                        that.trigger(CHANGE, { value: that.value() });
                    });
            },

            /**
             * Event handler triggered when changing the value of the drop down list in the header
             * @private
             */
            _onDropDownListChange: function () {
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));
                var that = this;
                var options = that.options;
                var dataItem = that.dropDownList.dataItem();
                var name = dataItem[options.nameField];
                var paramName = dataItem[options.paramField];
                var paramValue = '';
                that.value(LIB_COMMENT + name + (paramName ? kendo.format(LIB_PARAM, paramValue) : ''));
            },

            /**
             * _dataSource function to bind refresh to the change event
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
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                Widget.fn.destroy.call(that);
                that.textBox.off(NS);
                element.removeClass(WIDGET_CLASS);
                kendo.destroy(element);
            }
        });

        kendo.ui.plugin(CodeInput);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
