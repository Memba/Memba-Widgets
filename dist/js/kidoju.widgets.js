/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function (window, $, undefined) {

    'use strict';

    //var fn = Function,
    //    global = fn('return this')(),
    var kendo = window.kendo,
        Class = kendo.Class,
        Model = kendo.data.Model,
        DataSource = kendo.data.DataSource,
        ObservableArray = kendo.data.ObservableArray,
        kidoju = window.kidoju = window.kidoju || {},

        //Types
        OBJECT = 'object',
        STRING = 'string',
        NUMBER = 'number',
        DATE = 'date',
        BOOLEAN = 'boolean',

        //Event
        CHANGE = 'change',
        ERROR = 'error',

        //Defaults
        ZERO_NUMBER = 0,
        NEGATIVE_NUMBER = -1,

        //Debug
        DEBUG = false,
        MODULE = 'kidoju.models: ';

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function log(message) {
        if (DEBUG && window.console && $.isFunction(window.console.log)) {
            window.console.log(MODULE + message);
        }
    }

    function dataMethod(name) {
        return function() {
            var data = this._data,
                result = DataSource.fn[name].apply(this, [].slice.call(arguments));

            if (this._data != data) {
                this._attachBubbleHandlers();
            }

            return result;
        };
    }


    /*********************************************************************************
     * Models
     *********************************************************************************/

    /**
     * PageComponent model
     * @class PageComponent
     * @type {void|*}
     */
    var PageComponent = kidoju.PageComponent = Model.define({
        id: 'id',
        fields: {
            id: {
                type: STRING,
                editable: false
            },
            tool: {
                type: STRING,
                editable: false,
                nullable: true
            },
            top: {
                type: NUMBER,
                defaultValue: ZERO_NUMBER
            },
            left: {
                type: NUMBER,
                defaultValue: ZERO_NUMBER
            },
            height: {
                type: NUMBER,
                defaultValue: NEGATIVE_NUMBER
            },
            width: {
                type: NUMBER,
                defaultValue: NEGATIVE_NUMBER
            },
            rotate: {
                type: NUMBER,
                defaultValue: ZERO_NUMBER,
                parse: function(value) {
                    return (value + 360) % 360;
                }
            },
            tag: { //A tag for future 3rd party integration (for example treasure hunt quizz linked to GeoJSON coordinates)
                type: STRING,
                defaultValue: null
            },
            attributes: {
                defaultValue: {}
            },
            properties: {
                defaultValue: {}
            }
        },

        /**
         * Constructor
         * @param component
         */
        init: function(component) {

            //Note: Kendo UI requires that new PageComponent() works, i.e. component = undefined
            var that = this;

            if ($.type(component) === OBJECT /*&& !$.isEmptyObject(component)*/) {
                if (!kidoju.tools) {
                    throw new Error('Kidoju tools are missing');
                }
                if ($.type(component.tool) !== STRING || component.tool.length === 0 || !(kidoju.tools[component.tool] instanceof kidoju.Tool)) {
                    throw new Error(kendo.format('`{0}` is not a valid Kidoju tool', component.tool));
                }
                component = $.extend({}, that.defaults, component); //otherwise we are missing default property values
            }

            Model.fn.init.call(that, component);

            if (kidoju.tools && $.type(that.tool) === STRING && that.tool.length) {

                var tool = kidoju.tools[that.tool];
                if (tool instanceof kidoju.Tool) {

                    //Let the tool build a kendo.data.Model for attributes to allow validation in the property grid
                    var Attributes = tool._getAttributeModel(),
                    //Extend component attributes with possible new attributes as tools improve
                        attributes = $.extend({}, Attributes.prototype.defaults, that.attributes);
                    //Cast with Model
                    //that.set('attributes', new Attributes(attributes)); //<--- this sets the dirty flag and raises the change event

                    //Let the tool build a kendo.data.Model for properties to allow validation in the property grid
                    var Properties = tool._getPropertyModel(),
                    //Extend component properties with possible new properties as tools improve
                        properties = $.extend({}, Properties.prototype.defaults, that.properties);
                    //Cast with Model
                    //that.set('properties', new Properties(properties)); //<--- this sets the dirty flag and raises the change event

                    that.accept({ //<---- this neither sets teh dirty flag nor raises the change event
                        attributes: new Attributes(attributes),
                        properties: new Properties(properties)
                    });

                }
            }
        },

        /**
         * Get the parent page
         * @returns {*}
         */
        page: function() {
            var componentCollection = this.parent();
            return componentCollection.parent();
        }
    });

    /**
     * @class PageComponentCollectionDataSource
     * @type {*|void|Object}
     */
    var PageComponentCollectionDataSource =  kidoju.PageComponentCollectionDataSource = DataSource.extend({
        init: function(options) {

            var SubPageComponent = PageComponent.define({
                components: options
            });

            DataSource.fn.init.call(this, $.extend(true, {}, { schema: { modelBase: SubPageComponent, model: SubPageComponent } }, options));

            // If there is a necessity to transform data, there is a possibility to change the reader as follows
            // this.reader = new PageComponentCollectionDataReader(this.options.schema, this.reader);
            // See kendo.scheduler.SchedulerDataReader which transforms dates with timezones
        },

        remove: function(model) {
            return DataSource.fn.remove.call(this, model);
        },

        //success: dataMethod("success"),

        //data: dataMethod("data"),

        insert: function(index, model) {
            if (!model) {
                return;
            }

            if (!(model instanceof PageComponent)) {
                var component = model;

                model = this._createNewModel();
                model.accept(component);
            }

            return DataSource.fn.insert.call(this, index, model);
        }

    });

    /**
     * @method create
     * @param options
     */
    PageComponentCollectionDataSource.create = function(options) {
        options = options && options.push ? { data: options } : options;

        var dataSource = options || {},
            data = dataSource.data;

        dataSource.data = data;

        if (!(dataSource instanceof PageComponentCollectionDataSource) && dataSource instanceof DataSource) {
            throw new Error('Incorrect DataSource type. Only PageComponentCollectionDataSource instances are supported');
        }

        return dataSource instanceof PageComponentCollectionDataSource ? dataSource : new PageComponentCollectionDataSource(dataSource);
    };

    /**
     * Page
     * @class Page
     * @type {void|*}
     */
    var Page = kidoju.Page = Model.define({

        id: 'id',
        fields: {
            id: {
                type: STRING,
                editable:false
            },
            style: {
                type: STRING
            }
        },

        /**
         * @constructor
         * @param value
         */
        init: function(value) {
            var that = this;

            Model.fn.init.call(that, value);

            that._componentsOptions = {};

            if($.isPlainObject(that.components)) {
                $.extend(that._componentsOptions, that.components);
            }

            //if (that.schema && that.schema.model && that.schema.model.components && that.schema.model.components.transport) {
            //    $.extend(that._componentsOptions, {transport: that.schema.model.components.transport});
            //}

            if (value && $.isArray(value.components)) { //ObservableArray? PageComponentDataSource?
                $.extend(that._componentsOptions, {data: value.components});
            }

            that._initComponents();
            that._loaded = !!(value && (value.components || value._loaded));
        },

        /**
         * @method _initComponents
         * @private
         */
        _initComponents: function() {
            var that = this;
            var components, transport, parameterMap;

            if (!(that.components instanceof PageComponentCollectionDataSource)) {
                components = that.components = new PageComponentCollectionDataSource(that._componentsOptions);

                transport = components.transport;
                parameterMap = transport.parameterMap;

                transport.parameterMap = function(data, type) {
                    data[that.idField || "id"] = that.id;

                    if (parameterMap) {
                        data = parameterMap(data, type);
                    }

                    return data;
                };

                components.parent = function(){
                    return that;
                };

                /*
                components.bind(CHANGE, function(e){
                    e.node = e.node || that; //TODO: review
                    that.trigger(CHANGE, e);
                });

                components.bind(ERROR, function(e){
                    var collection = that.parent();

                    if (collection) {
                        e.node = e.node || that; //TODO: review
                        collection.trigger(ERROR, e);
                    }
                });
                */
            }
        },

        /**
         * @method append
         * @param model
         */
        append: function(model) {
            this._initComponents();
            this.loaded(true);
            this.components.add(model);
        },

        /**
         * @method _componentsLoaded
         * @private
         */
        _componentsLoaded: function() {
            this._loaded = true;
        },

        /**
         * @method load
         * @returns {*}
         */
        load: function() {
            var options = {};
            var method = '_query';
            var components, promise;

            //if (this.hasComponents) {

                this._initComponents();

                components = this.components;

                options[this.idField || 'id'] = this.id;

                if (!this._loaded) {
                    components._data = undefined;
                    method = 'read';
                }

                components.one(CHANGE, $.proxy(this._componentsLoaded, this));
                promise = components[method](options);

            //} else {
            //    this.loaded(true);
            //}

            return promise || $.Deferred().resolve().promise();

        },

        /**
         * Get the parent stream
         * @returns {*}
         */
        stream: function() {
            var pageCollection = this.parent();
            return pageCollection.parent();
        },

        /**
         * Gets or sets the loaded status of page components
         * @param value
         * @returns {boolean|*|Page._loaded}
         */
        loaded: function(value) {
            if (value !== undefined) {
                this._loaded = value;
            } else {
                return this._loaded;
            }
        },

        /**
         * Fields to serialize
         * @param field
         * @returns {*|boolean}
         */
        shouldSerialize: function(field) {
            return Model.fn.shouldSerialize.call(this, field) &&
                field !== 'components' &&
                field !== '_loaded' &&
                //field !== 'hasComponents' &&
                field !== '_componentsOptions';
        }
    });

    /**
     * @class PageCollectionDataSource
     * @type {*|void|Object}
     */
    var PageCollectionDataSource =  kidoju.PageCollectionDataSource = DataSource.extend({

        /**
         * @constructor
         * @param options
         */
        init: function(options) {

            var SubPage = Page.define({
                components: options
            });

            DataSource.fn.init.call(this, $.extend(true, {}, { schema: { modelBase: SubPage, model: SubPage } }, options));

            // If there is a necessity to transform data, there is a possibility to change the reader as follows
            // this.reader = new PageComponentCollectionDataReader(this.options.schema, this.reader);
            // See kendo.scheduler.SchedulerDataReader which transforms dates with timezones

            this._attachBubbleHandlers();

        },

        /**
         * @method _attachBubbleHandlers
         * @private
         */
        _attachBubbleHandlers: function() {
            var that = this;

            that._data.bind(ERROR, function(e) {
                that.trigger(ERROR, e);
            });
        },

        /**
         * @method remove
         * @param model
         * @returns {*}
         */
        remove: function(model) {
            return DataSource.fn.remove.call(this, model);
        },

        //success: dataMethod("success"),

        //data: dataMethod("data"),

        /**
         * @method insert
         * @param index
         * @param model
         * @returns {*}
         */
        insert: function(index, model) {
            if (!model) {
                return;
            }

            if (!(model instanceof Page)) {
                var page = model;

                model = this._createNewModel();
                model.accept(page);
            }

            return DataSource.fn.insert.call(this, index, model);
        },

        /**
         * Get an assessment object from properties
         * @method getObjectFromProperties
         * @returns {*}
         */
        getObjectFromProperties: function() {

            //TODO: use $.when.apply($, promises).then(...)

            var obj = {},
                pages = this.data();
            for (var i = 0; i < pages.length; i++) {
                pages[i].load();
                var components = pages[i].components.data();
                for (var j = 0; j < components.length; j++) {
                    var properties = components[j].properties || {};
                    for (var prop in properties) {
                        if (properties.hasOwnProperty(prop)) {
                            obj[properties[prop].name] = properties[prop].value;
                        }
                    }
                }
            }

            //TODO we should return an object cast with a model with type and validation

            return kendo.observable (obj);
        }
    });

    /**
     * @method create
     * @param options
     */
    PageCollectionDataSource.create = function(options) {
        options = options && options.push ? { data: options } : options;

        var dataSource = options || {},
            data = dataSource.data;

        dataSource.data = data;

        if (!(dataSource instanceof PageCollectionDataSource) && dataSource instanceof DataSource) {
            throw new Error('Incorrect DataSource type. Only PageCollectionDataSource instances are supported');
        }

        return dataSource instanceof PageCollectionDataSource ? dataSource : new PageCollectionDataSource(dataSource);
    };

    /**
     * @class Stream
     */
    var Stream = kidoju.Stream = Model.define({
        id: 'id',
        fields: {
            id: {
                type: STRING,
                editable:false
            }
            //TODO: register assets
        },

        /**
         * Constructor
         * @param value
         */
        init: function(value) {
            var that = this;

            Model.fn.init.call(that, value);

            that._pagesOptions = {};

            if($.isPlainObject(that.pages)) {
                $.extend(that._pagesOptions, that.pages);
            }

            if (value && value.pages) {
                $.extend(that._pagesOptions, {data: value.pages});
            }

            that._initPages();

            that._loaded = !!(value && (value.pages || value._loaded));
        },

        /**
         * @method _initPages
         * @private
         */
        _initPages: function() {
            var that = this;
            var pages, transport, parameterMap;

            if (!(that.pages instanceof PageCollectionDataSource)) {
                pages = that.pages = new PageCollectionDataSource(that._pagesOptions);

                transport = pages.transport;
                parameterMap = transport.parameterMap;

                transport.parameterMap = function(data, type) {
                    data[that.idField || "id"] = that.id;

                    if (parameterMap) {
                        data = parameterMap(data, type);
                    }

                    return data;
                };

                pages.parent = function(){
                    return that;
                };

                /*
                pages.bind(CHANGE, function(e){
                    e.node = e.node || that;
                    that.trigger(CHANGE, e);
                });

                pages.bind(ERROR, function(e){
                    var collection = that.parent();

                    if (collection) {
                        e.node = e.node || that;
                        collection.trigger(ERROR, e);
                    }
                });
                */

                //that._updatePagesField();
            }
        },

        /**
         * Append a page
         * @param model
         */
        append: function(model) {
            this._initPages();
            this.loaded(true);
            this.pages.add(model);
        },

        /**
         *
         * @private
         */
        _pagesLoaded: function() {
            this._loaded = true;
        },

        /**
         * Load pages
         * @returns {*}
         */
        load: function() {
            var options = {};
            var method = '_query';
            var pages, promise;

            //if (this.hasPages) {

            this._initPages();

            pages = this.pages;

            options[this.idField || 'id'] = this.id;

            if (!this._loaded) {
                pages._data = undefined;
                method = 'read';
            }

            pages.one(CHANGE, $.proxy(this._pagesLoaded, this));
            promise = pages[method](options);

            //} else {
            //    this.loaded(true);
            //}

            return promise || $.Deferred().resolve().promise();

        },

        /**
         * Save
         */
        save: function() {
            var that = this,
                promises = [];

            //TODO: save stream....

            //Save pages
            promises.push(that.pages.sync());

            //Save page components
            $.each(that.pages.data(), function(index, page) {
                promises.push(page.components.sync());
            });

            return $.when.apply($, promises);
        },

        /**
         * Gets or sets loaded value
         * @param value
         * @returns {boolean|*}
         */
        loaded: function(value) {
            if (value !== undefined) {
                this._loaded = value;
            } else {
                return this._loaded;
            }
        },

        /**
         * Check which field should be serialized
         * @param field
         * @returns {*|boolean}
         */
        shouldSerialize: function(field) {
            return Model.fn.shouldSerialize.call(this, field) &&
                field !== 'pages' &&
                field !== '_loaded' &&
                field !== '_pagesOptions';
        }
    });


}(this, jQuery));

