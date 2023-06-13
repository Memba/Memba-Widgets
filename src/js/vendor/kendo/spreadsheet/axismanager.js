/**
 * Kendo UI v2023.1.425 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */

import "../kendo.core.js";

(function(kendo) {

    var AxisManager = kendo.Class.extend({
        init: function(sheet) {
            this._sheet = sheet;
        },

        forEachSelectedColumn: function(callback) {
            var sheet = this._sheet;

            sheet.batch(function() {
                sheet.select().forEachColumnIndex(function(index, i) {
                    callback(sheet, index, i);
                });
            }, { layout: true, recalc: true });
        },

        forEachSelectedRow: function(callback) {
            var sheet = this._sheet;

            sheet.batch(function() {
                sheet.select().forEachRowIndex(function(index, i) {
                    callback(sheet, index, i);
                });
            }, { layout: true, recalc: true });
        },

        includesHiddenColumns: function(ref) {
            return this._sheet._grid._columns.includesHidden(ref.topLeft.col, ref.bottomRight.col);
        },

        includesHiddenRows: function(ref) {
            return this._sheet._grid._rows.includesHidden(ref.topLeft.row, ref.bottomRight.row);
        },

        selectionIncludesHiddenColumns: function() {
            return this.includesHiddenColumns(this._sheet.select());
        },

        selectionIncludesHiddenRows: function() {
            return this.includesHiddenRows(this._sheet.select());
        },

        deleteSelectedColumns: function() {
            var indexes = [], delta = 0;
            this.forEachSelectedColumn(function(sheet, index) {
                index -= delta;
                if (sheet.isHiddenColumn(index)) {
                    return;
                }
                delta++;
                var formulas = [];
                indexes.unshift({
                    index    : index,
                    formulas : formulas,
                    width    : sheet.columnWidth(index)
                });
                sheet._saveModifiedFormulas(formulas, function(){
                    sheet.deleteColumn(index);
                });
            });
            return indexes;
        },

        deleteSelectedRows: function() {
            var indexes = [], delta = 0;
            this.forEachSelectedRow(function(sheet, index) {
                index -= delta;
                if (sheet.isHiddenRow(index)) {
                    return;
                }
                delta++;
                var formulas = [];
                indexes.unshift({
                    index    : index,
                    formulas : formulas,
                    height   : sheet.rowHeight(index)
                });
                sheet._saveModifiedFormulas(formulas, function(){
                    sheet.deleteRow(index);
                });
            });
            return indexes;
        },

        hideSelectedColumns: function() {
            this.forEachSelectedColumn(function(sheet, index) {
                sheet.hideColumn(index);
            });
            var sheet = this._sheet;
            var ref = sheet.select().toRangeRef();
            var left = ref.topLeft.col;
            var right = ref.bottomRight.col;
            var sel = null;
            while (true) {
                var hasRight = right < sheet._columns._count;
                var hasLeft = left >= 0;
                if (!hasLeft && !hasRight) {
                    break;
                }
                if (hasRight && !sheet.isHiddenColumn(right)) {
                    sel = right;
                    break;
                }
                if (hasLeft && !sheet.isHiddenColumn(left)) {
                    sel = left;
                    break;
                }
                left--;
                right++;
            }
            if (sel !== null) {
                ref = new kendo.spreadsheet.RangeRef(
                    new kendo.spreadsheet.CellRef(0, sel),
                    new kendo.spreadsheet.CellRef(sheet._rows._count - 1, sel)
                );
                sheet.range(ref).select();
            }
        },

        hideSelectedRows: function() {
            this.forEachSelectedRow(function(sheet, index) {
                sheet.hideRow(index);
            });
            var sheet = this._sheet;
            var ref = sheet.select().toRangeRef();
            var top = ref.topLeft.row;
            var bottom = ref.bottomRight.row;
            var sel = null;
            while (true) {
                var hasBottom = bottom < sheet._rows._count;
                var hasTop = top >= 0;
                if (!hasTop && !hasBottom) {
                    break;
                }
                if (hasBottom && !sheet.isHiddenRow(bottom)) {
                    sel = bottom;
                    break;
                }
                if (hasTop && !sheet.isHiddenRow(top)) {
                    sel = top;
                    break;
                }
                top--;
                bottom++;
            }
            if (sel !== null) {
                ref = new kendo.spreadsheet.RangeRef(
                    new kendo.spreadsheet.CellRef(sel, 0),
                    new kendo.spreadsheet.CellRef(sel, sheet._columns._count - 1)
                );
                sheet.range(ref).select();
            }
        },

        unhideSelectedColumns: function() {
            this.forEachSelectedColumn(function(sheet, index) {
                sheet.unhideColumn(index);
            });
        },

        unhideSelectedRows: function() {
            this.forEachSelectedRow(function(sheet, index) {
                sheet.unhideRow(index);
            });
        },

        addColumnLeft: function() {
            var sheet = this._sheet;
            var base, count = 0;
            sheet.batch(function(){
                sheet.select().forEachColumnIndex(function(index) {
                    if (!base) {
                        base = index;
                    }
                    sheet.insertColumn(base);
                    ++count;
                });
            }, { recalc: true, layout: true });
            return { base: base, count: count };
        },

        addColumnRight: function() {
            var sheet = this._sheet;
            var base, count = 0;
            sheet.batch(function(){
                sheet.select().forEachColumnIndex(function(index) {
                    base = index + 1;
                    ++count;
                });
                for (var i = 0; i < count; ++i) {
                    sheet.insertColumn(base);
                }
            }, { recalc: true, layout: true });
            return { base: base, count: count };
        },

        addRowAbove: function() {
            var sheet = this._sheet;
            var base, count = 0;
            var selectedRows = sheet.select();

            sheet.batch(function(){
                selectedRows.forEachRowIndex(function(index) {
                    if (!base) {
                        base = index;
                    }
                    sheet.insertRow(base);
                    ++count;
                });
            }, { recalc: true, layout: true });

            return { base: base, count: count };
        },

        addRowBelow: function() {
            var sheet = this._sheet;
            var base, count = 0;

            sheet.batch(function(){
                sheet.select().forEachRowIndex(function(index) {
                    base = index + 1;
                    ++count;
                });
                for (var i = 0; i < count; ++i) {
                    sheet.insertRow(base);
                }
            }, { recalc: true, layout: true });

            return { base: base, count: count };
        }
    });

    kendo.spreadsheet.AxisManager = AxisManager;
})(kendo);
