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
        (((window.app || {}).i18n || {}).tools || {}).textgaps || {
            description: 'Text gaps',
            attributes: {
                inputStyle: { title: 'Input Style' },
                style: { title: 'Style' },
                text: { title: 'Text', defaultValue: 'Some text with gaps like [] or [] to fill.' }
            },
            properties: {
                name: { title: 'Name' },
                question: { title: 'Question' },
                solution: { title: 'Solution' },
                validation: { title: 'Validation' },
                success: { title: 'Success' },
                failure: { title: 'Failure' },
                omit: { title: 'Omit' }
            }
        }
    );
}

var TEXTGAPS = '<div data-#= ns #role="textgaps" data-#= ns #text="#: attributes.text #" data-#= ns #input-style="#: attributes.inputStyle #" style="#: attributes.style #" {0}></div>';
/**
 * TextGapsTool tool
 * @class MultiQuiz
 * @type {void|*}
 */
const TextGapsTool = BaseTool.extend({
    id: 'textgaps',
    icon: 'text_gaps',
    description: i18n.textgaps.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 1,
    templates: {
        design: format(TEXTGAPS, 'data-#= ns #enable="false"'),
        play: format(TEXTGAPS, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #shuffle="#: attributes.shuffle #"'),
        review: format(TEXTGAPS, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + BaseTool.fn.getHtmlCheckMarks()
    },
    height: 150,
    width: 420,
    attributes: {
        inputStyle: new StyleAdapter({ title: i18n.textgaps.attributes.inputStyle.title }),
        style: new StyleAdapter({ title: i18n.textgaps.attributes.style.title, defaultValue: 'font-size:32px;' }),
        text: new TextBoxAdapter({ title: i18n.textgaps.attributes.text.title, defaultValue: i18n.textgaps.attributes.text.defaultValue })
    },
    properties: {
        name: new ReadOnlyAdapter({ title: i18n.textgaps.properties.name.title }),
        question: new QuestionAdapter({ title: i18n.textgaps.properties.question.title }),
        solution: new StringArrayAdapter({ title: i18n.textgaps.properties.solution.title, defaultValue: [] }),
        validation: new ValidationAdapter({
            defaultValue: `${LIB_COMMENT}${arrayLibrary.defaultKey}`,
            library: arrayLibrary.library,
            title: i18n.textgaps.properties.validation.title
        }),
        success: new ScoreAdapter({ title: i18n.textgaps.properties.success.title, defaultValue: 1 }),
        failure: new ScoreAdapter({ title: i18n.textgaps.properties.failure.title, defaultValue: 0 }),
        omit: new ScoreAdapter({ title: i18n.textgaps.properties.omit.title, defaultValue: 0 })
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
        assert.instanceof(TextGapsTool, that, assert.format(assert.messages.instanceof.default, 'this', 'TextGapsTool'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'PageComponent'));
        assert.enum(Object.values(CONSTANTS.STAGE_MODES), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(CONSTANTS.STAGE_MODES)));
        var template = kendo.template(that.templates[mode]);
        return template($.extend(component, { ns: kendo.ns }));
    },

    /**
     * Improved display of value in score grid
     * @param testItem
     */
    value$: function (testItem) {
        var ret = (testItem.value || []).slice();
        for (var i = 0; i < ret.length; i++) {
            ret[i] = kendo.htmlEncode((ret[i] || '').trim());
        }
        return ret.join('<br/>');
    },

    /**
     * Improved display of solution in score grid
     * @param testItem
     */
    solution$: function (testItem) {
        var ret = (testItem.solution || '').split('\n');
        for (var i = 0; i < ret.length; i++) {
            ret[i] = kendo.htmlEncode((ret[i] || '').trim());
        }
        return ret.join('<br/>');
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
        var content = stageElement.children('div' + kendo.roleSelector('textgaps'));
        if ($.type(component.width) === CONSTANTS.NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === CONSTANTS.NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
        }
        // prevent any side effect
        e.preventDefault();
        // prevent event to bubble on stage
        e.stopPropagation();
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
            !component.attributes.text ||
            (component.attributes.text === i18n.textgaps.attributes.text.defaultValue) ||
            !RX_TEXT.test(component.attributes.text)) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(messages.invalidText, description, pageIdx + 1)
            });
        }
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.inputStyle && !RX_STYLE.test(component.attributes.inputStyle))) {
            // TODO: test small font-size incompatible with mobile devices
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
            // TODO: test small font-size incompatible with mobile devices
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        // TODO also check that split regex is safe
        return ret;
    }

});

/**
 * Registration
 */
tools.register(TextGapsTool);
