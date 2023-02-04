/**
 * Kendo UI v2023.1.117 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";

(function($, undefined) {

    var kendo = window.kendo;
    var Widget = kendo.ui.Widget;
    var extend = $.extend;
    var DOT = ".";
    var NS = ".kendoChat";
    var keys = kendo.keys;
    var SEND_ICON = '<svg version="1.1" ixmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 16 16" xml:space="preserve"><path d="M0,14.3c-0.1,0.6,0.3,0.8,0.8,0.6l14.8-6.5c0.5-0.2,0.5-0.6,0-0.8L0.8,1.1C0.3,0.9-0.1,1.1,0,1.7l0.7,4.2C0.8,6.5,1.4,7,1.9,7.1l8.8,0.8c0.6,0.1,0.6,0.1,0,0.2L1.9,8.9C1.4,9,0.8,9.5,0.7,10.1L0,14.3z"/></svg>';
    var TOGGLE_ICON = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g>   <path d="M128,240c0-26.4-21.6-48-48-48s-48,21.6-48,48s21.6,48,48,48S128,266.4,128,240z"/>   <path d="M192,240c0,26.4,21.6,48,48,48c26.4,0,48-21.6,48-48s-21.6-48-48-48C213.6,192,192,213.6,192,240z"/>   <path d="M352,240c0,26.4,21.6,48,48,48c26.4,0,48-21.6,48-48s-21.6-48-48-48C373.6,192,352,213.6,352,240z"/></g></svg>';

    var messageBoxStyles = {
        input: "k-input-inner",
        inputWrapper: "k-textbox k-input k-input-lg k-input-solid",
        button: "k-button",
        buttonFlat: "k-button-lg k-button-flat k-button-flat-base",
        iconButton: "k-icon-button",
        buttonIcon: "k-button-icon",
        buttonSend: "k-button-send",
        buttonToggle: "k-button-toggle",
        iconAdd: "k-icon k-i-add",
        hidden: "k-hidden",
        inputSuffix: "k-input-suffix"
    };

    var ChatMessageBox = Widget.extend({
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);

            this._wrapper();

            this._attachEvents();

            this._typing = false;
        },

        events: [
            "focusToolbar",
            "sendMessage",
            "toggleToolbar",
            "typingEnd",
            "typingStart"
        ],

        options: {
            messages: {
                placeholder: "Type a message...",
                toggleButton: "Toggle toolbar",
                sendButton: "Send message"
            }
        },

        destroy: function() {
            Widget.fn.destroy.call(this);

            if (this.input) {
                this.input.off(NS);
                this.input.remove();
                this.input = null;
            }

            this.element.off(NS);
            this.element.empty();
        },

        _wrapper: function() {
            var styles = ChatMessageBox.styles;
            var options = this.options;
            var messages = options.messages;
            var inputId = "inputId_" + kendo.guid();

            $("<label>")
                .addClass(styles.hidden)
                .html(messages.placeholder)
                .attr("for", inputId)
                .appendTo(this.element);

            this.inputWrapper = this.element
                .addClass(styles.inputWrapper)
                .appendTo(this.element);

            this.input = $("<input type='text'>")
                .addClass(styles.input)
                .attr("id", inputId)
                .attr("placeholder", messages.placeholder)
                .appendTo(this.inputWrapper);

            this.inputSuffix = $("<span></span>")
                .addClass(styles.inputSuffix)
                .appendTo(this.inputWrapper);

            if (options.toolbar && options.toolbar.toggleable && options.toolbar.buttons && options.toolbar.buttons.length) {
                $("<button>")
                    .addClass(styles.button)
                    .addClass(styles.buttonFlat)
                    .addClass(styles.iconButton)
                    .addClass(styles.buttonToggle)
                    .attr({
                        type: "button",
                        title: messages.toggleButton,
                        "aria-label": messages.toggleButton,
                        "aria-controls": options.toolbarId
                    })
                    .append($(TOGGLE_ICON))
                    .appendTo(this.inputSuffix);
            }

            $("<button>")
                .addClass(styles.button)
                .addClass(styles.buttonFlat)
                .addClass(styles.iconButton)
                .addClass(styles.buttonSend)
                .append($(SEND_ICON))
                .appendTo(this.inputSuffix)
                .attr("title", messages.sendButton)
                .attr("aria-label", messages.sendButton);
        },

        _attachEvents: function() {
            var styles = ChatMessageBox.styles;

            this.input
                .on("keydown" + NS, this._keydown.bind(this))
                .on("input" + NS, this._input.bind(this))
                .on("focusout" + NS, this._inputFocusout.bind(this));

            this.element
                .on("click" + NS, DOT + styles.buttonSend, this._buttonClick.bind(this));

            this.element
                .on("click" + NS, DOT + styles.buttonToggle, this._toggleToolbar.bind(this));
        },

        _input: function() {
            var currentValue = this.input.val();
            var start = currentValue.length > 0;

            this._triggerTyping(start);
        },

        _keydown: function(e) {
            var key = e.keyCode;

            switch (key) {
                case keys.ENTER:
                    e.preventDefault();

                    this._sendMessage();
                    break;
                case keys.F10:
                    e.preventDefault();

                    this.trigger("focusToolbar");
                    break;
            }
        },

        _buttonClick: function(e) {
            e.preventDefault();

            this._sendMessage();
        },

        _sendMessage: function() {
            var value = this.input.val();

            if (!value.length) {
                return;
            }

            this._triggerTyping(false);

            var args = {
                text: value
            };

            this.trigger("sendMessage", args);

            this.input.val("");
        },

        _inputFocusout: function() {
            this._triggerTyping(false);
        },

        _triggerTyping: function(start) {
            if (start) {
                if (!this._typing) {
                    this.trigger("typingStart", {});
                    this._typing = true;
                }
            } else {
                if (this._typing) {
                    this.trigger("typingEnd", {});
                    this._typing = false;
                }
            }
        },

        _toggleToolbar: function(ev) {
            this.trigger("toggleToolbar", { originalEvent: ev });
        }
    });

    extend(true, ChatMessageBox, { styles: messageBoxStyles });
    extend(kendo, {
        chat: {
            ChatMessageBox: ChatMessageBox
        }
    });
})(window.kendo.jQuery);

