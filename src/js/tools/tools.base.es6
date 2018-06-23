/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import assert from '../common/window.assert';
import CONSTANTS from '../common/window.constants';
import BaseAdapter from './adapters.base.es6';
import NumberAdapter from './adapters.number.es6';
import BaseModel from '../data/models.base.es6';

// A way to implement private variable
// @see http://2ality.com/2016/01/private-data-classes.html
const id = Symbol('id');
const icon = Symbol('icon');
const cursor = Symbol('cursor');

// TODO Add help makrdown !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// IMPORTANT TODO Modify for lazy loading of dependency modules
// See http://blog.avenuecode.com/lazy-loading-es2015-modules-in-the-browser
// TODO solution$ for the list might be calculates depending on validation alorith see dropZone with sumEauql should make the sum
// Add localization to textboxes with numbers and masked input
// Add localization to Worker functions to parse numbers and dates

/**
 * @class BaseTool
 */
export default class BaseTool {
    svg: {
        success: SVG_SUCCESS,
        failure: SVG_FAILURE
        // TODO warning
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
    }

    /**
     * Constructor
     * @constructor
     * @param options
     */
    constructor(options = {}) {
        assert.type(
            CONSTANTS.OBJECT,
            options,
            assert.format(assert.messages.type.default, options, 'options', CONSTANTS.OBJECT)
        );

        // Private data
        this[id] = options.id || null;
        this[icon] = options.icon || null;
        this[cursor] = options.cursor || null;

        // Extend tool with constuctor options
        $.extend(
            this,
            {
                attributes: options.attributes || {},
                description: options.description || null,
                height: options.height || 250,
                properties: options.properties || {},
                weight: options.weight || 0,
                width: options.width || 250
            }
        );

        // Pass solution adapter library to validation adapter, especially for the code editor
        if (this.properties &&
            this.properties.solution instanceof BaseAdapter &&
            this.properties.validation instanceof ValidationAdapter
        ) {
            this.properties.validation.library = this.properties.solution.library;
            this.properties.validation.defaultValue = LIB_COMMENT + this.properties.solution.libraryDefault;
        }
    }

    /**
     * id getter
     * @returns {*}
     */
    get id() {
        return this[id];
    }

    /**
     * cursor getter
     * @returns {*}
     */
    get cursor() {
        return this[cursor];
    }

    /**
     * icon getter
     * @returns {*}
     */
    get icon() {
        return this[icon];
    }

