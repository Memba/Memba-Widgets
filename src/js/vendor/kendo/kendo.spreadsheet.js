/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./util/undoredostack.js";
import "./util/text-metrics.js";
import "./util/parse-xml.js";
import "./kendo.excel.js";
import "./kendo.progressbar.js";
import "./kendo.pdf.js";
import "./spreadsheet/commands.js";
import "./spreadsheet/formulabar.js";
import "./spreadsheet/formulainput.js";
import "./spreadsheet/eventlistener.js";
import "./spreadsheet/rangelist.js";
import "./spreadsheet/propertybag.js";
import "./spreadsheet/references.js";
import "./spreadsheet/navigator.js";
import "./spreadsheet/axismanager.js";
import "./spreadsheet/clipboard.js";
import "./spreadsheet/range.js";
import "./spreadsheet/sheet.js";
import "./spreadsheet/sheetsbar.js";
import "./spreadsheet/excel-reader.js";
import "./spreadsheet/workbook.js";
import "./spreadsheet/formulacontext.js";
import "./spreadsheet/controller.js";
import "./spreadsheet/view.js";
import "./spreadsheet/customeditors.js";
import "./spreadsheet/grid.js";
import "./spreadsheet/axis.js";
import "./spreadsheet/filter.js";
import "./spreadsheet/sorter.js";
import "./spreadsheet/runtime.js";
import "./spreadsheet/calc.js";
import "./spreadsheet/numformat.js";
import "./spreadsheet/runtime.functions.js";
import "./spreadsheet/runtime.functions.2.js";
import "./spreadsheet/toolbar.js";
import "./spreadsheet/dialogs.js";
import "./spreadsheet/sheetbinder.js";
import "./spreadsheet/filtermenu.js";
import "./spreadsheet/editor.js";
import "./spreadsheet/autofill.js";
import "./spreadsheet/nameeditor.js";
import "./spreadsheet/print.js";
    var __meta__ = {
        id: "spreadsheet",
        name: "Spreadsheet",
        category: "web",
        description: "Spreadsheet component",
        depends: [
            "core", "binder", "colorpicker", "combobox", "data", "dom", "dropdownlist",
            "menu", "ooxml", "popup", "sortable", "tabstrip", "toolbar", "treeview",
            "window", "validator", "excel", "pdf", "drawing" ]
    };

    (function(kendo, undefined) {
        if (kendo.support.browser.msie && kendo.support.browser.version < 9) {
            return;
        }

        var $ = kendo.jQuery;
        var keys = $.extend({ F10: 121, F11: 122, B: 66, I: 73, U: 85, N: 78, H: 72, A: 65, PAGEDOWN: 34, PAGEUP: 33, DELETE: 46, R: 82 }, kendo.keys);
        var Widget = kendo.ui.Widget;
        var Workbook = kendo.spreadsheet.Workbook;
        var Controller = kendo.spreadsheet.Controller;
        var View = kendo.spreadsheet.View;
        var NS = ".kendoSpreadsheet";

        var ALL_REASONS = {
            recalc: true,
            selection: true,
            activeCell: true,
            layout: true,
            sheetSelection: true,
            resize: true,
            editorChange: false,
            editorClose: false
        };

        var classNames = {
            wrapper: "k-widget k-spreadsheet"
        };

        var Spreadsheet = kendo.ui.Widget.extend({
            init: function(element, options) {
                Widget.fn.init.call(this, element, options);

                this.element.addClass(Spreadsheet.classNames.wrapper);
                this.element.attr("role", "application");

                this._view = new View(this.element, {
                    messages: this.options.messages.view,
                    toolbar: this.options.toolbar,
                    sheetsbar: this.options.sheetsbar
                });

                this._workbook = new Workbook(this.options, this._view);

                this._controller = new Controller(this._view, this._workbook);

                this._autoRefresh = true;

                this._bindWorkbookEvents();

                this._view.workbook(this._workbook);

                this._view.enableClipboard(false);
                this.refresh();
                this._view.enableClipboard(true);

                this._resizeHandler = function() { this.resize(); }.bind(this);
                $(window).on("resize" + NS, this._resizeHandler);

                this.element.on("keydown" + NS, this._keyDown.bind(this));
            },

            _keyDown: function(e) {
                var key = e.keyCode;

                if (key === keys.F11 && e.shiftKey) {
                    this._view.sheetsbar._onAddSelect();
                    e.preventDefault();
                    return;
                } else if (e.altKey && key === keys.PAGEDOWN) {
                    this._view.sheetsbar.trigger("select", {
                                    name: this._view.sheetsbar._sheets[this._view.sheetsbar._selectedIndex + 1].name(),
                                    isAddButton: false
                    });
                } else if (e.altKey && key === keys.PAGEUP) {
                    this._view.sheetsbar.trigger("select", {
                                    name: this._view.sheetsbar._sheets[this._view.sheetsbar._selectedIndex - 1].name(),
                                    isAddButton: false
                    });
                } else if (e.altKey && key === keys.DELETE) {
                    var closeCallback = function(e) {
                        var dlg = e.sender;

                        if (dlg.isConfirmed()) {
                            this._view.sheetsbar.trigger("remove", { name: this.activeSheet()._name(), confirmation: true });
                        }
                    }.bind(this);

                    this._view.sheetsbar._openDialog("confirmation", {
                        close: closeCallback
                    });
                    e.preventDefault();
                    return;
                } else if (e.altKey && key === keys.R) {
                    this._view.sheetsbar._createEditor();
                    e.preventDefault();
                    return;
                } else if (e.ctrlKey && key === keys.B) {
                    $("[data-tool=bold]")[0].click();
                } else if (e.ctrlKey && key === keys.I) {
                    $("[data-tool=italic]")[0].click();
                } else if (e.ctrlKey && key === keys.U) {
                    $("[data-tool=underline]")[0].click();
                } else if (e.altKey && key === keys.H) {
                    this._view.tabstrip.select(0);
                    e.preventDefault();
                    return;
                } else if (e.altKey && key === keys.N) {
                    this._view.tabstrip.select(1);
                    e.preventDefault();
                    return;
                } else if (e.altKey && key === keys.A) {
                    this._view.tabstrip.select(2);
                    e.preventDefault();
                    return;
                }
            },

            _resize: function() {
                this.refresh({ layout: true });
            },

            _workbookChanging: function(e) {
                if (this.trigger("changing", e)) {
                    e.preventDefault();
                }
            },

            _workbookChange: function(e) {
                if (this._autoRefresh) {
                    this.refresh(e);
                }

                if (e.recalc && e.ref) {
                    var range = e.range || new kendo.spreadsheet.Range(e.ref, this.activeSheet());
                    this.trigger("change", { range: range });
                }
            },

            _workbookCut: function(e) {
                this.trigger("cut", e);
            },

            _workbookCopy: function(e) {
                this.trigger("copy", e);
            },

            _workbookPaste: function(e) {
                this.trigger("paste", e);
            },

            activeSheet: function(sheet) {
                return this._workbook.activeSheet(sheet);
            },

            moveSheetToIndex: function(sheet, index) {
                return this._workbook.moveSheetToIndex(sheet, index);
            },

            insertSheet: function(options) {
                return this._workbook.insertSheet(options);
            },

            sheets: function() {
                return this._workbook.sheets();
            },

            removeSheet: function(sheet) {
                return this._workbook.removeSheet(sheet);
            },

            sheetByName: function(sheetName) {
                return this._workbook.sheetByName(sheetName);
            },

            sheetIndex: function(sheet) {
                return this._workbook.sheetIndex(sheet);
            },

            sheetByIndex: function(index) {
                return this._workbook.sheetByIndex(index);
            },

            renameSheet: function(sheet, newSheetName) {
                return this._workbook.renameSheet(sheet, newSheetName);
            },

            refresh: function(reason) {
                if (!reason) {
                    reason = ALL_REASONS;
                }

                if (!reason.editorClose) {
                    this._view.sheet(this._workbook.activeSheet());
                    this._controller.sheet(this._workbook.activeSheet());

                    this._workbook.refresh(reason);
                }

                if (!reason.editorChange) {
                    this._view.refresh(reason);
                    this._controller.refresh();

                    this._view.render(reason);
                    this.trigger("render");
                }

                return this;
            },

            openDialog: function(name, options) {
                return this._view.openDialog(name, options);
            },

            autoRefresh: function(value) {
                if (value !== undefined) {
                    this._autoRefresh = value;

                    if (value === true) {
                        this.refresh();
                    }

                    return this;
                }

                return this._autoRefresh;
            },

            toJSON: function() {
                return this._workbook.toJSON();
            },

            fromJSON: function(json) {
                if (json.sheets) {
                    this._workbook.destroy();

                    this._workbook = new Workbook($.extend({}, this.options, json));

                    this._bindWorkbookEvents();

                    this._view.workbook(this._workbook);
                    this._controller.workbook(this._workbook);

                    this.activeSheet(this.activeSheet());
                } else {
                    this.refresh();
                }
            },

            saveJSON: function() {
                return this._workbook.saveJSON();
            },

            fromFile: function(blob, name) {
                return this._workbook.fromFile(blob, name);
            },

            saveAsPDF: function(options) {
                this._workbook.saveAsPDF(
                    $.extend({}, this.options.pdf, options, { workbook: this._workbook })
                );
            },

            saveAsExcel: function(options) {
                this._workbook.saveAsExcel(options);
            },

            draw: function(options, callback) {
                this._workbook.draw(options, callback);
            },

            _workbookExcelExport: function(e) {
                if (this.trigger("excelExport", e)) {
                    e.preventDefault();
                }
            },

            _workbookExcelImport: function(e) {
                if (this.trigger("excelImport", e)) {
                    e.preventDefault();
                } else {
                    this._initProgress(e.promise);
                }
            },

            _initProgress: function(deferred) {
                var loading =
                    $("<div class='k-loading-mask' " +
                           "style='width: 100%; height: 100%; top: 0;'>" +
                        "<div class='k-loading-color'></div>" +
                    "</div>")
                    .appendTo(this.element);

                var pb = $("<div class='k-loading-progress'>")
                .appendTo(loading)
                .kendoProgressBar({
                    type: "chunk", chunkCount: 10,
                    min: 0, max: 1, value: 0
                }).data("kendoProgressBar");

                deferred.progress(function(e) {
                    pb.value(e.progress);
                })
                .always(function() {
                    kendo.destroy(loading);
                    loading.remove();
                });
            },

            _workbookPdfExport: function(e) {
                if (this.trigger("pdfExport", e)) {
                    e.preventDefault();
                }
            },

            _workbookInsertSheet: function(e) {
                if (this.trigger("insertSheet", e)) {
                    e.preventDefault();
                }
            },

            _workbookRemoveSheet: function(e) {
                if (this.trigger("removeSheet", e)) {
                    e.preventDefault();
                }
            },

            _workbookSelectSheet: function(e) {
                if (this.trigger("selectSheet", e)) {
                    e.preventDefault();
                }
            },

            _workbookRenameSheet: function(e) {
                if (this.trigger("renameSheet", e)) {
                    e.preventDefault();
                }
            },

            _workbookInsertRow: function(e) {
                if (this.trigger("insertRow", e)) {
                    e.preventDefault();
                }
            },

            _workbookInsertColumn: function(e) {
                if (this.trigger("insertColumn", e)) {
                    e.preventDefault();
                }
            },

            _workbookDeleteRow: function(e) {
                if (this.trigger("deleteRow", e)) {
                    e.preventDefault();
                }
            },

            _workbookDeleteColumn: function(e) {
                if (this.trigger("deleteColumn", e)) {
                    e.preventDefault();
                }
            },

            _workbookHideRow: function(e) {
                if (this.trigger("hideRow", e)) {
                    e.preventDefault();
                }
            },

            _workbookHideColumn: function(e) {
                if (this.trigger("hideColumn", e)) {
                    e.preventDefault();
                }
            },

            _workbookUnhideRow: function(e) {
                if (this.trigger("unhideRow", e)) {
                    e.preventDefault();
                }
            },

            _workbookUnhideColumn: function(e) {
                if (this.trigger("unhideColumn", e)) {
                    e.preventDefault();
                }
            },

            _workbookSelect: function(e) {
                this.trigger("select", e);
            },

            _workbookChangeFormat: function(e) {
               this.trigger("changeFormat", e);
            },

            _workbookDataBinding: function(e) {
                if (this.trigger("dataBinding", e)) {
                    e.preventDefault();
                }
            },

            _workbookDataBound: function(e) {
                this.trigger("dataBound", e);
            },

            _workbookProgress: function(e) {
                kendo.ui.progress(this.element, e.toggle);
            },

            _bindWorkbookEvents: function() {
                this._workbook.bind("cut", this._workbookCut.bind(this));
                this._workbook.bind("copy", this._workbookCopy.bind(this));
                this._workbook.bind("paste", this._workbookPaste.bind(this));
                this._workbook.bind("changing", this._workbookChanging.bind(this));
                this._workbook.bind("change", this._workbookChange.bind(this));
                this._workbook.bind("excelExport", this._workbookExcelExport.bind(this));
                this._workbook.bind("excelImport", this._workbookExcelImport.bind(this));
                this._workbook.bind("pdfExport", this._workbookPdfExport.bind(this));
                this._workbook.bind("insertSheet", this._workbookInsertSheet.bind(this));
                this._workbook.bind("removeSheet", this._workbookRemoveSheet.bind(this));
                this._workbook.bind("selectSheet", this._workbookSelectSheet.bind(this));
                this._workbook.bind("renameSheet", this._workbookRenameSheet.bind(this));
                this._workbook.bind("insertRow", this._workbookInsertRow.bind(this));
                this._workbook.bind("insertColumn", this._workbookInsertColumn.bind(this));
                this._workbook.bind("deleteRow", this._workbookDeleteRow.bind(this));
                this._workbook.bind("deleteColumn", this._workbookDeleteColumn.bind(this));
                this._workbook.bind("hideRow", this._workbookHideRow.bind(this));
                this._workbook.bind("hideColumn", this._workbookHideColumn.bind(this));
                this._workbook.bind("unhideRow", this._workbookUnhideRow.bind(this));
                this._workbook.bind("unhideColumn", this._workbookUnhideColumn.bind(this));
                this._workbook.bind("select", this._workbookSelect.bind(this));
                this._workbook.bind("changeFormat", this._workbookChangeFormat.bind(this));
                this._workbook.bind("dataBinding", this._workbookDataBinding.bind(this));
                this._workbook.bind("dataBound", this._workbookDataBound.bind(this));
                this._workbook.bind("progress", this._workbookProgress.bind(this));
            },

            destroy: function() {
                kendo.ui.Widget.fn.destroy.call(this);

                this._workbook.destroy();
                this._controller.destroy();
                this._view.destroy();

                if (this._resizeHandler) {
                    $(window).off("resize" + NS, this._resizeHandler);
                }
            },

            options: {
                name: "Spreadsheet",
                toolbar: true,
                sheetsbar: true,
                rows: 200,
                columns: 50,
                rowHeight: 20,
                columnWidth: 64,
                headerHeight: 20,
                headerWidth: 32,
                excel: {
                    proxyURL: "",
                    fileName: "Workbook.xlsx"
                },
                messages: {},
                pdf: {
                    // which part of the workbook to be exported
                    area: "workbook",
                    fileName: "Workbook.pdf",
                    proxyURL: "",
                    // paperSize can be an usual name, i.e. "A4", or an array of two Number-s specifying the
                    // width/height in points (1pt = 1/72in), or strings including unit, i.e. "10mm".  Supported
                    // units are "mm", "cm", "in" and "pt".  The default "auto" means paper size is determined
                    // by content.
                    paperSize: "a4",
                    // True to reverse the paper dimensions if needed such that width is the larger edge.
                    landscape: true,
                    // An object containing { left, top, bottom, right } margins with units.
                    margin: null,
                    // Optional information for the PDF Info dictionary; all strings except for the date.
                    title: null,
                    author: null,
                    subject: null,
                    keywords: null,
                    creator: "Kendo UI PDF Generator v." + kendo.version,
                    // Creation Date; defaults to new Date()
                    date: null
                },
                defaultCellStyle: {
                    fontFamily: "Arial",
                    fontSize: 12
                },
                useCultureDecimals: false
            },

            defineName: function(name, value, hidden) {
                return this._workbook.defineName(name, value, hidden);
            },

            undefineName: function(name) {
                return this._workbook.undefineName(name);
            },

            nameValue: function(name) {
                return this._workbook.nameValue(name);
            },

            forEachName: function(func) {
                return this._workbook.forEachName(func);
            },

            cellContextMenu: function() {
                return this._view.cellContextMenu;
            },

            rowHeaderContextMenu: function() {
                return this._view.rowHeaderContextMenu;
            },

            colHeaderContextMenu: function() {
                return this._view.colHeaderContextMenu;
            },

            addImage: function(image) {
                return this._workbook.addImage(image);
            },

            cleanupImages: function() {
                return this._workbook.cleanupImages();
            },

            events: [
                "cut",
                "copy",
                "paste",
                "pdfExport",
                "excelExport",
                "excelImport",
                "changing",
                "change",
                "render",
                "removeSheet",
                "selectSheet",
                "renameSheet",
                "insertRow",
                "insertColumn",
                "deleteRow",
                "insertSheet",
                "deleteColumn",
                "hideRow",
                "hideColumn",
                "unhideRow",
                "unhideColumn",
                "select",
                "changeFormat",
                "dataBinding",
                "dataBound"
            ]
        });

        kendo.spreadsheet.ALL_REASONS = ALL_REASONS;
        kendo.ui.plugin(Spreadsheet);
        $.extend(true, Spreadsheet, { classNames: classNames });
    })(window.kendo);

