/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";

(function($, undefined) {
    var kendo = window.kendo,
        Observable = kendo.Observable,

        extend = $.extend,

        DOT = ".",
        NS = DOT + "kendoKeyboardManager",
        KEYDOWN = "keydown",
        ACTION = "action";


    var Keyboard = Observable.extend({
        init: function(element) {
            var that = this;

            that.register = {};
            that.element = element;

            that._attachEvents();

            Observable.fn.init.call(that);
        },

        registerShortcut: function(selector, shortcut, options) {
            var that = this;

            if (!that.register[selector]) {
                that.register[selector] = [];
            }

            if (shortcut.keyCode && isNaN(shortcut.keyCode) && shortcut.keyCode.toUpperCase) {
                shortcut.keyCode = shortcut.keyCode.toUpperCase().charCodeAt(0);
            }

            that.register[selector].push({
                shortcut: extend({
                    keyCode: null,
                    ctrlKey: false,
                    shiftKey: false,
                    altKey: false
                }, shortcut),
                options: options
            });

        },

        _attachEvents: function() {
            var that = this,
                handler = that._handler.bind(that);

            that.element.on(KEYDOWN + NS, handler);
        },

        _handler: function(ev) {
            var that = this,
                target = $(ev.target),
                shortcuts, action;

            for (var selector in that.register) {
                if (target.is(selector)) {
                    shortcuts = that.register[selector];
                    action = that._getAction(shortcuts, ev);

                    if (action) {
                        that._trigger(action, ev);
                        break;
                    }
                }
            }
        },

        _trigger: function(action, ev) {
            var that = this,
                target = $(ev.target);

            if (action.command) {
                that.trigger(ACTION, extend({}, ev, {
                    command: action.command,
                    options: extend({}, {
                        target: target
                    }, action.options)
                }));
            }

            if (action.handler) {
                action.handler(ev);
            }
        },

        _getAction: function(shortcuts, ev) {
            var that = this;

            for (var i = 0; i < shortcuts.length; i++) {
                if (that._compareShortcut(shortcuts[i].shortcut, ev)) {
                    return shortcuts[i].options;
                }
            }
        },

        _compareShortcut: function(shortcut, ev) {
            var that = this;

            for (var key in shortcut) {
                var result = false;

                switch (key) {
                    case "ctrlKey":
                        result = shortcut[key] !== that._getShortcutModifier(ev);
                        break;
                    default:
                        result = shortcut[key] !== ev[key];
                        break;
                }

                if (result) {
                    return false;
                }
            }

            return true;
        },

        _getShortcutModifier: function(ev) {
            var mac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            return mac ? ev.metaKey : ev.ctrlKey;
        },

        destroy: function() {
            var that = this;

            that.element.off(NS);
        }
    });

    extend(kendo.ui.taskboard, {
        KeyboardManager: Keyboard
    });

})(window.kendo.jQuery);

