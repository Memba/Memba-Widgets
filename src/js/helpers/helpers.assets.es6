/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.window';
import assert from '../common/window.assert.es6';
import baseUrl from './helpers.base.es6';

const {
    roleSelector,
    ui: { Window },
} = window.kendo;
const TTL = 100;
const CDN = 'https://cdn.kidoju.com';

const SCHEMES = {
    cdn: `${CDN}/`,
    data: baseUrl('/test/data/images/miscellaneous/'),
};

const AUDIO_EXT = ['.mp3', '.ogg'];
const IMAGE_EXT = ['.gif', '.jpg', '.png', '.svg'];
const VIDEO_EXT = ['.mp4', '.ogv', '.wbem'];

/**
 * An image
 * @type {{mime: string, size: number, url: string}}
 */
const IMAGE = {
    mime: 'image/svg+xml',
    size: 974,
    url: `${CDN}/images/o_collection/svg/office/information.svg`,
};

/**
 * Simple G Collection
 * @type {{name: string, transport: {read: string}}}
 */
const G_COLLECTION = {
    name: 'G-Collection',
    transport: {
        // read: `${CDN}/images/g_collection/svg/all/index.json`
        read: baseUrl('/test/data/images/g_collection/svg/all/index.json'),
    },
};

/**
 * O Collection with sub-collections
 * @type {{name: string, collections: *[]}}
 */
const O_COLLECTION = {
    name: 'O-Collection',
    collections: [
        {
            name: 'Dark Grey',
            transport: {
                read: baseUrl(
                    '/test/data/images/o_collection/svg/dark_grey/index.json'
                ),
            },
        },
        {
            name: 'Office',
            transport: {
                read: baseUrl(
                    '/test/data/images/o_collection/svg/office/index.json'
                ),
            },
        },
        {
            name: 'White',
            transport: {
                read: baseUrl(
                    '/test/data/images/o_collection/svg/white/index.json'
                ),
            },
        },
    ],
};

/**
 * V Collection with sub-collections
 * @type {{name: string, collections: *[]}}
 */
const V_COLLECTION = {
    name: 'V-Collection',
    collections: [
        {
            name: 'Small',
            transport: {
                read: baseUrl(
                    '/test/data/images/v_collection/png/32x32/index.json'
                ),
            },
        },
        {
            name: 'Medium',
            transport: {
                read: baseUrl(
                    '/test/data/images/v_collection/png/64x64/index.json'
                ),
            },
        },
        {
            name: 'Large',
            transport: {
                read: baseUrl(
                    '/test/data/images/v_collection/png/128x128/index.json'
                ),
            },
        },
        {
            name: 'Huge',
            transport: {
                read: baseUrl(
                    '/test/data/images/v_collection/png/256x256/index.json'
                ),
            },
        },
    ],
};

/**
 * X Collection with subcollections
 * @type {{name: string, collections: *[]}}
 */
const X_COLLECTION = {
    name: 'X-Collection',
    collections: [
        {
            name: 'Small',
            transport: {
                read: baseUrl(
                    '/test/data/images/x_collection/png/32x32/index.json'
                ),
            },
        },
        {
            name: 'Large',
            transport: {
                read: baseUrl(
                    '/test/data/images/x_collection/png/128x128/index.json'
                ),
            },
        },
    ],
};

/**
 * Google Search
 * @type {{name: string, targets: string[], pageSize: number, serverPaging: boolean, serverFiltering: boolean, transport: {read: string, parameterMap(*=, *): *}, schema: {parse(*): *}}}
 */
const GOOGLE_SEARCH = {
    name: 'Google', // see https://developers.google.com/custom-search/json-api/v1/reference/cse/list
    targets: ['Project'],
    pageSize: 10,
    serverPaging: true,
    serverFiltering: true,
    transport: {
        read: 'https://www.googleapis.com/customsearch/v1',
        parameterMap(data, type) {
            let ret;
            if (type === 'read') {
                const q =
                    data &&
                    data.filter &&
                    data.filter.logic === 'and' &&
                    data.filter.filters &&
                    data.filter.filters[1] &&
                    data.filter.filters[1].value;
                ret = {
                    // Check parameters at https://developers.google.com/custom-search/json-api/v1/reference/cse/list
                    // Check API key at https://console.developers.google.com/apis/credentials?project=www-kidoju-com&authuser=1
                    alt: 'json',
                    cx: '003237092945897440411:olzsejrw28u',
                    fields:
                        'searchInformation(totalResults),items(image/byteSize,link,mime)', // https://developers.google.com/custom-search/json-api/v1/performance
                    hl: 'en',
                    imgSize: 'medium',
                    key: 'AIzaSyCCkr7BnLgpQnocAAbPtKgXOYOl1nLW3PI',
                    num: Math.min(10, data.pageSize),
                    q, // Note: Comment to trigger an error
                    searchType: 'image',
                    start:
                        Math.min(
                            100 - Math.min(10, data.pageSize),
                            (data.page - 1) * data.pageSize
                        ) + 1,
                };
            }
            return ret;
        },
    },
    schema: {
        parse(response) {
            const data = [];
            const total = Math.min(
                100,
                parseInt(response.searchInformation.totalResults, 10)
            );
            if (total && Array.isArray(response.items)) {
                response.items.forEach((item) => {
                    data.push({
                        mime: item.mime,
                        size: item.image.byteSize,
                        url: item.link,
                    });
                });
            }
            return { total, data };
        },
    },
};

