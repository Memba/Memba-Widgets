/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.validator';
import __ from '../app/app.i18n.es6';
import CONSTANTS from '../common/window.constants.es6';
import './widgets.basedialog.es6';

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
function openTextBoxWizard(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: '' });

    // Unique ids
    const ids = { question: guid(), solution: guid() };

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title: __('dialogs.textboxwizard.title'),
                    /* eslint-disable prettier/prettier */
                    content: `<div class="k-widget k-notification k-notification-info" role="alert">
                            <div class="k-notification-wrap"><span class="k-icon k-i-info"></span>${__('dialogs.textboxwizard.message')}</div>
                          </div>
                          <div class="kj-dialog-form">
                            <div class="kj-dialog-flexrow">
                              <div class="kj-dialog-col25"><label for="${ids.question}">${__('dialogs.textboxwizard.question')}:</label></div>
                              <div class="kj-dialog-col75"><input id="${ids.question}" type="text" name="question" class="k-input k-textbox" data-${ns}bind="value: question"></div>
                            </div>
                            <div class="kj-dialog-flexrow">
                              <div class="kj-dialog-col25"><label for="${ids.solution}">${__('dialogs.textboxwizard.solution')}:</label></div>
                              <div class="kj-dialog-col75"><textarea id="${ids.solution}" type="text" name="solution" class="k-input k-textbox" data-${ns}bind="value: solution" style="height:5em;"></textarea></div>
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
        .kendoValidator({
            rules: {
                question(input) {
                    if (input.is('[name="question"]')) {
                        return input.val().trim().length > 0;
                    }
                    return true;
                },
                solution(input) {
                    if (input.is('[name="solution"]')) {
                        return input.val().trim().length > 0;
                    }
                    return true;
                }
            },
            messages: {
                question: __('dialogs.textboxwizard.validation.question'),
                solution: __('dialogs.textboxwizard.validation.solution')
            }
        })
        .data('kendoValidator');

    // Bind the show event to resize once opened
    dialog.one(CONSTANTS.SHOW, e => {
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
 * Default export
 */
export default openTextBoxWizard;
