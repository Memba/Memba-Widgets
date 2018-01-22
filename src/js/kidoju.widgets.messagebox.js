/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.dialog'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Dialog = ui.Dialog;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.messagebox');
        var STRING = 'string';
        var NS = '.kendoMessageBox';
        var CLICK = 'click';
        var KEYDOWN = 'keydown';
        var ACTION = 'action';
        var HASH = '#';
        var TYPE = {
            ERROR: 'error',
            INFO: 'info',
            SUCCESS: 'success',
            WARNING: 'warning'
        };
        var CONTENT_TEMPLATE = '<div class="k-widget k-notification k-notification-#: type #" data-role="alert">' +
            '<div class="k-notification-wrap"><span class="k-icon k-i-#: type #"></span>#: message #</div>' +
            '</div>';
        var ACTION_TEMPLATE = '<li class=\'k-button# if (data.primary) { # k-primary# } #\' role=\'button\'></li>';
        var TEXT_TEMPLATE = '<img alt="#: data.text #" class="k-image" src="#: data.imageUrl #">#: data.text #';
        var WIDTH = 'width';
        var HUNDREDPERCENT = 100;


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
         * Widgets
         *********************************************************************************/

        /**
         * DialogEx Widget
         */
        var DialogEx = Dialog.extend({

            options: {
                name: 'DialogEx',
                buttonLayout: 'normal',
                visible: false,
                minWidth: '320px' // iPhone 5 width in portrait mode
            },

            /**
             * Add click event to dialog events
             */
            events: Dialog.fn.events.push(CLICK),

            /**
             * Add buttons
             * @param actionbar
             * @private
             */
            _addButtons: function (actionbar) {
                var that = this;
                var options = that.options;
                var actionClick = $.proxy(that._actionClick, that);
                var actionKeyHandler = $.proxy(that._actionKeyHandler, that);
                var actions = that.options.actions;
                var length = actions.length;
                var buttonSize = HUNDREDPERCENT / length;
                var action;
                var text;
                for (var i = 0; i < length; i++) {
                    action = actions[i];
                    text = that._mergeTextWithOptions(action);
                    // var btn = $(kendo.template(ACTION_TEMPLATE)(action)).autoApplyNS(NS).html(text).appendTo(actionbar)
                    var btn = $(kendo.template(ACTION_TEMPLATE)(action)).html(text).appendTo(actionbar)
                        .data(ACTION, action.action)
                        .on(CLICK, actionClick)
                        .on(KEYDOWN, actionKeyHandler);
                    if (options.buttonLayout === 'stretched') {
                        btn.css(WIDTH, buttonSize + '%');
                    }
                }
            },

            /**
             *
             * @param action
             * @returns {string}
             * @private
             */
            _mergeTextWithOptions: function (action) {
                // var text = action.text;
                // return text ? kendo.template(text)(this.options) : '';
                return action.imageUrl ? kendo.template(TEXT_TEMPLATE)(action) : kendo.template(action.text || '')(this.options);
            },

            /**
             * Execute button action
             * @param target
             * @private
             */
            _runActionBtn: function (target) {
                var that = this;
                if (that._closing) {
                    return;
                }
                var action = $(target).data(ACTION);
                var globalClick = that.options.click;
                var preventClose = false;
                if ($.isFunction(action)) {
                    preventClose = action({ sender: that }) === false;
                } else if ($.type(action) === STRING && $.isFunction(globalClick)) {
                    preventClose = globalClick({ sender: that, action: action }) === false;
                } else {
                    preventClose = that.trigger(CLICK, { action: action });
                }
                if (!preventClose) {
                    that.close();
                }
            },

            /**
             * Destroy method
             */
            destroy: function () {
                this.unbind(CLICK);
                Dialog.fn.destroy.call(this);
                kendo.destroy(this.element);
            }

        });

        ui.plugin(DialogEx);

        /**
         * MessageBox Widget
         */
        var MessageBox = DialogEx.extend({

            init: function (element, options) {
                var that = this;
                DialogEx.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                // We need the following statement otherwise $(element).data('kendoMessageBox') instanceof kendo.ui.Dialog (and not kendo.ui.MessageBox)
                $(element).data('kendoMessageBox', that);
                that._layout();
            },

            /**
             * Options
             */
            options: {
                name: 'MessageBox',
                type: TYPE.INFO,
                title: 'Information',
                message: '',
                /*
                actions: [
                    { action: 'ok', text: 'OK', primary: true },
                    { action: 'cancel', text: 'Cancel' }
                ],
                */
                contentTemplate: CONTENT_TEMPLATE,
                messages: {
                    error: 'Error',
                    info: 'Information',
                    success: 'Success',
                    warning: 'Warning'
                }
            },

            /**
             * Type for convenience
             */
            type: {
                error: TYPE.ERROR,
                info: TYPE.INFO,
                success: TYPE.SUCCESS,
                warning: TYPE.WARNING
            },

            /**
             * Layout
             * @private
             */
            _layout: function () {
                var that = this;
                var options = that.options;
                // Add content
                that.content(kendo.template(options.contentTemplate)({ type: options.type, message: options.message }));
            },


            /**
             * Destroy
             */
            destroy: function () {
                DialogEx.fn.destroy.call(this);
                kendo.destroy(this.element);
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
        kendo.alertEx = function (options) {

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

            // Bind the click event
            messageBox.bind(CLICK, function (e) {
                dfd.resolve({ action: e.action });
            });

            // Display the message box
            messageBox.open();

            return dfd.promise();
        };

    })(window.jQuery);

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
