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

const INTERACTIVE_CLASS = 'kj-interactive';
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
    init(element, options) {
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
        const that = this;
        const options = this.options;
        const colTotal = options.columns;
        const rowTotal = options.rows;
        const locked = options.locked;
        const blank = options.blank;
        const whitelist = (options.whitelist || '').trim();
        const rx = new RegExp(format(RX_WHITELIST, whitelist), 'i');
        that._value = [];
        for (let r = 0; r < rowTotal; r++) {
            that._value.push(new Array(rowTotal));
            for (let c = 0; c < colTotal; c++) {
                if (
                    isAnyArray(locked) &&
                    isAnyArray(locked[r]) &&
                    locked[r][c]
                ) {
                    that._value[r][c] = `${locked[r][c]}`;
                } else if (
                    isAnyArray(value) &&
                    isAnyArray(value[r]) &&
                    rx.test(`${value[r][c]}`)
                ) {
                    that._value[r][c] = `${value[r][c]}`;
                } else {
                    that._value[r][c] = null;
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
        const that = this;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            return that._compareValues(that._value, that.options.locked)
                ? null
                : that._value;
        }
        if (!that._compareValues(that._value, value)) {
            that._setValue(value || '');
            that.refresh();
        }
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
        const that = this;
        const options = that.options;
        const whitelist = (options.whitelist || '').trim();
        const rx = new RegExp(format(RX_WHITELIST, whitelist), 'i');
        const row = that._value[r];
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            if (isAnyArray(row) && rx.test(row[c])) {
                return row[c];
            }
        } else if ($.type(value) === CONSTANTS.NULL) {
            if (row[c] !== null) {
                row[c] = null;
                that.refresh();
                that.trigger(CONSTANTS.CHANGE);
            }
        } else if ($.type(value) === CONSTANTS.STRING && value.length === 1) {
            if (that.isLocked(r, c)) {
                throw new Error('Cannot assign a new value to a locked cell');
            } else if (row[c] !== value && rx.test(value)) {
                row[c] = value.toUpperCase();
                that.refresh();
                that.trigger(CONSTANTS.CHANGE);
            }
            // discard any value that is not whitelisted
        } else {
            throw new TypeError(
                '`value` is expected to be a single char string'
            );
        }
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
        const that = this;
        const options = that.options;
        const colTotal = options.columns;
        const rowTotal = options.rows;
        const blank = options.blank;
        const locked = options.locked;
        return (
            r >= 0 &&
            r < rowTotal &&
            c >= 0 &&
            c < colTotal &&
            isAnyArray(locked) &&
            isAnyArray(locked[r]) &&
            !!locked[r][c] &&
            that.cellValue(r, c) !== blank
        );
    },

    /**
     * Builds the widget layout
     * @private
     */
    _render() {
        const { element, options } = this;
        this.wrapper = element;
        // INTERACTIVE_CLASS (which might be shared with other widgets) is used to position any drawing surface underneath interactive widgets
        element.addClass(WIDGET_CLASS).addClass(INTERACTIVE_CLASS);
        this.surface = Surface.create(this.element);
        // Note: we need an input to trigger the virtual keyboard on mobile devices
        this.input = $(
            '<input type="text" style="position:absolute;left:-5000px;">'
        ).prependTo(this.element);
        this.enable(options.enable);
        this.refresh();
    },

    /**
     * Enables/disables the grid
     * @param enabled
     */
    enable(enabled) {
        const that = this;
        const element = that.element;
        const input = that.input;
        element.off(NS);
        input.off(NS);
        if (enabled) {
            // Note: we handle the mouseup on the DOM element, not the drawing surface
            // Note: We need mouseup to occur after the blur event herebelow when changing cells
            element.on(
                `${CONSTANTS.MOUSEUP + NS} ${CONSTANTS.TOUCHEND}${NS}`,
                that._onMouseUp.bind(that)
            );
            input
                .on(CONSTANTS.KEYDOWN + NS, that._onKeyDown.bind(that))
                .on(CONSTANTS.KEYPRESS + NS, that._onKeyPress.bind(that))
                .on(CONSTANTS.INPUT + NS, that._onInput.bind(that))
                .on(CONSTANTS.BLUR + NS, that._onBlur.bind(that));
        }
    },

    /**
     * Draw the grid
     * @private
     */
    _drawGrid() {
        const that = this;
        const element = that.element;
        const height = element.height();
        const width = element.width();
        const options = that.options;
        const rowTotal = options.rows;
        const colTotal = options.columns;
        const grid = new Group();
        const rectGeometry = new geometry.Rect([0, 0], [width, height]);
        grid.append(
            new Rect(rectGeometry, {
                fill: { color: options.gridFill },
                stroke: { color: options.gridStroke, width: STROKE_WIDTH }
            })
        );
        // rows
        for (let row = 1; row < rowTotal; row++) {
            grid.append(
                new Path({
                    stroke: { color: options.gridStroke, width: STROKE_WIDTH }
                })
                    .moveTo(0, (height * row) / rowTotal)
                    .lineTo(width, (height * row) / rowTotal)
            );
        }
        // columns
        for (let col = 1; col < colTotal; col++) {
            grid.append(
                new Path({
                    stroke: { color: options.gridStroke, width: STROKE_WIDTH }
                })
                    .moveTo((width * col) / colTotal, 0)
                    .lineTo((width * col) / colTotal, height)
            );
        }
        that.surface.draw(grid);
    },

    /**
     * Draw the selected cell
     * @private
     */
    _drawSelectedCell() {
        const that = this;
        const options = that.options;
        const r = that._selectedCell && that._selectedCell.row;
        const c = that._selectedCell && that._selectedCell.col;
        const rect = that._getCellRect(r, c, options.selectedFill);
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
    _getCellRect(r, c, fillColor) {
        const that = this;
        const element = that.element;
        const height = element.height();
        const width = element.width();
        const options = that.options;
        const rowTotal = options.rows;
        const colTotal = options.columns;
        if (
            $.type(r) === CONSTANTS.NUMBER &&
            r >= 0 &&
            r < rowTotal &&
            $.type(c) === CONSTANTS.NUMBER &&
            c >= 0 &&
            c < colTotal
        ) {
            const rectGeometry = new geometry.Rect(
                [
                    (c * width) / colTotal, // left or x
                    (r * height) / rowTotal // top or y
                ],
                [
                    width / colTotal, // width
                    height / rowTotal // height
                ]
            );
            const rect = new Rect(rectGeometry, {
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
    _getCharText(r, c, char) {
        const that = this;
        const element = that.element;
        const height = element.height();
        const width = element.width();
        const options = that.options;
        const colTotal = options.columns;
        const rowTotal = options.rows;
        if (
            $.type(c) === CONSTANTS.NUMBER &&
            c >= 0 &&
            c < colTotal &&
            $.type(r) === CONSTANTS.NUMBER &&
            r >= 0 &&
            r < rowTotal &&
            $.type(char) === CONSTANTS.STRING &&
            char.length === 1
        ) {
            const fontSize = Math.floor((0.75 * height) / rowTotal);
            const params = {
                font: `${fontSize}px "Open Sans", sans-serif`,
                stroke: that.isLocked(r, c)
                    ? { color: options.lockedColor, width: 1 }
                    : { color: options.valueColor, width: 1 },
                fill: that.isLocked(r, c)
                    ? { color: options.lockedColor }
                    : { color: options.valueColor }
            };
            const text = new Text(char, new geometry.Point(0, 0), params);
            const size = text.bbox().size;
            const position = new geometry.Point(
                ((c + 1 / 2) * width) / colTotal - size.width / 2,
                ((r + 1 / 2) * height) / rowTotal - size.height / 2
            );
            text.position(position);
            return text;
        }
    },

    /**
     * Draw cell values
     * @private
     */
    _drawCellValues() {
        const that = this;
        const options = that.options;
        const rowTotal = options.rows;
        const colTotal = options.columns;
        let locked = options.locked;
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
        const that = this;
        const options = that.options;
        const rowTotal = options.rows;
        const colTotal = options.columns;
        if (
            r >= 0 &&
            r < rowTotal &&
            (c >= 0 && c < colTotal) &&
            !that.isLocked(r, c)
        ) {
            const scroll = {
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
        } else {
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
    _onMouseUp(e) {
        const that = this;
        const element = that.element;
        const height = element.height();
        const width = element.width();
        const options = that.options;
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
        const that = this;
        const options = that.options;
        const colTotal = options.columns;
        const rowTotal = options.rows;
        const c = that._selectedCell && that._selectedCell.col;
        const r = that._selectedCell && that._selectedCell.row;
        if (
            $.type(r) === CONSTANTS.NUMBER &&
            r >= 0 &&
            r < rowTotal &&
            $.type(c) === CONSTANTS.NUMBER &&
            c >= 0 &&
            c < colTotal
        ) {
            let captured = false;
            if (e.which === 37 && c > 0 && !that.isLocked(r, c - 1)) {
                // Arrow left
                that.select(r, c - 1);
                captured = true;
            } else if (e.which === 38 && r > 0 && !that.isLocked(r - 1, c)) {
                // Arrow up
                that.select(r - 1, c);
                captured = true;
            } else if (
                e.which === 39 &&
                c < colTotal - 1 &&
                !that.isLocked(r, c + 1)
            ) {
                // Arrow right
                that.select(r, c + 1);
                captured = true;
            } else if (
                e.which === 40 &&
                r < rowTotal - 1 &&
                !that.isLocked(r + 1, c)
            ) {
                // Arrow down
                that.select(r + 1, c);
                captured = true;
            } else if (
                (e.which === 8 || e.which === 32 || e.which === 46) &&
                !that.isLocked(r, c)
            ) {
                // Backspace, Space or Delete
                that.cellValue(r, c, null);
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
        const that = this;
        const options = that.options;
        const colTotal = options.columns;
        const rowTotal = options.rows;
        const c = that._selectedCell && that._selectedCell.col;
        const r = that._selectedCell && that._selectedCell.row;
        if (
            $.type(c) === CONSTANTS.NUMBER &&
            c >= 0 &&
            c < colTotal &&
            $.type(r) === CONSTANTS.NUMBER &&
            r >= 0 &&
            r < rowTotal
        ) {
            const whitelist = (options.whitelist || '').trim();
            const rx = new RegExp(format(RX_WHITELIST, whitelist), 'i');
            const char = String.fromCharCode(e.which);
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
     * @param e
     * @private
     */
    _onBlur(e) {
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
        const that = this;
        const element = that.element;
        // unbind events
        that.enable(false);
        // release references
        that.surface = undefined;
        that.input = undefined;
        that._selectedCell = undefined;
        // destroy kendo
        Widget.fn.destroy.call(that);
        destroy(element);
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
CharGrid._getCharGridArray = function(
    rowTotal,
    colTotal,
    whitelist,
    layout,
    data
) {
    assert.type(
        CONSTANTS.NUMBER,
        rowTotal,
        assert.format(
            assert.messages.type.default,
            'rowTotal',
            CONSTANTS.NUMBER
        )
    );
    assert.type(
        CONSTANTS.NUMBER,
        colTotal,
        assert.format(
            assert.messages.type.default,
            'colTotal',
            CONSTANTS.NUMBER
        )
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
    for (let r = 0; r < rowTotal; r++) {
        ret[r] = [];
        for (let c = 0; c < colTotal; c++) {
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
plugin(CharGrid);
