/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.dataviz.chart';
import __ from '../app/app.i18n.es6';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import ChartAdapter from './adapters.chart.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import NumberAdapter from './adapters.number.es6';
import StyleAdapter from './adapters.style.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import { BaseTool } from './tools.base.es6';
import { defaultChartData } from './util.miscellaneous.es6';
import { styleValidator } from './util.validators.es6';

const { ns, roleSelector } = window.kendo;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div
    data-${ns}role="chart"
    data-${ns}chart-area="#: chartArea$() #"
    data-${ns}series-defaults="#: seriesDefaults$() #"
    data-${ns}title="#: title$() #"
    data-${ns}legend="#: legend$() #"
    data-${ns}series="#: series$() #"
    data-${ns}category-axis="#: categoryAxis$() #"
    data-${ns}value-axis="#: valueAxis$() #"
    style="#: attributes.style #">
    </div>`;

/**
 * ChartTool
 * @class ChartTool
 */
const ChartTool = BaseTool.extend({
    id: 'chart',
    childSelector: `${CONSTANTS.DIV}${roleSelector('chart')}`,
    height: 400,
    width: 400,
    menu: ['attributes.type', 'attributes.data'],
    templates: {
        default: TEMPLATE,
    },
    attributes: {
        type: new DropDownListAdapter(
            {
                defaultValue: 'column',
                help: __('tools.chart.attributes.type.help'),
                source: __('tools.chart.attributes.type.source'),
                title: __('tools.chart.attributes.type.title'),
            },
            { style: 'width: 100%;' }
        ),
        title: new TextBoxAdapter({
            title: __('tools.chart.attributes.title.title'),
        }),
        categories: new NumberAdapter(
            {
                title: __('tools.chart.attributes.categories.title'),
                defaultValue: 4,
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 1,
                'data-max': 10,
            }
        ),
        values: new NumberAdapter(
            {
                title: __('tools.chart.attributes.values.title'),
                defaultValue: 2,
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 1,
                'data-max': 10,
            }
        ),
        legend: new DropDownListAdapter(
            {
                defaultValue: 'none',
                source: __('tools.chart.attributes.legend.source'),
                title: __('tools.chart.attributes.legend.title'),
            },
            { style: 'width: 100%;' }
        ),
        data: new ChartAdapter({
            defaultValue: defaultChartData(4, 2),
            help: __('tools.chart.attributes.data.help'),
            title: __('tools.chart.attributes.data.title'),
        }),
        style: new StyleAdapter({
            title: __('tools.chart.attributes.style.title'),
            validation: styleValidator,
        }),
    },

    /**
     * Get Html or jQuery content
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        const types = {
            area: { type: 'area' },
            bar: { type: 'bar' },
            // bubble : { type: 'bubble' },
            // bullet : { type: 'bullet' },
            // candlestick : { type: 'candlestick' },
            column: { type: 'column' },
            // donut: { type: 'donut' },                 // <--- Could work with a little bit of work to display labels
            // funnel: { type: 'funnel' },
            line: { type: 'line' },
            // ohlc: { type: 'ohlc' },
            // pie: { type: 'pie' },                     // <--- Nice to have
            // polarArea: { type: 'polarArea' },
            // polarLine: { type: 'polarLine' },
            // polarScatter: { type: 'polarScatter' },
            radarArea: { type: 'radarArea' },
            radarColumn: { type: 'radarColumn' },
            radarLine: { type: 'radarLine' },
            smoothLine: { type: 'line', style: 'smooth' },
            // scatter: { type: 'scatter' },
            // scatterLine: { type: 'scatterLine' },     // <--- Nice to have
            stackBar: { type: 'bar', stack: 'true' },
            waterfall: { type: 'waterfall' },
            verticalArea: { type: 'verticalArea' },
            // verticalBullet: { type: 'verticalBullet' },
            verticalLine: { type: 'verticalLine' },
        };
        const style = component.get('attributes.style');
        // Get font from style - @see http://www.telerik.com/forums/charts---changing-the-default-font
        let font = style.match(/font:([^;]+)/);
        font = $.isArray(font) ? font[1] : font;
        let fontSize = style.match(/font-size:([^;]+)/);
        fontSize = $.isArray(fontSize) ? fontSize[1] : fontSize;
        let fontFamily = style.match(/font-family:([^;]+)/);
        fontFamily = $.isArray(fontFamily) ? fontFamily[1] : fontFamily;
        // TODO: consider font-weight and font-style
        font = font || `${fontSize || '50px'} ${fontFamily || 'Arial'}`;
        let smallerFont = font;
        const numbersInFont = font.match(/([0-9])+/g);
        if ($.isArray(numbersInFont)) {
            for (let i = 0, { length } = numbersInFont; i < length; i++) {
                smallerFont = smallerFont.replace(
                    numbersInFont[i],
                    Math.ceil(0.6 * parseInt(numbersInFont[i], 10))
                );
            }
        }
        // Get colors from style (a null color is transparent, wheras undefined reverts to chart defaults)
        let color = style.match(/color:([^;]+)/);
        color = $.isArray(color) ? color[1] : color || undefined;
        let background = style.match(/background-color:([^;]+)/);
        background = $.isArray(background)
            ? background[1]
            : background || undefined;
        // The axisDefaults$ function returns an object chart's data-axis-defaults attribute binding
        // component.attributes.axisDefaults$ = function () {
        // We can't use axisDefaults, so we have categoryAxis$ and valueAxis$
        // because of https://github.com/telerik/kendo-ui-core/issues/2165
        $.extend(component, {
            // The chartArea$ function returns an object for chart's data-chart-area attribute binding
            chartArea$() {
                return JSON.stringify({
                    background,
                });
            },
            // The legend$ function returns an object for chart's data-legend attribute binding
            legend$() {
                const legend = component.attributes.get('legend');
                return JSON.stringify({
                    position: legend !== 'none' ? legend : 'right',
                    visible: legend !== 'none',
                    labels: {
                        font: smallerFont,
                        color,
                    },
                });
            },
            // The categoryAxis$ function returns an object for chart's data-category-axis attribute binding
            categoryAxis$() {
                const categories = [];
                const columnTotal = component.attributes.get('categories') + 1;
                const rowIndex = 0;
                let columnIndex;
                const rowFinder = (row) => row.index === rowIndex;
                const columnFinder = (column) => column.index === columnIndex;
                const json = component.attributes.get('data');
                const row = json.sheets[0].rows.find(rowFinder);
                for (
                    columnIndex = 1;
                    columnIndex < columnTotal;
                    columnIndex++
                ) {
                    let category = '';
                    if (row && row.cells) {
                        const cell = row.cells.find(columnFinder);
                        if (cell && cell.value) {
                            category = cell.value;
                        }
                    }
                    categories.push(category);
                }
                // return { categories: [2000, 2001, 2002, 2003] }
                return JSON.stringify({
                    categories,
                    color,
                    labels: {
                        font: smallerFont,
                        color,
                    },
                });
            },
            // The series$ function returns an object for chart's data-series attribute binding
            series$() {
                const series = [];
                const rowTotal = component.attributes.get('values') + 1;
                const columnTotal = component.attributes.get('categories') + 1;
                let rowIndex;
                let columnIndex;
                const rowFinder = (row) => row.index === rowIndex;
                const columnFinder = (column) => column.index === columnIndex;
                const json = component.attributes.get('data');
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

                /*
                return [
                     { name: 'Series 1', data: [200, 450, 300, 125] },
                     { name: 'Series 2', data: [200, 450, 300, 125] }
                 ];
                 */
                return JSON.stringify(series);
            },
            // The seriesDefaults$ function returns an object for chart's data-series-defaults attribute binding
            seriesDefaults$() {
                return JSON.stringify(types[component.attributes.get('type')]);
            },
            // The title$ function returns an object for chart's data-title attribute binding
            title$() {
                const title = component.attributes.get('title');
                return JSON.stringify({
                    text: title,
                    visible: !!title.trim(),
                    font,
                    color,
                });
            },
            // The valueAxis$ function returns an object for chart's data-value-axis attribute binding
            valueAxis$() {
                return JSON.stringify({
                    color,
                    labels: {
                        font: smallerFont,
                        color,
                    },
                });
            },
        });
        return BaseTool.fn.getHtmlContent.call(this, component, mode);
    },

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
 * Default eport
 */
export default ChartTool;