const SIMPLE_PROJECT = {
    name: 'Project',
    transport: {
        read(options) {
            options.success({
                total: 3,
                data: [
                    { url: 'data://Elvis.jpg', size: 69057 },
                    { url: 'data://France-Fleuves-1.png', size: 35886 },
                    {
                        url: 'data://self-portrait-1907.jpg',
                        size: 292974,
                    },
                ],
            });
        },
        create(options) {
            // Note: if there is an error, this is the place where to display notifications...
            // options.error(new Error('Oops'));
            if (options.data && options.data.file instanceof window.File) {
                // Make sure we are asynchronous to simulate a file upload...
                setTimeout(() => {
                    const data = {
                        url: `${CDN}/images/o_collection/svg/office/add.svg`,
                        size: 354, // TODO
                    };
                    // VERY IMPORTANT: it won't work without total + data which are both expected
                    options.success({ total: 1, data: [data] });
                }, TTL);
            }
        },
        destroy(options) {
            options.error(new Error('destroyed'));
        },
    },
};

const COMPLEX_PROJECT = {
    name: 'Project',
    tools: ['upload', 'create', 'edit', 'destroy'],
    editor: {
        // template: '<div><img alt="image" data-bind="attr: { src: url }"></img></div>' +
        // '<div><button data-bind="events: { click: click }">Save</button><button data-bind="events: { click: click }">Add</button></div>',
        template:
            '<div data-role="vectordrawing" data-bind="events: { command: onCommand, dialog: onDialog }"></div>', // TODO remove new and open menu items (data-tools?)
        maximize: true,
        openImageDialog() {
            assert.instanceof(
                Window,
                this,
                assert.format(
                    assert.messages.instanceof.default,
                    'this',
                    'kendo.ui.Window'
                )
            );
            // TODO use openDialog?
            /*
            const vectorDrawingWidget = this.element
                .find(roleSelector('vectordrawing'))
                .data('kendoVectorDrawing');
             */
        },
        openUrl(url) {
            assert.instanceof(
                Window,
                this,
                assert.format(
                    assert.messages.instanceof.default,
                    'this',
                    'kendo.ui.Window'
                )
            );
            const vectorDrawingWidget = this.element
                .find(roleSelector('vectordrawing'))
                .data('kendoVectorDrawing');
            const resolvedUrl = $('<a/>').attr('href', url).get(0).href; // Note: a simple way to resolve a relative url
            return vectorDrawingWidget.open(resolvedUrl);
            // TODO promise????? app.notification of errors ????
        },
        resize(e) {
            assert.instanceof(
                Window,
                this,
                assert.format(
                    assert.messages.instanceof.default,
                    'this',
                    'kendo.ui.Window'
                )
            );
            const vectorDrawingWidget = this.element
                .find(roleSelector('vectordrawing'))
                .data('kendoVectorDrawing');
            const container = e.sender.element;
            vectorDrawingWidget.element
                .outerWidth(container.width())
                .outerHeight(container.height());
            vectorDrawingWidget.resize();
        },
        saveAs(/* name, assetManager */) {
            // debugger;
        },
    },
    transport: {
        create(options = {}) {
            // debugger;
            $.noop(options);
        },
        destroy(options) {
            // options.error(new Error('Oops'));
            options.success({ total: 1, data: [options.data] });
        },
        read(options) {
            options.success({
                total: 3,
                data: [
                    { url: 'data://Elvis.jpg', size: 69057 },
                    { url: 'data://France-Fleuves-1.png', size: 35886 },
                    { url: 'data://self-portrait-1907.jpg', size: 292974 },
                ],
            });
        },
        upload(options) {
            // TODO: What if there is already a file with the same name?
            // TODO: Where do we check the file extension and file size and reject inadequate files?
            // Note: if there is an error, this is the place where to display notifications...
            // options.error(new Error('Oops'));
            if (options.data && options.data.file instanceof window.File) {
                // Make sure we are asynchronous to simulate a file upload...
                setTimeout(() => {
                    // eslint-disable-next-line no-param-reassign
                    options.data.file = null;
                    // eslint-disable-next-line no-param-reassign
                    options.data.url = `${CDN}/images/o_collection/svg/office/add.svg`;
                    // VERY IMPORTANT: it won't work without total + data which are both expected
                    options.success({ total: 1, data: [options.data] });
                }, 1000);
            }
        },
        import(options) {
            // debugger;
            $.noop(options);
        },
        stream(options) {
            // debugger;
            $.noop(options);
        },
    },
};

const ASSETS = {
    CDN,
    SCHEMES,
    AUDIO_EXT,
    IMAGE_EXT,
    VIDEO_EXT,
    IMAGE,
    G_COLLECTION,
    O_COLLECTION,
    V_COLLECTION,
    X_COLLECTION,
    SIMPLE_PROJECT,
    COMPLEX_PROJECT,
    GOOGLE_SEARCH,
};

/**
 * Default export
 */
export default ASSETS;
