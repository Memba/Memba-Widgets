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
        ZERO_GUID = '00000000-0000-0000-0000-000000000000',
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
                defaultValue: ZERO_GUID,
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
                    that.set('attributes', new Attributes(attributes));

                    //Extend item properties with possible new properties as tools improve
                    that.properties = $.extend({}, tool._initProperties(), that.properties);
                }
            }
        }/*,
        getAttributes: function() {
            //TODO: think about returning a kendo ui data.Model
            var attributes = this.get('attributes');
            if ($.type(attributes) === STRING) {
                return JSON.parse(attributes);
            } else {
                return {};
            }
        },
        getProperties: function() {
            var properties = this.get('properties');
            if ($.type(properties) === STRING) {
                return JSON.parse(properties);
            } else {
                return {};
            }
        }*/
    });

    /**
     * See kendo.scheduler.SchedulerDataReader
     * @param originalFunction
     * @returns {Function}
     */
    function wrapDataAccess(originalFunction /*,params*/) {
        return function(data) {
            data = originalFunction(data);
            //TODO: Convert data here
            return data || [];
        };
    }

    /**
     * See kendo.scheduler.SchedulerDataReader
     * @param originalFunction
     * @returns {Function}
     */
    function wrapDataSerialization(originalFunction /*,params*/) {
        return function(data) {
            if (data) {
                if (Object.prototype.toString.call(data) !== '[object Array]' && !(data instanceof ObservableArray)) {
                    data = [data];
                }
            }
            //TODO: Convert data here
            data = originalFunction(data);
            return data || [];
        };
    }

    /**
     * @class PageItemCollectionDataReader
     * @type {*}
     */
    var PageItemCollectionDataReader = Class.extend({
        init: function(schema, reader) {
            this.reader = reader;
            if (reader.model) {
                this.model = reader.model;
            }
            this.data = wrapDataAccess($.proxy(this.data, this) /*,params*/);
            this.serialize = wrapDataSerialization($.proxy(this.serialize, this) /*,params*/);
        },
        errors: function(data) {
            return this.reader.errors(data);
        },
        parse: function(data) {
            return this.reader.parse(data);
        },
        data: function(data) {
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

    /**
     * @class PageItemCollectionDataSource
     * @type {*|void|Object}
     */
    var PageItemCollectionDataSource =  kidoju.PageItemCollectionDataSource = DataSource.extend({
        init: function(options) {

            DataSource.fn.init.call(this, $.extend(true, {}, {
                schema: {
                    modelBase: PageItem,
                    model: PageItem
                }
            }, options));

            this.reader = new PageItemCollectionDataReader(this.options.schema, this.reader);
        },

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
        },

        remove: function(model) {
            return DataSource.fn.remove.call(this, model);
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
                defaultValue: ZERO_GUID,
                editable:false
            }
            //background image and color?
        },
        init: function(value) {
            var that = this;//,
                //hasItems = that.hasItems || value && value.hasItems,
                //itemsField = 'items',
                //itemsOptions = {};

            Model.fn.init.call(that, value);

            /*
            if (typeof that.items === STRING) {
                itemsField = that.items;
            }

            itemsOptions = {
                schema: {
                    data: itemsField,
                    model: {
                        hasItems: hasItems,
                        id: that.idField
                    }
                }
            };

            if (typeof that.items !== STRING) {
                $.extend(itemsOptions, that.items);
            }

            itemsOptions.data = value;

            if (!hasItems) {
                hasItems = itemsOptions.schema.data;
            }

            if (typeof hasItems === STRING) {
                hasItems = kendo.getter(hasItems);
            }

            if (isFunction(hasItems)) {
                that.hasItems = !!hasItems.call(that, that);
            }

            that._itemsOptions = itemsOptions;
            */

            that._itemsOptions = {
                data: that.items,
                schema: {
                    modelBase: PageItem,
                    model: PageItem
                }
            };

            //if (that.hasItems) {
                that._initItems();
            //}

            //that._loaded = !!(value && (value[itemsField] || value._loaded));

            that._loaded = !!(value && (value.items || value._loaded));
        },

        _initItems: function() {
            var that = this;
            var items, transport, parameterMap;

            if (!(that.items instanceof PageItemCollectionDataSource)) {
                items = that.items = new PageItemCollectionDataSource(that._itemsOptions);

                transport = items.transport;
                parameterMap = transport.parameterMap;

                transport.parameterMap = function(data) {
                    data[that.idField || 'id'] = that.id;

                    if (parameterMap) {
                        data = parameterMap(data);
                    }

                    return data;
                };

                items.parent = function(){
                    return that;
                };

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

                //that._updateItemsField();
            }
        },

        append: function(model) {
            this._initItems();
            this.loaded(true);
            this.items.add(model);
        },

        /*
        hasItems: false,

        level: function() {
            var parentNode = this.parentNode(),
                level = 0;

            while (parentNode && parentNode.parentNode) {
                level++;
                parentNode = parentNode.parentNode ? parentNode.parentNode() : null;
            }

            return level;
        },


        _updateItemsField: function() {
            var fieldName = this._itemsOptions.schema.data;

            this[fieldName || 'items'] = this.items.data();
        },
        */

        _itemsLoaded: function() {
            this._loaded = true;

            //this._updateItemsField();
        },

        load: function() {
            var options = {};
            var method = '_query';
            var items;

            //if (this.hasItems) {
                this._initItems();

                items = this.items;

                options[this.idField || 'id'] = this.id;

                if (!this._loaded) {
                    items._data = undefined;
                    method = 'read';
                }

                items.one(CHANGE, $.proxy(this._itemsLoaded, this));
                items[method](options);
            //} else {
            //    this.loaded(true);
            //}
        },

        /*
        parentNode: function() {
            var array = this.parent();

            return array.parent();
        },
        */

        loaded: function(value) {
            if (value !== undefined) {
                this._loaded = value;
            } else {
                return this._loaded;
            }
        },

        shouldSerialize: function(field) {
            return Model.fn.shouldSerialize.call(this, field) &&
                field !== 'items' &&
                field !== '_loaded' &&
                //field !== 'hasItems' &&
                field !== '_itemsOptions';
        }
    });

    /**
     * @class PageCollectionDataReader
     * @type {*}
     */
    var PageCollectionDataReader = Class.extend({
        init: function(schema, reader) {
            this.reader = reader;
            if (reader.model) {
                this.model = reader.model;
            }
            this.data = wrapDataAccess($.proxy(this.data, this) /*,params*/);
            this.serialize = wrapDataSerialization($.proxy(this.serialize, this) /*,params*/);
        },
        errors: function(data) {
            return this.reader.errors(data);
        },
        parse: function(data) {
            return this.reader.parse(data);
        },
        data: function(data) {
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

    /**
     * @class PageCollectionDataSource
     * @type {*|void|Object}
     */
    var PageCollectionDataSource =  kidoju.PageCollectionDataSource = DataSource.extend({
        init: function(options) {

            DataSource.fn.init.call(this, $.extend(true, {}, {
                schema: {
                    modelBase: Page,
                    model: Page
                }
            }, options));

            this.reader = new PageCollectionDataReader(this.options.schema, this.reader);
        },

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

        remove: function(model) {
            return DataSource.fn.remove.call(this, model);
        },

        //TODO: rename into getModelFromProperties
        getObjectFromProperties: function() {
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
                defaultValue: ZERO_GUID,
                editable:false
            }
            //background image and color?
        },
        init: function(value) {
            var that = this;//,
        }
    });


}(this, jQuery));
