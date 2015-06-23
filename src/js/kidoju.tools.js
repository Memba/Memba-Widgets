/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define(['./vendor/kendo/kendo.binder', './kidoju.data'], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo,
            kidoju = window.kidoju = window.kidoju || {},

        // Types
            OBJECT = 'object',
            STRING = 'string',
            NUMBER = 'number',
            BOOLEAN = 'boolean',
            DATE = 'date',

        // Tools
            CURSOR_DEFAULT = 'default',
            CURSOR_CROSSHAIR = 'crosshair',
            REGISTER = 'register',
            ACTIVE = 'active',
            POINTER = 'pointer',

        // HTML
            ELEMENT_CLASS = '.kj-element',
        // POSITION = 'position',
            ABSOLUTE = 'absolute',
            DIALOG_DIV = '<div class="k-popup-edit-form {0}"></div>',
            DIALOG_CLASS = '.kj-dialog',

        // Event
            CLICK = 'click';

        /*********************************************************************************
         * Culture
         *********************************************************************************/
        var culture = kidoju.culture = kidoju.culture || {};
        culture.tools = {}; // TODO

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.tools: ' + message);
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
            register: function (Class) {
                // if(Class instanceof constructor) {
                if ($.type(Class.fn) === OBJECT) {
                    var obj = new Class();
                    if (obj instanceof Tool && $.type(obj.id) === STRING) {
                        if (obj.id === ACTIVE || obj.id === REGISTER) {
                            throw new Error('You cannot name your tool `active` or `register`');
                        } else if (!this[obj.id]) { // make sure (our system) tools are not being replaced
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
        var Tool = kidoju.Tool = kendo.Class.extend({
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
            init: function (options) {
                if ($.type(options) === OBJECT) {
                    if ($.type(options.id) === STRING) {
                        this.id = options.id;
                    }
                    if ($.type(options.icon) === STRING) {
                        this.icon = options.icon;
                    }
                    // if ($.type(options.name) === STRING) {
                    //    this.name = options.name;
                    // }
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
            _getAttributeModel: function () {
                var model = {fields: {}};
                for (var attr in this.attributes) {
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
            _getAttributeRows: function () {
                var rows = [];

                // Add top, left, height, width, rotation
                // rows.push(new adapters.NumberAdapter({attributes:{'data-min': 0}}).getRow('top'));
                rows.push(new adapters.NumberAdapter().getRow('top'));
                rows.push(new adapters.NumberAdapter().getRow('left'));
                rows.push(new adapters.NumberAdapter().getRow('height'));
                rows.push(new adapters.NumberAdapter().getRow('width'));
                rows.push(new adapters.NumberAdapter().getRow('rotate'));

                // Add other attributes
                for (var attr in this.attributes) {
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
            _getPropertyModel: function () {
                var model = {fields: {}};
                for (var prop in this.properties) {
                    if (this.properties.hasOwnProperty(prop)) {
                        if (this.properties[prop] instanceof adapters.BaseAdapter) {
                            model.fields[prop] = this.properties[prop].getField();
                            if (prop === 'name') {
                                // Add a property field name
                                model.fields[prop].defaultValue = 'val_' + Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
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
            _getPropertyRows: function () {
                var rows = [];

                for (var prop in this.properties) {
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
            init: function (options) {
                options = options || {};
                // this.value = options.value;

                // See http://docs.telerik.com/kendo-ui/api/javascript/data/model#methods-Model.define
                this.defaultValue = options.defaultValue;
                this.editable = options.editable;
                this.nullable = options.nullable;
                this.parse = options.parse;
                this.from = options.from;
                this.validation = options.validation;

                // See http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns
                this.field = options.field;
                this.title = options.title;
                this.format = options.format;
                this.template = options.template;
                this.editor = options.editor;
                // TODO: HTML encode????
                this.attributes = options.attributes;
            },

            /**
             * Get a kendo.data.Model field
             * See http://docs.telerik.com/kendo-ui/api/javascript/data/model#methods-Model.define
             * @returns {{}}
             */
            getField: function () {
                var field = {};
                if ([STRING, NUMBER, BOOLEAN, DATE].indexOf(this.type) > -1) {
                    field.type = this.type;
                }
                if ($.type(this.defaultValue) === this.type ||
                    this.type === undefined) { // TODO: test that defaultValue is null or an object
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
            getRow: function (field) {
                if ($.type(field) !== STRING || field.length === 0) {
                    throw new TypeError();
                }
                var row = {};
                row.field = field; // Mandatory
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
                // TODO: HTML encode????
                if ($.isPlainObject(this.attributes)) {
                    row.attributes = this.attributes;
                }
                return row;
            }

        });

        /**
         * String adapter
         */
        adapters.StringAdapter = adapters.BaseAdapter.extend({
            init: function (options) {
                adapters.BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, {type: 'text', class: 'k-textbox'});
            }
        });

        /**
         * Number adapter
         */
        adapters.NumberAdapter = adapters.BaseAdapter.extend({
            init: function (options) {
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
            init: function (options) {
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
            init: function (options) {
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
            init: function (options) {
                var that = this;
                adapters.BaseAdapter.fn.init.call(that, options);
                that.type = STRING;
                that.defaultValue = that.defaultValue || (that.nullable ? null : '');
                that.editor = function (container, options) {
                    var div = $('<div/>')
                        .css({display: 'table'})
                        .appendTo(container);
                    var span = $('<span/>')
                        .css({
                            display: 'table-cell',
                            width: '100%',
                            paddingRight: '8px'
                        })
                        .appendTo(div);
                    var input = $('<input/>')
                        .addClass('k-textbox') // or k-input
                        .css({width: '100%'})
                        .attr($.extend({}, options.attributes, {'data-bind': 'value: ' + options.field}))
                        .appendTo(span);
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({
                            display: 'table-cell',
                            minWidth: '40px',
                            height: input.css('height'), // to match input,
                            margin: 0
                        })
                        .appendTo(div)
                        .on(CLICK, $.proxy(that.showDialog, that, options));
                };
            },
            showDialog: function (options) {
                var that = this,
                    dialog = $(DIALOG_CLASS).data('kendoWindow');
                if (!(dialog instanceof kendo.ui.Window)) {
                    // Create dialog
                    dialog = $(kendo.format(DIALOG_DIV, DIALOG_CLASS.substr(1)))
                        .appendTo(document.body)
                        .kendoWindow({
                            actions: ['close'],
                            modal: true,
                            resizable: false,
                            visible: false
                        })
                        .data('kendoWindow');
                    dialog.element.on(CLICK, '.k-button', $.proxy(that.closeDialog, that, options, dialog));
                }
                // Prepare dialog (the content method destroys widgets and unbinds data)
                dialog.title(options.title);
                var content = '<div class="k-edit-form-container kj-style-edit-form">' +
                    '<div class="k-edit-label"><label for="title">Title</label></div><div data-container-for="title" class="k-edit-field"><input type="text" class="k-input k-textbox" name="title" data-bind="value:title"></div>' +
                    '<div class="k-edit-label"><label for="start">Start</label></div><div data-container-for="start" class="k-edit-field"><span class="k-widget k-datetimepicker k-header"><span class="k-picker-wrap k-state-default"><input type="text" required="" data-type="date" data-role="datetimepicker" data-bind="value:start" data-validate="true" name="start" data-datecompare-msg="Start date should be before or equal to the end date" class="k-input" role="combobox" aria-expanded="false" aria-disabled="false" aria-readonly="false" style="width: 100%;"><span unselectable="on" class="k-select"><span unselectable="on" class="k-icon k-i-calendar" role="button">select</span><span unselectable="on" class="k-icon k-i-clock" role="button">select</span></span></span></span><span data-for="start" class="k-invalid-msg" style="display: none;"></span></div>' +
                    '<div class="k-edit-label"><label for="end">End</label></div><div data-container-for="end" class="k-edit-field"><span class="k-widget k-datetimepicker k-header"><span class="k-picker-wrap k-state-default"><input type="text" required="" data-type="date" data-role="datetimepicker" data-bind="value:end" data-validate="true" name="end" data-datecompare-msg="End date should be after or equal to the start date" class="k-input" role="combobox" aria-expanded="false" aria-disabled="false" aria-readonly="false" style="width: 100%;"><span unselectable="on" class="k-select"><span unselectable="on" class="k-icon k-i-calendar" role="button">select</span><span unselectable="on" class="k-icon k-i-clock" role="button">select</span></span></span></span><span data-for="end" class="k-invalid-msg" style="display: none;"></span></div>' +
                    '<div class="k-edit-label"><label for="percentComplete">Complete</label></div><div data-container-for="percentComplete" class="k-edit-field"><span class="k-widget k-numerictextbox"><span class="k-numeric-wrap k-state-default"><input type="text" class="k-formatted-value k-input" tabindex="0" aria-disabled="false" aria-readonly="false" style="display: inline-block;"><input type="text" name="percentComplete" required="required" min="0" max="1" step="0.01" data-type="number" data-bind="value:percentComplete" data-role="numerictextbox" role="spinbutton" class="k-input" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0" aria-disabled="false" aria-readonly="false" style="display: none;"><span class="k-select"><span unselectable="on" class="k-link"><span unselectable="on" class="k-icon k-i-arrow-n" title="Increase value">Increase value</span></span><span unselectable="on" class="k-link"><span unselectable="on" class="k-icon k-i-arrow-s" title="Decrease value">Decrease value</span></span></span></span></span><span data-for="percentComplete" class="k-invalid-msg" style="display: none;"></span></div>' +
                    '<div class="k-edit-label"><label for="resources">Resources</label></div><div class="k-gantt-resources" style="display:none"></div><div data-container-for="resources" class="k-edit-field"><a href="#" class="k-button">Assign</a></div>' +

                    '<div class="k-edit-buttons k-state-default"><a class="k-primary k-button" data-command="save" href="#">Save</a><a class="k-button" data-command="cancel" href="#">Cancel</a></div>' +
                    '</div>';
                dialog.content(content);
                // Show dialog
                dialog.center().open();
            },
            closeDialog: function (options, dialog, e) {
                var that = this;
                if (e instanceof $.Event && $(e.target) instanceof $) {
                    var command = $(e.target).attr(kendo.attr('command'));
                    if (command === 'save') {
                        $.noop();
                    }
                    dialog.close();
                    dialog.content('');
                }
            }
        });

        /**
         * Property name adapter
         */
        adapters.NameAdapter = adapters.StringAdapter.extend({});

        /**
         * Property validation adapter
         */
        adapters.ValidationAdapter = adapters.BaseAdapter.extend({
            init: function (options) {
                var that = this;
                adapters.BaseAdapter.fn.init.call(that, options);
                that.type = STRING;
                switch (options.solutionType) {
                    case STRING:
                    case NUMBER:
                    case BOOLEAN:
                    case DATE:
                        that.defaultValue = that.validators[options.solutionType][0].formula;
                        break;
                    default:
                        that.defaultValue = that.validators.default[0].formula;
                }
                that.editor = function (container, options) {
                    var div = $('<div/>')
                        .css({display: 'table'})
                        .appendTo(container);
                    var span = $('<span/>')
                        .css({
                            display: 'table-cell',
                            width: '100%',
                            paddingRight: '8px'
                        })
                        .appendTo(div);
                    var input = $('<input/>')
                        .addClass('k-textbox')
                        .css({width: '100%'})
                        .prop({readonly: true})
                        // .attr($.extend({}, options.attributes, {'data-bind': 'value: ' + options.field}))
                        // TODO: Display validator name
                        .appendTo(span);
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({
                            display: 'table-cell',
                            minWidth: '40px',
                            height: input.css('height'), // to match input,
                            margin: 0
                        })
                        .appendTo(div)
                        .on(CLICK, $.proxy(that.showDialog, that, options));
                };
            },
            showDialog: function (options/*,evt*/) {
                var that = this,
                    dialog = $(DIALOG_CLASS).data('kendoWindow');
                if (!(dialog instanceof kendo.ui.Window)) {
                    // Create dialog
                    dialog = $(kendo.format(DIALOG_DIV, DIALOG_CLASS.substr(1)))
                        .appendTo(document.body)
                        .kendoWindow({
                            actions: ['close'],
                            modal: true,
                            resizable: false,
                            visible: false
                        })
                        .data('kendoWindow');
                    dialog.element.on(CLICK, '.k-button', $.proxy(that.closeDialog, that, options, dialog));
                }
                // Prepare dialog (the content method destroys widgets and unbinds data)
                dialog.title(options.title);
                var content = '<div class="k-edit-form-container kj-validation-edit-form">' +
                        // TODO: Add test textbox and button + help + possibly a combo of predefined functions
                        // '<div>' +
                        //    '<div class="k-edit-label"><label for="title">Title</label></div>' +
                        //    '<div data-container-for="title" class="k-edit-field"><input type="text" class="k-input k-textbox" name="title" data-bind="value:title"></div>' +
                        // '</div>' +
                    '<div class="kj-codemirror"></div>' +
                        // Buttons
                    '<div class="k-edit-buttons k-state-default"><a class="k-primary k-button" data-command="save" href="#">Save</a><a class="k-button" data-command="cancel" href="#">Cancel</a></div>' +
                    '</div>';
                dialog.content(content);
                var div = dialog.element.find('.kj-codemirror').get(0);
                if (div instanceof window.HTMLElement) {
                    dialog.codemirror = window.CodeMirror(div, {
                        gutters: ['CodeMirror-lint-markers'],
                        lineNumbers: true,
                        lint: true,
                        mode: 'javascript',
                        value: that.defaultValue
                    });
                    // Set actual validation formula
                    dialog.codemirror.getDoc().setValue(options.model.properties.get('validation'));
                    dialog.codemirror.on('beforeChange', function (cm, change) {
                        if ((change.from.line === 0) || // prevent changing the first line
                            (change.from.line === cm.display.renderedView.length - 1) || // prevent changing the last line
                            (change.origin === '+delete' && change.to.line === cm.display.renderedView.length - 1)) { // prevent backspace on the last line or suppr on the previous line
                            change.cancel();
                        }
                    });
                    dialog.bind('activate', function () {
                        // IMPORTANT, we need to refresh codemirror here
                        // otherwise the open animation messes with CodeMirror calculations
                        // and gutter and line numbers are displayed at the wrong coordinates
                        dialog.codemirror.refresh();
                        dialog.unbind('activate');
                    });
                    // open dialog
                    dialog.center().open();

                }
            },
            closeDialog: function (options, dialog, e) {
                var that = this;
                if (e instanceof $.Event && $(e.target) instanceof $) {
                    var command = $(e.target).attr(kendo.attr('command'));
                    if (command === 'save') {
                        options.model.properties.set('validation', dialog.codemirror.getDoc().getValue());
                    }
                    dialog.close();
                    // restore
                    dialog.content('');
                    dialog.codemirror = undefined;
                }
            },
            prerequisites: {
                string: '', // TODO
                number: '',
                boolean: '',
                date: '',
                default: '' // '' + func converts a function to a string including the code - see http://jsfiddle.net/VUZck/146/ and http://stackoverflow.com/questions/12807263/prevent-uglifyjs-from-renaming-certain-functions
            },
            validators: {
                string: [
                    // TODO: provide a Soundex and doubleMetaphone function to web worker
                    // See https://github.com/hgoebl/doublemetaphone
                    // See https://github.com/NaturalNode/natural
                    {
                        name: 'toUpperCase', // TODO use cultures
                        formula: 'function validate(value, solution) {\n\treturn typeof value === "string" && typeof solution === "string" &&\n\t\tvalue.trim().toUpperCase() === solution.trim().toUpperCase();\n}'
                    }
                ],
                number: [
                    {
                        name: 'float', // TODO use cultures
                        formula: 'function validate(value, solution) {\n\treturn parseFloat(value) === parseFloat(solution);\n}'
                    },
                    {
                        name: 'integer', // TODO use cultures
                        formula: 'function validate(value, solution) {\n\treturn parseInt(value, 10) === parseInt(solution, 10);\n}'
                    },
                    {
                        name: 'rounded to 2 decimals', // TODO use cultures
                        formula: 'function validate(value, solution) {\n\treturn typeof value === "number" && typeof solution === "number" && Math.round(value*100)/100 === Math.round(solution*100)/100;\n}'
                    }
                ],
                boolean: [
                    {
                        name: 'default',
                        formula: 'function validate(value, solution) {\n\treturn typeof value === "boolean" && typeof solution === "boolean" && value === solution;\n}'
                    }
                ],
                date: [
                    {
                        name: 'date',
                        formula: 'function validate(value, solution) {\n\treturn typeof value === "date" && typeof solution === "date" && value.toDateString() === solution.toDateString();\n}'
                    }
                ],
                default: [
                    {
                        name: 'deepEqual',
                        formula: '' // TODO: deepEqual - consider https://github.com/jquery/qunit/blob/0cf737d46775aecb06780e3df36cb9cac6d01b0c/src/equiv.js
                    }
                ]
            }
        });

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
                text: new adapters.StringAdapter({defaultValue: 'Label'}),
                style: new adapters.StyleAdapter({defaultValue: 'font-family: Georgia, serif; color: #FF0000;'})
            },

            /**
             * Get Html content
             * @method getHtml
             * @param component
             * @returns {*}
             */
            getHtml: function (component) {
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
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                if (stageElement.is(ELEMENT_CLASS) && component instanceof kidoju.PageComponent) {
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
                    // if no overflow, increase until overflow
                    while (clone.height() < component.height) {
                        fontSize++;
                        clone.css('font-size', fontSize);
                    }
                    // if overflow, decrease until no overflow
                    while (clone.height() > component.height) {
                        fontSize--;
                        clone.css('font-size', fontSize);
                    }
                    clone.remove();
                    content.css('font-size', fontSize);

                    // prevent any side effect
                    e.preventDefault();
                    // prevent event to bubble on stage
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
            getHtml: function (component) {
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
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                if (stageElement.is(ELEMENT_CLASS) && component instanceof kidoju.PageComponent) {
                    var content = stageElement.find('>img');
                    if ($.type(component.width) === NUMBER) {
                        content.width(component.width);
                    }
                    if ($.type(component.height) === NUMBER) {
                        content.height(component.height);
                    }
                    // prevent any side effect
                    e.preventDefault();
                    // prevent event to bubble on stage
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
            properties: {
                name: new adapters.NameAdapter({title: 'Name'}),
                description: new adapters.StringAdapter({title: 'Description'}),
                solution: new adapters.StringAdapter({title: 'Solution'}),
                validation: new adapters.ValidationAdapter({
                    title: 'Validation',
                    solutionType: STRING
                }),
                success: new adapters.ScoreAdapter({title: 'Success'}),
                failure: new adapters.ScoreAdapter({title: 'Failure'}),
                omit: new adapters.ScoreAdapter({title: 'Omit'})
            },
            /**
             * Get Html content
             * @method getHtml
             * @param component
             * @returns {*}
             */
            getHtml: function (component) {
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
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                if (stageElement.is(ELEMENT_CLASS) && component instanceof kidoju.PageComponent) {
                    var content = stageElement.find('>input');
                    if ($.type(component.width) === NUMBER) {
                        content.width(component.width);
                    }
                    if ($.type(component.height) === NUMBER) {
                        content.height(component.height);
                        content.css('font-size', Math.floor(0.75 * component.height));
                    }
                    // prevent any side effect
                    e.preventDefault();
                    // prevent event to bubble on stage
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
                // k-state-active
            },
            height: 100,
            width: 300,
            attributes: {
                style: new adapters.StyleAdapter(),
                activeStyle: new adapters.StyleAdapter(),
                text: new adapters.StringAdapter({defaultValue: 'Button'})
            },
            properties: {
                name: new adapters.NameAdapter({title: 'Name'}),
                description: new adapters.StringAdapter({title: 'Description'}),
                solution: new adapters.BooleanAdapter({title: 'Solution'}),
                validation: new adapters.ValidationAdapter({
                    title: 'Validation',
                    solutionType: BOOLEAN
                }),
                success: new adapters.ScoreAdapter({title: 'Success'}),
                failure: new adapters.ScoreAdapter({title: 'Failure'}),
                omit: new adapters.ScoreAdapter({title: 'Omit'})
            },

            /**
             * Get Html content
             * @method getHtml
             * @param component
             * @returns {*}
             */
            getHtml: function (component) {
                if (component instanceof kidoju.PageComponent) {
                    var template = kendo.template(this.templates.default);
                    return template($.extend(component, {ns: kendo.ns}));
                }
            },

            /**
             * Add event handlers
             * @param component
             */
            addEvents: function (component) {

            },

            /**
             * Remove event handlers
             * @param component
             */
            removeEvents: function (component) {

            },
            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                if (stageElement.is(ELEMENT_CLASS) && component instanceof kidoju.PageComponent) { // TODO: same id, same tool?
                    var anchor = stageElement.find('>a');
                    if ($.type(component.width) === NUMBER) {
                        anchor.width(component.width - 14);
                    }
                    if ($.type(component.height) === NUMBER) {
                        anchor.height(component.height - 4);
                        anchor.css('font-size', Math.floor(0.6 * component.height));
                    }
                    // prevent any side effect
                    e.preventDefault();
                    // prevent event to bubble on stage
                    e.stopPropagation();
                }
            }
        });
        kidoju.tools.register(Button);

        /**
         * @class Quiz tool
         * @type {void|*}
         */
        var CheckBox = kidoju.Tool.extend({
            id: 'checkbox',
            icon: 'checkbox',
            cursor: CURSOR_CROSSHAIR,
            templates: {
                // TODO See http://www.telerik.com/forums/font-size-of-styled-radio-buttons-and-checkboxes
                default: '<div><input id="#: properties.name #" type="checkbox" style="#: attributes.checkboxStyle #" data-#= ns #bind="checked: #: properties.name #"><label for="#: properties.name #" style="#: attributes.labelStyle #">#: attributes.text #</label></div>'
            },
            height: 60,
            width: 500,
            attributes: {
                checkboxStyle: new adapters.StyleAdapter(),
                labelStyle: new adapters.StyleAdapter(),
                text: new adapters.StringAdapter({defaultValue: 'text'})
            },
            properties: {
                name: new adapters.NameAdapter({title: 'Name'}),
                description: new adapters.StringAdapter({title: 'Description'}),
                solution: new adapters.BooleanAdapter({title: 'Solution'}),
                validation: new adapters.ValidationAdapter({
                    title: 'Validation',
                    solutionType: BOOLEAN
                }),
                success: new adapters.ScoreAdapter({title: 'Success'}),
                failure: new adapters.ScoreAdapter({title: 'Failure'}),
                omit: new adapters.ScoreAdapter({title: 'Omit'})
            },

            /**
             * Get Html content
             * @method getHtml
             * @param component
             * @returns {*}
             */
            getHtml: function (component) {
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
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                if (stageElement.is(ELEMENT_CLASS) && component instanceof kidoju.PageComponent) { // TODO: same id, same tool?
                    var content = stageElement.find('>div');
                    var clone = content.clone()
                        .hide()
                        .css({
                            position: 'absolute',
                            height: 'auto',
                            width: 'auto'
                        });
                    stageElement.after(clone);
                    var input = clone.find('input[type="checkbox"]'),
                        label = clone.find('label'),
                        fontSize = parseInt(label.css('font-size'));
                    // if no overflow, increase until overflow
                    while (clone.width() <= component.width && clone.height() <= component.height) {
                        fontSize++;
                        label.css('font-size', fontSize);
                        input.css({
                            height: fontSize * 2 / 3,
                            width: fontSize * 2 / 3
                        });
                    }
                    // if overflow, decrease until no overflow
                    while (clone.width() > component.width || clone.height() > component.height) {
                        fontSize--;
                        label.css('font-size', fontSize);
                        input.css({
                            height: fontSize * 2 / 3,
                            width: fontSize * 2 / 3
                        });
                    }
                    clone.remove();
                    content.find('label').css('font-size', fontSize);
                    content.find('input[type="checkbox"]').css({
                        height: fontSize * 2 / 3,
                        width: fontSize * 2 / 3
                    });
                    // prevent any side effect
                    e.preventDefault();
                    // prevent event to bubble on stage
                    e.stopPropagation();
                }
            }

        });
        kidoju.tools.register(CheckBox);

        /**
         * @class Quiz tool
         * @type {void|*}
         */
        var Quiz = kidoju.Tool.extend({
            id: 'quiz',
            icon: 'radio_button_group',
            cursor: CURSOR_CROSSHAIR,
            templates: {
                // TODO See http://www.telerik.com/forums/font-size-of-styled-radio-buttons-and-checkboxes
                default: '<div>' +
                '<div><input id="#: properties.name #_1" type="radio" name="#: properties.name #" style="#: attributes.radioStyle #" value="1" data-#= ns #bind="checked: #: properties.name #"><label for="#: properties.name #_1" style="#: attributes.labelStyle #">#: attributes.text1 #</label></div>' +
                '<div><input id="#: properties.name #_2" type="radio" name="#: properties.name #" style="#: attributes.radioStyle #" value="2" data-#= ns #bind="checked: #: properties.name #"><label for="#: properties.name #_2" style="#: attributes.labelStyle #">#: attributes.text2 #</label></div>' +
                '<div><input id="#: properties.name #_3" type="radio" name="#: properties.name #" style="#: attributes.radioStyle #" value="3" data-#= ns #bind="checked: #: properties.name #"><label for="#: properties.name #_3" style="#: attributes.labelStyle #">#: attributes.text3 #</label></div>' +
                '<div><input id="#: properties.name #_4" type="radio" name="#: properties.name #" style="#: attributes.radioStyle #" value="4" data-#= ns #bind="checked: #: properties.name #"><label for="#: properties.name #_4" style="#: attributes.labelStyle #">#: attributes.text4 #</label></div>' +
                '</div>'
            },
            height: 300,
            width: 500,
            attributes: {
                labelStyle: new adapters.StyleAdapter(),
                radioStyle: new adapters.StyleAdapter(),
                text1: new adapters.StringAdapter({defaultValue: 'text1'}),
                text2: new adapters.StringAdapter({defaultValue: 'text2'}),
                text3: new adapters.StringAdapter({defaultValue: 'text3'}),
                text4: new adapters.StringAdapter({defaultValue: 'text4'})
            },
            properties: {
                name: new adapters.NameAdapter({title: 'Name'}),
                description: new adapters.StringAdapter({title: 'Description'}),
                solution: new adapters.StringAdapter({title: 'Solution'}),
                validation: new adapters.ValidationAdapter({
                    title: 'Validation',
                    solutionType: STRING
                }),
                success: new adapters.ScoreAdapter({title: 'Success'}),
                failure: new adapters.ScoreAdapter({title: 'Failure'}),
                omit: new adapters.ScoreAdapter({title: 'Omit'})
            },

            /**
             * Get Html content
             * @method getHtml
             * @param component
             * @returns {*}
             */
            getHtml: function (component) {
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
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                if (stageElement.is(ELEMENT_CLASS) && component instanceof kidoju.PageComponent) { // TODO: same id, same tool?
                    var content = stageElement.find('>div');
                    /*
                     stageElement.css({
                     height: height,
                     width: width
                     });
                     */
                    var clone = content.clone()
                        .hide()
                        .css({
                            position: 'absolute',
                            height: 'auto',
                            width: 'auto'
                        });
                    stageElement.after(clone);
                    var inputs = clone.find('input[type="radio"]'),
                        labels = clone.find('label'),
                        fontSize = parseInt(labels.css('font-size'));
                    // if no overflow, increase until overflow
                    while (clone.width() <= component.width && clone.height() <= component.height) {
                        fontSize++;
                        labels.css('font-size', fontSize);
                        inputs.css({
                            height: fontSize * 2 / 3,
                            width: fontSize * 2 / 3
                        });
                    }
                    // if overflow, decrease until no overflow
                    while (clone.width() > component.width || clone.height() > component.height) {
                        fontSize--;
                        labels.css('font-size', fontSize);
                        inputs.css({
                            height: fontSize * 2 / 3,
                            width: fontSize * 2 / 3
                        });
                    }
                    clone.remove();
                    content.find('label').css('font-size', fontSize);
                    content.find('input[type="radio"]').css({
                        height: fontSize * 2 / 3,
                        width: fontSize * 2 / 3
                    });
                    // prevent any side effect
                    e.preventDefault();
                    // prevent event to bubble on stage
                    e.stopPropagation();
                }
            }

        });
        kidoju.tools.register(Quiz);


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

    }(window.jQuery));

    return window.kidoju;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
