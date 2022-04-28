/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('pdfviewer/pdfjs',["../kendo.core"], f);
})(function(){

(function ($, undefined) {
    var extend = $.extend;
    var isLoaded = function() {
        if (!window.pdfjsLib)
        {
            var console = window.console;

            if (console && console.error) {
                console.error("PDF.JS required.");
            }

            return false;
        }

        kendo.pdfviewer.pdfjs.lib = window.pdfjsLib;

        return true;
    };

    extend(kendo, {
        pdfviewer: {
            pdfjs: {
                lib: window.pdfjsLib,
                isLoaded: isLoaded
            }
        }
    });
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

(function(f, define){
    define('pdfviewer/processors/pdfjs-processor',[
        "../pdfjs"
    ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "pdfjs-processor",
    name: "PDFJS-Processor",
    category: "framework",
    depends: [ "core" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        Class = kendo.Class,
        extend = $.extend,
        atob = window.atob,
        PDFJS;

    var PDFJSProcessor = Class.extend({
        init: function(options, viewer) {
            var that = this;

            if (kendo.pdfviewer.pdfjs.isLoaded()) {
                PDFJS = kendo.pdfviewer.pdfjs.lib;
            }

            that.file = options.file;
            that.viewer = viewer;
        },
        fetchDocument: function () {
            var that = this,
                deferred = $.Deferred(),
                messages = that.viewer.options.messages.errorMessages;

            if (!that.file) {
                return deferred.resolve();
            }

            if (that._isBase64Data() && atob)
            {
                that.file.data = atob(that.file.data);
            }

            PDFJS.getDocument(this.file).promise.then(function (pdf) {
                var pageSizes = [];
                that.pdf = pdf;
                that.pagePromises = [];
                that._downloadData = $.Deferred();

                pdf.getData().then(function (data) {
                    var blob = new Blob([data], { type: 'application/pdf' });
                    that._downloadData.resolve({
                        file: blob
                    });
                });

                for (var i = 1; i <= pdf.numPages; i++) {
                    that.pagePromises.push(pdf.getPage(i));
                }

                Promise.all(that.pagePromises).then(function (pagePromises) {
                    pageSizes = pagePromises.map(function (pagePromise) {
                        var viewport = pagePromise.getViewport({scale: 4/3});
                        return {
                            width: viewport.width,
                            height: viewport.height
                        };
                    });

                    deferred.resolve({
                        total: pdf.numPages,
                        pages: pageSizes
                    });
                }).catch(function (e) { // jshint ignore:line
                    that.viewer._triggerError({
                        error: e.message,
                        message: messages.parseError
                    });
                });

            }).catch(function (e) { // jshint ignore:line
                var notFoundError = e.name.includes("Missing");
                var alertMessage = notFoundError ? messages.notFound : messages.parseError;
                that.viewer._triggerError({
                    error: e.message,
                    message: alertMessage
                });
                if (notFoundError) {
                    that.viewer._renderBlankPage();
                }
            });

            return deferred;
        },
        fetchPageData: function (number) {
            return this.pagePromises[number - 1];
        },
        downloadFile: function (fileName) {
            var that = this;
            kendo.ui.progress(that.viewer.pageContainer, true);

            that._downloadData.done(function (result) {
                kendo.ui.progress(that.viewer.pageContainer, false);

                var reader = new FileReader();
                reader.readAsDataURL(result.file);

                reader.onload = function() {
                    kendo.saveAs({
                        dataURI: reader.result,
                        fileName: fileName + ".pdf",
                        proxyURL: function() {
                            return reader.result;
                        }
                    });
                };
            });
        },
        _updateDocument: function (file) {
            if(this.pdf && this.pdf.loadingTask) {
                this.pdf.loadingTask.destroy();
            }

            this.file = file;
        },
        _isBase64Data: function () {
            var data = this.file.data,
                notBase64 = /[^A-Z0-9+\/=]/i,
                length = data && data.length,
                equalSign;

            if (!length || length % 4 !== 0 || notBase64.test(data)) {
                return false;
            }

            equalSign = data.indexOf('=');

            return equalSign === -1 ||
                equalSign === length - 1 ||
                (equalSign === length - 2 && data[length - 1] === '=');
        },
        renderTextLayer: function (params) {
            PDFJS.renderTextLayer(params);
        }
    });

    extend(kendo.pdfviewer.pdfjs, {
        processor: PDFJSProcessor
    });
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

(function(f, define){
    define('pdfviewer/processors/dpl-processor',["../../kendo.core"], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "dpl-processor",
    name: "DPL-Processor",
    category: "framework",
    depends: [ "core" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        Class = kendo.Class;

    var DPLProcessor = Class.extend({
        init: function(options, viewer) {
            var that = this;

            that.options = options;
            that.read = options.read;
            that.upload = options.upload;
            that.download = options.download;

            that.viewer = viewer;
        },
        fetchDocument: function () {
            var that = this,
                deferred = $.Deferred(),
                errorMessages = that.viewer.options.messages.errorMessages;

            if (!that.read) {
                return deferred.resolve();
            }

            $.ajax({
                type: that.read.type,
                url: that.read.url,
                dataType: that.read.dataType,
                success: function (data) {
                    if (typeof data != "string") {
                        data = kendo.stringify(data);
                    }
                    deferred.resolve(JSON.parse(data));
                },
                error: function (xhr) {
                    that.viewer._triggerError({
                        error: xhr.responseText,
                        message: errorMessages.parseError
                    });
                }
            });

            return deferred;
        },
        fetchPageData: function (number) {
            var that = this;
            var deferred = $.Deferred();
            var page = that.viewer.document.pages[number - 1];
            var data = {};
            data[that.read.pageField] = number;

            if (!page.geometries.length) {
                $.ajax({
                    type: that.read.type,
                    url: that.read.url,
                    data: data,
                    success: function (data) {
                        deferred.resolve(JSON.parse(data));
                    },
                    error: function (xhr) {
                        that.viewer._triggerError({
                            error: xhr.responseText,
                            message: that.viewer.options.messages.errorMessages.parseError
                        });
                    }
                });
            } else {
                deferred.resolve(page);
            }

            return deferred;
        },
        downloadFile: function (fileName) {
            window.location = this.download.url + "?file=" + fileName;
        },

        fromJSON: function (json)
        {
            var viewer = this.viewer;
            viewer._clearPages();

            viewer.document = json;
            viewer.document.total = viewer.document.pages.length;

            viewer._renderPages();
            viewer.resize(true);

            viewer.activatePage(1);
        }
    });

    extend(kendo.pdfviewer, {
        dpl: {
            processor: DPLProcessor
        }
    });
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

(function(f, define){
    define('pdfviewer/pager',["../kendo.core"], f);
})(function(){

(function($, undefined) {
    var NS = ".kendoPDFViewer",
        Widget = kendo.ui.Widget,
        CHANGE = "change",
        KEYDOWN = "keydown",
        CLICK = kendo.support.click,
        SHRINKWIDTH = 480,
        kendoAttr = kendo.attr,
        extend = $.extend,
        DOT = ".",
        ARIA_DISABLED = "aria-disabled";

    var pagerStyles = {
        wrapperClass: "k-pager-wrap k-button-group",
        iconFirst: "k-i-arrow-end-left",
        iconLast: "k-i-arrow-end-right",
        iconPrev: "k-i-arrow-60-left",
        iconNext: "k-i-arrow-60-right",
        first: "k-pager-first",
        last: "k-pager-last",
        nav: "k-pager-nav",
        disabled: "k-disabled"
    };

    var Pager = Widget.extend({
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            that.linkTemplate = kendo.template(that.options.linkTemplate);

            that.element.addClass(pagerStyles.wrapperClass);

            that._renderLinks();
            that._toggleDisabledClass();
            that._attachEvents();
        },

        options: {
            linkTemplate: '<a href="\\#" aria-label="#=text#" title="#=text#" class="k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button k-pager-nav #= wrapClass #" data-page="#=pageIdx#"><span class="k-button-icon k-icon #= iconClass #"></span></a>',
            previousNext: true,
            input: true,
            page: 1,
            total: 1,
            messages: {}
        },

        events: [
            CHANGE
        ],

        _pagerLink: function (iconClass, text, pageIdx, wrapClass) {
            return this.linkTemplate({
                iconClass: iconClass,
                text: text,
                wrapClass: wrapClass || "",
                pageIdx: pageIdx
            });
        },

        _renderLinks: function ()
        {
            var that = this,
                options = that.options;

            if (options.previousNext) {
                that.firstLink = $(that._pagerLink(pagerStyles.iconFirst, options.messages.first, 1, pagerStyles.first));
                that.prevLink = $(that._pagerLink(pagerStyles.iconPrev, options.messages.previous, options.page - 1));
                that.nextLink = $(that._pagerLink(pagerStyles.iconNext, options.messages.next, options.page + 1));
                that.lastLink = $(that._pagerLink(pagerStyles.iconLast, options.messages.last, options.total, pagerStyles.last));
            }

            that.element.append(that.firstLink);
            that.element.append(that.prevLink);

            if (options.input) {
                that._renderInput();
            }

            that.element.append(that.nextLink);
            that.element.append(that.lastLink);

        },

        _toggleDisabledClass: function () {
            var that = this,
                options = that.options,
                total = !options.total;

            if (that.nextLink && that.prevLink) {
                that.prevLink.toggleClass(pagerStyles.disabled, total || options.page === 1);
                that.nextLink.toggleClass(pagerStyles.disabled, total || options.page === options.total);
                that.lastLink.toggleClass(pagerStyles.disabled, total || options.page === options.total);
                that.firstLink.toggleClass(pagerStyles.disabled,total || options.page === 1);

                that.prevLink.attr(ARIA_DISABLED, total || options.page === 1);
                that.firstLink.attr(ARIA_DISABLED, total || options.page === 1);

                that.nextLink.attr(ARIA_DISABLED, options.page === options.total);
                that.lastLink.attr(ARIA_DISABLED, options.page === options.total);
            }

            if (that.input) {
                that.input.toggleClass(pagerStyles.disabled, options.total <= 1);
                that.input.attr(ARIA_DISABLED, options.total <= 1);
            }
        },

        _attachEvents: function () {
            var that = this;

            that.element.on(CLICK + NS, DOT + pagerStyles.nav, that._click.bind(that));
            that.element.on(KEYDOWN + NS, DOT + pagerStyles.nav, function (e) {
                if (e.keyCode === kendo.keys.ENTER)
                {
                    that._click(e);
                    e.preventDefault();
                }
            });

            if (that.input) {
                that.input.on(KEYDOWN + NS, that._keydown.bind(that));
            }
        },

        _click: function (e) {
            var target = $(e.currentTarget);
            var page = parseInt(target.attr(kendoAttr("page")), 10);

            if (e.isDefaultPrevented()) {
                return;
            }

            this._change(page);
        },

        _keydown: function (e) {
            var key = e.keyCode,
                keys = kendo.keys,
                input = $(e.target),
                page = parseInt(input.val(), 10),
                upDown = key === keys.UP || key === keys.DOWN,
                allowedKeys = key === keys.RIGHT || key === keys.LEFT ||
                                key === keys.BACKSPACE || key === keys.DELETE,
                direction = upDown && key === keys.UP ? 1 : -1;

            if (upDown) {
                page += direction;
            }

            if (key === keys.ENTER || upDown) {
                if (isNaN(page) || page < 1 || page > this.options.total) {
                    page = this.options.page;
                    input.val(page);
                    return;
                }
                this._change(page);
                e.preventDefault();
            } else if (!e.key.match(/^\d+$/) && !allowedKeys) {
                e.preventDefault();
            }

        },

        _change: function (page) {
            var that = this;

            if (page >= 1 && page <= that.options.total) {
                that.options.page = page;
                if (that.input) {
                    that.input.val(page);
                }
                that.prevLink.attr(kendoAttr("page"), page - 1);
                that.nextLink.attr(kendoAttr("page"), page + 1);
                that._toggleDisabledClass();
            }

            that.trigger(CHANGE, { page: page});
        },

        setOptions: function (options) {
            var that = this,
                prevTotal = that.options.total;

            options = $.extend(that.options, options);

            Widget.fn.setOptions.call(that, options);

            if (options.input) {
                if (prevTotal != options.total) {
                    that._renderInput();
                    that.input
                            .on(KEYDOWN + NS, that._keydown.bind(that));
                }
                else {
                    that.input.val(options.total > 0 ? options.page : 1);
                }
            }

            if (options.total > 1) {
                that.prevLink.attr(kendoAttr("page"), options.page - 1);
                that.nextLink.attr(kendoAttr("page"), options.page + 1);
                that.lastLink.attr(kendoAttr("page"), options.total);
            }

            that._toggleDisabledClass();
        },

        _renderInput: function () {
            var that = this,
                totalMessage,
                options = that.options,
                shouldShrink = that.element.parent().width() <= SHRINKWIDTH,
                inputTemplate,
                pagerInputWrap = that.element.find(".k-pager-input");

            if (that.input) {
                that.input.off(NS);
            }

            totalMessage = options.total > 0 ? kendo.format(options.messages.of, options.total) : "";

            if (!shouldShrink) {
                totalMessage += options.total > 1 ? options.messages.pages : options.messages.page;
            }

            inputTemplate = '<span class="k-textbox k-input k-input-md k-rounded-md k-input-solid"><input class="k-input-inner" aria-label="' + options.page + totalMessage  +  '"></span>' + totalMessage;

            if (pagerInputWrap.length) {
                pagerInputWrap.html(inputTemplate);
            } else {
                that.element.append('<span class="k-pager-input k-label">' + inputTemplate +'</span>');
            }

            that.input = that.element
                                .find("input")
                                .val(options.total > 0 ? options.page : 1);
        },

        destroy: function() {
            this.element.off(NS);

            if (this.input) {
                this.input.off(NS);
            }
            Widget.fn.destroy.call(this);
        }
    });


    extend(kendo.pdfviewer, {
        Pager: Pager
    });
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
  define('pdfviewer/toolbar',["../kendo.toolbar", "../kendo.combobox", "./pager"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        ACTION = "action",
        KEYDOWN = "keydown",
        CLICK = kendo.support.click,
        CHANGE = "change",
        ZOOMIN = "zoomin",
        ZOOMOUT = "zoomout",
        Item = kendo.toolbar.Item,
        ToolBar = kendo.ui.ToolBar,
        PREDEFINED_ZOOM_VALUES = {
            auto: "auto",
            actual: "actual",
            fitToWidth: "fitToWidth",
            fitToPage: "fitToPage"
        },
        styles = {
            zoomOutIcon: "k-i-zoom-out",
            zoomInIcon: "k-i-zoom-in",
            zoomButtons: "k-button-flat k-button-flat-base",
            zoomOverflowButtons: "k-button-solid k-button-solid-base k-overflow-button",
            overflowHidden: "k-overflow-hidden"
        };

    var ZOOM_BUTTON_TEMPLATE = kendo.template('<a href="\\#" aria-label="#=text#" title="#=text#" data-command="#=command#" class="k-button k-button-md k-rounded-md # if(!showText) { # k-icon-button # } # #=className#">' +
            '<span class="k-button-icon k-icon #= iconClass #"></span> ' +
            '# if(showText) { #' +
                '<span class="k-button-text">#= text #</span> ' +
            '# } #' +
        '</a>');
    var ZOOM_COMBOBOX_TEMPLATE = kendo.template('<select title="#=zoomLevel#" aria-label="#=zoomLevel#">' +
        '#for(var zoomIndex in zoomLevels){#' +
            '# var zoomLevel = zoomLevels[zoomIndex]; #' +
            '<option value="#= zoomLevel.percent || (zoomLevel + "%") #">${zoomLevel.text ? zoomLevel.text : zoomLevel + "%"}</option>' +
        '#}#'  +
    '</select>');

    var DefaultTools = {
        pager: {
            type: "pager",
            overflow: "never",
            command: "PageChangeCommand"
        },
        spacer: { type: "spacer" },
        zoom: {
            type: "zoom",
            command: "ZoomCommand",
            zoomInOut: true,
            combobox: { zoomLevels: [50, 100, 150, 200, 300, 400] },
            enable: false,
            attributes: { "class": "k-button-group" }
        },
        toggleSelection: {
            type: "buttonGroup",
            attributes: { "class": "k-toggle-selection-group" },
            buttons: [
                {
                    togglable: true,
                    text: "Enable Selection",
                    command: "EnableSelectionCommand",
                    icon: "cursor",
                    showText: "overflow",
                    name: "toggleSelection",
                    group: "toggle-pan"
                }, {
                    togglable: true,
                    text: "Enable Panning",
                    command: "EnablePanCommand",
                    icon: "hand",
                    showText: "overflow",
                    name: "togglePan",
                    group: "toggle-pan",
                    selected: true
                }
            ]
        },
        spacer2: { type: "spacer" },
        search: {
            type: "button",
            text: "Search",
            command: "OpenSearchCommand",
            icon: "search",
            name: "search",
            showText: "overflow",
            enable: false
        },
        open: {
            type: "button",
            text: "Open",
            showText: "overflow",
            name: "open",
            icon: "folder-open",
            command: "OpenCommand"
        },
        download: {
            type: "button",
            text: "Download",
            showText: "overflow",
            name: "download",
            icon: "download",
            command: "DownloadCommand",
            enable: false
        },
        print: {
            type: "button",
            text: "Print",
            showText: "overflow",
            name: "print",
            icon: "print",
            command: "PrintCommand",
            enable: false
        }
    };

    var AllTools = extend({}, DefaultTools, {
        exportAs: { type: "button", text: "Export", showText: "overflow", name: "exportAs", icon: "image-export", command: "ExportCommand" }
    });

    var ToolbarPager = Item.extend({
        init: function(options, toolbar) {
            var pagerElement = $("<div />");

            this.options = extend(true, options, toolbar.options.pager);

            this.toolbar = toolbar;

            this.toolbar.pager = new kendo.pdfviewer.Pager(pagerElement, extend({}, options, {
                change: this._change.bind(this)
            }));

            this.element = pagerElement;
            this.element.on(KEYDOWN, this._keydown.bind(this));

            this.attributes();
            this.addUidAttr();
            this.addOverflowAttr();
        },
        _change: function (e) {
            if (this.options.change && this.options.change(e.page))
            {
                return;
            }

            this.toolbar.action({
                command: "PageChangeCommand",
                options: {
                    value: e.page
                }
            });
        },
        _keydown: function (e) {
            var that = this,
                target = $(e.target),
                keyCode = e.keyCode,
                children = that.element.find(":kendoFocusable"),
                targetIndex = children.index(target),
                direction = e.shiftKey ? -1 : 1,
                keys = kendo.keys;

            if (keyCode === keys.TAB && children[targetIndex + direction]) {
                children[targetIndex + direction].focus();
                e.preventDefault();
                e.stopPropagation();
            } else if (keyCode === keys.RIGHT && children[targetIndex + 1]) {
                children[targetIndex + 1].focus();
                e.preventDefault();
                e.stopPropagation();
            } else if (keyCode === keys.LEFT && children[targetIndex - 1]) {
                children[targetIndex - 1].focus();
                e.preventDefault();
                e.stopPropagation();
            }
        }
    });

    kendo.toolbar.registerComponent("pager", ToolbarPager);

    function appendZoomButtons (element, messages, isOverflow) {
        var className = isOverflow ? styles.zoomOverflowButtons : styles.zoomButtons;

        element.append(ZOOM_BUTTON_TEMPLATE({
            text: messages.zoomOut,
            command: ZOOMOUT,
            iconClass: styles.zoomOutIcon,
            showText: isOverflow,
            className: className
        }));
        element.append(ZOOM_BUTTON_TEMPLATE({
            text: messages.zoomIn,
            command: ZOOMIN,
            iconClass:  styles.zoomInIcon,
            showText: isOverflow,
            className: className
        }));
    }

    var ToolBarZoom = Item.extend({
        init: function(options, toolbar) {
            this._init(options, toolbar);
            this.toolbar.zoom = this;

            if (toolbar.options.scale)
            {
                this._initValue = toolbar.options.scale * 100 + "%";
            }

            this._appendElements();

            this._click = kendo.throttle(
                this._click.bind(this),
                200
            );
            this._keydown = kendo.throttle(
                this._keydown.bind(this),
                200
            );

            this.element.on(CLICK, ".k-button[data-command='zoomin'], .k-button[data-command='zoomout']", this._click);
            this.element.on(KEYDOWN, ".k-button[data-command='zoomin'], .k-button[data-command='zoomout']", this._keydown);

            this.attributes();
            this.addUidAttr();
            this.addOverflowAttr();
            this.enable(options.enable);
        },

        _init: function (options, toolbar) {
            var zoomElement = $("<div />");

            this.options = extend(true, options, {
                messages: toolbar.options.messages.zoom
            });

            this.toolbar = toolbar;
            this.element = zoomElement;
        },

        _appendElements: function () {
            var options = this.options;

            if (options.zoomInOut) {
                appendZoomButtons(this.element, options.messages, false);
            }

            if (options.combobox) {
                this._buildComboBox();
            }
        },

        _buildComboBox: function () {
            var that = this,
                combobox,
                messages = that.options.messages,
                comboOptions = that.options.combobox,
                zoomLevels = [{
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

            zoomLevels = zoomLevels.concat(comboOptions.zoomLevels);

            combobox = $(ZOOM_COMBOBOX_TEMPLATE({
                zoomLevels: zoomLevels,
                zoomLevel: messages.zoomLevel
            }));

            if (!kendo.support.mobileOS) {
                combobox = combobox.kendoComboBox(extend({
                    autoWidth: true,
                    clearButton: false,
                    value: that._initValue
                }, comboOptions)).getKendoComboBox();

                that.element.append(combobox.wrapper);
                that.combobox = combobox;
                that._currentValue = combobox.value();
            } else {
                that.element.append(combobox);
            }

            combobox.bind(CHANGE, kendo.throttle(that.change.bind(that), 300));
        },

        change: function (e) {
            var value = e.sender ? e.sender.value() : e.target.value,
                parsedValue;

            if (value.toString().match(/^[0-9]+%?$/)) {
                parsedValue = parseInt(value.replace('%', ''), 10) / 100;
            } else if (!PREDEFINED_ZOOM_VALUES[value]){
                if (this.combobox) {
                    this.combobox.value(this._currentValue);
                }
                e.preventDefault();
                return;
            }

            this._currentValue = value;
            this.toolbar.action({
                command: "ZoomCommand",
                options: {
                    scale: parsedValue || value
                }
            });
        },

        _buttonCommand: function (target) {
            var button = $(target).closest(".k-button"),
            command = button.data("command");

            this.toolbar.action({
                command: "ZoomCommand",
                options: {
                    zoomIn: command === ZOOMIN,
                    zoomOut: command === ZOOMOUT,
                    updateComboBox: true
                }
            });
        },

        _click: function (e) {
            this._buttonCommand(e.target);
        },

        _keydown: function (e) {
            var target = e.target,
                keyCode = e.keyCode,
                keys = kendo.keys,
                children = this.element.find(":kendoFocusable"),
                targetIndex = children.index($(target));

            if (keyCode === keys.ENTER) {
                this._buttonCommand(target);
                e.preventDefault();
            } else if (keyCode === keys.RIGHT && children[targetIndex + 1]) {
                children[targetIndex + 1].focus();
                e.preventDefault();
                e.stopPropagation();
            } else if (keyCode === keys.LEFT && children[targetIndex - 1]) {
                children[targetIndex - 1].focus();
                e.preventDefault();
                e.stopPropagation();
            }
        },

        enable: function (value) {
            var element = this.element;

            element.find(".k-button, select").toggleClass("k-disabled", !value);

            if (this.combobox) {
                this.combobox.enable(value);
            }
        },

        destroy: function(){
            if (this.combobox) {
                this.combobox.destroy();
            }
        }
    });

    var ToolBarOverflowZoom = ToolBarZoom.extend({
        _init: function (options, toolbar) {
            var zoomElement = $("<li></li>");

            this.options = extend(true, options, {
                messages: toolbar.options.messages.zoom
            });

            this.toolbar = toolbar;
            this.element = zoomElement;
        },
        _appendElements: function () {
            var options = this.options;
            if (options.zoomInOut) {
                appendZoomButtons(this.element, options.messages, true);
            }
        },
        overflowHidden: function() {
            this.element.addClass(styles.overflowHidden);
        }
    });

    kendo.toolbar.registerComponent("zoom", ToolBarZoom, ToolBarOverflowZoom);

    var ViewerToolBar = ToolBar.extend({
        init: function(element, options) {
            var that = this;
            var items = options.items && options.items.length ? options.items : Object.keys(DefaultTools);

            that.options = options;

            options.items = that._updateItems(items);

            ToolBar.fn.init.call(that, element, options);

            that.bind({
                click: that._click,
                toggle: that._click
            });

            options.viewer.bind({
                update: that._update.bind(that)
            });
        },
        events: [
            ACTION
        ],
        _updateItems: function (items) {
            var that = this;
            var messages = this.options.messages;

            return items.map(function (tool) {
                var isBuiltInTool =  $.isPlainObject(tool) && Object.keys(tool).length === 1 && tool.name;
                tool = isBuiltInTool ? tool.name : tool;
                var toolOptions = $.isPlainObject(tool) ? tool : AllTools[tool];
                var options;
                var toolName =  toolOptions.name;

                if (toolOptions.type === "buttonGroup") {
                    toolOptions.buttons = that._updateItems(toolOptions.buttons);
                } else if (toolOptions.type !== "pager") {
                    options = {
                        name: toolName,
                        attributes: {
                            "aria-label": messages[toolName],
                            "title": messages[toolName],
                            "data-command": toolOptions.command
                        },
                        overflow: toolOptions.overflow,
                        fillMode: "flat"
                    };
                } else {
                    options = {
                        overflow: "never"
                    };
                }

                if (toolOptions.text) {
                    options.text = messages[toolOptions.name] || toolOptions.text;
                }

                kendo.deepExtend(toolOptions, options);

                return toolOptions;
            });
        },
        _click: function (e)
        {
            var command = $(e.target).data("command");

            if (!command) {
                return;
            }

            this.action({
                command: command,
                options: e.options
            });
        },
        _update: function (e) {
            var pageOptions = {
                page: e.page || 1,
                total: e.total || 1
            };

            if (this.zoom) {
                this.zoom.enable(!e.isBlank);
                if (e.action === "zoom") {
                    this._updateZoomComboBox(e.zoom);
                }
            }

            if ((e.action === "pagechange" || e.isBlank) && this.pager) {
                this.pager.setOptions(pageOptions);
            }

            this.enable(this.wrapper.find(".k-toggle-selection-group"), !e.isBlank);

            this.enable(this.wrapper.find("[data-command='OpenSearchCommand']"), !e.isBlank);
            this.enable(this.wrapper.find("[data-command='DownloadCommand']"), !e.isBlank);
            this.enable(this.wrapper.find("[data-command='PrintCommand']"), !e.isBlank);
        },
        _updateZoomComboBox: function (value) {
            var isPredefined = value === PREDEFINED_ZOOM_VALUES.auto ||
                                value === PREDEFINED_ZOOM_VALUES.actual;

            if (!isPredefined) {
                value = Math.round(value * 100) + '%';
            }

            if (this.zoom && this.zoom.combobox) {
                this.zoom._currentValue = value;
                this.zoom.combobox.value(value);
            }
        },
        action: function (args)
        {
            this.trigger(ACTION, args);
        },
        destroy: function () {
            if (this.pager) {
                this.pager.destroy();
            }

            if (this.zoom) {
                this.zoom.destroy();
            }
            ToolBar.fn.destroy.call(this);
        }
    });


    extend(kendo.pdfviewer, {
        Toolbar: ViewerToolBar,
        DefaultTools: DefaultTools
    });
})(window.kendo.jQuery);

return window.kendo;
}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('pdfviewer/page',["../kendo.drawing"], f);
})(function(){

(function($, undefined) {
    var extend = $.extend,
        noop = $.noop,
        drawing = kendo.drawing,
        Group = drawing.Group,
        Surface = drawing.Surface,
        RENDER = "render",
        Class = kendo.Class;

    var geometryTypes = {
        Path: "path",
        MultiPath: "multipath",
        Rect: "rect",
        Image: "image",
        Text: "text"
    };

    var Page = Class.extend({
        init: function (options, viewer) {
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
        resize: function (ratio) {
            var pageElement = this.element;

            this._updatePageSize({
                width: Math.min(pageElement.width() * ratio, this.width),
                height: Math.min(pageElement.height() * ratio, this.height)
            });
        },
        _updatePageSize: function (size) {
            this.element
                    .width(size.width)
                    .height(size.height);
        },
        destroy: function () {
            kendo.destroy(this.element);
        },
        render: noop
    });

    var DPLPage = Page.extend({
        draw: function () {
            var that = this,
                geometries = that.options.geometries;

            that.group = new Group();
            that.surface.draw(that.group);

            that._drawGeometries(geometries);

            that.viewer.trigger(RENDER, { page: this });
            kendo.ui.progress(that.element, false);
        },
        load: function () {
            var that = this;

            if (that.loaded || !that.processor)
            {
                return;
            }

            that.processor.fetchPageData(that.pageNumber).then(function (data) {
                that.options = data;
                that._initSurface();
                that.draw();
            });

            that.loaded = true;
        },
        _initSurface: function () {
            var size = {
                width: this.element.width(),
                height: this.element.height()
            };
            var surfaceOptions = extend({ width: this.width, height: this.height }, this.viewer.options.view);
            this.surface = new Surface(this.element, surfaceOptions);
            this._updatePageSize(size);
        },
        _drawGeometries: function (geometries) {
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
        _drawRect: function (geometry)
        {
            var rectGeo = new kendo.geometry.Rect(geometry.point, geometry.size);

            return new drawing.Rect(rectGeo, {
                transform: this._getMatrix(geometry.transform),
                fill: geometry.fillOptions,
                stroke: geometry.strokeOptions
            });
        },

        _drawImage: function (geometry)
        {
            var imageRect =  new kendo.geometry.Rect(geometry.point, geometry.size);
            return new drawing.Image(geometry.src, imageRect,  {
                transform: this._getMatrix(geometry.transform)
            });
        },

        _drawText: function (geometry)
        {
            var options = {
                transform: this._getMatrix(geometry.transform),
                stroke: geometry.strokeOptions,
                fill: geometry.fillOptions,
                font: geometry.font
            };
            return new kendo.drawing.Text(geometry.content, geometry.point, options);
        },

        _drawPath: function (geometry)
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

        _getMatrix: function (transform) {
            var matrix = Object.create(kendo.geometry.Matrix.prototype);
            kendo.geometry.Matrix.apply(matrix, transform);
            return matrix;
        }
    });

    var PDFJSPage = Page.extend({
        init: function(options, viewer) {
            var that = this,
                canvas;

            canvas = $("<canvas style='width: 100%; height: 100%;' />");
            that.canvas = canvas.get(0);

            Page.fn.init.call(that, options, viewer);

            that.canvas.width = that.width;
            that.canvas.height = that.height;
            that.element.append(canvas);
        },
        load: function (defaultScale, force) {
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
                that.processor.fetchPageData(that.pageNumber).then(function (page) {
                    that._page = page;
                    that._renderPromise = that.render(defaultScale).then(function () {
                        that.viewer.trigger(RENDER, { page: that });
                    });
                    promise.resolve(that);
                });
            }

            that._scale = defaultScale;
            that.loaded = true;
            return promise;
        },
        render: function (scale) {
            var that = this;
            var context = this.canvas.getContext('2d'),
                viewport = this._page.getViewport({
                    scale: scale
                });

            this._scale = scale;
            this.canvas.width = viewport.width;
            this.canvas.height = viewport.height;

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

            return this._renderTask.promise.then(function () {
                that._renderTask = null;

            }).catch(function () {}); // jshint ignore:line
        },
        _renderTextLayer: function (viewport) {
            var that = this;
            var page = that._page;

            if(that.textLayer) {
                that.textLayer.remove();
             }

            that.textLayer = $("<div class='k-text-layer'></div>").get(0);
            that.element.append(that.textLayer);

            page.getTextContent({
                normalizeWhitespace: true
            }).then(function(textContent){
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
            });
        }
    });

    extend(kendo.pdfviewer.dpl, {
        geometryTypes: geometryTypes,
        Page: DPLPage
    });
    extend(kendo.pdfviewer.pdfjs, {
        Page: PDFJSPage
    });
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('pdfviewer/search',["../kendo.core"], f);
})(function(){

(function($, undefined) {
    var Class = kendo.Class,
        extend = $.extend,
        isArray = Array.isArray;

    var SearchDOM = Class.extend({
        init: function(options) {
            var that = this;

            that.options = extend({}, that.options, options);

            that.processDom();
        },

        options: {
            highlightClass: "k-search-highlight",
            charClass: "k-text-char"
        },

        processDom: function () {
            var that = this;

            that.targets = isArray(that.options.target) ? that.options.target : [that.options.target];
            that.textNodes = [];
            that.charIndex = 0;
            that.text = "";

            that.targets.forEach(function (target) {
                that.traverseToTextNode(target);
            });

            for (var i = 0; i < that.textNodes.length; i++) {
                that.processTextNode(that.textNodes[i]);
            }
        },

        traverseToTextNode: function (node) {
            var that = this;

            if(node.nodeType === 3) {
                that.textNodes.push(node);
            } else {
                for (var i = 0; i < node.childNodes.length; i++) {
                    that.traverseToTextNode(node.childNodes[i]);
                }
            }
        },

        processTextNode: function (node) {
            var that = this;
            var text = node.textContent;
            var span;

            that.text = that.text + text;

            if(text.length > 0){
                span = $(node).wrap("<span>").parent();
                span.empty();
                that.splitChars(span.get(0), text);
                span.children().unwrap();
            }
        },

        splitChars: function (span, text) {
            var that = this;
            var newHtml = "";

            for (var i = 0; i < text.length; i++) {
                newHtml = newHtml + "<span class='"+ that.options.charClass + "' " + kendo.attr("char-index") + "=" + that.charIndex + ">" + text[i] + "</span>";
                that.charIndex++;
            }

            span.innerHTML = newHtml;
        },

        search: function (value, matchCase) {
            var that = this;
            var expression = new RegExp(value, !matchCase ? "gi" : "g");
            var match;

            that.matches = [];

            that.resetMark();
            that.resetHighlight();
            that.resetMatchIndex();

            if(value === "") {
                return;
            }

            match = expression.exec(that.text);

            while(match){
                that.matches.push({
                    startOffset: match.index,
                    endOffset: match.index + match[0].length
                });

                match = expression.exec(that.text);
            }

            that.highlightAll();
            that.mark();
        },

        highlightAll: function () {
            var that = this;

            that.matches.forEach(function (match, index) {
                var start = match.startOffset;
                var end = match.endOffset;

                that.highlight(start, end, index + 1);
            });
        },

        highlight: function (start, end, matchIndex) {
            var that = this;

            for (var i = start; i < end; i++) {
                $(that.targets)
                    .find("." + that.options.charClass + "[" + kendo.attr("char-index")  + "=" + i + "]")
                    .addClass(that.options.highlightClass)
                    .attr(kendo.attr("match-index"), matchIndex);
            }
        },

        resetHighlight: function () {
            var that = this;

            $(that.targets)
                .find("." + that.options.highlightClass)
                .removeClass(that.options.highlightClass);
        },

        resetMatchIndex: function () {
            var that = this;

            $(that.targets)
                .find("." + that.options.charClass + "[" + kendo.attr("match-index")  + "]")
                .removeAttr(kendo.attr("match-index"));
        },

        mark: function () {
            var that = this;

            if(!that.currentIndex && that.currentIndex !== 0) {
                that.currentIndex = 0;
            } else if (that.currentIndex > that.matches.length) {
                that.currentIndex = that.matches.length;
            } else {
                that.resetMark();
            }

            $(that.targets)
                .find("." + that.options.charClass + "[" + kendo.attr("match-index")  + "=" + that.currentIndex + "]")
                .wrapInner("<mark>");
        },

        resetMark: function () {
            var that = this;
            $(that.targets).find("mark").contents().unwrap();
        },

        nextMatch: function () {
            var that = this;

            that.currentIndex++;

            if(that.currentIndex > that.matches.length) {
                that.currentIndex = 1;
            }

            that.mark();
        },

        previousMatch: function () {
            var that = this;

            that.currentIndex--;

            if(that.currentIndex < 1) {
                that.currentIndex = that.matches.length;
            }

            that.mark();
        },

        getMarkedIndex: function () {
            return this.matches.length ? this.currentIndex : 0;
        },

        getFirstMarked: function () {
            return $(this.targets).find("mark").eq(0);
        },

        destroy: function () {
            var that = this;

            that.resetMark();
            $(that.targets).children("span:not(." + that.options.charClass + ")").each(function(i, item){
                $(item).text($(item).text());
            });
        }
    });

    extend(kendo.pdfviewer, {
        SearchDOM: SearchDOM
    });
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
  define('pdfviewer/dialogs',["../kendo.dialog", "../kendo.window", "../kendo.binder", "../kendo.numerictextbox", "../kendo.dropdownlist"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        Class = kendo.Class,
        EXTENSIONS = {
            svg: ".svg",
            png: ".png"
        },
        keys = kendo.keys;

    var ErrorDialog = Class.extend({
        init: function (options) {
            this.options = extend(options, {
                actions: [{
                    text: options.messages.dialogs.okText
                }]
            });
            this._dialog = $("<div />")
                    .kendoDialog(this.options)
                    .getKendoDialog();
        },
        open: function () {
            this._dialog.center().open();
        }
    });

    var ExportAsDialog = Class.extend({
        init: function (options) {
            this.options = extend(options, this.options, {
                fileFormats: [{
                    description: options.messages.dialogs.exportAsDialog.png,
                    extension: EXTENSIONS.png
                }, {
                    description: options.messages.dialogs.exportAsDialog.svg,
                    extension: EXTENSIONS.svg
                }],
                title: options.messages.dialogs.exportAsDialog.title,
                open: function() {
                    this.center();
                }
            });
            this._initializeDialog();
            return this;
        },
        options: {
            extension: EXTENSIONS.png,
            autoFocus: true,
            resizable: false,
            modal: {
                preventScroll: true
            },
            width: "90%",
            maxWidth: 520,
            template:
                "<div class='k-edit-label'><label>#: messages.exportAsDialog.labels.fileName #:</label></div>" +
                "<div class='k-edit-field'>" +
                    "<span class='k-textbox k-input k-input-md k-rounded-md k-input-solid'><input class='k-input-inner' data-bind='value: name' /></span>" +
                "</div>" +
                "<div>" +
                    "<div class='k-edit-label'><label>#: messages.exportAsDialog.labels.saveAsType #:</label></div>" +
                    "<div class='k-edit-field'>" +
                    "<select data-role='dropdownlist' class='k-file-format' " +
                        "data-text-field='description' " +
                        "data-value-field='extension' " +
                        "data-bind='value: extension, source: fileFormats'></select>" +
                    "</div>" +
                "</div>" +
                "<div class='k-edit-label'><label>#: messages.exportAsDialog.labels.page #:</label></div>" +
                "<div class='k-edit-field'>" +
                    "<input data-role='numerictextbox' data-format='n0' data-min='1' data-max='#: total #' data-bind='value: page' />" +
                "</div>" +
                "<div class='k-action-buttons'>" +
                    "<button class='k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary' data-bind='click: apply'><span class='k-button-text'>#: messages.save #</span></button>" +
                    "<button class='k-button k-button-md k-rounded-md k-button-solid k-button-solid-base' data-bind='click: close'><span class='k-button-text'>#: messages.cancel #</span></button>" +
                "</div>"
        },
        _updateModel: function (options) {
            if (options.pagesCount) {
                this.viewModel.set("pagesCount", options.pagesCount);
            }
            if (options.page) {
                this.viewModel.set("page", options.page);
            }
        },
        _initializeDialog: function () {
            var that = this;
            var options = that.options;
            var dialogMessages = options.messages.dialogs;
            var dialog = $("<div class='k-pdf-viewer-window k-action-window k-popup-edit-form' />")
                    .append(kendo.template(options.template)({
                        total: options.pagesCount,
                        messages: dialogMessages
                    }))
                    .kendoWindow(options)
                    .getKendoWindow();

            that.viewModel = kendo.observable({
                title: dialogMessages.exportAsDialog.title,
                name: dialogMessages.exportAsDialog.defaultFileName,
                extension: options.extension,
                fileFormats: options.fileFormats,
                pagesCount: options.pagesCount,
                page: 1,
                apply: that.apply.bind(this),
                close: function () {
                    dialog.close();
                }
            });

            that._dialog = dialog;

            kendo.bind(dialog.element, that.viewModel);
            return dialog;
        },
        open: function() {
            this._dialog.center().open();
        },
        apply: function() {
            this._dialog.close();
            this.options.apply({
                fileName: this.viewModel.name + this.viewModel.extension,
                extension: this.viewModel.extension,
                page: this.viewModel.page
            });
        }
    });

    var SearchDialog = Class.extend({
        init: function (options) {
            var that = this;
            that.options = extend({}, options, that.options);
        },
        options: {
            resizable: false,
            template: "<div class='k-search-container'>" +
                          "<button class='k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button k-search-dialog-draghandle'><span class='k-button-icon k-icon k-i-handler-drag'></span></button>" +
                          "<span class='k-textbox k-input k-input-md k-rounded-md k-input-solid'>" +
                              "<input class='k-search-dialog-input k-input-inner' data-bind='value: boundValue, events: { keyup: onKeyup, input: onInput }' aria-label='#: messages.inputLabel #' title='#: messages.inputLabel #' />" +
                              "<span class='k-input-suffix'><button class='k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button k-match-case-button k-match-case-button' data-bind='css: {k-selected: matchCase}, click: matchCaseClick' aria-label='#: messages.matchCase #' title='#: messages.matchCase #'><span class='k-icon k-i-convert-lowercase'></span></button></span>" +
                          "</span>" +
                          "<span class='k-search-matches'><span data-bind='text: matchIndex'></span> #: messages.of # <span data-bind='text: matches'></span></span>" +
                          "<button class='k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button' data-bind='click: prev' aria-label='#: messages.previous #' title='#: messages.previous #'><span class='k-button-icon k-icon k-i-arrow-up'></span></button>" +
                          "<button class='k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button' data-bind='click: next' aria-label='#: messages.next #' title='#: messages.next #'><span class='k-button-icon k-icon k-i-arrow-down'></span></button>" +
                          "<button class='k-button k-button-md k-rounded-md k-button-flat k-button-flat-base k-icon-button' data-bind='click: close' aria-label='#: messages.close #' title='#: messages.close #'><span class='k-button-icon k-icon k-i-close'></<span></button>" +
                      "</div>"
        },
        open: function () {
            var that = this;

            if(!that.dialog) {
                that._initializeDialog();
            }

            that.dialog.open();
        },
        _initializeDialog: function () {
            var that = this;
            var template = kendo.template(that.options.template);
            var dialogElm = $("<div class='k-pdf-viewer-search-dialog'></div>").append(template({
                messages: that.options.messages
            }));
            var dialogOffset = {
                top: that.options.position.top + 16,
                left: that.options.position.left + 16
            };

            that.dialog = new kendo.ui.Window(dialogElm, extend({}, that.options, {
                autoFocus: false,
                title: false,
                position: { top: dialogOffset.top, left: dialogOffset.left },
                minHeight: 30,
                draggable: {
                    dragHandle: ".k-search-dialog-draghandle"
                },
                activate: function (ev) {
                    ev.sender.element.find(".k-search-dialog-input").trigger("focus");
                }
            }));

            that.searchModel = kendo.observable({
                boundValue: "",
                searchText: "",
                matchCase: false,
                matchIndex: 0,
                matches: 0,
                matchCaseClick: function () {
                    this.set("matchCase", !this.matchCase);
                },
                next: that.options.next,
                prev: that.options.prev,
                close: function () {
                    this.set("boundValue", "");
                    that.dialog.close();
                },
                onKeyup: function (ev) {
                    var key = ev.keyCode;
                    var navigationFn = ev.shiftKey ? this.prev : this.next;

                    if(key === keys.ENTER) {
                        navigationFn();
                        ev.preventDefault();
                    }
                },
                onInput: function (ev) {
                    this.set("searchText", ev.target.value);
                }
            });

            kendo.bind(that.dialog.element, that.searchModel);
        }
    });

    extend(kendo.pdfviewer, {
        dialogs: {
            ErrorDialog: ErrorDialog,
            ExportAsDialog: ExportAsDialog,
            SearchDialog: SearchDialog
        }
    });
})(window.kendo.jQuery);

return window.kendo;
}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
  define('pdfviewer/commands',["../kendo.upload"], f);
})(function(){

(function($, undefined) {
    var kendo = window.kendo,
        extend = $.extend,
        parseJSON = JSON.parse,
        progress = kendo.ui.progress,
        Class = kendo.Class,
        OPEN = "open",
        ZOOMSTART = "zoomStart",
        ZOOMEND = "zoomEnd";

    var Command = Class.extend({
        init: function(options) {
            this.options = options;
            this.viewer = options.viewer;
            this.errorMessages = this.viewer.options.messages.errorMessages;
        }
    });

    var OpenCommand = Command.extend({
        init: function(options) {
            Command.fn.init.call(this, options);
            this.upload = this.viewer.processor.upload;
        },
        exec: function () {
            (this.viewer._upload || this._initUpload()).element.click();
        },
        _initUpload: function () {
            var uploadOptions = {
                select: this._onSelect.bind(this),
                success: this._onSuccess.bind(this),
                error: this._onError.bind(this),
                complete: this._onComplete.bind(this),
                showFileList: false,
                multiple: false,
                validation: {
                    allowedExtensions: [".pdf"]
                }
            };

            if (this.upload) {
                extend(uploadOptions, {
                    async: {
                        saveUrl:  this.upload.url,
                        autoUpload: true,
                        saveField: this.upload.saveField
                    }
                });
            }

            var upload = $('<input name="files" accept=".pdf" type="file" />').kendoUpload(uploadOptions).getKendoUpload();
            this.viewer._upload = upload;

            return upload;
        },
        _onComplete: function () {
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
        _onSelect: function (e) {
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
            reader.onerror = function () {
                that.viewer._triggerError({
                    error: fileToUpload,
                    message: that.errorMessages.parseError
                });
            };

            reader.readAsArrayBuffer(fileToUpload.rawFile);
        }
    });

    var PageChangeCommand = Command.extend({
        exec: function () {
            var pageNumber = this.options.value;

            this.viewer.activatePage(pageNumber);
        }
    });

    var DownloadCommand = Command.extend({
        exec: function () {
            if (!this.viewer.document) {
                this.viewer._triggerError({
                    message: this.errorMessages.notFound
                });
                return;
            }

            var fileName = (this.viewer.document.info && this.viewer.document.info.title) ||
                            this.viewer.options.messages.defaultFileName;

            this.viewer.processor.downloadFile(fileName);
        }
    });

    var ExportCommand = Command.extend({
        init: function(options) {
            options = $.extend(options, this.options);
            Command.fn.init.call(this, options);
        },
        exec: function() {
            var dialog = (this.viewer._saveDialog || this._initDialog());

            dialog._updateModel({
                pagesCount: (this.viewer.document && this.viewer.document.total) || 1,
                page: this.viewer.options.page
            });

            dialog.open();
        },
        apply: function (viewModel) {
            var extension = viewModel.extension;

            if (extension === ".png") {
                this.viewer.exportImage(viewModel);
            } else if (extension === ".svg") {
                this.viewer.exportSVG(viewModel);
            }
        },
        _initDialog: function () {
            this.viewer._saveDialog = new kendo.pdfviewer.dialogs.ExportAsDialog({
                apply: this.apply.bind(this),
                pagesCount: (this.viewer.document && this.viewer.document.total) || 1,
                messages: this.viewer.options.messages
            });
            return this.viewer._saveDialog;
        }
    });

    var EnableSelectionCommand = Command.extend({
        exec: function () {
            var that = this,
                viewer = that.viewer;

                viewer._toggleSelection(true);
        }
    });

    var EnablePanCommand = Command.extend({
        exec: function () {
            var that = this,
                viewer = that.viewer;

                viewer._toggleSelection(false);
        }
    });

    var OpenSearchCommand = Command.extend({
        init: function(options) {
            var that = this;

            that.viewer = options.viewer;

            if(!that.viewer.searchDialog) {
                that.viewer.searchDialog = new kendo.pdfviewer.dialogs.SearchDialog({
                    position: {
                        top: that.viewer.pageContainer.offset().top,
                        left: that.viewer.pageContainer.offset().left
                    },
                    messages: that.viewer.options.messages.dialogs.search,
                    open: that._open.bind(that),
                    next: that._next.bind(that),
                    prev: that._prev.bind(that),
                    close: that._close.bind(that)
                });
            }

            Command.fn.init.call(that, options);
        },
        exec: function () {
            var that = this;

            that.viewer.searchDialog.open();
        },
        _open: function () {
            var that = this;

            that.changeHandler = that._change.bind(that);
            that.zoomStartHandler = that._closeDialog.bind(that);
            that.openFileHandler = that._closeDialog.bind(that);

            if(!that.viewer._searchDOM) {
                that.viewer._initSearchDOM();
                that.viewer.searchDialog.searchModel.bind("change", that.changeHandler);
                that.viewer.bind("zoomStart", that.zoomStartHandler);
                that.viewer.bind("open", that.openFileHandler);
            }
        },
        _close: function () {
            var that = this;
            var searchEngine = that.viewer._searchDOM;

            that.viewer.searchDialog.searchModel.unbind("change", that.changeHandler);
            that.viewer.unbind("zoomStart", that.zoomStartHandler);
            that.viewer.unbind("open", that.openFileHandler);
            searchEngine.destroy();
            delete that.viewer._searchDOM;
            that._updateSearchModel();
        },
        _change: function (ev) {
            var that = this;
            var searchEngine = that.viewer._searchDOM;
            var field = ev.field;
            var model = that.viewer.searchDialog.searchModel;
            var value = model[field];

            if(!searchEngine) {
                return;
            }

            switch (field) {
                case "searchText":
                    searchEngine.search(value, model.matchCase);
                    that._updateSearchModel();
                    break;
                case "matchCase":
                    searchEngine.search(model.searchText, value);
                    that._updateSearchModel();
                    break;
                default:
                    break;
            }
        },
        _next: function () {
            var that = this;
            var searchEngine = that.viewer._searchDOM;

            if (searchEngine.matches && searchEngine.matches.length) {
                searchEngine.nextMatch();
                that._updateSearchModel();
            }
        },
        _prev: function () {
            var that = this;
            var searchEngine = that.viewer._searchDOM;

            if (searchEngine.matches && searchEngine.matches.length) {
                searchEngine.previousMatch();
                that._updateSearchModel();
            }
        },
        _updateSearchModel: function () {
            var that = this;
            var searchEngine = that.viewer._searchDOM;
            var model = that.viewer.searchDialog.searchModel;

            if(searchEngine) {
                model.set("matches", searchEngine.matches.length);
                model.set("matchIndex", searchEngine.getMarkedIndex());
                that._scrollToMark();
            } else {
                model.set("searchText", "");
                model.set("matches", 0);
                model.set("matchIndex", 0);
                model.set("matchCase", false);
            }
        },
        _scrollToMark: function () {
            var that = this;
            var searchEngine = that.viewer._searchDOM;
            var marked = searchEngine.getFirstMarked();
            var scroller = that.viewer._scroller;
            var position;

            if(!marked.length) {
                return;
            }

            position = marked.offset().top - scroller.scrollElement.offset().top - 100;

            scroller.scrollTo(scroller.scrollLeft, position * -1);
        },
        _closeDialog: function () {
            var that = this;
            that.viewer.searchDialog.dialog.close();
        }
    });

    var ZoomCommand = Command.extend({
        exec: function () {
            var that = this,
                options = that.options,
                viewer = that.viewer,
                scale = options.scale,
                loadedPagesHeight = 0,
                page = that.viewer._pageNum,
                containerHeight = viewer.pageContainer[0].clientHeight,
                updatedVisiblePagesCount = 1,
                renderTasks = [];

            if(viewer.processingLib === "dpl") {
                return;
            }

            scale = that._calculateZoom();

            var updateViewer = function () {
                var scroller = that.viewer._scroller,
                    scrollingStarted = viewer._scrollingStarted;

                if (scroller && scroller.scrollTop > scroller.scrollHeight()) {
                    scroller._resize();
                }

                if (!scrollingStarted)
                {
                    viewer.activatePage(page);
                    viewer._scrollingStarted = false;
                }
            };

            if (!scale) {
                return;
            }

            viewer.zoomScale = scale;
            viewer._scrollingStarted = false;

            if (viewer.pages) {
                viewer.pages.forEach(function (page) {
                    var pageHeight;

                    if (viewer._visiblePages.indexOf(page) !== -1 && page.loaded) {
                        renderTasks.push(page.render(scale));

                        pageHeight = page._page.getViewport({
                            scale: scale
                        }).height;
                    }
                    else {
                        page.resize(scale);
                        pageHeight = page.element.height();
                    }

                    loadedPagesHeight += pageHeight;

                    if (loadedPagesHeight <= containerHeight) {
                        updatedVisiblePagesCount++;
                    }
                });


                if (viewer._visiblePagesCount != updatedVisiblePagesCount) {

                    viewer._visiblePagesCount = updatedVisiblePagesCount;
                    viewer._loadVisiblePages();
                }
            }

            Promise.all(renderTasks).then(function () {
                updateViewer();
                that._triggerZoomEnd(scale);
            }).catch(function () { // jshint ignore:line
                updateViewer();
                that._triggerZoomEnd(scale);
            });
        },

        _calculateZoom: function () {
            var options = this.options,
                viewer = this.viewer,
                viewerOptions = viewer.options,
                pageContainer = viewer.pageContainer,
                visibleCanvas = viewer._visiblePages && viewer._visiblePages[0].canvas,
                scale = options.scale,
                scaleValue = scale,
                preventZoom;

            viewer._allowResize = false;
            viewer._autoFit = false;

            if (options.zoomIn) {
                scaleValue = scale = viewer.zoomScale + viewerOptions.zoomRate;
            } else if (options.zoomOut) {
                scaleValue = scale = viewer.zoomScale - viewerOptions.zoomRate;
            } else if (scale === "auto") {
                viewer._allowResize = true;
                scaleValue = viewer._autoZoomScale;
            } else if (scale === "actual") {
                scaleValue = 1;
            } else if (scale === "fitToWidth") {
                viewer._allowResize = true;
                viewer._autoFit = "fitToWidth";
                scaleValue = (pageContainer.width() / (visibleCanvas.width / viewer.zoomScale));
            } else if (scale === "fitToPage") {
                viewer._allowResize = true;
                viewer._autoFit = "fitToPage";
                scaleValue = (pageContainer.height() / (visibleCanvas.height / viewer.zoomScale));
            }

            preventZoom = scale < viewerOptions.zoomMin || scale > viewerOptions.zoomMax;

            if (preventZoom || viewer.trigger(ZOOMSTART, { scale: scale})) {
                return;
            }

            if (options.updateComboBox && viewer.toolbar)
            {
                viewer.toolbar._updateZoomComboBox(scale);
            }

            return scaleValue;
        },

        _triggerZoomEnd: function (scale) {
            var that = this,
                viewer = that.viewer;

            viewer.trigger(ZOOMEND, { scale: scale });
        }
    });

    var PrintCommand = Command.extend({
        init: function (options){
            Command.fn.init.call(this, options);
        },
        exec: function () {
            var that = this;

             if (!that.viewer.document) {
                that.viewer._triggerError({
                    message: this.errorMessages.notFound
                });
                return;
            }

            progress(that.viewer.pageContainer, true);
            that._renderPrintContainer();
            that._loadAllPages().then(that.processAfterRender.bind(that));
        },
        _renderPrintContainer: function () {
            this.printContainer = $("<div></div>");
        },
        _loadAllPages: function () {
            var that = this;
            var pages = that.viewer.pages;
            var loadPromises = [];
            var renderPromises = [];
            var promise = $.Deferred();

            that._originalScale = that.viewer.zoom();

            function getRenderPromise (page) {
                renderPromises.push(page._renderPromise);
            }

            for (var i = 0; i < pages.length; i++) {
                loadPromises.push(pages[i].load(3, true).then(getRenderPromise));
            }

            Promise.all(loadPromises).then(function(){
                promise.resolve(renderPromises);
            });

            return promise;
        },
        processAfterRender: function(renderPromises){
            var that = this;

            Promise.all(renderPromises).then(function(){
                that._renderPrintPages();
                setTimeout(function () {
                    that._printDocument();
                    that.viewer.zoom(that._originalScale);
                    progress(that.viewer.pageContainer, false);
                    delete that._originalScale;
                }, 0);
            });
        },
        _renderPrintPages: function () {
            var pages = this.viewer.pages;

            for (var i = 0; i < pages.length; i++) {
                this._renderPrintImage(pages[i]);
            }
         },
        _renderPrintImage: function (page) {
            var canvas = page.canvas;
            var div = $("<div></div>");

            var img = "<img src='" + canvas.toDataURL() + "' width='" + page.width + "px' height='" + page.height + "px' />";

            div.append(img);

            this.printContainer.append(div);
        },
        _printDocument: function () {
            var that = this;
            var pages = that.viewer.pages;
            var width = pages[0].width;
            var height = pages[0].height;
            var myWindow = window.open('','','innerWidth=' + width + ',innerHeight=' + height + 'location=no,titlebar=no,toolbar=no');
            var browser = kendo.support.browser;

            if(!myWindow) {
                that.viewer._triggerError({
                    message: that.errorMessages.popupBlocked
                });
                return;
            }

            myWindow.document.write(that.printContainer.html());
            myWindow.document.close();
            myWindow.focus();
            myWindow.print();

            if (!browser.chrome || browser.chromiumEdge) {
                myWindow.close();
            } else {
                $(myWindow.document).find("body").on("mousemove", function(){
                    myWindow.close();
                });
            }
        }
    });

    extend(kendo.pdfviewer, {
        OpenCommand: OpenCommand,
        PageChangeCommand: PageChangeCommand,
        DownloadCommand: DownloadCommand,
        EnableSelectionCommand: EnableSelectionCommand,
        EnablePanCommand: EnablePanCommand,
        ExportCommand: ExportCommand,
        PrintCommand: PrintCommand,
        OpenSearchCommand: OpenSearchCommand,
        ZoomCommand: ZoomCommand
    });

})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
(function(f, define){
    define('kendo.pdfviewer',[
        "./kendo.mobile.scroller",
        "./pdfviewer/processors/pdfjs-processor",
        "./pdfviewer/processors/dpl-processor",
        "./pdfviewer/toolbar",
        "./pdfviewer/page",
        "./pdfviewer/search",
        "./pdfviewer/dialogs",
        "./pdfviewer/commands"
    ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "pdfviewer",
    name: "PDFViewer",
    category: "web",
    description: "PDFViewer to display pdfs in the browser",
    depends: ["core", "window", "dialog", "toolbar", "mobile.scroller", "upload", "combobox", "drawing", "binder", "dropdownlist", "numerictextbox"]
};

(function($, undefined) {
    var NS = ".kendoPDFViewer",
        kendo = window.kendo,
        ui = kendo.ui,
        extend = $.extend,
        drawing = kendo.drawing,
        keys = $.extend({PLUS: 187, MINUS: 189, ZERO: 48, NUMPAD_ZERO: 96 }, kendo.keys),
        Page,
        Widget = ui.Widget,
        progress = kendo.ui.progress,
        SCROLL = "scroll",
        RENDER = "render",
        OPEN = "open",
        ERROR = "error",
        FOCUS = "focus" + NS,
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
        };

    var PDFViewer = Widget.extend({
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, kendo.deepExtend({}, this.options, options));

            that._wrapper();

            if (that.options.toolbar) {
                that._renderToolbar();
            }

            that._initProcessor(options || {});
            that._renderPageContainer();
            that._loadDocument();

            that._tabindex();
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
                    pager:  {
                        first: "Go to the first page",
                        previous: "Go to the previous page",
                        next: "Go to the next page",
                        last: "Go to the last page",
                        of: " of {0} ",
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
                        of: "of"
                    }
                }
            }
        },

        _wrapper: function () {
            var that = this,
                options = that.options;

            that.wrapper = that.element;

            that.wrapper
                    .width(options.width)
                    .height(options.height)
                    .addClass(styles.viewer)
                    .on(FOCUS, that._focus.bind(that))
                    .on(KEYDOWN, that._keydown.bind(that));

            that._allowResize = that.options.scale === null;
            that._autoZoomScale = ZOOM_SCALE;
            that.zoomScale = that.options.scale || that._autoZoomScale;

            that._resizeHandler = kendo.onResize(function() {
                that.resize();
            });

            that._pageNum = that.options.page;
        },

        _focus: function (e) {
            if (this.toolbar) {
                this.toolbar.wrapper.trigger("focus");
            } else {
                this.pageContainer.trigger("focus");
            }
            e.preventDefault();
        },

        _keydown: function (e) {
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
                args.options.scale = ZOOM_SCALE;
                shouldExecute = true;
            }

            if (shouldExecute) {
                this.execute(args);
                e.preventDefault();
            }
        },

        _initProcessor: function (options) {
            var that = this,
                processingOptions;

            processingOptions = options.dplProcessing ? that.options.dplProcessing : that.options.pdfjsProcessing;
            that.processingLib = options.dplProcessing ? PROCESSORS.dpl : PROCESSORS.pdfjs;

            that.processor = new kendo.pdfviewer[that.processingLib].processor(processingOptions, that);
            Page = kendo.pdfviewer[that.processingLib].Page;
        },

        _renderToolbar: function () {
            var that = this,
                options = that.options;

            var toolbarOptions = {
                pager: {
                    messages: options.messages.toolbar.pager
                },
                scale: options.scale,
                resizable: true,
                items: options.toolbar.items,
                width: options.width,
                action: that.execute.bind(that),
                messages: options.messages.toolbar,
                viewer: this
            };

            var toolbarElement = $("<div />");
            toolbarElement.appendTo(that.element);
            that.toolbar = new kendo.pdfviewer.Toolbar(toolbarElement, toolbarOptions);
        },

        _initErrorDialog: function (options) {
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

        _renderPageContainer: function () {
            var that = this;

            if (!that.pageContainer) {
                that.pageContainer = $("<div />");
                that.pageContainer.addClass(styles.scroller);
                that.pageContainer.attr(TABINDEX, 0);
                that.wrapper.append(that.pageContainer);
            }
        },

        _triggerError: function (options) {
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

        _renderPages: function () {
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

        _renderBlankPage: function () {
            this._blankPage = new Page(this.options.defaultPageSize, this);

            this.pageContainer.append(this._blankPage.element);

            this.trigger(UPDATE, { isBlank: true });
        },

        _resize: function () {
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

        _resizePages: function () {
            var that = this,
                containerWidth = that.pageContainer[0].clientWidth,
                ratio = 0;

            that.pages.forEach(function (page) {
                var currentRatio = containerWidth / page.element.width();

                if (currentRatio > ratio) {
                    ratio = currentRatio;
                }
            });

            if(that._autoFit) {
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

        _attachContainerEvents: function () {
            var that = this;

            that._wheel = kendo.throttle(
                that._wheel.bind(that),
                300
            );

            if(that.processingLib !== PROCESSORS.dpl) {
                that.pageContainer.on(MOUSEWHEEL, function (e) {
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

        _scroll: function (e) {
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

        _wheel: function (e) {
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

        zoom: function (scale, preventComboBoxChange) {
            var that = this;
            if (!scale) {
                return that.zoomScale;
            }

            return that.execute({
                command: ZOOMCOMMAND,
                options: {
                    scale: scale,
                    updateComboBox: !preventComboBoxChange
                }
            });
        },

        execute: function (options) {
            var commandOptions = extend({ viewer: this }, options.options);
            var command = new kendo.pdfviewer[options.command](commandOptions);
            return command.exec();
        },

        _loadDocument: function () {
            var that = this;
            var page = that.options.page;

            progress(that.pageContainer, true);
            that.processor.fetchDocument().done(function (document) {
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

        loadPage: function (number) {
            var page = this.pages && this.pages[number - 1];

            if (page) {
                return page.load(this.zoomScale);
            }
        },

        activatePage: function (number) {
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

        _getVisiblePagesCount: function () {
            var that = this,
                loadedPagesHeight = 0,
                updatedVisiblePagesCount = 0,
                containerHeight = that.pageContainer[0].clientHeight,
                index = 0;

            while(loadedPagesHeight <= containerHeight && index < that.pages.length)
            {
                loadedPagesHeight += that.pages[index].element.height();
                updatedVisiblePagesCount++;
                index++;
            }

            that._visiblePagesCount = updatedVisiblePagesCount;
        },

        _loadVisiblePages: function () {
            var pagesCount = this.pages && this.pages.length,
                minVisiblePageNum =  Math.max(this._pageNum - this._visiblePagesCount, 1),
                maxVisiblePageNum = Math.min(this._pageNum + this._visiblePagesCount, pagesCount);

            this._visiblePages = this.pages.slice(minVisiblePageNum - 1, maxVisiblePageNum);

            for (var i = minVisiblePageNum; i <= maxVisiblePageNum; i++)
            {
                this.loadPage(i);
            }
        },

        _loadAllPages: function () {
            var pagesCount = this.pages && this.pages.length;
            var promises = [];

            for (var i = 0; i <= pagesCount; i++)
            {
                promises.push(this.loadPage(i));
            }

            return promises;
        },

        fromFile: function (file) {
            this.zoomScale = this.options.scale || ZOOM_SCALE;
            this.zoom(this.zoomScale, true);
            this.trigger(UPDATE, { action: "zoom", zoom: this.options.scale || "auto" });

            this.processor._updateDocument(file);
            this._loadDocument();
        },

        exportImage: function (options) {
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

            drawing.exportImage(rootGroup).done(function (data) {
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

        exportSVG: function (options) {
            var that = this;
            var pageNumber = options.page;
            var page = that.pages[pageNumber - 1] || that._blankPage;

            progress(that.pageContainer, true);

            page.load();

            drawing.exportSVG(page.group).done(function (data) {
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

        setOptions: function (options)
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

        destroy: function ()
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
                this.pages.forEach(function (page) {
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

        _clearPages: function () {
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

        _toggleSelection: function (enable) {
            var that = this;

            if(enable === undefined) {
                enable = true;
            }

            that._scroller.userEvents._shouldNotMove = enable;

            that._scroller.scrollElement.toggleClass(styles.enableTextSelection, enable);
            that._scroller.scrollElement.toggleClass(styles.enablePanning, !enable);
        },


        _initSearchDOM: function () {
            var that = this;
            var promise = new Promise(function (resolve) {
                Promise.all(that._loadAllPages()).then(function(){
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

        _getTextLayers: function () {
            return this.pages.map(function(page){
                return page.textLayer;
            });
        }
    });

    ui.plugin(PDFViewer);
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

