/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
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
        './vendor/kendo/kendo.tabstrip'
        // './vendor/kendo/kendo.upload'
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
        var TabStrip = kendo.ui.TabStrip;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.assetmanager');
        var NUMBER = 'number';
        var STRING = 'string';
        var OBJECT = 'object';
        var ARRAY = 'array';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var CLICK = 'click';
        var ERROR = 'error';
        var NS = '.kendoAssetManager';
        var DRAGENTER = 'dragenter';
        var DRAGOVER = 'dragover';
        var DROP = 'drop';
        var PROGRESS = 'progress';
        var WIDGET_CLASS = 'k-widget kj-assetmanager';
        var TOOLBAR_TMPL = '<div class="k-widget k-filebrowser-toolbar k-header k-floatwrap">' +
                '<div class="k-toolbar-wrap">' +
                    '<div class="k-widget k-upload"><div class="k-button k-button-icontext k-upload-button"><span class="k-icon k-i-plus"></span>#=messages.toolbar.upload#<input type="file" name="file" accept="#=accept#" multiple /></div></div>' +
                    '<button type="button" class="k-button k-button-icon k-state-disabled"><span class="k-icon k-i-close" /></button>' +
                    '<label style="display:none">#=messages.toolbar.filter#<select /></label>' +
                '</div>' +
                '<div class="k-tiles-arrange">' +
                    '<div class="k-progressbar"></div>' +
                    '<div class="k-widget k-search-wrap k-textbox"><input placeholder="#=messages.toolbar.search#" class="k-input"><a href="\\#" class="k-icon k-i-zoom k-search"></a></div>' +
                '</div>' +
            '</div>';
        var ITEM_TMPL = '<li class="k-tile" ' + kendo.attr('uid') + '="#=uid#">' + // ' + kendo.attr('type') + '="#=type$()#">' +
                '#if (/^image\\//.test(type$())) {#' +
                    '<div class="k-thumb"><img alt="#=name$()#" src="#=url$()#" class="k-image"></span></div>' +
                '#}else{#' +
                    '<div class="k-thumb"><span class="k-icon k-file"></span></div>' +
                '#}#' +
                '<strong>#=name$()#</strong>' +
                '<span class="k-filesize">#=size$()#</span>' +
            '</li>';

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

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /*

         TODO: remove if https://github.com/telerik/kendo-ui-core/pull/2802 is accepted
         See also https://github.com/telerik/kendo-ui-core/issues/2799
         Otherwise replace _onListViewDataBound with this

         var AssetListView = ListView.extend({
            options: $.extend(ListView.fn.options, { name: 'AssetListView'}),
             refresh: function (e) {
                 var that = this;
                 ListView.fn.refresh.call(that, e);
                 // the dataBinding event knows which data items have been added but occurs before the corresponding html list items are created
                 // whereas the select method expects a jQuery element as parameter.
                 // Unfortunately the dataBound event occurs after the html list itens are ccreated but does not know which data item have been added to the listview
                 // so we need to to specialize the listview to override the refresh method and select the last item added
                 // Monitor that.trigger(DATABINDING, ...) and that.trigger(DATABOUND) at
                 // https://github.com/telerik/kendo-ui-core/blob/master/src/kendo.listview.js#L232, and
                 // https://github.com/telerik/kendo-ui-core/blob/master/src/kendo.listview.js#L263
                 // until they both match as in that.trigger(DATABOUND, { action: e.action || "rebind", items: e.items, index: e.index });
                 if (e.action === 'add' && $.isArray(e.items) && e.items.length) {
                    that._uid = e.items[e.items.length - 1].uid;
                 } else if (e.action === 'sync' && $.type(that._uid) === STRING) {
                    // 'add' is followed by 'sync'
                    that.select(that.element.children('[' + kendo.attr('uid') + '="' + that._uid + '"]'));
                    that._uid = undefined;
                 } else {
                    that.select(that.element.children().first());
                 }
             }
         });

         kendo.ui.plugin(AssetListView);
         */

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
                transport: { read: function (options) { options.success({ total: 0, data: [] }); } },
                collections: [],
                schemes: {},
                extensions: [],
                messages: {
                    toolbar: {
                        upload: 'Upload',
                        delete: 'Delete',
                        filter: 'Collection: ',
                        search: 'Search'
                    },
                    tabs: {
                        default: 'Project'
                    },
                    data: {
                        defaultName: 'Uploading...',
                        defaultImage: '' // TODO
                    }
                }
            },

            /**
             * Set options
             * @param options
             */
            /*
            setOptions: function (options) {
                $.noop(); // TODO especially to change filters when extensions change
            },
            */

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE,
                ERROR
            ],

            /**
             * Gets the url of the selected item
             * @returns {*}
             */
            value: function () {
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
                if (this.progressBar instanceof kendo.ui.ProgressBar) {
                    return this.progressBar.value(progress);
                }
            },

            /**
             * Check that we have defined a transport for the Project tab
             * @returns {*|boolean}
             * @private
             */
            _hasProjectTransport: function () {
                return $.isPlainObject(this.options.transport) && $.type(this.options.transport.read) !== UNDEFINED && $.type(this.options.transport.create) !== UNDEFINED;
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
             * Add a tabStrip with as many tabs as collections
             * @private
             */
            _tabStrip: function () {
                assert.type(ARRAY, this.options.collections, kendo.format(assert.messages.type.default, 'this.options.collections', ARRAY));
                var collections = this.options.collections;
                var div = $('<div></div>');
                var ul = $('<ul></ul>').appendTo(div);

                // Add default tab
                if ($.isPlainObject(this.options.transport) && this.options.transport.read) {
                    ul.append('<li>' + this.options.messages.tabs.default + '</li>');
                    div.append('<div></div>');
                }

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

                assert.instanceof(TabStrip, this.tabStrip, kendo.format(assert.messages.instanceof.default, 'this.tabStrip', 'kendo.ui.TabStrip'));
            },

            /**
             * Add default content tab
             * Note: content shall be moved/shared accross tabs; Only the dataSource and toolbar are updated when changing tabs
             * @private
             */
            _tabContent: function () {
                assert.instanceof(TabStrip, this.tabStrip, kendo.format(assert.messages.instanceof.default, 'this.tabStrip', 'kendo.ui.TabStrip'));

                // Add the file browser wrapping div
                this.fileBrowser = $('<div class="k-filebrowser k-dropzone"></div>')
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
            _toolbar: function () {
                var that = this;
                var options = that.options;
                var template = kendo.template(options.toolbarTemplate);

                // Add template
                that.toolbar = $(template({
                    accept: (options.extensions || []).join(','), // @see http://www.w3schools.com/tags/att_input_accept.asp
                    messages: options.messages
                })).appendTo(that.fileBrowser);
                assert.instanceof($, that.toolbar, kendo.format(assert.messages.instanceof.default, 'this.toolbar', 'window.jQuery'));

                // Collection drop down list
                that.dropDownList = that.toolbar.find('div.k-toolbar-wrap select')
                    .kendoDropDownList({
                        dataSource: [],
                        change: $.proxy(that._onDropDownListChange, that)
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
                assert.instanceof(kendo.ui.ProgressBar, that.progressBar, kendo.format(assert.messages.instanceof.default, 'this.progressBar', 'kendo.ui.ProgressBar'));
                // Event handler used to report upload transport progress in app.assets.js
                $(document).on(PROGRESS + NS, function (e, value, status) {
                    that.progressBar.value(value);
                    if (status === 'complete') {
                        // TODO: display/limit total storage
                        setTimeout(function () {
                            that.progressBar.value(0);
                        }, 100);
                    }
                });

                // Search
                that.searchInput = that.toolbar
                    .find('input.k-input');
                assert.instanceof($, that.searchInput, kendo.format(assert.messages.instanceof.default, 'this.searchInput', 'window.jQuery'));

                // Other events
                that.toolbar
                    .on(CHANGE + NS, '.k-upload input[type=file]', $.proxy(that._onFileInputChange, that))
                    .on(CLICK + NS, 'button:not(.k-state-disabled):has(.k-i-close)', $.proxy(that._onDeleteButtonClick, that))
                    .on(CHANGE + NS, 'input.k-input', $.proxy(that._onSearchInputChange, that))
                    .on(CLICK + NS, 'a.k-i-close', $.proxy(that._onSearchClearClick, that));
            },

            /**
             * Event handler triggered when clicking the upload button and selecting a file (which changes the file input)
             * @param e
             * @private
             */
            _onFileInputChange: function (e) {
                var that = this;
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'window.jQuery.Event'));
                assert.instanceof(window.HTMLInputElement, e.target, kendo.format(assert.messages.instanceof.default, 'e.target', 'window.HTMLInputElement'));
                this._uploadFiles(e.target.files);
            },

            /**
             * Upload files
             * @param files
             * @private
             */
            _uploadFiles: function (files) {
                assert.instanceof(ListView, this.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));
                assert.ok(this.tabStrip.select().index() === 0 && this._hasProjectTransport(), 'The asset manager is expected to be configured with a transport for the project tab');
                var that = this;
                if (files instanceof window.FileList && files.length) {
                    that.listView.element.addClass('k-loading');
                    var finder = function (file) {
                        return that.dataSource.data().find(function (dataItem) {
                            return new RegExp('/' + file.name + '$').test(dataItem.url);
                        });
                    };
                    // Note: Add multiple attribute to html file input for multiple uploads
                    for (var i = 0, length = files.length; i < length; i++) {
                        // Find possible duplicate
                        var duplicate = finder(files[i]);
                        // Remove duplicate
                        if (duplicate instanceof kendo.data.ObservableObject) {
                            that.dataSource.remove(duplicate);
                        }
                        // Add new asset
                        that.dataSource.add({
                            size: files[i].size,
                            file: files[i]
                        });
                    }
                    // Note: syncing to the dataSource calls the create transport where you should actually upload your file,
                    // update the url and push to the dataSource using the options.success callback
                    // if there is an error, call options.error and cancel changes in the error event raised by the widget
                    that.dataSource.sync()
                        .always(function () {
                            that.toolbar.find('.k-upload input[type=file]').val('');
                            that.listView.element.removeClass('k-loading');
                        });
                }
            },

            /**
             * Event handler triggered when clicking the delete button
             * @private
             */
            _onDeleteButtonClick: function () {
                var that = this;
                var file = that.dataSource.get(that.value());
                if (file instanceof kendo.data.Model) {
                    that.dataSource.remove(file);
                    // dataSource.sync calls transport.destroy if available
                    that.dataSource.sync();
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
                // If we have a project transport, we have a project tab otherwise we don't and we substract 1
                this._resetTransport(this._hasProjectTransport() ? tabIndex - 1 : tabIndex, e.sender.selectedIndex /*, false*/);
            },

            /**
             * Event handler triggered when changing search input
             * @param e
             * @private
             */
            _onSearchInputChange: function (e) {
                assert.instanceof($.Event, e, kendo.format(assert.messages.instanceof.default, 'e', 'window.jQuery.Event'));
                assert.instanceof(window.HTMLInputElement, e.target, kendo.format(assert.messages.instanceof.default, 'e.target', 'window.HTMLInputElement'));
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
                this.dataSource.query({ filter: filter, page: 1, pageSize: this.dataSource.pageSize() });
            },

            /**
             * Event handler triggered whhen clicking the clear icon in the search input
             * @private
             */
            _onSearchClearClick: function () {
                var searchInput = this.searchInput;
                assert.instanceof($, searchInput, kendo.format(assert.messages.instanceof.default, 'this.searchInput', 'window.jQuery'));
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
                assert.instanceof(DataSource, this.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                this.listView = $('<ul class="k-reset k-floats k-tiles"/>')
                    .appendTo(this.fileBrowser)
                    .kendoListView({
                        // autoBind: false,
                        change: $.proxy(this._onListViewChange, this),
                        dataBinding: $.proxy(this._onListViewDataBinding, this),
                        dataBound: $.proxy(this._onListViewDataBound, this),
                        dataSource: this.dataSource,
                        selectable: true,
                        template: kendo.template(this.options.itemTemplate)
                    })
                    .data('kendoListView');
                this.pager = $('<div class="k-pager-wrap"></div>')
                    .appendTo(this.fileBrowser)
                    .kendoPager({
                        autoBind: false, // dataSource has already been bound/read by this.listView
                        dataSource: this.dataSource
                    })
                    .data('kendoPager');
                assert.instanceof(ListView, this.listView, kendo.format(assert.messages.instanceof.default, 'this.listView', 'kendo.ui.ListView'));
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
                    if (this.tabStrip.select().index() === 0) {
                        this.toolbar.find('.k-i-close').parent().removeClass('k-state-disabled').show();
                    }
                    this.trigger(CHANGE, { value: this.value() });
                }
            },

            /**
             * Event handler triggered when data binding a new collection
             * @private
             */
            _onListViewDataBinding: function () {
                assert.instanceof($, this.toolbar, kendo.format(assert.messages.instanceof.default, 'this.toolbar', 'jQuery'));
                this.toolbar.find('.k-i-close').parent().addClass('k-state-disabled').hide();
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
                assert.instanceof(DataSource, this.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                var listView = this.listView; // this.listView might not have yet been assigned
                if (listView instanceof kendo.ui.ListView) {
                    var selected = listView.select();
                    if (selected instanceof $ && selected.length) {
                        return this.dataSource.getByUid(selected.attr(kendo.attr('uid')));
                    }
                }
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
                assert.instanceof(DataSource, this.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));

                var oldIndex = this.tabStrip.select().index();
                var tabIndex = $(e.item).index();

                // Ensure all content holders have the same height
                this.tabStrip.contentHolder(tabIndex).height(this.tabStrip.contentHolder(oldIndex).height());

                // Move file browser to the selected tab
                this.fileBrowser.appendTo(this.tabStrip.contentHolder(tabIndex));

                // Show/hide upload and delete buttons which are only available on the default Tab
                this.fileBrowser.find('div.k-toolbar-wrap>.k-upload').toggle(tabIndex === 0 && this._hasProjectTransport());
                this.fileBrowser.find('div.k-toolbar-wrap>.k-button').toggle(tabIndex === 0 && this._hasProjectTransport());
                this.fileBrowser.find('div.k-toolbar-wrap>label').toggle(tabIndex > 0 || !this._hasProjectTransport());

                // Change data source transport
                // If we have a project transport, we have a project tab otherwise we don't and we substract 1
                this._resetTransport(this._hasProjectTransport() ? tabIndex - 1 : tabIndex, 0, true);

                // add/remove k-state-nodrop to dropZone
                if (this.dropZone instanceof $) {
                    this.dropZone.toggleClass('k-state-nodrop', tabIndex !== 0 || !this._hasProjectTransport());
                }
                // refresh pager
                this.pager.refresh();
            },

            /**
             * Change data source transport based on selected collection
             * @param colIndex
             * @param subIndex
             * @param all to also reset the toolbar drop down list data source
             * @private
             */
            _resetTransport: function (colIndex, subIndex, all) {

                // ATTENTION: If an index.json is downloaded but no image is displayed
                // possibly index.json is downloaded with Content-Type = binary/octet-stream instead of application/json
                // and data is therefore not parsed properly as a json stream

                function getTransport(options) {
                    var transport;
                    if (options) {
                        options.read = $.type(options.read) === STRING ? { url: options.read } : options.read;
                        transport = $.isFunction(options.read) ? options : new kendo.data.RemoteTransport(options);
                    } else {
                        transport = new kendo.data.LocalTransport({ data: [] });
                    }
                    return transport;
                }

                assert.type(NUMBER, colIndex, kendo.format(assert.messages.type.default, 'colIndex', NUMBER));
                assert.type(NUMBER, subIndex, kendo.format(assert.messages.type.default, 'subIndex', NUMBER));
                assert.type(ARRAY, this.options.collections, kendo.format(assert.messages.type.default, 'this.options.collections', ARRAY));
                assert.instanceof($, this.fileBrowser, kendo.format(assert.messages.instanceof.default, 'this.fileBrowser', 'jQuery'));
                assert.instanceof(DataSource, this.dataSource, kendo.format(assert.messages.instanceof.default, 'this.dataSource', 'kendo.data.DataSource'));
                assert.instanceof(DropDownList, this.dropDownList, kendo.format(assert.messages.instanceof.default, 'this.dropDownList', 'kendo.ui.DropDownList'));

                // Clear search
                this.searchInput.val('');
                // this.dataSource.filter(getDataSourceFilter(this.options.extensions));

                if (colIndex >= 0 && colIndex < this.options.collections.length) {
                    var collection = this.options.collections[colIndex];
                    if ($.isPlainObject(collection.transport)) {
                        this.dataSource.transport = getTransport(collection.transport);
                        this.dropDownList.setDataSource([]);
                        this.dropDownList.wrapper.parent().hide();
                    } else if ($.isArray(collection.collections) && collection.collections.length &&
                        $.isPlainObject(collection.collections[subIndex].transport)) {
                        this.dataSource.transport = getTransport(collection.collections[subIndex].transport);
                        if (all) {
                            this.dropDownList.setDataSource(collection.collections.map(function (item) {
                                return item.name;
                            }));
                            this.dropDownList.select(subIndex);
                            this.dropDownList.wrapper.parent().show();
                        }
                    }
                } else {
                    this.dataSource.transport = getTransport(this.options.transport);
                    this.dropDownList.setDataSource(null); // []
                    this.dropDownList.wrapper.parent().hide();
                }

                // this.dataSource.filter(getDataSourceFilter(this.options.extensions)); requires a read which raises dataBound twice on bound widgets
                // return this.dataSource.query({ filter: getDataSourceFilter(this.options.extensions) }); also requires read which raises dataBound twice on bound widgets
                this.dataSource._filter = getDataSourceFilter(this.options.extensions); // this does not raise a dataBound event
                return this.dataSource.read(); // this raises a dataBound event
            },

            /**
             * Sets/updates the data source
             * @private
             */
            _dataSource: function (transport) {

                var that = this;
                var options = that.options;

                if (that.dataSource instanceof DataSource && $.isFunction(that._errorHandler)) {
                    that.dataSource.unbind(ERROR, that._errorHandler);
                }
                that._errorHandler = $.proxy(that._dataError, that);
                that.dataSource = DataSource
                    .create({
                        filter: getDataSourceFilter(options.extensions),
                        schema: {
                            data: 'data',
                            model: {
                                id: 'url',
                                fields: {
                                    size: { type: NUMBER, editable: false },
                                    url:  { type: STRING, editable: false, nullable: true },
                                    file: { defaultValue: null } // Note: we need this for uploading files
                                },
                                name$: function () {
                                    var url = this.get('url');
                                    if ($.type(url) !== STRING) {
                                        return options.messages.data.defaultName;
                                    }
                                    return nameFormatter(url);
                                },
                                size$: function () {
                                    return sizeFormatter(this.get('size'));
                                },
                                type$: function () {
                                    var url = this.get('url');
                                    if ($.type(url) === UNDEFINED) {
                                        return 'application/octet-stream';
                                    }
                                    return typeFormatter(url);
                                },
                                url$: function () {
                                    var url = this.get('url');
                                    if ($.type(url) !== STRING) {
                                        return options.messages.data.defaultImage;
                                    }
                                    return urlFormatter(this.get('url'), options.schemes);
                                }
                            },
                            total: 'total',
                            type: 'json'
                        },
                        // keep default sort order
                        transport: $.isPlainObject(transport) ? transport : options.transport,
                        pageSize: 12
                    })
                    .bind(ERROR, that._errorHandler);

                // that.dataSource.filter(getDataSourceFilter(options.extensions));

            },

            /**
             * Data error handler
             * @param e
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
                    that.dataSource.cancelChanges();
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
                        .on(DROP + NS, $.proxy(that._onDrop, that));
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
                    var files = dt.files;
                    this._uploadFiles(files);
                }
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element =  that.element;
                // Unbind events
                $(document).off(NS); // Assuming there is only one assetmanager on the page
                if (that.toolbar instanceof $) {
                    that.toolbar.off(NS);
                }
                if (that.dropZone instanceof $) {
                    that.dropZone.off(NS);
                }
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
                kendo.destroy(element);
                // Remove widget class
                element.removeClass(WIDGET_CLASS)
            }

        });

        kendo.ui.plugin(AssetManager);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
