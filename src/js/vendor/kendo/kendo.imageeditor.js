/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.dropdownlist.js";
import "./kendo.toolbar.js";
import "./imageeditor/commands.js";

var __meta__ = {
    id: "imageeditor",
    name: "ImageEditor",
    category: "web",
    depends: ["core", "toolbar", "dropdownlist"]
};

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        isPlainObject = $.isPlainObject,
        Widget = kendo.ui.Widget,
        ui = kendo.ui,

        NS = ".kendoImageEditor",

        outerHeight = kendo._outerHeight,

        ERROR = "error",
        IMAGELOADED = "imageLoaded",
        IMAGERENDERED = "imageRendered",
        EXECUTE = "execute",

        CLICK = "click",
        TOGGLE = "toggle",
        CHANGE = "change",

        CANVAS_TEMPLATE = (label) => `<canvas role='img' aria-label='${label}'>Canvas element</canvas>`;

    var imageEditorStyles = {
        wrapper: "k-widget k-imageeditor",
        header: "k-imageeditor-header",
        toolbar: "k-imageeditor-toolbar",
        paneWrapper: "k-imageeditor-action-pane",
        contentWrapper: "k-imageeditor-content",
        canvasWrapper: "k-imageeditor-canvas-container",
        canvasContainer: "k-imageeditor-canvas"
    };

    var ImageEditor = Widget.extend({
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);
            options = $.extend(true, {}, options);

            that._wrapper();
            that._renderHeader();
            that._contentWrapper();
            that._keyHandler();

            if (options.imageUrl) {
                that._drawCanvas();
            }

            that._initUndoRedoStack();
            that._toggleTools();

            kendo.notify(that);
        },

        options: {
            name: 'ImageEditor',
            width: "100%",
            height: 570,
            imageUrl: "",
            imageLabel: "",
            toolbar: {
            },
            saveAs: {
                fileName: "image.png"
            },
            messages: {
                toolbar: {
                    open: "Open Image",
                    save: "Save Image",
                    undo: "Undo",
                    redo: "Redo",
                    crop: "Crop",
                    resize: "Resize",
                    zoomIn: "Zoom In",
                    zoomOut: "Zoom Out",
                    zoomDropdown: "Zoom options",
                    zoomActualSize: "Show actual size",
                    zoomFitToScreen: "Fit to screen"
                },
                panes: {
                    crop: {
                        title: "Crop Image",
                        aspectRatio: "Aspect Ratio:",
                        aspectRatioItems: {
                            "originalRatio": "Original ratio",
                            "1:1": "1:1 (Square)",
                            "4:5": "4:5 (8:10)",
                            "5:7": "5:7",
                            "2:3": "2:3 (4:6)",
                            "16:9": "16:9"
                        },
                        orientation: "Orientation:",
                        portrait: "Portrait",
                        landscape: "Landscape"
                    },
                    resize: {
                        title: "Resize image",
                        pixels: "Pixels",
                        percents: "Percents"
                    }
                },
                common: {
                    width: "Width:",
                    height: "Height:",
                    cancel: "Cancel",
                    confirm: "Confirm",
                    lockAspectRatio: "Lock aspect ratio"
                }
            }
        },

        events: [
            ERROR,
            IMAGELOADED,
            IMAGERENDERED,
            EXECUTE
        ],

        defaultTools: {
            open: { type: "button", icon: "upload", name: "open", command: "OpenImageEditorCommand", showText: "overflow" },
            save: { type: "button", icon: "download", name: "save", command: "SaveImageEditorCommand", showText: "overflow", toggleCondition: "canExport" },
            separator: { type: "separator" },
            undo: { type: "button", icon: "undo", name: "undo", command: "UndoImageEditorCommand", showText: "overflow", toggleCondition: "undo" },
            redo: { type: "button", icon: "redo", name: "redo", command: "RedoImageEditorCommand", showText: "overflow", toggleCondition: "redo" },
            separator1: { type: "separator" },
            crop: { type: "button", icon: "crop", name: "crop", command: "OpenPaneImageEditorCommand", options: "crop", showText: "overflow", toggleCondition: "canExport" },
            resize: { type: "button", icon: "image-resize", name: "resize", command: "OpenPaneImageEditorCommand", options: "resize", showText: "overflow", toggleCondition: "canExport" },
            zoomIn: { type: "button", icon: "zoom-in", name: "zoomIn", command: "ZoomImageEditorCommand", showText: "overflow", options: "zoomIn", toggleCondition: "enable" },
            zoomOut: { type: "button", icon: "zoom-out", name: "zoomOut", command: "ZoomImageEditorCommand", showText: "overflow", options: "zoomOut", toggleCondition: "enable" },
            zoomDropdown: {
                type: "component",
                name: "zoomDropdown",
                command: "ZoomImageEditorCommand",
                toggleCondition: "enable",
                overflow: "never",
                component: "DropDownList",
                componentOptions: {
                    placeholder: "Search",
                    icon: "search",
                    dataSource: [
                        { name: "zoomActualSize", icon: "zoom-actual-size", value: "actualSize" },
                        { name: "zoomFitToScreen", icon: "zoom-best-fit", value: "fitToScreen" }
                    ],
                    dataTextField: "text",
                    dataValueField: "value",
                    valuePrimitive: true,
                    template: ({ icon, text }) => `${kendo.ui.icon(kendo.htmlEncode(icon))} ${kendo.htmlEncode(text)}`,
                    commandOn: "change",
                    optionLabel: "Zoom options",
                    dataBound: (e) => {
                        e.sender.list.find(".k-list-optionlabel").hide();
                    }
                }
            }
        },

        _wrapper: function() {
            var that = this,
                options = that.options,
                width = options.width,
                height = options.height;

            that.wrapper = that.element
                .addClass(imageEditorStyles.wrapper);

            if (width) {
                that.wrapper.width(width);
            }

            if (height) {
                that.wrapper.height(height);
            }

            that._resizeHandler = kendo.onResize(function() {
                that.resize(true);
            });
        },

        _renderHeader: function() {
            var that = this,
                options = that.options;

            that.header = $("<div />").addClass(imageEditorStyles.header);
            that.wrapper.append(that.header);

            if (options.toolbar) {
                that._initToolbar();
                that.toolbar._tabIndex();
            }
        },

        _initToolbar: function() {
            var that = this,
                options = that.options,
                toolbarElement = $("<div></div>").addClass(imageEditorStyles.toolbar),
                toolbarOptions = extend({}, options.toolbar),
                tools = toolbarOptions.items ? toolbarOptions.items : Object.keys(that.defaultTools);

            toolbarOptions.tools = tools;
            toolbarOptions.defaultTools = that.defaultTools;
            toolbarOptions.parentMessages = that.options.messages.toolbar;

            that.header.append(toolbarElement);
            that.toolbar = new kendo.ui.ToolBar(toolbarElement, toolbarOptions);
            that.options.toolbar = that.toolbar.options;
            that.toolbar.toggleTools();

            that.toolbar.bind(CLICK, that._toolbarClick.bind(that));
            that.toolbar.bind(TOGGLE, that._toolbarClick.bind(that));
            that.toolbar.bind(CHANGE, that._toolbarClick.bind(that));

            return that.toolbar;
        },

        _toolbarClick: function(ev) {
            var command = $(ev.target).data("command"),
                options = $(ev.target).data("options");

            options = $(ev.target).val() || options;

            if (!command) {
                return;
            }

            this.executeCommand({
                command: command,
                options: options
            });
        },

        _contentWrapper: function() {
            var that = this,
                contentWrapper = $("<div></div>").addClass(imageEditorStyles.contentWrapper),
                canvasWrapper = $("<div></div>").addClass(imageEditorStyles.canvasWrapper),
                canvasContainer = $("<div></div>").addClass(imageEditorStyles.canvasContainer),
                paneWrapper = $("<div></div>").addClass(imageEditorStyles.paneWrapper).hide(),
                toolbarHeight = outerHeight(that.header);

            that.canvasWrapper = canvasWrapper;
            that.canvasContainer = canvasContainer;
            that.paneWrapper = paneWrapper;

            canvasWrapper.append(canvasContainer);

            contentWrapper.height(outerHeight(that.wrapper) - toolbarHeight);

            contentWrapper.append(canvasWrapper).append(paneWrapper);
            that.wrapper.append(contentWrapper);
        },

        _keyHandler: function() {
            var that = this,
                prevent = false;

            that.wrapper.on("keydown" + NS, function(ev) {
                if (ev.ctrlKey) {
                    switch (ev.keyCode) {
                        case 48: // ctrl+0
                            that.executeCommand({ command: "ZoomImageEditorCommand", options: "fitToScreen" });
                            prevent = true;
                            break;
                        case 189: // ctrl+-
                            that.executeCommand({ command: "ZoomImageEditorCommand", options: "zoomOut" });
                            prevent = true;
                            break;
                        case 187: // ctrl++
                            that.executeCommand({ command: "ZoomImageEditorCommand", options: "zoomIn" });
                            prevent = true;
                            break;
                        case 90: // ctrl+z
                            that.executeCommand({ command: "UndoImageEditorCommand" });
                            prevent = true;
                            break;
                        case 89: // ctrl+y
                            that.executeCommand({ command: "RedoImageEditorCommand" });
                            prevent = true;
                            break;
                    }

                    if (prevent) {
                        ev.preventDefault();
                    }
                }
            });
        },

        _drawCanvas: function() {
            var that = this;
            var imageUrl = that.options.imageUrl;

            that.drawImage(imageUrl).done(function(image) {
                if (!that.trigger(IMAGELOADED, { image: image })) {
                    that.drawCanvas(image);
                }
            }).fail(function(ev) {
                that.trigger(ERROR, ev);
            });
        },

        _initUndoRedoStack: function() {
            var that = this;

            that.undoStack = [];
            that.redoStack = [];
        },

        _toggleTools: function() {
            var that = this,
                canRedo = that.redoStack.length > 0,
                canUndo = that.undoStack.length > 0,
                hasImage = !!that._image,
                canExport = true;

            try {
                that._canvas.toDataURL();
            } catch (error) {
                canExport = false;
            }

            if (that.toolbar) {
                that.toolbar.toggleTools({
                    redo: canRedo,
                    undo: canUndo,
                    enable: hasImage,
                    canExport: canExport
                });
            }
        },

        drawImage: function(imageUrl) {
            var that = this,
                deferred = new $.Deferred(),
                image = new Image();

            image.onload = function() {
                kendo.ui.progress(that.canvasContainer, false);
                deferred.resolve(image);
            };

            image.onerror = function() {
                kendo.ui.progress(that.canvasContainer, false);
                deferred.reject(arguments);
            };

            kendo.ui.progress(that.canvasContainer, true);

            image.src = imageUrl;

            return deferred.promise();
        },

        drawCanvas: function(image) {
            var that = this;
            var canvas = $(kendo.template(CANVAS_TEMPLATE)(that.options.imageLabel))[0];
            var ctx = canvas.getContext('2d');

            if (that._canvas) {
                $(that._canvas).remove();
            }

            if (that._image) {
                that.undoStack.push(that._image);
            }

            that._canvas = canvas;
            that._ctx = ctx;
            that._image = image;

            canvas.width = image.width;
            canvas.height = image.height;

            ctx.drawImage(image, 0, 0);

            that.canvasContainer.append(canvas);

            if (image.height > that.canvasWrapper.height()) {
                that.executeCommand({ command: "ZoomImageEditorCommand", options: "fitToScreen" });
            } else {
                that.executeCommand({ command: "ZoomImageEditorCommand", options: that.getZoomLevel() });
            }

            that.trigger(IMAGERENDERED, {
                canvas: canvas,
                ctx: ctx,
                image: image
            });

            that._toggleTools();
        },

        getCanvasElement: function() {
            return this._canvas;
        },

        getCurrent2dContext: function() {
            return this._ctx;
        },

        getCurrentImage: function() {
            return this._image;
        },

        executeCommand: function(args) {
            var commandName = args.command,
                commandOptions = extend({ imageeditor: this }, isPlainObject(args.options) ? args.options : { value: args.options }),
                command = new ui.imageeditor.commands[commandName](commandOptions);

            if (!this.trigger(EXECUTE, args)) {
                this._toggleTools();
                return command.exec();
            }
        },

        getZoomLevel: function() {
            return this._zoomLevel || 1;
        },

        destroy: function() {
            var that = this;

            that.element.off(NS);

            if (that.currentPaneTool) {
                that.currentPaneTool.destroy();
            }

            if (that.toolbar) {
                that.toolbar.destroy();
            }

            if (that._upload) {
                that._upload.destroy();
            }


            Widget.fn.destroy.call(that);
        }
    });
    ui.plugin(ImageEditor);
})(window.kendo.jQuery);
export default kendo;

