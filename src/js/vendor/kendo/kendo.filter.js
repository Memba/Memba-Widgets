/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.core.js";
import "./kendo.buttongroup.js";
import "./kendo.icons.js";
import "./kendo.toolbar.js";

var __meta__ = {
    id: "filter",
    name: "Filter",
    category: "web",
    depends: ["core", "buttongroup", "icons", "toolbar"]
};

var defaultValues = {
    "number": 0,
    "boolean": false,
    "string": "",
    "date": ""
};


var logicToolbarItemConfig = ({ ns, operators }) =>
({
    type: "component", element: `<div data-${ns}bind="value: logic"></div>`, component: "FilterButtonGroup",
    componentOptions: {
        items: Object.keys(operators || {}).map(op => ({ value: op, text: (operators[op].text || operators[op]), attributes: { value: op } }))
    },
    attributes: { "data-bind": "value: logic", title: "logic" }
});

var mainContainer = (ariaLabel) =>
    `<ul class='k-filter-container' role='tree' aria-label='${ariaLabel}'>` +
        "<li class='k-filter-group-main' role='treeitem'></li>" +
    "</ul>";

var mainLogicTemplate = ({ mainFilterLogicLabel, uid, addExpression, addGroup, close, ns, operators }) =>
    "<div class='k-filter-toolbar'>" +
        `<div class='k-toolbar' aria-label='${mainFilterLogicLabel}' id='${uid}'></div>` +
    "</div>";

var logicItemTemplate = ({ filterLogicLabel, addExpression, addGroup, close, ns, operators }) =>
    "<li class='k-filter-item' role='treeitem'>" +
        "<div class='k-filter-toolbar'>" +
            `<div role='toolbar' aria-label='${filterLogicLabel}' class='k-toolbar'></div>` +
        "</div>" +
    "</li>";

var expressionItemTemplate = ({ filterExpressionLabel, uid }) =>
    "<li class='k-filter-item' role='treeitem'>" +
        "<div class='k-filter-toolbar'>" +
            `<div role='group' aria-label='${filterExpressionLabel}' class='k-toolbar' id='${uid}'></div>` +
        "</div>" +
    "</li>";


