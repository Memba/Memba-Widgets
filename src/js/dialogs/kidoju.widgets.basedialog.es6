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
// const logger = { debug: $.noop }; // TODO Review

// TODO Review styles including the button container at the bottom consider suggestions to Telerik

const {
    bind,
    observable,
    template,
    ui: { Dialog, plugin }
} = window.kendo;
// const NS = '.kendoBaseDialog';

const templates = {
    action: template(
        '<button type="button" class="k-button# if (data.primary) { # k-primary# } #" role="button"></button>'
    ),
    text: template(
        '<img alt="#: data.text #" class="k-image" src="#: data.imageUrl #">#: data.text #'
    )
};

const WIDGET_CLASS = 'kj-dialog';

/** *******************************************************************************
 * BaseDialog Widget
 ******************************************************************************** */

/**
 * BaseDialog Widget
 * A Dialog Widget that implements
 * - a click event handler on button clicks
 * - A viewModel to bind form controls to
 * - buttons with icon images
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
        modal: true,
        messages: {
            title: {
                error: 'Error',
                info: 'Information',
                success: 'Success',
                warning: 'Warning'
            },
            actions: {
                cancel: {
                    action: 'cancel',
                    imageUrl:
                        'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                    text: 'Cancel'
                },
                no: {
                    action: 'no',
                    imageUrl:
                        'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                    text: 'No'
                },
                ok: {
                    action: 'ok',
                    imageUrl:
                        'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg',
                    primary: true,
                    text: 'OK'
                },
                yes: {
                    action: 'yes',
                    imageUrl:
                        'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg',
                    primary: true,
                    text: 'Yes'
                }
            }
        },
        visible: false
    },

    /**
     * Message type
     */
    type: {
        error: 'error',
        info: 'info',
        success: 'success',
        warning: 'warning'
    },

    /**
     * Initialize view model
     * @private
     */
    _initViewModel() {
        if (this.options.data) {
            this.viewModel = observable(this.options.data);
            this.one('initOpen', e => {
                bind(e.sender.element.children(), e.sender.viewModel);
            });
            this.one(CONSTANTS.CLOSE, e => {
                // Clear padding
                e.sender.element.css({ padding: '' });
                // The content method destroys widgets and unbinds data
                e.sender.content('');
                // Release the viewModel
                e.sender.viewModel = undefined;
            });
        }
    },

    /**
     * Add buttons
     * Note: Use a template with images (which the base method does not)
     * @param actionbar
     * @private
     */
    _addButtons(actionbar) {
        /*
        Originally
        var that = this;
        var o = that.options;
        var actionClick = $.proxy(that._actionClick, that);
        var actionKeyHandler = $.proxy(that._actionKeyHandler, that);
        var actions = that.options.actions;
        var length = actions.length;
        var HUNDREDPERCENT = 100;
        var buttonSize = Math.round(HUNDREDPERCENT / length);
        var action;
        var text;
        for (var i = 0; i < length; i++) {
            action = actions[i];
            text = that._mergeTextWithOptions(action);
            var btn = $(templates.action(action))
                .autoApplyNS(NS)
                .html(text)
                .appendTo(actionbar)
                .data('action', action.action)
                .on('click', actionClick)
                .on('keydown', actionKeyHandler);
            if (o.buttonLayout === 'stretched') {
                if (i === length - 1) {
                    buttonSize = HUNDREDPERCENT - i * buttonSize;
                }
                btn.css(WIDTH, buttonSize + '%');
            }
        }
        */
        const { actions, buttonLayout } = this.options;
        const actionClick = this._actionClick.bind(this);
        const actionKeyHandler = this._actionKeyHandler.bind(this);
        let action;
        let text;
        for (let i = 0, { length } = actions; i < length; i++) {
            action = actions[i];
            text = this._mergeTextWithOptions(action);
            const btn = $(templates.action(action))
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
        /*
        // Originally:
        var text = action.text;
        return text ? template(text)(this.options) : '';
        */
        return action.imageUrl
            ? templates.text(action)
            : template(action.text || '')(this.options);
    },

    /**
     * Execute button action
     * Note: Triggers a click event (which the base method doesn;t)
     * @param target
     * @private
     */
    _runActionBtn(target) {
        /*
        // Originally:
        var that = this;
        if (that._closing) {
            return;
        }
        var action = $(target).data('action');
        var preventClose = $.isFunction(action) && action({ sender: that }) === false;
        if (!preventClose) {
            that.close();
        }
        */
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
        this.viewModel = undefined;
        Dialog.fn.destroy.call(this);
    }
});

/**
 * Static getter for the dialog DOM element
 */
BaseDialog.getElement = function getElement(cssClass = 'kj-dialog-tools') {
    // If a dialog already exists, remove it
    let element = $(`.${WIDGET_CLASS}.${cssClass}`);
    if (element.length > 0) {
        const dialog = element.data('kendoBaseDialog');
        if (dialog instanceof BaseDialog) {
            dialog.destroy();
        }
        // element.empty(); We replace the content anyway
    } else {
        // Add a div to the html document for the dialog
        // cssClass ensures we do not mess with other dialogs
        // when opening several depths of dialogs
        element = $(`<div class="${cssClass}"></div>`).appendTo(document.body);
    }
    return element;
};

// Register BaseDialog
plugin(BaseDialog);
