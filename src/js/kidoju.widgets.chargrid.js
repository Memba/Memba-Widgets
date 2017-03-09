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
        './vendor/kendo/kendo.color',
        './vendor/kendo/kendo.drawing'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

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
        var TOUCHEND = 'touchend';
        var KEYPRESS = 'keypress';
        var KEYDOWN = 'keydown';
        var INPUT = 'input';
        var BLUR = 'blur';
        var NS = '.kendoCharGrid';
        var WIDGET_CLASS = 'kj-chargrid'; // 'k-widget kj-chargrid';
        var INTERACTIVE_CLASS = 'kj-interactive';
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
                logger.debug({ method: 'init', message: 'widget initialized' });
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
                scaler: 'div.kj-stage',
                container: 'div.kj-stage>div[data-' + kendo.ns + 'role="stage"]',
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
                var colTotal = options.columns;
                var rowTotal = options.rows;
                var locked = options.locked;
                var blank = options.blank;
                var whitelist = (options.whitelist || '').trim();
                var rx = new RegExp(kendo.format(RX_WHITELIST, whitelist), 'i');
                that._value = [];
                for (var r = 0; r < rowTotal; r++) {
                    that._value.push(new Array(rowTotal));
                    for (var c = 0; c < colTotal; c++) {
                        if (util.isArray(locked) && util.isArray(locked[r]) && locked[r][c]) {
                            that._value[r][c] = '' + locked[r][c];
                        } else if (util.isArray(value) && util.isArray(value[r]) && rx.test('' + value[r][c])) {
                            that._value[r][c] = '' + value[r][c];
                        } else {
                            that._value[r][c] = null;
                        }
                    }
                }
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

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
                for (var r = 0, rowTotal = value1.length; r < rowTotal; r++) {
                    if (!util.isArray(value1[r]) || !util.isArray(value2[r])) {
                        return false;
                    }
                    if (value1[r].length !== value2[r].length) {
                        return false;
                    }
                    for (var c = 0, colTotal = value1[r].length; c < colTotal; c++) {
                        if (value1[r][c] !== value2[r][c]) {
                            return false;
                        }
                    }
                }
                return true;
            },

            /* jshint +W074 */

            /**
             * Value for MVVM binding
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

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Get/set cell value
             * @param r
             * @param c
             * @param value
             */
            cellValue: function (r, c, value) {
                /* jshint maxcomplexity: 9 */
                assert.type(NUMBER, r, kendo.format(assert.messages.type.default, 'r', NUMBER));
                assert.type(NUMBER, c, kendo.format(assert.messages.type.default, 'c', NUMBER));
                var that = this;
                var options = that.options;
                var whitelist = (options.whitelist || '').trim();
                var rx = new RegExp(kendo.format(RX_WHITELIST, whitelist), 'i');
                var row = that._value[r];
                if ($.type(value) === UNDEFINED) {
                    if (util.isArray(row) && rx.test(row[c])) {
                        return row[c];
                    }
                } else if ($.type(value) === NULL) {
                    if (row[c] !== null) {
                        row[c] = null;
                        that.refresh();
                        that.trigger(CHANGE);
                    }
                } else if ($.type(value) === STRING && value.length === 1) {
                    if (that.isLocked(r, c)) {
                        throw new Error('Cannot assign a new value to a locked cell');
                    } else if (row[c] !== value && rx.test(value)) {
                        row[c] = value.toUpperCase();
                        that.refresh();
                        that.trigger(CHANGE);
                    }
                    // discard any value that is not whitelisted
                } else {
                    throw new TypeError('`value` is expected to be a single char string');
                }
            },

            /* jshint +W074 */

            /**
             * Get cell locked state
             * @param r
             * @param c
             */
            isLocked: function (r, c) {
                assert.type(NUMBER, r, kendo.format(assert.messages.type.default, 'r', NUMBER));
                assert.type(NUMBER, c, kendo.format(assert.messages.type.default, 'c', NUMBER));
                var that = this;
                var options = that.options;
                var colTotal = options.columns;
                var rowTotal = options.rows;
                var blank = options.blank;
                var locked = options.locked;
                return r >= 0 && r < rowTotal && c >= 0 && c < colTotal &&
                    util.isArray(locked) && util.isArray(locked[r]) && !!locked[r][c] &&
                    that.cellValue(r, c) !== blank;
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
                // INTERACTIVE_CLASS (which might be shared with other widgets) is used to position any drawing surface underneath interactive widgets
                element
                    .addClass(WIDGET_CLASS)
                    .addClass(INTERACTIVE_CLASS);
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
                        .on(MOUSEUP + NS + ' ' + TOUCHEND + NS, $.proxy(that._onMouseUp, that));
                    input
                        .on(KEYDOWN + NS, $.proxy(that._onKeyDown, that))
                        .on(KEYPRESS + NS, $.proxy(that._onKeyPress, that))
                        .on(INPUT + NS, $.proxy(that._onInput, that))
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
                var rowTotal = options.rows;
                var colTotal = options.columns;
                var grid = new drawing.Group();
                var rectGeometry = new geometry.Rect([0, 0], [width, height]);
                grid.append(new drawing.Rect(
                    rectGeometry,
                    {
                        fill: { color: options.gridFill },
                        stroke: { color: options.gridStroke, width: STROKE_WIDTH }
                    }
                ));
                // rows
                for (var row = 1; row < rowTotal; row++) {
                    grid.append(new drawing.Path(
                        { stroke: { color: options.gridStroke, width: STROKE_WIDTH } }
                    ).moveTo(0, height * row / rowTotal).lineTo(width, height * row / rowTotal));
                }
                // columns
                for (var col = 1; col < colTotal; col++) {
                    grid.append(new drawing.Path(
                        { stroke: { color: options.gridStroke, width: STROKE_WIDTH } }
                    ).moveTo(width * col / colTotal, 0).lineTo(width * col / colTotal, height));
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
                var r = that._selectedCell && that._selectedCell.row;
                var c = that._selectedCell && that._selectedCell.col;
                var rect = that._getCellRect(r, c, options.selectedFill);
                if (rect) {
                    that.surface.draw(rect);
                }
            },

            /**
             * Get a cell rectangle filled with color
             * @param r
             * @param c
             * @param fillColor
             * @returns {*|x|Rect}
             * @private
             */
            _getCellRect: function (r, c, fillColor) {
                var that = this;
                var element = that.element;
                var height = element.height();
                var width = element.width();
                var options = that.options;
                var rowTotal = options.rows;
                var colTotal = options.columns;
                if ($.type(r) === NUMBER && r >= 0 && r < rowTotal &&
                    $.type(c) === NUMBER && c >= 0 && c < colTotal) {
                    var rectGeometry = new geometry.Rect(
                        [
                            (c * width) / colTotal, // left or x
                            (r * height) / rowTotal // top or y
                        ],
                        [
                            width / colTotal, // width
                            height / rowTotal // height
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
             * @param r
             * @param c
             * @param char
             * @private
             */
            _getCharText: function (r, c, char) {
                var that = this;
                var element = that.element;
                var height = element.height();
                var width = element.width();
                var options = that.options;
                var colTotal = options.columns;
                var rowTotal = options.rows;
                if ($.type(c) === NUMBER && c >= 0 && c < colTotal &&
                    $.type(r) === NUMBER && r >= 0 && r < rowTotal &&
                    $.type(char) === STRING && char.length === 1) {
                    var fontSize = Math.floor(0.75 * height / rowTotal);
                    var params = {
                        font:  fontSize + 'px "Open Sans", sans-serif',
                        stroke: that.isLocked(r, c) ? { color: options.lockedColor, width: 1 } : { color: options.valueColor, width: 1 },
                        fill: that.isLocked(r, c) ? { color: options.lockedColor } : { color: options.valueColor }
                    };
                    var text = new drawing.Text(char, new geometry.Point(0, 0), params);
                    var size = text.bbox().size;
                    var position = new geometry.Point(
                        (c + 1 / 2) * width / colTotal - size.width / 2,
                        (r + 1 / 2) * height / rowTotal - size.height / 2
                    );
                    text.position(position);
                    return text;
                }
            },

            /* Blocks are nested too deeply. */
            /* jshint -W073 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Draw cell values
             * @private
             */
            _drawCellValues: function () {
                /* jshint maxcomplexity: 9 */
                var that = this;
                var options = that.options;
                var rowTotal = options.rows;
                var colTotal = options.columns;
                var locked = options.locked;
                var chars = new drawing.Group();
                // columns
                for (var r = 0; r < rowTotal; r++) {
                    var row = that._value[r];
                    if (util.isArray(row)) {
                        for (var c = 0; c < colTotal; c++) {
                            if (row[c] === options.blank) { // the value is a blank
                                var blank = that._getCellRect(r, c, options.blankFill);
                                if (blank instanceof kendo.drawing.Rect) {
                                    chars.append(blank);
                                }
                            } else {
                                if (that.isLocked(r, c)) {
                                    locked = that._getCellRect(r, c, options.lockedFill);
                                    if (locked instanceof kendo.drawing.Rect) {
                                        chars.append(locked);
                                    }
                                }
                                var text = that._getCharText(r, c, row[c]);
                                if (text instanceof kendo.drawing.Text) {
                                    chars.append(text);
                                }
                            }
                        }
                    }
                }
                that.surface.draw(chars);
            },

            /* jshint +W074 */
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
             * @param r
             * @param c
             */
            select: function (r, c) {
                assert.type(NUMBER, r, kendo.format(assert.messages.type.default, 'r', NUMBER));
                assert.type(NUMBER, c, kendo.format(assert.messages.type.default, 'c', NUMBER));
                var that = this;
                var options = that.options;
                var rowTotal = options.rows;
                var colTotal = options.columns;
                if ((r >= 0 && r < rowTotal) && (c >= 0 && c < colTotal) && !that.isLocked(r, c)) {
                    var scroll = {
                        left: $(window).scrollLeft(),
                        top: $(window).scrollTop()
                    };
                    that._selectedCell = { col: c, row: r };
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
                var rowTotal = options.rows;
                var colTotal = options.columns;
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
                var r = Math.floor((height / 2 - pos.x * Math.sin(rotate) + pos.y * Math.cos(rotate)) * rowTotal / height);
                var c = Math.floor((width / 2 + pos.x * Math.cos(rotate) + pos.y * Math.sin(rotate)) * colTotal / width);
                that.select(r, c);
                e.preventDefault();
                e.stopPropagation();
                return false;
            },

            /*  This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

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
                // Note: on Android devices most keys would send keyCode 229, but backspace sends 8 as expected
                var that = this;
                var options = that.options;
                var colTotal = options.columns;
                var rowTotal = options.rows;
                var c = that._selectedCell && that._selectedCell.col;
                var r = that._selectedCell && that._selectedCell.row;
                if ($.type(r) === NUMBER && r >= 0 && r < rowTotal &&
                    $.type(c) === NUMBER && c >= 0 && c < colTotal) {
                    var captured = false;
                    if (e.which === 37 && c > 0 && !that.isLocked(r, c - 1)) { // Arrow left
                        that.select(r, c - 1);
                        captured = true;
                    } else if (e.which === 38 && r > 0 && !that.isLocked(r - 1, c)) { // Arrow up
                        that.select(r - 1, c);
                        captured = true;
                    } else if (e.which === 39 && c < colTotal - 1 && !that.isLocked(r, c + 1)) { // Arrow right
                        that.select(r, c + 1);
                        captured = true;
                    } else if (e.which === 40 && r < rowTotal - 1 && !that.isLocked(r + 1, c)) { // Arrow down
                        that.select(r + 1, c);
                        captured = true;
                    } else if ((e.which === 8 || e.which === 32 || e.which === 46) && !that.isLocked(r, c)) { // Backspace, Space or Delete
                        that.cellValue(r, c, null);
                        captured = true;
                    }
                    if (captured) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            },

            /* jshint +W074 */

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
                var colTotal = options.columns;
                var rowTotal = options.rows;
                var c = that._selectedCell && that._selectedCell.col;
                var r = that._selectedCell && that._selectedCell.row;
                if ($.type(c) === NUMBER && c >= 0 && c < colTotal &&
                    $.type(r) === NUMBER && r >= 0 && r < rowTotal) {
                    var whitelist = (options.whitelist || '').trim();
                    var rx = new RegExp(kendo.format(RX_WHITELIST, whitelist), 'i');
                    var char = String.fromCharCode(e.which);
                    if (rx.test(char)) {
                        that.cellValue(r, c, char);
                    }
                }
                // No need to fill the input and KeyUp won't fire
                e.preventDefault();
                e.stopPropagation();
            },

            /**
             * Input event handler
             * Note: the keypress event is not fired on Android devices and both keydown and keyup receive keyCode 229
             * Our workaround uses the input event
             * @param e
             * @private
             */
            _onInput: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.ok(this.input.is(':focus'), '`this.input` is expected to have focus');
                var value = $(e.currentTarget).val();
                if (value.length) {
                    e.which = value.charCodeAt(0);
                    this._onKeyPress(e);
                    $(e.currentTarget).val('');
                }
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
                // unbind events
                that.enable(false);
                // release references
                that.surface = undefined;
                that.input = undefined;
                that._selectedCell = undefined;
                // destroy kendo
                Widget.fn.destroy.call(that);
                kendo.destroy(element);
                // remove widget class
                element.removeClass(WIDGET_CLASS);
            }

        });

        /**
         * Add a method for CharGridAdapter
         * @param rowTotal
         * @param colTotal
         * @param whitelist
         * @param layout
         * @param data
         * @private
         */
        CharGrid._getCharGridArray = function (rowTotal, colTotal, whitelist, layout, data) {
            assert.type(NUMBER, rowTotal, kendo.format(assert.messages.type.default, 'rowTotal', NUMBER));
            assert.type(NUMBER, colTotal, kendo.format(assert.messages.type.default, 'colTotal', NUMBER));
            assert.type(STRING, whitelist, kendo.format(assert.messages.type.default, 'whitelist', STRING));
            var ret = [];
            var rx = new RegExp(kendo.format(RX_WHITELIST, whitelist), 'i');
            for (var r = 0; r < rowTotal; r++) {
                ret[r] = [];
                for (var c = 0; c < colTotal; c++) {
                    ret[r][c] = null;
                    // First fill with data assuming values are whitelisted
                    if (util.isArray(data) && util.isArray(data[r]) && rx.test(data[r][c])) {
                        ret[r][c] = data[r][c];
                    }
                    // Then impose layout
                    if (util.isArray(layout) && util.isArray(layout[r]) && $.type(layout[r][c]) === STRING) {
                        ret[r][c] = layout[r][c];
                    }
                }
            }
            return ret;
        };

        kendo.ui.plugin(CharGrid);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
