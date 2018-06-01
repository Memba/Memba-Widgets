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

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.table');
        var UNDEFINED = 'undefined';
        // var CHANGE = 'change';
        var WIDGET_CLASS = 'kj-table';
        var DEFAULTS = {
            COLUMN_WIDTH: 150,
            ROW_HEIGHT: 58,
            FONT_SIZE: 12 // ATTENTION: We use 48, but the spreadsheet default is actually 12
        };

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * Table
         * @class Table Widget (kendoConnector)
         */
        var Table = Widget.extend({

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
                that.value(options.value);
                // kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'Table',
                columns: 5,
                rows: 8,
                value: [{}]
            },

            // events: [
            //    CHANGE
            // ],

            /**
             * Value for MVVM binding
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else {
                    that._value = that._parse(value);
                    that.render();
                }
            },

            /**
             * Widget layout
             * @private
             */
            _layout: function () {
                // if (!(this.element[0] instanceof HTMLTableElement)) {
                //    throw new Error('Please use a <table/> element to initialize a kendo.ui.Table');
                // }
                this.wrapper = this.element;
                this.element
                    .addClass(WIDGET_CLASS)
                    .css({
                        position: 'relative'
                        // tableLayout: 'fixed',
                        // borderCollapse: 'collapse',
                        // borderSpacing: 0
                        // display: 'table'
                    });
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Parse Kendo UI Spreadsheet JSON
             * @param value
             * @private
             */
            _parse: function (value) {
                var ret = [];
                var rowTotal = this.options.rows;
                var columnTotal = this.options.columns;
                var columnDefinitions = value && value.sheets && value.sheets.length && value.sheets[0].columns || [];
                var rowDefinitions = value && value.sheets && value.sheets.length && value.sheets[0].rows || [];
                var height;
                var left = 0;
                var top = 0;
                var width;
                var rowIndex;
                var columnIndex;
                var rowFinder = function (item) { return item.index === rowIndex; };
                var columnFinder = function (item) { return item.index === columnIndex; };
                for (rowIndex = 0; rowIndex < rowTotal; rowIndex++) {
                    ret.push([]);
                    var row = ret[rowIndex];
                    var rowDefinition = rowDefinitions.find(rowFinder) || { cells: [] };
                    for (columnIndex = 0; columnIndex < columnTotal; columnIndex++) {
                        var cellDefinition = rowDefinition.cells.find(columnFinder);
                        var columnDefinition = columnDefinitions.find(columnFinder);
                        height = rowDefinition && rowDefinition.height || DEFAULTS.ROW_HEIGHT;
                        width = columnDefinition && columnDefinition.width || DEFAULTS.COLUMN_WIDTH;
                        if ($.type(cellDefinition) === UNDEFINED) {
                            row.push({
                                css: {
                                    left: left,
                                    height: height,
                                    top: top,
                                    width: width
                                }
                            });
                        } else {
                            row.push({
                                value: cellDefinition.value,
                                format: cellDefinition.format,
                                css: {
                                    backgroundColor: cellDefinition.background,
                                    borderBottom: cellDefinition.borderBottom ? 'solid ' + cellDefinition.borderBottom.size + 'px ' + cellDefinition.borderBottom.color : undefined,
                                    borderLeft: cellDefinition.borderLeft ? 'solid ' + cellDefinition.borderLeft.size + 'px ' + cellDefinition.borderLeft.color : undefined,
                                    borderRight: cellDefinition.borderRight ? 'solid ' + cellDefinition.borderRight.size + 'px ' + cellDefinition.borderRight.color : undefined,
                                    borderTop: cellDefinition.borderTop ? 'solid ' + cellDefinition.borderTop.size + 'px ' + cellDefinition.borderTop.color : undefined,
                                    color: cellDefinition.color,
                                    fontFamily: cellDefinition.fontFamily || 'Arial',
                                    fontSize: cellDefinition.fontSize || DEFAULTS.FONT_SIZE,
                                    fontStyle: cellDefinition.italic ? 'italic' : 'normal',
                                    fontWeight: cellDefinition.bold ? 'bold' : 'normal',
                                    left: left,
                                    height: height,
                                    textAlign: cellDefinition.textAlign || (isNaN(parseFloat(cellDefinition.value)) ? 'left' : 'right'), // TODO: Dates parse as numbers but are left aligned by default
                                    textDecoration: cellDefinition.underline ? 'underline' : 'none',
                                    top: top,
                                    // verticalAlign: cellDefinition.verticalAlign === 'center' ? 'middle' : (cellDefinition.verticalAlign || 'bottom'),
                                    width: width,
                                    // we need to test true because when undefined cellDefinition.wrap is actually a function
                                    whiteSpace: cellDefinition.wrap === true ? 'pre-wrap' : 'pre',
                                    wordBreak: cellDefinition.wrap === true ? 'break-all' : 'normal'
                                },
                                class: 'k-vertical-align-' + (cellDefinition.verticalAlign || 'bottom')
                            });
                        }
                        left += width;
                    }
                    left = 0;
                    top += height;
                }
                return ret;
            },

            /* jshint +W074 */

            /**
             * Widget rendering
             */
            render: function () {
                var element = this.element;
                var rowTotal = this.options.rows;
                var columnTotal = this.options.columns;
                element.empty();
                for (var i = 0; i < rowTotal; i++) {
                    for (var j = 0; j < columnTotal; j++) {
                        var cell = this._value[i][j];
                        var cellElement = $('<DIV/>')
                            .addClass('k-spreadsheet-cell')
                            .css(cell.css);
                        var cellContent = '<DIV class="' + cell.class + '">';
                        if ($.type(cell.value) === UNDEFINED) {
                            cellContent += '&nbsp';
                        } else if (!isNaN(parseFloat(cell.value))) {
                            cellContent += '<span>' + kendo.toString(cell.value, cell.format) + '</span>';
                        } else {
                            cellContent += cell.value;
                        }
                        cellContent += '</DIV>';
                        cellElement
                            .html(cellContent)
                            .appendTo(element);
                    }
                }
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                Widget.fn.destroy.call(that);
                // unbind and destroy all descendants
                kendo.unbind(element);
                kendo.destroy(element);
                // unbind all other events (probably redundant)
                element.find('*').off();
                element.off();
                // remove descendants
                element.empty();
                // remove widget class
                element.removeClass(WIDGET_CLASS);
            }
        });

        kendo.ui.plugin(Table);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
