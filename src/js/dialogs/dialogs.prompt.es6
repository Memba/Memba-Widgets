/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import './widgets.basedialog.es6';

const {
    ns,
    template,
    ui: { BaseDialog },
} = window.kendo;

const TEMPLATE = `<div><div class="k-widget k-notification k-notification-#: type #"><div class="k-notification-wrap"><span class="k-icon k-i-#: type #"></span>#: message #</div></div><div><input type="text" class="k-textbox" style="width:100%; margin-top: 1em;" data-${ns}bind="value: input"></div></div>`;

/**
 * A shortcut function to display a prompt dialog
 * @param options (Same as kendo.ui.Dialog, expect `title` and `content` should be replaced by `type` and `message`)
 * @returns {*}
 */
function openPrompt(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement('m-dialog-prompt');

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog({
            title: BaseDialog.fn.options.messages.title[options.type || 'info'],
            content: template(TEMPLATE)({
                type: options.type || 'info',
                message: options.message || '',
            }),
            data: {
                input: '',
            },
            actions: [
                BaseDialog.fn.options.messages.actions.ok,
                BaseDialog.fn.options.messages.actions.cancel,
            ],
            ...options,
        })
        .data('kendoBaseDialog');

    // Bind the click event
    dialog.bind(CONSTANTS.CLICK, (e) => {
        dfd.resolve({
            action: e.action,
            data: e.sender.viewModel.toJSON(),
        });
    });

    // Show the dialog
    dialog.open();

    return dfd.promise();
}

/**
 * Default export
 */
export default openPrompt;