    /**
     * Get a BaseModel for attributes
     * @class kidoju.Tool
     * @method _getAttributeModel
     * @returns {BaseModel}
     * @private
     */
    _getAttributeModel() {
        var model = { fields: {} };
        for (var attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                if (this.attributes[attr] instanceof BaseAdapter) {
                    model.fields[attr] = this.attributes[attr].getField();
                }
            }
        }
        return BaseModel.define(model);
    }

    /**
     * Gets property grid row specifications for attributes
     * @class kidoju.Tool
     * @method _getAttributeRows
     * @returns {Array}
     * @private
     */
    _getAttributeRows() {
        var rows = [];
        var data = {};
        data[kendo.attr('decimals')] = 0;
        data[kendo.attr('format')] = 'n0';
        // Add top, left, height, width, rotation
        rows.push(new NumberAdapter({ title: this.i18n.tool.top.title }, data).getRow('top'));
        rows.push(new NumberAdapter({ title: this.i18n.tool.left.title }, data).getRow('left'));
        rows.push(new NumberAdapter({ title: this.i18n.tool.height.title }, data).getRow('height'));
        rows.push(new NumberAdapter({ title: this.i18n.tool.width.title }, data).getRow('width'));
        rows.push(new NumberAdapter({ title: this.i18n.tool.rotate.title }, data).getRow('rotate'));

        // Add other attributes
        for (var attr in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                if (this.attributes[attr] instanceof BaseAdapter) {
                    rows.push(this.attributes[attr].getRow('attributes.' + attr));
                }
            }
        }
        return rows;
    }

    /**
     * Get a BaseModel for properties
     * @class kidoju.Tool
     * @method _getPropertyModel
     * @returns {BaseModel}
     * @private
     */
    _getPropertyModel() {
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
        return BaseModel.define(model);
    }

    /**
     * Gets property grid row specifications for properties
     * @class kidoju.Tool
     * @method _getPropertyRows
     * @returns {Array}
     * @private
     */
    _getPropertyRows() {
        var rows = [];

        for (var prop in this.properties) {
            if (this.properties.hasOwnProperty(prop)) {
                if (this.properties[prop] instanceof BaseAdapter) {
                    rows.push(this.properties[prop].getRow('properties.' + prop));
                }
            }
        }
        return rows;
    }

    /**
     * Get Html or jQuery content
     * @class kidoju.Tool
     * @method getHtmlContent
     * @param component
     * @param mode
     * @returns {*}
     */
    getHtmlContent(component, mode) {
        assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
        var template = kendo.template(this.templates[mode] || this.templates.default);
        return template($.extend(component, { ns: kendo.ns }));
    }

    /**
     * Return the default value when playing the component as part of a test
     * @param component
     */
    getTestDefaultValue(component) {
        // TODO: consider removing as it seems useless
        return;
    }

    /**
     * Add the display of a success or failure icon to the corresponding stage element
     * @returns {string}
     */
    showResult () {
        // Contrary to https://css-tricks.com/probably-dont-base64-svg/, we need base64 encoded strings otherwise kendo templates fail
        return '<div class=".kj-element-result" data-#= ns #bind="visible: #: properties.name #">' +
            '<div data-#= ns #bind="visible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + Tool.fn.svg.success + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>' +
            '<div data-#= ns #bind="invisible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + Tool.fn.svg.failure + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>' +
            '</div>';
    }

    /**
     * Improved display of value in score grid
     * Note: search for getScoreArray in kidoju.data
     * @param testItem
     */
    value$(testItem) {
        return kendo.htmlEncode(testItem.value || '');
    }

    /**
     * Improved display of solution in score grid
     * Note: search for getScoreArray in kidoju.data
     * @param testItem
     */
    solution$(testItem) {
        return kendo.htmlEncode(testItem.solution || '');
    }

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
    validate(component, pageIdx) {
        /* jshint maxcomplexity: 14 */
        assert.instanceof (PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
        assert.type(CONSTANTS.NUMBER, pageIdx, assert.format(assert.messages.type.default, 'pageIdx', CONSTANTS.NUMBER));
        var ret = [];
        if (component.properties && !component.properties.disabled) {
            var properties = component.properties;
            var messages = this.i18n.messages;
            var description = this.description; // tool description
            if ($.type(properties.behavior) === CONSTANTS.STRING && properties.behavior !== 'none') {
                // Note: This test might be better suited to inherited tools (labels, images and math expressions)
                if (!RX_CONSTANT.test(properties.constant)) {
                    ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidConstant, description, /*name,*/ pageIdx + 1) });
                }
            } else if ($.type(component.properties.name) === CONSTANTS.STRING) {
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
                if ($.type(properties.failure) === CONSTANTS.NUMBER && $.type(properties.omit) === CONSTANTS.NUMBER && properties.failure > Math.min(properties.omit, 0)) {
                    ret.push({ type: WARNING, index: pageIdx, message: kendo.format(messages.invalidFailure, description, name, pageIdx + 1) });
                }
                if ($.type(properties.success) === CONSTANTS.NUMBER && $.type(properties.omit) === CONSTANTS.NUMBER && properties.success < Math.max(properties.omit, 0)) {
                    ret.push({ type: WARNING, index: pageIdx, message: kendo.format(messages.invalidSuccess, description, name, pageIdx + 1) });
                }
            }
        }
        return ret;
    }
};

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.Tool = BaseTool;
