/**
 * Kendo UI v2023.1.425 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./table-wizard-command.js";
import "../../kendo.html.button.js";
import "../../kendo.tabstrip.js";
import "../../kendo.textarea.js";
import "../../kendo.icons.js";

(function($, undefined) {

var kendo = window.kendo,
    encode = kendo.htmlEncode,
    numericTextBoxSettings = { format: "0", min: 0 },
    units = ["px", "em"],
    borderStyles = ["solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset", "initial", "inherit", "none", "hidden"];

var DEFAULT_NUMBER_OF_COLS_AND_ROWS = 4;

var tableAlignmentDropDownSettings = {
    dataSource: [{
        className: "table-align-middle-left",
        value: "left"
    }, {
        className: "table-align-middle-center",
        value: "center"
    }, {
        className: "table-align-middle-right",
        value: "right"
    }, {
        className: "align-remove",
        value: ""
    }],
    dataTextField: "className",
    dataValueField: "value",
    template: ({ className, tooltip }) => kendo.ui.icon($(`<span title="${encode(tooltip)}"></span>`), { icon: encode(className) }),
    valueTemplate: ({ className, tooltip }) => kendo.ui.icon($(`<span title="${encode(tooltip)}"></span>`), { icon: encode(className), iconClass: "k-align-group" })
};

var cellAlignmentDropDownSettings = {
    dataSource: [{
        className: "table-align-top-left",
        value: "left top"
    }, {
        className: "table-align-top-center",
        value: "center top"
    }, {
        className: "table-align-top-right",
        value: "right top"
    }, {
        className: "table-align-middle-left",
        value: "left middle"
    }, {
        className: "table-align-middle-center",
        value: "center middle"
    }, {
        className: "table-align-middle-right",
        value: "right middle"
    }, {
        className: "table-align-bottom-left",
        value: "left bottom"
    }, {
        className: "table-align-bottom-center",
        value: "center bottom"
    }, {
        className: "table-align-bottom-right",
        value: "right bottom"
    }, {
        className: "align-remove",
        value: ""
    }],
    dataTextField: "className",
    dataValueField: "value",
    template: ({ className, tooltip }) => kendo.ui.icon($(`<span title="${encode(tooltip)}"></span>`), { icon: encode(className) }),
    valueTemplate: ({ className, tooltip }) => kendo.ui.icon($(`<span title="${encode(tooltip)}"></span>`), { icon: encode(className), iconClass: "k-align-group" })
};

var accessibilityAlignmentDropDownSettings = {
    dataSource: [{
        className: "table-align-top-left",
        value: "left top"
    }, {
        className: "table-align-top-center",
        value: "center top"
    }, {
        className: "table-align-top-right",
        value: "right top"
    }, {
        className: "table-align-bottom-left",
        value: "left bottom"
    }, {
        className: "table-align-bottom-center",
        value: "center bottom"
    }, {
        className: "table-align-bottom-right",
        value: "right bottom"
    }, {
        className: "align-remove",
        value: ""
    }],
    dataTextField: "className",
    dataValueField: "value",
    template: ({ className, tooltip }) => kendo.ui.icon($(`<span title="${encode(tooltip)}"></span>`), { icon: encode(className) }),
    valueTemplate: ({ className, tooltip }) => kendo.ui.icon($(`<span title="${encode(tooltip)}"></span>`), { icon: encode(className), iconClass: "k-align-group" })
};

var dialogTemplate = ({ messages }) =>
    '<div class="k-editor-dialog k-editor-table-wizard-window k-action-window k-popup-edit-form">' +
        '<div id="k-table-wizard-tabs" class="k-root-tabs">' +
            '<ul>' +
                `<li class="k-active">${ messages.tableTab }</li>` +
                `<li>${ messages.cellTab }</li>` +
                `<li>${ messages.accessibilityTab }</li>` +
            '</ul>' +
            '<div id="k-table-properties"></div>' +
            '<div id="k-cell-properties"></div>' +
            '<div id="k-accessibility-properties"></div>' +
        '</div>' +
        '<div class="k-actions k-actions-start k-actions-horizontal k-window-buttons">' +
                kendo.html.renderButton(`<button class="k-dialog-ok"><span class="k-button-text">${ messages.dialogOk }</span></button>`, {
                    icon: 'check',
                        themeColor: "primary"
                    }) +
                    kendo.html.renderButton(`<button class="k-dialog-close"><span class="k-button-text">${ messages.dialogCancel }</span></button>`, {
                        icon: 'cancel-outline'
                    }) +
        '</div>' +
    '</div>';

var TableWizardDialog = kendo.Class.extend({
    init: function(options) {
        this.options = options;
    },
    open: function() {
        var that = this,
            options = that.options,
            dialogOptions = options.dialogOptions,
            tableData = options.table,
            dialog,
            messages = options.messages,
            isIE = kendo.support.browser.msie;

        function close(e) {
            e.preventDefault();
            that.destroy();
            dialog.destroy();
        }

        function okHandler(e) {
            that.collectDialogValues(tableData);

            close(e);

            if (that.change) {
                that.change();
            }

            options.closeCallback(tableData);
        }

        function closeHandler(e) {
            close(e);
            options.closeCallback();
        }

        dialogOptions.close = closeHandler;
        dialogOptions.minWidth = 400;
        dialogOptions.title = messages.tableWizard;
        dialogOptions.visible = options.visible;

        dialog = $(that._dialogTemplate(messages)).appendTo(document.body)
            .kendoWindow(dialogOptions)
            .addClass("k-editor-window")
            .closest(".k-window").toggleClass("k-rtl", options.isRtl).end()
            .find(".k-dialog-ok").on("click", okHandler).end()
            .find(".k-dialog-close").on("click", closeHandler).end()
            .data("kendoWindow");

        var element = dialog.element;
        that._initTabStripComponent(element);
        that._tablePropertiesForm = that._createTablePropertiesForm(dialog, messages);
        that._cellPropertiesForm = that._createCellPropertiesForm(dialog, messages);
        that._accessibilityPropertiesForm = that._createAccessibilityPropertiesForm(dialog, messages);

        dialog.center();
        dialog.open();

        if (isIE) {
            var dialogHeight = element.closest(".k-window").height();
            element.css("max-height", dialogHeight);
        }
    },

    _initTabStripComponent: function(element) {
        var components = this.components = {};
        components.tabStrip = element.find("#k-table-wizard-tabs").kendoTabStrip({
            animation: false
        }).data("kendoTabStrip");
    },

    collectDialogValues: function() {
        var that = this;
        var data = that.options.table;
        that._collectTableViewValues(data);
        that._collectCellViewValues(data);
        that._collectAccessibilityViewValues(data);
    },

    _collectTableViewValues: function(tableData) {
        var tableView = this.components.tableView;
        var tableProperties = tableData.tableProperties;
        tableProperties.width = tableView.width.value();
        tableProperties.widthUnit = tableView.widthUnit.value();
        tableProperties.height = tableView.height.value();
        tableProperties.columns = tableView.columns.value();
        tableProperties.rows = tableView.rows.value();
        tableProperties.heightUnit = tableView.heightUnit.value();
        tableProperties.cellSpacing = tableView.cellSpacing.value();
        tableProperties.cellPadding = tableView.cellPadding.value();
        tableProperties.alignment = tableView.alignment.value();
        tableProperties.bgColor = tableView.bgColor.value();
        tableProperties.className = tableView.className.value();
        tableProperties.id = tableView.id.value();
        tableProperties.borderWidth = tableView.borderWidth.value();
        tableProperties.borderColor = tableView.borderColor.value();
        tableProperties.borderStyle = tableView.borderStyle.value();
        tableProperties.collapseBorders = tableView.collapseBorders.check();
    },

    _collectCellViewValues: function(table) {
        var cellData = table.cellProperties = {};
        var cellView = this.components.cellView;

        cellData.selectAllCells = cellView.selectAllCells.check();
        cellData.width = cellView.width.value();
        cellData.widthUnit = cellView.widthUnit.value();
        cellData.height = cellView.height.value();
        cellData.heightUnit = cellView.heightUnit.value();
        cellData.cellMargin = cellView.cellMargin.value();
        cellData.cellPadding = cellView.cellPadding.value();
        cellData.alignment = cellView.alignment.value();
        cellData.bgColor = cellView.bgColor.value();
        cellData.className = cellView.className.value();
        cellData.id = cellView.id.value();
        cellData.borderWidth = cellView.borderWidth.value();
        cellData.borderColor = cellView.borderColor.value();
        cellData.borderStyle = cellView.borderStyle.value();
        cellData.wrapText = cellView.wrapText.check();

        if (!cellData.width) {
            cellData.selectAllCells = true;
            cellData.width = 100 / table.tableProperties.columns;
            cellData.widthUnit = "%";
        }
    },

   _collectAccessibilityViewValues: function(table) {
        var tableProperties = table.tableProperties;
        var accessibilityView = this.components.accessibilityView;
        tableProperties.captionContent = accessibilityView.captionContent.value();
        tableProperties.captionAlignment = accessibilityView.captionAlignment.value();
        tableProperties.summary = accessibilityView.summary.value();
        tableProperties.cellsWithHeaders = accessibilityView.cellsWithHeaders.value();

        tableProperties.headerRows = accessibilityView.headerRows.value();
        tableProperties.headerColumns = accessibilityView.headerColumns.value();
    },
    _addUnit: function(units, value) {
        if (value && $.inArray(value, units) == -1) {
            units.push(value);
        }
    },

    _initNumericTextbox: function(element, property, data, storage, settings) {
        var component = storage[property] = element.kendoNumericTextBox(
                settings ? $.extend({}, numericTextBoxSettings, settings) : numericTextBoxSettings
            ).data("kendoNumericTextBox");
        if (property in data) {
            component.value(parseInt(data[property], 10));
        }
    },

    _initDropDownList: function(element, property, data, storage, dataSource) {
        var component = storage[property] = element.kendoDropDownList({
            dataSource: dataSource
        }).data("kendoDropDownList");
        this._setComponentValue(component, data, property);
    },

    _initBorderStyleDropDown: function(element, property, data, storage, dataSource) {
        var component = storage[property] = element.kendoDropDownList({
            dataSource: dataSource,
            optionLabel: this.options.messages.borderNone
        }).data("kendoDropDownList");
        this._setComponentValue(component, data, property);
    },

    _initTableAlignmentDropDown: function(element, data) {
        var messages = this.options.messages;
        var tableView = this.components.tableView;
        var dataSource = tableAlignmentDropDownSettings.dataSource;
        dataSource[0].tooltip = messages.alignLeft;
        dataSource[1].tooltip = messages.alignCenter;
        dataSource[2].tooltip = messages.alignRight;
        dataSource[3].tooltip = messages.alignRemove;

        this._initAlignmentDropDown(element, tableAlignmentDropDownSettings, "alignment", data, tableView);
    },

    _initCellAlignmentDropDown: function(element, data) {
        var messages = this.options.messages;
        var cellView = this.components.cellView;
        var dataSource = cellAlignmentDropDownSettings.dataSource;
        dataSource[0].tooltip = messages.alignLeftTop;
        dataSource[1].tooltip = messages.alignCenterTop;
        dataSource[2].tooltip = messages.alignRightTop;
        dataSource[3].tooltip = messages.alignLeftMiddle;
        dataSource[4].tooltip = messages.alignCenterMiddle;
        dataSource[5].tooltip = messages.alignRightMiddle;
        dataSource[6].tooltip = messages.alignLeftBottom;
        dataSource[7].tooltip = messages.alignCenterBottom;
        dataSource[8].tooltip = messages.alignRightBottom;
        dataSource[9].tooltip = messages.alignRemove;

        this._initAlignmentDropDown(element, cellAlignmentDropDownSettings, "alignment", data, cellView);
    },

    _initAccessibilityAlignmentDropDown: function(element, data) {
        var messages = this.options.messages;
        var accessibilityView = this.components.accessibilityView;
        var dataSource = accessibilityAlignmentDropDownSettings.dataSource;
        dataSource[0].tooltip = messages.alignLeftTop;
        dataSource[1].tooltip = messages.alignCenterTop;
        dataSource[2].tooltip = messages.alignRightTop;
        dataSource[3].tooltip = messages.alignLeftBottom;
        dataSource[4].tooltip = messages.alignCenterBottom;
        dataSource[5].tooltip = messages.alignRightBottom;
        dataSource[6].tooltip = messages.alignRemove;

        this._initAlignmentDropDown(element, accessibilityAlignmentDropDownSettings, "captionAlignment", data, accessibilityView);
    },
    _initAlignmentDropDown: function(element, settings, name, data, storage) {
        var component = storage[name] =
            element.kendoDropDownList(settings).data("kendoDropDownList");

        component.list.addClass('k-align');
        this._setComponentValue(component, data, name);
    },
    _initAssociationDropDown: function(element, name, settings, data, storage) {
        var component = storage[name] =
            element.kendoDropDownList(settings).data("kendoDropDownList");

        this._setComponentValue(component, data, name);
    },
    _setComponentValue: function(component, data, property) {
        if (property in data) {
            component.value(data[property]);
        }
    },

    _initColorPicker: function(element, property, data, storage) {
        var component = storage[property] =
            element.kendoColorPicker({ buttons: false, clearButton: true }).data("kendoColorPicker");

        if (data[property]) {
            component.value(data[property]);
        }
    },
    _initInput: function(element, property, data, storage, settings) {
        var component = storage[property] = element.kendoTextBox(settings || {}).data("kendoTextBox");
        if (property in data) {
            component.value(data[property]);
        }
    },

    _initCheckbox: function(element, property, data, storage, settings) {
        var component = storage[property] = element.kendoCheckBox(settings || {}).data("kendoCheckBox");
        if (property in data) {
            component.check(data[property]);
        }
    },

    _initTextArea: function(element, property, data, storage, settings) {
        var component = storage[property] = element.kendoTextArea(settings || {}).data("kendoTextArea");
        if (property in data) {
            component.value(data[property]);
        }
    },

    destroy: function() {
        var that = this;
        that._destroyComponents(this.components);

        delete that.components;
    },
    _destroyComponents: function(components) {
        for (var widget in components) {
            if (components[widget].destroy) {
                components[widget].destroy();
            }
            delete components[widget];
        }
    },

    _dialogTemplate: function(messages) {
        return kendo.template(dialogTemplate)({ messages: messages });
    },

    _onColumnsNumberChange: function(args) {
        var that = this;
        var accessibilityView = that.components.accessibilityView;
        var headerColumnsNumeric = accessibilityView.headerColumns;
        var currentNumberOfColumnsHeaders = headerColumnsNumeric.value();
        var numberOfColumns = args.sender.value();

        if (numberOfColumns < currentNumberOfColumnsHeaders) {
            headerColumnsNumeric.value(numberOfColumns);
        }

        headerColumnsNumeric.max(numberOfColumns);
    },

    _onRowsNumberChange: function(args) {
        var that = this;
        var accessibilityView = that.components.accessibilityView;
        var headerRowsNumeric = accessibilityView.headerRows;
        var currentNumberOfRowHeaders = headerRowsNumeric.value();
        var numberOfRows = args.sender.value();

        if (numberOfRows < currentNumberOfRowHeaders) {
            headerRowsNumeric.value(numberOfRows);
        }

        headerRowsNumeric.max(numberOfRows);
    },

    _createTablePropertiesForm: function(dialog, messages) {
        var that = this;
        var table = that.options.table;
        var formElement = dialog.element.find("#k-table-properties");
        var components = that.components;
        var tableView = components.tableView = {};
        var tableProperties = table.tableProperties = table.tableProperties || {};
        var form;

        that._addUnit(units, tableProperties.widthUnit);
        that._addUnit(units, tableProperties.heightUnit);
        tableProperties.borderStyle = tableProperties.borderStyle || "";
        form = formElement.kendoForm({
            renderButtons: false,
            items: [
                {
                    field: "k-editor-table-width",
                    label: encode(messages.width),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-table-width" />').appendTo(container), "width", tableProperties, tableView);
                        that._initDropDownList($(`<input id="k-editor-table-width-type" aria-label="${ messages.units }" />`).appendTo(container),
                            "widthUnit",
                            tableProperties,
                            tableView,
                            units);
                    }
                },{
                    field: "k-editor-table-height",
                    label: encode(messages.height),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-table-height" />').appendTo(container), "height", tableProperties, tableView);
                        that._initDropDownList($(`<input id="k-editor-table-height-type" aria-label="${ messages.units }" />`).appendTo(container),
                            "heightUnit",
                            tableProperties,
                            tableView,
                            units);
                    }
                },{
                    field: "k-editor-table-columns",
                    label: encode(messages.columns),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input type="numeric" id="k-editor-table-columns" />').appendTo(container),
                            "columns",
                            tableProperties,
                            tableView,
                            {
                                min: 1,
                                value: DEFAULT_NUMBER_OF_COLS_AND_ROWS,
                                change: that._onColumnsNumberChange.bind(that)
                            });
                    }
                },{
                    field: "k-editor-table-rows",
                    label: encode(messages.rows),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input type="numeric" id="k-editor-table-rows" />').appendTo(container),
                            "rows",
                            tableProperties,
                            tableView,
                            {
                                min: 1,
                                value: DEFAULT_NUMBER_OF_COLS_AND_ROWS,
                                change: that._onRowsNumberChange.bind(that)
                            });
                    }
                },{
                    field: "k-editor-table-cell-spacing",
                    label: encode(messages.cellSpacing),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-table-cell-spacing" />').appendTo(container), "cellSpacing", tableProperties, tableView);
                    }
                },{
                    field: "k-editor-table-cell-padding",
                    label: encode(messages.cellPadding),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-table-cell-padding" />').appendTo(container), "cellPadding", tableProperties, tableView);
                    }
                },{
                    field: "k-editor-table-alignment",
                    label: encode(messages.alignment),
                    editor: function(container, options) {
                        that._initTableAlignmentDropDown($('<input id="k-editor-table-alignment" class="k-align" />').appendTo(container), tableProperties);
                    }
                },{
                    field: "k-editor-table-bg",
                    label: encode(messages.background),
                    editor: function(container, options) {
                        that._initColorPicker($('<input id="k-editor-table-bg" />').appendTo(container), "bgColor", tableProperties, tableView);
                    }
                },{
                    field: "k-editor-css-class",
                    label: encode(messages.cssClass),
                    editor: function(container, options) {
                        that._initInput($('<input id="k-editor-css-class" />').appendTo(container), "className", tableProperties, tableView);
                    }
                },{
                    field: "k-editor-id",
                    label: encode(messages.id),
                    editor: function(container, options) {
                        that._initInput($('<input id="k-editor-id" />').appendTo(container), "id", tableProperties, tableView);
                    }
                },{
                    field: "k-editor-border-width",
                    label: encode(messages.border),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-border-width" />').appendTo(container), "borderWidth", tableProperties, tableView);
                        that._initColorPicker($('<input id="k-editor-border-color" />').appendTo(container), "borderColor", tableProperties, tableView);
                    }
                },{
                    field: "k-editor-border-style",
                    label: encode(messages.borderStyle),
                    editor: function(container, options) {
                        that._initBorderStyleDropDown($('<input id="k-editor-border-style" />').appendTo(container),
                            "borderStyle",
                            tableProperties,
                            tableView,
                            borderStyles);
                    }
                },{
                    field: "k-editor-collapse-borders",
                    label: "",
                    editor: function(container, options) {
                        that._initCheckbox($('<input id="k-editor-collapse-borders"/>').appendTo(container), "collapseBorders", tableProperties, tableView, { label: encode(messages.collapseBorders) });
                    }
                }
            ]
        }).data("kendoForm");

        return form;
    },

    _createCellPropertiesForm: function(dialog, messages) {
        var that = this;
        var table = that.options.table;
        var formElement = dialog.element.find("#k-cell-properties");
        var components = that.components;
        var cellView = components.cellView = {};
        var cellProperties = (table.selectedCells && table.selectedCells[0]) || { borderStyle: "", wrapText: true };
        var form;

        that._addUnit(units, cellProperties.widthUnit);
        that._addUnit(units, cellProperties.heightUnit);
        form = formElement.kendoForm({
            renderButtons: false,
            items: [
                {
                    field: "k-editor-selectAllCells",
                    label: "",
                    editor: function(container, options) {
                        that._initCheckbox($('<input id="k-editor-selectAllCells" />').appendTo(container), "selectAllCells", table.tableProperties, cellView, { label: encode(messages.selectAllCells) });
                    }
                },{
                    field: "k-editor-cell-width",
                    label: encode(messages.width),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-cell-width" />').appendTo(container), "width", cellProperties, cellView);
                        that._initDropDownList($(`<input id="k-editor-cell-width-type" aria-label="${ messages.units }" />`).appendTo(container),
                            "widthUnit",
                            cellProperties,
                            cellView,
                            units);
                    }
                },{
                    field: "k-editor-cell-height",
                    label: encode(messages.height),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-cell-height" />').appendTo(container), "height", cellProperties, cellView);
                        that._initDropDownList($(`<input id="k-editor-cell-height-type" aria-label="${ messages.units }" />`).appendTo(container),
                            "heightUnit",
                            cellProperties,
                            cellView,
                            units);
                    }
                },{
                    field: "k-editor-table-cell-margin",
                    label: encode(messages.cellMargin),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-table-cell-margin" />').appendTo(container), "cellMargin", cellProperties, cellView);
                    }
                },{
                    field: "k-editor-table-cells-padding",
                    label: encode(messages.cellPadding),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-table-cells-padding" />').appendTo(container), "cellPadding", cellProperties, cellView);
                    }
                },{
                    field: "k-editor-cell-alignment",
                    label: encode(messages.alignment),
                    editor: function(container, options) {
                        that._initCellAlignmentDropDown($('<input id="k-editor-cell-alignment" class="k-align" />').appendTo(container), cellProperties);
                    }
                },{
                    field: "k-editor-cell-bg",
                    label: encode(messages.background),
                    editor: function(container, options) {
                        that._initColorPicker($('<input id="k-editor-cell-bg" />').appendTo(container), "bgColor", cellProperties, cellView);
                    }
                },{
                    field: "k-editor-cell-css-class",
                    label: encode(messages.cssClass),
                    editor: function(container, options) {
                        that._initInput($('<input id="k-editor-cell-css-class" />').appendTo(container), "className", cellProperties, cellView);
                    }
                },{
                    field: "k-editor-cell-id",
                    label: encode(messages.id),
                    editor: function(container, options) {
                        that._initInput($('<input id="k-editor-cell-id" />').appendTo(container), "id", cellProperties, cellView);
                    }
                },{
                    field: "k-editor-cell-border-width",
                    label: encode(messages.border),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-cell-border-width" />').appendTo(container), "borderWidth", cellProperties, cellView);
                        that._initColorPicker($('<input id="k-editor-cell-border-color" />').appendTo(container), "borderColor", cellProperties, cellView);
                    }
                },{
                    field: "k-editor-cell-border-style",
                    label: encode(messages.borderStyle),
                    editor: function(container, options) {
                        that._initBorderStyleDropDown($('<input id="k-editor-cell-border-style" />').appendTo(container),
                            "borderStyle",
                            cellProperties,
                            cellView,
                            borderStyles);
                    }
                },{
                    field: "k-editor-wrap-text",
                    label: "",
                    editor: function(container, options) {
                        that._initCheckbox($('<input id="k-editor-wrap-text" />').appendTo(container), "wrapText", cellProperties, cellView, { label: encode(messages.wrapText) });
                    }
                }
            ]
        }).data("kendoForm");

        return form;
    },

    _createAccessibilityPropertiesForm: function(dialog, messages) {
        var that = this;
        var table = that.options.table;
        var formElement = dialog.element.find("#k-accessibility-properties");
        var components = that.components;
        var accessibilityView = components.accessibilityView = {};
        var tableProperties = table.tableProperties;
        var form;

        form = formElement.kendoForm({
            renderButtons: false,
            items: [
                {
                    field: "k-editor-table-header-rows",
                    label: encode(messages.headerRows),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-table-header-rows" />').appendTo(container),
                        "headerRows",
                        tableProperties,
                        accessibilityView,
                        {
                            max: tableProperties.rows || DEFAULT_NUMBER_OF_COLS_AND_ROWS
                        });
                    }
                },{
                    field: "k-editor-table-header-columns",
                    label: encode(messages.headerColumns),
                    editor: function(container, options) {
                        that._initNumericTextbox($('<input id="k-editor-table-header-columns" />').appendTo(container),
                        "headerColumns",
                        tableProperties,
                        accessibilityView,
                        {
                            max: tableProperties.columns || DEFAULT_NUMBER_OF_COLS_AND_ROWS
                        });
                    }
                },{
                    field: "k-editor-table-caption",
                    label: encode(messages.caption),
                    editor: function(container, options) {
                        that._initInput($('<input id="k-editor-table-caption" />').appendTo(container), "captionContent", tableProperties, accessibilityView);
                    }
                },{
                    field: "k-editor-accessibility-alignment",
                    label: encode(messages.alignment),
                    editor: function(container, options) {
                        that._initAccessibilityAlignmentDropDown($('<input id="k-editor-accessibility-alignment" />').appendTo(container), tableProperties);
                    }
                },{
                    field: "k-editor-accessibility-summary",
                    label: encode(messages.summary),
                    editor: function(container, options) {
                        that._initTextArea($('<textarea id="k-editor-accessibility-summary"></textarea>').appendTo(container), "summary", tableProperties, accessibilityView, {
                            rows: 5,
                            placeholder: messages.tableSummaryPlaceholder
                        });
                    }
                },{
                    field: "k-editor-cells-headers",
                    label: encode(messages.associateCellsWithHeaders),
                    editor: function(container, options) {
                        var element = $(`<select id="k-editor-cells-headers">
                            <option value="none">${ messages.associateNone }</option>
                            <option value="scope">${ messages.associateScope }</option>
                            <option value="ids">${ messages.associateIds }</option>
                        </select>`).appendTo(container);

                        that._initAssociationDropDown(element, "cellsWithHeaders", { valuePrimitive: true }, tableProperties, accessibilityView);
                    }
                }
            ]
        }).data("kendoForm");

        return form;
    }
});

kendo.ui.editor.TableWizardDialog = TableWizardDialog;

})(window.kendo.jQuery);