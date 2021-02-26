/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
// import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.textgaps.es6';
import BasicListAdapter from './adapters.basiclist.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import ValidationAdapter from './adapters.validation.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { arrayLibrary } from './util.libraries.es6';
import {
    questionValidator,
    scoreValidator,
    styleValidator,
} from './util.validators.es6';

const { format, htmlEncode, ns, roleSelector } = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div
    data-${ns}role="textgaps"
    data-${ns}text="#: attributes.text #"
    data-${ns}input-style="#: attributes.inputStyle #"
    style="#: attributes.style #" {0}>
    </div>`;
const BINDING = `data-${ns}bind="value: #: properties.name #.value"`;
const DISABLED = `data-${ns}enable="false"`; // TODO: enabled

/**
 * TextGapsTool
 * @class TextGapsTool
 * @type {void|*}
 */
const TextGapsTool = BaseTool.extend({
    id: 'textgaps',
    childSelector: `${CONSTANTS.DIV}${roleSelector('textgaps')}`,
    field: {
        type: 'object', // Array
    },
    height: 150,
    width: 420,
    weight: 1,
    menu: ['properties.question', 'properties.solution'],
    templates: {
        design: format(TEMPLATE, DISABLED),
        play: format(
            TEMPLATE,
            `${BINDING} data-${ns}shuffle="#: attributes.shuffle #"`
        ),
        review:
            format(TEMPLATE, `${BINDING} ${DISABLED}`) +
            BaseTool.fn.getHtmlCheckMarks(),
    },
    attributes: {
        inputStyle: new StyleAdapter({
            title: __('tools.textgaps.attributes.inputStyle.title'),
            validation: styleValidator,
        }),
        style: new StyleAdapter({
            title: __('tools.textgaps.attributes.style.title'),
            validation: styleValidator,
        }),
        text: new TextBoxAdapter({
            title: __('tools.textgaps.attributes.text.title'),
            defaultValue: __('tools.textgaps.attributes.text.defaultValue'),
        }),
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.textgaps.properties.name.title'),
        }),
        question: new QuestionAdapter({
            help: __('tools.textgaps.properties.question.help'),
            title: __('tools.textgaps.properties.question.title'),
            validation: questionValidator,
        }),
        solution: new BasicListAdapter({
            defaultValue: [],
            help: __('tools.textgaps.properties.solution.help'),
            title: __('tools.textgaps.properties.solution.title'),
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${arrayLibrary.defaultKey}`,
            library: arrayLibrary.library,
            title: __('tools.textgaps.properties.validation.title'),
        }),
        success: new ScoreAdapter({
            defaultValue: 1,
            title: __('tools.textgaps.properties.success.title'),
            validation: scoreValidator,
        }),
        failure: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.textgaps.properties.failure.title'),
            validation: scoreValidator,
        }),
        omit: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.textgaps.properties.omit.title'),
            validation: scoreValidator,
        }),
    },

    /**
     * Improved display of value in score grid
     * @param testItem
     */
    getHtmlValue(testItem) {
        const value = testItem.get('value');
        const ret = (value || []).slice();
        for (let i = 0; i < ret.length; i++) {
            ret[i] = htmlEncode((ret[i] || CONSTANTS.EMPTY).trim());
        }
        return ret.join('<br/>');
    },

    /**
     * Improved display of solution in score grid
     * @param component
     */
    getHtmlSolution(component) {
        this._assertComponent(component);
        const solution = component.get('properties.solution');
        const ret = (solution || []).slice();
        for (let i = 0; i < ret.length; i++) {
            ret[i] = htmlEncode((ret[i] || CONSTANTS.EMPTY).trim());
        }
        return ret.join('<br/>');
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
                __('tools.textgaps.attributes.text.defaultValue') ||
            !TOOLS.RX_TEXT.test(component.attributes.text)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(
                    __('tools.messages.invalidText'),
                    toolName,
                    pageIdx + 1
                ),
            });
        }
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.inputStyle &&
                !TOOLS.RX_STYLE.test(component.attributes.inputStyle))
        ) {
            // TODO: test small font-size incompatible with mobile devices
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    __('tools.messages.invalidStyle'),
                    toolName,
                    pageIdx + 1
                ),
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
                ),
            });
        }
        // TODO also check that split regex is safe
        return ret;
    },
});

/**
 * Default eport
 */
export default TextGapsTool;
