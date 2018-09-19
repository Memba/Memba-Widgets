/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert';
import CONSTANTS from '../common/window.constants';
import { randomVal } from '../common/window.util';
import BaseAdapter from './adapters.base.es6';
import NumberAdapter from './adapters.number.es6';
import BaseModel from '../data/models.base.es6';

const { Class } = window.kendo;

// TODO Add markdown help

// TODO Modify for lazy loading of dependency modules
// See http://blog.avenuecode.com/lazy-loading-es2015-modules-in-the-browser

// TODO solution$ for the list might be calculated depending on validation algorithm
// see dropZone with sumEqual should make the sum

// Add localization to textboxes with numbers and masked input
// Add localization to Worker functions to parse numbers and dates

/**
 * Incors images
 */
// Incors O-Collection check.svg
// var SVG_SUCCESS = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#76A797" d="M3840 5760l3934 -3934c124,-124 328,-124 452,0l1148 1148c124,124 124,328 0,452l-5308 5308c-124,124 -328,124 -452,0l-2748 -2748c-124,-124 -124,-328 0,-452l1148 -1148c124,-124 328,-124 452,0l1374 1374z"/></svg>';
const SVG_SUCCESS =
    'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iIzc2QTc5NyIgZD0iTTM4NDAgNTc2MGwzOTM0IC0zOTM0YzEyNCwtMTI0IDMyOCwtMTI0IDQ1MiwwbDExNDggMTE0OGMxMjQsMTI0IDEyNCwzMjggMCw0NTJsLTUzMDggNTMwOGMtMTI0LDEyNCAtMzI4LDEyNCAtNDUyLDBsLTI3NDggLTI3NDhjLTEyNCwtMTI0IC0xMjQsLTMyOCAwLC00NTJsMTE0OCAtMTE0OGMxMjQsLTEyNCAzMjgsLTEyNCA0NTIsMGwxMzc0IDEzNzR6Ii8+PC9zdmc+';
// Incors O-Collection delete.svg
// var SVG_FAILURE = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#E68497" d="M1273 7156l2037 -2036 -2037 -2036c-124,-125 -124,-328 0,-453l1358 -1358c125,-124 328,-124 453,0l2036 2037 2036 -2037c125,-124 328,-124 453,0l1358 1358c124,125 124,328 0,453l-2037 2036 2037 2036c124,125 124,328 0,453l-1358 1358c-125,124 -328,124 -453,0l-2036 -2037 -2036 2037c-125,124 -328,124 -453,0l-1358 -1358c-124,-125 -124,-328 0,-453z"/></svg>';
const SVG_FAILURE =
    'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iI0U2ODQ5NyIgZD0iTTEyNzMgNzE1NmwyMDM3IC0yMDM2IC0yMDM3IC0yMDM2Yy0xMjQsLTEyNSAtMTI0LC0zMjggMCwtNDUzbDEzNTggLTEzNThjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMjAzNiAyMDM3IDIwMzYgLTIwMzdjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMTM1OCAxMzU4YzEyNCwxMjUgMTI0LDMyOCAwLDQ1M2wtMjAzNyAyMDM2IDIwMzcgMjAzNmMxMjQsMTI1IDEyNCwzMjggMCw0NTNsLTEzNTggMTM1OGMtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTIwMzYgLTIwMzcgLTIwMzYgMjAzN2MtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTEzNTggLTEzNThjLTEyNCwtMTI1IC0xMjQsLTMyOCAwLC00NTN6Ii8+PC9zdmc+';

// TODO Add warning

/**
 * @class BaseTool
 */
