/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define(['./vendor/kendo/kendo.binder' /*, './kidoju.tools'*/], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo,
            kidoju = window.kidoju = window.kidoju || {},
            models = kidoju.data = kidoju.data || {},

        // Types
            OBJECT = 'object',
            STRING = 'string',
            BOOLEAN = 'boolean',
            NUMBER = 'number',
            UNDEFINED = 'undefined',

        // Event
            CHANGE = 'change',
            ERROR = 'error',

        // Defaults
            ZERO_NUMBER = 0,
            NEGATIVE_NUMBER = -1,

        // Miscellaneous
            RX_VALID_NAME = /^[a-z][a-z0-9_]{3,}$/i;


        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * Log a message
         * @param message
         */
        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.tools: ' + message);
            }
        }

        /**
         * Asserts
         * Note: Use asserts where unmet conditions are independent from user entries, and
         * developers should be warned that there is probably something unexpected in their code
         */
        var assert = $.extend(
            // By extending assert, we ensure we can call both assert() and assert.ok() for the same result (like in nodeJS)
            function(test, message) {
                if (!test) { throw new Error(message); }
            },
            {
                enum: function(array, value, message) { if (array.indexOf(value) === -1) { throw new Error(message); } },
                equal: function(expected, actual, message) { if (expected !== actual) { throw new Error(message); } },
                instanceof: function(Class, value, message) { if (!(value instanceof Class)) { throw new Error(message); } },
                isOptionalObject: function(value, message) { if ($.type(value) !== 'undefined' && (!$.isPlainObject(value) || $.isEmptyObject(value))) { throw new Error(message); } },
                isPlainObject: function(value, message) { if (!$.isPlainObject(value) || $.isEmptyObject(value)) { throw new Error(message); } },
                isUndefined: function(value, message) { if ($.type(value) !== 'undefined') { throw new Error(message); } },
                match: function(rx, value, message) { if ($.type(value) !== STRING || !rx.test(value)) { throw new Error(message); } },
                ok: function(test, message) { return assert(test, message); },
                type: function(type, value, message) { if ($.type(value) !== type) { throw new TypeError(message); } }
            },
            {
                messages: {
                    instanceof: {
                        default: '`{0}` is expected to be an instance of `{1}`'
                    },
                    isPlainObject: {
                        default: '`{0}` is expected to be a plain object'
                    },
                    isUndefined: {
                        default: '`{0}` is expected to be undefined'
                    },
                    type: {
                        default: '`{0}` is expected to be a(n) `{1}`'
                    }
                }
            }
        );

        /*********************************************************************************
         * Base Model
         *********************************************************************************/

        /**
         * kidoju.data.Model enhances kendo.data.Model
         * for aggregation of submodels as as a mongoose document property can designate a subdocument
         * for DataSource of submodels as a mongoose document property can designate an array of subdocuments
         */
        var Model = models.Model = kendo.data.Model.define({

            /**
             * Function called in init(data) and accept(data)
             * to parse data and convert fields to model field types
             * @param data
             * @private
             */
            _parseData: function(data) {
                var that = this, parsed = {};
                // We need a clone to avoid modifications to original data
                for (var field in that.fields) {
                    if (that.fields.hasOwnProperty(field)) {
                        if (data && $.isFunction(data.hasOwnProperty) && data.hasOwnProperty(field) && $.type(data[field]) !== UNDEFINED) {
                            parsed[field] = that._parse(field, data[field]);
                        } else if (that.defaults && that.defaults.hasOwnProperty(field)) {
                            if (that[field] instanceof kendo.data.DataSource) {
                                // Important! Do not erase existing dataSources
                                // unless data.hasOwnProperty(field) here above
                                parsed[field] = that[field];
                            } else {
                                // Important! We need to parse default values
                                // especially to initialize Stream.pages.defaultValue
                                // and Page.components.defaultValue
                                parsed[field] = that._parse(field, that.defaults[field]);
                            }
                        } else if (that.fields[field].type === 'string') {
                            parsed[field] = '';
                        } else if (that.fields[field].type === 'number') {
                            parsed[field] = 0;
                        } else if (that.fields[field].type === 'boolean') {
                            parsed[field] = false;
                        } else if (that.fields[field].type === 'date') {
                            parsed[field] = new Date();
                        } else {
                            // Any field which is part of the model schema/definition
                            // and which has no type and no defaultValue infers a null default value
                            parsed[field] = null;
                        }
                    }
                }
                return parsed;
            },

            /**
             * Modify original init method
             * to add casting of properties into their underlying type
             * For example, if a model field of type date receives a string value, it will be cast into a date
             * and if a model field designates a submodel, it will be cast into that submodel
             * @see http://www.telerik.com/forums/parsing-on-initialization-of-kendo-data-model
             * @param data
             */
            init: function(data) {
                // Call the base init method after parsing data
                kendo.data.Model.fn.init.call(this, this._parseData(data));
            },

            /**
             * Modify original accept method
             * Add casting of properties into their underlying type (see init above)
             * @see http://www.telerik.com/forums/parsing-on-initialization-of-kendo-data-model
             * Trigger a change event on the parent observable (hierarchies of models and submodels)
             * @see http://www.telerik.com/forums/triggering-a-change-event-on-the-parent-observable-when-calling-kendo-data-model-accept-method
             * @param data
             * @returns {boolean}
             */
            accept: function(data) {
                // Call the base accept method
                kendo.data.Model.fn.accept.call(this, this._parseData(data));

                // Trigger a change event on the parent observable (possibly a viewModel)
                // Without it, any UI wodget data bound to the parent is not updated
                // TODO Review this event thing.......
                if ($.isFunction(this.parent)) {
                    var parent = this.parent();
                    if (parent instanceof kendo.data.ObservableObject) {
                        for (var key in parent) {
                            if (parent.hasOwnProperty(key) && parent[key] instanceof this.constructor && parent[key].uid === this.uid) {
                                // As we have found our nested object in the parent
                                // trigger a change event otherwise UI won't be updated via MVVM
                                parent.trigger(CHANGE, { field: key });
                                // Once we have found the key holding our model in its parent and triggered the change event,
                                // break out of for loop
                                break;
                            }
                        }
                        // } else if (parent instanceof kendo.data.ObservableArray) {
                        // TODO: What in this case ????
                    }
                }
            },

            /**
             * Override shouldSerialize to
             * 1) only serialize fields defined in the Model (any other value should be discarded)
             * 2) discard model fields with property serializable === false
             * @param field
             */
            shouldSerialize: function(field) {

                assert.type(STRING, field, kendo.format(assert.messages.type.default, 'field', STRING));

                return this.fields.hasOwnProperty(field) && this.fields[field].serializable !== false &&
                    kendo.data.Model.fn.shouldSerialize.call(this, field);
            },


            /**
             * Modify original toJSON method to:
             * (1) only serialize actual editable fields with their id
             * (2) optionally serialize the entire tree
             *
             * Note that we have also considered taking a list of fields as parameters
             * to only send the data we know has been modified
             * toPartialJSON was not copied when moving app.models.BaseModel to kidoju.data.Model
             * @param includeDataSources defines whether to include datasources in the result or not
             * This would actually depend upon the fact whether the hierarchy is saved with the root object
             * or the data sources have their own transport to save their nodes.
             * @returns {{}}
             */
            toJSON: function(includeDataSources) {

                var json = {},
                    value, field;

                for (field in this) {
                    if (this.shouldSerialize(field)) {

                        value = this[field];

                        // Also call toJSON on any kidoju.data.DataSource which aggregates a collection of models (not in original toJSON method)
                        // if (value instanceof kendo.data.ObservableObject || value instanceof kendo.data.ObservableArray) {
                        if (value instanceof kendo.data.ObservableObject || value instanceof kendo.data.ObservableArray || (includeDataSources && value instanceof DataSource)) {
                            value = value.toJSON(includeDataSources);
                        }

                        // Also discard undefined values and empty objects (not in original toJSON method)
                        // Note: we are not discarding empty arrays though:
                        // We are considering that an empty object is a collection of undefined attributes
                        // It is not the same with an empty array
                        if ($.type(value) !== UNDEFINED && // Not an undefined value
                            !($.isPlainObject(value) && $.isEmptyObject(value)) && // Not an empty object {}
                            !($.type(value) === OBJECT && value.constructor !== Object)) { // Not an instance of a Class, Model or DataSource
                            json[field] = value;
                        }

                        // `undefined` is ambiguous because it is also the value of a missing property.
                        // if we really want to assign data = undefined or data = {}, we should make data nullable and assign data = null
                        // See https://github.com/christkv/mongodb-core/issues/31
                        // Note also that this is consistent with JSON.stringify which ignores undefined values
                    }
                }

                return json;
            },

            /**
             * Execute validation of the model data considering the rules defined on fields
             * @returns {boolean}
             */
            validate: function() {
                var that = this, validated = true;
                for (var field in that.fields) {
                    if(that.fields.hasOwnProperty(field)) {
                        var validation = that.fields[field].validation;
                        if ($.isPlainObject(validation)) {
                            if (validation.required === true && !that[field]) {
                                validated = false;
                            } else if (that[field]) {
                                if ($.type(validation.pattern) === STRING && !(new RegExp(validation.pattern)).test(that[field])) {
                                    validated = false;
                                }
                                if ($.type(validation.min) === NUMBER && !isNaN(parseFloat(that[field])) && parseFloat(that[field]) < validation.min) {
                                    validated = false;
                                }
                                if ($.type(validation.max) === NUMBER && !isNaN(parseFloat(that[field])) && parseFloat(that[field]) > validation.max) {
                                    validated = false;
                                }
                            }
                        }
                    }
                }
                return validated; // Should we return an array of errors instead
            }

            // Consider a function that populates validation rules on forms
            // See http://docs.telerik.com/kendo-ui/framework/validator/overview

        });

        /*********************************************************************************
         * Base DataReader
         *********************************************************************************/

        /**
         * ModelCollectionDataReader
         * We cannot subclass kendo.data.DataReader because the data function is created in the constructor
         * using a wrapDataAccess private function
         * @class ModelCollectionDataReader
         */
        var ModelCollectionDataReader = kidoju.data.ModelCollectionDataReader = kendo.Class.extend({
            init: function(reader) {
                this.reader = reader;
                if (reader.model) {
                    this.model = reader.model;
                }
            },
            errors: function(data) {
                return this.reader.errors(data);
            },
            parse: function(data) {
                if ($.isArray(data) && $.isFunction(this.model)) {
                    var defaults = (new this.model()).defaults;
                    for (var i = 0; i < data.length; i++) {
                        // We assume data[i] is an object
                        for (var field in defaults) {
                            if (!data[i].hasOwnProperty(field) && defaults.hasOwnProperty(field) && !$.isArray(defaults[field])) {
                                // Set default values unless they are arrays
                                // Otherwise we might erase dependant collections (i.e pages or components)
                                data[i][field] = defaults[field];
                            }
                        }
                    }
                }
                return this.reader.parse(data);
            },
            data: function(data) {
                // We get funny values from the original kendo.data.DataReader
                // due to the getters in the convertRecords(...) function in kendo.data.js
                // especially with page components
                // This can be checked by commenting the if block in the parse function
                // Note: we did the fix in the parse function so as to apply to this.data and this.groups.
                return this.reader.data(data);
            },
            total: function(data) {
                return this.reader.total(data);
            },
            groups: function(data) {
                return this.reader.groups(data);
            },
            aggregates: function(data) {
                return this.reader.aggregates(data);
            },
            serialize: function(data) {
                return this.reader.serialize(data);
            }
        });

        /*********************************************************************************
         * Base DataSource
         *********************************************************************************/

        /**
         * @see kendo.data.HierarchicalDataSource
         * @param name
         * @returns {Function}
         */
        function dataMethod(name) {
            return function () {
                var data = this._data,
                    result = kendo.data.DataSource.fn[name].apply(this, [].slice.call(arguments));

                if (this._data !== data) {
                    this._attachBubbleHandlers();
                }

                return result;
            };
        }

        /**
         * kidoju.data.DataSource enhances kendo.data.DataSource
         * especially to serialize the stream tree as a whole
         */
        var DataSource = models.DataSource = kendo.data.DataSource.extend({

            /**
             * @ constructor
             * @param options
             */
            // init: dataMethod('init'),

            /**
             * @method success
             */
            // success: dataMethod('success'),

            /**
             * @method data
             */
            // data: dataMethod('data'),

            /**
             * @method _attachBubbleHandlers
             * @private
             */
            /*
            _attachBubbleHandlers: function () {
                var that = this;
                that._data.bind(ERROR, function (e) {
                    that.trigger(ERROR, e);
                });
            },
            */

            /**
             * @method toJSON
             */
            toJSON: function() {
                var json = [];
                // total() give the total number of items, all of which are not necessarily available considering paging
                // for(var i = 0; i < this.total(); i++) {
                for(var i = 0; i < this.data().length; i++) {
                    // If we pass includeDataSource === true to kidoju.data.Model.toJSON
                    // this method is executed and we should call toJSON(true) on each DataSource item
                    // So has to serialize the whole tree
                    json.push(this.at(i).toJSON(true));
                }
                return json;
            }

        });

        /*********************************************************************************
         * PageComponent Model and DataSource
         *********************************************************************************/

        /**
         * PageComponent model
         * @class PageComponent
         * @type {void|*}
         */
        var PageComponent = models.PageComponent = Model.define({
            id: 'id',
            fields: {
                id: {
                    type: STRING,
                    editable: false,
                    nullable: true
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
                    parse: function (value) {
                        return $.type(value) === NUMBER ? (value + 360) % 360 : ZERO_NUMBER;
                    }
                },
                tag: {
                    type: STRING,
                    defaultValue: null
                },
                attributes: {
                    defaultValue: null
                },
                properties: {
                    defaultValue: null
                }
            },

            /**
             * Constructor
             * @param component
             */
            /* jshint -W074 */
            /* This function's cyclomatic complexity is too high. */
            init: function (component) {

                var that = this;

                // Note: Kendo UI requires that new PageComponent() works, i.e. component = undefined
                if ($.type(component) === OBJECT /*&& !$.isEmptyObject(component)*/) {
                    if (!kidoju.tools) {
                        throw new Error('Kidoju tools are missing');
                    }
                    if ($.type(component.tool) !== STRING || component.tool.length === 0 || !(kidoju.tools[component.tool] instanceof kidoju.Tool)) {
                        throw new Error(kendo.format('`{0}` is not a valid Kidoju tool', component.tool));
                    }
                }

                Model.fn.init.call(that, component);

                if (kidoju.tools && $.type(that.tool) === STRING && that.tool.length) {

                    var tool = kidoju.tools[that.tool];
                    if (tool instanceof kidoju.Tool) {

                        // Let the tool build a Model for attributes to allow validation in the property grid
                        var Attributes = tool._getAttributeModel(),
                        // Extend component attributes with possible new attributes as tools improve
                            attributes = $.extend({}, Attributes.prototype.defaults, that.attributes);
                        // Cast with Model
                        // that.set('attributes', new Attributes(attributes)); // <--- this sets the dirty flag and raises the change event
                        that.attributes = new Attributes(attributes);
                        that.attributes.bind(CHANGE, function(e) {
                            e.field = 'attributes.' + e.field;
                            that.trigger(CHANGE, e);
                        });

                        // Let the tool build a Model for properties to allow validation in the property grid
                        var Properties = tool._getPropertyModel(),
                        // Extend component properties with possible new properties as tools improve
                            properties = $.extend({}, Properties.prototype.defaults, that.properties);
                        // Cast with Model
                        // that.set('properties', new Properties(properties)); // <--- this sets the dirty flag and raises the change event
                        that.properties = new Properties(properties);
                        that.properties.bind(CHANGE, function(e) {
                            e.field = 'properties.' + e.field;
                            that.trigger(CHANGE, e);
                        });

                        // Add the code library if any, otherwise we will be missing code for any items designated by a name
                        if (tool.properties && tool.properties.validation instanceof kidoju.adapters.ValidationAdapter) {
                            that._library = tool.properties.validation.library;
                        }

                    }
                }
            },
            /* jshint: +W074 */

            /**
             * Get the parent page
             * @returns {*}
             */
            page: function () {
                if ($.isFunction(this.parent)) {
                    var componentCollectionArray = this.parent();
                    if ($.isFunction(componentCollectionArray.parent)) {
                        return componentCollectionArray.parent();
                    }
                }
            }

        });

        /**
         * @class PageComponentCollectionDataSource
         * @type {*|void|Object}
         */
        var PageComponentCollectionDataSource =  models.PageComponentCollectionDataSource = DataSource.extend({

            /**
             * Constructor
             * @constructor
             * @param options
             */
            init: function (options) {

                // Enforce the use of PageComponent items in the collection data source
                // options contains a property options.schema.model which needs to be replaced
                // DataSource.fn.init.call(this, $.extend(true, {}, { schema: { modelBase: PageComponent, model: PageComponent } }, options));
                DataSource.fn.init.call(this, $.extend(true, {}, options, { schema: { modelBase: PageComponent, model: PageComponent } }));

                // Let's use a slightly modified reader to leave data conversions to kidoju.data.Model._parseData
                this.reader = new ModelCollectionDataReader(this.reader);
            },

            /**
             * Remove
             * @param model
             * @returns {*}
             */
            remove: function (model) {
                return DataSource.fn.remove.call(this, model);
            },

            /**
             * Insert
             * @param index
             * @param model
             * @returns {*}
             */
            insert: function (index, model) {
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
        PageComponentCollectionDataSource.create = function (options) {
            options = options && options.push ? { data: options } : options;

            var dataSource = options || {},
                data = dataSource.data;

            dataSource.data = data;

            if (!(dataSource instanceof PageComponentCollectionDataSource) && dataSource instanceof kendo.data.DataSource) {
                throw new Error('Incorrect DataSource type. Only PageComponentCollectionDataSource instances are supported');
            }

            return dataSource instanceof PageComponentCollectionDataSource ? dataSource : new PageComponentCollectionDataSource(dataSource);
        };

        /*********************************************************************************
         * Page Model and DataSource
         *********************************************************************************/

        /**
         * Page
         * @see kendo.data.HierarchicalDataSource and kendo.data.Node for implementation details
         * @class Page
         * @type {void|*}
         */
        var Page = models.Page = Model.define({
            id: 'id',
            fields: {
                id: {
                    type: STRING,
                    nullable: true,
                    editable:false
                },
                style: {
                    type: STRING
                },
                components: {
                    // We cannot assign a data source as default value of a model
                    // because otherwise it might be reused amongst instances.
                    // The only way to ensure that a new instance gets a new default value is to initialize with []
                    // and have kidoju.data.Model._parseData initialize the instance data source from [].
                    // defaultValue: new kidoju.data.PageComponentCollectionDataSource({ data: [] }),
                    defaultValue: [],
                    parse: function(value) {
                        if (value instanceof PageComponentCollectionDataSource) {
                            return value;
                        } else if (value && value.push) {
                            return new PageComponentCollectionDataSource({ data: value });
                        } else {
                            return new PageComponentCollectionDataSource(value);
                        }
                    }
                }
            },

            /**
             * @constructor
             * @param value
             */
            init: function (value) {
                var that = this;

                // Call the base init method
                Model.fn.init.call(that, value);

                if (that.model && that.model.components) {
                    // Reset PageCollectionDataSource with model.pages dataSource options
                    // especially for the case where we have defined CRUD transports
                    that.components = new PageComponentCollectionDataSource(that.model.components);
                }

                var components = that.components;

                /*
                var transport = components.transport,
                    parameterMap = transport.parameterMap;
                transport.parameterMap = function (data, type) {
                    data[that.idField || 'id'] = that.id;
                    if (parameterMap) {
                        data = parameterMap(data, type);
                    }
                    return data;
                };
                */

                if (components instanceof PageComponentCollectionDataSource) {

                    // Add parent function
                    components.parent = function () {
                        return that;
                    };

                    // Note: this is where kendo.data.Node bind the change and error events
                    // to propage them from the components collection to the page node or page collection

                }

                that._loaded = !!(value && (value.components || value._loaded));
            },

            /**
             * @method append
             * @param component
             */
            append: function (component) {
                this.loaded(true);
                this.components.add(component);
            },

            /**
             * @method load
             * @returns {*}
             */
            load: function () {
                var options = {};
                var method = '_query';
                var components = this.components;
                // Passing the id of the page to the components _query method
                // is suggested by lendo.data.Node
                options[this.idField || 'id'] = this.id;
                if (!this._loaded) {
                    components._data = undefined;
                    method = 'read';
                }
                components.one(CHANGE, $.proxy(function() { this.loaded(true); }, this));
                return components[method](options);
            },

            /**
             * Get the parent stream if any
             * @returns {*}
             */
            stream: function () {
                if ($.isFunction(this.parent)) {
                    var pageCollectionArray = this.parent();
                    if ($.isFunction(pageCollectionArray.parent)) {
                        return pageCollectionArray.parent();
                    }
                }
            },

            /**
             * Gets or sets the loaded status of page components
             * @param value
             * @returns {boolean|*|Page._loaded}
             */
            loaded: function (value) {
                if (value !== undefined) {
                    this._loaded = value;
                } else {
                    return this._loaded;
                }
            }
        });

        /**
         * @class PageCollectionDataSource
         * @type {*|void|Object}
         */
        var PageCollectionDataSource =  models.PageCollectionDataSource = DataSource.extend({

            /**
             * @constructor
             * @param options
             */
            init: function (options) {

                // PageWithOptions propagates configuration options to PageComponentCollectionDataSource
                var PageWithOptions = options && options.schema && ($.type(options.schema.model) === OBJECT) ?
                    Page.define({ model: options.schema.model }) : Page;

                // Enforce the use of PageWithOptions items in the page collection data source
                // options contains a property options.schema.model which needs to be replaced with PageWithOptions
                // kidoju.data.DataSource.fn.init.call(this, $.extend(true, {}, { schema: { modelBase: PageWithOptions, model: PageWithOptions } }, options));
                DataSource.fn.init.call(this, $.extend(true, {}, options, { schema: { modelBase: PageWithOptions, model: PageWithOptions } }));

                // Let's use a slightly modified reader to leave data conversions to kidoju.data.Model._parseData
                this.reader = new ModelCollectionDataReader(this.reader);
            },

            /**
             * @method remove
             * @param model
             * @returns {*}
             */
            remove: function (model) {
                return DataSource.fn.remove.call(this, model);
            },

            /**
             * @method insert
             * @param index
             * @param model
             * @returns {*}
             */
            insert: function (index, model) {
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
             * Get empty user test data from properties
             * IMPORTANT: Make sure all pages are loaded first
             * @method getTestFromProperties
             * @returns {*}
             */
            getTestFromProperties: function () {
                var that = this,
                    test = {};
                $.each(that.data(), function (index, page) {
                    $.each(page.components.data(), function (index, component) {
                        var properties = component.properties;
                        if (properties instanceof kendo.data.Model &&
                            $.type(properties.fields) === OBJECT && !$.isEmptyObject(properties.fields) &&
                            $.type(properties.name) === STRING) {
                            test[properties.name] = undefined;
                        }
                    });
                });
                // TODO Consider returning an object cast with a model with type, default value and validation?
                return test;
            },

            /**
             * Validate a named value
             * @param name
             * @param code
             * @param value
             * @param solution
             * @returns {*}
             */
            validateNamedValue: function (name, code, value, solution) {
                var dfd = $.Deferred();
                if (!window.Worker) {
                    dfd.reject({filename: undefined, lineno: undefined, message: 'Web workers are not supported' });
                    return dfd;
                }
                if ($.type(name) !== STRING || !RX_VALID_NAME.test(name)) {
                    dfd.reject({filename: undefined, lineno: undefined, message: 'A valid name has not been provided' });
                    return dfd;
                }
                if ($.type(code) !== STRING) {
                    dfd.reject({filename: undefined, lineno: undefined, message: 'Code has not been provided' });
                    return dfd;
                }
                // TODO: Add prerequisites (some custom helpers)
                var blob = new Blob(['onmessage=function (e) {' + code + 'if(typeof(e.data.value)==="undefined") {postMessage(e.data.value);}else{postMessage(validate(e.data.value,e.data.solution));}self.close();}']);
                var blobURL = window.URL.createObjectURL(blob);
                var worker = new Worker(blobURL);
                worker.onmessage = function (e) {
                    dfd.resolve({ name: name, result: e.data });
                };
                worker.onerror = function (err) {
                    dfd.reject(err);
                };
                worker.postMessage({value: value, solution: solution});
                // terminate long workers (>50ms)
                setTimeout(function () {
                    worker.terminate();
                    if (dfd.state() === 'pending') {
                        dfd.reject({filename: undefined, lineno: undefined, message: 'Timeout error'});
                    }
                }, 50);
                return dfd.promise();
            },

            /**
             * Validate user test data
             * IMPORTANT: Make sure all pages are loaded first
             * @method getTestFromProperties
             * @returns {*}
             */
            validateTestFromProperties: function (test) {

                // Note: the model being created on the fly, we only have an ObservableObject
                assert.instanceof(kendo.data.ObservableObject, test, kendo.format(assert.messages.instanceof.default, 'test', 'kendo.data.ObservableObject'));

                var that = this,
                    deferred = $.Deferred(),
                    promises = [],
                    result = {
                        score: 0,
                        max: 0,
                        percent: function () {
                            var max, score;
                            if (this instanceof kendo.data.ObservableObject) {
                                max = this.get('max'); score = this.get('score');
                            } else {
                                max = this.max; score = this.score;
                            }
                            return score === 0 || max === 0 ?  kendo.toString(0, 'p0') : kendo.toString(score/max, 'p0');
                        },
                        getScoreArray: function () {
                            var array = [];
                            for (var name in this) {
                                if(/^val_/.test(name) && this.hasOwnProperty(name)) {
                                    array.push(this[name]);
                                }
                            }
                            return array;
                        }
                    };

                $.each(that.data(), function (index, page) {
                    $.each(page.components.data(), function (index, component) {

                        var properties = component.properties, found;

                        assert.instanceof(kendo.data.Model, properties, kendo.format(assert.messages.instanceof.default, 'properties', 'kendo.data.Model'));
                        assert.type(OBJECT, properties.fields, kendo.format(assert.messages.type.default, 'properties.fields', OBJECT));

                        // Note: some components like textboxes have properties, others likes labels and images don't
                        // assert.type(STRING, properties.name, kendo.format(assert.messages.type.default, 'properties.name', STRING));
                        if ($.type(properties.name) === STRING) {

                            var libraryMatches = properties.validation.match(/^\/\/ ([^\n]+)$/);
                            if ($.isArray(libraryMatches) && libraryMatches.length === 2) {
                                // Find in the code library
                                found = properties._library.filter(function(item) {
                                    return item.name === libraryMatches[1];
                                });
                                assert.ok($.isArray(found) && found.length, 'properties.validation cannot be found in code library');
                            }

                            promises.push(that.validateNamedValue(
                                properties.name,        // name
                                $.isArray(found) ? found[0].formula : properties.validation,  // code
                                // tools built upon kendo ui widgets cannot have undefined values because value(undefined) === value() so they use null
                                // requiring users to test null || undefined is too complicated so we turn null into undefined
                                $.type(test[properties.name]) === 'null' ? undefined : test[properties.name],  // value
                                properties.solution     // solution
                            ));

                            result[properties.name] = {
                                name: properties.name,
                                description: properties.description,
                                value: test[properties.name],
                                solution: properties.solution,
                                result: undefined,
                                omit: properties.omit,
                                failure: properties.failure,
                                success: properties.success
                            };
                        }
                    });
                });

                $.when.apply($, promises)
                    .done(function () {
                        $.each(arguments, function (index, argument) {
                            result[argument.name].result = argument.result;
                            switch(argument.result) {
                                case true:
                                    if(result[argument.name] && $.type(result[argument.name].success) === NUMBER) {
                                        result[argument.name].score = result[argument.name].success;
                                    }
                                    break;
                                case false:
                                    if(result[argument.name] && $.type(result[argument.name].failure) === NUMBER) {
                                        result[argument.name].score = result[argument.name].failure;
                                    }
                                    break;
                                default:
                                    if(result[argument.name] && $.type(result[argument.name].omit) === NUMBER) {
                                        result[argument.name].score = result[argument.name].omit;
                                    }
                                    break;
                            }
                            result.score += result[argument.name].score;
                            if(result[argument.name] && result[argument.name].success) {
                                result.max += result[argument.name].success;
                            }
                            // if(result.max) {
                            //  result.percent = result.score/result.max;
                            // }
                        });
                        deferred.resolve(result);
                    })
                    .fail(deferred.reject);

                return deferred.promise();
            }
        });

        /**
         * @method create
         * @param options
         */
        PageCollectionDataSource.create = function (options) {
            options = options && options.push ? { data: options } : options;

            var dataSource = options || {},
                data = dataSource.data;

            dataSource.data = data;

            if (!(dataSource instanceof PageCollectionDataSource) && dataSource instanceof kendo.data.DataSource) {
                throw new Error('Incorrect DataSource type. Only PageCollectionDataSource instances are supported');
            }

            return dataSource instanceof PageCollectionDataSource ? dataSource : new PageCollectionDataSource(dataSource);
        };

        /*********************************************************************************
         * Stream
         *********************************************************************************/

        /**
         * A stream is essentially a collection of pages
         * @class Stream
         */
        var Stream = models.Stream = Model.define({
            fields: {
                /**
                 * pages
                 */
                pages: {
                    // We cannot assign a data source as default value of a model
                    // because otherwise it might be reused amongst instances.
                    // The only way to ensure that a new instance gets a new default value is to initialize with []
                    // and have kidoju.data.Model._parseData initialize the instance data source from [].
                    // defaultValue: new kidoju.data.PageCollectionDataSource({ data: [] }),
                    defaultValue: [],
                    parse: function(value) {
                        if (value instanceof PageCollectionDataSource) {
                            return value;
                        } else if (value && value.push) {
                            return new PageCollectionDataSource({ data: value });
                        } else {
                            return new PageCollectionDataSource(value);
                        }
                    }
                }
            },

            /**
             * Constructor
             * @constructor
             * @param value
             */
            init: function (value) {
                var that = this;

                // Call the base init method
                Model.fn.init.call(that, value);

                if (that.model && that.model.pages) {
                    // Reset PageCollectionDataSource with model.pages dataSource options
                    that.pages = new PageCollectionDataSource(that.model.pages);
                }

                var pages = that.pages;

                /*
                var transport = pages.transport,
                    parameterMap = transport.parameterMap;
                transport.parameterMap = function (data, type) {
                    data[that.idField || 'id'] = that.id;
                    if (parameterMap) {
                        data = parameterMap(data, type);
                    }
                    return data;
                };
                */

                if (pages instanceof PageCollectionDataSource) {

                    // Add parent() function
                    that.pages.parent = function () {
                        return that;
                    };

                    // Note: this is where kendo.data.Node bind the change and error events
                    // to propagate them from the pages collection to the stream node or a parent collection

                }

                that._loaded = !!(value && (value.pages || value._loaded));
            },

            /**
             * Append a page
             * @param model
             */
            append: function (page) {
                this.loaded(true);
                this.pages.add(page);
            },

            /**
             * Load pages
             * @returns {*}
             */
            load: function () {
                var options = {};
                var method = '_query';
                var pages = this.pages;
                // Passing the id of the page to the components _query method
                // is suggested by kendo.data.Node
                options[this.idField || 'id'] = this.id;
                if (!this._loaded) {
                    pages._data = undefined;
                    method = 'read';
                }
                pages.one(CHANGE, $.proxy(function() { this.loaded(true); }, this));
                return pages[method](options);
            },

            /**
             * Gets or sets loaded value
             * @param value
             * @returns {boolean|*}
             */
            loaded: function (value) {
                if (value !== undefined) {
                    this._loaded = value;
                } else {
                    return this._loaded;
                }
            }
        });


    }(window.jQuery));

    return window.kidoju;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
