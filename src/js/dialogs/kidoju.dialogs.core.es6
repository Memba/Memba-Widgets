/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import 'kendo.dialog';
import CONSTANTS from '../window.constants.es6';
import assert from '../window.assert.es6';
import {BaseDataSource, BaseModel} from '../data/kidoju.data.core';
// var logger = new window.Logger('kidoju.dialogs');
const logger = { debug: $.noop }; // TODO

const { bind, format, ns, observable, roleSelector } = window.kendo;
const { Dialog } = window.kendo.ui;
const TABSTRIP_HEADER_CLASS = 'k-tabstrip k-header';
const NO_PADDING_CLASS = 'kj-no-padding';
// var BUTTON_TEMPLATE = '<img alt="{0}" src="{1}" class="k-image">{0}';
const DIALOG_SELECTOR = 'kj-tools-dialog';

const { kidoju } = window;



// TODO Progressively migrate all tools dialogs:
// - Asset Manager
// - Style Editor
// - Table Editor
// - Chart Editor

// TODO: Add dialogs to context menu for some properties that have a BaseAdapter
// Note: for images this would only be Text and Src
// Note for labels, this would only be Text
// Relate to validations

// Add helpful dialogs:
// - Import pages from another Kidoju
// - Spreadsheet wizard
// - Multiple Choice Question
// - Simple Answer

/**
 * Dialog
 *
 * A dialog needs
 * - Some HTML,
 * - Buttons
 * - Init data (or a viewModel)
 * - Possibly an init method when kendo.bind is insufficient (see kendo.data.spreadsheet)
 * - An action callback
 *
 * Note:
 * - This always uses the same selector by default
 */


/**
 * Get a reusable dialog
 * @param cssClass (allows for several dialog tags, especially for nested dialogs)
 * @param options, dialog options especially width
 * @param callback
 * @returns {jQuery}
 */
export function getDialog(cssClass, options, callback) {
    if ($.type(cssClass) !== CONSTANTS.STRING) {
        callback = options;
        options = cssClass;
        cssClass = '';
    }
    if (!$.isPlainObject(options)) {
        callback = options;
        options = {};
    }
    assert.isFunction(
        callback,
        assert.format(assert.messages.isFunction.default, 'callback')
    );
    let dialogWidget = $(DIALOG_SELECTOR + CONSTANTS.DOT + cssClass).data('kendoDialog');
    // Find or create dialog
    if (!(dialogWidget instanceof Dialog)) {
        // var culture = app.i18n.culture.dialogs;
        // var icons = app.uris.cdn.icons;
        // Create dialog
        dialogWidget = $(`<div class="${DIALOG_SELECTOR.substr(1)} ${cssClass}"></div>`)
            .appendTo(document.body)
            .kendoDialog(
                $.extend(
                    {
                        actions: [
                            {
                                // text: format(BUTTON_TEMPLATE, culture.buttons.ok.text, format(icons, culture.buttons.ok.icon)),
                                text: kidoju.Tool.fn.i18n.dialogs.ok.text,
                                primary: true,
                                action(e) {
                                    assert.isPlainObject(
                                        e,
                                        assert.format(
                                            assert.messages.isPlainObject
                                                .default,
                                            'e'
                                        )
                                    );
                                    assert.instanceof(
                                        Dialog,
                                        e.sender,
                                        assert.format(
                                            assert.messages.instanceof
                                                .default,
                                            'e.sender',
                                            'kendo.ui.Dialog'
                                        )
                                    );
                                    assert.isFunction(
                                        e.sender._onOKAction,
                                        assert.format(
                                            assert.messages.isFunction
                                                .default,
                                            'e.sender._onOKAction'
                                        )
                                    );
                                    // (e && e.sender && e.sender._onOKAction || $.noop).bind(e.sender)(e);
                                    e.sender._onOKAction(e);
                                }
                            },
                            {
                                // text: format(BUTTON_TEMPLATE, culture.buttons.cancel.text, format(icons, culture.buttons.cancel.icon))
                                text:
                                kidoju.Tool.fn.i18n.dialogs.cancel.text
                            }
                        ],
                        buttonLayout: 'normal',
                        modal: true,
                        // title: culture.iconEditor.title, <-- use options.title
                        visible: false,
                        width: 860,
                        close() {
                            dialogWidget.element.removeClass(
                                TABSTRIP_HEADER_CLASS
                            );
                            dialogWidget.element.removeClass(
                                NO_PADDING_CLASS
                            );
                            // The content method destroys widgets and unbinds data
                            dialogWidget.content('');
                            // Remove the viewModel
                            dialogWidget.viewModel = undefined;
                            // Remove the click handler
                            dialogWidget._onOKAction = undefined;
                        }
                    },
                    options
                )
            )
            .data('kendoDialog');

        // Hides the display of "Fermer" after the "X" icon in the window title bar
        // dialogWidget.wrapper.find('.k-window-titlebar > .k-dialog-close > .k-font-icon.k-i-x').text('');
    }
    assert.instanceof(
        Dialog,
        dialogWidget,
        assert.format(
            assert.messages.instanceof.default,
            'dialogWidget',
            'kendo.ui.Dialog'
        )
    );
    return dialogWidget;
}

