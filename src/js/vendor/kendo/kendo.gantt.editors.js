/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.data.js";
import "./kendo.popup.js";
import "./kendo.window.js";
import "./kendo.gantt.data.js";
import "./kendo.grid.js";
import "./kendo.datetimepicker.js";
import "./kendo.numerictextbox.js";
import "./kendo.textbox.js";
import "./kendo.form.js";
import "./kendo.tabstrip.js";

var __meta__ = {
    id: "gantt.editors",
    name: "GanttEditors",
    category: "web",
    description: "The Gantt component editors.",
    depends: [ "data", "popup", "window", "gantt.data", "grid", "datetimepicker", "numerictextbox", "textbox", "form", "tabstrip"],
    hidden: true
};

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Observable = kendo.Observable,
        Widget = ui.Widget,
        encode = kendo.htmlEncode,
        extend = $.extend,
        PERCENTAGE_FORMAT = "p0",
        GRID_HEIGHT = "23em",
        TAB_HEIGHT = "28em",
        STRING = "string";

    var ganttStyles = {
        buttonDelete: "k-gantt-delete",
        buttonCancel: "k-gantt-cancel",
        buttonSave: "k-gantt-update",
        focused: "k-focus",
        gridContent: "k-grid-content",
        hovered: "k-hover",
        item: "k-item k-menu-item",
        popupWrapper: "k-popup k-menu-popup",
        popupList: "k-menu-group k-menu-group-md k-reset",
        popup: {
            form: "k-popup-edit-form",
            editForm: "k-gantt-edit-form",
            formContainer: "k-edit-form-container",
            resourcesFormContainer: "k-resources-form-container",
            message: "k-popup-message",
            buttonsContainer: "k-edit-buttons k-actions",
            button: "k-button",
            buttonDefaults: "k-button-md k-rounded-md k-button-solid k-button-solid-base",
            editField: "k-edit-field",
            editLabel: "k-edit-label",
            resourcesField: "k-gantt-resources"
        },
        primary: "k-button-solid-primary",
        toolbar: {
            appendButton: "k-gantt-create"
        }
    };

    var PopupEditor = Observable.extend({
        init: function(element, options) {
            Observable.fn.init.call(this);

            this.element = element;
            this.options = extend(true, {}, this.options, options);
        },

        destroy: function() {
            this.close();
            this.unbind();
        },

        close: function() {
            var that = this;

            var destroy = function() {
                if (that.editable) {
                    that.container.data("kendoWindow").destroy();
                    that.editable = null;
                    that.container = null;
                }

                if (that.popup) {
                    that.popup.destroy();
                    that.popup = null;
                }
            };

            if (that.editable && that.container.is(":visible")) {
                that.trigger("close", { window: that.container });
                that.container.data("kendoWindow").bind("deactivate", destroy).close();
            } else {
                destroy();
            }
        },

        editTask: function(task, plannedEditors) {
            this.task = task;
            this.plannedEditors = plannedEditors;
            this.editable = this._createPopupEditor();
        },

        fields: function() {
            var options = this.options,
                model = this.task,
                fields = {},
                customFields;

            if (options.editable.template) {
                return $.map(model.fields, function(value, key) {
                    return { field: key };
                });
            } else {
                fields.general = this._fieldsGeneral();

                if (options.resources) {
                    fields.resources = [ { field: "resources" } ];
                }

                if (options.dependencies) {
                    fields.dependencies = this._fieldsDependencies(model);
                }

                customFields = extend(true, {}, model.fields);
                Object.keys(kendo.data.GanttTask.fields).map(key => {
                    delete customFields[key];
                });

                if (Object.keys(customFields).length > 0) {
                    fields.other = this._fieldsOther(customFields);
                }
            }

            return fields;
        },


        showDialog: function(options) {
            var popupStyles = ganttStyles.popup,
                wrapper = this.element,
                task = options.model,
                that = this,
                dialogEl = $(kendo.format('<div class="' + popupStyles.formContainer + '" data-uid="' + task.uid + '">')).appendTo(wrapper),
                messages = this.options.messages,
                buttonsEl;

            dialogEl.append($("<p>" + options.text + "</p>"));
            buttonsEl = $('<div class="' + popupStyles.buttonsContainer + '">');
            dialogEl.append(buttonsEl);

            buttonsEl.append($("<button class='" + ganttStyles.buttonDelete + "'>" + encode(messages.destroy) + "</button>").kendoButton({
                name: "delete",
                themeColor: "primary",
                icon: "trash",
                click: (e) => {
                    e.preventDefault();
                    popup.close();
                    options.callback();
                }
            }));

            buttonsEl.append($("<button class='" + ganttStyles.buttonCancel + "'>" + encode(messages.cancel) + "</button>").kendoButton({
                name: "cancel",
                icon: "cancel",
                click: (e) => {
                    e.preventDefault();
                    popup.close();
                    options.callback(true);
                }
            }));

            if (this.popup) {
                this.popup.destroy();
            }

            var popup = this.popup = dialogEl.kendoWindow({
                modal: true,
                autoFocus: false,
                resizable: false,
                draggable: false,
                title: options.title,
                visible: false,
                deactivate: function() {
                    this.destroy();
                    that.trigger("close", { window: dialogEl });
                }
            })
            .getKendoWindow();

            popup.center().open();

            popup.element.find(".k-button-solid-primary").trigger("focus");
        },

        _buildButtons: function(dialogEl) {
            var messages = this.options.messages,
                buttonsEl = $('<div class="' + ganttStyles.popup.buttonsContainer + '">');

            buttonsEl.appendTo(dialogEl);

            buttonsEl.append($("<button class='" + ganttStyles.buttonSave + "'>" + encode(messages.save) + "</button>").kendoButton({
                name: "update",
                themeColor: "primary",
                icon: "save",
                click: this._onSave.bind(this)
            }));
            buttonsEl.append($("<button class='" + ganttStyles.buttonCancel + "'>" + encode(messages.cancel) + "</button>").kendoButton({
                name: "cancel",
                icon: "cancel",
                click: this._onCancel.bind(this)
            }));
            buttonsEl.append($("<span class='k-spacer'>"));

            if (this.options.editable.destroy !== false) {
                buttonsEl.append($("<button class='" + ganttStyles.buttonDelete + "'>" + encode(messages.destroy) + "</button>").kendoButton({
                    name: "delete",
                    themeColor: "primary",
                    icon: "trash",
                    fillMode: "flat",
                    click: this._onDelete.bind(this)
                }));
            }
        },

        _buildEditTemplate: function(model, dialogEl) {
            var template = this.options.editable.template;
            var settings = extend({}, kendo.Template, this.options.templateSettings);
            var html = "";

            if (template) {
                if (typeof template === STRING) {
                    template = kendo.unescape(template);
                }

                html += (kendo.template(template, settings))(model);
            } else {
                this.renderForm = true;
                html += `<div role="form" class="k-gantt-edit-tabstrip" ${kendo.attr("style-min-height")}="${TAB_HEIGHT}"></div>`;
            }

            var formEl = $(html);
            kendo.applyStylesFromKendoAttributes(formEl, ["min-height"]);
            formEl.appendTo(dialogEl);
        },

        _createPopupEditor: function() {
            var that = this;
            var options = {};
            var messages = this.options.messages;
            var popupStyles = ganttStyles.popup;
            var editableWidget;
            var task = this.task;
            var container = $(kendo.format('<div {0}="{1}" class="{2} {3}">', kendo.attr("uid"), task.uid, popupStyles.form, popupStyles.editForm));

            container.appendTo(this.element);

            this._buildEditTemplate(task, container);
            this._buildButtons(container);

            this.container = container.kendoWindow(extend({
                width: 554,
                modal: true,
                resizable: false,
                draggable: true,
                title: messages.editor.editorTitle,
                visible: false,
                actions: [ "Minimize", "Maximize", "Close" ],
                close: function(e) {
                    if (e.userTriggered) {
                        if (that.trigger("cancel", { container: container, model: task })) {
                            e.preventDefault();
                        }
                    }
                }
            }, options));

            if (this.renderForm) {
                editableWidget = this._initForm();
            } else {
                editableWidget = container.kendoEditable({
                    model: task,
                    clearContainer: false,
                    validateOnBlur: true,
                    target: that.options.target
                })
                .data("kendoEditable");
            }

            kendo.cycleForm(container);

            if (!this.trigger("edit", { container: container, model: task })) {
                container.data("kendoWindow").center().open();
            } else {
                that.trigger("cancel", { container: container, model: task });
            }

            return editableWidget;
        },

        _fieldsDependencies: function(model) {
            var options = this.options,
                ds = options.target.dataSource,
                nameDdlDs = ds.data().filter(i => i.id !== model.id).map(i => ({ text: i.title, value: i.id })),
                typeDs = [
                    { value: 0, text: "Finish-Finish" },
                    { value: 1, text: "Finish-Start" },
                    { value: 2, text: "Start-Finish" },
                    { value: 3, text: "Start-Start" }
                ];

            return {
                nameDdlDs, typeDs
            };
        },

        _fieldsGeneral: function() {
            var that = this,
                options = this.options,
                dataSource = options.target.dataSource,
                messages = options.messages.editor,
                task = this.task,
                modelFields = task.fields,
                startText = this.plannedEditors ? messages.actualStart : messages.start,
                endText = this.plannedEditors ? messages.actualEnd : messages.end,
                fullData, excluded, ddlData;

            var general = [
                { field: "title", title: messages.title, colSpan: 4 }
            ];

            if (this.plannedEditors) {
                general.push({
                    field: "plannedStart",
                    title: messages.plannedStart,
                    colSpan: 2,
                    editor: "DateTimePicker",
                    validation: modelFields.plannedStart.validation,
                    editorOptions: {
                        componentType: "modern"
                    }
                });

                general.push({
                    field: "plannedEnd",
                    title: messages.plannedEnd,
                    colSpan: 2,
                    editor: "DateTimePicker",
                    validation: modelFields.plannedEnd.validation,
                    editorOptions: {
                        componentType: "modern"
                    }
                });
            }

            fullData = dataSource.data();
            excluded = dataSource.taskAllChildren(task);
            excluded.push(task);
            ddlData = fullData.filter(n => !excluded.some(e => e.id === n.id));

            general.push({
                field: "start",
                title: startText,
                colSpan: 2,
                editor: "DateTimePicker",
                validation: modelFields.start.validation,
                editorOptions: {
                    componentType: "modern"
                }
            });
            general.push({
                field: "end",
                title: endText,
                colSpan: 2,
                editor: "DateTimePicker",
                validation: modelFields.start.validation,
                editorOptions: {
                    componentType: "modern"
                }
            });
            general.push({
                field: "percentComplete",
                title: messages.percentComplete,
                format: PERCENTAGE_FORMAT,
                colSpan: 1,
                hint: messages.percentCompleteHint
            });
            general.push({
                field: "parentId",
                title: messages.parent,
                colSpan: 4,
                editor: "DropDownList",
                editorOptions: {
                    optionLabel: messages.parentOptionLabel,
                    filter: "contains",
                    dataSource: ddlData,
                    enable: ddlData.length > 0,
                    dataValueField: "id",
                    dataTextField: "title",
                    valuePrimitive: true,
                    template: ({ title, start, end }) => `<span>${title} ${kendo.toString(start, "d")}-${kendo.toString(end, "d")}</span>`
                }
            });

            general = general.map(function(item) {
                item = extend(true, {
                    label: item.title
                }, item);

                if (!task.editable || task.editable(item.field)) {
                    return item;
                } else {
                    return extend(true, item, {
                        editor: that._readonlyEditor.bind(that)
                    });
                }
            });

            return general;
        },

        _fieldsOther: function(other) {
            var that = this,
                task = this.task;

            other = Object.keys(other).map(function(key) {
                var item = other[key];

                item = extend(true, {
                    field: key,
                    label: item.title
                }, item);

                if (!task.editable || task.editable(item.field)) {
                    return item;
                } else {
                    return extend(true, item, {
                        editor: that._readonlyEditor.bind(that)
                    });
                }
            });

            return other;
        },

        _gridOptions: function(dependencies, type, keyType, taskId) {
            var messages = this.options.messages,
                data;

            if (!this.dependencyData) {
                this.dependencyData = {};
            }

            data = this.dependencyData[type] = this.options.target.dependencies.view().filter(d => d[keyType] === taskId);

            return {
                dataSource: {
                    data: data,
                    schema: {
                        model: {
                            fields: {
                                id: { from: "id" },
                                [type]: { from: type, validation: { required: { message: messages.editor.name + " is required" } } },
                                type: { from: "type", validation: { required: true }, defaultValue: 1 }
                            }
                        }
                    }
                },
                columns: [{
                    selectable: true,
                    width: 50
                },{
                    field: type,
                    title: messages.editor.name,
                    values: dependencies.nameDdlDs
                }, {
                    field: "type",
                    title: messages.editor.dependencyType,
                    values: dependencies.typeDs,
                    width: "9em"
                }],
                toolbar: [{
                    name: "create",
                    text: messages.editor.addNew
                },{
                    name: "remove",
                    icon: "minus",
                    text: messages.editor.remove,
                    click: (e) => {
                        var grid = e.target.closest(".k-grid").getKendoGrid(),
                            ds = grid.dataSource,
                            selected = grid.select(),
                            items = [];

                        if (selected && selected.length > 0) {
                            selected.each((i, row) => {
                                items.push(grid.dataItem($(row)));
                            });

                            items.map(i => {
                                ds.remove(i);
                            });
                        }
                    }
                }],
                editable: true,
                sortable: true,
                navigatable: true,
                height: GRID_HEIGHT,
                edit: function() {
                    var select = $("[name=predecessorId], [name=successorId]"),
                        ddl;

                    if (select.length) {
                        ddl = select.data("kendoDropDownList");
                        ddl.setOptions({
                            filter: "contains"
                        });
                    }
                },
            };
        },

        _initForm: function() {
            var that = this,
                task = that.task,
                container = that.container,
                resources = that.options.resources,
                resourceField = task.get(resources.field),
                fields = that.fields(),
                tabStripDs = that._tabStripSource(fields, resourceField);

            container.find(".k-gantt-edit-tabstrip").kendoTabStrip({
                dataTextField: "name",
                dataContentField: "content",
                dataSource: tabStripDs,
                value: that.options.messages.editor.general,
                select: (e) => {
                    var tabStrip = e.sender,
                        contentElement = $(tabStrip.contentElement(tabStrip.select().index())),
                        grid = contentElement.find(".k-grid").data("kendoGrid"),
                        form = contentElement.find(".k-form").data("kendoForm");

                    if (grid && grid.editable && grid.editable.validatable && !grid.editable.validatable.validate()) {
                        e.preventDefault();
                    } else if (form && !form.validator.validate()) {
                        e.preventDefault();
                    }
                }
            });

            that._initGeneral(fields.general, task);

            if (resourceField) {
                that.resourceEditor = resources.editor(container.find(".k-gantt-resources"), task);
            }

            if (fields.dependencies) {
                container.find(".k-gantt-predecessors").kendoGrid(that._gridOptions(fields.dependencies, "predecessorId", "successorId", task.id));
                container.find(".k-gantt-successors").kendoGrid(that._gridOptions(fields.dependencies, "successorId", "predecessorId", task.id));
            }

            if (fields.other) {
                that._initOther(fields.other, task);
            }

            return that.form.editable;
        },

        _initGeneral: function(items, task) {
            this.form = this.container.find(".k-gantt-form-default").kendoForm({
                layout: "grid",
                grid: {
                    cols: 4,
                    gutter: {
                        rows: 0,
                        cols: 8
                    }
                },
                items: items,
                formData: task,
                buttonsTemplate: () => "",
                validatable: {
                    validateOnBlur: true
                }
            }).data("kendoForm");
        },

        _initOther: function(items, task) {
            this.container.find(".k-gantt-form-other").kendoForm({
                items: items,
                formData: task,
                buttonsTemplate: () => "",
                validatable: {
                    validateOnBlur: true
                }
            });
        },

        _readonlyEditor: function(container, options) {
            var field = options.field,
                value = '',
                ds = this.options.target.dataSource;

            if (options.model.get(field) !== null) {
                value = options.model.get(field);

                if (value instanceof Date) {
                    value = kendo.toString(value, "g");
                } else if (field === "percentComplete") {
                    value = kendo.toString(value, options.format);
                } else if (field === "parentId") {
                    value = ds.get(value).title;
                }
            }

            container.append("<span>" + value + "</span>");
        },

        _onCancel: function() {
            this.trigger("cancel", { container: this.container, model: this.task });
        },

        _onDelete: function() {
            this.trigger("remove", { container: this.container, model: this.task });
        },

        _onSave: function() {
            var task = this.task,
                fields = [],
                updateInfo = {},
                field,
                container = this.container,
                predeGrid = container.find(".k-gantt-predecessors").getKendoGrid(),
                sucGrid = container.find(".k-gantt-successors").getKendoGrid(),
                found, prevData, newData, args = {}, createdData = [], updatedData = [];

            if (predeGrid) {
                prevData = this.dependencyData.successorId.concat(this.dependencyData.predecessorId);
                newData = predeGrid.dataSource.view().toJSON().concat(sucGrid.dataSource.view().toJSON());

                if (predeGrid && predeGrid.editable && predeGrid.editable.validatable && !predeGrid.editable.validatable.validate() ||
                    sucGrid && sucGrid.editable && sucGrid.editable.validatable && !sucGrid.editable.validatable.validate()) {
                        return;
                    }

                newData.map(n => {
                    found = prevData.find(i => i.id === n.id);

                    if (found) {
                        if (found.dirty) {
                            updatedData.push(n);
                        }

                        newData = newData.filter(i => i.id !== n.id);
                        prevData = prevData.filter(i => i.id !== n.id);
                    }
                });

                newData.map(i => {
                    if (i.successorId) {
                        if (!i.predecessorId) {
                            i.predecessorId = task.get("id");
                        }

                        createdData.push(i);
                    } else if (i.predecessorId) {
                        if (!i.successorId) {
                            i.successorId = task.get("id");
                        }

                        createdData.push(i);
                    }
                });

                if (createdData.length > 0 || prevData.length > 0 || updatedData.length > 0) {
                    args.updateDependencies = {
                        destroyed: prevData,
                        created: createdData,
                        updated: updatedData
                    };
                }
            }

            Object.values(this.fields()).map((val) => {
                if (Array.isArray(val)) {
                    fields.push(...val);
                }
            });

            if (this.resourceEditor) {
                if (!this.resourceEditor.updateModel()) {
                    return;
                }
            }

            for (var i = 0, length = fields.length; i < length; i++) {
                field = fields[i].field;
                updateInfo[field] = task.get(field);
            }

            this.trigger("save", $.extend({}, args, {
                container: container,
                model: task,
                updateInfo: updateInfo
            }));
        },

        _tabStripSource: function(fields, resourceField) {
            var messages = this.options.messages.editor,
                dependencies = fields.dependencies,
                tabStripDs = [{
                    name: messages.general,
                    content: "<div class='k-gantt-form-default'></div>"
                }];

            if (resourceField) {
                tabStripDs.push({
                    name: messages.resources,
                    content: "<div class='k-gantt-resources'></div>"
                });
            }

            if (dependencies) {
                tabStripDs.push({
                    name: messages.predecessors,
                    content: "<div class='k-gantt-predecessors'></div>"
                });
                tabStripDs.push({
                    name: messages.successors,
                    content: "<div class='k-gantt-successors'></div>"
                });
            }

            if (fields.other) {
                tabStripDs.push({
                    name: messages.other,
                    content: "<div class='k-gantt-form-other'></div>"
                });
            }

            return tabStripDs;
        }
    });
    var ResourceEditor = Widget.extend({
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);

            this.wrapper = this.element;
            this.model = this.options.model;
            this.resourcesField = this.options.resourcesField;

            this._resourceGrid();
        },

        destroy: function() {
            this.grid = null;

            Widget.fn.destroy.call(this);

            this.element = this.wrapper = null;
        },

        updateModel: function() {
            var resources = [];
            var item, value;
            var grid = this.grid;
            var data = grid.dataSource.data();
            var editable = grid.editable;

            if (editable && editable.validatable && !editable.validatable.validate()) {
                return false;
            }

            for (var i = 0, length = data.length; i < length; i++) {
                item = data[i];
                value = item.get("value");

                if (item.id !== undefined && value !== null && value > 0) {
                    resources.push(data[i]);
                }
            }

            this.model[this.resourcesField] = resources;

            return true;
        },

        _resourceGrid: function() {
            var that = this;
            var messages = this.options.messages;
            var options = that.options;
            var element = this.wrapper;
            var ddlDs = options.resources;

            that.grid = new kendo.ui.Grid(element, {
                columns: [{
                    selectable: true,
                    width: 50
                },{
                    field: "id",
                    title: messages.resourcesHeader,
                    values: ddlDs
                },{
                    field: "value",
                    title: messages.unitsHeader,
                    template: function(dataItem) {
                        var valueFormat = dataItem.format || PERCENTAGE_FORMAT;
                        var value = dataItem.value !== null ? dataItem.value : "";

                        return valueFormat ? kendo.toString(value, valueFormat) : value;
                    },
                    width: 120
                }],
                height: GRID_HEIGHT,
                sortable: true,
                editable: true,
                filterable: true,
                navigatable: true,
                toolbar: [{
                    name: "create",
                    text: messages.addNew
                },{
                    name: "remove",
                    icon: "minus",
                    text: messages.remove,
                    click: () => {
                        var grid = that.grid,
                            ds = grid.dataSource,
                            selected = grid.selectedKeyNames();

                        if (selected && selected.length > 0) {
                            selected.map(i => {
                                ds.remove(ds.get(i));
                            });
                        }
                    }
                }],
                dataSource: {
                    data: this.model.resources,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { from: "id", defaultValue: undefined, validation: { required: { message: messages.resourcesHeader + " is required" } } },
                                value: { from: "value", type: "number", defaultValue: 1, validation: this.options.unitsValidation },
                                format: { from: "format", type: "string" }
                            }
                        }
                    }
                },
                edit: function(e) {
                    var select = e.container.find("select"),
                        ddl = select.data("kendoDropDownList"),
                        currentId = e.model.id,
                        filterOut = options.model.resources.map(r => r.id).filter(r => r !== currentId),
                        filters = filterOut.map(f => ({
                            field: "value",
                            operator: "neq",
                            value: f
                        }));

                    if (ddl) {
                        ddl.dataSource.filter({
                            logic: "and",
                            filters: filters
                        });

                        ddl.setOptions({
                            filter: "contains"
                        });
                    }
                }
            });
        }
    });

    kendo.gantt = {
        PopupEditor: PopupEditor,
        ResourceEditor: ResourceEditor
    };
})(window.kendo.jQuery);
export default kendo;

