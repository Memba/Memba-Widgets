/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

var MATHINPUT = '<div data-#= ns #role="mathinput" data-#= ns #toolbar="#: JSON.stringify(toolbar$()) #" style="#: attributes.style #" {0}>#: attributes.formula #</div>';
/**
 * @class MathInput tool
 * @type {void|*}
 */
var MathInput = Tool.extend({
    id: 'mathinput',
    icon: 'formula_input',
    description: i18n.mathinput.description,
    cursor: CURSOR_CROSSHAIR,
    templates: {
        design: kendo.format(MATHINPUT, 'data-#= ns #enable="false"'),
        play: kendo.format(MATHINPUT, 'data-#= ns #bind="value: #: properties.name #.value"'),
        review: kendo.format(MATHINPUT, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
    },
    height: 120,
    width: 370,
    attributes: {
        // The formula is intended to set several MathQuillMathFields, which requires to make the solution an array of mathinputs
        // formula: new adapters.MathAdapter({ title: i18n.mathinput.attributes.formula.title }),
        // backspace: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.backspace.title, defaultValue: false }),
        // field: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.field.title, defaultValue: false }),
        keypad: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.keypad.title, defaultValue: true }),
        basic: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.basic.title, defaultValue: true }),
        greek: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.greek.title, defaultValue: false }),
        operators: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.operators.title, defaultValue: false }),
        expressions: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.expressions.title, defaultValue: false }),
        sets: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.sets.title, defaultValue: false }),
        matrices: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.matrices.title, defaultValue: false }),
        statistics: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.statistics.title, defaultValue: false }),
        style: new adapters.StyleAdapter({ title: i18n.mathinput.attributes.style.title, defaultValue: 'font-size:50px;' })
    },
    properties: {
        name: new adapters.NameAdapter({ title: i18n.mathinput.properties.name.title }),
        question: new adapters.QuestionAdapter({ title: i18n.mathinput.properties.question.title }),
        solution: new adapters.MathAdapter({ title: i18n.mathinput.properties.solution.title, defaultValue: '' }),
        validation: new adapters.ValidationAdapter({ title: i18n.mathinput.properties.validation.title }),
        success: new adapters.ScoreAdapter({ title: i18n.mathinput.properties.success.title, defaultValue: 1 }),
        failure: new adapters.ScoreAdapter({ title: i18n.mathinput.properties.failure.title, defaultValue: 0 }),
        omit: new adapters.ScoreAdapter({ title: i18n.mathinput.properties.omit.title, defaultValue: 0 })
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
        assert.instanceof(MathInput, that, assert.format(assert.messages.instanceof.default, 'this', 'MathInput'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
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
        assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        var content = stageElement.children('div');
        if ($.type(component.width) === NUMBER) {
            content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
        }
        if ($.type(component.height) === NUMBER) {
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
        var ret = Tool.fn.validate.call(this, component, pageIdx);
        var description = this.description; // tool description
        var messages = this.i18n.messages;
        /*
        if (!component.attributes ||
            !component.attributes.formula ||
            (component.attributes.formula === i18n.mathinput.attributes.formula.defaultValue) ||
            !RX_FORMULA.test(component.attributes.formula)) {
            // TODO: replace RX_FORMULA with a LaTeX synthax checker
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(messages.invalidFormula, description, pageIdx + 1)
            });
        }
        */
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        return ret;
    }

});
tools.register(MathInput);
