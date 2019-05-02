/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import './widgets.basedialog.es6';
import CONSTANTS from '../common/window.constants.es6';
import '../widgets/widgets.codeeditor.es6';

const {
    htmlEncode,
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
function openCodeEditor(options = {}) {
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
                    content: `<div data-${ns}role="codeeditor" data-${ns}bind="value:value,source:library" data-${ns}default="${htmlEncode(
                        options.default
                    )}" data-${ns}solution="${htmlEncode(
                        JSON.stringify(options.solution)
                    )}"></div>`,
                    data: {
                        value: '',
                        library: [] // Do we really need this?
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

    // Bind the show event to resize once opened
    dialog.one(CONSTANTS.SHOW, e => {
        resize(e.sender.element);
        const codeEditor = e.sender.element
            .find(roleSelector('codeeditor'))
            .data('kendoCodeEditor');
        // IMPORTANT, we need to refresh CodeMirror here otherwise the open animation messes with CodeMirror calculations
        // and gutter and line numbers are not displayed properly
        codeEditor.codeMirror.refresh();
    });

    // Bind the click event
    dialog.bind(CONSTANTS.CLICK, e => {
        dfd.resolve({
            action: e.action,
            // data: e.sender.viewModel.toJSON() <-- we do not need to return the library
            data: {
                value: e.sender.viewModel.get('value')
            }
        });
    });

    // Display the message dialog
    dialog.open();

    return dfd.promise();
}

/**
 * Default export
 */
export default openCodeEditor;
