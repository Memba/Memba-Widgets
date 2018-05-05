/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

import $ from 'jquery';
import 'kendo.binder';
import 'kendo.dialog';
import CONSTANTS from '../window.constants.es6';
// import assert from '../window.assert.es6';
// const logger = new window.Logger('kidoju.widgets.messagebox');
const logger = { debug: $.noop }; // TODO Review

const { bind, ns, observable, template } = window.kendo;
const { Dialog, plugin } = window.kendo.ui;
// const NS = '.kendoMessageBox';

const ACTION_TEMPLATE =
    '<li class="k-button# if (data.primary) { # k-primary# } #" role="button"></li>';
const TEXT_TEMPLATE =
    '<img alt="#: data.text #" class="k-image" src="#: data.imageUrl #">#: data.text #';

const WIDGET_CLASS = 'kj-dialog';

/** *******************************************************************************
 * BaseDialog Widget
 ******************************************************************************** */

/**
 * BaseDialog Widget
 * A Dialog WIdget that implements
 * - A viewModel to bind form controls to
 * -
 */
const BaseDialog = Dialog.extend({
    /**
     * Constructor
     * @param element
     * @param options
     */
    init(element, options) {
        Dialog.fn.init.call(this, element, options);
        this.element.addClass(WIDGET_CLASS);
        this._initViewModel();
    },

    /**
     * Events
     */
    events: Dialog.fn.events.concat([CONSTANTS.CLICK]),

    /**
     * Options
     */
    options: {
        name: 'BaseDialog',
        buttonLayout: 'normal',
        data: null, // <-- The data to feed to our viewModel
        minWidth: '320px', // iPhone 5 width in portrait mode
        model: true,
        messages: {
            // For kendo.alertEx
            title: {
                error: 'Error',
                info: 'Information',
                success: 'Success',
                warning: 'Warning'
            },
            action: {
                cancel: 'Cancel',
                ok: 'OK'
            }
        },
        visible: false
    },

    /**
     * Initialize view model
     * @private
     */
    _initViewModel() {
        if (this.options.data) {
            this.viewModel = observable(this.options.data);
            this.bind('initOpen', e => {
                bind(e.sender.element.children(), e.sender.viewModel);
            });
        }
    },

    /**
     * Add buttons
     * @param actionbar
     * @private
     */
    _addButtons(actionbar) {
        const { actions, buttonLayout } = this.options;
        const actionClick = this._actionClick.bind(this);
        const actionKeyHandler = this._actionKeyHandler.bind(this);
        let action;
        let text;
        for (let i = 0, { length } = actions; i < length; i++) {
            action = actions[i];
            text = this._mergeTextWithOptions(action);
            const btn = $(template(ACTION_TEMPLATE)(action))
                // .autoApplyNS(NS)
                .html(text)
                .appendTo(actionbar)
                .data(CONSTANTS.ACTION, action.action)
                .on(CONSTANTS.CLICK, actionClick)
                .on(CONSTANTS.KEYDOWN, actionKeyHandler);
            if (buttonLayout === 'stretched') {
                btn.css(CONSTANTS.WIDTH, `${100 / length}%`);
            }
        }
    },

    /**
     * Button images
     * @param action
     * @returns {string}
     * @private
     */
    _mergeTextWithOptions(action) {
        return action.imageUrl
            ? template(TEXT_TEMPLATE)(action)
            : template(action.text || '')(this.options);
    },

    /**
     * Execute button action
     * @param target
     * @private
     */
    _runActionBtn(target) {
        if (this._closing) {
            return;
        }
        const action = $(target).data(CONSTANTS.ACTION);
        const globalClick = this.options.click;
        let preventClose = false;
        if ($.type(action) === CONSTANTS.FUNCTION) {
            preventClose = action({ sender: this }) === false;
        } else if (
            $.type(action) === CONSTANTS.STRING &&
            $.type(globalClick) === CONSTANTS.FUNCTION
        ) {
            preventClose = globalClick({ sender: this, action }) === false;
        } else {
            preventClose = this.trigger(CONSTANTS.CLICK, { action });
        }
        if (!preventClose) {
            this.close();
        }
    },

    /**
     * Destroy method
     */
    destroy() {
        this.unbind(CONSTANTS.CLICK);
        Dialog.fn.destroy.call(this);
    }
});

// Register BaseDialog
plugin(BaseDialog);

/** *******************************************************************************
 * kendo.alertEx function
 ******************************************************************************** */

