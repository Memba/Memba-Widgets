/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function(f, define){
    'use strict';
    define(['./vendor/kendo/kendo.core', './vendor/kendo/kendo.data', './kidoju.tools'], f);
})(function(){

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo,
            //Class = kendo.Class,
            Model = kendo.data.Model,
            DataSource = kendo.data.DataSource,
            //ObservableArray = kendo.data.ObservableArray,
            kidoju = window.kidoju = window.kidoju || {},

            //Types
            OBJECT = 'object',
            STRING = 'string',
            NUMBER = 'number',
            //DATE = 'date',
            //BOOLEAN = 'boolean',

            //Event
            CHANGE = 'change',
            ERROR = 'error',

            //Defaults
            ZERO_NUMBER = 0,
            NEGATIVE_NUMBER = -1,

            //Miscellaneous
            RX_VALID_NAME = /^[a-z][a-z0-9_]{3,}$/i;

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.data: ' + message);
            }
        }

        function dataMethod(name) {
            return function() {
                var data = this._data,
                    result = DataSource.fn[name].apply(this, [].slice.call(arguments));

                if (this._data !== data) {
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
            /* jshint -W074 */
            /* This function's cyclomatic complexity is too high. */
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
            /* jshint: +W074 */

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
                        data[that.idField || 'id'] = that.id;

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

                /*
                var SubPage = Page.define({
                    components: options
                });
                DataSource.fn.init.call(this, $.extend(true, {}, { schema: { modelBase: SubPage, model: SubPage } }, options));
                */

                DataSource.fn.init.call(this, $.extend(true, {}, { schema: { modelBase: Page, model: Page } }, options));

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
             * Get empty user test data from properties
             * IMPORTANT: Make sure all pages are loaded first
             * @method getTestFromProperties
             * @returns {*}
             */
            getTestFromProperties: function() {
                var that = this,
                    test = {};
                $.each(that.data(), function(index, page) {
                    $.each(page.components.data(), function(index, component) {
                        var properties = component.properties;
                        if (properties instanceof kendo.data.Model &&
                            $.type(properties.fields) === OBJECT && !$.isEmptyObject(properties.fields) &&
                            $.type(properties.name) === STRING) {
                            test[properties.name] = undefined;
                        }
                    });
                });
                //TODO Consider returning an object cast with a model with type, default value and validation?
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
            validateNamedValue: function(name, code, value, solution) {
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
                //TODO: Add prerequisites (some custom helpers)
                var blob = new Blob(['onmessage=function(e){' + code + 'if(typeof(e.data.value)==="undefined"){postMessage(e.data.value);}else{postMessage(validate(e.data.value,e.data.solution));}self.close();}']);
                var blobURL = window.URL.createObjectURL(blob);
                var worker = new Worker(blobURL);
                worker.onmessage = function (e) {
                    dfd.resolve({ name: name, result: e.data });
                };
                worker.onerror = function (err) {
                    dfd.reject(err);
                };
                worker.postMessage({value: value, solution: solution});
                //terminate long workers (>50ms)
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
            validateTestFromProperties: function(test) {
                if($.type(test) !== OBJECT){
                    return undefined;
                }

                var that = this,
                    deferred = $.Deferred(),
                    promises = [],
                    result = {
                        score: 0,
                        max: 0,
                        percent: function() {
                            var max, score;
                            if (this instanceof kendo.data.ObservableObject) {
                                max = this.get('max'); score = this.get('score');
                            } else {
                                max = this.max; score = this.score;
                            }
                            return score === 0 || max === 0 ?  kendo.toString(0, 'p0') : kendo.toString(score/max, 'p0');
                        },
                        getScoreArray: function() {
                            var array = [];
                            for (var name in this) {
                                if(/^val_/.test(name) && this.hasOwnProperty(name)) {
                                    array.push(this[name]);
                                }
                            }
                            return array;
                        }
                    };

                $.each(that.data(), function(index, page) {
                    $.each(page.components.data(), function(index, component) {
                        var properties = component.properties,
                            name, code, value, solution;
                        if (properties instanceof kendo.data.Model &&
                            $.isPlainObject(properties.fields) && !$.isEmptyObject(properties.fields) && $.type(properties.name) === STRING) {
                            promises.push(that.validateNamedValue(
                                properties.name,        //name
                                properties.validation,  //code
                                test[properties.name],  //value
                                properties.solution     //solution
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
                    .done(function() {
                        $.each(arguments, function(index, argument) {
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
                            //if(result.max) {
                            //    result.percent = result.score/result.max;
                            //}
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
                        data[that.idField || 'id'] = that.id;

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


    }(window.jQuery));

    return window.kidoju;

}, typeof define === 'function' && define.amd ? define : function(_, f){ 'use strict'; f(); });
