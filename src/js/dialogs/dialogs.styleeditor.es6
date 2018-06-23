/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import './widgets.basedialog.es6';
import '../kidoju.widgets.styleeditor';
import CONSTANTS from '../common/window.constants.es6';

const {
    ns,
    resize,
    ui: { BaseDialog }
} = window.kendo;

/**
 * A shortcut function to display a dialog with a kendo.ui.StyleEditor
 * @param options
 * @returns {*}
 */
export default function openStyleEditor(options = {}) {
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
                    content: `<div data-${ns}role="styleeditor" data-${ns}bind="value:value" data-${ns}height="400"></div>`,
                    data: {
                        value: ''
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
    dialog.one('show', e => {
        resize(e.sender.element);
        // Workaround for issue described at
        // https://github.com/telerik/kendo-ui-core/issues/1990 and
        // https://github.com/telerik/kendo-ui-core/issues/2156
        // e.sender.element.find(roleSelector('styleeditor)).data('kendoStyleEditor').refresh();
    });

    // Bind the click event
    dialog.bind(CONSTANTS.CLICK, e => {
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
window.kidoju.dialogs.openStyleEditor = openStyleEditor;