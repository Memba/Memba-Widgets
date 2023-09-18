/**
 * Kendo UI v2023.2.829 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.data.js";
import "./kendo.resizable.js";
import "./kendo.switch.js";
import "./kendo.gantt.data.js";
import "./kendo.gantt.editors.js";
import "./kendo.gantt.list.js";
import "./kendo.gantt.timeline.js";
import "./kendo.splitter.js";
import "./kendo.pdf.js";
import "./kendo.toolbar.js";
import "./kendo.html.button.js";

var __meta__ = {
    id: "gantt",
    name: "Gantt",
    category: "web",
    description: "The Gantt component.",
    depends: [ "data", "resizable", "switch", "gantt.data", "gantt.editors", "gantt.list", "gantt.timeline", "pdf", "toolbar", "html.button" ]
};
(function($, undefined) {

    var kendo = window.kendo,
        keys = kendo.keys,
        supportsMedia = "matchMedia" in window,
        mobileOS = kendo.support.mobileOS,
        Widget = kendo.ui.Widget,
        encode = kendo.htmlEncode,
        ObservableObject = kendo.data.ObservableObject,
        ObservableArray = kendo.data.ObservableArray,
        Query = kendo.data.Query,
        isArray = Array.isArray,
        isFunction = kendo.isFunction,
        extend = $.extend,
        isPlainObject = $.isPlainObject,
        outerWidth = kendo._outerWidth,
        outerHeight = kendo._outerHeight,
        defaultIndicatorWidth = 3,

        NS = ".kendoGantt",
        PERCENTAGE_FORMAT = "p0",
        TABINDEX = "tabIndex",
        STRING = "string",
        DOT = ".",
        TASK_DELETE_CONFIRM = "Are you sure you want to delete this task?",
        DEPENDENCY_DELETE_CONFIRM = "Are you sure you want to delete this dependency?",
        VIEWS_DROPDOWN_TEMPLATE = ({ label, styles, views }) => `<select aria-label="${label}" class="k-dropdown k-picker k-dropdown-list ${styles.viewsDropdown}">` +
            `${Object.keys(views).map(view => '<option value="' + view + '">' + views[view].title + '</option>').join("")}` +
        '</select>',
        MIN_SCREEN = "(max-width: 480px)",
        ADD_ACTIONS = [{
            data: "add",
            text: "addChild"
        },
        {
            data: "insert-before",
            text: "insertBefore"
        },
        {
            data: "insert-after",
            text: "insertAfter"
        }];

    var ganttStyles = {
        wrapper: "k-gantt",
        plannedTasks: "k-gantt-planned",
        rowHeight: "k-gantt-rowheight",
        content: "k-gantt-content",
        listWrapper: "k-gantt-treelist",
        list: "k-gantt-treelist",
        timelineWrapper: "k-gantt-timeline",
        timeline: "k-gantt-timeline",
        splitBar: "k-splitbar",
        popupWrapper: "k-list-container",
        popupList: "k-list k-reset",
        resizeHandle: "k-resize-handle",
        icon: "k-icon",
        item: "k-item",
        line: "k-gantt-line",
        buttonDelete: "k-gantt-delete",
        buttonCancel: "k-gantt-cancel",
        buttonSave: "k-gantt-update",
        buttonToggle: "k-gantt-toggle",
        buttonDefaults: "k-button-md k-rounded-md k-button-solid",
        primary: "k-button-solid-primary",
        hovered: "k-hover",
        selected: "k-selected",
        focused: "k-focus",
        focusedCell: "k-focus",
        gridHeader: "k-grid-header",
        gridHeaderWrap: "k-grid-header-wrap",
        gridContent: "k-grid-content",
        tasks: "k-gantt-tasks",
        popup: {
            form: "k-popup-edit-form",
            editForm: "k-gantt-edit-form",
            formContainer: "k-edit-form-container",
            resourcesFormContainer: "k-resources-form-container",
            message: "k-popup-message",
            buttonsContainer: "k-edit-buttons",
            button: "k-button",
            editField: "k-edit-field",
            editLabel: "k-edit-label",
            resourcesField: "k-gantt-resources"
        },
        toolbar: {
            headerWrapper: "k-gantt-header k-gantt-toolbar",
            footerWrapper: "k-gantt-footer k-gantt-toolbar",
            toolbar: "k-gantt-toolbar",
            views: "k-gantt-views",
            viewsWrapper: "k-gantt-views-wrapper",
            viewsDropdown: "k-views-dropdown",
            button: "k-button",
            buttonToggle: "k-gantt-toggle",
            buttonDefaults: "k-button-md k-rounded-md k-button-solid",
            iconPlus: "plus",
            iconPdf: "file-pdf",
            iconToggle: "layout-1-by-4",
            viewButton: "k-view",
            link: "k-link",
            pdfButton: "k-gantt-pdf",
            appendButton: "k-gantt-create"
        }
    };

    function selector(uid) {
        return "[" + kendo.attr("uid") + (uid ? "='" + uid + "']" : "]");
    }

    function trimOptions(options) {
        delete options.name;
        delete options.prefix;

        delete options.remove;
        delete options.edit;
        delete options.add;
        delete options.navigate;

        return options;
    }

    function focusTable(table, direct) {
        var wrapper = table.parents('[' + kendo.attr("role") + '="gantt"]');
        var scrollPositions = [];
        var parents = scrollableParents(wrapper);

        table.attr(TABINDEX, 0);

        if (direct) {
            parents.each(function(index, parent) {
                scrollPositions[index] = $(parent).scrollTop();
            });
        }

        try {
            //The setActive method does not cause the document to scroll to the active object in the current page
            table[0].setActive();
        } catch (e) {
            table[0].focus();
        }

        if (direct) {
            parents.each(function(index, parent) {
                $(parent).scrollTop(scrollPositions[index]);
            });
        }
    }

    function scrollableParents(element) {
        return $(element).parentsUntil("body")
                .filter(function(index, element) {
                    var computedStyle = kendo.getComputedStyles(element, ["overflow"]);
                    return computedStyle.overflow != "visible";
                })
                .add(window);
    }

    var Gantt = Widget.extend({
        init: function(element, options, events) {
            if (isArray(options)) {
                options = { dataSource: options };
            }

            Widget.fn.init.call(this, element, options);

            if (events) {
                this._events = events;
            }

            this._wrapper();

            this._resources();

            if (!this.options.views || !this.options.views.length) {
                this.options.views = ["day", "week", "month"];
            }

            this._timeline();

            this._processDefaults();
            this._toolbar();
            this._footer();
            this._splitter();

            this._adjustDimensions();

            // Prevent extra refresh from setting the view
            this._preventRefresh = true;

            this.view(this.timeline._selectedViewName);

            this._preventRefresh = false;

            this._dataSource();

            this._assignments();

            this._list();

            this._dependencies();

            this._scrollable();

            this._dataBind();

            this._attachEvents();

            this._createEditor();

            kendo.notify(this);
        },

        events: [
            "dataBinding",
            "dataBound",
            "add",
            "edit",
            "remove",
            "cancel",
            "save",
            "change",
            "navigate",
            "moveStart",
            "move",
            "moveEnd",
            "resizeStart",
            "resize",
            "resizeEnd",
            "columnHide",
            "columnReorder",
            "columnResize",
            "columnShow",
            "togglePlannedTasks"
        ],

        options: {
            name: "Gantt",
            autoBind: true,
            navigatable: true,
            selectable: true,
            editable: true,
            resizable: false,
            columnResizeHandleWidth: defaultIndicatorWidth,
            columns: [],
            views: [],
            dataSource: {},
            dependencies: {},
            resources: {},
            assignments: {},
            taskTemplate: null,
            messages: {
                save: "Save",
                cancel: "Cancel",
                destroy: "Delete",
                deleteTaskConfirmation: TASK_DELETE_CONFIRM,
                deleteDependencyConfirmation: DEPENDENCY_DELETE_CONFIRM,
                deleteTaskWindowTitle: "Delete task",
                deleteDependencyWindowTitle: "Delete dependency",
                selectView: "Select view",
                views: {
                    day: "Day",
                    week: "Week",
                    month: "Month",
                    year: "Year",
                    start: "Start",
                    end: "End"
                },
                actions: {
                    append: "Add Task",
                    addChild: "Add Child",
                    insertBefore: "Add Above",
                    insertAfter: "Add Below",
                    pdf: "Export to PDF",
                    toggle: "Toggle pane"
                },
                editor: {
                    editorTitle: "Task",
                    resourcesEditorTitle: "Resources",
                    title: "Title",
                    start: "Start",
                    end: "End",
                    plannedStart: "Planned Start",
                    plannedEnd: "Planned End",
                    percentComplete: "Complete",
                    resources: "Resources",
                    assignButton: "Assign",
                    resourcesHeader: "Resources",
                    unitsHeader: "Units",
                    parent: "Parent",
                    addNew: "Add",
                    name: "Name",
                    percentCompleteHint: "value from 0 to 1",
                    remove: "Remove",
                    actualStart: "Actual Start",
                    actualEnd: "Actual End",
                    parentOptionLabel: "-None-",
                    general: "General",
                    predecessors: "Predecessors",
                    successors: "Successors",
                    other: "Other",
                    dependencyType: "Type"
                },
                plannedTasks: {
                    switchText: "Planned Tasks",
                    offsetTooltipAdvanced: "Met deadline earlier",
                    offsetTooltipDelay: "Delay",
                    seconds: "seconds",
                    minutes: "minutes",
                    hours: "hours",
                    days: "days"
                }
            },
            showWorkHours: true,
            showWorkDays: true,
            toolbar: null,
            workDayStart: new Date(1980, 1, 1, 8, 0, 0),
            workDayEnd: new Date(1980, 1, 1, 17, 0, 0),
            workWeekStart: 1,
            workWeekEnd: 5,
            hourSpan: 1,
            snap: true,
            height: 600,
            listWidth: "30%",
            rowHeight: null,
            showPlannedTasks: false
        },

        select: function(value) {
            var list = this.list;

            if (!value) {
                return list.select();
            }

            if (typeof value === STRING) {
                value = list.content.find(value);
            }

            list.select(value);
            this._selectionUpdate();

            return;
        },

        clearSelection: function() {
            this.list.clearSelection();
            this._selectionUpdate();
        },

        destroy: function() {
            Widget.fn.destroy.call(this);

            if (this.dataSource) {
                this.dataSource.unbind("change", this._refreshHandler);
                this.dataSource.unbind("progress", this._progressHandler);
                this.dataSource.unbind("error", this._errorHandler);
            }

            if (this.dependencies) {
                this.dependencies.unbind("change", this._dependencyRefreshHandler);
                this.dependencies.unbind("error", this._dependencyErrorHandler);
            }

            if (this.timeline) {
                this.timeline.unbind();
                this.timeline.destroy();
            }

            if (this.list) {
                this.list.unbind();
                this.list.destroy();
            }

            if (this.toolbar && this.toolbar.getKendoToolBar()) {
                this.toolbar.getKendoToolBar().destroy();
            }

            if (this.footer && this.footer.getKendoToolBar()) {
                this.footer.getKendoToolBar().destroy();
            }

            if (this._editor) {
                this._editor.destroy();
            }

            if (this._resourceEditorWindow) {
                this._resourceEditorWindow.destroy();
            }

            if (this._resizeDraggable) {
                this._resizeDraggable.destroy();
            }

            if (this.layout && this.layout.getKendoSplitter()) {
                this.layout.getKendoSplitter().destroy();
            }

            this.toolbar.off(NS);

            if (supportsMedia) {
                this._mediaQuery.removeListener(this._mediaQueryHandler);
                this._mediaQuery = null;
            }

            $(window).off("resize" + NS, this._resizeHandler);
            $(this.wrapper).off(NS);

            this.toolbar = null;
            this.footer = null;

            kendo.destroy(this.element);
        },

        setOptions: function(options) {
            var newOptions = kendo.deepExtend({}, this.options, options);

            var events = this._events;

            if (!options.views) {
                var selectedView = this.view().name;

                newOptions.views = $.map(this.options.views, function(view) {
                    var isSettings = isPlainObject(view);
                    var name = isSettings ? ((typeof view.type !== "string") ? view.title : view.type) : view;

                    if (selectedView === name) {
                        if (isSettings) {
                            view.selected = true;
                        } else {
                            view = { type: name, selected: true };
                        }
                    } else if (isSettings) {
                        view.selected = false;
                    }

                    return view;
                });
            }

            if (!options.dataSource) { newOptions.dataSource = this.dataSource; }
            if (!options.dependencies) { newOptions.dependencies = this.dependencies; }
            if (!options.resources) { newOptions.resources = this.resources; }
            if (!options.assignments) { newOptions.assignments = this.assignments; }

            this.destroy();
            this.element.empty();
            this.options = null;

            this.init(this.element, newOptions, events);

            Widget.fn._setEvents.call(this, newOptions);
        },

        _attachEvents: function() {
            this._resizeHandler = this.resize.bind(this, false);
            $(window).on("resize" + NS, this._resizeHandler);

            if (supportsMedia) {
                this._mediaQueryHandler({ matches: this._mediaQuery.matches });
            }
        },

        _splitter: function() {
            this.splitter = this.layout.kendoSplitter({
                navigatable: this.options.navigatable,
                orientation: "horizontal",
                panes: [
                    { collapsible: false, scrollable: false, label: "Gantt List" },
                    { collapsible: false, scrollable: false, label: "Gantt Timeline" }
                ]
            }).getKendoSplitter();

            if (this.options.listWidth) {
                this.splitter.size(".k-pane:first", this.options.listWidth);
            }
        },

        _wrapper: function() {
            var ganttStyles = Gantt.styles;
            var options = this.options;
            var height = options.height;
            var width = options.width;

            this.wrapper = this.element.addClass(ganttStyles.wrapper).attr("role", "application");
            this.layout = $("<div class='" + ganttStyles.content + "' />").appendTo(this.wrapper)
                .append("<div class='" + ganttStyles.listWrapper + "'><div></div></div>")
                .append("<div class='" + ganttStyles.timelineWrapper + "'><div></div></div>");

            if (options.showPlannedTasks) {
                this.wrapper.addClass(ganttStyles.plannedTasks);
            }

            if (height) {
                this.wrapper.css("height", height);
            }

            if (width) {
                this.wrapper.css("width", width);
            }

            if (options.rowHeight) {
                this.wrapper.addClass(ganttStyles.rowHeight);
            }

            this.treelistWrapper = this.wrapper.find(DOT + ganttStyles.list);
            this.timelineWrapper = this.wrapper.find(DOT + ganttStyles.timeline);

            this.treelistWrapper.css("width", options.listWidth);
            this.timelineWrapper.css("width", this.wrapper.width() - this.treelistWrapper.outerWidth());
        },

        _viewClickHandler: function(e) {
            var list = this.list;
            var name = e.target.attr(kendo.attr("name"));

            if (list.editor && !list.editor.end()) {
                return;
            }

            if (!this.trigger("navigate", { view: name })) {
                this.view(name);
            } else {
                e.preventDefault();
            }
        },

        _togglePane: function(e) {
            var that = this,
                treelist = that.treelistWrapper,
                timeline = that.timelineWrapper,
                contentSelector = DOT + ganttStyles.gridContent;

            e.preventDefault();

            if (treelist.is(":visible")) {
                treelist.addClass("k-hidden");
                timeline.removeClass("k-hidden");

                that.refresh();

                timeline
                    .find(contentSelector)
                    .scrollTop(that.scrollTop);
            } else {
                treelist.removeClass("k-hidden");
                timeline.addClass("k-hidden");

                treelist
                    .find(contentSelector)
                    .scrollTop(that.scrollTop);
            }

            that._resize();
        },

        _processDefaults: function() {
            var that = this,
                views = that.timeline.views,
                ns = kendo.ns,
                viewsButtons = [],
                toolbarStyles = Gantt.styles.toolbar,
                actionsMessages = this.options.messages.actions,
                items = ADD_ACTIONS.map((m) => ({
                    text: actionsMessages[m.text],
                    attributes: { "data-type": m.data }
                })),
                defaults = {
                    append: {
                        name: "append",
                        type: "dropDownButton",
                        menuButtons: items,
                        icon: toolbarStyles.iconPlus,
                        attributes: {
                            class: toolbarStyles.appendButton
                        },
                        click: that._addClickHandler.bind(that),
                        open: that._openAddClickHandler.bind(that)
                    },
                    pdf: {
                        name: "pdf",
                        type: "button",
                        attributes: {
                            class: toolbarStyles.pdfButton
                        },
                        icon: toolbarStyles.iconPdf,
                        click: that.saveAsPDF.bind(that)
                    },
                    toggle: {
                        name: "toggle",
                        type: "button",
                        showText: "overflow",
                        attributes: {
                            class: "k-gantt-toggle"
                        },
                        icon: toolbarStyles.iconToggle,
                        click: that._togglePane.bind(that)
                    },
                    switchLabel: {
                        template: "<label for=planned-switch>" + that.options.messages.plannedTasks.switchText + "</label>"
                    },
                    plannedTasks: {
                        type: "component",
                        component: "Switch",
                        element: "<input id='planned-switch' class='k-gantt-planned-switch'>",
                        componentOptions: {
                            checked: that.options.showPlannedTasks,
                            change: that._togglePlannedTasks.bind(that),
                            messages: {
                                checked: "",
                                unchecked: ""
                            }
                        }
                    },
                    viewsDdl: {
                        template: VIEWS_DROPDOWN_TEMPLATE({
                            views: that.timeline.views,
                            styles: toolbarStyles,
                            label: that.options.messages.selectView
                        })
                    },
                    view: {
                        name: "view",
                        type: "button",
                        togglable: true,
                        group: "views"
                    },
                    viewsGroup: {
                        type: "buttonGroup",
                        attributes: {
                            class: toolbarStyles.views
                        }
                    }
                };

            Object.keys(views).map(name => {
                var current = $.extend(true, {}, defaults.view);

                current.text = views[name].title;
                current.attributes = {
                    class: "k-view-" + name.toLowerCase()
                };
                current.attributes["data" + ns + "-name"] = name;

                defaults[name] = current;

                viewsButtons.push(name);
            });

            Object.values(defaults).map(t => {
                if (t.name === "view") {
                    t.click = that._viewClickHandler.bind(that);
                }
            });

            defaults.viewsGroup.buttons = viewsButtons;

            that._viewsButtons = viewsButtons;
            that.defaultCommands = defaults;
        },

        _processTools: function(items) {
            var editable = this.options.editable,
                commands = [],
                tools = ["toggle"],
                spacerPresent = false,
                defaults = this.defaultCommands;

            if (!Array.isArray(items)) {
                if (editable && editable.create !== false) {
                    tools.push("append");
                }
            } else {
                commands = items;
            }

            commands.map(c => {
                if (c === "plannedTasks" || c.name === "plannedTasks") {
                    spacerPresent = true;

                    tools.push({
                        type: "spacer"
                    });

                    tools.push("switchLabel");
                }

                if (!defaults[c] && !defaults[c.name] && !c.template) {
                    if (typeof c === STRING) {
                        c = {
                            name: c,
                            type: "button",
                            text: c,
                            attributes: {
                                class: "k-gantt-" + c
                            }
                        };
                    } else {
                        c = $.extend({}, {
                            type: "button",
                            text: c.name,
                            attributes: {
                                class: "k-gantt-" + c.name
                            }
                        }, c);
                    }
                }

                tools.push(c);
            });

            if (!spacerPresent) {
                tools.push({
                    type: "spacer"
                });
            }

            if (this._viewsButtons && this._viewsButtons.length > 0) {
                if (this._viewsButtons.length > 1) {
                    tools.push("viewsDdl");
                }

                tools.push("viewsGroup");
            }

            return tools;
        },

        _mediaQueryHandler: function(e) {
            var that = this;
            var splitbar = that.layout.find(".k-splitbar");
            var splitter = that.layout.getKendoSplitter();
            var treelist = that.treelistWrapper;
            var timeline = that.timelineWrapper;
            var contentSelector = DOT + ganttStyles.gridContent;

            var toolbarEl = that.toolbar;
            var toolbar = toolbarEl.getKendoToolBar();

            if (e.matches) {
                treelist.addClass("k-hidden");
                splitbar.addClass("k-hidden");
                splitter._suppressResize = true;
                toolbar.hide(toolbarEl.find(".k-gantt-views"));
                toolbar.show(toolbarEl.find(".k-views-dropdown"));

                treelist.width("100%");
            } else {
                splitter._suppressResize = false;
                treelist.removeClass("k-hidden");
                splitbar.removeClass("k-hidden");
                timeline.removeClass("k-hidden");

                toolbar.show(toolbarEl.find(".k-gantt-views"));
                toolbar.hide(toolbarEl.find(".k-views-dropdown"));

                treelist.width(treelist.outerWidth());

                timeline
                    .find(contentSelector)
                    .scrollTop(that.scrollTop);
            }

            that._resize();
        },

        _toolbar: function() {
            var that = this;
            var ganttStyles = Gantt.styles;
            var viewsDropdownSelector = DOT + ganttStyles.toolbar.viewsDropdown;
            var toolsOptions = this.options.toolbar;
            var tools;
            var toolbar;

            if (typeof toolsOptions === STRING) {
                toolsOptions = kendo.template(toolsOptions).bind(this);
            }

            if (isFunction(toolsOptions)) {
                tools = this._processTools([{
                    template: toolsOptions({})
                }]);
            } else {
                tools = this._processTools(toolsOptions);
            }

            toolbar = $("<div class='" + ganttStyles.toolbar.headerWrapper + "'>");

            this.wrapper.prepend(toolbar);
            this.toolbar = toolbar;

            toolbar.kendoToolBar({
                resizable: false,
                tools: tools,
                size: "medium",
                defaultTools: this.defaultCommands,
                parentMessages: this.options.messages.actions
            });

            if (supportsMedia) {
                this._mediaQuery = window.matchMedia(MIN_SCREEN);
                this._mediaQuery.addListener(this._mediaQueryHandler.bind(this));
            }

            toolbar.on("change" + NS, viewsDropdownSelector, function() {
                var list = that.list;
                var name = $(this).val();

                if (list.editable && list.editable.trigger("validate")) {
                    return;
                }

                if (!that.trigger("navigate", { view: name })) {
                    that.view(name);
                }
            });

            this.toggleSwitch = toolbar.find('input.k-gantt-planned-switch').data("kendoSwitch");
        },

        _footer: function() {
            var editable = this.options.editable;

            if (!editable || editable.create === false) {
                return;
            }

            var ganttStyles = Gantt.styles.toolbar;
            var messages = this.options.messages.actions;
            var footer = $("<div class='" + ganttStyles.footerWrapper + "'>");

            this.wrapper.append(footer);
            this.footer = footer;

            footer.kendoToolBar({
                resizable: false,
                size: "medium",
                tools: ["append"],
                defaultTools: {
                    append: extend(true, {}, this.defaultCommands.append, {
                        direction: "up",
                        animation: {
                            open: {
                                effects: "slideIn:up"
                            }
                        }
                    })
                },
                parentMessages: messages
            });
        },

        _adjustDimensions: function() {
            var element = this.element;
            var toolbarHeight = outerHeight(this.toolbar);
            var footerHeight = this.footer ? outerHeight(this.footer) : 0;
            var totalHeight = element.height();
            var totalWidth = element.width();
            var treeListVisible = this.treelistWrapper.is(":visible");
            var splitBar = this.layout.find(".k-splitbar");
            var splitBarWidth = splitBar.is(":visible") ? outerWidth(splitBar) : 0;
            var treeListWidth = treeListVisible ? outerWidth(this.treelistWrapper) : 0;
            var timelineWidth = totalWidth - ( treeListWidth + splitBarWidth );

            this.layout.children().height(totalHeight - (toolbarHeight + footerHeight));
            this.timelineWrapper.width(timelineWidth);
            if (!treeListVisible) {
                this.timelineWrapper.css("left", 0);
            }

            if (totalWidth < (treeListWidth + splitBarWidth)) {
                this.treelistWrapper.width(totalWidth - splitBarWidth);
            }
        },

        _scrollTo: function(value) {
            var view = this.timeline.view();
            var list = this.list;
            var attr = kendo.attr("uid");
            var id = typeof value === "string" ? value :
                value.closest("tr" + selector()).attr(attr);
            var action;
            var scrollTarget;
            var scrollIntoView = function() {
                if (scrollTarget.length !== 0) {
                    action();
                }
            };

            if (view.content.is(":visible")) {
                scrollTarget = view.content.find(selector(id));
                action = function() {
                    view._scrollTo(scrollTarget);
                };
            } else {
                scrollTarget = list.element.find(selector(id));
                action = function() {
                    scrollTarget.get(0).scrollIntoView();
                };
            }

            scrollIntoView();
        },

        _addTask: function(selected, parent, type) {
            var dataSource = this.dataSource,
                task = dataSource._createNewModel({}),
                timeline = this.timeline,
                firstSlot = timeline.view()._timeSlots()[0],
                editable = this.list.editor,
                orderId;

            if (editable && editable.trigger("validate")) {
                return;
            }

            task.set("title", "New task");

            if (parent) {
                task.set("parentId", parent.get("id"));
                task.set("start", parent.get("start"));
                task.set("end", parent.get("end"));
                task.set("plannedStart", parent.get("plannedStart"));
                task.set("plannedEnd", parent.get("plannedEnd"));
            } else {
                task.set("start", firstSlot.start);
                task.set("end", firstSlot.end);
            }

            if (type && type !== "add") {
                orderId = selected.get("orderId");
                orderId = type === "insert-before" ? orderId : orderId + 1;
            }

            this._createTask(task, orderId);
        },

        _addClickHandler: function(e) {
            var type = e.target.data("type");
            var dataSource = this.dataSource;
            var selected = this.dataItem(this.select());
            var parent = dataSource.taskParent(selected);
            var target = type === "add" ? selected : parent;

            this._addTask(selected, target, type);
        },

        _openAddClickHandler: function(e) {
            var selected = this.select();

            if (!selected || selected.length === 0) {
                e.preventDefault();

                this._addTask();
            }
        },

        _getListEditable: function() {
            var editable = false,
                options = this.options;

            if (options.editable !== false) {
                editable = "incell";

                if (options.editable && options.editable.update === false) {
                    editable = false;
                } else {
                    if (!options.editable || options.editable.reorder !== false) {
                        editable = {
                            mode: "incell",
                            move: {
                                reorderable: true,
                                clickMoveClick: options.editable.clickMoveClick === false ? false : true
                            }
                        };
                    }
                }
            }

            return editable;
        },

        _getListOptions: function() {
            var options = this.options,
                editable = this._getListEditable(),
                listWrapper = this.wrapper.find(DOT + ganttStyles.list),
                ganttListOptions = {
                    columns: options.columns || [],
                    dataSource: this.dataSource,
                    navigatable: options.navigatable,
                    selectable: options.selectable,
                    reorderable: options.reorderable,
                    editable: editable,
                    resizable: options.resizable,
                    filterable: options.filterable,
                    columnMenu: options.columnMenu,
                    columnResizeHandleWidth: this.options.columnResizeHandleWidth,
                    listWidth: outerWidth(listWrapper),
                    resourcesField: this.resources.field,
                    rowHeight: this.options.rowHeight
                };

            return ganttListOptions;
        },

        _attachResourceEditor: function(columns) {
            var column;

            for (var i = 0; i < columns.length; i++) {
                column = columns[i];

                if (column.field === this.resources.field && typeof column.editor !== "function") {
                    column.editor = this._resourcePopupEditor.bind(this);
                }
            }
        },

        _attachListEvents: function() {
            var that = this;

            that.list
                .bind("columnShow", function(e) {
                    that.trigger("columnShow", { column: e.column });
                })
                .bind("columnHide", function(e) {
                    that.trigger("columnHide", { column: e.column });
                })
                .bind("columnReorder", function(e) {
                    that.trigger("columnReorder", { column: e.column, oldIndex: e.oldIndex, newIndex: e.newIndex });
                })
                .bind("columnResize", function(e) {
                    that.trigger("columnResize", { column: e.column, oldWidth: e.oldWidth, newWidth: e.newWidth });
                })
                .bind("render", function() {
                    that._navigatable();
                 }, true)
                .bind("beforeEdit", function(e) {

                    if (that.trigger("edit", { task: e.model, container: e.container })) {
                        e.preventDefault();
                    }
                })
                .bind("cancel", function(e) {
                    if (that.trigger("cancel", { task: e.model, container: e.cell })) {
                        e.preventDefault();
                        return;
                    }

                    that._preventItemChange = true;
                    that.list.closeCell(true);
                })
                .bind("save", function(e) {
                    var updatedValues = e.values,
                        key;

                    that.previousTask = {};
                    that._preventRefresh = true;

                    if (that.updateDuration === null || that.updateDuration === undefined) {
                        that.updateDuration = e.model.duration();
                    }

                    if (that.updatePlannedDuration === null || that.updatePlannedDuration === undefined) {
                        that.updatePlannedDuration = e.model.plannedDuration();
                    }

                    if (updatedValues.hasOwnProperty("start")) {
                        updatedValues.end = new Date(updatedValues.start.getTime() + that.updateDuration);
                    }

                    if (updatedValues.hasOwnProperty("plannedStart") && updatedValues.plannedStart) {
                        updatedValues.plannedEnd = new Date(updatedValues.plannedStart.getTime() + that.updatePlannedDuration);
                    }

                    for (key in updatedValues) {
                        if (updatedValues.hasOwnProperty(key)) {
                            that.previousTask[key] = e.model.get(key);
                        }
                    }

                    that.updatedValues = updatedValues;
                })
                .bind("itemChange", function(e) {
                    var updateInfo = that.updatedValues,
                        task = e.data,
                        resourcesField = that.resources.field,
                        previousTask = that.previousTask,
                        current,
                        isCurrentInHeader,
                        currentIndex,
                        rowIndex,
                        navigatable = that.options.navigatable,
                        key;

                    if (that._preventItemChange) {
                        that._preventItemChange = false;
                        return;
                    }

                    for (key in previousTask) {
                        if (previousTask.hasOwnProperty(key)) {
                            task.set(key, previousTask[key]);
                        }
                    }

                    that.previousTask = {};

                    if (!that.trigger("save", { task: task, values: updateInfo })) {
                        if (updateInfo) {
                            that._preventRefresh = true;
                            that.dataSource.update(task, updateInfo);

                            if (updateInfo[resourcesField]) {
                                that._updateAssignments(task.get("id"), updateInfo[resourcesField]);
                            }
                        }

                        if (navigatable) {
                            current = $(that.list.current());
                            isCurrentInHeader = current.is("th");
                            rowIndex = current.closest("tr").index();
                            currentIndex = isCurrentInHeader ? current.parent().children(":not(.k-group-cell)").index(current[0]) : Math.max(that.list.cellIndex(current), 0);
                        }

                        that._preventRefresh = false;
                        that._requestStart();
                        that.dataSource.sync().then(function() {
                            if (that.options.navigatable && !that._tabPressed) {
                                if (!isCurrentInHeader) {
                                    var row = that.list.tbody.children().eq(rowIndex);

                                    var td = row.find(">td:visible")
                                        .eq(currentIndex);

                                    that.list._setCurrent(td, false, true);
                                }
                            }
                            that._tabPressed = false;
                        });
                    } else if (that.dataSource.hasChanges()) {
                        that.dataSource.cancelChanges(task);
                        that._preventRefresh = false;
                        that.refresh();
                    }

                    that.updatedValues = null;
                    that.updateDuration = null;
                })
                .bind("change", function() {
                    that.trigger("change");

                    that._selectionUpdate();

                })
                .bind("navigate", function(e) {
                    var treeList = e.sender;
                    var current = treeList.current();
                    var uid;

                    that._scrollTo(current);
                    that.timeline.element.find("div.k-task").attr("tabindex", "-1");
                    uid = current.closest("tr").attr("data-uid");
                    that.timeline.element.find("div.k-task[data-uid='" + uid + "']").attr("tabindex", "0");
                })
                .bind("expand", function(e) {
                    e.preventDefault();
                    e.model.set("expanded", true);
                })
                .bind("collapse", function(e) {
                    e.preventDefault();
                    e.model.set("expanded", false);
                })
                .bind("dragend", function(e) {
                    var dataSource = that.dataSource,
                        task, updateInfo;

                    if (e.position === "over") {
                        dataSource.cancelChanges();

                        updateInfo = {
                            parentId: e.source.parentId
                        };

                        task = dataSource.get(e.source.id);

                        if (!that.trigger("save", { task: task, values: updateInfo })) {
                            dataSource.update(task, updateInfo);
                        }

                        dataSource.sync();
                    }
                })
                .bind("dataBound", function() {
                    if (that.dataSource.sort().length === 0) {
                        that.dataSource.sort([{ field: "orderId", dir: "asc" }]);
                    }
                })
                .bind("reorder", function(e) {
                    that._updateTask(e.task, e.updateInfo);
                });
        },

        _selectionUpdate: function() {
            var that = this,
                selection = that.list.select();

            if (selection.length) {
                that.timeline.select("[data-uid='" + selection.attr("data-uid") + "']");
            } else {
                that.timeline.clearSelection();
            }
        },

        _list: function() {
            var ganttStyles = Gantt.styles,
                listWrapper = this.wrapper.find(DOT + ganttStyles.list),
                listElement = listWrapper.find("> div"),
                listOptions = this._getListOptions();

            this._attachResourceEditor(listOptions.columns);

            this.list = new kendo.ui.GanttList(listElement, listOptions);

            this._attachListEvents();
        },

        _timeline: function() {
            var that = this;
            var ganttStyles = Gantt.styles;
            var options = trimOptions(extend(true, { resourcesField: this.resources.field }, this.options));
            var element = this.wrapper.find(DOT + ganttStyles.timeline + " > div");

            this.timeline = new kendo.ui.GanttTimeline(element, options);

            this.timeline
                .bind("navigate", function(e) {
                    var viewName = e.view.replace(/\./g, "\\.").toLowerCase();
                    var viewsEl = that.toolbar.find(DOT + ganttStyles.toolbar.views);
                    var viewsGroup = viewsEl.getKendoButtonGroup();

                    if (viewsGroup) {
                        viewsGroup.select(viewsEl.find(DOT + ganttStyles.toolbar.viewButton + "-" + viewName));
                    }

                    that.toolbar
                        .find(DOT + ganttStyles.toolbar.viewsDropdown)
                        .val(e.view);

                    that.refresh();
                })
                .bind("moveStart", function(e) {
                    var editable = that.list.editor;

                    if (editable && !editable.end()) {
                        e.preventDefault();
                        return;
                    }

                    if (that.trigger("moveStart", { task: e.task })) {
                        e.preventDefault();
                    }
                })
                .bind("move", function(e) {
                    var task = e.task;
                    var start = e.start;
                    var end = new Date(start.getTime() + task.duration());

                    if (that.trigger("move", { task: task, start: start, end: end })) {
                        e.preventDefault();
                    }
                })
                .bind("moveEnd", function(e) {
                    var task = e.task;
                    var start = e.start;
                    var end = new Date(start.getTime() + task.duration());

                    if (!that.trigger("moveEnd", { task: task, start: start, end: end })) {
                        that._updateTask(that.dataSource.getByUid(task.uid), {
                            start: start,
                            end: end
                        });
                    }
                })
                .bind("resizeStart", function(e) {
                    var editable = that.list.editor;

                    if (editable && !editable.end()) {
                        e.preventDefault();
                        return;
                    }

                    if (that.trigger("resizeStart", { task: e.task })) {
                        e.preventDefault();
                    }
                })
                .bind("resize", function(e) {
                    if (that.trigger("resize", { task: e.task, start: e.start, end: e.end })) {
                        e.preventDefault();
                    }
                })
                .bind("resizeEnd", function(e) {
                    var task = e.task;
                    var updateInfo = {};

                    if (e.resizeStart) {
                        updateInfo.start = e.start;
                    } else {
                        updateInfo.end = e.end;
                    }

                    if (!that.trigger("resizeEnd", { task: task, start: e.start, end: e.end })) {
                        that._updateTask(that.dataSource.getByUid(task.uid), updateInfo);
                    }
                })
                .bind("percentResizeStart", function(e) {
                    var editable = that.list.editor;

                    if (editable && !editable.end()) {
                        e.preventDefault();
                    }
                })
                .bind("percentResizeEnd", function(e) {
                    that._updateTask(that.dataSource.getByUid(e.task.uid), { percentComplete: e.percentComplete });
                })
                .bind("dependencyDragStart", function(e) {
                    var editable = that.list.editor;

                    if (editable && !editable.end()) {
                        e.preventDefault();
                    }
                })
                .bind("dependencyDragEnd", function(e) {
                    var dependency = that.dependencies._createNewModel({
                        type: e.type,
                        predecessorId: e.predecessor.id,
                        successorId: e.successor.id
                    });

                    that._createDependency(dependency);
                })
                .bind("select", function(e) {
                    var editable = that.list.editor,
                        current = that.select(),
                        currentUid;

                    if (editable) {
                        editable.end();
                    }

                    if (current && current.length) {
                        currentUid = current.data("uid");
                    }

                    if (currentUid !== e.uid) {
                        that.select("[data-uid='" + e.uid + "']");
                        that.trigger("change");
                    }
                })
                .bind("editTask", function(e) {
                    var editable = that.list.editor;

                    if (editable && !editable.end()) {
                        return;
                    }

                    that.editTask(e.uid);
                })
                .bind("clear", function() {
                    that.clearSelection();
                    that.trigger("change");
                })
                .bind("removeTask", function(e) {
                    var editable = that.list.editor;

                    if (editable && !editable.end()) {
                        return;
                    }

                    that.removeTask(that.dataSource.getByUid(e.uid));
                })
                .bind("expand", function(e) {
                    var model = that.dataSource.getByUid(e.uid);
                    if (model.summary && !model.get("expanded")) {
                        model.set("expanded", true);
                    } else {
                        e.preventDefault();
                    }
                })
                .bind("collapse", function(e) {
                    var model = that.dataSource.getByUid(e.uid);

                    if (model.summary && model.get("expanded")) {
                        model.set("expanded", false);
                    } else {
                        e.preventDefault();
                    }
                })
                .bind("removeDependency", function(e) {
                    var editable = that.list.editor;

                    if (editable && !editable.end()) {
                        return;
                    }

                    that.removeDependency(that.dependencies.getByUid(e.uid));
                });
        },

        _dataSource: function() {
            var options = this.options;
            var dataSource = options.dataSource;

            dataSource = isArray(dataSource) ? { data: dataSource } : dataSource;

            if (this.dataSource && this._refreshHandler) {
                this.dataSource
                    .unbind("change", this._refreshHandler)
                    .unbind("progress", this._progressHandler)
                    .unbind("error", this._errorHandler);
            } else {
                this._refreshHandler = this.refresh.bind(this);
                this._progressHandler = this._requestStart.bind(this);
                this._errorHandler = this._error.bind(this);
            }

            this.dataSource = kendo.data.GanttDataSource.create(dataSource)
                .bind("change", this._refreshHandler)
                .bind("progress", this._progressHandler)
                .bind("error", this._errorHandler);
        },

        _dependencies: function() {
            var dependencies = this.options.dependencies || {};
            var dataSource = isArray(dependencies) ? { data: dependencies } : dependencies;

            if (this.dependencies && this._dependencyRefreshHandler) {
                this.dependencies
                    .unbind("change", this._dependencyRefreshHandler)
                    .unbind("error", this._dependencyErrorHandler);
            } else {
                this._dependencyRefreshHandler = this.refreshDependencies.bind(this);
                this._dependencyErrorHandler = this._error.bind(this);
            }

            this.dependencies = kendo.data.GanttDependencyDataSource.create(dataSource)
                .bind("change", this._dependencyRefreshHandler)
                .bind("error", this._dependencyErrorHandler);
        },

        _resources: function() {
            var resources = this.options.resources;
            var dataSource = resources.dataSource || {};

            this.resources = {
                field: "resources",
                dataTextField: "name",
                dataColorField: "color",
                dataFormatField: "format"
            };

            extend(this.resources, resources);

            this.resources.dataSource = kendo.data.DataSource.create(dataSource);
        },

        _assignments: function() {
            var assignments = this.options.assignments;
            var dataSource = assignments.dataSource || { };

            if (this.assignments) {
                this.assignments.dataSource
                    .unbind("change", this._assignmentsRefreshHandler);
            } else {
                this._assignmentsRefreshHandler = this.refresh.bind(this);
            }

            this.assignments = {
                dataTaskIdField: "taskId",
                dataResourceIdField: "resourceId",
                dataValueField: "value"
            };

            extend(this.assignments, assignments);

            this.assignments.dataSource = kendo.data.DataSource.create(dataSource);

            this.assignments.dataSource
                .bind("change", this._assignmentsRefreshHandler);
        },

        _createEditor: function() {
            var that = this;

            var editor = this._editor = new kendo.gantt.PopupEditor(this.wrapper, extend({}, this.options, {
                target: this,
                resources: {
                    field: this.resources.field,
                    editor: this._createResourceEditor.bind(this)
                }
            }));

            editor
                .bind("cancel", function(e) {
                    var task = that.dataSource.getByUid(e.model.uid);

                    if (that.trigger("cancel", { container: e.container, task: task })) {
                        e.preventDefault();
                        return;
                    }

                    if (that.dependencies) {
                        that.dependencies.filter({});
                    }

                    that.cancelTask();
                    if (that.options.navigatable) {
                        that.timeline.element.find('div[data-uid="' + e.model.uid + '"]').focus();
                    }
                })
                .bind("edit", function(e) {
                    var task = that.dataSource.getByUid(e.model.uid);

                    if (that.trigger("edit", { container: e.container, task: task })) {
                        e.preventDefault();
                    }
                })
                .bind("save", function(e) {
                    var task = that.dataSource.getByUid(e.model.uid);

                    that.saveTask(task, e.updateInfo, e.updateDependencies);
                })
                .bind("remove", function(e) {
                    that.removeTask(e.model.uid);
                })
                .bind("close", function(options) {
                    if (that.options.navigatable) {
                        that.element.find('div[data-uid="' + options.window.attr("data-uid") + '"]').focus();
                    }
                });
        },

        _resourcePopupEditor: function(container, options) {
            var that = this,
                editor = that._createResourceEditor($("<div>"), options),
                popupStyles = ganttStyles.popup,
                wrapper = that.element,
                dialogEl = $(kendo.format('<div class="' + popupStyles.formContainer + '">')).appendTo(wrapper),
                messages = that.options.messages,
                buttonsEl, dialog;

            dialogEl.append(editor.wrapper);
            buttonsEl = $('<div class="' + popupStyles.buttonsContainer + '">');
            dialogEl.append(buttonsEl);

            buttonsEl.append($("<button class='" + ganttStyles.buttonSave + "'>" + encode(messages.save) + "</button>").kendoButton({
                name: "save",
                themeColor: "primary",
                icon: "save",
                click: () => {
                    if (!editor.updateModel()) {
                        return;
                    }
                    editor.trigger("save", { model: editor.model });
                    that._updateAssignments(editor.model.get("id"), editor.model.get(that.resources.field));

                    dialog.trigger("close");
                    dialog.close();
                }
            }));

            buttonsEl.append($("<button class='" + ganttStyles.buttonCancel + "'>" + encode(messages.cancel) + "</button>").kendoButton({
                name: "cancel",
                icon: "cancel",
                click: () => {
                    dialog.trigger("close");
                    dialog.close();
                }
            }));

            this._resourceEditorWindow = dialog = dialogEl.kendoWindow({
                modal: true,
                resizable: false,
                draggable: true,
                visible: false,
                title: messages.editor.resourcesEditorTitle,
                deactivate: () => {
                    editor.destroy();
                    dialog.destroy();
                    dialog.element.closest(".k-window").remove();
                }
            }).data("kendoWindow");

            dialog.center().open();

            return editor;
        },

        _createResourceEditor: function(container, options) {
            var that = this;
            var model = options instanceof ObservableObject ? options : options.model;
            var messages = this.options.messages;
            var resourcesField = this.resources.field;
            var unitsValidation = { step: 0.01, min: 0.01, max: 1 };
            var assignmentsModel = this.assignments.dataSource.options.schema.model;
            var resourceTextField = that.resources.dataTextField;
            var resources = this.resources.dataSource.view();


            if (assignmentsModel && assignmentsModel.fields.Units && assignmentsModel.fields.Units.validation) {
                extend(true, unitsValidation, assignmentsModel.fields.Units.validation);
            }

            var editor = this._resourceEditor = new kendo.gantt.ResourceEditor(container, {
                resourcesField: resourcesField,
                unitsValidation: unitsValidation,
                resources: resources.map(r => ({ value: r.id, text: r[resourceTextField] })),
                model: model,
                messages: extend({}, messages.editor)
            });

            return editor;
        },

        view: function(type) {
            return this.timeline.view(type);
        },

        range: function(range) {
            var dataSource = this.dataSource;
            var view = this.view();
            var timeline = this.timeline;

            if (range) {
                view.options.range = {
                    start: range.start,
                    end: range.end
                };

                timeline._render(dataSource.taskTree());
                timeline._renderDependencies(this.dependencies.view());
            }

            return {
                start: view.start,
                end: view.end
            };
        },

        date: function(date) {
            var view = this.view();

            if (date) {
                view.options.date = date;
                view._scrollToDate(date);
            }

            return view.options.date;
        },

        dataItem: function(value) {
            if (!value) {
                return null;
            }

            var list = this.list;
            var element = list.element.find(value);

            return list._modelFromElement(element);
        },

        setDataSource: function(dataSource) {
            this.options.dataSource = dataSource;

            this._dataSource();

            this.list.setDataSource(this.dataSource);

            if (this.options.autoBind) {
                dataSource.fetch();
            }
        },

        setDependenciesDataSource: function(dependencies) {
            this.options.dependencies = dependencies;

            this._dependencies();

            if (this.options.autoBind) {
                dependencies.fetch();
            }
        },

        items: function() {
            return this.wrapper.children(".k-task");
        },

        _updateAssignments: function(id, resources) {
            var dataSource = this.assignments.dataSource;
            var taskId = this.assignments.dataTaskIdField;
            var resourceId = this.assignments.dataResourceIdField;
            var hasMatch = false;
            var assignments = new Query(dataSource.view())
                .filter({
                    field: taskId,
                    operator: "eq",
                    value: id
                }).toArray();
            var assignment;
            var resource;
            var value;

            while (assignments.length) {
                assignment = assignments[0];

                for (var i = 0, length = resources.length; i < length; i++) {
                    resource = resources[i];

                    if (assignment.get(resourceId) === resource.get("id")) {
                        value = resources[i].get("value");
                        this._updateAssignment(assignment, value);
                        resources.splice(i, 1);
                        hasMatch = true;
                        break;
                    }
                }

                if (!hasMatch) {
                    this._removeAssignment(assignment);
                }

                hasMatch = false;

                assignments.shift();
            }

            for (var j = 0, newLength = resources.length; j < newLength; j++) {
                resource = resources[j];

                if (resource.id !== undefined && resource.value) {
                    this._createAssignment(resource, id);
                }
            }

            dataSource.sync();
        },

        cancelTask: function() {
            var editor = this._editor;
            var container = editor.container;

            if (container) {
                editor.close();
            }

            if (this.dependencies) {
                this.dependencies.cancelChanges();
            }
        },

        editTask: function(uid) {
            var task = typeof uid === "string" ? this.dataSource.getByUid(uid) : uid;

            if (!task) {
                return;
            }

            var taskCopy = this.dataSource._createNewModel(task.toJSON());
            taskCopy.uid = task.uid;

            this.cancelTask();

            this._editTask(taskCopy);
        },

        _editTask: function(task) {
            this._editor.editTask(task, this.options.editable.plannedTasks);
        },

        saveTask: function(task, updateInfo, updateDependencies) {
            var that = this,
                editor = this._editor,
                container = editor.container,
                editable = editor.editable,
                hasChanges = false,
                hasResourceChanges = false,
                updateInfo = updateInfo || {},
                resourcesField = that.options.resources.field,
                difference;

            Object.keys(updateInfo).map(k => {
                var updated = updateInfo[k],
                    current = task.get(k);

                if (updated instanceof Date) {
                    updated = updated.getTime();
                    current = current ? current.getTime() : undefined;
                }

                if (updated !== current) {
                    if (k === resourcesField) {
                        difference = updated
                            .filter(u => !current.some(c => c.id === u.id && c.value === u.value))
                            .concat(current.filter(c => !updated.some(u => u.id === c.id && c.value === u.value)));

                        if (difference && difference.length > 0) {
                            hasResourceChanges = true;
                        }
                    } else {
                        hasChanges = true;
                    }
                }
            });

            if (container &&
                editable &&
                editable.end() &&
                (hasChanges || hasResourceChanges || updateDependencies)) {
                    if (!that.trigger("save", { task: task, values: updateInfo, updateDependencies: updateDependencies })) {
                        if (hasChanges) {
                            that._preventRefresh = true;

                            that.dataSource.update(task, updateInfo);
                        }

                        if (hasResourceChanges) {
                            this._updateAssignments(task.get("id"), updateInfo[resourcesField]);
                        }

                        that._syncDataSource();

                        if (this.dependencies) {
                            this._updateDependency(updateDependencies);
                        }

                        this._editor.close();
                    } else {
                        if (task && task.dirty) {
                            that.dataSource.cancelChanges(task);
                            that._preventRefresh = false;
                            that.refresh();
                        }

                        if (that.dependencies) {
                            that.dependencies.cancelChanges();
                        }
                    }
            } else if (editable && editable.end()) {
                this._editor.close();
            }
        },

        _updateDependency: function(updateDependencies) {
            this.dependencies.filter({});

            if (updateDependencies) {
                updateDependencies.created.map(d => {
                    this._preventDependencyRefresh = true;
                    this.dependencies.add(d);
                    this._preventDependencyRefresh = false;
                });

                updateDependencies.destroyed.map(d => {
                    this.dependencies.remove(d);
                });
            }

            this.dependencies.sync();
        },

        _updateTask: function(task, updateInfo) {
            var that = this;
            var resourcesField = that.resources.field;

            if (!that.trigger("save", { task: task, values: updateInfo })) {
                if (updateInfo) {
                    that._preventRefresh = true;

                    that.dataSource.update(task, updateInfo);

                    if (updateInfo[resourcesField]) {
                        that._updateAssignments(task.get("id"), updateInfo[resourcesField]);
                    }
                }

                that._syncDataSource();
            } else {
                if (task && task.dirty) {
                    that.dataSource.cancelChanges(task);
                    that._preventRefresh = false;
                    that.refresh();
                }

                if (that.dependencies) {
                    that.dependencies.cancelChanges();
                }
            }
        },

        _updateAssignment: function(assignment, value) {
            var resourceValueField = this.assignments.dataValueField;

            assignment.set(resourceValueField, value);
        },

        removeTask: function(uid) {
            var that = this;
            var task = typeof uid === "string" ? this.dataSource.getByUid(uid) : uid;

            if (!task) {
                return;
            }

            this._taskConfirm(function(cancel) {
                if (!cancel) {
                    that._removeTask(task);
                }
            }, task);
        },

        _createTask: function(task, index) {
            if (!this.trigger("add", {
                task: task,
                dependency: null
            })) {
                var dataSource = this.dataSource;

                this._preventRefresh = true;

                if (index === undefined) {
                    dataSource.add(task);
                } else {
                    dataSource.insert(index, task);
                }

                this._scrollToUid = task.uid;
                this._syncDataSource();
            }
        },

        _createDependency: function(dependency) {
            if (!this.trigger("add", {
                task: null,
                dependency: dependency
            })) {
                this._preventDependencyRefresh = true;

                this.dependencies.add(dependency);

                this._preventDependencyRefresh = false;

                this.dependencies.sync();
            }
        },

        _createAssignment: function(resource, id) {
            var assignments = this.assignments;
            var dataSource = assignments.dataSource;
            var taskId = assignments.dataTaskIdField;
            var resourceId = assignments.dataResourceIdField;
            var resourceValue = assignments.dataValueField;
            var assignment = dataSource._createNewModel();

            assignment[taskId] = id;
            assignment[resourceId] = resource.get("id");
            assignment[resourceValue] = resource.get("value");

            dataSource.add(assignment);
        },

        removeDependency: function(uid) {
            var that = this;
            var dependency = typeof uid === "string" ? this.dependencies.getByUid(uid) : uid;

            if (!dependency) {
                return;
            }

            this._dependencyConfirm(function(cancel) {
                if (!cancel) {
                    that._removeDependency(dependency);
                }
            }, dependency);
        },

        _removeTaskDependencies: function(task, dependencies) {
            this._preventDependencyRefresh = true;

            for (var i = 0, length = dependencies.length; i < length; i++) {
                this.dependencies.remove(dependencies[i]);
            }

            this._preventDependencyRefresh = false;

            this.dependencies.sync();
        },

        _removeTaskAssignments: function(task) {
            var dataSource = this.assignments.dataSource;
            var assignments = dataSource.view();
            var filter = {
                field: this.assignments.dataTaskIdField,
                operator: "eq",
                value: task.get("id")
            };

            assignments = new Query(assignments).filter(filter).toArray();

            this._preventRefresh = true;

            for (var i = 0, length = assignments.length; i < length; i++) {
                dataSource.remove(assignments[i]);
            }

            this._preventRefresh = false;

            dataSource.sync();
        },

        _removeTask: function(task) {
            var dependencies = this.dependencies.dependencies(task.id);

            if (!this.trigger("remove", {
                task: task,
                dependencies: dependencies
            })) {
                this._removeTaskDependencies(task, dependencies);
                this._removeTaskAssignments(task);

                this._preventRefresh = true;

                if (this.dataSource.remove(task)) {
                    this._syncDataSource();
                }

                if (this.dependencies) {
                    this.dependencies.filter({});
                }

                this._preventRefresh = false;
            }
        },

        _removeDependency: function(dependency) {
            if (!this.trigger("remove", {
                task: null,
                dependencies: [dependency]
            })) {
                if (this.dependencies.remove(dependency)) {
                    this.dependencies.sync();
                }
            }
        },

        _removeAssignment: function(assignment) {
            this.assignments.dataSource.remove(assignment);
        },

        _taskConfirm: function(callback, task) {
            var messages = this.options.messages;

            this._confirm(callback, {
                model: task,
                text: messages.deleteTaskConfirmation,
                title: messages.deleteTaskWindowTitle
            });
        },

        _dependencyConfirm: function(callback, dependency) {
            var messages = this.options.messages;

            this._confirm(callback, {
                model: dependency,
                text: messages.deleteDependencyConfirmation,
                title: messages.deleteDependencyWindowTitle
            });
        },

        _confirm: function(callback, options) {
            var editable = this.options.editable;

            if (editable === true || editable.confirmation !== false) {
                this.showDialog(extend(true, {}, options, { callback: callback }));
            } else {
                callback();
            }
        },

        showDialog: function(options) {
            this._editor.showDialog(options);
        },

        refresh: function() {
            if (this._preventRefresh || !this.list || this.list.editor) {
                return;
            }

            this._progress(false);

            var dataSource = this.dataSource;
            var taskTree = dataSource.taskTree();
            var scrollToUid = this._scrollToUid;
            var current;
            var cachedUid;
            var cachedIndex = -1;
            var selected = this.select()[0] ? this.select().data("uid") : this._selected;

            if (this.current) {
                cachedUid = this.current.closest("tr").attr(kendo.attr("uid"));
                cachedIndex = this.current.index();
            }

            if (this.trigger("dataBinding")) {
                return;
            }

            if (this.resources.dataSource.data().length !== 0) {
                this._assignResources(taskTree);
            }

            if (this._editor) {
                this._editor.close();
            }

            this.clearSelection();
            this.list._renderTree(taskTree);
            this.timeline._render(taskTree);
            this.timeline._renderDependencies(this.dependencies.view());

            if (scrollToUid) {
                this._scrollTo(scrollToUid);
                this.select(selector(scrollToUid));
            }

            if ((scrollToUid || cachedUid) && cachedIndex >= 0) {
                current = this.list.element
                    .find("tr" + selector((scrollToUid || cachedUid)) + " > td").eq(cachedIndex);

                this._current(current);
            }

            this._scrollToUid = null;

            if (selected) {
                this._selected = selected;
                this.select("[data-uid=" + selected + "]");
            }

            this.trigger("dataBound");
        },

        refreshDependencies: function() {
            if (this._preventDependencyRefresh) {
                return;
            }

            if (this.trigger("dataBinding")) {
                return;
            }

            this.timeline._renderDependencies(this.dependencies.view());

            this.trigger("dataBound");
        },

        _assignResources: function(taskTree) {
            var resources = this.resources;
            var assignments = this.assignments;
            var groupAssigments = function() {
                var data = assignments.dataSource.view();
                var group = {
                    field: assignments.dataTaskIdField
                };

                data = new Query(data).group(group).toArray();

                return data;
            };
            var assigments = groupAssigments();
            var applyTaskResource = function(task, action) {
                var taskId = task.get("id");

                kendo.setter(resources.field)(task, new ObservableArray([]));

                for (var i = 0, length = assigments.length; i < length; i++) {
                    if (assigments[i].value === taskId) {
                        action(task, assigments[i].items);
                    }
                }
            };
            var wrapTask = function(task, items) {
                for (var j = 0, length = items.length; j < length; j++) {
                    var item = items[j];
                    var resource = resources.dataSource.get(item.get(assignments.dataResourceIdField));
                    var resourceValue = item.get(assignments.dataValueField);
                    var resourcedId = item.get(assignments.dataResourceIdField);
                    var valueFormat = resource.get(resources.dataFormatField) || PERCENTAGE_FORMAT;
                    var formatedValue = kendo.toString(resourceValue, valueFormat);

                    task[resources.field].push(new ObservableObject({
                        id: resourcedId,
                        name: resource.get(resources.dataTextField),
                        color: resource.get(resources.dataColorField),
                        value: resourceValue,
                        formatedValue: formatedValue,
                        format: valueFormat
                    }));
                }
            };

            for (var i = 0, length = taskTree.length; i < length; i++) {
                applyTaskResource(taskTree[i], wrapTask);
            }
        },

        _wrapResourceData: function(id) {
            var that = this;
            var result = [];
            var resource;
            var resources = this.resources.dataSource.view();
            var assignments = this.assignments.dataSource.view();
            var taskAssignments = new Query(assignments).filter({
                field: that.assignments.dataTaskIdField,
                operator: "eq",
                value: id
            }).toArray();
            var valuePerResource = function(id) {
                var resourceValue = null;

                new Query(taskAssignments).filter({
                    field: that.assignments.dataResourceIdField,
                    operator: "eq",
                    value: id
                }).select(function(assignment) {
                    resourceValue += assignment.get(that.assignments.dataValueField);
                });

                return resourceValue;
            };

            for (var i = 0, length = resources.length; i < length; i++) {
                resource = resources[i];
                result.push({
                    id: resource.get("id"),
                    name: resource.get(that.resources.dataTextField),
                    format: resource.get(that.resources.dataFormatField) || PERCENTAGE_FORMAT,
                    value: valuePerResource(resource.id)
                });
            }

            return result;
        },

        _syncDataSource: function() {
            this._preventRefresh = false;
            this._requestStart();
            this.dataSource.sync();
        },

        _requestStart: function() {
            this._progress(true);
        },

        _error: function() {
            this._progress(false);
        },

        _progress: function(toggle) {
            kendo.ui.progress(this.element, toggle);
        },

        _scrollable: function() {
            var that = this;
            var ganttStyles = Gantt.styles;
            var contentSelector = DOT + ganttStyles.gridContent;
            var headerSelector = DOT + ganttStyles.gridHeaderWrap;
            var timelineHeader = this.timeline.element.find(headerSelector);
            var timelineContent = this.timeline.element.find(contentSelector);
            var treeListHeader = this.list.element.find(headerSelector);
            var treeListContent = this.list.element.find(contentSelector);

            if (mobileOS) {
                treeListContent.css("overflow-y", "auto");
            }

            timelineContent.on("scroll", function() {
                that.scrollTop = this.scrollTop;
                kendo.scrollLeft(timelineHeader, this.scrollLeft);
                treeListContent.scrollTop(this.scrollTop);
            });

            treeListContent
                .on("scroll", function() {
                    kendo.scrollLeft(treeListHeader, this.scrollLeft);
                })
                .on("DOMMouseScroll" + NS + " mousewheel" + NS, function(e) {
                    var scrollTop = timelineContent.scrollTop();
                    var delta = kendo.wheelDeltaY(e);

                    if (delta) {
                        e.preventDefault();
                        //In Firefox DOMMouseScroll event cannot be canceled
                        $(e.currentTarget).one("wheel" + NS, false);

                        timelineContent.scrollTop(scrollTop + (-delta));
                    }
                });
        },

        _navigatable: function() {
            var that = this;
            var navigatable = this.options.navigatable;
            var editable = this.options.editable;
            var ganttStyles = Gantt.styles;
            var contentSelector = DOT + ganttStyles.gridContent;
            var listWrapper = DOT + ganttStyles.listWrapper;
            var headerSelector = DOT + ganttStyles.gridHeaderWrap;
            var headerTable = this.list.element.find(headerSelector).find("table");
            var contentTable = this.list.element.find(contentSelector).find("table");
            var tables = headerTable.add(contentTable);
            var attr = selector();
            var deleteAction = function() {
                var editable = that.options.editable;

                if (!editable || editable.destroy === false || that.list.editor) {
                    return;
                }

                var selectedTask = that.select();
                var uid = kendo.attr("uid");

                if (selectedTask.length) {
                    that.removeTask(selectedTask.attr(uid));
                }
            };

            $(this.wrapper)
                .on("mousedown" + NS, listWrapper + " tr" + attr, function(e) {
                    var isInput = $(e.target).is(":button,a,:input,a>.k-icon,.k-svg-icon,k-svg-icon,svg,path,textarea,span.k-icon:not(.k-i-none),span.k-svg-icon:not(.k-svg-i-none),span.k-link,.k-input,.k-multiselect-wrap,.k-input-value-text,.k-input-inner");

                    if (e.ctrlKey) {
                        return;
                    }


                    if ((navigatable || editable) && !isInput) {
                        that._focusTimeout = setTimeout(function() {
                            focusTable(that.list.content.find("table"), true);
                        }, 2);
                    }
                })
                .on("keydown" + NS, function(e) {
                    var key = e.keyCode;
                    var that = this;
                    var uid;
                    var cell;
                    var target = $(e.target);
                    var focusedIndex;
                    var focusSequence = [
                        that.toolbar,
                        that.layout.find(".k-splitbar"),
                        that.layout.find(".k-gantt-treelist"),
                        that.layout.find(".k-gantt-timeline")
                    ];

                    that._tabPressed = false;

                    if (that.footer) {
                        focusSequence.push(that.footer);
                    }

                    for (var i = 0; i < focusSequence.length; i++) {
                        if ($.contains(focusSequence[i][0], e.target) || focusSequence[i][0] === e.target) {
                            focusedIndex = i;
                            break;
                        }
                    }

                    if (key === keys.F10) {
                        that.toolbar.find("[tabindex=0]:visible").first().addClass(ganttStyles.focused).trigger("focus");
                        e.preventDefault();
                    } else if (key == keys.TAB) {
                        if (focusedIndex == 2) {
                            that._tabPressed = true;
                        }
                        if (e.shiftKey) {
                            for (i = focusedIndex - 1; i >= 0; i--) {
                                if (!focusSequence[i].hasClass("k-hidden")) {
                                    uid = target.attr("data-uid");
                                    if (i === 2 && uid) {
                                        cell = that.list.content.find("tr[data-uid='" + uid + "']").find("td").last();
                                        that.list.current(cell);
                                        focusTable(that.list.content.find("table"), true);
                                    } else {
                                        focusSequence[i].find("[tabindex=0]:visible").focus();
                                    }
                                    e.preventDefault();
                                    break;
                                }
                            }
                        } else {
                            for (i = focusedIndex + 1; i < focusSequence.length; i++) {
                                if (!focusSequence[i].hasClass("k-hidden")) {
                                    focusSequence[i].find("[tabindex=0]:visible").focus();
                                    e.preventDefault();
                                  break;
                                }
                            }
                        }
                    }

                }.bind(this));

            if (navigatable) {
                contentTable
                    .on("keydown" + NS, function(e) {
                        var key = e.keyCode;
                        if (e.keyCode == keys.DELETE) {
                            deleteAction();
                        } else if (key >= 49 && key <= 57 && e.target.tagName.toLowerCase() !== "input") {
                           that.view(that.timeline._viewByIndex(key - 49));
                        }
                    });

                return;
            }

            tables
                .on("focus" + NS, function() {
                    $(that.toolbar.find(DOT + ganttStyles.focused)).removeClass(ganttStyles.focused);
                })
                .on("blur" + NS, function() {

                    if (this == headerTable) {
                        $(this).attr(TABINDEX, -1);
                    }
                });
        },


        _dataBind: function() {
            var that = this;

            if (that.options.autoBind) {
                this._preventRefresh = true;
                this._preventDependencyRefresh = true;

                var promises = $.map([
                    this.dataSource,
                    this.dependencies,
                    this.resources.dataSource,
                    this.assignments.dataSource
                ],
                function(dataSource) {
                    return dataSource.fetch();
                });

                $.when.apply(null, promises)
                    .done(function() {
                        that._preventRefresh = false;
                        that._preventDependencyRefresh = false;
                        that.refresh();
                    });
            }
        },

        _resize: function() {
            this._adjustDimensions();
            this.timeline.view()._adjustHeight();
            this.timeline.view()._renderCurrentTime();
            this.list._adjustHeight();
        },

        _togglePlannedTasks: function(e) {
            var timeline = this.timeline;

            if (!this.trigger("togglePlannedTasks", { showPlannedTasks: !timeline.options.showPlannedTasks })) {
                this.wrapper.toggleClass(ganttStyles.plannedTasks);
                timeline._setPlanned(!timeline.options.showPlannedTasks);
                timeline._render(this.dataSource.taskTree());
                timeline._renderDependencies(this.dependencies.view());
            } else {
                e.preventDefault();
            }
        }
    });

    if (kendo.PDFMixin) {
        kendo.PDFMixin.extend(Gantt.fn);

        Gantt.fn._drawPDF = function() {
            var ganttStyles = Gantt.styles;
            var listTableWidth = this.wrapper.find(DOT + ganttStyles.list + " " + DOT + ganttStyles.gridContent + ">table").width();
            var content = this.wrapper.clone();

            content.find(DOT + ganttStyles.list).css("width", listTableWidth);

            return this._drawPDFShadow({
                content: content
            }, {
                avoidLinks: this.options.pdf.avoidLinks
            });
        };
    }

    kendo.ui.plugin(Gantt);

    extend(true, Gantt, { styles: ganttStyles });

})(window.kendo.jQuery);
export default kendo;

