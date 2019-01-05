/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO: replace `imageUrl` by `icon` + add CDN path to options + build path when using icons
// TODO unbind in destroy

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.dialog';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    bind,
    destroy,
    htmlEncode,
    observable,
    template,
    ui: { Dialog, plugin }
} = window.kendo;

// const NS = '.kendoBaseDialog';
const logger = new Logger('widgets.basedialog');
const WIDGET_CLASS = 'kj-dialog';
const tmpl = {
    action: template(
        '<button type="button" class="k-button# if (data.primary) { # k-primary# } #" role="button"></button>'
    ),
    image: template(
        '<img alt="#: data.text #" class="k-image" src="#: data.imageUrl #">#: data.text #'
    )
};

/** *******************************************************************************
 * BaseDialog Widget
 ******************************************************************************** */

/**
 * BaseDialog Widget
 * A Dialog Widget that implements
 * - a click event handler on button clicks
 * - A viewModel to bind form controls to
 * - buttons with icon images
 *
 */
const BaseDialog = Dialog.extend({
    /**
     * Constructor
     * @param element
     * @param options
     */
    init(element, options) {
        this._fixKarma(element);
        Dialog.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
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
                close: {
                    action: 'close',
                    imageUrl:
                        'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                    primary: true,
                    text: 'Close'
                },
                create: {
                    action: 'create',
                    imageUrl:
                        'https://cdn.kidoju.com/images/o_collection/svg/office/plus.svg',
                    primary: true,
                    text: 'Create'
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
     * Fix a Karma issue
     * @param element
     * @private
     */
    _fixKarma(element) {
        if (window.__karma__) {
            // The following fixes a bug in Karma where the title is not replaced
            // but appended to the previous title
            $(element)
                .closest('.k-dialog')
                .find('.k-dialog-titlebar > .k-dialog-title')
                .html('');
        }
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
        assert.instanceof(
            $,
            actionbar,
            assert.messages.instanceof.default,
            'actionbar',
            'jQuery'
        );
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
            var btn = $(tmpl.action(action))
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
        let options;
        let text;
        for (let i = 0, { length } = actions; i < length; i++) {
            options = {
                action: actions[i].action,
                imageUrl: actions[i].imageUrl,
                primary: actions[i].primary,
                // Make sure text does not mess with template
                text: (actions[i].text || '').replace('#', '\\#')
            };
            text = this._mergeTextWithOptions(options);
            const btn = $(tmpl.action(options))
                // .autoApplyNS(NS)
                .html(text)
                .appendTo(actionbar)
                .data(CONSTANTS.ACTION, options.action)
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
        /* eslint-disable prettier/prettier */
        return action.imageUrl
            ? tmpl.image(action)
            : template(htmlEncode(action.text || '').replace('#', '\\#'))(
                this.options
            );
        /* eslint-enable prettier/prettier */
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
     * @method destroy
     */
    destroy() {
        this.viewModel = undefined;
        Dialog.fn.destroy.call(this);
        destroy(this.wrapper);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Static getter for the dialog DOM element
 * @method getElement
 * @param cssClass
 * @returns {jQuery|HTMLElement}
 */
BaseDialog.getElement = function getElement(cssClass = 'kj-dialog-tools') {
    // If a dialog already exists, remove it
    let element = $(
        `${CONSTANTS.DOT}${WIDGET_CLASS}${CONSTANTS.DOT}${cssClass}`
    );
    if (element.length) {
        const dialog = element.data('kendoBaseDialog');
        if (dialog instanceof BaseDialog) {
            dialog.title('');
            dialog.content('');
            dialog.destroy();
        }
    } else {
        // Add a div to the html document for the dialog
        // cssClass ensures we do not mess with other dialogs
        // when opening several depths of dialogs
        element = $(`<${CONSTANTS.DIV}/>`)
            .addClass(cssClass)
            .appendTo(document.body);
    }
    return element;
};

/**
 * Global references for i18n
 * Static getter the message namespace (see ../cultures/dialogs.*)
 * @method getMessageNameSpace
 */
BaseDialog.getMessageNameSpace = () => {
    window.kendo.ex = window.kendo.ex || {};
    window.kendo.ex.dialogs = window.kendo.ex.dialogs || {};
    window.kendo.ex.dialogs.messages = window.kendo.ex.dialogs.messages || {};
    return window.kendo.ex.dialogs.messages;
};

/**
 * Registration
 */
plugin(BaseDialog);