;
/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function (window, $, undefined) {

    'use strict';

    var kendo = window.kendo,
        kidoju = window.kidoju = window.kidoju || {},

        //Types
        OBJECT = 'object',
        STRING = 'string',
        NUMBER = 'number',
        BOOLEAN = 'boolean',
        DATE = 'date',

        //Tools
        CURSOR_DEFAULT = 'default',
        CURSOR_CROSSHAIR = 'crosshair',
        REGISTER = 'register',
        ACTIVE = 'active',
        POINTER = 'pointer',

        //HTML
        ELEMENT_CLASS = '.kj-element',
        POSITION = 'position',
        ABSOLUTE = 'absolute',

        //Debug
        DEBUG = false,
        MODULE = 'kidoju.tools: ';


    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function log(message) {
        if (DEBUG && window.console && $.isFunction(window.console.log)) {
            window.console.log(MODULE + message);
        }
    }

    /*********************************************************************************
     * Tools
     *********************************************************************************/

    /**
     * Registry of tools
     * @type {{register: Function}}
     */
    kidoju.tools = kendo.observable({
        active: null,
        register: function(Class) {
            //if(Class instanceof constructor) {
            if($.type(Class.fn) === OBJECT) {
                var obj = new Class();
                if (obj instanceof Tool && $.type(obj.id) === STRING) {
                    if (obj.id === ACTIVE || obj.id === REGISTER) {
                        throw new Error('You cannot name your tool `active` or `register`');
                    } else if (!this[obj.id]) { //make sure (our system) tools are not being replaced
                        this[obj.id] = obj;
                        if (obj.id === POINTER) {
                            this.active = POINTER;
                        }
                    }
                }
            }
        }
    });

    /**
     * @class Tool
     * @type {void|*}
     */
    var Tool =  kidoju.Tool = kendo.Class.extend({
        id: null,
        icon: null,
        cursor: null,
        height: 250,
        width: 250,
        attributes: {},
        properties: {},
        /**
         * Constructor
         * @param options
         */
        init: function(options) {
            if($.type(options) === OBJECT) {
                if ($.type(options.id) === STRING) {
                    this.id = options.id;
                }
                if ($.type(options.icon) === STRING) {
                    this.icon = options.icon;
                }
                //if ($.type(options.name) === STRING) {
                //    this.name = options.name;
                //}
                if ($.type(options.cursor) === STRING) {
                    this.cursor = options.cursor;
                }
                if ($.type(options.height) === NUMBER) {
                    this.height = options.height;
                }
                if ($.type(options.width) === NUMBER) {
                    this.width = options.width;
                }
            }
        },


        /**
         * Get a kendo.data.Model for attributes
         * @method _getAttributeModel
         * @returns {kendo.data.Model}
         * @private
         */
        _getAttributeModel: function() {
            var model = { fields: {} };
            for(var attr in this.attributes) {
                if (this.attributes.hasOwnProperty(attr)) {
                    if (this.attributes[attr] instanceof adapters.BaseAdapter) {
                        model.fields[attr] = this.attributes[attr].getField();
                    }
                }
            }
            return kendo.data.Model.define(model);
        },

        /**
         * Gets property grid row specifications for attributes
         * @returns {Array}
         * @private
         */
        _getAttributeRows: function() {
            var rows = [];

            //Add top, left, height, width, rotation
            rows.push(new adapters.NumberAdapter({attributes:{'data-min': 0}}).getRow('top'));
            rows.push(new adapters.NumberAdapter().getRow('left'));
            rows.push(new adapters.NumberAdapter().getRow('height'));
            rows.push(new adapters.NumberAdapter().getRow('width'));
            rows.push(new adapters.NumberAdapter().getRow('rotate'));

            //Add other attributes
            for(var attr in this.attributes) {
                if (this.attributes.hasOwnProperty(attr)) {
                    if (this.attributes[attr] instanceof adapters.BaseAdapter) {
                        rows.push(this.attributes[attr].getRow('attributes.' + attr));
                    }
                }
            }
            return rows;
        },

        /**
         * Get a kendo.data.Model for properties
         * @method _getPropertyModel
         * @returns {kendo.data.Model}
         * @private
         */
        _getPropertyModel: function() {
            var model = { fields: {} };
            for(var prop in this.properties) {
                if (this.properties.hasOwnProperty(prop)) {
                    if (this.properties[prop] instanceof adapters.BaseAdapter) {
                        model.fields[prop] = this.properties[prop].getField();
                    }
                }
            }
            return kendo.data.Model.define(model);
        },

        /**
         * Gets property grid row specifications for properties
         * @returns {Array}
         * @private
         */
        _getPropertyRows: function() {
            var rows = [];

            for(var prop in this.properties) {
                if (this.properties.hasOwnProperty(prop)) {
                    if (this.properties[prop] instanceof adapters.BaseAdapter) {
                        rows.push(this.properties[prop].getRow('properties.' + prop));
                    }
                }
            }
            return rows;
        },

        /**
         * Get Html content
         * @param component
         */
        getHtml: function (component) {
            throw new Error('Please implement in subclassed tool.');
        }

        // onMove(e.component)
        // onResize(e.component)
        // onRotate(e.component)
    });

    /**
     * Static factory for a bag of standard properties
     */
    kidoju.Tool.getStandardProperties = function() {
        return {
            name: new adapters.NameAdapter({ title: 'Name' }),
            validation: new adapters.ValidationAdapter({ title: 'Validation' }),
            success: new adapters.ScoreAdapter({ title: 'Success' }),
            failure: new adapters.ScoreAdapter({ title: 'Failure' }),
            omit: new adapters.ScoreAdapter({ title: 'Omit' })
        };
    };

    /*******************************************************************************************
     * Adapter classes
     * used to display values in a proprty grid
     *******************************************************************************************/
    var adapters = kidoju.adapters = {};

    adapters.BaseAdapter = kendo.Class.extend({

        /**
         * Data type: string, number, boolean or date
         */
        type: undefined,

        /**
         * Constructor
         * @param options
         */
        init: function(options) {
            options = options || {};
            //this.value = options.value;

            //See http://docs.telerik.com/kendo-ui/api/javascript/data/model#methods-Model.define
            this.defaultValue = options.defaultValue;
            this.editable = options.editable;
            this.nullable = options.nullable;
            this.parse = options.parse;
            this.from = options.from;
            this.validation = options.validation;

            //See http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns
            this.field = options.field;
            this.title = options.title;
            this.format = options.format;
            this.template = options.template;
            this.editor = options.editor;
            //TODO: HTML encode????
            this.attributes = options.attributes;
        },

        /**
         * Get a kendo.data.Model field
         * See http://docs.telerik.com/kendo-ui/api/javascript/data/model#methods-Model.define
         * @returns {{}}
         */
        getField: function() {
            var field = {};
            if ([STRING, NUMBER, BOOLEAN, DATE].indexOf(this.type) > -1) {
                field.type = this.type;
            }
            if ($.type(this.defaultValue) === this.type ||
                this.type === undefined) { //TODO: test that defaultValue is null or an object
                field.defaultValue = this.defaultValue;
            }
            if ($.type(this.editable) === BOOLEAN) {
                field.editable = this.defaultValue;
            }
            if ($.type(this.nullable) === BOOLEAN) {
                field.nullable = this.nullable;
            }
            if ($.isFunction(this.parse)) {
                field.parse = this.parse;
            }
            if ($.type(this.from) === STRING) {
                field.from = this.from;
            }
            if ($.type(this.validation) === OBJECT) {
                field.validation = this.validation;
            }
            return field;
        },

        /**
         * Get a property grid row
         * See http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns
         * @param field - This is the MVVM path to the field the data is bound to
         * @returns {{}}
         */
        getRow: function(field) {
            if ($.type(field) !== STRING || field.length === 0) {
                throw new TypeError();
            }
            var row = {};
            row.field = field; //Mandatory
            if ($.type(this.title) === STRING) {
                row.title = this.title;
            }
            if ($.type(this.format) === STRING) {
                row.format = this.format;
            }
            if ($.type(this.template) === STRING) {
                row.template = this.template;
            }
            if ($.isFunction(this.editor) ||
               ($.type(this.editor) === STRING && (kidoju.editors === undefined || $.isFunction(kidoju.editors[this.editor])))) {
                row.editor = this.editor;
            }
            //TODO: HTML encode????
            if($.isPlainObject(this.attributes)) {
                row.attributes = this.attributes;
            }
            return row;
        }
    });

    /**
     * String adapter
     */
    adapters.StringAdapter = adapters.BaseAdapter.extend({
        init: function(options) {
            adapters.BaseAdapter.fn.init.call(this, options);
            this.type = STRING;
            this.editor = 'textbox';
            this.defaultValue = this.defaultValue || (this.nullable ? null : '');
        }
    });

    /**
     * Number adapter
     */
    adapters.NumberAdapter = adapters.BaseAdapter.extend({
        init: function(options) {
            adapters.BaseAdapter.fn.init.call(this, options);
            this.type = NUMBER;
            this.defaultValue = this.defaultValue || (this.nullable ? null : 0);
            this.editor = '_kendoInput';
            this.attributes = $.extend({}, this.attributes, { 'data-role': 'numerictextbox' });
        }
    });

    /**
     * Boolean adapter
     */
    adapters.BooleanAdapter = adapters.BaseAdapter.extend({
        init: function(options) {
            adapters.BaseAdapter.fn.init.call(this, options);
            this.type = BOOLEAN;
            this.defaultValue = this.defaultValue || (this.nullable ? null : false);
            this.editor = '_kendoInput';
            this.attributes = $.extend({}, this.attributes, { 'data-role': 'switch' });
        }
    });

    /**
     * Date adapter
     */
    adapters.DateAdapter = adapters.BaseAdapter.extend({
        init: function(options) {
            adapters.BaseAdapter.fn.init.call(this, options);
            this.type = DATE;
            this.defaultValue = this.defaultValue || (this.nullable ? null : new Date());
            this.editor = '_kendoInput';
            this.attributes = $.extend({}, this.attributes, { 'data-role': 'datepicker' });
        }
    });

    /**
     * Style adapter
     */
    adapters.StyleAdapter = adapters.BaseAdapter.extend({
        init: function(options) {
            adapters.BaseAdapter.fn.init.call(this, options);
            this.type = STRING;
            this.defaultValue = this.defaultValue || (this.nullable ? null : '');
            this.editor = function(container, options) {

                var div = $('<div/>')
                    .css({display: 'table'})
                    .appendTo(container);

                var span  = $('<span/>')
                    .css({
                        display: 'table-cell',
                        width: '100%',
                        paddingRight: '8px'
                    })
                    .appendTo(div);

                var input = $('<input/>')
                    .addClass('k-textbox') //or k-input
                    .css({
                        border: 'solid 1px #FF0000',
                        width: '100%'
                    })
                    .attr($.extend({}, options.attributes, {'data-bind': 'value: ' + options.field}))
                    .appendTo(span);

                $('<button/>')
                    .text('...')
                    .addClass('k-button')
                    .css({
                        display: 'table-cell',
                        minWidth: '40px',
                        height: input.css('height'), //to match input,
                        margin: 0
                    })
                    .appendTo(div)
                    .on('click', function(e) {
                        window.alert('coucou'); //TODO: display a window
                    });
            };
        }
    });

    /**
     * Property name adapter
     */
    adapters.NameAdapter = adapters.StringAdapter.extend({});

    /**
     * Property validation adapter
     */
    adapters.ValidationAdapter = adapters.BaseAdapter.extend({});

    /**
     * Property score adapter
     */
    adapters.ScoreAdapter = adapters.NumberAdapter.extend({});

    /*******************************************************************************************
     * Tool classes
     *******************************************************************************************/

    /**
     * @class Pointer tool
     * @type {void|*}
     */
    var Pointer = kidoju.Tool.extend({
        id: POINTER,
        icon: 'mouse_pointer',
        cursor: CURSOR_DEFAULT,
        height: 0,
        width: 0,
        getHtml: undefined
    });
    kidoju.tools.register(Pointer);

    /**
     * @class Label tool
     * @type {void|*}
     */
    var Label = kidoju.Tool.extend({
        id: 'label',
        icon: 'document_orientation_landscape',
        cursor: CURSOR_CROSSHAIR,
        templates: {
            default: '<span style="#= attributes.style #">#: attributes.text #</span>'
        },
        height: 100,
        width: 300,
        attributes: {
            text: new adapters.StringAdapter({ defaultValue: 'Label' }),
            style: new adapters.StyleAdapter({ defaultValue: 'font-family: Georgia, serif; color: #FF0000;'})
        },

        /**
         * Get Html content
         * @method getHtml
         * @param component
         * @returns {*}
         */
        getHtml: function(component) {
            if (component instanceof kidoju.PageComponent) {
                var template = kendo.template(this.templates.default);
                return template(component);
            }
        },

        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param component
         */
        onResize: function(e, component) {
            var stageElement = $(e.currentTarget);
            if(stageElement.is(ELEMENT_CLASS) && component instanceof kidoju.PageComponent) {
                var content = stageElement.find('>span');
                if ($.type(component.width) === NUMBER) {
                    content.width(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.height(component.height);
                }
                var fontSize = parseInt(content.css('font-size'));
                var clone = content.clone()
                    .hide()
                    .css({
                        position: ABSOLUTE,
                        height: 'auto'
                    })
                    .width(component.width);
                stageElement.after(clone);
                //if no overflow, increase until overflow
                while(clone.height() < component.height) {
                    fontSize++;
                    clone.css('font-size', fontSize);
                }
                //if overflow, decrease until no overflow
                while(clone.height() > component.height) {
                    fontSize--;
                    clone.css('font-size', fontSize);
                }
                clone.remove();
                content.css('font-size', fontSize);

                //prevent any side effect
                e.preventDefault();
                //prevent event to bubble on stage
                e.stopPropagation();
            }
        }
    });
    kidoju.tools.register(Label);

    /**
     * @class Image tool
     * @type {void|*}
     */
    var Image = kidoju.Tool.extend({
        id: 'image',
        icon: 'painting_landscape',
        cursor: CURSOR_CROSSHAIR,
        templates: {
            default: '<img src="#= attributes.src #" alt="#: attributes.alt #">'
        },
        height: 250,
        width: 250,
        attributes: {
            src: new adapters.StringAdapter(),
            alt: new adapters.StringAdapter()
        },
        /**
         * Get Html content
         * @method getHtml
         * @param component
         * @returns {*}
         */
        getHtml: function(component) {
            if (component instanceof kidoju.PageComponent) {
                var template = kendo.template(this.templates.default);
                return template(component);
            }
        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param component
         */
        onResize: function(e, component) {
            var stageElement = $(e.currentTarget);
            if(stageElement.is(ELEMENT_CLASS) && component instanceof kidoju.PageComponent) {
                var content = stageElement.find('>img');
                if ($.type(component.width) === NUMBER) {
                    content.width(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.height(component.height);
                }
                //prevent any side effect
                e.preventDefault();
                //prevent event to bubble on stage
                e.stopPropagation();
            }
        }
    });
    kidoju.tools.register(Image);

    /**
     * @class Textbox tool
     * @type {void|*}
     */
    var Textbox = kidoju.Tool.extend({
        id: 'textbox',
        icon: 'text_field',
        cursor: CURSOR_CROSSHAIR,
        templates: {
            default: '<input type="text" style="#= attributes.style #" data-bind="value: #: properties.name #">'
        },
        height: 100,
        width: 300,
        attributes: {
            style: new adapters.StyleAdapter()
        },
        properties: kidoju.Tool.getStandardProperties(),
        /**
         * Get Html content
         * @method getHtml
         * @param component
         * @returns {*}
         */
        getHtml: function(component) {
            if (component instanceof kidoju.PageComponent) {
                var template = kendo.template(this.templates.default);
                return template(component);
            }
        },

        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param component
         */
        onResize: function(e, component) {
            var stageElement = $(e.currentTarget);
            if(stageElement.is(ELEMENT_CLASS) && component instanceof kidoju.PageComponent) {
                var content = stageElement.find('>input');
                if ($.type(component.width) === NUMBER) {
                    content.width(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.height(component.height);
                    content.css('font-size', Math.floor(0.75*component.height));
                }
                //prevent any side effect
                e.preventDefault();
                //prevent event to bubble on stage
                e.stopPropagation();
            }
        }
    });
    kidoju.tools.register(Textbox);

    /**
     * @class Button tool
     * @type {void|*}
     */
    var Button = kidoju.Tool.extend({
        id: 'button',
        icon: 'button',
        cursor: CURSOR_CROSSHAIR,
        templates: {
            default: '<button type="button" style="#= attributes.style #">#: attributes.text #</button>'
        },
        height: 100,
        width: 300,
        attributes: {
            style: new adapters.StyleAdapter(),
            text: new adapters.StringAdapter({ defaultValue: 'Button' })
        },
        properties: kidoju.Tool.getStandardProperties(),

        /**
         * Get Html content
         * @method getHtml
         * @param component
         * @returns {*}
         */
        getHtml: function(component) {
            if (component instanceof kidoju.PageComponent) {
                var template = kendo.template(this.templates.default);
                return template(component);
            }
        },
        addEvents: function(component) {

        },
        removeEvents: function(component) {

        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param component
         */
        onResize: function(e, component) {
            var stageElement = $(e.currentTarget);
            if(stageElement.is(ELEMENT_CLASS) && component instanceof kidoju.PageComponent) { //TODO: same id, same tool?
                var content = stageElement.find('>button');
                if ($.type(component.width) === NUMBER) {
                    content.width(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.height(component.height);
                    content.css('font-size', Math.floor(0.75*component.height));
                }
                //prevent any side effect
                e.preventDefault();
                //prevent event to bubble on stage
                e.stopPropagation();
            }
        }
    });
    kidoju.tools.register(Button);


    /**
     * We could also consider
     * ButtonGroup
     * HTML
     * Drawing surface
     * Shape
     * Select
     * Checkbox
     * Drop Target
     * Connector
     * Clock
     * Video
     * Sound
     * Text-to-Speech
     * MathJax
     * Grid
     */

    /*****************************************************************************
    * TODO: Behaviours
    ******************************************************************************/

}(this, jQuery));

;
/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function (window, $, undefined) {

    'use strict';

    // shorten references to variables for uglification
    //var fn = Function,
    //    global = fn('return this')(),
    var kendo = window.kendo,
        data = kendo.data,
        binders = data.binders,
        Binder = data.Binder,
        ui = kendo.ui,

        //Types
        STRING = 'string',
        NUMBER = 'number',

        //Events
        CHANGE = 'change',

        DEBUG = false,
        MODULE = 'kidoju.widgets.bindings: ';

    //For more information, see http://docs.telerik.com/kendo-ui/framework/mvvm/bindings/custom

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function log(message) {
        if (DEBUG && window.console && $.isFunction(window.console.log)) {
            window.console.log(MODULE + message);
        }
    }

    function isGuid(value) {
        //http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
        return  ($.type(value) === STRING) && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value));
    }

    /*********************************************************************************
     * Bindings
     *********************************************************************************/

    /**
     * Enable binding the index value of a Playbar widget
     * @type {*|void}
     */
    binders.widget.index = Binder.extend({
        init: function(widget, bindings, options) {
            Binder.fn.init.call(this, widget.element[0], bindings, options);
            this.widget = widget;
            this._change = $.proxy(this.change, this);
            this.widget.bind(CHANGE, this._change);
        },
        change: function() {
            this.bindings.index.set(this.widget.index());
        },
        refresh: function() {
            var index = this.bindings.index.get();
            if ($.type(index) === NUMBER /*&& index >= 0*/) {
                this.widget.index(index);
            }
        },
        destroy: function() {
            this.widget.unbind(CHANGE, this._change);
        }
    });

    /**
     * Enable binding the id value of a Playbar widget
     * @type {*|void}
     */
    binders.widget.id = Binder.extend({
        init: function(widget, bindings, options) {
            Binder.fn.init.call(this, widget.element[0], bindings, options);
            this.widget = widget;
            this._change = $.proxy(this.change, this);
            this.widget.bind(CHANGE, this._change);
        },
        change: function() {
            this.bindings.id.set(this.widget.id());
        },
        refresh: function() {
            var id = this.bindings.id.get();
            if (isGuid(id)) {
                this.widget.id(id);
            }
        },
        destroy: function() {
            this.widget.unbind(CHANGE, this._change);
        }
    });

    /**
     * Enable binding the selection value of a Playbar widget
     * @type {*|void}
     */
    binders.widget.selection = Binder.extend({
        init: function(widget, bindings, options) {
            Binder.fn.init.call(this, widget.element[0], bindings, options);
            this.widget = widget;
            this._change = $.proxy(this.change, this);
            this.widget.bind(CHANGE, this._change);
        },
        change: function() {
            this.bindings.selection.set(this.widget.selection());
        },
        refresh: function() {
            this.widget.selection(this.bindings.selection.get());
        },
        destroy: function() {
            this.widget.unbind(CHANGE, this._change);
        }
    });

    /**
     * Enable binding the properties value of a Page widget
     * @type {*|void}
     */
    binders.widget.properties = Binder.extend({
        init: function(widget, bindings, options) {
            Binder.fn.init.call(this, widget.element[0], bindings, options);
            this.widget = widget;
            this._change = $.proxy(this.change, this);
            this.widget.bind(CHANGE, this._change);
        },
        change: function() {
            this.bindings.properties.set(this.widget.properties());
        },
        refresh: function() {
            this.widget.properties(this.bindings.properties.get());
        },
        destroy: function() {
            this.widget.unbind(CHANGE, this._change);
        }
    });


} (this, jQuery));

;
/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function(window, $, undefined) {

    'use strict';

    // shorten references to variables for uglification
    //var fn = Function,
    //    global = fn('return this')(),
    var kendo = window.kendo,
        data = kendo.data,
        Widget = kendo.ui.Widget,

        //Types
        NULL = null,

        //Events
        CHANGE = 'change',

        //Widget
        WIDGET_CLASS = 'k-widget kj-explorer',

        DEBUG = false,
        MODULE = 'kidoju.widgets.designbar: ';

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function log(message) {
        if (DEBUG && window.console && $.isFunction(window.console.log)) {
            window.console.log(MODULE + message);
        }
    }


    /*********************************************************************************
     * Widget
     *********************************************************************************/

    /**
     * Designbar widget
     * *class
     * @type {*}
     */
    var Designbar = Widget.extend({

        init: function(element, options) {
            var that = this;
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
            log('widget initialized');
            that._layout();
        },

        options: {
            name: 'Designbar'
        },

        /**
         * Builds the widget layout
         * @private
         */
        _layout: function () {
            var that = this;
            $(that.element).html(that.options.name);
        },

        /**
         * @method _clear
         * @private
         */
        _clear: function() {
            var that = this;
            //unbind kendo
            //kendo.unbind($(that.element));
            //unbind all other events
            $(that.element).find('*').off();
            $(that.element)
                .off()
                .empty()
                .removeClass(WIDGET_CLASS);
        },

        /**
         * Destroys the widget including all DOM modifications
         */
        destroy: function() {
            var that = this;
            Widget.fn.destroy.call(that);
            that._clear();
            //that.setDataSource(NULL);
            kendo.destroy(that.element);
        }

    });

    kendo.ui.plugin(Designbar);

}(this, jQuery));

;
/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function(window, $, undefined) {

    'use strict';

    // shorten references to variables for uglification
    //var fn = Function,
    //    global = fn('return this')(),
    var kendo = window.kendo,
        data = kendo.data,
        Widget = kendo.ui.Widget,
        kidoju = window.kidoju,

        //Types
        STRING = 'string',
        NUMBER = 'number',
        NULL = null,

        //Events
        CHANGE = 'change',
        CLICK = 'click',
        DATABINDING = 'dataBinding',
        DATABOUND = 'dataBound',
        MOUSEENTER = 'mouseenter',
        MOUSELEAVE = 'mouseleave',
        //FOCUS = 'focus',
        //BLUR = 'blur',
        SELECT = 'select',
        NS = '.kendoExplorer',

        //Widget
        WIDGET_CLASS = 'k-widget k-group kj-explorer', //k-list-container k-reset
        HOVER_CLASS = 'k-state-hover',
        //FOCUSED_CLASS = 'k-state-focused',
        SELECTED_CLASS = 'k-state-selected',
        ALL_ITEMS_SELECTOR = 'li.k-item[data-uid]',
        ITEM_BYUID_SELECTOR = 'li.k-item[data-uid="{0}"]',
        ARIA_SELECTED = 'aria-selected',

        DEBUG = false,
        MODULE = 'kidoju.widgets.explorer: ';

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function log(message) {
        if (DEBUG && window.console && $.isFunction(window.console.log)) {
            window.console.log(MODULE + message);
        }
    }

    function isGuid(value) {
        //http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
        return  ($.type(value) === STRING) && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value));
    }

    /*********************************************************************************
     * Widget
     *********************************************************************************/

    /**
     * Explorer widget
     * *class
     * @type {*}
     */
    var Explorer = Widget.extend({

        init: function(element, options) {
            var that = this;
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
            log('widget initialized');
            that._templates();
            that._layout();
            that._dataSource();
            //that.refresh();
        },

        /**
         * @property options
         */
        options: {
            name: 'Explorer',
            index: 0,
            id: null,
            autoBind: true,
            itemTemplate: '<li data-uid="#= uid #" tabindex="-1" unselectable="on" role="option" class="k-item kj-explorer-item"><span class="k-in"><img class="k-image kj-explorer-icon" alt="#= tool #" src="#= icon #">#= tool #</span></li>',
            iconPath: './styles/images/toolbox/',
            messages: {
                empty: 'No item to display'
            }
        },

        /**
         * @method setOptions
         * @param options
         */
        setOptions: function(options) {
            Widget.fn.setOptions.call(this, options);
            //TODO initialize properly from that.options.index and that.options.id
        },

        /**
         * @property events
         */
        events: [
            CHANGE,
            DATABINDING,
            DATABOUND
        ],

        /**
         * IMPORTANT: index is 0 based
         * @method index
         * @param value
         * @returns {*}
         */
        index: function(value) {
            var that = this, component;
            if(value !== undefined) {
                log('index set to ' + value);
                if ($.type(value) !== NUMBER) {
                    throw new TypeError();
                } else if (value < 0 || (value > 0 && value >= that.length())) {
                    throw new RangeError();
                } else {
                    component = that.dataSource.at(value);
                    that.selection(component);
                }
            } else {
                component = that.dataSource.getByUid(that._selectedUid);
                if (component instanceof kidoju.PageComponent) {
                    return that.dataSource.indexOf(component);
                } else {
                    return -1;
                }
            }
        },

        /**
         * @method id
         * @param value
         * @returns {*}
         */
        id: function (value) {
            var that = this, component;
            if (value !== undefined) {
                if (!isGuid(value)) {
                    throw new TypeError();
                }
                component = that.dataSource.get(value);
                that.selection(component);
            } else {
                component = that.dataSource.getByUid(that._selectedUid);
                if (component instanceof kidoju.PageComponent) {
                    return component[component.idField];
                } else {
                    return undefined;
                }
            }
        },

        /**
         * @method selection
         * @param value
         * @returns {*}
         */
        selection: function(value) {
            var that = this;
            if (value === null) {
                $.noop(); //TODO
            } else if (value !== undefined) {
                if (!(value instanceof kidoju.PageComponent)) {
                    throw new TypeError();
                }
                //This might be executed before the dataSource is actually read
                //In this case, we should store the value temporarily to only assign it in the refresh method
                if (!isGuid(that._selectedUid) && that.length() === 0) {
                    that._tmp = value;
                } else {
                    if (value.uid !== that._selectedUid) {
                        var index = that.dataSource.indexOf(value);
                        if (index >= 0) { //index === -1 if not found
                            that._selectedUid = value.uid;
                            var e = $.Event(CHANGE, {
                                index: index,
                                id: value[value.idField],
                                value: value
                            });
                            that.refresh(e);
                            that.trigger(CHANGE, e);
                        }
                    }
                }
            } else {
                return that.dataSource.getByUid(that._selectedUid);
                //This returns undefined if not found
            }
        },

        /**
         * @method total()
         * @returns {*}
         */
        length: function() {
            return (this.dataSource instanceof kidoju.PageComponentCollectionDataSource) ? this.dataSource.total() : 0;
        },

        /**
         * @method items
         * @returns {Function|children|t.children|HTMLElement[]|ct.children|node.children|*}
         */
        items: function() {
            return this.list[0].children;
        },

        /**
         * @method _templates
         * @private
         */
        _templates: function() {
            var that = this;
            that.itemTemplate = kendo.template(that.options.itemTemplate);
        },

        /**
         * Changes the dataSource
         * @method setDataSource
         * @param dataSource
         */
        setDataSource: function(dataSource) {
            // set the internal datasource equal to the one passed in by MVVM
            this.options.dataSource = dataSource;
            // rebuild the datasource if necessary, or just reassign
            this._dataSource();
        },

        /**
         * Binds the widget to the change event of the dataSource
         * See http://docs.telerik.com/kendo-ui/howto/create-custom-kendo-widget
         * @method _dataSource
         * @private
         */
        _dataSource: function() {
            var that = this;
            // if the DataSource is defined and the _refreshHandler is wired up, unbind because
            // we need to rebuild the DataSource

            //There is no reason why, in its current state, it would not work with any dataSource
            //if ( that.dataSource instanceof data.DataSource && that._refreshHandler ) {
            if ( that.dataSource instanceof kidoju.PageComponentCollectionDataSource && that._refreshHandler ) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }

            if (that.options.dataSource !== NULL) {  //use null to explicitely destroy the dataSource bindings
                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = kidoju.PageComponentCollectionDataSource.create(that.options.dataSource);

                that._refreshHandler = $.proxy(that.refresh, that);

                // bind to the change event to refresh the widget
                that.dataSource.bind(CHANGE, that._refreshHandler);

                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
            }
        },

        /**
         * Builds the widget layout
         * @private
         */
        _layout: function () {
            var that = this,
                explorer = that.element;
            that.list = explorer.find('ul.k-list');
            if (!that.list.length) {
                that.list = $('<ul tabindex="-1" unselectable="on" role="listbox" class="k-list k-reset" />').appendTo(explorer);
            }
            explorer
                .on(MOUSEENTER + NS + ' ' + MOUSELEAVE + NS, ALL_ITEMS_SELECTOR, that._toggleHover)
                //.on(FOCUS + NS + ' ' + BLUR + NS, ALL_ITEMS_SELECTOR, that._toggleFocus)
                .on(CLICK + NS , ALL_ITEMS_SELECTOR, $.proxy(that._click, that))
                .addClass(WIDGET_CLASS);

            kendo.notify(that);
        },

        /**
         * @method refresh
         * @param e
         */
        refresh: function(e) {
            var that = this,
                html = '';

            if (e && e.action === 'itemchange') {
                return; //we only update the explorer on loading, 'add' and 'remove' because the item's tool is not supposed to change
            }

            if (e === undefined || e.type !== CHANGE) {

                var data = [];
                if (e=== undefined && that.dataSource instanceof kidoju.PageComponentCollectionDataSource) {
                    data = that.dataSource.data();
                } else if (e && e.items instanceof kendo.data.ObservableArray) {
                    data = e.items;
                }

                if (e && e.action === undefined) {
                    that.trigger(DATABINDING);
                }

                for (var i = 0; i < data.length; i++) {
                    var tool = kidoju.tools[data[i].tool];
                    if (tool instanceof kidoju.Tool) {
                        html += that.itemTemplate({
                            uid: data[i].uid,
                            tool: data[i].tool, //also tool.id
                            icon: that.options.iconPath + tool.icon + '.svg'
                        });
                    }
                }

                //See selection method:
                //MVVM might bind selection before dataSource is read
                //So we wait here until dataSource is read to assign selection
                if(html.length > 0 && that._tmp instanceof kidoju.PageComponent) {
                    that.selection(that._tmp);
                    delete that._tmp;
                } else if (html.length === 0) {
                    html = that.options.messages.empty; //TODO: improve
                }

                that.list.html(html);

                if (e && e.action === undefined) {
                    that.trigger(DATABOUND);
                }
           }

            that.list.find(ALL_ITEMS_SELECTOR)
                .removeClass(SELECTED_CLASS)
                .removeProp(ARIA_SELECTED);
            that.list.find(kendo.format(ITEM_BYUID_SELECTOR, that._selectedUid))
                .addClass(SELECTED_CLASS)
                .prop(ARIA_SELECTED, true);
        },

        _toggleHover: function(e) {
            $(e.currentTarget).toggleClass(HOVER_CLASS, e.type === MOUSEENTER);
        },

        /*
        _toggleFocus: function(e) {
            $(e.currentTarget).toggleClass(FOCUSED_CLASS, e.type === FOCUS);
        },
        */

        /**
         * Click event handler
         * @param e
         * @private
         */
        _click: function(e) {
            var target = $(e.currentTarget);
            e.preventDefault();
            if (!target.is('.' + SELECTED_CLASS)) {
                var component = this.dataSource.getByUid(target.attr(kendo.attr('uid')));
                this.selection(component);
            }
        },

        /**
         * @method _clear
         * @private
         */
        _clear: function() {
            var that = this,
                explorer = that.element;
            //unbind kendo
            kendo.unbind(explorer);
            //unbind all other events
            explorer.find('*').off();
            explorer
                .off(NS)
                .empty()
                .removeClass(WIDGET_CLASS);
        },

        /**
         * Destroys the widget including all DOM modifications
         */
        destroy: function() {
            var that = this;
            Widget.fn.destroy.call(that);
            that._clear();
            that.setDataSource(NULL);
            kendo.destroy(that.element);
        }

    });

    kendo.ui.plugin(Explorer);

}(this, jQuery));

