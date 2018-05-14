import $ from 'jquery';
import 'kendo.core';
import './kidoju.widgets.basedialog.es6';
import '../kidoju.widgets.vectordrawing'; // TODO CSS
import '../kidoju.widgets.assetmanager';
import CONSTANTS from '../window.constants.es6';
// import assert from '../window.assert';

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
    /*
    assert.instanceof(
        kidoju.ToolAssets,
        assets,
        assert.format(
            assert.messages.instanceof.default,
            'assets',
            'kidoju.ToolAssets'
        )
    );
    */

    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: 0 }).addClass('k-tabstrip k-header');

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog(
            Object.assign(
                {
                    title:
                        BaseDialog.fn.options.messages[options.type || 'info'],
                    content: `<div data-${ns}role="assetmanager" data-${ns}bind="value:url"></div>`,
                    data: { url: '' },
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
        // assert.isPlainObject(e, assert.format(assert.messages.isPlainObject.default, 'e'));
        // assert.instanceof(kendo.ui.Dialog, e.sender, assert.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Dialog'));
        const url = e.sender.viewModel.get('url');
        let hasScheme = false;
        Object.keys(options.assets.schemes).some(scheme => {
            hasScheme = url.startsWith(`${scheme}://`);
            return hasScheme;
        });
        if (hasScheme) {
            // This is an asset selected from our store
            dfd.resolve({
                action: e.action,
                data: e.sender.viewModel.toJSON()
            });
        } else if (
            e.action === BaseDialog.fn.options.messages.actions.ok.action &&
            CONSTANTS.RX_URL.test(e.sender.viewModel.get('url'))
        ) {
            // This is a web asset that needs importing
            // TODO: Assert properly options.assets.collections[0].transport.import
            options.assets.collections[0].transport.import({
                data: { url },
                success(response) {
                    // assert.isPlainObject(e, assert.format(assert.messages.isPlainObject.default, 'e'));
                    // assert.instanceof(kendo.ui.Dialog, e.sender, assert.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Dialog'));
                    // assert.isUndefined(e.sender.viewModel, assert.format(assert.messages.isUndefined.default, 'e.sender.viewModel'));
                    // At this stage, the dialog is closed and e.sender.viewModel has been reset to undefined.
                    // e.sender.viewModel.set('url', response.data[0].url); won't work
                    // We need to restore the viewModel and let onOKAction reset it once again to undefined
                    e.sender.viewModel.set('url', response.data[0].url);
                    dfd.resolve({
                        action: e.action,
                        data: e.sender.viewModel.toJSON()
                    });
                },
                error: dfd.reject
            });
        } else {
            dfd.reject(new Error('Unknown url scheme'));
        }
    });

    // Bind the close event
    dialog.one(CONSTANTS.CLOSE, e => {
        e.sender.element.removeClass('k-tabstrip k-header');
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
window.kidoju.dialogs.openAssetManager = openAssetManager;
