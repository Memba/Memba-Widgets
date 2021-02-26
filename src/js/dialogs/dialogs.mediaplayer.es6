/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO prefer a non-modal kendo.window

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.mediaplayer';
import __ from '../app/app.i18n.es6';
import CONSTANTS from '../common/window.constants.es6';
import './widgets.basedialog.es6';

const {
    ns,
    resize,
    ui: { BaseDialog },
} = window.kendo;

/**
 * A shortcut function to display a dialog with a kendo.ui.MediaPlayer
 * @param options
 * @returns {*}
 */
function openVideoPlayer(options = {}) {
    const dfd = $.Deferred();

    // Find or create the DOM element
    const $dialog = BaseDialog.getElement(options.cssClass);
    $dialog.css({ padding: 0 });

    // Create the dialog
    const dialog = $dialog
        .kendoBaseDialog({
            title: __('dialogs.mediaplayer.title'),
            content: `<div data-${ns}role="mediaplayer" data-${ns}media="{&quot;title&quot;:&quot;${options.title}&quot;,&quot;source&quot;:&quot;${options.source}&quot;}" style="height:360px; width: 480px"></div>`,
            actions: [BaseDialog.fn.options.messages.actions.close],
            data: {
                // This should not be empty otherwise MVVM won't work
            },
            width: 'auto',
            ...options,
        })
        .data('kendoBaseDialog');

    // Bind the show event to resize once opened
    dialog.one(CONSTANTS.SHOW, (e) => {
        resize(e.sender.element);
        // Workaround for issue described at
        // https://github.com/telerik/kendo-ui-core/issues/1990 and
        // https://github.com/telerik/kendo-ui-core/issues/2156
        // e.sender.element.find(roleSelector('styleeditor)).data('kendoStyleEditor').refresh();
    });

    // Bind the click event
    dialog.bind(CONSTANTS.CLICK, (e) => {
        dfd.resolve({
            action: e.action,
            // data: {}
        });
    });

    // Display the message dialog
    dialog.open();

    return dfd.promise();
}

/**
 * Default export
 */
export default openVideoPlayer;
