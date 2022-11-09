/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.toolbar.js";
import "../kendo.combobox.js";
import "./pager.js";

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        ACTION = "action",
        KEYDOWN = "keydown",
        CHANGE = "change",
        COMMAND = "command",
        DOT = ".",
        Item = kendo.toolbar.Item,
        TemplateItem = kendo.toolbar.TemplateItem,
        ToolBar = kendo.ui.ToolBar,
        PREDEFINED_ZOOM_VALUES = {
            auto: "auto",
            actual: "actual",
            fitToWidth: "fitToWidth",
            fitToPage: "fitToPage"
        },
        styles = {
            zoomOutIcon: "k-i-zoom-out",
            zoomInIcon: "k-i-zoom-in"
        };

    var ZOOM_COMBOBOX_TEMPLATE = kendo.template('<select title="#=zoomLevel#" aria-label="#=zoomLevel#">' +
        '#for(var zoomIndex in zoomLevels){#' +
            '# var zoomLevel = zoomLevels[zoomIndex]; #' +
            '<option value="#= zoomLevel.percent || (zoomLevel + "%") #">${zoomLevel.text ? zoomLevel.text : zoomLevel + "%"}</option>' +
        '#}#' +
    '</select>');

    var DefaultTools = {
        pager: {
            type: "pager",
            overflow: "never",
            command: "PageChangeCommand"
        },
        spacer: { type: "spacer" },
        zoomInOut: {
            type: "buttonGroup",
            attributes: { "class": "k-zoom-in-out-group" },
            buttons: [
                { type: "button", icon: "zoom-out", name: "zoomOut", command: "ZoomCommand", showText: "overflow", options: "zoomOut" },
                { type: "button", icon: "zoom-in", name: "zoomIn", command: "ZoomCommand", showText: "overflow", options: "zoomIn" },
            ]
        },
        zoom: {
            type: "zoom",
            command: "ZoomCommand",
            combobox: { zoomLevels: [50, 100, 150, 200, 300, 400] },
            enable: false,
            overflow: "never"
        },
        toggleSelection: {
            type: "buttonGroup",
            attributes: { "class": "k-toggle-selection-group" },
            buttons: [
                {
                    togglable: true,
                    text: "Enable Selection",
                    command: "EnableSelectionCommand",
                    icon: "cursor",
                    showText: "overflow",
                    name: "toggleSelection",
                    group: "toggle-pan"
                }, {
                    togglable: true,
                    text: "Enable Panning",
                    command: "EnablePanCommand",
                    icon: "hand",
                    showText: "overflow",
                    name: "togglePan",
                    group: "toggle-pan",
                    selected: true
                }
            ]
        },
        spacer2: { type: "spacer" },
        search: {
            type: "button",
            text: "Search",
            command: "OpenSearchCommand",
            icon: "search",
            name: "search",
            showText: "overflow",
            enable: false
        },
        open: {
            type: "button",
            text: "Open",
            showText: "overflow",
            name: "open",
            icon: "folder-open",
            command: "OpenCommand"
        },
        download: {
            type: "button",
            text: "Download",
            showText: "overflow",
            name: "download",
            icon: "download",
            command: "DownloadCommand",
            enable: false
        },
        print: {
            type: "button",
            text: "Print",
            showText: "overflow",
            name: "print",
            icon: "print",
            command: "PrintCommand",
            enable: false
        }
    };

    var AllTools = extend({}, DefaultTools, {
        exportAs: { type: "button", text: "Export", showText: "overflow", name: "exportAs", icon: "image-export", command: "ExportCommand" }
    });

    var ToolbarPager = Item.extend({
        init: function(options, toolbar) {
            var pagerElement = $("<div />");

            this.options = extend(true, options, toolbar.options.pager);

            this.toolbar = toolbar;

            this.toolbar.pager = new kendo.pdfviewer.Pager(pagerElement, extend({}, options, {
                change: this._change.bind(this)
            }));

            this.element = pagerElement;
            this.element.on(KEYDOWN, this._keydown.bind(this));

            this.attributes();
            this.addUidAttr();
            this.addOverflowAttr();
        },
        _change: function(e) {
            if (this.options.change && this.options.change(e.page)) {
                return;
            }

            this.toolbar.action({
                command: "PageChangeCommand",
                options: {
                    value: e.page
                }
            });
        },
        _keydown: function(e) {
            var that = this,
                target = $(e.target),
                keyCode = e.keyCode,
                children = that.element.find(":kendoFocusable"),
                targetIndex = children.index(target),
                keys = kendo.keys;

            if (keyCode === keys.RIGHT && children[targetIndex + 1]) {
                children[targetIndex + 1].focus();
                e.preventDefault();
                e.stopPropagation();
            } else if (keyCode === keys.LEFT && children[targetIndex - 1]) {
                children[targetIndex - 1].focus();
                e.preventDefault();
                e.stopPropagation();
            }
        }
    });

    kendo.toolbar.registerComponent("pager", ToolbarPager);

    var ToolBarZoom = Item.extend({
        init: function(options, toolbar) {
            this.options = extend(true, options, {
                messages: toolbar.options.messages.zoom
            });

            TemplateItem.fn.init.call(this, "", options, toolbar);

            this.toolbar.zoom = this;

            if (toolbar.options.scale) {
                this._initValue = toolbar.options.scale * 100 + "%";
            }

            if (this.options.combobox) {
                this._buildComboBox();
            }

            this.enable(options.enable);
        },

        _buildComboBox: function() {
            var that = this,
                combobox,
                messages = that.options.messages,
                comboOptions = that.options.combobox,
                zoomLevels = [{
                    percent: PREDEFINED_ZOOM_VALUES.auto,
                    text: messages.autoWidth
                }, {
                    percent: PREDEFINED_ZOOM_VALUES.actual,
                    text: messages.actualWidth
                }, {
                    percent: PREDEFINED_ZOOM_VALUES.fitToWidth,
                    text: messages.fitToWidth
                }, {
                    percent: PREDEFINED_ZOOM_VALUES.fitToPage,
                    text: messages.fitToPage
                }];

            zoomLevels = zoomLevels.concat(comboOptions.zoomLevels);

            combobox = $(ZOOM_COMBOBOX_TEMPLATE({
                zoomLevels: zoomLevels,
                zoomLevel: messages.zoomLevel
            }));

            if (!kendo.support.mobileOS) {
                combobox = combobox.kendoComboBox(extend({
                    autoWidth: true,
                    clearButton: false,
                    value: that._initValue
                }, comboOptions)).getKendoComboBox();

                that.element.append(combobox.wrapper);
                that.combobox = combobox;
                that._currentValue = combobox.value();
            } else {
                that.element.append(combobox);
            }

            combobox.bind(CHANGE, kendo.throttle(that.change.bind(that), 300));
        },

        change: function(e) {
            var value = e.sender ? e.sender.value() : e.target.value,
                parsedValue;

            if (value.toString().match(/^[0-9]+%?$/)) {
                parsedValue = parseInt(value.replace('%', ''), 10) / 100;
            } else if (!PREDEFINED_ZOOM_VALUES[value]) {
                if (this.combobox) {
                    this.combobox.value(this._currentValue);
                }
                e.preventDefault();
                return;
            }

            this._currentValue = value;
            this.toolbar.action({
                command: "ZoomCommand",
                options: {
                    scale: parsedValue || value
                }
            });
        },

        enable: function(value) {
            var element = this.element;

            element.find(".k-button, select").toggleClass("k-disabled", !value);

            if (this.combobox) {
                this.combobox.enable(value);
            }
        },

        destroy: function() {
            if (this.combobox) {
                this.combobox.destroy();
            }
        }
    });

    kendo.toolbar.registerComponent("zoom", ToolBarZoom);

    var ViewerToolBar = ToolBar.extend({
        init: function(element, options) {
            var that = this;
            var items = options.items && options.items.length ? options.items : Object.keys(DefaultTools);

            that.options = options;

            options.items = that._updateItems(items);

            ToolBar.fn.init.call(that, element, options);

            that.bind({
                click: that._click,
                toggle: that._click
            });

            options.viewer.bind({
                update: that._update.bind(that)
            });
        },
        events: [
            ACTION
        ],
        _updateItems: function(items) {
            var that = this;
            var messages = this.options.messages;

            return items.map(function(tool) {
                var isBuiltInTool = $.isPlainObject(tool) && Object.keys(tool).length === 1 && tool.name;
                tool = isBuiltInTool ? tool.name : tool;
                var toolOptions = $.isPlainObject(tool) ? tool : AllTools[tool];
                var options;
                var toolName = toolOptions.name;

                if (tool.name === "zoomIn" || tool.name === "zoomOut") {
                    tool.text = that.options.messages.zoom[tool.name];
                } else if (tool === 'zoom' || tool.name === "zoom" || tool.type === "zoom") {
                    if ($.isPlainObject(tool)) {
                        tool.overflow = "never";
                    } else {
                        tool = {
                            overflow: "never"
                        };
                    }
                }

                if (toolOptions.type === "buttonGroup") {
                    toolOptions.buttons = that._updateItems(toolOptions.buttons);
                } else if (toolOptions.type !== "pager") {
                    options = {
                        name: toolName,
                        attributes: {
                            "aria-label": messages[toolName],
                            "title": messages[toolName],
                            "data-command": toolOptions.command
                        },
                        overflow: toolOptions.overflow,
                        fillMode: "flat"
                    };
                } else {
                    options = {
                        overflow: "never"
                    };
                }

                if (toolOptions.text) {
                    options.text = messages[toolOptions.name] || toolOptions.text;
                }

                kendo.deepExtend(toolOptions, options);

                return toolOptions;
            });
        },
        _click: function(e) {
            var button = $(e.target).closest(".k-button"),
                command = button.data(COMMAND),
                zoomIn = button.find(DOT + styles.zoomInIcon).length > 0,
                zoomOut = button.find(DOT + styles.zoomOutIcon).length > 0,
                options;

            if (!command) {
                return;
            }

            options = $.extend({}, e.options, {
                zoomIn: zoomIn,
                zoomOut: zoomOut,
                updateComboBox: zoomIn || zoomOut
            });

            this.action({
                command: command,
                options: options
            });
        },
        _update: function(e) {
            var pageOptions = {
                    page: e.page || 1,
                    total: e.total || 1
                },
                focusable = this.element.find(":kendoFocusable").not("[tabindex=-1]");

            if (this.zoom) {
                this.zoom.enable(!e.isBlank);
                if (e.action === "zoom") {
                    this._updateZoomComboBox(e.zoom);
                }
            }

            if ((e.action === "pagechange" || e.isBlank) && this.pager) {
                this.pager.setOptions(pageOptions);
            }

            this.enable(this.wrapper.find(".k-toggle-selection-group"), !e.isBlank);
            this.enable(this.wrapper.find(".k-zoom-in-out-group"), !e.isBlank);

            this.enable(this.wrapper.find("[data-command='OpenSearchCommand']"), !e.isBlank);
            this.enable(this.wrapper.find("[data-command='DownloadCommand']"), !e.isBlank);
            this.enable(this.wrapper.find("[data-command='PrintCommand']"), !e.isBlank);

            this.element.find(":kendoFocusable").not("[tabindex=-1]").attr("tabindex", -1);
            focusable.attr("tabindex", 0);
        },
        _updateZoomComboBox: function(value) {
            var isPredefined = value === PREDEFINED_ZOOM_VALUES.auto ||
                                value === PREDEFINED_ZOOM_VALUES.actual ||
                                value === PREDEFINED_ZOOM_VALUES.fitToPage ||
                                value === PREDEFINED_ZOOM_VALUES.fitToWidth;

            if (!isPredefined) {
                value = Math.round(value * 100) + '%';
            }

            if (this.zoom && this.zoom.combobox) {
                this.zoom._currentValue = value;
                this.zoom.combobox.value(value);
            }
        },
        action: function(args) {
            this.trigger(ACTION, args);
        },
        destroy: function() {
            if (this.pager) {
                this.pager.destroy();
            }

            if (this.zoom) {
                this.zoom.destroy();
            }
            ToolBar.fn.destroy.call(this);
        }
    });


    extend(kendo.pdfviewer, {
        Toolbar: ViewerToolBar,
        DefaultTools: DefaultTools
    });
})(window.kendo.jQuery);

