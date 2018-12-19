/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Consider a better way to round height, top, left, width only when saving
// TODO List tools to load them

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import BaseModel from './data.base.es6';
import tools from '../tools/tools.es6';
import BaseTool from '../tools/tools.base.es6';

const {
    data: { DataSource, ObservableArray, ObservableObject },
    format
} = window.kendo;

/**
 * PageComponent
 * @class PageComponent
 * @extends BaseModel
 */
export const PageComponent = BaseModel.define({
    id: CONSTANTS.ID,
    fields: {
        id: {
            type: CONSTANTS.STRING,
            editable: false,
            nullable: true
        },
        attributes: {
            type: CONSTANTS.OBJECT,
            nullable: true
            // parse cannot access this
        },
        height: {
            type: CONSTANTS.NUMBER
        },
        left: {
            type: CONSTANTS.NUMBER
        },
        properties: {
            type: CONSTANTS.OBJECT,
            nullable: true
            // parse cannot access this
        },
        rotate: {
            type: CONSTANTS.NUMBER,
            parse(value) {
                return $.type(value) === CONSTANTS.NUMBER
                    ? (value + 360) % 360
                    : 0;
            }
        },
        tool: {
            type: CONSTANTS.STRING,
            editable: false,
            nullable: true
        },
        top: {
            type: CONSTANTS.NUMBER
        },
        width: {
            type: CONSTANTS.NUMBER
        }
    },

    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options) {
        // Note: Kendo UI requires that new PageComponent() works, i.e. options can be undefined
        if (options) {
            this._assertTool(options.tool);
        }

        // Make init options available to the _parse function
        this._options = options;

        // Note: field parse functions are executed by BaseModel.init method
        BaseModel.fn.init.call(this, options);
    },

    /**
     *
     * @param options
     */
    accept(options) {
        if (options) {
            this._assertTool(options.tool);
        }

        // Make init options available to the _parse function
        this._options = options;

        // Note: field parse functions are executed by BaseModel.accept method
        BaseModel.fn.accept.call(this, options);
    },

    /**
     * Assert a tool
     * @param tool
     * @private
     */
    _assertTool(tool) {
        if (
            $.type(tool) !== CONSTANTS.STRING ||
            tool.length === 0 ||
            tool === CONSTANTS.POINTER ||
            !(tools instanceof ObservableObject) ||
            !(tools[tool] instanceof BaseTool)
        ) {
            throw new Error(format('`{0}` is not a valid tool', tool));
        }
    },

    /**
     * _parse
     * We need this _parse function because the field-level parse function cannot access this
     * See comment in the field definitions above
     * @method _parse
     * @param name
     * @param value
     * @private
     */
    _parse(name, value) {
        if (this._options && name === 'attributes') {
            // If this._options is not undefined, we should have passed _assertTool
            const tool = tools[this._options.tool];
            // Let the tool build a Model for attributes to allow validation in the property grid
            const Attributes = tool.getAttributeModel();
            // Extend options attributes with possible new attributes as tools improve
            const attributes = $.extend(
                {},
                Attributes.prototype.defaults,
                this._options.attributes
            );
            // Cast with Model
            // this.set('attributes', new Attributes(attributes)); // <--- this sets the dirty flag and raises the change event
            return new Attributes(attributes);
        }
        if (this._options && name === 'properties') {
            // If this._options is not undefined, we should have passed _assertTool
            const tool = tools[this._options.tool];
            // Let the tool build a Model for properties to allow validation in the property grid
            const Properties = tool.getPropertyModel();
            // Extend options properties with possible new properties as tools improve
            const properties = $.extend(
                {},
                Properties.prototype.defaults,
                this._options.properties
            );
            // Cast with Model
            // this.set('properties', new Properties(properties)); // <--- this sets the dirty flag and raises the change event
            return new Properties(properties);
        }
        return BaseModel.fn._parse.call(this, name, value);
    },

    /**
     * Assets
     * @method assets
     * @returns {{audio: Array, image: Array, video: Array}}
     */
    assets() {
        const tool = tools[this.get('tool')];
        return tool.getAssets(this);
    },

    /**
     * Get the component index
     * @method index
     */
    index() {
        let index;
        if ($.isFunction(this.parent)) {
            const collection = this.parent();
            // Note: The parent collection is not the data source but
            // the observable array return by dataSource.data()
            if (collection instanceof ObservableArray) {
                index = collection.indexOf(this);
            }
        }
        return index;
    },

    /**
     * Get the parent page
     * @returns {*}
     */
    page() {
        let page;
        if ($.isFunction(this.parent)) {
            const collection = this.parent();
            // Note: The parent collection is not the data source but
            // the observable array return by dataSource.data()
            if (
                collection instanceof ObservableArray &&
                $.isFunction(collection.parent)
            ) {
                page = collection.parent();
            }
        }
        return page;
    },

    /**
     * Description (for widgets.explorer)
     * @method description$
     */
    description$() {
        const tool = tools[this.get('tool')];
        return tool.getDescription(this);
    },

    /**
     * Help (for widgets.markdown)
     * @method help$
     */
    help$() {
        const tool = tools[this.get('tool')];
        return tool.getHelp(this);
    },

    /**
     * Clone
     * Note: we are not using toJSON because some fields might not be serializable
     * @method clone
     */
    clone() {
        assert.type(
            CONSTANTS.STRING,
            this.tool,
            assert.format(
                assert.messages.type.default,
                'this.tool',
                CONSTANTS.STRING
            )
        );
        const clone = {};
        // Copy page component fields (tool, top, left, height, width, rotate, ...), but not id, attributes and properties
        Object.keys(this.fields).forEach(key => {
            if (
                key !== this.idField &&
                key !== 'attributes' &&
                key !== 'properties'
            ) {
                clone[key] = this.get(key);
            }
        });
        // Copy display attributes
        clone.attributes = {};
        Object.keys(this.attributes.fields).forEach(key => {
            // Consider using toJSON on  ObservableObject and ObservableArray
            clone.attributes[key] = JSON.parse(
                JSON.stringify(this.get(`attributes.${key}`))
                // , dateReviver
            );
        });
        // copy some property attributes
        clone.properties = {};
        Object.keys(this.properties.fields).forEach(key => {
            // Copying validation can be fairly complex depending on the use of all,
            // especially considering components need to change name
            if (
                [
                    'name',
                    'question',
                    'solution',
                    'validation',
                    'success',
                    'failure',
                    'omit'
                ].indexOf(key) === -1
            ) {
                // Consider using toJSON on ObservableObject and ObservableArray
                clone.properties[key] = JSON.parse(
                    JSON.stringify(this.get(`properties.${key}`))
                    // , dateReviver
                );
            }
        });
        // Return clone
        return new PageComponent(clone);
    }

    /**
     * Validate
     * @param pageIdx (in PageCollection)
     */
    /*
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
    */
});

