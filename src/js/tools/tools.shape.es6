/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.shape.es6';
import ColorAdapter from './adapters.color.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import NumberAdapter from './adapters.number.es6';
import TextAreaAdapter from './adapters.textarea.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import { constantValidator } from './util.validators.es6';

const { ns } = window.kendo;

// TODO Sort out default color values after https://github.com/telerik/kendo-ui-core/issues/6313
// TODO Add opacity
// TODO Add stroke type (solid, dashed, ...)

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div
    data-${ns}role="shape"
    data-${ns}shape="#: attributes.shape #"
    data-${ns}angles="#: attributes.angles #"
    data-${ns}text="#: attributes.text #"
    data-${ns}style="{fill:{color:&quot;#: fillColor$() #&quot;}, stroke:{color:&quot;#: strokeColor$() #&quot;, width:#: attributes.strokeWidth #}}">
</div>`;

/**
 * ShapeTool
 * @class ShapeTool
 * @extends BaseTool
 */
const ShapeTool = BaseTool.extend({
    id: 'shape',
    height: 200,
    width: 300,
    menu: ['attributes.shape', 'attributes.text', 'attributes.fillColor'],
    templates: {
        default: TEMPLATE,
    },
    attributes: {
        shape: new DropDownListAdapter(
            {
                defaultValue: 'rectangle',
                help: __('tools.shape.attributes.shape.help'),
                source: __('tools.shape.attributes.shape.source'),
                title: __('tools.shape.attributes.shape.title'),
            },
            { style: 'width: 100%;' }
        ),
        angles: new NumberAdapter(
            {
                help: __('tools.shape.attributes.angles.help'),
                title: __('tools.shape.attributes.angles.title'),
                defaultValue: 4,
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 3,
                'data-max': 20,
            }
        ),
        text: new TextAreaAdapter({
            help: __('tools.shape.attributes.text.help'),
            title: __('tools.shape.attributes.text.title'),
        }),
        fillColor: new ColorAdapter(
            {
                help: __('tools.shape.attributes.fillColor.help'),
                title: __('tools.shape.attributes.fillColor.title'),
                defaultValue: TOOLS.MIDDLE_GREY,
                nullable: true,
            },
            {
                'data-clear-button': true,
            }
        ),
        strokeColor: new ColorAdapter(
            {
                help: __('tools.shape.attributes.strokeColor.help'),
                title: __('tools.shape.attributes.strokeColor.title'),
                defaultValue: TOOLS.MIDDLE_GREY,
                nullable: true,
            },
            {
                'data-clear-button': true,
            }
        ),
        strokeWidth: new NumberAdapter(
            {
                help: __('tools.shape.attributes.strokeWidth.help'),
                title: __('tools.shape.attributes.strokeWidth.title'),
                defaultValue: 1,
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 0,
                'data-max': 20,
            }
        ),
    },
    properties: {
        behavior: new DropDownListAdapter(
            {
                defaultValue: 'none',
                source: __('tools.shape.properties.behavior.source'),
                title: __('tools.shape.properties.behavior.title'),
            },
            {
                style: 'width: 100%;',
            }
        ),
        constant: new TextBoxAdapter({
            title: __('tools.shape.properties.constant.title'),
            validation: constantValidator,
        }),
    },

    /**
     * getHtmlContent
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        $.extend(component, {
            // Return 'none' for null value for SVG transparency
            fillColor$() {
                const fillColor = component.get('attributes.fillColor');
                return $.type(fillColor) === CONSTANTS.STRING
                    ? fillColor
                    : 'none';
            },
            // Return 'none' for null value for SVG transparency
            strokeColor$() {
                const strokeColor = component.get('attributes.strokeColor');
                return $.type(strokeColor) === CONSTANTS.STRING
                    ? strokeColor
                    : 'none';
            },
        });
        return BaseTool.fn.getHtmlContent.call(this, component, mode);
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    /*
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const {
            description,
            i18n: { messages }
        } = this; // tool description
        if (
            !component.attributes ||
            !component.attributes.text ||
            component.attributes.text ===
            __('tools.shape.attributes.text.defaultValue') ||
            !TOOLS.RX_TEXT.test(component.attributes.text)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(messages.invalidText, description, pageIdx + 1)
            });
        }
        if (
            !component.attributes ||
            // Styles are only checked if there is any (optional)
            (component.attributes.style &&
                !TOOLS.RX_STYLE.test(component.attributes.style))
        ) {
            // TODO: test small font-size incompatible with mobile devices
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(messages.invalidStyle, description, pageIdx + 1)
            });
        }
        // TODO: We should also check that there is a dropZone on the page if draggable
        // TODO check selectable too
        return ret;
    },
     */
});

/**
 * Default export
 */
export default ShapeTool;
