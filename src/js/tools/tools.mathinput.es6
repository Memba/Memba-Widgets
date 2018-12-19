/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import ReadOnlyAdapter from './adapters.readonly.es6';
import NumberAdapter from './adapters.number.es6';
import QuestionAdapter from './adapters.question.es6';
import ValidationAdapter from './adapters.validation.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';
import { LIB_COMMENT, mathLibrary} from './util.libraries.es6';

const {
    attr,
    format
} = window.kendo;
const ScoreAdapter = NumberAdapter;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).mathinput || {
            // TODO
        }
    );
}


var MATHINPUT = '<div data-#= ns #role="mathinput" data-#= ns #toolbar="#: JSON.stringify(toolbar$()) #" style="#: attributes.style #" {0}>#: attributes.formula #</div>';
/**
 * @class MathInputTool tool
 * @type {void|*}
 */
var MathInputTool = BaseTool.extend({
    id: 'mathinput',
    icon: 'formula_input',
    description: i18n.mathinput.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    templates: {
        design: format(MATHINPUT, 'data-#= ns #enable="false"'),
        play: format(MATHINPUT, 'data-#= ns #bind="value: #: properties.name #.value"'),
        review: format(MATHINPUT, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + BaseTool.fn.getHtmlCheckMarks()
    },
    height: 120,
    width: 370,
    attributes: {
        // The formula is intended to set several MathQuillMathFields, which requires to make the solution an array of mathinputs
        // formula: new MathInputAdapter({ title: i18n.mathinput.attributes.formula.title }),
        // backspace: new BooleanAdapter({ title: i18n.mathinput.attributes.backspace.title, defaultValue: false }),
        // field: new BooleanAdapter({ title: i18n.mathinput.attributes.field.title, defaultValue: false }),
        keypad: new BooleanAdapter({ title: i18n.mathinput.attributes.keypad.title, defaultValue: true }),
        basic: new BooleanAdapter({ title: i18n.mathinput.attributes.basic.title, defaultValue: true }),
        greek: new BooleanAdapter({ title: i18n.mathinput.attributes.greek.title, defaultValue: false }),
        operators: new BooleanAdapter({ title: i18n.mathinput.attributes.operators.title, defaultValue: false }),
        expressions: new BooleanAdapter({ title: i18n.mathinput.attributes.expressions.title, defaultValue: false }),
        sets: new BooleanAdapter({ title: i18n.mathinput.attributes.sets.title, defaultValue: false }),
        matrices: new BooleanAdapter({ title: i18n.mathinput.attributes.matrices.title, defaultValue: false }),
        statistics: new BooleanAdapter({ title: i18n.mathinput.attributes.statistics.title, defaultValue: false }),
        style: new StyleAdapter({ title: i18n.mathinput.attributes.style.title, defaultValue: 'font-size:50px;' })
    },
    properties: {
        name: new ReadOnlyAdapter({ title: i18n.mathinput.properties.name.title }),
        question: new QuestionAdapter({ title: i18n.mathinput.properties.question.title }),
        solution: new MathInputAdapter({ title: i18n.mathinput.properties.solution.title, defaultValue: '' }),
        validation: new ValidationAdapter({
            defaultValue: `${LIB_COMMENT}${mathLibrary.defaultKey}`,
            library: mathLibrary.library,
            title: i18n.mathinput.properties.validation.title
        }),
        success: new ScoreAdapter({ title: i18n.mathinput.properties.success.title, defaultValue: 1 }),
        failure: new ScoreAdapter({ title: i18n.mathinput.properties.failure.title, defaultValue: 0 }),
        omit: new ScoreAdapter({ title: i18n.mathinput.properties.omit.title, defaultValue: 0 })
    },

    /**
     * Get Html or jQuery content
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent: function (component, mode) {
        var that = this;
        assert.instanceof(MathInputTool, that, assert.format(assert.messages.instanceof.default, 'this', 'MathInputTool'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'PageComponent'));
        assert.enum(Object.values(CONSTANTS.STAGE_MODES), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(CONSTANTS.STAGE_MODES)));
        var template = kendo.template(that.templates[mode]);
        component.toolbar$ = function () {
            var tools = [];
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
                tools: tools
            };
        };
        return template($.extend(component, { ns: kendo.ns }));
    },

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize: function (e, component) {
        var stageElement = $(e.currentTarget);
        assert.ok(stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`), format('e.currentTarget is expected to be a stage element'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'PageComponent'));
        var content = stageElement.children('div');
        if ($.type(component.width) === CONSTANTS.NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === CONSTANTS.NUMBER) {
            content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
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
    validate: function (component, pageIdx) {
        var ret = BaseTool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        /*
        if (!component.attributes ||
            !component.attributes.formula ||
            (component.attributes.formula === i18n.mathinput.attributes.formula.defaultValue) ||
            !RX_FORMULA.test(component.attributes.formula)) {
            // TODO: replace RX_FORMULA with a LaTeX synthax checker
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(messages.invalidFormula, description, pageIdx + 1)
            });
        }
        */
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
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
tools.register(MathInputTool);
