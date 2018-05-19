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
import CONSTANTS from '../window.constants.es6';

const {
    guid,
    ns,
    resize,
    ui: { BaseDialog }
} = window.kendo;

/**
 * A shortcut function to display a dialog with a textbox wizard
 * @param options
 * @returns {*}
 */
export default function openTextBoxWizard(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: '' });

    // Unique ids and i18n
    const ids = { question: guid(), solution: guid() };
    const i18n =
        (((window.kidoju || {}).dialogs || {}).messages || {}).textboxwizard ||
        {};

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title:
                        BaseDialog.fn.options.messages[options.type || 'info'],
                    /* eslint-disable prettier/prettier */
                    content: `<div class="k-widget k-notification k-notification-info">
                            <div class="k-notification-wrap"><span class="k-icon k-i-info"></span>${i18n.message}</div>
                          </div>
                          <div class="kj-dialog-form">
                            <div class="kj-dialog-flexrow">
                              <div class="kj-dialog-col25"><label for="${ids.question}">${i18n.question}:</label></div>
                              <div class="kj-dialog-col75"><input id="${ids.question}" type="text" name="${i18n.question}" class="k-input k-textbox" data-${ns}bind="value: question" required pattern="\\S+"></div>
                            </div>
                            <div class="kj-dialog-flexrow">
                              <div class="kj-dialog-col25"><label for="${ids.solution}">${i18n.solution}:</label></div>
                              <div class="kj-dialog-col75"><input id="${ids.solution}" type="text" name="${i18n.solution}" class="k-input k-textbox" data-${ns}bind="value: solution" required pattern="\\S+"></div>
                            </div>
                          </div>`,
                    /* eslint-enable prettier/prettier */
                    data: {
                        question: '',
                        solution: ''
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
    dialog.one(CONSTANTS.CLICK, e => {
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
window.kidoju.dialogs.openTextBoxWizard = openTextBoxWizard;
