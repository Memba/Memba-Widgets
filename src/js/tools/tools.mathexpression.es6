/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import BooleanAdapter from './adapters.boolean.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import MathInputAdapter from './adapters.mathinput.es6';
import StyleAdapter from './adapters.style.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import tools from './tools.es6';
import BaseTool from './tools.base.es6';

const { format, ns, template } = window.kendo;

/**
 * i18n
 * @returns {*|{}}
 */
function i18n() {
    return (
        (((window.app || {}).i18n || {}).tools || {}).mathexpression ||
        {
            // TODO
        }
    );
}

/**
 * @class MathExpressionTool
 */
const MathExpressionTool = BaseTool.extend({
    id: 'mathexpression',
    icon: 'formula',
    description: i18n.mathexpression.description,
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    templates: {
        default: `<div data-${ns}role="mathexpression" class="#: class$() #" style="#: attributes.style #" data-${ns}id="#: id$() #" data-${ns}behavior="#: properties.behavior #" data-${ns}constant="#: properties.constant #" data-${ns}inline="#: attributes.inline #" data-${ns}value="#: attributes.formula #" ></div>`
    },
    height: 180,
    width: 370,
    attributes: {
        formula: new MathInputAdapter({
            title: i18n.mathexpression.attributes.formula.title,
            defaultValue: i18n.mathexpression.attributes.formula.defaultValue
        }),
        inline: new BooleanAdapter({
            title: i18n.mathexpression.attributes.inline.title,
            defaultValue: i18n.mathexpression.attributes.inline.defaultValue
        }),
        style: new StyleAdapter({
            title: i18n.mathexpression.attributes.style.title,
            defaultValue: 'font-size:50px;'
        })
    },
    properties: {
        behavior: new DropDownListAdapter(
            {
                title: i18n.mathexpression.properties.behavior.title,
                defaultValue: 'none',
                enum: ['none', 'draggable', 'selectable']
            },
            {
                style: 'width: 100%;'
            }
        ),
        constant: new TextBoxAdapter({
            title: i18n.image.properties.constant.title
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
        const that = this;
        assert.instanceof(
            MathExpressionTool,
            that,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'MathExpressionTool'
            )
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
        assert.enum(
            Object.values(CONSTANTS.STAGE_MODES),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.values(CONSTANTS.STAGE_MODES)
            )
        );
        const tmpl = template(that.templates.default);
        // The class$ function adds the kj-interactive class to draggable components
        component.class$ = function() {
            return component.properties.behavior === 'draggable'
                ? CONSTANTS.INTERACTIVE_CLASS
                : '';
        };
        // The id$ function returns the component id for components that have a behavior
        component.id$ = function() {
            return component.properties.behavior !== 'none' &&
                $.type(component.id) === CONSTANTS.STRING &&
                component.id.length
                ? component.id
                : '';
        };
        return tmpl(component);
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
            assert.format('e.currentTarget is expected to be a stage element')
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
        const content = stageElement.children('div');
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
        if (
            !component.attributes ||
            !component.attributes.formula ||
            component.attributes.formula ===
                i18n.mathexpression.attributes.formula.defaultValue ||
            !TOOLS.RX_FORMULA.test(component.attributes.formula)
        ) {
            // TODO: replace TOOLS.RX_FORMULA with a LaTeX synthax checker
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(
                    messages.invalidFormula,
                    description,
                    pageIdx + 1
                )
            });
        }
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
        // TODO: We should also check that there is a dropZone on the page if draggable
        return ret;
    }
});

/**
 * Registration
 */
tools.register(MathExpressionTool);
