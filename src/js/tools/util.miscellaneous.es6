/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * Build default chart data
 * @param categories
 * @param values
 * @returns {{sheets: *[]}}
 */
const defaultChartData = (categories, values) => {
    const YEAR = 1999;
    const MAX_VALUE = 500;
    const rowTotal = values + 1;
    const columnTotal = categories + 1;
    let rowIndex;
    let columnIndex;
    const data = { sheets: [{ name: 'Sheet1', rows: [] }] };
    const { rows } = data.sheets[0];
    // Build the categories row
    let row = { index: 0, cells: [] };
    for (columnIndex = 1; columnIndex < columnTotal; columnIndex++) {
        row.cells.push({ index: columnIndex, value: YEAR + columnIndex });
    }
    rows.push(row);
    // Build the values rows
    for (rowIndex = 1; rowIndex < rowTotal; rowIndex++) {
        row = { index: rowIndex, cells: [] };
        row.cells.push({ index: 0, value: `Series${rowIndex}` });
        for (columnIndex = 1; columnIndex < columnTotal; columnIndex++) {
            row.cells.push({
                index: columnIndex,
                value: Math.floor(MAX_VALUE * Math.random()),
            });
        }
        rows.push(row);
    }
    return data;
};

/**
 * A utility function to resize spreadsheet data to a specified number of rows and columns
 * @param json
 * @param rowMax
 * @param columnMax
 */
const resizeSpreadsheetData = (json, rowMax, columnMax) => {
    let { rows } = json.sheets[0];
    const rowFilter = (row) => row.index < rowMax;
    const columnFilter = (column) => column.index < columnMax;
    rows = rows.filter(rowFilter);
    for (
        let rowIndex = 0, rowTotal = rows.length;
        rowIndex < rowTotal;
        rowIndex++
    ) {
        let { cells } = rows[rowIndex];
        cells = cells.filter(columnFilter);
        rows[rowIndex].cells = cells;
    }
    // eslint-disable-next-line no-param-reassign
    json.sheets[0].rows = rows;
    return json;
};

/**
 * Export
 */
export { defaultChartData, resizeSpreadsheetData };
