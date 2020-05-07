/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import TextAreaAdapter from './adapters.textarea.es6';
import ValidationAdapter from './adapters.validation.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { textLibrary } from './util.libraries.es6';
import {
    questionValidator,
    scoreValidator,
    styleValidator,
} from './util.validators.es6';

const { format, ns } = window.kendo;
const ScoreAdapter = NumberAdapter;

const TEMPLATE = `<textarea
    class="k-textbox kj-interactive"
    id="#: properties.name #"
    style="#: attributes.style #" {0}>
</textarea>`;
const BINDING = `data-${ns}bind="value: #: properties.name #.value"`;

/**
 * @class TextAreaTool tool
 * @type {void|*}
 */
const TextAreaTool = BaseTool.extend({
    id: 'textarea',
    childSelector: CONSTANTS.TEXTAREA,
    height: 300,
    width: 500,
    weight: 2,
    menu: ['properties.question', 'properties.solution'],
    templates: {
        design: format(TEMPLATE, ''),
        play: format(TEMPLATE, BINDING),
        review: format(TEMPLATE, BINDING) + BaseTool.fn.getHtmlCheckMarks(),
    },
    attributes: {
        style: new StyleAdapter({
            title: __('tools.textarea.attributes.style.title'),
            validation: styleValidator,
        }),
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.textarea.properties.name.title'),
        }),
        question: new QuestionAdapter({
            help: __('tools.textarea.properties.question.help'),
            title: __('tools.textarea.properties.question.title'),
            validation: questionValidator,
        }),
        solution: new TextAreaAdapter({
            help: __('tools.textarea.properties.solution.help'),
            title: __('tools.textarea.properties.solution.title'),
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${textLibrary.defaultKey}`,
            library: textLibrary.library,
            title: __('tools.textarea.properties.validation.title'),
        }),
        success: new ScoreAdapter({
            defaultValue: 1,
            title: __('tools.textarea.properties.success.title'),
            validation: scoreValidator,
        }),
        failure: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.textarea.properties.failure.title'),
            validation: scoreValidator,
        }),
        omit: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.textarea.properties.omit.title'),
            validation: scoreValidator,
        }),
    },

    /**
     * onEnable event handler
     * @class TextAreaTool
     * @method onEnable
     * @param e
     * @param component
     * @param enabled
     */
    onEnable(e, component, enabled) {
        assert.type(
            CONSTANTS.OBJECT,
            e,
            // Note: we are not asserting that e is a $.Event
            // to call onEnable({ currentTarget: el[0] }, component )
            assert.format(assert.messages.type.default, 'e', CONSTANTS.OBJECT)
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
        const stageElement = $(e.currentTarget);
        assert.ok(
            stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`),
            assert.format('e.currentTarget is expected to be a stage element')
        );
        stageElement.children(this.childSelector).prop({
            // disabled elements do not receive mousedown events in Edge
            // and cannot be selected in design mode
            // disabled: !enabled,
            readonly: !enabled,
        });
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const {
            description,
            i18n: { messages },
        } = this;
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style &&
                !TOOLS.RX_STYLE.test(component.attributes.style))
        ) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    messages.invalidStyle,
                    description,
                    pageIdx + 1
                ),
            });
        }
        return ret;
    },
});

/**
 * Default eport
 */
export default TextAreaTool;
