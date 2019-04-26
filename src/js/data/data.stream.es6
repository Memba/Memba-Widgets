/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO validation!!!!
// TODO i18n

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
// import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { preload } from '../common/window.image.es6';
import tools from '../tools/tools.es6';
import TOOLS from '../tools/util.constants.es6';
import BaseModel from './data.base.es6';
import { Page, PageDataSource } from './data.page.es6';
import BaseTest from './data.basetest.es6';

const {
    data: { ObservableArray }
} = window.kendo;

/**
 * A stream is essentially a collection of pages
 * In addition, a stream has functions:
 * - to build a test activity to record user answers
 * - to calculate a score and show corrections
 * @class Stream
 * @extends BaseModel
 */
const Stream = BaseModel.define({
    // id
    fields: {
        pages: {
            // We cannot assign a data source as default value of a model
            // because otherwise it might be reused amongst instances.
            // The only way to ensure that a new instance gets a new default value is to initialize with []
            // and have BaseModel._parseData initialize the instance data source from [].
            // defaultValue: new PageDataSource({ data: [] }),
            defaultValue: [],
            parse(value) {
                if (value instanceof PageDataSource) {
                    return value;
                }
                if (Array.isArray(value) || value instanceof ObservableArray) {
                    return new PageDataSource({ data: value });
                }
                return new PageDataSource(value);
            }
        }
    },

    /**
     * i18n Messages
     */
    messages: {
        duplicateNames:
            'Delete components using the same name `{0}` on pages {1}',
        minPages: 'At least {0} pages are required to be allowed to publish.',
        minQuestions:
            'At least {0} questions are required to be allowed to publish.',
        typeVariety:
            'The use of at least {0} types of questions (Multiple Choice, TextBox, Connector or else) is recommended.',
        qtyVariety:
            'More variety is recommended because {0:p0} of questions are of type {1}.'
    },

    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options) {
        // Call the base init method
        BaseModel.fn.init.call(this, options);

        // Propagates Stream options to PageDataSource
        // especially in the case where the stream is defined with
        // a hierarchy of CRUD transports
        /*
        if (this.model && this.model.pages) {
            this.pages = new PageDataSource(this.model.pages);
        }
        */

        // Init pages
        // Note: refer to the _initChildren method of kendo.data.Node
        this._initPages();

        // this._loaded = !!(options && options._loaded);
        // this._loaded = !!(options && (options.pages || options._loaded));
    },

    /**
     * _initComponents
     * Note: check kendo.data.Node._initChildren at https://github.com/telerik/kendo-ui-core/blob/master/src/kendo.data.js#L4699
     * @method _initComponents
     * @private
     */
    _initPages() {
        const that = this;
        const { pages } = that.pages;

        if (pages instanceof PageDataSource) {
            /*
            // This is used to add a foreign key to the transport request
            // In order to filter pages that are only relevant to that stream
            const { transport } = pages;
            const { parameterMap } = transport;
            transport.parameterMap = function map(data, type) {
                // debugger;
                let ret = data;
                ret[that.idField || CONSTANTS.ID] = that.id;
                if (parameterMap) {
                    ret = parameterMap(ret, type);
                }
                return ret;
            };
            */

            // Add parent function
            that.pages.parent = () => that;

            // Bind the change to bubble up
            // DO NOT UNCOMMENT, otherwise change will be raised twice
            /*
            pages.bind(CONSTANTS.CHANGE, e => {
                e.node = e.node || that;
                that.trigger(CONSTANTS.CHANGE, e);
            });
            */

            // Bind the error event to bubble up
            /*
            pages.bind(CONSTANTS.ERROR, e => {
                // Raise error on the page;
                that.trigger(CONSTANTS.ERROR, e);

                // Raise error on the parent collection of pages
                const collection = that.parent();
                if (collection) {
                    e.node = e.node || that;
                    collection.trigger(CONSTANTS.ERROR, e);
                }
            });
            */
        }
    },

    /**
     * Append a page
     * @ https://docs.telerik.com/kendo-ui/api/javascript/data/node/methods/append
     * @param model
     */
    /*
    append(page) {
        this.loaded(true);
        this.pages.add(page);
    },
    */

    /**
     * Load pages
     * @see https://docs.telerik.com/kendo-ui/api/javascript/data/node/methods/load
     * @method load
     * @returns {*}
     */
    /*
    load() {
        const { pages } = this;
        const options = {};
        let method = '_query';
        // Passing the id of the page to the components _query method
        // is suggested by kendo.data.Node
        options[this.idField || CONSTANTS.ID] = this.id;
        if (!this._loaded) {
            pages._data = undefined;
            method = 'read';
        }
        pages.one(CONSTANTS.CHANGE, () => {
            this._loaded = true;
        });
        return pages[method](options);
    },
    */

    /**
     * Gets or sets the loaded status of pages
     * @see https://docs.telerik.com/kendo-ui/api/javascript/data/node/methods/loaded
     * @param value
     * @returns {boolean|*}
     */
    /*
    loaded(value) {
        let ret;
        if ($.type(value) !== CONSTANTS.UNDEFINED) {
            this._loaded = value;
        } else {
            ret = this._loaded;
        }
        return ret;
    },
    */

    /**
     * Assets
     * @method assets
     * @returns {{audio: Array, image: Array, video: Array}}
     */
    assets() {
        const assets = {
            audio: [],
            image: [],
            video: []
        };
        // TODO: Check _loaded and throw otherwise
        // Iterate through pages
        this.pages.data().forEach(page => {
            const media = page.assets();
            // Iterate through asset classes (medium)
            Object.keys(media).forEach(medium => {
                // Iterate through assets
                media[medium].forEach(a => {
                    // Only add if not a duplicate
                    if (assets[medium].indexOf(a) === -1) {
                        assets[medium].push(a);
                    }
                });
            });
        });
        return assets;
    },

    /**
     * Preload images (only images for now)
     * @method preload
     */
    preload() {
        // TODO https://developers.google.com/web/fundamentals/media/fast-playback-with-video-preload
        // TODO Consider using https://github.com/CreateJS/PreloadJS
        // TODO See http://dinbror.dk/blog/how-to-preload-entire-html5-video-before-play-solved/ (see comments especially about CORS)
        // TODO scheme2http !!!!
        const assets = this.assets();
        const promises = assets.image.map(preload);
        return $.when(...promises);
    },

    /**
     * Aggregate time
     * @method time
     *
     */
    time() {
        let time = 0;
        this.pages.data().forEach(page => {
            time += page.get('time') || Page.fn.defaults.time;
        });
        return time;
    },

    /**
     * Get a test model to append to a score activity
     * IMPORTANT: Make sure all pages are loaded first
     * @method getTestModel (formerly getTestFromProperties)
     * @returns {*}
     */
    getTestModel() {
        const fields = {
            variables: {
                defaultValue: []
            }
        };

        // TODO: Make sure pages and components are all loaded
        //  test if(this.loaded()) ???????

        this.pages.data().forEach((page, pageIdx) => {
            page.components.data().forEach(component => {
                const { name, variable } = component.properties || {};

                // Binding properties for val_xxxxxx fields
                if (TOOLS.RX_TEST_FIELD_NAME.test(name)) {
                    const tool = tools[component.tool];

                    // TODO What if component.properties.disabled ??????

                    const Field = tool.getTestModelField(component);
                    fields[name] = {
                        type: CONSTANTS.OBJECT,
                        parse(value) {
                            return value instanceof Field
                                ? value
                                : new Field(value);
                        }
                    };
                }

                // Test variables
                if (
                    component.tool === 'variable' &&
                    TOOLS.RX_VARIABLE.test(variable)
                ) {
                    const tool = tools[component.tool];
                    const value = tool.eval(component);
                    if ($.type(value) !== CONSTANTS.UNDEFINED) {
                        fields.variables.defaultValue[pageIdx] =
                            fields.variables.defaultValue[pageIdx] || {};
                        fields.variables.defaultValue[pageIdx][
                            variable
                        ] = value;
                    }
                }
            });
        });

        // Return a customized test model derived from BaseTest
        return BaseTest.define({ fields });
    }

    /**
     * Stream validation
     */
    /*
    validate() {
        assert.instanceof(
            Stream,
            this,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'kidoju.data.Stream'
            )
        );
        let ret = [];
        const names = {};
        const values = { _total: 0, _weight: 0 };
        // Minimum number of pages
        // var MIN_PAGES = 5;
        // var pageTotal = this.pages.total();
        // if (pageTotal < MIN_PAGES) {
        //    ret.push({ type: ERROR, index: -1, message: format(this.messages.minPages, MIN_PAGES) });
        // }
        // for (var i = 0; i < pageTotal; i++) {
        for (let i = 0, pageTotal = this.pages.total(); i < pageTotal; i++) {
            const page = this.pages.at(i);
            let hasConnectors = false;
            // Count names and questions
            for (
                let j = 0, componentTotal = page.components.total();
                j < componentTotal;
                j++
            ) {
                const component = page.components.at(j);
                const properties = component.properties;
                if (properties) {
                    if ($.type(properties.name) === STRING) {
                        // Collect all pages where a name can be found in view to check that each name is only used once
                        names[properties.name] = names[properties.name] || [];
                        names[properties.name].push(i);
                    }
                    if ($.type(properties.validation) === STRING) {
                        assert.type(
                            STRING,
                            component.tool,
                            assert.format(
                                assert.messages.type.default,
                                'component.tool',
                                STRING
                            )
                        );
                        const tool = component.tool;
                        if (tool !== 'connector' || !hasConnectors) {
                            hasConnectors = tool === 'connector';
                            // Connectors go in pairs but it would not make sense to only have 2 connectors or less on a page, you need at least 4 to make a question
                            // Accordingly, we count connectors only once per page
                            values._total += 1;
                            values[tool] = (values[tool] || 0) + 1;
                        }
                        values._weight += tools[tool].weight;
                    }
                }
            }
            // Validate each page
            ret = ret.concat(page.validate(i));
        }
        // Duplicate names
        for (const name in names) {
            if (names.hasOwnProperty(name)) {
                let pages = names[name];
                if ($.isArray(pages) && pages.length > 1) {
                    const index = pages[0];
                    // page numbers start at 1 when page indexes start at 0
                    pages = pages.map(idx => idx + 1);
                    ret.push({
                        type: ERROR,
                        index,
                        message: format(
                            this.messages.duplicateNames,
                            name,
                            pages
                        )
                    });
                }
            }
        }
        // Minimum number of questions (minimum weight)
        const MIN_WEIGHT = 8;
        if (values._weight < MIN_WEIGHT) {
            ret.push({
                type: ERROR,
                index: -1,
                message: format(this.messages.minQuestions, MIN_WEIGHT)
            });
        }
        // Validate toolset (which includes _total) to make sure questions are varied
        // var TYPE_VARIETY = 3;
        // if (Object.keys(questions).length <= TYPE_VARIETY) {
        //     ret.push({ type: WARNING, index: -1, message: format(this.messages.typeVariety, TYPE_VARIETY) });
        // }
        const QTY_VARIETY = 0.5;
        for (const prop in values) {
            if (
                values.hasOwnProperty(prop) &&
                prop !== '_total' &&
                prop !== '_weight'
            ) {
                const proportion = values[prop] / values._total;
                if (proportion >= QTY_VARIETY) {
                    assert.instanceof(
                        kendo.Observable,
                        tools,
                        assert.format(
                            assert.messages.instanceof.default,
                            'tools',
                            'kendo.Observable'
                        )
                    );
                    ret.push({
                        type: WARNING,
                        index: -1,
                        message: format(
                            this.messages.qtyVariety,
                            proportion,
                            tools[prop].description
                        )
                    });
                }
            }
        }
        return ret;
    }
    */
});

/**
 * Default export
 */
export default Stream;
