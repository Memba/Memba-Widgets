/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { escapeRegExp } from '../common/window.util.es6';
import PageDataSource from './datasources.page.es6';
import PageComponentDataSource from './datasources.pagecomponent.es6';
import PageComponent from './models.pagecomponent.es6';
import BaseModel from './models.base.es6';

const {
    data: { ObservableArray },
    format
} = window.kendo;

// TODO List assets (requires access to tools)

/**
 * Page
 * @see kendo.data.HierarchicalDataSource and kendo.data.Node for implementation details
 * @class Page
 * @extends BaseModel
 */
const Page = BaseModel.define({
    id: CONSTANTS.ID,
    fields: {
        id: {
            type: CONSTANTS.STRING,
            editable: false,
            nullable: true
        },
        components: {
            type: CONSTANTS.OBJECT,
            // We cannot assign a data source as default value of a model
            // because otherwise it might be reused amongst instances.
            // The only way to ensure that a new instance gets a new default value is to initialize with []
            // and have BaseModel._parseData initialize the instance data source from [].
            // defaultValue: new PageComponentDataSource({ data: [] }),
            defaultValue: [],
            parse(value) {
                debugger;
                if (value instanceof PageComponentDataSource) {
                    return value;
                }
                if (Array.isArray(value) || value instanceof ObservableArray) {
                    return new PageComponentDataSource({
                        data: value
                    });
                }
                return new PageComponentDataSource(value);
            }
        },
        explanations: {
            type: CONSTANTS.STRING
        },
        instructions: {
            type: CONSTANTS.STRING
        },
        style: {
            type: CONSTANTS.STRING
        },
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
        debugger;
        if (this.model && this.model.components) {
            // Reset PageDataSource with model.pages dataSource options
            // especially for the case where we have defined CRUD transports
            this.components = new PageComponentDataSource(
                this.model.components
            );
        }

        const { components } = this;

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

        if (components instanceof PageComponentDataSource) {
            // Add parent function
            const that = this;
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
             .bind(CONSTANTS.ERROR, function (e) {
             var pageCollection = that.parent();
             if (pageCollection) {
             e.page = e.page || that;
             pageCollection.trigger(CONSTANTS.ERROR, e);
             }
             });
             */
        }

        this._loaded = !!(value && (value.components || value._loaded));
    },

    _initComponents() {},

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
        // is suggested by Kendo.data.Node
        options[this.idField || CONSTANTS.ID] = this.id;
        if (!this._loaded) {
            components._data = undefined;
            method = 'read';
        }
        components.one(
            CONSTANTS.CHANGE,
            $.proxy(function() {
                this.loaded(true);
            }, this)
        );
        return components[method](options);
    },

    /**
     * Get the component index
     * @method index
     */
    index() {
        let index;
        if ($.isFunction(this.parent)) {
            const collection = this.parent();
            if (collection instanceof PageDataSource) {
                index = collection.indexOf(this);
            }
        }
        return index;
    },

    /**
     * Get the parent stream if any
     * @returns {*}
     */
    stream() {
        let stream;
        if ($.isFunction(this.parent)) {
            const collection = this.parent();
            if (
                collection instanceof PageDataSource &&
                $.isFunction(collection.parent)
                // We do not check instanceof Stream to avoid a circular dependency
            ) {
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
     * Note: we are not using toJSON because some fields might not be serializable
     * @method clone
     */
    clone() {
        let clone = {};
        // Copy page fields (explanations, instructions, style), but not components
        Object.keys(this.fields).forEach(key => {
            if (key !== this.idField && key !== 'components') {
                clone[key] = this.get(key);
            }
        });
        clone = new Page(clone);
        // Copy components
        const { components } = this;
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
        createMultiQuizExplanations: 'The correct answers are:\n\n- **{0}**.',
        createMultiQuizInstructions:
            'Please select the options which correspond to your answers to the question: _{0}_.',
        createTextBoxExplanations: 'The correct answer is **{0}**.',
        createTextBoxInstructions:
            'Please fill in the text box with your answer to the question: _{0}_.',
        createQuizExplanations: 'The correct answer is **{0}**.',
        createQuizInstructions:
            'Please select the option which corresponds to your answer to the question: _{0}_.',
        emptyPage: 'Page {0} cannot be empty.',

        // TODO: Remove rules that belong to tools

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

    /**
     * Page validation
     * @param pageIdx
     * @returns {Array}
     */
    validate(pageIdx) {
        assert.instanceof(
            Page,
            this,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'kidoju.data.Page'
            )
        );
        assert.type(
            CONSTANTS.NUMBER,
            pageIdx,
            assert.format(
                assert.messages.type.default,
                'pageIdx',
                CONSTANTS.NUMBER
            )
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
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(this.messages.emptyPage, pageIdx + 1)
            });
        }
        for (let i = 0; i < componentTotal; i++) {
            const component = this.components.at(i);
            if (component.tool === 'connector') {
                connectorCount++;
            }
            hasDraggable =
                hasDraggable ||
                ($.type(component.properties) === CONSTANTS.OBJECT &&
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
                ($.type(component.properties) === CONSTANTS.OBJECT &&
                    component.properties.behavior === 'selectable');
            hasSelector = hasSelector || component.tool === 'selector';
            hasQuestion =
                hasQuestion ||
                ($.type(component.properties) === CONSTANTS.OBJECT &&
                    $.type(component.properties.validation) ===
                        CONSTANTS.STRING &&
                    component.properties.validation.length);
            ret = ret.concat(component.validate(pageIdx));
        }
        // Check a label
        if (componentTotal > 0 && !hasLabel) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(this.messages.missingLabel, pageIdx + 1)
            });
        }
        // Check a multimedia element
        /*
        if (componentTotal > 0 && !hasMultimedia) {
            ret.push({ type: CONSTANTS.WARNING, index: pageIdx, message: format(this.messages.missingMultimedia, pageIdx + 1) });
        }
        */
        // Check a question
        if (componentTotal > 0 && !hasQuestion) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(this.messages.missingQuestion, pageIdx + 1)
            });
        }
        // Check connectors
        const MIN_CONNECTORS = 4;
        if (connectorCount > 0 && connectorCount < MIN_CONNECTORS) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(
                    this.messages.minConnectors,
                    MIN_CONNECTORS,
                    pageIdx + 1
                )
            });
        }
        // Check drop zone and draggable
        if (hasDropZone && !hasDraggable) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(this.messages.missingDraggable, pageIdx + 1)
            });
        } else if (!hasDropZone && hasDraggable) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(this.messages.missingDropZone, pageIdx + 1)
            });
        }
        // Check selectors and selectable
        if (hasSelector && !hasSelectable) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(this.messages.missingSelectable, pageIdx + 1)
            });
        } else if (!hasSelector && hasSelectable) {
            ret.push({
                type: CONSTANTS.ERROR,
                index: pageIdx,
                message: format(this.messages.missingSelector, pageIdx + 1)
            });
        }
        // Check instructions
        const instructions = (this.get('instructions') || '').trim();
        if (!instructions) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(this.messages.missingInstructions, pageIdx + 1)
            });
        }
        // Check explanations
        const explanations = (this.get('explanations') || '').trim();
        if (!explanations) {
            ret.push({
                type: CONSTANTS.WARNING,
                index: pageIdx,
                message: format(this.messages.missingExplanations, pageIdx + 1)
            });
        }
        return ret;
    }
});

