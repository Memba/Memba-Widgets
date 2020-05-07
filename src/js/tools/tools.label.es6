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
import '../widgets/widgets.template.es6';
import DropDownListAdapter from './adapters.dropdownlist.es6';
import StyleAdapter from './adapters.style.es6';
import TextAreaAdapter from './adapters.textarea.es6';
import TextBoxAdapter from './adapters.textbox.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
import {
    constantValidator,
    styleValidator,
    textValidator,
} from './util.validators.es6';

const { format, htmlEncode, ns } = window.kendo;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div
    class="#: class$() #"
    data-${ns}role="template"
    data-${ns}template="t-#: id #"
    data-${ns}id="#: id #"
    data-${ns}behavior="#: properties.behavior #"
    data-${ns}constant="#: properties.constant #"
    data-${ns}bind="value: variables$()"
    style="#: attributes.style #">
    </div>
    <script id="t-#: id #" type="text/x-kendo-template">#= template$() #</script>`;
// We need to designate the template in a script, because kendo.init calls parseOption from kendo.core.js
// which tranforms any data-*template tag into a template function assigned to options.template and
// it won't work otherwise because ${'#' + value) fails if value is the template content

const DESIGN = `<div
    class="#: class$() #"
    data-${ns}id="#: id #"
    data-${ns}behavior="#: properties.behavior #"
    data-${ns}constant="#: properties.constant #"
    style="#: attributes.style #">#= text$() #</div>`;

/**
 * LabelTool
 * @class LabelTool
 * @extends BaseTool
 */
const LabelTool = BaseTool.extend({
    id: 'label',
    height: 80,
    menu: ['attributes.text'],
    width: 300,
    templates: {
        design: DESIGN,
        play: TEMPLATE,
        review: TEMPLATE,
    },
    attributes: {
        text: new TextAreaAdapter(
            {
                title: __('tools.label.attributes.text.title'),
                help: __('tools.label.attributes.text.help'),
                defaultValue: __('tools.label.attributes.text.defaultValue'),
                validation: textValidator,
            },
            {
                rows: 2,
                style: 'resize:vertical; width: 100%;',
                validationMessage: 'Oops',
            }
        ),
        style: new StyleAdapter(
            {
                title: __('tools.label.attributes.style.title'),
                validation: styleValidator,
            },
            {
                validationMessage: 'Oops',
            }
        ),
    },
    properties: {
        behavior: new DropDownListAdapter(
            {
                defaultValue: 'none',
                source: __('tools.label.properties.behavior.source'),
                title: __('tools.label.properties.behavior.title'),
            },
            {
                style: 'width: 100%;',
            }
        ),
        constant: new TextBoxAdapter(
            {
                title: __('tools.label.properties.constant.title'),
                validation: constantValidator,
            },
            {
                validationMessage: 'Oops',
            }
        ),
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
                return `kj-label${
                    component.get('properties.behavior') === 'draggable'
                        ? ` ${CONSTANTS.INTERACTIVE_CLASS}`
                        : ''
                }`;
            },
            // compute variables, html encode text, then replace line feeds with <br/>
            template$() {
                const text = component.get('attributes.text');
                return text
                    .replace(TOOLS.RX_MUSTACHE_VAR, TOOLS.KENDO_VAR)
                    .replace(/\n/g, '<br/>');
            },
            text$() {
                const text = component.get('attributes.text');
                return htmlEncode(text).replace(/\n/g, '<br/>');
            },
            variables$() {
                // We need this to avoid an error when binding the stage
                // but in fact the variables$ will be supplied by data.basetest
                // when binding the test properties
                return {};
            },
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
            i18n: { messages },
        } = this; // tool description
        if (
            !component.attributes ||
            !component.attributes.text ||
            component.attributes.text ===
                __('tools.label.attributes.text.defaultValue') ||
            !TOOLS.RX_TEXT.test(component.attributes.text)
        ) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(messages.invalidText, description, pageIdx + 1),
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
                message: format(
                    messages.invalidStyle,
                    description,
                    pageIdx + 1
                ),
            });
        }
        // TODO: We should also check that there is a dropZone on the page if draggable
        // TODO check selectable too
        return ret;
    },
});

/**
 * Default eport
 */
export default LabelTool;
