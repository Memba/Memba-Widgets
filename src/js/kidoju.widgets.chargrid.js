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
        // var OBJECT = 'object';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var MOUSEUP = 'mouseup';
        var KEYPRESS = 'keypress';
        var KEYDOWN = 'keydown';
        var BLUR = 'blur';
        var NS = '.kendoCharGrid';
        var WIDGET_CLASS = 'kj-chargrid'; // 'k-widget kj-chargrid';
        // var BASE_CODE = 65; // for A (a = 97)
        var RX_WHITELIST = '^[{0}]$';
        var STROKE_WIDTH = 2;

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        var util = {

            /**
             * Check array or observable array
             * @param arr
             * @returns {*|boolean}
             */
            isArray: function (arr) {
                return $.isArray(arr) || arr instanceof kendo.data.ObservableArray;
            },

            /**
             * Get the mouse (or touch) position
             * @param e
             * @param stage
             * @returns {{x: *, y: *}}
             */
            getMousePosition: function (e, stage) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof($, stage, kendo.format(assert.messages.instanceof.default, 'stage', 'jQuery'));
                // See http://www.jacklmoore.com/notes/mouse-position/
                // See http://www.jqwidgets.com/community/topic/dragend-event-properties-clientx-and-clienty-are-undefined-on-ios/
                // See http://www.devinrolsen.com/basic-jquery-touchmove-event-setup/
                // ATTENTION: e.originalEvent.changedTouches instanceof TouchList, not Array
                var originalEvent = e.originalEvent;
                var clientX = originalEvent && originalEvent.changedTouches ? originalEvent.changedTouches[0].clientX : e.clientX;
                var clientY = originalEvent && originalEvent.changedTouches ? originalEvent.changedTouches[0].clientY : e.clientY;
                // IMPORTANT: Position is relative to the stage and e.offsetX / e.offsetY do not work in Firefox
                // var stage = $(e.target).closest('.kj-stage').find(kendo.roleSelector('stage'));
                var ownerDocument = $(stage.get(0).ownerDocument);
                var stageOffset = stage.offset();
                var mouse = {
                    x: clientX - stageOffset.left + ownerDocument.scrollLeft(),
                    y: clientY - stageOffset.top + ownerDocument.scrollTop()
                };
                return mouse;
            },

            /**
             * Get the position of the center of an element
             * @param element
             * @param stage
             * @param scale
             */
            getElementCenter: function (element, stage, scale) {
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'element', 'jQuery'));
                assert.instanceof($, stage, kendo.format(assert.messages.instanceof.default, 'stage', 'jQuery'));
                assert.type(NUMBER, scale, kendo.format(assert.messages.type.default, 'scale', NUMBER));
                // We need getBoundingClientRect to especially account for rotation
                var rect = element[0].getBoundingClientRect();
                var ownerDocument = $(stage.get(0).ownerDocument);
                var stageOffset = stage.offset();
                return {
                    left: (rect.left - stageOffset.left + rect.width / 2  + ownerDocument.scrollLeft()) / scale,
                    top: (rect.top - stageOffset.top + rect.height / 2 + ownerDocument.scrollTop()) / scale
                };
            },

            /**
             * Get the scale of an element's CSS transformation
             * Note: the same function is used in kidoju.widgets.stage
             * @param element
             * @returns {Number|number}
             */
            getTransformScale: function (element) {
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'element', 'jQuery'));
                // $(element).css('transform') returns a matrix, so we have to read the style attribute
                var match = (element.attr('style') || '').match(/scale\([\s]*([0-9\.]+)[\s]*\)/);
                return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 1 : 1;
            },

            /**
             * Get the rotation angle (in degrees) of an element's CSS transformation
             * @param element
             * @returns {Number|number}
             */
            getTransformRotation: function (element) {
                assert.instanceof($, element, kendo.format(assert.messages.instanceof.default, 'element', 'jQuery'));
                // $(element).css('transform') returns a matrix, so we have to read the style attribute
                var match = (element.attr('style') || '').match(/rotate\([\s]*([0-9\.]+)[deg\s]*\)/);
                return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 0 : 0;
            }

        };

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        // TODO: 3 things that need to be done:
        // https://github.com/kidoju/Kidoju-Widgets/issues/90
        // https://github.com/kidoju/Kidoju-Widgets/issues/91
        // https://github.com/kidoju/Kidoju-Widgets/issues/92

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
                that._layout();
                // kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'CharGrid',
                scaler: '.kj-stage',
                container: '.kj-stage>div[data-role="stage"]',
                rotator: '.kj-element',
                columns: 6,
                rows: 4,
                blank: '.',
                whitelist: '1-9',
                gridFill: '#cce6ff',
                gridStroke: '#000000',
                blankFill: '#000000',
                selectedFill: '#ffffcc',
                lockedFill: '#e6e6e6',
                lockedColor: '#9999b6',
                valueColor: '#9999b6',
                locked: [],
                value: [],
                enable: true
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
                var locked = options.locked;
                var blank = options.blank;
                var whitelist = (options.whitelist || '').trim();
                var rx = new RegExp(kendo.format(RX_WHITELIST, whitelist), 'i');
                that._value = [];
                for (var col = 0; col < columns; col++) {
                    that._value.push(new Array(rows));
                    for (var row = 0; row < rows; row++) {
                        if (util.isArray(locked) && util.isArray(locked[col]) && locked[col][row]) {
                            that._value[col][row] = '' + locked[col][row];
                        } else if (util.isArray(value) && util.isArray(value[col]) && rx.test('' + value[col][row])) {
                            that._value[col][row] = '' + value[col][row];
                        } else {
                            that._value[col][row] = null;
                        }
                    }
                }
            },

            /*  This function's cyclomatic complexity is too high. */
            /* jshint -W073 */

            /**
             * Compare values
             * @param value1
             * @param value2
             * @private
             */
            _compareValues: function (value1, value2) {
                /* jshint maxcomplexity: 10 */
                if (!util.isArray(value1) || !util.isArray(value2)) {
                    return false;
                }
                if (value1.length !== value2.length) {
                    return false;
                }
                for (var col = 0; col < value1.length; col++) {
                    if (!util.isArray(value1[col]) || !util.isArray(value2[col])) {
                        return false;
                    }
                    if (value1[col].length !== value2[col].length) {
                        return false;
                    }
                    for (var row = 0; row < value1[col].length; row++) {
                        if (value1[col][row] !== value2[col][row]) {
                            return false;
                        }
                    }
                }
                return true;
            },

            /* jshint +W073 */

            /**
             * Value for MVVM binding
             * Returns either a JS function as a string or a library formula name prefixed as a Javascript comment
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === UNDEFINED) {
                    return that._compareValues(that._value, that.options.locked) ? null : that._value;
                } else {
                    if (!that._compareValues(that._value, value)) {
                        that._setValue(value || '');
                        that.refresh();
                    }
                }
            },

            /*  This function's cyclomatic complexity is too high. */
            /* jshint -W073 */

            /**
             * Get/set cell value
             * @param col
             * @param row
             * @param value
             */
            cellValue: function (col, row, value) {
                /* jshint maxcomplexity: 9 */
                assert.type(NUMBER, col, kendo.format(assert.messages.type.default, 'col', NUMBER));
                assert.type(NUMBER, row, kendo.format(assert.messages.type.default, 'row', NUMBER));
                var that = this;
                var options = that.options;
                var whitelist = (options.whitelist || '').trim();
                var rx = new RegExp(kendo.format(RX_WHITELIST, whitelist), 'i');
                var colValues = that._value[col];
                if ($.type(value) === UNDEFINED) {
                    if (util.isArray(colValues) && rx.test(colValues[row])) {
                        return colValues[row];
                    }
                } else if ($.type(value) === NULL) {
                    if (colValues[row] !== null) {
                        colValues[row] = null;
                        that.refresh();
                        that.trigger(CHANGE);
                    }
                } else if ($.type(value) === STRING && value.length === 1) {
                    if (that.isLocked(col, row)) {
                        throw new Error('Cannot assign a new value to a locked cell');
                    } else if (colValues[row] !== value && rx.test(value)) {
                        colValues[row] = value.toUpperCase();
                        that.refresh();
                        that.trigger(CHANGE);
                    }
                    // discard any value that is not whitelisted
                } else {
                    throw new TypeError('`value` is expected to be a single char string');
                }
            },

            /* jshint +W073 */

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
                var locked = options.locked;
                return col >= 0 && col < columns && row >= 0 && row < rows &&
                    util.isArray(locked) && util.isArray(locked[col]) && !!locked[col][row] &&
                    that.cellValue(col, row) !== blank;
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                that.wrapper = element;
                element.addClass(WIDGET_CLASS);
                that.surface = drawing.Surface.create(that.element);
                // Note: we need an input to trigger the virtual keyboard on mobile devices
                that.input = $('<input type="text" style="position:absolute;left:-5000px;">')
                    .prependTo(that.element);
                that.enable(options.enable);
                that.refresh();
            },

            /**
             * Enables/disables the grid
             * @param enabled
             */
            enable: function (enabled) {
                var that = this;
                var element = that.element;
                var input = that.input;
                element.off(NS);
                input.off(NS);
                if (enabled) {
                    // Note: we handle the mouseup on the DOM element, not the drawing surface
                    // Note: We need mouseup to occur after the blur event herebelow when changing cells
                    element
                        .on(MOUSEUP + NS, $.proxy(that._onMouseUp, that));
                    input
                        .on(KEYDOWN + NS, $.proxy(that._onKeyDown, that))
                        .on(KEYPRESS + NS, $.proxy(that._onKeyPress, that))
                        .on(BLUR + NS, $.proxy(that._onBlur, that));
                }
            },

            /**
             * Draw the grid
             * @private
             */
            _drawGrid: function () {
                var that = this;
                var element = that.element;
                var height = element.height();
                var width = element.width();
                var options = that.options;
                var rows = options.rows;
                var columns = options.columns;
                var grid = new drawing.Group();
                var rectGeometry = new geometry.Rect([0, 0], [width, height]);
                grid.append(new drawing.Rect(
                    rectGeometry,
                    {
                        fill: { color: options.gridFill },
                        stroke: { color: options.gridStroke, width: STROKE_WIDTH }
                    }
                ));
                // columns
                for (var col = 1; col < columns; col++) {
                    grid.append(new drawing.Path(
                        { stroke: { color: options.gridStroke, width: STROKE_WIDTH } }
                    ).moveTo(width * col / columns, 0).lineTo(width * col / columns, height));
                }
                // rows
                for (var row = 1; row < rows; row++) {
                    grid.append(new drawing.Path(
                        { stroke: { color: options.gridStroke, width: STROKE_WIDTH } }
                    ).moveTo(0, height * row / rows).lineTo(width, height * row / rows));
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
                var col = that._selectedCell && that._selectedCell.col;
                var row = that._selectedCell && that._selectedCell.row;
                var rect = that._getCellRect(col, row, options.selectedFill);
                if (rect) {
                    that.surface.draw(rect);
                }
            },

            /**
             * Get a cell rectangle filled with color
             * @private
             */
            _getCellRect: function (col, row, fillColor) {
                var that = this;
                var element = that.element;
                var height = element.height();
                var width = element.width();
                var options = that.options;
                var rows = options.rows;
                var columns = options.columns;
                if ($.type(col) === NUMBER && col >= 0 && col < columns &&
                    $.type(row) === NUMBER && row >= 0 && row < rows) {
                    var rectGeometry = new geometry.Rect(
                        [
                            (col * width) / columns, // left or x
                            (row * height) / rows // top or y
                        ],
                        [
                            width / columns, // width
                            height / rows // height
                        ]
                    );
                    var rect = new drawing.Rect(rectGeometry, {
                        fill: { color: fillColor },
                        stroke: { color: options.gridStroke, width: STROKE_WIDTH }
                    });
                    return rect;
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
                var element = that.element;
                var height = element.height();
                var width = element.width();
                var options = that.options;
                var rows = options.rows;
                var columns = options.columns;
                if ($.type(col) === NUMBER && col >= 0 && col < columns &&
                    $.type(row) === NUMBER && row >= 0 && row < rows &&
                    $.type(char) === STRING && char.length === 1) {
                    var fontSize = Math.floor(0.75 * height / rows);
                    var params = {
                        font:  fontSize + 'px "Open Sans", sans-serif',
                        stroke: that.isLocked(col, row) ? { color: options.lockedColor, width: 1 } : { color: options.valueColor, width: 1 },
                        fill: that.isLocked(col, row) ? { color: options.lockedColor } : { color: options.valueColor }
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

            /*  This function's cyclomatic complexity is too high. */
            /* jshint -W073 */

            /**
             * Draw cell values
             * @private
             */
            _drawCellValues: function () {
                /* jshint maxcomplexity: 9 */
                var that = this;
                var element = that.element;
                var options = that.options;
                var rows = options.rows;
                var columns = options.columns;
                var locked = options.locked;
                var chars = new drawing.Group();
                // columns
                for (var col = 0; col < columns; col++) {
                    var colValues = that._value[col];
                    if (util.isArray(colValues)) {
                        for (var row = 0; row < rows; row++) {
                            if (colValues[row] === options.blank) { // the value is a blank
                                var blank = that._getCellRect(col, row, options.blankFill);
                                if (blank instanceof kendo.drawing.Rect) {
                                    chars.append(blank);
                                }
                            } else {
                                if (that.isLocked(col, row)) {
                                    locked = that._getCellRect(col, row, options.lockedFill);
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

            /* jshint +W073 */

            /**
             * Redraw everything
             */
            refresh: function () {
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
                if ((col >= 0 && col < columns) && (row >= 0 && row < rows) && !that.isLocked(col, row)) {
                    var scroll = {
                        left: $(window).scrollLeft(),
                        top: $(window).scrollTop()
                    };
                    that._selectedCell = { col: col, row: row };
                    that.input.focus();
                    // that.input.select();
                    // Note: that.input.focus() triggers a scroll, so we need to fix that
                    // that.input.select() behaves like focus in Firefox and IE/Edge, so it also requires fixing scroll
                    // TODO: This is not working properly in IE and Edge where scrolling occurs anyway - https://github.com/kidoju/Kidoju-Widgets/issues/119
                    // Note: the scroll event is not cancelable with e.preventDefault()
                    $(window).scrollLeft(scroll.left);
                    $(window).scrollTop(scroll.top);
                }
                else {
                    that._selectedCell = undefined;
                    if (that.input.is(':focus')) {
                        // This is called from _onBlur so we need to prevent a stack overflow
                        that.input.blur();
                    }
                }
                that.refresh();
            },

            /**
             * MouseUp event handler
             * Note: we need mouseup to occur after the blur event on the concealed input
             * @param e
             * @private
             */
            _onMouseUp: function (e) {
                var that = this;
                var element = that.element;
                var height = element.height();
                var width = element.width();
                var options = that.options;
                var rows = options.rows;
                var columns = options.columns;
                var container = that.element.closest(options.container);
                assert.hasLength(container, kendo.format(assert.messages.hasLength.default, 'container'));
                var rotator = that.element.closest(options.rotator);
                var rotate = util.getTransformRotation(rotator) * Math.PI / 180;
                var scaler = that.element.closest(options.scaler);
                var scale = scaler.length ? util.getTransformScale(scaler) : 1;
                // Find the center of the chargrid, which is the center of rotation of the wrapping kj-element
                var center = util.getElementCenter(element, container, scale);
                // Get the mouse position
                var mouse = util.getMousePosition(e, container);
                // Find the mouse coordinates against the center
                var pos = {
                    x: mouse.x / scale - center.left,
                    y: mouse.y / scale - center.top
                };
                // Project the mouse coordinates to annihilate the rotation and find col and row
                var col = Math.floor((width / 2 + pos.x * Math.cos(rotate) + pos.y * Math.sin(rotate)) * columns / width);
                var row = Math.floor((height / 2 - pos.x * Math.sin(rotate) + pos.y * Math.cos(rotate)) * rows / height);
                that.select(col, row);
                e.preventDefault();
                e.stopPropagation();
                return false;
            },

            /*  This function's cyclomatic complexity is too high. */
            /* jshint -W073 */

            /**
             * KeyDown event handler
             * Note: Delete and arrows only trigger the keydown event
             * @param e
             * @private
             */
            _onKeyDown: function (e) {
                /* jshint maxcomplexity: 10 */
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.ok(this.input.is(':focus'), '`this.input` is expected to have focus');
                var that = this;
                var options = that.options;
                var columns = options.columns;
                var rows = options.rows;
                var col = that._selectedCell && that._selectedCell.col;
                var row = that._selectedCell && that._selectedCell.row;
                if ($.type(col) === NUMBER && col >= 0 && col < columns &&
                    $.type(row) === NUMBER && row >= 0 && row < rows) {
                    var captured = false;
                    if (e.which === 37 && col > 0 && !that.isLocked(col - 1, row)) { // Arrow left
                        that.select(col - 1, row);
                        captured = true;
                    } else if (e.which === 38 && row > 0 && !that.isLocked(col, row - 1)) { // Arrow up
                        that.select(col, row - 1);
                        captured = true;
                    } else if (e.which === 39 && col < columns - 1 && !that.isLocked(col + 1, row)) { // Arrow right
                        that.select(col + 1, row);
                        captured = true;
                    } else if (e.which === 40 && row < rows - 1 && !that.isLocked(col, row + 1)) { // Arrow down
                        that.select(col, row + 1);
                        captured = true;
                    } else if ((e.which === 8 || e.which === 32 || e.which === 46) && !that.isLocked(col, row)) { // Backspace, Space or Delete
                        that.cellValue(col, row, null);
                        captured = true;
                    }
                    if (captured) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            },

            /* jshint +W073 */

            /**
             * KeyPress event handler
             * Note: required to get correct values from numeric key pad
             * @param e
             * @private
             */
            _onKeyPress: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.ok(this.input.is(':focus'), '`this.input` is expected to have focus');
                var that = this;
                var options = that.options;
                var columns = options.columns;
                var rows = options.rows;
                var col = that._selectedCell && that._selectedCell.col;
                var row = that._selectedCell && that._selectedCell.row;
                if ($.type(col) === NUMBER && col >= 0 && col < columns &&
                    $.type(row) === NUMBER && row >= 0 && row < rows) {
                    var whitelist = (options.whitelist || '').trim();
                    var rx = new RegExp(kendo.format(RX_WHITELIST, whitelist), 'i');
                    var char = String.fromCharCode(e.which);
                    if (rx.test(char)) {
                        that.cellValue(col, row, char);
                    }
                }
                // No need to fill the input
                e.preventDefault();
                e.stopPropagation();
            },

            /**
             * Make sure to unselect the selected cell
             * @param e
             * @private
             */
            _onBlur: function (e) {
                // relatedTarget is used to handle behaviour that is specific to IE and Edge
                // In IE and edge, if relatedTarget is an SVG Element and if this SVG element is inside the widget element, the event should be discarded
                // See https://developer.mozilla.org/en/docs/Web/API/SVGSVGElement
                // if (!(e.relatedTarget instanceof window.SVGSVGElement) || this.element.has($(e.relatedTarget)).length === 0) {

                this.select(-1, -1);
                // }
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                Widget.fn.destroy.call(that);
                // unbind events
                that.enable(false);
                // unbind and destroy all descendants
                kendo.unbind(element);
                kendo.destroy(element);
                // remove descendants
                element.empty();
                // remove widget class
                element.removeClass(WIDGET_CLASS);
            }

        });

        /**
         * Add a method for CharGridAdapter
         * @param columns
         * @param rows
         * @param whitelist
         * @param layout
         * @param data
         * @private
         */
        CharGrid._getCharGridArray = function (columns, rows, whitelist, layout, data) {
            assert.type(NUMBER, columns, kendo.format(assert.messages.type.default, 'columns', NUMBER));
            assert.type(NUMBER, rows, kendo.format(assert.messages.type.default, 'rows', NUMBER));
            assert.type(STRING, whitelist, kendo.format(assert.messages.type.default, 'whitelist', STRING));
            var ret = [];
            var rx = new RegExp(kendo.format(RX_WHITELIST, whitelist), 'i');
            for (var col = 0; col < columns; col++) {
                ret[col] = [];
                for (var row = 0; row < rows; row++) {
                    ret[col][row] = null;
                    // First fill with data assuming values are whitelisted
                    if (util.isArray(data) && util.isArray(data[col]) && rx.test(data[col][row])) {
                        ret[col][row] = data[col][row];
                    }
                    // Then impose layout
                    if (util.isArray(layout) && util.isArray(layout[col]) && $.type(layout[col][row]) === STRING) {
                        ret[col][row] = layout[col][row];
                    }
                }
            }
            return ret;
        };

        kendo.ui.plugin(CharGrid);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
