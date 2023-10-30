/**
 * Kendo UI v2023.3.1010 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./main.js";
import "../kendo.ooxml.js";

(function($, kendo) {


kendo.ExcelMixin = {
    extend: function(proto) {
       proto.events.push("excelExport");
       proto.options.excel = $.extend(proto.options.excel, this.options);
       proto.saveAsExcel = this.saveAsExcel;
    },
    options: {
        proxyURL: "",
        allPages: false,
        filterable: false,
        fileName: "Export.xlsx",
        collapsible: false
    },
    saveAsExcel: function() {
        var excel = this.options.excel || {};

        var exporter = new kendo.ExcelExporter({
            columns: this.columns,
            dataSource: this.dataSource,
            allPages: excel.allPages,
            filterable: excel.filterable,
            hierarchy: excel.hierarchy,
            collapsible: excel.collapsible
        });

        exporter.workbook().then((function(book, data) {
            if (!this.trigger("excelExport", { workbook: book, data: data })) {
                var workbook = new kendo.ooxml.Workbook(book);

                if (!workbook.options) {
                    workbook.options = {};
                }
                workbook.options.skipCustomHeight = true;

                workbook.toDataURLAsync().then(function(dataURI) {
                    kendo.saveAs({
                        dataURI: dataURI,
                        fileName: book.fileName || excel.fileName,
                        proxyURL: excel.proxyURL,
                        forceProxy: excel.forceProxy
                    });
                });

            }
        }).bind(this));
    }
};

})(kendo.jQuery, kendo);

