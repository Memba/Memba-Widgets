/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.drawing.js";
import "./upload.js";

(function($, undefined) {
    var extend = $.extend,
        noop = $.noop,
        drawing = kendo.drawing,
        Group = drawing.Group,
        Surface = drawing.Surface,
        RENDER = "render",
        Class = kendo.Class,
        UploadHelper = kendo.pdfviewer.UploadHelper,

        DEFAULT_DPR = 2;

    var geometryTypes = {
        Path: "path",
        MultiPath: "multipath",
        Rect: "rect",
        Image: "image",
        Text: "text"
    };

    var BLANK_PAGE_TEMPLATE = (dropzoneId) => `<div class="k-page k-blank-page">
        <div id="${dropzoneId}" class="k-external-dropzone">
            <div class="k-dropzone-inner">
                <span class="k-dropzone-icon k-svg-icon k-icon-xxxl k-svg-i-upload">
                    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M32 384v96h448v-96H32zm192-64h64V192h96L256 32 128 192h96v128z"></path>
                    </svg>
                </span>
                <span class="k-dropzone-hint">Drag and drop files here to upload</span>
            </div>
        </div>
        <input name="files" accept=".pdf" type="file" ref-pdfviewer-blank-page-upload>
    </div>`;

    var Page = Class.extend({
        init: function(options, viewer) {
            this.viewer = viewer;
            this.processor = options.processor;
            this.options = options;
            this.pageNumber = options.number;

            this.element = $("<div class='k-page' />");
            this.element.attr(kendo.attr("number"), this.pageNumber);

            this._updatePageSize(options);
            this.width = options.width;
            this.height = options.height;
        },
        resize: function(ratio) {
            var pageElement = this.element;

            this._updatePageSize({
                width: Math.min(pageElement.width() * ratio, this.width),
                height: Math.min(pageElement.height() * ratio, this.height)
            });
        },
        _updatePageSize: function(size) {
            this.element
                    .width(size.width)
                    .height(size.height);
        },
        destroy: function() {
            kendo.destroy(this.element);
        },
        render: noop
    });

    var BlankPage = Page.extend({
        init: function(options, viewer) {
            this.viewer = viewer;
            this.options = options;
            this._externalDropZoneId = `${viewer.element.attr("id")}-external-dropzone`;
            this.element = $(BLANK_PAGE_TEMPLATE(this._externalDropZoneId));
            this._uploadHelper = new UploadHelper(viewer);
        },
        _initUpload: function() {
            this._upload = this._uploadHelper._initUpload(this.element.find("input[ref-pdfviewer-blank-page-upload]"), {
                dropZone: `#${this._externalDropZoneId}`,
                showFileList: false,
                async: {
                    autoUpload: false,
                    saveUrl: "save"
                }
            });
        },
        resize: noop,
        _updatePageSize: noop,
        destroy: function() {
            if (this._upload) {
                this._upload.destroy();
            }

            kendo.destroy(this.element);
        },
        render: noop
    });

    var DPLPage = Page.extend({
        draw: function() {
            var that = this,
                geometries = that.options.geometries;

            that.group = new Group();
            that.surface.draw(that.group);

            that._drawGeometries(geometries);

            that.viewer.trigger(RENDER, { page: this });
            kendo.ui.progress(that.element, false);
        },
        load: function() {
            var that = this;

            if (that.loaded || !that.processor)
            {
                return;
            }

            that.processor.fetchPageData(that.pageNumber).then(function(data) {
                that.options = data;
                that._initSurface();
                that.draw();
            });

            that.loaded = true;
        },
        _initSurface: function() {
            var size = {
                width: this.element.width(),
                height: this.element.height()
            };
            var surfaceOptions = extend({ width: this.width, height: this.height }, this.viewer.options.view);
            this.surface = new Surface(this.element, surfaceOptions);
            this._updatePageSize(size);
        },
        _drawGeometries: function(geometries) {
            var that = this,
                kGeometry;

            if (!geometries) {
                return;
            }

            for (var i = 0; i <= geometries.length; i++) {
                var geometry = geometries[i];

                if (!geometry) {
                    continue;
                }

                switch (geometry.type) {
                    case geometryTypes.Path:
                    case geometryTypes.MultiPath:
                        kGeometry = that._drawPath(geometry);
                        break;
                    case geometryTypes.Rect:
                        kGeometry = that._drawRect(geometry);
                        break;
                    case geometryTypes.Image:
                        kGeometry = that._drawImage(geometry);
                        break;
                    case geometryTypes.Text:
                        kGeometry = that._drawText(geometry);
                        break;
                    default:
                        kGeometry = null;
                        break;
                }

                if (kGeometry)
                {
                    that.group.append(kGeometry);
                }
            }
        },
        _drawRect: function(geometry)
        {
            var rectGeo = new kendo.geometry.Rect(geometry.point, geometry.size);

            return new drawing.Rect(rectGeo, {
                transform: this._getMatrix(geometry.transform),
                fill: geometry.fillOptions,
                stroke: geometry.strokeOptions
            });
        },

        _drawImage: function(geometry)
        {
            var imageRect = new kendo.geometry.Rect(geometry.point, geometry.size);
            return new drawing.Image(geometry.src, imageRect, {
                transform: this._getMatrix(geometry.transform)
            });
        },

        _drawText: function(geometry)
        {
            var options = {
                transform: this._getMatrix(geometry.transform),
                stroke: geometry.strokeOptions,
                fill: geometry.fillOptions,
                font: geometry.font
            };
            return new kendo.drawing.Text(geometry.content, geometry.point, options);
        },

        _drawPath: function(geometry)
        {
            var options = {
                transform: this._getMatrix(geometry.transform),
                stroke: geometry.strokeOptions,
                fill: geometry.fillOptions
            };
            var path = new drawing.MultiPath(options);

            for (var i = 0; i < geometry.paths.length; i++) {
                var subPath = geometry.paths[i];

                if (!subPath.segments)
                {
                    return;
                }

                path.moveTo.apply(path, subPath.point);

                for (var j = 0; j < subPath.segments.length; j++) {
                    var segment = subPath.segments[j];
                    var drawAction = segment.points.length === 1 ? path.lineTo : path.curveTo;
                    drawAction.apply(path, segment.points);
                }

                if (subPath.closed) {
                    path.close();
                }
            }

            return path;
        },

        _getMatrix: function(transform) {
            var matrix = Object.create(kendo.geometry.Matrix.prototype);
            kendo.geometry.Matrix.apply(matrix, transform);
            return matrix;
        }
    });

    var PDFJSPage = Page.extend({
        init: function(options, viewer) {
            var that = this,
                canvas;

            canvas = $("<canvas />").css({
                width: "100%",
                height: "100%"
            });
            that.canvas = canvas.get(0);

            Page.fn.init.call(that, options, viewer);
            that.canvas.width = that.width;
            that.canvas.height = that.height;

            that.element.append(canvas);
        },
        load: function(defaultScale, force) {
            var that = this,
                promise = $.Deferred();

            if (that._scale === defaultScale && !force)
            {
                return;
            } else if (that._scale && that._scale !== defaultScale && !force)
            {
                that._scale = defaultScale;
                that.render(defaultScale);
                return promise.resolve(that);
            }

            if (that.processor) {
                that.processor.fetchPageData(that.pageNumber).then(function(page) {
                    that._page = page;
                    that._renderPromise = that.render(defaultScale).then(function() {
                        that.viewer.trigger(RENDER, { page: that });
                    });
                    promise.resolve(that);
                });
            }

            that._scale = defaultScale;
            that.loaded = true;
            return promise;
        },
        render: function(scale) {
            var that = this;
            var dpr = window.devicePixelRatio >= DEFAULT_DPR ? window.devicePixelRatio : DEFAULT_DPR;
            var context = this.canvas.getContext('2d'),
                viewport = this._page.getViewport({
                    scale: scale
                });

            this.canvas.width = viewport.width * dpr;
            this.canvas.height = viewport.height * dpr;
            context.scale(dpr, dpr);

            this._scale = scale;
            this._dpr = dpr;

            if (this._renderTask)
            {
                this._renderTask.cancel();
                this._renderTask = null;
            }

            this._updatePageSize({
                width: viewport.width,
                height: viewport.height
            });

            this._renderTask = this._page.render({
                canvasContext: context,
                viewport: viewport
            });

            this._renderTextLayer(viewport);

            return this._renderTask.promise.then(function() {
                that._renderTask = null;
            }).catch(function() {});
        },
        _renderTextLayer: function(viewport) {
            var that = this;
            var page = that._page;

            if (that.textLayer) {
                that.textLayer.remove();
            }

            that.textLayer = $("<div class='k-text-layer'></div>").get(0);
            that.element.append(that.textLayer);

            page.getTextContent({
                normalizeWhitespace: true
            }).then(function(textContent) {
                $(that.textLayer).css({
                  height: viewport.height,
                  width: viewport.width
                }).html(""); // Clear content to make sure that refreshing the page will not cause duplication of the text content.

                var params = {
                    textContent: textContent,
                    container: that.textLayer,
                    viewport: viewport,
                    textDivs: [],
                    enhanceTextSelection: true
                };


                that.processor.renderTextLayer(params);
                that._renderAnnotationLayer(viewport);
            });
        },
        _renderAnnotationLayer: function(viewport) {
            var that = this,
                page = that._page;

            if (that.annotationLayer) {
                that.annotationLayer.remove();
            }

            that.annotationLayer = $("<div class='k-annotation-layer'></div>").css({
                position: 'absolute',
                top: 0,
                left: 0,
                overflow: 'hidden',
                height: that.element.height(),
                width: that.element.width(),
                pointerEvents: 'none',
            });

            that.element.append(that.annotationLayer);

            page.getAnnotations({ intent: "display" }).then(function(annotations) {
                var links = annotations.map(function(annotation) {
                    if (annotation.subtype === 'Link') {
                        var rect = annotation.rect;
                        var boundingRect = [
                            viewport.convertToViewportPoint(rect[0], rect[1]),
                            viewport.convertToViewportPoint(rect[2], rect[3]),
                        ];

                        var left = Math.min(boundingRect[0][0], boundingRect[1][0]);
                        var top = Math.min(boundingRect[0][1], boundingRect[1][1]);
                        var width = Math.max(boundingRect[0][0], boundingRect[1][0]) - left;
                        var height = Math.max(boundingRect[0][1], boundingRect[1][1]) - top;

                        var url = annotation.url || (annotation.dest && `#${ kendo.isString(annotation.dest) ? encodeURI(annotation.dest) : encodeURI(JSON.stringify(annotation.dest)) }`);

                        return { url: url, rect: { left, top, width, height } };
                    }
                });

                links.forEach(function(link) {
                    var span = $("<span></span>").css({
                        position: 'absolute',
                        left: link.rect.left,
                        top: link.rect.top,
                    }).append($(`<a ${link.url ? `href=${link.url}` : ''}></a>`).css({
                        width: link.rect.width,
                        height: link.rect.height,
                        display: 'inline-block',
                        pointerEvents: 'auto',
                    }));

                    that.annotationLayer.append(span);
                });
            });
        },
    });

    extend(kendo.pdfviewer.dpl, {
        geometryTypes: geometryTypes,
        Page: DPLPage
    });
    extend(kendo.pdfviewer.pdfjs, {
        Page: PDFJSPage
    });
    extend(kendo.pdfviewer, {
        BlankPage: BlankPage
    });
})(window.kendo.jQuery);