;
/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function(window, $, undefined) {

    'use strict';

    // shorten references to variables for uglification
    //var fn = Function,
    //    global = fn('return this')(),
    var kendo = window.kendo,
        data = kendo.data,
        Widget = kendo.ui.Widget,
        kidoju = window.kidoju,

        //Types
        NULL = null,
        NUMBER = 'number',
        STRING = 'string',
        EMPTY_GUID = '00000000-0000-0000-0000-000000000000',

        //Events
        CHANGE = 'change',
        CLICK = 'click',
        MOUSEENTER = 'mouseenter',
        MOUSELEAVE = 'mouseleave',
        NS = '.kendoNavigation',

        //Widget
        WIDGET_CLASS = 'k-widget k-group kj-navigation',
        HOVER_CLASS = 'k-state-hover',
        FOCUSED_CLASS = 'k-state-focused',
        SELECTED_CLASS = 'k-state-selected',
        ALL_WRAPPERS_SELECTOR = '.kj-navigation-page[data-uid]',
        WRAPPER_BYUID_SELECTOR = '.kj-navigation-page[data-uid="{0}"]',
        ARIA_SELECTED = 'aria-selected',
        SCROLLBAR_WIDTH = 20,

        DEBUG = false,
        MODULE = 'kidoju.widgets.navigation: ';

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function log(message) {
        if (DEBUG && window.console && $.isFunction(window.console.log)) {
            window.console.log(MODULE + message);
        }
    }

    function isGuid(value) {
        //http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
        return  ($.type(value) === STRING) && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value));
    }

    /*********************************************************************************
     * Widget
     *********************************************************************************/

    /**
     * Navigation widget
     * *class
     * @type {*}
     */
    var Navigation = Widget.extend({

        init: function(element, options) {
            var that = this;
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
            log('widget initialized');
            that._templates();
            that._layout();
            that._dataSource();
            //that.refresh();
        },

        options: {
            name: 'Navigation',
            autoBind: true,
            itemTemplate: '<div data-uid="#= uid #" class="kj-navigation-page" role="option" aria-selected="false"><div data-role="stage"></div></div>',
            addTemplate: '<div data-uid="#= uid #" class="kj-navigation-page" role="option" aria-selected="false"><div>#: text #</div></div>',
            pageWidth: 1024, //TODO: assuming page size here: where do we read it from?
            pageHeight: 768,
            selectionBorder: 10, //this is the padding of the page wrapper, which draws a border around it
            pageSpacing: 20, //pageSpacing - selectionBorder determines the margin
            messages: {
                newPage: 'New Page'
            }
        },

        /**
         * @method setOptions
         * @param options
         */
        //setOptions: function(options) {
        //    Widget.fn.setOptions.call(this, options);
        //    TODO: we need to read height and width both from styles and options and decide which wins
        //},

        /**
         * IMPORTANT: index is 0 based
         * @method index
         * @param value
         * @returns {*}
         */
        index: function(value) {
            var that = this, page;
            if(value !== undefined) {
                log('index set to ' + value);
                if ($.type(value) !== NUMBER) {
                    throw new TypeError();
                } else if (value < 0 || (value > 0 && value >= that.length())) {
                    throw new RangeError();
                } else {
                    page = that.dataSource.at(value);
                    that.selection(page);
                }
            } else {
                page = that.dataSource.getByUid(that._selectedUid);
                if (page instanceof kidoju.Page) {
                    return that.dataSource.indexOf(page);
                } else {
                    return -1;
                }
            }
        },

        /**
         * @method id
         * @param value
         * @returns {*}
         */
        id: function (value) {
            var that = this, page;
            if (value !== undefined) {
                if (!isGuid(value)) {
                    throw new TypeError();
                }
                page = that.dataSource.get(value);
                that.selection(page);
            } else {
                page = that.dataSource.getByUid(that._selectedUid);
                if (page instanceof kidoju.Page) {
                    return page[page.idField];
                } else {
                    return undefined;
                }
            }
        },

        /**
         * @method selection
         * @param value
         * @returns {*}
         */
        selection: function(value) {
            var that = this;
            if (value !== undefined) {
                if (!(value instanceof kidoju.Page)) {
                    throw new TypeError();
                }
                //This might be executed before the dataSource is actually read
                //In this case, we should store the value temporarily to only assign it in the refresh method
                if (!isGuid(that._selectedUid) && that.length() === 0) {
                    that._tmp = value;
                } else {
                    if (value.uid !== that._selectedUid) {
                        var index = that.dataSource.indexOf(value);
                        if (index >= 0) { //index === -1 if not found
                            that._selectedUid = value.uid;
                            var e = $.Event(CHANGE, {
                                index: index,
                                id: value[value.idField],
                                value: value
                            });
                            that.refresh(e);
                            that.trigger(CHANGE, e);
                        }
                    }
                }
            } else {
                return that.dataSource.getByUid(that._selectedUid);
                //This returns undefined if not found
            }
        },

        /**
         * @method total()
         * @returns {*}
         */
        length: function() {
            return (this.dataSource instanceof kidoju.PageCollectionDataSource) ? this.dataSource.total() : 0;
        },

        /**
         * Height of navigation
         * @param value
         * @returns {string}
         */
        height:  function (value) {
            var that = this;
            if (value) {
                if($.type(value) !== NUMBER) {
                    throw new TypeError();
                }
                if (value < 0) {
                    throw new RangeError();
                }
                if (value !== that.options.height) {
                    that.options.height = value;
                }
            }
            else {
                return that.options.height;
            }
        },

        /**
         * Width of navigation
         * @param value
         * @returns {string}
         */
        width:  function (value) {
            var that = this;
            if (value) {
                if($.type(value) !== NUMBER) {
                    throw new TypeError();
                }
                if (value < 0) {
                    throw new RangeError();
                }
                if(value !== that.options.width) {
                    that.options.width = value;
                }
            }
            else {
                return that.options.width;
            }
        },


        _templates: function() {
            this.itemTemplate = kendo.template(this.options.itemTemplate);
            this.addTemplate = kendo.template(this.options.addTemplate);
        },

        /**
         * Changes the dataSource
         * @method setDataSource
         * @param dataSource
         */
        setDataSource: function(dataSource) {
            // set the internal datasource equal to the one passed in by MVVM
            this.options.dataSource = dataSource;
            // rebuild the datasource if necessary, or just reassign
            this._dataSource();
        },

        /**
         * Binds the widget to the change event of the dataSource
         * See http://docs.telerik.com/kendo-ui/howto/create-custom-kendo-widget
         * @method _dataSource
         * @private
         */
        _dataSource: function() {
            var that = this;
            // if the DataSource is defined and the _refreshHandler is wired up, unbind because
            // we need to rebuild the DataSource

            //There is no reason why, in its current state, it would not work with any dataSource
            //if ( that.dataSource instanceof data.DataSource && that._refreshHandler ) {
            if ( that.dataSource instanceof kidoju.PageCollectionDataSource && that._refreshHandler ) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }

            if (that.options.dataSource !== NULL) {  //use null to explicitely destroy the dataSource bindings
                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = kidoju.PageCollectionDataSource.create(that.options.dataSource);

                that._refreshHandler = $.proxy(that.refresh, that);

                // bind to the change event to refresh the widget
                that.dataSource.bind(CHANGE, that._refreshHandler);

                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
            }
        },

        /**
         * Builds the widget layout
         * @private
         */
        _layout: function () {
            var that = this;
            that.element
                .addClass(WIDGET_CLASS)
                .attr('role', 'listbox')
                .on(CLICK + NS, ALL_WRAPPERS_SELECTOR, $.proxy(that._clickHandler, that))
                .on(MOUSEENTER + NS + ' ' + MOUSELEAVE + NS, ALL_WRAPPERS_SELECTOR, that._toggleHover); //$.proxy(that._toggleHover, that))
        },

        /**
         * Refreshes the widget when dataSource changes
         * @param e
         */
        refresh: function(e) {
            var that = this,
                navigation = that.element,
                scale = (navigation.width()  - SCROLLBAR_WIDTH - 2 * parseInt(that.options.pageSpacing)) / that.options.pageWidth;
            if (e=== undefined || e.action === undefined) {
                var data = [];
                if (e === undefined && that.dataSource instanceof kidoju.PageCollectionDataSource) {
                    data = that.dataSource.data(); //view();
                } else if (e.items) {
                    data = e.items;
                }
                for (var i = 0; i < data.length ; i++) {
                    if (data[i] instanceof kidoju.Page) {
                        if (navigation.find(kendo.format(WRAPPER_BYUID_SELECTOR, data[i].uid)).length) {
                            //TODO: refresh
                        } else {
                            $(that.itemTemplate({uid : data[i].uid}))
                                .css('box-sizing', 'border-box')
                                .css('position', 'relative')
                                .css('padding', parseInt(that.options.selectionBorder))
                                .css('margin', parseInt(that.options.pageSpacing) - parseInt(that.options.selectionBorder))
                                .append('<div style="position:absolute; top: 10px; left: 10px; height: 20px; width: 20px; background-color: black;"></div>')
                                .appendTo(navigation)
                                .find(kendo.roleSelector('stage')).kendoStage({
                                    mode: kendo.ui.Stage.fn.modes.thumbnail,
                                    dataSource: data[i].components,
                                    //autoBind: false,
                                    //width: ???,
                                    //height: ???,
                                    scale: scale
                                });
                        }
                    }
                }
            }

            that.displaySelection();
            that.resize();

            /*
            if(e.action === 'add') {
                $.noop();
            } else if (e.action === 'remove') {
                $.noop();
            } else if (e.action === 'itemchange') {
                $.noop();
            }
            */
        },

        /**
         * Adds the k-state-selected class to the selected page determined by that._selectedUid
         * This actually adds a coloured border
         * @method displaySelection
         */
        displaySelection: function() {
            var that = this,
                navigation = that.element;

            navigation.find(ALL_WRAPPERS_SELECTOR)
                .removeClass(SELECTED_CLASS)
                .removeProp(ARIA_SELECTED);

            navigation.find(kendo.format(WRAPPER_BYUID_SELECTOR, that._selectedUid))
                .addClass(SELECTED_CLASS)
                .prop(ARIA_SELECTED, true);
        },

        /**
         * Resizes pages according to widget size
         * @method resize
         */
        resize: function() {
            var that = this,
                navigation = that.element,
                scale = (navigation.width() - 2 * parseInt(that.options.pageSpacing)) / that.options.pageWidth;

            if (scale < 0) {
                scale = 0;
            }

            //TODO: we are not clear with borders here
            //we actually need the widget's outerWidth and outerHeight
            //becaus a border might be added to pageWidth and pageHeight
            navigation.find(ALL_WRAPPERS_SELECTOR)
                .width(scale * parseInt(that.options.pageWidth))
                .height(scale * parseInt(that.options.pageHeight));

            var stages = navigation.find(kendo.roleSelector('stage'));
            for (var i = 0; i < stages.length; i++) {
                $(stages[i]).data('kendoStage').scale(scale);
            }
        },

        /**
         * Toggles the hover style when mousing over the page wrapper (page + selection border)
         * @method _toggleHover
         * @param e
         * @private
         */
        _toggleHover: function(e) {
            if (e instanceof $.Event) {
                var target = $(e.currentTarget);
                target.toggleClass('k-state-hover', e.type === MOUSEENTER);
            }
        },

        /**
         * Click event handler bond to page wrappers to select a page
         * @method _clickHandler
         * @param e
         * @private
         */
        _clickHandler: function(e) {
            if (e instanceof $.Event) {
                var that = this,
                    target = $(e.currentTarget),
                    navigation = target.closest(kendo.roleSelector('navigation'));
                e.preventDefault();
                if (!target.is('.' + SELECTED_CLASS)) {
                    var page = this.dataSource.getByUid(target.attr(kendo.attr('uid')));
                    this.selection(page);
                }
            }
        },

        /**
         * @method _clear
         * @private
         */
        _clear: function() {
            var that = this;
            //unbind kendo
            kendo.unbind(that.element);
            //unbind all other events
            that.element.find('*').off();
            that.element
                .off()
                .empty()
                .removeClass(WIDGET_CLASS);
        },

        /**
         * Destroys the widget including all DOM modifications
         */
        destroy: function() {
            var that = this;
            Widget.fn.destroy.call(that);
            that._clear();
            that.setDataSource(NULL);
            kendo.destroy(that.element);
        }

    });

    kendo.ui.plugin(Navigation);

}(this, jQuery));

