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
 * A shortcut function to display a dialog with a summary finder
 * @param options
 * @returns {*}
 */
export default function openFinder(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const element = BaseDialog.getElement();
    element.css({ padding: 0 });

    // Create the dialog
    const dialog = element
        .kendoBaseDialog(
            $.extend({}, options, {
                title:
                    options.title ||
                    BaseDialog.fn.options.messages[options.type || 'info'],
                content: `<div data-${ns}role="spreadsheet"></div>`,
                actions: options.actions || [
                    {
                        action: 'ok',
                        text: BaseDialog.fn.options.messages.action.ok,
                        imageUrl:
                            'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg'
                    },
                    {
                        action: 'cancel',
                        text:
                            BaseDialog.fn.options.messages.action
                                .cancel,
                        imageUrl:
                            'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg'
                    }
                ]
            })
        )
        .data('kendoBaseDialog');

    // Rebind the initOpen event considering the kendo.ui.Spreadsheet widget cannot bind to a viewModel
    dialog.unbind('initOpen');
    dialog.bind('initOpen', e => {
        const spreadSheet = e.sender.element
            .find(roleSelector('spreadsheet'))
            .kendoSpreadsheet()
            .data('kendoSpreadsheet');
        spreadSheet.fromJSON(options.data);
    });

    // Bind the show event to resize once opened
    dialog.bind('show', e => {
        resize(e.sender.element);
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
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.dialogs = window.kidoju.dialogs || {};
window.kidoju.dialogs.openSpreadsheet = openSpreadsheet;
