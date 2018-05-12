import $ from 'jquery';
import 'kendo.core';
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
    import('kendo.spreadsheet')
        .then(() => {
            // Find or create the DOM element
            const $dialog = BaseDialog.getElement(options.cssClass);
            $dialog.css({ padding: 0 });

            // Create the dialog
            const dialog = $dialog
                .kendoBaseDialog(
                    $.extend({}, options, {
                        title:
                            options.title ||
                            BaseDialog.fn.options.messages[
                                options.type || 'info'
                            ],
                        content: `<div data-${ns}role="spreadsheet" style="width:100%;border:0;"></div>`,
                        actions: options.actions || [
                            {
                                action: 'ok',
                                imageUrl:
                                    'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg',
                                primary: true,
                                text: BaseDialog.fn.options.messages.action.ok
                            },
                            {
                                action: 'cancel',
                                imageUrl:
                                    'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                                text:
                                    BaseDialog.fn.options.messages.action.cancel
                            }
                        ]
                    })
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

            // Since $dialog is reused, clear padding when closing
            dialog.one(CONSTANTS.CLOSE, e => {
                e.sender.element.css({ padding: '' });
            });

            // Display the message dialog
            dialog.open();
        })
        .catch(ex => {
            dfd.reject(ex);
        });
    return dfd.promise();
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.dialogs = window.kidoju.dialogs || {};
window.kidoju.dialogs.openSpreadsheet = openSpreadsheet;
