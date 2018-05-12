import $ from 'jquery';
import 'kendo.core';
import './kidoju.widgets.basedialog.es6';
import CONSTANTS from '../window.constants.es6';

const {
    ns,
    resize,
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
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: 0 });

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            $.extend({}, options, {
                title:
                    options.title ||
                    BaseDialog.fn.options.messages[options.type || 'info'],
                content: `<div data-${ns}role="spreadsheet"></div>`,
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
                        text: BaseDialog.fn.options.messages.action.cancel
                    }
                ]
            })
        )
        .data('kendoBaseDialog');

    // Bind the show event to resize once opened
    dialog.one('show', e => {
        resize(e.sender.element);
    });

    // Bind the click event
    dialog.one(CONSTANTS.CLICK, e => {
        dfd.resolve({
            action: e.action,
            data: e.sender.viewModel.toJSON()
        });
    });

    // Since $dialog is reused, clear padding when closing
    dialog.one(CONSTANTS.CLOSE, e => {
        e.sender.element.css({ padding: '' });
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
window.kidoju.dialogs.openFinder = openFinder;
