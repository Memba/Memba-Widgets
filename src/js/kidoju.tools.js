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
            Model = kidoju.data.Model,
            PageComponent = kidoju.data.PageComponent,

        // Types
            OBJECT = 'object',
            STRING = 'string',
            NUMBER = 'number',
            BOOLEAN = 'boolean',
            DATE = 'date',
            UNDEFINED = 'undefined',

        // Tools
            CURSOR_DEFAULT = 'default',
            CURSOR_CROSSHAIR = 'crosshair',
            REGISTER = 'register',
            ACTIVE = 'active',
            POINTER = 'pointer',

        // HTML
            ELEMENT_CLASS = '.kj-element',
            ABSOLUTE = 'absolute',
            AUTO = 'auto',
            DIALOG_DIV = '<div class="k-popup-edit-form {0}"></div>',
            DIALOG_CLASS = '.kj-dialog',

        // Event
            CLICK = 'click',

            FORMULA = 'function validate(value, solution) {\n\t{0}\n}',
            CUSTOM = {
                name: 'custom',
                formula: kendo.format(FORMULA, '// Your code should return true when value is validated against solution.')
            };

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

        /**
         * Build a random hex string of length characters
         * @param length
         * @returns {string}
         */
        function randomString(length) {
            var s = new Array(length + 1).join('x');
            return s.replace(/x/g, function(c) {
                /* jshint -W016 */
                return (Math.random()*16|0).toString(16);
                /* jshint +W016 */
            });
        }

        /*********************************************************************************
         * Tools
         *********************************************************************************/

        /**
         * Registry of tools
         * @type {{register: Function}}
         */
        var tools = kidoju.tools = kendo.observable({
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

                // Extend tool with init options
                $.extend(this, options);

                // Pass solution adapter to validation adapter, especially for the code editor
                if (this.properties && this.properties.solution instanceof adapters.BaseAdapter && this.properties.validation instanceof adapters.ValidationAdapter) {
                    this.properties.validation.solutionAdapter = this.properties.solution;
                }

            },

            /**
             * Get a kidoju.data.Model for attributes
             * @method _getAttributeModel
             * @returns {kidoju.data.Model}
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
                return Model.define(model);
            },

            /**
             * Gets property grid row specifications for attributes
             * @method _getAttributeRows
             * @returns {kArray}
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
             * Get a kidoju.data.Model for properties
             * @method _getPropertyModel
             * @returns {kidoju.data.Model}
             * @private
             */
            _getPropertyModel: function () {
                var model = {fields: {}};
                for (var prop in this.properties) {
                    if (this.properties.hasOwnProperty(prop)) {
                        if (this.properties[prop] instanceof adapters.BaseAdapter) {
                            model.fields[prop] = this.properties[prop].getField();
                            if (prop === 'name') {
                                // TODO: Add a property field name
                                model.fields[prop].defaultValue = 'val_' + randomString(4);
                            }
                        }
                    }
                }
                return Model.define(model);
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
             * Get a dialog window
             */
            getDialog: function() {
                var that = this,
                    dialog = $(DIALOG_CLASS).data('kendoWindow');
                // Find or create dialog frame
                if (!(dialog instanceof kendo.ui.Window)) {
                    // Create dialog
                    dialog = $(kendo.format(DIALOG_DIV, DIALOG_CLASS.substr(1)))
                        .appendTo(document.body)
                        .kendoWindow({
                            actions: ['close'],
                            modal: true,
                            resizable: false,
                            visible: false,
                            width: 800
                        })
                        .data('kendoWindow');
                }
                return dialog;
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
            },
            library: [
                // TODO: provide a Soundex and doubleMetaphone function to web worker
                // See https://github.com/hgoebl/doublemetaphone
                // See https://github.com/NaturalNode/natural
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return value === solution;')
                },
                {
                    name: 'ignoreCaseEqual',
                    formula: kendo.format(FORMULA, 'return value.trim().toUpperCase() === solution.trim.toLowerCase();')
                },
                {
                    name: 'match',
                    formula: kendo.format(FORMULA, 'return (new RegExp(solution)).match(value);')
                }
            ],
            libraryDefault: 'equal'
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
            },
            library: [
                {
                    name: 'equal',
                    // TODO: parsing raises a culture issue with 5.3 in english and 5,3 in french
                    formula: kendo.format(FORMULA, 'return parseFloat(value) === parseFloat(solution);')
                },
                {
                    name: 'greaterThan',
                    formula: kendo.format(FORMULA, 'return parseFloat(value) > parseFloat(solution);')
                },
                {
                    name: 'greaterThanOrEqual',
                    formula: kendo.format(FORMULA, 'return parseFloat(value) >= parseFloat(solution);')
                },
                {
                    name: 'lowerThan',
                    formula: kendo.format(FORMULA, 'return parseFloat(value) < parseFloat(solution);')
                },
                {
                    name: 'lowerThanOrEqual',
                    formula: kendo.format(FORMULA, 'return parseFloat(value) <= parseFloat(solution);')
                }
            ],
            libraryDefault: 'equal'
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
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).toLowerCase() === String(solution).toLowerCase();')
                }
            ],
            libraryDefault: 'equal'
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
            },
            library: [
                {
                    name: 'equal',
                    // TODO: parsing raises a culture issue with MM/DD/YYYY in english and DD/MM/YYYY in french
                    formula: kendo.format(FORMULA, 'return new Date(value) === new Date(solution);')
                }
            ],
            libraryDefault: 'equal'
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
                // This is the inline editor with a [...] button which triggers this.showDialog
                that.editor = function (container, options) {
                    var table = $('<div/>')
                        .css({ display: 'table' })
                        .appendTo(container);
                    var cell = $('<div/>')
                        .css({
                            display: 'table-cell',
                            width: '100%',
                            paddingRight: '8px'
                        })
                        .appendTo(table);
                    var input = $('<input/>')
                        .addClass('k-textbox') // or k-input
                        .css({width: '100%'})
                        .attr($.extend({}, options.attributes, {'data-bind': 'value: ' + options.field}))
                        .appendTo(cell);
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({
                            display: 'table-cell',
                            minWidth: '40px',
                            height: input.css('height'), // to match input,
                            margin: 0
                        })
                        .appendTo(table)
                        .on(CLICK, $.proxy(that.showDialog, that, options));
                };
            },
            showDialog: function (options) {
                var that = this,
                    dialog = that.getDialog();
                // Create viewModel (Cancel shall not save changes to main model)
                dialog.viewModel = kendo.observable({
                    style: options.model.get(options.field)
                });
                // Prepare UI
                dialog.title(options.title);
                var content = '<div class="k-edit-form-container">' +
                    '<div data-role="styleeditor" data-bind="value: style"></div>' +
                    '<div class="k-edit-buttons k-state-default"><a class="k-primary k-button" data-command="ok" href="#">OK</a><a class="k-button" data-command="cancel" href="#">Cancel</a></div>' +
                    '</div>';
                dialog.content(content);
                kendo.bind(dialog.element, dialog.viewModel);
                dialog.element.addClass('kj-no-padding');
                // Bind click handler for edit buttons
                dialog.element.on(CLICK, '.k-edit-buttons>.k-button', $.proxy(that.closeDialog, that, options, dialog));
                // Show dialog
                dialog.center().open();
            },
            closeDialog: function (options, dialog, e) {
                var that = this;
                if (e instanceof $.Event && e.target instanceof window.HTMLElement) {
                    var command = $(e.target).attr(kendo.attr('command'));
                    if (command === 'ok') {
                        options.model.set(options.field, dialog.viewModel.get('style'));
                    }
                    if (command === 'ok' || command === 'cancel') {
                        dialog.close();
                        dialog.element.off(CLICK, '.k-edit-buttons>.k-button');
                        dialog.element.removeClass('kj-no-padding');
                        // The content method destroys widgets and unbinds data
                        dialog.content('');
                        dialog.viewModel = undefined;
                    }
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
                that.editor = function (container, options) {
                    var table = $('<div/>')
                        .css({display: 'table'})
                        .appendTo(container);
                    var cell = $('<div/>')
                        .css({
                            display: 'table-cell',
                            width: '100%',
                            paddingRight: '8px'
                        })
                        .appendTo(table);
                    var input = $('<div data-role="codeinput" />')
                        .attr($.extend({}, options.attributes, {'data-bind': 'value: ' + options.field + ', source: _library'}))
                        .appendTo(cell);
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({
                            display: 'table-cell',
                            minWidth: '40px',
                            height: $('input.k-textbox').first().css('height'), // hopefully there is one available before CodeInput widget is initialized
                            margin: 0
                        })
                        .appendTo(table)
                        .on(CLICK, $.proxy(that.showDialog, that, options));
                };
            },
            showDialog: function (options/*,evt*/) {
                var that = this,
                    dialog = that.getDialog();
                // Create viewModel (Cancel shall not save changes to main model)
                dialog.viewModel = kendo.observable({
                    code: options.model.get(options.field),
                    library: [CUSTOM].concat(that.solutionAdapter.library)
                });
                // Prepare UI
                dialog.title(options.title);
                var content = '<div class="k-edit-form-container">' +
                    '<div data-role="codeeditor" data-bind="value: code, source: library" data-default="' + that.solutionAdapter.libraryDefault + '" data-solution="' + kendo.htmlEncode(JSON.stringify(options.model.get('properties.solution'))) + '"></div>' +
                    '<div class="k-edit-buttons k-state-default"><a class="k-primary k-button" data-command="ok" href="#">OK</a><a class="k-button" data-command="cancel" href="#">Cancel</a></div>' +
                    '</div>';
                dialog.content(content);
                kendo.bind(dialog.element, dialog.viewModel);
                dialog.element.addClass('kj-no-padding');
                // Bind click handler for edit buttons
                dialog.element.on(CLICK, '.k-edit-buttons>.k-button', $.proxy(that.closeDialog, that, options, dialog));
                // Bind window activate handler
                dialog.bind('activate', function () {
                    // IMPORTANT, we need to refresh codemirror here
                    // otherwise the open animation messes with CodeMirror calculations
                    // and gutter and line numbers are displayed at the wrong coordinates
                    var codeEditor = dialog.element
                        .find('.kj-codeeditor')
                        .data('kendoCodeEditor');
                    if (codeEditor instanceof kendo.ui.CodeEditor && codeEditor.codeMirror instanceof window.CodeMirror) {
                        codeEditor.codeMirror.refresh();
                    }
                    dialog.unbind('activate');
                });
                // Show dialog
                dialog.center().open();
            },
            closeDialog: function (options, dialog, e) {
                var that = this;
                if (e instanceof $.Event && e.target instanceof window.HTMLElement) {
                    var command = $(e.target).attr(kendo.attr('command'));
                    if (command === 'ok') {
                        options.model.set(options.field, dialog.viewModel.get('code'));
                    }
                    if (command === 'ok' || command === 'cancel') {
                        dialog.close();
                        dialog.element.off(CLICK, '.k-edit-buttons>.k-button');
                        dialog.element.removeClass('kj-no-padding');
                        // The content method destroys widgets and unbinds data
                        dialog.content('');
                        dialog.viewModel = undefined;
                    }
                }
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
        tools.register(Pointer);

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
                if (component instanceof PageComponent) {
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
                if (stageElement.is(ELEMENT_CLASS) && component instanceof PageComponent) {
                    var content = stageElement.find('>span'),
                        fontSize = parseInt(content.css('font-size'), 10);
                    if (!isNaN(fontSize)) {
                        // The Nan test prevents the following loops from executing in Zombie
                        // see https://github.com/assaf/zombie/issues/929
                        var height, width,
                            clone = content
                                .clone()
                                .hide()
                                .css({
                                    position: ABSOLUTE,
                                    height: AUTO,
                                    width: AUTO
                                });
                        stageElement.after(clone);
                        // if no overflow, increase until overflow
                        while (clone.width() <= component.width && clone.height() <= component.height) {
                            width = clone.width(); height = clone.height(); fontSize++;
                            clone.css('font-size', fontSize);
                            if (clone.width() === width && clone.height() === height) {
                                break; //avoid an infinite loop if fontSize has no impact on dimensions
                            }
                        }
                        // if overflow, decrease until no overflow
                        while (clone.width() > component.width || clone.height() > component.height) {
                            width = clone.width(); height = clone.height(); fontSize--;
                            clone.css('font-size', fontSize);
                            if (clone.width() === width && clone.height() === height) {
                                break; //avoid an infinite loop if fontSize has no impact on dimensions
                            }
                        }
                        clone.remove();
                        content.css('font-size', fontSize);
                    }

                    // prevent any side effect
                    e.preventDefault();
                    // prevent event to bubble on stage
                    e.stopPropagation();
                }
            }
        });
        tools.register(Label);

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
                if (component instanceof PageComponent) {
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
                if (stageElement.is(ELEMENT_CLASS) && component instanceof PageComponent) {
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
        tools.register(Image);

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
                    solutionAdapter: new adapters.StringAdapter({title: 'Solution'})
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
                if (component instanceof PageComponent) {
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
                if (stageElement.is(ELEMENT_CLASS) && component instanceof PageComponent) {
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
        tools.register(Textbox);

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
                    solutionAdapter: new adapters.BooleanAdapter({title: 'Solution'})
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
                if (component instanceof PageComponent) {
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
                if (stageElement.is(ELEMENT_CLASS) && component instanceof PageComponent) { // TODO: same id, same tool?
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
        tools.register(Button);

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
                if (component instanceof PageComponent) {
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
                if (stageElement.is(ELEMENT_CLASS) && component instanceof PageComponent) { // TODO: same id, same tool?
                    var content = stageElement.find('>div'),
                        fontSize = parseInt(content.find('label').css('font-size'), 10);
                    if (!isNaN(fontSize)) {
                        // The Nan test prevents the following loops from executing in Zombie
                        // see https://github.com/assaf/zombie/issues/929
                        var height, width,
                            clone = content
                                .clone()
                                .hide()
                                .css({
                                    position: ABSOLUTE,
                                    height: AUTO,
                                    width: AUTO
                                }),
                            input = clone.find('input[type="checkbox"]'),
                            label = clone.find('label');
                        stageElement.after(clone);
                        // if no overflow, increase until overflow
                        while (clone.width() <= component.width && clone.height() <= component.height) {
                            width = clone.width(); height = clone.height(); fontSize++;
                            label.css('font-size', fontSize);
                            input.css({
                                height: fontSize * 2 / 3,
                                width: fontSize * 2 / 3
                            });
                            if (clone.width() === width && clone.height() === height) {
                                break; //avoid an infinite loop if fontSize has no impact on dimensions
                            }
                        }
                        // if overflow, decrease until no overflow
                        while (clone.width() > component.width || clone.height() > component.height) {
                            width = clone.width(); height = clone.height(); fontSize--;
                            label.css('font-size', fontSize);
                            input.css({
                                height: fontSize * 2 / 3,
                                width: fontSize * 2 / 3
                            });
                            if (clone.width() === width && clone.height() === height) {
                                break; //avoid an infinite loop if fontSize has no impact on dimensions
                            }
                        }
                        clone.remove();
                        content.find('label').css('font-size', fontSize);
                        content.find('input[type="checkbox"]').css({
                            height: fontSize * 2 / 3,
                            width: fontSize * 2 / 3
                        });
                    }
                    // prevent any side effect
                    e.preventDefault();
                    // prevent event to bubble on stage
                    e.stopPropagation();
                }
            }

        });
        tools.register(CheckBox);

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
                if (component instanceof PageComponent) {
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
                if (stageElement.is(ELEMENT_CLASS) && component instanceof PageComponent) { // TODO: same id, same tool?
                    var content = stageElement.find('>div'),
                        fontSize = parseInt(content.find('label').css('font-size'), 10);
                    if (!isNaN(fontSize)) {
                        // The Nan test prevents the following loops from executing in Zombie
                        // see https://github.com/assaf/zombie/issues/929
                        var height, width,
                            clone = content
                                .clone()
                                .hide()
                                .css({
                                    position: ABSOLUTE,
                                    height: AUTO,
                                    width: AUTO
                                }),
                            inputs = clone.find('input[type="radio"]'),
                            labels = clone.find('label');
                        stageElement.after(clone);
                        // if no overflow, increase until overflow
                        while (clone.width() <= component.width && clone.height() <= component.height)
                        {
                            width = clone.width(); height = clone.height(); fontSize++;
                            labels.css('font-size', fontSize);
                            inputs.css({
                                height: fontSize * 2 / 3,
                                width: fontSize * 2 / 3
                            });
                            if (clone.width() === width && clone.height() === height) {
                                break; //avoid an infinite loop if fontSize has no impact on dimensions
                            }
                        }
                        // if overflow, decrease until no overflow
                        while (clone.width() > component.width || clone.height() > component.height) {
                            width = clone.width(); height = clone.height(); fontSize--;
                            labels.css('font-size', fontSize);
                            inputs.css({
                                height: fontSize * 2 / 3,
                                width: fontSize * 2 / 3
                            });
                            if (clone.width() === width && clone.height() === height) {
                                break; //avoid an infinite loop if fontSize has no impact on dimensions
                            }
                        }
                        clone.remove();
                        content.find('label').css('font-size', fontSize);
                        content.find('input[type="radio"]').css({
                            height: fontSize * 2 / 3,
                            width: fontSize * 2 / 3
                        });
                    }
                    // prevent any side effect
                    e.preventDefault();
                    // prevent event to bubble on stage
                    e.stopPropagation();
                }
            }

        });
        tools.register(Quiz);


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