const BaseTool = Class.extend({
    id: null,
    icon: null,
    description: null,
    cursor: null,
    weight: 0,
    height: 250,
    width: 250,
    attributes: {},
    properties: {},
    svg: {
        success: SVG_SUCCESS,
        failure: SVG_FAILURE
    },
    i18n: {
        // They are here to be translated in kidoju.messages.[locale].js
        tool: {
            top: { title: i18n.tool.top.title },
            left: { title: i18n.tool.left.title },
            height: { title: i18n.tool.height.title },
            width: { title: i18n.tool.width.title },
            rotate: { title: i18n.tool.rotate.title }
        },
        dialogs: {
            ok: { text: i18n.dialogs.ok.text },
            cancel: { text: i18n.dialogs.cancel.text }
        },
        messages: {
            invalidAltText: i18n.messages.invalidAltText,
            invalidAudioFile: i18n.messages.invalidAudioFile,
            invalidColor: i18n.messages.invalidColor,
            invalidData: i18n.messages.invalidData,
            invalidDescription: i18n.messages.invalidDescription,
            invalidConstant: i18n.messages.invalidConstant,
            invalidFailure: i18n.messages.invalidFailure,
            invalidFormula: i18n.messages.invalidFormula,
            invalidImageFile: i18n.messages.invalidImageFile,
            invalidName: i18n.messages.invalidName,
            invalidShape: i18n.messages.invalidShape,
            invalidSolution: i18n.messages.invalidSolution,
            invalidStyle: i18n.messages.invalidStyle,
            invalidSuccess: i18n.messages.invalidSuccess,
            invalidText: i18n.messages.invalidText,
            invalidValidation: i18n.messages.invalidValidation,
            invalidVideoFile: i18n.messages.invalidVideoFile
        }
    },

    /**
     * Constructor
     * @class kidoju.Tool
     * @constructor
     * @param options
     */
    init: function (options) {

        // Extend tool with init options
        $.extend(this, options);

        // Pass solution adapter library to validation adapter, especially for the code editor
        if (this.properties && this.properties.solution instanceof BaseAdapter && this.properties.validation instanceof adapters.ValidationAdapter) {
            this.properties.validation.library = this.properties.solution.library;
            this.properties.validation.defaultValue = LIB_COMMENT + this.properties.solution.libraryDefault;
        }

    },

    /**
     * Get a kidoju.data.Model for attributes
     * @class kidoju.Tool
     * @method _getAttributeModel
     * @returns {kidoju.data.Model}
     * @private
     */
    _getAttributeModel: function () {
        var model = { fields: {} };
        for (var attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                if (this.attributes[attr] instanceof BaseAdapter) {
                    model.fields[attr] = this.attributes[attr].getField();
                }
            }
        }
        return Model.define(model);
    },

    /**
     * Gets property grid row specifications for attributes
     * @class kidoju.Tool
     * @method _getAttributeRows
     * @returns {Array}
     * @private
     */
    _getAttributeRows: function () {
        var rows = [];
        var data = {};
        data[kendo.attr('decimals')] = 0;
        data[kendo.attr('format')] = 'n0';
        // Add top, left, height, width, rotation
        rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.top.title }, data).getRow('top'));
        rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.left.title }, data).getRow('left'));
        rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.height.title }, data).getRow('height'));
        rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.width.title }, data).getRow('width'));
        rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.rotate.title }, data).getRow('rotate'));

        // Add other attributes
        for (var attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                if (this.attributes[attr] instanceof BaseAdapter) {
                    rows.push(this.attributes[attr].getRow('attributes.' + attr));
                }
            }
        }
        return rows;
    },

    /**
     * Get a kidoju.data.Model for properties
     * @class kidoju.Tool
     * @method _getPropertyModel
     * @returns {kidoju.data.Model}
     * @private
     */
    _getPropertyModel: function () {
        var properties = this.properties;
        var model = { fields: {} };
        for (var prop in properties) {
            if (properties.hasOwnProperty(prop)) {
                if (properties[prop] instanceof BaseAdapter) {
                    model.fields[prop] = properties[prop].getField();
                    if (prop === 'name') {
                        // This cannot be set as a default value on the  adapter because each instance should have a different name
                        model.fields.name.defaultValue = 'val_' + randomString(6);
                    } else if (prop === 'validation') {
                        // We need the code library otherwise we won't have code to execute when validation === '// equal' or any other library value
                        model._library = properties.validation.library;
                    }
                }
            }
        }
        return Model.define(model);
    },

    /**
     * Gets property grid row specifications for properties
     * @class kidoju.Tool
     * @method _getPropertyRows
     * @returns {Array}
     * @private
     */
    _getPropertyRows: function () {
        var rows = [];

        for (var prop in this.properties) {
            if (this.properties.hasOwnProperty(prop)) {
                if (this.properties[prop] instanceof BaseAdapter) {
                    rows.push(this.properties[prop].getRow('properties.' + prop));
                }
            }
        }
        return rows;
    },

    /**
     * Get Html or jQuery content
     * @class kidoju.Tool
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent: function (component, mode) {
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        var template = kendo.template(this.templates[mode] || this.templates.default);
        return template($.extend(component, { ns: kendo.ns }));
    },

    /**
     * Return the default value when playing the component as part of a test
     * @param component
     */
    getTestDefaultValue: function (component) {
        // TODO: consider removing as it seems useless
        return;
    },

    /**
     * Add the display of a success or failure icon to the corresponding stage element
     * @returns {string}
     */
    showResult: function () {
        // Contrary to https://css-tricks.com/probably-dont-base64-svg/, we need base64 encoded strings otherwise kendo templates fail
        return '<div class=".kj-element-result" data-#= ns #bind="visible: #: properties.name #">' +
            '<div data-#= ns #bind="visible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + BaseTool.fn.svg.success + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>' +
            '<div data-#= ns #bind="invisible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + BaseTool.fn.svg.failure + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>' +
            '</div>';
    },

    /**
     * Improved display of value in score grid
     * Note: search for getScoreArray in kidoju.data
     * @param testItem
     */
    value$: function (testItem) {
        return kendo.htmlEncode(testItem.value || '');
    },

    /**
     * Improved display of solution in score grid
     * Note: search for getScoreArray in kidoju.data
     * @param testItem
     */
    solution$: function (testItem) {
        return kendo.htmlEncode(testItem.solution || '');
    },

    // onEnable: function (e, component, enabled) {},
    // onMove: function (e, component) {},
    // onResize: function (e, component) {},
    // onRotate: function (e, component) {},

    /* This function's cyclomatic complexity is too high. */
    /* jshint -W074 */

    /**
     * Component validation
     * @param component
     * @param pageIdx
     */
    validate: function (component, pageIdx) {
        /* jshint maxcomplexity: 14 */
        assert.instanceof (PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.type(NUMBER, pageIdx, assert.format(assert.messages.type.default, 'pageIdx', NUMBER));
        var ret = [];
        if (component.properties && !component.properties.disabled) {
            var properties = component.properties;
            var messages = this.i18n.messages;
            var description = this.description; // tool description
            if ($.type(properties.behavior) === STRING && properties.behavior !== 'none') {
                // Note: This test might be better suited to inherited tools (labels, images and math expressions)
                if (!RX_CONSTANT.test(properties.constant)) {
                    ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidConstant, description, /*name,*/ pageIdx + 1) });
                }
            } else if ($.type(component.properties.name) === STRING) {
                var name = properties.name;
                if (!RX_NAME.test(name)) {
                    ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidName, description, name, pageIdx + 1) });
                }
                if (!properties.question || !RX_DESCRIPTION.test(properties.question)) {
                    ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidDescription, description, name, pageIdx + 1) });
                }
                if (!properties.solution || !RX_SOLUTION.test(properties.solution)) { // What if properties.solution is a number or a date?
                    ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidSolution, description, name, pageIdx + 1) });
                }
                if (!RX_VALIDATION_LIBRARY.test(properties.validation) && !RX_VALIDATION_CUSTOM.test(properties.validation)) {
                    ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidValidation, description, name, pageIdx + 1) });
                }
                if ($.type(properties.failure) === NUMBER && $.type(properties.omit) === NUMBER && properties.failure > Math.min(properties.omit, 0)) {
                    ret.push({ type: WARNING, index: pageIdx, message: kendo.format(messages.invalidFailure, description, name, pageIdx + 1) });
                }
                if ($.type(properties.success) === NUMBER && $.type(properties.omit) === NUMBER && properties.success < Math.max(properties.omit, 0)) {
                    ret.push({ type: WARNING, index: pageIdx, message: kendo.format(messages.invalidSuccess, description, name, pageIdx + 1) });
                }
            }
        }
        return ret;
    }

    /* jshint +W074 */

});

/**
 * Default export
 */
export default BaseTool;
