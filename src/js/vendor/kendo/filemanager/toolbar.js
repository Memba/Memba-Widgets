/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.toolbar.js";
import "../kendo.switch.js";

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        ToolBar = kendo.ui.ToolBar,
        Item = kendo.toolbar.Item,
        TemplateItem = kendo.toolbar.TemplateItem,

        CLICK = "click",
        TOGGLE = "toggle",
        CLOSE = "close",
        ACTION = "action",
        CHANGE = "change",
        NS = ".fileManagerToolbar";

    var FileManagerToolBar = ToolBar.extend({
        init: function(element, options) {
            var that = this;

            that._extendOptions(options);

            ToolBar.fn.init.call(that, element, options);

            that._attachEvents();
        },

        events: ToolBar.fn.events.concat([
            ACTION
        ]),

        defaultTools: {
            createFolder: { type: "button", text: "New Folder", name: "createFolder", command: "CreateFolderCommand", rules: "{ \"remote\": true }" },
            upload: { type: "button", text: "Upload", name: "upload", command: "OpenDialogCommand", options: "{ \"type\": \"uploadDialog\" }", rules: "{ \"remote\": true }" },
            sortDirection: { type: "buttonGroup", text: "Sort Direction", name: "sortDirection",
                buttons: [
                    { name: "sortDirectionAsc", icon: "sort-asc-sm", togglable: true, group: "sortDirection", command: "SortCommand", options: "{ \"dir\": \"asc\" }", selected: true },
                    { name: "sortDirectionDesc", icon: "sort-desc-sm", togglable: true, group: "sortDirection", command: "SortCommand", options: "{ \"dir\": \"desc\" }" }
                ]
            },
            sortField: { type: "splitButton", text: "Sort By", name: "sortField", command: "SortCommand", menuButtons: [
                { name: "nameField", text: "Name", options: "{\"field\": \"name\"}", command: "SortCommand" },
                { name: "typeField", text: "Type", options: "{\"field\": \"extension\"}", command: "SortCommand" },
                { name: "sizeField", text: "Size", options: "{\"field\": \"size\"}", command: "SortCommand" },
                { name: "dateCreatedField", text: "Date created", options: "{\"field\": \"createdUtc\"}", command: "SortCommand" },
                { name: "dateModifiedField", text: "Date modified", options: "{\"field\": \"modifiedUtc\"}", command: "SortCommand" }
            ] },
            changeView: { type: "buttonGroup", text: "Change View", name: "changeView",
                buttons: [
                    { name: "gridView", icon: "grid-layout", togglable: true, group: "changeView", command: "ChangeViewCommand", options: "grid" },
                    { name: "listView", icon: "grid", togglable: true, group: "changeView", command: "ChangeViewCommand", options: "list" }
                ]
            },
            spacer: { type: "spacer" },
            details: { type: "fileManagerDetailsToggle", text: "View Details", name: "details", overflow: "never", command: "TogglePaneCommand", options: "{ \"type\": \"preview\" }" },
            search: { type: "fileManagerSearch", text: "Search", name: "search", command: "SearchCommand", icon: "search", overflow: "never", options: "{ \"field\": \"name\", \"operator\": \"startswith\" }" }
        },

        _attachEvents: function() {
            var that = this;

            that.bind(TOGGLE, that._click.bind(that));
            that.bind(CLOSE, that._click.bind(that));
            that.bind(CLICK, that._click.bind(that));
            that.bind(CHANGE, that._change.bind(that));
        },

        _extendOptions: function(options) {
            var that = this,
                tools = options.items ? options.items : Object.keys(that.defaultTools);

            that.options = options;

            that.options.items = that._extendToolsOptions(tools);
        },

        _extendToolsOptions: function(tools) {
            var that = this,
                messages = that.options.messages;

            if (!tools.length) {
                return;
            }

            return tools.map(function(tool) {
                var isBuiltInTool = $.isPlainObject(tool) && Object.keys(tool).length === 1 && tool.name,
                    toolOptions, toolRules, attributes;

                tool = isBuiltInTool ? tool.name : tool;
                toolOptions = $.isPlainObject(tool) ? tool : extend({}, that.defaultTools[tool]);
                toolRules = toolOptions.rules ? JSON.parse(toolOptions.rules) : {};
                attributes = {
                    "aria-label": messages[toolOptions.name],
                    "title": messages[toolOptions.name],
                    "data-command": toolOptions.command,
                    "data-options": toolOptions.options
                };

                if (toolOptions.type === "fileManagerDetailsToggle") {
                    delete attributes["aria-label"];
                }

                kendo.deepExtend(toolOptions, {
                    id: toolOptions.name + "-" + kendo.guid(),
                    name: toolOptions.name,
                    text: messages[toolOptions.name],
                    attributes: attributes,
                    overflow: toolOptions.overflow
                });

                if (toolOptions.type === "buttonGroup") {
                    delete toolOptions.attributes["aria-label"];
                    toolOptions.buttons = toolOptions.buttons.map(that._mapButtonGroups.bind(that));
                }

                if (toolOptions.type === "splitButton") {
                    toolOptions.menuButtons = toolOptions.menuButtons.map(that._mapMenuButtons.bind(that));
                }

                if (toolRules.remote && that.options.filemanager.dataSource.isLocalBinding) {
                    toolOptions.hidden = true;
                }

                return toolOptions;
            }, that);
        },

        _mapButtonGroups: function(button) {
            var that = this,
                messages = that.options.messages;

            if (button.group === "changeView" && button.options === that.options.filemanager.options.initialView) {
                button.selected = true;
            }

            return kendo.deepExtend(button,{
                attributes: extend({}, button.attributes, {
                    "aria-label": messages[button.name],
                    "title": messages[button.name],
                    "data-command": button.command,
                    "data-options": button.options
                })
            });
        },

        _mapMenuButtons: function(button) {
            var that = this,
                messages = that.options.messages;

            return kendo.deepExtend(button,{
                text: messages[button.name],
                attributes: extend({}, button.attributes, {
                    "aria-label": messages[button.name],
                    "title": messages[button.name],
                    "data-command": button.command,
                    "data-options": button.options
                })
            });
        },

        _click: function(ev) {
            var command = $(ev.target).data("command"),
                options = $(ev.target).data("options");

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: options
            });
        },

        _change: function(ev) {
            var command = $(ev.target).data("command"),
                options = $(ev.target).data("options");

            options = extend({}, options, { value: $(ev.target).val() });

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: options
            });
        },

        isToolEnabled: function(toolName) {
            var that = this,
                options = that.options,
                found = false;

            for (var i = 0; i < options.items.length; i++) {
                if (options.items[i].name == toolName) {
                    found = true;
                    break;
                }
            }

            return options.items[toolName] || found;
        },

        action: function(args) {
            this.trigger(ACTION, args);
        },

        destroy: function() {
            if (this.fileManagerSearch) {
                this.fileManagerSearch.destroy();
            }

            ToolBar.fn.destroy.call(this);
        }
    });

    var SearchTool = TemplateItem.extend({
        init: function(options, toolbar) {
            var that = this,
                input = $("<input class='k-input-inner' autocomplete='off' />"),
                icon = $("<span class='k-input-icon k-icon k-i-search'/>"),
                inputWrapper = $('<span class="k-searchbox k-input k-input-md k-rounded-md k-input-solid"></span>');

            that.input = input;
            that.icon = icon;

            TemplateItem.fn.init.call(this, inputWrapper, options, toolbar);

            that.options.type = "fileManagerSearch";

            that.renderIcon();

            inputWrapper.append(icon).append(input);

            that.input.attr({
                placeholder: that.options.text,
                title: that.options.text
            });

            that._bindEvents();
            that.toolbar.fileManagerSearch = that;
        },
        attributes: function() {
            if (this.options.attributes) {
                this.input.attr(this.options.attributes);
            }
        },
        renderIcon: function() {
            if (this.options.icon) {
                this.icon.addClass("k-icon k-i-" + this.options.icon);
            }
        },
        _bindEvents: function() {
            this._inputHandler = this._input.bind(this);
            this.input.on("input" + NS, this._inputHandler);
        },
        _input: function(ev) {
            this.toolbar.trigger(CHANGE, { target: ev.target });
        },
        destroy: function() {
            this.element.off(NS);
        }
    });

    kendo.toolbar.registerComponent("fileManagerSearch", SearchTool);

    var FileManagerDetailsToggle = Item.extend({
        init: function(options, toolbar) {
            var that = this,
                element = $("<div class='k-filemanager-details-toggle'></div>"),
                label = $("<label>" + options.text + "</label>"),
                switchElement = $("<input title='" + options.text + "' />");

            that.element = element;
            that.input = switchElement;
            that.label = label;
            that.options = options;
            that.toolbar = toolbar;

            that.attributes();
            that.addUidAttr();
            that.addIdAttr();
            that.addOverflowAttr();

            that.element.append(that.label);
            that.element.append(that.input);

            that.input.attr("aria-label", options.text);

            that.switchInstance = new kendo.ui.Switch(that.input, {
                change: that._change.bind(that),
                messages: {
                    checked: toolbar.options.messages.detailsChecked,
                    unchecked: toolbar.options.messages.detailsUnchecked
                }
            });

            that.label.on(CLICK + NS, that._click.bind(that));

            that.toolbar.fileManagerDetailsToggle = that;
        },
        _change: function(ev) {
            this.toolbar.trigger(CHANGE, { target: ev.sender.wrapper.parent() });
        },
        _click: function(ev) {
            this.switchInstance.toggle();

            this.toolbar.trigger(CHANGE, { target: $(ev.target).parent() });
        },
        destroy: function() {
            this.element.off(NS);
        }
    });

    kendo.toolbar.registerComponent("fileManagerDetailsToggle", FileManagerDetailsToggle);

    extend(kendo.ui.filemanager, {
        ToolBar: FileManagerToolBar
    });

})(window.kendo.jQuery);

