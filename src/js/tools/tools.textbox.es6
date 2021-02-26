/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO MaskedTextBox localization

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.maskedtextbox';
import __ from '../app/app.i18n.es6';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import StyleAdapter from './adapters.style.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import ValidationAdapter from './adapters.validation.es6';
// import tools from './tools.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { stringLibrary } from './util.libraries.es6';
import {
    questionValidator,
    scoreValidator,
    solutionValidator,
    styleValidator,
    validationValidator,
} from './util.validators.es6';

const {
    format,
    ns,
    roleSelector,
    ui: { MaskedTextBox },
} = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * Template
 * Note: Masks cannot be properly set via data attributes. An error is raised when masks only contain digits. See the workaround in onResize for more information
 * @type {string}
 */
const TEMPLATE = `<input
    type="text"
    class="kj-interactive"
    data-${ns}id="#: properties.name #"
    data-${ns}prompt-char="\u25CA"
    data-${ns}role="maskedtextbox"
    style="#: attributes.style #" {0}>`;
const BINDING = `data-${ns}bind="value: #: properties.name #.value"`;
const DISABLED = `data-${ns}enabled="false"`;

/**
 * @class TextBoxTool tool
 * @type {void|*}
 */
const TextBoxTool = BaseTool.extend({
    id: 'textbox',
    childSelector: `${CONSTANTS.INPUT}${roleSelector('maskedtextbox')}`,
    height: 80,
    menu: ['properties.question', 'properties.solution'],
    weight: 1,
    width: 300,
    templates: {
        design: format(TEMPLATE, DISABLED),
        play: format(TEMPLATE, BINDING),
        review:
            format(TEMPLATE, `${BINDING} ${DISABLED}`) +
            BaseTool.fn.getHtmlCheckMarks(),
    },
    attributes: {
        mask: new TextBoxAdapter({
            title: __('tools.textbox.attributes.mask.title'),
        }),
        style: new StyleAdapter({
            title: __('tools.textbox.attributes.style.title'),
            validation: styleValidator,
        }),
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.textbox.properties.name.title'),
        }),
        question: new QuestionAdapter({
            help: __('tools.textbox.properties.question.help'),
            title: __('tools.textbox.properties.question.title'),
            validation: questionValidator,
        }),
        solution: new TextBoxAdapter({
            help: __('tools.textbox.properties.solution.help'),
            title: __('tools.textbox.properties.solution.title'),
            validation: solutionValidator,
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${stringLibrary.defaultKey}`,
            library: stringLibrary.library,
            title: __('tools.textbox.properties.validation.title'),
            validation: validationValidator,
        }),
        success: new ScoreAdapter({
            defaultValue: 1,
            title: __('tools.textbox.properties.success.title'),
            validation: scoreValidator,
        }),
        failure: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.textbox.properties.failure.title'),
            validation: scoreValidator,
        }),
        omit: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.textbox.properties.omit.title'),
            validation: scoreValidator,
        }),
    },

    /**
     * onEnable event handler
     * @class TextBoxTool
     * @method onEnable
     * @param e
     * @param component
     * @param enabled
     */
    onEnable(e, component, enabled) {
        const stageElement = $(e.currentTarget);
        if (
            stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`) &&
            component instanceof PageComponent
        ) {
            stageElement.children(this.childSelector).prop({
                // disabled elements do not receive mousedown events in Edge and cannot be selected in design mode
                // disabled: !enabled,
                readonly: !enabled,
            });
        }
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
        const content = stageElement.find(this.childSelector);
        if (
            component.attributes &&
            !TOOLS.RX_FONT_SIZE.test(component.get('attributes.style'))
        ) {
            content.css('font-size', Math.floor(0.65 * content.height()));
        }
        // This is a trick because of http://docs.telerik.com/kendo-ui/framework/mvvm/overview#important-notes
        // In other words it is impossible to set a mask that only contains digits declaratively (data-mask attribute)
        // See also http://docs.telerik.com/kendo-ui/api/javascript/ui/maskedtextbox#configuration-mask
        const maskedTextBox = content.data('kendoMaskedTextBox');
        if (
            MaskedTextBox &&
            maskedTextBox instanceof MaskedTextBox &&
            maskedTextBox.options.mask !== component.attributes.mask
        ) {
            maskedTextBox.setOptions({ mask: component.attributes.mask });
        }
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
        } = this; // tool description
        // TODO: validate mask
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
 * Default export
 */
export default TextBoxTool;