/**
 * createTextBoxPage
 */
Page.createTextBoxPage = options => {
    assert.isPlainObject(
        options,
        assert.format(assert.messages.isPlainObject.default, 'options')
    );
    assert.type(
        CONSTANTS.STRING,
        options.question,
        assert.format(
            assert.messages.type.default,
            options.question,
            CONSTANTS.STRING
        )
    );
    assert.type(
        CONSTANTS.STRING,
        options.solution,
        assert.format(
            assert.messages.type.default,
            options.solution,
            CONSTANTS.STRING
        )
    );
    const solutions = options.solution
        .split('\n')
        .filter(item => item.trim() !== '');
    const escaped = solutions.map(escapeRegExp);
    return new Page({
        components: [
            new PageComponent({
                tool: 'label',
                top: 40,
                left: 40,
                width: 940,
                height: 160,
                attributes: {
                    text: options.question
                }
            }),
            new PageComponent({
                tool: 'image',
                top: 250,
                left: 580,
                width: 360,
                height: 360,
                attributes: {
                    alt: options.question
                }
            }),
            new PageComponent({
                tool: 'textbox',
                top: 380,
                left: 80,
                width: 380,
                height: 100,
                properties: {
                    question: options.question,
                    solution: solutions[0],
                    validation:
                        solutions.length > 1
                            ? `// ignoreCaseMatch ${JSON.stringify([
                                `^(?:${escaped.join('|')})$` // eslint-disable-line prettier/prettier
                            ])}` // eslint-disable-line prettier/prettier
                            : '// ignoreCaseEqual'
                }
            })
        ],
        instructions: format(
            Page.prototype.messages.createTextBoxInstructions,
            options.question
        ),
        explanations: format(
            Page.prototype.messages.createTextBoxExplanations,
            solutions[0]
        )
    });
};

