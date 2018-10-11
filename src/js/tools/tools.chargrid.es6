/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.data';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import PageComponent from '../data/models.pagecomponent.es6';
// TODO import '../widgets/widgets.chargrid.es6';
import CharGridAdapter from './adapters.chargrid.es6';
import ColorAdapter from './adapters.color.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import ValidationAdapter from './adapters.validation.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import { LIB_COMMENT, charGridLibrary } from './util.libraries.es6';

const {
    data: { ObservableArray },
    format,
    htmlEncode,
    ui: { CharGrid }
} = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).chargrid ||
        {
            // TODO
        }
    );
}

const CHARGRID =
    '<div data-#= ns #role="chargrid" data-#= ns #columns="#: attributes.columns #" data-#= ns #rows="#: attributes.rows #" data-#= ns #blank="#: attributes.blank #" data-#= ns #whitelist="#: attributes.whitelist #" data-#= ns #grid-fill="#: attributes.gridFill #" data-#= ns #grid-stroke="#: attributes.gridStroke #" data-#= ns #blank-fill="#: attributes.gridStroke #" data-#= ns #selected-fill="#: attributes.selectedFill #" data-#= ns #locked-fill="#: attributes.lockedFill #" data-#= ns #locked-color="#: attributes.fontColor #" data-#= ns #value-color="#: attributes.fontColor #" {0}></div>';

/**
 * @class CharGridTool
 */
const CharGridTool = BaseTool.extend({
    id: 'chargrid',
    icon: 'dot_matrix',
    description: i18n().description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 8,
    templates: {
        design: format(
            CHARGRID,
            'data-#= ns #value="#: JSON.stringify(attributes.layout) #" data-#= ns #locked="#: JSON.stringify(attributes.layout) #" data-#= ns #enable="false"'
        ),
        play: format(
            CHARGRID,
            'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #locked="#: JSON.stringify(attributes.layout) #"'
        ),
        review:
            format(
                CHARGRID,
                'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #locked="#: JSON.stringify(attributes.layout) #" data-#= ns #enable="false"'
            ) + BaseTool.fn.getHtmlCheckMarks()
    },
    height: 400,
    width: 400,
    attributes: {
        columns: new NumberAdapter(
            { title: i18n().attributes.columns.title, defaultValue: 9 },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 1,
                'data-max': 20
            }
        ),
        rows: new NumberAdapter(
            { title: i18n().attributes.rows.title, defaultValue: 9 },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 1,
                'data-max': 20
            }
        ),
        blank: new TextBoxAdapter({
            title: i18n().attributes.blank.title,
            defaultValue: '.'
        }),
        whitelist: new TextBoxAdapter({
            title: i18n().attributes.whitelist.title,
            defaultValue: '1-9'
        }),
        layout: new CharGridAdapter({
            title: i18n().attributes.layout.title,
            defaultValue: null
        }),
        gridFill: new ColorAdapter({
            title: i18n().attributes.gridFill.title,
            defaultValue: '#ffffff'
        }),
        gridStroke: new ColorAdapter({
            title: i18n().attributes.gridStroke.title,
            defaultValue: '#000000'
        }),
        // blankFill = gridStroke
        selectedFill: new ColorAdapter({
            title: i18n().attributes.selectedFill.title,
            defaultValue: '#ffffcc'
        }),
        lockedFill: new ColorAdapter({
            title: i18n().attributes.lockedFill.title,
            defaultValue: '#e6e6e6'
        }),
        // lockedColor = valueColor = fontColor
        fontColor: new ColorAdapter({
            title: i18n().attributes.fontColor.title,
            defaultValue: '#9999b6'
        })
    },
    properties: {
        name: new ReadOnlyAdapter({ title: i18n().properties.name.title }),
        question: new QuestionAdapter({
            title: i18n().properties.question.title
        }),
        solution: new CharGridAdapter({
            title: i18n().properties.solution.title
        }),
        validation: new ValidationAdapter({
            defaultValue: LIB_COMMENT + charGridLibrary.defaultValue,
            library: charGridLibrary.library,
            title: i18n().properties.validation.title
        }),
        success: new ScoreAdapter({
            title: i18n().properties.success.title,
            defaultValue: 1
        }),
        failure: new ScoreAdapter({
            title: i18n().properties.failure.title,
            defaultValue: 0
        }),
        omit: new ScoreAdapter({
            title: i18n().properties.omit.title,
            defaultValue: 0
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
        const stageElement = $(e.currentTarget);
        assert.ok(
            stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`),
            format('e.currentTarget is expected to be a stage element')
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'kidoju.data.PageComponent'
            )
        );
        const content = stageElement.children('div.kj-chargrid');
        if ($.type(component.width) === CONSTANTS.NUMBER) {
            content.outerWidth(
                component.get('width') -
                    content.outerWidth(true) +
                    content.outerWidth()
            );
        }
        if ($.type(component.height) === CONSTANTS.NUMBER) {
            content.outerHeight(
                component.get('height') -
                    content.outerHeight(true) +
                    content.outerHeight()
            );
        }
        // Redraw the charGrid widget
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
tools.register(CharGridTool);
