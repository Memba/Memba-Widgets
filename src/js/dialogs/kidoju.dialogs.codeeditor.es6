import $ from 'jquery';
import 'kendo.core';
import './kidoju.widgets.basedialog.es6';
import '../kidoju.widgets.codeeditor'; // TODO CSS
import CONSTANTS from '../window.constants.es6';

const {
    ns,
    resize,
    roleSelector,
    ui: { BaseDialog }
} = window.kendo;

/**
 * A shortcut function to display a dialog with a kendo.ui.CodeEditor
 * @param options
 * @returns {*}
 */
export default function openCodeEditor(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: 0 });

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title:
                        BaseDialog.fn.options.messages[options.type || 'info'],
                    content: `<div data-${ns}role="codeeditor" data-${ns}bind="value: code, source: library"></div>`,
                    data: { code: '' }, // TODO: solution??
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

    // Bind the show event to resize once opened
    dialog.one('show', e => {
        resize(e.sender.element);
        // IMPORTANT, we need to refresh CodeMirror here otherwise the open animation messes with CodeMirror calculations
        // and gutter and line numbers are not displayed properly
        const codeEditor = e.sender.element
            .find(roleSelector('codeeditor'))
            .data('kendoCodeEditor');
        codeEditor.codeMirror.refresh();
    });

    // Bind the click event
    dialog.one(CONSTANTS.CLICK, e => {
        dfd.resolve({
            action: e.action,
            data: e.sender.viewModel.toJSON()
        });
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
window.kidoju.dialogs.openCodeEditor = openCodeEditor;
