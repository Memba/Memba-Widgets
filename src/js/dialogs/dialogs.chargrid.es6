/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import __ from '../app/app.i18n.es6';
import CONSTANTS from '../common/window.constants.es6';
import '../widgets/widgets.chargrid.es6';
import './widgets.basedialog.es6';

const {
    bind,
    ns,
    resize,
    roleSelector,
    ui: { BaseDialog },
} = window.kendo;

/**
 * A shortcut function to display a dialog with a kendo.ui.CodeEditor
 * @param options
 * @returns {*}
 */
function openCharGrid(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: '' });

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog({
            title: __('dialogs.chargrid.title'),
            content: `<div style="display:flex;flex-direction:row"><div data-${ns}role="chargrid" data-${ns}bind="value:value" style="flex-shrink:0"></div><div class="kj-chargrid-message" style="margin-left:1em;">${options.message}</div></div>`,
            data: {
                value: [],
            },
            actions: [
                BaseDialog.fn.options.messages.actions.ok,
                BaseDialog.fn.options.messages.actions.cancel,
            ],
            width: 860,
            ...options,
        })
        .data('kendoBaseDialog');

    dialog.unbind(CONSTANTS.INITOPEN);
    dialog.one(CONSTANTS.INITOPEN, (e) => {
        const width = 550;
        // Initialize chargrid
        e.sender.element
            .find(roleSelector('chargrid'))
            .height(
                (width * e.sender.options.charGrid.height) /
                    e.sender.options.charGrid.width
            )
            .width(width)
            .kendoCharGrid(options.charGrid);
        // Bind viewModel
        bind(e.sender.element.children(), e.sender.viewModel);
    });

    // Bind the show event to resize once opened
    dialog.one(CONSTANTS.SHOW, (e) => {
        resize(e.sender.element);
    });

    // Bind the click event
    dialog.bind(CONSTANTS.CLICK, (e) => {
        dfd.resolve({
            action: e.action,
            data: e.sender.viewModel.toJSON(),
        });
    });

    // Display the message dialog
    dialog.open();

    return dfd.promise();
}

/**
 * Default export
 */
export default openCharGrid;
