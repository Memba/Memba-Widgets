/**
 * Copyright (c) 2013-2016 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.button',
        './vendor/kendo/kendo.window'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Button = ui.Button;
        var Window = ui.Window;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.messagebox');
        var UNDEFINED = 'undefined';
        var NS = '.kendoMessageBox';
        var CLICK = 'click';
        var CLOSE = 'close';
        var COMMAND = 'command';
        var HASH = '#';
        var TYPE = {
            ERROR: 'error',
            INFO: 'info',
            WARNING: 'warning'
        };
        var CONTENT_TEMPLATE = '<div class="k-widget k-notification k-notification-#: type #" data-role="alert">' +
            '<div class="k-notification-wrap"><span class="k-icon k-i-note"></span>#: message #</div>' +
            '</div>';
        var BUTTONS_TEMPLATE = '<div class="k-action-buttons">' +
            '# for (var i = 0; i < buttons.length; i++) { #' +
            '<button type="button" data-role="button" data-command="#: buttons[i].command #" class="#: buttons[i].class || \'\' #" data-image-url="#: buttons[i].imageUrl || \'\' #">#: buttons[i].text #</button>' +
            '# } #' +
            '</div>';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * Build a random hex string of length characters
         * @param length
         * @returns {string}
         */
        function randomString(length) {
            var s = new Array(length + 1).join('x');
            return s.replace(/x/g, function (c) {
                /* jshint -W016 */
                return (Math.random() * 16|0).toString(16);
                /* jshint +W016 */
            });
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * MessageBox Widget
         */
        var MessageBox = Window.extend({

            init: function (element, options) {
                var that = this;
                Window.fn.init.call(that, element, options);
                logger.debug('widget initialized');
                // For an unexplained reason, buttons are not updated
                that.options.buttons = $.isArray(options.buttons) ? options.buttons : that.options.buttons;
                // We need the following statement otherwise $(element).data('kendoMessageBox') instanceof kendo.ui.Window (and not kendo.ui.MessageBox)
                $(element).data('kendoMessageBox', that);
                that._layout();
                that._bindButtons(true);
            },

            /**
             * Options
             */
            options: {
                name: 'MessageBox',
                type: TYPE.INFO,
                title: 'Information',
                message: 'Hello World!',
                buttons: [
                    { command: 'ok', text: 'OK', class: 'k-primary', imageUrl: 'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg' },
                    { command: 'cancel', text: 'Cancel' }
                ],
                buttonsTemplate: BUTTONS_TEMPLATE,
                contentTemplate: CONTENT_TEMPLATE,
                height: 125,
                width: 400,
                modal: true,
                resizable: false,
                visible: false,
                messages: {
                    error: 'Error',
                    info: 'Information',
                    warning: 'Warning'
                }
            },

            /**
             * Type for convenience
             */
            type: {
                error: TYPE.ERROR,
                info: TYPE.INFO,
                warning: TYPE.WARNING
            },

            /**
             * Layout
             * @private
             */
            _layout: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                // Add message
                element.append(kendo.template(options.contentTemplate)({ type: options.type, message: options.message }));
                // Add buttons
                element.append(kendo.template(options.buttonsTemplate)({ buttons: options.buttons }));
                kendo.init(element); // required to display buttons with data-image-url
                // Add widget class
                element.addClass('k-action-window');
            },

            /**
             * Bind buttons
             * @param enable
             * @private
             */
            _bindButtons: function (enable) {
                var that = this;
                var buttons = that.element.find('button');
                $.each(buttons, function (index, buttonElement) {
                    var buttonWidget = $(buttonElement).data('kendoButton');
                    // We should have Kendo UI Button widgets after calling the kendo.init method in this._layout
                    assert.instanceof(Button, buttonWidget, kendo.format(assert.messages.instanceof.default, 'buttonWidget', 'kendo.ui.Button'));
                    if (enable) {
                        buttonWidget.unbind(CLICK);
                        buttonWidget.bind(CLICK, $.proxy(that._onButtonClick, that));
                    } else {
                        buttonWidget.destroy();
                    }
                });
            },

            /**
             * Button click handler
             * @param e
             * @private
             */
            _onButtonClick: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(Button, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Button'));
                assert.instanceof(MessageBox, this, kendo.format(assert.messages.instanceof.default, 'this', 'MessageBox'));
                var button = $(e.sender.element);
                // Store the command which can be read in a close event handler
                this.command = button.attr(kendo.attr(COMMAND));
                this.close();
            },

            /**
             * Open messagebox
             */
            open: function () {

                // Erase the command before a new close
                this.command = undefined;

                // Center and open the message box
                this.center();
                Window.fn.open.call(this);

            },

            /**
             * Destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                that._bindButtons(false);
                element.find('*').off();
                element.off().empty();
                Window.fn.destroy.call(that);
            }

        });

        ui.plugin(MessageBox);

        var ID = 'alert_' + randomString(6);

        /*********************************************************************************
         * kendo.alert function
         *********************************************************************************/

        /**
         * A shortcut function to display an alert dialog
         * @param options
         * @returns {*}
         */
        kendo.alert = function (options) {

            var dfd = $.Deferred();
            var messageBox = null;

            // If an alert dialog already exists, remove it.
            var element = $(HASH + ID);
            if (element.length > 0) {
                messageBox = element.data('kendoMessageBox');
                if (messageBox instanceof kendo.ui.MessageBox) {
                    messageBox.destroy();
                }
            }

            // Add a div to the html document for the alert dialog.
            $(document.body).append(kendo.format('<div id="{0}"></div>', ID));

            // Create the message box
            messageBox = $(HASH + ID).kendoMessageBox(options).data('kendoMessageBox');

            // Bind the close event
            messageBox.bind(CLOSE, function (e) {
                dfd.resolve({ command: this.command });
            });

            // Display the message box
            messageBox.open();

            return dfd.promise();
        };

    })(window.jQuery);

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
