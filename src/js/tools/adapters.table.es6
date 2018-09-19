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
 * @class TableAdapter
 */
const TableAdapter = BaseAdapter.extend({
    init: function (options) {
        var that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = undefined;
        // This is the inline editor with a [...] button which triggers this.showDialog
        that.editor = function (container, settings) {
            $('<button/>')
            .text('...')
            .addClass('k-button')
            .css({ margin: 0, width: '100%' })
            .appendTo(container)
            .on(CLICK, $.proxy(that.showDialog, that, settings));
        };
    },
    showDialog: function (options/*, e*/) {
        var model = options.model;
        var columns = model.get('attributes.columns');
        var rows = model.get('attributes.rows');
        var data = util.resizeSpreadsheetData(model.get('attributes.data'), rows, columns);
        // TODO wrap in import('./dialogs/kidoju.dialogs.spreadsheet.es6').then(function () {...});
        kidoju.dialogs.openSpreadsheet({
            title: options.title,
            data: Object.assign({
                columns: columns,
                rows: rows,
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
                        'format'],
                    insert: false,
                    data: false
                }
            }, data)
        })
        .done(function (result) {
            if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action) {
                options.model.set(options.field, result.data);
            }
        })
        .fail(function (err) {
            // TODO
        });
    }
});

/**
 * Default export
 */
export default TableAdapter;