/**
 * A shortcut function to display an alert dialog
 * @param options (Same as kendo.ui.Dialog, expect `title` and `content` should be replaced by `type` and `message`)
 * @returns {*}
 */
export function alertEx(options) {
    const ALERT_CLASS = 'kj-dialog-alert';
    const ALERT_TEMPLATE =
        '<div class="k-widget k-notification k-notification-#: type #"><div class="k-notification-wrap"><span class="k-icon k-i-#: type #"></span>#: message #</div></div>';

    const dfd = $.Deferred();
    let box;

    // Create or reuse an existing dialog
    let element = $(`.${WIDGET_CLASS}.${ALERT_CLASS}`);
    if (element.length > 0) {
        box = element.data('kendoBaseDialog');
        if (box instanceof BaseDialog) {
            box.destroy();
        }
    } else {
        // Add a div to the html document for the alert dialog
        // ALERT_CLASS ensures we do not mess with other dialogs
        element = $(`<div class="${ALERT_CLASS}"></div>`).appendTo(
            document.body
        );
    }

    // Create the dialog
    const opts = options || {};
    box = element
        .kendoBaseDialog(
            $.extend({}, opts, {
                title:
                    opts.title ||
                    BaseDialog.fn.options.messages.title[opts.type],
                content:
                    opts.content ||
                    template(ALERT_TEMPLATE)({
                        type: opts.type || 'info',
                        message: opts.message || ''
                    }),
                actions: opts.actions || [
                    {
                        action: 'ok',
                        text: BaseDialog.fn.options.messages.action.ok,
                        imageUrl:
                            'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg'
                    },
                    {
                        action: 'cancel',
                        text: BaseDialog.fn.options.messages.action.cancel,
                        imageUrl:
                            'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg'
                    }
                ]
            })
        )
        .data('kendoBaseDialog');

    // Bind the click event
    box.bind(CONSTANTS.CLICK, e => {
        dfd.resolve({ action: e.action });
    });

    // Show the dialog
    box.open();

    return dfd.promise();
}

/**
 * A shortcut function to display a prompt dialog
 * @param options
 * @returns {*}
 */
export function promptEx(options) {
    const PROMPT_CLASS = 'kj-dialog-prompt';
    const PROMPT_TEMPLATE = `<div><div class="k-widget k-notification k-notification-#: type #"><div class="k-notification-wrap"><span class="k-icon k-i-#: type #"></span>#: message #</div></div><div><input type="text" class="k-textbox" style="width:100%; margin-top: 1em;" data-${ns}bind="value: input"></div></div>`;

    const dfd = $.Deferred();
    let box;

    // Create or reuse an existing dialog
    let element = $(`.${WIDGET_CLASS}.${PROMPT_CLASS}`);
    if (element.length > 0) {
        box = element.data('kendoBaseDialog');
        if (box instanceof BaseDialog) {
            box.destroy();
        }
        // element.empty(); We replace the content anyway
    } else {
        // Add a div to the html document for the alert dialog
        // PROMPT_CLASS ensures we do not mess with other dialogs
        element = $(`<div class="${PROMPT_CLASS}"></div>`).appendTo(
            document.body
        );
    }

    // Create the dialog
    const opts = options || {};
    box = element
        .kendoBaseDialog(
            $.extend({}, opts, {
                title:
                    opts.title ||
                    BaseDialog.fn.options.messages.title[opts.type],
                content:
                    opts.content ||
                    template(PROMPT_TEMPLATE)({
                        type: opts.type || 'info',
                        message: opts.message || ''
                    }),
                data: {
                    input: ''
                },
                actions: opts.actions || [
                    {
                        action: 'ok',
                        text: BaseDialog.fn.options.messages.action.ok,
                        imageUrl:
                            'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg'
                    },
                    {
                        action: 'cancel',
                        text: BaseDialog.fn.options.messages.action.cancel,
                        imageUrl:
                            'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg'
                    }
                ]
            })
        )
        .data('kendoBaseDialog');

    // Bind the click event
    box.bind(CONSTANTS.CLICK, e => {
        dfd.resolve({
            action: e.action,
            input: e.sender.viewModel.get('input')
        });
    });

    // Show the dialog
    box.open();

    return dfd.promise();
}

/**
 * Maintain compatibility with legacy code
 */
window.kendo.alertEx = alertEx;
window.kendo.promptEx = promptEx;