(function($) {
    var kendo = window.kendo,
        ui = kendo.ui,
        guid = kendo.guid,
        ns = kendo.ns,
        keys = kendo.keys,
        Widget = ui.Widget,
        ButtonGroup = ui.ButtonGroup,
        KENDO_FOCUSABLE = ":kendoFocusable",
        CHANGE = "change",
        TABINDEX = "tabindex",
        NS = ".kendoFilter",
        EQ = "Is equal to",
        NEQ = "Is not equal to";

    var editors = {
        "number": function(container, { field }) {
            $(`<input tabindex='-1' id='${guid()}' type='text' aria-label='${field}' title='${field}' data-${ns}role='numerictextbox' data-${ns}bind='value: value'/>`).appendTo(container);
        },
        "string": function(container, { field }) {
            $(`<span class='k-textbox k-input k-input-md k-rounded-md k-input-solid'><input tabindex='-1' id='${guid()}' type='text' aria-label='${field}' title='${field}' class='k-input-inner' data-${kendo.ns}bind='value: value'/></span>`).appendTo(container);
        },
        "boolean": function(container, { field }) {
            $(`<input tabindex='-1' id='${guid()}' class='k-checkbox k-checkbox-md k-rounded-md' aria-label='${field}' data-${ns}role='checkbox' data-${ns}bind='checked: value' type='checkbox'>`).appendTo(container);
        },
        "date": function(container, { field }) {
            $(`<input tabindex='-1' id='${guid()}' type='text' aria-label='${field}' title='${field}' data-${ns}role='datepicker' data-${ns}bind='value: value'/>`).appendTo(container);
        }
    };

    var FilterButtonGroup = ButtonGroup.extend({
        init: function(element, options) {
            var that = this;
            ButtonGroup.fn.init.call(that, element, options);
        },

        options: {
            name: "FilterButtonGroup"
        },

        value: function(value) {
            if (value === undefined) {
                return this._value;
            }
            this._value = value;
            ButtonGroup.fn._select.call(this, this.wrapper.find("[value='" + value + "']"));
            this.trigger(CHANGE);
        },

        _select: function(button) {
            if (button !== -1) {
                this.value($(button).attr("value"));
            }
        }
    });

    var Filter = Widget.extend({
        init: function(element, options) {
            var that = this;
            var html;

            Widget.fn.init.call(that, element, options);

            that.element = $(element).addClass("k-filter");
            that.dataSource = options.dataSource;
            that.operators = $.extend(that.options.operators, options.operators);

            that._getFieldsInfo();
            that._modelChangeHandler = that._modelChange.bind(that);
            that._renderMain();
            if (options.expression) {
                that._addExpressionTree(that.filterModel);
            }
            that._renderApplyButton();
            if (that.options.expressionPreview) {
                if (!that._previewContainer) {
                    that._previewContainer = $('<div class="k-filter-preview"></div>').insertAfter(that.element.children().eq(0));
                }
                html = that._createPreview(that.filterModel.toJSON());
                that._previewContainer.html(html);
            }
            that._attachEvents();
            that.hasCustomOperators();

            var toolbars = $(that.element).find('.k-filter-toolbar > .k-toolbar');
            toolbars.attr(TABINDEX, -1);
            toolbars.find(KENDO_FOCUSABLE).attr(TABINDEX, -1);
            toolbars.eq(0).attr(TABINDEX, 0);
        },

        events: [
            CHANGE
        ],

        options: {
            name: "Filter",
            dataSource: null,
            expression: null,
            applyButton: false,
            fields: [],
            mainLogic: "and",
            messages: {
                and: "And",
                or: "Or",
                apply: "Apply",
                close: "Close",
                addExpression: "Add Expression",
                fields: "Fields",
                filterExpressionLabel: "filter expression",
                filterLogicLabel: "filter logic",
                filterAriaLabel: "filter component",
                mainFilterLogicLabel: "main filter logic",
                operators: "Operators",
                addGroup: "Add Group"
            },
            operators: {
                string: {
                    eq: EQ,
                    neq: NEQ,
                    startswith: "Starts with",
                    contains: "Contains",
                    doesnotcontain: "Does not contain",
                    endswith: "Ends with",
                    isnull: "Is null",
                    isnotnull: "Is not null",
                    isempty: "Is empty",
                    isnotempty: "Is not empty",
                    isnullorempty: "Has no value",
                    isnotnullorempty: "Has value"
                },
                number: {
                    eq: EQ,
                    neq: NEQ,
                    gte: "Is greater than or equal to",
                    gt: "Is greater than",
                    lte: "Is less than or equal to",
                    lt: "Is less than",
                    isnull: "Is null",
                    isnotnull: "Is not null"
                },
                date: {
                    eq: EQ,
                    neq: NEQ,
                    gte: "Is after or equal to",
                    gt: "Is after",
                    lte: "Is before or equal to",
                    lt: "Is before",
                    isnull: "Is null",
                    isnotnull: "Is not null"
                },
                "boolean": {
                    eq: EQ,
                    neq: NEQ
                }
            }
        },

        applyFilter: function() {
            var filter = this.filterModel.toJSON();

            if (this._hasCustomOperators) {
                this._mapOperators(filter);
            }
            if (this._hasFieldsFilter(filter.filters || [])) {
                this._removeEmptyGroups(filter.filters);
                this.dataSource.filter(filter);
            } else {
                this.dataSource.filter({});
            }
        },

        destroy: function() {
            this.element.off(NS);
            kendo.destroy(this.element.find(".k-filter-group-main"));
            this._previewContainer = null;
            this._applyButton = null;
            this._modelChangeHandler = null;
            Widget.fn.destroy.call(this);
        },

        setOptions: function(options) {
            kendo.deepExtend(this.options, options);
            this.destroy();
            this.element.empty();
            this.init(this.element, this.options);
        },

        getOptions: function() {
            var result = $.extend(true, {}, this.options);
            delete result.dataSource;
            result.expression = this.filterModel.toJSON();

            return result;
        },

        _addExpressionTree: function(model) {
            if (model.filters) {
                var parent = this.element.find("[id=" + model.uid + "]");
                for (var i = 0; i < model.filters.length; i++) {
                    if (model.filters[i].logic) {
                        this._addGroup(parent, model.filters[i]);
                    } else {
                        this._addExpression(parent, model.filters[i]);
                    }
                    if (model.filters[i].filters) {
                        this._addExpressionTree(model.filters[i]);
                    }
                }
            }
        },

         _click: function(e) {
            var that = this;
            e.preventDefault();

            var button = $(e.currentTarget);
            var command = button.data("command");

            if (command == "x") {
                that._removeExpression(button.closest(".k-toolbar"));
            } else if (command == "expression") {
                that._addExpression(button.closest(".k-toolbar"));
            } else if (command == "group") {
                that._addGroup(button.closest(".k-toolbar"));
            } else if (command == "apply") {
                that.applyFilter();
            }
        },

        _keydown: function(ev) {
            var that = this,
                target = $(ev.target),
                key = ev.keyCode;
            var currentToolbar = target.closest(".k-toolbar");
            var isToolbar = target.is(".k-toolbar");

            if (key === keys.UP && isToolbar) {
                ev.preventDefault();
                that._focusToolbar(currentToolbar, "prev");
            } else if (key == keys.DOWN && isToolbar) {
                ev.preventDefault();
                that._focusToolbar(currentToolbar, "next");
            } else if (key == keys.ESC) {
                ev.stopPropagation();
                that._focusToolbar(currentToolbar);
            } else if (key == keys.ENTER && isToolbar) {
                let item = currentToolbar.find(".k-toolbar-item").eq(0);
                item.attr(TABINDEX, 0).trigger("focus");
            }
        },

        _attachEvents: function() {
            var that = this,
            clickProxy = that._click.bind(that),
            keydownProxy = that._keydown.bind(that);

            that.element
                .on("click" + NS, "button.k-button", clickProxy)
                .on("keydown" + NS, '.k-filter-toolbar > .k-toolbar, .k-filter-toolbar > .k-toolbar .k-toolbar-item', keydownProxy);
        },

        _focusToolbar: function(toolbarEl, direction, index) {
            var that = this;
            var toolbarToFocus = toolbarEl;
            var toolbars = $(that.element).find('.k-filter-toolbar > .k-toolbar');
            toolbars.attr(TABINDEX, -1);
            toolbars.find(KENDO_FOCUSABLE).attr(TABINDEX, -1);

            if (direction == "next") {
                let next = Math.min(toolbars.length - 1, index || (toolbars.index(toolbarEl) + 1));
                toolbarToFocus = toolbars.eq(next);
            } else if (direction == "prev") {
                let prev = Math.max(0, index || (toolbars.index(toolbarEl) - 1));
                toolbarToFocus = toolbars.eq(prev);
            }

            toolbarToFocus.attr(TABINDEX, 0).trigger("focus");
        },

        _addExpression: function(parentContainer, model) {
            var that = this;
            var parentUID = parentContainer.attr("id");
            var itemsContainer = parentContainer.closest(".k-filter-toolbar").next("ul.k-filter-lines");
            var field = model ? that._fields[model.field] : that._defaultField;
            var expressionModel;
            var itemHTML = "";

            if (model) {
                expressionModel = model;
            } else {
                expressionModel = findModel(that.filterModel, parentUID);

                if (!expressionModel.filters) {
                    expressionModel.set("filters", []);
                }

                expressionModel = that._addNewModel(expressionModel.filters, field);
            }

            if (!itemsContainer.length) {
                itemsContainer = $("<ul class='k-filter-lines' role='group'></ul>").appendTo(parentContainer.closest("li"));
            }

            var templateOptions = {
                fields: that._fields,
                operators: that.operators[field.type],
                close: that.options.messages.close,
                fieldsLabel: that.options.messages.fields,
                uid: expressionModel.uid,
                ns: kendo.ns,
                filterExpressionLabel: that.options.messages.filterExpressionLabel
            };

            itemHTML = $(kendo.template(expressionItemTemplate)(templateOptions)).appendTo(itemsContainer);
            var toolbarEl = itemHTML.find(".k-toolbar").first();
            var templateOperators = field.operators && field.operators[field.type] ? field.operators[field.type] : this.operators[field.type];

            toolbarEl.kendoToolBar({
                resizable: false,
                items: [
                    {
                        type: "component",
                        component: "DropDownList",
                        element: `<select data-${ns}bind="value: field" class='k-filter-dropdown' title='${that.options.messages.fields}' aria-label='${that.options.messages.fields}' data-auto-width='true'></select>`,
                        attributes: { 'class': "k-filter-field" },
                        componentOptions: {
                            title: that.options.messages.fields,
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: Object.keys(that._fields || {}).map(current => ({ value: that._fields[current].name, text: that._fields[current].label }))
                        }
                    },{
                        type: "component",
                        component: "DropDownList",
                        element: `<select data-${ns}bind="value: operator" aria-label='${that.options.messages.operators}' title='${that.options.messages.operators}'></select>`,
                        attributes: { 'class': "k-filter-operator" },
                        componentOptions: {
                            title: that.options.messages.operators,
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: Object.keys(templateOperators || {}).map(op => ({ value: op, text: (templateOperators.text || templateOperators[op]) }))
                        }
                    },
                    {
                        attributes: { class: "k-filter-value" },
                        template: " "
                    },
                    { type: "button", icon: 'x', fillMode: "flat", attributes: { "data-command": "x", title: templateOptions.close, 'aria-label': templateOptions.close } }
                ]
            });

            that._addExpressionControls(itemHTML.find(".k-toolbar"), field, expressionModel);

            if (!model) {
                that._expressionChange();
            }
        },

        _addExpressionControls: function(container, field, filterModel) {
            var operatorsContainer = container.find(".k-toolbar-item.k-filter-operator");
            var editorContainer = container.find(".k-toolbar-item.k-filter-value");
            editorContainer.addClass("k-toolbar-tool");
            kendo.destroy(editorContainer);
            editorContainer.empty();

            this._bindOperators(operatorsContainer, field);
            this._appendEditor(editorContainer, field);
            this._bindModel(container, filterModel);
            this._showHideEditor(container, filterModel);

            container.find(KENDO_FOCUSABLE).attr(TABINDEX, -1);
        },

        _bindOperators: function(container, field) {
            var templateOperators = field.operators && field.operators[field.type] ? field.operators[field.type] : this.operators[field.type];
            var dropDownList = container.find('select[data-role=dropdownlist]').getKendoDropDownList();
            if (dropDownList) {
                dropDownList.setDataSource(Object.keys(templateOperators || {}).map(op => ({ value: op, text: (templateOperators.text || templateOperators[op]) })));
            }
        },

        _appendEditor: function(container, field) {
            if (kendo.isFunction(field.editor)) {
                field.editor(container, $.extend(true, {}, { field: field.name }));
            } else {
                $(kendo.template(field.editor)({ ns: kendo.ns, field: field.name, id: kendo.guid() })).appendTo(container);
            }
        },

        _addNewModel: function(parent, field) {
            var filterModel;
            var type = field.type;
            var operators = field.operators;
            var operator;
            if (!operators) {
                operators = this.options.operators;
            }

            operator = Object.keys(operators[type])[0];

            parent.push({ field: field.name });
            filterModel = parent[parent.length - 1];

            filterModel.set("value", field.defaultValue);
            filterModel.set("operator", operator);

            return filterModel;
        },

        _addGroup: function(parent, model) {
            var that = this;
            var filterModel = that.filterModel;
            var parentUID = parent.attr("id");
            var itemsContainer = parent.closest(".k-filter-toolbar").next("ul.k-filter-lines");
            var logicHTML;

            if (model) {
                filterModel = model;

            } else {
                filterModel = findModel(filterModel, parentUID);

                if (!filterModel.filters) {
                    filterModel.set("filters", []);
                }
                filterModel.filters.push({ logic: that.options.mainLogic });
                filterModel = filterModel.filters[filterModel.filters.length - 1];
            }

            if (!itemsContainer.length) {
                itemsContainer = $("<ul class='k-filter-lines' role='group'></ul>").appendTo(parent.closest("li"));
            }

            var templateOptions = {
                operators: {
                    and: that.options.messages.and,
                    or: that.options.messages.or
                },
                addExpression: that.options.messages.addExpression,
                addGroup: that.options.messages.addGroup,
                close: that.options.messages.close,
                ns: kendo.ns,
                filterLogicLabel: that.options.messages.filterLogicLabel
            };

            logicHTML = $(kendo.template(logicItemTemplate)(templateOptions)).appendTo(itemsContainer);

            var toolbarEl = logicHTML.find(".k-toolbar");
            that._initGroupToolBar(toolbarEl, templateOptions);

            that._bindModel(toolbarEl, filterModel);

            if (!model) {
                that._expressionChange();
            }
        },

        _bindModel: function(container, model) {
            container.attr("id", model.uid);

            model.bind("change", this._modelChangeHandler);
            kendo.bind(container, model);

            container.parent().attr(kendo.attr("stop"), true);
        },

        _createPreview: function(filter) {
            var html = "";
            var createdField = false;
            var haveFields = this._hasFieldsFilter(filter.filters || []);
            var childhtml = "";
            var current;
            var field;

            if (!filter.filters || !filter.filters.length || !haveFields) {
                return "";
            }
            html += '<span class="k-filter-preview-bracket">(</span>';
            for (var i = 0; i < filter.filters.length; i++) {
                current = filter.filters[i];

                if (current.filters) {
                    childhtml = this._createPreview(current);
                    if (childhtml) {
                        if (createdField) {
                            html += '<span class="k-filter-preview-operator"> ' + filter.logic.toLocaleUpperCase() + ' </span>';
                        }
                        createdField = true;
                    }
                    html += childhtml;
                }
                if (current.field) {
                    field = this._fields[current.field];
                    if (createdField) {
                        html += '<span class="k-filter-preview-operator"> ' + filter.logic.toLocaleUpperCase() + ' </span>';
                    }
                    createdField = true;
                    html += '<span class="k-filter-preview-field">' + field.label + '</span>';
                    html += '<span class="k-filter-preview-criteria"> ' + this._getOperatorText(current.field, current.operator);
                    if (current.operator.indexOf("is") < 0) {
                        html += ' </span>';
                        html += "<span class='k-filter-preview-value'>'" + kendo.htmlEncode(field.previewFormat ? kendo.toString(current.value, field.previewFormat) : current.value) + "'</span>";
                    } else {
                        html += '</span>';
                    }
                }
            }
            html += '<span class="k-filter-preview-bracket">)</span>';
            return html;
        },

        _expressionChange: function() {
            var that = this;
            var filter = that.filterModel.toJSON();
            var html = "";

            if (that.options.expressionPreview) {
                html = that._createPreview(filter);
                that._previewContainer.html(html);
            }

            that.trigger(CHANGE, { expression: filter });
        },

        _getOperatorText: function(field, operator) {
            var type = this._fields[field].type;
            var operators = this._fields[field].operators;

            if (!operators) {
                operators = this.options.operators;
            }

            return operators[type][operator].text || operators[type][operator];
        },

        _addField: function(fieldInfo, field) {
            var that = this;
            fieldInfo = $.extend(true, {}, {
                name: fieldInfo.name || field,
                editor: fieldInfo.editorTemplate || editors[fieldInfo.type || "string"],
                defaultValue: (fieldInfo.defaultValue || fieldInfo.defaultValue === false || fieldInfo.defaultValue === 0) ? fieldInfo.defaultValue : defaultValues[fieldInfo.type || "string"],
                type: fieldInfo.type || "string",
                label: fieldInfo.label || fieldInfo.name || field,
                operators: fieldInfo.operators,
                previewFormat: fieldInfo.previewFormat
            });
            that._fields[fieldInfo.name] = fieldInfo;
            if (!that._defaultField) {
                that._defaultField = fieldInfo;
            }
        },

        _getFieldsInfo: function() {
            var that = this;
            var fieldsCollection = that.options.fields.length ? that.options.fields : (that.options.dataSource.options.schema.model || {}).fields;
            var fieldInfo;

            that._fields = {};

            if (Array.isArray(fieldsCollection)) {
                for (var i = 0; i < fieldsCollection.length; i++) {
                    fieldInfo = fieldsCollection[i];
                    that._addField(fieldInfo);
                }
            } else {
                for (var field in fieldsCollection) {
                    fieldInfo = fieldsCollection[field];
                    that._addField(fieldInfo, field);
                }
            }
        },

        _hasFieldsFilter: function(filters, haveField) {
            haveField = !!haveField;

            for (var i = 0; i < filters.length; i++) {
                if (filters[i].filters) {
                    haveField = this._hasFieldsFilter(filters[i].filters, haveField);
                }
                if (filters[i].field) {
                    return true;
                }
            }

            return haveField;
        },

        _removeEmptyGroups: function(filters) {
            if (!filters) {
                return;
            }
            for (var i = filters.length - 1; i >= 0; i--) {
                if ((filters[i].logic && !filters[i].filters) || (filters[i].filters && !this._hasFieldsFilter(filters[i].filters))) {
                    filters.splice(i, 1);
                    continue;
                }

                if (filters[i].filters) {
                    this._removeEmptyGroups(filters[i].filters);
                }
            }
        },

        _modelChange: function(e) {
            var that = this;
            var container = that.element.find("[id=" + e.sender.uid + "]");

            that._showHideEditor(container, e.sender);
            if (e.field !== "field") {
                if (e.field !== "filters") {
                    that._expressionChange();
                }
                return;
            }

            var newField = e.sender.field;
            var parent = e.sender.parent();
            var field = that._fields[newField];
            var filterModel = that._addNewModel(parent, field);

            e.sender.unbind("change", that._modelChangeHandler);

            parent.remove(e.sender);

            that._addExpressionControls(container, field, filterModel);

            that._expressionChange();
        },

        _renderMain: function() {
            var that = this;

            $(mainContainer(that.options.messages.filterAriaLabel)).appendTo(that.element);

            if (that.options.expression) {
                that.filterModel = kendo.observable(that.options.expression);
            } else {
                that.filterModel = kendo.observable({
                    logic: that.options.mainLogic
                });
            }

            var templateOptions = {
                operators: {
                    and: that.options.messages.and,
                    or: that.options.messages.or
                },
                addExpression: that.options.messages.addExpression,
                addGroup: that.options.messages.addGroup,
                close: that.options.messages.close,
                uid: that.filterModel.uid,
                ns: kendo.ns,
                mainFilterLogicLabel: that.options.messages.mainFilterLogicLabel
            };

            var logicEl = $(kendo.template(mainLogicTemplate)(templateOptions));
            logicEl.appendTo(that.element.find("li").first());

            var toolbarEl = logicEl.find(".k-toolbar").first();
            that._initGroupToolBar(toolbarEl, templateOptions);

            that._bindModel(toolbarEl, that.filterModel);
        },

        _initGroupToolBar: function(element, templateOptions) {
            element.kendoToolBar({
                resizable: false,
                items: [
                    logicToolbarItemConfig(templateOptions),
                    { type: "button", icon: 'filter-add-expression', attributes: { "data-command": "expression", title: templateOptions.addExpression, 'aria-label': templateOptions.addExpression } },
                    { type: "button", icon: 'filter-add-group', attributes: { "data-command": "group", title: templateOptions.addGroup, 'aria-label': templateOptions.addGroup } },
                    { type: "button", icon: 'x', fillMode: "flat", attributes: { "data-command": "x", title: templateOptions.close, 'aria-label': templateOptions.close } }
                ]
            });
        },

        _removeExpression: function(parent) {
            var that = this;
            var parentUID = parent.attr("id");
            var itemContainer = parent.closest("li");
            var isMain = itemContainer.hasClass("k-filter-group-main");
            var parentModel;
            var model;
            var index = -1;

            if (isMain) {
                itemContainer = itemContainer.find(".k-filter-lines");
                if (that.filterModel.filters) {
                    that.filterModel.filters.empty();
                    delete that.filterModel.filters;
                }
            } else {
                let toolbars = $(that.element).find('.k-filter-toolbar > .k-toolbar');
                index = toolbars.index(parent);
                model = findModel(that.filterModel, parentUID);
                parentModel = model.parent();
                model.unbind("change", that._modelChangeHandler);
                parentModel.remove(model);
                if (!parentModel.length) {
                    delete parentModel.parent().filters;
                }
                if (!itemContainer.siblings().length) {
                    itemContainer = itemContainer.parent();
                }
            }

            kendo.destroy(itemContainer);
            itemContainer.remove();
            that._expressionChange();

            if (index > -1) {
                that._focusToolbar(parent, "next", index);
            }
        },

        _renderApplyButton: function() {
            var that = this;

            if (!that.options.applyButton) {
                return;
            }

            if (!that._applyButton) {
                that._applyButton = $(kendo.format('<button type="button" data-command="apply" aria-label="{0}" title="{0}" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-filter-apply">{0}</button>', that.options.messages.apply)).appendTo(that.element);
            }
        },

        _showHideEditor: function(container, model) {
            if (model.logic) {
                return;
            }

            var operator = model.operator;
            var editorContainer = container.find(".k-toolbar-item.k-filter-value");
            if (operator == "isnull" || operator == "isnotnull" || operator == "isempty" ||
                operator == "isnotempty" || operator == "isnullorempty" || operator == "isnotnullorempty") {
                editorContainer.hide();
            } else {
                editorContainer.show();
            }
        },

        _mapOperators: function(expression) {
            var that = this;
            if (expression.filters) {
                expression.filters.forEach(function(filter) {
                    if (filter.filters) {
                        that._mapOperators(filter);
                    } else {
                        var operator;
                        var field = that._fields[filter.field];
                        var type = field.type;
                        if (field.operators && field.operators[type][filter.operator]) {
                            operator = field.operators[type][filter.operator];
                        } else {
                            operator = that.operators[type][filter.operator];
                        }

                        if (operator) {
                            filter.operator = operator.handler || filter.operator;
                        }
                    }
                });
            }
        },

        hasCustomOperators: function() {
            var operators = $.extend(true, {}, this.operators);

            for (var field in this._fields) {
                operators = $.extend(true, {}, operators, this._fields[field].operators);
            }
            this._hasCustomOperators = findCustomOperators(operators);
        }

    });

    function findCustomOperators(operators) {
        for (var field in operators) {
            var operator = operators[field];
            if ((operator.handler && typeof operator.handler === "function") ||
                (typeof operator === 'object' && operator !== null && findCustomOperators(operator))) {
                return true;
            }
        }
        return false;
    }

    function findModel(model, uid) {

        if (model.uid === uid) {
            return model;
        }

        if (model.filters) {
            for (var i = 0; i < model.filters.length; i++) {
                var temp = findModel(model.filters[i], uid);
                if (temp) {
                    return temp;
                }
            }
        }
    }

    ui.plugin(Filter);
    ui.plugin(FilterButtonGroup);
})(window.kendo.jQuery);
export default kendo;

