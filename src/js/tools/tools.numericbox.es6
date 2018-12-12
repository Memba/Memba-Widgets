/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.numerictextbox';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import PageComponent from '../data/models.pagecomponent.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import StyleAdapter from './adapters.style.es6';
import NumericBoxAdapter from './adapters.textbox.es6';
import ValidationAdapter from './adapters.validation.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import { LIB_COMMENT, stringLibrary } from './util.libraries.es6';

const {
    format,
    ui: { NumericTextBox }
} = window.kendo;
const ScoreAdapter = NumberAdapter;

// TODO Review RX constants
const RX_STYLE = /^(([\w-]+)\s*:([^;<>]+);\s*)+$/i;
const RX_FONT_SIZE = /font(-size)?:[^;]*[0-9]+px/;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).textbox || {
            description: 'NumericBox',
            help: null,
            name: 'NumericBox',
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
    );
}

// Masks cannot be properly set via data attributes. An error is raised when masks only contain digits. See the workaround in onResize for more information
const TEXTBOX =
    '<input type="text" id="#: properties.name #" class="kj-interactive" data-#= ns #role="maskedtextbox" data-#= ns #prompt-char="\u25CA" style="#: attributes.style #" {0}>';

/**
 * @class NumericBoxTool tool
 * @type {void|*}
 */
const NumericBoxTool = BaseTool.extend({
    id: 'textbox',
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    description: i18n().description,
    height: 80,
    help: i18n().help,
    icon: 'text_field',
    menu: [
        'attributes.style',
        '', // separator
        'properties.question',
        'properties.solution',
        'properties.validation'
    ],
    name: i18n().name,
    weight: 1,
    width: 300,
    templates: {
        design: format(TEXTBOX, ''),
        play: format(
            TEXTBOX,
            'data-#= ns #bind="value: #: properties.name #.value"'
        ),
        review:
            format(
                TEXTBOX,
                'data-#= ns #bind="value: #: properties.name #.value"'
            ) + BaseTool.fn.getHtmlCheckMarks()
    },
    attributes: {
        mask: new NumericBoxAdapter({ title: i18n().attributes.mask.title }),
        style: new StyleAdapter({ title: i18n().attributes.style.title })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: i18n().properties.name.title
        }),
        question: new QuestionAdapter({
            title: i18n().properties.question.title
        }),
        // TODO ExpressionAdapter (switch with NumericBox)
        solution: new NumericBoxAdapter({
            title: i18n().properties.solution.title
        }),
        validation: new ValidationAdapter({
            defaultValue: `${LIB_COMMENT}${stringLibrary.defaultKey}`,
            library: stringLibrary.library,
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
     * onEnable event handler
     * @class NumericBoxTool
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
                // disabled: !enabled, // disabled elements do not receive mousedown events in Edge and cannot be selected in design mode
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
                !RX_FONT_SIZE.test(component.attributes.style)
            ) {
                content.css('font-size', Math.floor(0.65 * content.height()));
            }
        }
        // This is a trick because of http://docs.telerik.com/kendo-ui/framework/mvvm/overview#important-notes
        // In other words it is impossible to set a mask that only contains digits declaratively (data-mask attribute)
        // See also http://docs.telerik.com/kendo-ui/api/javascript/ui/maskedtextbox#configuration-mask
        const maskedNumericBoxWidget = content.data('kendoMaskedNumericBox');
        if (
            MaskedNumericBox &&
            maskedNumericBoxWidget instanceof MaskedNumericBox &&
            maskedNumericBoxWidget.options.mask !== component.attributes.mask
        ) {
            maskedNumericBoxWidget.setOptions({ mask: component.attributes.mask });
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
                !RX_STYLE.test(component.attributes.style))
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
tools.register(NumericBoxTool);