;
/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function(window, $, undefined) {

    'use strict';

    // shorten references to variables for uglification
    //var fn = Function,
    //    global = fn('return this')(),
    var kendo = window.kendo,
        data = kendo.data,
        Widget = kendo.ui.Widget,
        kidoju = window.kidoju,

        //Types
        STRING = 'string',
        NUMBER = 'number',
        NULL = null,

        //Events
        CHANGE = 'change',
        CLICK = 'click',
        KEYDOWN = 'keydown',
        NS = '.kendoPlaybar',

        //Widget
        WIDGET_CLASS = 'k-widget kj-playbar',
        FIRST = '.k-i-seek-w',
        LAST = '.k-i-seek-e',
        PREV = '.k-i-arrow-w',
        NEXT = '.k-i-arrow-e',

        DEBUG = false,
        MODULE = 'kidoju.widgets.playbar: ';

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function log(message) {
        if (DEBUG && window.console && $.isFunction(window.console.log)) {
            window.console.log(MODULE + message);
        }
    }

    function isGuid(value) {
        //http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
        return  ($.type(value) === STRING) && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value));
    }

    function button(template, idx, text, numeric, title) {
        return template( {
            idx: idx,
            text: text,
            ns: kendo.ns,
            numeric: numeric,
            title: title || ''
        });
    }

    function icon(template, className, text, wrapClassName) {
        return template({
            className: className.substring(1),
            text: text,
            wrapClassName: wrapClassName || ''
        });
    }

    function update(element, selector, index, disabled) {
        element.find(selector)
            .parent()
            .attr(kendo.attr('index'), index)
            .attr('tabindex', -1)
            .toggleClass('k-state-disabled', disabled);
    }

    function first(element, index) {
        //update(element, FIRST, 1, index <= 1);
        update(element, FIRST, 0, index <= 0);
    }

    function prev(element, index) {
        //update(element, PREV, Math.max(1, index - 1), index <= 1);
        update(element, PREV, Math.max(0, index - 1), index <= 0);
    }

    function next(element, index, length) {
        //update(element, NEXT, Math.min(length, index + 1), index >= length);
        update(element, NEXT, Math.min(length - 1, index + 1), index >= length - 1);
    }

    function last(element, index, length) {
        //update(element, LAST, length, index >= length);
        update(element, LAST, length - 1, index >= length - 1);
    }

    /*********************************************************************************
     * Widget
     *********************************************************************************/

    /**
     * Toolbar widget
     * @class Playbar
     * @type {*}
     */
    var Playbar = Widget.extend({

        /**
         * Widget constructor
         * @method init
         * @param element
         * @param options
         */
        init: function(element, options) {
            var that = this;
            options = options || {};
            // base call to widget initialization
            Widget.fn.init.call(that, element, options);
            log('widget initialized');
            //TODO: review how index is set
            that._index = that.options.index || 0;
            that._templates();
            that._layout();
            that._dataSource();
            //that.refresh();
        },

        /**
         * @property options
         */
        options: {
            name: 'Playbar',
            iconTemplate: '<a href="\\#" title="#:text#" class="k-link k-pager-nav #= wrapClassName #"><span class="k-icon #= className #">#:text#</span></a>',
            selectTemplate: '<li><span class="k-state-selected">#: text #</span></li>',
            linkTemplate: '<li><a tabindex="-1" href="\\#" class="k-link" data-#=ns#index="#=idx#" #if (title !== "") {# title="#=title#" #}#>#:text#</a></li>',
            buttonCount: 10,
            autoBind: true,
            index: 0, //TODO: do we need id too?
            numeric: true,
            info: true,
            timer: true,
            input: false,
            previousNext: true,
            refresh: true,
            //value: NULL, //TODO: we do not seem to have a use for value
            dataSource: undefined, //Important undefined is required for _SetDataSource to initialize a dataSource
            messages: {
                empty: 'No page to display',
                page: 'Page',
                of: 'of {0}',
                first: 'Go to the first page',
                previous: 'Go to the previous page',
                next: 'Go to the next page',
                last: 'Go to the last page',
                refresh: 'Refresh',
                morePages: 'More pages'
            }
        },

        /**
         * @method setOptions
         * @param options
         */
        //setOptions: function(options) {
        //    Widget.fn.setOptions.call(this, options);
        //},

        /**
         * @property events
         */
        events: [
            CHANGE
        ],

        /**
         * IMPORTANT: index is 0 based, whereas playbar page numbers are 1 based
         * @method index
         * @param value
         * @returns {*}
         */
        index: function(value) {
            var that = this;
            if(value !== undefined) {
                log('index set to ' + value);
                if ($.type(value) !== NUMBER) {
                    throw new TypeError();
                } else if (value < 0 || (value > 0 && value >= that.length())) {
                    throw new RangeError();
                } else if (value !== that._index) {
                    that._index = value;
                    that.refresh(); //TODO review when MVVM
                    var page = that.dataSource.at(that._index);
                    that.trigger(CHANGE, {
                        index: value,
                        id: (page instanceof kidoju.Page) ? page[page.idField] : undefined,
                        value: page
                    });
                }
            } else {
                return that._index;
            }
        },

        /**
         * @method id
         * @param value
         * @returns {*}
         */
        id: function (value) {
            var that = this,
                page;
            if (value !== undefined) {
                if (!isGuid(value)) {
                    throw new TypeError();
                }
                page = that.dataSource.get(value);
                if (page !== undefined) {
                    var index = that.dataSource.indexOf(page);
                    if (index >= 0) { //index = -1 if not found
                        that.index(index);
                    }
                    //if page not found, we do nothing
                }
            } else {
                page = that.dataSource.at(that._index);
                if (page instanceof kidoju.Page) {
                    return page[page.idField];
                } else {
                    return undefined;
                }
            }
        },

        /**
         * @method value
         * @param value
         * @returns {*}
         */
            //TODO IMPORTANT: rename value into selection
            //value binding requires valueTextField
        value: function(value) {
            var that = this;
            if (value !== undefined) {
                var index = that.dataSource.indexOf(value);
                if (index >= 0) { //index = -1 if not found
                    that.index(index);
                }
                //if page not found, we do nothing
            } else {
                return that.dataSource.at(that._index);
                //This returns undefined if not found
            }
        },

        /**
         * @method total()
         * @returns {*}
         */
        length: function() {
            return (this.dataSource instanceof kidoju.PageCollectionDataSource) ? this.dataSource.total() : 0;
        },


        _templates: function() {
            var that = this;
            that.iconTemplate = kendo.template(that.options.iconTemplate);
            that.linkTemplate = kendo.template(that.options.linkTemplate);
            that.selectTemplate = kendo.template(that.options.selectTemplate);
        },

        /**
         * Changes the dataSource
         * @method setDataSource
         * @param dataSource
         */
        setDataSource: function(dataSource) {
            // set the internal datasource equal to the one passed in by MVVM
            this.options.dataSource = dataSource;
            // rebuild the datasource if necessary, or just reassign
            this._dataSource();
        },

        /**
         * Binds the widget to the change event of the dataSource
         * See http://docs.telerik.com/kendo-ui/howto/create-custom-kendo-widget
         * @method _dataSource
         * @private
         */
        _dataSource: function() {
            var that = this;
            // if the DataSource is defined and the _refreshHandler is wired up, unbind because
            // we need to rebuild the DataSource

            //There is no reason why, in its current state, it would not work with any dataSource
            //if ( that.dataSource instanceof data.DataSource && that._refreshHandler ) {
            if ( that.dataSource instanceof kidoju.PageCollectionDataSource && that._refreshHandler ) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }

            if (that.options.dataSource !== NULL) {  //use null to explicitely destroy the dataSource bindings
                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = kidoju.PageCollectionDataSource.create(that.options.dataSource);

                that._refreshHandler = $.proxy(that.refresh, that);

                // bind to the change event to refresh the widget
                that.dataSource.bind(CHANGE, that._refreshHandler);

                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
            }
        },

        /**
         * Builds the widget layout
         * @method _layout
         * @private
         */
        _layout: function () {
            /* TODO: Display vertical or horizontal
             * TODO: Add timer (play/pause)
             * TODO: Add progress bar
             * TODO: Add tooltips with thumbnails
             */
            var that = this,
                playbar = that.element,
                options = that.options,
                index = that.index(),
                length = that.length();

            if (options.previousNext) {
                if (!playbar.find(FIRST).length) {
                    playbar.append(icon(that.iconTemplate, FIRST, options.messages.first, 'k-pager-first'));
                    first(playbar, index, length);
                }
                if (!playbar.find(PREV).length) {
                    playbar.append(icon(that.iconTemplate, PREV, options.messages.previous));
                    prev(playbar, index, length);
                }
            }

            if (options.numeric) {
                that.list = playbar.find('.k-pager-numbers');
                if (!that.list.length) {
                    that.list = $('<ul class="k-pager-numbers k-reset" />').appendTo(playbar);
                }
            }

            if (options.input) {
                if (!playbar.find('.k-pager-input').length) {
                    playbar.append('<span class="k-pager-input k-label">'+
                        options.messages.page +
                        '<input class="k-textbox">' +
                        kendo.format(options.messages.of, length) +
                        '</span>');
                }
                playbar.on(KEYDOWN + NS, '.k-pager-input input', $.proxy(that._keydown, that));
            }

            if (options.previousNext) {
                if (!playbar.find(NEXT).length) {
                    playbar.append(icon(that.iconTemplate, NEXT, options.messages.next));
                    next(playbar, index, length);
                }
                if (!playbar.find(LAST).length) {
                    playbar.append(icon(that.iconTemplate, LAST, options.messages.last, 'k-pager-last'));
                    last(playbar, index, length);
                }
            }

            if (options.refresh) {
                if (!playbar.find('.k-pager-refresh').length) {
                    playbar.append('<a href="#" class="k-pager-refresh k-link" title="' + options.messages.refresh +
                        '"><span class="k-icon k-i-refresh">' + options.messages.refresh + '</span></a>');
                }
                playbar.on(CLICK + NS, '.k-pager-refresh', $.proxy(that._refreshClick, that));
            }

            if (options.info) {
                if (!playbar.find('.k-pager-info').length) {
                    playbar.append('<span class="k-pager-info k-label" />');
                }
            }

            //TODO Add timer

            playbar
                .on(CLICK + NS , 'a', $.proxy(that._indexClick, that))
                .addClass(WIDGET_CLASS + ' k-pager-wrap k-widget');

            //if (options.autoBind) {
            //    that.refresh();
            //}

            kendo.notify(that);
        },

        /**
         * Refreshed teh widget when dataSource changes
         * @method refresh
         * @param e
         */
        refresh: function(e) {
            var that = this,
                playbar = that.element,
                options = that.options,
                index = that.index(),
                length = that.length(),
                idx, start = 0, end,
                html = '', position;

            if (e && e.action === 'itemchange') {
                return; //we only update the playbar on loading, 'add' and 'remove'
            }

            if (options.numeric) {
                //start is the index of the first numeric button
                //end is the index of the last numeric button
                if (index > options.buttonCount - 1) {
                    start = index - index % options.buttonCount;
                }
                end = Math.min(start + options.buttonCount - 1, length - 1);
                if (start > 0) {
                    html += button(that.linkTemplate, start - 1, '...', false, options.messages.morePages);
                }
                for (idx = start; idx <= end; idx++) {
                    html += button(idx === index ? that.selectTemplate : that.linkTemplate, idx, idx + 1, true);
                }
                if (end < length - 1) { //idx = end + 1 here
                    html += button(that.linkTemplate, idx, '...', false, options.messages.morePages);
                }
                if (html === '') {
                    html = that.selectTemplate({ text: 0 });
                }
                that.list.html(html);
            }

            if (options.info) {
                //TODO: we could consider a progress bar?
                if (length > 0) {
                    html = options.messages.page +
                        ' ' + (index + 1) + ' ' +
                        kendo.format(options.messages.of, length);
                } else {
                    html = options.messages.empty;
                }
                that.element.find('.k-pager-info').html(html);
            }

            if (options.input) {
                that.element.find('.k-pager-input')
                    .html(options.messages.page +
                        '<input class="k-textbox">' +
                        kendo.format(options.messages.of, length))
                    .find('input')
                        .val(index + 1)
                        .attr('disabled', length < 1)
                        .toggleClass('k-state-disabled', length < 1);
            }

            if (options.previousNext) {
                first(that.element, index, length);
                prev(that.element, index, length);
                next(that.element, index, length);
                last(that.element, index, length);
            }
        },

        _keydown: function(e) {
            if (e.keyCode === kendo.keys.ENTER) {
                var input = this.element.find('.k-pager-input').find('input'),
                    pageNum = parseInt(input.val(), 10);
                if (isNaN(pageNum) || pageNum < 1 || pageNum > this.length()) {
                    pageNum = this.index() + 1;
                }
                input.val(pageNum);
                this.index(pageNum - 1);
            }
        },

        /**
         * @method _refreshClick
         * @param e
         * @private
         */
        _refreshClick: function(e) {
            e.preventDefault();
            this.dataSource.read();
        },

        /**
         * @method _indexClick
         * @param e
         * @private
         */
        _indexClick: function(e) {
            var target = $(e.currentTarget);
            e.preventDefault();
            //TODO: would it be more reliable to use the id instead of index (requires an update of templates)
            if (!target.is('.k-state-disabled')) {
                this.index(parseInt(target.attr(kendo.attr('index')), 10));
            }
        },

        /**
         * @method _clear
         * @private
         */
        _clear: function() {
            var that = this;
            //unbind kendo
            //kendo.unbind($(that.element));
            //unbind all other events
            $(that.element).find('*').off();
            $(that.element)
                .off()
                .empty()
                .removeClass(WIDGET_CLASS);
        },

        /**
         * Destroys the widget including all DOM modifications
         */
        destroy: function() {
            var that = this;
            Widget.fn.destroy.call(that);
            that._clear();
            that.setDataSource(NULL);
            kendo.destroy(that.element);
        }

    });

    kendo.ui.plugin(Playbar);

}(this, jQuery));

