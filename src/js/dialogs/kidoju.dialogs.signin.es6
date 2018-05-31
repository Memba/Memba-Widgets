/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions
import $ from 'jquery';
import 'kendo.core';
import 'kendo.validator';
import './kidoju.widgets.basedialog.es6';
import CONSTANTS from '../common/window.constants.es6';

const {
    // guid,
    // ns,
    resize,
    ui: { BaseDialog }
} = window.kendo;

/**
 * A shortcut function to display a dialog with autentication providers
 * @param options
 * @returns {*}
 */
export default function openSignIn(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);

    const message = 'Oops';

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title:
                        BaseDialog.fn.options.messages[options.type || 'info'],
                    content: `<div class="k-widget k-notification k-notification-info">
                            <div class="k-notification-wrap"><span class="k-icon k-i-info"></span>${message}</div>
                          </div>`,
                    data: {
                        // TODO
                    }
                    // actions: []
                },
                options
            )
        )
        .data('kendoBaseDialog');

    const validator = $dialog
        .find('.kj-dialog-form')
        .kendoValidator()
        .data('kendoValidator');

    // Bind the show event to resize once opened
    dialog.one('show', e => {
        resize(e.sender.element);
    });

    // Bind the click event
    dialog.bind(CONSTANTS.CLICK, e => {
        if (
            e.action === BaseDialog.fn.options.messages.actions.cancel.action ||
            validator.validate()
        ) {
            dfd.resolve({
                action: e.action,
                data: e.sender.viewModel.toJSON()
            });
        } else {
            e.preventDefault();
        }
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
window.kidoju.dialogs.openSignIn = openSignIn;
