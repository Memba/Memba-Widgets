/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.data';
import __ from '../app/app.i18n.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.chargrid.es6';
import CharGridAdapter from './adapters.chargrid.es6';
import ColorAdapter from './adapters.color.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import ValidationAdapter from './adapters.validation.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { charGridLibrary } from './util.libraries.es6';
import { questionValidator, scoreValidator } from './util.validators.es6';

const {
    data: { ObservableArray },
    format,
    htmlEncode,
    ns,
    roleSelector,
    ui: { CharGrid }
} = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div
    data-${ns}role="chargrid"
    data-${ns}columns="#: attributes.columns #"
    data-${ns}rows="#: attributes.rows #"
    data-${ns}blank="#: attributes.blank #"
    data-${ns}whitelist="#: attributes.whitelist #"
    data-${ns}grid-fill="#: attributes.gridFill #"
    data-${ns}grid-stroke="#: attributes.gridStroke #"
    data-${ns}blank-fill="#: attributes.gridStroke #"
    data-${ns}selected-fill="#: attributes.selectedFill #"
    data-${ns}locked="#: JSON.stringify(attributes.layout) #"
    data-${ns}locked-fill="#: attributes.lockedFill #"
    data-${ns}locked-color="#: attributes.fontColor #"
    data-${ns}value-color="#: attributes.fontColor #" {0}>
    </div>`;
const BINDING = `data-${ns}bind="value: #: properties.name #.value"`;
const DISABLED = `data-${ns}enable="false"`;

/**
 * CharGridTool
 * @class CharGridTool
 */
const CharGridTool = BaseTool.extend({
    id: 'chargrid',
    childSelector: `${CONSTANTS.DIV}${roleSelector('chargrid')}`, // div.kj-chargrid
    height: 400,
    width: 400,
    weight: 4,
    menu: ['properties.question', 'properties.solution'],
    templates: {
        design: format(
            TEMPLATE,
            `data-${ns}value="#: JSON.stringify(attributes.layout) #" ${DISABLED}`
        ),
        play: format(TEMPLATE, BINDING),
        review:
            format(TEMPLATE, `${BINDING} ${DISABLED}`) +
            BaseTool.fn.getHtmlCheckMarks()
    },
    attributes: {
        columns: new NumberAdapter(
            {
                title: __('tools.chargrid.attributes.columns.title'),
                defaultValue: 9
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 1,
                'data-max': 20
            }
        ),
        rows: new NumberAdapter(
            {
                title: __('tools.chargrid.attributes.rows.title'),
                defaultValue: 9
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 1,
                'data-max': 20
            }
        ),
        blank: new TextBoxAdapter({
            title: __('tools.chargrid.attributes.blank.title'),
            defaultValue: '.'
        }),
        whitelist: new TextBoxAdapter({
            title: __('tools.chargrid.attributes.whitelist.title'),
            defaultValue: '1-9'
        }),
        layout: new CharGridAdapter({
            title: __('tools.chargrid.attributes.layout.title'),
            defaultValue: null
        }),
        gridFill: new ColorAdapter({
            title: __('tools.chargrid.attributes.gridFill.title'),
            defaultValue: '#ffffff'
        }),
        gridStroke: new ColorAdapter({
            title: __('tools.chargrid.attributes.gridStroke.title'),
            defaultValue: '#000000'
        }),
        // blankFill = gridStroke
        selectedFill: new ColorAdapter({
            title: __('tools.chargrid.attributes.selectedFill.title'),
            defaultValue: '#ffffcc'
        }),
        lockedFill: new ColorAdapter({
            title: __('tools.chargrid.attributes.lockedFill.title'),
            defaultValue: '#e6e6e6'
        }),
        // lockedColor = valueColor = fontColor
        fontColor: new ColorAdapter({
            title: __('tools.chargrid.attributes.fontColor.title'),
            defaultValue: '#9999b6'
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.chargrid.properties.name.title')
        }),
        question: new QuestionAdapter({
            help: __('tools.chargrid.properties.question.help'),
            title: __('tools.chargrid.properties.question.title'),
            validation: questionValidator
        }),
        solution: new CharGridAdapter({
            help: __('tools.chargrid.properties.solution.help'),
            title: __('tools.chargrid.properties.solution.title')
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${charGridLibrary.defaultKey}`,
            library: charGridLibrary.library,
            title: __('tools.chargrid.properties.validation.title')
        }),
        success: new ScoreAdapter({
            defaultValue: 1,
            title: __('tools.chargrid.properties.success.title'),
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.chargrid.properties.failure.title'),
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.chargrid.properties.omit.title'),
            validation: scoreValidator
        })
    },

    /**
     * Pretiffy array for results grid
     * @param arr
     * @private
     */
    _prettify(arr) {
        // var ret = '<table>';
        let ret = '';
        if ($.isArray(arr) || arr instanceof ObservableArray) {
            for (let r = 0, rowTotal = arr.length; r < rowTotal; r++) {
                const row = arr[r];
                // ret += '<tr>';
                for (let c = 0, colTotal = row.length; c < colTotal; c++) {
                    // ret += '<td>' + htmlEncode(row[c] || '') + '</td>';
                    ret +=
                        htmlEncode(row[c] || '') +
                        (c === colTotal - 1 ? '' : ',');
                }
                // ret += '</tr>';
                ret += '<br/>';
            }
        }
        // ret += '</table>';
        return ret;
    },

    /**
     * Improved display of value in score grid
     * @param testItem
     */
    value$(testItem) {
        return this._prettify(testItem.value);
    },

    /**
     * Improved display of solution in score grid
     * @param testItem
     */
    solution$(testItem) {
        return this._prettify(testItem.solution);
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize(e, component) {
        BaseTool.fn.onResize.call(this, e, component);
        const stageElement = $(e.currentTarget);
        const content = stageElement.children(this.childSelector);
        // Redraw the charGrid widget
        // TODO Consider implementing a resize method on CharGridWidget to remove onResize here
        const charGridWidget = content.data('kendoCharGrid');
        assert.instanceof(
            CharGrid,
            charGridWidget,
            assert.format(
                assert.messages.instanceof.default,
                'charGridWidget',
                'kendo.ui.CharGrid'
            )
        );
        charGridWidget.refresh();
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
 * Default eport
 */
export default CharGridTool;
