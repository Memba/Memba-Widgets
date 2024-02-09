/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        Class = kendo.Class;

    var Command = Class.extend({
        init: function(options) {
            this.options = options;
            this.grid = options.grid;
        }
    });

    var MoveGroupCommand = Command.extend({
        exec: function() {
            var that = this,
                grid = that.grid,
                groupable = grid.groupable,
                options = that.options,
                target = options.target.closest(".k-chip"),
                method = options.dir === "next" ? "after" : "before",
                position = options.dir === "next" ? target.next() : target.prev();

            position[method](target);
            groupable._change();
        },
    });

    var SortCommand = Command.extend({
        exec: function() {
            var that = this,
                grid = that.grid,
                dataSource = grid.dataSource,
                sort = dataSource.sort() || [],
                options = that.options,
                dir = options.dir,
                field = grid._getCellField(options.target),
                multipleMode = grid.options.sortable.mode && grid.options.sortable.mode === "multiple",
                compare = grid.options.compare,
                length, idx;

            if (multipleMode) {
                for (idx = 0, length = sort.length; idx < length; idx++) {
                    if (sort[idx].field === field) {
                        sort.splice(idx, 1);
                        break;
                    }
                }
                sort.push({ field: field, dir: dir, compare: compare });
            } else {
                sort = [{ field: field, dir: dir, compare: compare }];
            }

            dataSource.sort(sort);
        },
    });

    var AddCommand = Command.extend({
        exec: function() {
            var that = this,
                grid = that.grid;

            grid.addRow();
        }
    });

    var EditCommand = Command.extend({
        exec: function() {
            var that = this,
                grid = that.grid,
                inCellMode = grid._editMode() === "incell",
                target = inCellMode ? that.options.target : that.options.target.closest("tr");

            if (inCellMode) {
                grid.editCell(target);
            } else {
                grid.editRow(target);
            }
        }
    });

    var DeleteCommand = Command.extend({
        exec: function() {
            var that = this,
                grid = that.grid,
                target = that.options.target.closest("tr");

            grid.removeRow(target);
        }
    });

    var CopySelectionCommand = Command.extend({
        exec: function() {
            var that = this,
                grid = that.grid,
                withHeaders = that.options.withHeaders;

            grid.copySelectionToClipboard(withHeaders);
        }
    });

    var SelectRowCommand = Command.extend({
        exec: function() {
            var that = this,
                grid = that.grid,
                selectMode = kendo.ui.Selectable.parseOptions(grid.options.selectable),
                target = that.options.target.closest("tr");

            grid.select(selectMode.cell ? target.find('td') : target);
        }
    });

    var SelectAllRowsCommand = Command.extend({
        exec: function() {
            var that = this,
                grid = that.grid,
                selectMode = kendo.ui.Selectable.parseOptions(grid.options.selectable),
                rows = grid.items();

            grid.select(selectMode.cell ? rows.find('td') : rows);
        }
    });

    var ClearSelectionCommand = Command.extend({
        exec: function() {
            var that = this,
                grid = that.grid;

            grid.clearSelection();
        }
    });

    var ReorderRowCommand = Command.extend({
        exec: function() {
            var that = this,
                grid = that.grid,
                dir = that.options.dir,
                target = that.options.target.closest("tr"),
                index = target.index(),
                newIndex;

            switch (dir) {
                case "up":
                    newIndex = index - 1;
                    break;
                case "down":
                    newIndex = index + 2;
                    break;
                case "top":
                    newIndex = 0;
                    break;
                case "bottom":
                    newIndex = grid.items().length;
                    break;
            }

            grid.reorderRowTo(target, newIndex);
        }
    });

    var ExportPDFCommand = Command.extend({
        exec: function() {
            var that = this,
                grid = that.grid;

            grid.saveAsPDF();
        }
    });

    var ExportExcelCommand = Command.extend({
        exec: function() {
            var that = this,
                selection = that.options.selection,
                withHeaders = that.options.withHeaders,
                grid = that.grid;

            if (selection) {
                grid.exportSelectedToExcel(withHeaders);
            } else {
                grid.saveAsExcel();
            }
        }
    });

    kendo.ui.grid = kendo.ui.grid || {};

    extend(kendo.ui.grid, {
        GridCommand: Command,
        commands: {
            SortCommand: SortCommand,
            AddCommand: AddCommand,
            EditCommand: EditCommand,
            DeleteCommand: DeleteCommand,
            CopySelectionCommand: CopySelectionCommand,
            SelectRowCommand: SelectRowCommand,
            SelectAllRowsCommand: SelectAllRowsCommand,
            ClearSelectionCommand: ClearSelectionCommand,
            ReorderRowCommand: ReorderRowCommand,
            ExportPDFCommand: ExportPDFCommand,
            ExportExcelCommand: ExportExcelCommand,
            MoveGroupCommand: MoveGroupCommand
        }
    });
})(window.kendo.jQuery);