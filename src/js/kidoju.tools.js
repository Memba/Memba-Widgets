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
                        if(prop === 'name') {
                            //Add a property field name
                            model.fields[prop].defaultValue = 'val_'  + Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
                        }
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
            solution: new adapters.StringAdapter({ title: 'Solution' }), //TODO: Not always a string ????????????????
            validation: new adapters.ValidationAdapter({ title: 'Validation' }),
            success: new adapters.ScoreAdapter({ title: 'Success' }),
            failure: new adapters.ScoreAdapter({ title: 'Failure' }),
            omit: new adapters.ScoreAdapter({ title: 'Omit' }),
            guideline: new adapters.StringAdapter({ title: 'Guideline' })
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
            this.defaultValue = this.defaultValue || (this.nullable ? null : '');
            this.editor = 'input';
            this.attributes = $.extend({}, this.attributes, { type: 'text', class: 'k-textbox' });
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
            this.editor = 'input';
            this.attributes = $.extend({}, this.attributes);
            this.attributes[kendo.attr('role')] = 'numerictextbox';
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
            this.editor = 'input';
            this.attributes = $.extend({}, this.attributes);
            this.attributes[kendo.attr('role')] = 'switch';
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
            this.editor = 'input';
            this.attributes = $.extend({}, this.attributes);
            this.attributes[kendo.attr('role')] = 'datepicker';
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
            default: '<span style="#: attributes.style #">#: attributes.text #</span>'
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
                var fontSize = parseInt(content.css('font-size'), 10);
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
            default: '<img src="#: attributes.src #" alt="#: attributes.alt #">'
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
            default: '<input type="text" style="#: attributes.style #" data-#= ns #bind="value: #: properties.name #">'
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
                return template($.extend(component, {ns: kendo.ns}));
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
            default: '<a class="k-toggle-button k-button" style="#: attributes.style #">#: attributes.text #</a><input type="hidden" data-#= ns #bind="value: #: properties.name #">'
            //k-state-active
        },
        height: 100,
        width: 300,
        attributes: {
            style: new adapters.StyleAdapter(),
            activeStyle: new adapters.StyleAdapter(),
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
                return template($.extend(component, {ns: kendo.ns}));
            }
        },

        /**
         * Add event handlers
         * @param component
         */
        addEvents: function(component) {

        },

        /**
         * Remove event handlers
         * @param component
         */
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
                var anchor = stageElement.find('>a');
                if ($.type(component.width) === NUMBER) {
                    anchor.width(component.width - 14);
                }
                if ($.type(component.height) === NUMBER) {
                    anchor.height(component.height - 4);
                    anchor.css('font-size', Math.floor(0.6*component.height));
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
