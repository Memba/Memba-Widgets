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
import CONSTANTS from '../common/window.constants.es6';
// import { PageComponent } from '../data/data.pagecomponent.es6';
import '../widgets/widgets.table.es6';
import NumberAdapter from './adapters.number.es6';
import TableAdapter from './adapters.table.es6';
import { BaseTool } from './tools.base.es6';
import TOOLS from './util.constants.es6';
// TODO import {} from './util.validators.es6';

const { format, ns, roleSelector } = window.kendo;

/**
 * Template
 * @type {string}
 */
const TEMPLATE = `<div
    data-${ns}role="table"
    data-${ns}columns="#: attributes.columns #"
    data-${ns}rows="#: attributes.rows #"
    data-${ns}value="#: JSON.stringify(attributes.data) #"
    style="#: attributes.style #"></div>`;

/**
 * @class Static table tool
 * @type {void|*}
 */
const TableTool = BaseTool.extend({
    id: 'table',
    childSelector: `${CONSTANTS.DIV}${roleSelector('table')}`,
    height: 350,
    width: 600,
    menu: ['attributes.columns', 'attributes.rows', 'attributes.data'],
    templates: {
        default: TEMPLATE,
    },
    attributes: {
        columns: new NumberAdapter(
            {
                defaultValue: 4,
                help: __('tools.table.attributes.columns.help'),
                title: __('tools.table.attributes.columns.title'),
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 1,
                'data-max': 20,
            }
        ),
        rows: new NumberAdapter(
            {
                defaultValue: 6,
                help: __('tools.table.attributes.rows.help'),
                title: __('tools.table.attributes.rows.title'),
            },
            {
                'data-decimals': 0,
                'data-format': 'n0',
                'data-min': 1,
                'data-max': 20,
            }
        ),
        data: new TableAdapter({
            defaultValue: {
                sheets: [
                    {
                        rows: [
                            {
                                index: 0,
                                cells: [
                                    {
                                        index: 0,
                                        value: 'TableTool',
                                        fontSize: 48,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            help: __('tools.table.attributes.data.help'),
            title: __('tools.table.attributes.data.title'),
        }),
    },

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        const ret = BaseTool.fn.validate.call(this, component, pageIdx);
        const toolName = this.name;
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
                ),
            });
            // TODO validate columns, rows and data
        }
        return ret;
    },
});

/**
 * Default eport
 */
export default TableTool;
