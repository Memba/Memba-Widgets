/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO MaskedTextBox localization

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.maskedtextbox';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import i18n from '../common/window.i18n.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import StyleAdapter from './adapters.style.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import ValidationAdapter from './adapters.validation.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { stringLibrary } from './util.libraries.es6';
import {
    questionValidator,
    scoreValidator,
    solutionValidator,
    validationValidator
} from './util.validators.es6';

const {
    format,
    ns,
    ui: { MaskedTextBox }
} = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * i18n messages
 */
if (!(i18n().tools && i18n().tools.textbox)) {
    $.extend(true, i18n(), {
        tools: {
            textbox: {
                description: 'TextBox: <em>#: properties.name #</em>',
                help: null,
                name: 'TextBox',
                attributes: {
                    mask: { title: 'Mask' },
                    style: { title: 'Style' }
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
 * Note: Masks cannot be properly set via data attributes. An error is raised when masks only contain digits. See the workaround in onResize for more information
 * @type {string}
 */
const TEMPLATE = `<input type="text" id="#: properties.name #" class="kj-interactive" data-${ns}role="maskedtextbox" data-${ns}prompt-char="\u25CA" style="#: attributes.style #" {0}>`;

/**
 * @class TextBoxTool tool
 * @type {void|*}
 */
const TextBoxTool = BaseTool.extend({
    id: 'textbox',
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    description: i18n().tools.textbox.description,
    height: 80,
    help: i18n().tools.textbox.help,
    icon: 'text_field',
    menu: [
        'attributes.style',
        '', // separator
        'properties.question',
        'properties.solution',
        'properties.validation'
    ],
    name: i18n().tools.textbox.name,
    weight: 1,
    width: 300,
    templates: {
        design: format(TEMPLATE, ''),
        play: format(
            TEMPLATE,
            `data-${ns}bind="value: #: properties.name #.value"`
        ),
        review:
            format(
                TEMPLATE,
                `data-${ns}bind="value: #: properties.name #.value"`
            ) + BaseTool.fn.getHtmlCheckMarks()
    },
    attributes: {
        mask: new TextBoxAdapter({
            title: i18n().tools.textbox.attributes.mask.title
        }),
        style: new StyleAdapter({
            title: i18n().tools.textbox.attributes.style.title
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: i18n().tools.textbox.properties.name.title
        }),
        question: new QuestionAdapter({
            title: i18n().tools.textbox.properties.question.title,
            validation: questionValidator
        }),
        solution: new TextBoxAdapter({
            title: i18n().tools.textbox.properties.solution.title,
            validation: solutionValidator
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${stringLibrary.defaultKey}`,
            library: stringLibrary.library,
            title: i18n().tools.textbox.properties.validation.title,
            validation: validationValidator
        }),
        success: new ScoreAdapter({
            title: i18n().tools.textbox.properties.success.title,
            defaultValue: 1,
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            title: i18n().tools.textbox.properties.failure.title,
            defaultValue: 0,
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            title: i18n().tools.textbox.properties.omit.title,
            defaultValue: 0,
            validation: scoreValidator
        })
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
            stageElement.find('input').prop({
                // disabled elements do not receive mousedown events in Edge and cannot be selected in design mode
                // disabled: !enabled,
                readonly: !enabled
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
        const content = stageElement.find('input'); // span > input
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
            if (
                component.attributes &&
                !TOOLS.RX_FONT_SIZE.test(component.attributes.style)
            ) {
                content.css('font-size', Math.floor(0.65 * content.height()));
            }
        }
        // This is a trick because of http://docs.telerik.com/kendo-ui/framework/mvvm/overview#imnpm updateportant-notes
        // In other words it is impossible to set a mask that only contains digits declaratively (data-mask attribute)
        // See also http://docs.telerik.com/kendo-ui/api/javascript/ui/maskedtextbox#configuration-mask
        const maskedTextBoxWidget = content.data('kendoMaskedTextBox');
        if (
            MaskedTextBox &&
            maskedTextBoxWidget instanceof MaskedTextBox &&
            maskedTextBoxWidget.options.mask !== component.attributes.mask
        ) {
            maskedTextBoxWidget.setOptions({ mask: component.attributes.mask });
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
        const {
            description,
            i18n: { messages }
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
                message: format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        return ret;
    }
});

/**
 * Registration
 */
tools.register(TextBoxTool);
