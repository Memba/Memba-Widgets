import $ from 'jquery';
import 'kendo.core';
import './kidoju.widgets.basedialog.es6';
import CONSTANTS from '../window.constants.es6';

const {
    template,
    ui: { BaseDialog }
} = window.kendo;

/**
 * A shortcut function to display an alert dialog
 * @param options (Same as kendo.ui.Dialog, expect `title` and `content` should be replaced by `type` and `message`)
 * @returns {*}
 */
export default function openAlert(options = {}) {
    const ALERT_TEMPLATE =
        '<div class="k-widget k-notification k-notification-#: type #"><div class="k-notification-wrap"><span class="k-icon k-i-#: type #"></span>#: message #</div></div>';

    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement('kj-dialog-alert');

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            $.extend({}, options, {
                title:
                    options.title ||
                    BaseDialog.fn.options.messages.title[
                        options.type || 'info'
                    ],
                content:
                    options.content ||
                    template(ALERT_TEMPLATE)({
                        type: options.type || 'info',
                        message: options.message || ''
                    }),
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

    // Bind the click event
    dialog.one(CONSTANTS.CLICK, e => {
        dfd.resolve({ action: e.action });
    });

    // Show the dialog
    dialog.open();

    return dfd.promise();
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.dialogs = window.kidoju.dialogs || {};
window.kidoju.dialogs.openAlert = openAlert;
// window.kendo.alertEx = openAlert;
