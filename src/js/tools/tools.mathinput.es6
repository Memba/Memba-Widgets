/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import BooleanAdapter from './adapters.boolean.es6';
import MathInputAdapter from './adapters.mathinput.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import StyleAdapter from './adapters.style.es6';
import ValidationAdapter from './adapters.validation.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { mathLibrary } from './util.libraries.es6';
import { scoreValidator } from './util.validators.es6';
import __ from '../app/app.i18n.es6';

const { format, ns } = window.kendo;
const ScoreAdapter = NumberAdapter;

const TEMPLATE = `<div data-${ns}role="mathinput" data-${ns}toolbar="#: JSON.stringify(toolbar$()) #" style="#: attributes.style #" {0}>#: attributes.formula #</div>`;
/**
 * @class MathInputTool tool
 * @type {void|*}
 */
const MathInputTool = BaseTool.extend({
    id: 'mathinput',
    height: 120,
    width: 370,
    weight: 1,
    // menu: [],
    templates: {
        design: format(TEMPLATE, `data-${ns}enable="false"`),
        play: format(
            TEMPLATE,
            `data-${ns}bind="value: #: properties.name #.value"`
        ),
        review:
            format(
                TEMPLATE,
                `data-${ns}bind="value: #: properties.name #.value" data-${ns}enable="false"`
            ) + BaseTool.fn.getHtmlCheckMarks()
    },
    attributes: {
        // The formula is intended to set several MathQuillMathFields, which requires to make the solution an array of mathinputs
        // formula: new MathInputAdapter({ title: __('tools.mathinput.attributes.formula.title') }),
        // backspace: new BooleanAdapter({ title: __('tools.mathinput.attributes.backspace.title'), defaultValue: false }),
        // field: new BooleanAdapter({ title: __('tools.mathinput.attributes.field.title'), defaultValue: false }),
        keypad: new BooleanAdapter({
            title: __('tools.mathinput.attributes.keypad.title'),
            defaultValue: true
        }),
        basic: new BooleanAdapter({
            title: __('tools.mathinput.attributes.basic.title'),
            defaultValue: true
        }),
        greek: new BooleanAdapter({
            title: __('tools.mathinput.attributes.greek.title'),
            defaultValue: false
        }),
        operators: new BooleanAdapter({
            title: __('tools.mathinput.attributes.operators.title'),
            defaultValue: false
        }),
        expressions: new BooleanAdapter({
            title: __('tools.mathinput.attributes.expressions.title'),
            defaultValue: false
        }),
        sets: new BooleanAdapter({
            title: __('tools.mathinput.attributes.sets.title'),
            defaultValue: false
        }),
        matrices: new BooleanAdapter({
            title: __('tools.mathinput.attributes.matrices.title'),
            defaultValue: false
        }),
        statistics: new BooleanAdapter({
            title: __('tools.mathinput.attributes.statistics.title'),
            defaultValue: false
        }),
        style: new StyleAdapter({
            title: __('tools.mathinput.attributes.style.title'),
            defaultValue: 'font-size:50px;'
        })
    },
    properties: {
        name: new ReadOnlyAdapter({
            title: __('tools.mathinput.properties.name.title')
        }),
        question: new QuestionAdapter({
            title: __('tools.mathinput.properties.question.title')
        }),
        solution: new MathInputAdapter({
            title: __('tools.mathinput.properties.solution.title'),
            defaultValue: ''
        }),
        validation: new ValidationAdapter({
            defaultValue: `${TOOLS.LIB_COMMENT}${mathLibrary.defaultKey}`,
            library: mathLibrary.library,
            title: __('tools.mathinput.properties.validation.title')
        }),
        success: new ScoreAdapter({
            title: __('tools.mathinput.properties.success.title'),
            defaultValue: 1,
            validation: scoreValidator
        }),
        failure: new ScoreAdapter({
            title: __('tools.mathinput.properties.failure.title'),
            defaultValue: 0,
            validation: scoreValidator
        }),
        omit: new ScoreAdapter({
            title: __('tools.mathinput.properties.omit.title'),
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
        $.extend(component, {
            toolbar$() {
                const tools = [];
                /*
                if (this.get('attributes.backspace')) {
                    tools.push('backspace');
                }
                if (this.get('attributes.field')) {
                    tools.push('field');
                }
                */
                if (this.get('attributes.keypad')) {
                    tools.push('keypad');
                }
                if (this.get('attributes.basic')) {
                    tools.push('basic');
                }
                if (this.get('attributes.greek')) {
                    tools.push('greek');
                }
                if (this.get('attributes.operators')) {
                    tools.push('operators');
                }
                if (this.get('attributes.expressions')) {
                    tools.push('expressions');
                }
                if (this.get('attributes.sets')) {
                    tools.push('sets');
                }
                if (this.get('attributes.matrices')) {
                    tools.push('matrices');
                }
                if (this.get('attributes.statistics')) {
                    tools.push('statistics');
                }
                return {
                    container: '#floating .kj-floating-content',
                    resizable: false,
                    tools
                };
            }
        });
        return BaseTool.fn.getHtmlContent.call(this, component, mode);
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const toolName = this.name;
        /*
        if (!component.attributes ||
            !component.attributes.formula ||
            (component.attributes.formula === __('tools.mathinput.attributes.formula.defaultValue)') ||
            !TOOLS.RX_FORMULA.test(component.attributes.formula)) {
            // TODO: replace TOOLS.RX_FORMULA with a LaTeX synthax checker
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(__('tools.messages.invalidFormula'), toolName, pageIdx + 1)
            });
        }
        */
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
                    __('tools.messages.invalidStyle'),
                    toolName,
                    pageIdx + 1
                )
            });
        }
        return ret;
    }
});

/**
 * Default eport
 */
export default MathInputTool;
