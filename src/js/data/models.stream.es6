/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Add calculations and worker pool here!

// TODO Add save/load here

// TODO Add preloading of assets here too

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import { BaseModel, BaseDataSource } from './kidoju.data.core.es6.tmp';
import CONSTANTS from '../window.constants.es6';
import Page from './kidoju.data.page.es6.tmp';

const { kendo } = window;

/**
 * A stream is essentially a collection of pages
 * In addition, a stream has functions:
 * - to build a test activity to record user answers
 * - to calculate a score and show corrections
 * @class Stream
 */
const Stream = BaseModel.define({
    // TODO Check id
    fields: {
        pages: {
            // We cannot assign a data source as default value of a model
            // because otherwise it might be reused amongst instances.
            // The only way to ensure that a new instance gets a new default value is to initialize with []
            // and have kidoju.data.BaseModel._parseData initialize the instance data source from [].
            // defaultValue: new kidoju.data.PageCollectionDataSource({ data: [] }),
            defaultValue: [],
            parse(value) {
                if (value instanceof PageCollectionDataSource) {
                    return value;
                } else if (value && value.push) {
                    return new PageCollectionDataSource({ data: value });
                } else {
                    return new PageCollectionDataSource(value);
                }
            }
        }
    },

    /**
     * Constructor
     * @constructor
     * @param value
     */
    init(value) {
        var that = this;

        // Call the base init method
        BaseModel.fn.init.call(that, value);

        if (that.model && that.model.pages) {
            // Reset PageCollectionDataSource with model.pages dataSource options
            that.pages = new PageCollectionDataSource(that.model.pages);
        }

        var pages = that.pages;

        /*
         var transport = pages.transport,
         parameterMap = transport.parameterMap;
         transport.parameterMap = function (data, type) {
         data[that.idField || 'id'] = that.id;
         if (parameterMap) {
         data = parameterMap(data, type);
         }
         return data;
         };
         */

        if (pages instanceof PageCollectionDataSource) {

            // Add parent() function
            that.pages.parent = function () {
                return that;
            };

            // Note: this is where kendo.data.Node bind the change and error events
            // to propagate them from the pages collection to the stream node or a parent collection

        }

        that._loaded = !!(value && (value.pages || value._loaded));
    },

    /**
     * Append a page
     * @param model
     */
    append(page) {
        this.loaded(true);
        this.pages.add(page);
    },

    /**
     * Load pages
     * @returns {*}
     */
    load() {
        var options = {};
        var method = '_query';
        var pages = this.pages;
        // Passing the id of the page to the components _query method
        // is suggested by kendo.data.Node
        options[this.idField || 'id'] = this.id;
        if (!this._loaded) {
            pages._data = undefined;
            method = 'read';
        }
        pages.one(CONSTANTS.CHANGE, $.proxy(function () { this.loaded(true); }, this));
        return pages[method](options);
    },

    /**
     * Gets or sets loaded value
     * @param value
     * @returns {boolean|*}
     */
    loaded(value) {
        if (value !== undefined) {
            this._loaded = value;
        } else {
            return this._loaded;
        }
    },

    /**
     * i18n Messages
     */
    messages: {
        duplicateNames: 'Delete components using the same name `{0}` on pages {1}',
        minPages: 'At least {0} pages are required to be allowed to publish.',
        minQuestions: 'At least {0} questions are required to be allowed to publish.',
        typeVariety: 'The use of at least {0} types of questions (Multiple Choice, TextBox, Connector or else) is recommended.',
        qtyVariety: 'More variety is recommended because {0:p0} of questions are of type {1}.'
    },

    /**
     * Stream validation
     */
    validate() {
        /* jshint maxcomplexity: 20 */
        assert.instanceof (Stream, this, kendo.format(assert.messages.instanceof.default, 'this', 'kidoju.data.Stream'));
        var ret = [];
        var names = {};
        var values = { _total: 0, _weight: 0 };
        // Minimum number of pages
        // var MIN_PAGES = 5;
        // var pageTotal = this.pages.total();
        // if (pageTotal < MIN_PAGES) {
        //    ret.push({ type: ERROR, index: -1, message: kendo.format(this.messages.minPages, MIN_PAGES) });
        // }
        // for (var i = 0; i < pageTotal; i++) {
        for (var i = 0, pageTotal = this.pages.total(); i < pageTotal; i++) {
            var page = this.pages.at(i);
            var hasConnectors = false;
            // Count names and questions
            for (var j = 0, componentTotal = page.components.total(); j < componentTotal; j++) {
                var component = page.components.at(j);
                var properties = component.properties;
                if (properties) {
                    if ($.type(properties.name) === STRING) {
                        // Collect all pages where a name can be found in view to check that each name is only used once
                        names[properties.name] = names[properties.name] || [];
                        names[properties.name].push(i);
                    }
                    if ($.type(properties.validation) === STRING) {
                        assert.type(STRING, component.tool, kendo.format(assert.messages.type.default, 'component.tool', STRING));
                        var tool = component.tool;
                        if (tool !== 'connector' || !hasConnectors) {
                            hasConnectors = (tool === 'connector');
                            // Connectors go in pairs but it would not make sense to only have 2 connectors or less on a page, you need at least 4 to make a question
                            // Accordingly, we count connectors only once per page
                            values._total += 1;
                            values[tool] = (values[tool] || 0) + 1;
                        }
                        values._weight += kidoju.tools[tool].weight;
                    }
                }
            }
            // Validate each page
            ret = ret.concat(page.validate(i));
        }
        // Duplicate names
        for (var name in names) {
            if (names.hasOwnProperty(name)) {
                var pages = names[name];
                if ($.isArray(pages) && pages.length > 1) {
                    var index = pages[0];
                    // page numbers start at 1 when page indexes start at 0
                    pages = pages.map(function (idx) { return idx + 1; });
                    ret.push({ type: ERROR, index: index, message: kendo.format(this.messages.duplicateNames, name, pages) });
                }
            }
        }
        // Minimum number of questions (minimum weight)
        var MIN_WEIGHT = 8;
        if (values._weight < MIN_WEIGHT) {
            ret.push({ type: ERROR, index: -1, message: kendo.format(this.messages.minQuestions, MIN_WEIGHT) });
        }
        // Validate toolset (which includes _total) to make sure questions are varied
        // var TYPE_VARIETY = 3;
        // if (Object.keys(questions).length <= TYPE_VARIETY) {
        //     ret.push({ type: WARNING, index: -1, message: kendo.format(this.messages.typeVariety, TYPE_VARIETY) });
        // }
        var QTY_VARIETY = 0.5;
        for (var prop in values) {
            if (values.hasOwnProperty(prop) && prop !== '_total' && prop !== '_weight') {
                var proportion =  values[prop] / values._total;
                if (proportion >= QTY_VARIETY) {
                    assert.instanceof(kendo.Observable, kidoju.tools, kendo.format(assert.messages.instanceof.default, 'kidoju.tools', 'kendo.Observable'));
                    ret.push({ type: WARNING, index: -1, message: kendo.format(this.messages.qtyVariety, proportion, kidoju.tools[prop].description) });
                }
            }
        }
        return ret;
    }
});

/**
 * ES6 default export
 */
export default Stream;

/**
 * Legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.data = window.kidoju.data || {};
window.kidoju.data.Stream = Stream;
