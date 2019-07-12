/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import __ from '../app/app.i18n.es6';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { randomVal } from '../common/window.util.es6';
import BaseModel from '../data/data.base.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import poolExec from '../workers/workers.exec.es6';
import BaseAdapter from './adapters.base.es6';
import NumberAdapter from './adapters.number.es6';
import TOOLS from './util.constants.es6';
import {
    isCustomFormula,
    isLibraryFormula,
    parseLibraryItem
} from './util.libraries.es6';

const {
    attr,
    Class,
    data: { ObservableArray },
    format,
    getter,
    htmlEncode,
    ns,
    resize,
    template
} = window.kendo;

/**
 * StubToo;
 */
const StubTool = Class.extend({
    cursor: CONSTANTS.CROSSHAIR_CURSOR,
    description: '',
    help: '',
    icon: '',
    id: null,
    name: '',

    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options) {
        // Extend tool with init options
        $.extend(this, options);
    },

    /**
     * Get description
     * @method getDescription
     * @param component
     * @returns {Array}
     */
    getDescription(component) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        return template(this.description || CONSTANTS.EMPTY)(component);
    },

    /**
     * Get help
     * @method getHelp
     * @param component
     * @returns {Array}
     */
    getHelp(component) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        return template(this.help || CONSTANTS.EMPTY)(component);
    }
});

/**
 * BaseTool
 * @class BaseTool
 * @extends Class
 */
