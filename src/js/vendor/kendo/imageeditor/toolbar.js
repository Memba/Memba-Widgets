/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.toolbar.js";
import "../kendo.dropdownlist.js";

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        extend = $.extend,
        ToolBar = kendo.ui.ToolBar,
        TemplateItem = kendo.toolbar.TemplateItem,

        CLICK = "click",
        DROPDOWNCHANGE = "dropDownChange",
        ACTION = "action";

    var ImageEditorToolBar = ToolBar.extend({
        init: function(element, options) {
            var that = this;

            that._extendOptions(options);

            ToolBar.fn.init.call(that, element, options);

            that._attachEvents();
            that.toggleTools();
        },

        events: ToolBar.fn.events.concat([
            DROPDOWNCHANGE,
            ACTION
        ]),

        defaultTools: {
            open: { type: "button", icon: "upload", name: "open", command: "OpenImageEditorCommand", showText: "overflow" },
            save: { type: "button", icon: "download", name: "save", command: "SaveImageEditorCommand", showText: "overflow", toggleCondition: "canExport" },
            separator: { type: "separator" },
            undo: { type: "button", icon: "undo", name: "undo", command: "UndoImageEditorCommand", showText: "overflow", toggleCondition: "undo" },
            redo: { type: "button", icon: "redo", name: "redo", command: "RedoImageEditorCommand", showText: "overflow", toggleCondition: "redo" },
            separator1: { type: "separator" },
            crop: { type: "button", icon: "crop", name: "crop", command: "OpenPaneImageEditorCommand", options: "crop", showText: "overflow", toggleCondition: "canExport" },
            resize: { type: "button", icon: "image-resize", name: "resize", command: "OpenPaneImageEditorCommand", options: "resize", showText: "overflow", toggleCondition: "canExport" },
            zoomIn: { type: "button", icon: "zoom-in", name: "zoomIn", command: "ZoomImageEditorCommand", showText: "overflow", options: "zoomIn", toggleCondition: "enable" },
            zoomOut: { type: "button", icon: "zoom-out", name: "zoomOut", command: "ZoomImageEditorCommand", showText: "overflow", options: "zoomOut", toggleCondition: "enable" },
            zoomDropdown: { type: "imageEditorZoomDropDown", name: "zoomDropdown", command: "ZoomImageEditorCommand", text: "Zoom options", toggleCondition: "enable" , items: [
                { name: "zoomActualSize", icon: "zoom-actual-size", text: "Show actual size", options: "actualSize" },
                { name: "zoomFitToScreen", icon: "zoom-best-fit", text: "Fit to screen", options: "fitToScreen" }
            ] }
        },

        _attachEvents: function() {
            var that = this;

            that.bind(DROPDOWNCHANGE, that._dropDownChange.bind(that));
            that.bind(CLICK, that._click.bind(that));
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
                    toolOptions, text;

                tool = isBuiltInTool ? tool.name : tool;
                toolOptions = $.isPlainObject(tool) ? tool : extend({}, that.defaultTools[tool]);

                text = messages[toolOptions.name] || toolOptions.text;

                kendo.deepExtend(toolOptions, {
                    id: toolOptions.name + "-" + kendo.guid(),
                    name: toolOptions.name,
                    text: text,
                    attributes: {
                        "aria-label": text,
                        "title": text,
                        "data-command": toolOptions.command,
                        "data-options": toolOptions.options,
                        "data-toggle": toolOptions.toggleCondition
                    },
                    overflow: toolOptions.overflow
                });

                if (toolOptions.type === "imageEditorZoomDropDown") {
                    toolOptions.items = that._extendToolsOptions(toolOptions.items);
                }

                return toolOptions;
            }, that);
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

        _dropDownChange: function(ev) {
            if (!ev.command) {
                return;
            }

            this.action({
                command: ev.command,
                options: ev.options
            });
        },

        action: function(args) {
            this.trigger(ACTION, args);
        },

        toggleTools: function(conditions) {
            var that = this,
                tools = that.element.find("[data-toggle]"),
                focusable = that.element.find(":kendoFocusable").not("[tabindex=-1]");

            tools.each(function(index, elm) {
                var tool = $(elm),
                    widget = null,
                    condition = tool.data("toggle"),
                    toToggle = conditions && conditions[condition];

                if (tool.is("[data-role]")) {
                    widget = kendo.widgetInstance(tool);
                }

                if (widget && widget.enable) {
                    widget.enable(toToggle || false);
                } else {
                    that.enable(tool, toToggle);
                }
            });

            that.element.find(":kendoFocusable").not("[tabindex=-1]").attr("tabindex", -1);
            focusable.attr("tabindex", 0);
        },

        destroy: function() {
            var that = this;

            if (that.zoomDropdown) {
                that.zoomDropdown.destroy();
            }

            ToolBar.fn.destroy.call(this);
        }
    });

    var ImageEditorZoomDropDown = TemplateItem.extend({
        init: function(options, toolbar) {
            var that = this,
                input = $("<input />").attr(options.attributes),
                template = "<span class=\"k-icon k-i-#:icon#\"></span> #:text#";

                that.input = input;

                delete options.attributes["aria-label"];

                that.dropDown = new ui.DropDownList(that.input, {
                    optionLabel: { text: options.text, icon: "" },
                    dataTextField: "text",
                    dataSource: options.items,
                    template: template,
                    change: that._change.bind(that)
                });

                TemplateItem.fn.init.call(this, that.dropDown.wrapper, options, toolbar);

                that.dropDown.list.find(".k-list-optionlabel").hide();

                that.toolbar.zoomDropdown = that;
        },
        _change: function(ev) {
            var that = this;
            that.toolbar.trigger(DROPDOWNCHANGE, {
                command: ev.sender.element.data("command"),
                options: ev.sender.dataItem().options
            });
        },
        destroy: function() {
            this.dropDown.destroy();
        }
    });

    kendo.toolbar.registerComponent("imageEditorZoomDropDown", ImageEditorZoomDropDown);

    extend(kendo.ui, {
        imageeditor: {
            ToolBar: ImageEditorToolBar,
            ZoomDropDown: ImageEditorZoomDropDown
        }
    });

})(window.kendo.jQuery);

