/** 
 * Kendo UI v2017.1.118 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2017 Telerik AD. All rights reserved.                                                                                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.excel', [
        'kendo.core',
        'kendo.data',
        'kendo.ooxml'
    ], f);
}(function () {
    var __meta__ = {
        id: 'excel',
        name: 'Excel export',
        category: 'framework',
        advanced: true,
        mixin: true,
        depends: [
            'data',
            'ooxml'
        ]
    };
    (function ($, kendo) {
        kendo.ExcelExporter = kendo.Class.extend({
            init: function (options) {
                options.columns = this._trimColumns(options.columns || []);
                this.allColumns = $.map(this._leafColumns(options.columns || []), this._prepareColumn);
                this.columns = $.grep(this.allColumns, function (column) {
                    return !column.hidden;
                });
                this.options = options;
                var dataSource = options.dataSource;
                if (dataSource instanceof kendo.data.DataSource) {
                    this.dataSource = new dataSource.constructor($.extend({}, dataSource.options, {
                        page: options.allPages ? 0 : dataSource.page(),
                        filter: dataSource.filter(),
                        pageSize: options.allPages ? dataSource.total() : dataSource.pageSize(),
                        sort: dataSource.sort(),
                        group: dataSource.group(),
                        aggregate: dataSource.aggregate()
                    }));
                    var data = dataSource.data();
                    if (data.length > 0) {
                        this.dataSource._data = data;
                        var transport = this.dataSource.transport;
                        if (dataSource._isServerGrouped() && transport.options && transport.options.data) {
                            transport.options.data = null;
                        }
                    }
                } else {
                    this.dataSource = kendo.data.DataSource.create(dataSource);
                }
            },
            _trimColumns: function (columns) {
                var that = this;
                return $.grep(columns, function (column) {
                    var result = !!column.field;
                    if (!result && column.columns) {
                        result = that._trimColumns(column.columns).length > 0;
                    }
                    return result;
                });
            },
            _leafColumns: function (columns) {
                var result = [];
                for (var idx = 0; idx < columns.length; idx++) {
                    if (!columns[idx].columns) {
                        result.push(columns[idx]);
                        continue;
                    }
                    result = result.concat(this._leafColumns(columns[idx].columns));
                }
                return result;
            },
            workbook: function () {
                return $.Deferred($.proxy(function (d) {
                    this.dataSource.fetch().then($.proxy(function () {
                        var workbook = {
                            sheets: [{
                                    columns: this._columns(),
                                    rows: this._rows(),
                                    freezePane: this._freezePane(),
                                    filter: this._filter()
                                }]
                        };
                        d.resolve(workbook, this.dataSource.view());
                    }, this));
                }, this)).promise();
            },
            _prepareColumn: function (column) {
                if (!column.field) {
                    return;
                }
                var value = function (dataItem) {
                    return dataItem.get(column.field);
                };
                var values = null;
                if (column.values) {
                    values = {};
                    $.each(column.values, function () {
                        values[this.value] = this.text;
                    });
                    value = function (dataItem) {
                        return values[dataItem.get(column.field)];
                    };
                }
                return $.extend({}, column, {
                    value: value,
                    values: values,
                    groupHeaderTemplate: kendo.template(column.groupHeaderTemplate || '#= title #: #= value #'),
                    groupFooterTemplate: column.groupFooterTemplate ? kendo.template(column.groupFooterTemplate) : null,
                    footerTemplate: column.footerTemplate ? kendo.template(column.footerTemplate) : null
                });
            },
            _filter: function () {
                if (!this.options.filterable) {
                    return null;
                }
                var depth = this._depth();
                return {
                    from: depth,
                    to: depth + this.columns.length - 1
                };
            },
            _dataRow: function (dataItem, level, depth) {
                if (this._hierarchical()) {
                    level = this.dataSource.level(dataItem) + 1;
                }
                var cells = [];
                for (var li = 0; li < level; li++) {
                    cells[li] = {
                        background: '#dfdfdf',
                        color: '#333'
                    };
                }
                if (depth && dataItem.items) {
                    var column = $.grep(this.allColumns, function (column) {
                        return column.field == dataItem.field;
                    })[0];
                    var title = column && column.title ? column.title : dataItem.field;
                    var template = column ? column.groupHeaderTemplate : null;
                    var value = title + ': ' + dataItem.value;
                    var group = $.extend({
                        title: title,
                        field: dataItem.field,
                        value: column && column.values ? column.values[dataItem.value] : dataItem.value,
                        aggregates: dataItem.aggregates
                    }, dataItem.aggregates[dataItem.field]);
                    if (template) {
                        value = template(group);
                    }
                    cells.push({
                        value: value,
                        background: '#dfdfdf',
                        color: '#333',
                        colSpan: this.columns.length + depth - level
                    });
                    var rows = this._dataRows(dataItem.items, level + 1);
                    rows.unshift({
                        type: 'group-header',
                        cells: cells
                    });
                    return rows.concat(this._footer(dataItem));
                } else {
                    var dataCells = [];
                    for (var ci = 0; ci < this.columns.length; ci++) {
                        dataCells[ci] = this._cell(dataItem, this.columns[ci]);
                    }
                    if (this._hierarchical()) {
                        dataCells[0].colSpan = depth - level + 1;
                    }
                    return [{
                            type: 'data',
                            cells: cells.concat(dataCells)
                        }];
                }
            },
            _dataRows: function (dataItems, level) {
                var depth = this._depth();
                var rows = [];
                for (var i = 0; i < dataItems.length; i++) {
                    rows.push.apply(rows, this._dataRow(dataItems[i], level, depth));
                }
                return rows;
            },
            _footer: function (dataItem) {
                var rows = [];
                var footer = false;
                var cells = $.map(this.columns, $.proxy(function (column) {
                    if (column.groupFooterTemplate) {
                        footer = true;
                        return {
                            background: '#dfdfdf',
                            color: '#333',
                            value: column.groupFooterTemplate($.extend({}, this.dataSource.aggregates(), dataItem.aggregates, dataItem.aggregates[column.field]))
                        };
                    } else {
                        return {
                            background: '#dfdfdf',
                            color: '#333'
                        };
                    }
                }, this));
                if (footer) {
                    rows.push({
                        type: 'group-footer',
                        cells: $.map(new Array(this.dataSource.group().length), function () {
                            return {
                                background: '#dfdfdf',
                                color: '#333'
                            };
                        }).concat(cells)
                    });
                }
                return rows;
            },
            _isColumnVisible: function (column) {
                return this._visibleColumns([column]).length > 0 && (column.field || column.columns);
            },
            _visibleColumns: function (columns) {
                var that = this;
                return $.grep(columns, function (column) {
                    var result = !column.hidden;
                    if (result && column.columns) {
                        result = that._visibleColumns(column.columns).length > 0;
                    }
                    return result;
                });
            },
            _headerRow: function (row, groups) {
                var headers = $.map(row.cells, function (cell) {
                    return {
                        background: '#7a7a7a',
                        color: '#fff',
                        value: cell.title,
                        colSpan: cell.colSpan > 1 ? cell.colSpan : 1,
                        rowSpan: row.rowSpan > 1 && !cell.colSpan ? row.rowSpan : 1
                    };
                });
                if (this._hierarchical()) {
                    headers[0].colSpan = this._depth() + 1;
                }
                return {
                    type: 'header',
                    cells: $.map(new Array(groups.length), function () {
                        return {
                            background: '#7a7a7a',
                            color: '#fff'
                        };
                    }).concat(headers)
                };
            },
            _prependHeaderRows: function (rows) {
                var groups = this.dataSource.group();
                var headerRows = [{
                        rowSpan: 1,
                        cells: [],
                        index: 0
                    }];
                this._prepareHeaderRows(headerRows, this.options.columns);
                for (var idx = headerRows.length - 1; idx >= 0; idx--) {
                    rows.unshift(this._headerRow(headerRows[idx], groups));
                }
            },
            _prepareHeaderRows: function (rows, columns, parentCell, parentRow) {
                var row = parentRow || rows[rows.length - 1];
                var childRow = rows[row.index + 1];
                var totalColSpan = 0;
                var column;
                var cell;
                for (var idx = 0; idx < columns.length; idx++) {
                    column = columns[idx];
                    if (this._isColumnVisible(column)) {
                        cell = {
                            title: column.title || column.field,
                            colSpan: 0
                        };
                        row.cells.push(cell);
                        if (column.columns && column.columns.length) {
                            if (!childRow) {
                                childRow = {
                                    rowSpan: 0,
                                    cells: [],
                                    index: rows.length
                                };
                                rows.push(childRow);
                            }
                            cell.colSpan = this._trimColumns(this._visibleColumns(column.columns)).length;
                            this._prepareHeaderRows(rows, column.columns, cell, childRow);
                            totalColSpan += cell.colSpan - 1;
                            row.rowSpan = rows.length - row.index;
                        }
                    }
                }
                if (parentCell) {
                    parentCell.colSpan += totalColSpan;
                }
            },
            _rows: function () {
                var groups = this.dataSource.group();
                var rows = this._dataRows(this.dataSource.view(), 0);
                if (this.columns.length) {
                    this._prependHeaderRows(rows);
                    var footer = false;
                    var cells = $.map(this.columns, $.proxy(function (column) {
                        if (column.footerTemplate) {
                            footer = true;
                            var aggregates = this.dataSource.aggregates();
                            return {
                                background: '#dfdfdf',
                                color: '#333',
                                value: column.footerTemplate($.extend({}, aggregates, aggregates[column.field]))
                            };
                        } else {
                            return {
                                background: '#dfdfdf',
                                color: '#333'
                            };
                        }
                    }, this));
                    if (footer) {
                        rows.push({
                            type: 'footer',
                            cells: $.map(new Array(groups.length), function () {
                                return {
                                    background: '#dfdfdf',
                                    color: '#333'
                                };
                            }).concat(cells)
                        });
                    }
                }
                return rows;
            },
            _headerDepth: function (columns) {
                var result = 1;
                var max = 0;
                for (var idx = 0; idx < columns.length; idx++) {
                    if (columns[idx].columns) {
                        var temp = this._headerDepth(columns[idx].columns);
                        if (temp > max) {
                            max = temp;
                        }
                    }
                }
                return result + max;
            },
            _freezePane: function () {
                var columns = this._visibleColumns(this.options.columns || []);
                var colSplit = this._visibleColumns(this._trimColumns(this._leafColumns($.grep(columns, function (column) {
                    return column.locked;
                })))).length;
                return {
                    rowSplit: this._headerDepth(columns),
                    colSplit: colSplit ? colSplit + this.dataSource.group().length : 0
                };
            },
            _cell: function (dataItem, column) {
                return { value: column.value(dataItem) };
            },
            _hierarchical: function () {
                return this.options.hierarchy && this.dataSource.level;
            },
            _depth: function () {
                var dataSource = this.dataSource;
                var depth = 0;
                var view, i, level;
                if (this._hierarchical()) {
                    view = dataSource.view();
                    for (i = 0; i < view.length; i++) {
                        level = dataSource.level(view[i]);
                        if (level > depth) {
                            depth = level;
                        }
                    }
                    depth++;
                } else {
                    depth = dataSource.group().length;
                }
                return depth;
            },
            _columns: function () {
                var depth = this._depth();
                var columns = $.map(new Array(depth), function () {
                    return { width: 20 };
                });
                return columns.concat($.map(this.columns, function (column) {
                    return {
                        width: parseInt(column.width, 10),
                        autoWidth: column.width ? false : true
                    };
                }));
            }
        });
        kendo.ExcelMixin = {
            extend: function (proto) {
                proto.events.push('excelExport');
                proto.options.excel = $.extend(proto.options.excel, this.options);
                proto.saveAsExcel = this.saveAsExcel;
            },
            options: {
                proxyURL: '',
                allPages: false,
                filterable: false,
                fileName: 'Export.xlsx'
            },
            saveAsExcel: function () {
                var excel = this.options.excel || {};
                var exporter = new kendo.ExcelExporter({
                    columns: this.columns,
                    dataSource: this.dataSource,
                    allPages: excel.allPages,
                    filterable: excel.filterable,
                    hierarchy: excel.hierarchy
                });
                exporter.workbook().then($.proxy(function (book, data) {
                    if (!this.trigger('excelExport', {
                            workbook: book,
                            data: data
                        })) {
                        var workbook = new kendo.ooxml.Workbook(book);
                        kendo.saveAs({
                            dataURI: workbook.toDataURL(),
                            fileName: book.fileName || excel.fileName,
                            proxyURL: excel.proxyURL,
                            forceProxy: excel.forceProxy
                        });
                    }
                }, this));
            }
        };
    }(kendo.jQuery, kendo));
    return kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));