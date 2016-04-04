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
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.pager',
        './vendor/kendo/kendo.listview',
        './vendor/kendo/kendo.tabstrip'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Window = ui.Window;
        var TYPE = {
            INFORMATION: 'information',
            WARNING: 'warning',
            ERROR: 'error'
            // WARNING: 'warning',
        };

        // <div id="create-window" data-role="window" data-title="<%- __('header.create.heading') %>" data-visible="false" data-modal="true" class="k-popup-edit-form" data-width="640" data-height="390">

        /*
         <div class="k-edit-form-container">
             <div class="container-fluid">
                <form role="form">
                     <div class="form-group">
                        <div class="k-widget k-notification k-notification-info" data-role="alert">
                            <div class="k-notification-wrap"><span class="k-icon k-i-note"></span><%- __('header.create.welcome') %></div>
                        </div>
                     </div>
                 </form>
             </div>
             <div class="k-edit-buttons k-state-default">
                <button type="button" data-role="button" data-command="ok" data-image-url="<%- url.join(config.uris.cdn.root, format(config.uris.cdn.icons, __('header.create.buttons.create.icon'))) %>" class="k-primary"><%- __('header.create.buttons.create.text') %></button>&nbsp;
                <button type="button" data-role="button" data-command="cancel" data-image-url="<%- url.join(config.uris.cdn.root, format(config.uris.cdn.icons, __('header.create.buttons.cancel.icon'))) %>"><%- __('header.create.buttons.cancel.text') %></button>
             </div>
         </div>
         */


        var MessageBox = ui.Window.extend({

            init: function (element, options) {
                var that = this;
                Window.fn.init.call(that, element, options);
            },

            options: {
                name: 'MessageBox',
                text: 'Hello World!',
                type: TYPE.INFORMATION
            }

        });

        ui.plugin(MessageBox);


        /**
         * Window widget with buttons fixed and centered along the bottom.  The content is contained in a scrollable div.
         */
        var ExtDialog = kendo.ui.Window.extend({

            _buttonTemplate: kendo.template('<div class="k-ext-dialog-buttons" style="position:absolute; bottom:10px; text-align:center; width:#= parseInt(width, 10) - 14 #px;"><div style="display:inline-block"># $.each (buttons, function (idx, button) { # <button class="k-button" style="margin-right:5px; width:100px;">#= button.name #</button> # }) # </div></div>'),
            _contentTemplate: kendo.template('<div class="k-ext-dialog-content" style="height:#= parseInt(height, 10) - 55 #px;; width:#= parseInt(width, 10) - 14 #px;overflow:auto;">'),

            /**
             * Initialize the dialog
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;

                options.visible = options.visible || false;

                kendo.ui.Window.fn.init.call(that, element, options);
                $(element).data('kendoWindow', that);

                // Place the content in a scollable div.
                var html = $(element).html();
                $(element).html(that._contentTemplate(options));
                $(element).find('div.k-ext-dialog-content').append(html);

                // Create a div for the buttons.
                $(element).after(that._buttonTemplate(options));

                // Create the buttons.
                $.each(options.buttons, function (idx, button) {
                    if (button.click) {
                        $($(element).parent().find('.k-ext-dialog-buttons .k-button')[idx]).on('click', { handler: button.click }, function (e) {
                            e.data.handler({ button: this, dialog: that });
                        });
                    }
                });

                // When the window resizes, position the content and button divs.
                that.bind('resize', function (e) {
                    that.resizeDialog();
                });
            },

            /**
             * Adjust the width and height for the buttons and content within the Window
             */
            resizeDialog: function () {
                var that = this;
                var $dialog = $(that.element);
                var width = $dialog.width();
                var height = $dialog.height();
                $dialog.parent().find('.k-ext-dialog-buttons').width(width);
                $dialog.parent().find('.k-ext-dialog-content').width(width).height(height - 39);
            },

            options: {
                name: 'ExtDialog'
            }
        });
        kendo.ui.plugin(ExtDialog);

        /**
         * AlertDialog
         * @type {{show: kendo.ui.ExtAlertDialog.show, hide: kendo.ui.ExtAlertDialog.hide}}
         */
        kendo.ui.ExtAlertDialog = {

            /**
             * Show dialog
             * @param options
             * @returns {Deferred|jQuery.Deferred}
             */
            show: function (options) {
                return new $.Deferred(function (deferred) {
                    var dialog = null;

                    // If an alert dialog already exists, remove it.
                    if ($('#extAlertDialog').length > 0) {
                        $('#extAlertDialog').parent().remove();
                    }

                    options = $.extend({
                        width: '300px',
                        height: '100px',
                        buttons: [{
                            name: 'OK',
                            click: function (e) {
                                dialog.close();
                                deferred.resolve({ button: 'OK' });
                            }
                        }],
                        modal: true,
                        visible: false,
                        message: '',
                        icon: 'k-ext-information'
                    }, options);

                    // Add a div to the html document for the alert dialog.
                    $(document.body).append(kendo.format('<div id="extAlertDialog" style="position:relative;"><div style="position:absolute;left:10px;top:10px;" class="{0}"></div><div style="display:inline-block;margin-left:45px;">{1}</div></div>', options.icon, options.message));

                    // Create the alert dialog.
                    dialog = $('#extAlertDialog').kendoExtDialog(options).data('kendoExtDialog');
                    $('#extAlertDialog').parent().find('div.k-window-titlebar div.k-window-actions').empty();

                    // Display and center the alert dialog.
                    dialog.center().open();
                });
            },

            /**
             * Hide dialog
             */
            hide: function () {
                $('#extAlertDialog').data('kendoExtDialog').close();
            }
        };

        /**
         * OkCancelDialog
         * @type {{show: kendo.ui.ExtOkCancelDialog.show}}
         */
        kendo.ui.ExtOkCancelDialog = {

            /**
             * Show dialog
             * @param options
             * @returns {Deferred|jQuery.Deferred}
             */
            show: function (options) {
                return new $.Deferred(function (deferred) {
                    if ($('#extOkCancelDialog').length > 0) {
                        $('#extOkCancelDialog').parent().remove();
                    }

                    options = $.extend({
                        width: '300px',
                        height: '100px',
                        buttons: [{
                            name: 'OK',
                            click: function (e) {
                                $('#extOkCancelDialog').data('kendoExtDialog').close();
                                deferred.resolve({ button: 'OK' });
                            }
                        }, {
                            name: 'Cancel',
                            click: function (e) {
                                $('#extOkCancelDialog').data('kendoExtDialog').close();
                                deferred.resolve({ button: 'Cancel' });
                            }
                        }],
                        modal: true,
                        visible: false,
                        message: '',
                        icon: 'k-ext-information'
                    }, options);

                    $(document.body).append(kendo.format('<div id="extOkCancelDialog" style="position:relative;"><div style="position:absolute;left:10px;top:10px;" class="{0}"></div><div style="display:inline-block;margin-left:45px;">{1}</div></div>', options.icon, options.message));
                    $('#extOkCancelDialog').kendoExtDialog(options);
                    $('#extOkCancelDialog').parent().find('div.k-window-titlebar div.k-window-actions').empty();
                    $('#extOkCancelDialog').data('kendoExtDialog').center().open();
                });
            }

        };

        /**
         * YesNoDialog
         * @type {{show: kendo.ui.ExtYesNoDialog.show, hide: kendo.ui.ExtYesNoDialog.hide}}
         */
        kendo.ui.ExtYesNoDialog = {

            /**
             * Show dialog
             * @param options
             * @returns {Deferred|jQuery.Deferred}
             */
            show: function (options) {
                return new $.Deferred(function (deferred) {
                    if ($('#extYesNoDialog').length > 0) {
                        $('#extYesNoDialog').parent().remove();
                    }

                    options = $.extend({
                        width: '300px',
                        height: '100px',
                        buttons: [{
                            name: 'Yes',
                            click: function (e) {
                                $('#extYesNoDialog').data('kendoExtDialog').close();
                                deferred.resolve({ button: 'Yes' });
                            }
                        }, {
                            name: 'No',
                            click: function (e) {
                                $('#extYesNoDialog').data('kendoExtDialog').close();
                                deferred.resolve({ button: 'No' });
                            }
                        }],
                        modal: true,
                        visible: false,
                        message: '',
                        icon: 'k-ext-information'
                    }, options);

                    $(document.body).append(kendo.format('<div id="extYesNoDialog" style="position:relative;"><div style="position:absolute;left:10px;top:10px;" class="{0}"></div><div style="display:inline-block;margin-left:45px;2>{1}</div></div>', options.icon, options.message));
                    $('#extYesNoDialog').kendoExtDialog(options);
                    $('#extYesNoDialog').parent().find('div.k-window-titlebar div.k-window-actions').empty();
                    $('#extYesNoDialog').data('kendoExtDialog').center().open();
                });
            },

            /**
             * Hide dialog
             */
            hide: function () {
                $('#extYesNoDialog').data('kendoExtDialog').close();
            }

        };

        /**
         * InputDialog
         * @type {{show: kendo.ui.ExtInputDialog.show, hide: kendo.ui.ExtInputDialog.hide}}
         */
        kendo.ui.ExtInputDialog = {

            /**
             * Show dialog
             * @param options
             * @returns {Deferred|jQuery.Deferred}
             */
            show: function (options) {
                return new $.Deferred(function (deferred) {
                    var dialog = null;

                    if ($('#extInputDialog').length > 0) {
                        $('#extInputDialog').parent().remove();
                    }

                    options = $.extend({
                        width: '300px',
                        height: '100px',
                        buttons: [{
                            name: 'OK',
                            click: function (e) {
                                var $inputText = $('#extInputDialog .k-ext-input-dialog-input');
                                if (dialog.options.required && $inputText.val().length === 0) {
                                    $inputText.addClass(dialog.options.requiredCss);
                                } else {
                                    dialog.close();
                                    deferred.resolve({ button: 'OK', input: $inputText.val() });
                                }
                            }
                        }, {
                            name: 'Cancel',
                            click: function (e) {
                                dialog.close();
                                deferred.resolve({ button: 'Cancel' });
                            }
                        }],
                        modal: true,
                        visible: false,
                        message: '',
                        required: false,
                        requiredCss: 'k-ext-required'
                    }, options);

                    $(document.body).append(kendo.format('<div id="extInputDialog" style="position:relative;"><div style="display:block;margin-left:10px;right-margin:10px;">{0}</div><div style="display:block;margin-left:10px;margin-right:15px;"><input type="text" class="k-ext-input-dialog-input" style="width:100%;"</input></div></div>', options.message));
                    dialog = $('#extInputDialog').kendoExtDialog(options).data('kendoExtDialog');
                    $('#extInputDialog').parent().find('div.k-window-titlebar div.k-window-actions').empty();
                    dialog.center().open();
                });
            },

            /**
             * Hide dialog
             */
            hide: function () {
                $('#extInputDialog').data('kendoExtDialog').close();
            }

        };

        /**
         * WaitDialog
         * @type {{show: kendo.ui.ExtWaitDialog.show, hide: kendo.ui.ExtWaitDialog.hide}}
         */
        kendo.ui.ExtWaitDialog = {

            /**
             * Show dialog
             * @param options
             * @returns {Deferred|jQuery.Deferred}
             */
            show: function (options) {
                return new $.Deferred(function (deferred) {
                    if ($('#extWaitDialog').length > 0) {
                        $('#extWaitDialog').parent().remove();
                    }

                    options = $.extend({
                        width: '300px',
                        height: '100px',
                        modal: true,
                        visible: false,
                        message: ''
                    }, options);

                    $(document.body).append(kendo.format('<div id="extWaitDialog" style="position:relative;"><div style="position:absolute;left:10px;top:10px;" class="k-ext-wait"></div><div style="display:inline-block;margin-left:45px;">{0}</div></div>', options.message));
                    $('#extWaitDialog').kendoWindow(options);
                    $('#extWaitDialog').parent().find('div.k-window-titlebar div.k-window-actions').empty();
                    $('#extWaitDialog').data('kendoWindow').center().open();

                    return deferred.resolve();
                });
            },

            /**
             * Hide dialog
             */
            hide: function () {
                $('#extWaitDialog').data('kendoWindow').close();
            }
        };

        /**
         * YesNoCancelDialog
         * @type {{show: kendo.ui.ExtYesNoCancelDialog.show, hide: kendo.ui.ExtYesNoCancelDialog.hide}}
         */
        kendo.ui.ExtYesNoCancelDialog = {

            /**
             * Show dialog
             * @param options
             * @returns {Deferred|jQuery.Deferred}
             */
            show: function (options) {
                return new $.Deferred(function (deferred) {
                    if ($('#ExtYesNoCancelDialog').length > 0) {
                        $('#ExtYesNoCancelDialog').parent().remove();
                    }

                    options = $.extend({
                        width: '350px',
                        height: '100px',
                        buttons: [{
                            name: 'Yes',
                            click: function (e) {
                                $('#ExtYesNoCancelDialog').data('kendoExtDialog').close();
                                deferred.resolve({ button: 'Yes' });
                            }
                        }, {
                            name: 'No',
                            click: function (e) {
                                $('#ExtYesNoCancelDialog').data('kendoExtDialog').close();
                                deferred.resolve({ button: 'No' });
                            }
                        },
                            {
                                name: 'Cancel',
                                click: function (e) {
                                    $('#ExtYesNoCancelDialog').data('kendoExtDialog').close();
                                    deferred.resolve({ button: 'Cancel' });
                                }
                            }],
                        modal: true,
                        visible: false,
                        message: '',
                        icon: 'k-ext-information'
                    }, options);

                    $(document.body).append(kendo.format('<div id="ExtYesNoCancelDialog" style="position:relative;"><div style="position:absolute;left:10px;top:10px;" class="{0}"></div><div style="display:inline-block;margin-left:45px;">{1}</div></div>', options.icon, options.message));
                    $('#ExtYesNoCancelDialog').kendoExtDialog(options);
                    $('#ExtYesNoCancelDialog').parent().find('div.k-window-titlebar div.k-window-actions').empty();
                    $('#ExtYesNoCancelDialog').data('kendoExtDialog').center().open();
                });
            },

            /**
             * Hide dialog
             */
            hide: function () {
                $('#ExtYesNoCancelDialog').data('kendoExtDialog').close();
            }
        };

    })(window.jQuery);

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
