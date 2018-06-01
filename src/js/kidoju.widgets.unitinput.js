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
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.numerictextbox'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.unitinput');
        var NUMBER = 'number';
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        // var NS = '.kendoUnitInput';
        var CHANGE = 'change';
        var WIDGET_CLASS = 'kj-unitinput';
        var RX_UNIT = /^([\d\.,]*)\s*([^\d\.,]+)$/;

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /*******************************************************************************************
         * UnitInput
         *******************************************************************************************/

        /**
         * UnitInput (kendoUnitInput)
         * @class UnitInput
         * @extend Widget
         */
        var UnitInput = Widget.extend({

            /**
             * Initializes the widget
             * @method init
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._layout();
                that.enable(that.element.prop('disabled') ? false : that.options.enable);
                that.value(that.options.value);
                kendo.notify(that);
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE // Changing the rating value by clicking a star raises the change event
            ],

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'UnitInput',
                default: 0,
                decimals: 0,
                enable: true,
                format: 'n0',
                value: '',
                max: 100,
                min: 0,
                nonUnits: [], // These choices in the drop down list disable the numeric entry
                step: 1,
                units: []
            },

            /**
             * Gets a sets the rating value
             * @method value
             * @param value
             * @return {*}
             */
            value: function (value) {
                var that = this;
                var element = that.element;
                var options = that.options;
                if ($.type(value) === STRING) {
                    element.val(value);
                    var matches = value.match(RX_UNIT);
                    if ($.isArray(matches) && matches.length === 3) {
                        assert.instanceof(kendo.ui.NumericTextBox, that.numericTextBox, kendo.format(assert.messages.instanceof.default, 'thist.numericTextBox', 'kendo.ui.NumericTextBox'));
                        assert.instanceof(kendo.ui.DropDownList, that.unitDropDownList, kendo.format(assert.messages.instanceof.default, 'thist.unitDropDownList', 'kendo.ui.DropDownList'));
                        that.numericTextBox.value(matches[1]);
                        that.numericTextBox.enable(/* that._enabled && */options.nonUnits.indexOf(matches[2]) === -1); // TODO CHeck if widget is enabled
                        that.unitDropDownList.value(matches[2]);
                    }
                } else if ($.type(value) === UNDEFINED) {
                    return element.val();
                } else {
                    throw new RangeError('`value` should be a string or undefined');
                }
            },

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                if (element.is('input')) {
                    element.wrap('<span/>');
                    that.wrapper = element.parent();
                    that.wrapper
                        .addClass(WIDGET_CLASS)
                        .css({ width: element.css('width') });
                    element.hide();
                    that.numericTextBox = $('<input>')
                        .appendTo(that.wrapper)
                        .kendoNumericTextBox({
                            culture: kendo.culture(),
                            decimals: options.decimals,
                            format: options.format,
                            max: options.max,
                            min: options.min,
                            step: options.step,
                            change: function (e) {
                                element.val((that.numericTextBox.value() || '') + that.unitDropDownList.value());
                                that.trigger(CHANGE);
                            }
                        })
                        .data('kendoNumericTextBox');
                    that.unitDropDownList = $('<select/>')
                        .appendTo(that.wrapper)
                        .kendoDropDownList({
                            dataSource: { data: options.units.concat(options.nonUnits) },
                            change: function (e) {
                                var num = that.numericTextBox.value();
                                var unit = that.unitDropDownList.value();
                                var isUnit = (options.units.indexOf(unit) >  -1) && (options.nonUnits.indexOf(unit) === -1);
                                if (isUnit && $.type(num) === NUMBER) {
                                    element.val(num + unit);
                                } else if (isUnit) {
                                    that.numericTextBox.value(options.default);
                                    element.val(options.default + unit);
                                } else {
                                    element.val(unit);
                                    that.numericTextBox.value('');
                                }
                                that.enable(that._enabled);
                                that.trigger(CHANGE);
                            }
                        })
                        .data('kendoDropDownList');
                } else {
                    throw new Error('A unit input should wrap an input for kendo validators to work.');
                }
            },

            /**
             * Function called by the enabled/disabled bindings
             * @param enabled
             */
            enable: function (enabled) {
                var that = this;
                var options = that.options;
                that._enabled = ($.type(enabled) === UNDEFINED ? true : !!enabled);
                this.numericTextBox.enable(that._enabled && (options.nonUnits.indexOf(that.unitDropDownList.value()) === -1));
                this.unitDropDownList.enable(that._enabled);
            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = this.wrapper;
                // Unbind events
                kendo.unbind(wrapper);
                // Clear references
                that.numericTextBox = undefined;
                that.unitDropDownList = undefined;
                // Destroy widget
                Widget.fn.destroy.call(this);
                kendo.destroy(wrapper);
            }
        });

        ui.plugin(UnitInput);

    } (window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });

