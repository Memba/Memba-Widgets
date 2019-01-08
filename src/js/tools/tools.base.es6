/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO replace https://cdn.kidoju.com
// TODO: Consider redesigning ToolBase to only import adapters in design mode,
// using import('./adapters.*.es6').then(function () {...});

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { randomVal } from '../common/window.util.es6';
import BaseModel from '../data/data.base.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import poolExec from '../workers/workers.exec.es6';
import BaseAdapter from './adapters.base.es6';
import NumberAdapter from './adapters.number.es6';
import {
    isLibraryFormula,
    parseLibraryItem,
    RX_VALIDATION_FORMULA
} from './util.libraries.es6';

const { attr, Class, format, getter, htmlEncode, ns, template } = window.kendo;

/**
 * Incors images
 */

// Incors O-Collection check.svg
// const SVG_SUCCESS = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#76A797" d="M3840 5760l3934 -3934c124,-124 328,-124 452,0l1148 1148c124,124 124,328 0,452l-5308 5308c-124,124 -328,124 -452,0l-2748 -2748c-124,-124 -124,-328 0,-452l1148 -1148c124,-124 328,-124 452,0l1374 1374z"/></svg>';
const SVG_SUCCESS =
    'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iIzc2QTc5NyIgZD0iTTM4NDAgNTc2MGwzOTM0IC0zOTM0YzEyNCwtMTI0IDMyOCwtMTI0IDQ1MiwwbDExNDggMTE0OGMxMjQsMTI0IDEyNCwzMjggMCw0NTJsLTUzMDggNTMwOGMtMTI0LDEyNCAtMzI4LDEyNCAtNDUyLDBsLTI3NDggLTI3NDhjLTEyNCwtMTI0IC0xMjQsLTMyOCAwLC00NTJsMTE0OCAtMTE0OGMxMjQsLTEyNCAzMjgsLTEyNCA0NTIsMGwxMzc0IDEzNzR6Ii8+PC9zdmc+';

// Incors O-Collection delete.svg
// const SVG_FAILURE = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#E68497" d="M1273 7156l2037 -2036 -2037 -2036c-124,-125 -124,-328 0,-453l1358 -1358c125,-124 328,-124 453,0l2036 2037 2036 -2037c125,-124 328,-124 453,0l1358 1358c124,125 124,328 0,453l-2037 2036 2037 2036c124,125 124,328 0,453l-1358 1358c-125,124 -328,124 -453,0l-2036 -2037 -2036 2037c-125,124 -328,124 -453,0l-1358 -1358c-124,-125 -124,-328 0,-453z"/></svg>';
const SVG_FAILURE =
    'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iI0U2ODQ5NyIgZD0iTTEyNzMgNzE1NmwyMDM3IC0yMDM2IC0yMDM3IC0yMDM2Yy0xMjQsLTEyNSAtMTI0LC0zMjggMCwtNDUzbDEzNTggLTEzNThjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMjAzNiAyMDM3IDIwMzYgLTIwMzdjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMTM1OCAxMzU4YzEyNCwxMjUgMTI0LDMyOCAwLDQ1M2wtMjAzNyAyMDM2IDIwMzcgMjAzNmMxMjQsMTI1IDEyNCwzMjggMCw0NTNsLTEzNTggMTM1OGMtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTIwMzYgLTIwMzcgLTIwMzYgMjAzN2MtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTEzNTggLTEzNThjLTEyNCwtMTI1IC0xMjQsLTMyOCAwLC00NTN6Ii8+PC9zdmc+';

// Incors O-Collection sign_warning.svg
// const SVG_WARNING = '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" clip-rule="evenodd" viewBox="0 0 10240 10240"><path fill="#EDC87E" d="M5680 1282l3846 6712c117 205 117 439 0 644s-319 322-554 322H1281c-234 0-436-117-553-322s-117-439 0-644l3846-6712c117-205 318-322 553-322s436 117 553 322zm-560 318L1280 8320h7680L5120 1600z"/><path fill="gray" d="M5120 6720c353 0 640 287 640 640s-287 640-640 640-640-287-640-640 287-640 640-640zm-320-2880h640c176 0 320 144 320 320v802c0 110-12 204-38 311l-252 1006c-18 72-81 121-155 121h-390c-74 0-137-49-155-121l-252-1006c-26-107-38-201-38-311v-802c0-176 144-320 320-320z"/></svg>';
const SVG_WARNING =
    'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY2xpcC1ydWxlPSJldmVub2RkIiB2aWV3Qm94PSIwIDAgMTAyNDAgMTAyNDAiPjxwYXRoIGZpbGw9IiNFREM4N0UiIGQ9Ik01NjgwIDEyODJsMzg0NiA2NzEyYzExNyAyMDUgMTE3IDQzOSAwIDY0NHMtMzE5IDMyMi01NTQgMzIySDEyODFjLTIzNCAwLTQzNi0xMTctNTUzLTMyMnMtMTE3LTQzOSAwLTY0NGwzODQ2LTY3MTJjMTE3LTIwNSAzMTgtMzIyIDU1My0zMjJzNDM2IDExNyA1NTMgMzIyem0tNTYwIDMxOEwxMjgwIDgzMjBoNzY4MEw1MTIwIDE2MDB6Ii8+PHBhdGggZmlsbD0iZ3JheSIgZD0iTTUxMjAgNjcyMGMzNTMgMCA2NDAgMjg3IDY0MCA2NDBzLTI4NyA2NDAtNjQwIDY0MC02NDAtMjg3LTY0MC02NDAgMjg3LTY0MCA2NDAtNjQwem0tMzIwLTI4ODBoNjQwYzE3NiAwIDMyMCAxNDQgMzIwIDMyMHY4MDJjMCAxMTAtMTIgMjA0LTM4IDMxMWwtMjUyIDEwMDZjLTE4IDcyLTgxIDEyMS0xNTUgMTIxaC0zOTBjLTc0IDAtMTM3LTQ5LTE1NS0xMjFsLTI1Mi0xMDA2Yy0yNi0xMDctMzgtMjAxLTM4LTMxMXYtODAyYzAtMTc2IDE0NC0zMjAgMzIwLTMyMHoiLz48L3N2Zz4=';

/**
 * BaseTool
 * @class BaseTool
 * @extends Class
 */
const BaseTool = Class.extend({
    attributes: {},
    cursor: null,
    description: null,
    field: {
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
    help: null,
    icon: null,
    id: null,
    properties: {},
    weight: 0,
    width: 250,
    svg: {
        success: SVG_SUCCESS, // --> TODO Move to i18n
        failure: SVG_FAILURE,
        warning: SVG_WARNING
    },

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
        const i18n = BaseTool.getMessageNameSpace();
        const rows = [];
        const data = {};
        data[attr('decimals')] = 0;
        data[attr('format')] = 'n0';
        // Add top, left, height, width, rotation
        rows.push(
            new NumberAdapter({ title: i18n.base.tool.top.title }, data).getRow(
                'top'
            )
        );
        rows.push(
            new NumberAdapter(
                { title: i18n.base.tool.left.title },
                data
            ).getRow('left')
        );
        rows.push(
            new NumberAdapter(
                {
                    title: i18n.base.tool.height.title
                },
                data
            ).getRow('height')
        );
        rows.push(
            new NumberAdapter(
                { title: i18n.base.tool.width.title },
                data
            ).getRow('width')
        );
        rows.push(
            new NumberAdapter(
                {
                    title: i18n.base.tool.rotate.title
                },
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
        return template(this.description)($.extend(component, { ns }));
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
        return template(this.help)($.extend(component, { ns }));
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
            // Format data for poolExec validation
            data() {
                const data = {
                    value: this.get('value'),
                    solution: component.get('properties.solution'),
                    // Other field values on the same page
                    // assuming this TestModelField is part of a TestModel
                    all: {}
                };
                if ($.isFunction(this.model)) {
                    // The field is part of a TestModel
                    const model = this.model();
                    Object.keys(model.fields).forEach(key => {
                        if (CONSTANTS.RX_TEST_FIELD_NAME.test(key)) {
                            // TODO Add random fields
                            data.all[key] = model[key].get('value');
                        }
                    });
                }
                return data;
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
                if (!RX_VALIDATION_FORMULA.test(validation)) {
                    // debugger;
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
                                    `The grading result pertains to task name ${
                                        res.name
                                    } instead of ${name}`
                                )
                            );
                        }
                    })
                    .catch(dfd.reject);

                return dfd.promise();
            },
            // Html encoded value to display in the score grid
            value$() {
                return tool.getHtmlValue(this);
            },
            // Html encoded solution to display in the score grid
            solution$() {
                return tool.getHtmlSolution(component);
            },
            // Conversion to JSON for storage with an activity
            toJSON() {
                // TODO Consider eliminating null values
                const json = BaseModel.fn.toJSON.call(this);
                return json;
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
            Object.values(CONSTANTS.STAGE_MODES),
            mode,
            assert.format(
                assert.messages.enum.default,
                'mode',
                Object.values(CONSTANTS.STAGE_MODES)
            )
        );
        const templates = this.templates || {};
        const t = templates[mode] || templates.default;
        assert.type(
            CONSTANTS.STRING,
            t,
            assert.format(
                assert.messages.type.default,
                `this.templates.${mode}`,
                CONSTANTS.STRING
            )
        );
        return template(t)($.extend(component, { ns }));
    },

    /**
     * Add the display of a success or failure icon to the corresponding stage element
     * @method getHtmlCheckMarks (formerly showResult)
     * @returns {string}
     */
    getHtmlCheckMarks() {
        // Contrary to https://css-tricks.com/probably-dont-base64-svg/, we need base64 encoded strings otherwise kendo templates fail
        return (
            `${'<div class=".kj-element-result" data-#= ns #bind="visible: #: properties.name #">' +
                '<div data-#= ns #bind="visible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,'}${
                BaseTool.fn.svg.success
            }); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>` +
            `<div data-#= ns #bind="invisible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,${
                BaseTool.fn.svg.failure
            }); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>` +
            `</div>`
        );
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
                // Note: consider adding SVG_WARNING when attribute/property is invalid
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
        // TODO open dialog with property editor
        window.alert(action);
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
        return htmlEncode(testField.value || '');
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
        return htmlEncode(component.get('properties.solution') || '');
    },

    // onEnable
    // onResize

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
        const {
            description,
            i18n: { messages }
        } = this;
        if (properties && !properties.disabled) {
            const RX_DESCRIPTION = /\S+/i; // question
            const RX_CONSTANT = /\S+/i;
            const RX_NAME = /val_[0-9a-f]{6}/;
            const RX_SOLUTION = /\S+/i;
            const RX_VALIDATION_LIBRARY = /^\/\/ ([^\s\[\n]+)( (\[[^\n]+\]))?$/;
            const RX_VALIDATION_CUSTOM = /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/;

            if (
                $.type(properties.behavior) === CONSTANTS.STRING &&
                properties.behavior !== 'none'
            ) {
                // Note: This test might be better suited to inherited tools (labels, images and math expressions)
                if (!RX_CONSTANT.test(properties.constant)) {
                    ret.push({
                        type: CONSTANTS.ERROR,
                        index: pageIdx,
                        message: format(
                            messages.invalidConstant,
                            description,
                            /* name, */ pageIdx + 1
                        )
                    });
                }
            } else if ($.type(component.properties.name) === CONSTANTS.STRING) {
                const name = properties.name;
                if (!RX_NAME.test(name)) {
                    ret.push({
                        type: CONSTANTS.ERROR,
                        index: pageIdx,
                        message: format(
                            messages.invalidName,
                            description,
                            name,
                            pageIdx + 1
                        )
                    });
                }
                if (
                    !properties.question ||
                    !RX_DESCRIPTION.test(properties.question)
                ) {
                    ret.push({
                        type: CONSTANTS.ERROR,
                        index: pageIdx,
                        message: format(
                            messages.invalidDescription,
                            description,
                            name,
                            pageIdx + 1
                        )
                    });
                }
                if (
                    !properties.solution ||
                    !RX_SOLUTION.test(properties.solution)
                ) {
                    // What if properties.solution is a number or a date?
                    ret.push({
                        type: CONSTANTS.ERROR,
                        index: pageIdx,
                        message: format(
                            messages.invalidSolution,
                            description,
                            name,
                            pageIdx + 1
                        )
                    });
                }
                if (
                    !RX_VALIDATION_LIBRARY.test(properties.validation) &&
                    !RX_VALIDATION_CUSTOM.test(properties.validation)
                ) {
                    ret.push({
                        type: CONSTANTS.ERROR,
                        index: pageIdx,
                        message: format(
                            messages.invalidValidation,
                            description,
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
                            messages.invalidFailure,
                            description,
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
                            messages.invalidSuccess,
                            description,
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
 * Global references for i18n
 * Static getter the message namespace (see ../cultures/tools.*)
 * @method getMessageNameSpace
 */
BaseTool.getMessageNameSpace = () => {
    window.kendo.ex = window.kendo.ex || {};
    window.kendo.ex.tools = window.kendo.ex.tools || {};
    window.kendo.ex.tools.messages = window.kendo.ex.tools.messages || {};
    return window.kendo.ex.tools.messages;
};

/**
 * Init i18n messages
 */
const i18n = BaseTool.getMessageNameSpace();
i18n.base = i18n.base || {
    tool: {
        top: { title: 'Top' },
        left: { title: 'Left' },
        height: { title: 'Height' },
        width: { title: 'Width' },
        rotate: { title: 'Rotate' }
    },

    dialogs: {
        ok: {
            text:
                '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg" class="k-image">OK'
        },
        cancel: {
            text:
                '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/close.svg" class="k-image">Cancel'
        }
    },

    messages: {
        invalidAltText:
            'A(n) {0} on page {1} requires some alternate text in display attributes.',
        invalidAudioFile:
            'A(n) {0} on page {1} requires an mp3 file in display attributes.',
        invalidColor:
            'A(n) {0} on page {1} has an invalid color in display attributes.',
        invalidData:
            'A(n) {0} on page {1} requires values in display attributes.',
        invalidDescription:
            'A(n) {0} named `{1}` on page {2} requires a question in test logic.',
        invalidConstant:
            'A(n) {0} on page {1} requires a constant in test logic.',
        invalidFailure:
            'A(n) {0} named `{1}` on page {2} has a failure score higher than the omit score or zero in test logic.',
        invalidFormula:
            'A(n) {0} on page {1} requires a formula in display attributes.',
        invalidImageFile:
            'A(n) {0} on page {1} requires an image file in display attributes.',
        invalidName: 'A(n) {0} named `{1}` on page {2} has an invalid name.',
        invalidShape:
            'A(n) {0} named `{1}` on page {2} requires a shape in display attributes.',
        invalidSolution:
            'A(n) {0} named `{1}` on page {2} requires a solution in test logic.',
        invalidStyle:
            'A(n) {0} on page {1} has an invalid style in display attributes.',
        invalidSuccess:
            'A(n) {0} named `{1}` on page {2} has a success score lower than the omit score or zero in test logic.',
        invalidText:
            'A(n) {0} on page {1} requires some text in display attributes.',
        invalidValidation:
            'A(n) {0} named `{1}` on page {2} requires a validation formula in test logic.',
        invalidVideoFile:
            'A(n) {0} on page {1} requires an mp4 file in display attributes.'
    }
};

/**
 * Default export
 */
export default BaseTool;
