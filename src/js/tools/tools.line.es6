/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
// import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
// import assert from '../common/window.assert.es6';
// import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.line.es6';
import ColorAdapter from './adapters.color.es6';
// import DropDownListAdapter from './adapters.dropdownlist.es6';
import NumberAdapter from './adapters.dropdownlist.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';

const { ns } = window.kendo;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div
    data-${ns}role="line"
    data-${ns}end-cap="{shape:&quot;arrow&quot;,fill:{color:&quot;#: attributes.lineColor #&quot;}}"
    data-${ns}line="{stroke:{color:&quot;#: attributes.lineColor #&quot;}}"
    data-${ns}start-cap="{shape:&quot;circle&quot;,fill:{color:&quot;#: attributes.lineColor #&quot;}}">
</div>`;

/**
 * LineTool
 * @class LineTool
 * @extends BaseTool
 */
const LineTool = BaseTool.extend({
    id: 'line',
    height: 60,
    width: 300,
    menu: ['attributes.lineColor'],
    templates: {
        default: TEMPLATE
    },
    attributes: {
        lineColor: new ColorAdapter({
            title: __('tools.line.attributes.lineColor.title'),
            defaultValue: TOOLS.MEDIUM_GREY
        }),
        lineWidth: new NumberAdapter({
            title: __('tools.line.attributes.lineWidth.title'),
            defaultValue: 5
            // TODO min, nax, step... -----> Consider slider
        })
    },
    // properties: {},

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        /*
        const {
            description,
            i18n: { messages }
        } = this; // tool description
        if (
            !component.attributes ||
            !component.attributes.text ||
            component.attributes.text ===
            __('tools.line.attributes.text.defaultValue') ||
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
         */
        // TODO: We should also check that there is a dropZone on the page if draggable
        // TODO check selectable too
        return ret;
    }
});

/**
 * Default export
 */
export default LineTool;
