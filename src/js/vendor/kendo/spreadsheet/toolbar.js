/**
 * Kendo UI v2023.1.314 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.toolbar.js";
import "../kendo.colorpicker.js";
import "../kendo.combobox.js";
import "../kendo.dropdownlist.js";
import "../kendo.popup.js";
import "./borderpalette.js";
import "../kendo.icons.js";

(function(kendo) {
    var $ = kendo.jQuery;

    function getDefaultToolElement(firstIconName) {
        return `<button role="button">${kendo.ui.icon({ icon: firstIconName, iconClass: "k-button-icon" })}<span class="k-button-text">${kendo.ui.icon("caret-alt-down")}</span></button>`
    };

    var ToolBar = kendo.ui.ToolBar;

    var MESSAGES = kendo.spreadsheet.messages.toolbar = {
        addColumnLeft: "Add column left",
        addColumnRight: "Add column right",
        addRowAbove: "Add row above",
        addRowBelow: "Add row below",
        alignment: "Alignment",
        alignmentButtons: {
            justifyLeft: "Align left",
            justifyCenter: "Center",
            justifyRight: "Align right",
            justifyFull: "Justify",
            alignTop: "Align top",
            alignMiddle: "Align middle",
            alignBottom: "Align bottom"
        },
        backgroundColor: "Background",
        bold: "Bold",
        borders: "Borders",
        copy: "Copy",
        cut: "Cut",
        deleteColumn: "Delete column",
        deleteRow: "Delete row",
        filter: "Filter",
        fontFamily: "Font",
        fontSize: "Font size",
        format: "Custom format...",
        formatTypes: {
            automatic: "Automatic",
            text: "Text",
            number: "Number",
            percent: "Percent",
            financial: "Financial",
            currency: "Currency",
            date: "Date",
            time: "Time",
            dateTime: "Date time",
            duration: "Duration",
            moreFormats: "More formats..."
        },
        formatDecreaseDecimal: "Decrease decimal",
        formatIncreaseDecimal: "Increase decimal",
        freeze: "Freeze panes",
        freezeButtons: {
            freezePanes: "Freeze panes",
            freezeRows: "Freeze rows",
            freezeColumns: "Freeze columns",
            unfreeze: "Unfreeze panes"
        },
        insertComment: "Insert comment",
        insertImage: "Insert image",
        italic: "Italic",
        merge: "Merge cells",
        mergeButtons: {
            mergeCells: "Merge all",
            mergeHorizontally: "Merge horizontally",
            mergeVertically: "Merge vertically",
            unmerge: "Unmerge"
        },
        open: "Open...",
        paste: "Paste",
        quickAccess: {
            redo: "Redo",
            undo: "Undo"
        },
        exportAs: "Export...",
        toggleGridlines: "Toggle gridlines",
        sort: "Sort",
        sortButtons: {
            // sortSheetAsc: "Sort sheet A to Z",
            // sortSheetDesc: "Sort sheet Z to A",
            sortRangeAsc: "Sort range A to Z",
            sortRangeDesc: "Sort range Z to A"
        },
        textColor: "Text Color",
        textWrap: "Wrap text",
        underline: "Underline",
        validation: "Data validation...",
        hyperlink: "Link"
    };

    var defaultTools = {
        home: [
            "open",
            "exportAs",
            "separator",
            [ "cut", "copy", "paste" ],
            "separator",
            "fontFamily",
            "fontSize",
            [ "bold", "italic", "underline" ],
            "separator",
            "textColor",
            "separator",
            "backgroundColor",
            "borders",
            "separator",
            "alignment",
            "textWrap",
            "separator",
            [ "formatDecreaseDecimal", "formatIncreaseDecimal" ],
            "separator",
            "filter",
            "format",
            "hyperlink",
            "separator",
            "insertImage",
            "insertComment",
            "separator",
            "freeze",
            "merge",
            "toggleGridlines"
        ],
        insert: [
            [ "addColumnLeft", "addColumnRight", "addRowBelow", "addRowAbove" ],
            "separator",
            [ "deleteColumn", "deleteRow" ]
        ],
        data: [
            "sort",
            "separator",
            "filter",
            "separator",
            "validation"
        ]
    };

    var defaultFormats = kendo.spreadsheet.formats = {
        automatic: null,
        text: "@",
        number: "#,0.00",
        percent: "0.00%",
        financial: '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)',
        currency: "$#,##0.00;[Red]$#,##0.00",
        date: "m/d/yyyy",
        time: "h:mm:ss AM/PM",
        dateTime: "m/d/yyyy h:mm",
        duration: "[h]:mm:ss"
    };

    var colorPickerPalette = [ //metro palette
        "#ffffff", "#000000", "#d6ecff", "#4e5b6f", "#7fd13b", "#ea157a", "#feb80a", "#00addc", "#738ac8", "#1ab39f",
        "#f2f2f2", "#7f7f7f", "#a7d6ff", "#d9dde4", "#e5f5d7", "#fad0e4", "#fef0cd", "#c5f2ff", "#e2e7f4", "#c9f7f1",
        "#d8d8d8", "#595959", "#60b5ff", "#b3bcca", "#cbecb0", "#f6a1c9", "#fee29c", "#8be6ff", "#c7d0e9", "#94efe3",
        "#bfbfbf", "#3f3f3f", "#007dea", "#8d9baf", "#b2e389", "#f272af", "#fed46b", "#51d9ff", "#aab8de", "#5fe7d5",
        "#a5a5a5", "#262626", "#003e75", "#3a4453", "#5ea226", "#af0f5b", "#c58c00", "#0081a5", "#425ea9", "#138677",
        "#7f7f7f", "#0c0c0c", "#00192e", "#272d37", "#3f6c19", "#750a3d", "#835d00", "#00566e", "#2c3f71", "#0c594f"
    ];

    var COLOR_PICKER_MESSAGES = kendo.spreadsheet.messages.colorPicker = {
        reset: "Reset color",
        customColor: "Custom color...",
        apply: "Apply",
        cancel: "Cancel"
    };

    var toolDefaults = {
        separator: { type: "separator" },
        //home tab
        open: {
            type: "open",
            name: "open",
            icon: "folder-open",
            extensions: ".xlsx",
            command: "OpenCommand"
        },
        exportAs: {
            type: "button",
            name: "exportAs",
            dialog: "exportAs",
            overflow: "never",
            icon: "download"
        },
        bold: {
            type: "button",
            command: "PropertyChangeCommand",
            property: "bold",
            value: true,
            icon: "bold",
            togglable: true
        },
        italic: {
            type: "button",
            command: "PropertyChangeCommand",
            property: "italic",
            value: true,
            icon: "italic",
            togglable: true
        },
        underline: {
            type: "button",
            command: "PropertyChangeCommand",
            property: "underline",
            value: true,
            icon: "underline",
            togglable: true
        },
        formatDecreaseDecimal: {
            type: "button",
            name: "formatDecreaseDecimal",
            command: "AdjustDecimalsCommand",
            value: -1,
            icon: "decimal-decrease"
        },
        formatIncreaseDecimal: {
            type: "button",
            name: "formatIncreaseDecimal",
            command: "AdjustDecimalsCommand",
            value: +1,
            icon: "decimal-increase"
        },
        textWrap: {
            type: "button",
            name: "textWrap",
            command: "TextWrapCommand",
            property: "wrap",
            value: true,
            icon: "text-wrap",
            togglable: true
        },
        cut: {
            type: "button",
            name: "cut",
            command: "ToolbarCutCommand",
            icon: "cut"
        },
        copy: {
            type: "button",
            name: "copy",
            command: "ToolbarCopyCommand",
            icon: "copy"
        },
        paste: {
            type: "button",
            name: "paste",
            command: "ToolbarPasteCommand",
            icon: "clipboard"
        },
        alignment: {
            type: "component",
            name: "alignment",
            property: "alignment",
            component: "DropDownButton",
            element: getDefaultToolElement("align-left"),
            overflowComponent: {
                type: "button",
                dialog: "alignment",
                icon: "align-left"
            },
            componentOptions: {
                items: [
                    { attributes: { "data-value": "left", "data-property": "textAlign", "data-command": "PropertyChangeCommand" }, icon: "align-left", text: MESSAGES.alignmentButtons.justifyLeft },
                    { attributes: { "data-value": "center", "data-property": "textAlign", "data-command": "PropertyChangeCommand" }, icon: "align-center", text: MESSAGES.alignmentButtons.justifyCenter },
                    { attributes: { "data-value": "right", "data-property": "textAlign", "data-command": "PropertyChangeCommand" }, icon: "align-right", text: MESSAGES.alignmentButtons.justifyRight },
                    { attributes: { "data-value": "justify", "data-property": "textAlign", "data-command": "PropertyChangeCommand" }, icon: "align-justify", text: MESSAGES.alignmentButtons.justifyFull },
                    { attributes: { class: "k-separator" } },
                    { attributes: { "data-value": "top", "data-property": "verticalAlign", "data-command": "PropertyChangeCommand" }, icon: "align-top", text: MESSAGES.alignmentButtons.alignTop },
                    { attributes: { "data-value": "center", "data-property": "verticalAlign", "data-command": "PropertyChangeCommand" }, icon: "align-middle", text: MESSAGES.alignmentButtons.alignMiddle },
                    { attributes: { "data-value": "bottom", "data-property": "verticalAlign", "data-command": "PropertyChangeCommand" }, icon: "align-bottom", text: MESSAGES.alignmentButtons.alignBottom }
                ],
                commandOn: "click"
            }
        },
        backgroundColor: {
            type: "component",
            name: "backgroundColor",
            commandOn: "change",
            command: "PropertyChangeCommand",
            property: "background",
            component: "ColorPicker",
            componentOptions: {
                view: "palette",
                toolIcon: "droplet",
                palette: colorPickerPalette,
                clearButton: true,
                messages: COLOR_PICKER_MESSAGES,
                input: false,
                commandOn: "change"
            },
            overflowComponent: {
                type: "button",
                dialog: "colorPicker",
                icon: "droplet"
            }
        },
        textColor: {
            type: "component",
            name: "textColor",
            commandOn: "change",
            command: "PropertyChangeCommand",
            property: "color",
            component: "ColorPicker",
            componentOptions: {
                view: "palette",
                toolIcon: "foreground-color",
                palette: colorPickerPalette,
                clearButton: true,
                messages: COLOR_PICKER_MESSAGES,
                input: false,
                commandOn: "change"
            },
            overflowComponent: {
                type: "button",
                dialog: "colorPicker",
                icon: "foreground-color"
            }
        },
        fontFamily: {
            type: "component",
            name: "fontFamily",
            command: "PropertyChangeCommand",
            property: "fontFamily",
            component: "DropDownList",
            overflowComponent: {
                type: "button",
                dialog: "fontFamily",
                icon: "font-family"
            },
            componentOptions: {
                dataSource: ["Arial", "Courier New", "Georgia", "Times New Roman", "Trebuchet MS", "Verdana"],
                value: "Arial" ,
                commandOn: "change"
            }
        },
        fontSize: {
            type: "component",
            name: "fontSize",
            command: "PropertyChangeCommand",
            property: "fontSize",
            component: "ComboBox",
            overflowComponent: {
                type: "button",
                dialog: "fontSize",
                icon: "font-size"
            },
            componentOptions: {
                dataSource: [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72],
                value: 12,
                commandOn: "change"
            }
        },
        format: {
            type: "component",
            name: "format",
            component: "DropDownButton",
            element: getDefaultToolElement("custom-format"),
            overflowComponent: {
                type: "button",
                dialog: "formatCells",
                icon: "custom-format"
            },
            componentOptions: {
                items: [
                    { attributes: { "data-value": defaultFormats.automatic, "data-command": "PropertyChangeCommand", "data-property": "format" }, text: MESSAGES.formatTypes.automatic },
                    { attributes: { "data-value": defaultFormats.text, "data-command": "PropertyChangeCommand", "data-property": "format" }, text: MESSAGES.formatTypes.text },
                    { attributes: { "data-value": defaultFormats.number, "data-command": "PropertyChangeCommand", "data-property": "format" }, text: MESSAGES.formatTypes.number, sample: "1,499.99" },
                    { attributes: { "data-value": defaultFormats.percent, "data-command": "PropertyChangeCommand", "data-property": "format" }, text: MESSAGES.formatTypes.percent, sample: "14.50%" },
                    { attributes: { "data-value": defaultFormats.financial, "data-command": "PropertyChangeCommand", "data-property": "format" }, text: MESSAGES.formatTypes.financial, sample: "(1,000.12)" },
                    { attributes: { "data-value": defaultFormats.currency, "data-command": "PropertyChangeCommand", "data-property": "format" }, text: MESSAGES.formatTypes.currency, sample: "$1,499.99" },
                    { attributes: { "data-value": defaultFormats.date, "data-command": "PropertyChangeCommand", "data-property": "format" }, text: MESSAGES.formatTypes.date, sample: "4/21/2012" },
                    { attributes: { "data-value": defaultFormats.time, "data-command": "PropertyChangeCommand", "data-property": "format" }, text: MESSAGES.formatTypes.time, sample: "5:49:00 PM" },
                    { attributes: { "data-value": defaultFormats.dateTime, "data-command": "PropertyChangeCommand", "data-property": "format" }, text: MESSAGES.formatTypes.dateTime, sample: "4/21/2012 5:49:00" },
                    { attributes: { "data-value": defaultFormats.duration, "data-command": "PropertyChangeCommand", "data-property": "format" }, text: MESSAGES.formatTypes.duration, sample: "168:05:00" },
                    { attributes: { "data-value": "popup", "data-popup": "formatCells" }, text: MESSAGES.formatTypes.moreFormats },
                ],
                itemTemplate:
                    '<span class="k-link k-menu-link"><span class="k-menu-link-text">' +
                        "# if (data.sample) { #" +
                            "<span class='k-spreadsheet-sample'>#: data.sample #</span>" +
                        "# } #" +
                        "#: data.text #" +
                    '</span></span>',
                commandOn: "click"
            }
        },
        filter: {
            type: "button",
            name: "filter",
            property: "hasFilter",
            icon: "filter",
            command: "FilterCommand",
            togglable: true,
            enable: false
        },
        merge: {
            type: "component",
            name: "merge",
            component: "DropDownButton",
            element: getDefaultToolElement("cells-merge"),
            overflowComponent: {
                type: "button",
                dialog: "merge",
                icon: "cells-merge"
            },
            componentOptions: {
                items: [
                    { attributes: { "data-value": "cells", "data-command": "MergeCellCommand" }, icon: "cells-merge", text: MESSAGES.mergeButtons.mergeCells },
                    { attributes: { "data-value": "horizontally", "data-command": "MergeCellCommand" }, icon: "cells-merge-horizontally", text: MESSAGES.mergeButtons.mergeHorizontally },
                    { attributes: { "data-value": "vertically", "data-command": "MergeCellCommand" }, icon: "cells-merge-vertically", text: MESSAGES.mergeButtons.mergeVertically },
                    { attributes: { "data-value": "unmerge", "data-command": "MergeCellCommand" }, icon: "table-unmerge", text: MESSAGES.mergeButtons.unmerge }
                ],
                commandOn: "click"
            }
        },
        freeze: {
            type: "component",
            name: "freeze",
            component: "DropDownButton",
            element: getDefaultToolElement("pane-freeze"),
            overflowComponent: {
                type: "button",
                dialog: "freeze",
                icon: "pane-freeze"
            },
            componentOptions: {
                items: [
                    { attributes: { "data-value": "panes", "data-command": "FreezePanesCommand" }, icon: "pane-freeze", text: MESSAGES.freezeButtons.freezePanes },
                    { attributes: { "data-value": "rows", "data-command": "FreezePanesCommand" }, icon: "row-freeze", text: MESSAGES.freezeButtons.freezeRows },
                    { attributes: { "data-value": "columns", "data-command": "FreezePanesCommand" }, icon: "column-freeze", text: MESSAGES.freezeButtons.freezeColumns },
                    { attributes: { "data-value": "unfreeze", "data-command": "FreezePanesCommand" }, icon: "table-unmerge", text: MESSAGES.freezeButtons.unfreeze }
                ],
                commandOn: "click"
            }
        },
        borders: {
            type: "popupButton",
            name: "borders",
            icon: "borders-all",
            popupComponent: kendo.spreadsheet.BorderPalette,
            commandOn: "change",
            command: "BorderChangeCommand",
            overflowComponent: {
                type: "button",
                dialog: "borders"
            }
        },
        formatCells: {
            type: "button",
            dialog: "formatCells",
            overflow: "never"
        },
        hyperlink: {
            type: "button",
            name: "hyperlink",
            dialog: "hyperlink",
            icon: "link"
        },
        toggleGridlines: {
            type: "button",
            name: "toggleGridlines",
            command: "GridLinesChangeCommand",
            property: "gridLines",
            value: true,
            icon: "borders-none",
            togglable: true,
            selected: true
        },
        insertComment: {
            type: "button",
            name: "insertComment",
            dialog: "insertComment",
            property: "comment",
            togglable: true,
            icon: "comment"
        },
        insertImage: {
            type: "button",
            name: "insertImage",
            dialog: "insertImage",
            icon: "image",
        },

        //insert tab
        addColumnLeft: {
            type: "button",
            name: "addColumnLeft",
            command: "AddColumnCommand",
            value: "left",
            icon: "table-column-insert-left"
        },
        addColumnRight: {
            type: "button",
            name: "addColumnRight",
            command: "AddColumnCommand",
            value: "right",
            icon: "table-column-insert-right"
        },
        addRowBelow: {
            type: "button",
            name: "addRowBelow",
            command: "AddRowCommand",
            value: "below",
            icon: "table-row-insert-below"
        },
        addRowAbove: {
            type: "button",
            name: "addRowAbove",
            command: "AddRowCommand",
            value: "above",
            icon: "table-row-insert-above"
        },
        deleteColumn: {
            type: "button",
            name: "deleteColumn",
            command: "DeleteColumnCommand",
            icon: "table-column-delete"
        },
        deleteRow: {
            type: "button",
            name: "deleteRow",
            command: "DeleteRowCommand",
            icon: "table-row-delete"
        },

        //data tab
        sort: {
            type: "component",
            name: "sort",
            component: "DropDownButton",
            element: getDefaultToolElement("sort-desc"),
            overflowComponent: {
                type: "button",
                dialog: "sort",
                icon: "sort-desc"
            },
            componentOptions: {
                items: [
                    { attributes: { "data-value": "asc", "data-command": "SortCommand" }, sheet: false, text: MESSAGES.sortButtons.sortRangeAsc, icon: "sort-asc" },
                    { attributes: { "data-value": "desc", "data-command": "SortCommand" }, sheet: false, text: MESSAGES.sortButtons.sortRangeDesc, icon: "sort-desc" },
                ],
                commandOn: "click"
            }
        },
        validation: {
            type: "button",
            name: "validation",
            dialog: "validation",
            icon: "exclamation-circle"
        }
    };

    var SpreadsheetToolBar = ToolBar.extend({
        init: function(element, options) {
            Object.keys(toolDefaults).forEach((t) => {
                if (t !== "validation") {
                    toolDefaults[t].showText = "overflow";
                }
            });

            options.tools = options.tools || SpreadsheetToolBar.prototype.options.tools[options.toolbarName];
            options.parentMessages = MESSAGES;
            options.defaultTools = toolDefaults;

            ToolBar.fn.init.call(this, element, options);
            var handleClick = this._click.bind(this);

            this.element.addClass("k-spreadsheet-toolbar k-toolbar-md");

            this.bind({
                click: handleClick,
                toggle: handleClick,
                change: handleClick
            });
        },
        _click: function(e) {
            var target = e.target,
                property = target.data("property"),
                value = e.value || target.data("value") || e.target.val(),
                commandType = target.data("command"),
                dialog = target.data("dialog"),
                options = target.data("options") || {};

            if (value === "popup") {
                // Special case to open custom format dialog from option of the format DDL
                dialog = target.data("popup");
            }

            options.property = property || null;
            options.value = value || null;

            if (dialog) {
                this.dialog({
                    name: dialog,
                    options: options
                });
                return;
            }

            if (!commandType) {
                return;
            }

            var args = {
                command: commandType,
                options: options
            };

            if (typeof args.options.value === "boolean") {
                args.options.value = e.checked ? true : null;
            }

            this.action(args);
        },
        events: [
            "action",
            "dialog"
        ],
        options: {
            name: "SpreadsheetToolBar",
            resizable: true,
            tools: defaultTools
        },
        action: function(args) {
            this.trigger("action", args);
        },
        dialog: function(args) {
            this.trigger("dialog", args);
        },
        refresh: function(activeCell) {
            var range = activeCell,
                tools = this._tools();

            for (var i = 0; i < tools.length; i++) {
                var property = tools[i].property,
                    tool = tools[i].tool,
                    value = kendo.isFunction(range[property]) ? range[property]() : range;

                if (property == "gridLines") {
                    // this isn't really a property of the range, it's per-sheet.
                    value = range.sheet().showGridLines();
                }

                this._updateTool(tool, value, property, range);
            }

            this.resize(true);
        },
        _tools: function() {
            return this.element.find("[data-property]").toArray().map(function(element) {
                element = $(element);
                return {
                    property: element.attr("data-property"),
                    tool: this._getItem(element)
                };
            }.bind(this));
        },
        _updateTool: function(tool, value, property, range) {
            var component = tool.component,
                toolbarEl = tool.toolbarEl,
                widget = kendo.widgetInstance(toolbarEl.find("[data-role]")),
                menuItem = tool.menuItem,
                toggle = false,
                vertical, text, menu, selection, enabled, label;

            if (property === "hasFilter") {
                selection = range.sheet().selection();

                if (selection && selection._ref && selection._ref.height) {
                    enabled = value || selection._ref.height() > 1;

                    this.enable(toolbarEl, enabled);
                }
            } else if (property === "alignment") {
                vertical = value.verticalAlign();
                text = value.textAlign();
                menu = component.menu.element;

                menu.find(".k-item .k-link").removeClass("k-selected");
                menu.find(".k-item[data-property=textAlign][data-value=" + text + "] .k-link").addClass("k-selected");
                menu.find(".k-item[data-property=verticalAlign][data-value=" + vertical + "] .k-link").addClass("k-selected");
            } else if (property === "background" || property === "color") {
                widget.value(value);
            } else if (property === "fontFamily" || property === "fontSize") {
                label = menuItem.find(".k-menu-link-text").text().split("(")[0].trim();
                menuItem.find(".k-menu-link-text").text(label + " (" + value + ") ...");
                widget.value(value);
            }

            if (component && component.toggle) {
                if (typeof value === "boolean") {
                    toggle = !!value;
                } else if (typeof value === "string") {
                    if (toolbarEl.data("value")) {
                        toggle = toolbarEl.data("value") === value;
                    } else {
                        // if no value is specified in the tool options,
                        // assume it should be ON if the range value is not null, and OFF otherwise.
                        toggle = value != null;
                    }
                }

                this.toggle(toolbarEl, toggle);
            }
        }
    });

    kendo.spreadsheet.ToolBar = SpreadsheetToolBar;

    kendo.spreadsheet.TabStrip = kendo.ui.TabStrip.extend({
        init: function(element, options) {
            kendo.ui.TabStrip.fn.init.call(this, element, options);
            element.addClass("k-spreadsheet-tabstrip");
            this._quickAccessButtons();

            this.toolbars = {};

            var tabs = options.dataSource;

            this.contentElements.each(function(idx, element) {
                this._toolbar($(element), tabs[idx].id, options.toolbarOptions[tabs[idx].id]);
            }.bind(this));

            this.bind("activate", function(e) { //force resize of the tabstrip after TabStrip tab is opened
                var toolbar = $(e.contentElement).find(".k-toolbar").data("kendoSpreadsheetToolBar");

                toolbar._tabIndex();
                this.wrapper.removeAttr("tabindex");
                this.wrapper.find(".k-tabstrip-content").removeAttr("tabindex");
            });
        },

        events: kendo.ui.TabStrip.fn.events.concat([ "action", "dialog" ]),

        destroy: function() {
            this.quickAccessToolBar.off("click");
            kendo.ui.TabStrip.fn.destroy.call(this);
            for (var name in this.toolbars) {
                this.toolbars[name].destroy();
            }
        },

        action: function(args) {
            this.trigger("action", args);
        },

        dialog: function(args) {
            this.trigger("dialog", args);
        },

        refreshTools: function(range, reason) {
            var toolbars = this.toolbars;

            if (!reason.overElement && !reason.comment) {
                for (var name in toolbars) {
                    if (toolbars.hasOwnProperty(name)) {
                        toolbars[name].refresh(range);
                    }
                }
            }
        },

        _quickAccessButtons: function() {
            var buttons = [
                { title: MESSAGES.quickAccess.undo, icon: "undo", action: "undo" },
                { title: MESSAGES.quickAccess.redo, icon: "redo", action: "redo" }
            ];
            var buttonTemplate = kendo.template("<a role='button' href='\\#' title='#= title #' data-action='#= action #' class='k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button' aria-label='#= title #'>#=kendo.ui.icon(icon)#</a>");

            this.quickAccessToolBar = $("<div />", {
                "class": "k-spreadsheet-quick-access-toolbar",
                "html": kendo.render(buttonTemplate, buttons)
            }).insertBefore(this.wrapper);

            this.quickAccessToolBar.on("click", ".k-button", function(e) {
                e.preventDefault();

                var action = $(e.currentTarget).attr("data-action");
                this.action({ action: action });
            }.bind(this));

            this.quickAccessAdjust();
        },

        quickAccessAdjust: function() {
            this.tabGroup.css("padding-left", kendo._outerWidth(this.quickAccessToolBar));
        },

        _toolbar: function(container, name, tools) {
            var element;
            var options;

            if (this.toolbars[name]) {
                this.toolbars[name].destroy();
                container.children(".k-toolbar").remove();
            }

            if (tools) {
                element = container.html("<div></div>").children("div");

                options = {
                    tools: typeof tools === "boolean" ? undefined : tools,
                    toolbarName: name,
                    action: this.action.bind(this),
                    dialog: this.dialog.bind(this)
                };

                this.toolbars[name] = new kendo.spreadsheet.ToolBar(element, options);
            }
        }

    });

})(window.kendo);