/**
 * createQuizPage
 */
Page.createQuizPage = options => {
    assert.isPlainObject(
        options,
        assert.format(assert.messages.isPlainObject.default, 'options')
    );
    assert.type(
        CONSTANTS.STRING,
        options.question,
        assert.format(
            assert.messages.type.default,
            options.question,
            CONSTANTS.STRING
        )
    );
    assert.isArray(
        options.data,
        assert.format(assert.messages.isArray.default, options.data)
    );
    assert.type(
        CONSTANTS.STRING,
        options.solution,
        assert.format(
            assert.messages.type.default,
            options.solution,
            CONSTANTS.STRING
        )
    );
    // TODO Check that options.data has text and image
    return new Page({
        components: [
            new PageComponent({
                tool: 'label',
                top: 40,
                left: 40,
                width: 940,
                height: 160,
                attributes: {
                    text: options.question
                }
            }),
            new PageComponent({
                tool: 'image',
                top: 250,
                left: 580,
                width: 360,
                height: 360,
                attributes: {
                    alt: options.question
                }
            }),
            new PageComponent({
                tool: 'quiz',
                top: 250,
                left: 80,
                width: 440,
                height: 360,
                attributes: {
                    mode: 'radio',
                    data: options.data
                },
                properties: {
                    question: options.question,
                    solution: options.solution,
                    validation: '// equal'
                }
            })
        ],
        instructions: format(
            Page.prototype.messages.createQuizInstructions,
            options.question
        ),
        explanations: format(
            Page.prototype.messages.createQuizExplanations,
            options.solution
        )
    });
};

/**
 * createMultiQuizPage
 */
Page.createMultiQuizPage = options => {
    assert.isPlainObject(
        options,
        assert.format(assert.messages.isPlainObject.default, 'options')
    );
    assert.type(
        CONSTANTS.STRING,
        options.question,
        assert.format(
            assert.messages.type.default,
            options.question,
            CONSTANTS.STRING
        )
    );
    assert.isArray(
        options.data,
        assert.format(assert.messages.isArray.default, options.data)
    );
    // TODO Check that options.data has text and image
    assert.isArray(
        options.solution,
        assert.format(assert.messages.isArray.default, options.solution)
    );
    return new Page({
        components: [
            new PageComponent({
                tool: 'label',
                top: 40,
                left: 40,
                width: 940,
                height: 160,
                attributes: {
                    text: options.question
                }
            }),
            new PageComponent({
                tool: 'image',
                top: 250,
                left: 580,
                width: 360,
                height: 360,
                attributes: {
                    alt: options.question
                }
            }),
            new PageComponent({
                tool: 'multiquiz',
                top: 250,
                left: 80,
                width: 440,
                height: 360,
                attributes: {
                    mode: 'checkbox',
                    data: options.data
                },
                properties: {
                    question: options.question,
                    solution: options.solution,
                    validation: '// equal'
                }
            })
        ],
        instructions: format(
            Page.prototype.messages.createQuizInstructions,
            options.question
        ),
        explanations: format(
            Page.prototype.messages.createMultiQuizExplanations,
            options.solution.join('**,\n- **')
        )
    });
};

/**
 * Default export
 */
export default Page;
