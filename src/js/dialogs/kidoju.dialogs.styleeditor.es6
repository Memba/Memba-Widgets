import $ from 'jquery';
import 'kendo.core';
import './kidoju.widgets.basedialog.es6';
import CONSTANTS from '../window.constants.es6';

const {
    resize,
    ui: { BaseDialog }
} = window.kendo;
const WIDGET_CLASS = 'kj-dialog';

/**
 * A shortcut function to display a dialog with a kendo.ui.AssetManager
 * @param options
 * @returns {*}
 */
export default function openStyleEditor(options) {
    const dfd = $.Deferred();
    import('../kidoju.widgets.styleeditor') // TODO CSS?
        .then(() => {
            const opts = options || {};
            const cssClass = opts.cssClass || 'kj-dialog-tools';
            let box;
            // If a dialog already exists, remove it
            let element = $(`.${WIDGET_CLASS}.${cssClass}`);
            if (element.length > 0) {
                box = element.data('kendoBaseDialog');
                if (box instanceof BaseDialog) {
                    box.destroy();
                }
                // element.empty(); We replace the content anyway
            } else {
                // Add a div to the html document for the alert dialog
                // cssClass ensures we do not mess with other dialogs
                element = $(`<div class="${cssClass}"></div>`).appendTo(
                    document.body
                );
            }
            element.css({ padding: 0 });

            // Create the dialog
            box = element
                .kendoBaseDialog(
                    $.extend({}, opts, {
                        title:
                            opts.title ||
                            BaseDialog.fn.options.messages[opts.type || 'info'],
                        content:
                            '<div data-role="styleeditor" data-bind="value: style"></div>',
                        actions: opts.actions || [
                            {
                                action: 'ok',
                                text: BaseDialog.fn.options.messages.action.ok,
                                imageUrl:
                                    'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg'
                            },
                            {
                                action: 'cancel',
                                text:
                                    BaseDialog.fn.options.messages.action
                                        .cancel,
                                imageUrl:
                                    'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg'
                            }
                        ]
                    })
                )
                .data('kendoBaseDialog');

            // Bind the show event to resize once opened
            box.bind('show', e => {
                resize(e.sender.element);
            });

            // Bind the click event
            box.bind(CONSTANTS.CLICK, e => {
                dfd.resolve({
                    action: e.action,
                    data: e.sender.viewModel.toJSON()
                });
            });

            // Display the message box
            box.open();
        })
        .catch(ex => {
            dfd.reject(ex);
        });
    return dfd.promise();
}

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.dialogs = window.kidoju.dialogs || {};
window.kidoju.dialogs.openStyleEditor = openStyleEditor;
