/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.mobile.scroller.js";
import "./kendo.toolbar.js";
import "./kendo.combobox.js";
import "./kendo.textbox.js";
import "./pdfviewer/processors/pdfjs-processor.js";
import "./pdfviewer/processors/dpl-processor.js";
import "./pdfviewer/page.js";
import "./pdfviewer/search.js";
import "./pdfviewer/dialogs.js";
import "./pdfviewer/commands.js";

var __meta__ = {
    id: "pdfviewer",
    name: "PDFViewer",
    category: "web",
    description: "PDFViewer to display pdfs in the browser",
    depends: ["core", "window", "dialog", "toolbar", "mobile.scroller", "upload", "combobox", "drawing", "binder", "dropdownlist", "numerictextbox", "textbox"]
};

(function($, undefined) {
    var NS = ".kendoPDFViewer",
        kendo = window.kendo,
        ui = kendo.ui,
        extend = $.extend,
        drawing = kendo.drawing,
        keys = $.extend({ PLUS: 187, MINUS: 189, ZERO: 48, NUMPAD_ZERO: 96 }, kendo.keys),
        Page,
        Widget = ui.Widget,
        progress = kendo.ui.progress,
        SCROLL = "scroll",
        RENDER = "render",
        OPEN = "open",
        ERROR = "error",
        KEYDOWN = "keydown" + NS,
        MOUSEWHEEL = "DOMMouseScroll" + NS + " mousewheel" + NS,
        UPDATE = "update",
        ZOOM_SCALE = 1.25,
        PAGE_CHANGE = "pagechange",
        ZOOMSTART = "zoomStart",
        ZOOMEND = "zoomEnd",
        ZOOMCOMMAND = "ZoomCommand",
        WHITECOLOR = "#ffffff",
        TABINDEX = "tabindex",
        CLICK = "click",
        CHANGE = "change",
        TOGGLE = "toggle",
        PROCESSORS = {
            pdfjs: "pdfjs",
            dpl: "dpl"
        },
        styles = {
            viewer: "k-pdf-viewer k-widget",
            scroller: "k-canvas k-list-scroller",
            enableTextSelection: "k-enable-text-select",
            enablePanning: "k-enable-panning",
            highlightClass: "k-search-highlight",
            charClass: "k-text-char"
        },
        PREDEFINED_ZOOM_VALUES = {
            auto: "auto",
            actual: "actual",
            fitToWidth: "fitToWidth",
            fitToPage: "fitToPage"
        };

    var PDFViewer = Widget.extend({
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, kendo.deepExtend({}, this.options, options));

            that._processMessages();

            that._wrapper();

            if (that.options.toolbar) {
                that._renderToolbar();
            }

            that._initProcessor(options || {});
            that._renderPageContainer();
            that._loadDocument();

            kendo.notify(that, kendo.ui);
        },

        events: [
            RENDER,
            OPEN,
            ERROR,
            ZOOMSTART,
            ZOOMEND
        ],

        options: {
            name: "PDFViewer",
            view: {
                type: "canvas"
            },
            pdfjsProcessing: {
                file: null
            },
            dplProcessing: {
                read: {
                    url: null,
                    type: "GET",
                    dataType: "json",
                    pageField: "pageNumber"
                },
                upload: {
                    url: null,
                    saveField: "file"
                },
                download: {
                    url: null
                },
                loadOnDemand: false
            },
            toolbar: {
                items: []
            },
            width: 1000,
            height: 1200,
            page: 1,
            defaultPageSize: {
                width: 794,
                height: 1123
            },
            scale: null,
            zoomMin: 0.5,
            zoomMax: 4,
            zoomRate: 0.25,
            messages: {
                defaultFileName: "Document",
                toolbar: {
                    zoom: {
                        zoomLevel: "zoom level",
                        zoomOut: "Zoom Out",
                        zoomIn: "Zoom In",
                        actualWidth: "Actual Width",
                        autoWidth: "Automatic Width",
                        fitToWidth: "Fit to Width",
                        fitToPage: "Fit to Page"
                    },
                    open: "Open",
                    exportAs: "Export",
                    download: "Download",
                    pager: {
                        first: "Go to the first page",
                        previous: "Go to the previous page",
                        next: "Go to the next page",
                        last: "Go to the last page",
                        of: "of",
                        page: "page",
                        pages: "pages"
                    },
                    print: "Print",
                    toggleSelection: "Enable Selection",
                    togglePan: "Enable Panning",
                    search: "Search"
                },
                errorMessages: {
                    notSupported: "Only pdf files allowed.",
                    parseError: "PDF file fails to process.",
                    notFound: "File is not found.",
                    popupBlocked: "Popup is blocked."
                },
                dialogs: {
                    exportAsDialog: {
                        title: "Export...",
                        defaultFileName: "Document",
                        pdf: "Portable Document Format (.pdf)",
                        png: "Portable Network Graphics (.png)",
                        svg: "Scalable Vector Graphics (.svg)",
                        labels: {
                            fileName: "File name",
                            saveAsType: "Save as",
                            page: "Page"
                        }
                    },
                    okText: "OK",
                    save: "Save",
                    cancel: "Cancel",
                    search: {
                        inputLabel: "Search Text",
                        matchCase: "Match Case",
                        next: "Next Match",
                        previous: "Previous Match",
                        close: "Close",
                        of: "of",
                        dragHandle: "Drag search"
                    }
                }
            }
        },

        defaultTools: {
            pager: {
                name: "pager",
                command: "PageChangeCommand"
            },
            spacer: { type: "spacer" },
            zoomInOut: {
                type: "buttonGroup",
                fillMode: "flat",
                attributes: { "class": "k-zoom-in-out-group" },
                buttons: [
                    { type: "button", icon: "zoom-out", name: "zoomOut", command: "ZoomCommand", showText: "overflow", options: "{ \"zoomOut\": true, \"updateComboBox\": true }", fillMode: "flat" },
                    { type: "button", icon: "zoom-in", name: "zoomIn", command: "ZoomCommand", showText: "overflow", options: "{ \"zoomIn\": true, \"updateComboBox\": true }", fillMode: "flat" },
                ]
            },
            zoom: {
                type: "component",
                name: "zoom",
                command: "ZoomCommand",
                overflow: "never",
                component: "ComboBox",
                data: [50, 100, 150, 200, 300, 400],
                componentOptions: {
                    enable: false,
                    dataTextField: "text",
                    dataValueField: "percent",
                    valuePrimitive: true,
                    clearOnEscape: false,
                    commandOn: "change"
                }
            },
            toggleSelection: {
                type: "buttonGroup",
                fillMode: "flat",
                attributes: { "class": "k-toggle-selection-group" },
                buttons: [
                    {
                        togglable: true,
                        command: "EnableSelectionCommand",
                        icon: "pointer",
                        showText: "overflow",
                        name: "toggleSelection",
                        group: "toggle-pan",
                        fillMode: "flat"
                    }, {
                        togglable: true,
                        command: "EnablePanCommand",
                        icon: "hand",
                        showText: "overflow",
                        name: "togglePan",
                        group: "toggle-pan",
                        selected: true,
                        fillMode: "flat"
                    }
                ]
            },
            spacer2: { type: "spacer" },
            search: {
                type: "button",
                command: "OpenSearchCommand",
                icon: "search",
                name: "search",
                showText: "overflow",
                enable: false,
                fillMode: "flat"
            },
            open: {
                type: "button",
                showText: "overflow",
                name: "open",
                icon: "folder-open",
                command: "OpenCommand",
                fillMode: "flat"
            },
            download: {
                type: "button",
                showText: "overflow",
                name: "download",
                icon: "download",
                command: "DownloadCommand",
                enable: false,
                fillMode: "flat"
            },
            print: {
                type: "button",
                showText: "overflow",
                name: "print",
                icon: "print",
                command: "PrintCommand",
                enable: false,
                fillMode: "flat"
            }
        },

        exportAsTool: {
            exportAs: { type: "button", showText: "overflow", name: "exportAs", icon: "image-export", command: "ExportCommand", fillMode: "flat" }
        },

        pagerTools: [
            {
                type: "buttonGroup",
                fillMode: "flat",
                buttons: [
                    { type: "button", icon: "caret-alt-to-left", name: "first", showText: "overflow", options: "{ \"value\": \"first\" }", attributes: { class: "k-first-link" } },
                    { type: "button", icon: "caret-alt-left", name: "previous", showText: "overflow", options: "{ \"value\": \"prev\" }", attributes: { class: "k-prev-link" }, rounded: "none" },
                ]
            },
            {
                type: "component",
                component: "TextBox",
                name: "page",
                attributes: { class: "k-viewer-pager-input" },
                element: "<input id='page-input'/>",
                overflow: "never",
                componentOptions: {
                    commandOn: "change"
                }
            },
            {
                overflow: "never",
                template: function(data) {
                    return "<label for='page-input'>" + data.componentOptions.messages.of + " <span id='total-page'></span> " + data.componentOptions.messages.pages + "</label>";
                },
                componentOptions: {
                    messages: {
                        of: "of",
                        pages: "pages"
                    }
                }
            },
            {
                type: "buttonGroup",
                fillMode: "flat",
                buttons: [
                    { type: "button", icon: "caret-alt-right", name: "next", showText: "overflow", options: "{ \"value\": \"next\" }", fillMode: "flat", attributes: { class: "k-next-link" }, rounded: "none" },
                    { type: "button", icon: "caret-alt-to-right", name: "last", showText: "overflow", options: "{ \"value\": \"last\" }", fillMode: "flat", attributes: { class: "k-last-link" } }
                ]
            },
        ],

        _processMessages: function() {
            var messages = this.options.messages.toolbar,
                zoom = messages.zoom,
                pager = messages.pager;

            if ($.isPlainObject(zoom)) {
                this.options.messages.toolbar = $.extend({}, this.options.messages.toolbar, zoom);
                this.options.messages.toolbar.zoom = zoom.zoomLevel || this.options.messages.toolbar.zoom;
            }

            if ($.isPlainObject(pager)) {
                this.options.messages.toolbar = $.extend({}, this.options.messages.toolbar, pager);
            }
        },

        _wrapper: function() {
            var that = this,
                options = that.options;

            that.wrapper = that.element;

            that.wrapper
                    .width(options.width)
                    .height(options.height)
                    .addClass(styles.viewer)
                    .on(KEYDOWN, that._keydown.bind(that));

            that._allowResize = that.options.scale === null;
            that._autoZoomScale = ZOOM_SCALE;
            that.zoomScale = that.options.scale || that._autoZoomScale;

            that._resizeHandler = kendo.onResize(function() {
                that.resize();
            });

            that._pageNum = that.options.page;
        },

        _keydown: function(e) {
            var plusShortcuts = [keys.PLUS, keys.NUMPAD_PLUS],
                minusShortcuts = [keys.MINUS, keys.NUMPAD_MINUS],
                zeroShortcuts = [keys.ZERO, keys.NUMPAD_ZERO],
                shouldExecute = false,
                args = {
                    command: ZOOMCOMMAND,
                    options: { updateComboBox: true }
                };

            if (!e.ctrlKey || this._blankPage || this.processingLib === PROCESSORS.dpl) {
                return;
            }

            if (plusShortcuts.includes(e.keyCode)) {
                args.options.zoomIn = true;
                shouldExecute = true;
            } else if (minusShortcuts.includes(e.keyCode)) {
                args.options.zoomOut = true;
                shouldExecute = true;
            } else if (zeroShortcuts.includes(e.keyCode)) {
                args.options.value = ZOOM_SCALE;
                shouldExecute = true;
            }

            if (shouldExecute) {
                this.execute(args);
                e.preventDefault();
            }
        },

        _initProcessor: function(options) {
            var that = this,
                processingOptions;

            processingOptions = options.dplProcessing ? that.options.dplProcessing : that.options.pdfjsProcessing;
            that.processingLib = options.dplProcessing ? PROCESSORS.dpl : PROCESSORS.pdfjs;

            that.processor = new kendo.pdfviewer[that.processingLib].processor(processingOptions, that);
            Page = kendo.pdfviewer[that.processingLib].Page;
        },

        _renderToolbar: function() {
            var that = this,
                options = that.options,
                toolbarOptions = extend({}, options.toolbar),
                tools = toolbarOptions.items && toolbarOptions.items.length ? toolbarOptions.items : Object.keys(that.defaultTools);

            tools = that._processTools(tools);

            toolbarOptions = {
                defaultTools: $.extend({}, that.defaultTools, that.exportAsTool),
                parentMessages: options.messages.toolbar,
                tools: tools,
                resizable: true
            };

            var toolbarElement = $("<div />");
            toolbarElement.appendTo(that.element);
            that.toolbar = new kendo.ui.ToolBar(toolbarElement, toolbarOptions);
            that.options.toolbar = that.toolbar.options;

            that.toolbar.bind(TOGGLE, that._toolbarClick.bind(that));
            that.toolbar.bind(CLICK, that._toolbarClick.bind(that));
            that.toolbar.bind(CHANGE, that._toolbarClick.bind(that));

            that.bind({
                update: that._updateToolbar.bind(that)
            });

            return that.toolbar;
        },

        _processTools: function(tools) {
            var that = this,
                messages = that.options.messages.toolbar;

            tools = tools.flatMap(t => {
                if (t === "zoom") {
                    t = that.defaultTools.zoom;
                } else if (t === "pager") {
                    t = that.defaultTools.pager;
                }

                if (t.name === "zoom") {
                    t = $.extend({}, that.defaultTools.zoom, t);

                    var zoomLevels = [{
                        percent: PREDEFINED_ZOOM_VALUES.auto,
                        text: messages.autoWidth
                    }, {
                        percent: PREDEFINED_ZOOM_VALUES.actual,
                        text: messages.actualWidth
                    }, {
                        percent: PREDEFINED_ZOOM_VALUES.fitToWidth,
                        text: messages.fitToWidth
                    }, {
                        percent: PREDEFINED_ZOOM_VALUES.fitToPage,
                        text: messages.fitToPage
                    }];

                    // eslint-disable-next-line
                    var comboOptions = t.data.map(i => { return { percent: i, text: i + "%" } });
                    var value = that.options.scale ? that.options.scale * 100 + "%" : "auto";

                    zoomLevels = zoomLevels.concat(comboOptions);
                    t.componentOptions.dataSource = zoomLevels;
                    t.componentOptions.value = value;
                } else if (t.name === "pager") {
                    t = $.extend({}, that.defaultTools.pager, t);

                    var pagerTools = that.pagerTools;

                    that.pager = true;

                    t = pagerTools.map(p => {
                        var compMessages;

                        if (p.componentOptions && p.componentOptions.messages) {
                            compMessages = p.componentOptions.messages;
                            Object.keys(messages).forEach(key => {
                                p.componentOptions.messages[key] = messages.pager[key];
                            });
                        }

                        if (p.buttons) {
                            p.buttons = p.buttons.map((b) => {
                                if (b.icon && b.icon.indexOf("caret-alt") > -1 && kendo.support.isRtl(that.element)) {
                                    var direction = b.icon.indexOf("left") > -1 ? "left" : "right";
                                    var rtlDirection = b.icon.indexOf("left") > -1 ? "right" : "left";
                                    b.icon = b.icon.replace(direction, rtlDirection);
                                }
                                b.command = t.command;
                                return b;
                            });
                        } else {
                            p.command = t.command;
                        }

                        return p;
                    });
                }

                return t;
            });

            return tools;
        },

        _updateToolbar: function(e) {
            var pageOptions = {
                    page: e.page || 1,
                    total: e.total || 1
                },
                toolbar = this.toolbar,
                toolbarEl = toolbar.element,
                zoomCombo = toolbarEl.find("[data-command=ZoomCommand][data-role=combobox]").data("kendoComboBox"),
                toFocus = toolbarEl.find(".k-focus");

            if (toFocus.length === 0) {
                toFocus = toolbarEl.find("[tabindex=0]").first();

                if (toFocus.length === 0) {
                    toFocus = toolbar._getAllItems().first();
                }
            }

            if (zoomCombo) {
                zoomCombo.enable(!e.isBlank);
                if (e.action === "zoom") {
                    this._updateZoomComboBox(e.zoom);
                }
            }

            if ((e.action === "pagechange" || e.isBlank) && this.pager) {
                this._updatePager(pageOptions);
            }

            this._updateOnBlank(e.isBlank);

            toolbar._resetTabIndex(toFocus);
        },

        _updateOnBlank: function(isBlank) {
            var toolbar = this.toolbar,
                toolbarEl = toolbar.element;

            toolbar.enable(toolbarEl.find(".k-toggle-selection-group"), !isBlank);
            toolbar.enable(toolbarEl.find(".k-zoom-in-out-group"), !isBlank);

            toolbar.enable(toolbarEl.find("[data-command='OpenSearchCommand']"), !isBlank);
            toolbar.enable(toolbarEl.find("[data-command='DownloadCommand']"), !isBlank);
            toolbar.enable(toolbarEl.find("[data-command='PrintCommand']"), !isBlank);
        },

        _updatePager: function(options) {
            var toolbarEl = this.toolbar.element,
                textBox = toolbarEl.find("#page-input").data("kendoTextBox"),
                totalPagesSpan = toolbarEl.find("#total-page");

            if (textBox && options.page) {
                textBox.value(options.page);
            }

            if (totalPagesSpan.length && options.total) {
                totalPagesSpan.text(options.total);
            }

            this._togglePagerDisabledClass(options);
        },

        _togglePagerDisabledClass: function(options) {
            var toolbar = this.toolbar,
                toolbarEl = toolbar.element,
                total = !options.total,
                prevFirst = toolbarEl.find(".k-prev-link").closest(".k-button-group"),
                nextLast = toolbarEl.find(".k-next-link").closest(".k-button-group"),
                textBox = toolbarEl.find("#page-input").data("kendoTextBox");

            if (prevFirst.length) {
                toolbar.enable(prevFirst, total || options.page !== 1);
            }
            if (nextLast.length) {
                toolbar.enable(nextLast, total || options.page !== options.total);
            }

            if (textBox) {
                textBox.enable(options.total > 1);
            }
        },

        _updateZoomComboBox: function(value) {
            var isPredefined = value === PREDEFINED_ZOOM_VALUES.auto ||
                value === PREDEFINED_ZOOM_VALUES.actual ||
                value === PREDEFINED_ZOOM_VALUES.fitToPage ||
                value === PREDEFINED_ZOOM_VALUES.fitToWidth,
                zoomCombo = this.toolbar.element.find("[data-command=ZoomCommand][data-role=combobox]").data("kendoComboBox");

            if (!isPredefined) {
                value = Math.round(value * 100) + '%';
            }

            if (zoomCombo) {
                zoomCombo.value(value);
            }
        },

        _toolbarClick: function(ev) {
            var command = $(ev.target).data("command"),
                options = $(ev.target).data("options");

            options = extend({}, { value: $(ev.target).val() }, options);

            if (!command) {
                return;
            }

            this.execute({
                command: command,
                options: options
            });
        },

        _initErrorDialog: function(options) {
            var that = this;

            if (!that._errorDialog) {
                options = extend(options, {
                    messages: that.options.messages
                });
                var dialogInstance = new kendo.pdfviewer.dialogs.ErrorDialog(options);
                that._errorDialog = dialogInstance._dialog;
            }
            return that._errorDialog;
        },

        _renderPageContainer: function() {
            var that = this;

            if (!that.pageContainer) {
                that.pageContainer = $("<div />");
                that.pageContainer.addClass(styles.scroller);
                that.pageContainer.attr(TABINDEX, 0);
                that.wrapper.append(that.pageContainer);
            }
        },

        _triggerError: function(options) {
            var dialog = this._initErrorDialog();
            extend(options, {
                dialog: dialog
            });
            if (this.pageContainer) {
                progress(this.pageContainer, false);
            }

            if (this.trigger(ERROR, options))
            {
                return;
            }

            dialog.open().content(options.message);
        },

        _renderPages: function() {
            var that = this,
                document = that.document,
                pagesData;

            that.pages = [];

            if (!document || !document.total) {
                that._renderBlankPage();
                return;
            }

            pagesData = document.pages;

            for (var i = 1; i <= document.total; i++) {
                var viewerPage,
                    pageData = {
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

            that._attachContainerEvents();
            that._getVisiblePagesCount();
        },

        _renderBlankPage: function() {
            this._blankPage = new Page(this.options.defaultPageSize, this);

            this.pageContainer.append(this._blankPage.element);

            this.trigger(UPDATE, { isBlank: true });
        },

        _resize: function() {
            var that = this,
                containerWidth,
                ratio;

            if (!that._allowResize) {
                return;
            }

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

            if (that._resizeHandler) {
                clearTimeout(that._resizeHandler);
            }
            that._resizeHandler = setTimeout(that._resizePages.bind(that), 100);
        },

        _resizePages: function() {
            var that = this,
                containerWidth = that.pageContainer[0].clientWidth,
                ratio = 0;

            that.pages.forEach(function(page) {
                var currentRatio = containerWidth / page.element.width();

                if (currentRatio > ratio) {
                    ratio = currentRatio;
                }
            });

            if (that._autoFit) {
                that.zoom(that._autoFit, true);
                return;
            }

            ratio = Math.min(Math.max(ratio, that.options.zoomMin), ZOOM_SCALE);
            if (ratio != that.zoomScale) {
                that.zoom(ratio, true);
                that.zoomScale = ratio;
                that._allowResize = true;
            }
        },

        _attachContainerEvents: function() {
            var that = this;

            that._wheel = kendo.throttle(
                that._wheel.bind(that),
                300
            );

            if (that.processingLib !== PROCESSORS.dpl) {
                that.pageContainer.on(MOUSEWHEEL, function(e) {
                    if (!e.ctrlKey) {
                        return;
                    }

                    if (document.activeElement !== that.pageContainer[0]) {
                        that.pageContainer.trigger("focus");
                    }

                    that._wheel(e);
                    e.preventDefault();
                });
            }

            that._scroller = new kendo.mobile.ui.Scroller(that.pageContainer, {
                zoom: false,
                elastic: true
            });

            that._scroller.scrollElement.addClass(styles.enablePanning);
            that._scroller.bind(SCROLL, that._scroll.bind(this));
        },

        _scroll: function(e) {
            var that = this,
                containerScrollHeight = that.pageContainer[0].scrollHeight,
                containerHeight = that.pageContainer.height(),
                containerScrollTop = e.scrollTop,
                containerOffsetTop = that.pageContainer.offset().top,
                total = that.pages.length,
                pageNum = that._pageNum,
                pageIndex = pageNum - 1,
                pageToLoadNum = pageNum,
                pageToLoad,
                currentPage, currentPageTop, currentPageHeight,
                previousPage, prevPageTop, prevPageHeight,
                scrollDirection = containerScrollTop - that._prevScrollTop > 0 ? 1 : -1;

                if (that._preventScroll || !total) {
                    that._preventScroll = false;
                    return;
                }

                that._scrollingStarted = true;

                currentPage = that.pages[pageIndex];
                currentPageTop = currentPage.element.offset().top - containerOffsetTop;
                currentPageHeight = currentPage.element.height();

                if (scrollDirection == -1 && that.pages[pageIndex + scrollDirection]) {
                    previousPage = that.pages[pageIndex - that._visiblePagesCount] || that.pages[pageIndex + scrollDirection];
                    prevPageTop = previousPage.element.offset().top - containerOffsetTop;
                    prevPageHeight = previousPage.element.height();
                }

                if (Math.abs(containerScrollTop - (that._prevScrollTop || 0)) > containerHeight * that.zoomScale) {
                    pageToLoadNum = Math.floor(containerScrollTop * (1 / (containerScrollHeight / total))) + 1;
                } else if (currentPageTop < 0 && Math.abs(currentPageTop) >= currentPageHeight / 2 && scrollDirection === 1) {
                    pageToLoadNum++;
                } else if (previousPage && Math.abs(prevPageTop) <= prevPageHeight / 2) {
                    pageToLoadNum--;
                }

                if (pageNum !== pageToLoadNum && pageToLoadNum >= 1 && pageToLoadNum <= total) {
                    pageToLoad = that.pages[pageToLoadNum - 1].element;

                    if (pageToLoad.offset().top > containerHeight) {
                        return;
                    }

                    that._pageNum = pageToLoadNum;
                    that._loadVisiblePages();

                    that.trigger(UPDATE, { action: PAGE_CHANGE, page: pageToLoadNum, total: total });
                }

                that._prevScrollTop = containerScrollTop;
        },

        _wheel: function(e) {
            var originalEvent = e.originalEvent,
                delta = originalEvent.wheelDelta ? -originalEvent.wheelDelta : originalEvent.detail,
                zoomIn = delta < 0;

            this.execute({
                command: ZOOMCOMMAND,
                options: {
                    zoomIn: zoomIn,
                    zoomOut: !zoomIn,
                    updateComboBox: true
                }
            });

            e.preventDefault();
        },

        zoom: function(scale, preventComboBoxChange) {
            var that = this;
            if (!scale) {
                return that.zoomScale;
            }

            return that.execute({
                command: ZOOMCOMMAND,
                options: {
                    value: scale,
                    updateComboBox: !preventComboBoxChange
                }
            });
        },

        execute: function(options) {
            var commandOptions = extend({ viewer: this }, options.options);
            var command = new kendo.pdfviewer[options.command](commandOptions);
            return command.exec();
        },

        _loadDocument: function() {
            var that = this;
            var page = that.options.page;

            progress(that.pageContainer, true);
            that.processor.fetchDocument().done(function(document) {
                that._clearPages();
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

        loadPage: function(number) {
            var page = this.pages && this.pages[number - 1];

            if (page) {
                return page.load(this.zoomScale);
            }
        },

        activatePage: function(number) {
            var page = this.pages && this.pages[number - 1],
                scroller = this._scroller,
                scrollerTopPosition,
                scrollerTopOffset,
                pageTopOffset,
                pageMargin;

            if (!page) {
                return;
            }

            scrollerTopPosition = scroller.scrollTop;
            scrollerTopOffset = scroller.element.offset().top;
            pageTopOffset = page.element.offset().top;
            pageMargin = !this._autoFit ? parseInt(page.element.css("marginTop"), 10) : 0;

            this._pageNum = number;
            this._loadVisiblePages();

            this._preventScroll = true;

            this._scroller.scrollTo(0, -scrollerTopPosition - pageTopOffset + scrollerTopOffset + pageMargin);
            this.trigger(UPDATE, { action: PAGE_CHANGE, page: number, total: this.pages.length });
        },

        _getVisiblePagesCount: function() {
            var that = this,
                loadedPagesHeight = 0,
                updatedVisiblePagesCount = 0,
                containerHeight = that.pageContainer[0].clientHeight,
                index = 0;

            while (loadedPagesHeight <= containerHeight && index < that.pages.length)
            {
                loadedPagesHeight += that.pages[index].element.height();
                updatedVisiblePagesCount++;
                index++;
            }

            that._visiblePagesCount = updatedVisiblePagesCount;
        },

        _loadVisiblePages: function() {
            var pagesCount = this.pages && this.pages.length,
                minVisiblePageNum = Math.max(this._pageNum - this._visiblePagesCount, 1),
                maxVisiblePageNum = Math.min(this._pageNum + this._visiblePagesCount, pagesCount);

            this._visiblePages = this.pages.slice(minVisiblePageNum - 1, maxVisiblePageNum);

            for (var i = minVisiblePageNum; i <= maxVisiblePageNum; i++)
            {
                this.loadPage(i);
            }
        },

        _loadAllPages: function() {
            var pagesCount = this.pages && this.pages.length;
            var promises = [];

            for (var i = 0; i <= pagesCount; i++)
            {
                promises.push(this.loadPage(i));
            }

            return promises;
        },

        fromFile: function(file) {
            this.zoomScale = this.options.scale || ZOOM_SCALE;
            this.zoom(this.zoomScale, true);
            this.trigger(UPDATE, { action: "zoom", zoom: this.options.scale || "auto" });

            this.processor._updateDocument(file);
            this._loadDocument();
        },

        exportImage: function(options) {
            var that = this;
            var pageNumber = options.page;
            var page = that.pages[pageNumber - 1] || that._blankPage;
            var rootGroup = new drawing.Group();

            page.load();

            var background = kendo.drawing.Path.fromRect(new kendo.geometry.Rect([0, 0], [page.width, page.height]), {
                fill: {
                    color: WHITECOLOR
                },
                stroke: null
            });

            progress(that.pageContainer, true);
            rootGroup.append(background, page.group);

            drawing.exportImage(rootGroup).done(function(data) {
                progress(that.pageContainer, false);
                kendo.saveAs({
                    dataURI: data,
                    fileName: options.fileName,
                    proxyURL: options.proxyURL || "",
                    forceProxy: options.forceProxy,
                    proxyTarget: options.proxyTarget
                });
            });
        },

        exportSVG: function(options) {
            var that = this;
            var pageNumber = options.page;
            var page = that.pages[pageNumber - 1] || that._blankPage;

            progress(that.pageContainer, true);

            page.load();

            drawing.exportSVG(page.group).done(function(data) {
                progress(that.pageContainer, false);
                kendo.saveAs({
                    dataURI: data,
                    fileName: options.fileName,
                    proxyURL: options.proxyURL || "",
                    forceProxy: options.forceProxy,
                    proxyTarget: options.proxyTarget
                });
            });
        },

        setOptions: function(options)
        {
            var that = this;

            if (options.pdfjsProcessing || options.dplProcessing) {
                that._initProcessor(options || {});
            }

            options = $.extend(that.options, options);

            Widget.fn.setOptions.call(that, options);

            if (options.page) {
                that._pageNum = options.page;
                that.activatePage(options.page);
            }

            if (options.width) {
                that.element.width(options.width);
            }

            if (options.height) {
                that.element.height(options.height);
            }
        },

        destroy: function()
        {
            if (this._resizeHandler)
            {
                kendo.unbindResize(this._resizeHandler);
            }

            //destroy nested components
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
                this.pages.forEach(function(page) {
                    page.destroy();
                });
                this.pages = [];
            }

            if (this._scroller) {
                this._scroller.unbind();
                this._scroller.destroy();
            }
            this.pageContainer.off(NS);

            Widget.fn.destroy.call(this);
        },

        _clearPages: function() {
            this.pages = [];
            this.document = null;
            this._pageNum = 1;

            this.pageContainer.off(NS);
            this.pageContainer.empty();

            if (this._scroller)
            {
                this._scroller.reset();
                this._scroller.unbind();
                this._scroller.destroy();
            }
        },

        _toggleSelection: function(enable) {
            var that = this;

            if (enable === undefined) {
                enable = true;
            }

            that._scroller.userEvents._shouldNotMove = enable;

            that._scroller.scrollElement.toggleClass(styles.enableTextSelection, enable);
            that._scroller.scrollElement.toggleClass(styles.enablePanning, !enable);
        },


        _initSearchDOM: function() {
            var that = this;
            var promise = new Promise(function(resolve) {
                Promise.all(that._loadAllPages()).then(function() {
                    that._searchDOM = new kendo.pdfviewer.SearchDOM({
                        target: that._getTextLayers(),
                        highlightClass: styles.highlightClass,
                        charClass: styles.charClass
                    });

                    resolve();
                });
            });

            return promise;
        },

        _getTextLayers: function() {
            return this.pages.map(function(page) {
                return page.textLayer;
            });
        }
    });

    ui.plugin(PDFViewer);
})(window.kendo.jQuery);

