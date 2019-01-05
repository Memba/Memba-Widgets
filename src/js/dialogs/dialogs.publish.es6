/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.validator';
import './widgets.basedialog.es6';
import CONSTANTS from '../common/window.constants.es6';

const {
    // guid,
    // ns,
    resize,
    ui: { BaseDialog }
} = window.kendo;

/**
 * Initialize culture
 */
BaseDialog.getMessageNameSpace().publish = BaseDialog.getMessageNameSpace()
    .publish || {
    message: ''
};

/**
 * A shortcut function to display a dialog with a textbox wizard
 * @param options
 * @returns {*}
 */
export default function openPublish(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);

    // Unique ids and culture
    // const ids = { question: guid(), solution: guid() };
    const culture = BaseDialog.getMessageNameSpace().publish;

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title:
                        BaseDialog.fn.options.messages[options.type || 'info'],
                    /* eslint-disable prettier/prettier */
                    content: `<div class="k-widget k-notification k-notification-info" role="alert">
                            <div class="k-notification-wrap"><span class="k-icon k-i-info"></span>${culture.message}</div>
                          </div>
                          <div class="kj-dialog-form">
                            <div class="kj-dialog-flexrow">
                            </div>
                            <div class="kj-dialog-flexrow">
                            </div>
                          </div>`,
                    /* eslint-enable prettier/prettier */
                    data: {
                        // TODO
                    },
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
