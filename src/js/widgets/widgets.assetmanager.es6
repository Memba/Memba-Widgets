/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO: review/test _errorHandler
// TODO total size + upload progress

// TODO finalize progress bar with total storage - https://github.com/kidoju/Kidoju-Widgets/issues/229
// TODO project tab does not always open properly - https://github.com/kidoju/Kidoju-Widgets/issues/243

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.binder';
import 'kendo.dropdownlist';
import 'kendo.listview';
import 'kendo.pager';
import 'kendo.progressbar';
import 'kendo.tabstrip';
// import 'kendo.upload'; // <--- does not work with AWS S3
import 'kendo.window';
// import './widgets.vectordrawing';
import '../dialogs/widgets.basedialog.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { isAnyArray } from '../common/window.util.es6';
import { AssetDataSource } from '../data/data.asset.es6';

const { FileList } = window;
const {
    attr,
    bind,
    data: { DataSource, ObservableObject, Model },
    destroy,
    format,
    roleSelector,
    template,
    ui: {
        BaseDialog,
        DropDownList,
        ListView,
        Pager,
        plugin,
        ProgressBar,
        TabStrip,
        Widget,
        Window
    },
    unbind
} = window.kendo;
const logger = new Logger('widgets.assetmanager');

const ERROR = 'error';
const NS = '.kendoAssetManager';
const DRAGENTER = 'dragenter';
const DRAGOVER = 'dragover';
const DROP = 'drop';
const PROGRESS = 'progress';
const WIDGET_CLASS = 'k-widget kj-assetmanager';
const WINDOW_SELECTOR = '.kj-assetmanager-window';
const TOOLBAR_TMPL =
    '<div class="k-widget k-filebrowser-toolbar k-header k-floatwrap">' +
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
const ITEM_TMPL =
    `<li class="k-tile" ${attr(CONSTANTS.UID)}="#=uid#">` + // ' + attr('type') + '="#=mime$()#">' +
    `#if (/^image\\//.test(mime$())) {#` +
    `<div class="k-thumb"><img alt="#=name$()#" src="#=url$()#" class="k-image"></span></div>` +
    `#}else{#` +
    `<div class="k-thumb"><span class="k-icon k-i-file"></span></div>` +
    `#}#` +
    `<strong>#=name$()#</strong>` +
    `<span class="k-filesize">#=size$()#</span>` +
    `</li>`;
const ACTION = {
    CREATE: 'create',
    EDIT: 'edit',
    EXPORT: 'export',
    DESTROY: 'destroy',
    UPLOAD: 'upload'
};

/** *******************************************************************************
 * Helpers
 ******************************************************************************** */

/**
 * Detects file drag and drop
 * @see https://github.com/Modernizr/Modernizr/issues/57
 * @returns {boolean}
 */
function supportsFileDrop() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = /chrome/.test(userAgent);
    const isSafari = !isChrome && /safari/.test(userAgent);
    const isWindowsSafari = isSafari && /windows/.test(userAgent);
    return !isWindowsSafari && !!FileList;
}

/**
 * Helper copied from kendo.upload.js
 * @param element
 * @param onDragEnter
 * @param onDragLeave
 */
function bindDragEventWrappers(element, onDragEnter, onDragLeave) {
    let hideInterval;
    let lastDrag;
    element
        .on(DRAGENTER + NS, e => {
            onDragEnter(e);
            lastDrag = new Date();
            if (!hideInterval) {
                hideInterval = setInterval(() => {
                    const sinceLastDrag = new Date() - lastDrag;
                    if (sinceLastDrag > 100) {
                        onDragLeave();
                        clearInterval(hideInterval);
                        hideInterval = null;
                    }
                }, 100);
            }
        })
        .on(DRAGOVER + NS, () => {
            lastDrag = new Date();
        });
}

/**
 * Returns the total size of a file list of type FileList or Array or ObservableArray which are all iterable
 * @param fileList
 * @returns {number}
 */
function totalSize(fileList) {
    let ret = 0;
    if (fileList instanceof FileList || isAnyArray(fileList)) {
        for (let i = 0, { length } = fileList; i < length; i++) {
            ret += fileList[i].size || 0;
        }
    }
    return ret;
}

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

/**
 * AssetManager
 * @class AssetManager
 * @extends Widget
 */
