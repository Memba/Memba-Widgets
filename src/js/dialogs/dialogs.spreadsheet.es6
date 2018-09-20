/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.spreadsheet';
import './dialogs.base.es6';
import CONSTANTS from '../common/window.constants.es6';

const {
    ns,
    resize,
    roleSelector,
    ui: { BaseDialog }
} = window.kendo;

/**
 * A shortcut function to display a dialog with a kendo.ui.Spreadsheet
 * @param options
 * @returns {*}
 */
export default function openSpreadsheet(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: 0 });

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title:
                        BaseDialog.fn.options.messages[options.type || 'info'],
                    content: `<div data-${ns}role="spreadsheet" style="width:100%;border:0;"></div>`,
                    // data: {}
                    actions: [
                        BaseDialog.fn.options.messages.actions.ok,
                        BaseDialog.fn.options.messages.actions.cancel
                    ],
                    width: 860
                },
                options
            )
        )
        .data('kendoBaseDialog');

    // Rebind the initOpen event considering the kendo.ui.Spreadsheet widget cannot bind to a viewModel
    dialog.unbind('initOpen');
    dialog.one('initOpen', e => {
        e.sender.element.find(roleSelector('spreadsheet')).kendoSpreadsheet(
            Object.assign(
                {
                    sheetsbar: false,
                    sheets: []
                },
                e.sender.options.data
            )
        );
    });

    // Bind the show event to resize once opened
    dialog.one('show', e => {
        resize(e.sender.element);
        // spreadsheetWidget.activeSheet().range('A1:A1').select();
        // Disable context menu
        // spreadsheet.find('.k-spreadsheet-fixed-container').off('contextmenu');
        // Set default font size
        /*
        var activeSheet = spreadsheetWidget.activeSheet();
        activeSheet.range('R1C1:R' + rows + 'C' + columns).forEachCell(function (rowIndex, columnIndex) {
            var range = activeSheet.range('R' + (rowIndex + 1) + 'C' + (columnIndex + 1));
            range.fontSize(range.fontSize() || 48);
        });
        */
    });

    // Bind the click event
    dialog.bind(CONSTANTS.CLICK, e => {
        const spreadSheet = e.sender.element
            .find(roleSelector('spreadsheet'))
            .data('kendoSpreadsheet');
        dfd.resolve({
            action: e.action,
            data: spreadSheet.toJSON()
        });
    });

    // Display the message dialog
    dialog.open();

    return dfd.promise();
}

/**
 * Legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.dialogs = window.kidoju.dialogs || {};
window.kidoju.dialogs.openSpreadsheet = openSpreadsheet;
