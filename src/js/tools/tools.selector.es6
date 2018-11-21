/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import PageComponent from '../data/models.pagecomponent.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ValidationAdapter from './adapters.validation.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import { LIB_COMMENT, arrayLibrary } from './util.libraries.es6';

const {
    attr,
    format
} = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).selector || {
            // TODO
        }
    );
}

var SELECTOR = '<div data-#= ns #role="selector" data-#= ns #id="#: properties.name #" data-#= ns #shape="#: attributes.shape #" data-#= ns #stroke="{ color: \'#: attributes.color #\', dashType: \'solid\', opacity: 1, width: \'#: attributes.strokeWidth #\' }" data-#= ns #empty="#: attributes.empty #" data-#= ns #hit-radius="#: attributes.hitRadius #" {0}></div>';
/**
 * @class SelectorTool tool
 * @type {void|*}
 */
var SelectorTool = BaseTool.extend({
    id: 'selector',
    icon: 'selector',
    description: i18n.selector.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 1,
    templates: {
        design: '<img src="https://cdn.kidoju.com/images/o_collection/svg/office/selector.svg" alt="selector">',
        // design: '<img src="#: icon$() #" alt="#: description$() #">',
        play: format(SELECTOR, 'data-#= ns #toolbar="\\#floating .kj-floating-content" data-#= ns #bind="value: #: properties.name #.value, source: interactions"'),
        review: format(SELECTOR, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions" data-#= ns #enable="false"') + BaseTool.fn.getHtmlCheckMarks()
    },
    height: 50,
    width: 50,
    attributes: {
        color: new ColorAdapter({ title: i18n.selector.attributes.color.title, defaultValue: '#FF0000' }),
        empty: new TextBoxAdapter({ title: i18n.selector.attributes.empty.title }),
        hitRadius: new NumberAdapter({ title: i18n.selector.attributes.hitRadius.title, defaultValue: 15 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 15, 'data-max': 999 }),
        shape: new DropDownListAdapter(
            { title: i18n.selector.attributes.shape.title, defaultValue: 'circle', enum: ['circle', 'cross', 'rect'] },
            { style: 'width: 100%;' }
        ),
        strokeWidth: new NumberAdapter({ title: i18n.selector.attributes.strokeWidth.title, defaultValue: 12 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 50 })
    },
    properties: {
        name: new ReadOnlyAdapter({ title: i18n.selector.properties.name.title }),
        question: new QuestionAdapter({ title: i18n.selector.properties.question.title }),
        solution: new StringArrayAdapter({ title: i18n.selector.properties.solution.title }),
        validation: new ValidationAdapter({
            defaultValue: `${LIB_COMMENT}${arrayLibrary.defaultKey}`,
            library: arrayLibrary.library,
            title: i18n.selector.properties.validation.title
        }),
        success: new ScoreAdapter({ title: i18n.selector.properties.success.title, defaultValue: 1 }),
        failure: new ScoreAdapter({ title: i18n.selector.properties.failure.title, defaultValue: 0 }),
        omit: new ScoreAdapter({ title: i18n.selector.properties.omit.title, defaultValue: 0 }),
        disabled: new DisabledAdapter({ title: i18n.selector.properties.disabled.title, defaultValue: false })
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
        var content = stageElement.children('div[' + attr('role') + '="selector"]');
        if ($.type(component.width) === CONSTANTS.NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === CONSTANTS.NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
        }
        // Redraw the selector widget
        // var selectorWidget = content.data('kendoSelector');
        // assert.instanceof(kendo.ui.SelectorTool, selectorWidget, assert.format(assert.messages.instanceof.default, 'selectorWidget', 'kendo.ui.SelectorTool'));
        // selectorWidget._drawPlaceholder();

        // prevent any side effect
        e.preventDefault();
        // prevent event to bubble on stage
        e.stopPropagation();
    },

    /**
     * Improved display of value in score grid
     * Note: search for getScoreArray in kidoju.data
     * @param testItem
     */
    value$: function (testItem) {
        if (testItem.result) {
            return kendo.htmlEncode(testItem.solution || '');
        } else {
            return 'N/A'; // TODO translate
        }
    },

    /**
     * Improved display of solution in score grid
     * Note: search for getScoreArray in kidoju.data
     * @param testItem
     */
    solution$: function (testItem) {
        return kendo.htmlEncode(testItem.solution || '');
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate: function (component, pageIdx) {
        var ret = BaseTool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        if (!component.attributes ||
            !RX_COLOR.test(component.attributes.color)) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(messages.invalidColor, description, pageIdx + 1)
            });
        }
        // TODO: We should have a generic validation for  enumerators
        if (!component.attributes || ['circle', 'cross', 'rect'].indexOf(component.attributes.shape) === -1) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(messages.invalidShape, description, pageIdx + 1)
            });
        }
        // TODO: Check selectors on top of static images and labels
        return ret;
    }

});

/**
 * Registration
 */
tools.register(SelectorTool);
