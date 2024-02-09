/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.menu.js";

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        template = kendo.template,
        ContextMenu = kendo.ui.ContextMenu,
        encode = kendo.htmlEncode,

        ACTION = "action";

    var TaskBoardCardMenu = ContextMenu.extend({
        init: function(element, options) {
            var that = this;

            ContextMenu.fn.init.call(that, element, options);

            that._overrideTemplates();
            that._extendItems();

            that.bind("select", that._onSelect.bind(that));
            that.bind("open", that._onOpen.bind(that));
            that.bind("activate", that._focus.bind(that));
        },

        _overrideTemplates: function() {
            this.templates.sprite = ({ icon, spriteCssClass }) => `${(icon || spriteCssClass) ? kendo.ui.icon({ icon: encode(icon || ""), iconClass: encode(spriteCssClass || "") }) : ''}`;
        },

        defaultItems: {
            "editCard": { name: "editCard", text: "Edit card", icon: "pencil", command: "EditCardCommand", rules: "isEditable" },
            "deleteCard": { name: "deleteCard", text: "Delete card", icon: "trash", command: "DeleteCardCommand", rules: "isEditable" }
        },

        events: ContextMenu.fn.events.concat([
            ACTION
        ]),

        _extendItems: function() {
            var that = this,
                items = that.options.items,
                item, isBuiltInTool;

            if (items && items.length) {
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    isBuiltInTool = $.isPlainObject(item) && Object.keys(item).length === 1 && item.name;

                    if (isBuiltInTool) {
                        item = item.name;
                    }

                    if ($.isPlainObject(item)) {
                        that._append(item);
                    } else if (that.defaultItems[item]) {
                        item = that.defaultItems[item];
                        that._append(item);
                    } else if (typeof(item) === "string") {
                        item = { name: item, text: item, spriteCssClass: item, command: item + "Command" };
                        that._append(item);
                    }
                }
            } else {
                for (var key in that.defaultItems) {
                    item = that.defaultItems[key];
                    that._append(item);
                }
            }
        },

        _append: function(item) {
            var that = this;

            that._extendItem(item);

            if (that._validateRules(item)) {
                that.append(item);
            }
        },

        _extendItem: function(item) {
            var that = this,
                messages = that.options.messages,
                attr = {};

            attr[kendo.attr("command")] = item.command;

            if (item.options) {
                attr[kendo.attr("options")] = item.options;
            }

            extend(item, {
                text: messages[item.name],
                icon: item.icon || "",
                spriteCssClass: item.spriteCssClass || "",
                attr: attr,
                uid: kendo.guid()
            });
        },

        _validateRules: function(tool) {
            var that = this,
                states = that.options.states,
                rules = tool.rules ? tool.rules.split(";") : [];

            if (!rules.length) {
                return true;
            }

            for (var i = 0; i < rules.length; i++) {
                if (!states[rules[i]]) {
                    return false;
                }
            }

            return true;
        },

        _onSelect: function(ev) {
            var command = $(ev.item).attr(kendo.attr("command")),
                options = $(ev.item).attr(kendo.attr("options")),
                target = $(ev.target);

            options = typeof(options) === "string" ? { value: options } : options;

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: extend({ target: target }, options)
            });
        },

        _onOpen: function(ev) {
            var menu = ev.sender,
                items = menu.options.items;

            if (!items && $.isEmptyObject(this.defaultItems)) {
                ev.preventDefault();
            }
        },

        _focus: function(ev) {
            if (ev.sender) {
                ev.sender.element.trigger("focus");
            }
        },

        action: function(args) {
            this.trigger(ACTION, args);
        }
    });

    extend(kendo.ui.taskboard, {
        CardMenu: TaskBoardCardMenu
    });

    })(window.kendo.jQuery);

