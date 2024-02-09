/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./pane.js";
import "../kendo.upload.js";

(function($, undefined) {
    var kendo = window.kendo,
        imageeditorNS = kendo.ui.imageeditor,
        extend = $.extend,
        Class = kendo.Class;

    var Command = Class.extend({
        init: function(options) {
            this.options = extend({}, options, this.options);
            this.imageeditor = options.imageeditor;
        }
    });

    var OpenPaneImageEditorCommand = Command.extend({
        init: function(options) {
            Command.fn.init.call(this, options);
        },
        exec: function() {
            var that = this,
                imageeditor = that.imageeditor,
                pane = new imageeditorNS.panes[that.options.value](imageeditor);

                pane.open();
                pane.element.find(":kendoFocusable").first().trigger("focus");
        }
    });

    var ZoomImageEditorCommand = Command.extend({
        options: {
            zoomStep: 0.05,
            spacing: 20
        },
        init: function(options) {
            Command.fn.init.call(this, options);
        },
        exec: function() {
            var that = this,
                options = that.options,
                value = options.value,
                imageeditor = that.imageeditor,
                imgHeight = imageeditor._image.height,
                currentZoom = imageeditor.getZoomLevel(),
                newHeight = imgHeight,
                zoomInOut = value === "zoomIn" || value === "zoomOut";

                if (!isNaN(value)) {
                    value = parseFloat(value);
                } else if (typeof value === "string") {
                    value = that._processStringValue(value, currentZoom);
                }

                newHeight = Math.round(imgHeight * value);

                if (newHeight > 0) {
                    $(imageeditor._canvas).css("height", newHeight);
                    imageeditor._zoomLevel = value;
                }

                if (imageeditor.currentPaneTool) {
                    imageeditor.currentPaneTool.refresh();
                }

                if (zoomInOut) {
                    imageeditor.toolbar.element.find("[tabindex=0]").trigger("focus");
                }
        },
        _processStringValue: function(value, initialZoom) {
            var that = this,
                options = that.options,
                imageeditor = that.imageeditor,
                imgHeight = imageeditor._image.height,
                expectedHeight = imageeditor.canvasWrapper.height() - options.spacing,
                zoomStep = options.zoomStep;

            switch (value) {
                case "zoomIn":
                    return initialZoom + zoomStep;
                case "zoomOut":
                    return initialZoom - zoomStep;
                case "fitToScreen":
                    return Math.round((expectedHeight / imgHeight) * 100) / 100;
                default:
                    return 1;
            }
        }
    });

    var CropImageEditorCommand = Command.extend({
        init: function(options) {
            Command.fn.init.call(this, options);
        },
        exec: function() {
            var that = this,
                options = that.options,
                imageeditor = that.imageeditor,
                canvas = imageeditor.getCanvasElement(),
                ctx = imageeditor.getCurrent2dContext(),
                croppedImage = ctx.getImageData(options.left, options.top, options.width, options.height);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = options.width;
            canvas.height = options.height;
            ctx.putImageData(croppedImage, 0, 0);

            imageeditor.drawImage(canvas.toDataURL()).done(function(image) {
                imageeditor.drawCanvas(image);
                imageeditor.toolbar.element.find("[tabindex=0]").trigger("focus");
            }).fail(function(ev) {
                imageeditor.trigger("error", ev);
            });
        }
    });

    var ResizeImageEditorCommand = Command.extend({
        init: function(options) {
            Command.fn.init.call(this, options);
        },
        exec: function() {
            var that = this,
                options = that.options,
                imageeditor = that.imageeditor,
                canvas = imageeditor.getCanvasElement(),
                ctx = imageeditor.getCurrent2dContext(),
                image = imageeditor.getCurrentImage();

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = options.width;
            canvas.height = options.height;
            ctx.drawImage(image, 0, 0, options.width, options.height);

            imageeditor.drawImage(canvas.toDataURL()).done(function(image) {
                imageeditor.drawCanvas(image);
                imageeditor.toolbar.element.find("[tabindex=0]").trigger("focus");
            }).fail(function(ev) {
                imageeditor.trigger("error", ev);
            });
        }
    });

    var UndoImageEditorCommand = Command.extend({
        exec: function() {
            var that = this,
                imageeditor = that.imageeditor,
                canvas = imageeditor.getCanvasElement(),
                ctx = imageeditor.getCurrent2dContext(),
                image = imageeditor.undoStack.pop();

            if (image) {
                imageeditor.redoStack.push(imageeditor.getCurrentImage());
                delete imageeditor._image;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0, image.width, image.height);

                imageeditor.drawImage(canvas.toDataURL()).done(function(image) {
                    imageeditor.drawCanvas(image);
                    imageeditor.toolbar.element.find("[tabindex=0]").trigger("focus");
                }).fail(function(ev) {
                    imageeditor.trigger("error", ev);
                });
            }
        }
    });

    var RedoImageEditorCommand = Command.extend({
        exec: function() {
            var that = this,
                imageeditor = that.imageeditor,
                canvas = imageeditor.getCanvasElement(),
                ctx = imageeditor.getCurrent2dContext(),
                image = imageeditor.redoStack.pop();

            if (image) {
                imageeditor.undoStack.push(imageeditor.getCurrentImage());
                delete imageeditor._image;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0, image.width, image.height);

                imageeditor.drawImage(canvas.toDataURL()).done(function(image) {
                    imageeditor.drawCanvas(image);
                    imageeditor.toolbar.element.find("[tabindex=0]").trigger("focus");
                }).fail(function(ev) {
                    imageeditor.trigger("error", ev);
                });
            }
        }
    });

    var SaveImageEditorCommand = Command.extend({
        exec: function() {
            var that = this,
                imageeditor = that.imageeditor,
                canvas = imageeditor.getCanvasElement();

            kendo.saveAs(extend({}, imageeditor.options.saveAs, {
                dataURI: canvas.toDataURL()
            }));

            imageeditor.toolbar.element.find("[data-command=SaveImageEditorCommand]").trigger("focus");
        }
    });

    var OpenImageEditorCommand = Command.extend({
        exec: function() {
            var that = this,
                imageeditor = that.imageeditor,
                upload = imageeditor._upload;

            if (!upload) {
                var input = $("<input type='file' />");
                input.kendoUpload({
                    select: that.onSelect.bind(that),
                    error: that.onError.bind(that),
                    multiple: false,
                    validation: {
                        allowedExtensions: [".jpg", ".jpeg", ".gif", ".png", ".bmp", ".tiff", ".webp"]
                    }
                });

                imageeditor._upload = upload = input.getKendoUpload();

            }

            upload.element.click();
        },
        onSelect: function(ev) {
            var that = this,
                imageeditor = that.imageeditor,
                file = ev.files[0].rawFile,
                reader = new FileReader();

            reader.addEventListener("load", function() {
                imageeditor.drawImage(reader.result).done(function(image) {
                    if (!imageeditor.trigger("imageLoaded", { image: image })) {
                        imageeditor.drawCanvas(image);
                        imageeditor._initUndoRedoStack();
                        imageeditor._toggleTools();
                    }
                }).fail(function(ev) {
                    imageeditor.trigger("error", ev);
                });
            }, false);


            if (file) {
                reader.readAsDataURL(file);
            }

        },
        onError: function(ev) {
            var that = this,
                imageeditor = that.imageeditor;

            imageeditor.trigger("error", ev);
        }
    });

    extend(kendo.ui.imageeditor, {
        ImageEditorCommand: Command,
        commands: {
            OpenPaneImageEditorCommand: OpenPaneImageEditorCommand,
            ZoomImageEditorCommand: ZoomImageEditorCommand,
            CropImageEditorCommand: CropImageEditorCommand,
            ResizeImageEditorCommand: ResizeImageEditorCommand,
            UndoImageEditorCommand: UndoImageEditorCommand,
            RedoImageEditorCommand: RedoImageEditorCommand,
            SaveImageEditorCommand: SaveImageEditorCommand,
            OpenImageEditorCommand: OpenImageEditorCommand
        }
    });

})(window.kendo.jQuery);

