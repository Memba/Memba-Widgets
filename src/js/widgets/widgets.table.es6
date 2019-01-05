/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    toString,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.table');
const WIDGET_CLASS = 'kj-table'; // 'k-widget kj-table';

// var CHANGE = 'change';
const DEFAULTS = {
    COLUMN_WIDTH: 150,
    ROW_HEIGHT: 58,
    FONT_SIZE: 12 // ATTENTION: We use 48, but the spreadsheet default is actually 12
};

/**
 * Table
 * @class Table
 * @extends Widget
 */
const Table = Widget.extend({
    /**
     * Init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.value(this.options.value);
    },

    /**
     * Options
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
    value(value) {
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else {
            // TODO if changed
            this._value = this._parse(value);
            this.refresh();
        }
        return ret;
    },

    /**
     * Widget layout
     * @method _render
     * @private
     */
    _render() {
        // if (!(this.element[0] instanceof HTMLTableElement)) {
        //    throw new Error('Please use a <table/> element to initialize a kendo.ui.Table');
        // }
        this.wrapper = this.element;
        this.element.addClass(WIDGET_CLASS).css({
            position: 'relative'
            // tableLayout: 'fixed',
            // borderCollapse: 'collapse',
            // borderSpacing: 0
            // display: 'table'
        });
    },

    /**
     * Parse Kendo UI Spreadsheet JSON
     * @method _parse
     * @param value
     * @private
     */
    _parse(value) {
        const ret = [];
        const rowTotal = this.options.rows;
        const columnTotal = this.options.columns;
        const columnDefinitions =
            (value &&
                value.sheets &&
                value.sheets.length &&
                value.sheets[0].columns) ||
            [];
        const rowDefinitions =
            (value &&
                value.sheets &&
                value.sheets.length &&
                value.sheets[0].rows) ||
            [];
        let height;
        let left = 0;
        let top = 0;
        let width;
        let rowIndex;
        let columnIndex;
        const rowFinder = function(item) {
            return item.index === rowIndex;
        };
        const columnFinder = function(item) {
            return item.index === columnIndex;
        };
        for (rowIndex = 0; rowIndex < rowTotal; rowIndex++) {
            ret.push([]);
            const row = ret[rowIndex];
            const rowDefinition = rowDefinitions.find(rowFinder) || {
                cells: []
            };
            for (columnIndex = 0; columnIndex < columnTotal; columnIndex++) {
                const cellDefinition = rowDefinition.cells.find(columnFinder);
                const columnDefinition = columnDefinitions.find(columnFinder);
                height =
                    (rowDefinition && rowDefinition.height) ||
                    DEFAULTS.ROW_HEIGHT;
                width =
                    (columnDefinition && columnDefinition.width) ||
                    DEFAULTS.COLUMN_WIDTH;
                if ($.type(cellDefinition) === CONSTANTS.UNDEFINED) {
                    row.push({
                        css: {
                            left,
                            height,
                            top,
                            width
                        }
                    });
                } else {
                    row.push({
                        value: cellDefinition.value,
                        format: cellDefinition.format,
                        css: {
                            backgroundColor: cellDefinition.background,
                            borderBottom: cellDefinition.borderBottom
                                ? `solid ${
                                    cellDefinition.borderBottom.size
                                }px ${cellDefinition.borderBottom.color}`
                                : undefined,
                            borderLeft: cellDefinition.borderLeft
                                ? `solid ${cellDefinition.borderLeft.size}px ${
                                    cellDefinition.borderLeft.color
                                }`
                                : undefined,
                            borderRight: cellDefinition.borderRight
                                ? `solid ${cellDefinition.borderRight.size}px ${
                                    cellDefinition.borderRight.color
                                }`
                                : undefined,
                            borderTop: cellDefinition.borderTop
                                ? `solid ${cellDefinition.borderTop.size}px ${
                                    cellDefinition.borderTop.color
                                }`
                                : undefined,
                            color: cellDefinition.color,
                            fontFamily: cellDefinition.fontFamily || 'Arial',
                            fontSize:
                                cellDefinition.fontSize || DEFAULTS.FONT_SIZE,
                            fontStyle: cellDefinition.italic
                                ? 'italic'
                                : 'normal',
                            fontWeight: cellDefinition.bold ? 'bold' : 'normal',
                            left,
                            height,
                            textAlign:
                                cellDefinition.textAlign ||
                                (Number.isNaN(parseFloat(cellDefinition.value))
                                    ? 'left'
                                    : 'right'), // TODO: Dates parse as numbers but are left aligned by default
                            textDecoration: cellDefinition.underline
                                ? 'underline'
                                : 'none',
                            top,
                            // verticalAlign: cellDefinition.verticalAlign === 'center' ? 'middle' : (cellDefinition.verticalAlign || 'bottom'),
                            width,
                            // we need to test true because when undefined cellDefinition.wrap is actually a function
                            whiteSpace:
                                cellDefinition.wrap === true
                                    ? 'pre-wrap'
                                    : 'pre',
                            wordBreak:
                                cellDefinition.wrap === true
                                    ? 'break-all'
                                    : 'normal'
                        },
                        class: `k-vertical-align-${cellDefinition.verticalAlign ||
                            'bottom'}`
                    });
                }
                left += width;
            }
            left = 0;
            top += height;
        }
        return ret;
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        const element = this.element;
        const rowTotal = this.options.rows;
        const columnTotal = this.options.columns;
        element.empty();
        for (let i = 0; i < rowTotal; i++) {
            for (let j = 0; j < columnTotal; j++) {
                const cell = this._value[i][j];
                const cellElement = $('<DIV/>')
                    .addClass('k-spreadsheet-cell')
                    .css(cell.css);
                let cellContent = `<DIV class="${cell.class}">`;
                if ($.type(cell.value) === CONSTANTS.UNDEFINED) {
                    cellContent += '&nbsp';
                } else if (!Number.isNaN(parseFloat(cell.value))) {
                    cellContent += `<span>${toString(
                        cell.value,
                        cell.format
                    )}</span>`;
                } else {
                    cellContent += cell.value;
                }
                cellContent += '</DIV>';
                cellElement.html(cellContent).appendTo(element);
            }
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        Widget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(Table);
