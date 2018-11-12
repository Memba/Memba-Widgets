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

// TODO consider a generic OpenDialogAdapter????

/**
 * ChartAdapter
 * @class ChartAdapter
 * @extends BaseAdapter
 */
const ChartAdapter = BaseAdapter.extend({
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
        const columns = model.get('attributes.categories') + 1;
        const rows = model.get('attributes.values') + 1;
        const data = util.resizeSpreadsheetData(
            model.get('attributes.data'),
            rows,
            columns
        );
        // TODO wrap in import('./dialogs/dialogs.spreadsheet.es6').then(function () {...});
        openSpreadsheet({
                title: options.title,
                data: Object.assign(data, {
                    columns,
                    rows,
                    sheetsbar: false,
                    toolbar: false
                })
            })
            .then(result => {
                if (
                    result.action ===
                    kendo.ui.BaseDialog.fn.options.messages.actions.ok.action
                ) {
                    // TODO test result.data???
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
export default ChartAdapter;
