/**
 * Kendo UI v2023.3.1010 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";

(function(kendo) {

    var Sorter = kendo.Class.extend({
        init: function(grid, lists) {
            this._grid = grid;
            this._lists = lists;
        },

        indices: function(rangeRef, list, ascending, indices) {
            var comparer = Sorter.ascendingComparer;

            if (ascending === false) {
                comparer = Sorter.descendingComparer;
            }

            return list.sortedIndices(this._grid.cellRefIndex(rangeRef.topLeft),
                this._grid.cellRefIndex(rangeRef.bottomRight), comparer, indices);
        },

        sortBy: function(ref, column, list, ascending, indices) {
            var sortedIndices = this.indices(ref.toColumn(column), list, ascending, indices);

            for (var ci = ref.topLeft.col; ci <= ref.bottomRight.col; ci++) {
                var start = this._grid.index(ref.topLeft.row, ci);
                var end = this._grid.index(ref.bottomRight.row, ci);

                for (var li = 0; li < this._lists.length; li++) {
                    if (start < this._lists[li].lastRangeStart()) {
                        this._lists[li].sort(start, end, sortedIndices);
                    }
                }
            }

            return sortedIndices;
        }
    });

    Sorter.ascendingComparer = function(a, b) {
        if (a === null && b === null) {
            return 0;
        }

        if (a === null) {
            return 1;
        }

        if (b === null) {
            return -1;
        }

        var typeA = typeof a;
        var typeB = typeof b;

        if (typeA === "number") {
            if (typeB === "number") {
                return a - b;
            } else {
               return -1;
            }
        }

        if (typeA === "string") {
            switch (typeB) {
                case "number":
                    return 1;
                case "string":
                    return a.localeCompare(b);
                default:
                    return -1;
            }
        }

        if (typeA === "boolean") {
            switch (typeB) {
                case "number":
                    return 1;
                case "string":
                    return 1;
                case "boolean":
                    return a - b;
                default:
                    return -1;
            }
        }

        if (a instanceof kendo.spreadsheet.calc.runtime.CalcError) {
            if (b instanceof kendo.spreadsheet.calc.runtime.CalcError) {
                return 0;
            } else {
                return 1;
            }
        }

        throw new Error("Cannot compare " + a + " and " + b);
    };

    Sorter.descendingComparer = function(a, b) {
        if (a === null && b === null) {
            return 0;
        }

        if (a === null) {
            return 1;
        }

        if (b === null) {
            return -1;
        }

        return Sorter.ascendingComparer(b, a);
    };

    kendo.spreadsheet.Sorter = Sorter;
})(kendo);
