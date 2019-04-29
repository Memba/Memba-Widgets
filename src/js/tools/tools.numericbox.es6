/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO NummericBox can use Random tools to calculate solutions using simple MathJS scripting

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.numerictextbox';
import math from '../vendor/josdejong/math';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import i18n from '../common/window.i18n.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import ExpressionAdapter from './adapters.expression.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import ValidationAdapter from './adapters.validation.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { numberLibrary } from './util.libraries.es6';
import {
    questionValidator,
    scoreValidator,
    styleValidator
} from './util.validators.es6';

const { format, htmlEncode, ns, template } = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * i18n messages
 */
if (!(i18n().tools && i18n().tools.numericbox)) {
    $.extend(true, i18n(), {
        tools: {
            numericbox: {
                description: 'NumericBox: <em>#: properties.name #</em>',
                help: null,
                name: 'NumericBox',
                attributes: {
                    decimals: { title: 'Decimals' },
                    min: { title: 'Min' },
                    max: { title: 'Max' },
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
 * @type {string}
 */
const TEMPLATE = `<input type="number" id="#: properties.name #" class="kj-interactive" data-${ns}role="numerictextbox" data-${ns}decimals="#: attributes.decimals #" data-${ns}format="n#: attributes.decimals #" data-${ns}min="#: attributes.min #" data-${ns}max="#: attributes.max #" data-${ns}spinners="false" style="#: attributes.style #" {0}>`;

/**
 * NumericBoxTool
 * @class NumericBoxTool
 * @extends BaseTool
 */
const NumericBoxTool = BaseTool.extend({
    id: 'numericbox',
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    description: i18n().tools.numericbox.description,
    height: 80,
    help: i18n().tools.numericbox.help,
    icon: 'odometer',
    menu: [
        'attributes.style',
        '', // separator
        'properties.question',
        'properties.solution',
        'properties.validation'
    ],
    name: i18n().tools.numericbox.name,
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
        decimals: new NumberAdapter(
            {
                title: i18n().tools.numericbox.attributes.decimals.title,
                defaultValue: 0
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 0
            }
        ),
        min: new NumberAdapter(
            {
                title: i18n().tools.numericbox.attributes.min.title,
                defaultValue: Number.MIN_SAFE_INTEGER
            },
            {
                'data-decimals': 0,
                'data-format': 'n0'
            }
        ),
        max: new NumberAdapter(
            {
                title: i18n().tools.numericbox.attributes.max.title,
                defaultValue: Number.MAX_SAFE_INTEGER
            },
            {
                'data-decimals': 0,
                'data-format': 'n0'
            }
        ),
        style: new StyleAdapter({
            title: i18n().tools.numericbox.attributes.style.title,
            validation: styleValidator
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: i18n().tools.numericbox.properties.name.title
        }),
        question: new QuestionAdapter({
            title: i18n().tools.numericbox.properties.question.title,
            validation: questionValidator
        }),
        solution: new ExpressionAdapter({
            title: i18n().tools.numericbox.properties.solution.title
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${numberLibrary.defaultKey}`,
            library: numberLibrary.library,
            title: i18n().tools.numericbox.properties.validation.title
        }),
        success: new ScoreAdapter({
            title: i18n().tools.numericbox.properties.success.title,
            defaultValue: 1,
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            title: i18n().tools.numericbox.properties.failure.title,
            defaultValue: 0,
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            title: i18n().tools.numericbox.properties.omit.title,
            defaultValue: 0,
            validation: scoreValidator
        })
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
        // TODO Manage eval errors in try/catch
        const value = math.eval(
            component.get('properties.solution'),
            variables
        );
        const decimals = Math.round(component.get('attributes.decimals') || 0);
        return math.round(value, decimals);
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
        const content = stageElement.find(CONSTANTS.INPUT); // span > input
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
                !TOOLS.RX_FONT_SIZE.test(component.get('attributes.style'))
            ) {
                content.css('font-size', Math.floor(0.65 * content.height()));
            }
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
tools.register(NumericBoxTool);
