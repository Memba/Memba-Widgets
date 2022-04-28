/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('filemanager/commands',["../kendo.core"], f);
})(function () {

    (function ($, undefined) {
        var kendo = window.kendo,
            extend = $.extend,
            deferred = $.Deferred,
            Class = kendo.Class;

        var Command = Class.extend({
            init: function (options) {
                this.options = options;
                this.filemanager = options.filemanager;
            }
        });

        var CreateFolderCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
                var that = this,
                    filemanager = that.filemanager,
                    commandStack = filemanager._commandStack,
                    dataSource = filemanager._viewDataSource || filemanager.dataSource,
                    removeProxy = that._remove.bind(that);

                that._item = dataSource._createNewModel();

                commandStack.push({ item: that._item.toJSON() }).fail(removeProxy);
                dataSource.add(that._item);
            },
            _remove: function () {
                var that = this,
                    filemanager = that.filemanager,
                    dataSource = filemanager._viewDataSource || filemanager.dataSource;

                dataSource.pushDestroy(that._item);
            }
        });

        var RenameCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
                var that = this,
                    target = that.options.target,
                    filemanager = that.filemanager,
                    commandStack = filemanager._commandStack,
                    viewItem = filemanager._view.widgetComponent.dataItem(target);

                if(target && viewItem){
                    commandStack.push({ target: target, item: viewItem });
                    that.filemanager._view.edit(target);
                } else {
                    that._renameTreeViewItem(target);
                }
            },
            _renameTreeViewItem: function(target){
                var that = this,
                    filemanager = that.filemanager,
                    commandStack = filemanager._commandStack,
                    uid = target.data("uid"),
                    item = that.filemanager.treeView.widgetComponent.dataSource.getByUid(uid),
                    realItem = that.filemanager.dataSource.get(item.id);

                that.filemanager._prompt({
                    type: "rename",
                    defaultInput: realItem.name,
                    target: target
                }).done(function(newName){
                    commandStack.push({ target: target, item: realItem });
                    realItem.set("name", newName);
                });
            }
        });

        var DeleteCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
                var that = this,
                    target = that.options.target,
                    filemanager = that.filemanager,
                    items = filemanager.getSelected(),
                    viewItem = that.filemanager._view.widgetComponent.dataItem(target),
                    itemsToRemove;

                if(target && target.is(".k-state-selected") && items && items.length) {
                    itemsToRemove = items;
                } else if(target && viewItem) {
                    itemsToRemove = viewItem;
                } else if(target) {
                    var uid = target.data("uid");
                    var item = that.filemanager.treeView.widgetComponent.dataSource.getByUid(uid);
                    var realItem = that.filemanager.dataSource.get(item.id);

                    itemsToRemove = realItem;
                }

                filemanager._confirm({
                    type: "delete",
                    target: target
                })
                .done(function () {
                    that.removeItems(itemsToRemove);
                });
            },
            removeItems: function(items) {
                var that = this;

                that._itemsToRemove = Array.isArray(items) ? items : [items];

                that._removeItem();
            },
            _removeItem: function(){
                var that = this,
                    filemanager = that.filemanager,
                    commandStack = filemanager._commandStack,
                    dataSource = filemanager.dataSource,
                    itemToRemove = !!that._itemsToRemove.length && that._itemsToRemove.splice(0,1)[0];

                if (itemToRemove) {
                    commandStack.push({ item: itemToRemove })
                        .then(that._removeItem.bind(that), that._removeItem.bind(that));

                    dataSource.remove(itemToRemove);
                }
            }
        });

        var CopyCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
                var that = this,
                filemanager = that.filemanager,
                dataSource = filemanager.dataSource,
                commandStack = filemanager._commandStack,
                items = that.options.items,
                target = dataSource.get(that.options.target),
                targetDataSource = target.children;

                for (var i = 0; i < items.length; i++) {
                    var item = dataSource.get(items[i]).toJSON();
                    item.fileManagerNewItem = true;
                    commandStack.push({ item: item, target: target });
                    targetDataSource.add(item);
                }
            }
        });

        var MoveCommand = Command.extend({
            init: function (options) {
                var that = this;
                Command.fn.init.call(that, options);
                that._itemsToRemove = [];
            },
            exec: function () {
                var that = this,
                    filemanager = that.filemanager,
                    commandStack = filemanager._commandStack,
                    dataSource = filemanager.dataSource,
                    items = that.options.items,
                    target = dataSource.get(that.options.target),
                    targetDataSource = target.children,
                    promises = [];

                for (var i = 0; i < items.length; i++) {
                    var item = dataSource.get(items[i]);
                    var cloning = item.toJSON();
                    cloning.fileManagerNewItem = true;

                    var promise = commandStack.push({ item: item, target: target })
                        .then(that._delete.bind(that));

                        promises.push(promise);
                        targetDataSource.add(cloning);
                }

                kendo.whenAll(promises).always(that._removeItem.bind(that));
            },
            _delete: function(data){
                var that = this;
                that._itemsToRemove.push(data.item);
            },
            _removeItem: function(){
                var that = this,
                    filemanager = that.filemanager,
                    commandStack = filemanager._commandStack,
                    dataSource = filemanager.dataSource,
                    itemToRemove = !!that._itemsToRemove.length && that._itemsToRemove.splice(0,1)[0];

                if (itemToRemove) {
                    commandStack.push({ item: itemToRemove })
                        .then(that._removeItem.bind(that), that._removeItem.bind(that));

                    dataSource.remove(itemToRemove);
                }
            }
        });

        var SortCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
                var that = this,
                    options = that.options,
                    filemanager = that.filemanager,
                    sortOptions = filemanager.defaultSortOption;

                extend(sortOptions, {
                    dir: options.dir,
                    field: options.field
                });

                filemanager._view.widgetComponent.dataSource.sort([ filemanager.folderSortOption, sortOptions ]);
            }
        });

        var SearchCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
                var that = this,
                    options = that.options,
                    filemanager = that.filemanager,
                    filter = {
                        field: options.field,
                        operator: options.operator,
                        value: options.value
                    };

                filemanager._view.widgetComponent.dataSource.filter(filter);
            }
        });

        var ChangeViewCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
                var that = this,
                    options = that.options,
                    filemanager = that.filemanager;

                filemanager.view(options.value);
                filemanager.resize(true);
            }
        });

        var OpenDialogCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
                var that = this,
                    filemanager = that.filemanager,
                    dialog = filemanager[that.options.type];

                if (dialog) {
                    dialog.open();
                } else {
                    window.console.warn(kendo.format("The {0} dialog is not available!", that.options.type));
                }
            }
        });

        var TogglePaneCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function() {
                var that = this,
                    filemanager = that.filemanager,
                    pane = filemanager[that.options.type],
                    resizable = that.getResizable();

                if (pane) {
                    pane.toggle();

                    if (resizable) {
                        filemanager.wrapper
                            .find(resizable.options.handle)
                            .toggle();
                    }
                }
            },
            getResizable: function() {
                var that = this,
                    filemanager = that.filemanager,
                    type = that.options.type;

                if (!filemanager._resizeDraggable) {
                    return;
                }

                return filemanager._resizeDraggable[type];
            }
        });

        var CommandStack = Class.extend({
            init: function(){
                var that = this;

                that._stack = {};
                that._keys = [];
            },
            push: function(data){
                var that = this,
                    guid = kendo.guid();

                that._keys.push(guid);
                that._stack[guid] = {
                    guid: guid,
                    data: data,
                    deferred: deferred()
                };

                return that._stack[guid].deferred;
            },
            next: function () {
                var that = this,
                    key = that.keys().splice(0,1),
                    nextCommand = that._stack[key];

                return nextCommand;
            },
            resolve: function(command){
                var that = this;
                delete that._stack[command.guid];
                command.deferred.resolve(command.data);
            },
            reject: function(command){
                var that = this;
                delete that._stack[command.guid];
                command.deferred.reject(command.data);
            },
            keys: function () {
                return this._keys;
            },
            empty: function(){
                return this.keys().length === 0;
            }
        });

        extend(kendo.ui, {
            filemanager: {
                FileManagerCommand: Command,
                CommandStack: CommandStack,
                commands: {
                    CreateFolderCommand: CreateFolderCommand,
                    RenameCommand: RenameCommand,
                    DeleteCommand: DeleteCommand,
                    MoveCommand: MoveCommand,
                    CopyCommand: CopyCommand,
                    SortCommand: SortCommand,
                    SearchCommand: SearchCommand,
                    ChangeViewCommand: ChangeViewCommand,
                    OpenDialogCommand: OpenDialogCommand,
                    TogglePaneCommand: TogglePaneCommand
                }
            }
        });

    })(window.kendo.jQuery);

    return window.kendo;

}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) { (a3 || a2)(); });
(function(f, define){
    define('filemanager/view',["../kendo.listview", "../kendo.treeview"], f);
})(function(){

(function($, undefined) {

    var kendo = window.kendo,
        ui = kendo.ui,
        Observable = kendo.Observable,
        extend = $.extend,
        keys = kendo.keys,

        NAVIGATE = "navigate",
        SELECT = "select",
        EXPAND = "expand",
        CHANGE = "change",
        OPEN = "open",
        LOAD = "load",
        KEYDOWN = "keydown",
        KEYDOWNACTION = "keydownAction",

        NS = ".kendoFileManagerViewComponent",

        fileManagerDraggables = [],
        fileManagerDragOrigin = null;

    var registerViewComponent = function(componentName, component) {
        ui.filemanager.ViewComponents[componentName] = component;
    };

    var getViewComponent = function(componentName) {
        return ui.filemanager.ViewComponents[componentName] || null;
    };

    var Component = Observable.extend({
        init: function(widget, element, options) {
            var that = this;

            that.element = element;
            that.options = options;

            if(widget) {
                that.widgetComponent = new widget(element, options);
            } else {
                throw new Error("The widget for the ViewComponent is not available! Please add the corresponding scripts!");
            }

            Observable.fn.init.call(that);
        },

        _bindEvents: function(){
            this.widgetComponent.bind("dataBinding", this._binding.bind(this));
            this.widgetComponent.bind("dataBound", this._bound.bind(this));
        },

        _binding: function(ev){
            if(this.trigger("dataBinding", ev)) {
                ev.preventDefault();
            }
        },

        _bound: function(){
            this.trigger("dataBound");
        },

        _setDSOptions: function (options, dataSourceOptions) {
            if(!options.dataSource && dataSourceOptions) {
                options.dataSource = dataSourceOptions;
            }
        },

        _initDragAndDrop: function (element, filter) {
            var that = this;

            filter = filter || that.options.dropFilter;
            element = element || that.element;

            that.draggable = element.kendoDraggable({
                filter: filter,
                hint: that._hint.bind(that),
                cursorOffset: { top: -10, left: -50 },
                holdToDrag: true,
                ignore: "input, .k-focusable",
                hold: that._hold.bind(that)
            }).data("kendoDraggable");

            that.draggable.userEvents.minHold = 150;

            that.droptarget = element.kendoDropTargetArea({
                filter: filter,
                drop: that._onDrop.bind(that),
                dragenter: function(ev){
                    ev.dropTarget.addClass("k-filemanager-drop-target");
                },
                dragleave: function(ev){
                    ev.dropTarget.removeClass("k-filemanager-drop-target");
                }
            }).data("kendoDraggable");
        },

        _hold: function (ev){
            var that = this,
                target = ev.currentTarget;

            if(!target.is(".k-state-selected")) {
                if(that.widgetComponent.selectable) {
                    that.widgetComponent.selectable.clear();
                }
                that.widgetComponent.select(target);
            }

            if(that.widgetComponent.selectable) {
                that.widgetComponent.selectable.userEvents.cancel();
            }
        },

        _hint: function(target){
            var that = this,
                item = that.widgetComponent.dataItem(target),
                selectedItems = that.widgetComponent.select();

            fileManagerDragOrigin = that.widgetComponent;
            fileManagerDraggables = selectedItems;

            if(selectedItems.length > 1) {
                return kendo.format("<div class='k-filemanager-drag-hint'><span class='k-icon k-i-{0}'></span> <span>{1} {2}</span></div>", "file", selectedItems.length, that.options.messages.items);
            }

            return kendo.format("<div class='k-filemanager-drag-hint'><span class='k-icon k-i-{0}'></span> <span>{1}</span></div>", (item.isDirectory ? "folder" : "file"), item.name);
        },

        _onDrop: function (ev){
            var that = this,
                target = that.widgetComponent.dataItem(ev.dropTarget),
                targetId = target.id,
                itemIds = [];

            if(!target.isDirectory) {
                return;
            }

            for (var i = 0; i < fileManagerDraggables.length; i++) {
                var id = fileManagerDragOrigin.dataItem(fileManagerDraggables[i]).id;
                itemIds.push(id);
            }

            this.trigger("drop",{target: targetId, items: itemIds});
        },

        getSelected: function(){
            throw new Error("Not Implemented!");
        },

        refresh: function (dataSource) {
            this.widgetComponent.setDataSource(dataSource);
        },

        destroy: function() {
            kendo.destroy(this.element);
        }
    });

    extend(kendo.ui.filemanager, {
            ViewComponent: Component,
            ViewComponents: {},
            registerViewComponent: registerViewComponent,
            getViewComponent: getViewComponent
        }
    );

    var ListView = Component.extend({
        init: function(element, options, explicitOptions) {
            var that = this,
                dataSourceOptions = explicitOptions.dataSource,
                messages = explicitOptions.messages; // jshint ignore:line

            options = extend({}, that.defaultOptions, options, {
                messages: messages
            });

            that._setDSOptions(options, dataSourceOptions);
            options.kendoKeydown = options.kendoKeydown || that._kendoKeydown.bind(that);

            Component.fn.init.call(this, ui.ListView, element, options);

            that.listView = that.widgetComponent;
            that._bindEvents();

            if(explicitOptions.draggable !== false && !dataSourceOptions.isLocalBinding) {
                that._initDragAndDrop();
            }
        },

        defaultOptions: {
            layout: "flex",
            flex: {
                direction: "row",
                wrap: "wrap"
            },
            selectable: kendo.support.mobileOS ? "row" : "multiple",
            template: "<div class='k-listview-item' title='#:name##:extension#'>" +
                            "<div class='k-file-preview'><span class='k-file-icon k-icon k-i-#= !isDirectory ? kendo.getFileGroup(extension, true) : 'folder' #'></span></div>" +
                            "<div class='k-file-name file-name'>#:name##:extension#</div>" +
                      "</div>",
            editTemplate: "<div class='k-listview-item'>" +
                                "<div class='k-file-preview'><span class='k-file-icon k-icon k-i-#= !isDirectory ? kendo.getFileGroup(extension, true) : 'folder' #'></span></div>" +
                                "<div class='k-file-name'><span class='k-textbox k-input k-input-md k-rounded-md k-input-solid'><input type='text' class='k-input-inner' data-bind='value:name' name='name' required='required' /><span></div>" +
                          "</div>",
            dropFilter: ".k-listview-item",
            navigatable: true
        },

        _bindEvents: function (){
            var that = this,
                listView = that.listView;

            listView.bind(CHANGE, that._select.bind(that));
            listView.element.on("dblclick" + NS, that._dblClick.bind(that));
            listView.element.on("mousedown" + NS, ".k-listview-item:not(.k-edit-item)", that._mousedown.bind(that));
            listView.element.on(KEYDOWN + NS, ".k-edit-item", that._keydown.bind(that));
            listView.element.on(KEYDOWN + NS, that._keydownAction.bind(that));

            listView.bind("edit", function(ev){
                var sender = ev.sender;
                var input = ev.item.find("input");

                input.on("blur", function(){
                    var isDirty = sender._modelFromElement(sender.editable.element).dirty;
                    sender._closeEditable();
                    if(!isDirty) {
                        that.trigger("cancel");
                    }
                });
            });

            listView.bind("cancel", function(){
                that.trigger("cancel");
            });

            Component.fn._bindEvents.call(this);
        },

        _select: function () {
            var that = this,
                dataItems = that.getSelected();

            that.trigger(SELECT, {entries: dataItems});
        },

        _keydown: function(ev){
            var that = this;
            if (ev.keyCode === kendo.keys.ESC) {
                that.listView._closeEditable();
                that.trigger("cancel");
            }
        },

        _keydownAction: function(ev) {
            var that = this,
                target = $(ev.target).find(".k-state-focused");

            if(target.length && !target.is(".k-edit-item")) {
                that.trigger(KEYDOWNACTION, { target: target, keyCode: ev.keyCode });
            }
        },

        _mousedown: function(ev){
            var that = this,
                node = $(ev.target).closest(".k-listview-item");

            if(ev.which === 3 && !node.is(".k-state-selected")) {
                that.listView.selectable.clear();
                that.listView.select(node);
            }
        },

        _kendoKeydown : function (ev) {
            var that = this;

            if(ev.keyCode === keys.ENTER && !ev.preventKendoKeydown){
                that._handleEnterKey(ev);
            }
        },

        _handleEnterKey: function(ev){
            var that = this,
                target = $(ev.target),
                node = that.listView.current();

            if (that.widgetComponent.editable && target.is("input")) {
                // Force blur to update item and close editable (cross browser)
                target.trigger("blur");
            } else if(!that.widgetComponent.editable) {
                that._triggerOpen(node);
            }

            ev.preventKendoKeydown = true;
        },

        _dblClick: function(ev){
            var that = this,
                node = $(ev.target).closest(".k-listview-item");

            that._triggerOpen(node);
        },

        _triggerOpen: function (node){
            var that = this;

            if(node.is(".k-edit-item")) {
                return;
            }

            var item = that.listView.dataItem(node);

            if(item) {
                that.trigger(OPEN, { entry: item });
            }
        },

        addFolder: function () {
            this.listView.add();
        },

        edit: function (target) {
            var that = this,
                selected = that.listView.select();

            that.listView.edit(target || selected);
        },

        getSelected: function(){
            var that = this,
            items = that.listView.select(),
            dataItems = [];

            for (var i = 0; i < items.length; i++) {
                var item = that.listView.dataItem(items[i]);

                if (item) {
                    dataItems.push(item);
                }
            }

            return dataItems;
        },

        destroy: function() {
            this.listView.element.off(NS);
            Component.fn.destroy.call(this);
        }
    });

    ui.filemanager.registerViewComponent("list", ListView);

    var TreeView = Component.extend({
        init: function(element, options, explicitOptions) {
            var that = this,
                messages = explicitOptions.messages; // jshint ignore:line

            options = extend({}, that.defaultOptions, options, {
                messages: messages
            });

            Component.fn.init.call(this, ui.TreeView, element, options);

            that.treeView = that.widgetComponent;
            that._bindEvents();

            if(explicitOptions.draggable !== false && !explicitOptions.isLocalBinding) {
                that._initDragAndDrop();
            }
        },

        defaultOptions: {
            dataTextField: "name",
            dropFilter: ".k-item"
        },

        _refreshDataSource: function(ev){
            var that = this,
                treeView = that.treeView,
                action = ev.action,
                node = ev.node,
                parentNode = null,
                treeEl = treeView.element,
                activeDescendant = treeEl.attr("aria-activedescendant"),
                items = ev.items.filter(function(item){
                    return item.isDirectory;
                }).map(function(item){
                    return extend({}, item.toJSON(), {
                        id: item.id || kendo.guid(),
                        hasChildren: item.hasChildren,
                        items: []
                    });
                });

            if (node) {
                parentNode = treeView.findByUid(treeView.dataSource.get(node.id).uid);
                treeView._progress(parentNode, false);
            }

            if(!items.length) {
                return;
            }

            if (action == "itemloaded" || (parentNode && action === "sync")) {
                parentNode.find(".k-item").each(function(index, item){
                    treeView.remove(item);
                });
                treeView.append(items, parentNode);

                if (that._shouldFocus) {
                    treeView.current(parentNode);
                    treeView.focus();
                }
            } else if (action == "remove") {
                this._remove(items[0].id);
            } else if (action == "itemchange") {
                var existingItem = treeView.dataSource.get(items[0].id);

                if(existingItem) {
                    existingItem.set(ev.field, items[0][ev.field]);
                } else {
                    treeView.append(items[0], parentNode);
                }
            } else if (!treeView.dataSource.data().length) {
                treeView.append(items);
            } else if (action === "sync" || (action === undefined && !parentNode)) {
                treeView.items().each(function(index, item){
                    treeView.remove(item);
                });
                treeView.append(items);

                if (that._shouldFocus) {
                    treeView.current(treeView._nextVisible($()));
                    treeView.focus();
                }
            }

            if (!!activeDescendant && treeEl.find("#" + activeDescendant).length === 0) {
                treeEl.removeAttr("aria-activedescendant");
            }
        },

        _remove: function(id){
            var that = this,
                treeView = that.treeView,
                dataSource = treeView.dataSource,
                item = dataSource.get(id),
                node;

            if(item) {
                node = treeView.findByUid(item.uid);
                treeView.remove(node);
            }
        },

        _bindEvents: function () {
            var that = this;

            that.treeView.bind(SELECT, that._navigate.bind(that));
            that.treeView.bind(EXPAND, that._expand.bind(that));
            that.treeView.element.on(KEYDOWN, that._keydownAction.bind(that));
        },

        _keydownAction: function (ev) {
            var that = this,
                target = $(ev.target).find(".k-focus").closest(".k-item");

            that.trigger(KEYDOWNACTION, { target: target, keyCode: ev.keyCode });
        },

        _expand: function (ev) {
            var that = this,
                treeView = that.treeView,
                entry = treeView.dataItem(ev.node);

            ev.preventDefault();
            that.trigger(LOAD, { entryId: entry.id });
        },

        _navigate: function (ev) {
            var that= this,
                node = ev.node,
                entry = that.treeView.dataItem(node),
                path = entry.id;

            ev.preventDefault();

            that.trigger(NAVIGATE, {path: path, entry: entry.toJSON()});
        },

        _hold: $.noop,

        getSelected: function () {
            var that = this,
                selectedItem = that.treeView.element.find(".k-selected").closest(".k-item"),
                item = that.treeView.dataItem(selectedItem);

            return item;
        },

        refresh: function (id) {
            var that = this,
                treeView = that.treeView,
                entry = treeView.dataSource.get(id),
                node = entry && treeView.findByUid(entry.uid);

            if(entry && node) {
                treeView.element.find(".k-selected").removeClass("k-selected");
                node.find("> div .k-in").removeClass("k-hover").addClass("k-selected");
            }
        },

        reload: function () {
            this.treeView.dataSource.read();
        }
    });

    ui.filemanager.registerViewComponent("tree", TreeView);

    if(kendo.ui.Grid) {
        var Grid = Component.extend({
            init: function(element, options, explicitOptions) {
                var that = this,
                    dataSourceOptions = explicitOptions.dataSource,
                    messages = explicitOptions.messages;

                options = extend({}, that.defaultOptions, options, {
                    messages: messages
                });

                that._setDSOptions(options, dataSourceOptions);
                that._setupColumns(options, messages);
                options.kendoKeydown = options.kendoKeydown || that._kendoKeydown.bind(that);

                Component.fn.init.call(this, ui.Grid, element, options);

                that.grid = that.widgetComponent;
                that._bindEvents();

                if(explicitOptions.draggable !== false && !dataSourceOptions.isLocalBinding) {
                    that._initDragAndDrop();
                }
            },

            defaultOptions: {
                selectable: kendo.support.mobileOS ? "row" : "multiple",
                editable: {
                    mode: "inline",
                    confirmation: false
                },
                sortable: true,
                dropFilter: "tr:not(.k-grid-edit-row)",
                navigatable: true
            },

            _setupColumns: function (options, messages) {
                if(!options.columns) {
                    options.columns = [
                        { field: "name", title: messages.nameField || "Name", template: function(item) {
                            var icon = !item.isDirectory ? kendo.getFileGroup(item.extension, true) : "folder";

                            var template = "<div class='file-group-icon'>" +
                                                "<span class='k-icon k-i-" + icon + "'></span>" +
                                            "</div>" +
                                            "<div class='file-name'>" + kendo.htmlEncode(item.name + item.extension) + "<div>";

                            return template;
                        }},
                        { field: "created", title: messages.dateCreatedField , format: "{0:G}" },
                        { field: "size", title: messages.sizeField, template: function(item){
                            if(item.size > 0) {
                                return kendo.getFileSizeMessage(item.size);
                            } else {
                                return "";
                            }
                        } }
                    ];
                }
            },

            _bindEvents: function (){
                var that = this,
                    grid = that.grid;

                grid.bind(CHANGE, that._select.bind(that));
                grid.table.on("dblclick" + NS, that._dblClick.bind(that));
                grid.table.on("mousedown" + NS, "tr:not(.k-grid-edit-row)", that._mousedown.bind(that));
                grid.table.on(KEYDOWN + NS, ".k-grid-edit-row", that._keydown.bind(that));
                grid.table.on(KEYDOWN + NS, that._keydownAction.bind(that));

                grid.bind("edit", function(){
                    that._toggleFocusable(true);
                });

                grid.bind("cancel", function(){
                    that.trigger("cancel");
                });

                grid.saveRow = $.noop;

                Component.fn._bindEvents.call(this);
            },

            _kendoKeydown : function(ev){
                var that = this,
                    current = that.grid.current(),
                    node = current ? current.closest("tr[data-uid]") : null;

                if(node && ev.keyCode === keys.ENTER && !ev.preventKendoKeydown){
                    that._triggerOpen(node);
                    ev.preventKendoKeydown = true;
                }

                if(ev.keyCode === keys.F2) {
                    ev.preventKendoKeydown = true;
                }
            },

            _keydownAction: function(ev) {
                var that = this,
                    target = $(ev.target).find(".k-state-focused").closest("tr");

                if(target.length && !target.is(".k-grid-edit-row")) {
                    that.trigger(KEYDOWNACTION, { target: target, keyCode: ev.keyCode });
                }
            },

            _keydown: function(ev){
                var that = this,
                    grid = that.grid;

                if (!$(ev.target).closest(".k-grid-edit-row").length) {
                    return;
                }

                if(ev.keyCode === kendo.keys.ENTER) {
                    setTimeout(function(){
                        var editorContainer = that.grid._editContainer || $();

                        // force blur event for inputs
                        editorContainer.find("input").trigger("blur");

                        that._closeEditable();
                    });

                    that._tryCancel();
                }

                if (ev.keyCode === kendo.keys.ESC) {
                    grid.cancelChanges();
                    that.trigger("cancel");
                }
            },

            _mousedown: function(ev){
                var that = this,
                    node = $(ev.target).closest("tr[data-uid]");

                if(ev.which === 1 && that.grid.editable) {
                    setTimeout(function(){
                        that._closeEditable();
                    });

                    that._tryCancel();
                }

                if(ev.which === 3 && !node.is(".k-state-selected")) {
                    that.grid.selectable.clear();
                    that.grid.select(node);
                }
            },

            _tryCancel: function() {
                var that = this,
                    grid = that.grid,
                    container;

                if (grid.editable) {
                    container = grid._editContainer;
                    if (!container.find("input").val()) {
                        grid.cancelChanges();
                    }
                }

                setTimeout(function() {
                    that._toggleFocusable(false);
                });

            },

            _toggleFocusable: function(state) {
                var that = this,
                    grid = that.grid;

                grid.table.find("tr,td").children().addBack().toggleClass("k-focusable", state);
            },

            _closeEditable: function(){
                var that = this,
                    container;

                if(that.grid.editable && !that.grid.editable.options.model.dirty){
                    container = that.grid._editContainer;
                    that.grid._destroyEditable();
                    that.grid._displayRow(container);
                    that.trigger("cancel");
                }
            },

            _select: function () {
                var that = this,
                    dataItems = that.getSelected();

                that.trigger(SELECT, {entries: dataItems});
            },

            _dblClick: function(ev){
                var that = this,
                    node = $(ev.target).closest("tr[data-uid]");

                that._triggerOpen(node);
            },

            _triggerOpen: function (node) {
                var that = this;

                if(node.is(".k-grid-edit-row")) {
                    return;
                }

                var item = that.grid.dataItem(node);

                if(item) {
                    that.trigger(OPEN, { entry: item });
                }
            },

            getSelected: function(){
                var that = this,
                items = that.grid.select(),
                dataItems = [];

                for (var i = 0; i < items.length; i++) {
                    dataItems.push(that.grid.dataItem(items[i]));
                }

                return dataItems;
            },

            addFolder: function () {
                this.grid.addRow();
            },

            edit: function (target) {
                var that = this,
                    selected = that.grid.select();

                that.grid.editRow(target || selected);
            },

            destroy: function(){
                this.grid.table.off(NS);
                this.grid.element.off(NS);
                Component.fn.destroy.call(this);
            }
        });

        ui.filemanager.registerViewComponent("grid", Grid);
    }

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

(function(f, define){
    define('filemanager/toolbar',["../kendo.toolbar", "../kendo.switch"], f);
})(function(){

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
        NS = ".fileManagerToolbar";

    var FileManagerToolBar = ToolBar.extend({
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
            createFolder: { type: "button", text: "New Folder", name: "createFolder", command: "CreateFolderCommand", rules: "{ \"remote\": true }" },
            upload: { type: "button",  text: "Upload", name: "upload", command: "OpenDialogCommand", options: "{ \"type\": \"uploadDialog\" }", rules: "{ \"remote\": true }" },
            sortDirection: { type: "buttonGroup", text: "Sort Direction", name:"sortDirection",
                buttons: [
                    { name: "sortDirectionAsc", icon: "sort-asc-sm", togglable: true, group: "sortDirection", command: "SortCommand", options: "{ \"dir\": \"asc\" }", selected: true },
                    { name: "sortDirectionDesc", icon: "sort-desc-sm", togglable: true, group: "sortDirection", command: "SortCommand", options: "{ \"dir\": \"desc\" }" }
                ]
            },
            sortField: { type: "splitButton", text: "Sort By", name: "sortField", command: "SortCommand", menuButtons: [
                { name: "nameField", text: "Name", options: "{\"field\": \"name\"}", command: "SortCommand" },
                { name: "typeField", text: "Type", options: "{\"field\": \"extension\"}", command: "SortCommand" },
                { name: "sizeField", text: "Size", options: "{\"field\": \"size\"}", command: "SortCommand" },
                { name: "dateCreatedField", text: "Date created", options: "{\"field\": \"createdUtc\"}", command: "SortCommand" },
                { name: "dateModifiedField", text: "Date modified", options: "{\"field\": \"modifiedUtc\"}", command: "SortCommand" }
            ] },
            changeView: { type: "buttonGroup", text: "Change View", name:"changeView",
                buttons: [
                    { name: "gridView", icon: "grid-layout", togglable: true, group: "changeView", command: "ChangeViewCommand", options: "grid" },
                    { name: "listView", icon: "grid", togglable: true, group: "changeView", command: "ChangeViewCommand", options: "list" }
                ]
            },
            spacer: { type: "spacer" },
            details: { type: "fileManagerDetailsToggle", text: "View Details", name: "details", overflow: "never", command: "TogglePaneCommand", options: "{ \"type\": \"preview\" }"},
            search: { type: "fileManagerSearch", text: "Search", name: "search", command: "SearchCommand", icon: "search", overflow: "never", options: "{ \"field\": \"name\", \"operator\": \"startswith\" }" }
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

            that.options = options;

            that.options.items = that._extendToolsOptions(tools);
        },

        _extendToolsOptions: function(tools) {
            var that = this,
                messages = that.options.messages;

            if (!tools.length) {
                return;
            }

            return tools.map(function (tool) {
                var isBuiltInTool =  $.isPlainObject(tool) && Object.keys(tool).length === 1 && tool.name,
                    toolOptions, toolRules, attributes;

                tool = isBuiltInTool ? tool.name : tool;
                toolOptions = $.isPlainObject(tool) ? tool : extend({}, that.defaultTools[tool]);
                toolRules = toolOptions.rules ? JSON.parse(toolOptions.rules) : {};
                attributes = {
                    "aria-label": messages[toolOptions.name],
                    "title": messages[toolOptions.name],
                    "data-command": toolOptions.command,
                    "data-options": toolOptions.options
                };

                if (toolOptions.type === "fileManagerDetailsToggle") {
                    delete attributes["aria-label"];
                }

                kendo.deepExtend(toolOptions, {
                    id: toolOptions.name + "-" + kendo.guid(),
                    name: toolOptions.name,
                    text: messages[toolOptions.name],
                    attributes: attributes,
                    overflow: toolOptions.overflow
                });

                if(toolOptions.type === "buttonGroup") {
                    delete toolOptions.attributes["aria-label"];
                    toolOptions.buttons = toolOptions.buttons.map(that._mapButtonGroups.bind(that));
                }

                if(toolOptions.type === "splitButton") {
                    toolOptions.menuButtons = toolOptions.menuButtons.map(that._mapMenuButtons.bind(that));
                }

                if (toolRules.remote && that.options.filemanager.dataSource.isLocalBinding) {
                    toolOptions.hidden = true;
                }

                return toolOptions;
            }, that);
        },

        _mapButtonGroups: function(button) {
            var that = this,
                messages = that.options.messages;

            if(button.group === "changeView" && button.options === that.options.filemanager.options.initialView) {
                button.selected = true;
            }

            return kendo.deepExtend(button,{
                attributes: extend({}, button.attributes, {
                    "aria-label": messages[button.name],
                    "title": messages[button.name],
                    "data-command": button.command,
                    "data-options": button.options
                })
            });
        },

        _mapMenuButtons: function(button) {
            var that = this,
                messages = that.options.messages;

            return kendo.deepExtend(button,{
                text: messages[button.name],
                attributes: extend({}, button.attributes, {
                    "aria-label": messages[button.name],
                    "title": messages[button.name],
                    "data-command": button.command,
                    "data-options": button.options
                })
            });
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

        _change: function (ev) {
            var command = $(ev.target).data("command"),
                options = $(ev.target).data("options");

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

            for(var i = 0; i < options.items.length; i++) {
                if (options.items[i].name == toolName) {
                    found = true;
                    break;
                }
            }

            return options.items[toolName] || found;
        },

        action: function (args) {
            this.trigger(ACTION, args);
        },

        destroy: function () {
            if(this.fileManagerSearch) {
                this.fileManagerSearch.destroy();
            }

            ToolBar.fn.destroy.call(this);
        }
    });

    var SearchTool = Item.extend({
        init: function(options, toolbar) {
            var that = this,
                element = $("<div class='k-filemanager-search-tool'></div>"),
                input = $("<input class='k-input-inner' autocomplete='off' />"),
                icon = $("<span class='k-input-icon k-icon k-i-search'/>"),
                inputWrapper = $('<span class="k-searchbox k-input k-input-md k-rounded-md k-input-solid"></span>');


            that.element = element;
            that.input = input;
            that.icon = icon;
            that.options = options;
            that.options.type = "fileManagerSearch";
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

            inputWrapper.append(icon).append(that.input);
            that.element.append(inputWrapper);

            that._bindEvents();
            that.toolbar.fileManagerSearch = that;
        },
        attributes: function () {
            if (this.options.attributes) {
                this.input.attr(this.options.attributes);
            }
        },
        renderIcon: function() {
            if (this.options.icon) {
                this.icon.addClass("k-icon k-i-" + this.options.icon);
            }
        },
        _bindEvents: function(){
            this._inputHandler = this._input.bind(this);
            this.input.on("input" + NS, this._inputHandler);
        },
        _input: function (ev) {
            this.toolbar.trigger(CHANGE, {target: ev.target});
        },
        destroy: function(){
            this.element.off(NS);
        }
    });

    kendo.toolbar.registerComponent("fileManagerSearch", SearchTool);

    var FileManagerDetailsToggle = Item.extend({
        init: function(options, toolbar) {
            var that = this,
                element = $("<div class='k-filemanager-details-toggle'></div>"),
                label = $("<label>" + options.text + "</label>"),
                switchElement = $("<input title='"+ options.text +"' />");

            that.element = element;
            that.input = switchElement;
            that.label = label;
            that.options = options;
            that.toolbar = toolbar;

            that.attributes();
            that.addUidAttr();
            that.addIdAttr();
            that.addOverflowAttr();

            that.element.append(that.label);
            that.element.append(that.input);

            that.input.attr("aria-label", options.text);

            that.switchInstance = new kendo.ui.Switch(that.input, {
                change: that._change.bind(that),
                messages: {
                    checked: toolbar.options.messages.detailsChecked,
                    unchecked: toolbar.options.messages.detailsUnchecked
                }
            });

            that.label.on(CLICK + NS, that._click.bind(that));

            that.toolbar.fileManagerDetailsToggle = that;
        },
        _change: function (ev) {
            this.toolbar.trigger(CHANGE, { target: ev.sender.wrapper.parent() });
        },
        _click: function(ev) {
            this.switchInstance.toggle();

            this.toolbar.trigger(CHANGE, { target: $(ev.target).parent() });
        },
        destroy: function() {
            this.element.off(NS);
        }
    });

    kendo.toolbar.registerComponent("fileManagerDetailsToggle", FileManagerDetailsToggle);

    extend(kendo.ui.filemanager, {
        ToolBar: FileManagerToolBar
    });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('filemanager/data',["../kendo.data"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        data = kendo.data,
        Node = data.Node,
        HierarchicalDataSource = data.HierarchicalDataSource,
        DataSource = data.DataSource;

    extend(true, kendo.data, {
        schemas: {
            "filemanager": {
                data: function(data) {
                    return data.items || data || [];
                },
                model: {
                    id: "path",
                    hasChildren: "hasDirectories",
                    fields: {
                        name: {editable: true, type: "string", defaultValue: "New Folder" },
                        size: {editable: false, type: "number"},
                        path: {editable: false, type: "string"},
                        extension: {editable: false, type: "string"},
                        isDirectory: {editable: false, defaultValue: true, type: "boolean"},
                        hasDirectories: {editable: false, defaultValue: false, type: "boolean"},
                        created: { type: "date", editable: false},
                        createdUtc: { type: "date", editable: false },
                        modified: { type: "date", editable: false},
                        modifiedUtc: { type: "date", editable: false }
                    }
                }
            }
        }
    });

    var FileEntry = Node.define({
        init: function(value){
            var that = this,
                isDirectory = this.isDirectory;

            Node.fn.init.call(this, value);

            if(typeof isDirectory === "string"){
            isDirectory = kendo.getter(isDirectory);
            }

            if (kendo.isFunction(isDirectory)) {
                var isDirectoryObject = isDirectory.call(that, that);

                if(isDirectoryObject && isDirectoryObject.length === 0){
                    that.isDirectory = false;
                } else{
                    that.isDirectory = !!isDirectoryObject;
                }
            }

            if (that.isDirectory) {
                that._initChildren();
            }
        },
        _initChildren: function() {
            var that = this;
            var children, transport, parameterMap;

            if (!(that.children instanceof kendo.data.FileManagerDataSource)) {
                children = that.children = new kendo.data.FileManagerDataSource(that._childrenOptions);

                transport = children.transport;
                parameterMap = transport.parameterMap;

                transport.parameterMap = function(data, type) {
                    if(type === "read" || type === "create") {
                        data.target = that.id;
                    }

                    if (parameterMap) {
                        data = parameterMap.call(that, data, type);
                    }

                    return data;
                };

                children.parent = function(){
                    return that;
                };

                children.bind("change", function(e){
                    e.node = e.node || that;
                    that.trigger("change", e);
                });

                children.bind("error", function(e){
                    var collection = that.parent();

                    if (collection) {
                        e.node = e.node || that;
                        collection.trigger("error", e);
                    }
                });

                that._updateChildrenField();
            }
        },
        isNew: function() {
            if(this.fileManagerNewItem) {
                delete this.fileManagerNewItem;
                return true;
            }

            return this.id === this._defaultId;
        }
    });


    var FileManagerDataSource = HierarchicalDataSource.extend({
        init: function(options) {
            var fileEntry = FileEntry.define({
                children: options
            });

            if(options.filter && !options.serverFiltering){
                this._hierarchicalFilter = options.filter;
                options.filter = null;
            }

            DataSource.fn.init.call(this, $.extend(true, {}, { schema: { modelBase: fileEntry, model: fileEntry } }, options));

            this.isLocalBinding = this.transport instanceof kendo.data.LocalTransport;

            this._attachBubbleHandlers();
        },
        insert: function(index, model) {
            var parentNode = this.parent();

            if (parentNode && parentNode._initChildren) {
                if(model && model.isDirectory) {
                    parentNode.hasDirectories = true;
                }
                parentNode.hasChildren = true;
                parentNode._initChildren();
            }

            return DataSource.fn.insert.call(this, index, model);
        },
        remove: function(node){
            var that = this,
                parentNode = node.parentNode(),
                dataSource = that,
                result;

            if (parentNode && parentNode._initChildren) {
                dataSource = parentNode.children;
            }

            that._cleanDestroyed(node);

            result = DataSource.fn.remove.call(dataSource, node);

            if (parentNode && (dataSource.data() && !dataSource.data().length)) {
                parentNode.hasChildren = false;
            } else if(parentNode && !this._hasDirectories(parentNode)) {
                parentNode.hasDirectories = false;
            }

            return result;
        },
        _cleanDestroyed: function(node){
            var that = this,
                dataSource = that;

            if (node.parentNode && node.parentNode()) {
                node = node.parentNode();
                dataSource = node.children;
                dataSource._destroyed = [];
                that._cleanDestroyed(node);
            } else {
                dataSource._destroyed = [];
            }
        },
        _hasDirectories: function(node){
            var result;

            if(!node.children.data()) {
                return false;
            }

            result = node.children.data().filter(function(item){
                return item.isDirectory;
            });

            return !!result.length;
        }
    });

    FileManagerDataSource.create = function(options) {
        options = options && options.push ? { data: options } : options;

        var dataSource = options || {},
            data = dataSource.data;

        if (data && data._dataSource) {
            return data._dataSource;
        }

        dataSource.data = data;

        return dataSource instanceof FileManagerDataSource ? dataSource : new FileManagerDataSource(dataSource);
    };

    kendo.observableFileManagerData = function(array) {
        var dataSource = FileManagerDataSource.create({
            data: array,
            schema: kendo.data.schemas.filemanager
        });

        dataSource.fetch();

        dataSource._data._dataSource = dataSource;

        return dataSource._data;
    };

    extend(kendo.data, {
        FileManagerDataSource: FileManagerDataSource,
        FileEntry: FileEntry
    });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('filemanager/contextmenu',["../kendo.menu"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        template = kendo.template,
        ContextMenu = kendo.ui.ContextMenu,

        ACTION = "action";

    var FileManagerContextMenu = ContextMenu.extend({
        init: function(element, options) {
            var that = this;

            ContextMenu.fn.init.call(that, element, options);

            that._overrideTemplates();
            that._restrictDefaultItems();
            that._extendItems();

            that.bind("select", that._onSelect.bind(that));
            that.bind("open", that._onOpen.bind(that));
        },

        _overrideTemplates: function(){
            this.templates.sprite = template("#if(spriteCssClass) {#<span class='#= spriteCssClass #'></span>#}#");
        },

        _restrictDefaultItems: function() {
            var that = this;

            if (that.options.isLocalBinding) {
                that.defaultItems = {};
            }
        },

        defaultItems: {
            "rename": { text: "Rename", spriteCssClass: "k-icon k-i-edit", command: "RenameCommand" },
            "delete": { text: "Delete", spriteCssClass: "k-icon k-i-delete", command: "DeleteCommand" }
        },

        events: ContextMenu.fn.events.concat([
            ACTION
        ]),

        _extendItems: function(){
            var that = this,
                items = that.options.items,
                item, isBuiltInTool;

            if(items && items.length){
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    isBuiltInTool =  $.isPlainObject(item) && Object.keys(item).length === 1 && item.name;

                    if(isBuiltInTool){
                        item = item.name;
                    }

                    if($.isPlainObject(item) ) {
                        that._extendItem(item);
                        that.append(item);
                    } else if (that.defaultItems[item]){
                        item = that.defaultItems[item];
                        that._extendItem(item);
                        that.append(item);
                    }
                }
            } else {
                for (var key in that.defaultItems) {
                    item = that.defaultItems[key];
                    that._extendItem(item);
                    that.append(item);
                }
            }
        },

        _extendItem: function(item) {
            var that = this,
                messages = that.options.messages;

            extend(item, {
                text: messages[item.text],
                spriteCssClass: item.spriteCssClass || "",
                attr: {
                    "data-command": item.command
                }
            });
        },

        _onSelect: function(ev) {
            var command = $(ev.item).data("command");
            var target = $(ev.target);

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: { target: target }
            });
        },

        _onOpen: function(ev) {
            var menu = ev.sender,
                items = menu.options.items;

            if (!items && $.isEmptyObject(this.defaultItems)) {
                ev.preventDefault();
            }
        },

        action: function (args) {
            this.trigger(ACTION, args);
        }
    });

    extend(kendo.ui.filemanager, {
        ContextMenu: FileManagerContextMenu
    });

    })(window.kendo.jQuery);

    return window.kendo;

    }, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('kendo.filemanager',[
        "./filemanager/commands",
        "./filemanager/view",
        "./filemanager/toolbar",
        "./filemanager/data",
        "./filemanager/contextmenu",

        "./kendo.breadcrumb",
        "./kendo.upload",
        "./kendo.dialog",
        "./kendo.resizable"
    ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "filemanager",
    name: "FileManager",
    category: "web",
    description: "The FileManager widget displays offers file management functionality.",
    depends: [ "core", "data", "listview", "toolbar", "breadcrumb", "menu", "treeview", "upload", "dialog", "switch", "resizable", "selectable", "editable" ],
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
        isPlainObject = $.isPlainObject,
        isArray = Array.isArray,
        DataBoundWidget = ui.DataBoundWidget,
        template = kendo.template,
        outerHeight = kendo._outerHeight,

        NAVIGATE = "navigate",
        SELECT = "select",
        OPEN = "open",
        ERROR = "error",
        CHANGE = "change",
        UPLOAD = "upload",
        SUCCESS = "success",
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

    var NO_FILE_PREVIEW_TEMPLATE = '' +
        '<div class="#:styles.fileInfo#">' +
            '<div class="#:styles.filePreview#">' +
                '<span class="k-file-icon k-icon k-i-none"></span>' +
            '</div>' +
            '<span class="#:styles.fileName#" k-no-file-selected>#: messages.noFileSelected #</span>' +
        '</div>';

    var SINGLE_FILES_PREVIEW_TEMPLATE = '' +
        '<div class="#:styles.fileInfo#">' +
            '<div class="#:styles.filePreview#">' +
                '<span class="k-file-icon k-icon k-i-#: !selection[0].isDirectory ? kendo.getFileGroup(selection[0].extension, true) : "folder" #"></span>' +
            '</div>' +
            '<span class="#:styles.fileName#">#:selection[0].name#</span>' +
            '#if(metaFields){#' +
                '<dl class="#:styles.fileMeta#">'+
                    '#for(var i = 0; i < metaFields.length; i+=1){#' +
                        '#var field = metaFields[i]#' +
                        '<dt class="#:styles.metaLabel#">#:messages[field]#: </dt>' +
                        '<dd class="#:styles.metaValue# #:styles[field]#">' +
                            '#if(field == "size"){#' +
                                ' #:kendo.getFileSizeMessage(selection[0][field])#' +
                            '#} else if(selection[0][field] instanceof Date) {#' +
                                ' #:kendo.toString(selection[0][field], "G")#' +
                            '#} else if(field == "extension") {#' +
                                ' #: !selection[0].isDirectory ? kendo.getFileGroup(selection[0].extension) : "folder"#' +
                            '#} else {#' +
                                ' #:selection[0][field]#' +
                            '#}#' +
                        '</dd>'+
                        '<dd class="k-line-break"></dd>' +
                    '# } #' +
                '</dl>' +
            '#}#' +
        '</div>';

    var MULTIPLE_FILES_PREVIEW_TEMPLATE = '' +
        '<div class="#:styles.fileInfo#">' +
            '<div class="#:styles.filePreview#">' +
                '<span class="k-file-icon k-icon k-i-file"></span>' +
            '</div>' +
            '<span class="#:styles.fileName#">' +
                '#:selection.length# ' +
                '#:messages.items#' +
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

        _dataSource: function () {
            var that = this,
                options = that.options,
                dataSourceOptions = options.dataSource || {},
                typeSortOrder = that.folderSortOption,
                nameSortOrder = that.defaultSortOption,
                dataSource;

            if (!(dataSourceOptions instanceof kendo.data.FileManagerDataSource)) {
                if(isArray(dataSourceOptions)){
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

        _error: function (ev) {
            if(!this.trigger(ERROR, ev)) {
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

        _renderHeader: function () {
            var that = this,
                options = that.options;

            if (options.toolbar) {
                that.header = $("<div />").addClass(fileManagerStyles.header);
                that.header.append(that._initToolbar().element);
            }

            that.wrapper.append(that.header);
        },

        _renderContentContainer: function() {
            var that = this,
                container = $("<div />").addClass(fileManagerStyles.contentContainer);

            that.contentContainer = container;

            that.wrapper.append(that.contentContainer);
        },

        _initContextMenu: function(){
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

            if(options.contextMenu === false) {
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

            if (!toolbar || !toolbar.isToolEnabled(toolbar.defaultTools.upload.name)) {
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

            that.preview = $("<div />").addClass(fileManagerStyles.preview);
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

        _initToolbar: function () {
            var that = this,
                options = that.options,
                toolbarElement = $("<div />").addClass(fileManagerStyles.toolbar),
                toolbarOptions = extend({}, options.toolbar, {
                    filemanager: this,
                    messages: options.messages.toolbar,
                    action: that.executeCommand.bind(that)
                });

            that.toolbar = new ui.filemanager.ToolBar(toolbarElement, toolbarOptions);

            return that.toolbar;
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

        _drop: function (ev) {
            var that = this;

            if(!that.trigger(DROP, ev) && ev.items.indexOf(ev.target) < 0) {
                that._confirm({
                    type: "move",
                    target: ev.target
                }).done(function(){
                    that.executeCommand({command: "CopyCommand", options: ev});
                }).fail(function(){
                    that.executeCommand({command: "MoveCommand", options: ev});
                });
            }
        },

        _keydownAction: function (ev) {
            var that = this,
                keyCode = ev.keyCode,
                keys = kendo.keys;

            if (keyCode === keys.DELETE) {
                that.executeCommand({command: "DeleteCommand", options: { target: ev.target } });
            }

            if (keyCode === keys.F2) {
                that.executeCommand({command: "RenameCommand", options: { target: ev.target } });
            }
        },

        _confirm: function(options){
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

        _prompt: function(options){
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

            if ((treeView.current() && treeView.current().find(".k-state-focused").length) ||
                activeElement.hasClass(fileManagerStyles.treeview)){
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
                        {type:"rootitem", text: "" }
                    ],
                    change: that._breadcrumbChange.bind(that)
                }, options.breadcrumb);

            that.breadcrumb = new ui.Breadcrumb(breadcrumbElement, breadcrumbOptions);

            return that.breadcrumb;
        },

        _breadcrumbChange: function(ev){
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
                        { text: dialogMessages.clear, action: that._clearUploadFilesList.bind(that) },
                        { text: dialogMessages.done, primary: true }
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

        _success: function(){
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
                upload.setOptions({ dropZone: zone});
            }
        },

        _binding: function (ev){
            if(this.trigger(DATABINDING, { source: "view", action: ev.action, items: ev.items, index: ev.index })){
                ev.preventDefault();
            }
        },

        _bound: function (){
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

            splitBar.hover(function () {
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
                    start: function () {
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
                    start: function () {
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
                element = $('<div aria-label="' + that.options.messages.views[type + "Label"] + '"></div>'),
                options = that.options.views[type],
                explicitOptions = extend(true, {}, {
                    dataSource: that._viewDataSource || that.dataSource,
                    messages: that.options.messages.views,
                    draggable: that.options.draggable
                });

            if(type === undefined) {
                return that._view;
            }

            if(!ui.filemanager.ViewComponents[type]) {
                throw new Error(kendo.format("There is no {0} ViewComponent registered!", type));
            }

            if(that._view && that._view.destroy) {
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
                commandOptions = extend({ filemanager: this }, isPlainObject(args.options) ? args.options : {value: args.options}),
                command = new ui.filemanager.commands[commandName](commandOptions);

            if(!this.trigger(EXECUTE, args)) {
                return command.exec();
            }
        },

        _navigate: function(ev){
            var that = this,
                path = ev.path;

            if(!that.trigger(NAVIGATE, { path: path })) {
                that.navigate(path);
            }
        },

        _load: function(ev){
            var entry = this.dataSource.get(ev.entryId);
            entry.load();
        },

        _select: function (ev) {
            if (this.options.previewPane) {
                this._setPreviewPaneContent();
            }

            this.trigger(SELECT, { entries: ev.entries });
        },

        _open: function (ev) {
            var that = this,
                entry = ev.entry;

            that.trigger(OPEN, { entry: entry });

            if(entry.isDirectory) {
                that._navigate({ path: entry.id });
            }
        },

        _cancel: function () {
            var that = this,
                commandStack = that._commandStack,
                command = commandStack.next();

            commandStack.reject(command);
            that.trigger(COMMAND, { status: "cancel", action: "itemchange", data: command.data });
        },

        _change: function (ev) {
            var that = this,
                commandStack = that._commandStack,
                targetDataSource = ev.node ? ev.node.children : that.dataSource;

            if(that.trigger(DATABINDING, { source: "tree", action: ev.action, items: ev.items, index: ev.index })){
                return;
            }

            that.treeView._refreshDataSource(ev);

            if(ev.action === "remove" || ev.action === "itemchange" || ev.action === "add") {
                if (commandStack.empty()) {
                    targetDataSource.sync();
                } else {
                    var command = commandStack.next();

                    targetDataSource.sync().then(function(res){
                        commandStack.resolve(command);
                        that.trigger(COMMAND, { status: "success", action: ev.action, data: command.data, response: res });
                    }).fail(function(res){
                        commandStack.reject(command);
                        that.trigger(COMMAND, { status: "fail", action: ev.action, data: command.data, response: res });
                    });
                }
            }

            if(ev.action === "remove" && that._viewDataSource && that._viewDataSource.parent() && ev.items[0] === that._viewDataSource.parent()) {
                that._navigateToParent(ev.items[0]);
            }

            if(ev.action == "itemchange" && that._viewDataSource && that._viewDataSource.parent() && that.path().indexOf(ev.items[0].id) >= 0) {
                that._navigateToParent(ev.items[0]);
            }

            if(ev.action === "itemchange") {
                ev.items[0].loaded(false);
            }
        },

        _navigateToParent: function(item){
            var that = this;
            var parent = item.parentNode();
            var parentNodePath = parent ? parent.id : "";
            that._navigate({path: parentNodePath});
        },

        _buildBreadcrumbPath: function (entry){
            var that = this,
                breadcrumb = that.breadcrumb,
                items = [];

            while(entry) {
                items.push({
                    id: entry.id,
                    text: entry.name,
                    path: entry.path
                });

                entry = entry.parentNode && entry.parentNode();
            }

            items.push({ type: "rootItem", id: "", text: ""  });

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

            if(that.toolbar) {
                that.toolbar.destroy();
                that.header.empty();
                that.header.append(that._initToolbar().element);
            }

            if(that.treeView){
                that.treeView.destroy();
                that.navigation.empty();
                that.navigation.append(that._initTreeView().element);
            }

            if(that._view) {
                that.view(that._viewType|| that.options.initialView);
            }

            that._initContextMenu();

        },

        refresh: function (){
            var that = this,
                dataSource = that._viewDataSource || that.dataSource;

            dataSource.read();
        },

        getSize: function() {
            return kendo.dimensions(this.wrapper);
        },

        getSelected: function(){
            var that = this,
                items = that._view.getSelected(),
                treeView = that.treeView;

            if(items && items.length) {
                return items;
            }

            var item = treeView.getSelected();

            if(item) {
                return [ that.dataSource.get(item.id) ];
            }
        },

        path: function () {
            return this._path || "";
        },

        navigate: function (path) {
            var that = this,
                dataSource = that.dataSource,
                entry = dataSource.get(path.replace(/^\//, "")),
                view = that._view,
                treeView = that.treeView,
                breadcrumb = that.breadcrumb,
                isRoot = path === "" || path === "/";

            if(!entry && !isRoot) {
                window.console.warn('Error! Could not navigate to the folder at the requested path(' + path + '). Make sure that the parent folder of the target folder has already been loaded.');
                return;
            }

            that._path = path;

            if(that.trigger(DATABINDING, { source: "navigation", action: "rebind", items: [entry] })){
                return;
            }

            if(breadcrumb) {
                that._buildBreadcrumbPath(entry);
            }

            if(isRoot) {
                dataSource.sort([ that.folderSortOption, that.defaultSortOption ]);
                that._viewDataSource = dataSource;
                view.refresh(that._viewDataSource);
                treeView.treeView.select($());

                if (that.options.previewPane) {
                    that._setPreviewPaneContent();
                }

                return;
            }

            if(entry.loaded && !entry.loaded()) {
                entry.load();
            }

            if(view) {
                that._viewDataSource = entry.children;
                that._viewDataSource._sort = [ that.folderSortOption, that.defaultSortOption ];
                view.refresh(that._viewDataSource);
            }

            if(treeView) {
                treeView.refresh(entry.id);
            }

            if (that.options.previewPane) {
                that._setPreviewPaneContent();
            }
        },

        items: function () {
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

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
