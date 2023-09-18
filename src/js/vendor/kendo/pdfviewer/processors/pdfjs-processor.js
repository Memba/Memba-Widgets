/**
 * Kendo UI v2023.2.829 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../pdfjs.js";

var __meta__ = {
    id: "pdfjs-processor",
    name: "PDFJS-Processor",
    category: "framework",
    depends: [ "core" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        Class = kendo.Class,
        extend = $.extend,
        atob = window.atob,
        PDFJS;

    var PDFJSProcessor = Class.extend({
        init: function(options, viewer) {
            var that = this;

            if (kendo.pdfviewer.pdfjs.isLoaded()) {
                PDFJS = kendo.pdfviewer.pdfjs.lib;
            }

            that.file = options.file;
            that.viewer = viewer;
        },
        fetchDocument: function() {
            var that = this,
                deferred = $.Deferred(),
                messages = that.viewer.options.messages.errorMessages;

            if (!that.file) {
                return deferred.resolve();
            }

            if (that._isBase64Data() && atob)
            {
                that.file.data = atob(that.file.data);
            }

            PDFJS.getDocument(this.file).promise.then(function(pdf) {
                var pageSizes = [];
                that.pdf = pdf;
                that.pagePromises = [];
                that._downloadData = $.Deferred();

                pdf.getData().then(function(data) {
                    var blob = new Blob([data], { type: 'application/pdf' });
                    that._downloadData.resolve({
                        file: blob
                    });
                });

                for (var i = 1; i <= pdf.numPages; i++) {
                    that.pagePromises.push(pdf.getPage(i));
                }

                Promise.all(that.pagePromises).then(function(pagePromises) {
                    pageSizes = pagePromises.map(function(pagePromise) {
                        var viewport = pagePromise.getViewport({ scale: 4 / 3 });
                        return {
                            width: viewport.width,
                            height: viewport.height
                        };
                    });

                    deferred.resolve({
                        total: pdf.numPages,
                        pages: pageSizes
                    });
                }).catch(function(e) {
                    that.viewer._triggerError({
                        error: e.message,
                        message: messages.parseError
                    });
                });

            }).catch(function(e) {
                var notFoundError = e.name.includes("Missing");
                var alertMessage = notFoundError ? messages.notFound : messages.parseError;
                that.viewer._triggerError({
                    error: e.message,
                    message: alertMessage
                });
                if (notFoundError) {
                    that.viewer._renderBlankPage();
                }
            });

            return deferred;
        },
        fetchPageData: function(number) {
            return this.pagePromises[number - 1];
        },
        downloadFile: function(fileName) {
            var that = this;
            kendo.ui.progress(that.viewer.pageContainer, true);

            that._downloadData.done(function(result) {
                kendo.ui.progress(that.viewer.pageContainer, false);

                var reader = new FileReader();
                reader.readAsDataURL(result.file);

                reader.onload = function() {
                    kendo.saveAs({
                        dataURI: reader.result,
                        fileName: fileName + ".pdf",
                        proxyURL: function() {
                            return reader.result;
                        }
                    });
                };
            });
        },
        _updateDocument: function(file) {
            if (this.pdf && this.pdf.loadingTask) {
                this.pdf.loadingTask.destroy();
            }

            this.file = file;
        },
        _isBase64Data: function() {
            var data = this.file.data,
                notBase64 = /[^A-Z0-9+\/=]/i,
                length = data && data.length,
                equalSign;

            if (!length || length % 4 !== 0 || notBase64.test(data)) {
                return false;
            }

            equalSign = data.indexOf('=');

            return equalSign === -1 ||
                equalSign === length - 1 ||
                (equalSign === length - 2 && data[length - 1] === '=');
        },
        renderTextLayer: function(params) {
            PDFJS.renderTextLayer(params);
        }
    });

    extend(kendo.pdfviewer.pdfjs, {
        processor: PDFJSProcessor
    });
})(window.kendo.jQuery);

