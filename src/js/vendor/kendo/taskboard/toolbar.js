/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.toolbar.js";

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        ToolBar = kendo.ui.ToolBar,
        Item = kendo.toolbar.Item,

        CLICK = "click",
        TOGGLE = "toggle",
        CLOSE = "close",
        ACTION = "action",
        CHANGE = "change",
        NS = ".taskBoardToolbar";

    var TaskBoardToolbarStyles = {
        searchbox: "k-searchbox k-textbox k-input k-input-md k-rounded-md k-input-solid",
        searchIcon: "k-input-icon k-icon k-i-search",
        searchInput: "k-input-inner"
    };

    var TaskBoardToolBar = ToolBar.extend({
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
            addColumn: { type: "button", text: "Add Column", name: "addColumn", command: "AddColumnCommand", icon: "plus", rules: "isEditable" },
            spacer: { type: "spacer" },
            search: { type: "TaskBoardSearch", text: "Search", name: "search", command: "SearchCommand", icon: "search", overflow: "never", rules: "isSearchable" }
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

            options.navigateOnTab = true;

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
                    attr = {},
                    toolOptions;


                tool = isBuiltInTool ? tool.name : tool;
                toolOptions = $.isPlainObject(tool) ? tool : extend({}, that.defaultTools[tool] || { name: tool, command: tool + "Command", type: "button" });

                if (!that._validateRules(toolOptions)) {
                    return { hidden: true };
                }

                attr[kendo.attr("command")] = toolOptions.command;
                attr[kendo.attr("options")] = toolOptions.options;

                kendo.deepExtend(toolOptions, {
                    id: toolOptions.id || toolOptions.name + "-" + kendo.guid(),
                    name: toolOptions.name,
                    text: messages[toolOptions.name] || toolOptions.name,
                    attributes: extend({
                        "aria-label": messages[toolOptions.name] || toolOptions.name,
                        "title": messages[toolOptions.name]
                    }, attr),
                    overflow: toolOptions.overflow
                });

                if (toolOptions.type === "buttonGroup") {
                    toolOptions.buttons = toolOptions.buttons.map(that._mapButtonGroups.bind(that));
                }

                if (toolOptions.type === "splitButton") {
                    toolOptions.menuButtons = toolOptions.menuButtons.map(that._mapMenuButtons.bind(that));
                }

                return toolOptions;
            }, that);
        },

        _mapButtonGroups: function(button) {
            var that = this,
                messages = that.options.messages,
                attr = {};

            attr[kendo.attr("command")] = button.command;
            attr[kendo.attr("options")] = button.options;

            return kendo.deepExtend(button, {
                attributes: extend({}, button.attributes, {
                    "aria-label": messages[button.name],
                    "title": messages[button.name]
                }, attr)
            });
        },

        _mapMenuButtons: function(button) {
            var that = this,
                messages = that.options.messages,
                attr = {};

            attr[kendo.attr("command")] = button.command;
            attr[kendo.attr("options")] = button.options;

            return kendo.deepExtend(button,{
                text: messages[button.name],
                attributes: extend({}, button.attributes, {
                    "aria-label": messages[button.name],
                    "title": messages[button.name]
                }, attr)
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

        _click: function(ev) {
            var command = $(ev.target).attr(kendo.attr("command")),
                options = $(ev.target).attr(kendo.attr("options"));

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: options
            });
        },

        _change: function(ev) {
            var command = $(ev.target).attr(kendo.attr("command")),
                options = $(ev.target).attr(kendo.attr("options"));

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
            if (this.search) {
                this.search.destroy();
            }

            ToolBar.fn.destroy.call(this);
        }
    });

    var SearchTool = Item.extend({
        init: function(options, toolbar) {
            var that = this,
                styles = TaskBoardToolBar.styles,
                element = $("<span class='" + styles.searchbox + "'></span>"),
                icon = $("<span class='" + styles.searchInputIcon + "'></span>"),
                input = $("<input class='" + styles.searchInput + "' autocomplete='off' />");

            that.element = element;
            that.input = input;
            that.icon = icon;
            that.options = options;
            that.options.type = "taskBoardSearch";
            that.toolbar = toolbar;

            that.attributes();
            that.renderIcon();
            that.addUidAttr();
            that.addIdAttr();
            that.addOverflowAttr();

            that.input.attr({
                placeholder: that.options.text,
                title: that.options.text
            });

            that.element.append(icon).append(that.input);

            that._bindEvents();
            that.toolbar.search = that;
        },
        attributes: function() {
            if (this.options.attributes) {
                this.input.attr(this.options.attributes);
            }
        },
        renderIcon: function() {
            if (this.options.icon) {
                this.icon.addClass(TaskBoardToolBar.styles.searchIcon);
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

    kendo.toolbar.registerComponent("TaskBoardSearch", SearchTool);


    extend(kendo.ui, {
        taskboard: {
            ToolBar: TaskBoardToolBar
        }
    });

    extend(true, kendo.ui.taskboard.ToolBar, { styles: TaskBoardToolbarStyles });

})(window.kendo.jQuery);

