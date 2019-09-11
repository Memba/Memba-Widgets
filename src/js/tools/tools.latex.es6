/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import BooleanAdapter from './adapters.boolean.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import MathInputAdapter from './adapters.mathinput.es6';
import StyleAdapter from './adapters.style.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';

const { format, ns } = window.kendo;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div data-${ns}role="latex" class="#: class$() #" style="#: attributes.style #" data-${ns}id="#: id$() #" data-${ns}behavior="#: properties.behavior #" data-${ns}constant="#: properties.constant #" data-${ns}inline="#: attributes.inline #" data-${ns}value="#: attributes.formula #" ></div>`;

/**
 * @class LatexTool
 */
const LatexTool = BaseTool.extend({
    id: 'latex',
    height: 180,
    width: 370,
    menu: ['attributes.formula'],
    templates: {
        default: TEMPLATE
    },
    attributes: {
        formula: new MathInputAdapter({
            title: __('tools.latex.attributes.formula.title'),
            defaultValue: __('tools.latex.attributes.formula.defaultValue')
        }),
        inline: new BooleanAdapter({
            title: __('tools.latex.attributes.inline.title'),
            defaultValue: __('tools.latex.attributes.inline.defaultValue')
        }),
        style: new StyleAdapter({
            title: __('tools.latex.attributes.style.title'),
            defaultValue: 'font-size:50px;'
        })
    },
    properties: {
        behavior: new DropDownListAdapter(
            {
                title: __('tools.latex.properties.behavior.title'),
                defaultValue: 'none',
                enum: ['none', 'draggable', 'selectable']
            },
            {
                style: 'width: 100%;'
            }
        ),
        constant: new TextBoxAdapter({
            title: __('tools.image.properties.constant.title')
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
            // The class$ function adds the kj-interactive class to draggable components
            class$() {
                return component.properties.behavior === 'draggable'
                    ? CONSTANTS.INTERACTIVE_CLASS
                    : '';
            },
            // The id$ function returns the component id for components that have a behavior
            id$() {
                return component.properties.behavior !== 'none' &&
                    $.type(component.id) === CONSTANTS.STRING &&
                    component.id.length
                    ? component.id
                    : '';
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
        const {
            description,
            i18n: { messages }
        } = this; // tool description
        if (
            !component.attributes ||
            !component.attributes.formula ||
            component.attributes.formula ===
                __('tools.latex.attributes.formula.defaultValue') ||
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
 * Default eport
 */
export default LatexTool;
