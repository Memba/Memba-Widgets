/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";

    (function($, undefined) {
        var kendo = window.kendo,
            extend = $.extend,
            deferred = $.Deferred,
            Class = kendo.Class;

        var Command = Class.extend({
            init: function(options) {
                this.options = options;
                this.filemanager = options.filemanager;
            }
        });

        var CreateFolderCommand = Command.extend({
            init: function(options) {
                Command.fn.init.call(this, options);
            },
            exec: function() {
                var that = this,
                    filemanager = that.filemanager,
                    commandStack = filemanager._commandStack,
                    dataSource = filemanager._viewDataSource || filemanager.dataSource,
                    removeProxy = that._remove.bind(that);

                that._item = dataSource._createNewModel();

                commandStack.push({ item: that._item.toJSON() }).fail(removeProxy);
                dataSource.add(that._item);
            },
            _remove: function() {
                var that = this,
                    filemanager = that.filemanager,
                    dataSource = filemanager._viewDataSource || filemanager.dataSource;

                dataSource.pushDestroy(that._item);
            }
        });

        var RenameCommand = Command.extend({
            init: function(options) {
                Command.fn.init.call(this, options);
            },
            exec: function() {
                var that = this,
                    target = that.options.target,
                    filemanager = that.filemanager,
                    commandStack = filemanager._commandStack,
                    viewItem = filemanager._view.widgetComponent.dataItem(target);

                if (target && viewItem) {
                    commandStack.push({ target: target, item: viewItem });
                    that.filemanager._view.edit(target);
                } else {
                    that._renameTreeViewItem(target);
                }
            },
            _renameTreeViewItem: function(target) {
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
                }).done(function(newName) {
                    commandStack.push({ target: target, item: realItem });
                    realItem.set("name", newName);
                });
            }
        });

        var DeleteCommand = Command.extend({
            init: function(options) {
                Command.fn.init.call(this, options);
            },
            exec: function() {
                var that = this,
                    target = that.options.target,
                    filemanager = that.filemanager,
                    items = filemanager.getSelected(),
                    viewItem = that.filemanager._view.widgetComponent.dataItem(target),
                    itemsToRemove;

                if (target && target.is(".k-selected") && items && items.length) {
                    itemsToRemove = items;
                } else if (target && viewItem) {
                    itemsToRemove = viewItem;
                } else if (target) {
                    var uid = target.data("uid");
                    var item = that.filemanager.treeView.widgetComponent.dataSource.getByUid(uid);
                    var realItem = that.filemanager.dataSource.get(item.id);

                    itemsToRemove = realItem;
                }

                filemanager._confirm({
                    type: "delete",
                    target: target
                })
                .done(function() {
                    that.removeItems(itemsToRemove);
                });
            },
            removeItems: function(items) {
                var that = this;

                that._itemsToRemove = Array.isArray(items) ? items : [items];

                that._removeItem();
            },
            _removeItem: function() {
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
            init: function(options) {
                Command.fn.init.call(this, options);
            },
            exec: function() {
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
            init: function(options) {
                var that = this;
                Command.fn.init.call(that, options);
                that._itemsToRemove = [];
            },
            exec: function() {
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
            _delete: function(data) {
                var that = this;
                that._itemsToRemove.push(data.item);
            },
            _removeItem: function() {
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
            init: function(options) {
                Command.fn.init.call(this, options);
            },
            exec: function() {
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
            init: function(options) {
                Command.fn.init.call(this, options);
            },
            exec: function() {
                var that = this,
                    options = that.options,
                    filemanager = that.filemanager,
                    filter = {
                        field: options.field,
                        operator: options.operator,
                        value: options.value || ""
                    };

                filemanager._view.widgetComponent.dataSource.filter(filter);
            }
        });

        var ChangeViewCommand = Command.extend({
            init: function(options) {
                Command.fn.init.call(this, options);
            },
            exec: function() {
                var that = this,
                    options = that.options,
                    filemanager = that.filemanager;

                filemanager.view(options.value);
                filemanager.resize(true);
            }
        });

        var OpenDialogCommand = Command.extend({
            init: function(options) {
                Command.fn.init.call(this, options);
            },
            exec: function() {
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
            init: function(options) {
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
            init: function() {
                var that = this;

                that._stack = {};
                that._keys = [];
            },
            push: function(data) {
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
            next: function() {
                var that = this,
                    key = that.keys().splice(0,1),
                    nextCommand = that._stack[key];

                return nextCommand;
            },
            resolve: function(command) {
                var that = this;
                delete that._stack[command.guid];
                command.deferred.resolve(command.data);
            },
            reject: function(command) {
                var that = this;
                delete that._stack[command.guid];
                command.deferred.reject(command.data);
            },
            keys: function() {
                return this._keys;
            },
            empty: function() {
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

