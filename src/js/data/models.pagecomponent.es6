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
import BaseModel from './models.base.es6';
import PageCollectionDataSource from './datasources.page.es6';
import tools from '../tools/tools.es6';
import BaseTool from '../tools/tools.base.es6';

const { format } = window.kendo;

// TODO: Add better descriptions for PageExplorer (requires access to tools)
// TODO Consider a better way to round height, top, left, width only when saving
// TODO List assets (requires access to tools)
// TODO List tools to load them

/**
 * PageComponent
 */
const PageComponent = BaseModel.define({
    id: 'id',
    fields: {
        id: {
            type: CONSTANTS.STRING,
            editable: false,
            nullable: true
        },
        tool: {
            type: CONSTANTS.STRING,
            editable: false,
            nullable: true // TODO why nullable ?
        },
        top: {
            type: CONSTANTS.NUMBER
            // defaultValue: 0
        },
        left: {
            type: CONSTANTS.NUMBER
            // defaultValue: 0
        },
        height: {
            type: CONSTANTS.NUMBER
            // defaultValue: -1 // why not 0?
        },
        width: {
            type: CONSTANTS.NUMBER
            // defaultValue: -1 // why not 0?
        },
        rotate: {
            type: CONSTANTS.NUMBER,
            // defaultValue: 0,
            parse(value) {
                return $.type(value) === CONSTANTS.NUMBER
                    ? (value + 360) % 360
                    : 0;
            }
        },
        /*
        tag: {
            type: CONSTANTS.STRING,
            defaultValue: null
        },
        */
        attributes: {
            defaultValue: null
        },
        properties: {
            defaultValue: null
        }
    },

    /**
     * Constructor
     * @constructor
     * @param options
     */
    init(options) {
        // Note: Kendo UI requires that new PageComponent() works, i.e. options = undefined
        if (
            ($.type(options) === CONSTANTS.OBJECT &&
                $.type(options.tool) !== CONSTANTS.STRING) ||
            options.tool.length === 0 ||
            !(tools[options.tool] instanceof BaseTool)
        ) {
            throw new Error(
                format('`{0}` is not a valid Kidoju tool', options.tool)
            );
        }

        BaseModel.fn.init.call(this, options);

        if (
            tools &&
            $.type(this.tool) === CONSTANTS.STRING &&
            this.tool.length
        ) {
            const tool = tools[this.tool];
            if (tool instanceof BaseTool) {
                // Let the tool build a Model for attributes to allow validation in the property grid
                const Attributes = tool._getAttributeModel();
                // Extend options attributes with possible new attributes as tools improve
                const attributes = $.extend(
                    {},
                    Attributes.prototype.defaults,
                    this.attributes
                );
                // Cast with Model
                // this.set('attributes', new Attributes(attributes)); // <--- this sets the dirty flag and raises the change event
                this.attributes = new Attributes(attributes);
                this.attributes.bind(CONSTANTS.CHANGE, e => {
                    e.field = `attributes.${e.field}`;
                    this.trigger(CONSTANTS.CHANGE, e);
                });

                // Let the tool build a Model for properties to allow validation in the property grid
                const Properties = tool._getPropertyModel();
                // Extend options properties with possible new properties as tools improve
                const properties = $.extend(
                    {},
                    Properties.prototype.defaults,
                    this.properties
                );
                // Cast with Model
                // this.set('properties', new Properties(properties)); // <--- this sets the dirty flag and raises the change event
                this.properties = new Properties(properties);
                this.properties.bind(CONSTANTS.CHANGE, e => {
                    e.field = `properties.${e.field}`;
                    this.trigger(CONSTANTS.CHANGE, e);
                });

                // Add the code library if any, otherwise we will be missing code for any items designated by a name
                if (
                    tool.properties &&
                    tool.properties.validation instanceof
                        kidoju.adapters.ValidationAdapter
                ) {
                    this._library = tool.properties.validation.library;
                }
            }
        }
    },

    /**
     * Get the parent page
     * @returns {*}
     */
    page() {
        let page;
        if ($.isFunction(this.parent)) {
            const collection = this.parent();
            if (
                collection instanceof PageCollectionDataSource &&
                $.isFunction(collection.parent)
            ) {
                page = collection.parent();
            }
        }
        return page;
    },

    /**
     * Clone a page component
     */
    clone() {
        const component = this;
        assert.type(
            CONSTANTS.STRING,
            component.tool,
            assert.format(
                assert.messages.type.default,
                'component.tool',
                CONSTANTS.STRING
            )
        );
        let fields = component.fields;
        const clone = {};
        // Copy page component fields (tool, top, left, height, width, rotate, ...), but not attributes and properties
        for (var field in fields) {
            // copy any field where fields[field].type is a string including 'boolean', CONSTANTS.NUMBER and CONSTANTS.STRING (i.e. not undefined)
            if (
                fields.hasOwnProperty(field) &&
                $.type(fields[field].type) === CONSTANTS.STRING &&
                field !== component.idField
            ) {
                clone[field] = component.get(field);
            }
        }
        // Copy display attributes
        fields = component.attributes.fields;
        clone.attributes = {};
        for (/* var */ field in fields) {
            if (fields.hasOwnProperty(field)) {
                clone.attributes[field] = JSON.parse(
                    JSON.stringify(component.get(`attributes.${field}`))
                );
            }
        }
        // copy some property attributes
        fields = component.properties.fields;
        clone.properties = {};
        for (/* var */ field in fields) {
            // Copying validation can be fairly complex depending on the use of all, considering components need to change name
            if (
                fields.hasOwnProperty(field) &&
                [
                    'name',
                    'question',
                    'solution',
                    'validation',
                    'success',
                    'failure',
                    'omit'
                ].indexOf(field) === -1
            ) {
                clone.properties[field] = JSON.parse(
                    JSON.stringify(component.get(`properties.${field}`))
                );
            }
        }
        // Return clone
        return new PageComponent(clone);
    },

    /**
     * PageComponent validation
     * @param pageIdx (in PageCollection)
     */
    validate(pageIdx) {
        assert.instanceof(
            PageComponent,
            this,
            assert.format(
                assert.messages.instanceof.default,
                'this',
                'kidoju.data.PageComponent'
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
        assert.instanceof(
            kendo.Observable,
            tools,
            assert.format(
                assert.messages.instanceof.default,
                'tools',
                'kendo.Observable'
            )
        );
        const component = this;
        let ret = [];
        const tool = component.get('tool');
        assert.type(
            CONSTANTS.STRING,
            tool,
            assert.format(
                assert.messages.type.default,
                'tool',
                CONSTANTS.STRING
            )
        );
        if (tools[tool] instanceof BaseTool) {
            ret = tools[tool].validate(component, pageIdx);
        }
        return ret;
    }
});

/**
 * ES6 default export
 */
export default PageComponent;

/**
 * Maintain compatibility with legacy code
 */
window.kidoju = window.kidoju || {};
window.kidoju.data = window.kidoju.data || {};
window.kidoju.data.PageComponent = PageComponent;
