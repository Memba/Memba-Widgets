/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../../kendo.core.js";

var __meta__ = {
    id: "dpl-processor",
    name: "DPL-Processor",
    category: "framework",
    depends: [ "core" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        Class = kendo.Class;

    var DPLProcessor = Class.extend({
        init: function(options, viewer) {
            var that = this;

            that.options = options;
            that.read = options.read;
            that.upload = options.upload;
            that.download = options.download;

            that.viewer = viewer;
        },
        fetchDocument: function() {
            var that = this,
                deferred = $.Deferred(),
                errorMessages = that.viewer.options.messages.errorMessages;

            if (!that.read) {
                return deferred.resolve();
            }

            $.ajax({
                type: that.read.type,
                url: that.read.url,
                dataType: that.read.dataType,
                success: function(data) {
                    if (typeof data != "string") {
                        data = kendo.stringify(data);
                    }
                    deferred.resolve(JSON.parse(data));
                },
                error: function(xhr) {
                    that.viewer._triggerError({
                        error: xhr.responseText,
                        message: errorMessages.parseError
                    });
                }
            });

            return deferred;
        },
        fetchPageData: function(number) {
            var that = this;
            var deferred = $.Deferred();
            var page = that.viewer.document.pages[number - 1];
            var data = {};
            data[that.read.pageField] = number;

            if (!page.geometries.length) {
                $.ajax({
                    type: that.read.type,
                    url: that.read.url,
                    data: data,
                    success: function(data) {
                        deferred.resolve(JSON.parse(data));
                    },
                    error: function(xhr) {
                        that.viewer._triggerError({
                            error: xhr.responseText,
                            message: that.viewer.options.messages.errorMessages.parseError
                        });
                    }
                });
            } else {
                deferred.resolve(page);
            }

            return deferred;
        },
        downloadFile: function(fileName) {
            window.location = this.download.url + "?file=" + fileName;
        },

        fromJSON: function(json)
        {
            var viewer = this.viewer;
            viewer._clearPages();

            viewer.document = json;
            viewer.document.total = viewer.document.pages.length;

            viewer._renderPages();
            viewer.resize(true);

            viewer.activatePage(1);
        }
    });

    extend(kendo.pdfviewer, {
        dpl: {
            processor: DPLProcessor
        }
    });
})(window.kendo.jQuery);

