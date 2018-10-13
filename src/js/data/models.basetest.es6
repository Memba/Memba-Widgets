/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import BaseModel from './models.base.es6';
import tools from '../tools/tools.es6';

const logger = new Logger('models.basetest');

/**
 * BaseTest
 * @class BaseTest
 * @extends BaseModel
 */
const BaseTest = BaseModel.define({
    // id
    fields: {
        // Store for interactions
        interactions: {
            defaultValue: []
        }
        // TODO store for random/calculated constants

        // TODO time ....
    },

    /**
     * Grade test
     */
    grade() {
        const promises = Object.key(this.fields).map(field =>
            this.gradeField(field)
        );
        return $.when(...promises);
    },

    /**
     * Grade page
     * @param pageIdx
     */
    gradePage(pageIdx) {},

    /**
     * Grade field
     * @param field
     */
    gradeField(field) {
        const dfd = $.Deferred();
        return dfd.promise().resolve();
    },

    /**
     * Grade a page
     * IMPORTANT: Make sure all pages are loaded first
     * @method grade (formerly validateTestFromProperties)
     * @param pageIdx (a page index)
     * @returns {*}
     */
    /*
    grade(pageIdx) {
        const pageCollectionDataSource = this; // don't use that which is used below
        const deferred = $.Deferred();
        const workerPool = new WorkerPool(
            (window.navigator.hardwareConcurrency || 2) - 1,
            workerTimeout()
        );
        // TODO: use an app.model and define a submodel with each field - see BaseTest above
        const result = {
            interactions: test.interactions,

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
        .then(workerLib => {
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
                        const properties = component.properties;
                        assert.instanceof(
                            kendo.data.Model,
                            properties,
                            assert.format(
                                assert.messages.instanceof.default,
                                'properties',
                                'kendo.data.Model'
                            )
                        );
                        assert.type(
                            OBJECT,
                            properties.fields,
                            assert.format(
                                assert.messages.type.default,
                                'properties.fields',
                                OBJECT
                            )
                        );

                        // If our component has a name property to record the result of a test interaction
                        // Note: some components like textboxes have properties, others likes labels and images don't
                        // assert.type(STRING, properties.name, assert.format(assert.messages.type.default, 'properties.name', STRING));
                        if (
                            $.type(properties.name) === STRING &&
                            $.type(properties.validation) === STRING
                        ) {
                            let code;
                            const libraryMatches = properties.validation.match(
                                RX_VALIDATION_LIBRARY
                            );
                            if (
                                $.isArray(libraryMatches) &&
                                libraryMatches.length === 4
                            ) {
                                // Find libraryMatches[1] in the code library
                                // Array.find is not available in Internet Explorer, thus the use of Array.filter
                                let found = properties._library.filter(
                                    item => item.name === libraryMatches[1]
                                );
                                assert.isArray(
                                    found,
                                    assert.format(
                                        assert.messages.isArray.default,
                                        'found'
                                    )
                                );
                                assert.hasLength(
                                    found,
                                    assert.format(
                                        assert.messages.hasLength.default,
                                        'found'
                                    )
                                );
                                found = found[0];
                                assert.isPlainObject(
                                    found,
                                    assert.format(
                                        assert.messages.isPlainObject
                                            .default,
                                        'found'
                                    )
                                );
                                assert.type(
                                    STRING,
                                    found.formula,
                                    assert.format(
                                        assert.messages.type.default,
                                        'found.formula',
                                        STRING
                                    )
                                );
                                // libraryMatches[3] is the param value beginning with ` ["` and ending with `"]`
                                let paramValue = libraryMatches[3];
                                if (
                                    $.type(found.param) === STRING &&
                                    $.type(paramValue) === STRING &&
                                    paramValue.length > '[]'.length
                                ) {
                                    // Get the  paramValue in the JSON array
                                    paramValue = JSON.parse(paramValue)[0];
                                }
                                // This is code from the library possibly with param
                                // When we shall have several params, consider kendo.format.apply(this, [paramValue])
                                code = format(
                                    found.formula,
                                    paramValue
                                );
                            } else {
                                // This is custom code not form the library
                                code = properties.validation;
                            }

                            // Note: when e.data.value is undefined, we need to specifically call postMessage(undefined) instead of postMessage() otherwise we get the following error:
                            // Uncaught TypeError: Failed to execute 'postMessage' on 'DedicatedWorkerGlobalScope': 1 argument required, but only 0 present.
                            const blob = new Blob(
                                [
                                    // 'self.importScripts("' + workerLibPath + '");\n' +
                                    `${workerLib};\n` +
                                    `self.onmessage = function (e) {\n${code}\nvar data=JSON.parse(e.data);\nif (typeof data.value === "undefined") { self.postMessage(undefined); } else { self.postMessage(validate(data.value, data.solution, data.all)); } self.close(); };`
                                ],
                                { type: 'application/javascript' }
                            );
                            const blobURL = window.URL.createObjectURL(
                                blob
                            );

                            logger.debug({
                                message: `blob created for ${
                                    properties.name
                                    }`,
                                method:
                                    'PageDataSource.validateTestFromProperties',
                                data: { blobURL, property: properties.name }
                            });

                            // Queue task into worker pool with name, script, and value to be posted to script
                            if (!properties.disabled) {
                                workerPool.add(properties.name, blobURL, {
                                    value: all[properties.name],
                                    solution: properties.solution,
                                    all // all properties - TODO should be page properties only
                                });

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
                                    value$() {
                                        assert.instanceof(
                                            PageComponent,
                                            component,
                                            assert.format(
                                                assert.messages.instanceof
                                                    .default,
                                                'component',
                                                'PageComponent'
                                            )
                                        );
                                        assert.instanceof(
                                            kendo.Observable,
                                            tools,
                                            assert.format(
                                                assert.messages.instanceof
                                                    .default,
                                                'tools',
                                                'kendo.Observable'
                                            )
                                        );
                                        const tool =
                                            tools[component.tool]; // also this.tool
                                        assert.instanceof(
                                            kidoju.Tool,
                                            tool,
                                            assert.format(
                                                assert.messages.instanceof
                                                    .default,
                                                'tool',
                                                'kidoju.Tool'
                                            )
                                        );
                                        return tool.getHtmlValue(this);
                                    },
                                    solution$() {
                                        assert.instanceof(
                                            PageComponent,
                                            component,
                                            assert.format(
                                                assert.messages.instanceof
                                                    .default,
                                                'component',
                                                'PageComponent'
                                            )
                                        );
                                        assert.instanceof(
                                            kendo.Observable,
                                            tools,
                                            assert.format(
                                                assert.messages.instanceof
                                                    .default,
                                                'tools',
                                                'kendo.Observable'
                                            )
                                        );
                                        const tool =
                                            tools[component.tool]; // also this.tool
                                        assert.instanceof(
                                            kidoju.Tool,
                                            tool,
                                            assert.format(
                                                assert.messages.instanceof
                                                    .default,
                                                'tool',
                                                'kidoju.Tool'
                                            )
                                        );
                                        return tool.getHtmlSolution(this);
                                    }
                                };

                                logger.debug({
                                    message: `${
                                        properties.name
                                        } added to the worker pool`,
                                    method:
                                        'PageDataSource.validateTestFromProperties',
                                    data: {
                                        blobURL,
                                        property: properties.name
                                    }
                                });
                            }
                        }
                    }
                );
            });

            logger.debug({
                message: 'Run the worker pool',
                method: 'PageDataSource.validateTestFromProperties'
            });

            // Run the worker pool
            workerPool
            .run()
            .then(function() {
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
            .catch(deferred.reject);
        })
        .catch(deferred.reject);

        // return the test result
        return deferred.promise();
    },
    */

    /**
     * User score
     * @returns {number}
     */
    score() {
        let score = 0;
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

    /**
     * Max possible score
     * @method max
     * @returns {number}
     */
    max() {
        let max = 0;
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

    /**
     * Score/Max as a percentage
     * @method percent
     * @returns {number}
     */
    percent() {
        const max = this.max();
        const score = this.score();
        return score === 0 || max === 0 ? 0 : (100 * score) / max;
    },

    /**
     * Get score table
     * @method getScoreTable (formerly getScoreArray)
     * @returns {Array}
     */
    getScoreTable() {
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

    /**
     * toJSON
     * @method toJSON
     */
    toJSON() {
        const json = {};
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
});

/**
 * Default export
 */
export default BaseTest;
