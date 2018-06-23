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
        './vendor/kendo/kendo.binder'
    ], f);
})(function () {
    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var DataSource = kendo.data.DataSource;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.template');
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DATABINDING = 'dataBinding';
        var DATABOUND = 'dataBound';
        var WIDGET_CLASS = 'kj-template'; // 'k-widget kj-template';

        /*******************************************************************************************
         * Template Widget
         *******************************************************************************************/

        /**
         * Template (kendoTemplate)
         * @class Template
         * @extend Widget
         */
        var Template = Widget.extend({

            /**
             * Initializes the widget
             * @method init
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'Widget initialized' });
                that._initTemplate();
                that._layout();
                that._dataSource();
                that.value(that.options.value);
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                autoBind: true,
                dataSource: [],
                name: 'Template',
                template: '',
                value: {},
                valueField: null
            },

            /**
             * Events
             */
            events: [
                // call before mutating DOM.
                // mvvm will traverse DOM, unbind any bound elements or widgets
                DATABINDING,
                // call after mutating DOM
                // traverses DOM and binds ALL THE THINGS
                DATABOUND
            ],

            /**
             * Data to be merged with the template
             * @method value
             * @param value
             * @return {*}
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else {
                    if (that._value !== value) {
                        that._value = value;
                        that.refresh();
                    }
                }
            },

            /**
             * Return items
             * mvvm expects an array of dom elements that represent each item of the datasource - should be the outermost element's children
             */
            items: function () {
                return []; // this.element.children();
            },

            /**
             * Initialize template
             * TODO: also consider loading external templates designated by a URL
             * @private
             */
            _initTemplate: function () {
                var template = this.options.template;
                if ($.type(template) === STRING && template.length) {
                    // try to find a script tag on the page
                    var script = $('#' + template);
                    if (script.length > 0) {
                        this._template = kendo.template(script.html());
                    } else {
                        this._template = kendo.template(template);
                    }
                } else if ($.isFunction(template)) {
                    this._template = template;
                }
            },

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
            },

            /**
             * Sets teh dataSOurce
             * @private
             */
            _dataSource: function () {
                var that = this;

                // if the DataSource is defined and the _refreshHandler is wired up, unbind because
                // we need to rebuild the DataSource
                if (that.dataSource instanceof DataSource && $.isFunction(that._refreshHandler)) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                } else {
                    that._refreshHandler = $.proxy(that.refresh, that);
                }

                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = DataSource.create(that.options.dataSource);
                // bind to the change event to refresh the widget
                that.dataSource.bind(CHANGE, that._refreshHandler);

                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
            },

            /**
             * For supporting changing the datasource via MVVM
             * @param dataSource
             */
            setDataSource: function (dataSource) {
                // set the internal datasource equal to the one passed in by MVVM
                this.options.dataSource = dataSource;
                // rebuild the datasource if necessary, or just reassign
                this._dataSource();
            },

            /**
             * Refreshes the widget
             * @method refresh
             */
            refresh: function () {
                var that = this;
                var options = that.options;
                // that.element.children().each(function () { kendo.destroy(this) });
                // that.element.find('*').off();
                that.element.empty();
                if ($.isFunction(that._template)) {
                    if ($.type(options.valueField) === STRING &&
                        that.dataSource instanceof DataSource) {
                        that.trigger(DATABINDING);
                        /*
                        var data = that.dataSource.data().find(function (item) {
                            return item[options.valueField] === that.value();
                        });
                        */
                        // TODO The following works with HierarchicalDataSource but supposes that that.value() is the idField
                        var data = that.dataSource.get(that.value());
                        if ($.type(data) !== UNDEFINED) {
                            var html = that._template(data);
                            that.element.html(html);
                        }
                        that.trigger(DATABOUND);
                    } else {
                        var value = that.value();
                        if ($.type(value) !== UNDEFINED) {
                            that.element.html(that._template(value));
                        }
                    }
                }
                logger.debug({ method: 'refresh', message: 'Widget refreshed' });
            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                if (that.dataSource instanceof DataSource && $.isFunction(that._refreshHandler)) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                }
                kendo.unbind(wrapper);
                // Clear references
                that.dataSource = undefined;
                that._template = undefined;
                // Destroy widget
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        ui.plugin(Template);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
