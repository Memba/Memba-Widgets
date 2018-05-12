import $ from 'jquery';
import 'kendo.core';
import './kidoju.widgets.basedialog.es6';
import CONSTANTS from '../window.constants.es6';

const {
    bind,
    ns,
    resize,
    roleSelector,
    ui: { BaseDialog }
} = window.kendo;

/**
 * A shortcut function to display a dialog with a kendo.ui.AssetManager
 * @param options
 * @returns {*}
 */
export default function openAssetManager(options = {}) {
    const dfd = $.Deferred();
    Promise.all([
        import('../kidoju.widgets.vectordrawing'),
        import('../kidoju.widgets.assetmanager')
    ])
        .then(() => {
            // Find or create the DOM element
            const $dialog = BaseDialog.getElement(options.cssClass);
            $dialog.css({ padding: 0 }).addClass('k-tabstrip k-header');

            // Create the dialog
            const dialog = $dialog
                .kendoBaseDialog(
                    $.extend({}, options, {
                        title:
                            options.title ||
                            BaseDialog.fn.options.messages[
                                options.type || 'info'
                            ],
                        content: `<div data-${ns}role="assetmanager" data-${ns}bind="value:url"></div>`,
                        actions: options.actions || [
                            {
                                action: 'ok',
                                imageUrl:
                                    'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg',
                                primary: true,
                                text: BaseDialog.fn.options.messages.action.ok
                            },
                            {
                                action: 'cancel',
                                imageUrl:
                                    'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                                text:
                                    BaseDialog.fn.options.messages.action.cancel
                            }
                        ],
                        width: 860
                    })
                )
                .data('kendoBaseDialog');

            // Rebind the initOpen event considering the kendo.ui.Spreadsheet widget cannot bind to a viewModel
            dialog.unbind('initOpen');
            dialog.one('initOpen', e => {
                // Designate assets
                const $assetManager = e.sender.element.find(
                    roleSelector('assetmanager')
                );
                $assetManager
                    .kendoAssetManager(options.assets)
                    .data('kendoAssetManager');
                // Bind viewModel
                bind($assetManager, e.sender.viewModel);
            });

            // Bind the show event to resize once opened
            dialog.one('show', e => {
                resize(e.sender.element);
            });

            // Bind the click event
            dialog.one(CONSTANTS.CLICK, e => {
                dfd.resolve({
                    action: e.action,
                    data: e.sender.viewModel.toJSON()
                });
            });

            // Bind the close event
            dialog.one(CONSTANTS.CLOSE, e => {
                e.sender.element.removeClass('k-tabstrip k-header');
            });

            // Display the message dialog
            dialog.open();
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
window.kidoju.dialogs.openAssetManager = openAssetManager;
