/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
// import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.highlighter.es6';
import HighLighterAdapter from './adapters.highlighter.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import TextAreaAdapter from './adapters.textarea.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import ValidationAdapter from './adapters.validation.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { genericLibrary } from './util.libraries.es6';
import {
    questionValidator,
    scoreValidator,
    styleValidator
} from './util.validators.es6';

const { format, ns, roleSelector } = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div
    class="kj-interactive"
    data-${ns}role="highlighter"
    data-${ns}text="#: attributes.text #"
    data-${ns}split="#: attributes.split #"
    data-${ns}highlight-style="#: attributes.highlightStyle #"
    style="#: attributes.style #" {0}>
    </div>`;
const BINDING = `data-${ns}bind="value: #: properties.name #.value, source: interactions"`;
const DISABLED = `data-${ns}enable="false"`;

/**
 * HighLighterTool
 * @class HighLighterTool
 * @type {void|*}
 */
const HighLighterTool = BaseTool.extend({
    id: 'highlighter',
    childSelector: `${CONSTANTS.DIV}${roleSelector('highlighter')}`,
    height: 250,
    width: 250,
    weight: 1,
    menu: ['properties.question', 'properties.solution'],
    templates: {
        design: format(TEMPLATE, DISABLED),
        play: format(TEMPLATE, BINDING),
        review:
            format(TEMPLATE, `${BINDING} ${DISABLED}`) +
            BaseTool.fn.getHtmlCheckMarks()
    },
    attributes: {
        highlightStyle: new StyleAdapter({
            title: __('tools.highlighter.attributes.highlightStyle.title'),
            validation: styleValidator
        }),
        style: new StyleAdapter({
            title: __('tools.highlighter.attributes.style.title'),
            validation: styleValidator
        }),
        text: new TextAreaAdapter({
            title: __('tools.highlighter.attributes.text.title'),
            defaultValue: __('tools.highlighter.attributes.text.defaultValue')
        }),
        split: new TextBoxAdapter({
            title: __('tools.highlighter.attributes.split.title'),
            defaultValue: '([\\s\\.,;:\\?¿!<>\\(\\)&"`«»\\[\\]{}])'
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.highlighter.properties.name.title')
        }),
        question: new QuestionAdapter({
            help: __('tools.highlighter.properties.question.help'),
            title: __('tools.highlighter.properties.question.title'),
            validator: questionValidator
        }),
        solution: new HighLighterAdapter({
            help: __('tools.highlighter.properties.solution.help'),
            title: __('tools.highlighter.properties.solution.title')
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${genericLibrary.defaultKey}`,
            library: genericLibrary.library,
            title: __('tools.highlighter.properties.validation.title')
        }),
        success: new ScoreAdapter({
            defaultValue: 1,
            title: __('tools.highlighter.properties.success.title'),
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.highlighter.properties.failure.title'),
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.highlighter.properties.omit.title'),
            validation: scoreValidator
        })
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const toolName = this.name;
        if (
            !component.attributes ||
            !component.attributes.text ||
            component.attributes.text ===
                __('tools.highlighter.attributes.text.defaultValue') ||
            !TOOLS.RX_TEXT.test(component.attributes.text)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(
                    __('tools.messages.invalidText'),
                    toolName,
                    pageIdx + 1
                )
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
                message: format(
                    __('tools.messages.invalidStyle'),
                    toolName,
                    pageIdx + 1
                )
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
                message: format(
                    __('tools.messages.invalidStyle'),
                    toolName,
                    pageIdx + 1
                )
            });
        }
        // TODO also check that split regex is safe
        return ret;
    }
});

/**
 * Default eport
 */
export default HighLighterTool;
