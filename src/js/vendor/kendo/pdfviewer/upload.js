/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";
import "../kendo.upload.js";

(function($, undefined) {
    var Class = kendo.Class,
        extend = $.extend,
        parseJSON = JSON.parse,
        progress = kendo.ui.progress,
        Class = kendo.Class,
        OPEN = "open";

    var UploadHelper = Class.extend({
        init: function(viewer) {
            this.viewer = viewer;
            this.errorMessages = this.viewer.options.messages.errorMessages;
            this.upload = this.viewer.processor.upload;
        },
        _initUpload: function(uploadElement, extendUploadOptions) {
            var uploadOptions = extend({
                select: this._onSelect.bind(this),
                success: this._onSuccess.bind(this),
                error: this._onError.bind(this),
                complete: this._onComplete.bind(this),
                showFileList: false,
                multiple: false,
                validation: {
                    allowedExtensions: [".pdf"]
                }
            }, extendUploadOptions || {});

            if (this.upload) {
                extend(uploadOptions, {
                    async: {
                        saveUrl: this.upload.url,
                        autoUpload: true,
                        saveField: this.upload.saveField
                    }
                });
            }

            var upload = (uploadElement || $('<input name="files" accept=".pdf" type="file" />')).kendoUpload(uploadOptions).getKendoUpload();

            return upload;
        },
        _onComplete: function() {
            progress(this.viewer.pageContainer, false);
        },
        _onSuccess: function(e) {
            var json = parseJSON(e.response);

            if ($.isPlainObject(json)) {
                this.viewer.processor.fromJSON(json);
            }
            else {
                this.viewer._triggerError({
                    error: json,
                    message: this.errorMessages.parseError
                });
            }
        },
        _onError: function(e) {
            this.viewer._triggerError({
                error: e.XMLHttpRequest.responseText,
                message: this.errorMessages.notSupported
            });
        },
        _onSelect: function(e) {
            var that = this;
            var fileToUpload = e.files[0];

            progress(that.viewer.pageContainer, true);

            if (that.viewer.trigger(OPEN, { file: fileToUpload }) || that.upload) {
                return;
            } else if (fileToUpload.extension.toLowerCase() !== ".pdf") {
                that.viewer._triggerError({
                    error: fileToUpload,
                    message: that.errorMessages.notSupported
                });
                return;
            }

            var reader = new FileReader();
            reader.onload = function(e) {
                var document = e.target.result;
                that.viewer.fromFile(document);
            };
            reader.onerror = function() {
                that.viewer._triggerError({
                    error: fileToUpload,
                    message: that.errorMessages.parseError
                });
            };

            reader.readAsArrayBuffer(fileToUpload.rawFile);
        }
    });

    extend(kendo.pdfviewer, {
        UploadHelper: UploadHelper
    });
})(window.kendo.jQuery);