;
/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function(window, $, undefined) {

    'use strict';

    // shorten references to variables for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        kidoju = window.kidoju = window.kidoju || {},

        //Types
        OBJECT = 'object',
        STRING = 'string',
        NUMBER = 'number',
        BOOLEAN = 'boolean',
        DATE = 'date',
        NULL = null,

        //Regex
        RX_PRIVATE = /^_/,

        //Html
        TBODY = 'tbody',
        TCELL = 'td[role="gridcell"]',

        //Misc.
        UID = 'uid',
        DIRTY = 'dirty',

        //Debug
        DEBUG = false,
        MODULE = 'kidoju.widgets.propertygrid: ';

    /*********************************************************************************
     * Widget
     *********************************************************************************/

    /**
     * PropertyGrid widget
     * @class PropertyGrid
     * @extend Widget
     */
    var PropertyGrid = Widget.extend({

        /**
         * Initializes the widget
         * @method init
         * @param element
         * @param options
         */
        init: function(element, options) {
            var that = this;

            // base call to widget initialization
            Widget.fn.init.call(this, element, options);

            //Add property grid frame
            that.wrapper = that.element;
            that._layout();

            //Refresh if we have an object to display
            if ($.type(that.options.value) === OBJECT) {
                that.refresh();
            }
        },

        /**
         * Widget options
         * @property options
         */
        options: {
            name: 'PropertyGrid',
            value: NULL,
            rows: NULL,
            templates: {
                row: '<tr role="row"><td role="gridcell">#: title #</td><td role="gridcell"></td></tr>',
                altRow: '<tr class="k-alt" role="row"><td role="gridcell">#: title #</td><td role="gridcell"></td></tr>'
            },
            messages: {
                property: 'Property',
                value: 'Value'
            }
        },

        /**
         * Value is the object whose properties are displayed in the property grid
         * @param object
         * @returns {*}
         */
        value: function (object) {
            var that = this;
            if (object === null) {
                if (!$.isEmptyObject(that.options.value)) {
                    that.options.value = {};
                    that.refresh();
                }
            } else if (object !== undefined) {
                if($.type(object) !== OBJECT) {
                    throw new TypeError('Properties should be an object');
                }
                if (object !== that.options.value) {
                    that.options.value = object;
                    that.refresh();
                }
            } else {
                return that.options.value;
            }
        },

        /**
         * Rows setter/getter
         * @param array
         * @returns {*}
         */
        rows: function (array) {
            var that = this;
            if (array !== undefined) {
                if(!$.isArray(array)) {
                    throw new TypeError('Rows should be an object');
                }
                if (array !== that.options.rows) {
                    that.options.rows = array;
                    that.refresh();
                }
            } else {
                return that.options.rows;
            }
        },


        /**
         * Builds the widget layout
         * @method _layout
         * @private
         */
        _layout: function () {
            var that = this;
            that.element
                .addClass('k-grid k-widget')  //the kendo.ui.Grid has style="height:..."
                //add column headers (matches markup generated by kendo.ui.Grid)
                .append(
                    '<div class="k-grid-header" style="padding-right: 17px;">' +
                        '<div class="k-grid-header-wrap">' +
                            '<table role="grid">' +
                                '<colgroup><col><col></colgroup>' +
                                '<thead role="rowgroup"><tr role="row">' +
                                    '<th role="columnheader" class="k-header">' + that.options.messages.property + '</th>' +
                                    '<th role="columnheader" class="k-header">' + that.options.messages.value + '</th>' +
                                '</tr></thead>' +
                            '</table>' +
                        '</div>' +
                    '</div>'
                )
                //Add property grid content (matches markup generated by kendo.ui.Grid)
                .append(
                    '<div class="k-grid-content">' + //the kendo.ui.Grid has style="height:..."
                        '<table role="grid" style="height: auto;">' +
                            '<colgroup><col><col></colgroup>' +
                            '<tbody role="rowgroup">' +
                            //------------------------------ This is where rows are added
                            '</tbody>' +
                        '</table>' +
                    '</div>'
                );
        },


        /**
         * Refresh rows
         * @method refresh
         */
        refresh: function() {

            var that = this,
                properties = that.options.value,
                tbody = $(that.element).find(TBODY).first();

            kendo.unbind(tbody);
            kendo.destroy(tbody);
            tbody.find('*').off();
            tbody.empty();

            if($.type(properties) !== OBJECT) {
                return;
            }

            var rowTemplate = kendo.template(that.options.templates.row),
                altRowTemplate = kendo.template(that.options.templates.altRow),
                rows = that._buildRows(),
                discarded = 0;

            for (var idx = 0; idx < rows.length; idx++) {
                var row = rows[idx];
                if (row) {
                    var template = ((idx - discarded) % 2 === 1) ? altRowTemplate : rowTemplate;

                    //Append the HTML table cells with the title in the left cell
                    tbody.append(template({title: row.title}));

                    //Add the editor to the right cell
                    var container = tbody.find(TCELL).last(),
                        options = $.extend({}, row, {model: properties});
                    row.editor(container, options);

                } else {
                    discarded++;
                }
            }

            kendo.bind(tbody, properties, kendo.ui, kendo.mobile.ui);

        },

        /**
         * Build rows
         * @returns {Array}
         * @private
         */
        _buildRows: function (){
            var that = this,
                rows = [],
                hasRows = $.isArray(that.options.rows); //&& that.options.rows.length > 0;

            // that.options.rows gives:
            // - field (name) - http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns.field
            // - title        - http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns.title
            // - format       - http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns.format
            // - template     - http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns.template
            // - editor       - http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns.editor
            // - values?????  - http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns.values
            // - encoded????  - http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns.encoded
            // - attributes   - http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns.attributes

            //that.options.fields gives: - http://docs.telerik.com/kendo-ui/api/javascript/data/model#methods-Model.define
            // - type
            // - editable
            // - nullable
            // - defaultValue - see that.options.value.defaults
            // - validation

            // that.options.value gives
            // - type
            // - value (for data-binding)

            function buildRows(properties, hashedOptionRows, path) {

                var fields = properties.fields,
                    defaults = properties.defaults;

                for (var prop in properties) {

                    //Select only public properties that are not functions (discards _events)
                    if(properties.hasOwnProperty(prop) && !RX_PRIVATE.test(prop) && !$.isFunction(properties[prop]) &&
                            //if rows are desinated in this.options.rows, only select these rows
                        (!hasRows || hashedOptionRows.hasOwnProperty(prop))) {

                        if ($.type(properties[prop]) === OBJECT) {

                            buildRows(properties[prop], hashedOptionRows[prop] || {}, path.length === 0 ? prop : path + '.' + prop);

                        } else {

                            var row = {
                                attributes: hasRows && hashedOptionRows[prop] && hashedOptionRows[prop].attributes ? hashedOptionRows[prop].attributes : undefined,
                                //defaultValue
                                editable: fields && fields[prop] && (fields[prop].editable === false) ? false : true,
                                editor: hasRows && hashedOptionRows[prop] && hashedOptionRows[prop].editor ? hashedOptionRows[prop].editor : undefined,
                                field: path.length === 0 ? prop : path + '.' + prop,
                                format: hasRows && hashedOptionRows[prop] && hashedOptionRows[prop].format ? hashedOptionRows[prop].format : undefined,
                                //nullable
                                template: hasRows && hashedOptionRows[prop] && hashedOptionRows[prop].template ? hashedOptionRows[prop].template : undefined,
                                title: hasRows && hashedOptionRows[prop] && hashedOptionRows[prop].title ? hashedOptionRows[prop].title : util.formatTitle(prop),
                                type: util.getType(fields && fields[prop], defaults && defaults[prop], properties[prop])
                                //validation
                            };

                            util.optimizeEditor(row);

                            if (row.type) {
                                if (hasRows) {
                                    //With this.options.rows, only designated properties are displayed
                                    rows[hashedOptionRows[prop]._index] = row;
                                } else {
                                    //Without this.options.rows, all public properties are displayed
                                    rows.push(row);
                                }
                            }
                        }
                    }
                }
            }

            buildRows(that.options.value, util.hash(that.options.rows), '');
            return rows;
        },


        /**
         * Clears the DOM from modifications made by the widget
         * @method _clear
         * @private
         */
        _clear: function() {
            var that = this;
            kendo.unbind(that.element);
            kendo.destroy(that.element);
            that.element.find('*').off();
            //clear element
            that.element
                .off()
                .empty()
                .removeClass('k-widget k-grid');
        },

        /**
         * Destroys the widget
         * @method destroy
         */
        destroy: function() {
            var that = this;
            that._clear();
            Widget.fn.destroy.call(this);
        }

    });

    ui.plugin(PropertyGrid);

    /*********************************************************************************
     * Editors
     * See http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns.editor
     *********************************************************************************/

    var editors = kidoju.editors = {

        span: function(container, options) {
            $('<span/>')
                .attr($.extend({}, options.attributes, {'data-bind': 'value: ' + options.field}))
                .appendTo(container);
        },

        textbox: function(container, options) {
            //You can add an atttribute type = text, email, url, ....
            $('<input type="text" class="k-textbox" style="width: 100%;"/>')
                .attr($.extend({}, options.attributes, {'data-bind': 'value: ' + options.field}))
                .appendTo(container);
        },

        textarea: function(container, options) {
            $('<textarea class="k-textbox" style="width: 100%; resize: vertical;"/>')
                .attr($.extend({}, options.attributes, {'data-bind': 'value: ' + options.field}))
                .appendTo(container);
        },

        _kendoInput: function(container, options) {
            $('<input style="width: 100%;"/>')
                .attr($.extend({}, options.attributes, {'data-bind': 'value: ' + options.field}))
                .appendTo(container);
        },

        _template: function(container, options) {
            var template = kendo.template(options.template);
            $(template(options))
                .appendTo(container);
            //TODO: test bindings....
        }

    };


    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    var util = {

        /**
         * Log function
         * @param message
         */
        log: function(message)
        {
            if (DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log(MODULE + message);
            }
        },

        /**
         * Return a hash object from an array of rows
         * @param rows
         * @returns {{}}
         */
        hash: function(rows) {
            var ret = {};
            if($.isArray(rows)) {
                $.each(rows, function (index, row) {
                    //check fields like attributes.src
                    var hierarchy = row.field.split('.'),
                        obj = ret;
                    for (var i = 0; i < hierarchy.length; i++) {
                        obj = obj[hierarchy[i]] = obj[hierarchy[i]] || {};
                    }
                    obj._index = index;
                    for (var prop in row) {
                        if (row.hasOwnProperty(prop)) {
                            obj[prop] = row[prop];
                        }
                    }
                });
            }
            return ret;
        },

        /**
         * Format a fieldName into a title
         * e.g. return `My Field Title` from `myFieldTitle`
         * @param fieldName
         * @returns {*}
         */
        formatTitle: function(fieldName) {
            //See http://stackoverflow.com/questions/6142922/replace-a-regex-capture-group-with-uppercase-in-javascript
            return kendo.toHyphens(fieldName).replace(/(^\w|-\w)/g, function (v) {
                return v.replace('-', ' ').toUpperCase();
            });
        },

        /**
         * Get the field type
         * @param field
         * @param defaultValue
         * @param value
         */
        getType: function(field, defaultValue, value) {
            var fieldTypes = ['string', 'number', 'boolean', 'date'],
                type;
            if (field && fieldTypes.indexOf(field.type) > -1) {
                return field.type;
            }
            if (defaultValue !== undefined && defaultValue !== null) {
                type = $.type(defaultValue);
                if (fieldTypes.indexOf(type) > -1) {
                    return type;
                } else {
                    return undefined;
                }
            }
            if (value !== undefined && value !== null) {
                type = $.type(value);
                if (fieldTypes.indexOf(type) > -1) {
                    return type;
                } else {
                    return undefined;
                }
            }
            // By default
            return STRING;
        },

        /**
         * Improve the editor set in row
         * @param row
         */
        optimizeEditor: function(row) {

            if (!row.editable) {
                row.editor = editors.span;
                return;
            }

            //INPUT_TYPES = 'color,date,datetime,datetime-local,email,month,number,range,search,tel,text,time,url,week',
            //We have left: button, checkbox, file, hidden, image, password, radio, reset, submit
            //SEE:http://www.w3schools.com/tags/att_input_type.asp

            //If row.editor is a function, there is nothing to optimize
            if ($.isFunction(row.editor)) {
                return;
            }

            //If row editor is a string
            if ($.type(row.editor) === STRING) {
                row.editor = row.editor.toLowerCase();

                //If it designates a public well-known editor
                if (row.editor.length && !RX_PRIVATE.test(row.editor) && $.isFunction(editors[row.editor])) {
                    row.editor = editors[row.editor];
                    return;
                }

                //If it designates a kendo UI widget that works with an input
                var widgets = ['colorpicker', 'datepicker', 'datetimepicker', 'maskedtextbox', 'multiinput', 'numerictextbox', 'rating', 'slider', 'switch', 'timepicker'];
                if ((widgets.indexOf(row.editor) > -1) &&
                    (kendo.rolesFromNamespaces(kendo.ui).hasOwnProperty(row.editor) || kendo.rolesFromNamespaces(kendo.mobile.ui).hasOwnProperty(row.editor))) {
                    row.attributes = $.extend({}, row.attributes, { 'data-role': row.editor });
                    row.editor = editors._kendoInput;
                    return;
                }
            }

            //At this stage, there should be no row editor
            row.editor = undefined;

            //If there is a template, use the corresponding editor
            if ($.type(row.template) === STRING && row.template.length) {
                row.editor = editors._template;
                return;
            }

            //Otherwise we can only rely on data type
            switch (row.type) {
                case NUMBER:
                    row.attributes = $.extend({}, row.attributes, { 'data-role': 'numerictextbox' });
                    row.editor = editors._kendoInput;
                    break;
                case BOOLEAN:
                    row.attributes = $.extend({}, row.attributes, { 'data-role': 'switch' });
                    row.editor = editors._kendoInput;
                    break;
                case DATE:
                    row.attributes = $.extend({}, row.attributes, { 'data-role': 'datepicker' });
                    row.editor = editors._kendoInput;
                    break;
                default: //STRING
                    row.editor = editors.textbox;
            }
        }
    };

})(this, jQuery);

