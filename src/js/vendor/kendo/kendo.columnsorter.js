/** 
 * Kendo UI v2018.3.1017 (http://www.telerik.com/kendo-ui)                                                                                                                                              
 * Copyright 2018 Telerik EAD. All rights reserved.                                                                                                                                                     
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
            refresh: function () {
                var that = this, sort = that.dataSource.sort() || [], idx, length, descriptor, dir, element = that.element, field = element.attr(kendo.attr(FIELD)), headerIndex, sortOrder, leafCells;
                element.removeAttr(kendo.attr(DIR));
                element.removeAttr(ARIASORT);
                for (idx = 0, length = sort.length; idx < length; idx++) {
                    descriptor = sort[idx];
                    if (field == descriptor.field) {
                        element.attr(kendo.attr(DIR), descriptor.dir);
                        sortOrder = idx + 1;
                    }
                }
                dir = element.attr(kendo.attr(DIR));
                if (element.is('th')) {
                    var table = element.closest('table');
                    if (table.parent().hasClass('k-grid-header-wrap')) {
                        table = table.closest('.k-grid').find('.k-grid-content > table');
                    } else if (table.parent().hasClass('k-grid-header-locked')) {
                        table = table.closest('.k-grid').find('.k-grid-content-locked > table');
                    } else if (!table.parent().hasClass('k-grid')) {
                        table = null;
                    }
                    if (table) {
                        if (element.attr(kendo.attr('index'))) {
                            leafCells = leafDataCells(element.closest('table'));
                            headerIndex = leafCells.index(element);
                        } else {
                            headerIndex = element.parent().children(':visible').index(element);
                        }
                        element.toggleClass('k-sorted', dir !== undefined);
                        table.children('colgroup').children().eq(headerIndex).toggleClass('k-sorted', dir !== undefined);
                    }
                }
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
            var filter = function () {
                var el = $(this);
                return !el.hasClass('k-group-cell') && !el.hasClass('k-hierarchy-cell');
            };
            var cells = $();
            if (rows.length > 1) {
                cells = rows.find('th:visible').filter(filter).filter(function () {
                    return this.rowSpan > 1;
                });
            }
            cells = cells.add(rows.last().find('th:visible').filter(filter));
            var indexAttr = kendo.attr('index');
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
        ui.plugin(ColumnSorter);
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));