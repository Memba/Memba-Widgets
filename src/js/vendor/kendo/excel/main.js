/**
 * Kendo UI v2023.2.718 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";
import "../kendo.data.js";
import "./kendo-excel.js";

(function($, kendo) {

    var ExcelExporter = kendo.excel.ExcelExporter;

    var extend = $.extend;

    kendo.excel.TemplateService.register({
        compile: kendo.template
    });

    kendo.ExcelExporter = kendo.Class.extend({
        init: function(options) {
            this.options = options;
            var dataSource = options.dataSource;

            if (dataSource instanceof kendo.data.DataSource) {

                if (!dataSource.filter()) {
                    dataSource.options.filter = undefined;
                }

                this.dataSource = new dataSource.constructor(extend(
                    {},
                    dataSource.options,
                    {
                        page: options.allPages ? 0 : dataSource.page(),
                        filter: dataSource.filter(),
                        pageSize: options.allPages ? dataSource.total() : dataSource.pageSize() || dataSource.total(),
                        sort: dataSource.sort(),
                        group: dataSource.group(),
                        aggregate: dataSource.aggregate()
                    }));

                var data = dataSource.data();

                if (data.length > 0) {
                    if (options.hierarchy) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].expanded === false || data[i].expanded === undefined) {
                                data[i].expanded = true;
                            }
                        }
                    }
                    // Avoid toJSON() for perf and avoid data() to prevent reparenting.
                    this.dataSource._data = data;

                    var transport = this.dataSource.transport;
                    if (dataSource._isServerGrouped() && transport.options && transport.options.data) { // clear the transport data when using aspnet-mvc transport
                        transport.options.data = null;
                    }
                }

            } else {
                this.dataSource = kendo.data.DataSource.create(dataSource);
            }
        },

        _hierarchy: function() {
            var hierarchy = this.options.hierarchy;
            var dataSource = this.dataSource;

            if (hierarchy && dataSource.level) {
                hierarchy = {
                    itemLevel: function(item) {
                        return dataSource.level(item);
                    }
                };

                var view = dataSource.view();
                var depth = 0;
                var level;

                for (var idx = 0; idx < view.length; idx++) {
                    level = dataSource.level(view[idx]);

                    if (level > depth) {
                        depth = level;
                    }
                }

                hierarchy.depth = depth + 1;
            } else {
                hierarchy = false;
            }

            return {
                hierarchy: hierarchy
            };
        },

        workbook: function() {
            return $.Deferred((function(d) {
                this.dataSource.fetch()
                    .then((function() {

                        var workbook = new ExcelExporter(extend({}, this.options, this._hierarchy(), {
                            data: this.dataSource.view(),
                            groups: this.dataSource.group(),
                            aggregates: this.dataSource.aggregates()
                        })).workbook();

                        d.resolve(workbook, this.dataSource.view());
                    }).bind(this));
            }).bind(this)).promise();
        }
    });


})(kendo.jQuery, kendo);

