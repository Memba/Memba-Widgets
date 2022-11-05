/**
 * Kendo UI v2022.3.913 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
(function(f, define){
    define('signature/signature-pad',[
        "kendo.core",
        "kendo.drawing"
    ], f);
})(function(){

(function () {

this.kendo = this.kendo || {};
this.kendo.inputs = this.kendo.inputs || {};
(function (exports, kendoDrawing) {

    var _a = kendoDrawing.util, elementOffset = _a.elementOffset, limitValue = _a.limitValue;

    var Point = kendo.geometry.Point, Rect = kendo.geometry.Rect, transform = kendo.geometry.transform;
    var noop = function () { };
    var DECIMAL_DIGITS = 3;
    var DEFAULT_COLOR = '#000';
    var DEFAULT_BACKGROUND_COLOR = '#fff';
    var DEFAULT_PRECISION = 1;
    var DEFAULT_SAMPLING_RATE = 200; // Updates per second
    var DEFAULT_STROKE_WIDTH = 1;
    var DEFAULT_WIDTH = 750;
    var DEFAULT_HEIGHT = 250;
    var DEFAULT_SCALE = 1;
    // Export images at maximized scale (3x) and 2x pixel density to cover HiDPI screens.
    var DEFAULT_EXPORT_SCALE = 6;
    var SignaturePad = /** @class */ (function () {
        function SignaturePad(element, options) {
            if (options === void 0) { options = {}; }
            this.element = element;
            this.lastMoveTime = 0;
            this.options = Object.assign({
                scale: DEFAULT_SCALE,
                precision: DEFAULT_PRECISION,
                samplingRate: DEFAULT_SAMPLING_RATE,
                smooth: options.smooth !== false,
                color: options.color || DEFAULT_COLOR,
                backgroundColor: options.backgroundColor || DEFAULT_BACKGROUND_COLOR,
                strokeWidth: DEFAULT_STROKE_WIDTH,
                onChange: noop,
                onDraw: noop,
                onDrawEnd: noop
            }, options);
            this.pathOptions = {
                stroke: {
                    color: this.options.color,
                    width: this.options.strokeWidth,
                    lineCap: 'round',
                    lineJoin: 'round'
                }
            };
            this.initSurface();
            this.attachEvents();
        }
        SignaturePad.prototype.destroy = function () {
            this.detachEvents();
        };
        SignaturePad.prototype.clear = function () {
            this.rootGroup.clear();
            this.path = null;
        };
        Object.defineProperty(SignaturePad.prototype, "isDrawing", {
            get: function () {
                return Boolean(this.points);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SignaturePad.prototype, "pathData", {
            get: function () {
                var _a;
                return (_a = this.path) === null || _a === void 0 ? void 0 : _a.toString(DECIMAL_DIGITS);
            },
            set: function (value) {
                this.clear();
                this.path = kendoDrawing.MultiPath.parse(value, this.pathOptions);
                this.rootGroup.append(this.path);
            },
            enumerable: false,
            configurable: true
        });
        SignaturePad.prototype.loadImage = function (data, size) {
            if (size === void 0) { size = []; }
            if (!data) {
                this.clear();
                return;
            }
            var _a = this.size, width = _a[0], height = _a[1];
            var contentWidth = width / this.options.scale;
            var contentHeight = height / this.options.scale;
            var importWidth = size[0] || contentWidth * DEFAULT_EXPORT_SCALE;
            var importHeight = size[1] || contentHeight * DEFAULT_EXPORT_SCALE;
            var scaleX = contentWidth / importWidth;
            var scaleY = contentHeight / importHeight;
            var scale = Math.min(scaleX, scaleY);
            var img = new kendoDrawing.Image(data, new kendo.geometry.Rect([0, 0], [importWidth, importHeight]));
            img.transform(transform().scale(scale, scale));
            this.clear();
            this.rootGroup.append(img);
        };
        SignaturePad.prototype.exportImage = function (options) {
            var _a;
            var _b = this.size, width = _b[0], height = _b[1];
            var contentWidth = width / this.options.scale;
            var contentHeight = height / this.options.scale;
            var exportWidth = (options === null || options === void 0 ? void 0 : options.width) || contentWidth * DEFAULT_EXPORT_SCALE;
            var exportHeight = (options === null || options === void 0 ? void 0 : options.height) || contentHeight * DEFAULT_EXPORT_SCALE;
            var scaleX = exportWidth / contentWidth;
            var scaleY = exportHeight / contentHeight;
            var scale = Math.min(scaleX, scaleY);
            var exportRect = new Rect([0, 0], [exportWidth, exportHeight]);
            var exportGroup = new kendoDrawing.Group({
                clip: kendoDrawing.Path.fromRect(exportRect)
            });
            var contentGroup = new kendoDrawing.Group({
                transform: transform().scale(scale, scale)
            });
            var frame = kendoDrawing.Path.fromRect(exportRect, {
                fill: {
                    color: this.options.backgroundColor
                }
            });
            exportGroup.append(frame);
            exportGroup.append(contentGroup);
            (_a = contentGroup.children).push.apply(_a, this.rootGroup.children);
            return kendoDrawing.exportImage(exportGroup, Object.assign({
                width: exportWidth,
                height: exportHeight
            }, options));
        };
        SignaturePad.prototype.resize = function () {
            this.surface.resize(true);
        };
        SignaturePad.prototype.setOptions = function (options) {
            Object.assign(this.options, options);
            this.pathOptions.stroke.color = this.options.color;
            this.pathOptions.stroke.width = this.options.strokeWidth;
            if (this.path) {
                this.path.options.set('stroke.color', this.options.color);
                this.path.options.set('stroke.width', this.options.strokeWidth);
            }
            this.background.options.set('fill.color', this.options.backgroundColor);
        };
        SignaturePad.prototype.initSurface = function () {
            this.surface = kendoDrawing.Surface.create(this.element, { type: 'canvas' });
            this.element.style.touchAction = 'none';
            var scale = this.options.scale;
            this.rootGroup = new kendoDrawing.Group({
                transform: transform().scale(scale, scale)
            });
            // The signature is not resizable, store initial dimensions.
            var width = this.element.offsetWidth || DEFAULT_WIDTH;
            var height = this.element.offsetHeight || DEFAULT_HEIGHT;
            this.size = [width, height];
            this.background = kendoDrawing.Path.fromRect(new Rect([0, 0], this.size), {
                fill: {
                    color: this.options.backgroundColor
                }
            });
            this.surface.draw(this.background);
            this.surface.draw(this.rootGroup);
        };
        SignaturePad.prototype.attachEvents = function () {
            this.onPointerDown = this.onPointerDown.bind(this);
            this.onPointerMove = this.onPointerMove.bind(this);
            this.onPointerUp = this.onPointerUp.bind(this);
            this.element.addEventListener('pointerdown', this.onPointerDown);
            this.element.addEventListener('pointermove', this.onPointerMove);
            this.element.addEventListener('pointerup', this.onPointerUp);
        };
        SignaturePad.prototype.detachEvents = function () {
            this.element.removeEventListener('pointerdown', this.onPointerDown);
            this.element.removeEventListener('pointermove', this.onPointerMove);
            this.element.removeEventListener('pointerup', this.onPointerUp);
        };
        SignaturePad.prototype.touchPoint = function (e) {
            var offset = elementOffset(this.element);
            var pageX = e.pageX;
            var pageY = e.pageY;
            var scale = 1 / this.options.scale;
            return new Point(pageX - offset.left, pageY - offset.top).scale(scale, scale);
        };
        SignaturePad.prototype.onPointerDown = function (e) {
            if (this.options.readonly || !e.isPrimary || !isMainButton(e)) {
                return;
            }
            if (!this.path) {
                this.path = new kendoDrawing.MultiPath(this.pathOptions);
                this.rootGroup.append(this.path);
            }
            this.options.onDraw();
            this.element.setPointerCapture(e.pointerId);
            var point = this.touchPoint(e);
            this.points = [point];
            this.path.moveTo(point);
        };
        SignaturePad.prototype.onPointerMove = function (e) {
            if (!this.points || !e.isPrimary) {
                return;
            }
            var now = (new Date()).getTime();
            var elapsed = now - this.lastMoveTime;
            var minTimeDelta = 1000 / limitValue(this.options.samplingRate, 1, 10000);
            if (elapsed < minTimeDelta) {
                return;
            }
            else {
                this.lastMoveTime = now;
            }
            var point = this.touchPoint(e);
            var lastPoint = this.points[this.points.length - 1];
            var minDelta = 1 / limitValue(this.options.precision, 0.01, 100);
            if (point.distanceTo(lastPoint) < minDelta) {
                return;
            }
            this.points.push(point);
            this.path.lineTo(point);
        };
        SignaturePad.prototype.onPointerUp = function (e) {
            if (!e.isPrimary || !this.path || !this.points || this.options.readonly) {
                return;
            }
            if (this.options.smooth) {
                var segments = kendoDrawing.Path.curveFromPoints(this.points);
                this.path.paths.splice(this.path.paths.length - 1, 1, segments);
            }
            this.points = null;
            this.options.onDrawEnd();
            this.options.onChange(this.pathData);
        };
        return SignaturePad;
    }());
    function isMainButton(e) {
        return typeof (e.button) !== 'number' || e.button === 0;
    }

    exports.SignaturePad = SignaturePad;

})(this.kendo.inputs.common = this.kendo.inputs.common || {}, kendo.drawing);


})();

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define) {
    define('kendo.signature',[ "kendo.core", "kendo.drawing", "./signature/signature-pad", "kendo.dialog", "kendo.html.button"], f);
})(function() {

var __meta__ = {
    id: "signature",
    name: "Signature",
    category: "web",
    description: "The Signature component ...",
    depends: [ "core", "dialog", "html.button" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        Widget = kendo.ui.Widget,
        Dialog = kendo.ui.Dialog,
        html = kendo.html,
        outerWidth = kendo._outerWidth,
        outerHeight = kendo._outerHeight,
        Pad = kendo.inputs.common.SignaturePad,
        ns = ".kendoSignature",
        CHANGE = "change",
        OPEN = "open",
        CLOSE = "close",
        CLICK = "click";

    var Signature = Widget.extend({
        init: function(element, options) {
            var that = this;
            var padOptions;

            options = options || {};

            Widget.fn.init.call(that, element, options);

            that._createElements(that.element, that.options.maximizable ? "maxi" : "", false, 1);
            that._createInput();
            that.wrapper = that.element;

            padOptions = $.extend(true, {}, that.options, {
                onChange: function() {
                    var width = outerWidth(that.element, false);
                    var height = outerHeight(that.element, false);
                    that._pad.exportImage({
                        width: width * that.options.exportScale,
                        height: height * that.options.exportScale
                    }).then(function(val) {
                        that._value = val;
                        that._input.val(val);
                        that.trigger(CHANGE);
                    });

                    that._pad.exportImage({
                        width: width * that.options.exportScale * that.options.popupScale,
                        height: height * that.options.exportScale * that.options.popupScale
                    }).then(function(val) {
                        that._dialogPad.loadImage(val);
                    });
                },
                onDraw: function() {
                    that.element.find(".k-button").hide();
                },
                onDrawEnd: function() {
                    that.element.find(".k-button").show();
                }
            });

            that._pad = new Pad(that.element.find(".k-signature-canvas")[0], padOptions);

            that._createDialogPad();
            that._attachHandlers();
            if (that.options.value) {
                that._pad.loadImage(that.options.value);
                that._dialogPad.loadImage(that.options.value);
            }

            if (that.options.readonly) {
                that.readonly();
            }

            if (!that.options.enable) {
                that.enable(false);
            }
        },

        options: {
            name: "Signature",
            color: "#000000",
            enable: true,
            fillMode: "solid",
            hideLine: false,
            maximizable: true,
            popupScale: 3,
            readonly: false,
            rounded: "medium",
            size: "medium",
            smooth: false,
            strokeWidth: 1,
            exportScale: 2,
            value: ""
        },

        events: [ CHANGE, OPEN, CLOSE],

        setOptions: function(options) {
            var currentOptions = this.options;
            this._clearCssClasses(currentOptions);
            this.element.removeClass(kendo.getValidCssClass("k-signature-", "size", currentOptions.size));
            kendo.deepExtend(currentOptions, options);
            this.options = currentOptions;
            if (currentOptions.value) {
                this._pad.loadImage(currentOptions.value);
                this._dialogPad.loadImage(currentOptions.value);
            }
            this._pad.setOptions(currentOptions);
            this._dialogPad.setOptions(currentOptions);
            this.enable(currentOptions.enable);
            this.readonly(currentOptions.readonly);
            this.element.width(currentOptions.width);
            this.element.height(currentOptions.height);
            this._dialogPadEl.width(currentOptions.width * currentOptions.popupScale);
            this._dialogPadEl.height(currentOptions.height * currentOptions.popupScale);
            this._hideLine(this.element);
            this._hideLine(this._dialogPadEl);
            this._applyCssClasses(this.element);
            this.element.find(".k-signature-maximize").toggle(currentOptions.maximizable);
            this.element.removeClass(kendo.getValidCssClass("k-input-", "size", this.options.size));
            this.element.addClass(kendo.getValidCssClass("k-signature-", "size", this.options.size));
        },

        close: function() {
            if (!this._dialog) {
                return;
            }
            this._dialog.close();
        },

        open: function() {
            if (!this.options.maximizable || !this._dialog) {
                return;
            }
            this._dialog.open();
        },

        destroy: function() {
            var that = this;
            if (that._pad) {
                that._pad.destroy();
                that._pad = null;
            }

            if (that._dialogPad) {
                that._dialogPad.destroy();
                that._dialogPad = null;
                that._dialogEl.off(ns);
                that._dialog.destroy();
                that._dialog = null;
            }

            that.element.off(ns);
            Widget.fn.destroy.call(that);
        },

        enable: function(enable) {
            var enable = enable !== false;
            if (!enable) {
                this._dialog.close();
            }

            this.element.find(".k-button").toggle(enable);
            this.element.toggleClass("k-disabled", !enable);
            this._pad.options.readonly = !enable;
            this._dialogPad.options.readonly = !enable;
        },

        readonly: function(toggle) {
            var that = this;
            var toggle = toggle !== false;

            that._pad.options.readonly = toggle;
            that._dialogPad.options.readonly = toggle;

            var clearButton = that.element.find(".k-signature-clear");

            if (!clearButton.length && !toggle) {
                $(html.renderButton('<button class="k-signature-action k-signature-clear"></button>', {
                    icon: "close",
                    size: this.options.size,
                    fillMode: "flat"
                })).insertAfter(that.element.find(".k-signature-actions-bottom"));

                $(html.renderButton('<button class="k-signature-action k-signature-clear"></button>', {
                    icon: "close",
                    size: this.options.size,
                    fillMode: "flat"
                })).insertAfter(that._dialogEl.find(".k-signature-actions-bottom"));
            }

            that.element.find(".k-signature-clear").toggle(!toggle);
            that._dialogEl.find(".k-signature-clear").toggle(!toggle);
        },

        value: function(value) {
            if (value !== undefined) {
                this._value = value;
                this._input.val(value);
                this._pad.loadImage(value);
            }

            return this._value;
        },

        reset: function() {
            this._dialogPad.clear();
            this._pad.clear();
            this._value = "";
        },

        _attachHandlers: function() {
            var that = this;
            that.element
                .on(CLICK + ns, ".k-signature-clear", function() {
                    that._pad.clear();
                    that._dialogPad.clear();
                })
                .on(CLICK + ns, ".k-signature-maximize", function() {
                    that._dialog.open();
                });
        },

        _createInput: function() {
            var that = this;
            var name = that.element.attr("name");
            var bind = that.element.attr(kendo.attr("bind"));
            var labelBy = that.element.attr("aria-labelledby");
            var autocomplete = that.element.attr("autocomplete");
            var required = that.element.attr("required");

            that._input = $("<input class='k-hidden' />").appendTo(that.element);

            if (name) {
                that._input.attr("name", name);
                that.element.removeAttr("name");
            }

            if (labelBy) {
                that._input.attr("aria-labelledby", labelBy);
                that.element.removeAttr("aria-labelledby");
            }

            if (autocomplete) {
                that._input.attr("autocomplete", autocomplete);
                that.element.removeAttr("autocomplete");
            }

            if (required) {
                that._input.attr("required", required);
                that.element.removeAttr("required");
            }
        },

        _hideLine: function(wrapper) {
            var line = wrapper.find(".k-signature-line");
            if (!this.options.hideLine && !line.length) {
                $("<div class='k-signature-line'>").appendTo(wrapper);
            }

            if (this.options.hideLine) {
                line.remove();
            }
        },

        _createElements: function(wrapper, button, maximize, scale) {
            $("<div class='k-signature-actions k-signature-actions-top'></div>").appendTo(wrapper);

            if (button == "mini") {
                $(html.renderButton('<button class="k-signature-action k-signature-minimize"></button>', {
                    icon: "window-minimize",
                    size: this.options.size,
                    fillMode: "flat"
                })).appendTo(wrapper.find(".k-signature-actions-top"));
            }

            if (button == "maxi") {
                $(html.renderButton('<button class="k-signature-action k-signature-maximize"></button>', {
                    icon: "hyperlink-open",
                    size: this.options.size,
                    fillMode: "flat"
                })).appendTo(wrapper.find(".k-signature-actions-top"));
            }

            $("<div class='k-signature-canvas'>").appendTo(wrapper);

            this._hideLine(wrapper);

            $("<div class='k-signature-actions k-signature-actions-bottom'></div>").appendTo(wrapper);

            if (!this.options.readonly) {
                $(html.renderButton('<button class="k-signature-action k-signature-clear"></button>', {
                    icon: "close",
                    size: this.options.size,
                    fillMode: "flat"
                })).appendTo(wrapper.find(".k-signature-actions-bottom"));
            }

            wrapper.addClass("k-input k-signature");

            wrapper.width(this.options.width * scale);
            wrapper.height(this.options.height * scale);

            if (maximize) {
                wrapper.addClass("k-signature-maximized");
            }

            this._applyCssClasses(wrapper);
            //workaround as the sizings are added to -signature- but roundings to -input-
            wrapper.removeClass(kendo.getValidCssClass("k-input-", "size", this.options.size));
            wrapper.addClass(kendo.getValidCssClass("k-signature-", "size", this.options.size));
        },

        _createDialogPad: function() {
            var that = this;
            var canvas = null;

            that._dialogEl = $("<div>").appendTo(that.element);
            that._dialog = new Dialog(that._dialogEl, {
                title: false,
                closable: false,
                open: function() {
                    that.trigger(OPEN);
                },
                close: function() {
                    that.trigger(CLOSE);
                }
            });

            that._dialogPadEl = $("<div>").appendTo(that._dialog.element);
            that._createElements(that._dialogPadEl, "mini", true, this.options.popupScale);
            canvas = that._dialogPadEl.find(".k-signature-canvas")[0];

            that._dialogPad = new Pad(canvas, $.extend(true, {}, that.options, {
                scale: that.options.popupScale,
                onChange: function() {
                    var width = outerWidth(that.element, false);
                    var height = outerHeight(that.element, false);
                    that._dialogPad.exportImage({
                        width: width * that.options.exportScale,
                        height: height * that.options.exportScale
                    }).then(function(val) {
                        that._pad.loadImage(val);
                        that._value = val;
                        that._input.val(val);
                        that.trigger(CHANGE);
                    });
                },
                onDraw: function() {
                    that._dialogEl.find(".k-button").hide();
                },
                onDrawEnd: function() {
                    that._dialogEl.find(".k-button").show();
                }
            }));

            // Dialog should be opened at first for drawing to work
            that._dialog.close();
            that._dialogEl
                .on(CLICK + ns, ".k-signature-clear", function() {
                    that._dialogPad.clear();
                    that._pad.clear();
                })
                .on(CLICK + ns, ".k-signature-minimize", function() {
                    that._dialog.close();
                });
        }
    });

    kendo.cssProperties.registerPrefix("Signature", "k-input-");

    kendo.ui.plugin(Signature);

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3) { (a3 || a2)(); });
