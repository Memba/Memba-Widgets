/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.color';
import 'kendo.drawing';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import {
    getElementCenter,
    getMousePosition,
    getTransformRotation,
    getTransformScale
} from '../common/window.position.es6';
import { isAnyArray } from '../common/window.util.es6';

const {
    destroy,
    drawing: { Group, Path, Rect, Surface, Text },
    format,
    geometry,
    ns,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.chargrid');

const NS = '.kendoCharGrid';
const WIDGET_CLASS = /* 'k-widget */ 'kj-chargrid';
// var BASE_CODE = 65; // for A (a = 97)
const RX_WHITELIST = '^[{0}]$';
const STROKE_WIDTH = 2;

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

// TODO: 3 things that need to be done:
// https://github.com/kidoju/Kidoju-Widgets/issues/90
// https://github.com/kidoju/Kidoju-Widgets/issues/91
// https://github.com/kidoju/Kidoju-Widgets/issues/92

/**
 * CharGrid
 * @class CharGrid Widget (kendoCharGrid)
 */
const CharGrid = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._setValue(this.options.value);
        this._render();
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'CharGrid',
        scaler: 'div.kj-stage',
        container: `div.kj-stage>div[data-${ns}role="stage"]`,
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
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Initialize value
     * @private
     */
    _setValue(value) {
        const { columns, locked, rows, whitelist } = this.options;
        const rxWhitelist = new RegExp(
            format(RX_WHITELIST, (whitelist || '').trim()),
            'i'
        );
        this._value = [];
        for (let r = 0; r < rows; r++) {
            this._value.push(new Array(rows));
            for (let c = 0; c < columns; c++) {
                if (
                    isAnyArray(locked) &&
                    isAnyArray(locked[r]) &&
                    locked[r][c]
                ) {
                    this._value[r][c] = `${locked[r][c]}`;
                } else if (
                    isAnyArray(value) &&
                    isAnyArray(value[r]) &&
                    rxWhitelist.test(`${value[r][c]}`)
                ) {
                    this._value[r][c] = `${value[r][c]}`;
                } else {
                    this._value[r][c] = null;
                }
            }
        }
    },

    /**
     * Compare values
     * @param value1
     * @param value2
     * @private
     */
    _compareValues(value1, value2) {
        if (!isAnyArray(value1) || !isAnyArray(value2)) {
            return false;
        }
        if (value1.length !== value2.length) {
            return false;
        }
        for (let r = 0, rowTotal = value1.length; r < rowTotal; r++) {
            if (!isAnyArray(value1[r]) || !isAnyArray(value2[r])) {
                return false;
            }
            if (value1[r].length !== value2[r].length) {
                return false;
            }
            for (let c = 0, colTotal = value1[r].length; c < colTotal; c++) {
                if (value1[r][c] !== value2[r][c]) {
                    return false;
                }
            }
        }
        return true;
    },

    /**
     * Value for MVVM binding
     * @param value
     */
    value(value) {
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._compareValues(this._value, this.options.locked)
                ? null
                : this._value;
        } else if (!this._compareValues(this._value, value)) {
            this._setValue(value || '');
            this.refresh();
        }
        return ret;
    },

    /**
     * Get/set cell value
     * @param r
     * @param c
     * @param value
     */
    cellValue(r, c, value) {
        assert.type(
            CONSTANTS.NUMBER,
            r,
            assert.format(assert.messages.type.default, 'r', CONSTANTS.NUMBER)
        );
        assert.type(
            CONSTANTS.NUMBER,
            c,
            assert.format(assert.messages.type.default, 'c', CONSTANTS.NUMBER)
        );
        const { whitelist } = this.options;
        const rxWhitelist = new RegExp(
            format(RX_WHITELIST, (whitelist || '').trim()),
            'i'
        );
        const rowValues = this._value[r];
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            if (isAnyArray(rowValues) && rxWhitelist.test(rowValues[c])) {
                ret = rowValues[c];
            }
        } else if ($.type(value) === CONSTANTS.NULL) {
            if (rowValues[c] !== null) {
                rowValues[c] = null;
                this.refresh();
                this.trigger(CONSTANTS.CHANGE);
            }
        } else if ($.type(value) === CONSTANTS.STRING && value.length === 1) {
            if (this.isLocked(r, c)) {
                throw new Error('Cannot assign a new value to a locked cell');
            } else if (rowValues[c] !== value && rxWhitelist.test(value)) {
                rowValues[c] = value.toUpperCase();
                this.refresh();
                this.trigger(CONSTANTS.CHANGE);
            }
            // discard any value that is not whitelisted
        } else {
            throw new TypeError(
                '`value` is expected to be a single char string'
            );
        }
        return ret;
    },

    /**
     * Get cell locked state
     * @param r
     * @param c
     */
    isLocked(r, c) {
        assert.type(
            CONSTANTS.NUMBER,
            r,
            assert.format(assert.messages.type.default, 'r', CONSTANTS.NUMBER)
        );
        assert.type(
            CONSTANTS.NUMBER,
            c,
            assert.format(assert.messages.type.default, 'c', CONSTANTS.NUMBER)
        );
        const { blank, columns, locked, rows } = this.options;
        return (
            r >= 0 &&
            r < rows &&
            c >= 0 &&
            c < columns &&
            isAnyArray(locked) &&
            isAnyArray(locked[r]) &&
            !!locked[r][c] &&
            this.cellValue(r, c) !== blank
        );
    },

    /**
     * Builds the widget layout
     * @private
     */
    _render() {
        const { element, options } = this;
        this.wrapper = element;
        // CONSTANTS.INTERACTIVE_CLASS (which might be shared with other widgets) is used to position any drawing surface underneath interactive widgets
        element.addClass(WIDGET_CLASS).addClass(CONSTANTS.INTERACTIVE_CLASS);
        this.surface = Surface.create(element);
        // Note: we need an input to trigger the virtual keyboard on mobile devices
        this.input = $(
            '<input type="text" style="position:absolute;left:-5000px;">'
        ).prependTo(element);
        this.enable(options.enable);
        this.refresh();
    },

    /**
     * Enables/disables the grid
     * @param enabled
     */
    enable(enabled) {
        const { element, input } = this;
        element.off(NS);
        input.off(NS);
        if (enabled) {
            // Note: we handle the mouseup on the DOM element, not the drawing surface
            // Note: We need mouseup to occur after the blur event herebelow when changing cells
            element.on(
                `${CONSTANTS.MOUSEUP + NS} ${CONSTANTS.TOUCHEND}${NS}`,
                this._onMouseUp.bind(this)
            );
            input
                .on(CONSTANTS.KEYDOWN + NS, this._onKeyDown.bind(this))
                .on(CONSTANTS.KEYPRESS + NS, this._onKeyPress.bind(this))
                .on(CONSTANTS.INPUT + NS, this._onInput.bind(this))
                .on(CONSTANTS.BLUR + NS, this._onBlur.bind(this));
        }
    },

    /**
     * Draw the grid
     * @private
     */
    _drawGrid() {
        const { element } = this;
        const height = element.height();
        const width = element.width();
        const { columns, gridFill, gridStroke, rows } = this.options;
        const grid = new Group();
        const rectGeometry = new geometry.Rect([0, 0], [width, height]);
        grid.append(
            new Rect(rectGeometry, {
                fill: { color: gridFill },
                stroke: { color: gridStroke, width: STROKE_WIDTH }
            })
        );
        // rows
        for (let row = 1; row < rows; row++) {
            grid.append(
                new Path({
                    stroke: { color: gridStroke, width: STROKE_WIDTH }
                })
                    .moveTo(0, (height * row) / rows)
                    .lineTo(width, (height * row) / rows)
            );
        }
        // columns
        for (let col = 1; col < columns; col++) {
            grid.append(
                new Path({
                    stroke: { color: gridStroke, width: STROKE_WIDTH }
                })
                    .moveTo((width * col) / columns, 0)
                    .lineTo((width * col) / columns, height)
            );
        }
        this.surface.draw(grid);
    },

    /**
     * Draw the selected cell
     * @private
     */
    _drawSelectedCell() {
        const { selectedFill } = this.options;
        const { col, row } = this._selectedCell || {};
        const rect = this._getCellRect(row, col, selectedFill);
        if (rect) {
            this.surface.draw(rect);
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
    _getCellRect(r, c, fillColor) {
        const { element } = this;
        const height = element.height();
        const width = element.width();
        const { columns, gridStroke, rows } = this.options;
        let rect;
        if (
            $.type(r) === CONSTANTS.NUMBER &&
            r >= 0 &&
            r < rows &&
            $.type(c) === CONSTANTS.NUMBER &&
            c >= 0 &&
            c < columns
        ) {
            const rectGeometry = new geometry.Rect(
                [
                    (c * width) / columns, // left or x
                    (r * height) / rows // top or y
                ],
                [
                    width / columns, // width
                    height / rows // height
                ]
            );
            rect = new Rect(rectGeometry, {
                fill: { color: fillColor },
                stroke: { color: gridStroke, width: STROKE_WIDTH }
            });
        }
        return rect;
    },

    /**
     * Get a char to draw
     * @see http://docs.telerik.com/kendo-ui/api/javascript/drawing/text
     * @param r
     * @param c
     * @param char
     * @private
     */
    _getCharText(r, c, char) {
        const { element } = this;
        const height = element.height();
        const width = element.width();
        const { columns, lockedColor, rows, valueColor } = this.options;
        let text;
        if (
            $.type(c) === CONSTANTS.NUMBER &&
            c >= 0 &&
            c < columns &&
            $.type(r) === CONSTANTS.NUMBER &&
            r >= 0 &&
            r < rows &&
            $.type(char) === CONSTANTS.STRING &&
            char.length === 1
        ) {
            const fontSize = Math.floor((0.75 * height) / rows);
            const params = {
                font: `${fontSize}px "Open Sans", sans-serif`,
                stroke: this.isLocked(r, c)
                    ? { color: lockedColor, width: 1 }
                    : { color: valueColor, width: 1 },
                fill: this.isLocked(r, c)
                    ? { color: lockedColor }
                    : { color: valueColor }
            };
            text = new Text(char, new geometry.Point(0, 0), params);
            const { size } = text.bbox();
            const position = new geometry.Point(
                ((c + 1 / 2) * width) / columns - size.width / 2,
                ((r + 1 / 2) * height) / rows - size.height / 2
            );
            text.position(position);
        }
        return text;
    },

    /**
     * Draw cell values
     * @private
     */
    _drawCellValues() {
        const that = this;
        const { options } = that;
        const rowTotal = options.rows;
        const colTotal = options.columns;
        let { locked } = options;
        const chars = new Group();
        // columns
        for (let r = 0; r < rowTotal; r++) {
            const row = that._value[r];
            if (isAnyArray(row)) {
                for (let c = 0; c < colTotal; c++) {
                    if (row[c] === options.blank) {
                        // the value is a blank
                        const blank = that._getCellRect(
                            r,
                            c,
                            options.blankFill
                        );
                        if (blank instanceof Rect) {
                            chars.append(blank);
                        }
                    } else {
                        if (that.isLocked(r, c)) {
                            locked = that._getCellRect(
                                r,
                                c,
                                options.lockedFill
                            );
                            if (locked instanceof Rect) {
                                chars.append(locked);
                            }
                        }
                        const text = that._getCharText(r, c, row[c]);
                        if (text instanceof Text) {
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
    refresh() {
        assert.instanceof(
            Surface,
            this.surface,
            assert.format(
                assert.messages.instanceof.default,
                'this.surface',
                'kendo.drawing.Surface'
            )
        );
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
    select(r, c) {
        assert.type(
            CONSTANTS.NUMBER,
            r,
            assert.format(assert.messages.type.default, 'r', CONSTANTS.NUMBER)
        );
        assert.type(
            CONSTANTS.NUMBER,
            c,
            assert.format(assert.messages.type.default, 'c', CONSTANTS.NUMBER)
        );
        const { columns, rows } = this.options;
        if (
            r >= 0 &&
            r < rows &&
            (c >= 0 && c < columns) &&
            !this.isLocked(r, c)
        ) {
            const scroll = {
                left: $(window).scrollLeft(),
                top: $(window).scrollTop()
            };
            this._selectedCell = { col: c, row: r };
            this.input.focus();
            // that.input.select();
            // Note: that.input.focus() triggers a scroll, so we need to fix that
            // that.input.select() behaves like focus in Firefox and IE/Edge, so it also requires fixing scroll
            // TODO: This is not working properly in IE and Edge where scrolling occurs anyway - https://github.com/kidoju/Kidoju-Widgets/issues/119
            // Note: the scroll event is not cancelable with e.preventDefault()
            $(window).scrollLeft(scroll.left);
            $(window).scrollTop(scroll.top);
        } else {
            this._selectedCell = undefined;
            if (this.input.is(':focus')) {
                // This is called from _onBlur so we need to prevent a stack overflow
                this.input.blur();
            }
        }
        this.refresh();
    },

    /**
     * MouseUp event handler
     * Note: we need mouseup to occur after the blur event on the concealed input
     * @param e
     * @private
     */
    _onMouseUp(e) {
        const that = this;
        const { element } = that;
        const height = element.height();
        const width = element.width();
        const { options } = that;
        const rowTotal = options.rows;
        const colTotal = options.columns;
        const container = that.element.closest(options.container);
        assert.hasLength(
            container,
            assert.format(assert.messages.hasLength.default, 'container')
        );
        const rotator = that.element.closest(options.rotator);
        const rotate = (getTransformRotation(rotator) * Math.PI) / 180;
        const scaler = that.element.closest(options.scaler);
        const scale = scaler.length ? getTransformScale(scaler) : 1;
        // Find the center of the chargrid, which is the center of rotation of the wrapping kj-element
        const center = getElementCenter(element, container, scale);
        // Get the mouse position
        const mouse = getMousePosition(e, container);
        // Find the mouse coordinates against the center
        const pos = {
            x: mouse.x / scale - center.left,
            y: mouse.y / scale - center.top
        };
        // Project the mouse coordinates to annihilate the rotation and find col and row
        const r = Math.floor(
            ((height / 2 -
                pos.x * Math.sin(rotate) +
                pos.y * Math.cos(rotate)) *
                rowTotal) /
                height
        );
        const c = Math.floor(
            ((width / 2 + pos.x * Math.cos(rotate) + pos.y * Math.sin(rotate)) *
                colTotal) /
                width
        );
        that.select(r, c);
        e.preventDefault();
        e.stopPropagation();
        return false;
    },

    /**
     * KeyDown event handler
     * Note: Delete and arrows only trigger the keydown event
     * @param e
     * @private
     */
    _onKeyDown(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        assert.ok(
            this.input.is(':focus'),
            '`this.input` is expected to have focus'
        );
        // Note: on Android devices most keys would send keyCode 229, but backspace sends 8 as expected
        const { columns, rows } = this.options;
        const c = this._selectedCell && this._selectedCell.col;
        const r = this._selectedCell && this._selectedCell.row;
        if (
            $.type(r) === CONSTANTS.NUMBER &&
            r >= 0 &&
            r < rows &&
            $.type(c) === CONSTANTS.NUMBER &&
            c >= 0 &&
            c < columns
        ) {
            let captured = false;
            if (e.which === 37 && c > 0 && !this.isLocked(r, c - 1)) {
                // Arrow left
                this.select(r, c - 1);
                captured = true;
            } else if (e.which === 38 && r > 0 && !this.isLocked(r - 1, c)) {
                // Arrow up
                this.select(r - 1, c);
                captured = true;
            } else if (
                e.which === 39 &&
                c < columns - 1 &&
                !this.isLocked(r, c + 1)
            ) {
                // Arrow right
                this.select(r, c + 1);
                captured = true;
            } else if (
                e.which === 40 &&
                r < rows - 1 &&
                !this.isLocked(r + 1, c)
            ) {
                // Arrow down
                this.select(r + 1, c);
                captured = true;
            } else if (
                (e.which === 8 || e.which === 32 || e.which === 46) &&
                !this.isLocked(r, c)
            ) {
                // Backspace, Space or Delete
                this.cellValue(r, c, null);
                captured = true;
            }
            if (captured) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    },

    /**
     * KeyPress event handler
     * Note: required to get correct values from numeric key pad
     * @param e
     * @private
     */
    _onKeyPress(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        assert.ok(
            this.input.is(':focus'),
            '`this.input` is expected to have focus'
        );
        const { columns, rows, whitelist } = this.options;
        const c = this._selectedCell && this._selectedCell.col;
        const r = this._selectedCell && this._selectedCell.row;
        if (
            $.type(c) === CONSTANTS.NUMBER &&
            c >= 0 &&
            c < columns &&
            $.type(r) === CONSTANTS.NUMBER &&
            r >= 0 &&
            r < rows
        ) {
            const rx = new RegExp(
                format(RX_WHITELIST, (whitelist || '').trim()),
                'i'
            );
            const char = String.fromCharCode(e.which);
            if (rx.test(char)) {
                this.cellValue(r, c, char);
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
    _onInput(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        assert.ok(
            this.input.is(':focus'),
            '`this.input` is expected to have focus'
        );
        const value = $(e.currentTarget).val();
        if (value.length) {
            e.which = value.charCodeAt(0);
            this._onKeyPress(e);
            $(e.currentTarget).val('');
        }
    },

    /**
     * Make sure to unselect the selected cell
     * @private
     */
    _onBlur(/* e */) {
        // relatedTarget is used to handle behaviour that is specific to IE and Edge
        // In IE and edge, if relatedTarget is an SVG Element and if this SVG element is inside the widget element, the event should be discarded
        // See https://developer.mozilla.org/en/docs/Web/API/SVGSVGElement
        // if (!(e.relatedTarget instanceof window.SVGSVGElement) || this.element.has($(e.relatedTarget)).length === 0) {
        this.select(-1, -1);
        // }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const { element } = this;
        // unbind events
        this.enable(false);
        // release references
        this.surface = undefined;
        this.input = undefined;
        this._selectedCell = undefined;
        // destroy kendo
        Widget.fn.destroy.call(this);
        destroy(element);
        // remove widget class
        element.removeClass(WIDGET_CLASS);
    }
});

/**
 * Add a method for CharGridAdapter
 * @param rows
 * @param columns
 * @param whitelist
 * @param layout
 * @param data
 * @private
 */
CharGrid._getCharGridArray = (rows, columns, whitelist, layout, data) => {
    assert.type(
        CONSTANTS.NUMBER,
        rows,
        assert.format(assert.messages.type.default, 'rows', CONSTANTS.NUMBER)
    );
    assert.type(
        CONSTANTS.NUMBER,
        columns,
        assert.format(assert.messages.type.default, 'columns', CONSTANTS.NUMBER)
    );
    assert.type(
        CONSTANTS.STRING,
        whitelist,
        assert.format(
            assert.messages.type.default,
            'whitelist',
            CONSTANTS.STRING
        )
    );
    const ret = [];
    const rx = new RegExp(format(RX_WHITELIST, whitelist), 'i');
    for (let r = 0; r < rows; r++) {
        ret[r] = [];
        for (let c = 0; c < columns; c++) {
            ret[r][c] = null;
            // First fill with data assuming values are whitelisted
            if (
                isAnyArray(data) &&
                isAnyArray(data[r]) &&
                rx.test(data[r][c])
            ) {
                ret[r][c] = data[r][c];
            }
            // Then impose layout
            if (
                isAnyArray(layout) &&
                isAnyArray(layout[r]) &&
                $.type(layout[r][c]) === CONSTANTS.STRING
            ) {
                ret[r][c] = layout[r][c];
            }
        }
    }
    return ret;
};

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'CharGrid')) {
    // Prevents loading several times in karma
    plugin(CharGrid);
}
