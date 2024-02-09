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
        ui = kendo.ui,
        ContextMenu = ui.ContextMenu,
        extend = $.extend,
        encode = kendo.htmlEncode;

    var ACTION = "action";

    var GridContextMenu = ContextMenu.extend({
        init: function(element, options) {
            var that = this;

            ContextMenu.fn.init.call(that, element, options);

            that._overrideTemplates();
            that._extendItems();

            that.bind("select", that._onSelect.bind(that));
            that.bind("open", that._onOpen.bind(that));
        },

        _overrideTemplates: function() {
            this.templates.sprite = ({ icon, spriteCssClass }) => `${(icon || spriteCssClass) ? kendo.ui.icon({ icon: encode(icon || ""), iconClass: encode(spriteCssClass || "") }) : ''}`;
        },

        defaultItems: {
            "separator": { name: "separator", separator: true },
            "create": { name: "create", text: "Add", icon: "plus", command: "AddCommand", rules: "isEditable" },
            "edit": { name: "edit", text: "Edit", icon: "pencil", command: "EditCommand", rules: "isEditable" },
            "destroy": { name: "destroy", text: "Delete", icon: "trash", command: "DeleteCommand", rules: "isEditable" },
            "select": { name: "select", text: "Select", icon: "table-body", rules: "isSelectable", items: [
                { name: "selectRow", text: "Row", icon: "table-row-groups", command: "SelectRowCommand" },
                { name: "selectAllRows", text: "All rows", icon: "grid", command: "SelectAllRowsCommand" },
                { name: "clearSelection", text: "Clear selection", icon: "table-unmerge", softRules: "hasSelection", command: "ClearSelectionCommand" },
            ] },
            "copySelection": { name: "copySelection", text: "Copy selection", icon: "page-header-section", rules: "isSelectable", softRules: "hasSelection", command: "CopySelectionCommand", options: "withHeaders" },
            "copySelectionNoHeaders": { name: "copySelectionNoHeaders", text: "Copy selection (No Headers)", icon: "file-txt", rules: "isSelectable", softRules: "hasSelection", command: "CopySelectionCommand" },
            "paste": { name: "paste", text: "Paste (use CTRL/⌘ + V)", rules: "allowPaste", softRules: "alwaysDisabled", icon: "clipboard" },
            "reorderRow": { name: "reorderRow", text: "Reorder row", icon: "caret-alt-expand", rules: "isRowReorderable", softRules: "isSorted", items: [
                { name: "reorderRowUp", text: "Up", icon: "caret-alt-up", command: "ReorderRowCommand", options: "dir:up" },
                { name: "reorderRowDown", text: "Down", icon: "caret-alt-down", command: "ReorderRowCommand", options: "dir:down" },
                { name: "reorderRowTop", text: "Top", icon: "caret-alt-to-top", command: "ReorderRowCommand", options: "dir:top" },
                { name: "reorderRowBottom", text: "Bottom", icon: "caret-alt-to-bottom", command: "ReorderRowCommand", options: "dir:bottom" }
            ] },
            "exportPDF": { name: "exportPDF", text: "Export to PDF", icon: "file-pdf", command: "ExportPDFCommand" },
            "exportExcel": { name: "exportExcel", text: "Export to Excel", icon: "file-excel", items: [
                { name: "exportToExcelAll", text: "All", command: "ExportExcelCommand" },
                { name: "exportToExcelSelection", text: "Selection", command: "ExportExcelCommand", softRules: "hasSelection", options: "selection,withHeaders" },
                { name: "exportToExcelSelectionNoHeaders", text: "Selection (No Headers)", softRules: "hasSelection", command: "ExportExcelCommand", options: "selection" }
            ] },
            "sortAsc": { name: "sortAsc", text: "Sort Ascending", icon: "sort-asc-small", rules: "isSortable", command: "SortCommand", options: "dir:asc" },
            "sortDesc": { name: "sortDesc", text: "Sort Descending", icon: "sort-desc-small", rules: "isSortable", command: "SortCommand", options: "dir:desc" },
            "moveGroupPrevious": { name: "moveGroupPrevious", text: "Move previous", icon: "arrow-left", rules: "isGroupable", softRules: "canMoveGroupPrev", command: "MoveGroupCommand", options: "dir:prev" },
            "moveGroupNext": { name: "moveGroupNext", text: "Move next", icon: "arrow-right", rules: "isGroupable", softRules: "canMoveGroupNext", command: "MoveGroupCommand", options: "dir:next" }
            // "filter": { name: "filter", text: "Filter", icon: "filter", attr: { [kendo.attr("is-filter")]: true }, items: [
            //     { content: '<div class="k-columnmenu-item-wrapper"><div class="k-columnmenu-item-content k-column-menu-filter"><div class="k-filterable"></div></div></div>' }
            // ] },
        },

        events: ContextMenu.fn.events.concat([
            ACTION
        ]),

        _onSelect: function(ev) {
            var command = $(ev.item).data("command");
            var options = $(ev.item).data("options");
                options = options ? options.split(",")
                .map(val => {
                    if (val.indexOf(":") > -1) {
                        var [key, val] = val.split(":");
                        return { [key || "_"]: val };
                    }

                    return { [val]: true };
                })
                .reduce((acc, v) => Object.assign(acc, v), {}) : {};

            var target = $(ev.target);

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: Object.assign(options, { target: target })
            });
        },

        _onOpen: function(ev) {
            var menu = ev.sender,
                items = menu.options.items,
                elTarget = $(ev.event ? ev.event.target : null);

            if ((!items && $.isEmptyObject(this.defaultItems)) || elTarget.closest(".k-grid-column-menu").length) {
                ev.preventDefault();
                return;
            }

            this._toggleSeparatorVisibility();

            menu.element.find(`[${kendo.attr('soft-rules')}]`).each((i, item) => {
                var rules = $(item).attr(kendo.attr('soft-rules')).split(";");
                menu.enable(item, this._validateSoftRules(rules, elTarget));
            });
        },

        _toggleSeparatorVisibility: function() {
            var that = this,
                items = that.element.find(".k-item.k-separator").filter((i, item) => {
                    var prev = $(item).prev(".k-item:not(.k-separator)");
                    var next = $(item).next(".k-item:not(.k-separator)");

                    return !(prev.length && next.length);
                });

            items.hide();
        },

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

        _extendItem: function(item) {
            var that = this,
                messages = that.options.messages,
                attr = item.attr || {};

            if (item.command) {
                attr[kendo.attr("command")] = item.command;
            }

            if (item.options) {
                attr[kendo.attr("options")] = item.options;
            }

            if (item.softRules) {
                attr[kendo.attr("soft-rules")] = item.softRules;
            }

            if (item.items) {
                for (var j = 0; j < item.items.length; j++) {
                    item.items.forEach(subItem => {
                        that._extendItem(subItem);
                    });
                }
            }

            extend(item, {
                text: messages.commands[item.name],
                icon: item.icon || "",
                spriteCssClass: item.spriteCssClass || "",
                attr: attr,
                uid: kendo.guid()
            });
        },

        _validateSoftRules: function(rules, target) {
            var that = this;

            if (!rules || !(rules && rules.length)) {
                return true;
            }

            for (var i = 0; i < rules.length; i++) {
                if (!this._readState(rules[i], target)) {
                    return false;
                }
            }

            return true;
        },

        _validateRules: function(tool) {
            var that = this,
                rules = tool.rules ? tool.rules.split(";") : [];

            if (!rules.length) {
                return true;
            }

            for (var i = 0; i < rules.length; i++) {
                if (!this._readState(rules[i])) {
                    return false;
                }
            }

            return true;
        },

        _readState: function(state, target) {
            var that = this,
                states = that.options.states;

            if (kendo.isFunction(states[state])) {
                return states[state](target);
            } else {
                return states[state];
            }
        },

        _append: function(item) {
            var that = this;

            that._extendItem(item);

            if (that._validateRules(item)) {
                that.append(item);
            }
        },

        action: function(args) {
            this.trigger(ACTION, args);
        }
    });

    kendo.ui.grid = kendo.ui.grid || {};

    extend(kendo.ui.grid, {
        ContextMenu: GridContextMenu
    });
})(window.kendo.jQuery);