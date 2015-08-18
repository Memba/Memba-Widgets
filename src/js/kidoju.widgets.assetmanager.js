/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define){
    'use strict';
    define(['./vendor/kendo/kendo.binder', './vendor/kendo/kendo.tabstrip', './vendor/kendo/kendo.listview'], f);
})(function () {

    'use strict';


    // TODO: http://localhost:63342/Kidoju.Widgets/test/data/o_collection_white.json




    (function ($, undefined) {

        var kendo = window.kendo,
            Widget = kendo.ui.Widget,
            DataSource = kendo.data.DataSource,
            NUMBER = 'number',
            STRING = 'string',
            ARRAY = 'array',
            CHANGE = 'change',
            DELETE = 'delete',
            ERROR = 'error',
            UPLOAD = 'upload',
            MODULE = 'kidoju.widgets.assetmanager',
            NS = '.kendoAssetManager',
            WIDGET_CLASS = 'k-widget kj-assetmanager',
            TOOLBAR_TMPL = '<div class="k-widget k-filebrowser-toolbar k-header k-floatwrap">' +
                '<div class="k-toolbar-wrap">' +
                    '<div class="k-widget k-upload"><div class="k-button k-button-icontext k-upload-button"><span class="k-icon k-add"></span>#=messages.toolbar.upload#<input type="file" name="file" /></div></div>' +
                    '<button type="button" class="k-button k-button-icon k-state-disabled"><span class="k-icon k-delete" /></button>&nbsp;' +
                    '<label>#=messages.toolbar.filter#<select /></label>' +
                '</div>' +
                '<div class="k-tiles-arrange">' +
                    '<div class="k-widget k-search-wrap k-textbox"><input placeholder="#=messages.toolbar.search#" class="k-input"><a href="\\#" class="k-icon k-i-search k-search"></a></div>' +
                '</div>' +
            '</div>',
            ITEM_TMPL = '<li class="k-tile" ' + kendo.attr("uid") + '="#=uid#" ' + kendo.attr("type") + '="#=type$()#">' +
                '#if(type$() === "d"){#' +
                    '<div class="k-thumb"><span class="k-icon k-folder"></span></div>' +
                '#}else{#' +
                    '<div class="k-thumb"><span class="k-icon k-file"></span></div>' +
                '#}#' +
                '<strong>#=name$()#</strong>' +
                '<span class="k-filesize">#=size$()#</span>' +
            '</li>',
            SCHEMA = {
                data: 'data',
                model: {
                    id: 'url',
                    fields: {
                        size: { type: NUMBER, editable: false },
                        url:  { type: STRING, editable: false, nullable: true }
                    },
                    name$: function() { return nameFormatter(this.get('url')); },
                    size$: function() { return sizeFormatter(this.get('size')); },
                    type$: function() { return typeFormatter(this.get('url')); }
                },
                total: 'total',
                type: 'json'
            };

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * Log
         */
        var log = $.extend(
            // By extending log, we ensure we can call both log() and log.info() for the same result
            function(message, level) {
                message = $.type(message) === STRING ? { message: message } : message;
                level = (/^(debug|info|warn|error|crit)$/i).test(level) ? level.toLowerCase() : 'info';
                var app = window.app,
                    logEntry = $.extend({}, message, { module: MODULE });
                if (app && app.logger) {
                    // TODO ------------------------------------------------------------------------------------
                    $.noop();
                } else if (window.console && $.isFunction(window.console.log)) {
                    window.console.log(
                        logEntry.module + ': ' +
                        logEntry.message +
                        (logEntry.data ? ' - ' + JSON.stringify(logEntry.data) : ''));
                }
            },
            {
                debug: function(message) { return log(message, 'debug'); },
                info: function(message) { return log(message, 'info'); },
                warn: function(message) { return log(message, 'warn'); },
                error: function(message) { return log(message, 'error'); },
                crit: function(message) { return log(message, 'crit'); }
            },
            {
                messages: {
                    debug: {},
                    info: {},
                    warn: {},
                    error: {},
                    crit: {}
                }
            }
        );

        /**
         * Asserts
         * Note: Use asserts where unmet conditions are independent from user entries, and
         * developers should be warned that there is probably something unexpected in their code
         */
        var assert = $.extend(
            // By extending assert, we ensure we can call both assert() and assert.ok() for the same result (like in nodeJS)
            function(test, message) {
                if (!test) { throw new Error(message); }
            },
            {
                enum: function(array, value, message) { if (array.indexOf(value) === -1) { throw new Error(message); } },
                equal: function(expected, actual, message) { if (expected !== actual) { throw new Error(message); } },
                instanceof: function(Class, value, message) { if (!(value instanceof Class)) { throw new Error(message); } },
                isOptionalObject: function(value, message) { if ($.type(value) !== 'undefined' && (!$.isPlainObject(value) || $.isEmptyObject(value))) { throw new Error(message); } },
                isPlainObject: function(value, message) { if (!$.isPlainObject(value) || $.isEmptyObject(value)) { throw new Error(message); } },
                isUndefined: function(value, message) { if ($.type(value) !== 'undefined') { throw new Error(message); } },
                match: function(rx, value, message) { if ($.type(value) !== STRING || !rx.test(value)) { throw new Error(message); } },
                ok: function(test, message) { return assert(test, message); },
                type: function(type, value, message) { if ($.type(value) !== type) { throw new TypeError(message); } }
            },
            {
                messages: {
                    instanceof: {
                        default: '`{0}` is expected to be an instance of `{1}`'
                    },
                    isPlainObject: {
                        default: '`{0}` is expected to be a plain object'
                    },
                    isUndefined: {
                        default: '`{0}` is expected to be undefined'
                    },
                    type: {
                        default: '`{0}` is expected to be a(n) `{1}`'
                    }
                }
            }
        );

        /**
         * Extracts file name from url
         * @param url
         * @returns {*}
         */
        function nameFormatter(url) {
            assert.type(STRING, url, kendo.format(assert.messages.type.default, 'url', STRING));
            return url.split('\\').pop().split('/').pop();
        }

        /**
         * Returns a file size formatted with bytes, KB, MB, GB
         * @param size
         * @returns {*}
         */
        function sizeFormatter(size) {
            assert.type(NUMBER, size, kendo.format(assert.messages.type.default, 'size', NUMBER));
            if(!size) { return ''; }
            var suffix = ' bytes';
            if (size >= 1073741824) {
                suffix = ' GB';
                size /= 1073741824;
            } else if (size >= 1048576) {
                suffix = ' MB';
                size /= 1048576;
            } else  if (size >= 1024) {
                suffix = ' KB';
                size /= 1024;
            }
            return Math.round(size * 100) / 100 + suffix;
        }

        /**
         *
         * @param url
         * @returns {*}
         */
        function typeFormatter(url) {
            assert.type(STRING, url, kendo.format(assert.messages.type.default, 'url', STRING));
            var ext = url.split('.').pop();
            switch(ext) {
                case 'gif':
                    return 'image/gif';
                case 'jpg':
                case 'jpeg':
                    return 'image/jpeg';
                case 'png':
                    return 'image/png';
                default:
                    return 'application/octet-stream';
            }
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * @class AssetManager Widget (kendoAssetManager)
         */
        var AssetManager = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                log('widget initialized');
                that._dataSource();
                that._layout();
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'AssetManager',
                toolbarTemplate: TOOLBAR_TMPL,
                itemTemplate: ITEM_TMPL,
                schema: SCHEMA,
                transport: {},
                collections: [],
                filter: [], // TODO
                messages: {
                    toolbar: {
                        upload: 'Upload',
                        delete: 'Delete',
                        filter: 'Collection: ',
                        search: 'Search'
                    },
                    tabs: {
                        default: 'Project'
                    }
                }
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE,
                DELETE,
                UPLOAD
            ],

            value: function() {
                /*
                var that = this,
                    selected = that._selectedItem(),
                    path,
                    fileUrl = that.options.transport.fileUrl;

                if (selected && selected.get(TYPEFIELD) === "f") {
                    path = concatPaths(that.path(), selected.get(NAMEFIELD)).replace(trimSlashesRegExp, "");
                    if (fileUrl) {
                        path = isFunction(fileUrl) ? fileUrl(path) : kendo.format(fileUrl, encodeURIComponent(path));
                    }
                    return path;
                }
                */
            },

            /*
            _selectedItem: function() {
                var listView = this.listView,
                    selected = listView.select();

                if (selected.length) {
                    return this.dataSource.getByUid(selected.attr(kendo.attr("uid")));
                }
            },
            */

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                that._tabStrip();
                that._tabContent();
            },

            /**
             * Add a tabStrip with as many tabs as collections
             * @private
             */
            _tabStrip: function() {
                assert.type(ARRAY, this.options.collections, kendo.format(assert.messages.type.default, 'this.options.collections', ARRAY));
                var collections = this.options.collections,
                    div = $('<div></div>'),
                    ul = $('<ul></ul>').appendTo(div);

                // Add default tab
                ul.append('<li class="k-state-active">' + this.options.messages.tabs.default + '</li>');
                div.append('<div></div>');

                // Add a tab per collection
                for (var i = 0; i < collections.length; i++) {
                    ul.append('<li>' + collections[i].name + '</li>');
                    div.append('<div></div>');
                }
                div.appendTo(this.element);

                // Set the tabStrip item of the component
                this.tabStrip = div.kendoTabStrip({
                    tabPosition: 'left',
                    animation: { open: { effects: 'fadeIn' } },
                    select: $.proxy(this._onTabSelect, this)
                }).data('kendoTabStrip');
            },

            /**
             * Add default content tab
             * Note: content shall be moved/shared accross tabs; Only the dataSource and toolbar are updated when changing tabs
             * @private
             */
            _tabContent: function() {
                assert.instanceof(kendo.ui.TabStrip, this.tabStrip, kendo.format(assert.messages.instanceof.default, 'this.tabStrip', 'kendo.ui.tabStrip'));

                // Add the file browser wrapping div
                this.fileBrowser = $('<div class="k-filebrowser"></div>')
                    .appendTo(this.tabStrip.contentHolder(0));

                // Add the toolbar
                this._toolbar();

                // Add the list view
                this._listView();
            },

            /**
             * Add the toolbar to the fileBrowser
             * Note: all collections are read-only so upload/delete is hidden except on the default tab
             * @private
             */
            _toolbar: function() {
                var that = this,
                    template = kendo.template(that.options.toolbarTemplate),
                    messages = that.options.messages;

                that.toolbar = $(template({
                    messages: messages
                })).appendTo(that.fileBrowser);

                // TODO Upload
                // TODO Delete
                // TODO Search

                /*
                that._attachDropzoneEvents();
                */
            },

            /**
             * Add the list view to the file browser
             * Note: selecting a file in the list view updates the widget value() and triggers the change event
             * @private
             */
            _listView: function() {
                assert.instanceof($, this.fileBrowser, this.fileBrowser, kendo.format(assert.messages.instanceof.default, 'this.fileBrowser', 'jQuery'));
                assert.instanceof(DataSource, this.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                this.listView = $('<div/>')
                    .appendTo(this.fileBrowser)
                    .kendoListView({
                        dataSource: this.dataSource,
                        template: kendo.template(this.options.itemTemplate)
                    })
                    .data('kendoListView');
            },

            /**
             * Event handler triggered when selecting a tab
             * @private
             */
            _onTabSelect: function(e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(window.HTMLElement, e.item, kendo.format(assert.messages.instanceof.default, 'e.item', 'window.HTMLElement'));
                assert.instanceof(kendo.ui.TabStrip, this.tabStrip, kendo.format(assert.messages.instanceof.default, 'this.tabStrip', 'kendo.ui.tabStrip'));
                assert.instanceof($, this.fileBrowser, this.fileBrowser, kendo.format(assert.messages.instanceof.default, 'this.fileBrowser', 'jQuery'));
                assert.instanceof(DataSource, this.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                var tabIndex = $(e.item).index();
                // Move file browser to the selected tab
                this.fileBrowser.appendTo(this.tabStrip.contentHolder(tabIndex));
                // Show/hide upload and delete buttons which are only available on the default Tab
                this.fileBrowser.find('div.k-toolbar-wrap').toggle(tabIndex === 0);
                // Change data source transport
                this._resetTransport(tabIndex-1, 0);
            },

            /**
             * Change data source transport based on selected collection
             * @param colIndex
             * @param subIndex
             * @private
             */
            _resetTransport: function(colIndex, subIndex) {
                function getTransport(options) {
                    var transport;
                    if (options) {
                        options.read = typeof options.read === STRING ? { url: options.read } : options.read;
                        transport = $.isFunction(options.read) ? options : new kendo.data.RemoteTransport(options);
                    } else {
                        transport = new kendo.data.LocalTransport({ data: [] });
                    }
                    return transport;
                }
                assert.type(NUMBER, colIndex, kendo.format(assert.messages.type.default, 'colIndex', NUMBER));
                assert.type(NUMBER, subIndex, kendo.format(assert.messages.type.default, 'subIndex', NUMBER));
                assert.type(ARRAY, this.options.collections, kendo.format(assert.messages.type.default, 'this.options.collections', ARRAY));
                assert.instanceof(DataSource, this.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                if (colIndex >= 0 && colIndex < this.options.collections.length) {
                    var collection = this.options.collections[colIndex];
                    if ($.isPlainObject(collection.transport)) {
                        this.dataSource.transport = getTransport(collection.transport);
                    } else if ($.isArray(collection.collections) && collection.collections.length &&
                        $.isPlainObject(collection.collections[subIndex].transport)) {
                        this.dataSource.transport = getTransport(collection.collections[subIndex].transport);
                    }
                } else {
                    this.dataSource.transport = getTransport(this.options.transport);
                }
                return this.dataSource.read();
            },

            /**
             * Sets/updates the data source
             * @private
             */
            _dataSource: function(transport) {
                var that = this;
                    //typeSortOrder = extend({}, DEFAULTSORTORDER),
                    //nameSortOrder = { field: NAMEFIELD, dir: "asc" },

                if (that.dataSource && that._errorHandler) {
                    that.dataSource.unbind(ERROR, that._errorHandler);
                } else {
                    that._errorHandler = $.proxy(that._dataError, that);
                }

                that.dataSource = DataSource
                    .create({
                        schema: that.options.schema,
                        // sort:
                        transport: $.isPlainObject(transport) ? transport : that.options.transport
                    })
                    .bind(ERROR, that._errorHandler);
            },

            /**
             * Data error handler
             * @param e
             * @private
             */
            _dataError: function(e) {
                /*
                var that = this,
                    status;

                if (!that.trigger(ERROR, e)) {
                    status = e.xhr.status;

                    if (e.status == 'error') {
                        if (status == '404') {
                            that._showMessage(that.options.messages.directoryNotFound);
                        } else if (status != '0') {
                            that._showMessage('Error! The requested URL returned ' + status + ' - ' + e.xhr.statusText);
                        }
                    } else if (status == 'timeout') {
                        that._showMessage('Error! Server timeout.');
                    }
                }
                */
            },

            /**
             * Clears the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                // kendo.unbind($(that.element));
                // unbind all other events
                $(that.element).find('*').off();
                $(that.element).off();
                // remove descendants
                $(that.element).empty();
                // remove element classes
                $(that.element).removeClass(WIDGET_CLASS);
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                // if ($.isFunction(that._refreshHandler)) {
                //    that.options.tools.unbind(CHANGE, that._refreshHandler);
                // }
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(AssetManager);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f){ 'use strict'; f(); });
