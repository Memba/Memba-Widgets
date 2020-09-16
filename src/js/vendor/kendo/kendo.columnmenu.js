/** 
 * Kendo UI v2020.3.915 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2020 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.columnmenu', [
        'kendo.popup',
        'kendo.filtermenu',
        'kendo.menu'
    ], f);
}(function () {
    var __meta__ = {
        id: 'columnmenu',
        name: 'Column Menu',
        category: 'framework',
        depends: [
            'popup',
            'filtermenu',
            'menu'
        ],
        advanced: true
    };
    (function ($, undefined) {
        var kendo = window.kendo, ui = kendo.ui, proxy = $.proxy, extend = $.extend, grep = $.grep, map = $.map, inArray = $.inArray, ACTIVE = 'k-state-selected', ASC = 'asc', DESC = 'desc', CHANGE = 'change', INIT = 'init', OPEN = 'open', SELECT = 'select', STICK = 'stick', UNSTICK = 'unstick', POPUP = 'kendoPopup', FILTERMENU = 'kendoFilterMenu', MENU = 'kendoMenu', NS = '.kendoColumnMenu', Widget = ui.Widget;
        function trim(text) {
            return kendo.trim(text).replace(/&nbsp;/gi, '');
        }
        function toHash(arr, key) {
            var result = {};
            var idx, len, current;
            for (idx = 0, len = arr.length; idx < len; idx++) {
                current = arr[idx];
                result[current[key]] = current;
            }
            return result;
        }
        function leafColumns(columns) {
            var result = [];
            for (var idx = 0; idx < columns.length; idx++) {
                if (!columns[idx].columns) {
                    result.push(columns[idx]);
                    continue;
                }
                result = result.concat(leafColumns(columns[idx].columns));
            }
            return result;
        }
        function attrEquals(attrName, attrValue) {
            return '[' + kendo.attr(attrName) + '=\'' + (attrValue || '').replace(/'/g, '"') + '\']';
        }
        function insertElementAt(index, element, container) {
            if (index > 0) {
                element.insertAfter(container.children().eq(index - 1));
            } else {
                container.prepend(element);
            }
        }
        function columnOccurrences(columns) {
            var columnDict = {};
            var signature;
            for (var i = 0; i < columns.length; i++) {
                signature = JSON.stringify(columns[i]);
                if (columnDict[signature]) {
                    columnDict[signature].push(i);
                } else {
                    columnDict[signature] = [i];
                }
            }
            return columnDict;
        }
        function oldColumnOccurrences(renderedListElements, checkBoxes) {
            var indexAttr = kendo.attr('index');
            var fieldAttr = kendo.attr('field');
            var columnDict = {};
            var signature;
            var columCheckbox;
            var index;
            var field;
            var title;
            for (var j = 0; j < renderedListElements.length; j++) {
                columCheckbox = checkBoxes.eq(j);
                index = parseInt(columCheckbox.attr(indexAttr), 10);
                field = columCheckbox.attr(fieldAttr);
                title = columCheckbox.attr('title');
                signature = field ? field : title;
                if (columnDict[signature]) {
                    columnDict[signature].push(index);
                } else {
                    columnDict[signature] = [index];
                }
            }
            return columnDict;
        }
        var ColumnMenu = Widget.extend({
            init: function (element, options) {
                var that = this, link;
                Widget.fn.init.call(that, element, options);
                element = that.element;
                options = that.options;
                that.owner = options.owner;
                that.dataSource = options.dataSource;
                that.field = element.attr(kendo.attr('field'));
                that.title = element.attr(kendo.attr('title'));
                link = element.find('.k-header-column-menu');
                if (!link[0]) {
                    link = element.addClass('k-with-icon').prepend('<a class="k-header-column-menu" href="#" title="' + options.messages.settings + '" aria-label="' + options.messages.settings + '"><span class="k-icon k-i-more-vertical"></span></a>').find('.k-header-column-menu');
                }
                that.link = link.attr('tabindex', -1).on('click' + NS, proxy(that._click, that));
                that.wrapper = $('<div class="k-column-menu"/>');
                that._refreshHandler = proxy(that.refresh, that);
                that.dataSource.bind(CHANGE, that._refreshHandler);
            },
            _init: function () {
                var that = this;
                that.pane = that.options.pane;
                if (that.pane) {
                    that._isMobile = true;
                }
                if (that._isMobile) {
                    that._createMobileMenu();
                } else {
                    that._createMenu();
                }
                that.owner._muteAngularRebind(function () {
                    that._angularItems('compile');
                });
                that._sort();
                that._columns();
                that._filter();
                that._lockColumns();
                that._stickyColumns();
                that.trigger(INIT, {
                    field: that.field,
                    container: that.wrapper
                });
            },
            events: [
                INIT,
                OPEN,
                'sort',
                'filtering',
                STICK,
                UNSTICK
            ],
            options: {
                name: 'ColumnMenu',
                messages: {
                    sortAscending: 'Sort Ascending',
                    sortDescending: 'Sort Descending',
                    filter: 'Filter',
                    column: 'Column',
                    columns: 'Columns',
                    columnVisibility: 'Column Visibility',
                    clear: 'Clear',
                    cancel: 'Cancel',
                    done: 'Done',
                    settings: 'Edit Column Settings',
                    lock: 'Lock Column',
                    unlock: 'Unlock Column',
                    stick: 'Stick Column',
                    unstick: 'Unstick Column',
                    setColumnPosition: 'Set Column Position'
                },
                filter: '',
                columns: true,
                sortable: true,
                filterable: true,
                animations: { left: 'slide' }
            },
            _createMenu: function () {
                var that = this, options = that.options;
                that.wrapper.html(kendo.template(template)({
                    uid: kendo.guid(),
                    ns: kendo.ns,
                    messages: options.messages,
                    sortable: options.sortable,
                    filterable: options.filterable,
                    columns: that._ownerColumns(),
                    showColumns: options.columns,
                    hasLockableColumns: options.hasLockableColumns,
                    hasStickableColumns: options.hasStickableColumns
                }));
                that.popup = that.wrapper[POPUP]({
                    anchor: that.link,
                    copyAnchorStyles: false,
                    open: proxy(that._open, that),
                    activate: proxy(that._activate, that),
                    deactivate: proxy(that._deactivate, that),
                    close: function () {
                        that.menu._closing = true;
                        if (that.options.closeCallback) {
                            that.options.closeCallback(that.element);
                        }
                    }
                }).data(POPUP);
                that.menu = that.wrapper.children()[MENU]({
                    orientation: 'vertical',
                    closeOnClick: false,
                    open: function () {
                        that._updateMenuItems();
                    }
                }).data(MENU);
            },
            _deactivate: function () {
                this.menu._closing = false;
            },
            _createMobileMenu: function () {
                var that = this, options = that.options;
                var html = kendo.template(mobileTemplate)({
                    ns: kendo.ns,
                    field: that.field,
                    title: that.title || that.field,
                    messages: options.messages,
                    sortable: options.sortable,
                    filterable: options.filterable,
                    columns: that._ownerColumns(),
                    showColumns: options.columns,
                    hasLockableColumns: options.hasLockableColumns,
                    hasStickableColumns: options.hasStickableColumns
                });
                that.view = that.pane.append(html);
                that.view.state = { columns: {} };
                that.wrapper = that.view.element.find('.k-column-menu');
                that.menu = new MobileMenu(that.wrapper.children(), {
                    pane: that.pane,
                    columnMenu: that
                });
                that.menu.element.on('transitionend' + NS, function (e) {
                    e.stopPropagation();
                });
                var viewElement = that.view.wrapper && that.view.wrapper[0] ? that.view.wrapper : that.view.element;
                viewElement.on('click', '.k-header-done', function (e) {
                    e.preventDefault();
                    that.menu._applyChanges();
                    that.menu._cancelChanges(false);
                    that.close();
                });
                viewElement.on('click', '.k-header-cancel', function (e) {
                    e.preventDefault();
                    that.menu._cancelChanges(true);
                    that.close();
                });
                that.view.bind('showStart', function () {
                    var view = that.view || { columns: {} };
                    if (that.options.hasLockableColumns) {
                        that._updateLockedColumns();
                    }
                    if (that.options.hasStickableColumns) {
                        that._updateStickyColumns();
                    }
                    if (view.element.find('.k-sort-asc.k-state-selected').length) {
                        view.state.initialSort = 'asc';
                    } else if (view.element.find('.k-sort-desc.k-state-selected').length) {
                        view.state.initialSort = 'desc';
                    }
                });
            },
            _angularItems: function (action) {
                var that = this;
                that.angular(action, function () {
                    var items = that.wrapper.find('.k-columns-item input[' + kendo.attr('field') + ']').map(function () {
                        return $(this).closest('li');
                    });
                    var data = map(that._ownerColumns(), function (col) {
                        return { column: col._originalObject };
                    });
                    return {
                        elements: items,
                        data: data
                    };
                });
            },
            destroy: function () {
                var that = this;
                that._angularItems('cleanup');
                Widget.fn.destroy.call(that);
                if (that.filterMenu) {
                    that.filterMenu.destroy();
                }
                if (that._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                }
                if (that.options.columns && that.owner) {
                    if (that._updateColumnsMenuHandler) {
                        that.owner.unbind('columnShow', that._updateColumnsMenuHandler);
                        that.owner.unbind('columnHide', that._updateColumnsMenuHandler);
                    }
                    if (that._updateColumnsLockedStateHandler) {
                        that.owner.unbind('columnLock', that._updateColumnsLockedStateHandler);
                        that.owner.unbind('columnUnlock', that._updateColumnsLockedStateHandler);
                    }
                }
                if (that.menu) {
                    that.menu.element.off(NS);
                    that.menu.destroy();
                }
                that.wrapper.off(NS);
                if (that.popup) {
                    that.popup.destroy();
                }
                if (that.view) {
                    that.view.purge();
                }
                that.link.off(NS);
                that.owner = null;
                that.wrapper = null;
                that.element = null;
            },
            close: function () {
                this.menu.close();
                if (this.popup) {
                    this.popup.close();
                    this.popup.element.off('keydown' + NS);
                }
            },
            _click: function (e) {
                var that = this;
                e.preventDefault();
                e.stopPropagation();
                var options = this.options;
                if (options.filter && this.element.is(!options.filter)) {
                    return;
                }
                if (!this.popup && !this.pane) {
                    this._init();
                } else {
                    that._updateMenuItems();
                }
                if (this._isMobile) {
                    this.pane.navigate(this.view, this.options.animations.left);
                } else {
                    this.popup.toggle();
                }
            },
            _updateMenuItems: function () {
                var that = this;
                if (that.options.columns) {
                    that._setMenuItemsVisibility();
                    that._reorderMenuItems();
                }
            },
            _setMenuItemsVisibility: function () {
                var that = this;
                that._eachRenderedMenuItem(function (index, column, renderedListElement) {
                    if (column.matchesMedia === false) {
                        renderedListElement.hide();
                    } else {
                        renderedListElement.show();
                    }
                });
            },
            _reorderMenuItems: function () {
                var that = this;
                that._eachRenderedMenuItem(function (index, column, renderedListElement, renderedList) {
                    if (renderedListElement[0] && renderedListElement.index() !== index) {
                        insertElementAt(index, renderedListElement, renderedList);
                    }
                });
                that._updateDataIndexes();
            },
            _updateDataIndexes: function () {
                var that = this;
                var renderedList = that._isMobile && that.view ? $(that.view.element).find('.k-columns-item').children('ul') : $(that.wrapper).find('.k-menu-group').first();
                renderedList.find('span.' + (this._isMobile ? 'k-listgroup-form-field-wrapper' : 'k-menu-link') + ' input').each(function (i) {
                    $(this).attr(kendo.attr('index'), i);
                });
            },
            _eachRenderedMenuItem: function (callback) {
                var that = this;
                var renderedListElement;
                var duplicateColumnIndex;
                var fieldValue;
                var currentColumn;
                var columns = grep(leafColumns(that.owner.columns), function (col) {
                    var result = true, title = trim(col.title || '');
                    if (col.menu === false || !col.field && !title.length) {
                        result = false;
                    }
                    return result;
                }).map(function (col) {
                    return {
                        field: col.field,
                        title: col.title,
                        matchesMedia: col.matchesMedia
                    };
                });
                var renderedList = that._isMobile && that.view ? $(that.view.element).find('.k-columns-item').children('ul') : $(that.wrapper).find('.k-menu-group').first();
                var renderedListElements = renderedList.find('span.' + (this._isMobile ? 'k-listgroup-form-field-wrapper' : 'k-menu-link'));
                var oldOccurances = oldColumnOccurrences(renderedListElements, renderedList.find('input[type=checkbox]'));
                var columnOccurrence = columnOccurrences(columns);
                var columnElements;
                for (var i = 0; i < columns.length; i++) {
                    currentColumn = columns[i];
                    fieldValue = currentColumn.field ? currentColumn.field : currentColumn.title;
                    duplicateColumnIndex = $.inArray(i, columnOccurrence[JSON.stringify(currentColumn)]);
                    columnElements = $();
                    for (var idx = 0; idx < oldOccurances[fieldValue].length; idx++) {
                        columnElements = columnElements.add(renderedListElements.eq(oldOccurances[fieldValue][idx]));
                    }
                    renderedListElement = columnElements.find(attrEquals('field', fieldValue)).closest('li').eq(duplicateColumnIndex);
                    callback(i, currentColumn, renderedListElement, renderedList);
                }
            },
            _open: function () {
                var that = this;
                $('.k-column-menu').not(that.wrapper).each(function () {
                    $(this).data(POPUP).close();
                });
                that.popup.element.on('keydown' + NS, function (e) {
                    if (e.keyCode == kendo.keys.ESC) {
                        that.close();
                    }
                });
                if (that.options.hasLockableColumns) {
                    that._updateLockedColumns();
                }
                if (that.options.hasStickableColumns) {
                    that._updateStickyColumns();
                }
            },
            _activate: function () {
                this.menu.element.focus();
                this.trigger(OPEN, {
                    field: this.field,
                    container: this.wrapper
                });
            },
            _ownerColumns: function () {
                var columns = leafColumns(this.owner.columns), menuColumns = grep(columns, function (col) {
                        var result = true, title = trim(col.title || '');
                        if (col.menu === false || !col.field && !title.length) {
                            result = false;
                        }
                        return result;
                    });
                return map(menuColumns, function (col) {
                    return {
                        originalField: col.field,
                        field: col.field || col.title,
                        title: col.title || col.field,
                        hidden: col.hidden,
                        matchesMedia: col.matchesMedia,
                        index: inArray(col, columns),
                        locked: !!col.locked,
                        _originalObject: col,
                        uid: col.headerAttributes.id
                    };
                });
            },
            _sort: function () {
                var that = this;
                if (that.options.sortable) {
                    that.refresh();
                    that.menu.bind(SELECT, function (e) {
                        var item = $(e.item), dir;
                        if (item.hasClass('k-sort-asc')) {
                            dir = ASC;
                        } else if (item.hasClass('k-sort-desc')) {
                            dir = DESC;
                        }
                        if (!dir) {
                            return;
                        }
                        item.parent().find('.k-sort-' + (dir == ASC ? DESC : ASC)).removeClass(ACTIVE);
                        that._sortDataSource(item, dir);
                        if (!that._isMobile) {
                            that.close();
                        }
                    });
                }
            },
            _sortDataSource: function (item, dir) {
                var that = this, sortable = that.options.sortable, compare = sortable.compare === null ? undefined : sortable.compare, dataSource = that.dataSource, idx, length, sort = dataSource.sort() || [];
                var removeClass = item.hasClass(ACTIVE) && sortable && sortable.allowUnsort !== false;
                dir = !removeClass ? dir : undefined;
                if (that.trigger('sort', {
                        sort: {
                            field: that.field,
                            dir: dir,
                            compare: compare
                        }
                    })) {
                    return;
                }
                if (removeClass) {
                    item.removeClass(ACTIVE);
                } else {
                    item.addClass(ACTIVE);
                }
                if (sortable.mode === 'multiple') {
                    for (idx = 0, length = sort.length; idx < length; idx++) {
                        if (sort[idx].field === that.field) {
                            sort.splice(idx, 1);
                            break;
                        }
                    }
                    sort.push({
                        field: that.field,
                        dir: dir,
                        compare: compare
                    });
                } else {
                    sort = [{
                            field: that.field,
                            dir: dir,
                            compare: compare
                        }];
                }
                dataSource.sort(sort);
            },
            _columns: function () {
                var that = this;
                if (that.options.columns) {
                    that._updateColumnsMenu();
                    that._updateColumnsMenuHandler = proxy(that._updateColumnsMenu, that);
                    that.owner.bind([
                        'columnHide',
                        'columnShow'
                    ], that._updateColumnsMenuHandler);
                    that._updateColumnsLockedStateHandler = proxy(that._updateColumnsLockedState, that);
                    that.owner.bind([
                        'columnUnlock',
                        'columnLock'
                    ], that._updateColumnsLockedStateHandler);
                    that.menu.bind(SELECT, function (e) {
                        var item = $(e.item), input, column, indexAttr = kendo.attr('index'), columnIndexMap = {}, columnsCount = 0, columns = grep(leafColumns(that.owner.columns), function (col, idx) {
                                var result = true, title = trim(col.title || '');
                                if (col.menu === false || !col.field && !title.length) {
                                    result = false;
                                }
                                if (result) {
                                    columnIndexMap[idx] = columnsCount;
                                    columnsCount++;
                                }
                                return result;
                            });
                        if (that._isMobile) {
                            e.preventDefault();
                        }
                        if (!item.parent().closest('li.k-columns-item')[0]) {
                            return;
                        }
                        input = item.find(':checkbox');
                        if (input.attr('disabled')) {
                            return;
                        }
                        column = columns[parseInt(input.attr(indexAttr), 10)];
                        if (column.hidden === true) {
                            that.owner.showColumn(column);
                        } else {
                            that.owner.hideColumn(column);
                        }
                    });
                }
            },
            _updateColumnsMenu: function () {
                var idx, length, current, checked, locked;
                var fieldAttr = kendo.attr('field'), lockedAttr = kendo.attr('locked'), uidAttr = kendo.attr('uid'), columnIndexMap = {}, columnsCount = 0, colIdx = 0, columnsInMenu = grep(leafColumns(this.owner.columns), function (col, idx) {
                        var result = true, title = trim(col.title || '');
                        if (col.menu === false || !col.field && !title.length) {
                            result = false;
                        }
                        if (result) {
                            columnIndexMap[idx] = columnsCount;
                            columnsCount++;
                        }
                        return result;
                    }), visibleFields = grep(this._ownerColumns(), function (field) {
                        return !field.hidden && field.matchesMedia !== false;
                    }), visibleDataFields = grep(visibleFields, function (field) {
                        return field.originalField;
                    }), lockedCount = grep(visibleDataFields, function (col) {
                        return col.locked === true;
                    }).length, nonLockedCount = grep(visibleDataFields, function (col) {
                        return col.locked !== true;
                    }).length, columnsNotInMenu = grep(this.owner.columns, function (col) {
                        return col.menu === false;
                    }), hiddenColumnsNotInMenu = grep(columnsNotInMenu, function (col) {
                        return col.hidden;
                    });
                this.wrapper.find('[role=\'menuitemcheckbox\']').attr('aria-checked', false);
                var checkboxes = this.wrapper.find('.k-columns-item input[' + fieldAttr + ']').prop('disabled', false).prop('checked', false);
                var switchWidget;
                for (idx = 0, length = checkboxes.length; idx < length; idx++) {
                    current = checkboxes.eq(idx);
                    locked = current.attr(lockedAttr) === 'true';
                    checked = false;
                    switchWidget = current.data('kendoSwitch');
                    colIdx = columnsInMenu.map(function (col) {
                        return col.headerAttributes.id;
                    }).indexOf(current.attr(uidAttr));
                    checked = !columnsInMenu[colIdx].hidden && columnsInMenu[colIdx].matchesMedia !== false;
                    current.prop('checked', checked);
                    if (switchWidget) {
                        switchWidget.enable(true);
                        switchWidget.check(checked);
                    }
                    current.closest('[role=\'menuitemcheckbox\']').attr('aria-checked', checked);
                    if (checked) {
                        if (lockedCount == 1 && locked) {
                            current.prop('disabled', true);
                            if (switchWidget) {
                                switchWidget.enable(false);
                            }
                        }
                        if ((columnsNotInMenu.length === 0 || columnsNotInMenu.length === hiddenColumnsNotInMenu.length) && nonLockedCount == 1 && !locked) {
                            current.prop('disabled', true);
                            if (switchWidget) {
                                switchWidget.enable(false);
                            }
                        }
                    }
                }
            },
            _updateColumnsLockedState: function () {
                var idx, length, current, column;
                var fieldAttr = kendo.attr('field');
                var lockedAttr = kendo.attr('locked');
                var columns = toHash(this._ownerColumns(), 'field');
                var checkboxes = this.wrapper.find('.k-columns-item input[type=checkbox]');
                for (idx = 0, length = checkboxes.length; idx < length; idx++) {
                    current = checkboxes.eq(idx);
                    column = columns[current.attr(fieldAttr)];
                    if (column) {
                        current.attr(lockedAttr, column.locked);
                    }
                }
                this._updateColumnsMenu();
            },
            _filter: function () {
                var that = this, widget = FILTERMENU, options = that.options;
                if (options.filterable !== false) {
                    if (options.filterable.multi) {
                        widget = 'kendoFilterMultiCheck';
                        if (options.filterable.dataSource) {
                            options.filterable.checkSource = options.filterable.dataSource;
                            delete options.filterable.dataSource;
                        }
                    }
                    that.filterMenu = that.wrapper.find('.k-filterable')[widget](extend(true, {}, {
                        appendToElement: true,
                        dataSource: options.dataSource,
                        values: options.values,
                        field: that.field,
                        title: that.title,
                        change: function (e) {
                            if (that.trigger('filtering', {
                                    filter: e.filter,
                                    field: e.field
                                })) {
                                e.preventDefault();
                            }
                        }
                    }, options.filterable)).data(widget);
                    if (that._isMobile) {
                        that.menu.bind(SELECT, function (e) {
                            var item = $(e.item);
                            if (item.hasClass('k-filter-item')) {
                                that.pane.navigate(that.filterMenu.view, that.options.animations.left);
                            }
                        });
                    }
                }
            },
            _lockColumns: function () {
                var that = this;
                that.menu.bind(SELECT, function (e) {
                    var item = $(e.item);
                    if (item.hasClass('k-lock')) {
                        that.owner.lockColumn(that.field);
                        if (!that._isMobile) {
                            that.close();
                        }
                    } else if (item.hasClass('k-unlock')) {
                        that.owner.unlockColumn(that.field);
                        if (!that._isMobile) {
                            that.close();
                        }
                    }
                });
            },
            _stickyColumns: function () {
                var that = this;
                that.menu.bind(SELECT, function (e) {
                    var item = $(e.item);
                    var field = that.field;
                    var columns = that.owner.columns;
                    var column = grep(columns, function (column) {
                        return column.field == field || column.title == field;
                    })[0];
                    if (item.hasClass('k-stick')) {
                        that.owner.stickColumn(that.field);
                        that.trigger(STICK, { column: column });
                        if (!that._isMobile) {
                            that.close();
                        }
                    } else if (item.hasClass('k-unstick')) {
                        that.owner.unstickColumn(that.field);
                        that.trigger(UNSTICK, { column: column });
                        if (!that._isMobile) {
                            that.close();
                        }
                    }
                });
            },
            _updateLockedColumns: function () {
                var field = this.field;
                var columns = this.owner.columns;
                var column = grep(columns, function (column) {
                    return column.field == field || column.title == field;
                })[0];
                if (!column) {
                    return;
                }
                var locked = column.locked === true;
                var length = grep(columns, function (column) {
                    return !column.hidden && (column.locked && locked || !column.locked && !locked);
                }).length;
                var notLockable = column.lockable === false;
                var lockItem = this.wrapper.find('.k-lock').removeClass('k-state-disabled');
                var unlockItem = this.wrapper.find('.k-unlock').removeClass('k-state-disabled');
                if (locked || length == 1 || notLockable) {
                    lockItem.addClass('k-state-disabled');
                }
                if (!locked || length == 1 || notLockable) {
                    unlockItem.addClass('k-state-disabled');
                }
                this._updateColumnsLockedState();
            },
            _updateStickyColumns: function () {
                var field = this.field;
                var columns = this.owner.columns;
                var column = grep(columns, function (column) {
                    return column.field == field || column.title == field;
                })[0];
                if (!column) {
                    return;
                }
                var sticky = column.sticky === true;
                var stickable = column.stickable === true;
                var locked = column.locked === true;
                var length = grep(columns, function (column) {
                    return !column.hidden && (column.locked && locked || !column.locked && !locked);
                }).length;
                var stickItem = this.wrapper.find('.k-stick').removeClass('k-state-disabled');
                var unstickItem = this.wrapper.find('.k-unstick').removeClass('k-state-disabled');
                if (sticky || !stickable || locked && length === 1) {
                    stickItem.addClass('k-state-disabled');
                }
                if (!sticky || !stickable) {
                    unstickItem.addClass('k-state-disabled');
                }
            },
            refresh: function () {
                var that = this, sort = that.options.dataSource.sort() || [], descriptor, field = that.field, idx, length;
                that.wrapper.find('.k-sort-asc, .k-sort-desc').removeClass(ACTIVE);
                for (idx = 0, length = sort.length; idx < length; idx++) {
                    descriptor = sort[idx];
                    if (field == descriptor.field) {
                        that.wrapper.find('.k-sort-' + descriptor.dir).addClass(ACTIVE);
                    }
                }
                that.link[that._filterExist(that.dataSource.filter()) ? 'addClass' : 'removeClass']('k-state-active');
            },
            _filterExist: function (filters) {
                var found = false;
                var filter;
                if (!filters) {
                    return;
                }
                filters = filters.filters;
                for (var idx = 0, length = filters.length; idx < length; idx++) {
                    filter = filters[idx];
                    if (filter.field == this.field) {
                        found = true;
                    } else if (filter.filters) {
                        found = found || this._filterExist(filter);
                    }
                }
                return found;
            }
        });
        var template = '<ul id="#=uid#">' + '#if(sortable){#' + '<li class="k-item k-menu-item k-sort-asc"><span class="k-link k-menu-link"><span class="k-icon k-i-sort-asc-sm"></span>${messages.sortAscending}</span></li>' + '<li class="k-item k-menu-item k-sort-desc"><span class="k-link k-menu-link"><span class="k-icon k-i-sort-desc-sm"></span>${messages.sortDescending}</span></li>' + '#if(showColumns || filterable){#' + '<li class="k-separator k-menu-separator" role="presentation"></li>' + '#}#' + '#}#' + '#if(showColumns){#' + '<li class="k-item k-menu-item k-columns-item" aria-haspopup="true"><span class="k-link k-menu-link"><span class="k-icon k-i-columns"></span>${messages.columns}</span><ul>' + '#for (var idx = 0; idx < columns.length; idx++) {#' + '<li role="menuitemcheckbox" aria-checked="false" #=columns[idx].matchesMedia === false ? "style=\'display:none;\'" : ""#><input type="checkbox" title="#=columns[idx].title#" data-#=ns#field="#=columns[idx].field.replace(/"/g,"&\\#34;")#" data-#=ns#index="#=columns[idx].index#" data-#=ns#locked="#=columns[idx].locked#" data-#=ns#uid="#=columns[idx].uid#"/>#=columns[idx].title#</li>' + '#}#' + '</ul></li>' + '#if(filterable || hasLockableColumns || hasStickableColumns){#' + '<li class="k-separator k-menu-separator" role="presentation"></li>' + '#}#' + '#}#' + '#if(filterable){#' + '<li class="k-item k-menu-item k-filter-item" aria-haspopup="true"><span class="k-link k-menu-link"><span class="k-icon k-i-filter"></span>${messages.filter}</span><ul>' + '<li><div class="k-filterable"></div></li>' + '</ul></li>' + '#if(hasLockableColumns || hasStickableColumns){#' + '<li class="k-separator k-menu-separator" role="presentation"></li>' + '#}#' + '#}#' + '#if(hasLockableColumns || hasStickableColumns){#' + '<li class="k-item k-menu-item k-position-item" aria-haspopup="true"><span class="k-link k-menu-link"><span class="k-icon k-i-set-column-position"></span>${messages.setColumnPosition}</span><ul>' + '#if(hasLockableColumns){#' + '<li class="k-item k-menu-item k-lock"><span class="k-link k-menu-link"><span class="k-icon k-i-lock"></span>${messages.lock}</span></li>' + '<li class="k-item k-menu-item k-unlock"><span class="k-link k-menu-link"><span class="k-icon k-i-unlock"></span>${messages.unlock}</span></li>' + '#if(hasStickableColumns){#' + '<li class="k-separator k-menu-separator" role="presentation"></li>' + '#}#' + '#}#' + '#if(hasStickableColumns){#' + '<li class="k-item k-menu-item k-stick"><span class="k-link k-menu-link"><span class="k-icon k-i-stick"></span>${messages.stick}</span></li>' + '<li class="k-item k-menu-item k-unstick"><span class="k-link k-menu-link"><span class="k-icon k-i-unstick"></span>${messages.unstick}</span></li>' + '#}#' + '</ul></li>' + '#}#' + '</ul>';
        var mobileTemplate = '<div data-#=ns#role="view" class="k-grid-column-menu">' + '<div data-#=ns#role="header" class="k-header">' + '<a href="\\#" class="k-header-cancel k-link" title="#=messages.cancel#" ' + 'aria-label="#=messages.cancel#"><span class="k-icon k-i-arrow-chevron-left"></span></a>' + '${messages.settings}' + '<a href="\\#" class="k-header-done k-link" title="#=messages.done#" ' + 'aria-label="#=messages.done#"><span class="k-icon k-i-check"></span></a>' + '</div>' + '<div class="k-column-menu">' + '<ul class="k-reset">' + '<li>' + '<span class="k-list-title">#=messages.column#: ${title}</span>' + '<ul class="k-listgroup k-listgroup-flush">' + '#if(sortable){#' + '<li id="#=kendo.guid()#" class="k-item k-listgroup-item k-sort-asc"><span class="k-link"><span class="k-icon k-i-sort-asc-sm"></span><span class="k-item-title">${messages.sortAscending}</span></span></li>' + '<li id="#=kendo.guid()#" class="k-item k-listgroup-item k-sort-desc"><span class="k-link"><span class="k-icon k-i-sort-desc-sm"></span><span class="k-item-title">${messages.sortDescending}</span></span></li>' + '#}#' + '#if(hasLockableColumns){#' + '<li id="#=kendo.guid()#" class="k-item k-listgroup-item k-lock"><span class="k-link"><span class="k-icon k-i-lock"></span><span class="k-item-title">${messages.lock}</span></span></li>' + '<li id="#=kendo.guid()#" class="k-item k-listgroup-item k-unlock"><span class="k-link"><span class="k-icon k-i-unlock"></span><span class="k-item-title">${messages.unlock}</span></span></li>' + '#}#' + '#if(hasStickableColumns){#' + '<li id="#=kendo.guid()#" class="k-item k-listgroup-item k-stick"><span class="k-link"><span class="k-icon k-i-stick"></span><span class="k-item-title">${messages.stick}</span></span></li>' + '<li id="#=kendo.guid()#" class="k-item k-listgroup-item k-unstick"><span class="k-link"><span class="k-icon k-i-unstick"></span><span class="k-item-title">${messages.unstick}</span></span></li>' + '#}#' + '#if(filterable){#' + '<li id="#=kendo.guid()#" class="k-item k-listgroup-item k-filter-item">' + '<span class="k-link k-filterable">' + '<span class="k-icon k-i-filter"></span>' + '<span class="k-item-title">${messages.filter}</span>' + '<span class="k-select"><span class="k-icon k-i-arrow-chevron-right"></span></span>' + '</span>' + '</li>' + '#}#' + '</ul>' + '</li>' + '#if(showColumns){#' + '<li class="k-columns-item"><span class="k-list-title">${messages.columnVisibility}</span>' + '<ul class="k-listgroup k-listgroup-flush">' + '#for (var idx = 0; idx < columns.length; idx++) {#' + '<li id="#=kendo.guid()#" class="k-item k-listgroup-item">' + '<span class="k-listgroup-form-row">' + '<span class="k-listgroup-form-field-label k-item-title">' + '#=columns[idx].title#' + '</span>' + '<span class="k-listgroup-form-field-wrapper">' + '<input type="checkbox" title="#=columns[idx].title#" ' + ' data-#=ns#field="#=columns[idx].field.replace(/"/g,"&\\#34;")#"' + ' data-#=ns#index="#=columns[idx].index#"' + ' data-#=ns#uid="#=columns[idx].uid#"' + ' data-#=ns#locked="#=columns[idx].locked#" />' + '</span>' + '</span>' + '</li>' + '#}#' + '</ul>' + '</li>' + '#}#' + '<li class="k-item k-clear-wrap">' + '<span class="k-list-title">&nbsp;</span>' + '<ul class="k-listgroup k-listgroup-flush">' + '<li class="k-listgroup-item">' + '<span class="k-link k-label k-clear" title="#=messages.clear#" aria-label="#=messages.clear#">' + '#=messages.clear#' + '</span>' + '</li>' + '</ul>' + '</li>' + '</ul>' + '</div>' + '</div>';
        var MobileMenu = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                that._createCheckBoxes();
                that.element.on('click' + NS, 'li.k-item:not(.k-separator):not(.k-state-disabled):not(:has(.k-switch))', '_click');
            },
            events: [SELECT],
            _click: function (e) {
                var that = this;
                if (!$(e.target).is('[type=checkbox]')) {
                    e.preventDefault();
                }
                if ($(e.target).hasClass('k-clear')) {
                    that._cancelChanges(true);
                    return;
                }
                if ($(e.target).hasClass('k-filterable')) {
                    that._cancelChanges(true);
                    that.trigger(SELECT, { item: e.currentTarget });
                    return;
                }
                that._updateSelectedItems(e.currentTarget);
            },
            _updateSelectedItems: function (el) {
                var that = this;
                var item = $(el);
                var state = that.options.columnMenu.view.state || { columns: {} };
                var id = item.prop('id');
                if (item.hasClass('k-filter-item')) {
                    return;
                }
                if (state[id]) {
                    state[id] = false;
                } else {
                    state[id] = true;
                }
                if (item.hasClass('k-sort-asc') || item.hasClass('k-sort-desc')) {
                    var dir;
                    var otherItem;
                    var otherItemId;
                    if (item.hasClass('k-sort-asc')) {
                        dir = 'asc';
                        otherItem = that.element.find('.k-sort-desc');
                    } else {
                        dir = 'desc';
                        otherItem = that.element.find('.k-sort-asc');
                    }
                    otherItemId = otherItem.prop('id');
                    if (dir === state.initialSort && !item.hasClass('k-state-selected')) {
                        state[id] = false;
                    }
                    if (state[otherItemId]) {
                        state[otherItemId] = false;
                    }
                    otherItem.removeClass(ACTIVE);
                }
                if (item.hasClass(ACTIVE)) {
                    item.removeClass(ACTIVE);
                } else {
                    item.addClass(ACTIVE);
                }
            },
            _cancelChanges: function (force) {
                var that = this;
                var menu = that.options.columnMenu;
                var view = menu.view;
                var state = view.state || { columns: {} };
                var columns = state.columns;
                that.element.find('.' + ACTIVE).removeClass(ACTIVE);
                menu.refresh();
                if (force) {
                    var selectedItems = [];
                    for (var key in columns) {
                        if (columns.hasOwnProperty(key)) {
                            if (columns[key] === true) {
                                var item = view.element.find('#' + key);
                                selectedItems.push(item[0]);
                            }
                        }
                    }
                    for (var i = selectedItems.length - 1; i >= 0; i--) {
                        that.trigger(SELECT, { item: selectedItems[i] });
                    }
                    if (menu.options.hasLockableColumns) {
                        menu._updateLockedColumns();
                    }
                    if (menu.options.hasStickableColumns) {
                        menu._updateStickyColumns();
                    }
                }
                that.options.columnMenu.view.state = { columns: {} };
            },
            _applyChanges: function () {
                var that = this;
                var view = that.options.columnMenu.view;
                var state = view.state || { columns: {} };
                for (var key in state) {
                    if (state.hasOwnProperty(key)) {
                        if (key !== 'initialSort' && key !== 'columns' && state[key] === true) {
                            var item = view.element.find('#' + key);
                            if (item.hasClass(ACTIVE)) {
                                item.removeClass(ACTIVE);
                            } else {
                                item.addClass(ACTIVE);
                            }
                            that.trigger(SELECT, { item: item[0] });
                        }
                    }
                }
            },
            _createCheckBoxes: function () {
                var that = this;
                that.element.find('.k-columns-item').find('[type=\'checkbox\']').kendoSwitch({
                    messages: {
                        checked: '',
                        unchecked: ''
                    },
                    change: function (e) {
                        var item = e.sender.element.closest('.k-item');
                        var state = that.options.columnMenu.view.state || { columns: {} };
                        var id = item.prop('id');
                        if (state.columns[id]) {
                            state.columns[id] = false;
                        } else {
                            state.columns[id] = true;
                        }
                        that.trigger(SELECT, { item: item });
                    }
                });
            },
            _destroyCheckBoxes: function () {
                var that = this;
                var elements = that.element.find('.k-columns-item').find('[type=\'checkbox\']');
                var switchWidget;
                for (var i = 0; i < elements.length; i++) {
                    switchWidget = elements.eq(i).data('kendoSwitch');
                    if (switchWidget) {
                        switchWidget.destroy();
                    }
                }
            },
            close: function () {
                this.options.pane.navigate('');
            },
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that.element.off(NS);
                that._destroyCheckBoxes();
            }
        });
        ui.plugin(ColumnMenu);
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));