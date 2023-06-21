/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";



    var spreadsheet = kendo.spreadsheet;
    var CellRef = spreadsheet.CellRef;
    var RangeRef = spreadsheet.RangeRef;
    var UnionRef = spreadsheet.UnionRef;
    var NameRef = spreadsheet.NameRef;
    var Ref = spreadsheet.Ref;

    var FormulaContext = kendo.Class.extend({
        init: function (workbook) {
            this.workbook = workbook;
        },

        getRefCells: function(ref, hiddenInfo, fsheet, frow, fcol, wantNulls) {
            var sheet, formula, value, i;
            if (ref instanceof CellRef) {
                sheet = this.workbook.sheetByName(ref.sheet);
                if (!sheet || !ref.valid()) {
                    return [{
                        value: new kendo.spreadsheet.calc.runtime.CalcError("REF")
                    }];
                }
                formula = sheet.formula(ref);
                value = sheet.range(ref.row, ref.col).value();

                if (wantNulls || formula != null || value != null) {
                    return [{
                        formula: formula,
                        value: value,
                        row: ref.row,
                        col: ref.col,
                        sheet: ref.sheet,
                        hidden: hiddenInfo ? (sheet.columnWidth(ref.col) === 0 || sheet.rowHeight(ref.row) === 0) : false
                    }];
                } else {
                    return [];
                }
            }
            if (ref instanceof RangeRef) {
                i = this.workbook.sheetIndex(ref.sheet);
                var states = [], n = i;
                if (ref.endSheet) {
                    // "3D" reference.
                    n = this.workbook.sheetIndex(ref.endSheet);
                    if (i > n) {
                        var tmp = i;
                        i = n;
                        n = tmp;
                    }
                }

                if (i < 0 || n < 0 || !ref.valid()) {
                    return [{
                        value: new kendo.spreadsheet.calc.runtime.CalcError("REF")
                    }];
                }

                // XXX: This is nicer, but significantly slower.
                // Should investigate why, or add some options to make
                // it faster (i.e. probably because it adds all cell
                // properties, while we only need value and formula).
                //
                //     var add = function(row, col, data){
                //         data.row = row;
                //         data.col = col;
                //         data.sheet = sheet.name();
                //         states.push(data);
                //     };
                //     while (i <= n) {
                //         sheet = this.workbook.sheetByIndex(i++);
                //         sheet.forEach(ref, add);
                //     }
                //
                // For now keep doing it "manually".

                while (i <= n) {
                    sheet = this.workbook.sheetByIndex(i++);
                    var tl = sheet._grid.normalize(ref.topLeft);
                    var br = sheet._grid.normalize(ref.bottomRight);

                    var startCellIndex = sheet._grid.cellRefIndex(tl);
                    var endCellIndex = sheet._grid.cellRefIndex(br);

                    var values = sheet._properties.iterator("value", startCellIndex, endCellIndex);

                    for (var col = tl.col; col <= br.col; ++col) {
                        for (var row = tl.row; row <= br.row; ++row) {
                            var index = sheet._grid.index(row, col);
                            formula = sheet._properties.get("formula", index);
                            value = values.at(index);
                            if (wantNulls || formula != null || value != null) {
                                states.push({
                                    formula : formula,
                                    value   : value,
                                    row     : row,
                                    col     : col,
                                    sheet   : sheet.name(),
                                    hidden  : hiddenInfo ? (sheet.columnWidth(col) === 0 || sheet.rowHeight(row) === 0) : false
                                });
                            }
                        }
                    }
                }

                return states;
            }
            if (ref instanceof UnionRef) {
                var a = [];
                for (i = 0; i < ref.refs.length; ++i) {
                    a = a.concat(this.getRefCells(ref.refs[i], hiddenInfo, fsheet, frow, fcol));
                }
                return a;
            }
            if (ref instanceof NameRef) {
                var val = this.nameValue(ref, fsheet, frow, fcol);
                // XXX: revise this
                if (val instanceof Ref) {
                    return this.getRefCells(val, hiddenInfo, fsheet, frow, fcol);
                }
                return [{
                    value: val == null ? new kendo.spreadsheet.calc.runtime.CalcError("NAME") : val
                }];
            }
            return [];
        },

        isMerged: function(ref) {
            var sheet = this.workbook.sheetByName(ref.sheet);
            return sheet.isMerged(ref);
        },

        nameValue: function(ref, fsheet, frow, fcol) {
            var val;
            if (ref.hasSheet()) {
                // qualified name
                val = this.workbook.nameValue(this._displayString(ref.print()));
            } else {
                // try local name
                ref = ref.clone().setSheet(fsheet, true);
                val = this.workbook.nameValue(this._displayString(ref.print()));
                if (val == null) {
                    // try global name
                    val = this.workbook.nameValue(this._displayString(ref.name));
                }
            }
            if (val instanceof Ref) {
                val = val.absolute(frow, fcol);
            }
            return val;
        },

        getData: function(ref, fsheet, frow, fcol, wantNulls) {
            var single = ref instanceof CellRef;
            if (ref instanceof NameRef) {
                single = this.workbook.nameValue(ref.name) instanceof CellRef;
            }
            var data = this.getRefCells(ref, false, fsheet, frow, fcol, wantNulls).map(function(cell){
                var val = cell.value;
                if (val instanceof kendo.spreadsheet.calc.runtime.Formula) {
                    val = val.value;
                }
                return val;
            });
            return single ? data[0] : data;
        },

        onFormula: function(f) {
            var sheet = this.workbook.sheetByName(f.sheet);
            var row = f.row, col = f.col, value = f.value;
            var currentFormula = sheet.formula({ row: row, col: col });
            if (currentFormula !== f) {
                // could have been deleted or modified in the mean time,
                // if the formula was asynchronous.  ignore this result.
                return false;
            }

            var arrayRange = f.arrayFormulaRange;
            if (arrayRange) {
                // `value` will always be a Matrix in this case;
                // enforced in runtime.js (Context::_resolve).  We
                // must fill only cells in arrayRange.
                var tlRow, tlCol;
                var width = value.width;
                var height = value.height;
                sheet.forEach(arrayRange, function(row, col){
                    if (tlRow === undefined) {
                        tlRow = row;
                        tlCol = col;
                    }
                    var vrow = row - tlRow;
                    var vcol = col - tlCol;
                    var val;
                    if (vrow < height && vcol < width) {
                        val = value.get(vrow, vcol);
                    } else {
                        val = new kendo.spreadsheet.calc.runtime.CalcError("N/A");
                    }
                    sheet._value(row, col, val);
                });
            }
            else {
                // formulas may return references.  if a range or union,
                // we'll just save the first cell.
                if (value instanceof Ref) {
                    value = this.getData(value, f.sheet, row, col);
                    if (Array.isArray(value)) {
                        value = value[0];
                    }
                    if (value === undefined) {
                        value = null; // clear contents
                    }
                }

                // when not saved as an array formula, a formula
                // returning a Matrix will just save the first value.
                if (value instanceof kendo.spreadsheet.calc.runtime.Matrix) {
                    value = value.get(0, 0);
                }

                sheet._value(row, col, value);
            }

            clearTimeout(sheet._formulaContextRefresh);
            sheet._formulaContextRefresh = setTimeout(function(){
                sheet.batch(function(){}, { layout: true });
            }, 50);

            return true;
        },
        _displayString: function(val) {
            if (/^[a-z_][a-z0-9_]*$/i.test(val)) {
                return val;
            }
            return "'" + val.replace(/\x27/g, "\\'") + "'";
        }
    });

    var ValidationFormulaContext = FormulaContext.extend({
        onFormula: function() {
            return true;
        }
    });

    spreadsheet.FormulaContext = FormulaContext;
    spreadsheet.ValidationFormulaContext = ValidationFormulaContext;