const BaseTool = StubTool.extend({
    attributes: {},
    childSelector: CONSTANTS.DIV,
    field: {
        // TODO check whether we need a type?
        // The field definition for building the TestModel (see getTestModelField)
        type: CONSTANTS.STRING,
        // defaultValue: null,
        // editable: true
        nullable: true
        // parse(value) { return value; }
        // from: undefined
        // validation: {}
    },
    height: 250,
    properties: {},
    weight: 0,
    width: 250,

    /**
     * Get a BaseModel for attributes
     * @method getAttributeModel
     * @returns {BaseModel}
     * @private
     */
    getAttributeModel() {
        const model = { fields: {} };
        Object.keys(this.attributes).forEach(key => {
            if (this.attributes[key] instanceof BaseAdapter) {
                model.fields[key] = this.attributes[key].getField();
            }
        });
        return BaseModel.define(model);
    },

    /**
     * Gets property grid row specifications for attributes
     * @method getAttributeRows
     * @returns {Array}
     * @private
     */
    getAttributeRows() {
        const rows = [];
        const data = {};
        data[attr('decimals')] = 0;
        data[attr('format')] = 'n0';
        // Add top, left, height, width, rotation
        rows.push(
            new NumberAdapter(
                { title: __('tools.basetool.top.title') },
                data
            ).getRow('top')
        );
        rows.push(
            new NumberAdapter(
                { title: __('tools.basetool.left.title') },
                data
            ).getRow('left')
        );
        rows.push(
            new NumberAdapter(
                { title: __('tools.basetool.height.title') },
                data
            ).getRow('height')
        );
        rows.push(
            new NumberAdapter(
                { title: __('tools.basetool.width.title') },
                data
            ).getRow('width')
        );
        rows.push(
            new NumberAdapter(
                { title: __('tools.basetool.rotate.title') },
                data
            ).getRow('rotate')
        );

        // Add other attributes
        Object.keys(this.attributes).forEach(key => {
            if (this.attributes[key] instanceof BaseAdapter) {
                rows.push(this.attributes[key].getRow(`attributes.${key}`));
            }
        });
        return rows;
    },

    /**
     * Get a BaseModel for properties
     * @method getPropertyModel
     * @returns {BaseModel}
     * @private
     */
    getPropertyModel() {
        const model = { fields: {} };
        Object.keys(this.properties).forEach(key => {
            if (this.properties[key] instanceof BaseAdapter) {
                model.fields[key] = this.properties[key].getField();
                if (key === 'name') {
                    // This cannot be set as a default value on the adapter
                    // because each instance should have a different name
                    model.fields.name.defaultValue = randomVal();
                }
            }
        });
        return BaseModel.define(model);
    },

    /**
     * Gets property grid row specifications for properties
     * @method _getPropertyRows
     * @returns {Array}
     * @private
     */
    getPropertyRows() {
        const rows = [];
        Object.keys(this.properties).forEach(key => {
            if (this.properties[key] instanceof BaseAdapter) {
                rows.push(this.properties[key].getRow(`properties.${key}`));
            }
        });
        return rows;
    },

    /**
     * Get assets
     * @method getAssets
     * @param component
     * @returns {Array}
     */
    getAssets(component) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        return {
            audio: [],
            image: [],
            video: []
        };
    },

    /**
     * Get Question
     * @param component
     * @returns {string}
     */
    getQuestion(component) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        return component.get('properties.question');
    },

    /**
     * Get Solution
     * @param component
     * @returns {string}
     */
    getSolution(component) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        return component.get('properties.solution');
    },

    /**
     * Get the field definition for a test model derived from BaseTest
     * @method getTestModelField
     * @param component
     * @returns {{type: string, defaultValue: string}}
     */
    getTestModelField(component) {
        const tool = this;
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        // The component must belong to a page
        assert.isDefined(
            component.page(),
            assert.format(assert.messages.isDefined.default, 'component.page()')
        );
        // It is essential that the tool matches the component
        assert.equal(
            this.id,
            component.tool,
            assert.format(
                assert.messages.equal.default,
                'this.id',
                'component.tool'
            )
        );
        return BaseModel.define({
            fields: {
                value: Object.assign({}, this.field),
                result: {
                    type: CONSTANTS.BOOLEAN,
                    nullable: true
                },
                score: {
                    type: CONSTANTS.NUMBER,
                    defaultValue: component.get('properties.omit')
                }
            },
            // Bind change event in constructor
            init(options) {
                const that = this;
                BaseModel.fn.init.call(that, options);
                that.bind(CONSTANTS.CHANGE, e => {
                    // When value changes
                    if (e.field === 'value') {
                        // Reset grading and score calculations
                        that.set('result', that.defaults.result);
                        that.set('score', that.defaults.score);
                    }
                });
            },
            // Related componenet
            component() {
                return component;
            },
            // Related page
            page() {
                return component.page();
            },
            // Related stream
            stream() {
                // Assigning a page to selectedPage in the viewModel
                // compromises the parent method
                return (
                    component.page().stream() ||
                    component.page().parent().stream
                );
            },
            pageIdx() {
                return this.stream().pages.indexOf(this.page());
            },
            // Related tool
            tool() {
                return tool;
            },
            // Validation formula to pass to the worker pool
            validation() {
                const { library } = tool.properties.validation;
                let validation = component.get('properties.validation');
                if (isLibraryFormula(validation)) {
                    validation = parseLibraryItem(validation, library);
                }
                // Validation is either a string (custom) or an object ({ item: ..., params: ...})
                return validation;
            },
            // Values
            values() {
                const values = {};
                const model = this.parent(); // a TestModel derived from BaseTest
                const page = this.page();
                Object.keys(model.fields).forEach(key => {
                    if (
                        TOOLS.RX_TEST_FIELD_NAME.test(key) && // val_xxxxxx
                        model[key].page() === page // same page
                    ) {
                        values[key] = model[key].get('value');
                    }
                });
                return values;
            },
            variables() {
                let ret = {};
                const model = this.parent(); // a TestModel derived from BaseTest
                if (
                    model instanceof BaseModel &&
                    model.variables instanceof ObservableArray
                ) {
                    const variables = model.variables.at(this.pageIdx());
                    if (variables && $.isFunction(variables.toJSON)) {
                        ret = variables.toJSON();
                    }
                }
                return ret;
            },
            // Format data for poolExec validation
            data() {
                const pageValues = this.values();
                const variables = this.variables();
                return {
                    value: this.get('value'),
                    solution: tool.getSolution(component, variables),
                    // Other field values on the same page
                    // assuming this TestModelField is part of a TestModel
                    all: $.extend(pageValues, variables)
                };
            },
            // grade function
            grade() {
                const that = this;
                const dfd = $.Deferred();
                const name = component.get('properties.name');
                const data = that.data();
                let validation = that.validation();
                if (
                    $.type(validation) === CONSTANTS.OBJECT &&
                    $.type(validation.item) === CONSTANTS.OBJECT
                    // validation.params are optional
                ) {
                    // Check the editor before replacing validation
                    if ($.isFunction(validation.item.editor)) {
                        // Replace solution with params
                        data.solution = validation.params;
                    }
                    // This is a library item
                    validation = validation.item.formula;
                }
                if (!TOOLS.RX_VALIDATION_FORMULA.test(validation)) {
                    // The library item is missing
                    return dfd
                        .reject(
                            new Error(
                                `Missing validation formula for grading ${name}`
                            )
                        )
                        .promise();
                }
                poolExec(validation, data, name)
                    .then(res => {
                        if (res.name === name) {
                            if (res.result === true) {
                                that.set('result', true);
                                that.set(
                                    'score',
                                    component.get('properties.success')
                                );
                            } else if (res.result === false) {
                                that.set('result', false);
                                that.set(
                                    'score',
                                    component.get('properties.failure')
                                );
                            } else {
                                that.set('result', that.defaults.result);
                                that.set('score', that.defaults.score);
                            }
                            dfd.resolve();
                        } else {
                            that.set('result', that.defaults.result);
                            that.set('score', that.defaults.score);
                            dfd.reject(
                                new Error(
                                    `The grading result pertains to task name ${res.name} instead of ${name}`
                                )
                            );
                        }
                    })
                    .catch(dfd.reject);

                return dfd.promise();
            },
            // Html encoded question to display in the score grid
            question$() {
                return tool.getHtmlQuestion(component, this.variables());
            },
            // Html encoded solution to display in the score grid
            solution$() {
                return tool.getHtmlSolution(component, this.variables());
            },
            // Html encoded value to display in the score grid
            value$() {
                return tool.getHtmlValue(this);
            },
            // Conversion to JSON for storage with an activity
            toJSON() {
                // TODO Consider eliminating null values
                return BaseModel.fn.toJSON.call(this);
            }
        });
    },

    /**
     * Get Html or jQuery content
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        // It is essential that the tool matches the component
        assert.equal(
            this.id,
            component.tool,
            assert.format(
                assert.messages.equal.default,
                'this.id',
                'component.tool'
            )
        );
        assert.enum(
            Object.values(TOOLS.STAGE_MODES),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.values(TOOLS.STAGE_MODES)
            )
        );
        const { templates } = this;
        const tmpl = template(
            templates[mode] || templates.default || CONSTANTS.EMPTY
        );
        return $(tmpl(component));
    },

    /**
     * Add the display of a success or failure icon to the corresponding stage element
     * @method getHtmlCheckMarks (formerly showResult)
     * @returns {string}
     */
    getHtmlCheckMarks() {
        // Contrary to https://css-tricks.com/probably-dont-base64-svg/, we need base64 encoded strings otherwise kendo templates fail
        /* eslint-disable prettier/prettier */
        return `<div class=".kj-element-result" data-${ns}bind="visible: #: properties.name #">
                    <div data-${ns}bind="visible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,'${__('tools.basetool.icon.success')}); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>
                    <div data-${ns}bind="invisible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,${__('tools.basetool.icon.failure')}); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>
                </div>`;
        /* eslint-ensable prettier/prettier */
    },

    /**
     * Return a context menu to show on stage in design mode
     * @method getContextMenu
     * @returns {*[]}
     */
    getContextMenu() {
        const that = this;
        return (that.menu || []).map(item => {
            // Especially when item is an empty string, create a separator
            if ($.type(item) !== CONSTANTS.STRING || !item.length) {
                return {
                    cssClass: 'k-separator'
                };
            }
            // Otherwise add a menu item
            const adapter = getter(item, true)(that);
            const attributes = {};
            attributes[attr(CONSTANTS.ACTION)] = item;
            return {
                text: adapter.title,
                attr: attributes
                // Note: consider adding warning when attribute/property is invalid
            };
        });
    },

    /**
     * Execute context menu item selections
     * @method onContextMenu
     * @param action
     * @param component
     */
    onContextMenu(action, component) {
        assert.type(
            CONSTANTS.STRING,
            action,
            assert.format(
                assert.messages.type.default,
                'action',
                CONSTANTS.STRING
            )
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        // It is essential that the tool matches the component
        assert.equal(
            this.id,
            component.tool,
            assert.format(
                assert.messages.equal.default,
                'this.id',
                'component.tool'
            )
        );
        const adapter = getter(action)(this);
        adapter.showDialog({
            field: action,
            model: component
        });
    },

    /**
     * Encoded display of computed question
     * @param component
     * @returns {*}
     */
    getHtmlQuestion(component) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        return htmlEncode(component.get('properties.question'));
    },

    /**
     * Improved display of solution in score grid
     * @method getHtmlSolution
     * @param component
     */
    getHtmlSolution(component) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        // It is essential that the tool matches the component
        assert.equal(
            this.id,
            component.tool,
            assert.format(
                assert.messages.equal.default,
                'this.id',
                'component.tool'
            )
        );
        return htmlEncode(component.get('properties.solution'));
    },

    /**
     * Improved display of value in score grid
     * @method getHtmlValue
     * @param testField
     */
    getHtmlValue(testField) {
        assert.instanceof(
            BaseModel,
            testField,
            assert.format(
                assert.messages.instanceof.default,
                'testField',
                'BaseModel'
            )
        );
        // It is essential that the tool matches the component
        assert.equal(
            this.id,
            testField.component().tool,
            assert.format(
                assert.messages.equal.default,
                'this.id',
                'component.tool'
            )
        );
        return htmlEncode(testField.value);
    },

    // onEnable

    /**
     * onResize Event Handler
     * @method onResize
     * @param e
     * @param component
     */
    onResize(e, component) {
        assert.type(
            CONSTANTS.OBJECT,
            e,
            // Note: we are not asserting that e is a $.Event
            // to call onEnable({ currentTarget: el[0] }, component )
            assert.format(assert.messages.type.default, 'e', CONSTANTS.OBJECT)
        );
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
            )
        );
        const stageElement = $(e.currentTarget);
        assert.ok(
            stageElement.is(`${CONSTANTS.DOT}${CONSTANTS.ELEMENT_CLASS}`),
            assert.format('e.currentTarget is expected to be a stage element')
        );
        // Note: tools.textbox has an input within a wrapping span
        // const content = stageElement.children(this.childSelector);
        const content = stageElement.find(this.childSelector);
        if ($.type(component.width) === CONSTANTS.NUMBER) {
            content.outerWidth(
                component.get('width') -
                content.outerWidth(true) +
                content.outerWidth()
            );
        }
        if ($.type(component.height) === CONSTANTS.NUMBER) {
            content.outerHeight(
                component.get('height') -
                content.outerHeight(true) +
                content.outerHeight()
            );
            // IMAGE
            // if (component.attributes && !TOOLS.RX_FONT_SIZE.test(component.attributes.style)) {
            /*
             * We make a best guess for the number of lines as follows
             * Let's suppose the height (line-height, not font-size) and width of a character are respectively y and x
             * We have y = x * sizeRatio
             * How many of these character rectangles (x, y) can we fit in the content div (width, height)?
             *
             * the label only takes 1 line, if we have:
             * y = height and length <= width/x, that is length <= width*sizeRatio/y or y = height <= length*sizeRatio/width, which is length >= width*sizeRatio/height
             *
             * the label takes 2 lines, if we have:
             * y = height/2 and length <= width/x, that is length <= 2*width*sizeRatio/y or y = height/2 <= length*sizeRatio/width, which is length >= 4*width*sizeRatio/height
             *
             * the label takes n lines if we have sqrt((length*height)/sizeRatio*width) <= lines < sqrt(((length + 1)*height)/sizeRatio*width)
             *
             */
            // var length = component.attributes.text.length;
            // var sizeRatio = 1.6; // font-size being the height, this is the line-height/char-width ratio
            // var lines = Math.max(1, Math.floor(Math.sqrt((length * component.height) / (width * sizeRatio))));
            // We can now make a best guess for the font size
            // var fontRatio = 1.2; // this is the line-height/font-size ration
            // content.css('font-size', Math.floor(component.height / lines / fontRatio));
            // Note: in previous versions, we have tried to iterate through a hidden clone
            // to find that font size that does not trigger an overflow but it is too slow
            // }

            /*
              QUIZ
             // Auto-resize algorithm is not great so let's wait until we find a better solution
             var data = component.attributes.data;
             var length = data.trim().split('\n').length || 1;
             switch (component.attributes.mode) {
             case 'button':
             content.css('font-size', Math.floor(0.57 * component.height));
             break;
             case 'dropdown':
             content.css('font-size', Math.floor(0.5 * component.height));
             break;
             case 'radio':
             var h = component.height / (length || 1);
             content.css('font-size', Math.floor(0.9 * h));
             content.find('input')
             .height(0.6 * h)
             .width(0.6 * h);
             break;
             }
            */
        }
        // Resize kendo widgets
        resize(content);
        // prevent any side effect
        e.preventDefault();
        // prevent event to bubble on stage
        e.stopPropagation();
    },

    /**
     * Component validation
     * @method validate
     * @param component
     * @param pageIdx
     */
    validate(component, pageIdx) {
        assert.instanceof(
            PageComponent,
            component,
            assert.format(
                assert.messages.instanceof.default,
                'component',
                'PageComponent'
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
        const ret = [];
        const { properties } = component;
        const toolName = this.name;
        if (properties && !properties.disabled) {
            if (
                $.type(properties.behavior) === CONSTANTS.STRING &&
                properties.behavior !== 'none'
            ) {
                // Note: This test might be better suited to inherited tools (labels, images and math expressions)
                if (!TOOLS.RX_CONSTANT.test(properties.constant)) {
                    ret.push({
                        type: CONSTANTS.ERROR,
                        index: pageIdx,
                        message: format(
                            __('tools.messages.invalidConstant'),
                            toolName,
                            /* name, */ pageIdx + 1
                        )
                    });
                }
            } else if ($.type(properties.name) === CONSTANTS.STRING) {
                const { name } = properties;
                if (!TOOLS.RX_NAME.test(name)) {
                    ret.push({
                        type: CONSTANTS.ERROR,
                        index: pageIdx,
                        message: format(
                            __('tools.messages.invalidName'),
                            toolName,
                            name,
                            pageIdx + 1
                        )
                    });
                }
                if (
                    !properties.question ||
                    !TOOLS.RX_QUESTION.test(properties.question)
                ) {
                    ret.push({
                        type: CONSTANTS.ERROR,
                        index: pageIdx,
                        message: format(
                            __('tools.messages.invalidQuestion'),
                            toolName,
                            name,
                            pageIdx + 1
                        )
                    });
                }
                if (
                    !properties.solution ||
                    !TOOLS.RX_SOLUTION.test(properties.solution)
                ) {
                    // What if properties.solution is a number or a date?
                    ret.push({
                        type: CONSTANTS.ERROR,
                        index: pageIdx,
                        message: format(
                            __('tools.messages.invalidSolution'),
                            toolName,
                            name,
                            pageIdx + 1
                        )
                    });
                }
                if (
                    !isLibraryFormula(properties.validation) &&
                    !isCustomFormula(properties.validation)
                ) {
                    ret.push({
                        type: CONSTANTS.ERROR,
                        index: pageIdx,
                        message: format(
                            __('tools.messages.invalidValidation'),
                            toolName,
                            name,
                            pageIdx + 1
                        )
                    });
                }
                if (
                    $.type(properties.failure) === CONSTANTS.NUMBER &&
                    $.type(properties.omit) === CONSTANTS.NUMBER &&
                    properties.failure > Math.min(properties.omit, 0)
                ) {
                    ret.push({
                        type: CONSTANTS.WARNING,
                        index: pageIdx,
                        message: format(
                            __('tools.messages.invalidFailure'),
                            toolName,
                            name,
                            pageIdx + 1
                        )
                    });
                }
                if (
                    $.type(properties.success) === CONSTANTS.NUMBER &&
                    $.type(properties.omit) === CONSTANTS.NUMBER &&
                    properties.success < Math.max(properties.omit, 0)
                ) {
                    ret.push({
                        type: CONSTANTS.WARNING,
                        index: pageIdx,
                        message: format(
                            __('tools.messages.invalidSuccess'),
                            toolName,
                            name,
                            pageIdx + 1
                        )
                    });
                }
            }
        }
        return ret;
    }
});

/**
 * Exports
 */
export {
    BaseTool,
    StubTool
};
