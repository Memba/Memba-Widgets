/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import BaseTool from './tools.base.es6';

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).chart || {
            // TODO
        }
    );
}

/**
 * Build default chart data
 * @param categories
 * @param values
 * @returns {{sheets: *[]}}
 */
util.defaultChartData = function (categories, values) {
    var YEAR = 1999;
    var MAX_VALUE = 500;
    var rowTotal = values + 1;
    var columnTotal = categories + 1;
    var rowIndex;
    var columnIndex;
    var data = { sheets: [{ name: 'Sheet1', rows: [] }] };
    var rows = data.sheets[0].rows;
    // Build the categories row
    var row = { index: 0, cells: [] };
    for (columnIndex = 1; columnIndex < columnTotal; columnIndex++) {
        row.cells.push({ index: columnIndex, value: YEAR + columnIndex });
    }
    rows.push(row);
    // Build the values rows
    for (rowIndex = 1; rowIndex < rowTotal; rowIndex++) {
        row = { index: rowIndex, cells: [] };
        row.cells.push({ index: 0, value: 'Series' + rowIndex });
        for (columnIndex = 1; columnIndex < columnTotal; columnIndex++) {
            row.cells.push({ index: columnIndex, value: Math.floor(MAX_VALUE * Math.random()) });
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
util.resizeSpreadsheetData = function (json, rowMax, columnMax) {
    var rows = json.sheets[0].rows;
    var rowFilter = function (row) { return row.index < rowMax; };
    var columnFilter = function (column) { return column.index < columnMax; };
    rows = rows.filter(rowFilter);
    for (var rowIndex = 0, rowTotal = rows.length; rowIndex < rowTotal; rowIndex++) {
        var cells = rows[rowIndex].cells;
        cells = cells.filter(columnFilter);
        rows[rowIndex].cells = cells;
    }
    json.sheets[0].rows = rows;
    return json;
};

/**
 * ChartTool tool
 * @class ChartTool
 */
var ChartTool = BaseTool.extend({
    id: 'chart',
    icon: 'chart_area',
    description: i18n.chart.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    templates: {
        default: '<div data-#= ns #role="chart" data-#= ns #chart-area="#: chartArea$() #" data-#= ns #series-defaults="#: seriesDefaults$() #" data-#= ns #title="#: title$() #" data-#= ns #legend="#: legend$() #" data-#= ns #series="#: series$() #" data-#= ns #category-axis="#: categoryAxis$() #" data-#= ns #value-axis="#: valueAxis$() #" style="#: attributes.style #"></div>'
    },
    height: 400,
    width: 400,
    attributes: {
        type: new DropDownListAdapter({ title: i18n.chart.attributes.type.title, defaultValue: 'column', enum: ['area', 'bar', 'column', 'line', 'radarArea', 'radarColumn', 'radarLine', 'smoothLine', 'stackBar', 'waterfall', 'verticalArea', 'verticalLine'] }, { style: 'width: 100%;' }),
        title: new TextBoxAdapter({ title: i18n.chart.attributes.title.title }),
        categories: new NumberAdapter({ title: i18n.chart.attributes.categories.title, defaultValue: 4 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 10 }),
        values: new NumberAdapter({ title: i18n.chart.attributes.values.title, defaultValue: 2 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 10 }),
        legend: new DropDownListAdapter({ title: i18n.chart.attributes.legend.title, defaultValue: 'none', enum: ['none', 'top', 'bottom', 'left', 'right'] }, { style: 'width: 100%;' }),
        data: new ChartAdapter({ title: i18n.chart.attributes.data.title, defaultValue: util.defaultChartData(4, 2) }),
        style: new StyleAdapter({ title: i18n.chart.attributes.style.title })
    },

    /**
     * Get Html or jQuery content
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent: function (component, mode) {
        var that = this;
        var types = {
            area : { type: 'area' },
            bar : { type: 'bar' },
            // bubble : { type: 'bubble' },
            // bullet : { type: 'bullet' },
            // candlestick : { type: 'candlestick' },
            column : { type: 'column' },
            // donut: { type: 'donut' },                 // <--- Could work with a little bit of work to display labels
            // funnel: { type: 'funnel' },
            line: { type: 'line' },
            // ohlc: { type: 'ohlc' },
            // pie: { type: 'pie' },                     // <--- Nice to have
            // polarArea: { type: 'polarArea' },
            // polarLine: { type: 'polarLine' },
            // polarScatter: { type: 'polarScatter' },
            radarArea : { type: 'radarArea' },
            radarColumn : { type: 'radarColumn' },
            radarLine: { type: 'radarLine' },
            smoothLine: { type: 'line', style: 'smooth' },
            // scatter: { type: 'scatter' },
            // scatterLine: { type: 'scatterLine' },     // <--- Nice to have
            stackBar: { type: 'bar', stack: 'true' },
            waterfall: { type: 'waterfall' },
            verticalArea: { type: 'verticalArea' },
            // verticalBullet: { type: 'verticalBullet' },
            verticalLine: { type: 'verticalLine' }
        };
        assert.instanceof(ChartTool, that, assert.format(assert.messages.instanceof.default, 'this', 'ChartTool'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'PageComponent'));
        var template = kendo.template(that.templates.default);
        var style = component.attributes.get('style');
        // Get font from style - @see http://www.telerik.com/forums/charts---changing-the-default-font
        var font = style.match(/font:([^;]+)/);
        font = $.isArray(font) ? font[1] : font;
        var fontSize = style.match(/font-size:([^;]+)/);
        fontSize = $.isArray(fontSize) ? fontSize[1] : fontSize;
        var fontFamily = style.match(/font-family:([^;]+)/);
        fontFamily = $.isArray(fontFamily) ? fontFamily[1] : fontFamily;
        // TODO: consider font-weight and font-style
        font = font || ((fontSize || '50px') + ' ' + (fontFamily || 'Arial'));
        var smallerFont = font;
        var numbersInFont = font.match(/([0-9])+/g);
        if ($.isArray(numbersInFont)) {
            for (var i = 0, length = numbersInFont.length; i < length; i++) {
                smallerFont = smallerFont.replace(numbersInFont[i], Math.ceil(0.6 * parseInt(numbersInFont[i], 10)));
            }
        }
        // Get colors from style (a null color is transparent, wheras undefined reverts to chart defaults)
        var color = style.match(/color:([^;]+)/);
        color = $.isArray(color) ? color[1] : color || undefined;
        var background = style.match(/background-color:([^;]+)/);
        background = $.isArray(background) ? background[1] : background || undefined;
        // The axisDefaults$ function returns an object chart's data-axis-defaults attribute binding
        // component.attributes.axisDefaults$ = function () {
        // We can't use axisDefaults, so we have categoryAxis$ and valueAxis$
        // because of https://github.com/telerik/kendo-ui-core/issues/2165
        //
        // The chartArea$ function returns an object for chart's data-chart-area attribute binding
        component.chartArea$ = function () {
            return JSON.stringify({
                background: background
            });
        };
        // The legend$ function returns an object for chart's data-legend attribute binding
        component.legend$ = function () {
            var legend = component.attributes.get('legend');
            return JSON.stringify({
                position: legend !== 'none' ? legend : 'right',
                visible: legend !== 'none',
                labels: {
                    font: smallerFont,
                    color: color
                }
            });
        };
        // The categoryAxis$ function returns an object for chart's data-category-axis attribute binding
        component.categoryAxis$ = function () {
            var categories = [];
            var columnTotal = component.attributes.get('categories') + 1;
            var rowIndex = 0;
            var columnIndex;
            var rowFinder = function (row) { return row.index === rowIndex; };
            var columnFinder = function (column) { return column.index === columnIndex; };
            var json = component.attributes.get('data');
            var row = json.sheets[0].rows.find(rowFinder);
            for (columnIndex = 1; columnIndex < columnTotal; columnIndex++) {
                var category = '';
                if (row && row.cells) {
                    var cell = row.cells.find(columnFinder);
                    if (cell && cell.value) {
                        category = cell.value;
                    }
                }
                categories.push(category);
            }
            // return { categories: [2000, 2001, 2002, 2003] }
            return JSON.stringify({
                categories: categories,
                color: color,
                labels: {
                    font: smallerFont,
                    color: color
                }
            });
        };
        // The series$ function returns an object for chart's data-series attribute binding
        component.series$ = function () {
            var series = [];
            var rowTotal = component.attributes.get('values') + 1;
            var columnTotal = component.attributes.get('categories') + 1;
            var rowIndex;
            var columnIndex;
            var rowFinder = function (row) { return row.index === rowIndex; };
            var columnFinder = function (column) { return column.index === columnIndex; };
            var json = component.attributes.get('data');
            for (rowIndex = 1; rowIndex < rowTotal; rowIndex++) {
                var serie = { name: '', data: [] };
                var row = json.sheets[0].rows.find(rowFinder);
                if (row && row.cells) {
                    columnIndex = 0;
                    var cell = row.cells.find(columnFinder);
                    if (cell && cell.value) {
                        serie.name = cell.value;
                    }
                    for (columnIndex = 1; columnIndex < columnTotal; columnIndex++) {
                        var data = 0;
                        cell = row.cells.find(columnFinder);
                        if (cell && $.type(cell.value) === 'number') {
                            data = cell.value;
                        }
                        serie.data.push(data);
                    }
                }
                series.push(serie);
            }

            /*
             return [
             { name: 'Series 1', data: [200, 450, 300, 125] },
             { name: 'Series 2', data: [200, 450, 300, 125] }
             ];
             */

            // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
            return ' ' + JSON.stringify(series);
        };
        // The seriesDefaults$ function returns an object for chart's data-series-defaults attribute binding
        component.seriesDefaults$ = function () {
            return JSON.stringify(types[component.attributes.get('type')]);
        };
        // The title$ function returns an object for chart's data-title attribute binding
        component.title$ = function () {
            var title = component.attributes.get('title');
            return JSON.stringify({
                text: title,
                visible: !!(title.trim()),
                font: font,
                color: color
            });
        };
        // The valueAxis$ function returns an object for chart's data-value-axis attribute binding
        component.valueAxis$ = function () {
            return JSON.stringify({
                color: color,
                labels: {
                    font: smallerFont,
                    color: color
                }
            });
        };
        return template($.extend(component, { ns: kendo.ns }));
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize: function (e, component) {
        var stageElement = $(e.currentTarget);
        assert.ok(stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`), format('e.currentTarget is expected to be a stage element'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'PageComponent'));
        var content = stageElement.children('div' + kendo.roleSelector('chart'));
        var widget = content.data('kendoChart');
        if ($.type(component.width) === CONSTANTS.NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === CONSTANTS.NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
        }
        widget.resize();
        // prevent any side effect
        e.preventDefault();
        // prevent event to bubble on stage
        e.stopPropagation();
    }

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    /*
    validate: function (component, pageIdx) {
        var ret = BaseTool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (component.attributes) {
            // TODO
        }
        return ret;
    }
    */

});

/**
 * Registration
 */
tools.register(ChartTool);
