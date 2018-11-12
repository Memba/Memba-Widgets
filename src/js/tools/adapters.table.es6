/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

const { format } = window.kendo;

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
     * @param attributes
     */
    init(options, attributes) {
        const that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = undefined;
        // This is the inline editor with a [...] button which triggers this.showDialog
        that.editor = function(container, settings) {
            $('<button/>')
                .text('...')
                .addClass('k-button')
                .css({ margin: 0, width: '100%' })
                .appendTo(container)
                .on(CONSTANTS.CLICK, $.proxy(that.showDialog, that, settings));
        };
    },
    showDialog(options /* , e */) {
        const model = options.model;
        const columns = model.get('attributes.columns');
        const rows = model.get('attributes.rows');
        const data = util.resizeSpreadsheetData(
            model.get('attributes.data'),
            rows,
            columns
        );
        openSpreadsheet({
                title: options.title,
                data: Object.assign(
                    {
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
                                [
                                    'formatDecreaseDecimal',
                                    'formatIncreateDecimal'
                                ],
                                'format'
                            ],
                            insert: false,
                            data: false
                        }
                    },
                    data
                )
            })
            .then(result => {
                if (
                    result.action ===
                    kendo.ui.BaseDialog.fn.options.messages.actions.ok.action
                ) {
                    options.model.set(options.field, result.data);
                }
            })
            .catch(err => {
                // TODO
            });
    }
});

/**
 * Default export
 */
export default TableAdapter;
