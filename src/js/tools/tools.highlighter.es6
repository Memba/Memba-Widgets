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
import { LIB_COMMENT, genericLibrary } from './util.libraries.es6';

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
        (((window.app || {}).i18n || {}).tools || {}).highlighter || {
            // TODO
        }
    );
}

var HIGHLIGHTER = '<div class="kj-interactive" data-#= ns #role="highlighter" data-#= ns #text="#: attributes.text #" data-#= ns #split="#: attributes.split #"  data-#= ns #highlight-style="#: attributes.highlightStyle #" style="#: attributes.style #" {0}></div>';
/**
 * @class HighLighter tool
 * @type {void|*}
 */
var HighLighter = BaseTool.extend({
    id: 'highlighter',
    icon: 'marker',
    description: i18n.highlighter.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 1,
    templates: {
        design: format(HIGHLIGHTER, 'data-#= ns #enable="false"'),
        play: format(HIGHLIGHTER, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions"'),
        review: format(HIGHLIGHTER, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions" data-#= ns #enable="false"') + BaseTool.fn.showResult()
    },
    height: 250,
    width: 250,
    attributes: {
        highlightStyle: new StyleAdapter({ title: i18n.highlighter.attributes.highlightStyle.title }),
        style: new StyleAdapter({ title: i18n.highlighter.attributes.style.title, defaultValue: 'font-size:32px;' }),
        text: new TextAreaAdapter({ title: i18n.highlighter.attributes.text.title, defaultValue: i18n.highlighter.attributes.text.defaultValue }),
        split: new TextBoxAdapter({ title: i18n.highlighter.attributes.split.title, defaultValue: '([\\s\\.,;:\\?¿!<>\\(\\)&"`«»\\[\\]{}])' })
    },
    properties: {
        name: new ReadOnlyAdapter({ title: i18n.highlighter.properties.name.title }),
        question: new QuestionAdapter({ title: i18n.highlighter.properties.question.title }),
        solution: new HighLighterAdapter({ title: i18n.highlighter.properties.solution.title }),
        validation: new ValidationAdapter({
            defaultValue: LIB_COMMENT + genericLibrary.defaultValue,
            library: genericLibrary.library,
            title: i18n.highlighter.properties.validation.title
        }),
        success: new ScoreAdapter({ title: i18n.highlighter.properties.success.title, defaultValue: 1 }),
        failure: new ScoreAdapter({ title: i18n.highlighter.properties.failure.title, defaultValue: 0 }),
        omit: new ScoreAdapter({ title: i18n.highlighter.properties.omit.title, defaultValue: 0 })
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
        assert.instanceof(HighLighter, that, assert.format(assert.messages.instanceof.default, 'this', 'HighLighter'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        var template = kendo.template(that.templates[mode]);
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
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        var content = stageElement.children('div');
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
            (component.attributes.text === i18n.highlighter.attributes.text.defaultValue) ||
            !RX_TEXT.test(component.attributes.text)) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(messages.invalidText, description, pageIdx + 1)
            });
        }
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.highlightStyle && !RX_STYLE.test(component.attributes.highlightStyle))) {
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
tools.register(HighLighter);
