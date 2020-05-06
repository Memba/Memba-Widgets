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
    template,
    ui: { BaseDialog },
} = window.kendo;

const TEMPLATE =
    '<div class="k-widget k-notification k-notification-#: type #"><div class="k-notification-wrap"><span class="k-icon k-i-#: type #"></span>#: message #</div></div>';

/**
 * A shortcut function to display an alert dialog
 * @param options (Same as kendo.ui.Dialog, expect `title` and `content` should be replaced by `type` and `message`)
 * @returns {*}
 */
function openAlert(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement('kj-dialog-alert');

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog({
            title: BaseDialog.fn.options.messages.title[options.type || 'info'],
            content: template(TEMPLATE)({
                type: options.type || 'info',
                message: options.message || '',
            }),
            actions: [
                BaseDialog.fn.options.messages.actions.ok,
                BaseDialog.fn.options.messages.actions.cancel,
            ],
            ...options,
        })
        .data('kendoBaseDialog');

    // Bind the click event
    dialog.bind(CONSTANTS.CLICK, (e) => {
        dfd.resolve({ action: e.action });
    });

    // Show the dialog
    dialog.open();

    return dfd.promise();
}

/**
 * An alert with single Close button (forced)
 * @param options
 */
function openCloseAlert(options = {}) {
    return openAlert(
        Object.assign(options, {
            actions: [BaseDialog.fn.options.messages.actions.close],
        })
    );
}

/**
 * An alert with OK/Cancel buttons (forced)
 * @param options
 */
function openOKCancelAlert(options = {}) {
    return openAlert(
        Object.assign(options, {
            actions: [
                BaseDialog.fn.options.messages.actions.ok,
                BaseDialog.fn.options.messages.actions.cancel,
            ],
        })
    );
}

/**
 * An alert with yes/no buttons
 * @param options
 */
function openYesNoAlert(options = {}) {
    return openAlert(
        Object.assign(options, {
            actions: [
                BaseDialog.fn.options.messages.actions.yes,
                BaseDialog.fn.options.messages.actions.no,
            ],
        })
    );
}

/**
 * Export
 */
export { openAlert, openCloseAlert, openOKCancelAlert, openYesNoAlert };
