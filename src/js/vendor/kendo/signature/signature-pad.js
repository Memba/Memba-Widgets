/**
 * Kendo UI v2023.2.829 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";
import "../kendo.drawing.js";

(function () {

window.kendo = window.kendo || {};
window.kendo.inputs = window.kendo.inputs || {};
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

})(window.kendo.inputs.common = window.kendo.inputs.common || {}, window.kendo.drawing);


})();