const AssetManager = Widget.extend({
    /**
     * Init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._initDataSources();
        this._render();
        // TODO that.enable(that.element.prop('disabled') ? false : !!that.options.enable);
    },

    /**
     * Options
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
                    imageUrl:
                        'https://cdn.kidoju.com/images/o_collection/svg/office/close.svg',
                    text: 'Cancel'
                },
                confirm: 'Confirm',
                newFile: 'New file',
                ok: {
                    imageUrl:
                        'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg',
                    text: 'OK'
                },
                warningOverwrite:
                    'Do you really want to overwite these files: `{0}`? Note that file updates take time to propagate across our Content Delivery Network while new files propagate instantly.'
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
     * Events
     * @property events
     */
    events: [
        CONSTANTS.CHANGE,
        CONSTANTS.CLICK, // TODO beforeOpen
        ERROR
    ],

    /**
     * Gets the url of the selected item
     * @returns {*}
     */
    value() {
        // TODO: value cannot change when selecting on Google tab, because they need to be imported first
        const that = this;
        const selected = that._selectedItem();
        if (selected instanceof ObservableObject) {
            return selected.url;
        }
    },

    /**
     * Gets/Sets the value of the progress bar
     * @returns {*}
     */
    progress(progress) {
        if (this.progressBar instanceof ProgressBar) {
            return this.progressBar.value(progress);
        }
    },

    /**
     * Select an item in the list view
     * @param index
     */
    select(index) {
        if ($.type(index) === CONSTANTS.NUMBER) {
            index = this.listView.items().get(index);
        } else if ($.type(index) === CONSTANTS.STRING) {
            index = $(index);
        }
        return this.listView.select(index);
    },

    /**
     * Initialize data sources from collections
     * @method _initDataSources
     * @private
     */
    _initDataSources() {
        this._errorHandler = this._dataError.bind(this);
        const that = this;
        function makeDataSources(collections, level) {
            const ret = [];
            collections.forEach(collection => {
                if (Array.isArray(collection.collections)) {
                    assert.ok(
                        level === 0,
                        'AssetManager does not support more than one level of sub-collections'
                    );
                    // Make it recursive for sub-collections displayed in drop down list
                    ret.push({
                        name: collection.name,
                        collections: makeDataSources(
                            collection.collections,
                            level + 1
                        )
                    });
                } else {
                    // This is a collection with transport
                    // Without sub-collection, make it a dataSource
                    const dataSource = AssetDataSource.create(
                        that._extendDataSourceOptions(collection)
                    );
                    if ($.isFunction(that._errorHandler)) {
                        dataSource.bind(ERROR, that._errorHandler);
                    }
                    ret.push({
                        dataSource,
                        level,
                        editor: collection.editor,
                        name: collection.name,
                        tools: collection.tools
                    });
                }
            });
            return ret;
        }
        this._collections = makeDataSources(this.options.collections, 0);
    },

    /**
     * Extend data source parameters
     * @method _extendDataSourceOptions
     * @param params
     * @returns {*}
     * @private
     */
    _extendDataSourceOptions(params) {
        const { options } = this;
        return $.extend(
            true,
            {
                filter: this._getDataSourceFilter(options.extensions),
                page: 1,
                pageSize: 12,
                schema: {
                    data(response) {
                        return $.isPlainObject(response) &&
                            Array.isArray(response.data) &&
                            $.type(response.total) === CONSTANTS.NUMBER
                            ? response.data
                            : response;
                    },
                    error: 'error',
                    total: 'total'
                },
                // IMPORTANT: schemes specializees model and modelBase in AssetDataSource
                schemes: options.schemes,
                serverFiltering: false,
                serverPaging: false
            },
            params
        );
    },

    /**
     * Gets a datasource filter from an array of extensions
     * @method _getDataSourceFilter
     * @param extensions
     * @returns {*}
     */
    _getDataSourceFilter(extensions = []) {
        assert.isArray(
            extensions,
            assert.format(assert.messages.isArray.default, 'extensions')
        );
        let ret = null;
        if (extensions.length === 1) {
            ret = { field: 'url', operator: 'endswith', value: extensions[0] };
        } else if (extensions.length > 1) {
            ret = { logic: 'or', filters: [] };
            extensions.forEach(value => {
                ret.filters.push({
                    field: 'url',
                    operator: 'endswith',
                    value
                });
            });
        }
        return ret;
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        this.wrapper = this.element.addClass(WIDGET_CLASS);
        this._tabStrip();
        this._tabContent();
        this._dropZone();

        // TODO Maybe this deserves a specific API function
        // Select the first tab, which triggers _onTabSelect
        this.tabStrip.select(0);
        // Set the contentHolder height to 'auto' because tabStrip sets it to 0
        this.tabStrip.contentHolder(0).height('auto');
    },

    /**
     * Add a tabStrip with an Edit tab + as many tabs as collections
     * @method _tabStrip
     * @private
     */
    _tabStrip() {
        assert.isArray(
            this._collections,
            assert.format(assert.messages.isArray.default, 'this._collections')
        );
        assert.hasLength(
            this._collections,
            assert.format(
                assert.messages.hasLength.default,
                'this._collections'
            )
        );

        // Add a tabStrip
        const div = $(`<${CONSTANTS.DIV}/>`);
        const ul = $(`<${CONSTANTS.UL}/>`).appendTo(div);

        // Add a tab per collection
        this._collections.forEach(collection => {
            ul.append(`<li>${collection.name}</li>`);
            div.append(`<${CONSTANTS.DIV}/>`);
        });
        div.appendTo(this.element);

        // Set the tabStrip item of the component
        this.tabStrip = div
            .kendoTabStrip({
                tabPosition: 'left',
                animation: false, // { open: { effects: 'fadeIn' }, close: { effects: 'fadeOut' } },
                select: this._onTabSelect.bind(this)
            })
            .data('kendoTabStrip');
    },

    /**
     * Add tab content
     * Note: content shall be moved/shared accross tabs
     * Only the dataSource and toolbar are updated when changing tabs
     * @method _tabContent
     * @private
     */
    _tabContent() {
        assert.instanceof(
            TabStrip,
            this.tabStrip,
            assert.format(
                assert.messages.instanceof.default,
                'this.tabStrip',
                'kendo.ui.TabStrip'
            )
        );

        // Add the file browser wrapping div
        this.fileBrowser = $(`<${CONSTANTS.DIV}/>`)
            .addClass('k-filebrowser k-dropzone')
            .appendTo(this.tabStrip.contentHolder(0));

        // Add the toolbar
        this._tabToolbar();

        // Add the list view
        this._listView();
    },

    /**
     * Add the toolbar to the fileBrowser
     * Note: all collections are read-only so upload/delete is hidden except on the default tab
     * @method _tabToolbar
     * @private
     */
    _tabToolbar() {
        const { options } = this;
        const tmpl = template(options.toolbarTemplate);

        // Add template
        this.toolbar = $(
            tmpl({
                accept: (options.extensions || []).join(','), // @see http://www.w3schools.com/tags/att_input_accept.asp
                messages: options.messages
            })
        ).appendTo(this.fileBrowser);

        // Collection drop down list
        // this.dropDownList = this.toolbar.find('div.k-toolbar-wrap select')
        this.dropDownList = this.toolbar
            .find(roleSelector('dropdownlist'))
            .kendoDropDownList({
                dataSource: [],
                dataTextField: 'name',
                dataValueField: 'name',
                change: this._onDropDownListChange.bind(this)
            })
            .data('kendoDropDownList');

        // Progress bar
        const progressBar = this.toolbar
            .find('div.k-tiles-arrange .k-progressbar')
            .kendoProgressBar({
                type: 'percent',
                min: 0,
                max: 1,
                animation: {
                    duration: 600
                }
            })
            .data('kendoProgressBar');
        this.progressBar = progressBar;

        // Event handler used to report upload transport progress in app.assets.js
        $(document).on(`${CONSTANTS.PROGRESS}${NS}`, (e, value, status) => {
            progressBar.value(value);
            if (status === 'complete') {
                // TODO: display/limit total storage
                setTimeout(() => {
                    progressBar.value(0);
                }, 100);
            }
        });

        // Search
        this.searchInput = this.toolbar.find('input.k-input');

        // Other events
        this.toolbar
            .on(
                `${CONSTANTS.CHANGE}${NS}`,
                '.k-upload input[type=file]',
                this._onFileInputChange.bind(this)
            )
            .on(
                `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TOUCHEND}${NS}`,
                'button:not(.k-state-disabled)',
                this._onButtonClick.bind(this)
            )
            .on(
                `${CONSTANTS.CHANGE}${NS}`,
                'input.k-input',
                this._onSearchInputChange.bind(this)
            )
            .on(
                // TODO is this ever occuring?
                `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TOUCHEND}${NS}`,
                'a.k-i-close',
                this._onSearchClearClick.bind(this)
            );
    },

    /**
     * Event handler triggered when selecting a tab
     * @param e
     * @private
     */
    _onTabSelect(e) {
        assert.isNonEmptyPlainObject(
            e,
            assert.format(assert.messages.isNonEmptyPlainObject.default, 'e')
        );
        assert.instanceof(
            window.HTMLLIElement,
            e.item,
            assert.format(
                assert.messages.instanceof.default,
                'e.item',
                'HTMLLIElement'
            )
        );
        assert.instanceof(
            TabStrip,
            this.tabStrip,
            assert.format(
                assert.messages.instanceof.default,
                'this.tabStrip',
                'kendo.ui.TabStrip'
            )
        );
        assert.instanceof(
            $,
            this.fileBrowser,
            assert.format(
                assert.messages.instanceof.default,
                'this.fileBrowser',
                'jQuery'
            )
        );
        assert.isArray(
            this._collections,
            assert.format(assert.messages.isArray.default, 'this._collections')
        );

        // var oldIndex = this.tabStrip.select().index();
        const tabIndex = $(e.item).index();

        // Set the current collection
        const collection = this._collections[tabIndex];
        this.collection = collection;
        if (
            Array.isArray(collection.collections) &&
            collection.collections.length
        ) {
            [this.collection] = collection.collections;
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
    _updateTab() {
        assert.isArray(
            this._collections,
            assert.format(assert.messages.isArray.default, 'this._collections')
        );
        assert.isNonEmptyPlainObject(
            this.collection,
            assert.format(
                assert.messages.isNonEmptyPlainObject.default,
                'this.collection'
            )
        );
        const { collection } = this;
        const tools = collection.tools || [];

        // Show/hide upload and delete buttons which are only available on tabs corresponding to editable collections
        this.toolbar
            .find('.k-toolbar-wrap > .k-label')
            .toggle(collection.level > 0);
        this.toolbar
            .find('.k-toolbar-wrap >.k-upload')
            .toggle(tools.indexOf('upload') > -1);
        this.toolbar
            .find('.k-toolbar-wrap >.k-button')
            .has('.k-i-file-add')
            .toggle(tools.indexOf('create') > -1);
        this.toolbar
            .find('.k-toolbar-wrap >.k-button')
            .has('.k-i-track-changes-enable')
            .toggle(tools.indexOf('edit') > -1);
        this.toolbar
            .find('.k-toolbar-wrap >.k-button')
            .has('.k-i-delete')
            .toggle(tools.indexOf('destroy') > -1);
        this.toolbar
            .find('div.k-tiles-arrange .k-progressbar')
            .toggle(!!tools.length);

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
    _onDropDownListChange(e) {
        assert.isNonEmptyPlainObject(
            e,
            assert.format(assert.messages.isNonEmptyPlainObject.default, 'e')
        );
        assert.instanceof(
            DropDownList,
            e.sender,
            assert.format(
                assert.messages.instanceof.default,
                'e.sender',
                'kendo.ui.DropDownList'
            )
        );
        assert.instanceof(
            TabStrip,
            this.tabStrip,
            assert.format(
                assert.messages.instanceof.default,
                'this.tabStrip',
                'kendo.ui.TabStrip'
            )
        );

        const tabIndex = this.tabStrip.select().index();

        // Set the current collection
        const parent = this._collections[tabIndex];
        assert.isArray(
            parent.collections,
            assert.format(assert.messages.isArray.default, 'parent.collections')
        );
        const found = parent.collections.filter(
            item => item.name === e.sender.value()
        );
        [this.collection] = found;
        this._updateTab();
    },

    /**
     * Event handler triggered when clicking the upload button and selecting a file (which changes the file input)
     * @param e
     * @private
     */
    _onFileInputChange(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        assert.instanceof(
            window.HTMLInputElement,
            e.target,
            assert.format(
                assert.messages.instanceof.default,
                'e.target',
                'HTMLInputElement'
            )
        );
        // Note: Set multiple attribute onto html file input tag for multiple uploads
        const fileList = e.target.files;
        if (fileList instanceof FileList && fileList.length) {
            this._uploadFileList(fileList);
        }
    },

    /**
     * Upload a file list
     * @param fileList
     * @private
     */
    _uploadFileList(fileList) {
        assert.instanceof(
            FileList,
            fileList,
            assert.format(
                assert.messages.instanceof.default,
                'fileList',
                'FileList'
            )
        );
        const that = this;
        function execUpload() {
            const promises = fileList.map(file => that._uploadFile(file));
            that._showUploadProgress();
            $.when(...promises).always(that._hideUploadProgress.bind(that));
        }

        const { options } = this;
        const found = [];
        for (let i = 0, { length } = fileList; i < length; i++) {
            const dataItem = that._findDataItem(fileList[i].name);
            if (dataItem) {
                found.push(dataItem.name$());
            }
        }
        if (found.length) {
            window.kidoju.dialogs
                .openAlert({
                    type: BaseDialog.fn.type.warning,
                    title: options.messages.dialogs.confirm,
                    message: format(
                        options.messages.dialogs.warningOverwrite,
                        found.join('`, `')
                    )
                })
                .then(e => {
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
    _showUploadProgress() {
        // Disable buttons
        // Hide uplaod
        // Show progress bar
        this.listView.element.addClass('k-loading');
    },

    /**
     * Hide upload progress / Restore upload button
     * @private
     */
    _hideUploadProgress() {
        this.toolbar.find('.k-upload input[type=file]').val('');
        this.listView.element.removeClass('k-loading');
    },

    /**
     * Find a file by fileName
     * @param fileName
     * @returns {*}
     * @private
     */
    _findDataItem(fileName) {
        assert.type(
            CONSTANTS.STRING,
            fileName,
            assert.format(
                assert.messages.type.default,
                'fileName',
                CONSTANTS.STRING
            )
        );
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        assert.instanceof(
            DataSource,
            this.listView.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView.dataSource',
                'kendo.data.DataSource'
            )
        );
        assert.equal(
            this.collection.dataSource,
            this.listView.dataSource,
            assert.format(
                assert.messages.equal.default,
                'this.listView.dataSource',
                'this.collection.dataSource'
            )
        );
        const data = this.listView.dataSource.data();
        // Note the following matches compliant file renaming in app.rapi.js (but this is not very generic for a widget)
        const pos = fileName.lastIndexOf('.');
        // In fileName.substr(0, pos), any non-alphanumeric character shall be replaced by underscores
        // Then we shall simplify duplicated underscores and trim underscores at both ends
        const end = `${fileName
            .substr(0, pos)
            .replace(/[^\w\\/]+/gi, '_')
            .replace(/_{2,}/g, '_')
            .replace(/(^_|_$)/, '')}.${fileName.substr(pos + 1)}`;
        let ret;
        for (let i = 0, { length } = data; i < length; i++) {
            if (data[i].url.endsWith(end)) {
                ret = data[i];
                break;
            }
        }
        return ret;
    },

    /**
     * Create Data Item
     * @method _createDataItem
     * @param file
     * @returns {*}
     * @private
     */
    _createDataItem(file) {
        //debugger;
        assert.type(
            CONSTANTS.OBJECT,
            file,
            assert.format(
                assert.messages.type.default,
                'file',
                CONSTANTS.OBJECT
            )
        );
        assert.type(
            CONSTANTS.NUMBER,
            file.size,
            assert.format(
                assert.messages.type.default,
                'file.size',
                CONSTANTS.NUMBER
            )
        );
        assert.type(
            CONSTANTS.STRING,
            file.type,
            assert.format(
                assert.messages.type.default,
                'file.type',
                CONSTANTS.STRING
            )
        );
        assert.type(
            CONSTANTS.STRING,
            file.url,
            assert.format(
                assert.messages.type.default,
                'file.url',
                CONSTANTS.STRING
            )
        );
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        assert.instanceof(
            DataSource,
            this.listView.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView.dataSource',
                'kendo.data.DataSource'
            )
        );
        assert.equal(
            this.collection.dataSource,
            this.listView.dataSource,
            assert.format(
                assert.messages.equal.default,
                'this.listView.dataSource',
                'this.collection.dataSource'
            )
        );
        const that = this;
        let ret = that._findDataItem(file.name);
        if (ret) {
            ret.accept({
                size: file.size,
                type: file.type,
                url: file.url
            });
            ret._override = true;
        } else {
            // eslint-disable-next-line new-cap
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
    _insertDataItem(model) {
        assert.instanceof(
            Model, // TODO Asset
            model,
            assert.format(
                assert.messages.instanceof.default,
                'model',
                'kendo.data.Model'
            )
        );
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        assert.instanceof(
            DataSource,
            this.listView.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView.dataSource',
                'kendo.data.DataSource'
            )
        );
        assert.equal(
            this.collection.dataSource,
            this.listView.dataSource,
            assert.format(
                assert.messages.equal.default,
                'this.listView.dataSource',
                'this.collection.dataSource'
            )
        );
        let index;
        if (model._override) {
            return model;
        }
        const { dataSource } = this.listView;
        const view = dataSource.view(); // TODO or data() ????
        for (let i = 0, { length } = view; i < length; i++) {
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
    _uploadFile(file) {
        // Note a window.File is a sort of window.Blob with a name
        // assert.instanceof(window.File, file, assert.format(assert.messages.instanceof.default, 'file', 'File'));
        assert.instanceof(
            window.Blob,
            file,
            assert.format(assert.messages.instanceof.default, 'file', 'Blob')
        );
        assert.type(
            CONSTANTS.STRING,
            file.name,
            assert.format(
                assert.messages.type.default,
                'file.name',
                CONSTANTS.STRING
            )
        );
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        assert.instanceof(
            DataSource,
            this.listView.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView.dataSource',
                'kendo.data.DataSource'
            )
        );
        assert.isNonEmptyPlainObject(
            this.listView.dataSource.transport,
            assert.format(
                assert.messages.isNonEmptyPlainObject.default,
                'this.listView.dataSource.transport'
            )
        );
        assert.isFunction(
            this.listView.dataSource.transport.upload,
            assert.format(
                assert.messages.isFunction.default,
                'this.listView.dataSource.transport.upload'
            )
        );
        const that = this;
        const dfd = $.Deferred();
        logger.debug({
            message: 'Uploading file',
            method: '_uploadFile'
        });
        // Call the transport defined in app.assets.js
        that.listView.dataSource.transport.upload({
            data: {
                file
            },
            success(response) {
                assert.type(
                    CONSTANTS.OBJECT,
                    response,
                    assert.format(
                        assert.messages.type.default,
                        'response',
                        CONSTANTS.OBJECT
                    )
                );
                assert.isArray(
                    response.data,
                    assert.format(
                        assert.messages.isArray.default,
                        'reponse.data'
                    )
                );
                assert.equal(
                    1,
                    response.data.length,
                    assert.format(
                        assert.messages.equal.default,
                        'response.data.length',
                        1
                    )
                );
                // Upon successful upload, add a new dataItem to the listview dataSource
                const model = that._createDataItem(response.data[0]);
                assert.equal(
                    model.name$(),
                    response.data[0].name,
                    assert.format(
                        assert.messages.equal.default,
                        'response.data[0].name',
                        'model.name$()'
                    )
                );
                that._insertDataItem(model);
                dfd.resolve(model);
            },
            error(xhr, status, error) {
                dfd.reject(xhr, status, error);
                that._xhrErrorHandler(xhr, status, error); // TODO
            }
        });
        return dfd.promise();
    },

    /**
     * Event handler triggered when clicking any button
     * @param e
     * @private
     */
    _onButtonClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        if ($(e.currentTarget).has('.k-i-file-add').length) {
            if (!this.trigger(CONSTANTS.CLICK, { action: ACTION.CREATE })) {
                this._editNew();
            }
        } else if ($(e.currentTarget).has('.k-i-track-changes-enable').length) {
            if (!this.trigger(CONSTANTS.CLICK, { action: ACTION.EDIT })) {
                this._editSelected();
            }
        } else if ($(e.currentTarget).has('.k-i-delete').length) {
            if (!this.trigger(CONSTANTS.CLICK, { action: ACTION.DESTROY })) {
                this._deleteSelected();
            }
        }
    },

    /**
     * Edit a new file in editor
     * Note: This function delegates openUrl and saveAs to the editor definition for the collection (in app.assets.js)
     * @private
     */
    _editNew() {
        assert.isNonEmptyPlainObject(
            this.collection,
            assert.format(
                assert.messages.isNonEmptyPlainObject.default,
                'this.collection'
            )
        );
        const that = this;
        if (that.collection.editor) {
            logger.debug({
                method: '_editNew',
                message: 'Open asset editor' // , data: dataItem.toJSON()
            });
            const windowWidget = that._getWindow();
            windowWidget.viewModel = that._getWindowViewModel();
            windowWidget.title(that.options.messages.dialogs.newFile);
            windowWidget.content(that.collection.editor.template);
            bind(windowWidget.element, windowWidget.viewModel);
            if ($.isFunction(that.collection.editor.resize)) {
                windowWidget.bind('resize', e => {
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
    _editSelected() {
        assert.isNonEmptyPlainObject(
            this.collection,
            assert.format(
                assert.messages.isNonEmptyPlainObject.default,
                'this.collection'
            )
        );
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        assert.equal(
            this.collection.dataSource,
            this.listView.dataSource,
            assert.format(
                assert.messages.equal.default,
                'this.listView.dataSource',
                'this.collection.dataSource'
            )
        );
        const that = this;
        const dataItem = that.listView.dataItem(that.listView.select());
        if (that.collection.editor && dataItem instanceof Model) {
            logger.debug({
                method: '_editSelected',
                message: 'Open asset editor',
                data: dataItem.toJSON()
            });
            const windowWidget = that._getWindow();
            windowWidget.viewModel = that._getWindowViewModel(dataItem.url$());
            windowWidget.title(windowWidget.viewModel.url.split('/').pop());
            windowWidget.content(that.collection.editor.template);
            bind(windowWidget.element, windowWidget.viewModel);
            if ($.isFunction(that.collection.editor.resize)) {
                windowWidget.bind('resize', e => {
                    // that.collection.editor.resize is defined in app.assets.js
                    that.collection.editor.resize.bind(e.sender)(e);
                });
            }
            if ($.isFunction(that.collection.editor.openUrl)) {
                windowWidget.one('open', e => {
                    // that.collection.editor.openUrl is defined in app.assets.js
                    that.collection.editor.openUrl.bind(e.sender)(
                        dataItem.url$()
                    );
                });
            } else {
                logger.warn({
                    method: '_editSelected',
                    message:
                        'The collection does not designate an editor implementing openUrl'
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
     * Delete selected file
     * @private
     */
    _deleteSelected() {
        assert.isNonEmptyPlainObject(
            this.collection,
            assert.format(
                assert.messages.isNonEmptyPlainObject.default,
                'this.collection'
            )
        );
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        assert.equal(
            this.collection.dataSource,
            this.listView.dataSource,
            assert.format(
                assert.messages.equal.default,
                'this.listView.dataSource',
                'this.collection.dataSource'
            )
        );
        const dataItem = this.listView.dataItem(this.listView.select());
        if (dataItem instanceof Model) {
            logger.debug({
                method: '_deleteSelected',
                message: 'Asset deletion',
                data: dataItem.toJSON()
            });
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
                assert.isNonEmptyPlainObject(e, assert.format(assert.messages.isNonEmptyPlainObject.default, 'e'));
                assert.instanceof(DropDownList, e.sender, assert.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.DropDownList'));
                // A;ways select the first item in the list
                e.sender.select(0);
            },
            */

    /**
     * Event handler triggered when changing search input
     * @param e
     * @private
     */
    _onSearchInputChange(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        assert.instanceof(
            window.HTMLInputElement,
            e.target,
            assert.format(
                assert.messages.instanceof.default,
                'e.target',
                'HTMLInputElement'
            )
        );
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        assert.instanceof(
            DataSource,
            this.listView.dataSource,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.data.DataSource'
            )
        );
        let filter = this._getDataSourceFilter(this.options.extensions);
        const value = $(e.target).val();
        const search = { field: 'url', operator: 'contains', value };
        if ($.type(value) === CONSTANTS.STRING && value.length) {
            if ($.isArray(filter)) {
                // We assume all array items are valid filters
                filter = filter.slice().push(search);
            } else if (
                $.isPlainObject(filter) &&
                $.type(filter.field) === CONSTANTS.STRING &&
                $.type(filter.operator) === CONSTANTS.STRING &&
                filter.value
            ) {
                filter = [filter, search];
            } else if (
                $.isPlainObject(filter) &&
                filter.logic === 'and' &&
                $.isArray(filter.filters)
            ) {
                filter = $.extend(true, {}, filter).filters.push(search);
            } else if (
                $.isPlainObject(filter) &&
                filter.logic === 'or' &&
                $.isArray(filter.filters)
            ) {
                filter = { logic: 'and', filters: [filter, search] };
            } else {
                filter = search;
            }
        }
        // Note: no need to sort the default alphabetical order
        this.listView.dataSource.query({
            filter,
            page: 1,
            pageSize: this.listView.dataSource.pageSize()
        });
    },

    /**
     * Event handler triggered whhen clicking the clear icon in the search input
     * @private
     */
    _onSearchClearClick() {
        const searchInput = this.searchInput;
        assert.instanceof(
            $,
            searchInput,
            assert.format(
                assert.messages.instanceof.default,
                'this.searchInput',
                'jQuery'
            )
        );
        if (searchInput.val() !== '') {
            searchInput.val('').trigger(CONSTANTS.CHANGE + NS);
        }
    },

    /**
     * Add the list view to the file browser
     * Note: selecting a file in the list view updates the widget value() and triggers the change event
     * @private
     */
    _listView() {
        assert.instanceof(
            $,
            this.fileBrowser,
            assert.format(
                assert.messages.instanceof.default,
                'this.fileBrowser',
                'jQuery'
            )
        );

        // Initialize the listView and pager with an empty dataSource
        const dataSource = new DataSource();

        // Build the listView
        this.listView = $('<ul class="k-reset k-floats k-tiles"/>')
            .appendTo(this.fileBrowser)
            .kendoListView({
                // autoBind: false,
                change: this._onListViewChange.bind(this),
                // dataBinding: this._onListViewDataBinding.bind(this),
                dataBound: this._onListViewDataBound.bind(this),
                dataSource,
                selectable: true,
                template: kendo.template(this.options.itemTemplate)
            })
            .data('kendoListView');
        assert.instanceof(
            ListView,
            this.listView,
            assert.format(
                assert.messages.instanceof.default,
                'this.listView',
                'kendo.ui.ListView'
            )
        );
        // Build the page
        this.pager = $('<div class="k-pager-wrap"></div>')
            .appendTo(this.fileBrowser)
            .kendoPager({
                autoBind: false, // dataSource has already been bound/read by this.listView
                dataSource
            })
            .data('kendoPager');
        assert.instanceof(
            Pager,
            this.pager,
            assert.format(
                assert.messages.instanceof.default,
                'this.pager',
                'kendo.ui.Pager'
            )
        );
    },

    /**
    },

    /**
     * Event handler triggered when the asset selection changes in the list view
     * @private
     */
    _onListViewChange() {
        assert.instanceof(
            TabStrip,
            this.tabStrip,
            assert.format(
                assert.messages.instanceof.default,
                'this.tabStrip',
                'kendo.ui.TabStrip'
            )
        );
        assert.instanceof(
            $,
            this.toolbar,
            assert.format(
                assert.messages.instanceof.default,
                'this.toolbar',
                'jQuery'
            )
        );
        if (this._selectedItem() instanceof ObservableObject) {
            this.toolbar
                .find('.k-i-track-changes-enable')
                .parent()
                .removeClass('k-state-disabled');
            this.toolbar
                .find('.k-i-delete')
                .parent()
                .removeClass('k-state-disabled');
            this.trigger(CONSTANTS.CHANGE);
        }
    },

    /**
     * Compute size and update progress bar
     * @private
     */
    _computeStorageSize() {
        // Note: might be called before this.listView is assigned because the ListView constructor triggers a dataBound event
        if (
            this.listView instanceof ListView &&
            this.progressBar instanceof ProgressBar
        ) {
            let size = 0;
            const data = this.listView.dataSource.data();
            for (let i = 0, length = data.length; i < length; i++) {
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
    _onListViewDataBound(e) {
        assert.isNonEmptyPlainObject(
            e,
            assert.format(assert.messages.isNonEmptyPlainObject.default, 'e')
        );
        assert.instanceof(
            ListView,
            e.sender,
            assert.format(
                assert.messages.instanceof.default,
                'e.sender',
                'kendo.ui.ListView'
            )
        );
        const listView = e.sender; // Do not use this.listView because it might not yet have been assigned.
        this._computeStorageSize();
        if (e.action === 'add' && $.isArray(e.items) && e.items.length) {
            listView._dataBoundUid = e.items[e.items.length - 1].uid;
        } else if (
            e.action === 'sync' &&
            $.type(listView._dataBoundUid) === CONSTANTS.STRING
        ) {
            // action 'add' is followed by action 'sync'
            listView.select(
                listView.element.children(
                    `[${attr(CONSTANTS.UID)}="${listView._dataBoundUid}"]`
                )
            );
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
    _selectedItem() {
        const listView = this.listView; // this.listView might not have yet been assigned
        if (listView instanceof ListView) {
            const selected = listView.select();
            if (selected instanceof $ && selected.length) {
                return this.listView.dataSource.getByUid(
                    selected.attr(attr(CONSTANTS.UID))
                );
            }
        }
    },

    /**
     * Get an editor window
     */
    _getWindow(/* options */) {
        let windowWidget = $(WINDOW_SELECTOR).data('kendoWindow');
        // Find or create dialog frame
        if (!(windowWidget instanceof Window)) {
            // Create dialog
            windowWidget = $(
                format(
                    '<div class="{0} kj-no-padding kj-hidden-overflow"></div>',
                    WINDOW_SELECTOR.substr(1)
                )
            )
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
                    activate() {
                        windowWidget.trigger('resize');
                    },
                    close() {
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
    _getWindowViewModel(url) {
        const that = this;
        return kendo.observable({
            url: url || '',
            onCommand(e) {
                // The editor has a save button which emits an event which we hook here
                // because the assetmanager knows transports to save whereas the editor is generic and does not know how or where to save.
                if (e.command === 'ToolbarSaveCommand') {
                    e.preventDefault();
                    if (
                        that.collection.editor &&
                        $.isFunction(that.collection.editor.saveAs)
                    ) {
                        // that.collection.editor.saveAs is defined in app.assets.js
                        // and e.params.value is the file name
                        that.collection.editor.saveAs.bind(e.sender)(
                            e.params.value,
                            that
                        );
                    } else {
                        logger.warn({
                            method: '_getWindowViewModel',
                            message:
                                'The collection does not designate an editor implementing saveAs'
                        });
                    }
                }
            },
            onDialog(e) {
                if (e.name === 'vectorImage') {
                    // TODO: this is not generic naming
                    e.preventDefault();
                    if (
                        that.collection.editor &&
                        $.isFunction(that.collection.editor.openImageDialog)
                    ) {
                        that.collection.editor.openImageDialog.bind(
                            e.sender
                        )(/*  // TODO */);
                    } else {
                        logger.warn({
                            method: '_getWindowViewModel',
                            message:
                                'The collection does not designate an editor implementing openImageDialog'
                        });
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
    _xhrErrorHandler(xhr, status, error) {
        // TODO Raise an error event - see _dataError
    },

    /**
     * Data error handler
     * @param e error event
     * @private
     */
    _dataError(e) {
        const that = this;
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
    _dropZone() {
        const that = this;
        if (supportsFileDrop()) {
            that.dropZone = $('.k-dropzone', that.wrapper)
                .on(DRAGENTER + NS, e => {
                    e.stopPropagation();
                    e.preventDefault();
                })
                .on(DRAGOVER + NS, e => {
                    e.preventDefault();
                })
                .on(DROP + NS, that._onDrop.bind(that));
            // The following add/remove classes used by kendo.upload.js that we match for a consistent UI
            bindDragEventWrappers(
                that.dropZone,
                () => {
                    if (
                        !that.wrapper.hasClass('k-state-disabled') &&
                        !that.dropZone.hasClass('k-state-nodrop')
                    ) {
                        that.dropZone.addClass('k-dropzone-hovered');
                    }
                },
                () => {
                    that.dropZone.removeClass('k-dropzone-hovered');
                }
            );
            bindDragEventWrappers(
                $(document),
                () => {
                    if (
                        !that.wrapper.hasClass('k-state-disabled') &&
                        !that.dropZone.hasClass('k-state-nodrop')
                    ) {
                        that.dropZone.addClass('k-dropzone-active');
                    }
                },
                () => {
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
    _onDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        if (
            this.dropZone instanceof $ &&
            !this.dropZone.hasClass('.k-state-nodrop')
        ) {
            const dt = e.originalEvent.dataTransfer;
            const fileList = dt.files;
            this._uploadFileList(fileList);
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const that = this;
        const wrapper = that.wrapper;
        // Unbind events
        $(document).off(NS); // Assuming there is only one assetmanager on the page
        if (that.toolbar instanceof $) {
            that.toolbar.off(NS);
        }
        if (that.dropZone instanceof $) {
            that.dropZone.off(NS);
        }
        unbind(wrapper);
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
        if (
            that.dataSource instanceof DataSource &&
            $.isFunction(that._errorHandler)
        ) {
            that.dataSource.unbind(ERROR, that._errorHandler);
        }
        that.dataSource = undefined;
        that._errorHandler = undefined;
        // Destroy kendo
        Widget.fn.destroy.call(that);
        destroy(wrapper);
        // Remove widget class
        // wrapper.removeClass(WIDGET_CLASS);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(AssetManager);