/**
 * Get a reusable dialog with OK and Cancel buttons
 * @param selector (allows for several dialog tags, especially for nested dialogs)
 * @param options, dialog options especially width
 * @param callback
 * @returns {jQuery}
 */
export function getOKCancelDialog(selector, options, callback) {
    if ($.type(selector) !== CONSTANTS.STRING) {
        callback = options;
        options = selector;
        selector = '';
    }
    if (!$.isPlainObject(options)) {
        callback = options;
        options = {};
    }
    assert.isFunction(
        callback,
        assert.format(assert.messages.isFunction.default, 'callback')
    );
    let dialogWidget = $(DIALOG_SELECTOR + selector).data('kendoDialog');
    // Find or create dialog frame
    if (!(dialogWidget instanceof Dialog)) {
        // var culture = app.i18n.culture.dialogs;
        // var icons = app.uris.cdn.icons;
        // Create dialog
        dialogWidget = $(
            format(
                DIALOG_DIV,
                `${DIALOG_SELECTOR.substr(1)} ${selector.substr(1)}`
            )
        )
            .appendTo(document.body)
            .kendoDialog(
                $.extend(
                    {
                        actions: [
                            {
                                // text: format(BUTTON_TEMPLATE, culture.buttons.ok.text, format(icons, culture.buttons.ok.icon)),
                                text: kidoju.Tool.fn.i18n.dialogs.ok.text,
                                primary: true,
                                action(e) {
                                    assert.isPlainObject(
                                        e,
                                        assert.format(
                                            assert.messages.isPlainObject
                                                .default,
                                            'e'
                                        )
                                    );
                                    assert.instanceof(
                                        Dialog,
                                        e.sender,
                                        assert.format(
                                            assert.messages.instanceof
                                                .default,
                                            'e.sender',
                                            'kendo.ui.Dialog'
                                        )
                                    );
                                    assert.isFunction(
                                        e.sender._onOKAction,
                                        assert.format(
                                            assert.messages.isFunction
                                                .default,
                                            'e.sender._onOKAction'
                                        )
                                    );
                                    // (e && e.sender && e.sender._onOKAction || $.noop).bind(e.sender)(e);
                                    e.sender._onOKAction(e);
                                }
                            },
                            {
                                // text: format(BUTTON_TEMPLATE, culture.buttons.cancel.text, format(icons, culture.buttons.cancel.icon))
                                text:
                                    kidoju.Tool.fn.i18n.dialogs.cancel.text
                            }
                        ],
                        buttonLayout: 'normal',
                        modal: true,
                        // title: culture.iconEditor.title, <-- use options.title
                        visible: false,
                        width: 860,
                        close() {
                            dialogWidget.element.removeClass(
                                TABSTRIP_HEADER_CLASS
                            );
                            dialogWidget.element.removeClass(
                                NO_PADDING_CLASS
                            );
                            // The content method destroys widgets and unbinds data
                            dialogWidget.content('');
                            // Remove the viewModel
                            dialogWidget.viewModel = undefined;
                            // Remove the click handler
                            dialogWidget._onOKAction = undefined;
                        }
                    },
                    options
                )
            )
            .data('kendoDialog');

        // Hides the display of "Fermer" after the "X" icon in the window title bar
        // dialogWidget.wrapper.find('.k-window-titlebar > .k-dialog-close > .k-font-icon.k-i-x').text('');
    }
    assert.instanceof(
        Dialog,
        dialogWidget,
        assert.format(
            assert.messages.instanceof.default,
            'dialogWidget',
            'kendo.ui.Dialog'
        )
    );
    return dialogWidget;
}

/**
 * Show the updateasset manager
 * @param assets
 * @param value, url passed to viewModel
 * @param options, dialog options
 * @param onOKAction
 */
