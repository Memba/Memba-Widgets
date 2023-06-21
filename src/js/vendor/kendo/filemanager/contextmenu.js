/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
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

        ACTION = "action";

    var FileManagerContextMenu = ContextMenu.extend({
        init: function(element, options) {
            var that = this;

            ContextMenu.fn.init.call(that, element, options);

            that._overrideTemplates();
            that._restrictDefaultItems();
            that._extendItems();

            that.bind("select", that._onSelect.bind(that));
            that.bind("open", that._onOpen.bind(that));
        },

        _overrideTemplates: function() {
            this.templates.sprite = template((spriteCssClass) => `${spriteCssClass ? `<span class="${spriteCssClass}"></span>` : ''}`);
        },

        _restrictDefaultItems: function() {
            var that = this;

            if (that.options.isLocalBinding) {
                that.defaultItems = {};
            }
        },

        defaultItems: {
            "rename": { text: "Rename", spriteCssClass: "k-icon k-i-pencil", command: "RenameCommand" },
            "delete": { text: "Delete", spriteCssClass: "k-icon k-i-trash", command: "DeleteCommand" }
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

                    if ($.isPlainObject(item) ) {
                        that._extendItem(item);
                        that.append(item);
                    } else if (that.defaultItems[item]) {
                        item = that.defaultItems[item];
                        that._extendItem(item);
                        that.append(item);
                    }
                }
            } else {
                for (var key in that.defaultItems) {
                    item = that.defaultItems[key];
                    that._extendItem(item);
                    that.append(item);
                }
            }
        },

        _extendItem: function(item) {
            var that = this,
                messages = that.options.messages;

            extend(item, {
                text: messages[item.text],
                spriteCssClass: item.spriteCssClass || "",
                attr: {
                    "data-command": item.command
                }
            });
        },

        _onSelect: function(ev) {
            var command = $(ev.item).data("command");
            var target = $(ev.target);

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: { target: target }
            });
        },

        _onOpen: function(ev) {
            var menu = ev.sender,
                items = menu.options.items;

            if (!items && $.isEmptyObject(this.defaultItems)) {
                ev.preventDefault();
            }
        },

        action: function(args) {
            this.trigger(ACTION, args);
        }
    });

    extend(kendo.ui.filemanager, {
        ContextMenu: FileManagerContextMenu
    });

    })(window.kendo.jQuery);

