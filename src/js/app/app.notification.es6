/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.notification';
import { isMobileApp } from '../data/data.util.es6';
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

/* eslint-disable prettier/prettier */
const options = isMobileApp()
    ? {
        // prevent accidental hiding for 1 second
        // allowHideAfter: 0,
        // hide automatically after 7 seconds
        // autoHideAfter: 5000,
        // show a hide button
        button: true,
        // position
        position: {
            bottom: null,
            left: 0,
            right: null,
            top: window.orientation % 180 === 0 ? 47 : 41, // Below navbar
        },
        // stacking
        stacking: 'down',
        // width: $(window).width(),
        width: '100%',
    }
    : {
        // prevent accidental hiding for 1 second
        allowHideAfter: 1000,
        // hide automatically after 7 seconds
        autoHideAfter: 7000,
        // show a hide button
        button: true,
        // prevent hiding by clicking on the notification content
        hideOnClick: false,
        // position
        position: {
            bottom: null,
            left: null,
            right: 30,
            top: 70,
        },
        // stacking
        stacking: 'down',
    };
/* eslint-enable prettier/prettier */

/**
 * Notification widget
 * @see https://docs.telerik.com/kendo-ui/api/javascript/ui/notification
 * @type {kendo.ui.Notificaton}
 */
const notification = element
    .kendoNotification(options)
    .data('kendoNotification');

/**
 * Hide notifications when resizing
 */
/*
$(window).resize(() => {
    notification.getNotifications().each((idx, el) => {
        $(el).parent().remove();
    });
});
*/

/**
 * Default export
 */
export default notification;
