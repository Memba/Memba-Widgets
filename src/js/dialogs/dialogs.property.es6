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

const {
    bind,
    resize,
    ui: { BaseDialog }
} = window.kendo;

/**
 * Initialize culture
 */
// BaseDialog.getMessageNameSpace().chargrid = BaseDialog.getMessageNameSpace().chargrid || {};

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

    debugger;

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title:
                        BaseDialog.fn.options.messages[options.type || 'info'],
                    content: `<${CONSTANTS.DIV}/>`,
                    data: {
                        value: []
                    },
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
        // Bind viewModel
        bind(e.sender.element.children(), e.sender.viewModel);
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
