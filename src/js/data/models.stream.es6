/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Add calculations and worker pool here!
// TODO Add save/load here
// TODO Add preloading of assets here too
// TODO store history to patch diff
// TODO preload images/assets

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import CONSTANTS from '../common/window.constants.es6';
import PageDataSource from './datasources.page.es6';
import BaseModel from './models.base.es6';

const {
    data: { ObservableArray }
} = window.kendo;

/**
 * A stream is essentially a collection of pages
 * In addition, a stream has functions:
 * - to build a test activity to record user answers
 * - to calculate a score and show corrections
 * @class Stream
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
     * Constructor
     * @constructor
     * @param value
     */
    init(value) {
        const that = this;

        // Call the base init method
        BaseModel.fn.init.call(that, value);

        if (that.model && that.model.pages) {
            // Reset PageDataSource with model.pages dataSource options
            that.pages = new PageDataSource(that.model.pages);
        }

        const pages = that.pages;

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

        if (pages instanceof PageDataSource) {
            // Add parent() function
            that.pages.parent = function() {
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
        const options = {};
        let method = '_query';
        const pages = this.pages;
        // Passing the id of the page to the components _query method
        // is suggested by kendo.data.Node
        options[this.idField || 'id'] = this.id;
        if (!this._loaded) {
            pages._data = undefined;
            method = 'read';
        }
        pages.one(
            CONSTANTS.CHANGE,
            $.proxy(function() {
                this.loaded(true);
            }, this)
        );
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
     * Get empty user test data from properties
     * IMPORTANT: Make sure all pages are loaded first
     * @method getTestFromProperties
     * @returns {*}
     */
    getTestFromProperties() {
        assert.instanceof(
            kendo.Observable,
            kidoju.tools,
            assert.format(
                assert.messages.instanceof.default,
                'kidoju.tools',
                'kendo.Observable'
            )
        );
        const that = this;
        const tools = kidoju.tools;
        const test = {
            // Store for interactions
            interactions: []
        };
        $.each(that.data(), (pageIdx, page) => {
            $.each(page.components.data(), (componentIdx, component) => {
                const properties = component.properties;
                if (
                    properties instanceof kendo.data.Model &&
                    $.type(properties.fields) === OBJECT &&
                    !$.isEmptyObject(properties.fields) &&
                    $.type(properties.name) === STRING &&
                    $.type(properties.validation) === STRING
                ) {
                    const tool = kidoju.tools[component.tool];
                    assert.instanceof(
                        kidoju.Tool,
                        tool,
                        assert.format(
                            assert.messages.instanceof.default,
                            'tool',
                            'kidoju.Tool'
                        )
                    );
                    test[properties.name] = {
                        value: tool.getTestDefaultValue(component)
                    };
                }
            });
        });
        return test;
    },

    /**
     * Validate user test data
     * IMPORTANT: Make sure all pages are loaded first
     * @method validateTestFromProperties
     * @returns {*}
     */
    validateTestFromProperties(test) {
        // Note: the model being created on the fly (no kendo.data.Model)), we only have an ObservableObject to test
        assert.instanceof(
            kendo.data.ObservableObject,
            test,
            assert.format(
                assert.messages.instanceof.default,
                'test',
                'kendo.data.ObservableObject'
            )
        );

        const pageCollectionDataSource = this; // don't use that which is used below
        const deferred = $.Deferred();
        const workerPool = new WorkerPool(
            (window.navigator.hardwareConcurrency || 2) - 1,
            workerTimeout()
        );
        // TODO: use an app.model and define a submodel with each field - see BaseTest above
        const result = {
            interactions: test.interactions,
            score() {
                let score = 0;
                assert.instanceof(
                    kendo.data.ObservableObject,
                    this,
                    assert.format(
                        assert.messages.instanceof.default,
                        'this',
                        'kendo.data.ObservableObject'
                    )
                );
                for (const name in this) {
                    if (
                        this.hasOwnProperty(name) &&
                        RX_VALID_NAME.test(name) &&
                        !this.get(`${name}.disabled`)
                    ) {
                        score += this.get(`${name}.score`);
                    }
                }
                return score;
            },
            max() {
                let max = 0;
                assert.instanceof(
                    kendo.data.ObservableObject,
                    this,
                    assert.format(
                        assert.messages.instanceof.default,
                        'this',
                        'kendo.data.ObservableObject'
                    )
                );
                for (const name in this) {
                    if (
                        this.hasOwnProperty(name) &&
                        RX_VALID_NAME.test(name) &&
                        !this.get(`${name}.disabled`)
                    ) {
                        max += this.get(`${name}.success`);
                    }
                }
                return max;
            },
            percent() {
                assert.instanceof(
                    kendo.data.ObservableObject,
                    this,
                    assert.format(
                        assert.messages.instanceof.default,
                        'this',
                        'kendo.data.ObservableObject'
                    )
                );
                const max = this.max();
                const score = this.score();
                return score === 0 || max === 0 ? 0 : (100 * score) / max;
            },
            getScoreArray() {
                assert.instanceof(
                    kendo.data.ObservableObject,
                    this,
                    assert.format(
                        assert.messages.instanceof.default,
                        'this',
                        'kendo.data.ObservableObject'
                    )
                );
                const that = this; // this is variable `result`
                const scoreArray = [];
                for (const name in that) {
                    if (
                        that.hasOwnProperty(name) &&
                        RX_VALID_NAME.test(name) &&
                        !this.get(`${name}.disabled`)
                    ) {
                        const testItem = that.get(name);
                        const scoreItem = testItem.toJSON();
                        // Improved display of values in score grids
                        scoreItem.value = testItem.value$();
                        scoreItem.solution = testItem.solution$();
                        scoreArray.push(scoreItem);
                    }
                }
                return scoreArray;
            },
            toJSON() {
                const json = {};
                assert.instanceof(
                    kendo.data.ObservableObject,
                    this,
                    assert.format(
                        assert.messages.instanceof.default,
                        'this',
                        'kendo.data.ObservableObject'
                    )
                );
                for (const name in this) {
                    if (this.hasOwnProperty(name)) {
                        if (RX_VALID_NAME.test(name)) {
                            json[name] = {
                                result: this.get(`${name}.result`),
                                score: this.get(`${name}.score`),
                                value: this.get(`${name}.value`)
                            };
                        } else if (name === 'interactions') {
                            json[name] = this.get(name).toJSON(); // .slice();
                        }
                    }
                }
                return json;
            }
        };

        // Flatten test for validation formulas
        const all = test.toJSON();
        delete all.interactions;
        for (const prop in all) {
            if (all.hasOwnProperty(prop) && $.type(all[prop]) === OBJECT) {
                if (all[prop].value === null) {
                    // tools built upon kendo ui widgets cannot have undefined values because value(undefined) === value() so they use null
                    all[prop] = undefined; // TODO use undefined or null? we should probably use null for unanswered tests
                } else {
                    all[prop] = all[prop].value;
                }
            }
        }

        // TODO we might even consider storing workerLib in session storage considering https://addyosmani.com/basket.js/
        const app = window.app;
        // Loading workerLib via $.ajax fails in Cordova applications
        // See: https://www.scirra.com/blog/ashley/25/hacking-something-useful-out-of-wkwebview
        // See: http://stackoverflow.com/questions/39527101/wkwebview-web-worker-throws-error-dom-exception-18-returns-an-error
        $.ajax({
            url:
                (app &&
                    app.uris &&
                    app.uris.webapp &&
                    app.uris.webapp.workerlib) ||
                workerLibPath,
            cache: true,
            dataType: 'text'
        })
            .done(workerLib => {
                logger.debug({
                    message: 'workerLib downloaded',
                    method: 'PageDataSource.validateTestFromProperties',
                    data: {
                        path:
                            (app &&
                                app.uris &&
                                app.uris.webapp &&
                                app.uris.webapp.workerlib) ||
                            workerLibPath
                    }
                });
                // Add tasks to the worker pool
                // Iterate through pages
                $.each(pageCollectionDataSource.data(), (pageIdx, page) => {
                    // Iterate through page components
                    $.each(
                        page.components.data(),
                        (componentIdx, component) => {
                            // List component properties
                            let properties = component.properties;
                            assert.instanceof(kendo.data.Model, properties, assert.format(assert.messages.instanceof.default, 'properties', 'kendo.data.Model'));
                            assert.type(OBJECT, properties.fields, assert.format(assert.messages.type.default, 'properties.fields', OBJECT));

                            // If our component has a name property to record the result of a test interaction
                            // Note: some components like textboxes have properties, others likes labels and images don't
                            // assert.type(STRING, properties.name, assert.format(assert.messages.type.default, 'properties.name', STRING));
                            if ($.type(properties.name) === STRING && $.type(properties.validation) === STRING) {
                                let code;
                                var libraryMatches = properties.validation.match(RX_VALIDATION_LIBRARY);
                                if ($.isArray(libraryMatches) && libraryMatches.length === 4) {
                                    // Find libraryMatches[1] in the code library
                                    // Array.find is not available in Internet Explorer, thus the use of Array.filter
                                    var found = properties._library.filter((item) => item.name === libraryMatches[1]);
                                    assert.isArray(found, assert.format(assert.messages.isArray.default, 'found'));
                                    assert.hasLength(found, assert.format(assert.messages.hasLength.default, 'found'));
                                    found = found[0];
                                    assert.isPlainObject(found, assert.format(assert.messages.isPlainObject.default, 'found'));
                                    assert.type(STRING, found.formula, assert.format(assert.messages.type.default, 'found.formula', STRING));
                                    // libraryMatches[3] is the param value beginning with ` ["` and ending with `"]`
                                    var paramValue = libraryMatches[3];
                                    if ($.type(found.param) === STRING && $.type(paramValue) === STRING  && paramValue.length > '[]'.length) {
                                        // Get the  paramValue in the JSON array
                                        paramValue = JSON.parse(paramValue)[0];
                                    }
                                    // This is code from the library possibly with param
                                    // When we shall have several params, consider kendo.format.apply(this, [paramValue])
                                    code = kendo.format(found.formula, paramValue);
                                } else {
                                    // This is custom code not form the library
                                    code = properties.validation;
                                }

                                // Note: when e.data.value is undefined, we need to specifically call postMessage(undefined) instead of postMessage() otherwise we get the following error:
                                // Uncaught TypeError: Failed to execute 'postMessage' on 'DedicatedWorkerGlobalScope': 1 argument required, but only 0 present.
                                var blob = new Blob([
                                    // 'self.importScripts("' + workerLibPath + '");\n' +
                                    workerLib + ';\n' +
                                            'self.onmessage = function (e) {\n' +
                                            code +
                                            '\nvar data=JSON.parse(e.data);\nif (typeof data.value === "undefined") { self.postMessage(undefined); } else { self.postMessage(validate(data.value, data.solution, data.all)); } self.close(); };'
                                ], { type: 'application/javascript' });
                                const blobURL = window.URL.createObjectURL(blob);

                                logger.debug({
                                    message: `blob created for ${  properties.name}`,
                                    method: 'PageDataSource.validateTestFromProperties',
                                    data: { blobURL, property: properties.name }
                                });

                                // Queue task into worker pool with name, script, and value to be posted to script
                                if (!properties.disabled) {
                                    workerPool.add(
                                        properties.name,
                                        blobURL,
                                        {
                                            value: all[properties.name],
                                            solution: properties.solution,
                                            all // all properties - TODO should be page properties only
                                        });
                                    );

                                    // Update result
                                    result[properties.name] = {
                                        page: pageIdx,
                                        name: properties.name,
                                        question: properties.question,
                                        tool: component.tool,
                                        value: test[properties.name].value,
                                        solution: properties.solution,
                                        result: undefined,
                                        omit: properties.omit,
                                        failure: properties.failure,
                                        success: properties.success,
                                        // disabled: properties.disabled,
                                        // Functions used by getScoreArray for improved display in score grid
                                        value$: function () {
                                            assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'PageComponent'));
                                            assert.instanceof(kendo.Observable, kidoju.tools, assert.format(assert.messages.instanceof.default, 'kidoju.tools', 'kendo.Observable'));
                                            var tool = kidoju.tools[component.tool]; // also this.tool
                                            assert.instanceof(kidoju.Tool, tool, assert.format(assert.messages.instanceof.default, 'tool', 'kidoju.Tool'));
                                            return tool.value$(this);
                                        },
                                        solution$: function () {
                                            assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'PageComponent'));
                                            assert.instanceof(kendo.Observable, kidoju.tools, assert.format(assert.messages.instanceof.default, 'kidoju.tools', 'kendo.Observable'));
                                            var tool = kidoju.tools[component.tool]; // also this.tool
                                            assert.instanceof(kidoju.Tool, tool, assert.format(assert.messages.instanceof.default, 'tool', 'kidoju.Tool'));
                                            return tool.solution$(this);
                                        }
                                    };

                                    logger.debug({
                                        message: `${properties.name  } added to the worker pool`,
                                        method: 'PageDataSource.validateTestFromProperties',
                                        data: { blobURL, property: properties.name }
                                    });
                                }
                            }
                        });
                });

                logger.debug({
                    message: 'Run the worker pool',
                    method: 'PageDataSource.validateTestFromProperties'
                });

                // Run the worker pool
                workerPool
                    .run()
                    .done(function() {
                        // iterate through recorded answer validations (arguments)
                        // for each named value
                        $.each(arguments, (index, argument) => {
                            // store the result which is success, failure or omitted (undefined)
                            result[argument.name].result = argument.value;
                            // store the score depending on the result
                            switch (argument.value) {
                                case true: // success
                                    if (
                                        result[argument.name] &&
                                        $.type(
                                            result[argument.name].success
                                        ) === NUMBER
                                    ) {
                                        result[argument.name].score =
                                            result[argument.name].success;
                                    }
                                    break;
                                case false: // failure
                                    if (
                                        result[argument.name] &&
                                        $.type(
                                            result[argument.name].failure
                                        ) === NUMBER
                                    ) {
                                        result[argument.name].score =
                                            result[argument.name].failure;
                                    }
                                    break;
                                default:
                                    // undefined (omitted)
                                    if (
                                        result[argument.name] &&
                                        $.type(result[argument.name].omit) ===
                                            NUMBER
                                    ) {
                                        result[argument.name].score =
                                            result[argument.name].omit;
                                    }
                                    break;
                            }
                            // calculate the total test score
                            // result.score += result[argument.name].score;
                            // calculate the max possible score in order to calculate a percentage
                            // if (result[argument.name] && result[argument.name].success) {
                            //    result.max += result[argument.name].success;
                            // }
                        });
                        deferred.resolve(result);
                    })
                    .fail(deferred.reject);
            })
            .fail(deferred.reject);

        // return the test result
        return deferred.promise();
    },

    /**
     * Stream validation
     */
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
        //    ret.push({ type: ERROR, index: -1, message: kendo.format(this.messages.minPages, MIN_PAGES) });
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
                        values._weight += kidoju.tools[tool].weight;
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
                        message: kendo.format(
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
                message: kendo.format(this.messages.minQuestions, MIN_WEIGHT)
            });
        }
        // Validate toolset (which includes _total) to make sure questions are varied
        // var TYPE_VARIETY = 3;
        // if (Object.keys(questions).length <= TYPE_VARIETY) {
        //     ret.push({ type: WARNING, index: -1, message: kendo.format(this.messages.typeVariety, TYPE_VARIETY) });
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
                        kidoju.tools,
                        assert.format(
                            assert.messages.instanceof.default,
                            'kidoju.tools',
                            'kendo.Observable'
                        )
                    );
                    ret.push({
                        type: WARNING,
                        index: -1,
                        message: kendo.format(
                            this.messages.qtyVariety,
                            proportion,
                            kidoju.tools[prop].description
                        )
                    });
                }
            }
        }
        return ret;
    }
});

/**
 * Default export
 */
export default Stream;
