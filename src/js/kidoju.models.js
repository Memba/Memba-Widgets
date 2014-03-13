/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function ($, undefined) {

    "use strict";

    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        data = kendo.data,
        kidoju = global.kidoju = global.kidoju || {},

        //Types
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


    /**
     * PageItem model
     * @class PageItem
     * @type {void|*}
     */
    var PageItem = kidoju.PageItem = data.Model.define({
        id: 'id',
        fields: {
            id: {
                type: STRING,
                defaultValue: ZERO_GUID,
                editable: false
            },
            tool: {
                type: STRING,
                editable: false
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
            //TODO: check whether we can have a properties field of type OBJECT
            properties: {
                type: STRING,
                defaultValue: JSON.stringify({}),
                parse: function (value) {
                    //Enforce valid JSON
                    try {
                        JSON.parse(value);
                        return value;
                    }
                    catch(e) {
                        return JSON.stringify({});
                    }
                }
            },
            dataFields: {
                type: STRING,
                defaultValue: JSON.stringify({}),
                parse: function (value) {
                    //Enforce valid JSON
                    try {
                        JSON.parse(value);
                        return value;
                    }
                    catch(e) {
                        return JSON.stringify({});
                    }
                }
            }/*,
            defaults: {
                type: STRING
                //parse: function (value) { return value; }
            },
            solutions: {
                type: STRING
                //parse: function (value) { return value; }
            }
            */
        },
        //See SchedulerEvent and Node in kendo.all.js
        init: function(item) {
            var that = this;
            //If we call the following, somme properties are not initialized
            //kendo.data.Model.fn.init.call(that, item);
            kendo.data.Model.fn.init.call(that, undefined);
            for (var prop in item) {
                if (item.hasOwnProperty(prop)) {
                    that[prop] = item[prop];
                }
            }
            if (kidoju.tools && $.type(that.tool) === STRING) {
                var tool = kidoju.tools[that.tool];
                if (tool instanceof kidoju.Tool) {
                    var properties = tool._getProperties();
                    try {
                        //the tool might have been updated to implement some new properties
                        $.extend(properties, JSON.parse(that.properties));
                    } catch (err) {}
                    that.properties = JSON.stringify(properties);
                }
            }
        },
        update: function(item) {
            for (var field in item) {
                this.set(field, item[field]);
            }
        },
        prop: function(key, value) {
            if (value !== undefined) {
                var properties = this.getProperties();
                properties[key] = value;
                this.set('properties', JSON.stringify(properties));
            } else {
                var properties = this.getProperties();
                return properties[key];
            }
        },
        getProperties: function() {
            var props = this.get('properties');
            if ($.type(props) === STRING) {
                return JSON.parse(props);
            } else {
                return {};
            }
        },
        /*
        data: function(key, value) {
            //TODO
            throw new Error('Not implemented');
        },*/
        getDataFields: function() {
            var data = this.get('dataFields');
            if ($.type(data) === STRING) {
                return JSON.parse(data);
            } else {
                return {};
            }
        }
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
                if (toString.call(data) !== "[object Array]" && !(data instanceof kendo.data.ObservableArray)) {
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
    var PageItemCollectionDataReader = kendo.Class.extend({
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
    var PageItemCollectionDataSource =  kidoju.PageItemCollectionDataSource = data.DataSource.extend({
        init: function(options) {

            data.DataSource.fn.init.call(this, $.extend(true, {}, {
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

            return data.DataSource.fn.insert.call(this, index, model);
        },

        remove: function(model) {
            return data.DataSource.fn.remove.call(this, model);
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

        if (!(dataSource instanceof PageItemCollectionDataSource) && dataSource instanceof kendo.data.DataSource) {
            throw new Error("Incorrect DataSource type. Only PageItemCollectionDataSource instances are supported");
        }

        return dataSource instanceof PageItemCollectionDataSource ? dataSource : new PageItemCollectionDataSource(dataSource);
    };

    /**
     * Page node
     * @class Page
     * @type {void|*}
     */
    var Page = kidoju.Page = data.Model.define({
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
                //itemsField = "items",
                //itemsOptions = {};

            kendo.data.Model.fn.init.call(that, value);

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
                    data[that.idField || "id"] = that.id;

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

            this[fieldName || "items"] = this.items.data();
        },
        */

        _itemsLoaded: function() {
            this._loaded = true;

            //this._updateItemsField();
        },

        load: function() {
            var options = {};
            var method = "_query";
            var items;

            //if (this.hasItems) {
                this._initItems();

                items = this.items;

                options[this.idField || "id"] = this.id;

                if (!this._loaded) {
                    items._data = undefined;
                    method = "read";
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
                field !== "items" &&
                field !== "_loaded" &&
                //field !== "hasItems" &&
                field !== "_itemsOptions";
        }
    });

    /**
     * @class PageCollectionDataReader
     * @type {*}
     */
    var PageCollectionDataReader = kendo.Class.extend({
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
    var PageCollectionDataSource =  kidoju.PageCollectionDataSource = data.DataSource.extend({
        init: function(options) {

            data.DataSource.fn.init.call(this, $.extend(true, {}, {
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

            return data.DataSource.fn.insert.call(this, index, model);
        },

        remove: function(model) {
            return data.DataSource.fn.remove.call(this, model);
        },

        getDataObject: function() {
            var fields = {},
                pages = this.data();
            for (var i = 0; i < pages.length; i++) {
                pages[i].load();
                var items = pages[i].items.data();
                for (var j = 0; j < items.length; j++) {
                    var dataFields = items[j].getDataFields() || {};
                    for (var field in dataFields) {
                        if (dataFields.hasOwnProperty(field)) {
                            fields[dataFields[field].name] = dataFields[field].value;
                        }
                    }
                }
            }
            return kendo.observable (fields);
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

        if (!(dataSource instanceof PageCollectionDataSource) && dataSource instanceof kendo.data.DataSource) {
            throw new Error("Incorrect DataSource type. Only PageCollectionDataSource instances are supported");
        }

        return dataSource instanceof PageCollectionDataSource ? dataSource : new PageCollectionDataSource(dataSource);
    };

}(jQuery));