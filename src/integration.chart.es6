/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.spreadsheet';
import 'kendo.dataviz.chart';

const {
    bind,
    dataviz: {
        ui: { Chart }
    },
    observable
} = window.kendo;

const viewModel = observable({
    json: {
        activeSheet: 'Sheet1',
        /*
         sheets: [{
         name: 'Sheet1',
         rows:[
         { index: 0, cells: [{ index: 1, value: 'Series 1'}]},
         { index: 1, cells: [{ index: 0, value: 2000 }, { index: 1, value: 200 }]},
         { index: 2, cells: [{ index: 0, value: 2001 }, { index: 1, value: 450 }]},
         { index: 3, cells: [{ index: 0, value: 2002 }, { index: 1, value: 300 }]},
         { index: 4, cells: [{ index: 0, value: 2003 }, { index: 1, value: 125 }]}
         ]
         }]
         */
        sheets: [
            {
                name: 'Sheet1',
                rows: [
                    {
                        index: 0,
                        cells: [
                            { index: 1, value: 2000 },
                            { index: 2, value: 2001 },
                            { index: 3, value: 2002 },
                            { index: 4, value: 2003 }
                        ]
                    },
                    {
                        index: 1,
                        cells: [
                            { index: 0, value: 'Series 1' },
                            { index: 1, value: 200 },
                            { index: 2, value: 450 },
                            { index: 3, value: 300 },
                            { index: 4, value: 125 }
                        ]
                    },
                    {
                        index: 2,
                        cells: [
                            { index: 0, value: 'Series 2' },
                            { index: 1, value: 200 },
                            { index: 2, value: 450 },
                            { index: 3, value: 300 },
                            { index: 4, value: 125 }
                        ]
                    }
                ]
            }
        ]
    },
    json$() {
        return JSON.stringify(this.get('json'));
    },
    categories$() {
        const categories = [];
        const columnTotal = 5;
        const rowIndex = 0;
        let columnIndex;
        const rowFinder = function(row) {
            return row.index === rowIndex;
        };
        const columnFinder = function(column) {
            return column.index === columnIndex;
        };
        const json = this.get('json');
        const row = json.sheets[0].rows.find(rowFinder);
        for (columnIndex = 1; columnIndex < columnTotal; columnIndex++) {
            let category = '';
            if (row && row.cells) {
                const cell = row.cells.find(columnFinder);
                if (cell && cell.value) {
                    category = cell.value;
                }
            }
            categories.push(category);
        }
        // return [2000, 2001, 2002, 2003]
        return categories;
    },
    series$() {
        const series = [];
        const rowTotal = 3;
        const columnTotal = 5;
        let rowIndex;
        let columnIndex;
        const rowFinder = function(row) {
            return row.index === rowIndex;
        };
        const columnFinder = function(column) {
            return column.index === columnIndex;
        };
        const json = this.get('json');
        for (rowIndex = 1; rowIndex < rowTotal; rowIndex++) {
            const serie = { name: '', data: [] };
            const row = json.sheets[0].rows.find(rowFinder);
            if (row && row.cells) {
                columnIndex = 0;
                let cell = row.cells.find(columnFinder);
                if (cell && cell.value) {
                    serie.name = cell.value;
                }
                for (
                    columnIndex = 1;
                    columnIndex < columnTotal;
                    columnIndex++
                ) {
                    let data = 0;
                    cell = row.cells.find(columnFinder);
                    if (cell && $.type(cell.value) === 'number') {
                        data = cell.value;
                    }
                    serie.data.push(data);
                }
            }
            series.push(serie);
        }
        return series;
        /*
         return [
         { name: 'Series 1', data: [200, 450, 300, 125] },
         { name: 'Series 2', data: [200, 450, 300, 125] }
         ];
         */
    }
});
viewModel.bind('change', e => {
    const chartWidget = $('#chart').data('kendoChart');
    if (chartWidget instanceof Chart) {
        chartWidget.destroy();
    }
    // Chart
    $('#chart').kendoChart({
        title: {
            text: 'Kendo Chart Example'
        },
        legend: {
            position: 'bottom'
        },
        series: e.sender.series$(),
        seriesDefaults: {
            type: 'line', // 'column', // 'line' // 'column' // 'bar'
            style: 'smooth'
        },
        categoryAxis: {
            // horizontal axis
            categories: e.sender.categories$()
        }
    });
});

// Ready event and bindings
$(() => {
    bind('body', viewModel);
    // Spreadsheet
    const spreadsheetWidget = $('#spreadsheet')
        .kendoSpreadsheet({
            sheetsbar: false,
            columns: 5,
            rows: 3,
            change(e) {
                // change is only triggered by cell data changes (not cell formatting changes)
                viewModel.set('json', e.sender.toJSON());
            },
            toolbar: false
        })
        .data('kendoSpreadsheet');
    spreadsheetWidget.fromJSON(viewModel.get('json'));
    // Prevent other options to add/remove/hide/merge cells
    $('#spreadsheet')
        .find('.k-spreadsheet-fixed-container')
        .off('contextmenu');
    // trigger change
    viewModel.trigger('change');
});
