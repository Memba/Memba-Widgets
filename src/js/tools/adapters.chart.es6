/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO consider a generic OpenDialogAdapter with a [...] button

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
 * ChartAdapter
 * @class ChartAdapter
 * @extends BaseAdapter
 */
const ChartAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options /* , attributes */) {
        const that = this;
        BaseAdapter.fn.init.call(that, options);
        that.type = undefined;
        // This is the inline editor with a [...] button which triggers this.showDialog
        that.editor = (container, settings) => {
            $(`<${CONSTANTS.BUTTON}/>`)
                .text(CONSTANTS.ELLIPSIS)
                .addClass('k-button')
                .css({ margin: 0, width: '100%' })
                .appendTo(container)
                .on(CONSTANTS.CLICK, that.showDialog.bind(that, settings));
        };
    },

    /**
     * showDialog
     * @param options
     */
    showDialog(options /* , e */) {
        const { model } = options;
        const columns = model.get('attributes.categories') + 1;
        const rows = model.get('attributes.values') + 1;
        const data = resizeSpreadsheetData(
            model.get('attributes.data'),
            rows,
            columns
        );
        // TODO wrap in import('./dialogs/dialogs.spreadsheet.es6').then(function () {...});
        openSpreadsheet({
            title: options.title || this.title,
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
                    BaseDialog.fn.options.messages.actions.ok.action
                ) {
                    // TODO test result.data???
                    options.model.set(options.field, result.data);
                }
            })
            .catch($.noop); // TODO error management
    }
});

/**
 * Default export
 */
export default ChartAdapter;
