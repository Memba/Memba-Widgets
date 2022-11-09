/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.form.js";

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        Observable = kendo.Observable,

        Form = kendo.ui.Form,

        DOT = ".",
        NS = DOT + "kendoTaskBoardPane",

        ACTION = "action",
        CLICK = "click";

    var TaskBoardPaneStyles = {
        element: "k-taskboard-pane",
        edit: "k-taskboard-edit-pane",
        preview: "k-taskboard-preview-pane",
        header: "k-taskboard-pane-header",
        headerText: "k-taskboard-pane-header-text",
        spacer: "k-spacer",
        headerActions: "k-taskboard-pane-header-actions",
        flatButton: "k-button k-icon-button k-button-md k-rounded-md k-button-flat k-button-flat-base",
        content: "k-taskboard-pane-content",
        footerActions: "k-taskboard-pane-actions",
        footerActionButtons: "k-actions k-hstack k-justify-content-end",
        footerButton: "k-button k-button-md k-rounded-md k-button-solid",
        baseButton: "k-button-solid-base",
        primaryButton: "k-button-solid-primary"
    };

    var TaskBoardPane = Observable.extend({
        init: function(taskboard, options, dataItem, resources) {
            var that = this;

            that.taskboard = taskboard;
            that._dataItem = dataItem;
            that.resources = resources;
            that.options = extend(true, {}, options);

            that._render();

            that.element.on(CLICK + NS,
                "[" + kendo.attr("command") + "]",
                that._commandClick.bind(that));

            Observable.fn.init.call(that);
        },
        headerTemplate: '<div class="#:styles.headerText#">{0}</div>' +
                        '<span class="#:styles.spacer#"></span>' +
                        '<div class="#:styles.headerActions#">' +
                            '<button class="#:styles.flatButton#" title="#:messages.close#" #:kendo.attr("command")#="ClosePaneCommand">' +
                                '<span class="k-button-icon k-icon k-i-close"></span>' +
                            '</button>' +
                        '</div>',
        buttonTemplate: '<button class="#:styles.footerButton##if(primary){# #:styles.primaryButton# # } else { # #:styles.baseButton# # } #" title="#:text#" #:kendo.attr("command")#="#:command#" #:kendo.attr("options")#="#:options#">' +
                            '<span class="k-button-icon #:icon# #:spriteCssClass#"></span>' +
                            '<span class="k-button-text">#:text#</span>' +
                        '</button>',
        contentTemplate: '',
        builtinButtons: {
            "edit": { name: "edit", icon: "edit", text: "Edit", primary: true, command: "EditCardCommand", rules: "isEditable" },
            "delete": { name: "delete", icon: "delete", text: "Delete", command: "DeleteCardCommand", rules: "isEditable" },
            "cancel": { name: "cancel", text: "Cancel", command: "ClosePaneCommand" },
            "saveChanges": { name: "saveChanges", text: "Save", command: "SaveChangesCommand", primary: true, rules: "isEditable" },
            "create": { name: "create", text: "Create", command: "SaveChangesCommand", primary: true, rules: "isEditable" }
        },
        defaultButtons: [],
        _render: function() {
            var that = this,
                styles = TaskBoardPane.styles,
                element = $("<div class='" + styles.element + "'></div>"),
                header = $("<div class='" + styles.header + "'></div>"),
                content = $("<div class='" + styles.content + "'></div>"),
                buttonsContainer = $("<div class='" + styles.footerActions + " " + styles.footerActionButtons + "'></div>");

            that.header = header.appendTo(element);
            that._renderHeader();
            that.content = content.appendTo(element);
            that._renderContent();
            that.buttonsContainer = buttonsContainer.appendTo(element);
            that.buttonsContainer.append(that._buildButtonsHtml());
            that.element = element;
        },
        _renderHeader: function() {
            var that = this,
                styles = TaskBoardPane.styles,
                options = that.options,
                messages = options.messages,
                headerTemplate = options.headerTemplate ? options.headerTemplate : that._buildHeaderTemplate(),
                resources = that._resources(that._dataItem);

            that.header.append(kendo.template(headerTemplate)(extend(true, {}, {
                styles: styles,
                messages: messages,
                resources: resources
            }, that._dataItem)));
        },
        _buildHeaderTemplate: function() {
            var that = this;
            return kendo.format(that.headerTemplate, "#:" + that.options.dataTitleField + "#");
        },
        _renderContent: function() {
            var that = this,
                styles = TaskBoardPane.styles,
                options = that.options,
                messages = options.messages,
                contentTemplate = options.template || that.contentTemplate,
                resources = that._resources(that._dataItem);

            that.content.append(kendo.template(contentTemplate)(extend(true, {}, {
                styles: styles,
                messages: messages,
                resources: resources
            }, that._dataItem)));
        },
        _resources: function(card) {
            var that = this,
                resources = {};

            if (!that.resources) {
                return resources;
            }

            for (var key in that.resources) {
                var resource = that.resources[key];
                var field = resource.field;
                var cardResources = kendo.getter(field)(card);

                if (!cardResources) {
                    continue;
                }

                if (!resource.multiple) {
                    cardResources = [cardResources];
                }

                var data = resource.dataSource.view();

                for (var resourceIndex = 0; resourceIndex < cardResources.length; resourceIndex++) {
                    var cardResource = null;

                    var value = cardResources[resourceIndex];

                    if (!resource.valuePrimitive) {
                        value = kendo.getter(resource.dataValueField)(value);
                    }

                    for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                        if (data[dataIndex].get(resource.dataValueField) == value) {
                            cardResource = data[dataIndex];
                            break;
                        }
                    }

                    if (cardResource !== null) {
                        var resourceColor = kendo.getter(resource.dataColorField)(cardResource);
                        var result = {
                            field: resource.field,
                            title: resource.title,
                            name: resource.name,
                            text: kendo.getter(resource.dataTextField)(cardResource),
                            value: value,
                            color: resourceColor
                        };

                        if (resource.multiple) {
                            if (resources[resource.field]) {
                                resources[resource.field].push(result);
                            } else {
                                resources[resource.field] = [result];
                            }
                        } else {
                            resources[resource.field] = result;
                        }
                    }
                }
            }
            return resources;
        },
        _buildButtonsHtml: function() {
            var that = this,
                options = that.options,
                messages = options.messages,
                buttons = options.buttons || that.defaultButtons,
                styles = TaskBoardPane.styles,
                html = "";

            for (var i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                button = ($.isPlainObject(button) && Object.keys(button).length === 1 && button.name) ? button.name : button;

                if (typeof button === "string") {
                    button = extend(true, {},
                        that.builtinButtons[button] || { spriteCssClass: button, command: button + "Command" },
                        { text: messages[button] || button }
                    );
                } else if ($.isPlainObject(button) && button.name) {
                    button = extend(true, button,
                        { text: messages[button.name] }
                    );
                }

                if (!that._validateRules(button)) {
                    continue;
                }

                var icon = button.icon ? "k-icon k-i-" + button.icon : "";

                button.icon = icon;
                button.spriteCssClass = button.spriteCssClass || "";

                html += kendo.template(that.buttonTemplate)(extend(true, {}, {
                    styles: styles,
                    messages: messages,
                    primary: false,
                    options: null
                }, button));
            }

            return html;
        },
        _commandClick: function(ev) {
            var that = this,
                target = $(ev.target).closest("[" + kendo.attr("command") + "]"),
                command = target.attr(kendo.attr("command")),
                options = target.attr(kendo.attr("options")),
                card = that._dataItem;

            options = typeof(options) === "string" ? { value: options } : options;

            if (!command) {
                return;
            }

            that.trigger(ACTION, {
                command: command,
                options: extend({ card: card }, options)
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
        destroy: function() {
            var that = this;

            that.element.off(NS);
            that.element.remove();
        }
    });

    var TaskBoardPreviewPane = TaskBoardPane.extend({
        init: function(taskboard, options, dataItem, resources) {
            var that = this;

            options = extend({}, options.previewPane, {
                dataTitleField: options.dataTitleField,
                dataDescriptionField: options.dataDescriptionField,
                messages: options.messages,
                states: options.states
            });

            that.contentTemplate = kendo.format(that._contentTemplate, options.dataDescriptionField);

            TaskBoardPane.fn.init.call(that, taskboard, options, dataItem, resources);

            that.element.addClass(TaskBoardPane.styles.preview);
        },
        _contentTemplate: "<p>#:{0}#</p>",
        defaultButtons: [ "delete", "edit" ]
    });

    var TaskBoardEditPane = TaskBoardPane.extend({
        init: function(taskboard, options, dataItem) {
            var that = this;

            options = extend({}, options.editable, {
                dataTitleField: options.dataTitleField,
                dataDescriptionField: options.dataDescriptionField,
                messages: options.messages,
                states: options.states
            });

            that.formSettings = extend(that.formSettings, {
                items: [
                    { field: options.dataTitleField, label: options.messages[options.dataTitleField] },
                    { field: options.dataDescriptionField, label: options.messages[options.dataDescriptionField] }
                ]
            }, options.form);

            TaskBoardPane.fn.init.call(that, taskboard, options, dataItem);

            that.element.addClass(TaskBoardPane.styles.edit);
        },
        defaultButtons: [ "cancel", "saveChanges" ],
        formSettings: {
            buttonsTemplate: ""
        },
        _buildHeaderTemplate: function() {
            var that = this;
            return kendo.format(that.headerTemplate, that.options.messages.edit + " #:" + that.options.dataTitleField + "#");
        },
        _renderContent: function() {
            var that = this,
                options = that.options,
                styles = TaskBoardPane.styles,
                formSettings = options.form || that.formSettings,
                formLabelId = kendo.guid(),
                element = $("<div></div>")
                    .attr("role", "form")
                    .attr("aria-labelledby", formLabelId);

            that.header.find(DOT + styles.headerText).attr("id", formLabelId);

            that.content.append(element);

            that.form = new Form(element, extend({}, formSettings, {
                formData: that._dataItem
            }));

            that.form.element.find("input").trigger("focus");
        }
    });

    var TaskBoardCreatePane = TaskBoardEditPane.extend({
        init: function(taskboard, options, dataItem, resources, column) {
            var that = this,
                columnStatusField = options.columnSettings.dataStatusField,
                firstColumn = taskboard.columnsDataSource.view().at(0),
                status = column ? column[columnStatusField] : firstColumn[columnStatusField],
                clone = extend({}, dataItem);

            dataItem = taskboard.dataSource.add();
            dataItem.set(options.dataStatusField, status);

            for (var key in clone) {
                dataItem.set(key, clone[key]);
            }

            TaskBoardEditPane.fn.init.call(that, taskboard, options, dataItem, resources);
        },
        _buildHeaderTemplate: function() {
            var that = this;
            return kendo.format(that.headerTemplate, that.options.messages.createNewCard);
        },
        defaultButtons: [ "cancel", "create" ]
    });

    extend(kendo.ui.taskboard, {
        Pane: TaskBoardPane,
        panes: {
            Preview: TaskBoardPreviewPane,
            Edit: TaskBoardEditPane,
            Create: TaskBoardCreatePane
        }
    });

    extend(true, kendo.ui.taskboard.Pane, { styles: TaskBoardPaneStyles });

})(window.kendo.jQuery);

