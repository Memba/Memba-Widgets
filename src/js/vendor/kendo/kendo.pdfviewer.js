/** 
 * Kendo UI v2019.2.514 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2019 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('util/text-metrics', ['kendo.core'], f);
}(function () {
    (function ($) {
        window.kendo.util = window.kendo.util || {};
        var LRUCache = kendo.Class.extend({
            init: function (size) {
                this._size = size;
                this._length = 0;
                this._map = {};
            },
            put: function (key, value) {
                var map = this._map;
                var entry = {
                    key: key,
                    value: value
                };
                map[key] = entry;
                if (!this._head) {
                    this._head = this._tail = entry;
                } else {
                    this._tail.newer = entry;
                    entry.older = this._tail;
                    this._tail = entry;
                }
                if (this._length >= this._size) {
                    map[this._head.key] = null;
                    this._head = this._head.newer;
                    this._head.older = null;
                } else {
                    this._length++;
                }
            },
            get: function (key) {
                var entry = this._map[key];
                if (entry) {
                    if (entry === this._head && entry !== this._tail) {
                        this._head = entry.newer;
                        this._head.older = null;
                    }
                    if (entry !== this._tail) {
                        if (entry.older) {
                            entry.older.newer = entry.newer;
                            entry.newer.older = entry.older;
                        }
                        entry.older = this._tail;
                        entry.newer = null;
                        this._tail.newer = entry;
                        this._tail = entry;
                    }
                    return entry.value;
                }
            }
        });
        var REPLACE_REGEX = /\r?\n|\r|\t/g;
        var SPACE = ' ';
        function normalizeText(text) {
            return String(text).replace(REPLACE_REGEX, SPACE);
        }
        function objectKey(object) {
            var parts = [];
            for (var key in object) {
                parts.push(key + object[key]);
            }
            return parts.sort().join('');
        }
        function hashKey(str) {
            var hash = 2166136261;
            for (var i = 0; i < str.length; ++i) {
                hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
                hash ^= str.charCodeAt(i);
            }
            return hash >>> 0;
        }
        function zeroSize() {
            return {
                width: 0,
                height: 0,
                baseline: 0
            };
        }
        var DEFAULT_OPTIONS = { baselineMarkerSize: 1 };
        var defaultMeasureBox;
        if (typeof document !== 'undefined') {
            defaultMeasureBox = document.createElement('div');
            defaultMeasureBox.style.cssText = 'position: absolute !important; top: -4000px !important; width: auto !important; height: auto !important;' + 'padding: 0 !important; margin: 0 !important; border: 0 !important;' + 'line-height: normal !important; visibility: hidden !important; white-space: pre!important;';
        }
        var TextMetrics = kendo.Class.extend({
            init: function (options) {
                this._cache = new LRUCache(1000);
                this.options = $.extend({}, DEFAULT_OPTIONS, options);
            },
            measure: function (text, style, options) {
                if (options === void 0) {
                    options = {};
                }
                if (!text) {
                    return zeroSize();
                }
                var styleKey = objectKey(style);
                var cacheKey = hashKey(text + styleKey);
                var cachedResult = this._cache.get(cacheKey);
                if (cachedResult) {
                    return cachedResult;
                }
                var size = zeroSize();
                var measureBox = options.box || defaultMeasureBox;
                var baselineMarker = this._baselineMarker().cloneNode(false);
                for (var key in style) {
                    var value = style[key];
                    if (typeof value !== 'undefined') {
                        measureBox.style[key] = value;
                    }
                }
                var textStr = options.normalizeText !== false ? normalizeText(text) : String(text);
                measureBox.textContent = textStr;
                measureBox.appendChild(baselineMarker);
                document.body.appendChild(measureBox);
                if (textStr.length) {
                    size.width = measureBox.offsetWidth - this.options.baselineMarkerSize;
                    size.height = measureBox.offsetHeight;
                    size.baseline = baselineMarker.offsetTop + this.options.baselineMarkerSize;
                }
                if (size.width > 0 && size.height > 0) {
                    this._cache.put(cacheKey, size);
                }
                measureBox.parentNode.removeChild(measureBox);
                return size;
            },
            _baselineMarker: function () {
                var marker = document.createElement('div');
                marker.style.cssText = 'display: inline-block; vertical-align: baseline;width: ' + this.options.baselineMarkerSize + 'px; height: ' + this.options.baselineMarkerSize + 'px;overflow: hidden;';
                return marker;
            }
        });
        TextMetrics.current = new TextMetrics();
        function measureText(text, style, measureBox) {
            return TextMetrics.current.measure(text, style, measureBox);
        }
        kendo.deepExtend(kendo.util, {
            LRUCache: LRUCache,
            TextMetrics: TextMetrics,
            measureText: measureText,
            objectKey: objectKey,
            hashKey: hashKey,
            normalizeText: normalizeText
        });
    }(window.kendo.jQuery));
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('kendo.pdfviewer', [
        'pdf-viewer/processors/pdfjs-processor',
        'pdf-viewer/processors/dpl-processor',
        'pdf-viewer/toolbar',
        'pdf-viewer/pager',
        'pdf-viewer/page',
        'pdf-viewer/dialogs',
        'pdf-viewer/commands'
    ], f);
}(function () {
    var __meta__ = {
        id: 'pdfviewer',
        name: 'PDFViewer',
        category: 'web',
        description: 'PdfViewer to display pdfs in the browser',
        depends: [
            'core',
            'window',
            'dialog',
            'toolbar'
        ]
    };
    (function ($, undefined) {
        var NS = '.kendoPDFViewer', kendo = window.kendo, ui = kendo.ui, proxy = $.proxy, extend = $.extend, drawing = kendo.drawing, Toolbar = kendo.pdfviewer.Toolbar, Page, Widget = ui.Widget, progress = kendo.ui.progress, SCROLL = 'scroll', RENDER = 'render', OPEN = 'open', ERROR = 'error', FOCUS = 'focus', WHITECOLOR = '#ffffff', TABINDEX = 'tabindex', PROCESSORS = {
                pdfjs: 'pdfjs',
                dpl: 'dpl'
            }, styles = {
                viewer: 'k-pdf-viewer k-widget',
                scroller: 'k-canvas k-list-scroller'
            };
        kendo.pdfviewer = kendo.pdfviewer || {};
        var PDFViewer = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, kendo.deepExtend({}, this.options, options));
                that._wrapper();
                if (that.options.toolbar) {
                    that._renderToolbar();
                }
                that.wrapper.on(FOCUS, proxy(that._focus, that));
                that._initProcessor(options || {});
                that._renderPageContainer();
                that._loadDocument();
                that._tabindex();
                kendo.notify(that, kendo.ui);
            },
            events: [
                RENDER,
                OPEN,
                ERROR
            ],
            options: {
                name: 'PDFViewer',
                view: { type: 'canvas' },
                pdfjsProcessing: { file: null },
                dplProcessing: {
                    read: {
                        url: null,
                        type: 'GET',
                        dataType: 'json',
                        pageField: 'pageNumber'
                    },
                    upload: {
                        url: null,
                        saveField: 'file'
                    },
                    download: { url: null },
                    loadOnDemand: false
                },
                toolbar: { items: [] },
                width: 1000,
                height: 1200,
                page: 1,
                defaultPageSize: {
                    width: 794,
                    height: 1123
                },
                messages: {
                    defaultFileName: 'Document',
                    toolbar: {
                        open: 'Open',
                        exportAs: 'Export',
                        download: 'Download',
                        pager: {
                            first: 'Go to the first page',
                            previous: 'Go to the previous page',
                            next: 'Go to the next page',
                            last: 'Go to the last page',
                            of: ' of {0} ',
                            page: 'page',
                            pages: 'pages'
                        }
                    },
                    errorMessages: {
                        notSupported: 'Only pdf files allowed.',
                        parseError: 'PDF file fails to process.',
                        notFound: 'File is not found.'
                    },
                    dialogs: {
                        exportAsDialog: {
                            title: 'Export...',
                            defaultFileName: 'Document',
                            pdf: 'Portable Document Format (.pdf)',
                            png: 'Portable Network Graphics (.png)',
                            svg: 'Scalable Vector Graphics (.svg)',
                            labels: {
                                fileName: 'File name',
                                saveAsType: 'Save as',
                                page: 'Page'
                            }
                        },
                        okText: 'OK',
                        save: 'Save',
                        cancel: 'Cancel'
                    }
                }
            },
            _wrapper: function () {
                var that = this, options = that.options;
                that.wrapper = that.element;
                that.wrapper.width(options.width).height(options.height).addClass(styles.viewer);
                that._resizeHandler = kendo.onResize(function () {
                    that.resize();
                });
            },
            _focus: function (e) {
                if (this.toolbar) {
                    this.toolbar.wrapper.focus();
                } else {
                    this.pageContainer.focus();
                }
                e.preventDefault();
            },
            _initProcessor: function (options) {
                var that = this, processingOptions;
                processingOptions = options.dplProcessing ? that.options.dplProcessing : that.options.pdfjsProcessing;
                that.processingLib = options.dplProcessing ? PROCESSORS.dpl : PROCESSORS.pdfjs;
                that.processor = new kendo.pdfviewer[that.processingLib].processor(processingOptions, that);
                Page = kendo.pdfviewer[that.processingLib].Page;
            },
            _renderToolbar: function () {
                var that = this, options = that.options;
                var toolbarOptions = {
                    pager: { messages: options.messages.toolbar.pager },
                    resizable: true,
                    items: options.toolbar.items,
                    width: options.width,
                    action: that.execute.bind(that),
                    messages: options.messages.toolbar
                };
                var toolbarElement = $('<div />');
                toolbarElement.appendTo(that.element);
                that.toolbar = new Toolbar(toolbarElement, toolbarOptions);
            },
            _initErrorDialog: function (options) {
                var that = this;
                if (!that._errorDialog) {
                    options = extend(options, { messages: that.options.messages });
                    var dialogInstance = new kendo.pdfviewer.dialogs.ErrorDialog(options);
                    that._errorDialog = dialogInstance._dialog;
                }
                return that._errorDialog;
            },
            _renderPageContainer: function () {
                var that = this;
                if (!that.pageContainer) {
                    that.pageContainer = $('<div />');
                    that.pageContainer.addClass(styles.scroller);
                    that.pageContainer.attr(TABINDEX, 0);
                    that.wrapper.append(that.pageContainer);
                }
            },
            _triggerError: function (options) {
                var dialog = this._initErrorDialog();
                extend(options, { dialog: dialog });
                if (this.pageContainer) {
                    progress(this.pageContainer, false);
                }
                if (options.renderBlankPage) {
                    this._renderBlankPage();
                    this.resize(true);
                }
                if (this.trigger(ERROR, options)) {
                    return;
                }
                dialog.open().content(options.message);
            },
            _renderPages: function () {
                var that = this, document = that.document, pagesData;
                that.pages = [];
                if (!document || !document.total) {
                    that._renderBlankPage();
                    return;
                }
                pagesData = document.pages;
                for (var i = 1; i <= document.total; i++) {
                    var viewerPage, pageData = {
                            processor: that.processor,
                            number: i
                        };
                    if (pagesData && pagesData.length) {
                        pageData = extend(pageData, pagesData[i - 1]);
                    }
                    viewerPage = new Page(pageData, that);
                    that.pages.push(viewerPage);
                    that.pageContainer.append(viewerPage.element);
                }
                if (that.pages.length > 1) {
                    that.pageContainer.on(SCROLL + NS, proxy(that._scroll, that));
                }
            },
            _renderBlankPage: function () {
                this._blankPage = new Page(this.options.defaultPageSize, this);
                this.pageContainer.append(this._blankPage.element);
                this._updatePager(1, 1);
            },
            _updatePager: function (pageNumber, total) {
                if (!this.toolbar || !this.toolbar.pager) {
                    return;
                }
                this.toolbar.pager.setOptions({
                    page: pageNumber,
                    total: total
                });
            },
            _resize: function () {
                var that = this;
                var containerWidth;
                var containerHeight;
                var loadedPagesHeight = 0;
                var ratio;
                containerWidth = that.pageContainer[0].clientWidth;
                containerHeight = that.pageContainer[0].clientHeight;
                if (!that.pages || !that.pages.length) {
                    if (that._blankPage) {
                        ratio = containerWidth / that._blankPage.element.width();
                        that._blankPage.resize(ratio);
                    }
                    return;
                }
                if (that.toolbar) {
                    that.toolbar.resize(true);
                }
                that._visiblePagesCount = 1;
                that.pages.forEach(function (page) {
                    ratio = containerWidth / page.element.width();
                    page.resize(ratio);
                    loadedPagesHeight += page.element.height();
                    if (loadedPagesHeight < containerHeight && page.pageNumber > 1) {
                        that._visiblePagesCount++;
                    }
                });
            },
            _scroll: function () {
                var that = this, containerScrollHeight = that.pageContainer[0].scrollHeight, containerHeight = that.pageContainer.height(), containerScrollTop = that.pageContainer.scrollTop(), containerOffsetTop = that.pageContainer.offset().top, pageNum = that.options.page, pageIndex = pageNum - 1, total = that.pages.length, pageToLoad = pageNum, currentPage = that.pages[pageIndex], currentPageTop = currentPage.element.offset().top - containerOffsetTop, currentPageHeight = currentPage.element.height(), previousPage, prevPageTop, prevPageHeight, scrollDirection = containerScrollTop - that._prevScrollTop > 0 ? 1 : -1;
                if (that._preventScroll) {
                    that._preventScroll = false;
                    return;
                }
                if (scrollDirection == -1 && that.pages[pageIndex + scrollDirection]) {
                    previousPage = that.pages[pageIndex - that._visiblePagesCount] || that.pages[pageIndex + scrollDirection];
                    prevPageTop = previousPage.element.offset().top - containerOffsetTop;
                    prevPageHeight = previousPage.element.height();
                }
                if (Math.abs(containerScrollTop - (that._prevScrollTop || 0)) > containerHeight) {
                    pageToLoad = Math.floor(containerScrollTop * (1 / (containerScrollHeight / total))) + 1;
                } else if (currentPageTop < 0 && Math.abs(currentPageTop) >= currentPageHeight / 2 && scrollDirection === 1) {
                    pageToLoad++;
                } else if (previousPage && Math.abs(prevPageTop) <= prevPageHeight / 2) {
                    pageToLoad--;
                }
                if (pageNum !== pageToLoad && pageToLoad >= 1 && pageToLoad <= total) {
                    that.options.page = pageToLoad;
                    that._loadVisiblePages();
                    that._updatePager(pageToLoad, total);
                }
                that._prevScrollTop = containerScrollTop;
            },
            execute: function (options) {
                var commandOptions = extend({ viewer: this }, options.options);
                var command = new kendo.pdfviewer[options.command](commandOptions);
                command.exec();
            },
            _loadDocument: function () {
                var that = this;
                var page = that.options.page;
                progress(that.pageContainer, true);
                that.processor.fetchDocument().then(function (document) {
                    that.document = document;
                    that._renderPages();
                    that.resize(true);
                    if (document) {
                        page = page >= 1 && page <= document.total ? page : 1;
                        that.activatePage(page);
                    }
                    progress(that.pageContainer, false);
                });
            },
            loadPage: function (number) {
                var page = this.pages && this.pages[number - 1];
                if (page) {
                    page.load();
                }
            },
            activatePage: function (number) {
                var page = this.pages && this.pages[number - 1];
                var currentScrollTop = this.pageContainer.scrollTop();
                if (!page) {
                    return;
                }
                this.options.page = number;
                this._loadVisiblePages();
                this._preventScroll = true;
                this.pageContainer.scrollTop(currentScrollTop + page.element.position().top);
                this._updatePager(number, this.pages.length);
            },
            _loadVisiblePages: function () {
                var pagesCount = this.pages && this.pages.length;
                var minVisiblePageNum = this.options.page;
                var maxVisiblePageNum = Math.min(minVisiblePageNum + this._visiblePagesCount, pagesCount);
                for (var i = minVisiblePageNum; i <= maxVisiblePageNum; i++) {
                    this.loadPage(i);
                }
            },
            fromFile: function (file) {
                this._clearPages();
                this.processor._updateDocument(file);
                this._loadDocument();
            },
            exportImage: function (options) {
                var that = this;
                var pageNumber = options.page;
                var page = that.pages[pageNumber - 1];
                var rootGroup = new drawing.Group();
                page.load();
                if (!page.group) {
                    return;
                }
                var background = kendo.drawing.Path.fromRect(new kendo.geometry.Rect([
                    0,
                    0
                ], [
                    page.width,
                    page.height
                ]), {
                    fill: { color: WHITECOLOR },
                    stroke: null
                });
                progress(that.pageContainer, true);
                rootGroup.append(background, page.group);
                drawing.exportImage(rootGroup).done(function (data) {
                    progress(that.pageContainer, false);
                    kendo.saveAs({
                        dataURI: data,
                        fileName: options.fileName,
                        proxyURL: options.proxyURL || '',
                        forceProxy: options.forceProxy,
                        proxyTarget: options.proxyTarget
                    });
                });
            },
            exportSVG: function (options) {
                var that = this;
                var pageNumber = options.page;
                var page = that.pages[pageNumber - 1];
                progress(that.pageContainer, true);
                page.load();
                drawing.exportSVG(page.group).done(function (data) {
                    progress(that.pageContainer, false);
                    kendo.saveAs({
                        dataURI: data,
                        fileName: options.fileName,
                        proxyURL: options.proxyURL || '',
                        forceProxy: options.forceProxy,
                        proxyTarget: options.proxyTarget
                    });
                });
            },
            setOptions: function (options) {
                var that = this;
                if (options.pdfjsProcessing || options.dplProcessing) {
                    that._initProcessor();
                }
                options = $.extend(that.options, options);
                Widget.fn.setOptions.call(that, options);
                if (options.page) {
                    that.activatePage(options.page);
                }
                if (options.width) {
                    that.element.width(options.width);
                }
                if (options.height) {
                    that.element.height(options.height);
                }
            },
            destroy: function () {
                kendo.unbindResize(this._resizeHandler);
                if (this._errorDialog) {
                    this._errorDialog.destroy();
                }
                if (this._saveDialog) {
                    this._saveDialog.destroy();
                }
                if (this._upload) {
                    this._upload.destroy();
                }
                if (this.toolbar) {
                    this.toolbar.unbind();
                    this.toolbar.destroy();
                    this.toolbar = null;
                }
                if (this.pages && this.pages.length) {
                    this.pages.forEach(function (page) {
                        page.destroy();
                    });
                    this.pages = [];
                }
                this.pageContainer.off(NS);
                Widget.fn.destroy.call(this);
            },
            _clearPages: function () {
                this.pages = [];
                this.options.page = 1;
                this.pageContainer.empty();
                this.pageContainer.off(SCROLL + NS);
                this.pageContainer.scrollTop(0);
            }
        });
        ui.plugin(PDFViewer);
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));