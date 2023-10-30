/**
 * Kendo UI v2023.3.1010 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";
import "../kendo.html.button.js";

(function($, undefined) {

    var kendo = window.kendo;
    var Widget = kendo.ui.Widget;
    var extend = $.extend;
    var DOT = ".";
    var NS = ".kendoChat";
    var keys = kendo.keys;

    var messageBoxStyles = {
        input: "k-input-inner",
        inputWrapper: "k-textbox k-input k-input-lg k-input-solid",
        button: "k-button",
        buttonFlat: "k-button-lg k-button-flat k-button-flat-base",
        iconButton: "k-icon-button",
        buttonIcon: "k-button-icon",
        buttonSend: "k-chat-send",
        buttonSendIcon: "paper-plane",
        buttonToggle: "k-button-toggle",
        buttonToggleIcon: "more-horizontal",
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

            this.inputWrapper = this.element
                .addClass(styles.inputWrapper)
                .appendTo(this.element);

            this.input = $("<input type='text'>")
                .addClass(styles.input)
                .attr("id", inputId)
                .attr("aria-label", messages.placeholder)
                .attr("placeholder", messages.placeholder)
                .appendTo(this.inputWrapper);

            this.inputSuffix = $("<span></span>")
                .addClass(styles.inputSuffix)
                .appendTo(this.inputWrapper);

            if (options.toolbar && options.toolbar.toggleable && options.toolbar.buttons && options.toolbar.buttons.length) {
                $(kendo.html.renderButton(`<button class="${styles.buttonToggle}" title="${messages.toggleButton}" aria-label="${messages.toggleButton}" aria-controls="${options.toolbarId}"></button>`,
                    {
                        icon: styles.buttonToggleIcon,
                        fillMode: "flat",
                        size: "large"
                    }))
                .appendTo(this.inputSuffix);
            }

            $(kendo.html.renderButton(`<button class="${styles.buttonSend}" title="${messages.sendButton}" aria-label="${messages.sendButton}"></button>`,
                {
                    icon: styles.buttonSendIcon,
                    fillMode: "flat",
                    size: "large"
                }))
            .appendTo(this.inputSuffix);
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

