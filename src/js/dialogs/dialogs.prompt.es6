/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import './widgets.basedialog.es6';
import CONSTANTS from '../common/window.constants.es6';

const {
    ns,
    template,
    ui: { BaseDialog }
} = window.kendo;

/**
 * A shortcut function to display a prompt dialog
 * @param options (Same as kendo.ui.Dialog, expect `title` and `content` should be replaced by `type` and `message`)
 * @returns {*}
 */
export default function openPrompt(options = {}) {
    const PROMPT_TEMPLATE = `<div><div class="k-widget k-notification k-notification-#: type #"><div class="k-notification-wrap"><span class="k-icon k-i-#: type #"></span>#: message #</div></div><div><input type="text" class="k-textbox" style="width:100%; margin-top: 1em;" data-${ns}bind="value: input"></div></div>`;

    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement('kj-dialog-prompt');

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title:
                        BaseDialog.fn.options.messages.title[
                            options.type || 'info'
                        ],
                    content: template(PROMPT_TEMPLATE)({
                        type: options.type || 'info',
                        message: options.message || ''
                    }),
                    data: {
                        input: ''
                    },
                    actions: [
                        BaseDialog.fn.options.messages.actions.ok,
                        BaseDialog.fn.options.messages.actions.cancel
                    ]
                },
                options
            )
        )
        .data('kendoBaseDialog');

    // Bind the click event
    dialog.bind(CONSTANTS.CLICK, e => {
        dfd.resolve({
            action: e.action,
            data: e.sender.viewModel.toJSON()
        });
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
window.kidoju.dialogs.openPrompt = openPrompt;
