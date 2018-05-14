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

    // Ids
    const questionId = guid();
    const solutionId = guid();

    // Localized message field names  // TODO i18n
    const message =
        'Please enter a question and a solution to compare answers with.';
    const questionName = 'Question';
    const solutionName = 'Solution';

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title:
                        BaseDialog.fn.options.messages[options.type || 'info'],
                    content: `<div class="k-widget k-notification k-notification-info">
                            <div class="k-notification-wrap"><span class="k-icon k-i-info"></span>${message}</div>
                          </div>
                          <div class="kj-dialog-form">
                            <div class="kj-dialog-flexrow">
                              <div class="kj-dialog-col25"><label for="${questionId}">${questionName}:</label></div>
                              <div class="kj-dialog-col75"><input id="${questionId}" type="text" name="${questionName}" class="k-input k-textbox" data-${ns}bind="value: question" required pattern="\\S+"></div>
                            </div>
                            <div class="kj-dialog-flexrow">
                              <div class="kj-dialog-col25"><label for="${solutionId}">${solutionName}:</label></div>
                              <div class="kj-dialog-col75"><input id="${solutionId}" type="text" name="${solutionName}" class="k-input k-textbox" data-${ns}bind="value: solution" required pattern="\\S+"></div>
                            </div>
                          </div>`,
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
