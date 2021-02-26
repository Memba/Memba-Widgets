/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
// import 'kendo.imageeditor';
import __ from '../app/app.i18n.es6';
import CONSTANTS from '../common/window.constants.es6';
import './widgets.basedialog.es6';

const {
    ns,
    resize,
    roleSelector,
    ui: { BaseDialog },
} = window.kendo;

/**
 * A shortcut function to display a dialog with a kendo.ui.ImageEditor
 * @param options
 * @returns {*}
 */
function openImageEditor(options = {}) {
    const dfd = $.Deferred();

    // import(/* webpackChunkName: "kendo.imageeditor" */ 'kendo.imageeditor')
    import('kendo.imageeditor')
        .then(() => {
            // Find or create the DOM element
            const $dialog = BaseDialog.getElement(options.cssClass);
            $dialog.css({ padding: 0 });

            // Create the dialog
            const dialog = $dialog
                .kendoBaseDialog({
                    title: __('dialogs.imageeditor.title'),
                    content: `<div data-${ns}role="imageeditor" style="width:100%; border:0;"></div>`,
                    data: {},
                    actions: [
                        BaseDialog.fn.options.messages.actions.ok,
                        BaseDialog.fn.options.messages.actions.cancel,
                    ],
                    width: 860,
                    ...options,
                })
                .data('kendoBaseDialog');

            // Rebind the initOpen event considering the kendo.ui.Spreadsheet widget cannot bind to a viewModel
            dialog.unbind(CONSTANTS.INITOPEN);
            dialog.one(CONSTANTS.INITOPEN, (e) => {
                e.sender.element
                    .find(roleSelector('imageeditor'))
                    .kendoImageEditor({
                        imageUrl: '',
                        execute: (evt) => {
                            if (evt.command !== 'ZoomImageEditorCommand') {
                                window.alert(evt.command);
                            }
                        },
                        ...e.sender.options.data,
                    });
            });

            // Bind the show event to resize once opened
            dialog.one(CONSTANTS.SHOW, (e) => {
                resize(e.sender.element);
                // resize height
                e.sender.element
                    .find(roleSelector('imageeditor'))
                    .height('auto');
            });

            // Bind the click event
            dialog.bind(CONSTANTS.CLICK, (e) => {
                const imageEditor = e.sender.element
                    .find(roleSelector('imageeditor'))
                    .data('kendoImageEditor');
                dfd.resolve({
                    action: e.action,
                    data: { imageUrl: imageEditor.options.imageUrl },
                });
            });

            // Display the message dialog
            dialog.open();
        })
        .catch(dfd.reject);

    return dfd.promise();
}

/**
 * Default export
 */
export default openImageEditor;
