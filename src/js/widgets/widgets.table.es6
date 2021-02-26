/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    toString,
    ui: { plugin, Widget },
} = window.kendo;
const logger = new Logger('widgets.table');
const WIDGET_CLASS = 'kj-table'; // 'k-widget kj-table';
const DEFAULTS = {
    COLUMN_WIDTH: 150,
    ROW_HEIGHT: 58,
    FONT_SIZE: 12, // ATTENTION: We use 48, but the spreadsheet default is actually 12
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
    init(element, options = {}) {
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
        value: [{}],
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
            position: 'relative',
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
        /*
        <div class="k-spreadsheet-data" style="position: relative; left: 32px; top: 20px;"><div class="k-spreadsheet-vaxis" style="left: 0px; height: 464px;"></div><div class="k-spreadsheet-vaxis" style="left: 150px; height: 464px;"></div><div class="k-spreadsheet-vaxis" style="left: 300px; height: 464px;"></div><div class="k-spreadsheet-vaxis" style="left: 450px; height: 464px;"></div><div class="k-spreadsheet-vaxis" style="left: 600px; height: 464px;"></div><div class="k-spreadsheet-vaxis" style="left: 750px; height: 464px;"></div><div class="k-spreadsheet-haxis" style="top: 0px; width: 750px;"></div><div class="k-spreadsheet-haxis" style="top: 58px; width: 750px;"></div><div class="k-spreadsheet-haxis" style="top: 116px; width: 750px;"></div><div class="k-spreadsheet-haxis" style="top: 174px; width: 750px;"></div><div class="k-spreadsheet-haxis" style="top: 232px; width: 750px;"></div><div class="k-spreadsheet-haxis" style="top: 290px; width: 750px;"></div><div class="k-spreadsheet-haxis" style="top: 348px; width: 750px;"></div><div class="k-spreadsheet-haxis" style="top: 406px; width: 750px;"></div><div class="k-spreadsheet-haxis" style="top: 464px; width: 750px;"></div><div class="k-spreadsheet-cell" style="font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; left: 1px; top: 1px; width: 149px; height: 57px; text-align: right;"><div class="k-vertical-align-bottom"><span>154</span></div></div><div class="k-spreadsheet-cell" style="left: 151px; top: 1px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="left: 301px; top: 1px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="left: 451px; top: 1px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell k-spreadsheet-active-cell k-left k-single" style="left: 1px; top: 59px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="left: 151px; top: 59px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 59px; left: 301px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 59px; left: 451px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 117px; left: 1px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 117px; left: 151px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 117px; left: 301px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 117px; left: 451px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 175px; left: 1px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 175px; left: 151px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 175px; left: 301px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 175px; left: 451px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 233px; left: 1px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 233px; left: 151px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 233px; left: 301px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-cell" style="top: 233px; left: 451px; height: 57px; font-family: Arial; font-size: 36px; white-space: pre; overflow-wrap: normal; width: 149px; text-align: right;"><div class="k-vertical-align-bottom"><span>142</span></div></div><div class="k-spreadsheet-vborder" style="top: 0px; left: 0px; border-width: 1px; border-color: rgb(0, 0, 0); height: 291px;"></div><div class="k-spreadsheet-vborder" style="top: 0px; left: 150px; border-width: 1px; border-color: rgb(0, 0, 0); height: 291px;"></div><div class="k-spreadsheet-vborder" style="top: 0px; left: 300px; border-width: 1px; border-color: rgb(0, 0, 0); height: 291px;"></div><div class="k-spreadsheet-vborder" style="top: 0px; left: 450px; border-width: 1px; border-color: rgb(0, 0, 0); height: 291px;"></div><div class="k-spreadsheet-vborder" style="top: 0px; left: 600px; border-width: 1px; border-color: rgb(0, 0, 0); height: 291px;"></div><div class="k-spreadsheet-hborder" style="top: 0px; left: 0px; width: 600px; border-width: 1px; border-color: rgb(0, 0, 0);"></div><div class="k-spreadsheet-hborder" style="top: 58px; left: 0px; width: 600px; border-width: 1px; border-color: rgb(0, 0, 0);"></div><div class="k-spreadsheet-hborder" style="top: 116px; left: 0px; width: 600px; border-width: 1px; border-color: rgb(0, 0, 0);"></div><div class="k-spreadsheet-hborder" style="top: 174px; left: 0px; width: 600px; border-width: 1px; border-color: rgb(0, 0, 0);"></div><div class="k-spreadsheet-hborder" style="top: 232px; left: 0px; width: 600px; border-width: 1px; border-color: rgb(0, 0, 0);"></div><div class="k-spreadsheet-hborder" style="top: 290px; left: 0px; width: 600px; border-width: 1px; border-color: rgb(0, 0, 0);"></div></div>
        */

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
        const rowFinder = (row) => row.index === rowIndex;
        const columnFinder = (column) => column.index === columnIndex;
        for (rowIndex = 0; rowIndex < rowTotal; rowIndex++) {
            ret.push([]);
            const row = ret[rowIndex];
            const rowDefinition = rowDefinitions.find(rowFinder) || {
                cells: [],
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
                            width,
                        },
                    });
                } else {
                    row.push({
                        value: cellDefinition.value,
                        format: cellDefinition.format,
                        css: {
                            backgroundColor: cellDefinition.background,
                            borderBottom: cellDefinition.borderBottom
                                ? `solid ${cellDefinition.borderBottom.size}px ${cellDefinition.borderBottom.color}`
                                : undefined,
                            borderLeft: cellDefinition.borderLeft
                                ? `solid ${cellDefinition.borderLeft.size}px ${cellDefinition.borderLeft.color}`
                                : undefined,
                            borderRight: cellDefinition.borderRight
                                ? `solid ${cellDefinition.borderRight.size}px ${cellDefinition.borderRight.color}`
                                : undefined,
                            borderTop: cellDefinition.borderTop
                                ? `solid ${cellDefinition.borderTop.size}px ${cellDefinition.borderTop.color}`
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
                                    : 'normal',
                        },
                        class: `k-vertical-align-${
                            cellDefinition.verticalAlign || 'bottom'
                        }`,
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
        const {
            element,
            options: { columns, rows },
        } = this;
        element.empty();
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const data = this._value[i][j];
                const $cell = $(`<${CONSTANTS.DIV}/>`)
                    .addClass('k-spreadsheet-data')
                    .css(data.css);
                let htmlContent = `<${CONSTANTS.DIV} class="${
                    data.class || ''
                }">`;
                if ($.type(data.value) === CONSTANTS.UNDEFINED) {
                    htmlContent += '&nbsp';
                } else if (!Number.isNaN(parseFloat(data.value))) {
                    htmlContent += `<${CONSTANTS.SPAN}>${toString(
                        data.value,
                        data.format
                    )}</${CONSTANTS.SPAN}>`;
                } else {
                    htmlContent += data.value;
                }
                htmlContent += `</${CONSTANTS.DIV}>`;
                $cell.html(htmlContent).appendTo(element);
            }
        }
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        Widget.fn.destroy.call(this);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
        destroy(this.element);
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'Table')) {
    // Prevents loading several times in karma
    plugin(Table);
}
