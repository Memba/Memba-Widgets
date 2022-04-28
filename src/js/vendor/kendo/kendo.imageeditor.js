/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('imageeditor/toolbar',["../kendo.toolbar", "../kendo.dropdownlist"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        extend = $.extend,
        ToolBar = kendo.ui.ToolBar,
        Item = kendo.toolbar.Item,

        CLICK = "click",
        DROPDOWNCHANGE = "dropDownChange",
        ACTION = "action";

    var ImageEditorToolBar = ToolBar.extend({
        init: function(element, options) {
            var that = this;

            that._extendOptions(options);

            ToolBar.fn.init.call(that, element, options);

            that._attachEvents();
            that.toggleTools();
        },

        events: ToolBar.fn.events.concat([
            DROPDOWNCHANGE,
            ACTION
        ]),

        defaultTools: {
            open: { type: "button", icon: "upload", name: "open", command: "OpenImageEditorCommand", showText: "overflow" },
            save: { type: "button", icon: "download", name: "save", command: "SaveImageEditorCommand", showText: "overflow", toggleCondition:"canExport" },
            separator: { type: "separator" },
            undo: { type: "button", icon: "undo", name: "undo", command: "UndoImageEditorCommand", showText: "overflow", toggleCondition:"undo" },
            redo: { type: "button", icon: "redo", name: "redo", command: "RedoImageEditorCommand", showText: "overflow", toggleCondition:"redo" },
            separator1: { type: "separator" },
            crop: { type: "button", icon: "crop", name: "crop", command: "OpenPaneImageEditorCommand", options: "crop", showText: "overflow", toggleCondition:"canExport"  },
            resize: { type: "button", icon: "image-resize", name: "resize", command: "OpenPaneImageEditorCommand", options: "resize", showText: "overflow", toggleCondition:"canExport"  },
            zoomIn: { type: "button", icon: "zoom-in", name: "zoomIn", command: "ZoomImageEditorCommand", showText: "overflow", options: "zoomIn", toggleCondition:"enable"  },
            zoomOut: { type: "button", icon: "zoom-out", name: "zoomOut", command: "ZoomImageEditorCommand", showText: "overflow", options: "zoomOut", toggleCondition:"enable"  },
            zoomDropdown: { type: "imageEditorZoomDropDown", name: "zoomDropdown", command: "ZoomImageEditorCommand", text: "Zoom options", toggleCondition:"enable" , items: [
                { name: "zoomActualSize", icon: "zoom-actual-size", text: "Show actual size", options: "actualSize" },
                { name: "zoomFitToScreen", icon: "zoom-best-fit", text: "Fit to screen", options: "fitToScreen" }
            ]}
        },

        _attachEvents: function() {
            var that = this;

            that.bind(DROPDOWNCHANGE, that._dropDownChange.bind(that));
            that.bind(CLICK, that._click.bind(that));
        },

        _extendOptions: function(options) {
            var that = this,
                tools = options.items ? options.items : Object.keys(that.defaultTools);

            that.options = options;

            that.options.items = that._extendToolsOptions(tools);
        },

        _extendToolsOptions: function(tools) {
            var that = this,
                messages = that.options.messages;

            if (!tools.length) {
                return;
            }

            return tools.map(function (tool) {
                var isBuiltInTool =  $.isPlainObject(tool) && Object.keys(tool).length === 1 && tool.name,
                    toolOptions, text;

                tool = isBuiltInTool ? tool.name : tool;
                toolOptions = $.isPlainObject(tool) ? tool : extend({}, that.defaultTools[tool]);

                text = messages[toolOptions.name] || toolOptions.text;

                kendo.deepExtend(toolOptions, {
                    id: toolOptions.name + "-" + kendo.guid(),
                    name: toolOptions.name,
                    text: text,
                    attributes: {
                        "aria-label": text,
                        "title": text,
                        "data-command": toolOptions.command,
                        "data-options": toolOptions.options,
                        "data-toggle": toolOptions.toggleCondition
                    },
                    overflow: toolOptions.overflow
                });

                if(toolOptions.type === "imageEditorZoomDropDown") {
                    toolOptions.items = that._extendToolsOptions(toolOptions.items);
                }

                return toolOptions;
            }, that);
        },

        _click: function(ev) {
            var command = $(ev.target).data("command"),
                options = $(ev.target).data("options");

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: options
            });
        },

        _dropDownChange: function (ev) {
            if (!ev.command) {
                return;
            }

            this.action({
                command: ev.command,
                options: ev.options
            });
        },

        action: function (args) {
            this.trigger(ACTION, args);
        },

        toggleTools: function (conditions) {
            var that = this,
                tools = that.element.find("[data-toggle]");

            tools.each(function(index, elm){
                var tool = $(elm),
                    widget = null,
                    condition = tool.data("toggle"),
                    toToggle = conditions && conditions[condition];

                if (tool.is("[data-role]")) {
                    widget = kendo.widgetInstance(tool);
                }

                if (widget && widget.enable){
                    widget.enable(toToggle || false);
                } else {
                    that.enable(tool, toToggle);
                }
            });
        },

        destroy: function () {
            var that = this;

            if (that.zoomDropdown) {
                that.zoomDropdown.destroy();
            }

            ToolBar.fn.destroy.call(this);
        }
    });

    var ImageEditorZoomDropDown = Item.extend({
        init: function(options, toolbar) {
            var that = this,
                element =  $("<div></div>"),
                input = $("<input />").attr(options.attributes),
                template = "<span class=\"k-icon k-i-#:icon#\"></span> #:text#";

                that.element = element;
                that.input = input;
                that.toolbar = toolbar;

                that.dropDown = new ui.DropDownList(that.input, {
                    optionLabel: { text: options.text, icon: "" },
                    dataTextField: "text",
                    dataSource: options.items,
                    template: template,
                    change: that._change.bind(that)
                });

                that.element.append(that.dropDown.wrapper);
                that.dropDown.list.find(".k-list-optionlabel").hide();

                that.toolbar.zoomDropdown = that;
        },
        _change: function (ev) {
            var that = this;
            that.toolbar.trigger(DROPDOWNCHANGE, {
                command: ev.sender.element.data("command"),
                options: ev.sender.dataItem().options
            });
        },
        destroy: function(){
            this.dropDown.destroy();
        }
    });

    kendo.toolbar.registerComponent("imageEditorZoomDropDown", ImageEditorZoomDropDown);

    extend(kendo.ui, {
        imageeditor: {
            ToolBar: ImageEditorToolBar,
            ZoomDropDown: ImageEditorZoomDropDown
        }
    });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function (f, define) {
    define('imageeditor/pane',["../kendo.core", "../kendo.form", "../kendo.buttongroup", "../kendo.draganddrop"], f);
})(function () {

    (function ($, undefined) {
        var kendo = window.kendo,
            extend = $.extend,
            Class = kendo.Class,

            NS = ".k-imageeditor-pane",

            CLICK = "click";

        var paneStyles = {
            form: "k-imageeditor-pane-form",
            button: "k-imageeditor-pane-button",
            confirmButton: "k-imageeditor-pane-confirm-button",
            cropOverlay: "k-imageeditor-crop-overlay",
            crop: "k-imageeditor-crop",
            resizeHandle: "k-resize-handle",
            resizeHandlePrefix: "k-resize-"
        };

        var round = function(f) {
            return Math.round(f * 1000) / 1000;
        };

        var Pane = Class.extend({
            init: function (imageeditor) {
                var that = this;

                that.imageeditor = imageeditor;

                if (that.imageeditor.currentPaneTool) {
                    that.imageeditor.currentPaneTool.destroy();
                }

                that.element = $("<div></div>").addClass(paneStyles.form);
            },
            open: function () {
                var that = this,
                    imageeditor = that.imageeditor,
                    commonMessages = imageeditor.options.messages.common;

                imageeditor.paneWrapper.append(that.element);
                that.formWidget = new kendo.ui.Form(that.element, extend(that.formSettings(), {
                    buttonsTemplate: kendo.format("<button class='{0} k-button k-button-md k-rounded-md k-button-solid k-button-solid-base' data-action='cancel'><span class='k-button-text'>{2}</span></button>" +
                                                    "<button class='{0} {1} k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary' data-action='confirm'><span class='k-button-text'>{3}</span></button>",
                                                    paneStyles.button,
                                                    paneStyles.confirmButton,
                                                    commonMessages.cancel,
                                                    commonMessages.confirm)
                }));

                that.bindButtonEvents();
                imageeditor.paneWrapper.show();
                imageeditor.currentPaneTool = that;
            },
            bindButtonEvents: function () {
                var that = this,
                    formWidget = that.formWidget,
                    buttons = formWidget.element.find("." + paneStyles.button);

                that._clickHandler = that._click.bind(that);

                buttons.on(CLICK + NS, that._clickHandler);
            },
            _click: function (ev) {
                var that = this,
                    target = $(ev.target).closest("." + paneStyles.button),
                    action = target.data("action");

                if(that[action]) {
                    that[action]();
                }
            },
            cancel: function () {
                this.destroy();
            },
            confirm: function () {
                window.console.error("Pane's confirm method is not implemented!");
                this.destroy();
            },
            refresh: function () {
            },
            destroy: function () {
                var that = this,
                    imageeditor = that.imageeditor;

                that.formWidget.element.find("." + paneStyles.button).off(NS);
                that.formWidget.destroy();
                imageeditor.paneWrapper.html("");
                imageeditor.paneWrapper.hide();
                delete imageeditor.currentPaneTool;
            }
        });

        var CropPane = Pane.extend({
            init: function (imageeditor) {
                var that = this;
                Pane.fn.init.call(that, imageeditor);
                that.buildCropModel();
                that.canvasUI();
            },
            confirm: function () {
                var that = this,
                    model = that.formWidget._model.toJSON();

                that.destroy();

                that.imageeditor.executeCommand({command: "CropImageEditorCommand", options: model });
            },
            formSettings: function () {
                var that = this,
                    cropMessages = that.imageeditor.options.messages.panes.crop,
                    commonMessages = that.imageeditor.options.messages.common,
                    aspectRatioItems = cropMessages.aspectRatioItems,
                    aspectRatioDS = [];

                if(aspectRatioItems) {
                    for (var key in aspectRatioItems) {
                        aspectRatioDS.push({value: key, text: aspectRatioItems[key]});
                    }
                } else {
                    aspectRatioDS = [
                        { value: "originalRatio", text: "Original ratio"},
                        { value: "1:1", text: "1:1 (Square)"},
                        { value: "4:5", text: "4:5 (8:10)"},
                        { value: "5:7", text: "5:7"},
                        { value: "2:3", text: "2:3 (4:6)"},
                        { value: "16:9", text: "16:9"}
                    ];
                }

                return {
                    formData: that._model,
                    change: that.onChange.bind(that),
                    items: [{
                        type: "group",
                        label: cropMessages.title || "Crop Image",
                        layout: "grid",
                        grid: { cols: 2, gutter: "0 8px" },
                        items: [{
                                label: cropMessages.aspectRatio || "Aspect ratio:",
                                field: "aspectRatio",
                                editor: "DropDownList",
                                editorOptions: {
                                    dataValueField: "value",
                                    dataTextField: "text",
                                    dataSource: aspectRatioDS
                                },
                                colSpan: 2
                            }, {
                                label: cropMessages.orientation,
                                field: "orientation",
                                editor: that._orientationEditor.bind(that),
                                colSpan: 2
                            }, {
                                label: commonMessages.width || "Width:",
                                field: "width",
                                attributes: { style: "max-width: 100px;" },
                                editor: "NumericTextBox",
                                editorOptions: {
                                    format: "n0",
                                    max: that._model.width,
                                    min: 0
                                },
                                colSpan: 1
                            }, {
                                label: commonMessages.height || "Height:",
                                field: "height",
                                attributes: { style: "max-width: 100px;" },
                                editor: "NumericTextBox",
                                editorOptions: {
                                    format: "n0",
                                    max: that._model.height,
                                    min: 0
                                },
                                colSpan: 1
                            }, {
                                label: commonMessages.lockAspectRatio || "Lock aspect ratio",
                                field: "lockAspectRatio",
                                colSpan: 2
                            }
                        ]
                    }]
                };
            },
            _orientationEditor: function(container, options){
                var that = this,
                    cropMessages = that.imageeditor.options.messages.panes.crop,
                    value = options.model[options.field];

                that._orientationWidget = $("<div name='" + options.field + "'></div>")
                    .appendTo(container)
                    .kendoButtonGroup({
                        items: [
                            { text: cropMessages.portrait || "Portrait", attributes: { "data-value": "portrait" }, selected: value === "portrait" },
                            { text: cropMessages.landscape || "Landscape", attributes: { "data-value": "landscape" }, selected : value === "landscape" }
                        ],
                        select: function (ev) {
                            var value = ev.sender.wrapper.find(".k-selected").data("value");
                            options.model.set(options.field, value);
                        }
                    }).data("kendoButtonGroup");
            },
            buildCropModel: function () {
                var that = this,
                    imageeditor = that.imageeditor,
                    canvas = imageeditor.getCanvasElement(),
                    width = canvas.width,
                    height = canvas.height;

                    that._model = {
                        top: 0,
                        left: 0,
                        aspectRatio: "originalRatio",
                        width: width,
                        height: height,
                        orientation: (width - height < 0) ? "portrait" : "landscape",
                        lockAspectRatio: true
                    };
            },
            canvasUI: function () {
                var that = this,
                    imageeditor = that.imageeditor,
                    canvasContainer = that.imageeditor.canvasContainer,
                    cropOverlay = $("<div></div>").addClass(paneStyles.cropOverlay),
                    cropElement = $("<div></div>").addClass(paneStyles.crop),
                    handle = "<span class='" + paneStyles.resizeHandle + "'></span>",
                    handles = [ "nw", "n", "ne", "w", "e", "sw", "s", "se" ],
                    zoomLevel = imageeditor.getZoomLevel();

                for (var i = 0; i < handles.length; i++) {
                    var handleElm = $(handle)
                        .addClass(paneStyles.resizeHandlePrefix + handles[i])
                        .attr("data-orientation", handles[i]);

                    that._initResizeHandle(handleElm);

                    cropElement.append(handleElm);
                }

                that.cropElement = cropElement;

                that._canvasUI = cropOverlay
                    .append(cropElement)
                    .appendTo(canvasContainer);

                var width = Math.round(that._model.width * zoomLevel);
                var height = Math.round(that._model.height * zoomLevel);
                var borderWidth = parseInt(that.cropElement.css("border-top-width"), 10);

                that.cropElement.css({
                    width: width,
                    height: height,
                    backgroundImage: "url('"+ imageeditor._image.src + "')",
                    backgroundSize: kendo.format("{0}px {1}px", width, height),
                    backgroundClip: "content-box",
                    backgroundPosition: kendo.format("-{0}px -{0}px", borderWidth)
                });

                that.cropElement.kendoDraggable({
                    ignore: "." + paneStyles.resizeHandle,
                    drag: function (ev) {
                        that._adjustTopLeft(ev.target.offsetTop + ev.y.delta, ev.target.offsetLeft + ev.x.delta);
                    }
                });
            },
            refresh: function () {
                var that = this,
                    newModel = that.formWidget._model,
                    zoomLevel = that.imageeditor.getZoomLevel(),
                    width = Math.round(newModel.width * zoomLevel),
                    height = Math.round(newModel.height * zoomLevel),
                    top = Math.round(newModel.top * zoomLevel),
                    left = Math.round(newModel.left * zoomLevel),
                    borderWidth = parseInt(that.cropElement.css("border-top-width"), 10);

                that.cropElement.css({
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                    backgroundSize: kendo.format("{0}px {1}px", that._model.width * zoomLevel, that._model.height * zoomLevel),
                    backgroundPosition: kendo.format("-{0}px -{1}px", left + borderWidth, top + borderWidth)
                });
            },
            _initResizeHandle: function (handle) {
                var that = this;

                handle.kendoDraggable({
                    drag: function (ev) {
                        var $target = $(ev.sender.element),
                            newModel = that.formWidget._model,
                            oldModel = that._model,
                            orientation = $target.data("orientation"),
                            adjustments = {},
                            zoomLevel = that.imageeditor.getZoomLevel(),
                            correctedLeft = newModel.left * zoomLevel,
                            correctedTop = newModel.top * zoomLevel;

                        if (orientation.indexOf("w") >= 0) {
                            adjustments.left = that.cropElement[0].offsetLeft + ev.x.delta;
                            adjustments.width = that.cropElement[0].offsetWidth - ev.x.delta;
                        } else if (orientation.indexOf("e") >= 0) {
                            adjustments.width = that.cropElement[0].offsetWidth + ev.x.delta;
                        }

                        if (orientation.indexOf("n") >= 0) {
                            adjustments.top = that.cropElement[0].offsetTop + ev.y.delta;
                            adjustments.height = that.cropElement[0].offsetHeight - ev.y.delta;
                        } else if(orientation.indexOf("s") >= 0) {
                            adjustments.height = that.cropElement[0].offsetHeight + ev.y.delta;
                        }

                        if(adjustments.width && ((adjustments.left || correctedLeft) + adjustments.width <= oldModel.width * zoomLevel)) {
                            newModel.set("width", Math.round(adjustments.width / zoomLevel));
                        }

                        if(adjustments.height && ((adjustments.top || correctedTop) + adjustments.height <= oldModel.height * zoomLevel)) {
                            newModel.set("height", Math.round(adjustments.height / zoomLevel));
                        }

                        if(adjustments.top || adjustments.left) {
                            that._adjustTopLeft(adjustments.top, adjustments.left);
                        }
                    }
                });
            },
            _adjustTopLeft: function (top, left, compare) {
                var that = this,
                    compareModel = compare || that.formWidget._model,
                    newModel = that.formWidget._model,
                    oldModel = that._model,
                    zoomLevel = that.imageeditor.getZoomLevel();

                if(top >= 0 && (top / zoomLevel) + compareModel.height <= oldModel.height) {
                    newModel.set("top", Math.round(top / zoomLevel));
                }

                if(left >= 0 && (left / zoomLevel) + compareModel.width <= oldModel.width) {
                    newModel.set("left", Math.round(left / zoomLevel));
                }
            },
            onChange: function (ev) {
                var that = this,
                    zoomLevel = that.imageeditor.getZoomLevel(),
                    newModel = ev.sender._model,
                    oldModel = that._model,
                    maxWidth = oldModel.width,
                    maxHeight = oldModel.height,
                    originalRatio = oldModel.width + ":" + oldModel.height,
                    gcd = that._gcd(oldModel.width, oldModel.height);

                originalRatio = oldModel.width/gcd + ":" + oldModel.height/gcd;

                if(ev.field === "aspectRatio" && ev.value === "originalRatio") {
                    newModel.set("top", 0);
                    newModel.set("left", 0);
                    newModel.set("orientation", oldModel.orientation);
                    newModel.set("width", oldModel.width);
                    newModel.set("height", oldModel.height);
                } else if (ev.field === "orientation") {
                    var tempModel = extend({}, newModel, {
                        width: newModel.height,
                        height: newModel.width
                    });

                    var newSize = that._calcSize(tempModel, originalRatio, maxWidth, maxHeight);

                    newModel.set("width", newSize.width);
                    newModel.set("height", newSize.height);
                    that._orientationWidget.select(ev.value === "portrait" ? 0 : 1);
                } else if(newModel.lockAspectRatio) {
                    var force = ev.field;
                    var size = that._calcSize(newModel, originalRatio, maxWidth, maxHeight, force);
                    newModel.set("width", size.width);
                    newModel.set("height", size.height);
                }

                var width = Math.round(newModel.width * zoomLevel);
                var height = Math.round(newModel.height * zoomLevel);
                var top = Math.round(newModel.top * zoomLevel);
                var left = Math.round(newModel.left * zoomLevel);
                var borderWidth = parseInt(that.cropElement.css("border-top-width"), 10);

                that.cropElement.css({
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                    backgroundPosition: kendo.format("-{0}px -{1}px", left + borderWidth, top + borderWidth)
                });
            },
            _calcSize: function (model, originalRatio, maxWidth, maxHeight, force) {
                var width = Math.min(model.width, maxWidth),
                    height = Math.min(model.height, maxHeight),
                    isPortrait = model.orientation === "portrait",
                    ratios = model.aspectRatio;

                if(ratios.indexOf(":") < 0) {
                    ratios = originalRatio;
                }

                ratios = ratios.split(":").map(function (value) {
                    return parseInt(value, 10);
                });

                var wRatio = isPortrait ? Math.min(ratios[0], ratios[1]) : Math.max(ratios[0], ratios[1]);
                var hRatio = !isPortrait ? Math.min(ratios[0], ratios[1]) : Math.max(ratios[0], ratios[1]);
                var expectedRatio = round(wRatio/hRatio);
                var realRatio = round(width/height);

                var sizeByRatio = {
                    width: Math.round(height * expectedRatio),
                    height: Math.round(width / expectedRatio)
                };

                if (force === "width") {
                    return {
                        width: width,
                        height: sizeByRatio.height
                    };
                }

                if (force === "height") {
                    return {
                        width: sizeByRatio.width,
                        height: height
                    };
                }

                if (realRatio > expectedRatio) {
                    width = sizeByRatio.width;
                } else if (realRatio < expectedRatio){
                    height = sizeByRatio.height;
                }

                return {
                    width: width,
                    height: height
                };
            },
            _gcd: function (a, b) {
                return (b === 0) ? a : this._gcd (b, a%b);
            },
            destroy: function () {
                kendo.destroy(this._canvasUI);
                this._canvasUI.remove();
                Pane.fn.destroy.call(this);
            }
        });

        var ResizePane = Pane.extend({
            init: function (imageeditor) {
                Pane.fn.init.call(this, imageeditor);
                this.buildResizeModel();
            },
            confirm: function () {
                var that = this,
                    originalWidth = that._model.width,
                    originalHeight = that._model.height,
                    model = that.formWidget._model.toJSON();

                if(model.measure === "percents") {
                    model.width = originalWidth * (model.width / 100);
                    model.height = originalHeight * (model.height / 100);
                }

                that.imageeditor.executeCommand({command: "ResizeImageEditorCommand", options: model });
                that.destroy();
            },
            formSettings: function () {
                var that = this,
                    resizeMessages = that.imageeditor.options.messages.panes.resize,
                    commonMessages = that.imageeditor.options.messages.common;

                return {
                    formData: that._model,
                    change: that.onChange.bind(that),
                    items: [{
                        type: "group",
                        label: resizeMessages.title || "Resize image",
                        layout: "grid",
                        grid: { cols: 2, gutter: "0 8px" },
                        items: [{
                            label: commonMessages.width || "Width:",
                            field: "width",
                            attributes: { style: "max-width: 100px;" },
                            editor: "NumericTextBox",
                            editorOptions: {
                                format: "n0",
                                min: 0
                            },
                            colSpan: 1
                        }, {
                            field: "measureW",
                            editor: "DropDownList",
                            attributes: { style: "max-width: 100px;" },
                            label: { text: "&nbsp;", encoded: false },
                            editorOptions: {
                                dataTextField: "text",
                                dataValueField: "value",
                                dataSource: [
                                    { text: resizeMessages.pixels || "Pixels", value: "pixels" },
                                    { text: resizeMessages.percents || "Percents", value: "percents" }
                                ]
                            },
                            colSpan: 1
                        }, {
                            label: commonMessages.height || "Height:",
                            field: "height",
                            attributes: { style: "max-width: 100px;" },
                            editor: "NumericTextBox",
                            editorOptions: {
                                format: "n0",
                                min: 0
                            },
                            colSpan: 1
                        }, {
                            field: "measureH",
                            label: { text: "&nbsp;", encoded: false },
                            attributes: { style: "max-width: 100px;" },
                            editor: "DropDownList",
                            editorOptions: {
                                dataTextField: "text",
                                dataValueField: "value",
                                dataSource: [
                                    { text: resizeMessages.pixels || "Pixels", value: "pixels" },
                                    { text: resizeMessages.percents || "Percents", value: "percents" }
                                ]
                            },
                            colSpan: 1
                        }, {
                            label: commonMessages.lockAspectRatio || "Lock aspect ratio",
                            field: "lockAspectRatio",
                            colSpan: 2
                        }]
                    }]
                };
            },
            buildResizeModel: function () {
                var that = this,
                    imageeditor = that.imageeditor,
                    canvas = imageeditor.getCanvasElement(),
                    width = canvas.width,
                    height = canvas.height;

                    that._model = {
                        width: width,
                        height: height,
                        measure: "pixels",
                        measureW: "pixels",
                        measureH: "pixels",
                        lockAspectRatio: true,
                        ratio: round(width/height)
                    };
            },
            onChange: function (ev) {
                var that = this,
                    newModel = ev.sender._model,
                    aspectRatioLocked = newModel.lockAspectRatio;

                if (ev.field === "measureW" || ev.field === "measureH") {
                    newModel.set("measureW", ev.value);
                    newModel.set("measureH", ev.value);
                    newModel.set("measure", ev.value);
                } else if (ev.field === "measure") {
                    that.resetNumericsTo(ev.value);
                } else if (ev.field === "width" && aspectRatioLocked && !that._preventChange) {
                    newModel.set("height", newModel.width / newModel.ratio);
                } else if (ev.field === "height" && aspectRatioLocked && !that._preventChange) {
                    newModel.set("width", newModel.height * newModel.ratio);
                }

                newModel.set("ratio", round(newModel.width/newModel.height));
            },
            resetNumericsTo: function (type) {
                var that = this,
                    originalWidth = that._model.width,
                    originalHeight = that._model.height,
                    formWidget = that.formWidget,
                    model = formWidget._model,
                    widthNumeric = formWidget.element.find("[name=width]").data("kendoNumericTextBox"),
                    heightNumeric = formWidget.element.find("[name=height]").data("kendoNumericTextBox"),
                    isPercent = type === "percents",
                    options = {
                        percents: {
                            format: "#\\\%"
                        },
                        pixels: {
                            format: "n0"
                        }
                    };



                widthNumeric.setOptions(options[type]);
                heightNumeric.setOptions(options[type]);

                that._preventChange = true;
                model.set("width", isPercent ? (originalWidth / widthNumeric.value()) * 100 : originalWidth * (widthNumeric.value() / 100));
                model.set("height", isPercent ? (originalHeight / heightNumeric.value()) * 100 : originalHeight * (heightNumeric.value() / 100));
                that._preventChange = false;
            }
        });

        extend(kendo.ui.imageeditor, {
            ImageEditorPane: Pane,
            panes: {
                crop: CropPane,
                resize: ResizePane
            }
    });

    })(window.kendo.jQuery);

    return window.kendo;

}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) { (a3 || a2)(); });
(function (f, define) {
    define('imageeditor/commands',["./pane", "../kendo.upload"], f);
})(function () {

    (function ($, undefined) {
        var kendo = window.kendo,
            imageeditorNS = kendo.ui.imageeditor,
            extend = $.extend,
            Class = kendo.Class;

        var Command = Class.extend({
            init: function (options) {
                this.options = extend({}, options, this.options);
                this.imageeditor = options.imageeditor;
            }
        });

        var OpenPaneImageEditorCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
                var that = this,
                    imageeditor = that.imageeditor,
                    pane = new imageeditorNS.panes[that.options.value](imageeditor);

                    pane.open();
            }
        });

        var ZoomImageEditorCommand = Command.extend({
            options: {
                zoomStep: 0.05,
                spacing: 20
            },
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
                var that = this,
                    options = that.options,
                    value = options.value,
                    imageeditor = that.imageeditor,
                    imgHeight = imageeditor._image.height,
                    currentZoom = imageeditor.getZoomLevel(),
                    newHeight = imgHeight;

                    if(!isNaN(value)) {
                        value = parseFloat(value);
                    } else if (typeof value === "string") {
                        value = that._processStringValue(value, currentZoom);
                    }

                    newHeight = Math.round(imgHeight * value);

                    if(newHeight > 0) {
                        $(imageeditor._canvas).css("height", newHeight);
                        imageeditor._zoomLevel = value;
                    }

                    if (imageeditor.currentPaneTool) {
                        imageeditor.currentPaneTool.refresh();
                    }
            },
            _processStringValue: function (value, initialZoom) {
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
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
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

                imageeditor.drawImage(canvas.toDataURL()).done(function(image){
                    imageeditor.drawCanvas(image);
                }).fail(function (ev) {
                    imageeditor.trigger("error", ev);
                });
            }
        });

        var ResizeImageEditorCommand = Command.extend({
            init: function (options) {
                Command.fn.init.call(this, options);
            },
            exec: function () {
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

                imageeditor.drawImage(canvas.toDataURL()).done(function(image){
                    imageeditor.drawCanvas(image);
                }).fail(function (ev) {
                    imageeditor.trigger("error", ev);
                });
            }
        });

        var UndoImageEditorCommand = Command.extend({
            exec: function () {
                var that = this,
                    imageeditor = that.imageeditor,
                    canvas = imageeditor.getCanvasElement(),
                    ctx = imageeditor.getCurrent2dContext(),
                    image = imageeditor.undoStack.pop();

                if(image) {
                    imageeditor.redoStack.push(imageeditor.getCurrentImage());
                    delete imageeditor._image;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0, image.width, image.height);

                    imageeditor.drawImage(canvas.toDataURL()).done(function(image){
                        imageeditor.drawCanvas(image);
                    }).fail(function (ev) {
                        imageeditor.trigger("error", ev);
                    });
                }
            }
        });

        var RedoImageEditorCommand = Command.extend({
            exec: function () {
                var that = this,
                    imageeditor = that.imageeditor,
                    canvas = imageeditor.getCanvasElement(),
                    ctx = imageeditor.getCurrent2dContext(),
                    image = imageeditor.redoStack.pop();

                if(image) {
                    imageeditor.undoStack.push(imageeditor.getCurrentImage());
                    delete imageeditor._image;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0, image.width, image.height);

                    imageeditor.drawImage(canvas.toDataURL()).done(function(image){
                        imageeditor.drawCanvas(image);
                    }).fail(function (ev) {
                        imageeditor.trigger("error", ev);
                    });
                }
            }
        });

        var SaveImageEditorCommand = Command.extend({
            exec: function () {
                var that = this,
                    imageeditor = that.imageeditor,
                    canvas = imageeditor.getCanvasElement();

                kendo.saveAs(extend({}, imageeditor.options.saveAs, {
                    dataURI: canvas.toDataURL()
                }));
            }
        });

        var OpenImageEditorCommand = Command.extend({
            exec: function () {
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
            onSelect: function (ev) {
                var that = this,
                    imageeditor = that.imageeditor,
                    file = ev.files[0].rawFile,
                    reader = new FileReader();

                reader.addEventListener("load", function () {
                    imageeditor.drawImage(reader.result).done(function(image){
                        if (!imageeditor.trigger("imageLoaded", { image: image })) {
                            imageeditor.drawCanvas(image);
                            imageeditor._initUndoRedoStack();
                            imageeditor._toggleTools();
                        }
                    }).fail(function (ev) {
                        imageeditor.trigger("error", ev);
                    });
                }, false);


                if (file) {
                    reader.readAsDataURL(file);
                }

            },
            onError: function(ev){
                var that = this,
                    imageeditor= that.imageeditor;

                imageeditor.trigger("error", ev);
            }
        });

        extend(kendo.ui.imageeditor, {
            ImageEditorCommand: Command,
            commands: {
                OpenPaneImageEditorCommand: OpenPaneImageEditorCommand,
                ZoomImageEditorCommand: ZoomImageEditorCommand,
                CropImageEditorCommand: CropImageEditorCommand,
                ResizeImageEditorCommand:ResizeImageEditorCommand,
                UndoImageEditorCommand: UndoImageEditorCommand,
                RedoImageEditorCommand: RedoImageEditorCommand,
                SaveImageEditorCommand: SaveImageEditorCommand,
                OpenImageEditorCommand: OpenImageEditorCommand
            }
    });

    })(window.kendo.jQuery);

    return window.kendo;

}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) { (a3 || a2)(); });
(function (f, define) {
    define('kendo.imageeditor',[
        "./imageeditor/toolbar",
        "./imageeditor/commands"
    ], f);
})(function () {

var __meta__ = {// jshint ignore:line
    id: "imageeditor",
    name: "ImageEditor",
    category: "web",
    depends: ["core"]
};

(function ($, undefined) {
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
        EXECUTE = "execute";

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
        init: function (element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);
            options = $.extend(true, {}, options);

            that._wrapper();
            that._renderHeader();
            that._contentWrapper();
            that._keyHandler();

            if(options.imageUrl) {
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

        _renderHeader: function () {
            var that = this,
                options = that.options;

            that.header = $("<div />").addClass(imageEditorStyles.header);

            if (options.toolbar) {
                that.header.append(that._initToolbar().element);
            }

            that.wrapper.append(that.header);
        },

        _initToolbar: function () {
            var that = this,
                options = that.options,
                toolbarElement = $("<div></div>").addClass(imageEditorStyles.toolbar),
                toolbarOptions = extend({}, options.toolbar, {
                    messages: options.messages.toolbar,
                    action: that.executeCommand.bind(that)
                });

            that.toolbar = new ui.imageeditor.ToolBar(toolbarElement, toolbarOptions);

            return that.toolbar;
        },

        _contentWrapper: function () {
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

        _keyHandler: function () {
            var that = this,
                prevent = false;

            that.wrapper.on("keydown" + NS, function(ev){
                if(ev.ctrlKey){
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

                    if(prevent) {
                        ev.preventDefault();
                    }
                }
            });
        },

        _drawCanvas: function () {
            var that = this;
            var imageUrl = that.options.imageUrl;

            that.drawImage(imageUrl).done(function (image) {
                if(!that.trigger(IMAGELOADED, {image: image})){
                    that.drawCanvas(image);
                }
            }).fail(function (ev) {
                that.trigger(ERROR, ev);
            });
        },

        _initUndoRedoStack: function () {
            var that = this;

            that.undoStack = [];
            that.redoStack = [];
        },

        _toggleTools: function () {
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

            that.toolbar.toggleTools({
                redo: canRedo,
                undo: canUndo,
                enable: hasImage,
                canExport: canExport
            });
        },

        drawImage: function (imageUrl) {
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

        drawCanvas: function (image) {
            var that = this;
            var canvas = $("<canvas>Canvas element</canvas>")[0];
            var ctx = canvas.getContext('2d');

            if (that._canvas) {
                $(that._canvas).remove();
            }

            if(that._image) {
                that.undoStack.push(that._image);
            }

            that._canvas = canvas;
            that._ctx = ctx;
            that._image = image;

            canvas.width = image.width;
            canvas.height = image.height;

            ctx.drawImage(image, 0, 0);

            that.canvasContainer.append(canvas);

            if(image.height > that.canvasWrapper.height()) {
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

        getCanvasElement: function () {
            return this._canvas;
        },

        getCurrent2dContext: function () {
            return this._ctx;
        },

        getCurrentImage: function () {
            return this._image;
        },

        executeCommand: function(args) {
            var commandName = args.command,
                commandOptions = extend({ imageeditor: this }, isPlainObject(args.options) ? args.options : {value: args.options}),
                command = new ui.imageeditor.commands[commandName](commandOptions);

            if(!this.trigger(EXECUTE, args)) {
                this._toggleTools();
                return command.exec();
            }
        },

        getZoomLevel: function(){
            return this._zoomLevel || 1;
        },

        destroy: function() {
            var that = this;

            that.element.off(NS);

            if (that.currentPaneTool) {
                that.currentPaneTool.destroy();
            }

            if(that.toolbar) {
                that.toolbar.destroy();
            }

            if(that._upload) {
                that._upload.destroy();
            }


            Widget.fn.destroy.call(that);
        }
    });
    ui.plugin(ImageEditor);
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) { (a3 || a2)(); });