;
/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

(function (window, $, undefined) {

    'use strict';

    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        kidoju = window.kidoju,

        //Types
        STRING = 'string',
        NUMBER = 'number',
        NULL = null,

        //Events
        NS = '.kendoStage',
        MOUSEDOWN = 'mousedown',
        MOUSEMOVE = 'mousemove',
        MOUSEUP = 'mouseup',//TODO: mouseout
        TOUCHSTART = 'touchstart',
        TOUCHMOVE = 'touchmove',
        TOUCHEND = 'touchend',
        CHANGE = 'change',
        DATABINDING = 'dataBinding',
        DATABOUND = 'dataBound',
        PROPBINDING = 'propertyBinding',
        PROPBOUND = 'propertyBound',
        SELECT = 'select',
        MOVE = 'move',
        RESIZE = 'resize',
        ROTATE = 'rotate', //This constant is not simply an event

        //CSS
        ABSOLUTE = 'absolute',
        RELATIVE = 'relative',
        HIDDEN = 'hidden',
        DISPLAY = 'display',
        BLOCK = 'block',
        NONE = 'none',
        TOP = 'top',
        LEFT = 'left',
        HEIGHT = 'height',
        WIDTH = 'width',
        CURSOR = 'cursor',
        TRANSFORM = 'transform',
        CSS_ROTATE = 'rotate({0}deg)',
        CSS_SCALE = 'scale({0})',

        //Elements
        WRAPPER = '<div class="k-widget kj-stage" />',
        //WRAPPER_CLASS = '.kj-stage',
        ELEMENT = '<div data-id="{0}" data-tool="{1}" class="kj-element"></div>',
        ELEMENT_SELECTOR = '.kj-element[data-id="{0}"]',
        ELEMENT_CLASS = '.kj-element',
        THUMBNAIL_OVERLAY = '<div class="kj-overlay"></div>',
        THUMBNAIL_OVERLAY_CLASS = '.kj-overlay',
        HANDLE_BOX = '<div class="kj-handle-box"></div>',
        HANDLE_BOX_SELECTOR = '.kj-handle-box[data-id="{0}"]',
        HANDLE_BOX_CLASS = '.kj-handle-box',
        HANDLE_MOVE = '<span class="kj-handle" data-command="move"></span>',
        HANDLE_RESIZE = '<span class="kj-handle" data-command="resize"></span>',
        HANDLE_ROTATE = '<span class="kj-handle" data-command="rotate"></span>',
        HANDLE_MENU = '<span class="kj-handle" data-command="menu"></span>',
        //HANDLE_SELECTOR = '.kj-handle[data-command="{0}"]',
        HANDLE_CLASS = '.kj-handle',
        DATA_ID = 'data-id',
        //DATA_TOOL = 'data-tool',
        DATA_COMMAND = 'data-command',
        STATE = 'state',
        COMMANDS = {
            MOVE: 'move',
            RESIZE: 'resize',
            ROTATE: 'rotate',
            MENU: 'menu'
        },

        //Logic
        POINTER = 'pointer',
        ACTIVE_TOOL = 'active',
        DEFAULTS = {
            MODE: 'thumbnail',
            SCALE: 1,
            WIDTH: 1024,
            HEIGHT: 768
        },

        //Debug
        DEBUG = false,
        DEBUG_MOUSE = '<div class="debug-mouse"></div>',
        DEBUG_MOUSE_CLASS = '.debug-mouse',
        DEBUG_BOUNDS = '<div class="debug-bounds"></div>',
        DEBUG_BOUNDS_CLASS = '.debug-bounds',
        DEBUG_CENTER = '<div class="debug-center"></div>',
        DEBUG_CENTER_CLASS = '.debug-center',
        MODULE = 'kidoju.widgets.stage: ';


    /*********************************************************************************
     * Widget
     *********************************************************************************/

    /**
     * @class Stage Widget (kendoStage)
     */
    var Stage = Widget.extend({

        /**
         * Initializes the widget
         * @param element
         * @param options
         */
        init: function (element, options) {

            /*
             var that = this,
             input = $(element);
             input.type = NUMBER;
             that.ns = ns;
             options = $.extend({}, {
             value: parseFloat(input.attr('value') || RATING_MIN),
             min: parseFloat(input.attr('min') || RATING_MIN),
             max: parseFloat(input.attr('max') || RATING_MAX),
             step: parseFloat(input.attr('step') || RATING_STEP),
             disabled: input.prop('disabled'),
             readonly: input.prop('readonly')
             }, options);
             Widget.fn.init.call(that, element, options);
             that._layout();
             that.refresh();
             kendo.notify(that);
            */

            var that = this;
            Widget.fn.init.call(that, element, options);
            util.log('widget initialized');
            that.setOptions(options);
            that._layout();
            that._dataSource();
        },

        /**
         * Widget modes
         */
        modes: {
            thumbnail: 'thumbnail',
            design: 'design',
            play: 'play'
        },

        /**
         * Widget events
         */
        events: [
            CHANGE,
            DATABINDING,
            DATABOUND,
            PROPBINDING,
            PROPBOUND,
            SELECT
        ],

        /**
         * Widget options
         */
        options: {
            name: 'Stage',
            autoBind: true,
            mode: DEFAULTS.MODE,
            scale: DEFAULTS.SCALE,
            height: DEFAULTS.HEIGHT,
            width: DEFAULTS.WIDTH,
            tools: kidoju.tools,
            dataSource: undefined
        },

        /**
         * @method setOptions
         * @param options
         */
        setOptions: function(options) {
            Widget.fn.setOptions.call(this, options);
            //TODO: we need to read scale, height and width both from styles and options and decide which wins
            this._mode = this.options.mode;
            this._scale = this.options.scale;
            this._height = this.options.height;
            this._width = this.options.width;
        },

        /**
         * Mode defines the operating mode of the Stage Widget
         * @param value
         * @return {*}
         */
        mode: function (value) {
            var that = this;
            if (value !== undefined) {
                if($.type(value) !== STRING) {
                    throw new TypeError();
                }
                if (!that.modes[value]) {
                    throw new RangeError();
                }
                if(value !== that._mode) {
                    that._mode = value;
                    that._initializeMode();
                    //TODO: trigger event?
                }
            }
            else {
                return that._mode;
            }
        },

        /**
         * Scale the widget
         * @param value
         * @return {*}
         */
        scale: function (value) {
            var that = this;
            if (value !== undefined) {
                if($.type(value) !== NUMBER) {
                    throw new TypeError();
                }
                if (value < 0) {
                    throw new RangeError();
                }
                if(value !== that._scale) { //TODO: that.options.scale
                    that._scale = value;
                    that.wrapper.css({
                        transformOrigin: '0 0',
                        transform: kendo.format(CSS_SCALE, that._scale)
                    });
                    that.wrapper.find(HANDLE_CLASS).css({
                        //transformOrigin: 'center center', //by default
                        transform: kendo.format(CSS_SCALE, 1/that._scale)
                    });
                }
            }
            else {
                return that._scale;
            }
        },

        /**
         * Height of stage
         * @param value
         * @returns {string}
         */
        height:  function (value) {
            var that = this;
            if (value) {
                if($.type(value) !== NUMBER) {
                    throw new TypeError();
                }
                if (value < 0) {
                    throw new RangeError();
                }
                if (value !== that.options.height) {
                    that.options.height = value;
                }
            }
            else {
                return that.options.height;
            }
        },

        /**
         * Width of stage
         * @param value
         * @returns {string}
         */
        width:  function (value) {
            var that = this;
            if (value) {
                if($.type(value) !== NUMBER) {
                    throw new TypeError();
                }
                if (value < 0) {
                    throw new RangeError();
                }
                if(value !== that.options.width) {
                    that.options.width = value;
                }
            }
            else {
                return that.options.width;
            }
        },

        /**
         * Properties
         * @param value
         * @returns {*}
         */
        properties:  function (value) {
            var that = this;
            if (value) {
                //if(!(value instanceof kendo.data.ObervableObject)) {
                //    throw new TypeError();
                //}
                if(value !== that._properties) {
                    that._properties = value;
                }
            }
            else {
                return that._properties;
            }
        },

        /**
         * Changes the dataSource
         * @method setDataSource
         * @param dataSource
         */
        setDataSource: function(dataSource) {
            // set the internal datasource equal to the one passed in by MVVM
            this.options.dataSource = dataSource;
            // rebuild the datasource if necessary, or just reassign
            this._dataSource();
        },

        /**
         * Binds the widget to the change event of the dataSource
         * See http://docs.telerik.com/kendo-ui/howto/create-custom-kendo-widget
         * @method _dataSource
         * @private
         */
        _dataSource: function() {
            var that = this;
            // if the DataSource is defined and the _refreshHandler is wired up, unbind because
            // we need to rebuild the DataSource

            //There is no reason why, in its current state, it would not work with any dataSource
            //if ( that.dataSource instanceof data.DataSource && that._refreshHandler ) {
            if ( that.dataSource instanceof kidoju.PageComponentCollectionDataSource && that._refreshHandler ) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }

            if (that.options.dataSource !== NULL) {  //use null to explicitely destroy the dataSource bindings
                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = kidoju.PageComponentCollectionDataSource.create(that.options.dataSource);

                that._refreshHandler = $.proxy(that.refresh, that);

                // bind to the change event to refresh the widget
                that.dataSource.bind(CHANGE, that._refreshHandler);

                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
            }
        },

        /**
         * Builds the widget layout
         * @private
         */
        _layout: function () {
            var that = this;

            that._clear();

            //Set that.stage from the div element that makes the widget
            that.stage = that.element
                .wrap(WRAPPER)
                .css({
                    position: RELATIVE,  //!important
                    overflow: HIDDEN,
                    height: that.height(),
                    width: that.width()
                });

            //We need that.wrapper for visible/invisible bindings
            that.wrapper = that.stage.parent()
                .css({
                    position: RELATIVE,  //!important
                    height: that.height(),
                    width: that.width(),
                    transformOrigin: '0 0', //'top left', //!important without such attribute, element top left calculations are wrong
                    transform: kendo.format(CSS_SCALE, that.scale())
                });

            //Initialize mode
            that._initializeMode();
        },

        /**
         * Initialize mode
         * @private
         */
        _initializeMode: function() {

            var that = this;

            //Clear mode
            that._clearMode();

            //Set mode
            switch(that.mode()) {
                case that.modes.thumbnail:
                    that._initializeThumbnailMode(); //default mode
                    break;
                case that.modes.design:
                    that._initializeDesignMode();
                    break;
                case that.modes.play:
                    that._initializePlayMode();
                    break;

            }
        },

        /**
         * Clear mode
         * @private
         */
        _clearMode: function() {
            var that = this;

            //Clear events
            that.wrapper.off(NS);
            that.stage.off(NS);

            //Clear DOM
            that.wrapper.find(HANDLE_BOX_CLASS).remove();
            that.wrapper.find(THUMBNAIL_OVERLAY_CLASS).remove();

            //Unbind
            if($.isFunction(that._propertyBinding)) {
                that.unbind(PROPBINDING, that._propertyBinding);
            }
            $.each(that.stage.find(ELEMENT_CLASS), function(index, stageElement) {
                kendo.unbind(stageElement);
            });
        },

        /**
         * Add delegated event handlers on stage elements
         * @private
         */
        _addElementEventHandlers: function() {

            var that = this;

            //Translation
            that.stage.on(MOVE + NS, ELEMENT_CLASS, function(e, item) {
                if (that.options.tools instanceof kendo.data.ObservableObject) {
                    var tool = that.options.tools[item.tool];
                    if (tool instanceof kidoju.Tool && $.isFunction(tool.onMove)) {
                        tool.onMove(e, item);
                    }
                }
            });

            //Resizing
            that.stage.on(RESIZE + NS, ELEMENT_CLASS, function(e, item) {
                if (that.options.tools instanceof kendo.data.ObservableObject) {
                    var tool = that.options.tools[item.tool];
                    if (tool instanceof kidoju.Tool && $.isFunction(tool.onResize)) {
                        tool.onResize(e, item);
                    }
                }
            });

            //Rotation
            that.stage.on(ROTATE + NS, ELEMENT_CLASS, function(e, item) {
                if (that.options.tools instanceof kendo.data.ObservableObject) {
                    var tool = that.options.tools[item.tool];
                    if (tool instanceof kidoju.Tool && $.isFunction(tool.onRotate)) {
                        tool.onRotate(e, item);
                    }
                }
            });
        },

        /**
         * Initialize thumbnail mode
         * @private
         */
        _initializeThumbnailMode: function() {

            var that = this;

            //Add overlay to disable all controls
            $(THUMBNAIL_OVERLAY)
                .css({
                    position: ABSOLUTE,
                    display: BLOCK,
                    top: 0,
                    left: 0,
                    height: that.height(),
                    width: that.width()
                    //backgroundColor: '#FF0000',
                    //opacity: 0.1
                })
                .appendTo(that.wrapper);

            //Add delegated element event handlers
            that._addElementEventHandlers();

        },

        /**
         * Initialize design mode
         * @private
         */
        _initializeDesignMode: function() {

            var that = this;

            //Add handles
            $(HANDLE_BOX)
                .css({
                    position: ABSOLUTE,
                    display: NONE
                })
                .append(HANDLE_MOVE)
                .append(HANDLE_RESIZE)
                .append(HANDLE_ROTATE)
                .append(HANDLE_MENU)
                .appendTo(that.wrapper);

            //Add stage event handlers
            that.wrapper.on(MOUSEDOWN + NS + ' ' + TOUCHSTART + NS, $.proxy(that._onMouseDown, that));
            that.wrapper.on(MOUSEMOVE + NS + ' ' + TOUCHMOVE + NS, $.proxy(that._onMouseMove, that));
            that.wrapper.on(MOUSEUP + NS + ' ' + TOUCHEND + NS, $.proxy(that._onMouseUp, that));

            //Add delegated element event handlers
            that._addElementEventHandlers();

            //Add debug visual elements
            util.addDebugVisualElements(that.wrapper);

            //Add context menu - See http://docs.telerik.com/kendo-ui/api/javascript/ui/contextmenu
            that.menu = $('<ul class="kj-stage-menu"></ul>')
                .append('<li data-command="lock">Lock</li>') //TODO Use constants + localize in messages
                .append('<li data-command="delete">Delete</li>')//TODO: Bring forward, Push backward, Edit, etc.....
                .appendTo(that.wrapper)
                .kendoContextMenu({
                    target: '.kj-handle[data-command="menu"]',
                    showOn: MOUSEDOWN + ' ' + TOUCHSTART,
                    select: $.proxy(that._contextMenuSelectHandler, that)
                })
                .data('kendoContextMenu');

            $.noop();
        },

        /**
         * Event handler for selecting an item in the context menu
         * @param e
         * @private
         */
        _contextMenuSelectHandler: function(e) {
            //TODO: Consider an event dispatcher so that the same commands can be called from toolbar
            //Check when implementing fonts, colors, etc....
            var that = this;
            switch($(e.item).attr(DATA_COMMAND)) {
                case 'lock':
                    break;
                case 'delete':
                    var id = that.wrapper.find(HANDLE_BOX_CLASS).attr(DATA_ID),
                        item = that.dataSource.get(id);
                    that.dataSource.remove(item);
                    //This should raise teh change event on the dataSource and call the refresh method of the widget
                    break;
            }
        },

        /**
         * Initialize assess mode
         * @private
         */
        _initializePlayMode: function() {

            var that = this;

            //Add delegated element event handlers
            that._addElementEventHandlers();

            //Bind properties
            if($.isFunction(that._propertyBinding)) {
                that.unbind(PROPBINDING, that._propertyBinding);
            }
            that._propertyBinding = $.proxy(function() {
                var widget = this;
                if (widget.properties() instanceof kendo.data.ObservableObject) {
                    $.each(widget.stage.find(ELEMENT_CLASS), function(index, stageElement) {
                        //kendo.unbind(stageElement); //kendo.bind does unbind
                        kendo.bind(stageElement, widget.properties());
                    });
                }
            }, that);
            that.bind(PROPBINDING, that._propertyBinding);

        },

        /**
         * Add an element to the stage either on a click or from persistence
         * @param item
         * @param mouseX
         * @param mouseY
         * @private
         */
        _addStageElement: function(item, mouseX, mouseY) {
            var that = this;

            //Check we have an item which is not already on stage
            if (item instanceof kidoju.PageComponent && that.stage.find(kendo.format(ELEMENT_SELECTOR, item.id)).length === 0) {

                //When adding a new item on the stage, position it at mouse click coordinates
                if ($.type(mouseX) === NUMBER && $.type(mouseY) === NUMBER) {
                    item.set(LEFT, mouseX);
                    item.set(TOP, mouseY);
                }

                var tool = that.options.tools[item.tool];
                if (tool instanceof kidoju.Tool) {

                    var stageElement = $(kendo.format(ELEMENT, item.id, item.tool))
                        .css({
                            position: ABSOLUTE,
                            top: item.get(TOP),
                            left: item.get(LEFT),
                            height: item.get(HEIGHT),
                            width: item.get(WIDTH),
                            //transformOrigin: 'center center', //by default
                            transform: kendo.format(CSS_ROTATE, item.get(ROTATE))
                        });

                    stageElement.append(tool.getHtml(item));
                    that.stage.append(stageElement);

                    //trigger events to transform the stageElement (most often resize)
                    stageElement.trigger(MOVE + NS, item);
                    stageElement.trigger(RESIZE + NS, item);
                    stageElement.trigger(ROTATE + NS, item);
                }
            }

        },

        /**
         * Remove an element from the stage
         * @param id
         * @private
         */
        _removeStageElement: function(id) {

            //TODO use a tool method to avoid leaks (remove all event handlers, ...)

            //Find and remove stage element
            var stageElement = this.stage.find(kendo.format(ELEMENT_SELECTOR, id));
            kendo.unbind(stageElement);
            stageElement.off(NS).remove();
        },

        /**
         * Show handles on a stage element
         * @method _showHandles
         * @param id
         * @private
         */
        _showHandles: function(id){
            var that = this,
                handleBox = that.wrapper.find(HANDLE_BOX_CLASS);
            if (handleBox.length) {

                //Position handleBox on top of stageElement (same location, same size, same rotation)
                var stageElement = that.stage.find(kendo.format(ELEMENT_SELECTOR, id));
                handleBox
                    .css({
                        top: stageElement.css(TOP),
                        left: stageElement.css(LEFT),
                        height: stageElement.css(HEIGHT),
                        width: stageElement.css(WIDTH),
                        //transformOrigin: 'center center', //by default
                        transform: stageElement.css(TRANSFORM), //This might return a matrix
                        display: BLOCK
                    })
                    .attr(DATA_ID, id); //This is how we know which stageElement to transform when dragging handles

                //Scale and rotate handles
                handleBox.find(HANDLE_CLASS)
                    .css({
                        //transformOrigin: 'center center', //by default
                        transform: kendo.format(CSS_ROTATE, -util.getTransformRotation(stageElement)) + ' ' + kendo.format(CSS_SCALE, 1/that.scale())
                    });
            }
        },

        /**
         * Hide handles
         * @method _hideHandles
         * @private
         */
        _hideHandles: function(){
            this.wrapper.find(HANDLE_BOX_CLASS)
                .css({display: NONE})
                .removeAttr(DATA_ID);
        },

        /**
         * Start dragging an element
         * @param e
         * @private
         */
        // This function's cyclomatic complexity is too high.
        /* jshint -W074 */
        _onMouseDown: function(e) {

            //TODO: also drag with keyboard arrows

            var that = this,
                activeId = that.options.tools.get(ACTIVE_TOOL),
                target = $(e.target),
                mouse = util.getMousePosition(e),
                stageElement = target.closest(ELEMENT_CLASS),
                handle = target.closest(HANDLE_CLASS);

            //When clicking the stage with an active tool
            if (activeId !== POINTER) {
                //TODO: show optional creation dialog and test OK/Cancel
                var tool = that.options.tools[activeId];
                if(tool instanceof kidoju.Tool) {
                    var item = new kidoju.PageComponent({
                        id: kendo.guid(),
                        tool: tool.id,
                        //e.offsetX and e.offsetY do not work in Firefox
                        left: mouse.x,
                        top: mouse.y,
                        width: tool.width,
                        height: tool.height
                        //rotate: tool.rotate?
                    });
                    that.dataSource.add(item);
                    //Add triggers the change event on the dataSource which calls the refresh method
                }
                that.options.tools.set(ACTIVE_TOOL, POINTER);

            //When hitting a handle with the pointer tool
            } else if (handle.length) {
                var command = handle.attr(DATA_COMMAND);
                if (command === COMMANDS.MENU) {
                    $.noop(); //TODO: contextual menu here
                } else {
                    var handleBox = that.wrapper.find(HANDLE_BOX_CLASS),
                        id = handleBox.attr(DATA_ID); //the id of the stageElement which is being selected before hitting the handle
                    stageElement = that.stage.find(kendo.format(ELEMENT_SELECTOR, id));
                    handleBox.data(STATE, {
                        command: command,
                        top: parseFloat(stageElement.css(TOP)) || 0, //stageElement.position().top does not work when scaled
                        left: parseFloat(stageElement.css(LEFT)) || 0, //stageElement.position().left does not work when scaled
                        height: stageElement.height(),
                        width: stageElement.width(),
                        angle: util.getTransformRotation(stageElement),
                        scale: util.getTransformScale(that.wrapper),
                        snapGrid: 0, //TODO
                        snapAngle: 0, //TODO
                        mouseX: mouse.x,
                        mouseY: mouse.y,
                        id: id
                    });

                    //log(handleBox.data(STATE));
                    $(document.body).css(CURSOR, target.css(CURSOR));
                }

            //When hitting a stage element or the handle box with the pointer tool
            } else if (stageElement.length || target.is(HANDLE_BOX_CLASS)) {
                that.select(stageElement.attr(DATA_ID));

            //When hitting anything else with the pointer tool
            } else {
                that.select(null);
            }

            e.preventDefault(); //otherwise both touchstart and mousedown are triggered and code is executed twice
            e.stopPropagation();
        },
        /* jshint +W074 */

        /**
         * While dragging an element on stage
         * @param e
         * @private
         */
        _onMouseMove: function(e) {

            var that = this,
                handleBox = that.wrapper.find(HANDLE_BOX_CLASS),
                startState = handleBox.data(STATE);

            //With a startState, we are dragging a handle
            if ($.isPlainObject(startState)) {

                var mouse = util.getMousePosition(e),
                    stageElement = that.stage.find(kendo.format(ELEMENT_SELECTOR, startState.id)),
                    item = that.options.dataSource.get(startState.id),
                    rect = stageElement[0].getBoundingClientRect(),
                    bounds = {
                        //TODO these calculations depend on the transformOrigin attribute of that.wrapper - ideally we should introduce transformOrigin in the calculation
                        left: rect.left - that.stage.offset().left + $(document.body).scrollLeft(),
                        top: rect.top - that.stage.offset().top + $(document.body).scrollTop(),
                        height: rect.height,
                        width: rect.width
                    },
                    center = {
                        x: bounds.left + bounds.width / 2,
                        y: bounds.top + bounds.height / 2
                    };

                util.updateDebugVisualElements({
                    wrapper: that.wrapper,
                    mouse: mouse,
                    center: center,
                    bounds: bounds,
                    scale: startState.scale
                });

                if (startState.command === COMMANDS.MOVE) {
                    item.set(LEFT, util.snap(startState.left + (mouse.x - startState.mouseX)/startState.scale, startState.snapGrid));
                    item.set(TOP, util.snap(startState.top + (mouse.y - startState.mouseY)/startState.scale, startState.snapGrid));
                    //Set triggers the change event on the dataSource which calls the refresh method to update the stage

                } else if (startState.command === COMMANDS.RESIZE) {
                    //See https://github.com/Memba/Kidoju-Widgets/blob/master/test/samples/move-resize-rotate.md
                    var dx = (mouse.x - startState.mouseX)/startState.scale, //horizontal distance from S to S'
                        dy = (mouse.y - startState.mouseY)/startState.scale, //vertical distance from S to S'
                        centerAfterMove = { //Also C'
                            x: center.x + dx/ 2,
                            y: center.y + dy/ 2
                        },
                        topLeft = { //Also T
                            x: startState.left,
                            y: startState.top
                        },
                        alpha = util.deg2rad(startState.angle),
                        mmprime = util.getRotatedPoint(topLeft, center, alpha), //Also M=M'
                        topLeftAfterMove = util.getRotatedPoint(mmprime, centerAfterMove, -alpha); //Also T'

                    //TODO these calculations depend on the transformOrigin attribute of that.wrapper - ideally we should introduce transformOrigin in the calculation
                    item.set(LEFT, topLeftAfterMove.x);
                    item.set(TOP, topLeftAfterMove.y);
                    item.set(HEIGHT, util.snap(startState.height - dx * Math.sin(alpha) + dy * Math.cos(alpha), startState.snapGrid));
                    item.set(WIDTH, util.snap(startState.width + dx * Math.cos(alpha) + dy * Math.sin(alpha), startState.snapGrid));
                    //Set triggers the change event on the dataSource which calls the refresh method to update the stage

                } else if (startState.command === COMMANDS.ROTATE) {
                    var rad = util.getRadiansBetween2Points(center, {x: startState.mouseX, y: startState.mouseY}, mouse),
                        deg = util.snap((360 + startState.angle + util.rad2deg(rad)) % 360, startState.snapAngle);
                    item.set(ROTATE, deg);
                    //Set triggers the change event on the dataSource which calls the refresh method to update the stage
                }

                e.preventDefault();
                e.stopPropagation();
            }
        },

        /**
         * At the end of dragging an element on stage
         * @param e
         * @private
         */
        _onMouseUp: function(e) {

            var that = this,
                handleBox = that.wrapper.find(HANDLE_BOX_CLASS),
                startState = handleBox.data(STATE);

            if ($.isPlainObject(startState)) {

                //Remove drag start state
                handleBox.removeData(STATE);

                //Reset cursor
                $(document.body).css(CURSOR, '');

                //Hide debug visual elements
                util.hideDebugVisualElements(that.wrapper);

            }
        },

        /**
         * Refresh a stage widget
         * @param e
         */
        // This function's cyclomatic complexity is too high.
        /* jshint -W074 */
        refresh: function(e) {
            var that = this;
            if (e === undefined || e.action === undefined) {
                var components = [];
                if (e=== undefined && that.dataSource instanceof kendo.data.PageComponentCollectionDataSource) {
                    components = that.dataSource.data();
                } else if (e && e.items instanceof kendo.data.ObservableArray) {
                    components = e.items;
                }
                that._hideHandles();
                that.trigger(DATABINDING);
                $.each(that.stage.find(ELEMENT_CLASS), function(index, stageElement) {
                    that._removeStageElement($(stageElement).attr(DATA_ID));
                });
                $.each(components, function(index, component) {
                    that._addStageElement(component);
                });

                //If the following line triggers `Uncaught TypeError: Cannot read property 'length' of null` in the console
                //This is probably because binding on properties has not been properly set - check html
                //as in <input type="text" style="width: 300px; height: 100px; font-size: 75px;" data-bind="value: ">
                that.trigger(DATABOUND);

                // We can only bind properties after all dataBound event handlers have executed
                // otherwise there is a mix of binding sources
                that.trigger(PROPBINDING); //This calls an event handler in _initializePlayMode
                that.trigger(PROPBOUND);

            } else if (e.action === 'add') {
                $.each(e.items, function(index, component) {
                    that._addStageElement(component);
                    that.trigger(CHANGE, {action: e.action, value: component});
                    that.select(component.id);
                });

            } else if (e.action === 'remove') {
                $.each(e.items, function(index, component) {
                    that._removeStageElement(component.id);
                    that.trigger(CHANGE, {action: e.action, value: component});
                    if (that.wrapper.find(HANDLE_BOX_CLASS).attr(DATA_ID) === component.id) {
                        that.select(null);
                    }
                });

            } else if (e.action === 'itemchange') {
                $.each(e.items, function(index, component) {
                    var stageElement = that.stage.find(kendo.format(ELEMENT_SELECTOR, component.id)),
                        handleBox = that.wrapper.find(kendo.format(HANDLE_BOX_SELECTOR, component.id));
                    if (stageElement.length) {
                        switch (e.field) {
                            case LEFT:
                                stageElement.css(LEFT, component.left);
                                handleBox.css(LEFT, component.left);
                                stageElement.trigger(MOVE + NS, component);
                                break;
                            case TOP:
                                stageElement.css(TOP, component.top);
                                handleBox.css(TOP, component.top);
                                stageElement.trigger(MOVE + NS, component);
                                break;
                            case HEIGHT:
                                stageElement.css(HEIGHT, component.height);
                                handleBox.css(HEIGHT, component.height);
                                stageElement.trigger(RESIZE + NS, component);
                                break;
                            case WIDTH:
                                stageElement.css(WIDTH, component.width);
                                handleBox.css(WIDTH, component.width);
                                stageElement.trigger(RESIZE + NS, component);
                                break;
                            case ROTATE:
                                stageElement.css(TRANSFORM, kendo.format(CSS_ROTATE, component.rotate));
                                handleBox.css(TRANSFORM, kendo.format(CSS_ROTATE, component.rotate));
                                handleBox.find(HANDLE_CLASS).css(TRANSFORM, kendo.format(CSS_ROTATE, -component.rotate) + ' ' + kendo.format(CSS_SCALE, 1/that.scale()));
                                stageElement.trigger(ROTATE + NS, component);
                                break;
                            //TODO attributes
                            //TODO properties
                        }
                    }
                });
            }
        },
        /* jshint +W074 */

        /**
         * Select a stage element
         * @param id
         * @returns {h|*}
         */
        select: function (id) {
            var that = this;
            if (that.mode() === that.modes.design) {

                //select() should return the id of the selected stage element / page item
                if (id === undefined) {
                    return that.wrapper.find(HANDLE_BOX_CLASS).attr(DATA_ID);

                //select(id) should select the corresponding stage element unless it is already selected
                } else if ($.type(id) === STRING && that.stage.find(kendo.format(ELEMENT_SELECTOR, id)).length && that.wrapper.find(HANDLE_BOX_CLASS).attr(DATA_ID) !== id) {
                    that._showHandles(id);
                    that.trigger(SELECT, {value: that.options.dataSource.get(id)});

                //select(null) should clear the selection
                } else if (id === null && that.wrapper.find(HANDLE_BOX_CLASS).css(DISPLAY) !== NONE) {
                    that._hideHandles();
                    that.trigger(SELECT, {value: null});
                }
            }
        },

        /**
         * Stage Elements
         * @method items
         * @returns {XMLList|*}
         */
        items: function() {
            return this.stage.children();
        },

        /**
         * Clears the DOM from modifications made by the widget
         * @private
         */
        _clear: function() {
            var that = this;
            //TODO: remove wrapper!!
            //unbind kendo
            kendo.unbind(that.element);
            //unbind all other events
            that.element.find('*').off();
            that.element
                .off()
                .empty();
                //.removeClass(WIDGET_CLASS);
        },

        /**
         * Destroys the widget
         */
        destroy: function () {
            var that = this;
            Widget.fn.destroy.call(that);
            that._clear();
            that.setDataSource(NULL);
            kendo.destroy(that.element);
        }

    });

    kendo.ui.plugin(Stage);

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    /**
     * Utility functions
     */
    var util = {

        /**
         * Log a message
         * @param message
         */
        log: function(message) {
            if (DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log(MODULE + message);
            }
        },

        /**
         * Convert radians to degrees
         * @param deg
         * @returns {number}
         */
        deg2rad: function(deg) {
            return deg*Math.PI/180;
        },

        /**
         * Convert degrees to radians
         * @param rad
         * @returns {number}
         */
        rad2deg: function(rad) {
            return rad*180/Math.PI;
        },

        /**
         * Snapping consists in rounding the value to the closest multiple of snapValue
         * @param value
         * @param snapValue
         * @returns {*}
         */
        snap: function (value, snapValue) {
            if (snapValue) {
                return value % snapValue < snapValue / 2 ? value - value % snapValue : value + snapValue - value % snapValue;
            } else {
                return value;
            }
        },

        /**
         * Get the rotation angle (in degrees) of an element's CSS transformation
         * @param element
         * @returns {Number|number}
         */
        getTransformRotation: function(element) {
            //$(element).css('transform') returns a matrix, so we have to read the style attribute
            var match = ($(element).attr('style') || '').match(/rotate\([\s]*([0-9\.]+)[deg\s]*\)/);
            return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 0 : 0;
        },

        /**
         * Get the scale of an element's CSS transformation
         * @param element
         * @returns {Number|number}
         */
        getTransformScale: function(element) {
            //$(element).css('transform') returns a matrix, so we have to read the style attribute
            var match = ($(element).attr('style') || '').match(/scale\([\s]*([0-9\.]+)[\s]*\)/);
            return $.isArray(match) && match.length > 1 ? parseFloat(match[1]) || 1 : 1;
        },

        /**
         * Get the mouse (or touch) position
         * @param e
         * @returns {{x: *, y: *}}
         */
        getMousePosition: function(e) {
            //See http://www.jacklmoore.com/notes/mouse-position/
            //See http://www.jqwidgets.com/community/topic/dragend-event-properties-clientx-and-clienty-are-undefined-on-ios/
            //See http://www.devinrolsen.com/basic-jquery-touchmove-event-setup/
            //ATTENTION: e.originalEvent.touches instanceof TouchList, not Array
            var clientX = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches[0].clientX : e.clientX,
                clientY = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches[0].clientY : e.clientY,
                //IMPORTANT: Pos is relative to the stage and e.offsetX / e.offsetY does not work in Firefox
                stage = $(e.currentTarget).find(kendo.roleSelector('stage')),
                mouse = {
                    x: clientX - stage.offset().left + $(document.body).scrollLeft(), //TODO: any other scrolled parent to consider????????
                    y: clientY - stage.offset().top + $(document.body).scrollTop()
                };
            return mouse;
        },

        /**
         * Rotate a point by an angle around a center
         * @param point
         * @param center
         * @param radians
         * @returns {*}
         */
        getRotatedPoint: function(point, center, radians) {
            if ($.isPlainObject(point) && $.type(point.x) === 'number' && $.type(point.y) === 'number' &&
                $.isPlainObject(center) && $.type(center.x) === 'number' && $.type(center.y) === 'number' &&
                $.type(radians) === 'number') {
                return {
                    //See http://stackoverflow.com/questions/786472/rotate-a-point-by-another-point-in-2d
                    //See http://www.felixeve.co.uk/how-to-rotate-a-point-around-an-origin-with-javascript/
                    x: center.x + (point.x - center.x) * Math.cos(radians) - (point.y - center.y) * Math.sin(radians),
                    y: center.y + (point.x - center.x) * Math.sin(radians) + (point.y - center.y) * Math.cos(radians)
                };
            } else {
                return undefined;
            }
        },

        /**
         * Calculate the angle between two points rotated around a center
         * @param center
         * @param p1
         * @param p2
         * @returns {*}
         */
        getRadiansBetween2Points: function(center, p1, p2) {
            if ($.isPlainObject(center) && $.type(center.x) === 'number' && $.type(center.y) === 'number' &&
                $.isPlainObject(p1) && $.type(p1.x) === 'number' && $.type(p1.y) === 'number' &&
                $.isPlainObject(p2) && $.type(p2.x) === 'number' && $.type(p2.y) === 'number') {
                //See http://www.euclideanspace.com/maths/algebra/vectors/angleBetween/
                //See http://stackoverflow.com/questions/7586063/how-to-calculate-the-angle-between-a-line-and-the-horizontal-axis
                //See http://code.tutsplus.com/tutorials/euclidean-vectors-in-flash--active-8192
                //See http://gamedev.stackexchange.com/questions/69649/using-atan2-to-calculate-angle-between-two-vectors
                return Math.atan2(p2.y - center.y, p2.x - center.x) - Math.atan2(p1.y - center.y, p1.x - center.x);
            } else {
                return undefined;
            }
        },

        /**
         * Add debug visual eleemnts
         * @param wrapper
         */
        addDebugVisualElements: function(wrapper) {
            if(DEBUG) {

                //Add bounding rectangle
                $(DEBUG_BOUNDS)
                    .css({
                        position: ABSOLUTE,
                        border: '1px dashed #FF00FF',
                        display: NONE
                    })
                    .appendTo(wrapper);

                //Add center of rotation
                $(DEBUG_CENTER)
                    .css({
                        position: ABSOLUTE,
                        height: '20px',
                        width: '20px',
                        marginTop: '-10px',
                        marginLeft: '-10px',
                        borderRadius: '50%',
                        backgroundColor: '#FF00FF',
                        display: NONE
                    })
                    .appendTo(wrapper);

                //Add calculated mouse position
                $(DEBUG_MOUSE)
                    .css({
                        position: ABSOLUTE,
                        height: '20px',
                        width: '20px',
                        marginTop: '-10px',
                        marginLeft: '-10px',
                        borderRadius: '50%',
                        backgroundColor: '#00FFFF',
                        display: NONE
                    })
                    .appendTo(wrapper);
            }
        },

        /**
         * Update debug visual elements
         * @param options
         */
        updateDebugVisualElements: function(options) {
            if(DEBUG && $.isPlainObject(options) && options.scale > 0) {

                //Display center of rotation
                options.wrapper.find(DEBUG_CENTER_CLASS).css({
                    display: 'block',
                    left: options.center.x / options.scale,
                    top: options.center.y / options.scale
                });

                //Display bounding rectangle
                options.wrapper.find(DEBUG_BOUNDS_CLASS).css({
                    display: 'block',
                    left: options.bounds.left / options.scale,
                    top: options.bounds.top / options.scale,
                    height: options.bounds.height / options.scale,
                    width: options.bounds.width / options.scale
                });

                //Display mouse calculated position
                options.wrapper.find(DEBUG_MOUSE_CLASS).css({
                    display: 'block',
                    left: options.mouse.x / options.scale,
                    top: options.mouse.y / options.scale
                });
            }
        },

        /**
         * Hide debug visual elements
         * @param wrapper
         */
        hideDebugVisualElements: function(wrapper) {
            if (DEBUG) {
                wrapper.find(DEBUG_CENTER_CLASS).css({display: NONE});
                wrapper.find(DEBUG_BOUNDS_CLASS).css({display: NONE});
                wrapper.find(DEBUG_MOUSE_CLASS).css({display: NONE});
            }
        }

    };

}(this, jQuery));

