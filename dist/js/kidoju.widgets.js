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
        DEBUG = false,
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
            //TODO: check whether we can have a attributes field of type OBJECT
            attributes: {
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
            //If we call the following, some properties are not initialized
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
                    //Attributes
                    var attributes = tool._initAttributes();
                    try {
                        //the tool might have been updated to implement some new attributes
                        $.extend(attributes, JSON.parse(that.attributes));
                    } catch (err) {}
                    that.attributes = JSON.stringify(attributes);
                    //Properties
                    var properties = tool._initProperties();
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
        attr: function(key, value) {
            var attributes = this.getAttributes();
            if (value !== undefined) {
                attributes[key] = value;
                this.set('attributes', JSON.stringify(attributes));
            } else {
                return attributes[key];
            }
        },
        getAttributes: function() {
            var attributes = this.get('attributes');
            if ($.type(attributes) === STRING) {
                return JSON.parse(attributes);
            } else {
                return {};
            }
        },
        prop: function(key, value) {
            var properties = this.getProperties();
            if (value !== undefined) {
                properties[key] = value;
                this.set('properties', JSON.stringify(properties));
            } else {
                return properties[key];
            }
        },
        getProperties: function() {
            var properties = this.get('properties');
            if ($.type(properties) === STRING) {
                return JSON.parse(properties);
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

        getObjectFromProperties: function() {
            var obj = {},
                pages = this.data();
            for (var i = 0; i < pages.length; i++) {
                pages[i].load();
                var items = pages[i].items.data();
                for (var j = 0; j < items.length; j++) {
                    var properties = items[j].getProperties() || {};
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

        if (!(dataSource instanceof PageCollectionDataSource) && dataSource instanceof kendo.data.DataSource) {
            throw new Error("Incorrect DataSource type. Only PageCollectionDataSource instances are supported");
        }

        return dataSource instanceof PageCollectionDataSource ? dataSource : new PageCollectionDataSource(dataSource);
    };

}(jQuery));
;
/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function ($, undefined) {

    "use strict";

    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        kidoju = global.kidoju = global.kidoju || {},

        //Types
        OBJECT = 'object',
        STRING = 'string',
        NUMBER = 'number',

        //Cursors
        CURSOR_DEFAULT = 'default',
        CURSOR_CROSSHAIR = 'crosshair',
        POINTER = 'pointer',

        //Events
        CLICK = 'click',
        DRAGGABLE = 'draggable',
        DRAGSTART = 'dragstart',
        DRAGENTER = 'dragenter',
        DRAGOVER = 'dragover',
        DROP = 'drop',

        //Defaults
        HANDLER_MARGIN = 20,

        //Miscellaneous
        ELEMENT = '<div data-id="{0}" data-tool="{1}" class="kj-element"></div>',
        ELEMENT_CLASS = 'kj-element',
        ELEMENT_SELECTOR = '.kj-element[data-id="{0}"]',
        DATA_ID = 'data-id',
        DATA_TOOL = 'data-tool',
        DATA_ELEMENT = 'data-element',
        HANDLER = '<div class="kj-handler"></div>',
        HANDLER_SELECTOR = '.kj-handler',
        HANDLER_DRAG = '<span class="kj-handler-button kj-drag-button"></span>',
        HANDLER_DRAG_SELECTOR = '.kj-drag-button',
        HANDLER_RESIZE = '<span class="kj-handler-button kj-resize-button"></span>',
        HANDLER_RESIZE_SELECTOR = '.kj-resize-button',
        HANDLER_ROTATE = '<span class="kj-handler-button kj-rotate-button"></span>',
        HANDLER_ROTATE_SELECTOR = '.kj-rotate-button',
        HANDLER_MENU = '<span class="kj-handler-button kj-menu-button"></span>',
        HANDLER_MENU_SELECTOR = '.kj-menu-button',
        POSITION = 'position',
        ABSOLUTE = 'absolute',
        DISPLAY = 'display',
        NONE = 'none',
        BLOCK = 'block',
        TOP = 'top',
        LEFT = 'left',
        HEIGHT = 'height',
        WIDTH = 'width',
        MARGIN = 'margin',
        PADDING = 'padding',
        RESIZE = 'resize',
        TRANSLATE = 'translate',
        ROTATE = 'rotate',
        PX = 'px',

        DEBUG = false,
        MODULE = 'kidoju.tools: ';

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
                    if (obj.id === 'active') {
                        throw new Error('You cannot name your tool [active]');
                    }
                    if (!this[obj.id]) { //make sure our system tools are not replaced
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
     * Fixes handler translation considering page dimensions
     * @param page
     * @param translate
     */
    function fixHandlerTranslation(page, translate) {
        //we actually need to substract page height from Y
        //we assume here translate in the form "Xpx,Ypx"
        var pos = translate.split(',');
        return parseInt(pos[0]) + PX + ',' + (parseInt(pos[1]) - $(page).height()) + PX;
    }

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
        playBar: [],
        designBar: [],
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
         * Initializes attributes
         * @method _initAttributes
         * @returns {{}}
         * @private
         */
        _initAttributes: function() {
            var attributes = {};
            for(var attr in this.attributes) {
                if (this.attributes.hasOwnProperty(attr)) {
                    if (this.attributes[attr] instanceof adapters.AttributeAdapter) {
                        attributes[attr] = this.attributes[attr].value;
                    }
                }
            }
            return attributes;
        },

        /**
         * Initializes properties
         * @method _initProperties
         * @returns {{}}
         * @private
         */
        _initProperties: function() {
            var properties = {};
            for(var prop in this.properties) {
                if (this.properties.hasOwnProperty(prop)) {
                    if (this.properties[prop] instanceof adapters.PropertyAdapter) {
                        properties[prop] = {
                            name: this.properties[prop].getName(),
                            value: this.properties[prop].getValue()
                        };
                    }
                }
            }
            return properties;
        },


        /**
         * Returns a generic wrapper div for the page element derived from the page item
         * @method _getElementWrapper
         * @param item
         * @private
         */
        _getElementWrapper: function(item) {
            var that = this,
                wrapper = $(kendo.format(ELEMENT, item.id, item.tool))
                .css(POSITION, ABSOLUTE)
                .css(HEIGHT, item.height + PX)
                .css(WIDTH, item.width + PX)
                //http://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
                .css({ translate: [item.left, item.top] , rotate: item.rotate})
                .on(CLICK, that.onClick)
                .on(TRANSLATE, that.onTranslate)
                .on(RESIZE, that.onResize)
                .on(ROTATE, that.onRotate);
            return wrapper;
        },

        /**
         * Prepare handles
         * @method _prepareHandler
         * @param page
         * @private
         */
        _prepareHandler: function(page) {
            var that = this;
            if($(page).find(HANDLER_SELECTOR).length === 0) {
                var handler = $(HANDLER)
                    .css(POSITION, ABSOLUTE)
                    .css(DISPLAY, NONE)
                    .append(HANDLER_DRAG)
                    .append(HANDLER_RESIZE)
                    .append(HANDLER_ROTATE)
                    .append(HANDLER_MENU)
                    .on(DRAGENTER, function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    })
                    .on(DRAGOVER, function (e) {
                        if ($.isPlainObject(that._transform) && $.type(that._transform.id) === STRING)  {
                            var handler = $(page).find(HANDLER_SELECTOR),
                                element = $(page).find(kendo.format(ELEMENT_SELECTOR, that._transform.id));
                            if (that._transform.type === TRANSLATE) {
                                //TODO check the bounds of container
                                //TODO: snap to grid option (use modulo size of the grid)
                                var position = {
                                        left: that._transform.offset.x + e.originalEvent.clientX,
                                        top: that._transform.offset.y + e.originalEvent.clientY
                                    },
                                    translate = position.left + PX + ',' + position.top + PX;
                                handler
                                    .css(TRANSLATE, fixHandlerTranslation(page, translate));
                                element
                                    .css(TRANSLATE, translate)
                                    .trigger(TRANSLATE, position);
                            }
                            else if (that._transform.type === RESIZE) {
                                //TODO check the bounds of container
                                //TODO: snap to grid option
                                var size = {
                                    width: that._transform.offset.x + e.originalEvent.clientX,
                                    height: that._transform.offset.y + e.originalEvent.clientY
                                };
                                handler
                                    .width(size.width)
                                    .height(size.height);
                                element
                                    .width(size.width)
                                    .height(size.height)
                                    .trigger(RESIZE, size);
                            }
                            else if (that._transform.type === ROTATE) {
                                var rotate = (that._transform.rotate - that._transform.offset + Math.atan2(e.originalEvent.clientY - that._transform.origin.y, e.originalEvent.clientX - that._transform.origin.x))*180/Math.PI;
                                handler
                                    .css(ROTATE, rotate + 'deg');
                                element
                                    .css(ROTATE, rotate + 'deg')
                                    .trigger(ROTATE, rotate);
                            }
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    })
                    .on(DROP, function (e) {
                        //delete the transform
                        delete that._transform;
                        e.preventDefault();
                        e.stopPropagation();
                    });
                handler.find(HANDLER_DRAG_SELECTOR)
                    .prop(DRAGGABLE, true)
                    .on(DRAGSTART, function(e){
                        //find the handler and the element the transformation applies to
                        var id = $(e.currentTarget).closest(HANDLER_SELECTOR).attr(DATA_ELEMENT);
                        //if found
                        if ($.type(id) === STRING) {
                            //get the page element
                            var pageElement = $(page).find(kendo.format(ELEMENT_SELECTOR, id));
                            //find the current position
                            var position = pageElement.css(TRANSLATE).split(',');
                            //create a transformation object
                            that._transform = {
                                type: TRANSLATE,
                                id: id,
                                offset: {
                                    x: parseInt(position[0]) - e.originalEvent.clientX,
                                    y: parseInt(position[1]) - e.originalEvent.clientY
                                }
                            };
                            //next step occurs in the DRAGOVER event handler
                        }
                    });
                handler.find(HANDLER_RESIZE_SELECTOR)
                    .prop(DRAGGABLE, true)
                    .on(DRAGSTART, function(e){
                        //find the handler and the element the transformation applies to
                        var id = $(e.currentTarget).closest(HANDLER_SELECTOR).attr(DATA_ELEMENT);
                        //if found
                        if ($.type(id) === STRING) {
                            //get the page element
                            var pageElement = $(page).find(kendo.format(ELEMENT_SELECTOR, id));
                            //create a transformation object
                            that._transform = {
                                type: RESIZE,
                                id: id,
                                offset: {
                                    x: pageElement.width()- e.originalEvent.clientX,
                                    y: pageElement.height() - e.originalEvent.clientY
                                }};
                            //next step occurs in the DRAGOVER event handler
                        }
                    });
                handler.find(HANDLER_ROTATE_SELECTOR)
                    .prop(DRAGGABLE, true)
                    .on(DRAGSTART, function(e){
                        //find the handler and the element the transformation applies to
                        var id = $(e.currentTarget).closest(HANDLER_SELECTOR).attr(DATA_ELEMENT);
                        //if found
                        if ($.type(id) === STRING) {
                            //get the page element
                            var pageElement = $(page).find(kendo.format(ELEMENT_SELECTOR, id));
                            /*
                            var cssTransform = $(that._currentWidget).css('transform'),
                                pos1 = cssTransform.indexOf('('),
                                pos2 = cssTransform.indexOf(')'),
                                currentAngle = 0;
                            if (pos1 > 0) {
                                var matrix = cssTransform.substr(pos1 + 1, pos2-pos1-1).split(','),
                                //This is the angle of rotation of the widget before rotating it further
                                //TODO: http://css-tricks.com/get-value-of-css-rotation-through-javascript/
                                    currentAngle = Math.atan2(matrix[1], matrix[0]);
                            }
                            //This is the center of the widget being rotated
                            var originX = Math.round($(that._currentWidget).position().left + ($(that._currentWidget).width()*Math.abs(Math.cos(currentAngle)) + $(that._currentWidget).height()*Math.abs(Math.sin(currentAngle)))/2),
                                originY = Math.round($(that._currentWidget).position().top + ($(that._currentWidget).width()*Math.abs(Math.sin(currentAngle)) + $(that._currentWidget).height()*Math.abs(Math.cos(currentAngle)))/2);
                            */
                            var rotate = parseInt(pageElement.css(ROTATE))*Math.PI/180,
                                originX = (pageElement.position().left + pageElement.width()*Math.cos(rotate) + pageElement.height()*Math.sin(rotate))/2,
                                originY = (pageElement.position().top + pageElement.width()*Math.sin(rotate) + pageElement.height()*Math.cos(rotate))/2;
                            that._transform = {
                                type: ROTATE,
                                id: id,
                                origin: {   //This is the center of the widget being rotated
                                    //we need origin set only once in dragstart otherwise (in dragover) the values change slightly as we are rotating and the rotation flickers
                                    x: originX,
                                    y: originY
                                },
                                rotate: rotate,
                                //The offset angle takes into account the position of the handle that drives the rotation
                                offset: Math.atan2(e.originalEvent.clientY - originY, e.originalEvent.clientX - originX)
                            };
                        }
                    });
                handler.find(HANDLER_MENU_SELECTOR)
                    .on(CLICK, function(e) {
                        if (DEBUG && global.console) {
                            global.console.log(MODULE + 'click on handler menu');
                        }
                       /*
                        that._showContextMenu(e.clientX - e.offsetX + 40, e.clientY - e.offsetY + 40);
                        */
                        e.preventDefault();
                        e.stopPropagation();
                    });
                $(page).append(handler);
            }
        },

        /**
         * Show handler on a page element
         * @method _showHandler
         * @param page
         * @param id
         * @private
         */
        _showHandler: function(page, id){
            var pageElement = $(page).find(kendo.format(ELEMENT_SELECTOR, id));
            $(page).find(HANDLER_SELECTOR)
                .css(HEIGHT, pageElement.css(HEIGHT))
                .css(WIDTH, pageElement.css(WIDTH))
                .css(PADDING, HANDLER_MARGIN + PX)
                .css(MARGIN, '-' + HANDLER_MARGIN + PX)
                .css(TRANSLATE, fixHandlerTranslation(page, pageElement.css(TRANSLATE)))
                .css(ROTATE, pageElement.css(ROTATE))
                .css(DISPLAY, BLOCK)
                .attr(DATA_ELEMENT, id);
        },

        /**
         * Test handler for a page element/item
         * @method _hasHandler
         * @param page
         * @param id
         * @returns {boolean}
         * @private
         */
        _hasHandler: function(page, id) {
            return ($(page).find(HANDLER_SELECTOR).attr(DATA_ELEMENT) === id);
        },

        /**
         * Hide handler
         * @method _hideHandler
         * @private
         */
        _hideHandler: function(page){
            $(page).find(HANDLER_SELECTOR)
                .css(DISPLAY, NONE)
                .removeAttr(DATA_ELEMENT);
        },

        /**
         * @method draw
         * @param container
         * @param item
         * @returns {*}
         * @private
         */
        _draw: function(container, item) {
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'drawing ' + item.tool + ' ' + item.id);
            }
            var wrapper = this._getElementWrapper(item),
                content = this.getHtml(item);
            wrapper.append(content);
            $(container).append(wrapper);
            wrapper.trigger(RESIZE, { height: item.height, width: item.width });
            return wrapper;
        },

        _updateContent: function() {

        },

        _removeContent: function() {

        },

        /**
         * method getHtml
         * @param item
         * @param mode
         * @returns {string}
         */
        getHtml: function(item, mode) {
            return '';
        },

        /**
         * Click handler on page element
         * @method onClick
         * @param e
         */
        onClick: function(e) {
            //TODO, we need to consider the mode here too
            var element = $(e.currentTarget);
            if (element.hasClass(ELEMENT_CLASS)) {
                var page = element.closest(kendo.roleSelector('page')),
                    widget = page.data('kendoPage'),
                    elementId = element.attr(DATA_ID),
                    toolId = element.attr(DATA_TOOL);
                if ($.type(elementId) === STRING) {
                    if (DEBUG && global.console) {
                        global.console.log(MODULE + 'click on ' + elementId);
                    }
                    var tool = kidoju.tools[toolId];
                    if (tool instanceof kidoju.Tool && widget.mode() === widget.modes.design) {
                        tool._prepareHandler(page);
                        tool._showHandler(page, elementId);
                    }
                    //prevent click event to bubble on page
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        },

        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         */
        onResize: function(e) {
            $.noop();
        }
    });

    /*******************************************************************************************
     * AttributeAdapter classes
     *******************************************************************************************/
    var adapters = kidoju.adapters = kidoju.adapters || {};

    var AttributeAdapter = adapters.AttributeAdapter = kendo.Class.extend({
        value: undefined,
        init: function(value) {
            this.value = value;
        },
        getEditor: function(enabled) {
            return '';
        }
        //Toolbar???????????????
        //validation????????
    });

    var TextAttributeAdapter = adapters.TextAttributeAdapter = AttributeAdapter.extend({
        init: function(value) {
            this.value = value;
        },
        getEditor: function(enabled) {
            return '';
        }
    });

    var IntegerAttributeAdapter = adapters.IntegerAttributeAdapter = AttributeAdapter.extend({
        value: 0,
        init: function(value) {
            this.value = value;
        },
        getEditor: function(enabled) {
            return '';
        }
    });

    var BooleanAttributeAdapter = adapters.BooleanAttributeAdapter = AttributeAdapter.extend({
        value: false,
        init: function(value) {
            this.value = value;
        },
        getEditor: function(enabled) {
            return '';
        }
    });

    var FontAttributeAdapter = adapters.FontAttributeAdapter = AttributeAdapter.extend({
        //TODO
    });

    var ColorAttributeAdapter = adapters.ColorAttributeAdapter = AttributeAdapter.extend({
        value: false,
        init: function(value) {
            this.value = value;
        },
        getEditor: function(enabled) {
            return '';
        }
    });

    /*******************************************************************************************
     * PropertyAdapter classes
     *******************************************************************************************/

    var PropertyAdapter = adapters.PropertyAdapter = kendo.Class.extend({
        _prefix: 'prop',
        value: undefined,
        init: function(options) {
            $.noop();
        },
        getName: function() {
            //TODO: we should actually keep a counter and increment it to have prop_1, prop_2, ...
            //or better, several counters, to have textbox1, label2, ... like in Visual Studio
            var s = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
                name = this._prefix;
            for (var i = 0; i < 4; i++) {
                name += s.charAt(Math.floor(s.length*Math.random()));
            }
            return name;
        },
        getValue: function() {
            return this.value;
        }
    });

    var TextPropertyAdapter = adapters.TextPropertyAdapter = PropertyAdapter.extend({
        _prefix: 'textbox_'
    });

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
        cursor: CURSOR_DEFAULT
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
            default: '<span style="font-family: #= attributes.font #; color: #= attributes.color#;">#= attributes.text#</span>'
        },
        height: 100,
        width: 300,
        attributes: {
            text: new adapters.TextAttributeAdapter('Label'),
            font: new adapters.TextAttributeAdapter('Georgia, serif'),
            color: new adapters.TextAttributeAdapter('#FF0000')
        },
        /**
         * Get Html content
         * @method getHtml
         * @param item
         * @param mode
         * @returns {*}
         */
        getHtml: function(item, mode) {
            var template = kendo.template(this.templates.default);
            var data = { attributes: item.getAttributes(), properties: item.getProperties() };
            return template(data);
        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param size
         */
        onResize: function(e, size) {
            var element = $(e.currentTarget);
            if(element.hasClass(ELEMENT_CLASS)) {
                var content = element.find('>span');
                if ($.isPlainObject(size)) {
                    if ($.type(size.width) === NUMBER) {
                        content.width(size.width);
                    }
                    if ($.type(size.height) === NUMBER) {
                        content.height(size.height);
                    }
                    var fontSize = parseInt(content.css('font-size'));
                    var clone = content.clone()
                        .hide()
                        .css(POSITION, ABSOLUTE)
                        .css('height', 'auto')
                        .width(size.width);
                    element.after(clone);
                    //if no overflow, increase until overflow
                    while(clone.height() < size.height) {
                        fontSize++;
                        clone.css('font-size', fontSize + PX);
                    }
                    //if overflow, decrease until no overflow
                    while(clone.height() > size.height) {
                        fontSize--;
                        clone.css('font-size', fontSize + PX);
                    }
                    clone.remove();
                    content.css('font-size', fontSize + PX);
                }
                //prevent any side effect
                e.preventDefault();
                //prevent event to bubble on page
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
            default: '<img src="#= attributes.src #" alt="#= attributes.alt #">'
        },
        height: 250,
        width: 250,
        attributes: {
            src: new adapters.TextAttributeAdapter(''),
            alt: new adapters.TextAttributeAdapter('')
        },
        /**
         * Get Html content
         * @method getHtml
         * @param item
         * @param mode
         * @returns {*}
         */
        getHtml: function(item) {
            var template = kendo.template(this.templates.default);
            var data = { attributes: item.getAttributes(), properties: item.getProperties() };
            return template(data);
        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         */
        onResize: function(e, size) {
            var element = $(e.currentTarget);
            if(element.hasClass(ELEMENT_CLASS)) {
                var content = element.find('>img');
                if ($.isPlainObject(size)) {
                    if ($.type(size.width) === NUMBER) {
                        content.width(size.width);
                    }
                    if ($.type(size.height) === NUMBER) {
                        content.height(size.height);
                    }
                }
                //prevent any side effect
                e.preventDefault();
                //prevent event to bubble on page
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
            default: '<input type="text" data-bind="value: #= properties.text.name #">'
        },
        height: 100,
        width: 300,
        properties: {
            text: new adapters.TextPropertyAdapter()
        },
        /**
         * Get Html content
         * @method getHtml
         * @param item
         * @param mode
         * @returns {*}
         */
        getHtml: function(item, mode) {
            var template = kendo.template(this.templates.default);
            var data = { attributes: item.getAttributes(), properties: item.getProperties() };
            return template(data);
        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param size
         */
        onResize: function(e, size) {
            var element = $(e.currentTarget);
            if(element.hasClass(ELEMENT_CLASS)) {
                var content = element.find('>input');
                if ($.isPlainObject(size)) {
                    if ($.type(size.width) === NUMBER) {
                        content.width(size.width);
                    }
                    if ($.type(size.height) === NUMBER) {
                        content.height(size.height);
                        content.css('font-size', Math.floor(0.75*size.height));
                    }
                }
                //prevent any side effect
                e.preventDefault();
                //prevent event to bubble on page
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
            default: '<button type="button">#= attributes.text #</button>'
        },
        height: 100,
        width: 300,
        attributes: {
            text: new adapters.TextAttributeAdapter('Button')
        },
        getHtml: function(item, mode) {
            var template = kendo.template(this.templates.default);
            var data = { attributes: item.getAttributes(), properties: item.getProperties() };
            return template(data);
        },
        addEvents: function(item, mode) {

        },
        removeEvents: function(item, mode) {

        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param size
         */
        onResize: function(e, size) {
            var element = $(e.currentTarget);
            if(element.hasClass(ELEMENT_CLASS)) {
                var content = element.find('>button');
                if ($.isPlainObject(size)) {
                    if ($.type(size.width) === NUMBER) {
                        content.width(size.width);
                    }
                    if ($.type(size.height) === NUMBER) {
                        content.height(size.height);
                        content.css('font-size', Math.floor(0.75*size.height));
                    }
                }
                //prevent any side effect
                e.preventDefault();
                //prevent event to bubble on page
                e.stopPropagation();
            }
        }
    });
    kidoju.tools.register(Button);


    /**
     * We could also consider
     * Button
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

}(jQuery));

;
/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function ($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
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

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

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


} (jQuery));
;
/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
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
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'widget initialized');
            }
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

}(jQuery));
;
/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        data = kendo.data,
        Widget = kendo.ui.Widget,

        //Types
        STRING = 'string',
        NUMBER = 'number',
        NULL = null,

        //Events
        CHANGE = 'change',
        CLICK = 'click',
        MOUSEENTER = 'mouseenter',
        MOUSELEAVE = 'mouseleave',
        FOCUS = 'focus',
        BLUR = 'blur',
        NS = ".kendoExplorer",

        //Widget
        WIDGET_CLASS = 'k-widget k-group kj-explorer', //k-list-container k-reset
        HOVER_CLASS = 'k-state-hover',
        FOCUSED_CLASS = 'k-state-focused',
        SELECTED_CLASS = 'k-state-selected',
        ALL_ITEMS_SELECTOR = 'li.k-item[data-uid]',
        ITEM_BYUID_SELECTOR = 'li.k-item[data-uid="{0}"]',
        ARIA_SELECTED = 'aria-selected',
        
        DEBUG = false,
        MODULE = 'kidoju.widgets.explorer: ';

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

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
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'widget initialized');
            }
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
            CHANGE
        ],

        /**
         * IMPORTANT: index is 0 based
         * @method index
         * @param value
         * @returns {*}
         */
        index: function(value) {
            var that = this, pageItem;
            if(value !== undefined) {
                if (DEBUG && global.console) {
                    global.console.log(MODULE + 'index set to ' + value);
                }
                if ($.type(value) !== NUMBER) {
                    throw new TypeError();
                } else if (value < 0 || (value > 0 && value >= that.length())) {
                    throw new RangeError();
                } else {
                    pageItem = that.dataSource.at(value);
                    that.selection(pageItem);
                }
            } else {
                pageItem = that.dataSource.getByUid(that._selectedUid);
                if (pageItem instanceof kidoju.PageItem) {
                    return that.dataSource.indexOf(pageItem);
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
            var that = this, pageItem;
            if (value !== undefined) {
                if (!isGuid(value)) {
                    throw new TypeError();
                }
                pageItem = that.dataSource.get(value);
                that.selection(pageItem);
            } else {
                pageItem = that.dataSource.getByUid(that._selectedUid);
                if (pageItem instanceof kidoju.PageItem) {
                    return pageItem[pageItem.idField];
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
                if (!(value instanceof kidoju.PageItem)) {
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
            return (this.dataSource instanceof kidoju.PageItemCollectionDataSource) ? this.dataSource.total() : 0;
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
            if ( that.dataSource instanceof kidoju.PageItemCollectionDataSource && that._refreshHandler ) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }

            if (that.options.dataSource !== NULL) {  //use null to explicitely destroy the dataSource bindings
                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = kidoju.PageItemCollectionDataSource.create(that.options.dataSource);

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
                if (e=== undefined && that.dataSource instanceof kidoju.PageItemCollectionDataSource) {
                    data = that.dataSource.data();
                } else if (e && e.items instanceof kendo.data.ObservableArray) {
                    data = e.items;
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
                if(html.length > 0 && that._tmp instanceof kidoju.PageItem) {
                    that.selection(that._tmp);
                    delete that._tmp;
                } else if (html.length === 0) {
                    html = that.options.messages.empty; //TODO: improve
                }

                that.list.html(html);
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
                var pageItem = this.dataSource.getByUid(target.attr(kendo.attr("uid")));
                this.selection(pageItem);
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

}(jQuery));
;
/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        data = kendo.data,
        Widget = kendo.ui.Widget,

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
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'widget initialized');
            }
            that._templates();
            that._layout();
            that._dataSource();
            //that.refresh();
        },

        options: {
            name: 'Navigation',
            autoBind: true,
            itemTemplate: '<div data-uid="#= uid #" class="kj-navigation-page" role="option" aria-selected="false"><div data-role="page"></div></div>',
            addTemplate: '<div data-uid="#= uid #" class="kj-navigation-page" role="option" aria-selected="false"><div>#= text #</div></div>',
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
                if (DEBUG && global.console) {
                    global.console.log(MODULE + 'index set to ' + value);
                }
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
                                .find(kendo.roleSelector('page')).kendoPage({
                                    mode: kendo.ui.Page.fn.modes.thumbnail,
                                    dataSource: data[i].items,
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

            //TODO: we are not clear with borders here
            //we actually need the widget's outerWidth and outerHeight
            //becaus a border might be added to pageWidth and pageHeight
            navigation.find(ALL_WRAPPERS_SELECTOR)
                .width(scale * parseInt(that.options.pageWidth))
                .height(scale * parseInt(that.options.pageHeight));

            var pages = navigation.find(kendo.roleSelector('page'));
            for (var i = 0; i < pages.length; i++) {
                $(pages[i]).data('kendoPage').scale(scale);
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
                    var page = this.dataSource.getByUid(target.attr(kendo.attr("uid")));
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

}(jQuery));
;
/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function ($, undefined) {

    "use strict";

    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        Widget = kendo.ui.Widget,
        kidoju = global.kidoju,

        //Types
        FUNCTION = 'function',
        STRING = 'string',
        NUMBER = 'number',
        NULL = null,

        //Events
        CLICK = 'click',
        CHANGE = 'change',
        TRANSLATE = 'translate',
        RESIZE = 'resize',
        ROTATE = 'rotate',

        //Size
        POSITION = 'position',
        RELATIVE = 'relative',
        TOP = 'top',
        LEFT = 'left',
        HEIGHT = 'height',
        WIDTH = 'width',
        DEFAULT_SCALE = 1,
        DEFAULT_WIDTH = 1024,
        DEFAULT_HEIGHT = 768,

        //Modes
        MODE = {
            THUMBNAIL: 'thumbnail',
            DESIGN: 'design',
            SOLUTION: 'solution',
            //Play modes
            LEARN: 'learn',
            ASSESS: 'assess'
        },

        //Miscellaneous
        POINTER = 'pointer',
        WIDGET_CLASS = 'k-widget kj-page',
        ELEMENT_SELECTOR = '.kj-element[data-id="{0}"]',
        CONTAINER_DIV = '<div class="kj-container"></div>',
        //CONTAINER_SELECTOR = '.kj-container',

        DEBUG = false,
        MODULE = 'kidoju.widgets.page: ';


    /*******************************************************************************************
     * Page widget
     *
     * Drag and drop is extensively explained at:
     * http://www.html5rocks.com/en/tutorials/dnd/basics/
     * http://www.html5laboratory.com/drag-and-drop.php
     * http://stackoverflow.com/questions/11529788/html-5-drag-events
     * http://stackoverflow.com/questions/5500615/internet-explorer-9-drag-and-drop-dnd
     * http://nettutsplus.s3.amazonaws.com/64_html5dragdrop/demo/index.html
     * http://github.com/guillaumebort/jquery-ndd
     *******************************************************************************************/

    /**
     * @class Page Widget (kendoPage)
     */
    var Page = Widget.extend({

        /**
         * Initializes the widget
         * @param element
         * @param options
         */
        init: function (element, options) {
            var that = this;
            Widget.fn.init.call(that, element, options);
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'widget initialized');
            }
            that.setOptions(options);
            that._layout();
            that._dataSource();
        },

        modes: {
            thumbnail: MODE.THUMBNAIL,
            design: MODE.DESIGN,
            solution: MODE.SOLUTION,
            //Play modes
            learn: MODE.LEARN, //in learn mode, you can flip the page and see the solution
            assess: MODE.ASSESS //in test mode, you cannot see the solution
            //We could also consider a test mode with hints
            //and a correction mode displaying correct vs. incorrect answers
        },

        /**
         * Widget options
         */
        options: {
            name: "Page",
            autoBind: true,
            mode: MODE.ASSESS,
            scale: DEFAULT_SCALE,
            height: DEFAULT_HEIGHT,
            width: DEFAULT_WIDTH,
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
         * Mode defines the operating mode of the Page Widget
         * @param value
         * @return {*}
         */
        mode: function (value) {
            var that = this;
            if (value !== undefined) {
                if($.type(value) !== STRING) {
                    throw new TypeError();
                }
                //TODO: test range
                if(value !== that._mode) {
                    that._mode = value;
                    that.refresh();
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
                if(value !== that._scale) {
                    that._scale = value;
                    if(DEBUG && global.console) {
                        global.console.log(MODULE + 'scale changed to: ' + that._scale);
                    }
                    that.element
                        .css({ transformOrigin: '0px 0px' })//TODO: review
                        .css({ transform: kendo.format('scale({0})', that._scale) });
                }
            }
            else {
                return that._scale;
            }
        },

        /**
         * Height of page
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
         * Width of page
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
            if ( that.dataSource instanceof kidoju.PageItemCollectionDataSource && that._refreshHandler ) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);
            }

            if (that.options.dataSource !== NULL) {  //use null to explicitely destroy the dataSource bindings
                // returns the datasource OR creates one if using array or configuration object
                that.dataSource = kidoju.PageItemCollectionDataSource.create(that.options.dataSource);

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
            that._container = $(CONTAINER_DIV)
                .css(POSITION, RELATIVE) //!important
                .css(HEIGHT, that.height() + 'px')
                .css(WIDTH, that.width() + 'px');
            that.element
                .addClass(WIDGET_CLASS)
                .css(POSITION, RELATIVE) //!important
                .css('overflow', 'hidden')
                .css(HEIGHT, that.height() + 'px')
                .css(WIDTH, that.width() + 'px')
                .css({ transformOrigin: '0px 0px' })//TODO: review
                .css({ transform: kendo.format('scale({0})', that._scale) })
                .append(that._container);
            //Click handler to select or create page elements from page items in design mode
            if(that.mode() === that.modes.design) {
                that._container.on(CLICK, function(e) {
                    if(DEBUG && global.console) {
                        global.console.log(MODULE + 'page clicked at (' + e.offsetX + ',' + e.offsetY + ')');
                    }
                    var id = that.options.tools.get('active'),
                        tool = that.options.tools[id];
                    if (id !== POINTER) {
                        //TODO: show creation dialog and test OK/Cancel
                        var item = new kidoju.PageItem({
                            id: kendo.guid(),
                            tool: id,
                            left: e.offsetX,
                            top: e.offsetY,
                            width: tool.width,
                            height: tool.height
                            //rotate: tool.rotate?
                        });
                        that.dataSource.add(item);
                        that.options.tools.set('active', POINTER);
                    } else {
                        if ($.isFunction(tool._hideHandler)) {
                            tool._hideHandler(that.element);
                        }
                    }
                });
            }
        },

        /**
         * Add an element to the page either on a click or from persistence
         * @param item
         * @param left
         * @param top
         * @private
         */
        _addPageElement: function(item, left, top) {
            var that = this;
            if (item instanceof kidoju.PageItem) {
                var tool = that.options.tools[item.tool];
                if (tool instanceof kidoju.Tool) {
                    if ($.type(left) === NUMBER) {
                        item.set(LEFT, left);
                    }
                    if ($.type(top) === NUMBER) {
                        item.set(TOP, top);
                    }
                    var pageElement = tool._draw(that._container, item);
                    //TODO Add event namespace TRANSLATE + NS
                    //EVents could be added on the page itself
                    pageElement
                        .on(TRANSLATE, function (e, position) {
                            var pageElement = $(e.currentTarget),
                                page = pageElement.closest(kendo.roleSelector('page')),
                                widget = page.data('kendoPage'),
                                id = pageElement.data('id'),
                                item = widget.dataSource.get(id);
                            item.set(TOP, position.top);
                            item.set(LEFT, position.left);
                        })
                        .on(RESIZE, function(e, size) {
                            var pageElement = $(e.currentTarget),
                                page = pageElement.closest(kendo.roleSelector('page')),
                                widget = page.data('kendoPage'),
                                id = pageElement.data('id'),
                                item = widget.dataSource.get(id);
                            item.set(HEIGHT, size.height);
                            item.set(WIDTH, size.width);
                        })
                        .on(ROTATE, function(e, rotate) {
                            var pageElement = $(e.currentTarget),
                                page = pageElement.closest(kendo.roleSelector('page')),
                                widget = page.data('kendoPage'),
                                id = pageElement.data('id'),
                                item = widget.dataSource.get(id);
                            item.set(ROTATE, rotate);
                        });

                    //TODO: add behaviours here!!!
                }
            }
        },

        /**
         * Remove an element from the page
         * @private
         */
        _removePageElement: function(id) {
            var that = this;
            //TODO hide handles where necessary
            //TODO use a tool method to avoid leaks (remove all event handlers, ...)
            that._container.find(kendo.format(ELEMENT_SELECTOR, id))
                .off()//TODO namespace .off(NS)
                .remove();
        },

        /**
         * Refreshes the widget
         */
        refresh: function(e) {
            var that = this,
                i = 0;
            if (e === undefined || e.action === undefined) {
                var data = [];
                if (e=== undefined && that.dataSource instanceof kendo.data.PageItemCollectionDataSource) {
                    data = that.dataSource.data();
                } else if (e && e.items instanceof kendo.data.ObservableArray) {
                    data = e.items;
                }
                if (that.mode() === that.modes.assess) {
                    kendo.unbind(that._container, that.properties());
                }
                that._container.find('*').off();
                that._container.empty();
                for (i = 0; i < data.length; i++) {
                    var item = data[i];
                    if (item instanceof kidoju.PageItem) {
                        that._addPageElement(item);
                    }
                }
                if(that.mode() === that.modes.assess) {
                    if (that.properties() instanceof kendo.data.ObservableObject) {
                        kendo.bind(that._container, that.properties());
                    }
                }
            } else if (e.action === 'add') {
                for (i = 0; i < e.items.length; i++) {
                    that._addPageElement(e.items[i]);
                }
            } else if (e.action === 'remove') {
                for (i = 0; i < e.items.length; i++) {
                    that._removePageElement(e.items[i].id);
                }
            } else if (e.action === 'itemchange') {
                for (i = 0; i < e.items.length; i++) {
                    //NOTE e.field cannot be relied upon, especially when resizing
                    //e.field takes a value of height or width when both change
                    //id and tool are not supposed to change
                    var pageElement = that._container.find(kendo.format(ELEMENT_SELECTOR, e.items[i].id));
                    //id is not suppoed to change
                    //tool is not supposed to change
                    if(pageElement.css(TRANSLATE) != e.items[i].left + 'px,' + e.items[i].top + 'px') {
                        pageElement.css(TRANSLATE, e.items[i].left + 'px,' + e.items[i].top + 'px');
                    }
                    if(pageElement.height() !== e.items[i].height || pageElement.width() !== e.items[i].width) {
                        pageElement.height(e.items[i].height);
                        pageElement.width(e.items[i].width);
                        //We need to trigger the resize event to ensure the content is resized
                        //but this will update the item triggering a refresh and potentially creating an infinite loop and a stack overflow.
                        //In order to prevent it we test a change of value hereabove, so that the loop stops when values are equal
                        pageElement.trigger(RESIZE, { height: e.items[i].height, width: e.items[i].width });
                    }
                    if(pageElement.css(ROTATE) != e.items[i].rotate) {
                        pageElement.css(ROTATE, e.items[i].rotate + 'deg');
                    }
                    //TODO attributes
                    //TODO properties
                }
            }
        },

        /**
         * Page Elements
         * @method items
         * @returns {XMLList|*}
         */
        items: function() {
            //TODO: do not return handler
            return this._container.children();
        },

        /**
         * Clears the DOM from modifications made by the widget
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

    kendo.ui.plugin(Page);

}(jQuery));

;
/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function($, undefined) {

    "use strict";

    // shorten references to variables for uglification
    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        data = kendo.data,
        Widget = kendo.ui.Widget,

        //Types
        STRING = 'string',
        NUMBER = 'number',
        NULL = null,

        //Events
        CHANGE = 'change',
        CLICK = 'click',
        KEYDOWN = 'keydown',
        NS = ".kendoPlaybar",

        //Widget
        WIDGET_CLASS = 'k-widget kj-playbar',
        FIRST = ".k-i-seek-w",
        LAST = ".k-i-seek-e",
        PREV = ".k-i-arrow-w",
        NEXT = ".k-i-arrow-e",

        DEBUG = false,
        MODULE = 'kidoju.widgets.playbar: ';

    /*********************************************************************************
     * Helpers
     *********************************************************************************/

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
            title: title || ""
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
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'widget initialized');
            }
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
            iconTemplate: '<a href="\\#" title="#=text#" class="k-link k-pager-nav #= wrapClassName #"><span class="k-icon #= className #">#=text#</span></a>',
            selectTemplate: '<li><span class="k-state-selected">#=text#</span></li>',
            linkTemplate: '<li><a tabindex="-1" href="\\#" class="k-link" data-#=ns#index="#=idx#" #if (title !== "") {# title="#=title#" #}#>#=text#</a></li>',
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
                if (DEBUG && global.console) {
                    global.console.log(MODULE + 'index set to ' + value);
                }
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
                    playbar.append(icon(that.iconTemplate, FIRST, options.messages.first, "k-pager-first"));
                    first(playbar, index, length);
                }
                if (!playbar.find(PREV).length) {
                    playbar.append(icon(that.iconTemplate, PREV, options.messages.previous));
                    prev(playbar, index, length);
                }
            }

            if (options.numeric) {
                that.list = playbar.find(".k-pager-numbers");
                if (!that.list.length) {
                    that.list = $('<ul class="k-pager-numbers k-reset" />').appendTo(playbar);
                }
            }

            if (options.input) {
                if (!playbar.find(".k-pager-input").length) {
                    playbar.append('<span class="k-pager-input k-label">'+
                        options.messages.page +
                        '<input class="k-textbox">' +
                        kendo.format(options.messages.of, length) +
                        '</span>');
                }
                playbar.on(KEYDOWN + NS, ".k-pager-input input", $.proxy(that._keydown, that));
            }

            if (options.previousNext) {
                if (!playbar.find(NEXT).length) {
                    playbar.append(icon(that.iconTemplate, NEXT, options.messages.next));
                    next(playbar, index, length);
                }
                if (!playbar.find(LAST).length) {
                    playbar.append(icon(that.iconTemplate, LAST, options.messages.last, "k-pager-last"));
                    last(playbar, index, length);
                }
            }

            if (options.refresh) {
                if (!playbar.find(".k-pager-refresh").length) {
                    playbar.append('<a href="#" class="k-pager-refresh k-link" title="' + options.messages.refresh +
                        '"><span class="k-icon k-i-refresh">' + options.messages.refresh + "</span></a>");
                }
                playbar.on(CLICK + NS, ".k-pager-refresh", $.proxy(that._refreshClick, that));
            }

            if (options.info) {
                if (!playbar.find(".k-pager-info").length) {
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
                    html += button(that.linkTemplate, start - 1, "...", false, options.messages.morePages);
                }
                for (idx = start; idx <= end; idx++) {
                    html += button(idx === index ? that.selectTemplate : that.linkTemplate, idx, idx + 1, true);
                }
                if (end < length - 1) { //idx = end + 1 here
                    html += button(that.linkTemplate, idx, "...", false, options.messages.morePages);
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
                that.element.find(".k-pager-info").html(html);
            }

            if (options.input) {
                that.element.find(".k-pager-input")
                    .html(options.messages.page +
                        '<input class="k-textbox">' +
                        kendo.format(options.messages.of, length))
                    .find("input")
                        .val(index + 1)
                        .attr('disabled', length < 1)
                        .toggleClass("k-state-disabled", length < 1);
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
                var input = this.element.find(".k-pager-input").find("input"),
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
            if (!target.is(".k-state-disabled")) {
                this.index(parseInt(target.attr(kendo.attr("index")), 10));
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

}(jQuery));
;
/* Copyright ©2013-2014 Memba® Sarl. All rights reserved. */
/* jslint browser:true */
/* jshint browser:true */
/* global jQuery */

(function ($, undefined) {

    "use strict";

    var fn = Function,
        global = fn('return this')(),
        kendo = global.kendo,
        Widget = kendo.ui.Widget,
        kidoju = global.kidoju,

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
            if(DEBUG && global.console) {
                global.console.log(MODULE + 'widget initialized');
            }
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
                    if(DEBUG && global.console) {
                        global.console.log(MODULE + 'tool changed for ' + id);
                    }
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

})(jQuery);

// AjaxQ jQuery Plugin
// Copyright (c) 2012 Foliotek Inc.
// MIT License
// https://github.com/Foliotek/ajaxq
/*
(function($, undefined) {

    var queues = {};

    // Register an $.ajaxq function, which follows the $.ajax interface, but allows a queue name which will force only one request per queue to fire.
    $.ajaxq = function(qname, opts) {

        if (typeof opts === "undefined") {
            throw ("AjaxQ: queue name is not provided");
        }

        // Will return a Deferred promise object extended with success/error/callback, so that this function matches the interface of $.ajax
        var deferred = $.Deferred(),
            promise = deferred.promise();

        promise.success = promise.done;
        promise.error = promise.fail;
        promise.complete = promise.always;

        // Create a deep copy of the arguments, and enqueue this request.
        var clonedOptions = $.extend(true, {}, opts);
        enqueue(function() {

            // Send off the ajax request now that the item has been removed from the queue
            var jqXHR = $.ajax.apply(window, [clonedOptions]).always(dequeue);

            // Notify the returned deferred object with the correct context when the jqXHR is done or fails
            // Note that 'always' will automatically be fired once one of these are called: http://api.jquery.com/category/deferred-object/.
            jqXHR.done(function() {
                deferred.resolve.apply(this, arguments);
            });
            jqXHR.fail(function() {
                deferred.reject.apply(this, arguments);
            });
        });

        return promise;

        // If there is no queue, create an empty one and instantly process this item.
        // Otherwise, just add this item onto it for later processing.
        function enqueue(cb) {
            if (!queues[qname]) {
                queues[qname] = [];
                cb();
            }
            else {
                queues[qname].push(cb);
            }
        }

        // Remove the next callback from the queue and fire it off.
        // If the queue was empty (this was the last item), delete it from memory so the next one can be instantly processed.
        function dequeue() {
            var nextCallback = queues[qname].shift();
            if (nextCallback) {
                nextCallback();
            }
            else {
                delete queues[qname];
            }
        }
    };

    // Register a $.postq and $.getq method to provide shortcuts for $.get and $.post
    // Copied from jQuery source to make sure the functions share the same defaults as $.get and $.post.
    $.each( [ "getq", "postq" ], function( i, method ) {
        $[ method ] = function( qname, url, data, callback, type ) {

            if ( $.isFunction( data ) ) {
                type = type || callback;
                callback = data;
                data = undefined;
            }

            return $.ajaxq(qname, {
                type: method === "postq" ? "post" : "get",
                url: url,
                data: data,
                success: callback,
                dataType: type
            });
        };
    });

    $.ajaxq.isRunning = function() {
        for (var i in queues) {
            if (queues.hasOwnProperty(i)) {
                return true;
            }
        }
        return false;
    };

}(jQuery));
*/