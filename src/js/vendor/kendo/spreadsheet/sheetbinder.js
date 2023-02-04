/**
 * Kendo UI v2023.1.117 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";
import "../kendo.data.js";
import "./sheet.js";

(function(kendo) {



    var identity = function(o) { return o; };

    var SheetDataSourceBinder = kendo.Class.extend({
        init: function(options) {

            this.options = kendo.jQuery.extend({}, this.options, options);

            this.columns = this._normalizeColumns(this.options.columns);

            this._sheet();
            this._dataSource();

            this._header();

            this._boundRowsCount = 0;

            this.dataSource.fetch();
        },

        _sheet: function() {
            this.sheet = this.options.sheet;

            this._sheetChangeHandler = this._sheetChange.bind(this);
            this._sheetDeleteRowHandler = this._sheetDeleteRow.bind(this);
            this._sheetInsertRowHandler = this._sheetInsertRow.bind(this);

            this.sheet.bind("change", this._sheetChangeHandler)
                .bind("afterDeleteRow", this._sheetDeleteRowHandler)
                .bind("afterInsertRow", this._sheetInsertRowHandler);
        },

        _sheetInsertRow: function(e) {
            if (e.index !== undefined) {
                this.dataSource.insert(Math.max(e.index - 1, 0), {});
            }
        },

        _sheetDeleteRow: function(e) {
            if (e.index !== undefined) {
                var dataSource = this.dataSource;
                var model = dataSource.view()[e.index - 1];

                if (model) {
                    dataSource.remove(model);
                }
            }
        },

        _header: function() {
            this.sheet.batch(function() {
                this.columns.forEach(function(column, index) {
                    this.sheet.range(0,index).value(column.title);
                }.bind(this));
            }.bind(this));
        },

        _sheetChange: function(e) {
            if (e.insertRow || e.deleteRow) {
                // these actions are handled via custom events
                return;
            }

            if (e.recalc && e.ref && e.isValue) {
                var UnionRef = kendo.spreadsheet.UnionRef;
                var dataSource = this.dataSource;
                var data = dataSource.view();
                var columns = this.columns;
                var values = [];
                var sheet = this.sheet;
                var fields, getters, normalizedRef, i, rangeRef, normalizedRefs;
                var setValues = function(ref) {
                    ref = ref.toRangeRef();
                    var record;
                    var valueIndex = 0;
                    for (var ri = ref.topLeft.row; ri <= ref.bottomRight.row; ri++) {
                        record = data[ri - 1]; // skip header row

                        if (!record) {
                            record = dataSource.insert(ri - 1, {});
                            data = dataSource.view();
                        }

                        var colValueIndex = 0;
                        for (var ci = ref.topLeft.col; ci <= ref.bottomRight.col && ci < columns.length; ci++) {
                            var currentValue = values[i][valueIndex][colValueIndex++];
                            record.set(columns[ci].field, getters[ci](currentValue));
                        }
                        valueIndex++;
                    }
                };

                if (dataSource.reader.model) {
                    fields = dataSource.reader.model.fields;
                }

                if (!columns.length && data.length) {
                    columns = Object.keys(data[0].toJSON());
                }

                getters = columns.map(function(column) {
                    var field = column.field;
                    if (field && fields && fields[field] && fields[field].type == "date") {
                        return numberToDate;
                    }
                    return identity;
                });

                this._skipRebind = true;
                normalizedRef = sheet._grid.normalize(e.ref);

                if(!(normalizedRef instanceof UnionRef)) {
                    normalizedRef = new UnionRef([normalizedRef]);
                }

                normalizedRefs = normalizedRef.refs;

                normalizedRefs.forEach(function(ref) {
                    values.push(sheet.range(ref).values());
                });

                for(i = 0; i < normalizedRefs.length; i++) {
                    rangeRef = normalizedRefs[i];
                    rangeRef.forEach(setValues);
                }

                this._boundRowsCount = dataSource.view().length;

                this._skipRebind = false;
            }
        },

        _normalizeColumns: function(columns) {
            return columns.map(function(column) {
                var field = column.field || column;
                return {
                    field: field,
                    title: column.title || field
                };
            });
        },

        _dataSource: function() {
            var options = this.options;
            var dataSource = options.dataSource;

            dataSource = Array.isArray(dataSource) ? { data: dataSource } : dataSource;

            if (this.dataSource && this._changeHandler) {
                this.dataSource.unbind("change", this._changeHandler)
                    .unbind("progress", this._progressHandler)
                    .unbind("error", this._errorHandler);
            } else {
                this._changeHandler = this._change.bind(this);
                this._progressHandler = this._requestStart.bind(this);
                this._errorHandler = this._error.bind(this);
            }

            this.dataSource = kendo.data.DataSource.create(dataSource)
                .bind("change", this._changeHandler)
                .bind("progress", this._progressHandler)
                .bind("error", this._errorHandler);
        },

        _error: function() {
            this._progress(false);
        },

        _requestStart: function() {
            this._progress(true);
        },

        _progress: function(toggle) {
            this.sheet.trigger("progress", {
                toggle: toggle
            });
        },

        _change: function() {
            if (this._skipRebind) {
                return;
            }

            if (this.sheet.trigger("dataBinding")) {
                return;
            }

            var data = this.dataSource.view();
            var columns = this.columns;

            if (!columns.length && data.length) {
                this.columns = columns = this._normalizeColumns(Object.keys(data[0].toJSON()));
                this._header();
            }

            var getters = columns.map(function(column) {
                return kendo.getter(column.field);
            });

            this.sheet.batch(function() {
                var length = Math.max(data.length, this._boundRowsCount, this.sheet._grid.rowCount - 1);

                for (var idx = 0; idx < length; idx++) {
                    for (var getterIdx = 0; getterIdx < getters.length; getterIdx++) {
                        var value = data[idx] ? getters[getterIdx](data[idx]) : null;

                        //skip header row
                        this.sheet.range(idx + 1, getterIdx).value(value);
                    }
                }
            }.bind(this));

            this._boundRowsCount = data.length;

            this._progress(false);
            this.sheet.trigger("dataBound");
        },

        destroy: function() {
            this.dataSource.unbind("change", this._changeHandler)
                .unbind("progress", this._progressHandler)
                .unbind("error", this._errorHandler);

            this.sheet.unbind("change", this._sheetChangeHandler)
                .unbind("deleteRow", this._sheetDeleteRowHandler)
                .unbind("insertRow", this._sheetInsertRowHandler);
        },

        options: {
            columns: []
        }
    });

    function numberToDate(val) {
        return val == null ? null : kendo.spreadsheet.numberToDate(val);
    }

    kendo.spreadsheet.SheetDataSourceBinder = SheetDataSourceBinder;
})(kendo);
