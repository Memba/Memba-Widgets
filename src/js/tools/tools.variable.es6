/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
import { iconUri } from '../app/app.uris.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import math from '../vendor/josdejong/math';
import ExpressionAdapter from './adapters.expression.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';

const logger = new Logger('tools.variable');
const { format } = window.kendo;

/**
 * Template
 * @type {string}
 */
const TEMPLATE =
    '<div class="k-chip k-chip-filled" style="font-size: 24px">' +
    '<img class="k-icon k-chip-icon" src="#: src$() #" alt="#: alt$() #">' +
    '<span class="k-chip-content"><span class="k-chip-label">#: alt$() #</span></span></div>';

/**
 * VariableTool
 * @class VariableTool
 * @extends BaseTool
 */
const VariableTool = BaseTool.extend({
    id: 'variable',
    childSelector: CONSTANTS.DIV,
    height: 64,
    menu: ['properties.variable', 'properties.expression'],
    width: 64,
    templates: {
        default: TEMPLATE,
    },
    // attributes: {},
    properties: {
        variable: new TextBoxAdapter({
            defaultValue: 'k',
            help: __('tools.variable.properties.variable.help'),
            title: __('tools.variable.properties.variable.title'),
        }),
        // Note: an expression can handle more than random numbers, for example: 2 * pi
        expression: new ExpressionAdapter({
            defaultValue: 'round(random(0, 10), 2)',
            help: __('tools.variable.properties.expression.help'),
            title: __('tools.variable.properties.expression.title'),
        }),
    },

    /**
     * Evaluate expression
     */
    eval(component) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        const variable = component.get('properties.variable');
        const expression = component.get('properties.expression');
        let value;
        try {
            value = math.evaluate(expression /* , scope */);
        } catch (error) {
            logger.error({
                method: 'eval',
                error,
                data: { variable, expression },
            });
        }
        return value;
    },

    /**
     * getHtmlContent
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        const { icon } = this;
        $.extend(component, {
            // alternate text of an image
            alt$() {
                return component.get('properties.variable');
            },
            // The src$ function resolves the icon path
            src$() {
                return iconUri(icon);
            },
        });
        return BaseTool.fn.getHtmlContent.call(this, component, mode);
    },

    /**
     * onResize
     * @method onResize
     * @param e
     * @param component
     */
    /*
    onResize(e, component) {
        // Consider resizing image and font
        const stageElement = $(e.currentTarget);
        const content = stageElement.children(this.childSelector);
        BaseTool.fn.onResize.call(this, e, component);
    },
    */

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
        if (
            !component.attributes ||
            !component.attributes.alt ||
            component.attributes.alt ===
                __('tools.variable.attributes.alt.defaultValue') ||
            !TOOLS.RX_TEXT.test(component.attributes.alt)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(
                    messages.invalidAltText,
                    description,
                    pageIdx + 1
                ),
            });
        }
        if (
            !component.attributes ||
            !component.attributes.src ||
            component.attributes.src ===
                __('tools.variable.attributes.src.defaultValue') ||
            !TOOLS.RX_IMAGE.test(component.attributes.src)
        ) {
            ret.push({
                type:
                    component.attributes.src ===
                    __('tools.variable.attributes.src.defaultValue')
                        ? CONSTANTS.WARNING
                        : CONSTANTS.ERROR,
                index: pageIdx,
                message: format(
                    messages.invalidImageFile,
                    description,
                    pageIdx + 1
                ),
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
 * Default export
 */
export default VariableTool;
