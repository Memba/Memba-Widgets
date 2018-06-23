/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './common/window.assert.es6',
        './common/window.logger.es6',
        './common/window.util.es6',
        './vendor/kendo/kendo.binder'
        // './kidoju.tools'
    ], f);
})(function () {

    'use strict';

    var kidoju = window.kidoju = window.kidoju || {};

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var models = kidoju.data = kidoju.data || {};
        var assert = window.assert;
        var logger = new window.Logger('kidoju.data');
        var OBJECT = 'object';
        var STRING = 'string';
        // var BOOLEAN = 'boolean';
        var NUMBER = 'number';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var ERROR = 'error';
        var WARNING = 'warning';
        var ZERO_NUMBER = 0;
        var NEGATIVE_NUMBER = -1;
        var RX_VALID_NAME = /^val_[a-z0-9]{6}$/;
        var RX_VALIDATION_LIBRARY = /^\/\/ ([^\s\[\n]+)( (\[[^\n]+\]))?$/;
        // var RX_VALIDATION_CUSTOM = /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/;
        var location = window.location;
        var workerLibPath = location.protocol + '//' + location.host + '/Kidoju.Widgets/src/js/kidoju.data.workerlib.js';
        // var workerLibPath = location.protocol + '//' + location.host + '/src/js/kidoju.data.workerlib.js'; // for WEINRE

        /**
         * Define our worker timeout from CPU capacity
         * @returns {number}
         */
        function workerTimeout() {
            var start = Date.now();
            var rnd;
            // This would take about 10 ms on an iPad Pro
            // This would take about 100 ms on a Nexus 7 2012
            for (var i = 0; i < 1000000; i++) {
                rnd = Math.floor (100 * Math.random());
            }
            var end = Date.now();
            // In fact app.DEBUG is not the right test: we need to detect when dev tools are opened because they slow things down
            var k = (window.app || {}).DEBUG ? 4 : 1;
            // A minimum of 250ms is required in browsers and 400ms in Phonegap
            var timeout = k * Math.max(kendo.support.mobileOS.cordova ? 400 : 250, 10 * (end - start));
            logger.info({
                method: 'workerTimeout',
                message: 'Worker timeout set to ' + timeout + ' ms'
            });
            return timeout;
        }

        /*********************************************************************************
         * Base Model
         *********************************************************************************/

        /**
         * kidoju.data.Model enhances kendo.data.Model
         * for aggregation of submodels as as a mongoose document property can designate a subdocument
         * for DataSource of submodels as a mongoose document property can designate an array of subdocuments
         */
        var Model = models.Model = kendo.data.Model.define({

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Function called in init(data) and accept(data) to parse data and convert fields to model field types
             * There are several issues with kendo.data.Model that we attempt to fix here:
             * - If data is passed to init, missing properties do not get a default value
             * - passing an ISO UTC string date as a value for a field of type date is not parsed
             * - more generally filed parse functions are not executed on default values, which is an issue with complex types
             * - events are not propagated to parents
             * @param data
             * @private
             */
            _parseData: function (data) {
                var that = this;
                // Build a set of defaults considering some default values are initializer functions
                var defaults = $.extend({}, that.defaults);
                if (that._initializers) { // when defaultValue is a function
                    for (var idx = 0; idx < that._initializers.length; idx++) {
                        var name = that._initializers[idx];
                        defaults[name] = that.defaults[name]();
                    }
                }
                // Build our parsed data, discarding any fields that does not belong to our model
                var parsed = {};
                for (var prop in that.fields) {
                    if (that.fields.hasOwnProperty(prop)) {
                        var field = that.fields[prop];
                        // Some fields get their data from another field
                        var from = field.from || prop;
                        // If from is `metrics.comments.count` we need `data`, `data.metrics` and `data.metrics.comments` to not be undefined
                        // which `true` provides as the safe option of kendo.getter
                        var value = !!data ? kendo.getter(from, true)(data) : undefined;
                        if ($.type(value) === UNDEFINED) {
                            value = defaults[prop];
                        }
                        parsed[prop] = that._parse(prop, value);
                    }
                }
                return parsed;
            },

            /* jshint +W074 */

            /**
             * Modify original init method
             * to add casting of properties into their underlying type
             * For example, if a model field of type date receives a string value, it will be cast into a date
             * and if a model field designates a submodel, it will be cast into that submodel
             * @see http://www.telerik.com/forums/parsing-on-initialization-of-kendo-data-model
             * @param data
             */
            init: function (data) {
                if (data && !(data instanceof kendo.data.Model) && $.type(data.hasSubgroups) === 'boolean' && $.isArray(data.items)) {
                    // This is called from flattenGroups in kendo.data.js when there are aggregates
                    kendo.data.Model.fn.init.call(this, data);
                } else {
                    // Call the base init method after parsing data
                    kendo.data.Model.fn.init.call(this, this._parseData(data));
                }
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
            accept: function (data) {
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
            shouldSerialize: function (field) {

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
            toJSON: function (includeDataSources) {

                var json = {};
                var value;
                var field;

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

            /* This function's cyclomatic complexity is too high */
            /* jshint -W074 */

            /**
             * Execute validation of the model data considering the rules defined on fields
             * @returns {boolean}
             */
            validate: function () {
                /* jshint maxcomplexity: 8 */
                var that = this;
                var validated = true;
                for (var field in that.fields) {
                    if (that.fields.hasOwnProperty(field)) {
                        var validation = that.fields[field].validation;
                        if (!$.isPlainObject(validation)) {
                            continue;
                        }
                        if (validation.required === true && !that[field]) { // nullable fields?
                            validated = false;
                            break;
                        }
                        if ($.type(validation.pattern) === STRING && !(new RegExp(validation.pattern)).test(that[field])) {
                            validated = false;
                            break;
                        }
                        if ($.type(validation.min) === NUMBER && !isNaN(parseFloat(that[field])) && parseFloat(that[field]) < validation.min) {
                            validated = false;
                            break;
                        }
                        if ($.type(validation.max) === NUMBER && !isNaN(parseFloat(that[field])) && parseFloat(that[field]) > validation.max) {
                            validated = false;
                            break;
                        }
                    }
                }
                return validated; // Should we return an array of errors instead
            }

            /* jshint +W074 */

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
            init: function (reader) {
                this.reader = reader;
                if (reader.model) {
                    this.model = reader.model;
                }
            },
            errors: function (data) {
                return this.reader.errors(data);
            },
            parse: function (data) {
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
            data: function (data) {
                // We get funny values from the original kendo.data.DataReader
                // due to the getters in the convertRecords(...) function in kendo.data.js
                // especially with page components
                // This can be checked by commenting the if block in the parse function
                // Note: we did the fix in the parse function so as to apply to this.data and this.groups.
                return this.reader.data(data);
            },
            total: function (data) {
                return this.reader.total(data);
            },
            groups: function (data) {
                return this.reader.groups(data);
            },
            aggregates: function (data) {
                return this.reader.aggregates(data);
            },
            serialize: function (data) {
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
                var data = this._data;
                var result = kendo.data.DataSource.fn[name].apply(this, [].slice.call(arguments));

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
            toJSON: function () {
                var json = [];
                // total() give the total number of items, all of which are not necessarily available considering paging
                // for (var i = 0; i < this.total(); i++) {
                for (var i = 0; i < this.data().length; i++) {
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

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Constructor
             * @param component
             */
            init: function (component) {

                var that = this;

                // Note: Kendo UI requires that new PageComponent() works, i.e. component = undefined
                if ($.type(component) === OBJECT /*&& !$.isEmptyObject(component)*/) {
                    assert.instanceof(kendo.Observable, kidoju.tools, kendo.format(assert.messages.instanceof.default, 'kidoju.tools', 'kendo.Observable'));
                    if ($.type(component.tool) !== STRING || component.tool.length === 0 || !(kidoju.tools[component.tool] instanceof kidoju.Tool)) {
                        throw new Error(kendo.format('`{0}` is not a valid Kidoju tool', component.tool));
                    }
                }

                Model.fn.init.call(that, component);

                if (kidoju.tools && $.type(that.tool) === STRING && that.tool.length) {

                    var tool = kidoju.tools[that.tool];
                    if (tool instanceof kidoju.Tool) {

                        // Let the tool build a Model for attributes to allow validation in the property grid
                        var Attributes = tool._getAttributeModel();
                        // Extend component attributes with possible new attributes as tools improve
                        var attributes = $.extend({}, Attributes.prototype.defaults, that.attributes);
                        // Cast with Model
                        // that.set('attributes', new Attributes(attributes)); // <--- this sets the dirty flag and raises the change event
                        that.attributes = new Attributes(attributes);
                        that.attributes.bind(CHANGE, function (e) {
                            e.field = 'attributes.' + e.field;
                            that.trigger(CHANGE, e);
                        });

                        // Let the tool build a Model for properties to allow validation in the property grid
                        var Properties = tool._getPropertyModel();
                        // Extend component properties with possible new properties as tools improve
                        var properties = $.extend({}, Properties.prototype.defaults, that.properties);
                        // Cast with Model
                        // that.set('properties', new Properties(properties)); // <--- this sets the dirty flag and raises the change event
                        that.properties = new Properties(properties);
                        that.properties.bind(CHANGE, function (e) {
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
            /* jshint +W074 */

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
            },

            /**
             * Clone a page component
             */
            clone: function () {
                var component = this;
                assert.type(STRING, component.tool, kendo.format(assert.messages.type.default, 'component.tool', STRING));
                var fields = component.fields;
                var clone = {};
                // Copy page component fields (tool, top, left, height, width, rotate, ...), but not attributes and properties
                for (var field in fields) {
                    // copy any field where fields[field].type is a string including 'boolean', 'number' and 'string' (i.e. not undefined)
                    if (fields.hasOwnProperty(field) && $.type(fields[field].type) === STRING && field !== component.idField) {
                        clone[field] = component.get(field);
                    }
                }
                // Copy display attributes
                fields = component.attributes.fields;
                clone.attributes = {};
                for (/*var */field in fields) {
                    if (fields.hasOwnProperty(field)) {
                        clone.attributes[field] = JSON.parse(JSON.stringify(component.get('attributes.' + field)));
                    }
                }
                // copy some property attributes
                fields = component.properties.fields;
                clone.properties = {};
                for (/*var */field in fields) {
                    // Copying validation can be fairly complex depending on the use of all, considering components need to change name
                    if (fields.hasOwnProperty(field) && ['name', 'question', 'solution', 'validation', 'success', 'failure', 'omit'].indexOf(field) === -1) {
                        clone.properties[field] = JSON.parse(JSON.stringify(component.get('properties.' + field)));
                    }
                }
                // Return clone
                return new PageComponent(clone);
            },

            /**
             * PageComponent validation
             * @param pageIdx (in PageCollection)
             */
            validate: function (pageIdx) {
                assert.instanceof (PageComponent, this, kendo.format(assert.messages.instanceof.default, 'this', 'kidoju.data.PageComponent'));
                assert.type(NUMBER, pageIdx, kendo.format(assert.messages.type.default, 'pageIdx', NUMBER));
                assert.instanceof(kendo.Observable, kidoju.tools, kendo.format(assert.messages.instanceof.default, 'kidoju.tools', 'kendo.Observable'));
                var component = this;
                var ret = [];
                var tool = component.get('tool');
                assert.type(STRING, tool, kendo.format(assert.messages.type.default, 'tool', STRING));
                if (kidoju.tools[tool] instanceof kidoju.Tool) {
                    ret = kidoju.tools[tool].validate(component, pageIdx);
                }
                return ret;
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

            var dataSource = options || {};
            var data = dataSource.data;

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
                components: {
                    // We cannot assign a data source as default value of a model
                    // because otherwise it might be reused amongst instances.
                    // The only way to ensure that a new instance gets a new default value is to initialize with []
                    // and have kidoju.data.Model._parseData initialize the instance data source from [].
                    // defaultValue: new kidoju.data.PageComponentCollectionDataSource({ data: [] }),
                    defaultValue: [],
                    parse: function (value) {
                        if (value instanceof PageComponentCollectionDataSource) {
                            return value;
                        } else if (value && value.push) {
                            return new PageComponentCollectionDataSource({ data: value });
                        } else {
                            return new PageComponentCollectionDataSource(value);
                        }
                    }
                },
                explanations: { // displayed in review mode
                    type: STRING
                },
                instructions: { // displayed in explanation mode
                    type: STRING
                },
                style: {
                    type: STRING
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
                components.one(CHANGE, $.proxy(function () { this.loaded(true); }, this));
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
            },

            /**
             * Clone a page
             */
            clone: function () {
                var page = this;
                var fields = page.fields;
                var clone = {};
                // Copy page fields (explanations, instructions, style)
                for (var field in fields) {
                    if (fields.hasOwnProperty(field) && $.type(fields[field].type) === STRING && field !== page.idField) {
                        clone[field] = page.get(field);
                    }
                }
                clone = new Page(clone);
                // Copy components
                var components = page.components;
                for (var i = 0, total = components.total(); i < total; i++) {
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
                createMultiQuizInstructions: 'Please select the options which correspond to your answers to the question: _{0}_.',
                createTextBoxExplanations: 'The correct answer is **{0}**.',
                createTextBoxInstructions: 'Please fill in the text box with your answer to the question: _{0}_.',
                createQuizExplanations: 'The correct answer is **{0}**.',
                createQuizInstructions: 'Please select the option which corresponds to your answer to the question: _{0}_.',
                emptyPage: 'Page {0} cannot be empty.',
                minConnectors: 'At least {0} Connectors are required to make a question on page {1}.',
                missingDraggable: 'Draggable Labels or Images are required for a Drop Zone on page {0}.',
                missingDropZone: 'A Drop Zone is required for draggable Labels or Images on page {0}.',
                missingLabel: 'A Label is recommended on page {0}.',
                missingMultimedia: 'A multimedia element (Image, Audio, Video) is recommended on page {0}.',
                missingQuestion: 'A question is recommended on page {0}.',
                missingSelectable: 'Selectable Labels or Images are required for a Selector on page {0}.',
                missingSelector: 'A Selector is required for selectable Labels or Images on page {0}.',
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
            validate: function (pageIdx) {
                /* jshint maxcomplexity: 24 */
                assert.instanceof (Page, this, kendo.format(assert.messages.instanceof.default, 'this', 'kidoju.data.Page'));
                assert.type(NUMBER, pageIdx, kendo.format(assert.messages.type.default, 'pageIdx', NUMBER));
                // TODO also validate that formulas only use values available on the page
                var ret = [];
                var hasDraggable = false;
                var hasDropZone = false;
                var hasSelectable = false;
                var hasSelector = false;
                var hasLabel = false;
                var hasMultimedia = false;
                var hasQuestion = false;
                var connectorCount = 0;
                var componentTotal = this.components.total();
                if (componentTotal === 0) {
                    ret.push({ type: ERROR, index: pageIdx, message: kendo.format(this.messages.emptyPage, pageIdx + 1) });
                }
                for (var i = 0; i < componentTotal; i++) {
                    var component = this.components.at(i);
                    if (component.tool === 'connector') {
                        connectorCount++;
                    }
                    hasDraggable = hasDraggable || ($.type(component.properties) ===  OBJECT && component.properties.behavior === 'draggable');
                    hasDropZone = hasDropZone || (component.tool === 'dropzone');
                    hasLabel = hasLabel || (component.tool === 'label');
                    hasMultimedia = hasMultimedia || (component.tool === 'image' || component.tool === 'audio' || component.tool === 'video');
                    hasSelectable = hasSelectable || ($.type(component.properties) ===  OBJECT && component.properties.behavior === 'selectable');
                    hasSelector = hasSelector || (component.tool === 'selector');
                    hasQuestion = hasQuestion || ($.type(component.properties) ===  OBJECT && $.type(component.properties.validation) === STRING && component.properties.validation.length);
                    ret = ret.concat(component.validate(pageIdx));
                }
                // Check a label
                if (componentTotal > 0 && !hasLabel) {
                    ret.push({ type: WARNING, index: pageIdx, message: kendo.format(this.messages.missingLabel, pageIdx + 1) });
                }
                // Check a multimedia element
                /*
                if (componentTotal > 0 && !hasMultimedia) {
                    ret.push({ type: WARNING, index: pageIdx, message: kendo.format(this.messages.missingMultimedia, pageIdx + 1) });
                }
                */
                // Check a question
                if (componentTotal > 0 && !hasQuestion) {
                    ret.push({ type: WARNING, index: pageIdx, message: kendo.format(this.messages.missingQuestion, pageIdx + 1) });
                }
                // Check connectors
                var MIN_CONNECTORS = 4;
                if (connectorCount > 0 && connectorCount < MIN_CONNECTORS) {
                    ret.push({ type: WARNING, index: pageIdx, message: kendo.format(this.messages.minConnectors, MIN_CONNECTORS, pageIdx + 1) });
                }
                // Check drop zone and draggable
                if (hasDropZone && !hasDraggable) {
                    ret.push({ type: ERROR, index: pageIdx, message: kendo.format(this.messages.missingDraggable, pageIdx + 1) });
                } else if (!hasDropZone && hasDraggable) {
                    ret.push({ type: ERROR, index: pageIdx, message: kendo.format(this.messages.missingDropZone, pageIdx + 1) });
                }
                // Check selectors and selectable
                if (hasSelector && !hasSelectable) {
                    ret.push({ type: ERROR, index: pageIdx, message: kendo.format(this.messages.missingSelectable, pageIdx + 1) });
                } else if (!hasSelector && hasSelectable) {
                    ret.push({ type: ERROR, index: pageIdx, message: kendo.format(this.messages.missingSelector, pageIdx + 1) });
                }
                // Check instructions
                var instructions = (this.get('instructions') || '').trim();
                if (!instructions) {
                    ret.push({ type: WARNING, index: pageIdx, message: kendo.format(this.messages.missingInstructions, pageIdx + 1) });
                }
                // Check explanations
                var explanations = (this.get('explanations') || '').trim();
                if (!explanations) {
                    ret.push({ type: WARNING, index: pageIdx, message: kendo.format(this.messages.missingExplanations, pageIdx + 1) });
                }
                return ret;
            }

            /* jshint +W074 */

        });

        /**
         * createTextBoxPage
         */
        Page.createTextBoxPage = function (options) {
            assert.isPlainObject(options, assert.format(assert.messages.isPlainObject.default, 'options'));
            assert.type(STRING, options.question, assert.format(assert.messages.type.default, options.question, STRING));
            assert.type(STRING, options.solution, assert.format(assert.messages.type.default, options.solution, STRING));
            var solutions = options.solution.split('\n')
                .filter(function (item) {
                    return item.trim() !== '';
                });
            var escaped = solutions.map(kidoju.util.escapeRegExp);
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
                            validation: solutions.length > 1 ?
                                '// ignoreCaseMatch ' + JSON.stringify(['^(?:' + escaped.join('|') + ')$']) :
                                '// ignoreCaseEqual'
                        }
                    })

                ],
                instructions: kendo.format(Page.prototype.messages.createTextBoxInstructions, options.question),
                explanations: kendo.format(Page.prototype.messages.createTextBoxExplanations, solutions[0])
            });
        };

        /**
         * createQuizPage
         */
        Page.createQuizPage = function (options) {
            assert.isPlainObject(options, assert.format(assert.messages.isPlainObject.default, 'options'));
            assert.type(STRING, options.question, assert.format(assert.messages.type.default, options.question, STRING));
            assert.isArray(options.data, assert.format(assert.messages.isArray.default, options.data));
            assert.type(STRING, options.solution, assert.format(assert.messages.type.default, options.solution, STRING));
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
                instructions: kendo.format(Page.prototype.messages.createQuizInstructions, options.question),
                explanations: kendo.format(Page.prototype.messages.createQuizExplanations, options.solution)
            });
        };

        /**
         * createMultiQuizPage
         */
        Page.createMultiQuizPage = function (options) {
            assert.isPlainObject(options, assert.format(assert.messages.isPlainObject.default, 'options'));
            assert.type(STRING, options.question, assert.format(assert.messages.type.default, options.question, STRING));
            assert.isArray(options.data, assert.format(assert.messages.isArray.default, options.data));
            // TODO Check that options.data has text and image
            assert.isArray(options.solution, assert.format(assert.messages.isArray.default, options.solution));
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
                instructions: kendo.format(Page.prototype.messages.createQuizInstructions, options.question),
                explanations: kendo.format(Page.prototype.messages.createMultiQuizExplanations, options.solution.join('**,\n- **'))
            });
        };

        /**
         * WorkerPool
         * @class WorkerPool
         * @param concurrency
         * @param timeOut
         */
        var WorkerPool = models.WorkerPool = function (concurrency, timeOut) {
            // concurrency = concurrency || navigator.hardwareConcurrency || 4;
            // Array of concurrent working threads
            var workers = new Array(concurrency);
            // Queue of tasks
            var tasks = [];
            // Array of deferreds
            var deferreds = [];
            // State of worker pool
            var running = false;

            /**
             * Helper function to chain tasks on a thread
             * Note: thread is a number between 0 and concurrency - 1 which designates an entry in the workers array
             * @param thread
             */
            function runNextTask(thread) {
                logger.debug({
                    message: 'Run next workerpool task on thread ' + thread,
                    method: 'WorkerPool.runNextTask'
                });
                if (tasks.length > 0) {
                    var task = tasks.shift();
                    workers[thread] = new Worker(task.script);
                    workers[thread].onmessage = function (e) {
                        deferreds[task.id].resolve({ name: task.name, value: e.data });
                        // workers[thread].terminate();
                        window.URL.revokeObjectURL(task.script);
                        runNextTask(thread);
                    };
                    workers[thread].onerror = function (e) {
                        // e is an ErrorEvent and e.error is null
                        var error = new Error(e.message || 'Unknown error');
                        error.taskname = task.name;
                        error.filename = e.filename;
                        error.colno = e.colno;
                        error.lineno = e.lineno;
                        deferreds[task.id].reject(error);
                        // workers[thread].terminate();
                        window.URL.revokeObjectURL(task.script);
                        logger.crit(error);
                        // No need to run next task because $.when fails on the first failing deferred
                        // runNextTask(thread);
                    };
                    // We need JSON.stringify because of a DataCloneError with character grid values
                    workers[thread].postMessage(JSON.stringify(task.message));
                    if ($.type(timeOut) === 'number') {
                        setTimeout(function () {
                            if (deferreds[task.id].state() === 'pending') {
                                var error = new Error('The execution of a web worker has timed out');
                                error.taskname = task.name;
                                error.filename = task.script;
                                error.timeout = true;
                                deferreds[task.id].reject(error);
                                workers[thread].terminate();
                                window.URL.revokeObjectURL(task.script);
                                logger.crit(error);
                                // No need to run next task because $.when fails on the first failing deferred
                                // runNextTask(thread);
                            }
                        }, timeOut);
                    }
                }
            }

            /***
             * Add a task to the queue
             * @param name
             * @param script
             * @param message
             */
            this.add = function (name, script, message) {
                if (running) {
                    throw new Error('Cannot add to running pool');
                }
                tasks.push({ name: name, script: script, message: message, id: tasks.length });
                deferreds.push($.Deferred());
            };

            /**
             * Run the work pool
             * Note: Add all tasks first
             * @returns {*}
             */
            this.run = function () {
                if (running) {
                    throw new Error('A worker pool cannot be executed twice');
                }
                running = true;
                // Start each pool
                for (var poolId = 0; poolId < workers.length; poolId++) {
                    runNextTask(poolId);
                }
                // Return an array of deferreds
                return $.when.apply($, deferreds);
            };
        };

        /**
         * BaseTest model
         */
        /*
         var BaseTest = models.BaseTest = Model.define({
            fields: {
                interactions: {
                    type: undefined;
                    defaultValue: []
                }
                // Other fields are defined dynamically in getTestFromProperties
            },
            // TODO considering:
            // 1) Ability to validate one page vs all pages
            // 2) Limatation of all to fields on teh same page
         });
         */


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
                assert.instanceof(kendo.Observable, kidoju.tools, kendo.format(assert.messages.instanceof.default, 'kidoju.tools', 'kendo.Observable'));
                var that = this;
                var tools = kidoju.tools;
                var test = {
                    // Store for interactions
                    interactions: []
                };
                $.each(that.data(), function (pageIdx, page) {
                    $.each(page.components.data(), function (componentIdx, component) {
                        var properties = component.properties;
                        if (properties instanceof kendo.data.Model &&
                            $.type(properties.fields) === OBJECT && !$.isEmptyObject(properties.fields) &&
                            $.type(properties.name) === STRING && $.type(properties.validation) === STRING) {
                            var tool = kidoju.tools[component.tool];
                            assert.instanceof(kidoju.Tool, tool, kendo.format(assert.messages.instanceof.default, 'tool', 'kidoju.Tool'));
                            test[properties.name] = { value: tool.getTestDefaultValue(component) };
                        }
                    });
                });
                return test;
            },

            /**
             * Validate user test data
             * IMPORTANT: Make sure all pages are loaded first
             * @method validateTestFromProperties
             * @returns {*}
             */
            validateTestFromProperties: function (test) {

                // Note: the model being created on the fly (no kendo.data.Model)), we only have an ObservableObject to test
                assert.instanceof(kendo.data.ObservableObject, test, kendo.format(assert.messages.instanceof.default, 'test', 'kendo.data.ObservableObject'));

                var pageCollectionDataSource = this; // don't use that which is used below
                var deferred = $.Deferred();
                var workerPool = new WorkerPool((window.navigator.hardwareConcurrency || 2) - 1, workerTimeout());
                // TODO: use an app.model and define a submodel with each field - see BaseTest above
                var result = {
                    interactions: test.interactions,
                    score: function () {
                        var score = 0;
                        assert.instanceof(kendo.data.ObservableObject, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.data.ObservableObject'));
                        for (var name in this) {
                            if (this.hasOwnProperty(name) && RX_VALID_NAME.test(name) && !this.get(name + '.disabled')) {
                                score += this.get(name + '.score');
                            }
                        }
                        return score;
                    },
                    max: function () {
                        var max = 0;
                        assert.instanceof(kendo.data.ObservableObject, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.data.ObservableObject'));
                        for (var name in this) {
                            if (this.hasOwnProperty(name) && RX_VALID_NAME.test(name) && !this.get(name + '.disabled')) {
                                max += this.get(name + '.success');
                            }
                        }
                        return max;
                    },
                    percent: function () {
                        assert.instanceof(kendo.data.ObservableObject, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.data.ObservableObject'));
                        var max = this.max();
                        var score = this.score();
                        return score === 0 || max === 0 ?  0 : 100 * score / max;
                    },
                    getScoreArray: function () {
                        assert.instanceof(kendo.data.ObservableObject, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.data.ObservableObject'));
                        var that = this; // this is variable `result`
                        var scoreArray = [];
                        for (var name in that) {
                            if (that.hasOwnProperty(name) && RX_VALID_NAME.test(name) && !this.get(name + '.disabled')) {
                                var testItem = that.get(name);
                                var scoreItem = testItem.toJSON();
                                // Improved display of values in score grids
                                scoreItem.value = testItem.value$();
                                scoreItem.solution = testItem.solution$();
                                scoreArray.push(scoreItem);
                            }
                        }
                        return scoreArray;
                    },
                    toJSON: function () {
                        var json = {};
                        assert.instanceof(kendo.data.ObservableObject, this, kendo.format(assert.messages.instanceof.default, 'this', 'kendo.data.ObservableObject'));
                        for (var name in this) {
                            if (this.hasOwnProperty(name)) {
                                if (RX_VALID_NAME.test(name)) {
                                    json[name] = {
                                        result: this.get(name + '.result'),
                                        score: this.get(name + '.score'),
                                        value: this.get(name + '.value')
                                    };
                                } else if (name === 'interactions') {
                                    json[name] = this.get(name).toJSON(); // .slice();
                                }
                            }
                        }
                        return json;
                    }
                };

                // Flatten test for validation formulas
                var all = test.toJSON();
                delete all.interactions;
                for (var prop in all) {
                    if (all.hasOwnProperty(prop) && $.type(all[prop]) === OBJECT) {
                        if (all[prop].value === null) {
                            // tools built upon kendo ui widgets cannot have undefined values because value(undefined) === value() so they use null
                            all[prop] = undefined; // TODO use undefined or null? we should probably use null for unanswered tests
                        } else {
                            all[prop] = all[prop].value;
                        }
                    }
                }

                // TODO we might even consider storing workerLib in session storage considering https://addyosmani.com/basket.js/
                var app = window.app;
                // Loading workerLib via $.ajax fails in Cordova applications
                // See: https://www.scirra.com/blog/ashley/25/hacking-something-useful-out-of-wkwebview
                // See: http://stackoverflow.com/questions/39527101/wkwebview-web-worker-throws-error-dom-exception-18-returns-an-error
                $.ajax({ url: (app && app.uris && app.uris.webapp && app.uris.webapp.workerlib) || workerLibPath, cache: true, dataType: 'text' })
                    .done(function (workerLib) {
                        logger.debug({
                            message: 'workerLib downloaded',
                            method: 'PageCollectionDataSource.validateTestFromProperties',
                            data: { path: (app && app.uris && app.uris.webapp && app.uris.webapp.workerlib) || workerLibPath }
                        });
                        // Add tasks to the worker pool
                        // Iterate through pages
                        $.each(pageCollectionDataSource.data(), function (pageIdx, page) {
                            // Iterate through page components
                            $.each(page.components.data(), function (componentIdx, component) {

                                // List component properties
                                var properties = component.properties;
                                assert.instanceof(kendo.data.Model, properties, kendo.format(assert.messages.instanceof.default, 'properties', 'kendo.data.Model'));
                                assert.type(OBJECT, properties.fields, kendo.format(assert.messages.type.default, 'properties.fields', OBJECT));

                                // If our component has a name property to record the result of a test interaction
                                // Note: some components like textboxes have properties, others likes labels and images don't
                                // assert.type(STRING, properties.name, kendo.format(assert.messages.type.default, 'properties.name', STRING));
                                if ($.type(properties.name) === STRING && $.type(properties.validation) === STRING) {
                                    var code;
                                    var libraryMatches = properties.validation.match(RX_VALIDATION_LIBRARY);
                                    if ($.isArray(libraryMatches) && libraryMatches.length === 4) {
                                        // Find libraryMatches[1] in the code library
                                        // Array.find is not available in Internet Explorer, thus the use of Array.filter
                                        var found = properties._library.filter(function (item) {
                                            return item.name === libraryMatches[1];
                                        });
                                        assert.isArray(found, kendo.format(assert.messages.isArray.default, 'found'));
                                        assert.hasLength(found, kendo.format(assert.messages.hasLength.default, 'found'));
                                        found = found[0];
                                        assert.isPlainObject(found, kendo.format(assert.messages.isPlainObject.default, 'found'));
                                        assert.type(STRING, found.formula, kendo.format(assert.messages.type.default, 'found.formula', STRING));
                                        // libraryMatches[3] is the param value beginning with ` ["` and ending with `"]`
                                        var paramValue = libraryMatches[3];
                                        if ($.type(found.param) === STRING && $.type(paramValue) === STRING  && paramValue.length > '[]'.length) {
                                            // Get the  paramValue in the JSON array
                                            paramValue = JSON.parse(paramValue)[0];
                                        }
                                        // This is code from the library possibly with param
                                        // When we shall have several params, consider kendo.format.apply(this, [paramValue])
                                        code = kendo.format(found.formula, paramValue);
                                    } else {
                                        // This is custom code not form the library
                                        code = properties.validation;
                                    }

                                    // Note: when e.data.value is undefined, we need to specifically call postMessage(undefined) instead of postMessage() otherwise we get the following error:
                                    // Uncaught TypeError: Failed to execute 'postMessage' on 'DedicatedWorkerGlobalScope': 1 argument required, but only 0 present.
                                    var blob = new Blob([
                                        // 'self.importScripts("' + workerLibPath + '");\n' +
                                        workerLib + ';\n' +
                                        'self.onmessage = function (e) {\n' + code + '\nvar data=JSON.parse(e.data);\nif (typeof data.value === "undefined") { self.postMessage(undefined); } else { self.postMessage(validate(data.value, data.solution, data.all)); } self.close(); };'
                                    ], { type: 'application/javascript' });
                                    var blobURL = window.URL.createObjectURL(blob);

                                    logger.debug({
                                        message: 'blob created for ' + properties.name,
                                        method: 'PageCollectionDataSource.validateTestFromProperties',
                                        data: { blobURL: blobURL, property: properties.name }
                                    });

                                    // Queue task into worker pool with name, script, and value to be posted to script
                                    if (!properties.disabled) {
                                        workerPool.add(
                                            properties.name,
                                            blobURL,
                                            {
                                                value: all[properties.name],
                                                solution: properties.solution,
                                                all: all // all properties - TODO should be page properties only
                                            }
                                        );

                                        // Update result
                                        result[properties.name] = {
                                            page: pageIdx,
                                            name: properties.name,
                                            question: properties.question,
                                            tool: component.tool,
                                            value: test[properties.name].value,
                                            solution: properties.solution,
                                            result: undefined,
                                            omit: properties.omit,
                                            failure: properties.failure,
                                            success: properties.success,
                                            // disabled: properties.disabled,
                                            // Functions used by getScoreArray for improved display in score grid
                                            value$: function () {
                                                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'PageComponent'));
                                                assert.instanceof(kendo.Observable, kidoju.tools, kendo.format(assert.messages.instanceof.default, 'kidoju.tools', 'kendo.Observable'));
                                                var tool = kidoju.tools[component.tool]; // also this.tool
                                                assert.instanceof(kidoju.Tool, tool, kendo.format(assert.messages.instanceof.default, 'tool', 'kidoju.Tool'));
                                                return tool.value$(this);
                                            },
                                            solution$: function () {
                                                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'PageComponent'));
                                                assert.instanceof(kendo.Observable, kidoju.tools, kendo.format(assert.messages.instanceof.default, 'kidoju.tools', 'kendo.Observable'));
                                                var tool = kidoju.tools[component.tool]; // also this.tool
                                                assert.instanceof(kidoju.Tool, tool, kendo.format(assert.messages.instanceof.default, 'tool', 'kidoju.Tool'));
                                                return tool.solution$(this);
                                            }
                                        };

                                        logger.debug({
                                            message: properties.name + ' added to the worker pool',
                                            method: 'PageCollectionDataSource.validateTestFromProperties',
                                            data: { blobURL: blobURL, property: properties.name }
                                        });
                                    }
                                }
                            });
                        });

                        logger.debug({
                            message: 'Run the worker pool',
                            method: 'PageCollectionDataSource.validateTestFromProperties'
                        });

                        // Run the worker pool
                        workerPool.run()
                            .done(function () {
                                // iterate through recorded answer validations (arguments)
                                // for each named value
                                $.each(arguments, function (index, argument) {
                                    // store the result which is success, failure or omitted (undefined)
                                    result[argument.name].result = argument.value;
                                    // store the score depending on the result
                                    switch (argument.value) {
                                        case true: // success
                                            if (result[argument.name] && $.type(result[argument.name].success) === NUMBER) {
                                                result[argument.name].score = result[argument.name].success;
                                            }
                                            break;
                                        case false: // failure
                                            if (result[argument.name] && $.type(result[argument.name].failure) === NUMBER) {
                                                result[argument.name].score = result[argument.name].failure;
                                            }
                                            break;
                                        default: // undefined (omitted)
                                            if (result[argument.name] && $.type(result[argument.name].omit) === NUMBER) {
                                                result[argument.name].score = result[argument.name].omit;
                                            }
                                            break;
                                    }
                                    // calculate the total test score
                                    // result.score += result[argument.name].score;
                                    // calculate the max possible score in order to calculate a percentage
                                    // if (result[argument.name] && result[argument.name].success) {
                                    //    result.max += result[argument.name].success;
                                    // }
                                });
                                deferred.resolve(result);
                            })
                            .fail(deferred.reject);

                    })
                    .fail(deferred.reject);

                // return the test result
                return deferred.promise();
            }
        });

        /**
         * @method create
         * @param options
         */
        PageCollectionDataSource.create = function (options) {
            options = options && options.push ? { data: options } : options;

            var dataSource = options || {};
            var data = dataSource.data;

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
                    parse: function (value) {
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
                pages.one(CHANGE, $.proxy(function () { this.loaded(true); }, this));
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
            },

            /**
             * i18n Messages
             */
            messages: {
                duplicateNames: 'Delete components using the same name `{0}` on pages {1}',
                minPages: 'At least {0} pages are required to be allowed to publish.',
                minQuestions: 'At least {0} questions are required to be allowed to publish.',
                typeVariety: 'The use of at least {0} types of questions (Multiple Choice, TextBox, Connector or else) is recommended.',
                qtyVariety: 'More variety is recommended because {0:p0} of questions are of type {1}.'
            },

            /* Blocks are nested too deeply. */
            /* jshint -W073 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Stream validation
             */
            validate: function () {
                /* jshint maxcomplexity: 20 */
                assert.instanceof (Stream, this, kendo.format(assert.messages.instanceof.default, 'this', 'kidoju.data.Stream'));
                var ret = [];
                var names = {};
                var values = { _total: 0, _weight: 0 };
                // Minimum number of pages
                // var MIN_PAGES = 5;
                // var pageTotal = this.pages.total();
                // if (pageTotal < MIN_PAGES) {
                //    ret.push({ type: ERROR, index: -1, message: kendo.format(this.messages.minPages, MIN_PAGES) });
                // }
                // for (var i = 0; i < pageTotal; i++) {
                for (var i = 0, pageTotal = this.pages.total(); i < pageTotal; i++) {
                    var page = this.pages.at(i);
                    var hasConnectors = false;
                    // Count names and questions
                    for (var j = 0, componentTotal = page.components.total(); j < componentTotal; j++) {
                        var component = page.components.at(j);
                        var properties = component.properties;
                        if (properties) {
                            if ($.type(properties.name) === STRING) {
                                // Collect all pages where a name can be found in view to check that each name is only used once
                                names[properties.name] = names[properties.name] || [];
                                names[properties.name].push(i);
                            }
                            if ($.type(properties.validation) === STRING) {
                                assert.type(STRING, component.tool, kendo.format(assert.messages.type.default, 'component.tool', STRING));
                                var tool = component.tool;
                                if (tool !== 'connector' || !hasConnectors) {
                                    hasConnectors = (tool === 'connector');
                                    // Connectors go in pairs but it would not make sense to only have 2 connectors or less on a page, you need at least 4 to make a question
                                    // Accordingly, we count connectors only once per page
                                    values._total += 1;
                                    values[tool] = (values[tool] || 0) + 1;
                                }
                                values._weight += kidoju.tools[tool].weight;
                            }
                        }
                    }
                    // Validate each page
                    ret = ret.concat(page.validate(i));
                }
                // Duplicate names
                for (var name in names) {
                    if (names.hasOwnProperty(name)) {
                        var pages = names[name];
                        if ($.isArray(pages) && pages.length > 1) {
                            var index = pages[0];
                            // page numbers start at 1 when page indexes start at 0
                            pages = pages.map(function (idx) { return idx + 1; });
                            ret.push({ type: ERROR, index: index, message: kendo.format(this.messages.duplicateNames, name, pages) });
                        }
                    }
                }
                // Minimum number of questions (minimum weight)
                var MIN_WEIGHT = 8;
                if (values._weight < MIN_WEIGHT) {
                    ret.push({ type: ERROR, index: -1, message: kendo.format(this.messages.minQuestions, MIN_WEIGHT) });
                }
                // Validate toolset (which includes _total) to make sure questions are varied
                // var TYPE_VARIETY = 3;
                // if (Object.keys(questions).length <= TYPE_VARIETY) {
                //     ret.push({ type: WARNING, index: -1, message: kendo.format(this.messages.typeVariety, TYPE_VARIETY) });
                // }
                var QTY_VARIETY = 0.5;
                for (var prop in values) {
                    if (values.hasOwnProperty(prop) && prop !== '_total' && prop !== '_weight') {
                        var proportion =  values[prop] / values._total;
                        if (proportion >= QTY_VARIETY) {
                            assert.instanceof(kendo.Observable, kidoju.tools, kendo.format(assert.messages.instanceof.default, 'kidoju.tools', 'kendo.Observable'));
                            ret.push({ type: WARNING, index: -1, message: kendo.format(this.messages.qtyVariety, proportion, kidoju.tools[prop].description) });
                        }
                    }
                }
                return ret;
            }

            /* jshint +W074 */
            /* jshint +W073 */

        });


    }(window.jQuery));

    /* jshint +W071 */

    return kidoju;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
