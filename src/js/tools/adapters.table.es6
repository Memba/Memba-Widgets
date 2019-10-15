/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import openSpreadsheet from '../dialogs/dialogs.spreadsheet.es6';
import BaseAdapter from './adapters.base.es6';
import { resizeSpreadsheetData } from './util.miscellaneous.es6';

const {
    ui: { BaseDialog }
} = window.kendo;

/**
 * TableAdapter
 * @class TableAdapter
 * @extends BaseAdapter
 */
const TableAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options /* , attributes */) {
        BaseAdapter.fn.init.call(this, options);
        this.type = undefined;
        // This is the inline editor with a [...] button which triggers this.showDialog
        this.editor = (container, settings) => {
            // TODO: Consider hidden input for validation
            $(`<${CONSTANTS.BUTTON}/>`)
                .text(CONSTANTS.ELLIPSIS)
                .addClass('k-button')
                .css({ margin: 0, width: '100%' })
                .appendTo(container)
                .on(CONSTANTS.CLICK, this.showDialog.bind(this, settings));
        };
    },

    /**
     * ShowDialog
     * @param options
     */
    showDialog(options = {} /* , evt */) {
        const { model } = options;
        const columns = model.get('attributes.columns');
        const rows = model.get('attributes.rows');
        const data = resizeSpreadsheetData(
            model.get('attributes.data'),
            rows,
            columns
        );
        openSpreadsheet({
            title: options.title || this.title,
            data: {
                columns,
                rows,
                columnWidth: 150,
                rowHeight: 58,
                sheets: [],
                sheetsbar: false,
                toolbar: {
                    // Note: merge and hide not included in v1
                    home: [
                        ['bold', 'italic', 'underline'],
                        'backgroundColor',
                        'textColor',
                        'borders',
                        'fontSize',
                        'fontFamily',
                        'alignment',
                        'textWrap',
                        ['formatDecreaseDecimal', 'formatIncreateDecimal'],
                        'format'
                    ],
                    insert: false,
                    data: false
                },
                ...data
            }
        })
            .then(result => {
                if (
                    result.action ===
                    BaseDialog.fn.options.messages.actions.ok.action
                ) {
                    options.model.set(options.field, result.data);
                }
            })
            .catch($.noop); // TODO error management
    }
});

/**
 * Default export
 */
export default TableAdapter;
