/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('orgchart/data',["../kendo.data", "../kendo.treelist"], f);
})(function(){

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

            if(fromView) {
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

            if(field !== null && field !== undefined) {
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

                if(current.get("id") === skippedItem.get("id")) {
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


            for(i = 0; i < grouped.length; i++) {
                group = grouped[i];
                children = [];
                hasChildren = false;

                for(j = 0; j < group.items.length; j++) {
                    current = group.items[j];

                    if(!group.hasChildren && current.hasChildren) {
                        group.hasChildren = true;
                    }

                    if(current.expanded) {
                        group.expanded = true;
                    }

                    itemId = group.items[j].get("id");
                    children = children.concat(map[itemId]);
                }

                if(group.expanded) {
                    innerGrouped = new Query(children).group({ field: field }).toArray();
                    group.children = this._innerGroupedItemsTree(field, innerGrouped, map);
                }

                if(!group.hasChildren && children.length > 0) {
                    group.hasChildren = true;
                }
            }

            return grouped;
        },

        _loadExpanded: function(data) {
            var items, i, current;

            if(!data) {
                return;
            }

            if(data.id !== null && data.id !== undefined) {
                items = this._byParentId(data.id);
            } else {
                items = this._byParentId(this._defaultParentId());
            }

            for(i = 0; i < items.length; i++) {
                current = items[i];

                if(current.expanded && !current.loaded()) {
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

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

(function(f, define){
    define('orgchart/view',["../kendo.core"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        keys = kendo.keys,
        extend = $.extend,

        NS = ".kendoOrgChartView",

        BLUR = "blur",
        CLICK = "click",
        COLLAPSE = "collapse",
        EXPAND = "expand",
        FOCUS = "focus",
        KEYDOWN = "keydown",
        MENU = "menu",
        SELECT = "select",

        DOT = ".",
        SPACE = " ",
        COMMA = ",",
        HASH = "#",
        STRING = "string",
        TABINDEX = "tabindex",
        ID = "id",
        UID = "uid",
        PX = "px",
        PLUS = "plus",
        MINUS = "minus",

        ARIA_OWNS = "aria-owns",
        ARIA_SELECTED = "aria-selected";

    var ORGCHART_STYLES = {
        wrapper: "k-orgchart",
        container: "k-orgchart-container",
        line: "k-orgchart-line",
        lineVertical: "k-orgchart-line-v",
        lineHorizontal: "k-orgchart-line-h",
        lineVerticalTop: "k-orgchart-line-v-top",
        group: "k-orgchart-group",
        groupVertical: "k-orgchart-group-v",
        groupHorizontal: "k-orgchart-group-h",
        nodesGroup: "k-orgchart-node-group",
        nodesGroupContainer: "k-orgchart-node-group-container",
        nodeContainer: "k-orgchart-node-container",
        node: "k-orgchart-node",
        card: "k-orgchart-card",
        cardMenu: "k-orgchart-card-menu",
        button: "k-orgchart-button",
        focused: "k-state-focus",
        plusIcon: "k-i-plus",
        menuItem: "k-item",
        avatarPreview: "k-orgchart-avatar-preview",
        update: "k-orgchart-update",
        cancel: "k-orgchart-cancel",
        vstack: "k-vstack",
        hstack: "k-hstack"
    };

    var ROOT_TEMPLATE = '<div role="tree" aria-orientation="horizontal" aria-label="#: label #" class="k-orgchart-group k-orgchart-level-1 k-pos-absolute k-hstack k-justify-content-center"></div>';

    var GROUP_TEMPLATE = '<div role="group" id="#: guid #" class="k-orgchart-level-#: level # k-orgchart-group k-pos-absolute k-justify-content-around"></div>';

    var NODE_GROUP_CONTAINER = '<div role="treeitem" ' +
        '# if(data.hasChildren && data.guid) { #' +
            'aria-owns="#: guid #" ' +
            '# if(!!data.expanded) { #' +
                'aria-expanded="true" ' +
            '# } else { #' +
                'aria-expanded="false" ' +
            '# } #' +
        '# } #' +
    'aria-keyshortcuts="Enter" aria-level="#: level #" aria-selected="false" class="k-orgchart-node-group-container">';

    var NODE_CONTAINER = '<div class="k-orgchart-node-container k-justify-content-around" style="width:100%"></div>';

    var NODE_CONTAINER_GROUPED = '<div role="group" class="k-orgchart-node-container k-justify-content-around k-hstack" style="width:100%"></div>';

    var ITEM_TEMPLATE = '<div class="k-orgchart-node k-vstack k-align-items-center"></div>';

    var BUTTON_TEMPLATE = '<button aria-label="#: label #" tabindex="-1" class="k-orgchart-button k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-icon-button">' +
            '<span class="k-button-icon k-icon k-i-#: buttonSign #"></span>' +
    '</button>';

    var CARD_TEMPLATE = '<div class="k-card-body k-hstack" style="border-color:#: color #">' +
        '# if(!!data.avatar) { #' +
            '<div class="k-avatar k-avatar-solid-primary k-avatar-solid k-avatar-lg k-rounded-full">' +
                '<span class="k-avatar-image">' +
                    '<img alt="#: name #" src="#: avatar #">' +
                '</span>' +
            '</div>' +
        '# } #' +
        '<div class="k-vstack k-card-title-wrap">' +
            '<div class="k-card-title k-text-ellipsis">#: name #</div>' +
            '# if(data.title) { #' +
                '<span class="k-spacer"></span>' +
                '<div class="k-card-subtitle k-text-ellipsis">#: title #</div>' +
            '# } #' +
        '</div>' +
        '# if(editable) { #' +
            '<span class="k-spacer"></span>' +
            '<div class="k-card-body-actions">' +
                '<button class="k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button k-orgchart-card-menu" role="button" aria-label="#: menuLabel #" tabindex="-1">' +
                    '<span class="k-button-icon k-icon k-i-more-vertical"></span>' +
                '</button>' +
            '</div>' +
        '# } #' +
    '</div>';

    var CARD_WRAPPER = '<div role="treeitem" data-uid="#: uid #" ' +
            '# if(data.hasChildren && data.guid) { #' +
                'aria-owns="#: guid #" ' +
                '# if(!!data.expanded) { #' +
                    'aria-expanded="true" ' +
                '# } else { #' +
                    'aria-expanded="false" ' +
                '# } #' +
            '# } #' +
        'class="k-orgchart-card k-card ' +
            '# if(!!data.cssClass) { #' +
                '#: data.cssClass #' +
            '# } #' +
        '" aria-keyshortcuts="Enter" aria-level="#: level #" aria-selected="false">' +
    '</div>';

    var GROUPED_CARD_WRAPPER = '<div role="treeitem" data-uid="#: uid #" aria-level="#: level #" aria-selected="false" aria-keyshortcuts="Enter" ' +
    'class="k-orgchart-card k-card ' +
        '# if(!!data.cssClass) { #' +
            '#: data.cssClass #' +
        '# } #' +
    '"></div>';

    var View = kendo.Observable.extend({
        init: function(element, options) {
            this.element = element;
            this.options = options || {};

            kendo.Observable.fn.init.call(this);

            this._attachEvents();
        },

        events: [
            COLLAPSE,
            EXPAND,
            SELECT,
            MENU
        ],

        destroy: function() {
            kendo.ui.Widget.fn.destroy.call(this);
            this.element.off(NS);
        },

        collapse: function() {
            return false;
        },

        expand: function() {
            return false;
        },

        jqueryGroupElement: function(group) {
            if(!group) {
                return;
            }

            var jQueryElement = this._processItem(group);

            if(!jQueryElement.hasClass(ORGCHART_STYLES.nodesGroupContainer)) {
                jQueryElement = jQueryElement.closest(DOT + ORGCHART_STYLES.nodesGroupContainer);
            }

            return jQueryElement && jQueryElement.length ? jQueryElement : null;
        },

        jqueryItemElement: function(item) {
            if(!item) {
                return;
            }

            var jQueryElement = this._processItem(item);

            if(!jQueryElement.hasClass(ORGCHART_STYLES.card)) {
                jQueryElement = jQueryElement.closest(DOT + ORGCHART_STYLES.card);
            }

            return jQueryElement && jQueryElement.length ? jQueryElement : null;
        },

        refresh: function() {
            this._cacheFocused();
            this._clearContent();
            this._generateItemsTree();
            this._calculateLevels();
            this._render();
        },

        select: function(item) {
            var $item = this._getToSelect(item),
                previousSelection = this.element.find("[tabindex=0]");

            if(!$item) {
                return;
            }

            previousSelection.removeAttr(TABINDEX)
                .removeClass(ORGCHART_STYLES.focused)
                .attr(ARIA_SELECTED, false);

            $item.attr(TABINDEX, "0")
                .addClass(ORGCHART_STYLES.focused)
                .trigger("focus")
                .attr(ARIA_SELECTED, true);
        },

        _attachEvents: function() {
            var itemsSelector = DOT + ORGCHART_STYLES.card + COMMA + DOT + ORGCHART_STYLES.nodesGroupContainer;

            this.element.on(KEYDOWN + NS, itemsSelector, this._onKeyDown.bind(this))
                .on(CLICK + NS, itemsSelector, this._onSelect.bind(this))
                .on(CLICK + NS, DOT + ORGCHART_STYLES.button, this._onButtonClick.bind(this))
                .on(FOCUS + NS, itemsSelector, this._onFocus.bind(this))
                .on(BLUR + NS, DOT + ORGCHART_STYLES.focused, this._onBlur.bind(this));
        },

        _cacheFocused: function() {
            var focusableItem = this.element.find("[tabindex='0']"),
                focusableDataItem = this._dataItems(focusableItem);

            if(!focusableItem.length || !focusableDataItem || !focusableDataItem.length || !!this._idTabIndex) {
                return;
            }

            this._idTabIndex = focusableDataItem[0].get(ID);

            if(focusableItem.hasClass(ORGCHART_STYLES.focused)) {
                this._shouldRestoreSelection = true;
            } else {
                this._shouldRestoreSelection = false;
            }
        },

        _calculateDimensions: function() {
            var itemElement = this.element.find(DOT + this._selector).first();

            if(!this._buttonHeight) {
                this._buttonHeight = this.element.find(DOT + ORGCHART_STYLES.button).first().outerHeight();
            }

            if(!this._spacing) {
                this._spacing = this.element.find(DOT + ORGCHART_STYLES.lineVertical).first().outerHeight();
            }

            if(!this._itemWidth) {
                this._itemWidth = this._calculateItemWidth();
            }

            if(!this._itemHeight) {
                this._itemHeight = itemElement.outerHeight(true);
            }
        },

        _calculateItemWidth: function() {
            return false;
        },

        _calculateLevel: function() {
            return false;
        },

        _calculateLevels: function() {
            return false;
        },

        _clearContent: function() {
            this.element.empty();
        },

        _dataItem: function(item) {
            var $item = this.jqueryItemElement(item);

            if(!$item || !$item.data(UID)) {
                return;
            }

            return this.dataSource.getByUid($item.data(UID));
        },

        _dataItems: function() {
            return false;
        },

        _generateItemsTree: function() {
            return false;
        },

        _getToSelect: function() {
            return false;
        },

        _groupIsVertical: function() {
            return false;
        },

        _keyCollapse: function() {
            return false;
        },

        _keyExpand: function() {
            return false;
        },

        _keyNext: function() {
            return false;
        },

        _keyPrev: function() {
            return false;
        },

        _keyEnter: function() {
            return false;
        },

        _keyEscape: function() {
            return false;
        },

        _keyEnd: function() {
            var target = this.element.find(DOT + ORGCHART_STYLES.card).last(),
                previous = this.element.find("[tabindex=0]");


            if(previous[0] === target[0]) {
                return;
            }

            this.trigger(SELECT, {
                item: target,
                dataItems: [this._dataItem(target)]
            });
        },

        _keyHome: function() {
            var target = this.element.find(DOT + ORGCHART_STYLES.card).first(),
                previous = this.element.find("[tabindex=0]");


            if(previous[0] === target[0]) {
                return;
            }

            this.trigger(SELECT, {
                item: target,
                dataItems: [this._dataItem(target)]
            });
        },

        _onBlur: function() {
            this.element.find(DOT + ORGCHART_STYLES.focused).removeClass(ORGCHART_STYLES.focused);
        },

        _onKeyDown: function(e) {
            var key = e.keyCode,
                focused = this.element.find("[tabindex=0]"),
                isRtl = kendo.support.isRtl(this.element),
                nextKey = isRtl ? [ keys.LEFT ] : [ keys.RIGHT ],
                prevKey = isRtl ? [ keys.RIGHT ] : [ keys.LEFT ],
                expandKey = keys.DOWN,
                collapseKey = keys.UP,
                groupIsVertical;

            if(!focused) {
                return;
            }

            groupIsVertical = this._groupIsVertical(focused);

            if(groupIsVertical) {
                nextKey.push(keys.DOWN);
                prevKey.push(keys.UP);
            }

            if(key === keys.HOME) {
                this._keyHome();
            } else if(key === keys.END) {
                this._keyEnd();
            } else if(nextKey.indexOf(key) > -1) {
                e.preventDefault();
                e.stopPropagation();

                this._keyNext(focused);
            } else if(prevKey.indexOf(key) > -1) {
                e.preventDefault();
                e.stopPropagation();

                this._keyPrev(focused);
            } else if(key === expandKey) {
                e.preventDefault();
                e.stopPropagation();

                this._keyExpand(focused);
            } else if(key === collapseKey) {
                e.preventDefault();
                e.stopPropagation();

                this._keyCollapse(focused);
            } else if(key === keys.ENTER) {
                this._keyEnter(focused);
            } else if(key === keys.ESC) {
                this._keyEscape(focused);
            }
        },

        _onButtonClick: function(e) {
            var that = this,
                target = $(e.currentTarget),
                shouldExpand = target.find(DOT + ORGCHART_STYLES.plusIcon).length > 0 ? true : false,
                el = target.siblings(DOT + this._selector),
                items = this._dataItems(el),
                i;

            if(shouldExpand) {
                if(that.trigger(EXPAND, { item: el, dataItems: items })) {
                    return;
                }
            } else {
                if(that.trigger(COLLAPSE, { item: el, dataItems: items })) {
                    return;
                }
            }

            for(i = 0; i < items.length; i++) {
                that.dataSource.toggleChildren(items[i], shouldExpand).then(this.refresh.bind(this));
            }
        },

        _onFocus: function() {
            return false;
        },

        _onSelect: function() {
            return false;
        },

        _orientation: function() {
            return false;
        },

        _processItem: function(el) {
            var jQueryElement;

            // Substitute with kendo.type() when merged and taken from master
            if($.type(el) === STRING) {
                jQueryElement = this.element.find(el);
            } else if(kendo.isElement(el)) {
                jQueryElement = $(el);
            } else if(el instanceof jQuery) {
                jQueryElement = el;
            }

            return jQueryElement;
        },

        _render: function() {
            var items = this._itemsTree,
                root = $(kendo.template(ROOT_TEMPLATE)({ label: this.options.messages.label })),
                wrapperContainer = this.element,
                total = this._total,
                widgetPadding = wrapperContainer.closest(DOT + ORGCHART_STYLES.wrapper).css("padding-left"),
                totalWidth;

            wrapperContainer.append(root);

            this._renderGroup(root, items, 1, this._total, 0);
            totalWidth = total * this._itemWidth + (total - 1) * this._spacing;
            root.width(totalWidth);
            wrapperContainer.width(totalWidth + Number(widgetPadding.split(PX)[0]));

            this._setHeight();
            this._restoreSelection();
        },

        _renderNode: function(cardWrapperTemplate, contentTemplate, item, level, guid) {
            var messages = this.options.messages,
                borderColors = this.options.cardsColors || kendo.getSeriesColors(),
                node = $(ITEM_TEMPLATE),
                content, cardWrapper;

            cardWrapper = $(cardWrapperTemplate(extend(true, {}, item, {
                menuLabel: messages.menuLabel,
                level: level,
                guid: guid,
                editable: !!this.options.editable,
                color: borderColors[level - 1] || borderColors[0]
            })));

            if(item.attributes) {
                cardWrapper.attr(JSON.parse(JSON.stringify(item.attributes)));
            }

            content = $(contentTemplate(extend(true, {}, item, {
                menuLabel: messages.menuLabel,
                level: level,
                guid: guid,
                editable: !!this.options.editable,
                color: borderColors[level - 1] || borderColors[0]
            })));

            cardWrapper.append(content);
            node.append(cardWrapper);

            return node;
        },

        _renderGroup: function() {
            return false;
        },

        _restoreSelection: function() {
            var toFocusItem, toFocus;

            if(!this._idTabIndex) {
                toFocus = this.element.find(DOT + this._selector).first();

                toFocus.attr(TABINDEX, "0");
            } else {
                toFocusItem = this.dataSource.get(this._idTabIndex);
                toFocus = toFocusItem ? this._getToFocus(toFocusItem) : this.element.find(DOT + this._selector).first();
                toFocus.attr(TABINDEX, "0");

                this._idTabIndex = null;
            }

            if(this._shouldRestoreSelection) {
                this._shouldRestoreSelection = false;
                this._preventTriggerSelect = true;
                toFocus.trigger("focus");
                toFocus.addClass(ORGCHART_STYLES.focused);
            }
        },

        _setHeight: function() {
            var selector = this._selector,
                elements = this.element.find(DOT + ORGCHART_STYLES.button + COMMA + DOT + selector),
                min = Number.MAX_VALUE, max = 0,
                buttonHeight;

            this._calculateDimensions();

            buttonHeight = this._buttonHeight;
            this.element.find(DOT + ORGCHART_STYLES.lineVerticalTop).height(this._spacing + buttonHeight / 2);

            elements.each(function(i, el) {
                var top = $(el).offset().top,
                    bottom = top + $(el).outerHeight(true);

                if(top < min) {
                    min = top;
                }

                if(bottom > max) {
                    max = bottom;
                }
            });

            this.element.height(max - min);
        }
    });

    var SingleView = View.extend({
        init: function(element, options) {
            View.fn.init.call(this, element, options);

            this._selector = ORGCHART_STYLES.card;
        },

        collapse: function(item) {
            var $item = this.jqueryItemElement(item);

            if(!$item) {
                return;
            }

            this.dataSource.toggleChildren(this._dataItem($item), false).then(this.refresh.bind(this));
        },

        expand: function(item) {
            var $item = this.jqueryItemElement(item);

            if(!$item) {
                return;
            }

            this.dataSource.toggleChildren(this._dataItem($item), true).then(this.refresh.bind(this));
        },

        _calculateItemWidth: function() {
            return this.element.find(DOT + this._selector).first().outerWidth(true);
        },

        _calculateLevel: function(items, level) {
            var itemsLength = items.length,
                maxColumnsPerLevel = this._maxColumnsPerLevel,
                nestedChildren = false,
                shouldReset = false,
                previousMax, i, item;

            if(!maxColumnsPerLevel[level] || maxColumnsPerLevel[level] < itemsLength) {
                previousMax = maxColumnsPerLevel[level];
                shouldReset = true;
                maxColumnsPerLevel[level] = itemsLength;
            }

            for(i = 0; i < itemsLength; i++) {
                item = items[i];

                if(item.hasChildren) {
                    nestedChildren = true;

                    if(item.expanded) {
                        this._calculateLevel(item.children, level + 1);
                    }
                }
            }

            if(!nestedChildren && shouldReset && level > 0) {
                shouldReset = false;
                maxColumnsPerLevel[level] = previousMax || 1;
            }
        },

        _calculateLevels: function() {
            var items = this._itemsTree,
                maxColumnsPerLevel = this._maxColumnsPerLevel = [],
                total = 1,
                i;

            this._calculateLevel(items, 0);

            for(i = 0; i < maxColumnsPerLevel.length; i++) {
                total = total * maxColumnsPerLevel[i];
            }

            this._total = total;
        },

        _dataItems: function(container) {
            var item = this.dataSource.getByUid(container.data(UID));

            if(item) {
                return [item];
            } else {
                return null;
            }
        },

        _generateItemsTree: function() {
            this._itemsTree = this.dataSource.itemsTree();
        },

        _getToFocus: function(item) {
            return this.element.find("[data-uid='" + item.get(UID) + "']");
        },

        _getToSelect: function(el) {
            return this.jqueryItemElement(el);
        },

        _groupIsVertical: function(focused) {
            var itemGroup = focused.closest(DOT + ORGCHART_STYLES.group);

            return itemGroup.hasClass(ORGCHART_STYLES.groupVertical);
        },

        _keyCollapse: function(focused) {
            var dataItem = this._dataItem(focused),
                parentUid, parentItem;

            if(dataItem.expanded) {
                if(!this.trigger(COLLAPSE, { item: focused, dataItems: [dataItem] })) {
                    this.collapse(focused);
                }
            } else if(dataItem.parentId) {
                parentUid = this.dataSource.get(dataItem.parentId).get(UID);
                parentItem = this.element.find("[data-uid='" + parentUid + "']");

                this.trigger(SELECT, {
                    item: parentItem,
                    dataItems: [this._dataItem(parentItem)]
                });
            }
        },

        _keyEnter: function(focused) {
            if(focused.find(DOT + ORGCHART_STYLES.cardMenu).length > 0) {
                this.trigger(MENU, focused);
            }
        },

        _keyExpand: function(focused) {
            var dataItem = this._dataItem(focused),
                ownedGroup = this.element.find(HASH + focused.attr(ARIA_OWNS)),
                childItem;

            if(!dataItem.hasChildren) {
                return;
            }

            if(!dataItem.expanded) {
                if(!this.trigger(EXPAND, { item: focused, dataItems: [dataItem] })) {
                    this.expand(focused);
                }
            } else {
                childItem = ownedGroup.find(DOT + this._selector).first();

                this.trigger(SELECT, {
                    item: childItem,
                    dataItems: [this._dataItem(childItem)]
                });
            }
        },

        _keyNext: function(focused) {
            var dataItem = this._dataItem(focused),
                next = focused.parent().next(DOT + ORGCHART_STYLES.node).find(DOT + ORGCHART_STYLES.card),
                ownedGroup = this.element.find(HASH + focused.attr(ARIA_OWNS));

            if(!next.length && dataItem.hasChildren && dataItem.expanded) {
                next = ownedGroup.find(DOT + ORGCHART_STYLES.card).first();
            }

            if(next.length === 0 || next.hasClass(ORGCHART_STYLES.focused)) {
                return;
            }

            this.trigger(SELECT, {
                item: next,
                dataItems: [this._dataItem(next)]
            });
        },

        _keyPrev: function(focused) {
            var dataItem = this._dataItem(focused),
                prev = focused.parent().prev(DOT + ORGCHART_STYLES.node).find(DOT + ORGCHART_STYLES.card),
                parentUid;

            if(!prev.length && dataItem.parentId) {
                parentUid = this.dataSource.get(dataItem.parentId).get(UID);
                prev = this.element.find("[data-uid='" + parentUid + "']");
            }

            if(prev.length === 0 || prev.hasClass(ORGCHART_STYLES.focused)) {
                return;
            }

            this.trigger(SELECT, {
                item: prev,
                dataItems: [this._dataItem(prev)]
            });
        },

        _onFocus: function(e) {
            var currentTarget = $(e.currentTarget),
                target = $(e.target);

            if(this._preventTriggerSelect) {
                e.stopPropagation();
                this._preventTriggerSelect = false;
                return;
            }

            if(target.hasClass(ORGCHART_STYLES.cardMenu)) {
                if(target.closest("[tabindex='0']").length > 0) {
                    e.stopPropagation();
                    return;
                } else {
                    this._preventTriggerSelect = true;
                }
            }

            if(!currentTarget.hasClass(ORGCHART_STYLES.card)) {
                currentTarget = currentTarget.closest(DOT + ORGCHART_STYLES.card);
            }

            if(!currentTarget.hasClass(ORGCHART_STYLES.focused)) {
                this.trigger(SELECT, {
                    item: currentTarget,
                    dataItems: [this._dataItem(currentTarget)]
                });
            }
        },

        _onSelect: function(e) {
            var target = $(e.currentTarget),
                item = target.hasClass(ORGCHART_STYLES.card) ? target : target.closest(DOT + ORGCHART_STYLES.card),
                menuButtonTarget = $(e.target).hasClass(ORGCHART_STYLES.cardMenu) ? $(e.target) : $(e.target).closest(DOT + ORGCHART_STYLES.cardMenu);

            if(menuButtonTarget.length > 0) {
                return;
            }

            if(!target.hasClass(ORGCHART_STYLES.focused)) {
                this.trigger(SELECT, {
                    item: item,
                    dataItems: [this._dataItem(item)]
                });
            }
        },

        _orientation: function(group, level, vertical) {
            var vLine = $("<div>").addClass(ORGCHART_STYLES.line + SPACE + ORGCHART_STYLES.lineVertical);

            if(vertical && level > 1) {
                group.addClass(ORGCHART_STYLES.groupVertical + SPACE + ORGCHART_STYLES.vstack);
                group.find(DOT + ORGCHART_STYLES.nodeContainer).addClass(ORGCHART_STYLES.vstack);

                if(group.find(DOT + ORGCHART_STYLES.button).length === 0 || group.find(DOT + ORGCHART_STYLES.card).length === 1) {
                    group.find(DOT + ORGCHART_STYLES.card).before(vLine.clone());
                    group.find(DOT + ORGCHART_STYLES.node).first().find(DOT + ORGCHART_STYLES.lineVertical).addClass(ORGCHART_STYLES.lineVerticalTop);
                } else if(level > 1) {
                    group.find(DOT + ORGCHART_STYLES.card).first().before(vLine.clone());
                }
            } else {
                group.addClass(ORGCHART_STYLES.groupHorizontal + SPACE + ORGCHART_STYLES.hstack);
                group.find(DOT + ORGCHART_STYLES.nodeContainer).addClass(ORGCHART_STYLES.hstack);

                if(level > 1) {
                    group.find(DOT + ORGCHART_STYLES.card).before(vLine.clone().addClass(ORGCHART_STYLES.lineVerticalTop));
                }
            }
        },

        _renderGroup: function(group, items, level, parentColumns, parentLeft) {
            var vertical = true,
                nodeContainer;

                nodeContainer = $(NODE_CONTAINER);
                group.append(nodeContainer);
                vertical = this._renderInner(nodeContainer, items, level, parentColumns, parentLeft);

                this._orientation(group, level, vertical);
        },

        _renderInner: function(nodeContainer, items, level, parentColumns, parentLeft) {
            var buttonTemplate = kendo.template(BUTTON_TEMPLATE),
                cardWrapperTemplate = kendo.template(CARD_WRAPPER),
                numberOfColumns = parentColumns / items.length,
                vertical = true,
                vLine = $("<div>").addClass(ORGCHART_STYLES.line + SPACE + ORGCHART_STYLES.lineVertical),
                hLine = $("<div>").addClass(ORGCHART_STYLES.line + SPACE + ORGCHART_STYLES.lineHorizontal),
                messages = this.options.messages,
                i, item, guid, node, button, innerGroup, itemWidth, spacing, contentTemplate;

            if(!this.options.template) {
                contentTemplate = kendo.template(CARD_TEMPLATE);
            } else if (typeof this.options.template === "function") {
                contentTemplate = this.options.template;
            } else {
                contentTemplate = kendo.template(this.options.template);
            }

            for(i = 0; i < items.length; i++) {
                item = items[i];
                guid = kendo.guid();

                node = this._renderNode(cardWrapperTemplate, contentTemplate, item, level, guid);

                if(item.hasChildren) {
                    node.append(vLine.clone());
                    button = $(buttonTemplate({ buttonSign: item.expanded ? MINUS : PLUS, label: item.expanded ? messages.collapse : messages.expand }));
                    node.append(button);
                }

                nodeContainer.append(node);

                this._calculateDimensions();

                itemWidth =  this._itemWidth;
                spacing = this._spacing;

                if(item.hasChildren) {
                    vertical = false;

                    if(item.expanded) {
                        innerGroup = this._renderInnerGroup(item, numberOfColumns, parentLeft, i, level, guid);
                    }
                }

                if(!!innerGroup && innerGroup.hasClass(ORGCHART_STYLES.groupHorizontal) && item.expanded && !!item.children && item.children.length > 1) {
                    button.after(hLine.clone().css({
                        width: (numberOfColumns - numberOfColumns / item.children.length) * (itemWidth + spacing) + PX,
                        "margin-top": this._buttonHeight / -2 + PX
                    }));
                }
            }

            if(numberOfColumns > 1 && !vertical) {
                nodeContainer.find(DOT + ORGCHART_STYLES.node).width((numberOfColumns - 1) * (spacing + itemWidth));
            }

            return vertical;
        },

        _renderInnerGroup: function(item, numberOfColumns, parentLeft, i, level, guid) {
            var itemWidth =  this._itemWidth,
                spacing = this._spacing,
                width = numberOfColumns * itemWidth + (numberOfColumns - 1) * spacing,
                left = (i * numberOfColumns * itemWidth) + parentLeft,
                groupTemplate = kendo.template(GROUP_TEMPLATE),
                offsetDirection = kendo.support.isRtl(this.element) ? "right" : "left",
                top = level * (this._itemHeight + this._buttonHeight + spacing) + spacing * (level - 1) - this._buttonHeight / 2,
                innerGroup;

            if(i > 0) {
                left += (i * numberOfColumns * spacing);
            }

            innerGroup = $(groupTemplate({
                guid: guid,
                level: level + 1
            }));

            innerGroup.css({
                width: width + PX,
                top: top + PX
            });

            innerGroup.css(offsetDirection, left + PX);

            this.element.append(innerGroup);
            this._renderGroup(innerGroup, item.children, level + 1, numberOfColumns, left);

            return innerGroup;
        }
    });

    var GroupedView = View.extend({
        init: function(element, options) {
            View.fn.init.call(this, element, options);

            this._selector = ORGCHART_STYLES.nodesGroupContainer;
        },

        collapse: function(group) {
            var $group = this.jqueryGroupElement(group),
                dataItems, i;

            if(!$group) {
                return;
            }

            dataItems = this._dataItems($group);

            for(i = 0; i < dataItems.length; i++) {
                this.dataSource.toggleChildren(dataItems[i], false).then(this.refresh.bind(this));
            }
        },

        expand: function(group) {
            var $group = this.jqueryGroupElement(group),
                dataItems, i;

            if(!$group) {
                return;
            }

            dataItems = this._dataItems($group);

            for(i = 0; i < dataItems.length; i++) {
                this.dataSource.toggleChildren(dataItems[i], true).then(this.refresh.bind(this));
            }
        },

        _dataItems: function(container) {
            var ds = this.dataSource,
                dataItems = [],
                items, item, current;

            if(container.hasClass(ORGCHART_STYLES.card)) {
                item = ds.getByUid(container.data(UID));

                if(item) {
                    dataItems.push(item);
                }
            } else if(container.hasClass(ORGCHART_STYLES.nodesGroupContainer)) {
                this._groupFocused = true;

                items = container.find(DOT + ORGCHART_STYLES.card);

                items.each(function(i, item) {
                    current = ds.getByUid(item.getAttribute("data-uid"));

                    if(current) {
                        dataItems.push(current);
                    }
                });
            }

            return dataItems;
        },

        _calculateItemWidth: function() {
            var itemElement = this.element.find(DOT + this._selector).first(),
                cardWidth = this.element.find(DOT + ORGCHART_STYLES.card).first().outerWidth(true),
                padding = Number(itemElement.css("padding-left").split(PX)[0]),
                border = Number(itemElement.css("border-left").split(PX)[0]);

            return cardWidth+ 2 * padding + 2* border;
        },

        _calculateLevel: function(groups, level) {
            var groupsLength = groups.length,
                nestedChildren = false,
                maxColumns = 0,
                currentLength, i, group;

            this._maxColumnsPerLevel[level] = this._maxColumnsPerLevel[level] || 0;
            this._maxGroups[level] = this._maxGroups[level] || 0;

            for(i = 0; i < groupsLength; i++) {
                group = groups[i];
                currentLength = group.items.length;

                if (currentLength > maxColumns) {
                    maxColumns = currentLength;
                }

                group = groups[i];

                if(group.hasChildren) {
                    nestedChildren = true;

                    if(group.expanded) {
                        this._calculateLevel(group.children, level + 1);
                    }
                }
            }

            if(groupsLength > this._maxGroups[level]) {
                this._maxGroups[level] = groupsLength;
            }

            if(!nestedChildren) {
                maxColumns = 1;
            }

            if(maxColumns > this._maxColumnsPerLevel[level]) {
                this._maxColumnsPerLevel[level] = maxColumns;
            }
        },

        _calculateLevels: function() {
            var items = this._itemsTree,
                maxColumnsPerLevel = this._maxColumnsPerLevel = [],
                maxGroups = this._maxGroups = [],
                total = 1,
                i, currentTotal;

            this._calculateLevel(items, 0);

            for(i = maxColumnsPerLevel.length - 1; i >= 0; i--) {
                currentTotal = maxColumnsPerLevel[i] * maxGroups[i];

                if(total > maxColumnsPerLevel[i]) {
                    total = total * maxGroups[i];
                } else if(total < currentTotal) {
                    total = currentTotal;
                }
            }

            this._total = total;
        },

        _generateItemsTree: function() {
            this._itemsTree = this.dataSource.groupedItemsTree(this.options.groupField);
        },

        _getToFocus: function(item) {
            if(!this._groupFocused) {
                return this.element.find("[data-uid='" + item.get(UID) + "']");
            } else {
                this._groupFocused = false;
                return this.element.find("[data-uid='" + item.get(UID) + "']").closest(DOT + ORGCHART_STYLES.nodesGroupContainer);
            }
        },

        _getToSelect: function(el) {
            var item = this.jqueryItemElement(el);

            return item || this.jqueryGroupElement(el);
        },

        _groupIsVertical: function(focused) {
            var itemGroup = focused.closest(DOT + ORGCHART_STYLES.nodeContainer);

            return itemGroup.hasClass(ORGCHART_STYLES.vstack);
        },

        _keyCollapse: function(focused) {
            var dataItems = [],
                parentUid, expanded;

            dataItems = this._dataItems(focused);

            expanded = dataItems.some(function(item) {
                return item.expanded;
            });

            if(expanded) {
                if(focused.hasClass(ORGCHART_STYLES.card)) {
                    focused = focused.closest(DOT + ORGCHART_STYLES.nodesGroupContainer);
                    dataItems = this._dataItems(focused);
                }

                if(!this.trigger(COLLAPSE, { item: focused, dataItems: dataItems })) {
                    this.collapse(focused);
                }
            } else if(dataItems[0].parentId) {
                parentUid = this.dataSource.get(dataItems[0].parentId).get(UID);

                this.trigger(SELECT, {
                    item: this.element.find("[data-uid='" + parentUid + "']").closest(DOT + this._selector),
                    dataItems: dataItems
                });
            }
        },

        _keyEnter: function(focused) {
            var toSelect,
                dataItems = [];

            if(focused.hasClass(ORGCHART_STYLES.card) && focused.find(DOT + ORGCHART_STYLES.cardMenu).length > 0) {
                this.trigger(MENU, focused);
            } else {
                toSelect = focused.find(DOT + ORGCHART_STYLES.card).first();
                dataItems = this._dataItems(toSelect);

                this.trigger(SELECT, {
                    item: toSelect,
                    dataItems: dataItems
                });
            }
        },

        _keyEscape: function(focused) {
            if(!focused.hasClass(ORGCHART_STYLES.card)) {
                return;
            }

            var group = focused.closest(DOT + ORGCHART_STYLES.nodesGroupContainer),
                dataItems = this._dataItems(group);

            this.trigger(SELECT, {
                item: group,
                dataItems: dataItems
            });
        },

        _keyExpand: function(focused) {
            var ownedGroupId = focused.attr(ARIA_OWNS) || focused.closest(DOT + this._selector).attr(ARIA_OWNS),
                ownedGroup = this.element.find(HASH + ownedGroupId),
                dataItems = this._dataItems(focused),
                hasChildren, expanded, item;

            hasChildren = dataItems.some(function(item) {
                return item.hasChildren;
            });

            if(!hasChildren) {
                return;
            }

            expanded = dataItems.some(function(item) {
                return item.expanded;
            });

            if(!expanded) {
                if(focused.hasClass(ORGCHART_STYLES.card)) {
                    focused = focused.closest(DOT + ORGCHART_STYLES.nodesGroupContainer);
                    dataItems = this._dataItems(focused);
                }

                if(!this.trigger(EXPAND, { item: focused, dataItems: dataItems })) {
                    this.expand(focused);
                }
            } else {
                item = ownedGroup.find(DOT + this._selector).first();

                this.trigger(SELECT, {
                    item: item,
                    dataItems: this._dataItems(item)
                });
            }
        },

        _keyNext: function(focused) {
            var ownedGroup = this.element.find(HASH + focused.attr(ARIA_OWNS)),
                dataItems = this._dataItems(focused),
                hasChildren = dataItems.some(function(item) {
                    return item.hasChildren;
                }),
                expanded = dataItems.some(function(item) {
                    return item.expanded;
                }),
                next;

                if(focused.hasClass(ORGCHART_STYLES.card)) {
                    next = focused.parent().next(DOT + ORGCHART_STYLES.node).find(DOT + ORGCHART_STYLES.card);
                } else {
                    next = focused.parent().next(DOT + ORGCHART_STYLES.nodesGroup).find(DOT + ORGCHART_STYLES.nodesGroupContainer);
                }

            if(!next.length && hasChildren && expanded) {
                next = ownedGroup.find(DOT + this._selector).first();
            }

            if(next.length === 0) {
                return;
            }

            this.trigger(SELECT, {
                item: next,
                dataItems: this._dataItems(next)
            });
        },

        _keyPrev: function(focused) {
            var dataItems = this._dataItems(focused),
                parentUid, prev;

            if(focused.hasClass(ORGCHART_STYLES.card)) {
                prev = focused.parent().prev(DOT + ORGCHART_STYLES.node).find(DOT + ORGCHART_STYLES.card);
            } else {
                prev = focused.parent().prev(DOT + ORGCHART_STYLES.nodesGroup).find(DOT + ORGCHART_STYLES.nodesGroupContainer);
            }

            if(!prev.length && dataItems[0].parentId) {
                parentUid = this.dataSource.get(dataItems[0].parentId).get(UID);
                prev = this.element.find("[data-uid='" + parentUid + "']").closest(DOT + this._selector);
            }

            if(prev.length === 0) {
                return;
            }

            this.trigger(SELECT, {
                item: prev,
                dataItems: this._dataItems(prev)
            });
        },

        _onFocus: function(e) {
            var target = $(e.target),
                items, current;

            if(this._preventTriggerSelect) {
                e.stopPropagation();
                this._preventTriggerSelect = false;
                return;
            }

            if(target.hasClass(ORGCHART_STYLES.cardMenu)) {
                if(target.closest("[tabindex='0']").length > 0) {
                    e.stopPropagation();
                    return;
                } else {
                    this._preventTriggerSelect = true;
                }
            }

            if(!target.hasClass(ORGCHART_STYLES.card) && !target.hasClass(ORGCHART_STYLES.nodesGroupContainer)) {
                current = target.closest(DOT + ORGCHART_STYLES.card);

                if(!current.length) {
                    current = target.closest(DOT + ORGCHART_STYLES.nodesGroupContainer);
                }

                target = current;
            }

            if(target.length === 0) {
                return;
            }

            items = this._dataItems(target);

            if(!target.hasClass(ORGCHART_STYLES.focused)) {
                e.stopPropagation();
                this.trigger(SELECT, {
                    item: target,
                    dataItems: items
                });
            }
        },

        _onSelect: function(e) {
            var target = $(e.target),
                previousSelection = this.element.find("[tabindex=0]"),
                items, current;

            if(!target.hasClass(ORGCHART_STYLES.card) && !target.hasClass(ORGCHART_STYLES.nodesGroupContainer)) {
                current = target.closest(DOT + ORGCHART_STYLES.card);

                if(!current.length) {
                    current = target.closest(DOT + ORGCHART_STYLES.nodesGroupContainer);
                }

                target = current;
            }

            if(target.length === 0 || previousSelection[0] === target[0]) {
                return;
            }

            items = this._dataItems(target);

            this.trigger(SELECT, {
                item: target,
                dataItems: items
            });
        },

        _orientation: function(group, level, vertical) {
            var vLine = $("<div>").addClass(ORGCHART_STYLES.line + SPACE + ORGCHART_STYLES.lineVertical + SPACE + ORGCHART_STYLES.lineVerticalTop);

            group.addClass(ORGCHART_STYLES.hstack);

            if(level > 1) {
                group.find(DOT + ORGCHART_STYLES.nodesGroupContainer).before(vLine.clone());
            }

            if(vertical && level > 1) {
                group.find(DOT + ORGCHART_STYLES.nodeContainer).removeClass(ORGCHART_STYLES.hstack);
                group.find(DOT + ORGCHART_STYLES.nodeContainer).addClass(ORGCHART_STYLES.vstack);
            } else {
                group.addClass(ORGCHART_STYLES.groupHorizontal);
            }
        },

        _renderChildren: function(item, index, numberOfColumns, level, nodesGroup, parentLeft, guid) {
            var buttonTemplate = kendo.template(BUTTON_TEMPLATE),
                groupTemplate = kendo.template(GROUP_TEMPLATE),
                vLine = $("<div>").addClass(ORGCHART_STYLES.line + SPACE + ORGCHART_STYLES.lineVertical),
                hLine = $("<div>").addClass(ORGCHART_STYLES.line + SPACE + ORGCHART_STYLES.lineHorizontal),
                messages = this.options.messages,
                vertical = true,
                offsetDirection = kendo.support.isRtl(this.element) ? "right" : "left",
                innerGroup, button, left, top, width, nodesGroupWidth, spacing;

            if(item.hasChildren) {
                vertical = false;
                nodesGroup.append(vLine.clone());
                button = $(buttonTemplate({ buttonSign: item.expanded ? MINUS : PLUS, label: item.expanded ? messages.collapse : messages.expand }));

                nodesGroup.append(button);

                this._calculateDimensions();

                nodesGroupWidth =  this._itemWidth;
                spacing = this._spacing;

                if(item.expanded) {
                    width = nodesGroupWidth * numberOfColumns + (numberOfColumns - 1) * spacing;
                    left = (index * numberOfColumns * nodesGroupWidth) + parentLeft;
                    top = level * (this._itemHeight + this._buttonHeight + spacing) + spacing * (level - 1) - this._buttonHeight / 2;

                    if(index > 0) {
                        left += (index * numberOfColumns * spacing);
                    }

                    innerGroup = $(groupTemplate({
                        guid: guid,
                        level: level + 1
                    }));

                    innerGroup.css({
                        width: width + PX,
                        top: top + PX
                    });

                    innerGroup.css(offsetDirection, left + PX);

                    this.element.append(innerGroup);
                    this._renderGroup(innerGroup, item.children, level + 1, numberOfColumns, left);
                }
            }

            if(!!innerGroup && item.expanded && !!item.children && item.children.length > 1) {
                button.after(hLine.clone().css({
                    width: (numberOfColumns - numberOfColumns / item.children.length) * (nodesGroupWidth + spacing) + PX,
                    "margin-top": this._buttonHeight / -2 + PX
                }));
            }

            return vertical;
        },

        _renderGroup: function(group, items, level, parentColumns, parentLeft) {
            var vertical = true,
                numberOfColumns = parentColumns / items.length,
                nodeContainer, nodesGroup, i, guid, currentVertical, item;

            for(i = 0; i < items.length; i++) {
                guid = kendo.guid();
                item = items[i];
                nodeContainer = this._renderNodesContainer(group, extend(true, {}, item, {
                    guid: guid,
                    level: level
                }));
                nodesGroup = nodeContainer.closest(DOT + ORGCHART_STYLES.nodesGroup);

                this._renderItems(nodeContainer, item.items, level, guid);
                currentVertical = this._renderChildren(item, i, numberOfColumns, level, nodesGroup, parentLeft, guid);

                if(vertical) {
                    vertical = currentVertical;
                }
            }

            var width = this._itemWidth * numberOfColumns + (numberOfColumns - 1) * this._spacing;
            group.find(DOT + ORGCHART_STYLES.nodesGroup).width(width);

            this._orientation(group, level, vertical);
        },

        _renderItems: function(nodeContainer, items, level, guid) {
            var cardWrapperTemplate = kendo.template(GROUPED_CARD_WRAPPER),
                i, item, node, contentTemplate;

            if(!this.options.template) {
                contentTemplate = kendo.template(CARD_TEMPLATE);
            } else if (typeof this.options.template === "function") {
                contentTemplate = this.options.template;
            } else {
                contentTemplate = kendo.template(this.options.template);
            }

            for(i = 0; i < items.length; i++) {
                item = items[i];
                node = this._renderNode(cardWrapperTemplate, contentTemplate, item, level, guid);
                nodeContainer.append(node);
            }
        },

        _renderNodesContainer: function(group, data) {
            var nodeGroupContainerTemplate = kendo.template(NODE_GROUP_CONTAINER),
                nodeGroup = $('<div class="k-orgchart-node-group k-align-items-center k-vstack">'),
                nodeContainer = $(NODE_CONTAINER_GROUPED),
                nodeGroupContainer = $(nodeGroupContainerTemplate(data)),
                groupHeaderTemplate;

                if (typeof this.options.groupHeaderTemplate === "function") {
                    groupHeaderTemplate = this.options.groupHeaderTemplate;
                } else {
                    groupHeaderTemplate = kendo.template(this.options.groupHeaderTemplate);
                }

            nodeGroupContainer.append(groupHeaderTemplate({
                value: data.value,
                field: data.field
            }));
            nodeGroupContainer.append(nodeContainer);

            nodeGroup.append(nodeGroupContainer);
            group.append(nodeGroup);

            return nodeContainer;
        }
    });

    kendo.orgChart = {
        View: View,
        SingleView: SingleView,
        GroupedView: GroupedView
    };
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('kendo.orgchart',[ "./orgchart/data", "./orgchart/view", "./kendo.menu", "./kendo.dialog", "./kendo.form", "./kendo.upload", "./kendo.window" ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "orgchart",
    name: "OrgChart",
    category: "web",
    description: "The OrgChart widget displays hierarchical organizational structure.",
    depends: [ "core", "menu", "dialog", "form", "upload", "window" ]
};

(function ($, undefined) {
    var kendo = window.kendo,
        DataBoundWidget = kendo.ui.DataBoundWidget,
        OrgChartDataSource = kendo.data.OrgChartDataSource,
        ContextMenu = kendo.ui.ContextMenu,

        extend = $.extend,
        isArray = Array.isArray,

        NS = ".kendoOrgChart",

        CANCEL = "cancel",
        CHANGE = "change",
        CLICK = "click",
        COLLAPSE = "collapse",
        CREATE = "create",
        DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        DELETE = "delete",
        DESTROY = "destroy",
        EDIT = "edit",
        ERROR = "error",
        EXPAND = "expand",
        FOCUS = "focus",
        KENDOKEYDOWN = "kendoKeydown",
        MENU = "menu",
        PROGRESS = "progress",
        SAVE = "save",
        SELECT = "select",
        REQUEST_START = "requestStart",

        DOT = ".",
        SPACE = " ",
        COMMA = ",",
        ID = "id",
        UID = "uid",
        ACTION = "action";

    var ORGCHART_STYLES = {
        wrapper: "k-orgchart",
        container: "k-orgchart-container",
        line: "k-orgchart-line",
        lineVertical: "k-orgchart-line-v",
        lineHorizontal: "k-orgchart-line-h",
        lineVerticalTop: "k-orgchart-line-v-top",
        group: "k-orgchart-group",
        groupVertical: "k-orgchart-group-v",
        groupHorizontal: "k-orgchart-group-h",
        nodesGroup: "k-orgchart-node-group",
        nodesGroupContainer: "k-orgchart-node-group-container",
        nodeContainer: "k-orgchart-node-container",
        node: "k-orgchart-node",
        card: "k-orgchart-card",
        cardMenu: "k-orgchart-card-menu",
        button: "k-orgchart-button",
        focused: "k-state-focus",
        plusIcon: "k-i-plus",
        menuItem: "k-item",
        avatarPreview: "k-orgchart-avatar-preview",
        update: "k-orgchart-update",
        cancel: "k-orgchart-cancel",
        vstack: "k-vstack",
        hstack: "k-hstack",
        closeButton: "k-i-close"
    };

    var MENU_ITEMS = {
        edit: "<li data-action='edit'>#: edit #</li>",
        create: "<li data-action='create'>#: create #</li>",
        destroy: "<li data-action='destroy'>#: destroy #</li>"
    };

    var GROUP_HEADER_TEMPLATE = '<div>' +
        '<div class="k-orgchart-node-group-title">#: value #</div>' +
        '<div class="k-orgchart-node-group-subtitle">#: field #</div>' +
    '</div>';

    var AVATAR_PREVIEW_TEMPLATE = '<div class="k-orgchart-avatar-preview k-hstack k-align-items-center k-pb-lg">' +
        '<div class="k-avatar k-avatar-solid-primary k-avatar-solid k-avatar-lg k-rounded-full">' +
            '<span class="k-avatar-image">' +
                '<img src="#: avatar #" alt="#: name #">' +
            '</span>' +
        '</div>' +
        '<div class="k-px-md">#: fileName #</div>' +
        '<button class="k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button" aria-label="#: destroy #">' +
            '<span class="k-button-icon k-icon k-i-delete"></span>' +
        '</button>' +
    '</div>';

    var EDITOR_BUTTONS_TEMPLATE = '<div class="k-edit-buttons">' +
        '<button type="button" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-orgchart-cancel">' +
            '<span class="k-button-text">#: cancel #</span>' +
        '</button>' +
        '<button type="button" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary k-orgchart-update">' +
            '<span class="k-button-text">#: save #</span>' +
        '</button>' +
    '</div>';

    var OrgChart = DataBoundWidget.extend({
        init: function(element, options, events) {
            if (isArray(options)) {
                options = { dataSource: options };
            }

            options = options || {};

            DataBoundWidget.fn.init.call(this, element, options);

            if (events) {
                this._events = events;
            }

            this._wrapper();
            this._view();
            this._dataSource();
            this._contextMenu();

            if (this.options.autoBind) {
                this.dataSource.fetch();
            }

            kendo.notify(this);
        },

        options: {
            name: "OrgChart",
            autoBind: true,
            cardsColors: null,
            dataSource: {},
            editable: {
                create: true,
                destroy: true,
                fields: true,
                form: {
                    buttonsTemplate: "",
                    orientation: "vertical"
                },
                parent: true
            },
            groupField: null,
            groupHeaderTemplate: GROUP_HEADER_TEMPLATE,
            template: null,
            messages: {
                label: "Org Chart",
                edit: "Edit",
                create: "Create",
                destroy: "Delete",
                destroyContent: "Are you sure you want to delete this item and all its children?",
                destroyTitle: "Delete item",
                cancel: "Cancel",
                save: "Save",
                menuLabel: "Edit menu",
                uploadAvatar: "Upload new avatar",
                parent: "Parent",
                name: "Name",
                title: "Title",
                none: "--None--",
                expand: "expand",
                collapse: "collapse"
            }
        },

        events: [
            CANCEL,
            CHANGE,
            COLLAPSE,
            CREATE,
            DATABINDING,
            DATABOUND,
            DELETE,
            EDIT,
            EXPAND,
            KENDOKEYDOWN,
            SAVE,
            SELECT
         ],

        destroy: function() {
            if(this._menu) {
                this._menu.destroy();
            }
            if(this._editWindow) {
                this._editWindow.destroy();
            }
            if(this._confirmDestroy) {
                this._confirmDestroy.destroy();
            }

            this.view.destroy();

            DataBoundWidget.fn.destroy.call(this);
            this.wrapper.off(NS);
        },

        setDataSource: function(dataSource) {
            this.options.dataSource = dataSource;
            this._dataSource();

            if (this.options.autoBind) {
                dataSource.fetch();
            }
        },

        setOptions: function(options) {
            var that = this;

            DataBoundWidget.fn.setOptions.call(that, options);
        },

        append: function(item, parent) {
            var that = this,
                $parent = that.view.jqueryItemElement(parent),
                parentItem = that.dataItem($parent);

            if(!$parent || !parentItem) {
                return;
            }

            if(!parentItem.loaded()) {
                that.dataSource.read({ id: parentItem.id })
                    .then(function() {
                        that.dataSource.add(extend({}, item, { parentId: parentItem.id }));
                        that.dataSource.sync();
                    });
            } else {
                that.dataSource.add(extend({}, item, { parentId: parentItem.id }));
                that.dataSource.sync();
            }
        },

        cancelChanges: function() {
            if(this.dataSource.hasChanges()) {
                this.dataSource.cancelChanges();
            }
        },

        collapse: function(item) {
            return this.view.collapse(item);
        },

        dataItem: function(item) {
            var $item = this.view.jqueryItemElement(item);

            if(!$item || !$item.data(UID)) {
                return;
            }

            return this.dataSource.getByUid($item.data(UID));
        },

        delete: function(item) {
            var $item = this.view.jqueryItemElement(item);

            if(!$item) {
                return;
            }

            this.dataSource.remove(this.dataItem($item));
            this.dataSource.sync();
        },

        edit: function(item) {
            var $item = this.view.jqueryItemElement(item),
                dataItem = this.dataItem($item);

            if(!$item || !dataItem) {
                return;
            }

            this._edit(dataItem);
        },

        expand: function(item) {
            return this.view.expand(item);
        },

        getCollapsedNodes: function() {
            return this.wrapper.find("[aria-expanded='false']");
        },

        items: function() {
            return this.wrapper.find(DOT + ORGCHART_STYLES.card);
        },

        parent: function(item) {
            var $item = this.view.jqueryItemElement(item),
                id;

            if(!$item) {
                return;
            }

            id = $item.closest(DOT + ORGCHART_STYLES.group).attr(ID);

            return this.wrapper.find("[aria-owns='" + id + "']");
        },

        saveChanges: function() {
            this.dataSource.sync();
        },

        select: function(item) {
            var $item = this.view._getToSelect(item);

            if(!$item) {
                return;
            } else {
                return this.view.select($item);
            }
        },

        _avatarPreview: function(item, fileName) {
            var form = this._form,
                avatar = item.avatar,
                avatarRemove = function() {
                    formWrapper.find(DOT + ORGCHART_STYLES.avatarPreview).remove();
                    item.set("avatar", null);
                },
                formWrapper, data;

            if(!form) {
                return;
            }

            if (!fileName) {
                fileName = avatar.split('\\').pop().split('/').pop();

                if (!fileName || fileName.indexOf('.') == -1) {
                    fileName = item.name;
                }
            }

            data = {
                name: item.name,
                avatar: avatar,
                fileName: fileName,
                destroy: this.options.messages.destroy
            };

            formWrapper = form.wrapper;
            formWrapper.find(DOT + ORGCHART_STYLES.avatarPreview).remove();

            formWrapper.find('[type="file"]').closest(DOT + "k-form-field").prepend(kendo.template(AVATAR_PREVIEW_TEMPLATE)(data));
            formWrapper.find(DOT + ORGCHART_STYLES.avatarPreview + SPACE + DOT + "k-button").on(CLICK, avatarRemove);
        },

        _contextMenu: function() {
            var options = this.options,
                editable = options.editable,
                messages = options.messages,
                menuOptions = {
                    target: this.wrapper,
                    filter: DOT + ORGCHART_STYLES.cardMenu,
                    select: this._onMenuItemClick.bind(this),
                    activate: this._onMenuOpen.bind(this),
                    deactivate: this._onMenuClose.bind(this),
                    showOn: "click",
                    animation: false
                },
                menuElement;

            if(editable === true ||
                (editable !== false &&
                    (editable.create || editable.destroy || editable.fields || editable.parent))) {
                        menuElement = "<ul>";

                        if(editable === true) {
                            menuElement += MENU_ITEMS.edit;
                            menuElement += MENU_ITEMS.create;
                            menuElement += MENU_ITEMS.destroy;
                        } else {
                            if (editable.fields || editable.parent) {
                                menuElement += MENU_ITEMS.edit;
                            }
                            if (editable.create) {
                                menuElement += MENU_ITEMS.create;
                            }
                            if (editable.destroy) {
                                menuElement += MENU_ITEMS.destroy;
                            }
                        }

                        menuElement = kendo.template(menuElement)(messages);

                        this._menu = new ContextMenu(menuElement, menuOptions);
                    }
        },

        _dataSource: function() {
            var ds = this.dataSource,
                dsOptions = this.options.dataSource;

            if (ds) {
                ds.unbind(CHANGE, this._dataSourceChangeHandler);
                ds.unbind(ERROR, this._errorHandler);
                ds.unbind(PROGRESS, this._progressHandler);
                ds.unbind(REQUEST_START, this._requestStartHandler);
            }

            this._dataSourceChangeHandler = this._onDataSourceChange.bind(this);
            this._errorHandler = this._onDataSourceError.bind(this);
            this._progressHandler = this._progress.bind(this);
            this._requestStartHandler = this._onDataSourceRequestStart.bind(this);

            ds = this.dataSource = OrgChartDataSource.create(dsOptions);

            ds.bind(CHANGE, this._dataSourceChangeHandler);
            ds.bind(ERROR, this._errorHandler);
            ds.bind(PROGRESS, this._progressHandler);
            ds.bind(REQUEST_START, this._requestStartHandler);

            this.view.dataSource = ds;
        },

        _destroyItem: function(item) {
            var that = this,
                el = $("<div></div>"),
                messages = that.options.messages,
                restoreFocus = function() {
                    that.wrapper
                        .find(DOT + ORGCHART_STYLES.card + "[tabindex=0]" + COMMA + DOT + ORGCHART_STYLES.nodesGroup + "[tabindex=0]")
                        .addClass(ORGCHART_STYLES.focused)
                        .trigger("focus");
                },
                confirm = this._confirmDestroy = new kendo.ui.Confirm(el, {
                    title: messages.destroyTitle,
                    content: messages.destroyContent,
                    messages:{
                      okText: messages.destroy,
                      cancel: messages.cancel
                    },
                    show: function() {
                        setTimeout(function() {
                            confirm.element.trigger("focus");
                        });
                    }
                });

            confirm.open();

            confirm.result.done(function() {
                if(!that.trigger(DELETE, { dataItem: item })) {
                    that.dataSource.remove(item);
                    that.dataSource.sync();
                }

                that.view._shouldRestoreSelection = true;
                that.view._restoreSelection();
            });

            confirm.result.fail(restoreFocus);
        },

        _edit: function(dataItem) {
            var that = this,
                formElement = $("<div>"),
                windowElement = $("<div>"),
                messages = this.options.messages,
                formOptions = this._formOptions(dataItem),
                save;

            if(!formOptions) {
                return;
            }

            that._form = new kendo.ui.Form(formElement, formOptions);

            if(!!dataItem.avatar) {
                that._avatarPreview(dataItem);
            }

            windowElement.append(formElement);

            that._editWindow = new kendo.ui.Window(windowElement, {
                title: messages.edit,
                width: "380 px",
                modal: true,
                close: function(e) {
                    if(!save) {
                        if(!that.trigger(CANCEL, { dataItem: dataItem })) {
                            that.cancelChanges();
                        } else {
                            e.preventDefault();
                        }
                    } else {
                        save = false;
                    }
                },
                deactivate: function() {
                    windowElement.off(CLICK);
                    that._editWindow.destroy();
                    that._editWindow = null;
                    that.view._restoreSelection();
                }
            });

            windowElement.append(kendo.template(EDITOR_BUTTONS_TEMPLATE)({
                save: messages.save,
                cancel: messages.cancel
            }));

            that._editWindow.center().open();

            windowElement.on(CLICK, DOT + ORGCHART_STYLES.update, function() {
                if(that._form.validate()) {
                    save = true;

                    if(!that.trigger(SAVE, { dataItem: dataItem })) {
                        that._editWindow.close();
                        that.saveChanges();
                    }
                }
            });

            windowElement.on(CLICK, DOT + ORGCHART_STYLES.cancel, function() {
                that._editWindow.close();
            });
        },

        _formOptions: function(item) {
            var options = this.options,
                messages = options.messages,
                optionsForm = options.editable.form,
                items = [],
                parentsDs, optionsItems;

            if(optionsForm) {
                optionsItems = optionsForm.items;
            }

            if((!optionsItems || optionsItems.length === 0) &&
                (options.editable === true || (options.editable && options.editable.parent))) {

                parentsDs = [{
                    id: null,
                    name: messages.none
                }].concat(this.dataSource.prospectParents(item));

                items.push({
                    field: "parentId",
                    editor: "DropDownList",
                    label: messages.parent,
                    editorOptions: {
                        dataSource: parentsDs,
                        dataValueField: "id",
                        dataTextField: "name",
                        valuePrimitive: true
                    }
                });
            }

            if((!optionsItems || optionsItems.length === 0) &&
                (options.editable === true || (options.editable && options.editable.fields))) {

                items = items.concat([{
                    field: "name",
                    label: messages.name,
                    validation: { required: true }
                }, {
                    field: "title",
                    label: messages.title
                }, {
                    field: "avatar",
                    label: messages.uploadAvatar,
                    editor: this._uploadEditor.bind(this, item)
                }]);
            }

            if(optionsForm) {
                delete optionsForm.formData;
            }

            if(items.length > 0 || (optionsItems && optionsItems.length > 0)) {
                return extend(true, {}, {
                    formData: item,
                    items: items
                }, optionsForm);
            } else {
                return false;
            }
        },

        _onDataSourceChange: function(e) {
            if(e.action === "add" || e.action === "itemchange" && this._editWindow) {
                return;
            }

            if (!e.action || e.action === "sync") {
                if (this.trigger(DATABINDING, e)) {
                    this._progress(false);
                    return;
                }
            }

            this._progress(true);
            this.view.refresh();

            if (!e.action || e.action === "sync") {
                this.trigger(DATABOUND);
            }

            this._progress(false);
        },

        _onDataSourceError: function() {
            this._progress(false);
        },

        _onDataSourceRequestStart: function() {
            this.view._cacheFocused();
        },

        _onMenuClose: function() {
            if($(document.activeElement).closest("[role='alertdialog']").length === 0) {
                this.wrapper.find("[tabindex='0']")
                    .addClass(ORGCHART_STYLES.focused)
                    .trigger("focus");
            }
        },

        _onMenuItemClick: function(e) {
            var that = this,
                targetItem = $(e.target).closest(DOT + ORGCHART_STYLES.node).find(DOT + ORGCHART_STYLES.card),
                dataItem = that.dataItem(targetItem),
                action = $(e.item).data(ACTION),
                newItem;

            if(!dataItem) {
                return;
            }

            if(action === EDIT) {
                if(!that.trigger(EDIT, { dataItem: dataItem })) {
                    that._edit(dataItem);
                }
            } else if(action === CREATE) {
                if(!that.trigger(CREATE, { dataItem: dataItem })) {
                    if(!dataItem.loaded()) {
                        that.dataSource.read({ id: dataItem.id })
                            .then(function() {
                                newItem = that.dataSource.add({
                                    parentId: dataItem.id
                                });

                                that._edit(newItem);
                            });
                    } else {
                        newItem = that.dataSource.add({
                            parentId: dataItem.id
                        });

                        that._edit(newItem);
                    }
                }
            } else if(action === DESTROY) {
                that._destroyItem(dataItem);
            }
        },

        _onMenuOpen: function() {
            this.view._cacheFocused();
            this.wrapper.find(DOT + ORGCHART_STYLES.focused).removeClass(ORGCHART_STYLES.focused);
            this._menu.element.find(DOT + ORGCHART_STYLES.menuItem).first().trigger(FOCUS);
        },

        _openMenu: function(focused) {
            if(this._menu) {
                this._menu.open(focused.find(DOT + ORGCHART_STYLES.cardMenu));
            }
        },

        _progress: function(toggle) {
            kendo.ui.progress(this.container, toggle);
        },

        _triggerCollapse: function(e) {
            if(this.trigger(COLLAPSE, { item: e.item, dataItems: e.dataItems })) {
                e.preventDefault();
            }
        },

        _triggerExpand: function(e) {
            if(this.trigger(EXPAND, { item: e.item, dataItems: e.dataItems })) {
                e.preventDefault();
            }
        },

        _triggerSelect: function(e) {
            if(!this.trigger(SELECT, { item: e.item, dataItems: e.dataItems })) {
                this.view.select(e.item);
                this.trigger(CHANGE, { item: e.item, dataItems: e.dataItems });
            }
        },

        _uploadEditor: function(item, container) {
            var that = this;

            $('<input type="file">')
                .appendTo(container)
                .kendoUpload({
                    async: false,
                    multiple: false,
                    select: function(e) {
                        var fileInfo = e.files[0];
                        var raw = fileInfo.rawFile;
                        var reader  = new FileReader();

                        if(fileInfo.validationErrors && fileInfo.validationErrors.length > 0) {
                            return;
                        }

                        if (raw) {
                            reader.onloadend = function () {
                                item.set("avatar", this.result);
                                that._avatarPreview(item, raw.name);
                            };

                          reader.readAsDataURL(raw);
                        }
                    },
                    validation: {
                        allowedExtensions: [".gif", ".jpg", ".png"],
                        maxFileSize: 1048576
                    }
                });
        },

        _view: function() {
            if(this.options.groupField !== null && this.options.groupField !== undefined) {
                this.view = new kendo.orgChart.GroupedView(this.container, this.options);
            } else {
                this.view = new kendo.orgChart.SingleView(this.container, this.options);
            }

            this.view.bind(SELECT, this._triggerSelect.bind(this));
            this.view.bind(EXPAND, this._triggerExpand.bind(this));
            this.view.bind(COLLAPSE, this._triggerCollapse.bind(this));
            this.view.bind(MENU, this._openMenu.bind(this));

        },

        _wrapper: function() {
            var container = $("<div class='k-orgchart-container'>");

            this.wrapper = this.element;
            this.container = container;

            this.wrapper.addClass(ORGCHART_STYLES.wrapper);
            this.wrapper.append(container);
        }
    });

    kendo.ui.plugin(OrgChart);

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

// add validation to upload images only in the edit pop-up;
