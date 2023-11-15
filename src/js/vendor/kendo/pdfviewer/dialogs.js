/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.dialog.js";
import "../kendo.window.js";
import "../kendo.binder.js";
import "../kendo.numerictextbox.js";
import "../kendo.dropdownlist.js";
import "../kendo.icons.js";
import "../kendo.draganddrop.js";

(function($, undefined) {
    var kendo = window.kendo,
        encode = kendo.htmlEncode,
        extend = $.extend,
        Class = kendo.Class,
        Draggable = kendo.ui.Draggable,
        outerWidth = kendo._outerWidth,
        EXTENSIONS = {
            svg: ".svg",
            png: ".png"
        },
        keys = kendo.keys;

    var ErrorDialog = Class.extend({
        init: function(options) {
            this.options = extend(options, {
                actions: [{
                    text: options.messages.dialogs.okText
                }]
            });
            this._dialog = $("<div />")
                    .kendoDialog(this.options)
                    .getKendoDialog();
        },
        open: function() {
            this._dialog.center().open();
        }
    });

    var ExportAsDialog = Class.extend({
        init: function(options) {
            this.options = extend(options, this.options, {
                fileFormats: [{
                    description: options.messages.dialogs.exportAsDialog.png,
                    extension: EXTENSIONS.png
                }, {
                    description: options.messages.dialogs.exportAsDialog.svg,
                    extension: EXTENSIONS.svg
                }],
                title: options.messages.dialogs.exportAsDialog.title,
                open: function() {
                    this.center();
                }
            });
            this._initializeDialog();
            return this;
        },
        options: {
            extension: EXTENSIONS.png,
            autoFocus: true,
            resizable: false,
            modal: {
                preventScroll: true
            },
            width: "90%",
            maxWidth: 520,
            template: ({ messages, total }) =>
                `<div class='k-edit-label'><label>${encode(messages.exportAsDialog.labels.fileName)}:</label></div>` +
                "<div class='k-edit-field'>" +
                    "<span class='k-textbox k-input k-input-md k-rounded-md k-input-solid'><input class='k-input-inner' data-bind='value: name' /></span>" +
                "</div>" +
                "<div>" +
                    `<div class='k-edit-label'><label>${encode(messages.exportAsDialog.labels.saveAsType)}:</label></div>` +
                    "<div class='k-edit-field'>" +
                    "<select data-role='dropdownlist' class='k-file-format' " +
                        "data-text-field='description' " +
                        "data-value-field='extension' " +
                        "data-bind='value: extension, source: fileFormats'></select>" +
                    "</div>" +
                "</div>" +
                `<div class='k-edit-label'><label>${encode(messages.exportAsDialog.labels.page)}:</label></div>` +
                "<div class='k-edit-field'>" +
                    `<input data-role='numerictextbox' data-format='n0' data-min='1' data-max='${encode(total)}' data-bind='value: page' />` +
                "</div>" +
                "<div class='k-actions'>" +
                    `<button class='k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary' data-bind='click: apply'><span class='k-button-text'>${encode(messages.save)}</span></button>` +
                    `<button class='k-button k-button-md k-rounded-md k-button-solid k-button-solid-base' data-bind='click: close'><span class='k-button-text'>${encode(messages.cancel)}</span></button>` +
                "</div>"
        },
        _updateModel: function(options) {
            if (options.pagesCount) {
                this.viewModel.set("pagesCount", options.pagesCount);
            }
            if (options.page) {
                this.viewModel.set("page", options.page);
            }
        },
        _initializeDialog: function() {
            var that = this;
            var options = that.options;
            var dialogMessages = options.messages.dialogs;
            var dialog = $("<div class='k-pdf-viewer-window k-action-window k-popup-edit-form' />")
                    .append(kendo.template(options.template)({
                        total: options.pagesCount,
                        messages: dialogMessages
                    }))
                    .kendoWindow(options)
                    .getKendoWindow();

            that.viewModel = kendo.observable({
                title: dialogMessages.exportAsDialog.title,
                name: dialogMessages.exportAsDialog.defaultFileName,
                extension: options.extension,
                fileFormats: options.fileFormats,
                pagesCount: options.pagesCount,
                page: 1,
                apply: that.apply.bind(this),
                close: function() {
                    dialog.close();
                }
            });

            that._dialog = dialog;

            kendo.bind(dialog.element, that.viewModel);
            return dialog;
        },
        open: function() {
            this._dialog.center().open();
        },
        apply: function() {
            this._dialog.close();
            this.options.apply({
                fileName: this.viewModel.name + this.viewModel.extension,
                extension: this.viewModel.extension,
                page: this.viewModel.page
            });
        }
    });

    var SearchDialog = Class.extend({
        init: function(options) {
            var that = this;
            that.options = extend({}, options, that.options);
        },
        options: {
            resizable: false,
            template: ({ messages }) => '<div class="k-search-panel k-pos-sticky k-top-center">' +
                          `<button aria-label='${encode(messages.dragHandle)}' class='k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button k-search-dialog-draghandle'>${kendo.ui.icon({ icon: "handle-drag", iconClass: "k-button-icon" })}</button>` +
                          "<span class='k-textbox k-input k-input-md k-rounded-md k-input-solid'>" +
                              `<input class='k-search-dialog-input k-input-inner' data-bind='value: boundValue, events: { keyup: onKeyup, input: onInput }' aria-label='${encode( messages.inputLabel)}' title='${encode(messages.inputLabel)}' />` +
                              `<span class='k-input-suffix'><button class='k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button k-match-case-button k-match-case-button' data-bind='css: {k-selected: matchCase}, click: matchCaseClick' aria-label='${encode(messages.matchCase)}' title='${encode(messages.matchCase)}'>${kendo.ui.icon({ icon: "convert-lowercase", iconClass: "k-button-icon" })}</button></span>` +
                          "</span>" +
                          `<span class='k-search-matches'><span data-bind='text: matchIndex'></span> ${encode(messages.of)} <span data-bind='text: matches'></span></span>` +
                          `<button class='k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button' data-bind='click: prev' aria-label='${encode(messages.previous)}' title='${encode(messages.previous)}'>${kendo.ui.icon({ icon: "arrow-up", iconClass: "k-button-icon" })}</button>` +
                          `<button class='k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button' data-bind='click: next' aria-label='${encode(messages.next)}' title='${encode(messages.next)}'>${kendo.ui.icon({ icon: "arrow-down", iconClass: "k-button-icon" })}</button>` +
                          `<button class='k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button' data-bind='click: close' aria-label='${encode(messages.close)}' title='${encode(messages.close)}'>${kendo.ui.icon({ icon: "x", iconClass: "k-button-icon" })}</button>` +
                      "</div>"
        },
        open: function() {
            var that = this;

            if (!that.dialog) {
                that._initializeDialog();
            }

            that.options.open();
            that._showSearchDialog();
        },
        close: function() {
            var that = this;
            that.options.close();
            that._hideSearchDialog();
        },
        _showSearchDialog: function() {
            var that = this;

            that.dialog.css("left",`${(that.options.pageContainer.innerWidth() / 2) - (outerWidth(that.dialog, true) / 2)}px`);

            that.dialog.kendoStop().kendoAnimate({
                effects: { zoom: { direction: "in" }, fade: { direction: "in" } },
                duration: 350,
                complete: function(ev) {
                    that.dialog.find(".k-search-dialog-input").trigger("focus");
                }
            });
        },
        _hideSearchDialog: function() {
            var that = this;

            that.dialog.kendoStop().kendoAnimate({
                effects: { zoom: { direction: "out", properties: { scale: 0.7 } }, fade: { direction: "out" } },
                duration: 350,
                hide: true
            });
        },
        _initializeDialog: function() {
            var that = this;
            var template = kendo.template(that.options.template);
            var dialogElm = $(template({
                messages: that.options.messages
            }));

            that.options.pageContainer.prepend(dialogElm);
            that.dialog = dialogElm;

            that._draggable = new Draggable(dialogElm, {
                filter: ".k-search-dialog-draghandle",
                axis: "x",
                dragstart: function(e) {
                    var wnd = that.dialog;
                    var containment = that.options.pageContainer;

                    wnd.startPosition = {
                        left: e.x.client - kendo.getOffset(wnd, "position").left,
                    };

                    if (!containment) {
                        return null;
                    }

                    containment._innerWidth = containment.innerWidth();

                    if (parseInt(containment._innerWidth, 10) > containment[0].clientWidth) {
                        containment._innerWidth -= kendo.support.scrollbar();
                    }

                    wnd.maxLeft = containment._innerWidth - outerWidth(wnd, true);
                },
                drag: function(e) {
                    var wnd = that.dialog;
                    var position = {};
                    var left;

                    left = e.x.client - wnd.startPosition.left;

                    if (left && isNaN(left) && left.toString().indexOf("px") < 0) {
                        position.left = left;
                    } else {
                        position.left = Math.max(
                            Math.min(parseInt(left, 10), parseInt(wnd.maxLeft, 10)),
                            0
                        );
                    }

                    wnd.css(position);
                },
            });

            that._draggable.userEvents.stopPropagation = false;

            that.searchModel = kendo.observable({
                boundValue: "",
                searchText: "",
                matchCase: false,
                matchIndex: 0,
                matches: 0,
                matchCaseClick: function() {
                    this.set("matchCase", !this.matchCase);
                },
                next: that.options.next,
                prev: that.options.prev,
                close: function() {
                    this.set("boundValue", "");
                    that.close();
                },
                onKeyup: function(ev) {
                    var key = ev.keyCode;
                    var navigationFn = ev.shiftKey ? this.prev : this.next;

                    if (key === keys.ENTER) {
                        navigationFn();
                        ev.preventDefault();
                    } else if (key == keys.ESC) {
                        this.close();
                    }
                },
                onInput: function(ev) {
                    this.set("searchText", ev.target.value);
                }
            });

            kendo.bind(dialogElm, that.searchModel);
        }
    });

    extend(kendo.pdfviewer, {
        dialogs: {
            ErrorDialog: ErrorDialog,
            ExportAsDialog: ExportAsDialog,
            SearchDialog: SearchDialog
        }
    });
})(window.kendo.jQuery);

