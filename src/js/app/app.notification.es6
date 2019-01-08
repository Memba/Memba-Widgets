/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.notification';
import CONSTANTS from '../common/window.constants.es6';

// Note: Element might not exist until page ready event
// We might have to introduce a promise

/**
 * Notification element
 * @type {string}
 */
const NOTIFICATION = 'notification';
let element = $(`${CONSTANTS.HASH}${NOTIFICATION}`);
if (!element.length) {
    element = $(`<${CONSTANTS.DIV}/>`)
        .attr({ id: NOTIFICATION })
        .addClass('hidden-print')
        .prependTo(CONSTANTS.BODY);
}

/**
 * Notification widget
 * @see https://docs.telerik.com/kendo-ui/api/javascript/ui/notification
 * @type {kendo.ui.Notificaton}
 */
const notification = element
    .kendoNotification({
        position: {
            top: 70,
            right: 30
        },
        stacking: 'down',
        // hide automatically after 7 seconds
        autoHideAfter: 7000,
        // prevent accidental hiding for 1 second
        allowHideAfter: 1000,
        // show a hide button
        button: true,
        // prevent hiding by clicking on the notification content
        hideOnClick: false
    })
    .data('kendoNotification');

/**
 * Default export
 */
export default notification;
