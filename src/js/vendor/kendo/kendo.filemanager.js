/**
 * Kendo UI v2023.2.718 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./filemanager/commands.js";
import "./filemanager/view.js";
import "./filemanager/data.js";
import "./filemanager/contextmenu.js";
import "./kendo.toolbar.js";
import "./kendo.breadcrumb.js";
import "./kendo.upload.js";
import "./kendo.dialog.js";
import "./kendo.resizable.js";
import "./kendo.switch.js";
import "./kendo.textbox.js";
import "./kendo.icons.js";

var __meta__ = {
    id: "filemanager",
    name: "FileManager",
    category: "web",
    description: "The FileManager widget displays offers file management functionality.",
    depends: [ "core", "data", "listview", "toolbar", "breadcrumb", "menu", "treeview", "upload", "dialog", "switch", "resizable", "selectable", "editable", "textbox", "icons" ],
    features: [{
        id: "filemanager-grid-view",
        name: "GridView",
        description: "Support for GridView",
        depends: [ "grid" ]
    }]
};

(function($, undefined) {
    var ui = kendo.ui,
        extend = $.extend,
        encode = kendo.htmlEncode,
        isPlainObject = $.isPlainObject,
        isArray = Array.isArray,
        DataBoundWidget = ui.DataBoundWidget,
        template = kendo.template,
        outerHeight = kendo._outerHeight,
        ns = ".kendoFileManager",

        NAVIGATE = "navigate",
        SELECT = "select",
        OPEN = "open",
        ERROR = "error",
        CHANGE = "change",
        UPLOAD = "upload",
        SUCCESS = "success",
        CLICK = "click",
        TOGGLE = "toggle",
        CLOSE = "close",
        HIDE = "hide",
        LOAD = "load",
        DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        DROP = "drop",
        EXECUTE = "execute",
        COMMAND = "command",
        KEYDOWNACTION = "keydownAction",
        CANCEL = "cancel",

        TREE_TYPE = "tree",
        DOT = ".";

    var fileManagerStyles = {
        wrapper: "k-widget k-filemanager",
        header: "k-filemanager-header",
        navigation: "k-filemanager-navigation",
        contentContainer: "k-filemanager-content-container",
        content: "k-filemanager-content",
        preview: "k-filemanager-preview",
        toolbar: "k-filemanager-toolbar",
        treeview: "k-filemanager-treeview",
        breadcrumb: "k-filemanager-breadcrumb",
        view: "k-filemanager-view",
        grid: "k-filemanager-grid",
        list: "k-filemanager-listview",
        upload: "k-filemanager-upload",
        uploadDialog: "k-filemanager-upload-dialog",
        splitBar: "k-splitbar",
        splitBarHorizontal: "k-splitbar-horizontal k-splitbar-draggable-horizontal",
        splitBarHover: "k-splitbar-horizontal-hover",
        splitBarIcon: "k-icon k-resize-handle",
        splitBarNavigation: "k-filemanager-splitbar-navigation",
        splitBarPreview: "k-filemanager-splitbar-preview",
        resizable: "k-filemanager-resizable"
    };

    var fileManagerTemplateStyles = {
        filePreview: "k-file-preview",
        fileInfo: "k-file-info",
        fileName: "k-file-name",
        fileMeta: "k-file-meta",
        metaLabel: "k-file-meta-label",
        metaValue: "k-file-meta-value",
        extension: "k-file-type",
        size: "k-file-size",
        created: "k-file-created",
        modified: "k-file-modified"
    };

    var viewTypes = {
        grid: "grid",
        list: "list"
    };

    var NO_FILE_PREVIEW_TEMPLATE = ({ styles, messages }) =>
         `<div class="${encode(styles.fileInfo)}">` +
            `<div class="${encode(styles.filePreview)}">` +
                '<span class="k-file-icon k-icon k-i-none"></span>' +
            '</div>' +
            `<span class="${encode(styles.fileName)}" k-no-file-selected>${encode(messages.noFileSelected)}</span>` +
        '</div>';

    var SINGLE_FILES_PREVIEW_TEMPLATE = ({ styles, selection, metaFields, messages }) => {
        let result = '';
        result +=
        `<div class="${encode(styles.fileInfo)}">` +
            `<div class="${encode(styles.filePreview)}">` +
                kendo.ui.icon({ icon: (!selection[0].isDirectory ? encode(kendo.getFileGroup(selection[0].extension, true)) : "folder"), iconClass: "k-file-icon", size: "xxxlarge" }) +
            '</div>' +
            `<span class="${encode(styles.fileName)}">${encode(selection[0].name)}</span>`;
        if (metaFields) {
            result += `<dl class="${encode(styles.fileMeta)}">`;
                for (var i = 0; i < metaFields.length; i += 1) {
                    var field = metaFields[i];
                    result +=
                    `<dt class="${encode(styles.metaLabel)}">${encode(messages[field])}: </dt>` +
                    `<dd class="${encode(styles.metaValue)} ${encode(styles[field])}">`;
                    if (field == "size") {
                        result += ` ${encode(kendo.getFileSizeMessage(selection[0][field]))}`;
                    } else if (selection[0][field] instanceof Date) {
                        result += ` ${encode(kendo.toString(selection[0][field], "G"))}`;
                    } else if (field == "extension") {
                        result += ` ${encode( !selection[0].isDirectory ? kendo.getFileGroup(selection[0].extension) : "folder")}`;
                    } else {
                        result += ` ${encode(selection[0][field])}`;
                    }

                    result += '</dd>' +
                    '<dd class="k-line-break"></dd>';
                }

                result += '</dl>';
        }

        result += '</div>';
        return result;
    };

    var MULTIPLE_FILES_PREVIEW_TEMPLATE = ({ styles, selection, messages }) =>
        `<div class="${encode(styles.fileInfo)}">` +
            `<div class="${encode(styles.filePreview)}">` +
                kendo.ui.icon({ icon: "file", iconClass: "k-file-icon", size: "xxxlarge" }) +
            '</div>' +
            `span class="${encode(styles.fileName)}">` +
                `${encode(selection.length)} ` +
                `${encode(messages.items)}` +
            '</span>' +
        '</div>';

    var FileManager = DataBoundWidget.extend({
        init: function(element, options) {
            var that = this;

            DataBoundWidget.fn.init.call(that, element, options);

            that.options = kendo.deepExtend({}, that.options, options);

            that.defaultSortOption = { field: "name", dir: "asc" };
            that.folderSortOption = { field: "isDirectory", dir: "desc" };

            that._commandStack = new ui.filemanager.CommandStack();

            that._dataSource();

            that._wrapper();

            that._renderHeader();

            that._renderContentContainer();

            that._initContextMenu();

            that._renderNavigation();

            that._renderContent();

            that._renderPreview();

            that._initUploadDialog();

            that._resizable();

            that._attachKeyDown();

            that.resize();

            kendo.notify(that, kendo.ui);
        },

        options: {
            name: "FileManager",
            height: 500,
            resizable: true,
            initialView: viewTypes.list,
            toolbar: {
                resizable: true
            },
            contextMenu: {},
            upload: {},
            uploadUrl: "",
            views: {},
            breadcrumb: {},
            draggable: true,
            dialogs: {
                upload: {
                    width: 530
                },
                moveConfirm: {
                    width: 350,
                    closable: true
                },
                deleteConfirm: {
                    width: 360,
                    closable: true
                },
                renamePrompt: {
                    width: 350,
                    closable: true
                }
            },
            previewPane: {
                metaFields: ["extension", "size", "created", "modified"],
                noFileTemplate: NO_FILE_PREVIEW_TEMPLATE,
                singleFileTemplate: SINGLE_FILES_PREVIEW_TEMPLATE,
                multipleFilesTemplate: MULTIPLE_FILES_PREVIEW_TEMPLATE
            },
            messages: {
                toolbar: {
                    createFolder: "New Folder",
                    upload: "Upload",
                    sortDirection: "Sort Direction",
                    sortDirectionAsc: "Sort Direction Ascending",
                    sortDirectionDesc: "Sort Direction Descending",
                    sortField: "Sort By",
                    nameField: "Name",
                    sizeField: "File Size",
                    typeField: "Type",
                    dateModifiedField: "Date Modified",
                    dateCreatedField: "Date Created",
                    listView: "List View",
                    gridView: "Grid View",
                    search: "Search",
                    details: "View Details",
                    detailsChecked: "On",
                    detailsUnchecked: "Off",
                    "delete": "Delete",
                    rename: "Rename"
                },
                views: {
                    nameField: "Name",
                    sizeField: "File Size",
                    typeField: "Type",
                    dateModifiedField: "Date Modified",
                    dateCreatedField: "Date Created",
                    items: "items",
                    listLabel: "FileManager ListView",
                    gridLabel: "FileManager Grid",
                    treeLabel: "FileManager TreeView"
                },
                dialogs: {
                    upload: {
                        title: "Upload Files",
                        clear: "Clear List",
                        done: "Done"
                    },
                    moveConfirm: {
                        title: "Confirm",
                        content: "<p style='text-align: center;'>Do you want to move or copy?</p>",
                        okText: "Copy",
                        cancel: "Move",
                        close: "close"
                    },
                    deleteConfirm: {
                        title: "Confirm",
                        content: "<p style='text-align: center;'>Are you sure you want to delete the selected file(s)?</br>You cannot undo this action.</p>",
                        okText: "Delete",
                        cancel: "Cancel",
                        close: "close"
                    },
                    renamePrompt: {
                        title: "Prompt",
                        content: "<p style='text-align: center;'>Enter new name for the file.</p>",
                        okText: "Rename",
                        cancel: "Cancel",
                        close: "close"
                    }
                },
                previewPane: {
                    noFileSelected: "No File Selected",
                    extension: "Type",
                    size: "Size",
                    created: "Date Created",
                    createdUtc: "Date Created UTC",
                    modified: "Date Modified",
                    modifiedUtc: "Date Modified UTC",
                    items: "items"
                }
            }
        },

        events: [
            NAVIGATE,
            SELECT,
            OPEN,
            DATABINDING,
            DATABOUND,
            ERROR,
            DROP,
            EXECUTE,
            COMMAND
        ],

        defaultTools: {
            createFolder: { type: "button", name: "createFolder", command: "CreateFolderCommand", rules: { remote: true } },
            upload: { type: "button", name: "upload", command: "OpenDialogCommand", options: "{ \"type\": \"uploadDialog\" }", rules: { remote: true } },
            sortDirection: {
                type: "buttonGroup",
                buttons: [
                    { name: "sortDirectionAsc", showText: "overflow", icon: "sort-asc-small", togglable: true, group: "sortDirection", command: "SortCommand", options: "{ \"dir\": \"asc\" }", selected: true },
                    { name: "sortDirectionDesc", showText: "overflow", icon: "sort-desc-small", togglable: true, group: "sortDirection", command: "SortCommand", options: "{ \"dir\": \"desc\" }" }
                ]
            },
            sortField: {
                type: "splitButton",
                name: "sortField",
                command: "SortCommand",
                menuButtons: [
                    { name: "nameField", options: "{\"field\": \"name\"}", command: "SortCommand" },
                    { name: "typeField", options: "{\"field\": \"extension\"}", command: "SortCommand" },
                    { name: "sizeField", options: "{\"field\": \"size\"}", command: "SortCommand" },
                    { name: "dateCreatedField", options: "{\"field\": \"createdUtc\"}", command: "SortCommand" },
                    { name: "dateModifiedField", options: "{\"field\": \"modifiedUtc\"}", command: "SortCommand" }
                ]
            },
            changeView: {
                type: "buttonGroup",
                buttons: [
                    { name: "gridView", showText: "overflow", icon: "grid-layout", togglable: true, group: "changeView", command: "ChangeViewCommand", options: "grid" },
                    { name: "listView", showText: "overflow", icon: "grid", togglable: true, group: "changeView", command: "ChangeViewCommand", options: "list" }
                ]
            },
            spacer: { type: "spacer" },
            details: {
                type: "component",
                name: "details",
                items: [{
                    template: function(data) {
                        return "<label for='details-toggle'>" + encode(data.componentOptions.messages.text) + "</label>";
                    },
                    overflow: "never",
                    componentOptions: {
                        messages: {
                            text: "details"
                        }
                    }
                },
                {
                    name: "details",
                    command: "TogglePaneCommand",
                    options: "{ \"type\": \"preview\" }",
                    overflow: "never",
                    element: "<input id='details-toggle' class='k-filemanager-details-toggle' />",
                    component: "Switch",
                    componentOptions: {
                        messages: {
                            checked: "detailsChecked",
                            unchecked: "detailsUnchecked"
                        },
                        commandOn: "change"
                    }
                }]
            },
            search: {
                type: "component",
                name: "search",
                command: "SearchCommand",
                options: "{ \"field\": \"name\", \"operator\": \"startswith\" }",
                overflow: "never",
                component: "TextBox",
                componentOptions: {
                    placeholder: "Search",
                    icon: "search",
                    commandOn: "input"
                }
            }
        },

        _attachKeyDown: function() {
            var that = this;

            that.wrapper.on("keydown" + ns, (e) => {
                if (e.keyCode === kendo.keys.F10) {
                    e.preventDefault();
                    that.toolbar.element.find("[tabindex=0]").first().trigger("focus");
                }
            });
        },

        _dataSource: function() {
            var that = this,
                options = that.options,
                dataSourceOptions = options.dataSource || {},
                typeSortOrder = that.folderSortOption,
                nameSortOrder = that.defaultSortOption,
                dataSource;

            if (!(dataSourceOptions instanceof kendo.data.FileManagerDataSource)) {
                if (isArray(dataSourceOptions)) {
                    dataSource = {
                        data: dataSourceOptions,
                        autoSync: false,
                        sort: [typeSortOrder, nameSortOrder]
                     };
                } else {
                    dataSource = extend(true, dataSourceOptions, {
                        autoSync: false,
                        sort: [typeSortOrder, nameSortOrder]
                    });
                }

                if (dataSourceOptions && isPlainObject(dataSourceOptions.schema)) {
                    dataSource.schema = dataSourceOptions.schema;
                } else if (isPlainObject(kendo.data.schemas.filemanager)) {
                    dataSource.schema = kendo.data.schemas.filemanager;
                }
            } else {
                dataSource = dataSourceOptions;
            }

            if (that.dataSource && that._errorHandler) {
                that.dataSource.unbind(ERROR, that._errorHandler);
                that.dataSource.unbind(CHANGE, that._changeHandler);
            } else {
                that._errorHandler = that._error.bind(that);
                that._changeHandler = that._change.bind(that);
            }

            that.dataSource = kendo.data.FileManagerDataSource.create(dataSource)
                .bind(ERROR, that._errorHandler)
                .bind(CHANGE, that._changeHandler);
        },

        _error: function(ev) {
            if (!this.trigger(ERROR, ev)) {
                window.console.warn('Error! The requested URL returned ' + ev.xhr.status + ' - ' + ev.xhr.statusText);
            }
        },

        _wrapper: function() {
            var that = this,
                options = that.options,
                width = options.width,
                height = options.height;

            that.wrapper = that.element
                .addClass(fileManagerStyles.wrapper);

            if (width) {
                that.wrapper.width(width);
            }

            if (height) {
                that.wrapper.height(height);
            }

            that._resizeHandler = kendo.onResize(function() {
                that.resize(true);
            });
        },

        _renderHeader: function() {
            var that = this,
                options = that.options;

            if (options.toolbar) {
                that.header = $("<div />").addClass(fileManagerStyles.header);
            }

            that.wrapper.append(that.header);

            if (options.toolbar) {
                that._initToolbar();
                that.toolbar._tabIndex();
            }
        },

        _renderContentContainer: function() {
            var that = this,
                container = $("<div />").addClass(fileManagerStyles.contentContainer);

            that.contentContainer = container;

            that.wrapper.append(that.contentContainer);
        },

        _initContextMenu: function() {
            var that = this,
                options = that.options,
                menuOptions = extend({}, options.contextMenu, {
                    filemanager: that,
                    messages: options.messages.toolbar,
                    target: that.contentContainer,
                    filter: "[data-uid]",
                    action: that.executeCommand.bind(that),
                    isLocalBinding: that.dataSource.isLocalBinding
                });

            if (options.contextMenu === false) {
                return;
            }

            that.contextMenu = new ui.filemanager.ContextMenu("<ul></ul>", menuOptions);

            that.contextMenu.bind(OPEN, that._cacheFocus.bind(that));
        },

        _renderNavigation: function() {
            var that = this;

            that.navigation = $("<div />").addClass(fileManagerStyles.navigation);
            that.navigation.append(that._initTreeView().element);

            that.contentContainer.append(that.navigation);
        },

        _renderContent: function() {
            var that = this,
                options = that.options,
                toolbar = that.toolbar;

            that.content = $("<div />").addClass(fileManagerStyles.content);

            if (options.breadcrumb) {
                that.content.append(that._initBreadcrumb().element);
            }

            that.content.append(that._initView());

            if (!toolbar || !that._isToolEnabled(that.defaultTools.upload.name)) {
                that.content.append(that._initUpload().wrapper.hide());
            }

            that.contentContainer.append(that.content);
        },

        _renderPreview: function() {
            var that = this,
                enablePreview = that.options.previewPane;

            if (!enablePreview) {
               return;
            }

            that.preview = $("<div tabindex='0' />").addClass(fileManagerStyles.preview);
            that.previewContainer = $("<div />").addClass(fileManagerStyles.previewContainer);
            that.preview.append(that.previewContainer);

            that._setPreviewPaneContent();

            that.contentContainer.append(that.preview.hide());
        },

        _setPreviewPaneContent: function() {
            var that = this,
                options = that.options,
                previewPaneMessages = options.messages.previewPane,
                previewPaneOptions = options.previewPane,
                selection = that.getSelected(),
                previewTemplate;

            if (!selection) {
                previewTemplate = template(previewPaneOptions.noFileTemplate)({
                    styles: fileManagerTemplateStyles,
                    messages: previewPaneMessages
                });

                that.previewContainer.html(previewTemplate);
                return;
            }

            previewTemplate = selection.length === 1 ?
                previewPaneOptions.singleFileTemplate :
                previewPaneOptions.multipleFilesTemplate;

            previewTemplate = template(previewTemplate)({
                styles: fileManagerTemplateStyles,
                messages: previewPaneMessages,
                selection: selection,
                metaFields: previewPaneOptions.metaFields
            });

            that.previewContainer.html(previewTemplate);
        },

        _initToolbar: function() {
            var that = this,
                options = that.options,
                toolbarElement = $("<div />").addClass(fileManagerStyles.toolbar),
                toolbarOptions = extend({}, options.toolbar),
                tools = toolbarOptions.items ? toolbarOptions.items : Object.keys(that.defaultTools);

            tools = that._processTools(tools);
            toolbarOptions.tools = tools;
            toolbarOptions.defaultTools = that.defaultTools;
            toolbarOptions.parentMessages = that.options.messages.toolbar;

            that.header.append(toolbarElement);
            that.toolbar = new kendo.ui.ToolBar(toolbarElement, toolbarOptions);
            that.options.toolbar = that.toolbar.options;

            that.toolbar.bind(TOGGLE, that._toolbarClick.bind(that));
            that.toolbar.bind(CLOSE, that._toolbarClick.bind(that));
            that.toolbar.bind(CLICK, that._toolbarClick.bind(that));
            that.toolbar.bind(CHANGE, that._toolbarClick.bind(that));

            return that.toolbar;
        },

        _processTools: function(tools) {
            var that = this;

            tools.forEach(t => {
                var rules = t.rules || that.defaultTools[t] ? that.defaultTools[t].rules : null;

                if (rules && rules.remote && that.dataSource.isLocalBinding) {
                    if (t.rules) {
                        t.hidden = true;
                    } else {
                        that.defaultTools[t].hidden = true;
                    }
                }

                if (t.name === "changeView") {
                    that.defaultTools[t.name].buttons.forEach((b, i) => {
                        if (b.options === that.options.initialView) {
                            that.defaultTools[t.name].buttons[i].selected = true;
                        }
                    });
                } else if (t.buttons && t.buttons[0].group === "changeView") {
                    t.buttons.forEach((b, i) => {
                        if (b.options === that.options.initialView) {
                            t.buttons[i].selected = true;
                        }
                    });
                }
            });

            return tools;
        },

        _toolbarClick: function(ev) {
            var command = $(ev.target).data("command"),
                options = $(ev.target).data("options");

            if (!!$(ev.target).val()) {
                options = extend({}, options, { value: $(ev.target).val() });
            }

            if (!command) {
                return;
            }

            this.executeCommand({
                command: command,
                options: options
            });
        },

        _isToolEnabled: function(toolName) {
            var that = this,
                options = that.options.toolbar,
                items = options.items || that.defaultTools,
                found = false;

            for (var i = 0; i < items.length; i++) {
                if (items[i].name == toolName) {
                    found = true;
                    break;
                }
            }

            return items[toolName] || found;
        },

        _initTreeView: function() {
            var that = this,
                treeViewElement = $("<div />").addClass(fileManagerStyles.treeview),
                options = that.options.views[TREE_TYPE],
                explicitOptions = extend(true, {}, {
                    dataSource: that.options.dataSource,
                    messages: that.options.messages.views,
                    draggable: that.options.draggable,
                    isLocalBinding: that.dataSource.isLocalBinding
                });

            that.treeView = new ui.filemanager.ViewComponents[TREE_TYPE](treeViewElement, options, explicitOptions);

            that.treeView.bind(NAVIGATE, that._navigate.bind(that))
                         .bind(LOAD, that._load.bind(that))
                         .bind(DROP, that._drop.bind(that))
                         .bind(KEYDOWNACTION, that._keydownAction.bind(that));

            return that.treeView;
        },

        _drop: function(ev) {
            var that = this;

            if (!that.trigger(DROP, ev) && ev.items.indexOf(ev.target) < 0) {
                that._confirm({
                    type: "move",
                    target: ev.target
                }).done(function() {
                    that.executeCommand({ command: "CopyCommand", options: ev });
                }).fail(function() {
                    that.executeCommand({ command: "MoveCommand", options: ev });
                });
            }
        },

        _keydownAction: function(ev) {
            var that = this,
                keyCode = ev.keyCode,
                keys = kendo.keys;

            if (keyCode === keys.DELETE) {
                that.executeCommand({ command: "DeleteCommand", options: { target: ev.target } });
            }

            if (keyCode === keys.F2) {
                that.executeCommand({ command: "RenameCommand", options: { target: ev.target } });
            }
        },

        _confirm: function(options) {
            var that = this,
                messages = that.options.messages.dialogs[options.type + "Confirm"];

            var confirm = $("<div></div>").kendoConfirm(extend({}, {
                title: messages.title,
                content: messages.content,
                messages: messages
            }, that.options.dialogs[options.type + "Confirm"])).data("kendoConfirm");

            confirm.bind(OPEN, that._cacheFocus.bind(that));
            confirm.bind(HIDE, that._restoreFocus.bind(that, options.target));

            confirm.open();

            confirm.wrapper.removeClass("k-confirm");

            return confirm.result;
        },

        _prompt: function(options) {
            var that = this,
                messages = this.options.messages.dialogs[options.type + "Prompt"];

            var prompt = $("<div></div>").kendoPrompt(extend({}, {
                title: messages.title,
                content: messages.content,
                messages: messages,
                value: options.defaultInput
            },this.options.dialogs[options.type + "Prompt"])).data("kendoPrompt");

            prompt.bind(OPEN, that._cacheFocus.bind(that));
            prompt.bind(CLOSE, that._restoreFocus.bind(that, options.target));

            prompt.open();

            prompt.wrapper.removeClass("k-prompt");

            return prompt.result;
        },

        _cacheFocus: function() {
            var that = this,
                activeElement = $(document.activeElement),
                view = that.view(),
                treeView = that.treeView.widgetComponent;

            if (that.contextMenu && that.contextMenu.popup.visible()) {
                return;
            }

            that.treeView._shouldFocus = false;

            if ((treeView.current() && treeView.current().find(".k-focus").length) ||
                activeElement.hasClass(fileManagerStyles.treeview)) {
                that.treeView._shouldFocus = true;
                view._focusElement = activeElement;
                return;
            }

            view._focusElement = activeElement.hasClass(fileManagerStyles[that._viewType]) ?
                activeElement :
                null;
        },

        _restoreFocus: function(target) {
            var that = this,
                view = that.view();

            if (!target) {
                return;
            }

            if (view._focusElement) {
                view._focusElement.trigger("focus");
            } else if (target.closest && target.closest(":kendoFocusable").length) {
                target.closest(":kendoFocusable").trigger("focus");
            }
        },

        _initView: function() {
            var that = this,
                viewWrapper = $("<div />").addClass(fileManagerStyles.view),
                initialView = that.options.initialView;

            that.viewWrapper = viewWrapper;
            that.viewWrapper.append(that.view(initialView));

            return viewWrapper;
        },

        _initBreadcrumb: function() {
            var that = this,
                options = that.options,
                breadcrumbElement = $("<nav />").addClass(fileManagerStyles.breadcrumb),
                breadcrumbOptions = extend({}, {
                    items: [
                        { type: "rootitem", text: "" }
                    ],
                    change: that._breadcrumbChange.bind(that)
                }, options.breadcrumb);

            that.breadcrumb = new ui.Breadcrumb(breadcrumbElement, breadcrumbOptions);

            return that.breadcrumb;
        },

        _breadcrumbChange: function(ev) {
            var entry = ev.sender.items().filter(function(item) {
                return item.path === ev.value.substring(1);
            }).shift();

            this._navigate({ path: entry ? entry.id : "" });
        },

        _initUploadDialog: function() {
            var that = this,
                options = that.options,
                dialogMessages = options.messages.dialogs.upload,
                dialogElement = $("<div />"),
                dialogOptions = extend({}, {
                    title: dialogMessages.title,
                    modal: true,
                    visible: false,
                    width: 500,
                    actions: [
                        { text: () => dialogMessages.done, primary: true },
                        { text: () => dialogMessages.clear, action: that._clearUploadFilesList.bind(that) }
                    ],
                    messages: dialogMessages
                }, options.dialogs.upload),
                uploadInstance;

            if (!that._shouldInitUpload()) {
                return;
            }

            uploadInstance = that._initUpload();

            that.uploadDialog = new ui.Dialog(dialogElement, dialogOptions);
            that.uploadDialog.wrapper.addClass(fileManagerStyles.uploadDialog);
            that.uploadDialog.element.append(uploadInstance.wrapper);

            that.uploadDialog.bind(OPEN, that._toggleUploadDropZone.bind(that, ""));
            that.uploadDialog.bind(CLOSE, that._toggleUploadDropZone.bind(that, that.viewWrapper));

            return that.uploadDialog;
        },

        _shouldInitUpload: function() {
            var that = this,
                options = that.options,
                shouldInit = false;

            if ((options.uploadUrl || (options.upload.async && options.upload.async.saveUrl)) &&
                options.upload !== false) {
                    shouldInit = true;
            }

            return shouldInit;
        },

        _initUpload: function() {
            var that = this,
                options = that.options,
                uploadElement = $("<input type='file' name='file'/>").addClass(fileManagerStyles.upload),
                uploadOptions = extend(true, {
                    async: {
                         autoUpload: true,
                         saveUrl: options.uploadUrl
                    },
                    dropZone: that.viewWrapper
                }, options.upload);

            that.upload = new ui.Upload(uploadElement[0], uploadOptions);

            that.upload.bind(UPLOAD, that._sendUploadPathParameter.bind(that));
            that.upload.bind(SUCCESS, that._success.bind(that));

            return that.upload;
        },

        _sendUploadPathParameter: function(ev) {
            ev.data = extend(ev.data, { path: this.path() });
        },

        _success: function() {
            this._view.widgetComponent.dataSource.read();
        },

        _clearUploadFilesList: function() {
            var that = this,
                upload = that.upload;

            if (upload) {
                upload.clearAllFiles();
            }
        },

        _toggleUploadDropZone: function(zone) {
            var that = this,
                upload = that.upload;

            if (upload) {
                upload.setOptions({ dropZone: zone });
            }
        },

        _binding: function(ev) {
            if (this.trigger(DATABINDING, { source: "view", action: ev.action, items: ev.items, index: ev.index })) {
                ev.preventDefault();
            }
        },

        _bound: function() {
            if (this.options.previewPane) {
                this._setPreviewPaneContent();
            }
            this.trigger(DATABOUND);
        },

        _createResizableSplitBar: function(cssClass) {
            var splitBar = $("<div />")
                    .addClass(fileManagerStyles.splitBar)
                    .addClass(fileManagerStyles.splitBarHorizontal)
                    .addClass(cssClass),
                icon = $("<span />").addClass(fileManagerStyles.splitBarIcon);

            splitBar.append(icon);

            splitBar.hover(function() {
                $(this).toggleClass(fileManagerStyles.splitBarHover);
            });

            return splitBar;
        },

        _initResizableNavigation: function() {
            var that = this,
                wrapper = that.wrapper,
                splitBar = that._createResizableSplitBar(fileManagerStyles.splitBarNavigation),
                contentWrapper = wrapper.find(DOT + fileManagerStyles.content),
                navigationWrapper = wrapper.find(DOT + fileManagerStyles.navigation),
                contentWrapperWidth,
                navigationWrapperWidth;

            splitBar.insertAfter(navigationWrapper);

            that._resizeDraggable.navigation = that.wrapper.find(splitBar)
                .end()
                .kendoResizable({
                    handle: DOT + fileManagerStyles.splitBarNavigation,
                    start: function() {
                        contentWrapperWidth = contentWrapper.width();
                        navigationWrapperWidth = navigationWrapper.width();
                    },
                    resize: function(e) {
                        var delta = e.x.initialDelta;

                        if (kendo.support.isRtl(wrapper)) {
                            delta *= -1;
                        }

                        if (navigationWrapperWidth + delta < -2 || contentWrapperWidth - delta < -2) {
                            return;
                        }

                        navigationWrapper.width(navigationWrapperWidth + delta);
                    }
                }).getKendoResizable();
        },

        _initResizablePreview: function() {
            var that = this,
                wrapper = that.wrapper,
                splitBar = that._createResizableSplitBar(fileManagerStyles.splitBarPreview),
                contentWrapper = wrapper.find(DOT + fileManagerStyles.content),
                previewWrapper = wrapper.find(DOT + fileManagerStyles.preview),
                contentWrapperWidth,
                previewWrapperWidth;

            if (!that.options.previewPane) {
                return;
            }

            splitBar.insertBefore(previewWrapper).hide();

            that._resizeDraggable.preview = wrapper.find(splitBar)
                .end()
                .kendoResizable({
                    handle: DOT + fileManagerStyles.splitBarPreview,
                    start: function() {
                        contentWrapperWidth = contentWrapper.width();
                        previewWrapperWidth = previewWrapper.width();
                    },
                    resize: function(e) {
                        var delta = e.x.initialDelta;

                        if (kendo.support.isRtl(wrapper)) {
                            delta *= -1;
                        }

                        if (previewWrapperWidth - delta < -2 || contentWrapperWidth + delta < -2) {
                            return;
                        }

                        previewWrapper.width(previewWrapperWidth - delta);
                    }
                }).getKendoResizable();
        },

        _resizable: function() {
            var that = this,
                options = that.options;

            that._resizeDraggable = {};

            if (!options.resizable) {
                return;
            }

            that.wrapper.addClass(fileManagerStyles.resizable);

            that._initResizableNavigation();

            that._initResizablePreview();
        },

        view: function(type) {
            var that = this,
                element = $('<div></div>'),
                options = that.options.views[type],
                explicitOptions = extend(true, {}, {
                    dataSource: that._viewDataSource || that.dataSource,
                    messages: that.options.messages.views,
                    draggable: that.options.draggable,
                    ariaLabel: that.options.messages.views[type + "Label"]
                });

            if (type === undefined) {
                return that._view;
            }

            if (!ui.filemanager.ViewComponents[type]) {
                throw new Error(kendo.format("There is no {0} ViewComponent registered!", type));
            }

            if (that._view && that._view.destroy) {
                that._view.destroy();
                that.viewWrapper.empty();
            }

            that._viewType = type;
            that._view = new ui.filemanager.ViewComponents[type](element, options, explicitOptions);

            that._view.bind(SELECT, that._select.bind(that));
            that._view.bind(OPEN, that._open.bind(that));
            that._view.bind(DATABINDING, that._binding.bind(that));
            that._view.bind(DATABOUND, that._bound.bind(that));
            that._view.bind(DROP, that._drop.bind(that));
            that._view.bind(KEYDOWNACTION, that._keydownAction.bind(that));
            that._view.bind(CANCEL, that._cancel.bind(that));

            that._view.element.addClass(fileManagerStyles[type]);

            that.viewWrapper
                .removeClass(
                    Object.keys(ui.filemanager.ViewComponents).map(function(el) {
                        return fileManagerStyles.view + "-" + el;
                    }).join(" ")
                )
                .addClass(fileManagerStyles.view + "-" + type);

            that.viewWrapper.append(that._view.element);
        },

        executeCommand: function(args) {
            var commandName = args.command,
                commandOptions = extend({ filemanager: this }, isPlainObject(args.options) ? args.options : { value: args.options }),
                command = new ui.filemanager.commands[commandName](commandOptions);

            if (!this.trigger(EXECUTE, args)) {
                return command.exec();
            }
        },

        _navigate: function(ev) {
            var that = this,
                path = ev.path;

            if (!that.trigger(NAVIGATE, { path: path })) {
                that.navigate(path);
            }
        },

        _load: function(ev) {
            var entry = this.dataSource.get(ev.entryId);
            entry.load();
        },

        _select: function(ev) {
            if (this.options.previewPane) {
                this._setPreviewPaneContent();
            }

            this.trigger(SELECT, { entries: ev.entries });
        },

        _open: function(ev) {
            var that = this,
                entry = ev.entry;

            that.trigger(OPEN, { entry: entry });

            if (entry.isDirectory) {
                that._navigate({ path: entry.id });
            }
        },

        _cancel: function() {
            var that = this,
                commandStack = that._commandStack,
                command = commandStack.next();

            commandStack.reject(command);
            that.trigger(COMMAND, { status: "cancel", action: "itemchange", data: command.data });
        },

        _change: function(ev) {
            var that = this,
                commandStack = that._commandStack,
                targetDataSource = ev.node ? ev.node.children : that.dataSource;

            if (that.trigger(DATABINDING, { source: "tree", action: ev.action, items: ev.items, index: ev.index })) {
                return;
            }

            that.treeView._refreshDataSource(ev);

            if (ev.action === "remove" || ev.action === "itemchange" || ev.action === "add") {
                if (commandStack.empty()) {
                    targetDataSource.sync();
                } else {
                    var command = commandStack.next();

                    targetDataSource.sync().then(function(res) {
                        commandStack.resolve(command);
                        that.trigger(COMMAND, { status: "success", action: ev.action, data: command.data, response: res });
                    }).fail(function(res) {
                        commandStack.reject(command);
                        that.trigger(COMMAND, { status: "fail", action: ev.action, data: command.data, response: res });
                    });
                }
            }

            if (ev.action === "remove" && that._viewDataSource && that._viewDataSource.parent() && ev.items[0] === that._viewDataSource.parent()) {
                that._navigateToParent(ev.items[0]);
            }

            if (ev.action == "itemchange" && that._viewDataSource && that._viewDataSource.parent() && that.path().indexOf(ev.items[0].id) >= 0) {
                that._navigateToParent(ev.items[0]);
            }

            if (ev.action === "itemchange") {
                ev.items[0].loaded(false);
            }
        },

        _navigateToParent: function(item) {
            var that = this;
            var parent = item.parentNode();
            var parentNodePath = parent ? parent.id : "";
            that._navigate({ path: parentNodePath });
        },

        _buildBreadcrumbPath: function(entry) {
            var that = this,
                breadcrumb = that.breadcrumb,
                items = [];

            while (entry) {
                items.push({
                    id: entry.id,
                    text: entry.name,
                    path: entry.path
                });

                entry = entry.parentNode && entry.parentNode();
            }

            items.push({ type: "rootItem", id: "", text: "" });

            breadcrumb.items(items.reverse());
        },

        _adjustDimensions: function() {
            var that = this,
                wrapper = that.wrapper,
                gridSelector = DOT + fileManagerStyles.grid,
                listViewSelector = DOT + fileManagerStyles.list,
                contentContainer = DOT + fileManagerStyles.contentContainer,
                totalHeight = wrapper.height(),
                toolbarHeight = 0,
                breadcrumbHeight = 0;

            if (that.toolbar) {
                toolbarHeight = outerHeight(that.toolbar.wrapper);
            }

            if (that.breadcrumb) {
                breadcrumbHeight = outerHeight(that.breadcrumb.wrapper);
            }

            if (that.options.height !== "auto") {
                wrapper
                    .find([gridSelector].join(","))
                    .height(totalHeight - (toolbarHeight + breadcrumbHeight + 1));

                wrapper
                    .find(listViewSelector)
                    .parent()
                    .height(totalHeight - (toolbarHeight + breadcrumbHeight + 1));

                wrapper
                    .find(contentContainer)
                    .height(totalHeight - toolbarHeight);
            }
        },

        _resize: function() {
            this._adjustDimensions();
            kendo.resize(this.element.children());
        },

        setDataSource: function(dataSource) {
            var that = this;

            that.options.dataSource = dataSource;
            that._dataSource();

            if (that.toolbar) {
                that.toolbar.destroy();
                that.header.empty();
                that._initToolbar();
                that.toolbar._tabIndex();
            }

            if (that.treeView) {
                that.treeView.destroy();
                that.navigation.empty();
                that.navigation.append(that._initTreeView().element);
            }

            if (that._view) {
                that.view(that._viewType || that.options.initialView);
            }

            that._initContextMenu();

        },

        refresh: function() {
            var that = this,
                dataSource = that._viewDataSource || that.dataSource;

            dataSource.read();
        },

        getSize: function() {
            return kendo.dimensions(this.wrapper);
        },

        getSelected: function() {
            var that = this,
                items = that._view.getSelected(),
                treeView = that.treeView;

            if (items && items.length) {
                return items;
            }

            var item = treeView.getSelected();

            if (item) {
                return [ that.dataSource.get(item.id) ];
            }
        },

        path: function() {
            return this._path || "";
        },

        navigate: function(path) {
            var that = this,
                dataSource = that.dataSource,
                entry = dataSource.get(path.replace(/^\//, "")),
                view = that._view,
                treeView = that.treeView,
                breadcrumb = that.breadcrumb,
                isRoot = path === "" || path === "/";

            if (!entry && !isRoot) {
                window.console.warn('Error! Could not navigate to the folder at the requested path(' + path + '). Make sure that the parent folder of the target folder has already been loaded.');
                return;
            }

            that._path = path;

            if (that.trigger(DATABINDING, { source: "navigation", action: "rebind", items: [entry] })) {
                return;
            }

            if (breadcrumb) {
                that._buildBreadcrumbPath(entry);
            }

            if (isRoot) {
                dataSource.sort([ that.folderSortOption, that.defaultSortOption ]);
                that._viewDataSource = dataSource;
                view.refresh(that._viewDataSource);
                treeView.treeView.select($());

                if (that.options.previewPane) {
                    that._setPreviewPaneContent();
                }

                return;
            }

            if (entry.loaded && !entry.loaded()) {
                entry.load();
            }

            if (view) {
                that._viewDataSource = entry.children;
                that._viewDataSource._sort = [ that.folderSortOption, that.defaultSortOption ];
                view.refresh(that._viewDataSource);
            }

            if (treeView) {
                treeView.refresh(entry.id);
            }

            if (that.options.previewPane) {
                that._setPreviewPaneContent();
            }
        },

        items: function() {
            var that = this;

            return that.treeView.widgetComponent.items().add(that._view.widgetComponent.items());
        },

        destroy: function() {
            var that = this;

            DataBoundWidget.fn.destroy.call(that);

            that.dataSource
                .unbind(ERROR, that._errorHandler)
                .unbind(CHANGE, that._changeHandler);

            if (that._resizeDraggable.navigation) {
                that._resizeDraggable.navigation.destroy();
                that._resizeDraggable.navigation = null;
            }

            if (that._resizeDraggable.preview) {
                that._resizeDraggable.preview.destroy();
                that._resizeDraggable.preview = null;
            }

            if (that.uploadDialog) {
                that.uploadDialog.destroy();
                that.uploadDialog = null;
            }

            if (that.upload) {
                that.upload.destroy();
                that.upload = null;
            }

            if (that.contextMenu) {
                that.contextMenu.destroy();
                that.contextMenu = null;
            }

            kendo.unbindResize(that._resizeHandler);

            that.dataSource = null;
            that._viewDataSource = null;

            kendo.destroy(that.element);
        }
    });

    ui.plugin(FileManager);
})(window.kendo.jQuery);
export default kendo;

