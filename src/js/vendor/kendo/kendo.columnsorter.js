/** 
 * Kendo UI v2021.2.616 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2021 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.columnsorter', ['kendo.core'], f);
}(function () {
    var __meta__ = {
        id: 'columnsorter',
        name: 'Column Sorter',
        category: 'framework',
        depends: ['core'],
        advanced: true
    };
    (function ($, undefined) {
        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var DIR = 'dir';
        var ASC = 'asc';
        var SINGLE = 'single';
        var FIELD = 'field';
        var DESC = 'desc';
        var sorterNS = '.kendoColumnSorter';
        var TLINK = '.k-link';
        var ARIASORT = 'aria-sort';
        var proxy = $.proxy;
        var ColumnSorter = Widget.extend({
            init: function (element, options) {
                var that = this, link;
                Widget.fn.init.call(that, element, options);
                that._refreshHandler = proxy(that.refresh, that);
                that.dataSource = that.options.dataSource.bind('change', that._refreshHandler);
                that.directions = that.options.initialDirection === ASC ? [
                    ASC,
                    DESC
                ] : [
                    DESC,
                    ASC
                ];
                link = that.element.find(TLINK);
                if (!link[0]) {
                    link = that.element.wrapInner('<a class="k-link" href="#"/>').find(TLINK);
                }
                that.link = link;
                that.element.on('click' + sorterNS, proxy(that._click, that));
            },
            options: {
                name: 'ColumnSorter',
                mode: SINGLE,
                allowUnsort: true,
                compare: null,
                filter: '',
                initialDirection: ASC,
                showIndexes: false
            },
            events: ['change'],
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that.element.off(sorterNS);
                that.dataSource.unbind('change', that._refreshHandler);
                that._refreshHandler = that.element = that.link = that.dataSource = null;
            },
            refresh: function (e) {
                if (e && (e.action === 'itemchange' || e.action === 'sync')) {
                    return;
                }
                var that = this, sort = that.dataSource.sort() || [], dir, table, leafCells, element = that.element, field = element.attr(kendo.attr(FIELD)), descriptor = (that.dataSource._sortFields || {})[field], headerIndex, sortOrder;
                element.removeAttr(kendo.attr(DIR));
                element.removeAttr(ARIASORT);
                if (descriptor) {
                    dir = descriptor.dir;
                    element.attr(kendo.attr(DIR), dir);
                    sortOrder = descriptor.index;
                }
                if (element.is('th') && descriptor) {
                    table = getColsTable(element);
                    if (table) {
                        if (element.attr(kendo.attr('index'))) {
                            leafCells = leafDataCells(element.closest('table'));
                            headerIndex = leafCells.index(element);
                        } else {
                            headerIndex = element.parent().children(':visible').index(element);
                        }
                        table.find('col:not(.k-group-col):not(.k-hierarchy-col)').eq(headerIndex).toggleClass('k-sorted', dir !== undefined);
                    }
                }
                element.toggleClass('k-sorted', dir !== undefined);
                element.find('.k-i-sort-asc-sm,.k-i-sort-desc-sm,.k-sort-order').remove();
                if (dir === ASC) {
                    $('<span class="k-icon k-i-sort-asc-sm" />').appendTo(that.link);
                    element.attr(ARIASORT, 'ascending');
                } else if (dir === DESC) {
                    $('<span class="k-icon k-i-sort-desc-sm" />').appendTo(that.link);
                    element.attr(ARIASORT, 'descending');
                }
                if (that.options.showIndexes && sort.length > 1 && sortOrder) {
                    $('<span class="k-sort-order" />').html(sortOrder).appendTo(that.link);
                }
            },
            _toggleSortDirection: function (dir) {
                var directions = this.directions;
                if (dir === directions[directions.length - 1] && this.options.allowUnsort) {
                    return undefined;
                }
                return directions[0] === dir ? directions[1] : directions[0];
            },
            _click: function (e) {
                var that = this, element = that.element, field = element.attr(kendo.attr(FIELD)), dir = element.attr(kendo.attr(DIR)), options = that.options, compare = that.options.compare === null ? undefined : that.options.compare, sort = that.dataSource.sort() || [], idx, length;
                e.preventDefault();
                if (options.filter && !element.is(options.filter)) {
                    return;
                }
                dir = this._toggleSortDirection(dir);
                if (this.trigger('change', {
                        sort: {
                            field: field,
                            dir: dir,
                            compare: compare
                        }
                    })) {
                    return;
                }
                if (options.mode === SINGLE) {
                    sort = [{
                            field: field,
                            dir: dir,
                            compare: compare
                        }];
                } else if (options.mode === 'multiple') {
                    for (idx = 0, length = sort.length; idx < length; idx++) {
                        if (sort[idx].field === field) {
                            sort.splice(idx, 1);
                            break;
                        }
                    }
                    sort.push({
                        field: field,
                        dir: dir,
                        compare: compare
                    });
                }
                if (this.dataSource.options.endless) {
                    this.dataSource.options.endless = null;
                    element.closest('.k-grid').getKendoGrid()._endlessPageSize = that.dataSource.options.pageSize;
                    this.dataSource.pageSize(that.dataSource.options.pageSize);
                }
                this.dataSource.sort(sort);
            }
        });
        function leafDataCells(container) {
            var rows = container.find('tr:not(.k-filter-row)');
            var indexAttr = kendo.attr('index');
            var cells = rows.find('th[' + indexAttr + ']:visible');
            cells.sort(function (a, b) {
                a = $(a);
                b = $(b);
                var indexA = a.attr(indexAttr);
                var indexB = b.attr(indexAttr);
                if (indexA === undefined) {
                    indexA = $(a).index();
                }
                if (indexB === undefined) {
                    indexB = $(b).index();
                }
                indexA = parseInt(indexA, 10);
                indexB = parseInt(indexB, 10);
                return indexA > indexB ? 1 : indexA < indexB ? -1 : 0;
            });
            return cells;
        }
        function getColsTable(element) {
            var table = null;
            if (element.is('th')) {
                table = element.closest('table');
                if (table.parent().hasClass('k-grid-header-wrap')) {
                    table = table.closest('.k-grid').find('.k-grid-content > table');
                } else if (table.parent().hasClass('k-grid-header-locked')) {
                    table = table.closest('.k-grid').find('.k-grid-content-locked > table');
                }
            }
            return table;
        }
        ui.plugin(ColumnSorter);
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));