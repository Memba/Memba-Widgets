/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.pager',
        './vendor/kendo/kendo.progressbar',
        './vendor/kendo/kendo.listview',
        './vendor/kendo/kendo.tabstrip',
        './vendor/kendo/kendo.window',
        // './vendor/kendo/kendo.upload' // <--- does not work with AWS S3
        './kidoju.widgets.messagebox',
        './kidoju.widgets.vectordrawing'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var DataSource = kendo.data.DataSource;
        var ObservableObject = kendo.data.ObservableObject;
        var DropDownList = kendo.ui.DropDownList;
        var ListView = kendo.ui.ListView;
        var Pager = kendo.ui.Pager;
        var ProgressBar = kendo.ui.ProgressBar;
        var TabStrip = kendo.ui.TabStrip;
        var Window = kendo.ui.Window;
        // var deepExtend = kendo.deepExtend;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.assetmanager');
        var NUMBER = 'number';
        var STRING = 'string';
        var OBJECT = 'object';
        var ARRAY = 'array';
        // var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var CLICK = 'click';
        var ERROR = 'error';
        var NS = '.kendoAssetManager';
        var DRAGENTER = 'dragenter';
        var DRAGOVER = 'dragover';
        var DROP = 'drop';
        var PROGRESS = 'progress';
        var WIDGET_CLASS = 'k-widget kj-assetmanager';
        var WINDOW_SELECTOR = '.kj-assetmanager-window';
        var TOOLBAR_TMPL = '<div class="k-widget k-filebrowser-toolbar k-header k-floatwrap">' +
                '<div class="k-toolbar-wrap">' +
                    '<label class="k-label" style="display:none">#=messages.toolbar.collections#<select data-role="dropdownlist"></select></label>' +
                    '<div class="k-widget k-upload"><div class="k-button k-button-icontext k-upload-button">' +
                        '<span class="k-icon k-i-plus"></span>#:messages.toolbar.upload#<input type="file" name="file" accept="#=accept#" multiple />' +
                    '</div></div>' +
                    '<button type="button" class="k-button k-button-icon" title="#:messages.toolbar.create#"><span class="k-icon k-i-file-add"></span></button>' +
                    '<button type="button" class="k-button k-button-icon k-state-disabled" title="#:messages.toolbar.edit#"><span class="k-icon k-i-track-changes-enable"></span></button>' +
                    '<button type="button" class="k-button k-button-icon k-state-disabled" title="#:messages.toolbar.delete#"><span class="k-icon k-i-delete"></span></button>' +
                '</div>' +
                '<div class="k-tiles-arrange">' +
                    '<div class="k-progressbar"></div>' + // TODO Review progressbar
                    '<div class="k-widget k-search-wrap k-textbox"><input placeholder="#=messages.toolbar.search#" class="k-input"><a href="\\#" class="k-icon k-i-zoom k-search"></a></div>' +
                '</div>' +
            '</div>';
        var ITEM_TMPL = '<li class="k-tile" ' + kendo.attr('uid') + '="#=uid#">' + // ' + kendo.attr('type') + '="#=mime$()#">' +
                '#if (/^image\\//.test(mime$())) {#' +
                    '<div class="k-thumb"><img alt="#=name$()#" src="#=url$()#" class="k-image"></span></div>' +
                '#}else{#' +
                    '<div class="k-thumb"><span class="k-icon k-i-file"></span></div>' +
                '#}#' +
                '<strong>#=name$()#</strong>' +
                '<span class="k-filesize">#=size$()#</span>' +
            '</li>';
        var ACTION = {
            CREATE: 'create',
            EDIT: 'edit',
            EXPORT: 'export',
            DESTROY: 'destroy',
            UPLOAD: 'upload'
        };

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

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
            if (!size) { return ''; }
            var suffix = ' bytes';
            if (size >= 1073741824) {
                suffix = ' GB';
                size /= 1073741824;
            } else if (size >= 1048576) {
                suffix = ' MB';
                size /= 1048576;
            } else if (size >= 1024) {
                suffix = ' KB';
                size /= 1024;
            }
            return Math.round(size * 100) / 100 + suffix;
        }

        /* This function's cyclomatic complexity is too high. */
        /* jshint -W074 */

        /**
         * Convert file extension to mime type
         * @see http://hul.harvard.edu/ois/systems/wax/wax-public-help/mimetypes.htm
         * @param url
         * @returns {*}
         */
        function typeFormatter(url) {
            /* jshint maxcomplexity: 12 */
            assert.type(STRING, url, kendo.format(assert.messages.type.default, 'url', STRING));
            var ext = url.split('.').pop();
            switch (ext) {
                case 'gif':
                    return 'image/gif';
                case 'jpg':
                case 'jpeg':
                    // case 'jpeg':
                    return 'image/jpeg';
                case 'mp3':
                    // @see http://tools.ietf.org/html/rfc3003
                    // @see https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats#MP3
                    return 'audio/mpeg';
                case 'mp4':
                    // @see http://www.rfc-editor.org/rfc/rfc4337.txt
                    return 'video/mp4';
                case 'ogg':
                    return 'audio/ogg';
                case 'ogv':
                    return 'video/ogg';
                case 'png':
                    return 'image/png';
                case 'svg':
                    return 'image/svg+xml';
                case 'wav':
                    return 'audio/wav';
                case 'webm':
                    return 'video/webm';
                default:
                    return 'application/octet-stream';
            }
        }

        /* jshint +W074 */

        /**
         * Formats a url for display
         * Assuming this.options.schemes = { cdn: 'https://s3.amazonaws.com/account/bucket/' }
         * Then this function return ret = https://s3.amazonaws.com/account/bucket/photo.jpg from url = cdn://photo.jpg
         * This allows us to switch between sources especially for our web and mobile applications
         * @param url
         * @param schemes
         */
        function urlFormatter(url, schemes) {
            assert.type(STRING, url, kendo.format(assert.messages.type.default, 'url', STRING));
            assert.type(OBJECT, schemes, kendo.format(assert.messages.type.default, 'schemes', OBJECT));
            var ret = url;
            for (var scheme in schemes) {
                if (schemes.hasOwnProperty(scheme) && (new RegExp('^' + scheme + '://')).test(url)) {
                    ret = url.replace(scheme + '://', schemes[scheme]);
                    break;
                }
            }
            return ret;
        }

        /**
         * Gets a datasource filter from an array of extensions
         * @param extensions
         * @returns {*}
         */
        function getDataSourceFilter(extensions) {
            extensions = extensions || [];
            assert.type(ARRAY, extensions, kendo.format(assert.messages.type.default, 'extensions', ARRAY));
            var ret = null;
            if (extensions.length === 1) {
                ret = { field: 'url', operator: 'endswith', value: extensions[0] };
            } else if (extensions.length > 1) {
                ret = { logic: 'or', filters: [] };
                for (var i = 0; i < extensions.length; i++) {
                    ret.filters.push({ field: 'url', operator: 'endswith', value: extensions[i] });
                }
            }
            return ret;
        }

        /**
         * Detects file drag and drop
         * @see https://github.com/Modernizr/Modernizr/issues/57
         * @returns {boolean}
         */
        function supportsFileDrop() {
            var userAgent = navigator.userAgent.toLowerCase();
            var isChrome = /chrome/.test(userAgent);
            var isSafari = !isChrome && /safari/.test(userAgent);
            var isWindowsSafari = isSafari && /windows/.test(userAgent);
            return !isWindowsSafari && !!window.FileList;
        }

        /**
         * Helper copied from kendo.upload.js
         * @param element
         * @param onDragEnter
         * @param onDragLeave
         */
        function bindDragEventWrappers(element, onDragEnter, onDragLeave) {
            var hideInterval;
            var lastDrag;
            element.on(DRAGENTER + NS, function (e) {
                onDragEnter(e);
                lastDrag = new Date();
                if (!hideInterval) {
                    hideInterval = setInterval(function () {
                        var sinceLastDrag = new Date() - lastDrag;
                        if (sinceLastDrag > 100) {
                            onDragLeave();
                            clearInterval(hideInterval);
                            hideInterval = null;
                        }
                    }, 100);
                }
            }).on(DRAGOVER + NS, function () {
                lastDrag = new Date();
            });
        }

        /**
         * Returns the total size of a file list of type FileList or Array or ObservableArray which are all iterable
         * @param fileList
         * @returns {number}
         */
        function totalSize (fileList) {
            var ret = 0;
            if (fileList && $.isFunction(fileList[window.Symbol.iterator])) {
                for (var i = 0, length = fileList.length; i < length; i++) {
                    ret += fileList[i].size || 0;
                }
            }
            return ret;
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
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._initDataSources();
                that._layout();
                // TODO that.enable(that.element.prop('disabled') ? false : !!that.options.enable);
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'AssetManager',
                enable: true,
                toolbarTemplate: TOOLBAR_TMPL, // TODO Remove - see kendo.filebrowser
                itemTemplate: ITEM_TMPL, // TODO Remove - see kendo.filebrowser
                collections: [],
                schemes: {},
                extensions: [],
                messages: {
                    dialogs: {
                        cancel: {
                            // TODO: Not great to have here as this is part of our application configuration
                            imageUrl: 'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                            text: 'Cancel'
                        },
                        confirm: 'Confirm',
                        newFile: 'New file',
                        ok: {
                            imageUrl: 'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg',
                            text: 'OK'
                        },
                        warningOverwrite: 'Do you really want to overwite these files: `{0}`? Note that file updates take time to propagate across our Content Delivery Network while new files propagate instantly.'
                    },
                    toolbar: {
                        collections: 'Collections:&nbsp;',
                        create: 'Create New',
                        delete: 'Delete',
                        edit: 'Edit',
                        search: 'Search',
                        upload: 'Upload'
                    }
                }
                // TODO we need to be able to enable/disable tabs to show disabled organization tab for users who do not have an organization
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE,
                CLICK, // TODO beforeOpen
                ERROR
            ],

            /**
             * Gets the url of the selected item
             * @returns {*}
             */
            value: function () {
                // TODO: value cannot change when seleting on Google tab, because they need to be imported first
                var that = this;
                var selected = that._selectedItem();
                if (selected instanceof ObservableObject) {
                    return selected.url;
                }
            },

            /**
             * Gets/Sets the value of the progress bar
             * @returns {*}
             */
            progress: function (progress) {
                if (this.progressBar instanceof ProgressBar) {
                    return this.progressBar.value(progress);
                }
            },

            /**
             * Select an item in the list view
             * @param index
             */
            select: function (index) {
                if ($.type(index) === NUMBER) {
                    index = this.listView.items().get(index);
                } else if ($.type(index) === STRING) {
                    index = $(index);
                }
                return this.listView.select(index);
            },

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
                that._dropZone();
                // Select the first tab, which triggers _onTabSelect
                that.tabStrip.select(0);
                // Set the contentHolder height to 'auto' because tabStrip sets it to 0
                that.tabStrip.contentHolder(0).height('auto');
            },

            /**
             * Initialize data sources from collections
             * @private
             */
            _initDataSources: function () {
                function makeDataSources(collections, depth) {
                    var ret = [];
                    for (var i = 0, length = collections.length, dataSource, editable; i < length; i++) {
                        if ($.isArray (collections[i].collections)) {
                            // Make it recursive for sub-collections displayed in drop down list
                            ret.push({
                                name: collections[i].name,
                                collections: makeDataSources(collections[i].collections, depth + 1)
                            });
                        } else {
                            // Without sub-collection, make it a dataSource
                            dataSource = DataSource.create(that._extendDataSourceOptions(collections[i]));
                            if ($.isFunction(that._errorHandler)) {
                                dataSource.bind(ERROR, that._errorHandler);
                            }
                            ret.push({
                                dataSource: dataSource,
                                depth: depth,
                                editor: collections[i].editor,
                                name: collections[i].name,
                                tools: collections[i].tools
                            });
                        }
                    }
                    return ret;
                }
                var that = this;
                that._errorHandler = that._dataError.bind(that); // TODO
                that._collections = makeDataSources(that.options.collections, 0);
            },

            /**
             * Extend data source parameters
             * @param params
             * @returns {*}
             * @private
             */
            _extendDataSourceOptions: function (params) {

                // TODO total size + upload progress

                var options = this.options;
                if ($.isPlainObject(params)) { // Especially, params is not an instanceof DataSource
                    params = $.extend(true, {}, {
                        filter: getDataSourceFilter(options.extensions),
                        page: 1,
                        pageSize: 12,
                        schema: {
                            data: 'data',
                            error: 'error',
                            model: {
                                id: 'url',
                                fields: {
                                    size: { type: NUMBER, editable: false },
                                    mime: { type: STRING, nullable: true }, // Note: we need this otherwise Google images without extensions cannot be viewed
                                    url:  { type: STRING, editable: false, nullable: true }
                                },
                                name$: function () {
                                    return nameFormatter(this.get('url'));
                                },
                                size$: function () {
                                    return sizeFormatter(this.get('size'));
                                },
                                mime$: function () {
                                    var mime = this.get('mime');
                                    if (mime) {
                                        return mime;
                                    }
                                    var url = this.get('url');
                                    if (url) {
                                        return typeFormatter(url);
                                    }
                                    return 'application/octet-stream';
                                },
                                url$: function () {
                                    return urlFormatter(this.get('url'), options.schemes);
                                }
                            },
                            total: 'total'
                        },
                        serverFiltering: false,
                        serverPaging: false
                    }, params);
                }
                return params;
            },

            /**
             * Add a tabStrip with an Edit tab + as many tabs as collections
             * @private
             */
            _tabStrip: function () {
                assert.isArray(this._collections, kendo.format(assert.messages.isArray.default, 'this._collections'));
                assert.hasLength(this._collections, kendo.format(assert.messages.hasLength.default, 'this._collections'));
                var tabStrip = $('<div></div>');
                var ul = $('<ul></ul>').appendTo(tabStrip);

                // Add a tab per collection
                for (var i = 0, length = this._collections.length; i < length; i++) {
                    ul.append('<li>' + this._collections[i].name + '</li>');
                    tabStrip.append('<div></div>');
                }
                tabStrip.appendTo(this.element);

                // Set the tabStrip item of the component
                this.tabStrip = tabStrip.kendoTabStrip({
                    tabPosition: 'left',
                    animation: false, // { open: { effects: 'fadeIn' }, close: { effects: 'fadeOut' } },
                    select: this._onTabSelect.bind(this)
                }).data('kendoTabStrip');
                assert.instanceof(TabStrip, this.tabStrip, kendo.format(assert.messages.instanceof.default, 'this.tabStrip', 'kendo.ui.TabStrip'));
            },

            /**
             * Add content tab
             * Note: content shall be moved/shared accross tabs; Only the dataSource and toolbar are updated when changing tabs
             * @private
             */
            _tabContent: function () {
                assert.instanceof(TabStrip, this.tabStrip, kendo.format(assert.messages.instanceof.default, 'this.tabStrip', 'kendo.ui.TabStrip'));

                // Add the file browser wrapping div
                this.fileBrowser = $('<div class="k-filebrowser k-dropzone"></div>')
                    .appendTo(this.tabStrip.contentHolder(0));

                // Add the toolbar
                this._tabToolbar();

                // Add the list view
                this._listView();
            },

            /**
             * Add the toolbar to the fileBrowser
             * Note: all collections are read-only so upload/delete is hidden except on the default tab
             * @private
             */
            _tabToolbar: function () {
                var that = this;
                var options = that.options;
                var template = kendo.template(options.toolbarTemplate);

                // Add template
                that.toolbar = $(template({
                    accept: (options.extensions || []).join(','), // @see http://www.w3schools.com/tags/att_input_accept.asp
                    messages: options.messages
                })).appendTo(that.fileBrowser);
                assert.instanceof($, that.toolbar, kendo.format(assert.messages.instanceof.default, 'this.toolbar', 'jQuery'));

                // Collection drop down list
                // that.dropDownList = that.toolbar.find('div.k-toolbar-wrap select')
                that.dropDownList = that.toolbar.find(kendo.roleSelector('dropdownlist'))
                    .kendoDropDownList({
                        dataSource: [],
                        dataTextField: 'name',
                        dataValueField: 'name',
                        change: that._onDropDownListChange.bind(that)
                    })
                    .data('kendoDropDownList');
                assert.instanceof(DropDownList, that.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));

                // Progress bar
                that.progressBar = that.toolbar.find('div.k-tiles-arrange .k-progressbar')
                    .kendoProgressBar({
                        type: 'percent',
                        min: 0,
                        max: 1,
                        animation: {
                            duration: 600
                        }
                    })
                    .data('kendoProgressBar');
                assert.instanceof(ProgressBar, that.progressBar, kendo.format(assert.messages.instanceof.default, 'this.progressBar', 'kendo.ui.ProgressBar'));

                // Event handler used to report upload transport progress in app.assets.js
                if (that.progressBar instanceof ProgressBar) {
                    $(document).on(PROGRESS + NS, function (e, value, status) {
                        that.progressBar.value(value);
                        if (status === 'complete') {
                            // TODO: display/limit total storage
                            setTimeout(function () {
                                that.progressBar.value(0);
                            }, 100);
                        }
                    });
                }

                // Search
                that.searchInput = that.toolbar.find('input.k-input');
                assert.instanceof($, that.searchInput, kendo.format(assert.messages.instanceof.default, 'this.searchInput', 'jQuery'));

                // Other events
                that.toolbar
                    .on(CHANGE + NS, '.k-upload input[type=file]', that._onFileInputChange.bind(that))
                    .on(CLICK + NS, 'button:not(.k-state-disabled)', that._onButtonClick.bind(that))
                    .on(CHANGE + NS, 'input.k-input', that._onSearchInputChange.bind(that))
                    .on(CLICK + NS, 'a.k-i-close', that._onSearchClearClick.bind(that)); // TODO is this ever occuring?
            },

            /**
             * Event handler triggered when selecting a tab
             * @param e
             * @private
             */
            _onTabSelect: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(window.HTMLLIElement, e.item, kendo.format(assert.messages.instanceof.default, 'e.item', 'HTMLLIElement'));
                assert.instanceof(TabStrip, this.tabStrip, kendo.format(assert.messages.instanceof.default, 'this.tabStrip', 'kendo.ui.TabStrip'));
                assert.instanceof($, this.fileBrowser, kendo.format(assert.messages.instanceof.default, 'this.fileBrowser', 'jQuery'));
                assert.isArray(this._collections, kendo.format(assert.messages.isArray.default, 'this._collections'));

                // var oldIndex = this.tabStrip.select().index();
                var tabIndex = $(e.item).index();

                // Set the current collection
                var collection = this.collection = this._collections[tabIndex];
                if ($.isArray(collection.collections) && collection.collections.length) {
                    this.collection = collection.collections[0];
                    this.dropDownList.setDataSource(collection.collections);
                    this.dropDownList.select(0);
                } else {
                    this.dropDownList.setDataSource([]);
                }

                // Ensure all content holders have the same height
                this.tabStrip.contentHolder(tabIndex).height('auto');

                // Move file browser to the selected tab
                this.fileBrowser.appendTo(this.tabStrip.contentHolder(tabIndex));

                // Update the selected tab
                this._updateTab();
            },

            /**
             * Update the tab after changing dataSource
             * @private
             */
            _updateTab: function () {
                assert.isArray(this._collections, kendo.format(assert.messages.isArray.default, 'this._collections'));
                assert.isPlainObject(this.collection, kendo.format(assert.messages.isPlainObject.default, 'this.collection'));

                var collection = this.collection;
                var tools = collection.tools || [];

                // Show/hide upload and delete buttons which are only available on tabs corresponding to editable collections
                this.toolbar.find('.k-toolbar-wrap > .k-label').toggle(collection.depth > 0);
                this.toolbar.find('.k-toolbar-wrap >.k-upload').toggle(tools.indexOf('upload') > -1);
                this.toolbar.find('.k-toolbar-wrap >.k-button').has('.k-i-file-add').toggle(tools.indexOf('create') > -1);
                this.toolbar.find('.k-toolbar-wrap >.k-button').has('.k-i-track-changes-enable').toggle(tools.indexOf('edit') > -1);
                this.toolbar.find('.k-toolbar-wrap >.k-button').has('.k-i-delete').toggle(tools.indexOf('destroy') > -1);
                this.toolbar.find('div.k-tiles-arrange .k-progressbar').toggle(!!tools.length);

                // Change data source
                this.listView.setDataSource(collection.dataSource);
                this.pager.setDataSource(collection.dataSource);
                this.pager.refresh();

                // add/remove k-state-nodrop to dropZone
                if (this.dropZone instanceof $) {
                    this.dropZone.toggleClass('k-state-nodrop', collection.editable);
                }
            },

            /**
             * Event handler triggered when selecting another collection in the toolbar drop down list
             * @private
             */
            _onDropDownListChange: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(DropDownList, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.DropDownList'));
                assert.instanceof(TabStrip, this.tabStrip, kendo.format(assert.messages.instanceof.default, 'this.tabStrip', 'kendo.ui.TabStrip'));

                var tabIndex = this.tabStrip.select().index();

                // Set the current collection
                var parent = this._collections[tabIndex];
                assert.isArray(parent.collections, kendo.format(assert.messages.isArray.default, 'parent.collections'));
                var found = parent.collections.filter(function (item) {
                    return item.name === e.sender.value();
                });
                this.collection = found[0];

                this._updateTab();
            },

            /**
             * Event handler triggered when clicking the upload button and selecting a file (which changes the file input)
             * @param e
             * @private
             */
            _onFileInputChange: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(window.HTMLInputElement, e.target, kendo.format(assert.messages.instanceof.default, 'e.target', 'HTMLInputElement'));
                // Note: Set multiple attribute onto html file input tag for multiple uploads
                var fileList = e.target.files;
                if (fileList instanceof window.FileList && fileList.length) {
                    this._uploadFileList(fileList);
                }
            },

            /**
             * Upload a file list
             * @param fileList
             * @private
             */
            _uploadFileList: function (fileList) {
                assert.instanceof(window.FileList, fileList, kendo.format(assert.messages.instanceof.default, 'fileList', 'FileList'));

                function execUpload() {
                    var promises = [];
                    for (var i = 0, length = fileList.length; i < length; i++) {
                        promises.push(that._uploadFile(fileList[i]));
                    }
                    that._showUploadProgress();
                    $.when.apply($, promises).always(that._hideUploadProgress.bind(that));
                }

                var that = this;
                var options = that.options;
                var found = [];
                for (var i = 0, length = fileList.length; i < length; i++) {
                    var dataItem = that._findDataItem(fileList[i].name);
                    if (dataItem) {
                        found.push(dataItem.name$());
                    }
                }
                if (found.length) {
                    kendo.alertEx({
                        type: kendo.ui.MessageBox.fn.type.warning,
                        title: options.messages.dialogs.confirm,
                        message: kendo.format(options.messages.dialogs.warningOverwrite, found.join('`, `')),
                        actions: [
                            { action: 'ok', text: options.messages.dialogs.ok.text, primary: true, imageUrl: options.messages.dialogs.ok.imageUrl },
                            { action: 'cancel', text: options.messages.dialogs.cancel.text, primary: true, imageUrl: options.messages.dialogs.cancel.imageUrl }
                        ]
                    })
                        .done(function (e) {
                            if (e.action === 'ok') {
                                execUpload();
                            }
                        });
                } else {
                    execUpload();
                }
            },

            /**
             * Show upload progress
             * @private
             */
            _showUploadProgress: function () {
                // Disable buttons
                // Hide uplaod
                // Show progress bar
                this.listView.element.addClass('k-loading');
            },

            /**
             * Hide upload progress / Restore upload button
             * @private
             */
            _hideUploadProgress: function () {
                this.toolbar.find('.k-upload input[type=file]').val('');
                this.listView.element.removeClass('k-loading');
            },

            /**
             * Find a file by fileName
             * @param fileName
             * @returns {*}
             * @private
             */
            _findDataItem: function (fileName) {
                assert.type(STRING, fileName, kendo.format(assert.messages.type.default, 'fileName', STRING));
                assert.instanceof(ListView, this.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));
                assert.instanceof(DataSource, this.listView.dataSource, kendo.format(assert.messages.instanceof.default, 'this.listView.dataSource', 'kendo.data.DataSource'));
                assert.equal(this.collection.dataSource, this.listView.dataSource, kendo.format(assert.messages.equal.default, 'this.listView.dataSource', 'this.collection.dataSource'));
                var data = this.listView.dataSource.data();
                // Note the following matches compliant file renaming in app.rapi.js (but this is not very generic for a widget)
                var pos = fileName.lastIndexOf('.');
                // In fileName.substr(0, pos), any non-alphanumeric character shall be replaced by underscores
                // Then we shall simplify duplicated underscores and trim underscores at both ends
                var end = fileName.substr(0, pos).replace(/[^\w\\\/]+/gi, '_').replace(/_{2,}/g, '_').replace(/(^_|_$)/, '') + '.' + fileName.substr(pos + 1);
                for (var i = 0, length = data.length; i < length; i++) {
                    if (data[i].url.endsWith(end)) {
                        return data[i];
                    }
                }
            },

            /**
             * Create Data Item
             * @param file
             * @returns {*}
             * @private
             */
            _createDataItem: function (file) {
                assert.type(OBJECT, file, kendo.format(assert.messages.type.default, 'file', OBJECT));
                assert.type(NUMBER, file.size, kendo.format(assert.messages.type.default, 'file.size', NUMBER));
                assert.type(STRING, file.type, kendo.format(assert.messages.type.default, 'file.type', STRING));
                assert.type(STRING, file.url, kendo.format(assert.messages.type.default, 'file.url', STRING));
                assert.instanceof(ListView, this.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));
                assert.instanceof(DataSource, this.listView.dataSource, kendo.format(assert.messages.instanceof.default, 'this.listView.dataSource', 'kendo.data.DataSource'));
                assert.equal(this.collection.dataSource, this.listView.dataSource, kendo.format(assert.messages.equal.default, 'this.listView.dataSource', 'this.collection.dataSource'));
                var that = this;
                var ret = that._findDataItem(file.name);
                if (ret) {
                    ret.accept({
                        size: file.size,
                        type: file.type,
                        url: file.url
                    });
                    ret._override = true;
                } else {
                    ret = new that.listView.dataSource.reader.model({
                        size: file.size,
                        type: file.type,
                        url: file.url
                    });
                }
                return ret;
            },

            /**
             * Insert Data Item
             * @param model
             * @returns {*}
             * @private
             */
            _insertDataItem: function (model) {
                assert.instanceof(kendo.data.Model, model, kendo.format(assert.messages.instanceof.default, 'model', 'kendo.data.Model'));
                assert.instanceof(ListView, this.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));
                assert.instanceof(DataSource, this.listView.dataSource, kendo.format(assert.messages.instanceof.default, 'this.listView.dataSource', 'kendo.data.DataSource'));
                assert.equal(this.collection.dataSource, this.listView.dataSource, kendo.format(assert.messages.equal.default, 'this.listView.dataSource', 'this.collection.dataSource'));
                var index;
                if (model._override) {
                    return model;
                }
                var dataSource = this.listView.dataSource;
                var view = dataSource.view();
                for (var i = 0, length = view.length; i < length; i++) {
                    if (view[i].get('type') === 'f') {
                        index = i;
                        break;
                    }
                }
                return dataSource.insert(++index, model);
            },

            /**
             * Upload one file or blob
             * @param file
             * @private
             */
            _uploadFile: function (file) {
                // Note a window.File is a sort of window.Blob with a name
                // assert.instanceof(window.File, file, kendo.format(assert.messages.instanceof.default, 'file', 'File'));
                assert.instanceof(window.Blob, file, kendo.format(assert.messages.instanceof.default, 'file', 'Blob'));
                assert.type(STRING, file.name, kendo.format(assert.messages.type.default, 'file.name', STRING));
                assert.instanceof(ListView, this.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));
                assert.instanceof(DataSource, this.listView.dataSource, kendo.format(assert.messages.instanceof.default, 'this.listView.dataSource', 'kendo.data.DataSource'));
                assert.isPlainObject(this.listView.dataSource.transport, assert.format(assert.messages.isPlainObject.default, 'this.listView.dataSource.transport'));
                assert.isFunction(this.listView.dataSource.transport.upload, assert.format(assert.messages.isFunction.default, 'this.listView.dataSource.transport.upload'));
                var that = this;
                var dfd = $.Deferred();
                logger.debug({
                    message: 'Uploading file',
                    method: '_uploadFile'
                });
                // Call the transport defined in app.assets.js
                that.listView.dataSource.transport.upload({
                    data: {
                        file: file
                    },
                    success: function (response) {
                        assert.type(OBJECT, response, kendo.format(assert.messages.type.default, 'response', OBJECT));
                        assert.isArray(response.data, kendo.format(assert.messages.isArray.default, 'reponse.data'));
                        assert.equal(1, response.data.length, kendo.format(assert.messages.equal.default, 'response.data.length', 1));
                        // Upon successful upload, add a new dataItem to the listview dataSource
                        var model = that._createDataItem(response.data[0]);
                        assert.equal(model.name$(), response.data[0].name, kendo.format(assert.messages.equal.default, 'response.data[0].name', 'model.name$()'));
                        that._insertDataItem(model);
                        dfd.resolve(model);
                    },
                    error: function (xhr, status, error) {
                        dfd.reject(xhr, status, error);
                        that._xhrErrorHandler(xhr, status, error);
                    }
                });
                return dfd.promise();
            },

            /**
             * Event handler triggered when clicking any button
             * @param e
             * @private
             */
            _onButtonClick: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                if ($(e.currentTarget).has('.k-i-file-add').length) {
                    if (!this.trigger(CLICK, { action: ACTION.CREATE })) {
                        this._editNew();
                    }
                } else if ($(e.currentTarget).has('.k-i-track-changes-enable').length) {
                    if (!this.trigger(CLICK, { action: ACTION.EDIT })) {
                        this._editSelected();
                    }
                } else if ($(e.currentTarget).has('.k-i-delete').length) {
                    if (!this.trigger(CLICK, { action: ACTION.DESTROY })) {
                        this._deleteSelected();
                    }
                }
            },

            /**
             * Edit a new file in editor
             * Note: This function delegates openUrl and saveAs to the editor definition for the collection (in app.assets.js)
             * @private
             */
            _editNew: function () {
                assert.isPlainObject(this.collection, kendo.format(assert.messages.isPlainObject.default, 'this.collection'));
                var that = this;
                if (that.collection.editor) {
                    logger.debug({
                        method: '_editNew',
                        message: 'Open asset editor' // , data: dataItem.toJSON()
                    });
                    var windowWidget = that._getWindow();
                    windowWidget.viewModel = that._getWindowViewModel();
                    windowWidget.title(that.options.messages.dialogs.newFile);
                    windowWidget.content(that.collection.editor.template);
                    kendo.bind(windowWidget.element, windowWidget.viewModel);
                    if ($.isFunction(that.collection.editor.resize)) {
                        windowWidget.bind('resize', function (e) {
                            // that.collection.editor.resize is defined in app.assets.js
                            that.collection.editor.resize.bind(e.sender)(e);
                        });
                    }
                    windowWidget.center().open();
                    if (that.collection.editor.maximize) {
                        // Note: maximize requires a kendo.ui.Window instead of a kendo.ui.Dialog
                        windowWidget.maximize();
                    }
                }
            },

            /**
             * Edit selected file in editor
             * Note: This function delegates openUrl and saveAs to the editor definition for the collection (in app.assets.js)
             * @private
             */
            _editSelected: function () {
                assert.isPlainObject(this.collection, kendo.format(assert.messages.isPlainObject.default, 'this.collection'));
                assert.instanceof(kendo.ui.ListView, this.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));
                assert.equal(this.collection.dataSource, this.listView.dataSource, kendo.format(assert.messages.equal.default, 'this.listView.dataSource', 'this.collection.dataSource'));
                var that = this;
                var dataItem = that.listView.dataItem(that.listView.select());
                if (that.collection.editor && dataItem instanceof kendo.data.Model) {
                    logger.debug({ method: '_editSelected', message: 'Open asset editor', data: dataItem.toJSON() });
                    var windowWidget = that._getWindow();
                    windowWidget.viewModel = that._getWindowViewModel(dataItem.url$());
                    windowWidget.title(windowWidget.viewModel.url.split('/').pop());
                    windowWidget.content(that.collection.editor.template);
                    kendo.bind(windowWidget.element, windowWidget.viewModel);
                    if ($.isFunction(that.collection.editor.resize)) {
                        windowWidget.bind('resize', function (e) {
                            // that.collection.editor.resize is defined in app.assets.js
                            that.collection.editor.resize.bind(e.sender)(e);
                        });
                    }
                    if ($.isFunction(that.collection.editor.openUrl)) {
                        windowWidget.one('open', function (e) {
                            // that.collection.editor.openUrl is defined in app.assets.js
                            that.collection.editor.openUrl.bind(e.sender)(dataItem.url$());
                        });
                    } else {
                        logger.warn({ method: '_editSelected', message: 'The collection does not designate an editor implementing openUrl' });
                    }
                    windowWidget.center().open();
                    if (that.collection.editor.maximize) {
                        // Note: maximize requires a kendo.ui.Window instead of a kendo.ui.Dialog
                        windowWidget.maximize();
                    }
                }
            },

            /**
             * Delete selected file
             * @private
             */
            _deleteSelected: function () {
                assert.isPlainObject(this.collection, kendo.format(assert.messages.isPlainObject.default, 'this.collection'));
                assert.instanceof(kendo.ui.ListView, this.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));
                assert.equal(this.collection.dataSource, this.listView.dataSource, kendo.format(assert.messages.equal.default, 'this.listView.dataSource', 'this.collection.dataSource'));
                var dataItem = this.listView.dataItem(this.listView.select());
                if (dataItem instanceof kendo.data.Model) {
                    logger.debug({ method: '_deleteSelected', message: 'Asset deletion', data: dataItem.toJSON() });
                    this.listView.dataSource.remove(dataItem);
                    // dataSource.sync calls transport.destroy if available
                    this.listView.dataSource.sync();
                }
            },

            /**
             * Event handler when triggered drop down list is bound to dataSource
             * @param e
             * @private
             */
            /*
            _onDropDownListDataBound: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(DropDownList, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.DropDownList'));
                // A;ways select the first item in the list
                e.sender.select(0);
            },
            */

            /**
             * Event handler triggered when changing search input
             * @param e
             * @private
             */
            _onSearchInputChange: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'jQuery.Event'));
                assert.instanceof(window.HTMLInputElement, e.target, kendo.format(assert.messages.instanceof.default, 'e.target', 'HTMLInputElement'));
                assert.instanceof(ListView, this.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));
                assert.instanceof(DataSource, this.listView.dataSource, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.data.DataSource'));
                var filter = getDataSourceFilter(this.options.extensions);
                var value =  $(e.target).val();
                var search = { field: 'url', operator: 'contains', value: value };
                if ($.type(value) === STRING && value.length) {
                    if ($.isArray(filter)) {
                        // We assume all array items are valid filters
                        filter = filter.slice().push(search);
                    } else if ($.isPlainObject(filter) && $.type(filter.field) === STRING && $.type(filter.operator) === STRING && filter.value) {
                        filter = [filter, search];
                    } else if ($.isPlainObject(filter) && filter.logic === 'and' && $.isArray(filter.filters)) {
                        filter = $.extend(true, {}, filter).filters.push(search);
                    } else if ($.isPlainObject(filter) && filter.logic === 'or' && $.isArray(filter.filters)) {
                        filter = { logic: 'and', filters: [filter, search] };
                    } else {
                        filter = search;
                    }
                }
                // Note: no need to sort the default alphabetical order
                this.listView.dataSource.query({ filter: filter, page: 1, pageSize: this.listView.dataSource.pageSize() });
            },

            /**
             * Event handler triggered whhen clicking the clear icon in the search input
             * @private
             */
            _onSearchClearClick: function () {
                var searchInput = this.searchInput;
                assert.instanceof($, searchInput, kendo.format(assert.messages.instanceof.default, 'this.searchInput', 'jQuery'));
                if (searchInput.val() !== '') {
                    searchInput.val('').trigger(CHANGE + NS);
                }
            },

            /**
             * Add the list view to the file browser
             * Note: selecting a file in the list view updates the widget value() and triggers the change event
             * @private
             */
            _listView: function () {
                assert.instanceof($, this.fileBrowser, kendo.format(assert.messages.instanceof.default, 'this.fileBrowser', 'jQuery'));

                // Initialize the listView and pager with an empty dataSource
                var dataSource = new DataSource();

                // Build the listView
                this.listView = $('<ul class="k-reset k-floats k-tiles"/>')
                    .appendTo(this.fileBrowser)
                    .kendoListView({
                        // autoBind: false,
                        change: this._onListViewChange.bind(this),
                        // dataBinding: this._onListViewDataBinding.bind(this),
                        dataBound: this._onListViewDataBound.bind(this),
                        dataSource: dataSource,
                        selectable: true,
                        template: kendo.template(this.options.itemTemplate)
                    })
                    .data('kendoListView');
                assert.instanceof(ListView, this.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));

                // Build the page
                this.pager = $('<div class="k-pager-wrap"></div>')
                    .appendTo(this.fileBrowser)
                    .kendoPager({
                        autoBind: false, // dataSource has already been bound/read by this.listView
                        dataSource: dataSource
                    })
                    .data('kendoPager');
                assert.instanceof(Pager, this.pager, kendo.format(assert.messages.instanceof.default, 'this.pager', 'kendo.ui.Pager'));
            },

            /**
             * Event handler triggered when the asset selection changes in the list view
             * @private
             */
            _onListViewChange: function () {
                assert.instanceof(TabStrip, this.tabStrip, kendo.format(assert.messages.instanceof.default, 'this.tabStrip', 'kendo.ui.TabStrip'));
                assert.instanceof($, this.toolbar, kendo.format(assert.messages.instanceof.default, 'this.toolbar', 'jQuery'));
                if (this._selectedItem() instanceof ObservableObject) {
                    this.toolbar.find('.k-i-track-changes-enable').parent().removeClass('k-state-disabled');
                    this.toolbar.find('.k-i-delete').parent().removeClass('k-state-disabled');
                    this.trigger(CHANGE);
                }
            },

            /**
             * Compute size and update progress bar
             * @private
             */
            _computeStorageSize: function () {
                // Note: might be called before this.listView is assigned because the ListView constructor triggers a dataBound event
                if (this.listView instanceof ListView && this.progressBar instanceof ProgressBar) {
                    var size = 0;
                    var data = this.listView.dataSource.data();
                    for (var i = 0, length = data.length; i < length; i++) {
                        size += data[i].size;
                    }
                    this.progressBar.value(size / 100000); // TODO Total Size + use sizeFormatter to display text
                }
            },

            /**
             * Event handler triggered after data binding a new collection
             * @param e
             * @private
             */
            _onListViewDataBound: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(ListView, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.ListView'));
                var listView = e.sender; // Do not use this.listView because it might not yet have been assigned.
                this._computeStorageSize();
                if (e.action === 'add' && $.isArray(e.items) && e.items.length) {
                    listView._dataBoundUid = e.items[e.items.length - 1].uid;
                } else if (e.action === 'sync' && $.type(listView._dataBoundUid) === STRING) {
                    // action 'add' is followed by action 'sync'
                    listView.select(listView.element.children('[' + kendo.attr('uid') + '="' + listView._dataBoundUid + '"]'));
                    listView._dataBoundUid = undefined;
                } else {
                    listView.select(listView.element.children().first());
                }
            },

            /**
             * Returns the selected item (a data source item) from the list view
             * @returns {*}
             * @private
             */
            _selectedItem: function () {
                var listView = this.listView; // this.listView might not have yet been assigned
                if (listView instanceof kendo.ui.ListView) {
                    var selected = listView.select();
                    if (selected instanceof $ && selected.length) {
                        return this.listView.dataSource.getByUid(selected.attr(kendo.attr('uid')));
                    }
                }
            },

            /**
             * Get an editor window
             */
            _getWindow: function (/*options*/) {
                var windowWidget = $(WINDOW_SELECTOR).data('kendoWindow');
                // Find or create dialog frame
                if (!(windowWidget instanceof Window)) {
                    // Create dialog
                    windowWidget = $(kendo.format('<div class="{0} kj-no-padding kj-hidden-overflow"></div>', WINDOW_SELECTOR.substr(1)))
                        .appendTo(document.body)
                        .kendoWindow({
                            // Note: we are using a window to get maximize and close in the title bar
                            actions: ['Maximize', 'Close'],
                            content: '',
                            draggable: true,
                            modal: true,
                            resizable: true,
                            // title to be set
                            visible: false,
                            height: 600,
                            width: 800,
                            activate: function () {
                                windowWidget.trigger('resize');
                            },
                            close: function () {
                                // This is a reusable dialog, so we need to make sure it is ready for the next content
                                // windowWidget.element.removeClass(NO_PADDING_CLASS);
                                windowWidget.unbind('resize');
                                windowWidget.content(''); // The content method destroys widgets and unbinds data
                                windowWidget.viewModel = undefined;
                            }
                        })
                        .data('kendoWindow');
                    // Hides the display of "Fermer" after the "X" icon in the window title bar
                    // windowWidget.wrapper.find('.k-window-titlebar > .k-dialog-close > .k-font-icon.k-i-x').text('');
                }
                return windowWidget;
            },

            /**
             * Get a window view model
             * @param url
             * @private
             */
            _getWindowViewModel: function (url) {
                var that = this;
                return kendo.observable({
                    url: url || '',
                    onCommand: function (e) {
                        // The editor has a save button which emits an event which we hook here
                        // because the assetmanager knows transports to save whereas the editor is generic and does not know how or where to save.
                        if (e.command === 'ToolbarSaveCommand') {
                            e.preventDefault();
                            if (that.collection.editor && $.isFunction(that.collection.editor.saveAs)) {
                                // that.collection.editor.saveAs is defined in app.assets.js
                                // and e.params.value is the file name
                                that.collection.editor.saveAs.bind(e.sender)(e.params.value, that);
                            } else {
                                logger.warn({ method: '_getWindowViewModel', message: 'The collection does not designate an editor implementing saveAs' });
                            }
                        }
                    },
                    onDialog: function (e) {
                        if (e.name === 'vectorImage') { // TODO: this is not generic naming
                            e.preventDefault();
                            if (that.collection.editor && $.isFunction(that.collection.editor.openImageDialog)) {
                                that.collection.editor.openImageDialog.bind(e.sender)(/*  // TODO */);
                            } else {
                                logger.warn({ method: '_getWindowViewModel', message: 'The collection does not designate an editor implementing openImageDialog' });
                            }
                        }
                    }
                });
            },

            /**
             * $.ajax error handler
             * @param xhr
             * @param status
             * @param error
             * @private
             */
            _xhrErrorHandler: function (xhr, status, error) {
                // TODO Raise an error event - see _dataError
            },

            /**
             * Data error handler
             * @param e error event
             * @private
             */
            _dataError: function (e) {
                var that = this;
                if (!that.trigger(ERROR, e)) {
                    /*
                    // The following is code from kendo.ui.filebrowser
                    var status = e.xhr.status;
                    if (e.status == 'error') {
                        if (status == '404') {
                            that._showMessage(that.options.messages.directoryNotFound);
                        } else if (status != '0') {
                            that._showMessage('Error! The requested URL returned ' + status + ' - ' + e.xhr.statusText);
                        }
                    } else if (status == 'timeout') {
                        that._showMessage('Error! Server timeout.');
                    }
                    */

                    that.collection.dataSource.cancelChanges();
                }
            },

            /**
             * Setup drop zone
             * @private
             */
            _dropZone: function () {
                var that = this;
                if (supportsFileDrop()) {
                    that.dropZone = $('.k-dropzone', that.wrapper)
                        .on(DRAGENTER + NS, function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                        })
                        .on(DRAGOVER + NS, function (e) {
                            e.preventDefault();
                        })
                        .on(DROP + NS, that._onDrop.bind(that));
                    // The following add/remove classes used by kendo.upload.js that we match for a consistent UI
                    bindDragEventWrappers(
                        that.dropZone,
                        function () {
                            if (!that.wrapper.hasClass('k-state-disabled') && !that.dropZone.hasClass('k-state-nodrop')) {
                                that.dropZone.addClass('k-dropzone-hovered');
                            }
                        },
                        function () {
                            that.dropZone.removeClass('k-dropzone-hovered');
                        }
                    );
                    bindDragEventWrappers(
                        $(document),
                        function () {
                            if (!that.wrapper.hasClass('k-state-disabled') && !that.dropZone.hasClass('k-state-nodrop')) {
                                that.dropZone.addClass('k-dropzone-active');
                            }
                        },
                        function () {
                            that.dropZone.removeClass('k-dropzone-active');
                        }
                    );
                }
            },

            /**
             * Event handler for the drop event
             * @param e
             * @private
             */
            _onDrop: function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (this.dropZone instanceof $ && !this.dropZone.hasClass('.k-state-nodrop')) {
                    var dt = e.originalEvent.dataTransfer;
                    var fileList = dt.files;
                    this._uploadFileList(fileList);
                }
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper =  that.wrapper;
                // Unbind events
                $(document).off(NS); // Assuming there is only one assetmanager on the page
                if (that.toolbar instanceof $) {
                    that.toolbar.off(NS);
                }
                if (that.dropZone instanceof $) {
                    that.dropZone.off(NS);
                }
                kendo.unbind(wrapper);
                // Release references
                that.tabStrip = undefined;
                that.dropDownList = undefined;
                that.progressBar = undefined;
                that.searchInput = undefined;
                that.toolbar = undefined;
                that.listView = undefined;
                that.pager = undefined;
                that.fileBrowser = undefined;
                that.dropZone = undefined;
                if (that.dataSource instanceof DataSource && $.isFunction(that._errorHandler)) {
                    that.dataSource.unbind(ERROR, that._errorHandler);
                }
                that.dataSource = undefined;
                that._errorHandler = undefined;
                // Destroy kendo
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(AssetManager);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
