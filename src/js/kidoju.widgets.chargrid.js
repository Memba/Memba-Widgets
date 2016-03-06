/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
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

    (function ($, undefined) {

        var kendo = window.kendo;
        var drawing = kendo.drawing;
        var geometry = kendo.geometry;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.chargrid');
        var STRING = 'string';
        // var BOOLEAN = 'boolean';
        var NUMBER = 'number';
        var OBJECT = 'object';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var KEYDOWN = 'keydown';
        var KEYPRESS = 'keypress';
        var FOCUSOUT = 'focusout';
        // var NS = '.kendoCharGrid';
        var WIDGET_CLASS = 'k-widget kj-chargrid';
        var BASE_CODE = 65; // for A (a = 97)
        var RX_WHITELIST = '^[{0}]$';

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * CharGrid
         * @class CharGrid Widget (kendoCharGrid)
         */
        var CharGrid = Widget.extend({

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
                that._setValue(this.options.value);
                that._addFocus();
                that._layout();
                // kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'CharGrid',
                rows: 4,
                columns: 6,
                height: 100,
                width: 150,
                whitelist: '0-9',
                blank: '.',
                headings: false,
                gridFill: { color: '#cce6ff', opacity: 1 }, // http://docs.telerik.com/kendo-ui/api/javascript/drawing/fill-options
                gridStroke: { color: '#002699', width: 2 }, // http://docs.telerik.com/kendo-ui/api/javascript/drawing/stroke-options
                blankFill: { color: '#000000', opacity: 1 },
                selectedFill: { color: '#ffffcc', opacity: 1 },
                lockedFill: { color: '#cccccc', opacity: 1 },
                lockedStroke: { color: '#9999b6', width: 2 },
                valueStroke: { color: '#9999b6', width: 2 },
                // successStroke and failureStroke in review mode ????
                locked: { A: [1, 1, 0, 0], B: [1, 1, 0, 0], C: [1, 1, 0, 0], D: [1, 1, 0, 0], E: [1, 1, 0, 0], F: [1, 1, 0, 0] },
                value: { A: ['.', '1', '2', '3'] }
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE
            ],

            /**
             * Initialize value
             * @private
             */
            _setValue: function (value) {
                var that = this;
                var options = this.options;
                var columns = options.columns;
                var rows = options.rows;
                var rx = new RegExp(kendo.format(RX_WHITELIST, options.whitelist));
                that._value = {};
                for (var col = 0; col < columns; col++) {
                    var prop = String.fromCharCode(BASE_CODE + col);
                    that._value[prop] = new Array(rows);
                    for (var row = 0; row < rows; row++) {
                        if ($.isArray(value[prop]) && value[prop][row] && (rx.test('' + value[prop][row]) || value[prop][row] === options.blank )) {
                            that._value[prop][row] = '' + value[prop][row];
                        } else {
                            that._value[prop][row] = undefined;
                        }
                    }
                }
            },

            /**
             * Value for MVVM binding
             * Returns either a JS function as a string or a library formula name prefixed as a Javascript comment
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else if ($.type(value) === OBJECT) {
                    if (value !== that._value) { // TODO compare
                        that._setValue(value);
                        that.refresh();
                        that.trigger(CHANGE);
                    }
                } else {
                    throw new TypeError('`value` is expected to be an `object`');
                }
            },

            /**
             * Get/set cell value
             * @param col
             * @param row
             * @param value
             */
            cellValue: function (col, row, value) {
                assert.type(NUMBER, col, kendo.format(assert.messages.type.default, 'col', NUMBER));
                assert.type(NUMBER, row, kendo.format(assert.messages.type.default, 'row', NUMBER));
                assert.type(OBJECT, this._value, kendo.format(assert.messages.type.default, 'this._value', OBJECT));
                var that = this;
                var options = that.options;
                var rx = new RegExp(kendo.format(RX_WHITELIST, options.whitelist));
                var colValues = that._value[String.fromCharCode(BASE_CODE + col)];
                if ($.type(value) === UNDEFINED) {
                    if ($.isArray(colValues) && rx.test(colValues[row])) {
                        return colValues[row];
                    }
                } else if ($.type(value) === NULL) {
                    colValues[row] = undefined;
                    that.refresh();
                    that.trigger(CHANGE);
                } else if ($.type(value) === STRING && value.length === 1)  {
                    if (rx.test(value)) {
                        // TODO locked cell should raise an error
                        colValues[row] = value;
                        that.refresh();
                        that.trigger(CHANGE);
                    }
                } else {
                    throw new TypeError('`value` is expected to be a single char string');
                }
            },

            /**
             * Get cell locked state
             * @param col
             * @param row
             */
            isLocked: function (col, row) {
                assert.type(NUMBER, col, kendo.format(assert.messages.type.default, 'col', NUMBER));
                assert.type(NUMBER, row, kendo.format(assert.messages.type.default, 'row', NUMBER));
                var that = this;
                var options = that.options;
                var columns = options.columns;
                var rows = options.rows;
                var blank = options.blank;
                var colLocked = options.locked[String.fromCharCode(BASE_CODE + col)];
                return $.isArray(colLocked) &&
                    col >= 0 && col < columns && row >= 0 && row < rows &&
                    $.isArray(colLocked) && !!colLocked[row] &&
                    that.cellValue(col, row) !== blank;
            },

            /**
             * Add focus
             * Note: this offers the ability to:
             * 1. do that.element.focus() and that.element.blur()
             * 2. capture keypress events
             * @private
             */
            _addFocus: function () {
                if ($.type(this.element.prop('tabindex')) === UNDEFINED) {
                    this.element.prop('tabindex', 0);
                }
            },

            /**
             * Make sure to unselect the selected cell
             * @param e
             * @private
             */
            _onFocusOut: function (e) {
                this.select(-1, -1);
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element
                    .addClass(WIDGET_CLASS)
                    .on(KEYDOWN, $.proxy(that._onKeyDown, that))
                    .on(KEYPRESS, $.proxy(that._onKeyPress, that))
                    .on(FOCUSOUT, $.proxy(that._onFocusOut, that));
                that.surface = drawing.Surface.create(
                    that.element,
                    {
                        click: $.proxy(that._onSurfaceClick, that)
                    }
                );
                that.refresh();
            },

            /**
             * Draw the grid
             * @private
             */
            _drawGrid: function () {
                var that = this;
                var options = that.options;
                var height = options.height;
                var width = options.width;
                var rows = options.rows;
                var columns = options.columns;
                var grid = new drawing.Group();
                var rectGeometry = new geometry.Rect([0, 0], [width, height]);
                // IMPORTANT: fill is required for the click event to fire everywhere
                var rect = new drawing.Rect(rectGeometry, { fill: that.options.gridFill, stroke: that.options.gridStroke });
                grid.append(rect);
                // columns
                for (var col = 1; col < columns; col++) {
                    grid.append(new drawing.Path({ stroke: that.options.gridStroke }).moveTo(width * col / columns, 0).lineTo(width * col / columns, height));
                }
                // rows
                for (var row = 1; row < rows; row++) {
                    grid.append(new drawing.Path({ stroke: that.options.gridStroke }).moveTo(0, height * row / rows).lineTo(width, height * row / rows));
                }
                that.surface.draw(grid);
            },

            /**
             * Draw the selected cell
             * @private
             */
            _drawSelectedCell: function () {
                var that = this;
                var options = that.options;
                var height = options.height;
                var width = options.width;
                var rows = options.rows;
                var columns = options.columns;
                var col = that._selectedCell && that._selectedCell.col;
                var row = that._selectedCell && that._selectedCell.row;
                if ($.type(col) === NUMBER && col >= 0 && col < columns &&
                    $.type(row) === NUMBER && row >= 0 && row < rows) {
                    var selectedCellGeometry = new geometry.Rect(
                        [
                            (col * width) / columns, // left or x
                            (row * height) / rows // top or y
                        ],
                        [
                            width / columns, // width
                            height / rows // height
                        ]
                    );
                    var selectedCell = new drawing.Rect(selectedCellGeometry, {
                        fill: that.options.selectedFill,
                        stroke: that.options.gridStroke
                    });
                    that.surface.draw(selectedCell);
                }
            },

            /**
             * Get a blank rectangle
             * @private
             */
            _getCharRect: function(col, row, fillOptions) {
                var that = this;
                var options = that.options;
                var height = options.height;
                var width = options.width;
                var rows = options.rows;
                var columns = options.columns;
                if ($.type(col) === NUMBER && col >= 0 && col < columns &&
                    $.type(row) === NUMBER && row >= 0 && row < rows) {
                    var blankGeometry = new geometry.Rect(
                        [
                            (col * width) / columns, // left or x
                            (row * height) / rows // top or y
                        ],
                        [
                            width / columns, // width
                            height / rows // height
                        ]
                    );
                    var blank = new drawing.Rect(blankGeometry, {
                        fill: fillOptions,
                        stroke: that.options.gridStroke
                    });
                    return blank;
                }
            },

            /**
             * Get a char to draw
             * @see http://docs.telerik.com/kendo-ui/api/javascript/drawing/text
             * @param col
             * @param row
             * @param char
             * @private
             */
            _getCharText: function (col, row, char) {
                var that = this;
                var options = that.options;
                var height = options.height;
                var width = options.width;
                var rows = options.rows;
                var columns = options.columns;
                if ($.type(col) === NUMBER && col >= 0 && col < columns &&
                    $.type(row) === NUMBER && row >= 0 && row < rows &&
                    $.type(char) === STRING && char.length === 1) {
                    var fontSize = Math.floor(0.8 * height/rows);
                    var params = {
                        font:  fontSize + 'px "Open Sans", sans-serif',
                        stroke: that.isLocked(col, row) ? options.lockedStroke : options.valueStroke
                    };
                    var text = new drawing.Text(char, new geometry.Point(0, 0), params);
                    var size = text.bbox().size;
                    var position = new geometry.Point(
                        (col + 1 / 2) * width / columns - size.width / 2,
                        (row + 1 / 2) * height / rows - size.height / 2
                    );
                    text.position(position);
                    return text;
                }
            },

            /**
             * Draw cell values
             * @private
             */
            _drawCellValues: function () {
                var that = this;
                var options = that.options;
                var height = options.height;
                var width = options.width;
                var rows = options.rows;
                var columns = options.columns;
                var rx = new RegExp(kendo.format(RX_WHITELIST, options.whitelist));
                var locked = options.locked;
                var chars = new drawing.Group();
                // columns
                for (var col = 0; col < columns; col++) {
                    assert.type(OBJECT, that._value, kendo.format(assert.messages.type.default, 'this._value', OBJECT));
                    var colValues = that._value[String.fromCharCode(BASE_CODE + col)];
                    var colLocked = locked[String.fromCharCode(BASE_CODE + col)];
                    if ($.isArray(colValues)) {
                        for (var row = 0; row < rows; row++) {
                            if (colValues[row] === that.options.blank) { // the value is a blank
                                var blank = that._getCharRect(col, row, that.options.blankFill);
                                if (blank instanceof kendo.drawing.Rect) {
                                    chars.append(blank);
                                }
                            } else {
                                if (that.isLocked(col, row)) {
                                    var locked = that._getCharRect(col, row, that.options.lockedFill);
                                    if (locked instanceof kendo.drawing.Rect) {
                                        chars.append(locked);
                                    }
                                }
                                var text = that._getCharText(col, row, colValues[row]);
                                if (text instanceof kendo.drawing.Text) {
                                    chars.append(text);
                                }
                            }
                        }
                    }
                }
                that.surface.draw(chars);
            },

            /**
             * Redraw everything
             */
            refresh: function() {
                assert.instanceof(drawing.Surface, this.surface, kendo.format(assert.messages.instanceof.default, 'this.surface', 'kendo.drawing.Surface'));
                this.surface.clear();
                this._drawGrid();
                this._drawSelectedCell();
                this._drawCellValues();
            },

            /**
             * Select a cell
             * @param col
             * @param row
             */
            select: function (col, row) {
                assert.type(NUMBER, col, kendo.format(assert.messages.type.default, 'col', NUMBER));
                assert.type(NUMBER, row, kendo.format(assert.messages.type.default, 'row', NUMBER));
                var that = this;
                var options = that.options;
                var rows = options.rows;
                var columns = options.columns;
                var locked = options.locked;
                if ((col >= 0 && col < columns) && (row >= 0 && row < rows) && !that.isLocked(col, row)) {
                    that._selectedCell = {col: col, row: row};
                    that.element.focus();
                } else {
                    that._selectedCell = undefined;
                    if (that.element.is(':focus')) { // This test avoids a call stack size exceeded because of teh foucusout event handler
                        that.element.blur();
                    }
                }
                that.refresh();
            },

            /**
             * Click event handler
             * @param e
             * @private
             */
            _onSurfaceClick: function (e) {
                var that = this;
                var options = that.options;
                var height = options.height;
                var width = options.width;
                var rows = options.rows;
                var columns = options.columns;
                // TODO: think of headings a, b, c, 1, 2, 3 as in in Excel which add 1 row + 1 col
                var offset = that.element.offset();
                var col = Math.floor((e.originalEvent.pageX - offset.left) * columns / width);
                var row = Math.floor((e.originalEvent.pageY - offset.top) * rows / height);
                that.select(col, row);
            },

            /**
             * Key down event handler
             * @param e
             * @private
             */
            _onKeyDown: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.ok(this.element.is(':focus'), '`this.element` is expected to have focus');
                var that = this;
                var options = that.options;
                var columns = options.columns;
                var rows = options.rows;
                var col = that._selectedCell && that._selectedCell.col;
                var row = that._selectedCell && that._selectedCell.row;
                if (e.which === 37 && col > 0 && !that.isLocked(col - 1, row)) { // Arrow left
                    that.select(col - 1, row);
                } else if (e.which === 38 && row > 0 && !that.isLocked(col, row - 1)) { // Arrow up
                    that.select(col, row - 1);
                } else if (e.which === 39 && col < columns - 1 && !that.isLocked(col + 1, row)) { // Arrow right
                    that.select(col + 1, row);
                } else if (e.which === 40 && row < rows - 1 && !that.isLocked(col, row + 1)) { // Arrow down
                    that.select(col, row + 1);
                }
            },

            /**
             * Key press event handler
             * @param e
             * @private
             */
            _onKeyPress: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.ok(this.element.is(':focus'), '`this.element` is expected to have focus');
                var that = this;
                var options = that.options;
                var rows = options.rows;
                var columns = options.columns;
                var col = that._selectedCell && that._selectedCell.col;
                var row = that._selectedCell && that._selectedCell.row;
                if ($.type(col) === NUMBER && col >= 0 && col < columns &&
                    $.type(row) === NUMBER && row >= 0 && row < rows) {
                    if (e.which === 32) { // SPACE
                        that.cellValue(col, row, null);
                    } else {
                        var rx = new RegExp(kendo.format(RX_WHITELIST, options.whitelist));
                        var char = String.fromCharCode(e.which);
                        if (rx.test(char)) {
                            that.cellValue(col, row, char);
                        }
                    }
                }
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

        kendo.ui.plugin(CharGrid);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
