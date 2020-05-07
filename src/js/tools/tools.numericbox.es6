/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO NummericBox can use variables to calculate solutions using simple MathJS scripting

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.numerictextbox';
import math from '../vendor/josdejong/math';
import __ from '../app/app.i18n.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import ExpressionAdapter from './adapters.expression.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import ValidationAdapter from './adapters.validation.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { numberLibrary } from './util.libraries.es6';
import {
    questionValidator,
    scoreValidator,
    styleValidator,
} from './util.validators.es6';

const { format, htmlEncode, ns, template /* , roleSelector */ } = window.kendo;
const ScoreAdapter = NumberAdapter;
const logger = new Logger('tools.numericbox');

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<input
    type="number"
    id="#: properties.name #"
    class="kj-interactive"
    data-${ns}role="numerictextbox"
    data-${ns}decimals="#: attributes.decimals #"
    data-${ns}format="n#: attributes.decimals #"
    data-${ns}min="#: attributes.min #"
    data-${ns}max="#: attributes.max #"
    data-${ns}spinners="false"
    style="#: attributes.style #" {0}>`;
const BINDING = `data-${ns}bind="value: #: properties.name #.value"`;
const DISABLED = `data-${ns}enabled="false"`;

/**
 * NumericBoxTool
 * @class NumericBoxTool
 * @extends BaseTool
 */
const NumericBoxTool = BaseTool.extend({
    id: 'numericbox',
    // childSelector: `${CONSTANTS.INPUT}${roleSelector('numerictextbox')}`,
    childSelector: `${CONSTANTS.INPUT}`, // Note there are 2 inputs to resize
    height: 80,
    width: 300,
    weight: 1,
    menu: ['properties.question', 'properties.solution'],
    templates: {
        design: format(TEMPLATE, DISABLED),
        play: format(TEMPLATE, BINDING),
        review:
            format(TEMPLATE, `${BINDING} ${DISABLED}`) +
            BaseTool.fn.getHtmlCheckMarks(),
    },
    attributes: {
        decimals: new NumberAdapter(
            {
                title: __('tools.numericbox.attributes.decimals.title'),
                defaultValue: 0,
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 0,
            }
        ),
        min: new NumberAdapter(
            {
                title: __('tools.numericbox.attributes.min.title'),
                defaultValue: Number.MIN_SAFE_INTEGER,
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
            }
        ),
        max: new NumberAdapter(
            {
                title: __('tools.numericbox.attributes.max.title'),
                defaultValue: Number.MAX_SAFE_INTEGER,
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
            }
        ),
        style: new StyleAdapter({
            title: __('tools.numericbox.attributes.style.title'),
            validation: styleValidator,
        }),
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.numericbox.properties.name.title'),
        }),
        question: new QuestionAdapter({
            help: __('tools.numericbox.properties.question.help'),
            title: __('tools.numericbox.properties.question.title'),
            validation: questionValidator,
        }),
        solution: new ExpressionAdapter({
            help: __('tools.numericbox.properties.solution.help'),
            title: __('tools.numericbox.properties.solution.title'),
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${numberLibrary.defaultKey}`,
            library: numberLibrary.library,
            title: __('tools.numericbox.properties.validation.title'),
        }),
        success: new ScoreAdapter({
            defaultValue: 1,
            title: __('tools.numericbox.properties.success.title'),
            validation: scoreValidator,
        }),
        failure: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.numericbox.properties.failure.title'),
            validation: scoreValidator,
        }),
        omit: new ScoreAdapter({
            defaultValue: 0,
            title: __('tools.numericbox.properties.omit.title'),
            validation: scoreValidator,
        }),
    },

    /**
     * Get computed question from variables
     * @param component
     * @param variables
     * @returns {string}
     */
    getQuestion(component, variables) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        assert.isPlainObject(
            variables,
            assert.format(assert.messages.isPlainObject.default, 'variables')
        );
        const question = component.get('properties.question') || '';
        const tmpl = template(
            question.replace(TOOLS.RX_MUSTACHE_VAR, TOOLS.KENDO_VAR)
        );
        return tmpl(variables);
    },

    /**
     * Get computed question from variables encoded for display
     * @param compoenent
     * @param variables
     * @returns {*}
     */
    getHtmlQuestion(component, variables) {
        return htmlEncode(this.getQuestion(component, variables));
    },

    /**
     * Get computed solution from variables
     * @param component
     * @param variables
     * @returns {string}
     */
    getSolution(component, variables) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        assert.isPlainObject(
            variables,
            assert.format(assert.messages.isPlainObject.default, 'variables')
        );
        let ret;
        try {
            const value = math.evaluate(
                component.get('properties.solution'),
                variables
            );
            const decimals = Math.round(
                component.get('attributes.decimals') || 0
            );
            ret = math.round(value, decimals);
        } catch (error) {
            logger.error({
                method: 'getSolution',
                error,
                data: { component, variables },
            });
        }
        return ret;
    },

    /**
     * Get computed solution from variables encoded for display
     * @param component
     * @param variables
     */
    getHtmlSolution(component, variables) {
        return this.getSolution(component, variables);
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
            stageElement.find(this.childSelector).prop({
                // disabled: !enabled, // disabled elements do not receive mousedown events in Edge and cannot be selected in design mode
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
 * Default eport
 */
export default NumericBoxTool;
