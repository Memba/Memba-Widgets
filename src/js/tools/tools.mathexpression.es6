/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * @class MathExpression tool
 * @type {void|*}
 */
var MathExpression = Tool.extend({
    id: 'mathexpression',
    icon: 'formula',
    description: i18n.mathexpression.description,
    cursor: CURSOR_CROSSHAIR,
    templates: {
        default: '<div data-#= ns #role="mathexpression" class="#: class$() #" style="#: attributes.style #" data-#= ns #id="#: id$() #" data-#= ns #behavior="#: properties.behavior #" data-#= ns #constant="#: properties.constant #" data-#= ns #inline="#: attributes.inline #" data-#= ns #value="#: attributes.formula #" ></div>'
    },
    height: 180,
    width: 370,
    attributes: {
        formula: new adapters.MathAdapter(
            { title: i18n.mathexpression.attributes.formula.title, defaultValue: i18n.mathexpression.attributes.formula.defaultValue }
        ),
        inline: new adapters.BooleanAdapter (
            { title: i18n.mathexpression.attributes.inline.title, defaultValue: i18n.mathexpression.attributes.inline.defaultValue }
        ),
        style: new adapters.StyleAdapter({ title: i18n.mathexpression.attributes.style.title, defaultValue: 'font-size:50px;' })
    },
    properties: {
        behavior: new adapters.EnumAdapter(
            {
                title: i18n.mathexpression.properties.behavior.title,
                defaultValue: 'none',
                enum: ['none', 'draggable', 'selectable']
            },
            {
                style: 'width: 100%;'
            }
        ),
        constant: new adapters.StringAdapter({ title: i18n.image.properties.constant.title })
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
        assert.instanceof(MathExpression, that, assert.format(assert.messages.instanceof.default, 'this', 'MathExpression'));
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        var template = kendo.template(that.templates.default);
        // The class$ function adds the kj-interactive class to draggable components
        component.class$ = function () {
            return component.properties.behavior === 'draggable' ? INTERACTIVE_CLASS : '';
        };
        // The id$ function returns the component id for components that have a behavior
        component.id$ = function () {
            return (component.properties.behavior !== 'none' && $.type(component.id) === STRING && component.id.length) ? component.id : '';
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
        if (!component.attributes ||
            !component.attributes.formula ||
            (component.attributes.formula === i18n.mathexpression.attributes.formula.defaultValue) ||
            !RX_FORMULA.test(component.attributes.formula)) {
            // TODO: replace RX_FORMULA with a LaTeX synthax checker
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(messages.invalidFormula, description, pageIdx + 1)
            });
        }
        if (!component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        // TODO: We should also check that there is a dropZone on the page if draggable
        return ret;
    }

});
tools.register(MathExpression);
