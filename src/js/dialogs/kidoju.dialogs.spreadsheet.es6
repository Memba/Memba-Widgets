import $ from 'jquery';
import 'kendo.core';
import 'kendo.spreadsheet';
import './kidoju.widgets.basedialog.es6';
import CONSTANTS from '../window.constants.es6';

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
                    actions: [
                        BaseDialog.fn.options.messages.actions.ok,
                        BaseDialog.fn.options.messages.actions.cancel
                    ]
                },
                options
            )
        )
        .data('kendoBaseDialog');

    // Rebind the initOpen event considering the kendo.ui.Spreadsheet widget cannot bind to a viewModel
    dialog.unbind('initOpen');
    dialog.one('initOpen', e => {
        const spreadSheet = e.sender.element
            .find(roleSelector('spreadsheet'))
            .kendoSpreadsheet({
                sheetsbar: false
            })
            .data('kendoSpreadsheet');
        spreadSheet.fromJSON(options.data);
    });

    // Bind the show event to resize once opened
    dialog.one('show', e => {
        resize(e.sender.element);
    });

    // Bind the click event
    dialog.one(CONSTANTS.CLICK, e => {
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
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.dialogs = window.kidoju.dialogs || {};
window.kidoju.dialogs.openSpreadsheet = openSpreadsheet;
