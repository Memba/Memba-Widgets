/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.core.js";
import "./kendo.progressbar.js";
import "./kendo.icons.js";
import "./kendo.html.button.js";

var __meta__ = {
    id: "upload",
    name: "Upload",
    category: "web",
    description: "The Upload widget uses progressive enhancement to deliver the best possible uploading experience to users.",
    depends: ["core", "progressbar", "icons", "html.button"]
};

(function($, undefined) {
    var kendo = window.kendo,
        Widget = kendo.ui.Widget,
        antiForgeryTokens = kendo.antiForgeryTokens,
        logToConsole = kendo.logToConsole,
        rFileExtension = /\.([^\.]+)$/,
        NS = ".kendoUpload",
        SELECT = "select",
        UPLOAD = "upload",
        SUCCESS = "success",
        ERROR = "error",
        COMPLETE = "complete",
        CANCEL = "cancel",
        CLEAR = "clear",
        PAUSE = "pause",
        RESUME = "resume",
        PROGRESS = "progress",
        REMOVE = "remove",
        VALIDATIONERRORS = "validationErrors",
        INVALIDMAXFILESIZE = "invalidMaxFileSize",
        INVALIDMINFILESIZE = "invalidMinFileSize",
        INVALIDFILEEXTENSION = "invalidFileExtension",
        PROGRESSHIDEDELAY = 1000,
        PROGRESSHIDEDURATION = 2000,
        HOVER_STATE = "k-hover",
        FOCUS_STATE = "k-focus",
        PROGRESSBAR_CLASS = "k-progressbar",
        PROGRESSBAR_SELECTOR = "." + PROGRESSBAR_CLASS,
        PROGRESSBAR_TEMPLATE_SELECTOR = ".k-progress",
        TABINDEX = "tabindex",
        WARNINGICON_SELECTOR = `.k-i-exclamation-circle,.k-svg-i-exclamation-circle`;

    var headerStatusIconName = {
        loading: "upload",
        warning: "exclamation-circle",
        success: "check"
    };

    var Upload = Widget.extend({
        init: function(element, options) {
            var that = this;
            that.progressbars = [];

            Widget.fn.init.call(that, element, options);

            that.name = element.name;
            that.multiple = that.options.multiple;
            that.directory = that.options.directory;
            that.localization = that.options.localization;

            var activeInput = that.element;
            that.wrapper = activeInput.closest(".k-upload");
            if (that.wrapper.length === 0) {
                that.wrapper = that._wrapInput(activeInput);
            }

            that._activeInput(activeInput);
            that.toggle(that.options.enabled);

            var ns = that._ns = NS + "-" + kendo.guid();
            activeInput.closest("form")
                .on("submit" + ns, that._onParentFormSubmit.bind(that))
                .on("reset" + ns, that._onParentFormReset.bind(that));

            that._initUploadModule();

            that._toggleDropZone();

            that.wrapper
                .on("keydown", ".k-upload-button", that._onUploadButtonKeydown.bind(that))
                .on("click", ".k-upload-action", that._onFileAction.bind(that))
                .on("click", ".k-clear-selected", that._onClearSelected.bind(that))
                .on("click", ".k-upload-selected", that._onUploadSelected.bind(that))
                .on("keydown", that._onKeyDown.bind(that))
                .on("focusout", that._focusout.bind(that));

            if (that.element.val()) {
                that._onInputChange({ target: that.element });
            }
        },

        events: [
            SELECT,
            UPLOAD,
            SUCCESS,
            ERROR,
            COMPLETE,
            CANCEL,
            CLEAR,
            PROGRESS,
            REMOVE,
            PAUSE,
            RESUME
        ],

        options: {
            name: "Upload",
            enabled: true,
            multiple: true,
            directory: false,
            showFileList: true,
            template: "",
            files: [],
            async: {
                autoRetryAfter: 0,
                bufferChunkSize: 10000000,
                maxAutoRetries: 1,
                removeVerb: "POST",
                autoUpload: true,
                withCredentials: true,
                accept: "*/*; q=0.5, application/json",
                useArrayBuffer: false
            },
            localization: {
                "select": "Select files...",
                "cancel": "Cancel",
                "retry": "Retry",
                "remove": "Remove",
                "pause": "Pause",
                "resume": "Resume",
                "clearSelectedFiles": "Clear",
                "uploadSelectedFiles": "Upload",
                "dropFilesHere": "Drop files here to upload",
                "invalidFiles": "Invalid file(s). Please check file upload requirements.",
                "statusUploading": "uploading",
                "statusUploaded": "uploaded",
                "statusWarning": "warning",
                "statusFailed": "failed",
                "headerStatusUploading": "Uploading...",
                "headerStatusPaused": "Paused",
                "headerStatusUploaded": "Done",
                "uploadSuccess": "File(s) uploaded successfully.",
                "uploadFail": "File(s) failed to upload.",
                "invalidMaxFileSize": "File size too large.",
                "invalidMinFileSize": "File size too small.",
                "invalidFileExtension": "File type not allowed."
            },
            validation: {
                allowedExtensions: [],
                maxFileSize: 0,
                minFileSize: 0
            },
            dropZone: ""
        },

        _initUploadModule: function() {
            var that = this,
                options = that.options;

            if (options.async.saveUrl) {
                that._module = that._supportsFormData() ?
                new formDataUploadModule(that) :
                new iframeUploadModule(that);
                that._async = true;

                var initialFiles = options.files;
                if (initialFiles.length > 0) {
                    that._renderInitialFiles(initialFiles);
                }

            } else {
                that._module = new syncUploadModule(that);
            }
        },

        setOptions: function(options) {
            var that = this,
                activeInput = that.element;

            $(that.options.dropZone).off(that._ns);

            Widget.fn.setOptions.call(that, options);

            that.multiple = that.options.multiple;
            that.directory = that.options.directory;

            activeInput.attr("multiple", that._supportsMultiple() ? that.multiple : false);
            if (that.directory) {
                activeInput.attr("webkitdirectory", that.directory);
                activeInput.attr("directory", that.directory);
            }
            that.toggle(that.options.enabled);

            that._initUploadModule();

            that._toggleDropZone();
        },

        enable: function(enable) {
            enable = typeof (enable) === "undefined" ? true : enable;
            this.toggle(enable);
        },

        disable: function() {
            this.toggle(false);
        },

        toggle: function(enable) {
            enable = typeof (enable) === "undefined" ? enable : !enable;
            this.wrapper.toggleClass("k-disabled", enable);
            this.element.prop("disabled", enable);
        },

        focus: function() {
            this.element.trigger("focus");
        },

        destroy: function() {
            var that = this;
            var customDropZone = $(that.options.dropZone);

            $(document)
                .add($(".k-dropzone", that.wrapper))
                .add(that.wrapper.closest("form"))
                .off(that._ns);

            if (customDropZone.length > 0) {
                customDropZone.off(that._ns);
            }

            $(that.element).off(NS);

            if (that.progressbars) {
                that.progressbars.forEach(progressbar => {
                    progressbar.destroy();
                });
            }
            Widget.fn.destroy.call(that);
        },
        pause: function(fileEntry) {
            this._module.onPause({ target: $(fileEntry, this.wrapper) });

            var pauseIcon = fileEntry.find(".k-i-pause-sm,.k-svg-i-pause-sm");
            kendo.ui.icon(pauseIcon, { icon: "play-sm" });
            pauseIcon.attr("title", this.localization.resume);
            $(pauseIcon).parent().attr("aria-label", this.localization.resume);
        },
        resume: function(fileEntry) {
            this._module.onResume({ target: $(fileEntry, this.wrapper) });

            var playIcon = fileEntry.find(".k-i-play-sm,.k-svg-i-play-sm");
            kendo.ui.icon(playIcon, { icon: "pause-sm" });
            playIcon.attr("title", this.localization.pause);
            $(playIcon).parent().attr("aria-label", this.localization.pause);
        },
        upload: function() {
            var that = this;

            that._module.onSaveSelected();
        },

        getFiles: function() {
            var that = this;
            var filesData;
            var allFiles = [];
            var listItems = that.wrapper.find(".k-file");

            for (var i = 0; i < listItems.length; i++) {
                filesData = $(listItems[i]).data("fileNames");

                if (filesData) {
                    for (var j = 0; j < filesData.length; j++) {
                        allFiles.push(filesData[j]);
                    }
                }
            }

            return allFiles;
        },

        clearAllFiles: function() {
            var that = this;
            var files = that.wrapper.find(".k-file");

            files.each(function(index, file) {
                that._removeFileByDomElement(file, false);
            });
        },

        removeAllFiles: function() {
            var that = this;
            var files = that.wrapper.find(".k-file");

            files.each(function(index, file) {
                that._removeFileByDomElement(file, true);
            });
        },

        removeFileByUid: function(uid) {
            this._removeFileByUid(uid, true);
        },

        clearFileByUid: function(uid) {
            this._removeFileByUid(uid, false);
        },

        _removeFileByUid: function(uid, shouldSendRemoveRequest) {
            var that = this;
            var fileEntry;

            if (typeof uid !== 'string') { return; }

            fileEntry = $('.k-file[' + kendo.attr('uid') + '="' + uid + '"]', that.wrapper);

            if (fileEntry.length > 0) {
                that._removeFileByDomElement(fileEntry, shouldSendRemoveRequest);
            }
        },

        clearFile: function(callback) {
            this._removeFile(callback, false);
        },

        removeFile: function(callback) {
            this._removeFile(callback, true);
        },

        _removeFile: function(callback, shouldSendRemoveRequest) {
            var that = this;
            var files = that.wrapper.find(".k-file");
            var fileData;

            if (typeof callback === "function") {
                files.each(function(index, file) {
                    fileData = $(file).data("fileNames");

                    if (callback(fileData)) {
                        that._removeFileByDomElement(file, shouldSendRemoveRequest);
                    }
                });
            }
        },

        _removeFileByDomElement: function(fileEntry, shouldSendRemoveRequest) {
            var that = this;
            var fileData = {
                target: $(fileEntry, that.wrapper)
            };
            var allFiles;

            if (that.options.async.saveUrl) {
                if ($(fileEntry).hasClass("k-file-progress")) {
                    that._module.onCancel(fileData);
                } else {
                    that._module.onRemove(fileData, {}, shouldSendRemoveRequest);
                }

                allFiles = $(".k-file", that.wrapper);

                if (allFiles.length === 0) {
                    that._hideHeaderUploadstatus();
                } else {
                    that._updateHeaderUploadStatus();
                }
            } else {
                that._module.onRemove(fileData, {}, shouldSendRemoveRequest);
            }
        },

        _addInput: function(sourceInput) {
            //check if source input is a DOM element. Required for some unit tests
            if (!sourceInput[0].nodeType) {
                return;
            }

            var that = this,
                input = sourceInput.clone().val("");

            input
                .insertAfter(that.element)
                .data("kendo" + that.options.prefix + that.options.name, that);

            $(that.element)
                .hide()
                .attr(TABINDEX, "-1")
                .removeAttr("id")
                .off(NS);

            that._activeInput(input);
            that.element.trigger("focus");
        },

        _activeInput: function(input) {
            var that = this,
                wrapper = that.wrapper;

            that.element = input;

            if (that.directory) {
                input.attr("webkitdirectory", that.directory);
                input.attr("directory", that.directory);
            }

            input
                .attr("multiple", that._supportsMultiple() ? that.multiple : false)
                .attr("autocomplete", "off")
                .on("click" + NS, function(e) {
                    if (wrapper.hasClass("k-disabled")) {
                        e.preventDefault();
                    }
                })
                .on("focus" + NS, function() {
                    $(this).parent().addClass(FOCUS_STATE);
                })
                .on("blur" + NS, function() {
                    $(this).parent().removeClass(FOCUS_STATE);
                })
                .on("change" + NS, that._onInputChange.bind(that));
        },

        _adjustFocusState: function(focusedItem, toFocus) {
            focusedItem.removeClass(FOCUS_STATE);
            focusedItem.attr(TABINDEX, -1);
            toFocus.addClass(FOCUS_STATE);
            toFocus.attr(TABINDEX, 0);
        },

        _arrowKeyNavigation: function(e, key, focusedItem) {
            var that = this,
                kendoKeys = kendo.keys,
                toFocus;

            if (key === kendoKeys.DOWN) {
                e.preventDefault();
                e.stopPropagation();

                toFocus = that.wrapper.find(".k-upload-files .k-file").first();

                if (focusedItem.length > 0) {
                    if (focusedItem.hasClass("k-upload-action")) {
                        focusedItem.removeClass(FOCUS_STATE);
                        focusedItem = focusedItem.closest(".k-file");
                    }

                    toFocus = focusedItem.next();
                }

                that._adjustFocusState(focusedItem, toFocus);

                if (!toFocus || toFocus.length === 0) {
                    toFocus = that.wrapper.find(".k-clear-selected");
                }
            } else if (key === kendoKeys.UP) {
                e.preventDefault();
                e.stopPropagation();

                toFocus = that.wrapper.find(".k-upload-files .k-file:last");

                if (focusedItem.length > 0) {
                    if (focusedItem.hasClass("k-upload-action")) {
                        focusedItem.removeClass(FOCUS_STATE);
                        focusedItem = focusedItem.closest(".k-file");
                    }

                    toFocus = focusedItem.prev();
                }

                that._adjustFocusState(focusedItem, toFocus);
            } else if (key === kendoKeys.RIGHT) {
                if (focusedItem.hasClass("k-upload-action")) {
                    toFocus = focusedItem.next(".k-upload-action");

                    if (!toFocus || toFocus.length === 0) {
                        toFocus = focusedItem.parent().find(".k-upload-action:first");
                    }
                } else if (focusedItem.length > 0) {
                    toFocus = focusedItem.find(".k-upload-action:first");
                }

                if (toFocus && toFocus.length > 0) {
                    focusedItem.removeClass(FOCUS_STATE);
                    toFocus.addClass(FOCUS_STATE);
                }
            } else if (key === kendoKeys.LEFT) {
                if (focusedItem.hasClass("k-upload-action")) {
                    toFocus = focusedItem.prev(".k-upload-action");

                    if (!toFocus || toFocus.length === 0) {
                        toFocus = focusedItem.parent().find(".k-upload-action:last");
                    }
                } else if (focusedItem.length > 0) {
                    toFocus = focusedItem.find(".k-upload-action:last");
                }

                if (toFocus && toFocus.length > 0) {
                    focusedItem.removeClass(FOCUS_STATE);
                    toFocus.addClass(FOCUS_STATE);
                }
            }

            if ((!toFocus || toFocus.length === 0) && (key === kendoKeys.UP || key === kendoKeys.DOWN)) {
                toFocus = that.element;
            }

            if (toFocus && toFocus.length > 0) {
                that._preventFocusRemove = true;
                toFocus.trigger("focus");
            }
        },

        _asyncCommandKeyNavigation: function(key, focusedItem, eventArgs) {
            var that = this,
                kendoKeys = kendo.keys,
                fileEntry = $(focusedItem, that.wrapper);

            that._retryClicked = false;

            if (key === kendoKeys.ESC && focusedItem.find(".k-i-cancel,.k-svg-i-cancel").length > 0) {
                that.trigger(CANCEL, eventArgs);
                that._module.onCancel({ target: fileEntry });
                that._checkAllComplete();
                that._updateHeaderUploadStatus();
                that._preventFocusRemove = true;
                that.element.trigger("focus");
            } else if (key === kendoKeys.SPACEBAR) {
                if (focusedItem.find(".k-i-pause-sm,.k-svg-i-pause-sm").length > 0) {
                    that.trigger(PAUSE, eventArgs);
                    that.pause(focusedItem);
                    that._updateHeaderUploadStatus();
                } else if (focusedItem.find(".k-i-play-sm,.k-svg-i-play-sm").length > 0) {
                    that.trigger(RESUME, eventArgs);
                    that.resume(focusedItem);
                }
            } else if (key === kendoKeys.ENTER && !focusedItem.is(".k-file-progress, .k-file-success, .k-file-invalid")) {
                if (that.options.async.chunkSize && !that.options.async.concurrent && $('.k-file-progress', that.wrapper).length > 0) {
                    return;
                }

                $(WARNINGICON_SELECTOR, focusedItem).remove();
                $(PROGRESSBAR_SELECTOR, focusedItem).finish().show();

                if (!that._module.metaData[fileEntry.data("uid")]) {
                    that._module.prepareChunk(fileEntry);
                }

                that._module.onRetry({ target: fileEntry });
                that._retryClicked = true;
            }
        },

        _commandKeyNavigation: function(key, focusedItem) {
            var that = this,
                kendoKeys = kendo.keys,
                files = focusedItem.data("fileNames"),
                hasValidationErrors = that._filesContainValidationErrors(files),
                eventArgs = {
                    files: files,
                    headers: {}
                };

            if (key === kendoKeys.DELETE) {
                if (!that.trigger(REMOVE, eventArgs)) {
                    that._module.onRemove({ target: $(focusedItem, that.wrapper) }, eventArgs, !hasValidationErrors);
                    that._preventFocusRemove = true;
                    that.element.trigger("focus");
                }
            } else if (key === kendoKeys.TAB) {
                focusedItem.removeClass(FOCUS_STATE);
                focusedItem.attr(TABINDEX, -1);
            } else if (!!that.options.async.saveUrl) {
                that._asyncCommandKeyNavigation(key, focusedItem, eventArgs);
            }
        },

        _focusout: function() {
            var focusedItem = this.wrapper.find(".k-upload-files .k-file." + FOCUS_STATE);

            if (!this._preventFocusRemove) {
                focusedItem.removeClass(FOCUS_STATE);
                focusedItem.attr(TABINDEX, -1);
            } else {
                this._preventFocusRemove = false;
            }
        },

        _onKeyDown: function(e) {
            var that = this,
                focusedItem = that.wrapper.find(".k-upload-files .k-file." + FOCUS_STATE + "," + ".k-upload-action." + FOCUS_STATE),
                kendoKeys = kendo.keys,
                commandKeys = [kendoKeys.DELETE, kendoKeys.ESC, kendoKeys.ENTER, kendoKeys.SPACEBAR, kendoKeys.TAB],
                key = e.keyCode;

            if (key === kendoKeys.DOWN || key === kendoKeys.UP || key === kendoKeys.LEFT || key === kendoKeys.RIGHT) {
                that._arrowKeyNavigation(e, key, focusedItem);
            } else if (focusedItem.length > 0 && focusedItem.hasClass("k-file") && commandKeys.indexOf(key) > -1 && !that.wrapper.hasClass("k-disabled")) {
                if (key === kendoKeys.SPACEBAR) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                that._commandKeyNavigation(key, focusedItem);
            }
        },

        _onInputChange: function(e) {
            var that = this;
            var input = $(e.target);
            var files = assignGuidToFiles(that._inputFiles(input), that._isAsyncNonBatch());

            validateFiles(files, that.options.validation);

            var prevented = that.trigger(SELECT, { files: files });
            if (prevented) {
                that._addInput(input);
                input.remove();
            } else {
                that._module.onSelect({ target: input }, files);
            }
        },

        _onUploadButtonKeydown: function(e) {
            var key = e.keyCode,
                kendoKeys = kendo.keys;

            if (key === kendoKeys.ENTER || key === kendoKeys.SPACEBAR) {
                this.wrapper.find(".k-upload-button-wrap input").last().trigger("click");
            }
        },

        _readDirectory: function(item) {
            var deferred = new $.Deferred();
            var dirReader = item.createReader();
            var allFolderFiles = [];

            var readEntries = function() {
                dirReader.readEntries(function(entries) {
                    if (!entries.length) {
                        deferred.resolve(allFolderFiles);
                    } else {
                        allFolderFiles = allFolderFiles.concat(entries);
                        readEntries();
                    }
                }, deferred.reject);
            };

            readEntries();

             return deferred.promise();
        },

        _readFile: function(item) {
            var that = this;
            var fullpath = item.fullPath;

            item.file(function(file) {
                    file.relativePath = fullpath.slice(1);
                    that.droppedFolderFiles.push(file);
                    that.droppedFolderCounter --;
                    if (that.droppedFolderCounter === 0) {
                        setTimeout(function() {
                            if (that.droppedFolderCounter === 0) {
                                if (that.droppedFolderFiles.length) {
                                    that._proceedDroppedItems(that.droppedFolderFiles);
                                    that.droppedFolderFiles = [];
                                }
                            }
                        },0);
                    }
            }, function() {
                logToConsole("File error.");
            });
        },

        _traverseFileTree: function(item, skipCounter) {
            var that = this;
            if (!skipCounter) {
                that.droppedFolderCounter--;
            }

            this._readDirectory(item).then(function(items) {
                that.droppedFolderCounter += items.length;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].isFile) {
                        that._readFile(items[i]);
                    } else if (items[i].isDirectory) {
                        that._traverseFileTree(items[i]);
                    }
                }
            });
        },

        _onDrop: function(e) {
            var dt = e.originalEvent.dataTransfer;
            var that = this;
            var droppedFiles = dt.files;
            var length;

            stopEvent(e);
           if (that.options.directoryDrop && dt.items) {
                length = dt.items.length;
                that.droppedFolderCounter = 0;
                that.droppedFolderFiles = [];

                for (var i = 0; i < length; i++) {
                    if (dt.items[i].webkitGetAsEntry) {
                        var entry = dt.items[i].webkitGetAsEntry();

                        if (entry.isDirectory) {
                            that._traverseFileTree(entry, true);
                        } else if (entry.isFile) {
                            that.droppedFolderFiles.push(dt.files[i]);
                        }
                    } else {
                         that._proceedDroppedItems(droppedFiles);
                    }
                }
           } else {
               that._proceedDroppedItems(droppedFiles);
           }
        },

        _proceedDroppedItems: function(droppedFiles) {
            var that = this;
            var files = assignGuidToFiles(getAllFileInfo(droppedFiles), that._isAsyncNonBatch());

              if (droppedFiles.length > 0 && !that.wrapper.hasClass("k-disabled")) {
                if (!that.multiple && files.length > 1) {
                    files.splice(1, files.length - 1);
                }

                validateFiles(files, that.options.validation);

                var prevented = that.trigger(SELECT, { files: files });
                if (!prevented) {
                    that._module.onSelect({ target: $(".k-dropzone", that.wrapper) }, files);
                }
            }
        },

        _filesContainValidationErrors: function(files) {
            var hasErrors = false;

            $(files).each(function(index, file) {
                if (file[VALIDATIONERRORS] && file[VALIDATIONERRORS].length > 0) {
                    hasErrors = true;
                    return false;
                }
            });

            return hasErrors;
        },

        _isAsyncNonBatch: function() {
            return (this._async && !this.options.async.batch) || false;
        },

        _renderInitialFiles: function(files) {
            var that = this;
            var idx = 0;
            files = assignGuidToFiles(files, true);

            for (idx = 0; idx < files.length; idx++) {
                var currentFile = files[idx];

                var fileEntry = that._enqueueFile(currentFile.name, { fileNames: [currentFile] });
                fileEntry.addClass("k-file-success").data("files", [files[idx]]);

                if (that._supportsRemove()) {
                    that._fileAction(fileEntry, REMOVE);
                }
            }
        },

        _prepareTemplateData: function(name, data) {
            var filesData = data.fileNames,
                templateData = {},
                totalSize = 0,
                idx = 0;

            for (idx = 0; idx < filesData.length; idx++) {
                totalSize += filesData[idx].size;
            }

            templateData.name = name;
            templateData.size = totalSize;
            templateData.files = data.fileNames;

            return templateData;
        },

        _createProgressbarWapper: function() {
            return "<div class='" + PROGRESSBAR_CLASS + " k-hidden'></div>";
        },

        _createFileIconWrapper: function(fileTypeIcon) {
            return "<span class='k-file-icon-wrapper'>" +
                kendo.ui.icon({ icon: fileTypeIcon, iconClass: "k-file-icon", size: "xxlarge" }) +
                "<span class='k-file-state'></span>" +
                "</span>";
        },

        _progressbarInit: function(wrapper) {
            let progressbar = wrapper.kendoProgressBar({
                animation: false,
                showStatus: false
            }).data("kendoProgressBar");
            this.progressbars.push(progressbar);
        },

        _prepareDefaultSingleFileEntryTemplate: function(data) {
            var that = this;
            var file = data.fileNames[0];
            var fileSize = getTotalFilesSizeMessage(data.fileNames);
            var fileGroup = kendo.getFileGroup(file.extension, true);
            var errors = file[VALIDATIONERRORS];
            var isError = errors && errors.length > 0;
            var invalidClass = isError ? " k-file-invalid k-file-error" : "";
            var fileDetails = isError ?
                    "<span class='k-file-validation-message' aria-live='polite'>" + that.localization[errors[0]] + "</span>" :
                    "<span class='k-file-size'>" + fileSize + "</span>";
            var template = "";

            template += "<li class='k-file" + invalidClass + "'>" +
                this._createProgressbarWapper() +
                this._createFileIconWrapper(fileGroup) +
                "<span class='k-file-info'>" +
                    "<span class='k-file-name' title='" + file.name + "'>" + file.name + "</span>" +
                    fileDetails +
                "</span>";

            template += "<span class='k-upload-actions'></span>";

            return $(template);
        },

        _prepareDefaultMultipleFileEntriesTemplate: function(data) {
            var that = this;
            var files = data.fileNames;
            var filesHaveValidationErrors = that._filesContainValidationErrors(files);
            var totalFileSize = getTotalFilesSizeMessage(files);
            var template = "";
            var i, currentFile;
            var invalidClass = filesHaveValidationErrors ? " k-file-invalid k-file-error" : "";

            template += "<li class='k-file" + invalidClass + "'>" +
                this._createProgressbarWapper() +
                this._createFileIconWrapper("files");

            files.sort(function(a, b) {
                if (a[VALIDATIONERRORS]) { return -1; }

                if (b[VALIDATIONERRORS]) { return 1; }

                return 0;
            });

            template += "<span class='k-multiple-files-wrapper'>";
            for (i = 0; i < files.length; i++) {
                currentFile = files[i];
                var fileSize = getTotalFilesSizeMessage([currentFile]);

                template += "<span class='k-file-name-size-wrapper'>";
                if (currentFile[VALIDATIONERRORS] && currentFile[VALIDATIONERRORS].length > 0) {
                    template += "<span class='k-file-name k-file-name-invalid' title='" + currentFile.name + "'>" + currentFile.name + "</span>";
                } else {
                    template += "<span class='k-file-name' title='" + currentFile.name + "'>" + currentFile.name + "</span>";
                }
                template += "<span class='k-file-size'>" + fileSize + "</span></span>";
            }

            if (filesHaveValidationErrors) {
                template += "<span class='k-file-validation-message' aria-live='polite'>" + that.localization.invalidFiles + "</span>";
            } else {
                template += "<span class='k-file-summary'>Total: " + files.length + " files, " + totalFileSize + "</span>";
            }

            template += "</span><span class='k-upload-actions'></span>";

            return $(template);
        },

        _enqueueFile: function(name, data) {
            var that = this;
            var existingFileEntries;
            var fileEntry;
            var fileUid = data.fileNames[0].uid;
            var fileList = $(".k-upload-files", that.wrapper);
            var options = that.options;
            var template = options.template;
            var templateData;
            var removeEventArgs;
            var progressbarSelector = template ? PROGRESSBAR_TEMPLATE_SELECTOR : PROGRESSBAR_SELECTOR;
            var progressbar;
            var isProgressbar;

            if (fileList.length === 0) {
                fileList = $("<ul class='k-upload-files k-reset'></ul>").appendTo(that.wrapper);
                if (!that.options.showFileList) {
                    fileList.hide();
                }

                that.wrapper.removeClass("k-upload-empty");
            }

            existingFileEntries = $(".k-file", fileList);

            if (!template) {
                if (data.fileNames.length === 1) {
                    fileEntry = that._prepareDefaultSingleFileEntryTemplate(data);
                } else {
                    fileEntry = that._prepareDefaultMultipleFileEntriesTemplate(data);
                }
            } else {
                templateData = that._prepareTemplateData(name, data);
                template = kendo.template(template);

                fileEntry = $("<li class='k-file'>" + template(templateData) + "</li>");
                fileEntry.find(".k-upload-action").addClass("k-button k-icon-button k-button-md k-rounded-md k-button-flat k-button-flat-base");

                that.angular("compile", function() {
                    return {
                        elements: fileEntry,
                        data: [ templateData ]
                    };
                });
            }

            progressbar = $(progressbarSelector, fileEntry[0]);
            isProgressbar = progressbar.length > 0;

            if (isProgressbar) {
                that._progressbarInit(progressbar);
            }

            fileEntry
                .attr(kendo.attr("uid"), fileUid)
                .appendTo(fileList)
                .data(data);

            if (!that._async && isProgressbar) {
                progressbar.data("kendoProgressBar").value(100);
            }

            if (!that.multiple && existingFileEntries.length > 0) {
                removeEventArgs = {
                    files: existingFileEntries.data("fileNames"),
                    headers: {}
                };
                if (!that.trigger(REMOVE, removeEventArgs)) {
                    that._module.onRemove({ target: $(existingFileEntries, that.wrapper) }, removeEventArgs);
                }
            }

            return fileEntry;
        },

        _removeFileEntry: function(fileEntry) {
            var that = this;
            var fileList = fileEntry.closest(".k-upload-files");
            var allFiles, allCompletedFiles, allInvalidFiles;

            fileEntry.remove();
            allFiles = $(".k-file", fileList);
            allCompletedFiles = $(".k-file-success, .k-file-error", fileList);

            if (allCompletedFiles.length === allFiles.length) {
                this._hideActionButtons();
            }

            if (allFiles.length === 0) {
                fileList.remove();
                that.wrapper.addClass("k-upload-empty");
                that._hideHeaderUploadstatus();
            } else {
                that._updateHeaderUploadStatus();
            }
        },

        _fileAction: function(fileElement, actionKey, skipClear) {
            var iconsNameDictionary = { remove: "x", cancel: "cancel", retry: "arrow-rotate-cw-small", pause: "pause-sm" };
            var firstActionButton;

            if (!iconsNameDictionary.hasOwnProperty(actionKey)) {
                return;
            }
            if (!skipClear) {
                this._clearFileAction(fileElement);
            }
            if (!this.options.template) {
                if (!skipClear) {
                    fileElement.find(".k-upload-action").remove();
                }
                fileElement.find(".k-upload-actions").append(
                    this._renderAction(iconsNameDictionary[actionKey], this.localization[actionKey], actionKey == "retry" ? "k-i-retry" : "")
                );
            } else {
                firstActionButton = fileElement.find(".k-upload-action").first();
                if (!firstActionButton.find(".k-icon,.k-svg-icon").length) {
                    let firstActionIcon = kendo.ui.icon($(`<span title="${this.localization[actionKey]}" aria-label="${this.localization[actionKey]}"></span>`), {
                        icon: iconsNameDictionary[actionKey],
                        iconClass: "k-button-icon" + (actionKey == "retry" ? " k-i-retry" : "")
                    });
                    firstActionButton
                        .addClass("k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-icon-button")
                        .append(firstActionIcon)
                        .show();
                } else if (firstActionButton.next(".k-upload-action").length) {
                    let firstActionIcon = kendo.ui.icon($(`<span title="${this.localization[actionKey]}" aria-label="${this.localization[actionKey]}"></span>`), {
                        icon: iconsNameDictionary[actionKey],
                        iconClass: "k-button-icon" + (actionKey == "retry" ? " k-i-retry" : "")
                    });
                    firstActionButton.next(".k-upload-action")
                        .addClass("k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-icon-button")
                        .append(firstActionIcon)
                        .show();
                }
            }
        },

        _fileState: function(fileEntry, stateKey) {
            var localization = this.localization,
                states = {
                    uploading: {
                        text: localization.statusUploading
                    },
                    uploaded: {
                        text: localization.statusUploaded
                    },
                    failed: {
                        text: localization.statusFailed
                    }
                },
                currentState = states[stateKey];

            if (currentState) {
                $("span.k-file-state", fileEntry).text(currentState.text);
            }
        },

        _renderAction: function(iconName, actionText, iconClass) {
            if (iconName !== "") {
                return $(
                "<button type='button' class='k-button k-icon-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-upload-action' aria-hidden='true' aria-label='" + actionText + "' tabindex='-1'>" +
                    kendo.ui.icon($(`<span title="${actionText}"></span>`), { icon: iconName, iconClass: "k-button-icon" + (iconClass ? ` ${iconClass}` : "") }) +
                "</button>"
                ).on("focus", function() { $(this).addClass(FOCUS_STATE); })
                 .on("blur", function() { $(this).removeClass(FOCUS_STATE); });
            }
            else {
                return $(
                "<button type='button' class='k-button k-button-md k-rounded-md k-button-solid k-button-solid-base'>" +
                    '<span class="k-button-text">' +
                        actionText +
                    '</span>' +
                "</button>"
                );
            }
        },

        _clearFileAction: function(fileElement) {
            $(".k-upload-action", fileElement).empty().hide();
        },

        _onFileAction: function(e) {
            var that = this;
            if (!that.wrapper.hasClass("k-disabled")) {
                var button = $(e.target).closest(".k-upload-action");
                var icon = button.find(".k-icon,.k-svg-icon");
                var fileEntry = button.closest(".k-file");
                var files = fileEntry.data("fileNames");
                var hasValidationErrors = that._filesContainValidationErrors(files);
                var eventArgs = {
                    files: files,
                    headers: {}
                };

                that._retryClicked = false;

                if (icon.is(".k-i-x,.k-svg-i-x")) {
                    if (!that.trigger(REMOVE, eventArgs)) {
                        that._module.onRemove({ target: $(fileEntry, that.wrapper) }, eventArgs, !hasValidationErrors);
                        that.element.trigger("focus");
                    }
                } else if (icon.is(".k-i-cancel,.k-svg-i-cancel")) {
                    that.trigger(CANCEL, eventArgs);
                    that._module.onCancel({ target: $(fileEntry, that.wrapper) });
                    that._checkAllComplete();
                    that._updateHeaderUploadStatus();
                    that.element.trigger("focus");
                } else if (icon.is(".k-i-pause-sm,.k-svg-i-pause-sm")) {
                    that.trigger(PAUSE, eventArgs);
                    that.pause(fileEntry);
                    that._updateHeaderUploadStatus();
                } else if (icon.is(".k-i-play-sm,.k-svg-i-play-sm")) {
                    that.trigger(RESUME, eventArgs);
                    that.resume(fileEntry);
                } else if (icon.hasClass("k-i-retry")) {
                    $(".k-i-exclamation-circle", fileEntry).remove();
                    $(PROGRESSBAR_SELECTOR, fileEntry).finish().show();
                    that._module.onRetry({ target: $(fileEntry, that.wrapper) });
                    that._retryClicked = true;
                }

                fileEntry.addClass(FOCUS_STATE);
            }

            return false;
        },

        _onUploadSelected: function() {
            var that = this;
            var wrapper = that.wrapper;

            if (!wrapper.hasClass("k-disabled")) {
                this._module.onSaveSelected();
            }

            return false;
        },

        _onClearSelected: function() {
            var that = this;
            var wrapper = that.wrapper;

            var clearEventArgs = { };
            if (!wrapper.hasClass("k-disabled") && !that.trigger(CLEAR, clearEventArgs)) {
                that.clearAllFiles();
            }

            return false;
        },

        _onFileProgress: function(e, percentComplete) {
            var progressPct;
            var progressBar = $(PROGRESSBAR_SELECTOR, e.target).data("kendoProgressBar");

            if (percentComplete > 100) {
                percentComplete = 100;
            }

            $(PROGRESSBAR_SELECTOR, e.target).removeClass('k-hidden');

            if (!this.options.template) {
                progressPct = $(".k-upload-pct", e.target);

                if (progressPct.length === 0) {
                    $(".k-upload-actions", e.target).prepend("<span class='k-upload-pct'></span>");
                }

                if (percentComplete !== 100) {
                    $(".k-upload-pct", e.target).text(percentComplete + "%");
                } else {
                    $(".k-upload-pct", e.target).remove();
                }
            }

            if (progressBar) {
                progressBar.value(percentComplete);
            }

            this.trigger(PROGRESS, {
                files: getFileEntry(e).data("fileNames"),
                percentComplete: percentComplete
            });
        },

        _onUploadSuccess: function(e, response, xhr) {
            var that = this;
            var fileEntry = getFileEntry(e);
            var files = fileEntry.data("fileNames");
            var fileInfo = fileEntry.find('.k-file-summary');
            var fileSize = fileEntry.find('.k-file-size');

            var prevented = that.trigger(SUCCESS, {
                files: fileEntry.data("fileNames"),
                response: response,
                operation: "upload",
                XMLHttpRequest: xhr
            });

            if (prevented) {
                that._setUploadErrorState(fileEntry);
            } else {
                that._fileState(fileEntry, "uploaded");
                fileEntry.removeClass('k-file-progress').addClass('k-file-success');

                if (fileInfo.length > 0) {
                    fileInfo.addClass('k-hidden')
                        .after('<span class="k-file-validation-message" aria-live="polite">' + files.length + ' ' + that.localization.uploadSuccess + '</span>');
                } else if (fileSize.length > 0) {
                    fileSize.addClass('k-hidden')
                        .after('<span class="k-file-validation-message" aria-live="polite">' + that.localization.uploadSuccess + '</span>');
                }

                that._updateHeaderUploadStatus();

                if (that._supportsRemove()) {
                    that._fileAction(fileEntry, REMOVE);
                } else {
                    that._clearFileAction(fileEntry);
                }
            }

            that._hideUploadProgress(fileEntry);

            that._checkAllComplete();
        },

        _onUploadError: function(e, xhr) {
            var that = this;
            var module = that._module;
            var fileEntry = getFileEntry(e);
            var fileUid = fileEntry.data("uid");

            that._setUploadErrorState(fileEntry);

            that.trigger(ERROR, {
                operation: "upload",
                files: fileEntry.data("fileNames"),
                XMLHttpRequest: xhr
            });

            logToConsole("Server response: " + xhr.responseText);

            if (!that.options.async.chunkSize) {
                that._hideUploadProgress(fileEntry);
            } else {
                if (module._decreasePosition) {
                    module._decreasePosition(fileUid);
                }
            }

           that._checkAllComplete();

            if (this.options.async.autoRetryAfter) {
               this._autoRetryAfter(fileEntry);
            }
        },
        _autoRetryAfter: function(fileEntry) {
            var that = this;
            var retries = this._module.retries;

            if (!retries) {
                return;
            }

            if (!retries[fileEntry.data("uid")]) {
                retries[fileEntry.data("uid")] = 1;
            }

            if (retries[fileEntry.data("uid")] <= this.options.async.maxAutoRetries) {
                retries[fileEntry.data("uid")]++;
                setTimeout(function() {
                    that._module.performUpload(fileEntry);
                },this.options.async.autoRetryAfter);
            }
        },
        _setUploadErrorState: function(fileEntry) {
            var that = this,
                uploadPercentage,
                files = fileEntry.data("fileNames"),
                fileInfo = fileEntry.find('.k-file-summary'),
                fileSize = fileEntry.find('.k-file-size');

            that._fileState(fileEntry, "failed");
            fileEntry.removeClass('k-file-progress').addClass('k-file-error');

            if (fileInfo.length > 0) {
                fileInfo.addClass('k-hidden')
                    .after('<span class="k-file-validation-message" aria-live="polite">' + files.length + ' ' + that.localization.uploadFail + '</span>');
            } else if (fileSize.length > 0) {
                fileSize.addClass('k-hidden')
                    .after('<span class="k-file-validation-message" aria-live="polite">' + that.localization.uploadFail + '</span>');
            }

            that._updateUploadProgress(fileEntry);

            uploadPercentage = $('.k-upload-pct', fileEntry);

            if (uploadPercentage.length > 0) {
                uploadPercentage.remove();
            }

            this._updateHeaderUploadStatus();
            this._fileAction(fileEntry, "retry");
            this._fileAction(fileEntry, REMOVE, true);

            if (that._retryClicked) {
                fileEntry.trigger("focus");
            }
        },

       _updateUploadProgress: function(fileEntry) {
            var that = this;
            var progressbar = $( PROGRESSBAR_SELECTOR, fileEntry);
            var isProgressbar = progressbar.length > 0;

            if (!that.options.async.chunkSize && isProgressbar) {
                progressbar.data("kendoProgressBar").value(100);
            } else {
                var fileUid = fileEntry.data("uid");
                if (that._module.metaData) {
                    var fileMetaData = that._module.metaData[fileUid];

                    if (fileMetaData) {
                        var percentComplete = fileMetaData.totalChunks ? Math.round(((fileMetaData.chunkIndex) / fileMetaData.totalChunks) * 100) : 100;

                        that._onFileProgress({ target: $(fileEntry, that.wrapper) }, percentComplete);
                    }
                }
            }
        },

        _hideUploadProgress: function(fileEntry) {
            $(PROGRESSBAR_SELECTOR, fileEntry)
                .delay(PROGRESSHIDEDELAY)
                .fadeOut(PROGRESSHIDEDURATION, function() {
                    $(this).data("kendoProgressBar").value(0);
                });
        },

        _showActionButtons: function() {
            var that = this;
            var actionsWrapper = $(".k-actions", that.wrapper);
            var uploadButton = $(".k-upload-selected", that.wrapper);
            var clearButton = $(".k-clear-selected", that.wrapper);

            if (uploadButton.length === 0) {
                uploadButton = $(kendo.html.renderButton(`<button class='k-upload-selected'>${this.localization.uploadSelectedFiles}</button>`, {
                        icon: 'upload',
                        themeColor: 'primary'
                    }));

                clearButton = $(kendo.html.renderButton(`<button class='k-clear-selected'>${this.localization.clearSelectedFiles}</button>`, {
                    icon: 'x'
                }));

            }

            if (!actionsWrapper.length) {
                actionsWrapper = $("<div />")
                    .addClass("k-actions")
                    .append(uploadButton, clearButton);
            }


            this.wrapper.append(actionsWrapper);
        },

        _hideActionButtons: function() {
            $(".k-actions", this.wrapper).remove();
        },

        _showHeaderUploadStatus: function(isUploading) {
            var that = this;
            var localization = that.localization;
            var dropZone = $(".k-dropzone", that.wrapper);
            var headerUploadStatus = $('.k-upload-status-total', that.wrapper);

            if (headerUploadStatus.length !== 0) {
                headerUploadStatus.remove();
            }

            $('.k-dropzone-hint', that.wrapper).addClass('k-hidden');

            headerUploadStatus = '<span class="k-upload-status k-upload-status-total"><span class="k-icon"></span></span>';

            if (isUploading) {
                headerUploadStatus = $(headerUploadStatus).append(localization.headerStatusUploading);
                kendo.ui.icon(headerUploadStatus.find(".k-icon,.k-svg-icon"), { icon: headerStatusIconName.loading });
            } else {
                headerUploadStatus = $(headerUploadStatus).append(localization.headerStatusUploaded);
                kendo.ui.icon(headerUploadStatus.find(".k-icon,.k-svg-icon"), { icon: headerStatusIconName.warning });
            }

            if (dropZone.length > 0) {
                dropZone.append(headerUploadStatus);
            } else {
                $('.k-upload-button', that.wrapper).after(headerUploadStatus);
            }
        },

        _updateHeaderUploadStatus: function() {
            var that = this;
            var headerUploadStatus = $('.k-upload-status-total', this.wrapper);
            var currentlyUploading = $('.k-file', that.wrapper).not('.k-file-success, .k-file-error');
            var currentlyFailed = $('.k-file-error', that.wrapper);
            var currentlyPaused = $('.k-file', that.wrapper).find(".k-i-play-sm,.k-svg-i-play-sm");
            var headerUploadStatusIcon;

            if (currentlyPaused.length &&
            (currentlyPaused.length === currentlyUploading.length || !that.options.async.concurrent)) {
                headerUploadStatusIcon = $('.k-icon,.k-svg-icon', headerUploadStatus).removeClass();

                if (headerUploadStatusIcon.length) {
                    kendo.ui.icon(headerUploadStatusIcon, { icon: "pause-sm" });

                    headerUploadStatus.html(headerUploadStatusIcon)
                        .append(that.localization.headerStatusPaused);
                }
            } else if (currentlyUploading.length === 0 || currentlyFailed.length > 0) {
                headerUploadStatus = $('.k-upload-status-total', that.wrapper);
                headerUploadStatusIcon = $('.k-icon,.k-svg-icon', headerUploadStatus).removeClass();

                if (headerUploadStatusIcon.length) {

                    kendo.ui.icon(headerUploadStatusIcon, { icon: currentlyFailed.length !== 0 ? headerStatusIconName.warning : headerStatusIconName.success });

                    headerUploadStatus.html(headerUploadStatusIcon)
                        .append(that.localization.headerStatusUploaded);
                }
            }
        },

        _hideHeaderUploadstatus: function() {
            var that = this,
                dropZone = that.options.dropZone;

            $('.k-upload-status-total', this.wrapper).remove();

            if (dropZone === "") {
                $('.k-dropzone-hint', that.wrapper).removeClass('k-hidden');
            }
        },

        _onParentFormSubmit: function() {
            var upload = this,
                element = upload.element;

            if (typeof this._module.onAbort !== 'undefined') {
                this._module.onAbort();
            }

            if (!element.value) {
                var input = $(element);

                // Prevent submitting an empty input
                input.attr("disabled", "disabled");

                window.setTimeout(function() {
                    // Restore the input so the Upload remains functional
                    // in case the user cancels the form submit
                    input.prop("disabled", false);
                }, 0);
            }
        },

        _onParentFormReset: function() {
            $(".k-upload-files", this.wrapper).remove();
        },

        _supportsFormData: function() {
            return typeof(FormData) != "undefined";
        },

        _supportsMultiple: function() {
            var windows = this._userAgent().indexOf("Windows") > -1;

            return !kendo.support.browser.opera &&
                   !(kendo.support.browser.safari && windows);
        },

        _supportsDrop: function() {
            var userAgent = this._userAgent().toLowerCase();
            var isChrome = /chrome/.test(userAgent);
            var isSafari = !isChrome && /safari/.test(userAgent);
            var isWindowsSafari = isSafari && /windows/.test(userAgent);

            return !isWindowsSafari && this._supportsFormData() && (this.options.async.saveUrl);
        },

        _userAgent: function() {
            return navigator.userAgent;
        },

        _setupDropZone: function() {
            var that = this;

            var ns = that._ns;
            var dropZone = $(".k-dropzone", that.wrapper)

                .on("dragenter" + ns, stopEvent)
                .on("dragover" + ns, function(e) {
                    if (e.originalEvent) {
                        e.originalEvent.dataTransfer.dropEffect = "copy";
                    }
                    e.preventDefault();
                 })
                .on("drop" + ns, that._onDrop.bind(that));

            if (!dropZone.find(".k-dropzone-hint").length) {
                dropZone.append($("<span class='k-dropzone-hint'>" + that.localization.dropFilesHere + "</span>"));
            }

            bindDragEventWrappers(dropZone, ns,
                function() {
                    if (!dropZone.closest('.k-upload').hasClass("k-disabled")) {
                        dropZone.addClass(HOVER_STATE);
                    }
                },
                function() { dropZone.removeClass(HOVER_STATE); });

            that._bindDocumentDragEventWrappers(dropZone);
        },

        _setupCustomDropZone: function() {
            var that = this;
            var dropZone = $(that.options.dropZone);

            if (!that.wrapper.find(".k-dropzone-hint").length) {
                $(".k-dropzone", that.wrapper)
                    .append($("<span class='k-dropzone-hint k-hidden'>" + that.localization.dropFilesHere + "</span>"));
            } else {
                // Dropzone hint in upload should be hidden if customDropZone is used
                $('.k-dropzone-hint', that.wrapper).addClass('k-hidden');
            }

            var ns = that._ns;
            dropZone.on("dragenter" + ns, stopEvent)
                    .on("dragover" + ns, function(e) {
                        if (e.originalEvent) {
                            e.originalEvent.dataTransfer.dropEffect = "copy";
                        }
                        e.preventDefault();
                    })
                    .on("drop" + ns, that._onDrop.bind(that));

            bindDragEventWrappers(dropZone, ns,
                function(e) {
                    if (!that.wrapper.hasClass("k-disabled")) {
                        dropZone.removeClass(HOVER_STATE);
                        dropZone.addClass(HOVER_STATE);
                        $(e.target).addClass(HOVER_STATE);
                    }
                },
                function() {
                    dropZone.removeClass(HOVER_STATE);
                }
            );

            that._bindDocumentDragEventWrappers(dropZone);
        },

        _bindDocumentDragEventWrappers: function(dropZone) {
            var that = this;
            var ns = that._ns;

            bindDragEventWrappers($(document), ns,
                function() {
                    if (!that.wrapper.hasClass("k-disabled")) {
                        dropZone.addClass("k-dropzone-active");
                        dropZone.closest('.k-upload').removeClass('k-upload-empty');
                        dropZone.find('.k-dropzone-hint').removeClass('k-hidden');
                    }
                },
                function() {
                    dropZone.removeClass("k-dropzone-active");
                    dropZone.find('.k-dropzone-hint').addClass('k-hidden');
                    if ($('li.k-file', dropZone.closest('.k-upload')).length === 0) {
                        dropZone.closest('.k-upload').addClass('k-upload-empty');
                    }
                }
            );
        },

        _toggleDropZone: function() {
            var that = this,
                dropZone = that.options.dropZone;

            if (!that._supportsDrop()) {
                return;
            }

            $(dropZone).off(that._ns);
            $(".k-dropzone", that.wrapper).off(that._ns);

            if (dropZone !== "") {
                that._setupCustomDropZone();
            } else {
                that._setupDropZone();
            }
        },

        _supportsRemove: function() {
            return !!this.options.async.removeUrl;
        },

        _submitRemove: function(fileNames, eventArgs, onSuccess, onError) {
            var upload = this,
                removeField = upload.options.async.removeField || "fileNames",
                params = $.extend(eventArgs.data, antiForgeryTokens());

            params[removeField] = fileNames;

            jQuery.ajax({
                  type: this.options.async.removeVerb,
                  dataType: "json",
                  dataFilter: normalizeJSON,
                  url: this.options.async.removeUrl,
                  traditional: true,
                  data: params,
                  headers: eventArgs.headers,
                  success: onSuccess,
                  error: onError,
                  xhrFields: {
                    withCredentials: this.options.async.withCredentials
                  }
            });
        },

        _wrapInput: function(input) {
            var that = this;
            var options = that.options;
            var hasLabel = !!input.attr("id") && $("[for='" + input.attr("id") + "']").length > 0;
            var uploadButton = $("<div class='k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-upload-button' tabindex='0' role='button'><span class='k-button-text'></span></div>");

            uploadButton.find('.k-button-text').text(that.localization.select);

            input.wrap("<div class='k-upload' role='application'><div class='k-dropzone k-upload-dropzone'><div class='k-upload-button-wrap'></div></div></div>");
            uploadButton.prependTo(input.parent());

            if (!options.async.saveUrl) {
                input.closest(".k-upload").addClass("k-upload-sync");
            } else {
                input.closest(".k-upload").addClass("k-upload-async");
            }

            input.closest(".k-upload").addClass("k-upload-empty");

            if (!hasLabel && !input.attr("aria-label")) {
                input.attr("aria-label", that.localization.select);
            }

            input.attr({
                tabindex: -1,
                "aria-hidden": true
            });

            return input.closest(".k-upload");
        },

        _checkAllComplete: function() {
            if ($(".k-file.k-file-progress", this.wrapper).length === 0) {
                this.trigger(COMPLETE);
            }
        },

        _inputFiles: function(sourceInput) {
            return inputFiles(sourceInput);
        }
    });

    // Synchronous upload module
    var syncUploadModule = function(upload) {
        this.name = "syncUploadModule";
        this.element = upload.wrapper;
        this.upload = upload;
        this.element
            .closest("form")
                .attr("enctype", "multipart/form-data")
                .attr("encoding", "multipart/form-data");
    };

    syncUploadModule.prototype = {
        onSelect: function(e, files) {
            var upload = this.upload;
            var sourceInput = $(e.target);
            var filesContainErrors = upload._filesContainValidationErrors(files);

            upload._addInput(sourceInput);

            var fileData = { "fileNames": files };

            if (filesContainErrors) {
                sourceInput.remove();
            } else {
                fileData.relatedInput = sourceInput;
            }

            var file = upload._enqueueFile(getFileName(sourceInput), fileData);

            if (filesContainErrors) {
                upload._hideUploadProgress(file);
            }

            upload._fileAction(file, REMOVE);
        },

        onRemove: function(e) {
            var fileEntry = getFileEntry(e);
            var relatedInput = fileEntry.data("relatedInput");

            if (relatedInput) {
                relatedInput.remove();
            }

            this.upload._removeFileEntry(fileEntry);
        }
    };

    var iframeUploadModule = function(upload) {
        this.name = "iframeUploadModule";
        this.element = upload.wrapper;
        this.upload = upload;
        this.iframes = [];
    };

    Upload._frameId = 0;

    iframeUploadModule.prototype = {
        onSelect: function(e, files) {
            var upload = this.upload;
            var sourceInput = $(e.target);
            var hasValidationErrors = upload._filesContainValidationErrors(files);

            var fileEntry = this.prepareUpload(sourceInput, files, hasValidationErrors);

            if (upload.options.async.autoUpload) {
                if (!hasValidationErrors) {
                    this.performUpload(fileEntry);
                } else {
                    upload._fileAction(fileEntry, REMOVE);
                    upload._showHeaderUploadStatus(false);
                }
            } else {
                upload._fileAction(fileEntry, REMOVE);

                if (!hasValidationErrors) {
                    upload._showActionButtons();
                } else {
                    upload._updateHeaderUploadStatus();
                }
            }

            if (hasValidationErrors) {
                upload._hideUploadProgress(fileEntry);
            }
        },

        prepareUpload: function(sourceInput, files, hasValidationErrors) {
            var upload = this.upload;
            var activeInput = $(upload.element);
            var name = upload.options.async.saveField || sourceInput.attr("name");
            var fileEntry, fileData, iframe, form;

            upload._addInput(sourceInput);
            sourceInput.attr("name", name);

            if (!hasValidationErrors) {
                iframe = this.createFrame(upload.name + "_" + Upload._frameId++);
                this.registerFrame(iframe);

                form = this.createForm(upload.options.async.saveUrl, iframe.attr("name"))
                    .append(activeInput);

                fileData = { "frame": iframe, "relatedInput": activeInput, "fileNames": files };
            } else {
                sourceInput.remove();

                fileData = { "fileNames": files };
            }

            fileEntry = upload._enqueueFile(getFileName(sourceInput), fileData);

            if (iframe) {
                iframe.data({ "form": form, "file": fileEntry });
            }

            return fileEntry;
        },

        performUpload: function(fileEntry) {
            var e = { files: fileEntry.data("fileNames") };
            var iframe = fileEntry.data("frame");
            var upload = this.upload;
            var fileValidation = fileEntry.find('.k-file-validation-message');
            var fileInfo = fileEntry.find('.k-file-summary');
            var fileSize = fileEntry.find('.k-file-size');

            if (!upload.trigger(UPLOAD, e)) {
                upload._hideActionButtons();
                upload._showHeaderUploadStatus(true);

                iframe.appendTo(document.body);

                var form = iframe.data("form")
                    .attr("action", upload.options.async.saveUrl)
                    .appendTo(document.body);

                e.data = $.extend({ }, e.data, antiForgeryTokens());
                for (var key in e.data) {
                    var dataInput = form.find("input[name='" + key + "']");
                    if (dataInput.length === 0) {
                        dataInput = $("<input>", { type: "hidden", name: key })
                            .prependTo(form);
                    }
                    dataInput.val(e.data[key]);
                }

                upload._fileAction(fileEntry, CANCEL);
                upload._fileState(fileEntry, "uploading");
                $(fileEntry).removeClass("k-file-error").addClass("k-file-progress");

                if (fileValidation.length > 0) {
                    fileValidation.remove();
                }

                if (fileInfo.length > 0) {
                    fileInfo.removeClass('k-hidden');
                } else if (fileSize.length > 0) {
                    fileSize.removeClass('k-hidden');
                }

                iframe
                    .one("load", this.onIframeLoad.bind(this));

                form[0].submit();
            } else {
                upload._removeFileEntry(iframe.data("file"));
                this.cleanupFrame(iframe);
                this.unregisterFrame(iframe);
            }
        },

        onSaveSelected: function() {
            var module = this;
            var upload = module.upload;

            $(".k-file", this.element).each(function() {
                var fileEntry = $(this);
                var started = isFileUploadStarted(fileEntry);
                var hasValidationErrors = upload._filesContainValidationErrors(fileEntry.data("fileNames"));

                if (!started && !hasValidationErrors) {
                    module.performUpload(fileEntry);
                }
            });
        },

        onIframeLoad: function(e) {
            var iframe = $(e.target),
                responseText;

            try {
                responseText = iframe.contents().text();
            } catch (ex) {
                responseText = "Error trying to get server response: " + ex;
            }

            this.processResponse(iframe, responseText);
        },

        processResponse: function(iframe, responseText) {
            var fileEntry = iframe.data("file"),
                module = this,
                fakeXHR = {
                    responseText: responseText
                };
            tryParseJSON(responseText,
                function(jsonResult) {
                    $.extend(fakeXHR, { statusText: "OK", status: "200" });
                    module.upload._onFileProgress({ target: $(fileEntry, module.upload.wrapper) }, 100);
                    module.upload._onUploadSuccess({ target: $(fileEntry, module.upload.wrapper) }, jsonResult, fakeXHR);

                    module.cleanupFrame(iframe);
                    module.unregisterFrame(iframe);
                },
                function() {
                    $.extend(fakeXHR, { statusText: "error", status: "500" });
                    module.upload._onUploadError({ target: $(fileEntry, module.upload.wrapper) }, fakeXHR);
                }
            );
        },

        onCancel: function(e) {
            var iframe = $(e.target).data("frame");

            this.stopFrameSubmit(iframe);
            this.cleanupFrame(iframe);
            this.unregisterFrame(iframe);
            this.upload._removeFileEntry(iframe.data("file"));
        },

        onRetry: function(e) {
            var fileEntry = getFileEntry(e);
            this.performUpload(fileEntry);
        },

        onRemove: function(e, eventArgs, shouldSendRemoveRequest) {
            var module = this;
            var upload = module.upload;
            var fileEntry = getFileEntry(e);
            var iframe = fileEntry.data("frame");

            if (iframe) {
                module.unregisterFrame(iframe);
                upload._removeFileEntry(fileEntry);
                module.cleanupFrame(iframe);
            } else {
                if (fileEntry.hasClass("k-file-success")) {
                    removeUploadedFile(fileEntry, upload, eventArgs, shouldSendRemoveRequest);
                } else {
                    upload._removeFileEntry(fileEntry);
                }
            }
        },

        onAbort: function() {
            var element = this.element,
                module = this;

            $.each(this.iframes, function() {
                $("input", this.data("form")).appendTo(element);
                module.stopFrameSubmit(this[0]);
                this.data("form").remove();
                this.remove();
            });

            this.iframes = [];
        },

        createFrame: function(id) {
            return $(
                "<iframe" +
                " name='" + id + "'" +
                " id='" + id + "'" +
                " style='display:none;' />"
            );
        },

        createForm: function(action, target) {
            return $(
                "<form enctype='multipart/form-data' method='POST'" +
                " action='" + action + "'" +
                " target='" + target + "'" +
                "/>");
        },

        stopFrameSubmit: function(frame) {
            if (typeof(frame.stop) != "undefined") {
                frame.stop();
            } else if (frame.document) {
                frame.document.execCommand("Stop");
            }
        },

        registerFrame: function(frame) {
            this.iframes.push(frame);
        },

        unregisterFrame: function(frame) {
            this.iframes = $.grep(this.iframes, function(value) {
                return value.attr("name") != frame.attr("name");
            });
        },

        cleanupFrame: function(frame) {
            var form = frame.data("form");

            frame.data("file").data("frame", null);

            setTimeout(function() {
                form.remove();
                frame.remove();
            }, 1);
        }
    };

    // FormData upload module
    var formDataUploadModule = function(upload) {
        this.name = "formDataUploadModule";
        this.element = upload.wrapper;
        this.upload = upload;
        this.position = {};
        this.metaData = {};
        this.cancelled = {};
        this.resume = {};
        this.paused = {};
        this.retries = {};
    };

    formDataUploadModule.prototype = {
        onSelect: function(e, files) {
            var upload = this.upload;
            var module = this;
            var sourceElement = $(e.target);
            var fileEntries = this.prepareUpload(sourceElement, files);
            var hasValidationErrors;
            var prev;

            $.each(fileEntries, function(index) {
                hasValidationErrors = upload._filesContainValidationErrors($(this.data("fileNames")));

                if (upload.options.async.autoUpload) {
                    if (!hasValidationErrors) {
                        if (upload.options.async.chunkSize) {
                            module.prepareChunk(this);
                            prev = this.prev();

                            if (upload.options.async.concurrent || (index === 0 && !prev.length) ||
                             (index === 0 && prev.hasClass("k-file-success"))) {
                                module.performUpload(this);
                            }
                        } else {
                            module.performUpload(this);
                        }
                    } else {
                        upload._fileAction(this, REMOVE);
                        upload._showHeaderUploadStatus(false);
                    }
                } else {
                    upload._fileAction(this, REMOVE);

                    if (!hasValidationErrors) {
                        upload._showActionButtons();
                        this.addClass("k-toupload");
                    } else {
                        upload._updateHeaderUploadStatus();
                    }
                }

                if (hasValidationErrors) {
                    upload._hideUploadProgress(this);
                }
            });
        },

        prepareUpload: function(sourceElement, files) {
            var fileEntries = this.enqueueFiles(files);

            if (sourceElement.is("input")) {
                $.each(fileEntries, function() {
                    $(this).data("relatedInput", sourceElement);
                });
                sourceElement.data("relatedFileEntries", fileEntries);
                this.upload._addInput(sourceElement);
            }

            return fileEntries;
        },

        enqueueFiles: function(files) {
            var upload = this.upload;
            var name;
            var i;
            var filesLength = files.length;
            var currentFile;
            var fileEntry;
            var fileEntries = [];

            if (upload.options.async.batch === true) {
                name = $.map(files, function(file) { return file.name; }).join(", ");

                if (upload.directory || upload.options.directoryDrop) {
                    $(files).each(function() {
                        if (this.rawFile.webkitRelativePath || this.rawFile.relativePath) {
                            this.name = this.rawFile.webkitRelativePath || this.rawFile.relativePath;
                        }
                    });
                }

                fileEntry = upload._enqueueFile(name, { fileNames: files });
                fileEntry.data("files", files);

                fileEntries.push(fileEntry);
            } else {
                for (i = 0; i < filesLength; i++) {
                    currentFile = files[i];
                    name = currentFile.name;
                    if (upload.directory || upload.options.directoryDrop) {
                        if (currentFile.rawFile.webkitRelativePath || currentFile.rawFile.relativePath) {
                            currentFile.name = currentFile.rawFile.webkitRelativePath || currentFile.rawFile.relativePath;
                        }
                    }
                    fileEntry = upload._enqueueFile(name, { fileNames: [currentFile] });
                    fileEntry.data("files", [currentFile]);

                    fileEntries.push(fileEntry);
                }
            }

            return fileEntries;
        },

        performUpload: function(fileEntry) {
            var upload = this.upload,
                formData = this.createFormData(),
                xhr = this.createXHR(),
                e = {
                    files: fileEntry.data("fileNames"),
                    XMLHttpRequest: xhr
                },
                files;
            var fileValidation = fileEntry.find('.k-file-validation-message');
            var fileInfo = fileEntry.find('.k-file-summary');
            var fileSize = fileEntry.find('.k-file-size');

            if (!upload.trigger(UPLOAD, e)) {
                if (fileEntry.find(".k-i-cancel,.k-svg-i-cancel").length === 0) {
                    if (upload.options.async.chunkSize) {
                        upload._fileAction(fileEntry, PAUSE);
                    }
                    upload._fileAction(fileEntry, CANCEL, upload.options.async.chunkSize);
                }

                if (!upload.wrapper.find(".k-toupload").length) {
                    upload._hideActionButtons();
                }

                upload._showHeaderUploadStatus(true);

                if (e.formData) {
                    formData = e.formData;
                } else {
                    e.data = $.extend({ }, e.data, antiForgeryTokens());
                    for (var key in e.data) {
                        formData.append(key, e.data[key]);
                    }

                    files = fileEntry.data("files");
                    if (files) {
                        this.populateFormData(formData, files);
                    }
                }

                upload._fileState(fileEntry, "uploading");
                $(fileEntry).removeClass("k-file-error").addClass("k-file-progress");

                if (fileValidation.length > 0) {
                    fileValidation.remove();
                }

                if (fileInfo.length > 0) {
                    fileInfo.removeClass('k-hidden');
                } else if (fileSize.length > 0) {
                    fileSize.removeClass('k-hidden');
                }

                if (upload.options.async.useArrayBuffer && window.FileReader) {
                    this._readFile(upload.options.async.saveUrl, formData, fileEntry, xhr);
                } else {
                    this.postFormData(upload.options.async.saveUrl, formData, fileEntry, xhr);
                }
            } else {
                this.removeFileEntry(fileEntry);
            }
        },

        _readFile: function(saveUrl, formData, fileEntry, xhr) {
            var that = this;
            var upload = that.upload;
            var file = fileEntry.data("files")[0];

            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    if (!that.fileArrayBuffer) {
                        that.fileArrayBuffer = e.target.result;
                    } else {
                        that.fileArrayBuffer = that._appendBuffer(that.fileArrayBuffer, e.target.result);
                    }
                } catch (err) {
                    upload._onUploadError({ target: $(fileEntry, upload.wrapper) }, xhr);
                    return;
                }

                if (that.position[file.uid] > file.size) {
                    that.postFormData(upload.options.async.saveUrl, that.fileArrayBuffer, fileEntry, xhr);
                    that.fileArrayBuffer = null;
                } else {
                    that._readFile(saveUrl, formData, fileEntry, xhr);
                }
            };
            reader.onerror = function() {
                upload._onUploadError({ target: $(fileEntry, upload.wrapper) }, xhr);
            };
            reader.readAsArrayBuffer(that._getCurrentChunk(file.rawFile, file.uid));
        },

        _appendBuffer: function(buffer1, buffer2) {
            var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);

            tmp.set(new Uint8Array(buffer1), 0);
            tmp.set(new Uint8Array(buffer2), buffer1.byteLength);

            return tmp.buffer;
        },

        onSaveSelected: function() {
            var module = this;
            var upload = module.upload;

            $(".k-toupload", this.element).filter(function() {
                var fileEntry = $(this);
                var started = isFileUploadStarted(fileEntry);
                var hasValidationErrors = upload._filesContainValidationErrors(fileEntry.data("fileNames"));

                return !started && !hasValidationErrors;
            }).each(function(index) {
                var fileEntry = $(this);
                var prevEntry = fileEntry.prev();

                fileEntry.removeClass("k-toupload");
                if (upload.options.async.chunkSize) {
                    module.prepareChunk(fileEntry);

                    if (upload.options.async.concurrent || (index === 0 && !prevEntry.length) ||
                        (index === 0 && prevEntry.hasClass("k-file-success") || prevEntry.hasClass("k-file-error:not(k-file-invalid)"))) {
                        module.performUpload(fileEntry);
                    }
                } else {
                    module.performUpload(fileEntry);
                }
            });
        },

        onCancel: function(e) {
            var fileEntry = getFileEntry(e);

            if (this.upload.options.async.chunkSize) {
                this.cancelled[fileEntry.data("uid")] = true;
            }
            this.stopUploadRequest(fileEntry);
            this.removeFileEntry(fileEntry);
        },

        onPause: function(e) {
            var fileEntry = getFileEntry(e);
            var fileUid = fileEntry.data("uid");
            var async = this.upload.options.async;

            if (async.chunkSize) {
                this.retries[fileUid] = async.maxAutoRetries + 1;
                this.paused[fileUid] = true;
                this.resume[fileUid] = false;
            }
        },

        onResume: function(e) {
            var fileEntry = getFileEntry(e);
            var fileUid = fileEntry.data("uid");

            if (this.upload.options.async.chunkSize) {
                delete this.paused[fileUid];
                this.resume[fileUid] = true;
                this.retries[fileEntry.data("uid")] = 1;
                this._increaseChunkIndex(fileUid);
                this.performUpload(fileEntry);
            }
        },

        onRetry: function(e) {
            var fileEntry = getFileEntry(e);
            var async = this.upload.options.async;

            if (async.chunkSize) {
                this.retries[fileEntry.data("uid")] = async.maxAutoRetries + 1;
                delete this.paused[fileEntry.data("uid")];
            }

            this.performUpload(fileEntry);
        },

        onRemove: function(e, eventArgs, shouldSendRemoveRequest) {
            var module = this;
            var upload = module.upload;
            var fileEntry = getFileEntry(e);
            var async = this.upload.options.async;

            if (async.chunkSize) {
                this.retries[fileEntry.data("uid")] = async.maxAutoRetries + 1;
            }

            if (fileEntry.hasClass("k-file-success")) {
                removeUploadedFile(fileEntry, upload, eventArgs, shouldSendRemoveRequest);
            } else {
                module.removeFileEntry(fileEntry);
            }
        },

        createXHR: function() {
            return new XMLHttpRequest();
        },

        postFormData: function(url, data, fileEntry, xhr) {
            var module = this;

            fileEntry.data("request", xhr);

            xhr.addEventListener("load", function(e) {
                module.onRequestSuccess.call(module, e, fileEntry);
            }, false);

            xhr.addEventListener(ERROR, function(e) {
                module.onRequestError.call(module, e, fileEntry);
            }, false);

            xhr.upload.addEventListener("progress", function(e) {
                module.onRequestProgress.call(module, e, fileEntry);
            }, false);

            xhr.open("POST", url, true);
            xhr.withCredentials = this.upload.options.async.withCredentials;

            var accept = this.upload.options.async.accept;
            if (accept) {
                xhr.setRequestHeader("Accept", accept);
            }

            xhr.send(data);
        },

        createFormData: function() {
            return new FormData();
        },

        populateFormData: function(data, files) {
            var chunk;
            var i;
            var length = files.length;
            var uid;
            var upload = this.upload;

            if (upload.options.async.chunkSize) {
                 uid = files[0].uid;
                 chunk = this._getCurrentChunk(files[0].rawFile, uid);

                data.append(
                    upload.options.async.saveField || upload.name,
                    chunk
                );

                var serializedMetaData = JSON.stringify(this.metaData[uid]);
                data.append("metadata", serializedMetaData);
            } else {
                 for (i = 0; i < length; i++) {
                    data.append(
                        upload.options.async.saveField || upload.name,
                        files[i].rawFile
                    );
                 }
            }

            return data;
        },

        onRequestSuccess: function(e, fileEntry) {
            var xhr = e.target,
                module = this;

            function raiseError() {
                module.upload._onUploadError({ target: $(fileEntry, module.upload.wrapper) }, xhr);
            }

            function parseSuccess(jsonResult) {
                var batch = module.upload.options.async.batch;
                var chunkSize = module.upload.options.async.chunkSize;
                var concurrent = module.upload.options.async.concurrent;
                var fileUid = jsonResult.fileUid;

                if (module.paused[fileUid] || module.cancelled[fileUid]) {
                    return;
                }

                delete module.retries[fileUid];

                if (chunkSize && !batch && !jsonResult.uploaded) {

                    module._increaseChunkIndex(fileUid);
                    module.performUpload(fileEntry);
                } else if (chunkSize && !batch && !concurrent && fileEntry.next().length && !fileEntry.next().hasClass("k-toupload")) {
                        module.upload._onFileProgress({ target: $(fileEntry, module.upload.wrapper) }, 100);
                        module._resetChunkIndex(fileUid);
                        module.upload._onUploadSuccess({ target: $(fileEntry, module.upload.wrapper) }, jsonResult, xhr);

                        module.performUpload(fileEntry.next());
                } else {
                    module.upload._onFileProgress({ target: $(fileEntry, module.upload.wrapper) }, 100);
                    module.upload._onUploadSuccess({ target: $(fileEntry, module.upload.wrapper) }, jsonResult, xhr);
                    module.cleanupFileEntry(fileEntry);
                }
            }

            if (xhr.status >= 200 && xhr.status <= 299) {
                tryParseJSON(xhr.responseText,
                    parseSuccess,
                    raiseError
                );
            } else {
                raiseError();
            }
        },

        onRequestError: function(e, fileEntry) {
            var xhr = e.target;

            this.upload._onUploadError({ target: $(fileEntry, this.upload.wrapper) }, xhr);
        },

        cleanupFileEntry: function(fileEntry) {
            var relatedInput = fileEntry.data("relatedInput"),
                uploadComplete = true;

            if (relatedInput) {
                $.each(relatedInput.data("relatedFileEntries") || [], function() {
                    // Exclude removed file entries and self
                    if (this.parent().length > 0 && this[0] != fileEntry[0]) {
                        uploadComplete = uploadComplete && this.hasClass("k-file-success");
                    }
                });

                if (uploadComplete) {
                    relatedInput.remove();
                }
            }
        },

        removeFileEntry: function(fileEntry) {
            var chunkSize = this.upload.options.async.chunkSize;
            var concurrent = this.upload.options.async.concurrent;
            var isUploadButtonVisible = this.upload.wrapper.find(".k-upload-selected").length > 0;

            this.cleanupFileEntry(fileEntry);
            if (chunkSize && !concurrent && !isUploadButtonVisible) {
                 if (fileEntry.next().length) {
                     this.performUpload(fileEntry.next());
                 }
            }
            this.upload._removeFileEntry(fileEntry);
        },

        onRequestProgress: function(e, fileEntry) {
            var percentComplete = Math.round(e.loaded * 100 / e.total);
            var fileUid = fileEntry.data("uid");
            var fileMetaData;

            if (this.upload.options.async.chunkSize) {
                fileMetaData = this.metaData[fileUid];
                percentComplete = fileMetaData && fileMetaData.totalChunks ? Math.round(((fileMetaData.chunkIndex) / fileMetaData.totalChunks) * 100) : 100;
            }
            this.upload._onFileProgress({ target: $(fileEntry, this.upload.wrapper) }, percentComplete);
        },

        stopUploadRequest: function(fileEntry) {
            if (fileEntry.data("request")) {
                fileEntry.data("request").abort();
            }
        },

        prepareChunk: function(fileEntry) {
            var file = fileEntry.data("files")[0];
            var rawFile = file.rawFile;
            var uid = file.uid;
            var chunkSize = this.upload.options.async.chunkSize;
            this.position[uid] = 0;

            this.metaData[uid] = {
                chunkIndex: 0,
                contentType: rawFile.type,
                fileName: rawFile.name,
                relativePath: file.name,
                totalFileSize: rawFile.size,
                totalChunks: Math.ceil(rawFile.size / chunkSize),
                uploadUid: uid
            };
        },

        _decreaseChunkIndex: function(uid) {
            this.metaData[uid].chunkIndex--;
        },

        _increaseChunkIndex: function(uid) {
            this.metaData[uid].chunkIndex++;
        },

        _resetChunkIndex: function(uid) {
            this.metaData[uid].chunkIndex = 0;
        },

        _decreasePosition: function(uid) {
            this.position[uid] -= this.upload.options.async.chunkSize;
        },

        _getCurrentChunk: function(file, uid) {
            var oldPosition = this.position[uid];
            var methodToInvoke;
            var async = this.upload.options.async;
            var chunkSize = async.chunkSize || async.bufferChunkSize;

            if (!this.position[uid]) {
                this.position[uid] = 0;
            }
            this.position[uid] += chunkSize;

            if (!!(methodToInvoke = this._getChunker(file))) {
                return file[methodToInvoke](oldPosition, this.position[uid]);
            } else {
                return file;
            }
        },

        _getChunker: function(file) {
            if (file.slice) {
                return "slice";
            } else if (file.mozSlice) {
                return "mozSlice";
            } else if (file.webkitSlice) {
                    return "webkitSlice";
            } else {
                return null;
            }
        }
    };

    // Helper functions
    function getFileName(input) {
        return $.map(inputFiles(input), function(file) {
            return file.name;
        }).join(", ");
    }

    function inputFiles($input) {
        var input = $input[0];

        if (input.files) {
            return getAllFileInfo(input.files);
        } else {
            return [{
                name: stripPath(input.value),
                extension: getFileExtension(input.value),
                size: null
            }];
        }
    }

    function getAllFileInfo(rawFiles) {
        return $.map(rawFiles, function(file) {
            return getFileInfo(file);
        });
    }

    function getFileInfo(rawFile) {
        // Older Firefox versions (before 3.6) use fileName and fileSize
        var fileName = rawFile.name || rawFile.fileName;
        return {
            name: kendo.htmlEncode(fileName),
            extension: getFileExtension(fileName),
            size: typeof rawFile.size == "number" ? rawFile.size : rawFile.fileSize, //rawFile.size || rawFile.fileSize,
            rawFile: rawFile
        };
    }

    function getFileExtension(fileName) {
        var matches = fileName.match(rFileExtension);
        return matches ? matches[0] : "";
    }

    function stripPath(name) {
        var slashIndex = name.lastIndexOf("\\");
        return (slashIndex != -1) ? name.substr(slashIndex + 1) : name;
    }

    function assignGuidToFiles(files, unique) {
        var uid = kendo.guid();

        return $.map(files, function(file) {
            file.uid = unique ? kendo.guid() : uid;

            return file;
        });
    }

    function validateFiles(files, validationInfo) {
        var allowedExtensions = parseAllowedExtensions(validationInfo.allowedExtensions);
        var maxFileSize = validationInfo.maxFileSize;
        var minFileSize = validationInfo.minFileSize;

        for (var i = 0; i < files.length; i++) {
            validateFileExtension(files[i], allowedExtensions);
            validateFileSize(files[i], minFileSize, maxFileSize);
        }
    }

    function parseAllowedExtensions(extensions) {
        var allowedExtensions = $.map(extensions, function(ext) {
            var parsedExt = (ext.substring(0, 1) === ".") ? ext : ("." + ext);
            return parsedExt.toLowerCase();
        });

        return allowedExtensions;
    }

    function validateFileExtension(file, allowedExtensions) {
        if (allowedExtensions.length > 0) {
            if (allowedExtensions.indexOf(file.extension.toLowerCase()) < 0) {
                file.validationErrors = file.validationErrors || [];
                if ($.inArray(INVALIDFILEEXTENSION, file.validationErrors) === -1) {
                    file.validationErrors.push(INVALIDFILEEXTENSION);
                }
            }
        }
    }

    function validateFileSize(file, minFileSize, maxFileSize) {
        if (minFileSize !== 0 && file.size < minFileSize) {
            file.validationErrors = file.validationErrors || [];
            if ($.inArray(INVALIDMINFILESIZE, file.validationErrors) === -1) {
                file.validationErrors.push(INVALIDMINFILESIZE);
            }
        }

        if (maxFileSize !== 0 && file.size > maxFileSize) {
            file.validationErrors = file.validationErrors || [];
            if ($.inArray(INVALIDMAXFILESIZE, file.validationErrors) === -1) {
                file.validationErrors.push(INVALIDMAXFILESIZE);
            }
        }
    }

    function getTotalFilesSizeMessage(files) {
        var totalSize = 0;

        if (typeof files[0].size == "number") {
            for (var i = 0; i < files.length; i++) {
                if (files[i].size) {
                    totalSize += files[i].size;
                }
            }
        } else {
            return "";
        }

        totalSize /= 1024;

        if (totalSize < 1024) {
            return totalSize.toFixed(2) + " KB";
        } else {
            return (totalSize / 1024).toFixed(2) + " MB";
        }
    }

    function shouldRemoveFileEntry(upload) {
        return !upload.multiple && $(".k-file", upload.wrapper).length > 1;
    }

    function removeUploadedFile(fileEntry, upload, eventArgs, shouldSendRemoveRequest) {
        if (!upload._supportsRemove()) {
            if (shouldRemoveFileEntry(upload) || !shouldSendRemoveRequest) {
                upload._removeFileEntry(fileEntry);
            }

            return;
        }

        var files = fileEntry.data("fileNames");
        var fileNames = $.map(files, function(file) { return file.name; });

        if (shouldSendRemoveRequest === false) {
            upload._removeFileEntry(fileEntry);

            return;
        }

        upload._submitRemove(fileNames, eventArgs,
            function onSuccess(data, textStatus, xhr) {
                var prevented = upload.trigger(SUCCESS, {
                    operation: "remove",
                    files: files,
                    response: data,
                    XMLHttpRequest: xhr
                });

                if (!prevented) {
                    upload._removeFileEntry(fileEntry);
                }
            },

            function onError(xhr) {
                if (shouldRemoveFileEntry(upload)) {
                    upload._removeFileEntry(fileEntry);
                }

                upload.trigger(ERROR, {
                    operation: "remove",
                    files: files,
                    XMLHttpRequest: xhr
                });

                logToConsole("Server response: " + xhr.responseText);
            }
        );
    }

    function tryParseJSON(input, onSuccess, onError) {
        var success = false,
            json = "";

        try {
            json = JSON.parse(normalizeJSON(input));
            success = true;
        } catch (e) {
            onError();
        }

        if (success) {
            onSuccess(json);
        }
    }

    function normalizeJSON(input) {
        if (typeof input === "undefined" || input === "") {
            input = "{}";
        }

        return input;
    }

    function stopEvent(e) {
        if (e.originalEvent) {
            e.originalEvent.dataTransfer.dropEffect = "copy";
        }
        e.stopPropagation(); e.preventDefault();
    }

    function bindDragEventWrappers(element, namespace, onDragEnter, onDragLeave) {
        var hideInterval, lastDrag;

        element
            .on("dragenter" + namespace, function(e) {
                onDragEnter(e);
                lastDrag = new Date();

                if (!hideInterval) {
                    hideInterval = setInterval(function() {
                        var sinceLastDrag = new Date() - lastDrag;
                        if (sinceLastDrag > 100) {
                            onDragLeave();

                            clearInterval(hideInterval);
                            hideInterval = null;
                        }
                    }, 100);
                }
            })
            .on("dragover" + namespace, function() {
                lastDrag = new Date();
            });
    }

    function isFileUploadStarted(fileEntry) {
        return fileEntry.is(".k-file-progress, .k-file-success, .k-file-error:not(.k-file-invalid)");
    }

    function getFileEntry(e) {
        return $(e.target).closest(".k-file");
    }

    kendo.ui.plugin(Upload);
})(window.kendo.jQuery);

