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
import optimizeEditor from '../tools/util.editors.es6';

const {
    bind,
    resize,
    template,
    ui: { BaseDialog }
} = window.kendo;

const NOTIFICATION =
    '<div class="k-widget k-notification k-notification-info"><div class="k-notification-wrap"><span class="k-icon k-i-info"></span>#: help #</div></div>';
const CONTENT =
    '<div class="kj-dialog-form"><div class="kj-dialog-row"></div></div>';

/**
 * A shortcut function to display a dialog with a property editor
 * @param options
 * @returns {*}
 */
function openPropertyDialog(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: '' });

    // Optimize editor
    $.extend(options.row, { editable: true });
    optimizeEditor(options.row);

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title:
                        BaseDialog.fn.options.messages[options.type || 'info'],
                    content: options.row.help
                        ? template(NOTIFICATION)(options.row) + CONTENT
                        : CONTENT,
                    data: options.model.toJSON(),
                    actions: [
                        BaseDialog.fn.options.messages.actions.ok,
                        BaseDialog.fn.options.messages.actions.cancel
                    ],
                    width: 500
                },
                options
            )
        )
        .data('kendoBaseDialog');

    dialog.unbind(CONSTANTS.INITOPEN);
    dialog.one(CONSTANTS.INITOPEN, e => {
        // Add editor
        const { row } = options;
        row.model = e.sender.viewModel;
        const container = e.sender.element.find('.kj-dialog-row');
        row.editor(container, row);
        // Bind viewModel
        bind(container, e.sender.viewModel);
    });

    // Bind the show event to resize once opened
    dialog.one(CONSTANTS.SHOW, e => {
        resize(e.sender.element);
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
 * Default export
 */
export default openPropertyDialog;