;
/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, jquery: true */
/* jshint browser: true, jquery: true */

;(function (window, $, undefined) {

    'use strict';

    //var fn = Function,
    //    global = fn('return this')(),
    var kendo = window.kendo,
        Widget = kendo.ui.Widget,
        kidoju = window.kidoju,

        //TYPES
        STRING = 'string',

        //EVENTS
        CLICK = 'click',
        CHANGE = 'change',

        //Miscellaneous
        WIDGET_CLASS = 'k-widget kj-toolbox',
        IMAGE = '<img src="{0}" alt="{1}">',
        IMAGE_CLASS = 'kj-tool',
        DATA_TOOL = 'data-tool',
        DATA_SELECTED = 'data-selected',
        ACTIVE_TOOL = 'active',
        POINTER = 'pointer',
        DEFAULT_SIZE = 32,

        DEBUG = false,
        MODULE = 'kidoju.widgets.toolbox: ';


    /*********************************************************************************
     * Helpers
     *********************************************************************************/

    function log(message) {
        if (DEBUG && window.console && $.isFunction(window.console.log)) {
            window.console.log(MODULE + message);
        }
    }

    /*********************************************************************************
     * Widget
     *********************************************************************************/

    /**
     * @class Toolbox Widget (kendoToolbox)
     */
    var Toolbox = Widget.extend({

        /**
         * Initializes the widget
         * @param element
         * @param options
         */
        init: function (element, options) {
            var that = this;
            options = options || {};
            Widget.fn.init.call(that, element, options);
            log('widget initialized');
            that._layout();
        },

        /**
         * Widget options
         * @property options
         */
        options: {
            name: 'Toolbox',
            size: DEFAULT_SIZE,
            path: './styles/images/toolbox/',
            tools: kidoju.tools
        },

        /**
         * Widget events
         * @property events
         */
        events: [

        ],

        /**
         * Gets or sets the current tool
         * @param id
         * @returns {value|*|h.value|t.category.value|N.options.value|E.options.value}
         */
        tool: function(id) {
            var that = this;
            if (id) {
                if ($.type(id) !== STRING) {
                    throw new TypeError();
                }
                if (!that.options.tools.hasOwnProperty(id)) {
                    throw new RangeError();
                }
                if (id !== that.options.tool) {
                    that.options.tools.set(ACTIVE_TOOL, id);
                    //the change handler refreshes the widget
                    log('tool changed for ' + id);
                }
            } else {
                return that.options.tools.get(ACTIVE_TOOL);
            }
        },

        /**
         * Resets the toolbox to selection mode
         */
        reset: function() {
            var that = this;
            that.tool(POINTER);
        },

        /**
         * Builds the widget layout
         * @private
         */
        _layout: function () {
            var that = this;
            that._clear();
            $(that.element).addClass(WIDGET_CLASS);
            $.each(that.options.tools, function(index, tool) {
                if (tool instanceof kidoju.Tool && that.options.tools.hasOwnProperty(tool.id)) {
                    //TODO Translate tooltips and consider SVG alternatives
                    var toolElement = $(kendo.format(IMAGE, that.options.path + tool.icon + '.svg', 'TODO: Translate'))
                        .attr(DATA_TOOL, tool.id)
                        .addClass(IMAGE_CLASS)
                        .height(that.options.size)
                        .width(that.options.size);
                    $(that.element).append(toolElement);
                }
            });
            $(that.element).find('img')
                .on(CLICK, function(e) {
                    var id = $(e.target).attr(DATA_TOOL);
                    if ($.type(id) === STRING) {
                        that.tool(id);
                    }
            });
            that.refresh();
            if ($.isFunction(that._refreshHandler)) {
                that.options.tools.unbind(CHANGE, that._refreshHandler);
            }
            that._refreshHandler = $.proxy(that.refresh, that);
            that.options.tools.bind(CHANGE, that._refreshHandler);
        },

        /**
         * Refreshes the widget
         * @method refresh
         */
        refresh: function() {
            var that = this;
            $(that.element).find('[' + DATA_SELECTED + ']').removeProp(DATA_SELECTED);
            $(that.element).find('[' + DATA_TOOL + '=' + that.tool() + ']').prop(DATA_SELECTED, true);
        },

        /**
         * Clears the widget
         * @method _clear
         * @private
         */
        _clear: function() {
            var that = this;
            //unbind kendo
            //kendo.unbind($(that.element));
            //unbind all other events
            $(that.element).find('*').off();
            $(that.element).off();
            //remove descendants
            $(that.element).empty();
            //remove element classes
            $(that.element).removeClass(WIDGET_CLASS);
        },

        /**
         * Destroys the widget including all DOM modifications
         * @method destroy
         */
        destroy: function () {
            var that = this;
            Widget.fn.destroy.call(that);
            that._clear();
            if ($.isFunction(that._refreshHandler)) {
                that.options.tools.unbind(CHANGE, that._refreshHandler);
            }
            kendo.destroy(that.element);
        }

    });

    kendo.ui.plugin(Toolbox);

})(this, jQuery);