export function showAssetManager(assets, value, options, onOKAction) {
    assert.instanceof(
        kidoju.ToolAssets,
        assets,
        assert.format(
            assert.messages.instanceof.default,
            'assets',
            'kidoju.ToolAssets'
        )
    );
    assert.type(
        CONSTANTS.STRING,
        value,
        assert.format(
            assert.messages.type.default,
            'value',
            CONSTANTS.STRING
        )
    );
    assert.isPlainObject(
        options,
        assert.format(assert.messages.isPlainObject.default, 'options')
    );
    assert.isFunction(
        onOKAction,
        assert.format(assert.messages.isFunction.default, 'onOKAction')
    );
    const dialogWidget = kidoju.dialogs.getOKCancelDialog(
        /* selector, */ options,
        onOKAction
    );
    assert.instanceof(
        Dialog,
        dialogWidget,
        assert.format(
            assert.messages.instanceof.default,
            'dialogWidget',
            'kendo.ui.Dialog'
        )
    );
    // Create viewModel (Cancel shall not save changes to main model)
    dialogWidget.viewModel = observable({
        url: value
    });
    // Update the widget onOKAction method
    dialogWidget._onOKAction = kidoju.dialogs.wrapWithUploader(
        assets,
        onOKAction
    );
    // Prepare UI
    dialogWidget.element.addClass(TABSTRIP_HEADER_CLASS);
    dialogWidget.element.addClass(NO_PADDING_CLASS);
    dialogWidget.title(options.title);
    dialogWidget.content(
        `<div data-${ns}role="assetmanager" data-${ns}bind="value: url"></div>`
    );
    // var assetManagerWidget = dialogWidget.element.find(roleSelector('assetmanager')).kendoAssetManager(assets).data('kendoAssetManager');
    dialogWidget.element
        .find(roleSelector('assetmanager'))
        .kendoAssetManager(assets)
        .data('kendoAssetManager');
    // Bind viewModel
    bind(dialogWidget.element, dialogWidget.viewModel);
    // Log
    logger.debug({
        method: 'showAssetManager',
        message: 'Opening asset manager'
    });
    // Show a centered dialog
    // assetManagerWidget.tabStrip.activateTab(0);
    dialogWidget.open();
},

/**
 * Wrap with file uploader
 * TODO: I think this is for Google searches
 * @param assets
 * @param onOKAction
 */
export function wrapWithUploader(assets, onOKAction) {
    assert.instanceof(
        kidoju.ToolAssets,
        assets,
        assert.format(
            assert.messages.instanceof.default,
            'assets',
            'kidoju.ToolAssets'
        )
    );
    assert.isFunction(
        onOKAction,
        assert.format(assert.messages.isFunction.default, 'onOKAction')
    );
    // Return a new event handler wrapping onOKAction
    return function(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        assert.instanceof(
            Dialog,
            e.sender,
            assert.format(
                assert.messages.instanceof.default,
                'e.sender',
                'kendo.ui.Dialog'
            )
        );
        const url = e.sender.viewModel.get('url');
        let hasScheme = false;
        for (const scheme in assets.schemes) {
            if (
                assets.schemes.hasOwnProperty(scheme) &&
                url.startsWith(`${scheme}://`)
            ) {
                hasScheme = true;
                break;
            }
        }
        if (hasScheme) {
            // Select an asset which is already in our store
            onOKAction.bind(e.sender)(e);
        } else if (
            CONSTANTS.RX_URL.test(url) &&
            Array.isArray(assets.collections) &&
            assets.collections[0] &&
            assets.collections[0].transport &&
            $.isFunction(assets.collections[0].transport.import)
        ) {
            // Import the asset before selecting it
            assets.collections[0].transport.import({
                data: {
                    url
                },
                success(response) {
                    assert.isPlainObject(
                        e,
                        assert.format(
                            assert.messages.isPlainObject.default,
                            'e'
                        )
                    );
                    assert.instanceof(
                        Dialog,
                        e.sender,
                        assert.format(
                            assert.messages.instanceof.default,
                            'e.sender',
                            'kendo.ui.Dialog'
                        )
                    );
                    assert.isUndefined(
                        e.sender.viewModel,
                        assert.format(
                            assert.messages.isUndefined.default,
                            'e.sender.viewModel'
                        )
                    );
                    // At this stage, the dialog is closed and e.sender.viewModel has been reset to undefined.
                    // e.sender.viewModel.set('url', response.data[0].url); won't work
                    // We need to restore the viewModel and let onOKAction reset it once again to undefined
                    e.sender.viewModel = observable({
                        url: response.data[0].url
                    });
                    onOKAction.bind(e.sender)(e);
                    // Make sure it is reset to undefined after executing onOKAction
                    assert.isUndefined(
                        e.sender.viewModel,
                        assert.format(
                            assert.messages.isUndefined.default,
                            'e.sender.viewModel'
                        )
                    );
                },
                error: $.noop // assets.collections[0].transport.import
            });
        }
    };
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.dialogs = {
    getOKCancelDialog,
    showAssetManager,
    wrapWithUploader
};


