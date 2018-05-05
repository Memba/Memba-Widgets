import $ from 'jquery';
import 'kendo.core';
import './kidoju.widgets.basedialog.es6';
import CONSTANTS from '../window.constants.es6';

const { ns, template } = window.kendo;
const { BaseDialog } = window.kendo.ui;
const WIDGET_CLASS = 'kj-dialog';

/**
 * A shortcut function to display a prompt dialog
 * @param options (Same as kendo.ui.Dialog, expect `title` and `content` should be replaced by `type` and `message`)
 * @returns {*}
 */
export default function openPrompt(options) {
    const opts = options || {};
    const cssClass = opts.cssClass || 'kj-dialog-prompt';
    const PROMPT_TEMPLATE = `<div><div class="k-widget k-notification k-notification-#: type #"><div class="k-notification-wrap"><span class="k-icon k-i-#: type #"></span>#: message #</div></div><div><input type="text" class="k-textbox" style="width:100%; margin-top: 1em;" data-${ns}bind="value: input"></div></div>`;

    const dfd = $.Deferred();
    let box;

    // Create or reuse an existing dialog
    let element = $(`.${WIDGET_CLASS}.${cssClass}`);
    if (element.length > 0) {
        box = element.data('kendoBaseDialog');
        if (box instanceof BaseDialog) {
            box.destroy();
        }
        // element.empty(); We replace the content anyway
    } else {
        // Add a div to the html document for the alert dialog
        // cssClass ensures we do not mess with other dialogs
        element = $(`<div class="${cssClass}"></div>`).appendTo(document.body);
    }

    // Create the dialog
    box = element
        .kendoBaseDialog(
            $.extend({}, opts, {
                title:
                    opts.title ||
                    BaseDialog.fn.options.messages.title[opts.type || 'info'],
                content:
                    opts.content ||
                    template(PROMPT_TEMPLATE)({
                        type: opts.type || 'info',
                        message: opts.message || ''
                    }),
                data: {
                    input: ''
                },
                actions: opts.actions || [
                    {
                        action: 'ok',
                        text: BaseDialog.fn.options.messages.action.ok,
                        imageUrl:
                            'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg'
                    },
                    {
                        action: 'cancel',
                        text: BaseDialog.fn.options.messages.action.cancel,
                        imageUrl:
                            'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg'
                    }
                ]
            })
        )
        .data('kendoBaseDialog');

    // Bind the click event
    box.bind(CONSTANTS.CLICK, e => {
        dfd.resolve({
            action: e.action,
            data: e.sender.viewModel.toJSON()
        });
    });

    // Show the dialog
    box.open();

    return dfd.promise();
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.dialogs = window.kidoju.dialogs || {};
window.kidoju.dialogs.openPrompt = openPrompt;
