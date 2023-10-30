/**
 * Kendo UI v2023.3.1010 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.data.js";
import "../kendo.treelist.js";

(function($, undefined) {
    var extend = $.extend,

        data = kendo.data,
        Query = data.Query,
        DataSource = data.DataSource,
        TreeListDataSource = data.TreeListDataSource,
        Model = data.Model,
        ObservableArray = data.ObservableArray;

    var OrgChartModel = Model.define({
        id: "id",
        parentId: "parentId",

        fields: {
            id: { type: "number", editable: false },
            parentId: { type: "number", nullable: true },
            name: { type: "string", validation: { required: true } },
            title: { type: "string" },
            avatar: { type: "string" }
        },

        init: function(value) {
            Model.fn.init.call(this, value);

            this._loaded = false;

            if (!this.parentIdField) {
                this.parentIdField = "parentId";
            }
            if (!this.nameField) {
                this.nameField = "name";
            }
            if (!this.titleField) {
                this.titleField = "title";
            }
            if (!this.avatarField) {
                this.avatarField = "avatar";
            }

            this.parentId = this.get(this.parentIdField);
            this.name = this.get(this.nameField);
            this.title = this.get(this.titleField);
            this.avatar = this.get(this.avatarField);
        },

        accept: function(data) {
            Model.fn.accept.call(this, data);

            this.parentId = this.get(this.parentIdField);
            this.name = this.get(this.nameField);
            this.title = this.get(this.titleField);
            this.avatar = this.get(this.avatarField);
        },

        set: function(field, value, initiator) {
            if (field == "parentId" && this.nameField != "parentId") {
                this[this.parentIdField] = value;
            }
            if (field == "name" && this.nameField != "name") {
                this[this.nameField] = value;
            }
            if (field == "title" && this.titleField != "title") {
                this[this.titleField] = value;
            }
            if (field == "avatar" && this.avatarField != "avatar") {
                this[this.avatarField] = value;
            }

            Model.fn.set.call(this, field, value, initiator);

            if (field == this.parentIdField) {
                this.parentId = this.get(this.parentIdField);
            }
            if (field == this.nameField) {
                this.name = this.get(this.nameField);
            }
            if (field == this.titleField) {
                this.title = this.get(this.titleField);
            }
            if (field == this.avatarField) {
                this.avatar = this.get(this.avatarField);
            }
        },

        loaded: function(value) {
            if (value !== undefined) {
                this._loaded = value;
            } else {
                return this._loaded;
            }
        },

        shouldSerialize: function(field) {
            return Model.fn.shouldSerialize.call(this, field) && field !== "_loaded" && field != "_error" && field != "_edit" && !(this.parentIdField !== "parentId" && field === "parentId");
        }
    });

    OrgChartModel.parentIdField = "parentId";
    OrgChartModel.nameField = "name";
    OrgChartModel.titleField = "title";
    OrgChartModel.avatarField = "avatar";

    OrgChartModel.define = function(base, options) {
        if (options === undefined) {
            options = base;
            base = OrgChartModel;
        }

        var parentId = options.parentId || "parentId";
        var name = options.name || "name";
        var title = options.title || "title";
        var avatar = options.avatar || "avatar";

        options.parentIdField = parentId;
        options.nameField = name;
        options.titleField = title;
        options.avatarField = avatar;

        var model = Model.define(base, options);

        if (parentId) {
            model.parentIdField = parentId;
        }
        if (name) {
            model.nameField = name;
        }
        if (title) {
            model.titleField = title;
        }
        if (avatar) {
            model.avatarField = avatar;
        }

        return model;
    };

    var OrgChartDataSource = TreeListDataSource.extend({
        init: function(options) {
            TreeListDataSource.fn.init.call(this, extend(true, {}, {
                schema: {
                    modelBase: OrgChartModel,
                    model: OrgChartModel
                }
            }, options));
        },

        groupedItemsTree: function(field) {
            var map = this._childrenMap(this.view()),
                defaultParentId = this._defaultParentId(),
                currentChildren = map[defaultParentId] || [],
                grouped = new Query(currentChildren).group({ field: field }).toArray();

            return this._innerGroupedItemsTree(field, grouped, map);
        },

        itemChildren: function(item, fromView) {
            var filter = {
                field: "parentId",
                operator: "eq",
                value: null
            };

            var order = (this._sort && this._sort.length) ? this._sort : {};
            var itemId, data;

            if (fromView) {
                data = this.view();
            } else {
                data = this.data();
            }

            if (!!item) {
                itemId = item.get("id");

                if (itemId === undefined || itemId === null || itemId === "") {
                    return [];
                }

                filter.value = itemId;
            }

            data = new Query(data).filter(filter).sort(order).toArray();

            return data;
        },

        itemsTree: function(item, field) {
            var data = [],
                current,
                items = this.itemChildren(item, true),
                children, i;

            for (i = 0; i < items.length; i++) {
                current = items[i];

                if (current.get("expanded")) {
                    children = this.itemsTree(current, field);

                    current = extend(true, {}, current);
                    current.children = children;
                }

                current = extend(true, {}, current);
                data.push(current);
            }

            if (field !== null && field !== undefined) {
                data = new Query(data).group({ field: field }).toArray();
            }

            return data;
        },

        prospectParents: function(skippedItem, item) {
            var data = [],
                current,
                items = this.itemChildren(item, false),
                children, i;

            for (i = 0; i < items.length; i++) {
                current = items[i];

                if (current.get("id") === skippedItem.get("id")) {
                    continue;
                }

                data.push(current);

                if (current.get("hasChildren")) {
                    children = this.prospectParents(skippedItem, current);

                    data = data.concat(children);
                }
            }

            return data;
        },

        read: function(data) {
            return DataSource.fn.read.call(this, data).then(this._loadExpanded.bind(this, data));
        },

        toggleChildren: function(item, expand) {
            var defaultPromise = $.Deferred().resolve().promise(),
                loaded = item.loaded();

            // reset error state
            if (item._error) {
                item.expanded = false;
                item._error = undefined;
            }

            // toggle expanded state
            if (typeof expand == "undefined") {
                expand = !item.expanded;
            }

            item.expanded = expand;

            if (!loaded) {
                defaultPromise = this.load(item);
            }

            return defaultPromise;
        },

        _innerGroupedItemsTree: function(field, grouped, map) {
            var group, i, j, itemId, innerGrouped, children, current, hasChildren;


            for (i = 0; i < grouped.length; i++) {
                group = grouped[i];
                children = [];
                hasChildren = false;

                for (j = 0; j < group.items.length; j++) {
                    current = group.items[j];

                    if (!group.hasChildren && current.hasChildren) {
                        group.hasChildren = true;
                    }

                    if (current.expanded) {
                        group.expanded = true;
                    }

                    itemId = group.items[j].get("id");
                    children = children.concat(map[itemId]);
                }

                if (group.expanded) {
                    innerGrouped = new Query(children).group({ field: field }).toArray();
                    group.children = this._innerGroupedItemsTree(field, innerGrouped, map);
                }

                if (!group.hasChildren && children.length > 0) {
                    group.hasChildren = true;
                }
            }

            return grouped;
        },

        _loadExpanded: function(data) {
            var items, i, current;

            if (!data) {
                return;
            }

            if (data.id !== null && data.id !== undefined) {
                items = this._byParentId(data.id);
            } else {
                items = this._byParentId(this._defaultParentId());
            }

            for (i = 0; i < items.length; i++) {
                current = items[i];

                if (current.expanded && !current.loaded()) {
                    this.toggleChildren(current, true);
                }
            }
        }
    });

    OrgChartDataSource.create = function(options) {
        if (Array.isArray(options)) {
            options = { data: options };
        } else if (options instanceof ObservableArray) {
            options = { data: options.toJSON() };
        }

        if (!(options instanceof OrgChartDataSource) && options instanceof DataSource) {
            throw new Error("Incorrect DataSource type. Only OrgChartDataSource instances are supported");
        }

        return options instanceof OrgChartDataSource ? options : new OrgChartDataSource(options);
    };

    extend(true, kendo.data, {
        OrgChartModel: OrgChartModel,
        OrgChartDataSource: OrgChartDataSource
    });
})(window.kendo.jQuery);