/**
 * dataMethod
 * @function dataMethod
 * Note: as in kendo.data.HierarchicalDataSource
 * @param name
 * @returns {function(...[*]=): *}
 */
/*
function dataMethod(name) {
    return function(...args) {
        const data = this._data;
        const result = DataSource.fn[name].apply(
            this,
            Array.prototype.slice.call(args)
        );
        if (this._data !== data) {
            this._attachBubbleHandlers();
        }
        return result;
    };
}
*/

/**
 * PageComponentDataSource
 * @class PageComponentDataSource
 * @extends DataSource
 */
export const PageComponentDataSource = DataSource.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options) {
        if (options && options.schema) {
            assert.extendsOrUndef(
                PageComponent,
                options.schema.modelBase,
                assert.format(
                    assert.messages.extendsOrUndef.default,
                    'options.schema.model',
                    'PageComponent'
                )
            );
            assert.extendsOrUndef(
                PageComponent,
                options.schema.modelBase,
                assert.format(
                    assert.messages.extendsOrUndef.default,
                    'options.schema.modelBase',
                    'PageComponent'
                )
            );

            // Propagates Page options to PageComponentDataSource
            // especially in the case where the stream is defined with
            // a hierarchy of CRUD transports
            if ($.isPlainObject(options.schema.model)) {
                $.extend(true, options, {
                    schema: {
                        modelBase: PageComponent.define(
                            $.isPlainObject(options.schema.modelBase)
                                ? options.schema.modelBase
                                : options.schema.model
                        ),
                        model: PageComponent.define(options.schema.model)
                    }
                });
            }
        }

        DataSource.fn.init.call(
            this,
            $.extend(
                true,
                {
                    schema: {
                        modelBase: PageComponent,
                        model: PageComponent
                    }
                },
                options
            )
        );

        // See https://www.telerik.com/forums/_attachbubblehandlers
        // this._attachBubbleHandlers();
    }

    /**
     * _attachBubbleHandlers
     * @method _attachBubbleHandlers
     * @private
     */
    /*
    _attachBubbleHandlers() {
        const that = this;
        that._data.bind(CONSTANTS.ERROR, e => {
            that.trigger(CONSTANTS.ERROR, e);
        });
    },

    success: dataMethod('success'),
    data: dataMethod('data')
    */
});

/**
 * create
 * @method create
 * @param options
 */
PageComponentDataSource.create = options => {
    // Note: this code is vey similar to SchedulerDataSource.create
    const dataSource =
        Array.isArray(options) || options instanceof ObservableArray
            ? { data: options }
            : options || {};
    if (
        !(dataSource instanceof PageComponentDataSource) &&
        dataSource instanceof DataSource
    ) {
        throw new Error(
            'Incorrect DataSource type. Only PageComponentDataSource instances are supported'
        );
    }
    return dataSource instanceof PageComponentDataSource
        ? dataSource
        : new PageComponentDataSource(dataSource);
};
