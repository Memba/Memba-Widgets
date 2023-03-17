/**
 * Kendo UI v2023.1.314 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";

(function(kendo) {

    var $ = kendo.jQuery;
    var CellRef = kendo.spreadsheet.CellRef;

    var Clipboard = kendo.Class.extend({
        init: function(workbook) {
            this._content = {};
            this._externalContent = {};
            this._internalContent = {};
            this.workbook = workbook;
            this.origin = kendo.spreadsheet.NULLREF;
            this.iframe = document.createElement("iframe");
            this.iframe.className = "k-spreadsheet-clipboard-paste";
            this.iframe.setAttribute("title", "Spreadsheet clipboard iframe");
            this.menuInvoked = false;
            this._uid = kendo.guid();
            document.body.appendChild(this.iframe);
        },

        destroy: function() {
            $(this.iframe).remove();
        },

        canCopy: function() {
            var status = {canCopy: true};
            var selection = this.workbook.activeSheet().select();
            if (selection === kendo.spreadsheet.NULLREF) {
                status.canCopy = false;
            }
            if (selection instanceof kendo.spreadsheet.UnionRef) {
                status.canCopy = false;
                status.multiSelection = true;
            }
            if (this.menuInvoked) {
                status.canCopy = false;
                status.menuInvoked = true;
            }
            return status;
        },

        canPaste: function() {
            var sheet = this.workbook.activeSheet();
            var ref = this.pasteRef();
            var range = sheet.range(ref);
            var status = { canPaste: true, pasteOnMerged: false, pasteOnDisabled: false };

            if (!range.enable()) {
                status.canPaste =  false;
                status.pasteOnDisabled = true;
            }
            if (!ref.eq(sheet.unionWithMerged(ref))) {
                status.canPaste = false;
                status.pasteOnMerged = true;
            }
            if (this.menuInvoked) {
                status.canPaste = false;
                status.menuInvoked = true;
            }
            return status;
        },

        intersectsMerged: function() {
            var sheet = this.workbook.activeSheet();
            this.parse();
            this.origin = this._content.origRef;
            var ref = this.pasteRef();
            return !ref.eq(sheet.unionWithMerged(ref));
        },

        copy: function() {
            var sheet = this.workbook.activeSheet();
            this.origin = sheet.select();
            this._internalContent = sheet.selection().getState();
            delete this._externalContent.html;
            delete this._externalContent.plain;
        },

        cut: function() {
            var sheet = this.workbook.activeSheet();
            this.copy();
            sheet.range(sheet.select()).clear();
        },

        pasteRef: function() {
            var sheet = this.workbook.activeSheet();

            // When pasting from an external source, origin will be
            // NULLREF.  Just return the destination range.
            // https://github.com/telerik/kendo-ui-core/issues/3486
            if (this.origin === kendo.spreadsheet.NULLREF) {
                return sheet.select();
            }

            var destination = sheet.activeCell().first();
            var originActiveCell = this.origin.first();
            var rowDelta = originActiveCell.row - destination.row;
            var colDelta = originActiveCell.col - destination.col;

            return this.origin.relative(rowDelta, colDelta, 3);
        },

        paste: function() {
            var sheet = this.workbook.activeSheet();
            var pasteRef = this.pasteRef();
            if (pasteRef.bottomRight.row >= sheet._rows._count || pasteRef.bottomRight.col >= sheet._columns._count) {
                sheet.resize(
                    Math.max(pasteRef.bottomRight.row + 1, sheet._rows._count),
                    Math.max(pasteRef.bottomRight.col + 1, sheet._columns._count)
                );
            }
            sheet.range(pasteRef).setState(this._content, this);
            sheet.triggerChange({ recalc: true, ref: pasteRef });
        },

        external: function(data) {
            if (data && (data.html || data.plain)) {
                this._externalContent = data;
            } else {
                return this._externalContent;
            }
        },

        isExternal: function() {
            return !this._isInternal();
        },

        parse: function() {
            var state;

            if (this._isInternal()) {
                state = this._internalContent;
            } else {
                var data = this._externalContent;
                state = data.plain ? parseTSV(data.plain) : newState();
                if (data.html) {
                    var doc = this.iframe.contentWindow.document;
                    doc.open();
                    doc.write(data.html);
                    doc.close();
                    var table = doc.querySelector("table");
                    if (table) {
                        var richState = parseHTML(table);

                        // fixup #### values that are sent by Excel when the column is too
                        // narrow. It turns out that the plain text clipboard data contains the
                        // actual values. https://github.com/telerik/kendo-ui-core/issues/5277
                        richState.data.forEach(function(rowData, rowIndex){
                            rowData.forEach(function(colData, colIndex){
                                if (/^\s*#+\s*$/.test(colData.value)) {
                                    colData.value = state.data[rowIndex][colIndex].value;
                                }
                            });
                        });
                        state = richState;
                    }
                }
                this.origin = state.origRef;
            }

            this._content = state;
        },

        _isInternal: function() {
            if (this._externalContent.html === undefined) {
                return true;
            }
            var internalHTML = $("<div/>").html(this._externalContent.html).find("table.kendo-clipboard-"+ this._uid).length ? true : false;
            var internalPlain = $("<div/>").html(this._externalContent.plain).find("table.kendo-clipboard-"+ this._uid).length ? true : false;
            return (internalHTML || internalPlain);
        }
    });
    kendo.spreadsheet.Clipboard = Clipboard;

    function newState() {
        var ref = new CellRef(0, 0, 0);
        return {
            ref         : ref,
            mergedCells : [],
            data        : [],
            foreign     : true,
            origRef     : ref.toRangeRef()
        };
    }

    function setStateData(state, row, col, value) {
        var data = state.data || (state.data = []);
        if (!data[row]) {
            data[row] = [];
        }
        data[row][col] = value;
        var br = state.origRef.bottomRight;
        br.row = Math.max(br.row, row);
        br.col = Math.max(br.col, col);
    }

    function stripStyle(style) {
        return style.replace(/^-(?:ms|moz|webkit)-/, "");
    }

    function borderObject(element, styles) {
        // MS Office uses class name and writes borders in the <style> section, so for it we need to
        // use the computed styles.  For Google Sheets / LibreOffice, however, the inline styles are
        // more accurate.
        if (!element.className) {
            styles = element.style;
        }
        var obj = {};
        [
            "borderBottom",
            "borderRight",
            "borderLeft",
            "borderTop"
        ].forEach(function(key) {
            var width = styles[key + "Width"];
            if (width) {
                width = parseInt(width, 10);
            }
            if (width) {
                obj[key] = {
                    size: width,
                    color: styles[key + "Color"] || "#000"
                };
            }
        });
        return obj;
    }

    function cellState(row, col, element, hBorders, vBorders) {
        var styles = window.getComputedStyle(element);
        var value, format, formula;

        // google sheets
        if ((value = element.getAttribute("data-sheets-value"))) {
            value = JSON.parse(value);
            value = value[value[1]];
        }
        if ((format = element.getAttribute("data-sheets-numberformat"))) {
            format = JSON.parse(format);
            format = format[format[1]];
        }
        formula = element.getAttribute("data-sheets-formula");

        // libre office
        if (value == null && format == null && formula == null) {
            value = element.getAttribute("sdval");
            format = element.getAttribute("sdnum");
            if (format) {
                // for ungoogable reasons, libreoffice prepends format strings with
                // "1033;" and sometimes with "1033;0;". discard it below.
                format = format.replace(/^1033;(?:0;)?/, "");
            }
        }

        // note: Chrome 70 appends a \t to a cell's text, which is actually mandated by the standard
        // ([1] item 6).  We remove it below.  In [2] it's suggested they might switch back to
        // previous behavior, but removing an eventual last TAB won't hurt anyway.
        //
        // [1] https://www.w3.org/TR/html53/dom.html#dom-htmlelement-innertext
        // [2] https://bugs.chromium.org/p/chromium/issues/detail?id=897373
        if (value == null) {
            value = element.innerText.replace(/\t$/, "");
        }

        var borders = borderObject(element, styles);
        var state = {
            value: value === "" ? null : value,
            formula: formula,

            borderTop    : borders.borderTop    || hBorders.get(row, col)     || null,
            borderBottom : borders.borderBottom || hBorders.get(row + 1, col) || null,
            borderLeft   : borders.borderLeft   || vBorders.get(row, col)     || null,
            borderRight  : borders.borderRight  || vBorders.get(row, col + 1) || null,

            fontSize : parseInt(styles["fontSize"], 10)
        };

        if (format != null) {
            state.format = format;
        }

        hBorders.set(row, col, state.borderTop);
        hBorders.set(row + 1, col, state.borderBottom);
        vBorders.set(row, col, state.borderLeft);
        vBorders.set(row, col + 1, state.borderRight);

        if (styles["backgroundColor"] !== "rgb(0, 0, 0)" && styles["backgroundColor"] !== "rgba(0, 0, 0, 0)") {
            state.background = styles["backgroundColor"];
        }
        if (stripStyle(styles["textAlign"]) !== "right") {
            state.textAlign = stripStyle(styles["textAlign"]);
        }
        if (styles["verticalAlign"] !== "middle") {
            state.verticalAlign = styles["verticalAlign"];
        }
        if (styles["wordWrap"] !== "normal" ) {
            state.wrap = true;
        }

        var txtElem = element.querySelector("font"); // libre office
        if (txtElem) {
            styles = window.getComputedStyle(txtElem);
        }

        if (styles.color !== "rgb(0, 0, 0)" && styles.color !== "rgba(0, 0, 0, 0)") {
            state.color = styles.color;
        }
        if (/^underline/.test(styles["textDecoration"])) {
            state.underline = true;
        }
        if (styles["fontStyle"] == "italic") {
            state.italic = true;
        }
        if (/^(?:bold|[67]00)$/i.test(styles["fontWeight"])) {
            state.bold = true;
        }

        return state;
    }

    function parseHTML(table) {
        var state = newState();

        var done = [], row = 0, col = 0;
        for (var i = 0; i < table.rows.length; ++i) {
            done.push([]);
        }
        var hBorders = new kendo.spreadsheet.calc.runtime.Matrix();
        var vBorders = new kendo.spreadsheet.calc.runtime.Matrix();

        for (var ri = 0; ri < table.rows.length; ++ri, ++row) {
            var tr = table.rows[ri];
            col = 0;
            for (var ci = 0; ci < tr.cells.length; ++ci) {
                var td = tr.cells[ci];
                var rowSpan = td.rowSpan;
                var colSpan = td.colSpan;
                while (done[row][col]) {
                    col++;
                }

                // A cell containing a long text overflowing the next (empty) cell will weirdly be
                // reported as merged by Excel (has colspan=2).  Then, Excel informatively suggests
                // us to ignore the colSpan by passing mso-ignore:colspan in the style.  Much thanks!
                // https://github.com/telerik/kendo-ui-core/issues/3760
                var style = td.getAttribute("style");
                var ignoreColspan = /mso-ignore:colspan/.test(style);

                setStateData(state, row, col, cellState(row, col, td, hBorders, vBorders));
                if (rowSpan > 1 || (colSpan > 1 && !ignoreColspan)) {
                    state.mergedCells.push(
                        new kendo.spreadsheet.RangeRef(
                            new CellRef(row, col),
                            new CellRef(row + rowSpan - 1, col + colSpan - 1)
                        ).toString());
                }
                for (var dr = row + rowSpan; --dr >= row;) {
                    for (var dc = col + colSpan; --dc >= col;) {
                        if (dr < done.length) {
                            done[dr][dc] = true;
                            if (!(dr == row && dc == col)) {
                                setStateData(state, dr, dc, {});
                            }
                        }
                    }
                }
            }
        }

        return state;
    }

    function parseTSV(data) {
        var state = newState();
        if (data.indexOf("\t") === -1 && data.indexOf("\n") == -1) {
            setStateData(state, 0, 0, { value: data });
        } else {
            var rows = data.split("\n");
            for (var ri = 0; ri < rows.length; ri++) {
                var cols = rows[ri].split("\t");
                for (var ci = 0; ci < cols.length; ci++) {
                    setStateData(state, ri, ci, { value: cols[ci] });
                }
            }
        }
        return state;
    }

})(kendo);
