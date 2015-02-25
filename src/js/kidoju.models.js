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
        DEBUG = true,
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
     * PageItem model
     * @class PageItem
     * @type {void|*}
     */
    var PageItem = kidoju.PageItem = Model.define({
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
         * @param item
         */
        init: function(item) {

            //Note: Kendo UI requires that new PageItem() works, i.e. item = undefined
            var that = this;

            if ($.type(item) === OBJECT /*&& !$.isEmptyObject(item)*/) {
                if (!kidoju.tools) {
                    throw new Error('Kidoju tools are missing');
                }
                if ($.type(item.tool) !== STRING || item.tool.length === 0 || !(kidoju.tools[item.tool] instanceof kidoju.Tool)) {
                    throw new Error(kendo.format('`{0}` is not a valid Kidoju tool', item.tool));
                }
                item = $.extend({}, that.defaults, item); //otherwise we are missing default property values
            }

            Model.fn.init.call(that, item);

            if (kidoju.tools && $.type(that.tool) === STRING && that.tool.length) {

                var tool = kidoju.tools[that.tool];
                if (tool instanceof kidoju.Tool) {

                    //Let the tool build a kendo.data.Model for attributes to allow validation in the property grid
                    var Attributes = tool._getAttributeModel(),
                    //Extend item attributes with possible new attributes as tools improve
                        attributes = $.extend({}, Attributes.prototype.defaults, that.attributes);
                    //Cast with Model
                    //that.set('attributes', new Attributes(attributes)); //<--- this sets the dirty flag and raises the change event

                    //Let the tool build a kendo.data.Model for properties to allow validation in the property grid
                    var Properties = tool._getPropertyModel(),
                    //Extend item properties with possible new properties as tools improve
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
            var itemCollection = this.parent();
            return itemCollection.parent();
        }
    });

    /**
     * @class PageItemCollectionDataSource
     * @type {*|void|Object}
     */
    var PageItemCollectionDataSource =  kidoju.PageItemCollectionDataSource = DataSource.extend({
        init: function(options) {

            var pageItem = PageItem.define({
                items: options
            });

            DataSource.fn.init.call(this, $.extend(true, {}, { schema: { modelBase: pageItem, model: pageItem } }, options));

            // If there is a necessity to transform data, there is a possibility to change the reader as follows
            // this.reader = new PageItemCollectionDataReader(this.options.schema, this.reader);
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

            if (!(model instanceof PageItem)) {
                var pageItem = model;

                model = this._createNewModel();
                model.accept(pageItem);
            }

            return DataSource.fn.insert.call(this, index, model);
        }

    });

    /**
     * @method create
     * @param options
     */
    PageItemCollectionDataSource.create = function(options) {
        options = options && options.push ? { data: options } : options;

        var dataSource = options || {},
            data = dataSource.data;

        dataSource.data = data;

        if (!(dataSource instanceof PageItemCollectionDataSource) && dataSource instanceof DataSource) {
            throw new Error('Incorrect DataSource type. Only PageItemCollectionDataSource instances are supported');
        }

        return dataSource instanceof PageItemCollectionDataSource ? dataSource : new PageItemCollectionDataSource(dataSource);
    };

    /**
     * Page node
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
         * Constructor
         * @param value
         */
        init: function(value) {
            var that = this;

            Model.fn.init.call(that, value);

            that._itemsOptions = {};

            if($.isPlainObject(that.items)) {
                $.extend(that._itemsOptions, that.items);
            }

            //if (that.schema && that.schema.model && that.schema.model.items && that.schema.model.items.transport) {
            //    $.extend(that._itemsOptions, {transport: that.schema.model.items.transport});
            //}

            if (value && $.isArray(value.items)) { //ObservableArray? PageItemDataSource?
                $.extend(that._itemsOptions, {data: value.items});
            }

            that._initItems();
            that._loaded = !!(value && (value.items || value._loaded));
        },

        _initItems: function() {
            var that = this;
            var items, transport, parameterMap;

            if (!(that.items instanceof PageItemCollectionDataSource)) {
                items = that.items = new PageItemCollectionDataSource(that._itemsOptions);

                transport = items.transport;
                parameterMap = transport.parameterMap;

                transport.parameterMap = function(data, type) {
                    data[that.idField || "id"] = that.id;

                    if (parameterMap) {
                        data = parameterMap(data, type);
                    }

                    return data;
                };

                items.parent = function(){
                    return that;
                };

                /*
                //Note there is an ambiguity on items
                //kendo ui uses items in e for the purpose of e.action
                //we use items on collections including that
                items.bind(CHANGE, function(e){
                    e.node = e.node || that;
                    that.trigger(CHANGE, e);
                });

                items.bind(ERROR, function(e){
                    var collection = that.parent();

                    if (collection) {
                        e.node = e.node || that;
                        collection.trigger(ERROR, e);
                    }
                });
                */
            }
        },

        append: function(model) {
            this._initItems();
            this.loaded(true);
            this.items.add(model);
        },

        _itemsLoaded: function() {
            this._loaded = true;
        },

        load: function() {
            var options = {};
            var method = '_query';
            var items, promise;

            //if (this.hasItems) {

                this._initItems();

                items = this.items;

                options[this.idField || 'id'] = this.id;

                if (!this._loaded) {
                    items._data = undefined;
                    method = 'read';
                }

                items.one(CHANGE, $.proxy(this._itemsLoaded, this));
                promise = items[method](options);

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
         * Gets or sets the loaded status of page items
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
                field !== 'items' &&
                field !== '_loaded' &&
                //field !== 'hasItems' &&
                field !== '_itemsOptions';
        }
    });

    /**
     * @class PageCollectionDataSource
     * @type {*|void|Object}
     */
    var PageCollectionDataSource =  kidoju.PageCollectionDataSource = DataSource.extend({
        init: function(options) {

            var page = Page.define({
                items: options
            });

            DataSource.fn.init.call(this, $.extend(true, {}, { schema: { modelBase: page, model: page } }, options));

            // If there is a necessity to transform data, there is a possibility to change the reader as follows
            // this.reader = new PageItemCollectionDataReader(this.options.schema, this.reader);
            // See kendo.scheduler.SchedulerDataReader which transforms dates with timezones

            this._attachBubbleHandlers();

        },

        _attachBubbleHandlers: function() {
            var that = this;

            that._data.bind(ERROR, function(e) {
                that.trigger(ERROR, e);
            });
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

            if (!(model instanceof Page)) {
                var page = model;

                model = this._createNewModel();
                model.accept(page);
            }

            return DataSource.fn.insert.call(this, index, model);
        },

        /**
         * Get an assessment object from properties
         * @returns {*}
         */
        getObjectFromProperties: function() {

            //TODO: use $.when.apply($, promises).then(...)

            var obj = {},
                pages = this.data();
            for (var i = 0; i < pages.length; i++) {
                pages[i].load();
                var items = pages[i].items.data();
                for (var j = 0; j < items.length; j++) {
                    var properties = items[j].properties || {};
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
         *
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

            //Save page items
            $.each(that.pages.data(), function(index, page) {
                promises.push(page.items.sync());
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
