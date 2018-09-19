/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import BaseModel from './models.base.es6';
import PageComponent from './models.pagecomponent.es6';
import CONSTANTS from '../common/window.constants.es6';
import assert from '../common/window.assert.es6';

const { DataSource } = window.kendo.data;
const PageComponentCollectionDataSource = DataSource; // TODO Review

// TODO List assets (requires access to tools)

/**
 * Page
 * @see kendo.data.HierarchicalDataSource and kendo.data.Node for implementation details
 * @class Page
 * @type {void|*}
 */
const Page = BaseModel.define({
    id: CONSTANTS.ID,
    fields: {
        id: {
            type: CONSTANTS.STRING,
            nullable: true,
            editable: false
        },
        components: {
            // We cannot assign a data source as default value of a model
            // because otherwise it might be reused amongst instances.
            // The only way to ensure that a new instance gets a new default value is to initialize with []
            // and have kidoju.data.Model._parseData initialize the instance data source from [].
            // defaultValue: new kidoju.data.PageComponentCollectionDataSource({ data: [] }),
            defaultValue: [],
            parse(value) {
                if (value instanceof PageComponentCollectionDataSource) {
                    return value;
                } else if (Array.isArray(value)) { // TODO: ObservableArray?
                    return new PageComponentCollectionDataSource({
                        data: value
                    });
                }
                return new PageComponentCollectionDataSource(value);
            }
        },
        explanations: {
            // displayed in review mode
            type: CONSTANTS.STRING
        },
        instructions: {
            // displayed in play mode
            type: CONSTANTS.STRING
        },
        style: {
            type: CONSTANTS.STRING
        },
        // New properties
        time: {
            type: CONSTANTS.NUMBER
        }
    },

    /**
     * @constructor
     * @param value
     */
    init(value) {
        // Call the base init method
        BaseModel.fn.init.call(this, value);


        if (that.model && that.model.components) {
            // Reset PageCollectionDataSource with model.pages dataSource options
            // especially for the case where we have defined CRUD transports
            that.components = new PageComponentCollectionDataSource(
                that.model.components
            );
        }

        const components = that.components;

        /*
         var transport = components.transport,
         parameterMap = transport.parameterMap;
         transport.parameterMap = function (data, type) {
         data[that.idField || CONSTANTS.ID] = that.id;
         if (parameterMap) {
         data = parameterMap(data, type);
         }
         return data;
         };
         */

        if (components instanceof PageComponentCollectionDataSource) {
            // Add parent function
            components.parent = function() {
                return that;
            };

            // Bind the change and error events
            // to propagate them from the components collection to the page node
            /*
             components
             .bind(CHANGE, function (e) {
             e.page = e.page || that;
             that.trigger(CHANGE, e);
             })
             .bind(ERROR, function (e) {
             var pageCollection = that.parent();
             if (pageCollection) {
             e.page = e.page || that;
             pageCollection.trigger(ERROR, e);
             }
             });
             */
        }

        that._loaded = !!(value && (value.components || value._loaded));
    },

    /**
     * @method append
     * @param component
     */
    append(component) {
        this.loaded(true);
        this.components.add(component);
    },

    /**
     * @method load
     * @returns {*}
     */
    load() {
        const options = {};
        let method = '_query';
        const components = this.components;
        // Passing the id of the page to the components _query method
        // is suggested by lendo.data.Node
        options[this.idField || CONSTANTS.ID] = this.id;
        if (!this._loaded) {
            components._data = undefined;
            method = 'read';
        }
        components.one(
            CHANGE,
            $.proxy(function() {
                this.loaded(true);
            }, this)
        );
        return components[method](options);
    },

    /**
     * Get the parent stream if any
     * @returns {*}
     */
    stream() {
        let stream;
        if ($.type(this.parent) === CONSTANTS.FUNCTION) {
            const collection = this.parent();
            if ($.type(collection.parent) === CONSTANTS.FUNCTION) {
                stream = collection.parent();
            }
        }
        return stream;
    },

    /**
     * Gets or sets the loaded status of page components
     * @param value
     * @returns {boolean|*|Page._loaded}
     */
    loaded(value) {
        if (value !== undefined) {
            this._loaded = value;
        } else {
            return this._loaded;
        }
    },

    /**
     * Clone a page
     */
    clone() {
        const page = this;
        const fields = page.fields;
        let clone = {};
        // Copy page fields (explanations, instructions, style)
        for (const field in fields) {
            if (
                fields.hasOwnProperty(field) &&
                $.type(fields[field].type) === CONSTANTS.STRING &&
                field !== page.idField
            ) {
                clone[field] = page.get(field);
            }
        }
        clone = new Page(clone);
        // Copy components
        const components = page.components;
        for (let i = 0, total = components.total(); i < total; i++) {
            clone.components.add(components.at(i).clone());
        }
        // Return clone
        return clone;
    },

    /**
     * i18n Messages
     */
    messages: {
        emptyPage: 'Page {0} cannot be empty.',
        minConnectors:
            'At least {0} Connectors are required to make a question on page {1}.',
        missingDraggable:
            'Draggable Labels or Images are required for a Drop Zone on page {0}.',
        missingDropZone:
            'A Drop Zone is required for draggable Labels or Images on page {0}.',
        missingLabel: 'A Label is recommended on page {0}.',
        missingMultimedia:
            'A multimedia element (Image, Audio, Video) is recommended on page {0}.',
        missingQuestion: 'A question is recommended on page {0}.',
        missingSelectable:
            'Selectable Labels or Images are required for a Selector on page {0}.',
        missingSelector:
            'A Selector is required for selectable Labels or Images on page {0}.',
        missingInstructions: 'Instructions are recommended on page {0}.',
        missingExplanations: 'Explanations are recommended on page {0}.'
    },

    /* This function's cyclomatic complexity is too high. */
    /* jshint -W074 */

    /**
     * Page validation
     * @param pageIdx
     * @returns {Array}
     */
    validate(pageIdx) {
        /* jshint maxcomplexity: 24 */
        assert.instanceof(
            Page,
            this,
            kendo.format(
                assert.messages.instanceof.default,
                'this',
                'kidoju.data.Page'
            )
        );
        assert.type(
            NUMBER,
            pageIdx,
            kendo.format(assert.messages.type.default, 'pageIdx', NUMBER)
        );
        // TODO also validate that formulas only use values available on the page
        let ret = [];
        let hasDraggable = false;
        let hasDropZone = false;
        let hasSelectable = false;
        let hasSelector = false;
        let hasLabel = false;
        let hasMultimedia = false;
        let hasQuestion = false;
        let connectorCount = 0;
        const componentTotal = this.components.total();
        if (componentTotal === 0) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(this.messages.emptyPage, pageIdx + 1)
            });
        }
        for (let i = 0; i < componentTotal; i++) {
            const component = this.components.at(i);
            if (component.tool === 'connector') {
                connectorCount++;
            }
            hasDraggable =
                hasDraggable ||
                ($.type(component.properties) === OBJECT &&
                    component.properties.behavior === 'draggable');
            hasDropZone = hasDropZone || component.tool === 'dropzone';
            hasLabel = hasLabel || component.tool === 'label';
            hasMultimedia =
                hasMultimedia ||
                (component.tool === 'image' ||
                    component.tool === 'audio' ||
                    component.tool === 'video');
            hasSelectable =
                hasSelectable ||
                ($.type(component.properties) === OBJECT &&
                    component.properties.behavior === 'selectable');
            hasSelector = hasSelector || component.tool === 'selector';
            hasQuestion =
                hasQuestion ||
                ($.type(component.properties) === OBJECT &&
                    $.type(component.properties.validation) ===
                        CONSTANTS.STRING &&
                    component.properties.validation.length);
            ret = ret.concat(component.validate(pageIdx));
        }
        // Check a label
        if (componentTotal > 0 && !hasLabel) {
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(this.messages.missingLabel, pageIdx + 1)
            });
        }
        // Check a multimedia element
        /*
        if (componentTotal > 0 && !hasMultimedia) {
            ret.push({ type: WARNING, index: pageIdx, message: kendo.format(this.messages.missingMultimedia, pageIdx + 1) });
        }
        */
        // Check a question
        if (componentTotal > 0 && !hasQuestion) {
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(
                    this.messages.missingQuestion,
                    pageIdx + 1
                )
            });
        }
        // Check connectors
        const MIN_CONNECTORS = 4;
        if (connectorCount > 0 && connectorCount < MIN_CONNECTORS) {
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(
                    this.messages.minConnectors,
                    MIN_CONNECTORS,
                    pageIdx + 1
                )
            });
        }
        // Check drop zone and draggable
        if (hasDropZone && !hasDraggable) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(
                    this.messages.missingDraggable,
                    pageIdx + 1
                )
            });
        } else if (!hasDropZone && hasDraggable) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(
                    this.messages.missingDropZone,
                    pageIdx + 1
                )
            });
        }
        // Check selectors and selectable
        if (hasSelector && !hasSelectable) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(
                    this.messages.missingSelectable,
                    pageIdx + 1
                )
            });
        } else if (!hasSelector && hasSelectable) {
            ret.push({
                type: ERROR,
                index: pageIdx,
                message: kendo.format(
                    this.messages.missingSelector,
                    pageIdx + 1
                )
            });
        }
        // Check instructions
        const instructions = (this.get('instructions') || '').trim();
        if (!instructions) {
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(
                    this.messages.missingInstructions,
                    pageIdx + 1
                )
            });
        }
        // Check explanations
        const explanations = (this.get('explanations') || '').trim();
        if (!explanations) {
            ret.push({
                type: WARNING,
                index: pageIdx,
                message: kendo.format(
                    this.messages.missingExplanations,
                    pageIdx + 1
                )
            });
        }
        return ret;
    }

    /* jshint +W074 */
});

/**
 * TODO add createTetBoxPage, createQuizPage, createMultiQuizPage
 */

/**
 * ES6 default export
 */
export default Page;

/**
 * Legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.data = window.kidoju.data || {};
window.kidoju.data.Page = Page;
