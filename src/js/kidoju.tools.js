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
        DEBUG = true,
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
        //playBar: [],
        //designBar: [],
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
         * Get Html content
         * @param item
         */
        getHtml: function (item) {
            throw new Error('Please implement in subclassed tool.');
        }

        // onMove(e.item)
        // onResize(e.item)
        // onRotate(e.item)
    });

    /*******************************************************************************************
     * AttributeAdapter classes
     *******************************************************************************************/
    var adapters = kidoju.adapters = {};

    var AttributeAdapter = adapters.AttributeAdapter = kendo.Class.extend({
        value: undefined,
        init: function(value) {
            this.value = value;
        },
        getEditor: function(enabled) {
            return '';
        }
        //PropertyGrid row???????
        //Toolbar???????????????
        //validation????????
    });

    adapters.TextAttributeAdapter = AttributeAdapter.extend({
        init: function(value) {
            this.value = value;
        },
        getEditor: function(enabled) {
            return '';
        }
    });

    adapters.StyleAttributeAdapter = AttributeAdapter.extend({
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

    adapters.TextPropertyAdapter = PropertyAdapter.extend({
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
            default: '<span style="#= attributes.style #">#= attributes.text#</span>'
        },
        height: 100,
        width: 300,
        attributes: {
            text: new adapters.TextAttributeAdapter('Label'),
            style: new adapters.StyleAttributeAdapter('font-family: Georgia, serif; color: #FF0000;')
        },

        /**
         * Get Html content
         * @method getHtml
         * @param item
         * @returns {*}
         */
        getHtml: function(item) {
            if (item instanceof kidoju.PageItem) {
                var template = kendo.template(this.templates.default);
                return template(item);
            }
        },

        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param item
         */
        onResize: function(e, item) {
            var stageElement = $(e.currentTarget);
            if(stageElement.is(ELEMENT_CLASS) && item instanceof kidoju.PageItem) {
                var content = stageElement.find('>span');
                if ($.type(item.width) === NUMBER) {
                    content.width(item.width);
                }
                if ($.type(item.height) === NUMBER) {
                    content.height(item.height);
                }
                var fontSize = parseInt(content.css('font-size'));
                var clone = content.clone()
                    .hide()
                    .css({
                        position: ABSOLUTE,
                        height: 'auto'
                    })
                    .width(item.width);
                stageElement.after(clone);
                //if no overflow, increase until overflow
                while(clone.height() < item.height) {
                    fontSize++;
                    clone.css('font-size', fontSize);
                }
                //if overflow, decrease until no overflow
                while(clone.height() > item.height) {
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
         * @returns {*}
         */
        getHtml: function(item) {
            if (item instanceof kidoju.PageItem) {
                var template = kendo.template(this.templates.default);
                return template(item);
            }
        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param item
         */
        onResize: function(e, item) {
            var stageElement = $(e.currentTarget);
            if(stageElement.is(ELEMENT_CLASS) && item instanceof kidoju.PageItem) {
                var content = stageElement.find('>img');
                if ($.type(item.width) === NUMBER) {
                    content.width(item.width);
                }
                if ($.type(item.height) === NUMBER) {
                    content.height(item.height);
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
         * @returns {*}
         */
        getHtml: function(item) {
            if (item instanceof kidoju.PageItem) {
                var template = kendo.template(this.templates.default);
                return template(item);
            }
        },

        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param item
         */
        onResize: function(e, item) {
            var stageElement = $(e.currentTarget);
            if(stageElement.is(ELEMENT_CLASS) && item instanceof kidoju.PageItem) {
                var content = stageElement.find('>input');
                if ($.type(item.width) === NUMBER) {
                    content.width(item.width);
                }
                if ($.type(item.height) === NUMBER) {
                    content.height(item.height);
                    content.css('font-size', Math.floor(0.75*item.height));
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
            default: '<button type="button">#= attributes.text #</button>'
        },
        height: 100,
        width: 300,
        attributes: {
            text: new adapters.TextAttributeAdapter('Button')
        },
        /**
         * Get Html content
         * @method getHtml
         * @param item
         * @returns {*}
         */
        getHtml: function(item) {
            if (item instanceof kidoju.PageItem) {
                var template = kendo.template(this.templates.default);
                return template(item);
            }
        },
        addEvents: function(item) {

        },
        removeEvents: function(item) {

        },
        /**
         * onResize Event Handler
         * @method onResize
         * @param e
         * @param item
         */
        onResize: function(e, item) {
            var stageElement = $(e.currentTarget);
            if(stageElement.is(ELEMENT_CLASS) && item instanceof kidoju.PageItem) { //TODO: same id, same tool?
                var content = stageElement.find('>button');
                if ($.type(item.width) === NUMBER) {
                    content.width(item.width);
                }
                if ($.type(item.height) === NUMBER) {
                    content.height(item.height);
                    content.css('font-size', Math.floor(0.75*item.height));
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

}(this, jQuery));
