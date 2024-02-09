/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.pivotgrid.js";
import "./kendo.menu.js";
import "./kendo.window.js";
import "./kendo.treeview.js";
import "./kendo.dropdownlist.js";
import "./kendo.icons.js";
import "./kendo.expansionpanel.js";
import "./kendo.html.button.js";

var __meta__ = {
    id: "pivot.fieldmenu",
    name: "PivotFieldMenu",
    category: "web",
    description: "The PivotFieldMenu widget allows the user to filter on fields displayed in PivotGrid",
    depends: [ "menu", "window", "treeview", "treeview.draganddrop", "dropdownlist", "icons", 'expansionpanel', 'html.button' ],
    advanced: true
};


(function($, undefined) {
    var kendo = window.kendo;
    var ui = kendo.ui;
    var keys = kendo.keys;
    var encode = kendo.htmlEncode;
    var MENU = "kendoContextMenu";
    var NS = ".kendoPivotFieldMenu";
    var KEYBOARD_NS = ".kendoPivotFieldMenuKeyboard";
    var PIVOT_SETTING_TARGET_V2 = "kendoPivotSettingTargetV2";
    var Widget = ui.Widget;
    var DOT = ".";
    var CHIP_LIST = "k-chip-list";
    var ROW_FIELDS = "k-row-fields";
    var COLUMN_FIELDS = "k-column-fields";
    var FILTER_ITEM = "k-filter-item";
    var ARIA_LABEL = "aria-label",
    EXPANSIONPANEL = "kendoExpansionPanel";

    var PivotFieldMenuV2 = Widget.extend({
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);

            this._dataSource();

            this._layout();

            kendo.notify(this);
        },

        events: [],

        options: {
            name: "PivotFieldMenuV2",
            animation: {
                expand: {
                    effects: "expand:vertical",
                    duration: 200
                },
                collapse: {
                    duration: 200,
                    effects: "expand:vertical",
                    hide: true,
                    reverse: true
                }
            },
            filter: null,
            filterable: true,
            sortable: true,
            messages: {
                apply: "Apply",
                sortAscending: "Sort Ascending",
                sortDescending: "Sort Descending",
                filterFields: "Fields Filter",
                filter: "Filter",
                include: "Include Fields...",
                clear: "Clear",
                reset: "Reset",
                moveToColumns: "Move to Columns",
                moveToRows: "Move to Rows",
                movePrevious: "Move previous",
                moveNext: "Move next",
                filterOperatorsDropDownLabel: "Region Filter Operators",
                filterValueTextBoxLabel: "Region Filter Value",
                operators: {
                    contains: "Contains",
                    doesnotcontain: "Does not contain",
                    startswith: "Starts with",
                    endswith: "Ends with",
                    eq: "Is equal to",
                    neq: "Is not equal to"
                }
            }
        },

        destroy: function() {
            Widget.fn.destroy.call(this);

            if (this.menu) {
                this.menu.element.off(NS);
                this.menu.element.off(KEYBOARD_NS);
                this.menu.destroy();
                this.menu = null;
                this._applyProxy = this._resetIncludes = null;
            }

            if (this.wrapper) {
                this.wrapper.off(KEYBOARD_NS);
            }

            if (this.treeView) {
                this.treeView.destroy();
                this.treeView = null;
            }

            this.wrapper = null;
            this.element = null;
        },

        setDataSource: function(dataSource) {
            this.options.dataSource = dataSource;

            this._dataSource();
        },

        _createExpanders: function() {
            var that = this;
            var options = that.options;
            var expanderOptions = {
                expanded: false,
                headerClass: "k-columnmenu-item",
                wrapperClass: "k-item",
                useBareTemplate: true
            };

            that.wrapper.find(".k-columns-item")[EXPANSIONPANEL]($.extend(true, {}, expanderOptions,{
                title: kendo.ui.icon("grid-layout") + '<span>' + encode(options.messages.include) + '</span>'
            }));
            that.wrapper.find(".k-column-menu-filter")[EXPANSIONPANEL]($.extend(true, {}, expanderOptions,{
                title: kendo.ui.icon("filter") + '<span>' + encode(options.messages.filterFields) + '</span>'
            }));
        },

        _getSettingTargets: function() {
            this.columnsSettingTarget = this.element.parent().find(DOT + COLUMN_FIELDS).eq(0).data(PIVOT_SETTING_TARGET_V2);
            this.measuresSettingTarget = this.element.parent().find(DOT + COLUMN_FIELDS).eq(1).data(PIVOT_SETTING_TARGET_V2);
            this.rowsSettingTarget = this.element.parent().find(DOT + ROW_FIELDS).data(PIVOT_SETTING_TARGET_V2);
        },

        _createTreeView: function(element) {
            var that = this;

            that._includesCache = {};

            that.treeView = new ui.TreeView(element, {
                autoBind: false,
                dataSource: that._treeViewDataSource(),
                dataTextField: "caption",
                template: ({ item }) => `${encode(item.caption || item.name)}`,
                check: function(e) {
                    /* The result can be observed in the DevTools(F12) console of the browser. */
                    var dataItem = e.sender.dataItem(e.node);
                    if (that._includesCache[dataItem.uniqueName]) {
                        delete that._includesCache[dataItem.uniqueName];
                    } else {
                        that._includesCache[dataItem.uniqueName] = e.node;
                    }
                },
                checkboxes: {
                    checkChildren: true
                }
            });
        },

        _dataSource: function() {
            this.dataSource = kendo.data.PivotDataSourceV2.create(this.options.dataSource);
        },

        _layout: function() {
            var that = this;
            var options = that.options;

            that.wrapper = $(kendo.template(MENUTEMPLATEV2)({
                ns: kendo.ns,
                filterable: options.filterable,
                sortable: options.sortable,
                messages: options.messages,
                renderAll: options.setting !== "measures"
            }));

            kendo.applyStylesFromKendoAttributes(that.wrapper, ["overflow"]);
            that._createExpanders();

            that.wrapper.on("keydown" + KEYBOARD_NS, function(ev) {
                var key = ev.keyCode;
                var menu = that.menu;
                var focusableElementsSelector = ".k-columnmenu-item:visible,.k-treeview:visible,button.k-button:visible,.k-picker:visible,.k-input input.k-input-inner:visible";
                var allFocusable = that.menu.element.find(focusableElementsSelector);
                var isMenuCurrentlyFocused = kendo._activeElement() == that.menu.element[0];
                var currentlyFocused = $(kendo._activeElement()).parents(".k-pivotgrid-column-menu")[0] == that.menu.element[0] ? $(kendo._activeElement()).closest(focusableElementsSelector) : that.menu.element.find(".k-focus:not(.k-expander):not(.k-treeview-item)").last();
                var nextFocusable;

                if (key == keys.TAB) {
                    if (ev.shiftKey) {
                        nextFocusable = allFocusable.eq(currentlyFocused[0] ? (allFocusable.index(currentlyFocused) + allFocusable.length - 1) % allFocusable.length : 0);
                    } else {
                        nextFocusable = allFocusable.eq(currentlyFocused[0] ? (allFocusable.index(currentlyFocused) + 1) % allFocusable.length : 0);
                    }

                    menu.element.find(".k-focus").removeClass("k-focus");
                    if (nextFocusable.is(".k-item")) {
                        if (!isMenuCurrentlyFocused) {
                            menu.element.trigger("focus");
                        }

                        // fix for the incorrectly focused popup element instead of first item
                        // due to custom templates used
                        menu.element.find(".k-focus").removeClass("k-focus");
                        menu._moveHover(currentlyFocused, nextFocusable);
                    } else {
                        nextFocusable.trigger("focus");
                    }

                    ev.preventDefault();
                    ev.stopImmediatePropagation();
                } else if (key == keys.ENTER) {
                    currentlyFocused.trigger("click");
                    ev.preventDefault();
                    ev.stopImmediatePropagation();
                }
            });

            that.menu = that.wrapper[MENU]({
                filter: options.filter,
                target: that.element,
                orientation: "vertical",
                showOn: "click",
                closeOnClick: false,
                open: this._menuOpen.bind(this),
                close: this._closeMenu.bind(this),
                activate: this._activateMenu.bind(this),
                deactivate: this._deactivateMenu.bind(this),
                copyAnchorStyles: false
            }).data(MENU);

            that.menu.element.off("blur.kendoMenu", "[tabindex]", that.menu._checkActiveProxy);
            // fix to focus the first item instead of the popup element
            that.menu.element.on("focus" + KEYBOARD_NS, function(ev) {
                var focusedElement = $(`#${that.menu._ariaId}`);
                if (focusedElement.is(".k-pivotgrid-column-menu-popup")) {
                    if (that.menu.element.find(".k-columnmenu-item:visible").length) {
                        var firstItem = that.menu.element.find(".k-columnmenu-item:visible").first();
                        that.menu._moveHover(focusedElement, firstItem);
                    }
                }
            });

            if (options.filterable) {
                that._initFilterForm();
                that._attachFilterHandlers();
                that._createTreeView(that.wrapper.find(".k-treeview"));
            }

            that._clickHandler = that._click.bind(that);
            that.wrapper.on("click", ".k-item:not([role='treeitem'])", that._clickHandler);
        },

        _activateMenu: function(e) {
            var that = this;
            if (that.menu.element.find(".k-columnmenu-item:visible").length) {
                var firstItem = that.menu.element.find(".k-columnmenu-item:visible").first();
                that.menu._moveHover([], firstItem);
            }
        },

        _deactivateMenu: function(e) {
            var that = this,
                chip = that.menu.target.find("[tabindex=0]"),
                configuratorElement = that.element.parent();

            if (!chip.length) {
                chip = configuratorElement.find(`.k-chip:contains("${that.currentMember}")`);
                chip.attr("tabindex", 0);
            }

            // focus the chip instead of the chiplist
            chip.trigger("focus");
        },

        _closeMenu: function(e) {
            var that = this;
            var activeElement = $(kendo._activeElement());

            if (!that.options.filterable) {
                return;
            }

            if (activeElement[0] === this._filterOperator.wrapper[0] || activeElement.closest(".k-treeview")[0] === that.treeView.wrapper[0] ||
                activeElement.hasClass("k-button-includes-reset")) {
                e.preventDefault();
            }
        },

        _treeViewDataSource: function() {
            var that = this;

            return kendo.data.HierarchicalDataSource.create({
                schema: {
                    model: {
                        id: "uniqueName",
                        hasChildren: function(item) {
                            return parseInt(item.childrenCardinality, 10) > 0;
                        }
                    }
                },
                transport: {
                    read: function(options) {
                        var node = that.treeView.dataSource.get(options.data.uniqueName);
                        var name = options.data.uniqueName;
                        var nodes = [];
                        var filter;
                        var skipCheck;
                        var catalog;
                        var cube;
                        var restrictions;
                        var fetchOptions;

                        if (that.dataSource.cubeSchema) {
                            if (!name) {
                                nodes = that.dataSource.cubeSchema.members(that.currentMember + ".[(ALL)]");
                            } else {
                                nodes = that.dataSource.cubeSchema.members(that.currentMember);
                            }

                            filter = that.dataSource.filter();
                            skipCheck = that._getFilterStorage(that.currentMember) && findFilters({ filter: filter, member: that.currentMember }).length == 1;

                            if (skipCheck && !name) {
                                nodes[0].checked = true;
                            } else {
                                checkNodesLocal(that.dataSource.filter(), that.currentMember, nodes);
                            }
                            options.success(nodes);
                        } else {
                            catalog = that.dataSource.transport.catalog();
                            cube = that.dataSource.transport.cube();
                            restrictions = {
                                catalogName: catalog,
                                cubeName: cube
                            };
                            fetchOptions = {
                                command: 'schemaMembers'
                            };

                            if (!name) {
                                restrictions.levelUniqueName = that.currentMember + ".[(ALL)]";
                            } else {
                                restrictions.memberUniqueName = node.uniqueName.replace(/\&/g, "&amp;");
                                restrictions.treeOp = 1;
                            }

                            fetchOptions.connection = {
                                catalog: catalog,
                                cube: cube
                            };

                            fetchOptions.restrictions = restrictions;
                            that.dataSource.discover(fetchOptions).then(
                                function(data) {
                                    if (!node || node.checked) {
                                        checkNodes(that.dataSource.filter(), that.currentMember, data);
                                    }

                                    options.success(data);
                                });
                        }
                    }
                }
            });
        },

        _storeFilterForm: function(member) {
            var that = this;

            if (!that._filterStorage) {
                that._filterStorage = {};
            }

            that._filterStorage[member] = {
                value: that._filterValue.val(),
                operator: that._filterOperator.value()
            };
        },

        _getFilterStorage: function(member) {
            if (!this._filterStorage || !this._filterStorage[member]) {
                return null;
            }
            return this._filterStorage[member];
        },

        _clearFilterStorage: function(member) {
            this._filterStorage[member] = null;
        },

        _click: function(e) {
            var item = $(e.currentTarget).closest(":not(path,svg)");

            if (item.hasClass("k-columnmenu-item") && item.find(".k-i-sort-asc-small,.k-svg-i-sort-asc-small").length) {
                this._sort("asc");
            }

            if (item.hasClass("k-columnmenu-item") && item.find(".k-i-sort-desc-small,.k-svg-i-sort-desc-small").length) {
                this._sort("desc");
            }

            if (item.hasClass("k-columnmenu-item") && item.find(".k-i-columns,.k-svg-i-columns").length) {
                this._move("columns");
            }

            if (item.hasClass("k-columnmenu-item") && item.find(".k-i-rows,.k-svg-i-rows").length) {
                this._move("rows");
            }

            if (item.hasClass("k-columnmenu-item") && item.find(".k-i-arrow-left,.k-svg-i-arrow-left").length) {
                this._move("previous");
            }

            if (item.hasClass("k-columnmenu-item") && item.find(".k-i-arrow-right,.k-svg-i-arrow-right").length) {
                this._move("next");
            }
        },

        _attachFilterHandlers: function() {
            this._applyIncludesProxy = this._applyIncludes.bind(this);
            this._resetIncludesProxy = this._resetIncludes.bind(this);

            this.menu.element
                .on("click" + NS, ".k-button-includes-reset", this._resetIncludesProxy)
                .on("click" + NS, ".k-button-includes-apply", this._applyIncludesProxy);
        },

        _includesHandler: function(e) {
            e.preventDefault();
            if ($(e.target).closest(":not(path,svg)").hasClass("k-button-includes-reset")) {
                this._resetIncludes();
            } else {
                this._applyIncludes();
            }
        },

        _applyIncludes: function(e) {
            e.preventDefault();
            var view = this.treeView.dataSource.view();
            var filter = this.dataSource.filter();
            var newExpression;
            if (this.dataSource.cubeSchema) {
                newExpression = includeLocalExpression(view, filter, this.currentMember);
            } else {
                newExpression = includeExpression(view, filter, this.currentMember);
            }
             this._includesCache = {};

            if (newExpression) {
                this.dataSource._preventRefresh = true;
                this.dataSource.filter(newExpression);
                this.menu.close();
            }
        },

        _resetIncludes: function(e) {
            e.preventDefault();

            var that = this;
            var checkbox;

            for (var item in that._includesCache) {
                checkbox = $(that._includesCache[item]).find(".k-checkbox");
                checkbox.prop("checked", !checkbox.prop("checked"));
                that.treeView._checkboxChange({ target: checkbox });
                delete that._includesCache[item];
            }
        },

        _initFilterForm: function() {
            var filterForm = this.menu.element.find(".kendo-grid-filter-menu-container");
            var filterProxy = this._filter.bind(this);

            this._filterOperator = new kendo.ui.DropDownList(filterForm.find("select"), { popup: { appendTo: document.body } });
            this._filterValue = filterForm.find("input.k-input-inner");
            this._filterForm = filterForm;
            this._updateFilterAriaLabel();

            filterForm
                .on("click" + NS, ".k-button-filter", filterProxy)
                .on("click" + NS, ".k-button-filter-clear", this._reset.bind(this));
        },

        _updateFilterAriaLabel: function() {
            var selectedOperator = this._filterOperator.value();
            var selectedOperatorName = this.options.messages.operators[selectedOperator];

            this._filterForm.find("select").attr(ARIA_LABEL, selectedOperatorName);
        },

        _filter: function(e) {
            var that = this;
            var value = convert(that._filterValue.val(), that.dataSource, that.currentMember);
            var filter = that.dataSource.filter();

            e.preventDefault();

            if (value === "") {
                that.menu.close();
                return;
            }

            var expression = {
                field: that.currentMember,
                operator: that._filterOperator.value(),
                value: value
            };
            if (filter) {
                removeFilterByValue(filter, that._getFilterStorage(that.currentMember));
            } else {
                filter = { logic: 'and', filters: [] };
            }

            that._storeFilterForm(that.currentMember);
            filter.filters.push(expression);

            that.dataSource._preventRefresh = true;
            that.dataSource.filter(filter);
            that.menu.close();
        },

        _reset: function(e) {
            var that = this;
            var filter = that.dataSource.filter();
            removeFilters(filter, that.currentMember);

            e.preventDefault();

            if (!filter.filters[0]) {
                filter = {};
            }

            that.dataSource._preventRefresh = true;
            that.dataSource.filter(filter);
            that._clearFilterStorage(that.currentMember);
            that._setFilterForm(null);
            that.menu.close();
        },

        _setFilterForm: function(expression) {
            var filterOperator = this._filterOperator;
            var operator = "";
            var value = "";

            if (expression) {
                operator = expression.operator;
                value = expression.value;
            }

            filterOperator.value(operator);
            if (!filterOperator.value()) {
                filterOperator.select(0);
            }

            this._filterValue.val(value);
        },

        _collapseItems: function(items) {
            items.find(".k-expander-indicator span").each((ind,el) => kendo.ui.icon($(el), { icon: "chevron-up" }));

            items.nextAll().hide();
        },

        _sort: function(dir) {
            var field = this.currentMember;
            var expressions = (this.dataSource.sort() || []);

            expressions = removeExpr(expressions, field);
            expressions.push({
                field: field,
                dir: dir
            });

            this.dataSource._preventRefresh = true;
            this.dataSource.sort(expressions);
            this.menu.close();
        },

        _move: function(action) {
            var that = this,
                index = that.currentMemberIndex;

            switch (action) {
                case "columns":
                    that._moveToColumns();
                    break;
                case "rows":
                    that._moveToRows();
                    break;
                case "previous":
                    that._changeOrder(--index);
                    break;
                case "next":
                    that._changeOrder(++index);
                    break;
            }

            that.menu.close();
        },

        _updateDisabledState: function() {
            var that = this,
                menu = that.menu.element,
                target = that.currentSettingTarget.element,
                targetLabel = target.prev().text();

            menu.find(".k-columnmenu-item.k-disabled").removeClass("k-disabled");

            if (that.currentMemberIndex === 0) {
                menu.find('[data-move="previous"]').closest(".k-columnmenu-item").addClass("k-disabled");
            }

            if (that.currentMemberIndex === target.children().length - 1) {
                menu.find('[data-move="next"]').closest(".k-columnmenu-item").addClass("k-disabled");
            }

            if (targetLabel === "Columns") {
                menu.find('[data-move="columns"]').closest(".k-columnmenu-item").addClass("k-disabled");
            }

            if (targetLabel === "Rows") {
                menu.find('[data-move="rows"]').closest(".k-columnmenu-item").addClass("k-disabled");
            }
        },

        _moveToColumns: function() {
            var that = this,
                currentMember = that.currentMember;

            that.rowsSettingTarget.remove(currentMember);
            that.columnsSettingTarget.add(currentMember);
        },

        _moveToRows: function() {
            var that = this,
                currentMember = that.currentMember;

            that.columnsSettingTarget.remove(currentMember);
            that.rowsSettingTarget.add(currentMember);
        },

        _changeOrder: function(index) {
            var that = this,
                currentMember = that.currentMember;

            this.currentSettingTarget.move(currentMember, index);
        },

        _menuOpen: function(e) {
            if (!e.event) {
                return;
            }

            var that = this;
            var schemaCube = that.dataSource.cubeSchema;
            var filterBox;
            var member = $(e.event.target).closest(".k-chip");
            that.currentMember = member.text();
            that.currentMemberIndex = member.index();
            that.currentSettingTarget = member.closest(DOT + CHIP_LIST).data(PIVOT_SETTING_TARGET_V2);
            that.menu.popup._hovered = true;

            that._getSettingTargets();
            that._updateDisabledState();

            if (that.options.filterable) {
                that._setFilterForm(that._getFilterStorage(that.currentMember));
                filterBox = that.wrapper.find(".k-columnmenu-item-wrapper").last();
                if (schemaCube && schemaCube.memberType(that.currentMember).toLowerCase() !== "string") {
                    filterBox.hide();
                } else {
                    filterBox.show();
                }
                if (that.currentMember !== that._oldCurrentmember) {
                    if (that._oldCurrentmember) {
                        that._collapseItems(that.menu.element.find(".k-item.k-expander"));
                    }
                    that._oldCurrentmember = that.currentMember;
                    that._includesCache = {};
                    this.treeView.dataSource.read();
                }
            }
        },
    });

    var PivotFieldMenu = Widget.extend({
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);

            this._dataSource();

            this._layout();

            kendo.notify(this);
        },

        events: [],

        options: {
            name: "PivotFieldMenu",
            filter: null,
            filterable: true,
            sortable: true,
            messages: {
                info: "Show items with value that:",
                sortAscending: "Sort Ascending",
                sortDescending: "Sort Descending",
                filterFields: "Fields Filter",
                filter: "Filter",
                include: "Include Fields...",
                title: "Fields to include",
                clear: "Clear",
                ok: "OK",
                cancel: "Cancel",
                operators: {
                    contains: "Contains",
                    doesnotcontain: "Does not contain",
                    startswith: "Starts with",
                    endswith: "Ends with",
                    eq: "Is equal to",
                    neq: "Is not equal to"
                }
            }
        },

        _layout: function() {
            var options = this.options;

            this.wrapper = $(kendo.template(MENUTEMPLATE)({
                ns: kendo.ns,
                filterable: options.filterable,
                sortable: options.sortable,
                messages: options.messages
            }));

            this.menu = this.wrapper[MENU]({
                filter: options.filter,
                target: this.element,
                orientation: "vertical",
                showOn: "click",
                closeOnClick: false,
                open: this._menuOpen.bind(this),
                select: this._select.bind(this),
                copyAnchorStyles: false
            }).data(MENU);

            this._createWindow();

            if (options.filterable) {
                this._initFilterForm();
            }
        },

        _initFilterForm: function() {
            var filterForm = this.menu.element.find("." + FILTER_ITEM);
            var filterProxy = this._filter.bind(this);

            this._filterOperator = new kendo.ui.DropDownList(filterForm.find("select"));
            this._filterValue = filterForm.find("input.k-input-inner");
            this._updateFilterAriaLabel();

            filterForm
                .on("submit" + NS, filterProxy)
                .on("click" + NS, ".k-button-filter", filterProxy)
                .on("click" + NS, ".k-button-clear", this._reset.bind(this));
        },

        _setFilterForm: function(expression) {
            var filterOperator = this._filterOperator;
            var operator = "";
            var value = "";

            if (expression) {
                operator = expression.operator;
                value = expression.value;
            }

            filterOperator.value(operator);
            if (!filterOperator.value()) {
                filterOperator.select(0);
            }

            this._filterValue.val(value);
        },

        _clearFilters: function(member) {
            var filter = this.dataSource.filter() || {};
            var expressions;
            var idx = 0;
            var length;

            filter.filters = filter.filters || [];
            expressions = findFilters({ filter: filter, member: member });

            for (length = expressions.length; idx < length; idx++) {
                filter.filters.splice(filter.filters.indexOf(expressions[idx]), 1);
            }

            return filter;
        },

        _filter: function(e) {
            var that = this;
            var value = convert(that._filterValue.val(), that.dataSource, that.currentMember);

            e.preventDefault();

            if (value === "") {
                that.menu.close();
                return;
            }

            var expression = {
                field: that.currentMember,
                operator: that._filterOperator.value(),
                value: value
            };
            var filter = that._clearFilters(that.currentMember);

            filter.filters.push(expression);

            that.dataSource.filter(filter);
            that.menu.close();
        },

        _updateFilterAriaLabel: function() {
            var filterForm = this.menu.element.find("." + FILTER_ITEM);
            var selectedOperator = this._filterOperator.value();
            var selectedOperatorName = this.options.messages.operators[selectedOperator];

            filterForm.find("select").attr(ARIA_LABEL, selectedOperatorName);
        },

        _reset: function(e) {
            var that = this;
            var filter = that._clearFilters(that.currentMember);

            e.preventDefault();

            if (!filter.filters[0]) {
                filter = {};
            }

            that.dataSource.filter(filter);
            that._setFilterForm(null);
            that.menu.close();
        },

        _sort: function(dir) {
            var field = this.currentMember;
            var expressions = (this.dataSource.sort() || []);

            expressions = removeExpr(expressions, field);
            expressions.push({
                field: field,
                dir: dir
            });

            this.dataSource.sort(expressions);
            this.menu.close();
        },

        setDataSource: function(dataSource) {
            this.options.dataSource = dataSource;

            this._dataSource();
        },

        _dataSource: function() {
            this.dataSource = kendo.data.PivotDataSource.create(this.options.dataSource);
        },

        _createWindow: function() {
            var messages = this.options.messages;

            this.includeWindow = $(kendo.template(WINDOWTEMPLATE)({
                messages: messages
            }))
            .on("click" + NS, ".k-button-ok", this._applyIncludes.bind(this))
            .on("click" + NS, ".k-button-cancel", this._closeWindow.bind(this));

            this.includeWindow = new ui.Window(this.includeWindow, {
                title: messages.title,
                visible: false,
                resizable: false,
                open: this._windowOpen.bind(this)
            });
        },

        _applyIncludes: function(e) {
            var checkedNodes = [];
            var resultExpression;
            var view = this.treeView.dataSource.view();
            var rootChecked = view[0].checked;
            var filter = this.dataSource.filter();
            var existingExpression = findFilters({ filter: filter, member: this.currentMember, operator: "in" })[0];

            nodeIds(view, checkedNodes, true);

            if (existingExpression) {
                if (rootChecked) {
                    filter.filters.splice(filter.filters.indexOf(existingExpression), 1);
                    if (!filter.filters.length) {
                        filter = {};
                    }
                } else {
                    existingExpression.value = checkedNodes.join(",");
                }

                resultExpression = filter;
            }

            if (checkedNodes.length) {
                if (!resultExpression && !rootChecked) {
                    resultExpression = {
                        field: this.currentMember,
                        operator: "in",
                        value: checkedNodes.join(",")
                    };

                    if (filter) {
                        filter.filters.push(resultExpression);
                        resultExpression = filter;
                    }
                }
            }

            if (resultExpression) {
                this.dataSource.filter(resultExpression);
            }

            this._closeWindow(e);
        },

        _closeWindow: function(e) {
            e.preventDefault();

            this.includeWindow.close();
        },

        _treeViewDataSource: function() {
            var that = this;

            return kendo.data.HierarchicalDataSource.create({
                schema: {
                    model: {
                        id: "uniqueName",
                        hasChildren: function(item) {
                            return parseInt(item.childrenCardinality, 10) > 0;
                        }
                    }
                },
                transport: {
                    read: function(options) {
                        var restrictions = {};
                        var node = that.treeView.dataSource.get(options.data.uniqueName);
                        var name = options.data.uniqueName;

                        if (!name) {
                            restrictions.levelUniqueName = that.currentMember + ".[(ALL)]";
                        } else {
                            restrictions.memberUniqueName = node.uniqueName.replace(/\&/g, "&amp;");
                            restrictions.treeOp = 1;
                        }

                        that.dataSource
                            .schemaMembers(restrictions)
                            .done(function(data) {
                                checkNodes(that.dataSource.filter(), that.currentMember, data);

                                options.success(data);
                            })
                            .fail(options.error);
                    }
                }
            });
        },

        _createTreeView: function(element) {
            var that = this;

            that.treeView = new ui.TreeView(element, {
                autoBind: false,
                dataSource: that._treeViewDataSource(),
                dataTextField: "caption",
                template: ({ item }) => `${encode(item.caption || item.name)}`,
                checkboxes: {
                    checkChildren: true
                },
                dataBound: function() {
                    ui.progress(that.includeWindow.element, false);
                }
            });
        },

        _menuOpen: function(e) {
            if (!e.event) {
                return;
            }

            var attr = kendo.attr("name");

            this.currentMember = $(e.event.target).closest("[" + attr + "]").attr(attr);

            if (this.options.filterable) {
                this._setFilterForm(findFilters({ filter: this.dataSource.filter(), member: this.currentMember })[0]);
            }
        },

        _select: function(e) {
            var item = $(e.item);

            $(".k-pivot-filter-window").not(this.includeWindow.element).kendoWindow("close");

            if (item.hasClass("k-include-item")) {
                this.includeWindow.center().open();
            } else if (item.hasClass("k-sort-asc")) {
                this._sort("asc");
            } else if (item.hasClass("k-sort-desc")) {
                this._sort("desc");
            } else if (item.hasClass(FILTER_ITEM)) {
                this._updateFilterAriaLabel();
            }
        },

        _windowOpen: function() {
            if (!this.treeView) {
                this._createTreeView(this.includeWindow.element.find(".k-treeview"));
            }

            ui.progress(this.includeWindow.element, true);
            this.treeView.dataSource.read();
        },

        destroy: function() {
            Widget.fn.destroy.call(this);

            if (this.menu) {
                this.menu.destroy();
                this.menu = null;
            }

            if (this.treeView) {
                this.treeView.destroy();
                this.treeView = null;
            }

            if (this.includeWindow) {
                this.includeWindow.destroy();
                this.includeWindow = null;
            }

            this.wrapper = null;
            this.element = null;
        }
    });

    function convert(value, dataSource, currentMember) {
        var schema = dataSource.options.schema;
        var field = ((schema.model || {}).fields || {})[currentMember];

        if (field) {
            if (field.type === "number") {
                value = parseFloat(value);
            } else if (field.type === "boolean") {
                value = Boolean($.parseJSON(value));
            }
        }

        return value;
    }

    function removeExpr(expressions, name) {
        var result = [];

        for (var idx = 0, length = expressions.length; idx < length; idx++) {
            if (expressions[idx].field !== name) {
                result.push(expressions[idx]);
            }
        }

        return result;
    }

    function removeFilterByValue(filter, toRemove) {
        if (!toRemove) {
            return;
        }

        filter = filter.filters;

        var idx = 0;
        var length = filter.length;

        for (idx = length - 1; idx >= 0; idx--) {
            if (filter[idx].value === toRemove.value && filter[idx].operator === toRemove.operator) {
                filter.splice(idx, 1);
            }
        }
    }

    function removeFilters(filter, member, operator) {
        if (!filter) {
            return;
        }

        filter = filter.filters;

        var idx = 0;
        var length = filter.length;
        var filterOperator;

        for (idx = length - 1; idx >= 0; idx--) {
            filterOperator = filter[idx].operator;

            if ((operator ? filterOperator === operator : true) && filter[idx].field === member) {
                filter.splice(idx, 1);
            }
        }
    }

    function findFilters(options) {
        if (!options.filter) {
            return [];
        }

        var filter = options.filter.filters;
        var idx = 0;
        var result = [];
        var length = filter.length;
        var filterOperator;
        var operatorInUse = options.isLocal ? "neq" : "in";

        for ( ; idx < length; idx++) {
            filterOperator = filter[idx].operator;

            if (((!options.operator && filterOperator !== operatorInUse) || (filterOperator === options.operator)) && filter[idx].field === options.member) {
                result.push(filter[idx]);
            }
        }

        return result;
    }

    function checkNodesLocal(filter, member, nodes) {
        var values, idx = 0, length = nodes.length;
        var filters = findFilters({ filter: filter, member: member, operator: "neq" });

        if (nodes[0].name.indexOf("[(ALL)]") >= 0) {
            nodes[0].checked = !filters.length;
            return;
        }

        if (!filters.length) {
            for (; idx < length; idx++) {
                nodes[idx].checked = true;
            }
        } else {
            values = filters.map(function(ftr) { return ftr.value; });
            for (; idx < length; idx++) {
                nodes[idx].checked = $.inArray(nodes[idx].uniqueName, values) < 0;
            }
        }
    }

    function checkNodes(filter, member, nodes) {
        var values, idx = 0, length = nodes.length;
        filter = findFilters({ filter: filter, member: member, operator: "in" })[0];

        if (!filter) {
            for (; idx < length; idx++) {
                nodes[idx].checked = true;
            }
        } else {
            values = filter.value.split(",");
            for (; idx < length; idx++) {
                nodes[idx].checked = $.inArray(nodes[idx].uniqueName, values) >= 0;
            }
        }
    }

    function nodeIds(nodes, checkedNodes, checkState) {
        var idx, length = nodes.length;

        for (idx = 0; idx < length; idx++) {
            if (nodes[idx].checked === checkState && nodes[idx].level() !== 0) {
                checkedNodes.push(nodes[idx].uniqueName);
            }

            if (nodes[idx].hasChildren) {
                nodeIds(nodes[idx].children.view(), checkedNodes, checkState);
            }
        }
    }

    function includeLocalExpression(view, filter, currentMember) {
        var nonCheckedNodes = [];
        removeFilters(filter, currentMember, "neq");

        if (!filter) {
            filter = { logic: 'and', filters: [] };
        }
        nodeIds(view, nonCheckedNodes, false);

        if (nonCheckedNodes.length) {
            for (var idx = 0; idx < nonCheckedNodes.length; idx++) {
                filter.filters.push({
                    field: currentMember,
                    operator: "neq",
                    value: nonCheckedNodes[idx]
                });
            }
        }

        return filter ? filter : null;
    }

    function includeExpression(view, filter, currentMember) {
        var checkedNodes = [];
        var resultExpression;
        var rootChecked = view[0].checked;
        var existingExpression = findFilters({ filter: filter, member: currentMember, operator: "in" })[0];

        nodeIds(view, checkedNodes, true);

        if (existingExpression) {
            if (rootChecked) {
                filter.filters.splice(filter.filters.indexOf(existingExpression), 1);
                if (!filter.filters.length) {
                    filter = {};
                }
            } else {
                existingExpression.value = checkedNodes.join(",");
            }

            resultExpression = filter;
        }

        if (checkedNodes.length) {
            if (!resultExpression && !rootChecked) {
                resultExpression = {
                    field: currentMember,
                    operator: "in",
                    value: checkedNodes.join(",")
                };

                if (filter) {
                    filter.filters.push(resultExpression);
                    resultExpression = filter;
                }
            }
        }

        return resultExpression ? resultExpression : null;
    }

    var LABELMENUTEMPLATE = (messages) =>
        '<div class="k-filterable k-content" tabindex="-1" data-role="fieldmenu">' +
            '<form class="k-filter-menu">' +
                '<div class="k-filter-menu-container">' +
                    `<div class="k-filter-help-text">${encode(messages.info)}</div>` +
                    '<select>' +
                        `${Object.keys(messages.operators || {}).map(op => '<option value="' + op + '">' + encode(messages.operators[op]) + '</option>').join("")}` +
                    '</select>' +
                    `<span class="k-textbox k-input k-input-md k-rounded-md k-input-solid"><input class="k-input-inner" type="text" ${ARIA_LABEL}="${messages.filter}" title="${messages.filter}" /></span>` +
                    '<div class="k-actions">' +
                        `<a class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary k-button-filter" href="#"><span class="k-button-text">${encode(messages.filter)}</span></a>` +
                        `<a class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-button-clear" href="#"><span class="k-button-text">${encode(messages.clear)}</span></a>` +
                    '</div>' +
                '</div>' +
            '</form>' +
        '</div>';

    var MENUTEMPLATEV2 = ({ messages, sortable, filterable, renderAll }) =>
        '<div class="k-pivotgrid-column-menu k-column-menu k-popup k-child-animation-container">' +
            '<div class="k-pivotgrid-column-menu-popup k-grid-columnmenu-popup">' +
                '<div>' +
                    (sortable && renderAll ? '<div class="k-columnmenu-item-wrapper">' +
                        '<div class="k-columnmenu-item k-item">' +
                            `${kendo.ui.icon("sort-asc-small")}${encode(messages.sortAscending)}` +
                        '</div>' +
                        '<div class="k-columnmenu-item k-item">' +
                            `${kendo.ui.icon("sort-desc-small")}${encode(messages.sortDescending)}` +
                        '</div>' +
                    '</div>' : '') +
                    (filterable && renderAll ? '<div class="k-columnmenu-item-wrapper">' +
                        '<div class="k-columnmenu-item-content k-columns-item">' +
                            '<div class="k-column-list-wrapper">' +
                                '<div class="k-column-list">' +
                                    '<div class="k-treeview">' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="k-columnmenu-actions">' +
                                kendo.html.renderButton(`<button class="k-button-includes-reset">${encode(messages.reset)}</button>`) +
                                kendo.html.renderButton(`<button class="k-button-includes-apply">${encode(messages.apply)}</button>`, { themeColor: "primary" }) +
                            '</div>' +
                        '</div>' +
                    '</div>' : '') +
                    (filterable && renderAll ? '<div class="k-columnmenu-item-wrapper">' +
                        '<div class="k-columnmenu-item-content k-column-menu-filter">' +
                            '<div class="kendo-grid-filter-menu-container">' +
                                '<form class="k-filter-menu k-group k-reset">' +
                                    '<div class="k-filter-menu-container">' +
                                            `<select class="k-dropdown k-picker k-dropdown-list" ${ARIA_LABEL}="${messages.filterOperatorsDropDownLabel}" ${kendo.attr("style-overflow")}="visible">` +
                                                `${Object.keys(messages.operators || {}).map(op => '<option value="' + op + '">' + encode(messages.operators[op]) + '</option>').join("")}` +
                                            '</select>' +
                                            `<span class="k-textbox k-input k-input-md k-rounded-md k-input-solid"><input class="k-input-inner" ${ARIA_LABEL}="${messages.filterValueTextBoxLabel}" value=""></span>` +
                                        '<div class="k-actions k-hstack k-justify-content-stretch">' +
                                            kendo.html.renderButton(`<button class="k-button-filter-clear">${encode(messages.clear)}</button>`) +
                                            kendo.html.renderButton(`<button class="k-button-filter">${encode(messages.filter)}</button>`, { themeColor: "primary" }) +
                                        '</div>' +
                                    '</div>' +
                                '</form>' +
                            '</div>' +
                        '</div>' +
                    '</div>' : '') +
                    MOVE_OPERATIONS_TEMPLATE(renderAll, messages) +
                '</div>' +
            '</div>' +
        '</div>';

    var MOVE_OPERATIONS_TEMPLATE = (renderAll, messages) => '<div class="k-columnmenu-item-wrapper">' +
                        (renderAll ? '<div class="k-columnmenu-item k-item" data-move="columns">' +
                            `${kendo.ui.icon("columns")}${encode(messages.moveToColumns)}` +
                        '</div>' : '') +
                        (renderAll ? '<div class="k-columnmenu-item k-item" data-move="rows">' +
                            `${kendo.ui.icon("rows")}${encode(messages.moveToRows)}` +
                        '</div>' : '') +
                        '<div class="k-columnmenu-item k-item" data-move="previous">' +
                            `${kendo.ui.icon("arrow-left")}${encode(messages.movePrevious)}` +
                        '</div>' +
                        '<div class="k-columnmenu-item k-item" data-move="next">' +
                            `${kendo.ui.icon("arrow-right")}${encode(messages.moveNext)}` +
                        '</div>' +
                    '</div>';

    var MENU_TEMPLATE_SORTABLE_PARTIAL = (messages, sortable, filterable) => {
        var result = '';

        if (sortable) {
            result += '<li class="k-item k-menu-item k-sort-asc">' +
            '<span class="k-link k-menu-link">' +
            kendo.ui.icon("sort-asc-small") +
            `<span class="k-menu-link-text">${encode(messages.sortAscending)}</span>` +
            '</span>' +
            '</li>' +
            '<li class="k-item k-menu-item k-sort-desc">' +
            '<span class="k-link k-menu-link">' +
            kendo.ui.icon("sort-desc-small") +
            `<span class="k-menu-link-text">${encode(messages.sortDescending)}</span>` +
            '</span>' +
            '</li>';

            if (filterable) {
                result += '<li class="k-separator"></li>';
            }
        }

        return result;
    };

    var MENU_TEMPLATE_FILTERABLE_PARTIAL = (messages, filterable) => {
        var result = '';

        if (filterable) {
            result += '<li class="k-item k-menu-item k-include-item">' +
                '<span class="k-link k-menu-link">' +
                kendo.ui.icon("filter") +
                `<span class="k-menu-link-text">${encode(messages.include)}</span>` +
                '</span>' +
                '</li>' +
                '<li class="k-separator"></li>' +
                '<li class="k-item k-menu-item ' + FILTER_ITEM + '">' +
                '<span class="k-link k-menu-link">' +
                kendo.ui.icon("filter") +
                `<span class="k-menu-link-text">${encode(messages.filterFields)}</span>` +
                '</span>' +
                '<ul>' +
                '<li>' + LABELMENUTEMPLATE(messages) + '</li>' +
                '</ul>' +
                '</li>';
        }

        return result;
    };

    var MENUTEMPLATE = ({ messages, filterable, sortable }) => '<ul class="k-pivot-fieldmenu">' +
                        MENU_TEMPLATE_SORTABLE_PARTIAL(messages, sortable, filterable) +
                        MENU_TEMPLATE_FILTERABLE_PARTIAL(messages, filterable) +
                    '</ul>';

    var WINDOWTEMPLATE = ({ messages }) => '<div class="k-popup-edit-form k-pivot-filter-window"><div class="k-edit-form-container">' +
                            '<div class="k-treeview"></div>' +
                            '<div class="k-edit-buttons">' +
                                '<a class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary k-button-ok" href="#">' +
                                    '<span class="k-button-text">' +
                                        `${encode(messages.ok)}` +
                                    '</span>' +
                                '</a>' +
                                '<a class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-button-cancel" href="#">' +
                                    '<span class="k-button-text">' +
                                        `${encode(messages.cancel)}` +
                                    '</span>' +
                                '</a>' +
                        '</div></div>';

    ui.plugin(PivotFieldMenu);
    ui.plugin(PivotFieldMenuV2);

})(window.kendo.jQuery);
export default kendo;

