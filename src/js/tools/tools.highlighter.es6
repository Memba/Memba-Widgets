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
import i18n from '../common/window.i18n.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.highlighter.es6';
import HighLighterAdapter from './adapters.highlighter.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import TextAreaAdapter from './adapters.textarea.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import ValidationAdapter from './adapters.validation.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { genericLibrary } from './util.libraries.es6';
import { questionValidator, scoreValidator } from './util.validators.es6';

const { format, ns, template } = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * i18n messages
 */
if (!(i18n().tools && i18n().tools.highlighter)) {
    $.extend(true, i18n(), {
        tools: {
            highlighter: {
                description: 'Highlighter',
                help: null,
                name: 'Highlighter',
                attributes: {
                    highlightStyle: {
                        title: 'Highlight'
                    },
                    style: {
                        title: 'Style'
                    },
                    text: {
                        title: 'Text'
                    },
                    split: {
                        title: 'Split'
                    }
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
        }
    });
}

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div class="kj-interactive" data-${ns}role="highlighter" data-${ns}text="#: attributes.text #" data-${ns}split="#: attributes.split #"  data-${ns}highlight-style="#: attributes.highlightStyle #" style="#: attributes.style #" {0}></div>`;

/**
 * HighLighterTool
 * @class HighLighterTool
 * @type {void|*}
 */
const HighLighterTool = BaseTool.extend({
    id: 'highlighter',
    icon: 'marker',
    description: i18n().tools.highlighter.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    weight: 1,
    templates: {
        design: format(TEMPLATE, `data-${ns}enable="false"`),
        play: format(
            TEMPLATE,
            `data-${ns}bind="value: #: properties.name #.value, source: interactions"`
        ),
        review:
            format(
                TEMPLATE,
                `data-${ns}bind="value: #: properties.name #.value, source: interactions" data-${ns}enable="false"`
            ) + BaseTool.fn.getHtmlCheckMarks()
    },
    height: 250,
    width: 250,
    attributes: {
        highlightStyle: new StyleAdapter({
            title: i18n().tools.highlighter.attributes.highlightStyle.title
        }),
        style: new StyleAdapter({
            title: i18n().tools.highlighter.attributes.style.title,
            defaultValue: 'font-size:32px;'
        }),
        text: new TextAreaAdapter({
            title: i18n().tools.highlighter.attributes.text.title,
            defaultValue: i18n().tools.highlighter.attributes.text.defaultValue
        }),
        split: new TextBoxAdapter({
            title: i18n().tools.highlighter.attributes.split.title,
            defaultValue: '([\\s\\.,;:\\?¿!<>\\(\\)&"`«»\\[\\]{}])'
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: i18n().tools.highlighter.properties.name.title
        }),
        question: new QuestionAdapter({
            title: i18n().tools.highlighter.properties.question.title,
            validator: questionValidator
        }),
        solution: new HighLighterAdapter({
            title: i18n().tools.highlighter.properties.solution.title
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${genericLibrary.defaultKey}`,
            library: genericLibrary.library,
            title: i18n().tools.highlighter.properties.validation.title
        }),
        success: new ScoreAdapter({
            title: i18n().tools.highlighter.properties.success.title,
            defaultValue: 1,
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            title: i18n().tools.highlighter.properties.failure.title,
            defaultValue: 0,
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            title: i18n().tools.highlighter.properties.omit.title,
            defaultValue: 0,
            validation: scoreValidator
        })
    },

    /**
     * Get Html or jQuery content
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        const that = this;
        assert.instanceof(
            HighLighterTool,
            that,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'HighLighterTool'
            )
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        assert.enum(
            Object.values(TOOLS.STAGE_MODES),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.keys(TOOLS.STAGE_MODES)
            )
        );
        const tmpl = template(that.templates[mode]);
        return tmpl(component);
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
                'PageComponent'
            )
        );
        const content = stageElement.children('div');
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
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const { description } = this; // tool description
        const { messages } = this.i18n;
        if (
            !component.attributes ||
            !component.attributes.text ||
            component.attributes.text ===
                i18n().tools.highlighter.attributes.text.defaultValue ||
            !TOOLS.RX_TEXT.test(component.attributes.text)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(messages.invalidText, description, pageIdx + 1)
            });
        }
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.highlightStyle &&
                !TOOLS.RX_STYLE.test(component.attributes.highlightStyle))
        ) {
            // TODO: test small font-size incompatible with mobile devices
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style &&
                !TOOLS.RX_STYLE.test(component.attributes.style))
        ) {
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
tools.register(HighLighterTool);
