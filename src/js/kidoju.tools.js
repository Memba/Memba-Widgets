/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './kidoju.data'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var kidoju = window.kidoju = window.kidoju || {};
        var Model = kidoju.data.Model;
        var PageComponent = kidoju.data.PageComponent;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.tools');
        var OBJECT = 'object';
        var STRING = 'string';
        var NUMBER = 'number';
        var BOOLEAN = 'boolean';
        var DATE = 'date';
        var CURSOR_DEFAULT = 'default';
        var CURSOR_CROSSHAIR = 'crosshair';
        var REGISTER = 'register';
        var ACTIVE = 'active';
        var POINTER = 'pointer';
        var ELEMENT_CLASS = '.kj-element';
        var AUTO = 'auto';
        var DIALOG_DIV = '<div class="k-popup-edit-form {0}"></div>';
        var DIALOG_CLASS = '.kj-dialog';
        var CLICK = 'click';
        var RX_FONT_SIZE = /font(-size)?:[^;]*[0-9]+px/;
        var FORMULA = 'function validate(value, solution, all) {\n\t{0}\n}';
        var JS_COMMENT = '// ';
        var CUSTOM = {
                name: 'custom',
                formula: kendo.format(FORMULA, '// Your code should return true when value is validated against solution.')
            };
        // Incors O-Collection check.svg
        // var SVG_SUCCESS = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#76A797" d="M3840 5760l3934 -3934c124,-124 328,-124 452,0l1148 1148c124,124 124,328 0,452l-5308 5308c-124,124 -328,124 -452,0l-2748 -2748c-124,-124 -124,-328 0,-452l1148 -1148c124,-124 328,-124 452,0l1374 1374z"/></svg>';
        var SVG_SUCCESS = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iIzc2QTc5NyIgZD0iTTM4NDAgNTc2MGwzOTM0IC0zOTM0YzEyNCwtMTI0IDMyOCwtMTI0IDQ1MiwwbDExNDggMTE0OGMxMjQsMTI0IDEyNCwzMjggMCw0NTJsLTUzMDggNTMwOGMtMTI0LDEyNCAtMzI4LDEyNCAtNDUyLDBsLTI3NDggLTI3NDhjLTEyNCwtMTI0IC0xMjQsLTMyOCAwLC00NTJsMTE0OCAtMTE0OGMxMjQsLTEyNCAzMjgsLTEyNCA0NTIsMGwxMzc0IDEzNzR6Ii8+PC9zdmc+';
        // Incors O-Collection delete.svg
        // var SVG_FAILURE = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#E68497" d="M1273 7156l2037 -2036 -2037 -2036c-124,-125 -124,-328 0,-453l1358 -1358c125,-124 328,-124 453,0l2036 2037 2036 -2037c125,-124 328,-124 453,0l1358 1358c124,125 124,328 0,453l-2037 2036 2037 2036c124,125 124,328 0,453l-1358 1358c-125,124 -328,124 -453,0l-2036 -2037 -2036 2037c-125,124 -328,124 -453,0l-1358 -1358c-124,-125 -124,-328 0,-453z"/></svg>';
        var SVG_FAILURE = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iI0U2ODQ5NyIgZD0iTTEyNzMgNzE1NmwyMDM3IC0yMDM2IC0yMDM3IC0yMDM2Yy0xMjQsLTEyNSAtMTI0LC0zMjggMCwtNDUzbDEzNTggLTEzNThjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMjAzNiAyMDM3IDIwMzYgLTIwMzdjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMTM1OCAxMzU4YzEyNCwxMjUgMTI0LDMyOCAwLDQ1M2wtMjAzNyAyMDM2IDIwMzcgMjAzNmMxMjQsMTI1IDEyNCwzMjggMCw0NTNsLTEzNTggMTM1OGMtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTIwMzYgLTIwMzcgLTIwMzYgMjAzN2MtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTEzNTggLTEzNThjLTEyNCwtMTI1IC0xMjQsLTMyOCAwLC00NTN6Ii8+PC9zdmc+';

        /*********************************************************************************
         * Culture
         *********************************************************************************/
        var culture = kidoju.culture = kidoju.culture || {};
        culture.tools = {}; // TODO

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * Build a random hex string of length characters
         * @param length
         * @returns {string}
         */
        function randomString(length) {
            var s = new Array(length + 1).join('x');
            return s.replace(/x/g, function (c) {
                /* jshint -W016 */
                return (Math.random() * 16|0).toString(16);
                /* jshint +W016 */
            });
        }

        /*********************************************************************************
         * Generic tools
         *********************************************************************************/

        /**
         * Registry of tools
         * @type {{register: Function}}
         */
        var tools = kidoju.tools = kendo.observable({
            active: null,
            register: function (Class) {
                // if (Class instanceof constructor) {
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
         * @class kidoju.Tool
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
            svg: {
                success: SVG_SUCCESS,
                failure: SVG_FAILURE
            },

            /**
             * Constructor
             * @class kidoju.Tool
             * @constructor
             * @param options
             */
            init: function (options) {

                // Extend tool with init options
                $.extend(this, options);

                // Pass solution adapter library to validation adapter, especially for the code editor
                if (this.properties && this.properties.solution instanceof BaseAdapter && this.properties.validation instanceof adapters.ValidationAdapter) {
                    this.properties.validation.library = this.properties.solution.library;
                    this.properties.validation.defaultValue = JS_COMMENT + this.properties.solution.libraryDefault;
                }

            },

            /**
             * Get a kidoju.data.Model for attributes
             * @class kidoju.Tool
             * @method _getAttributeModel
             * @returns {kidoju.data.Model}
             * @private
             */
            _getAttributeModel: function () {
                var model = { fields: {} };
                for (var attr in this.attributes) {
                    if (this.attributes.hasOwnProperty(attr)) {
                        if (this.attributes[attr] instanceof BaseAdapter) {
                            model.fields[attr] = this.attributes[attr].getField();
                        }
                    }
                }
                return Model.define(model);
            },

            /**
             * Gets property grid row specifications for attributes
             * @class kidoju.Tool
             * @method _getAttributeRows
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
                        if (this.attributes[attr] instanceof BaseAdapter) {
                            rows.push(this.attributes[attr].getRow('attributes.' + attr));
                        }
                    }
                }
                return rows;
            },

            /**
             * Get a kidoju.data.Model for properties
             * @class kidoju.Tool
             * @method _getPropertyModel
             * @returns {kidoju.data.Model}
             * @private
             */
            _getPropertyModel: function () {
                var properties = this.properties;
                var model = { fields: {} };
                for (var prop in properties) {
                    if (properties.hasOwnProperty(prop)) {
                        if (properties[prop] instanceof BaseAdapter) {
                            model.fields[prop] = properties[prop].getField();
                            if (prop === 'name') {
                                // This cannot be set as a default value on the  adapter because each instance should have a different name
                                model.fields.name.defaultValue = 'val_' + randomString(6);
                            } else if (prop === 'validation') {
                                // We need the code library otherwise we won't have code to execute when validation === '// equal' or any other library value
                                model._library = properties.validation.library;
                            }
                        }
                    }
                }
                return Model.define(model);
            },

            /**
             * Gets property grid row specifications for properties
             * @class kidoju.Tool
             * @method _getPropertyRows
             * @returns {Array}
             * @private
             */
            _getPropertyRows: function () {
                var rows = [];

                for (var prop in this.properties) {
                    if (this.properties.hasOwnProperty(prop)) {
                        if (this.properties[prop] instanceof BaseAdapter) {
                            rows.push(this.properties[prop].getRow('properties.' + prop));
                        }
                    }
                }
                return rows;
            },

            /**
             * Get Html or jQuery content
             * @class kidoju.Tool
             * @method getHtmlContent
             * @param component
             * @param mode
             * @returns {*}
             */
            getHtmlContent: function (component, mode) {
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                var template = kendo.template(this.templates[mode] || this.templates.default);
                return template($.extend(component, { ns: kendo.ns }));
            },

            /**
             * Add the display of a success or failure icon to the corresponding stage element
             * @returns {string}
             */
            showResult: function () {
                // Contrary to https://css-tricks.com/probably-dont-base64-svg/, we need base64 encoded strings otherwise kendo templates fail
                return '<div data-#= ns #bind="visible: #: properties.name #.result" style="position: absolute; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + Tool.fn.svg.success + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>' +
                       '<div data-#= ns #bind="invisible: #: properties.name #.result" style="position: absolute; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + Tool.fn.svg.failure + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>';
            }

            // onEnable: function (e, component, enabled) {},
            // onMove: function (e, component) {},
            // onResize: function (e, component) {},
            // onRotate: function (e, component) {},

        });

        /*******************************************************************************************
         * Adapter classes
         * used to display values in a proprty grid
         *******************************************************************************************/
        var adapters = kidoju.adapters = {};

        /**
         * Base (abstract) adapter
         */
        var BaseAdapter = adapters.BaseAdapter = kendo.Class.extend({

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
            getDialog: function () {
                var that = this;
                var dialog = $(DIALOG_CLASS).data('kendoWindow');
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
                            width: 860
                        })
                        .data('kendoWindow');
                }
                return dialog;
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

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

            /* jshint +W074 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

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

        /* jshint +W074 */

        /**
         * String adapter
         */
        adapters.StringAdapter = BaseAdapter.extend({
            init: function (options) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, { type: 'text', class: 'k-textbox' });
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).trim() === String(solution).trim();')
                },
                {
                    name: 'ignoreCaseEqual',
                    formula: kendo.format(FORMULA, 'return String(value).trim().toUpperCase() === String(solution).trim().toUpperCase();')
                },
                {
                    name: 'ignoreCaseMatch',
                    formula: kendo.format(FORMULA, 'return (new RegExp(\'^\' + String(solution).trim() + \'$\', \'i\')).test(String(value).trim());')
                },
                {
                    name: 'ignoreDiacriticsEqual',
                    formula: kendo.format(FORMULA, 'return removeDiacritics(String(value).trim().toUpperCase()) === removeDiacritics(String(solution).trim().toUpperCase());')
                },
                {
                    name: 'match',
                    formula: kendo.format(FORMULA, 'return (new RegExp(\'^\' + String(solution).trim() + \'$\')).test(String(value).trim());')
                },
                {
                    name: 'metaphone',
                    formula: kendo.format(FORMULA, 'return metaphone(removeDiacritics(String(value).trim().toUpperCase())) === metaphone(removeDiacritics(String(solution).trim().toUpperCase()));')
                },
                {
                    name: 'soundex',
                    formula: kendo.format(FORMULA, 'return soundex(removeDiacritics(String(value).trim().toUpperCase())) === soundex(removeDiacritics(String(solution).trim().toUpperCase()));')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Number adapter
         */
        adapters.NumberAdapter = BaseAdapter.extend({
            init: function (options) {
                BaseAdapter.fn.init.call(this, options);
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
                    formula: kendo.format(FORMULA, 'return Number(value) === Number(solution);')
                },
                {
                    name: 'greaterThan',
                    formula: kendo.format(FORMULA, 'return Number(value) > Number(solution);')
                },
                {
                    name: 'greaterThanOrEqual',
                    formula: kendo.format(FORMULA, 'return Number(value) >= Number(solution);')
                },
                {
                    name: 'lowerThan',
                    formula: kendo.format(FORMULA, 'return Number(value) < Number(solution);')
                },
                {
                    name: 'lowerThanOrEqual',
                    formula: kendo.format(FORMULA, 'return Number(value) <= Number(solution);')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Boolean adapter
         */
        adapters.BooleanAdapter = BaseAdapter.extend({
            init: function (options) {
                BaseAdapter.fn.init.call(this, options);
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
        adapters.DateAdapter = BaseAdapter.extend({
            init: function (options) {
                BaseAdapter.fn.init.call(this, options);
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
                    // Note: new Date(1994,1,1) !== new Date(1994,1,1) as they are two different objects
                    formula: kendo.format(FORMULA, 'return new Date(value) - new Date(solution) === 0;')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Text (multiline) adapter
         */
        adapters.TextAdapter = adapters.StringAdapter.extend({
            init: function (options) {
                adapters.StringAdapter.fn.init.call(this, options);
                this.editor = 'textarea';
                this.attributes = $.extend({}, this.attributes, { rows: 4, style: 'resize:vertical; width: 100%;' });
            }
        });

        /**
         * Enum adapter
         */
        adapters.EnumAdapter = adapters.StringAdapter.extend({
            init: function (options) {
                adapters.StringAdapter.fn.init.call(this, options);
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, { style: 'width: 100%;' });
                this.attributes[kendo.attr('role')] = 'dropdownlist';
                this.attributes[kendo.attr('source')] = JSON.stringify(options.enum); // kendo.htmlEncode??
            }
        });

        /**
         * Style adapter
         */
        adapters.StyleAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
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
                        .css({ width: '100%' })
                        .attr($.extend({}, options.attributes, { 'data-bind': 'value: ' + options.field }))
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
                var that = this;
                var dialog = that.getDialog();
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
         * Asset Adapter
         */
        adapters.AssetAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
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
                        .css({ width: '100%' })
                        .attr($.extend({}, options.attributes, { 'data-bind': 'value: ' + options.field }))
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
                var that = this;
                var dialog = that.getDialog();
                // Create viewModel (Cancel shall not save changes to main model)
                dialog.viewModel = kendo.observable({
                    url: options.model.get(options.field)
                });
                // Prepare UI
                dialog.title(options.title);
                var content = '<div class="k-edit-form-container">' +
                    '<div data-role="assetmanager" data-bind="value: url"></div>' +
                    '<div class="k-edit-buttons k-state-default"><a class="k-primary k-button" data-command="ok" href="#">OK</a><a class="k-button" data-command="cancel" href="#">Cancel</a></div>' +
                    '</div>';
                dialog.content(content);
                dialog.element.find(kendo.roleSelector('assetmanager')).kendoAssetManager({
                    // change: function (e) {
                    //     dialog.viewModel.set('url', e.sender.value());
                    // },
                    transport: {
                        read: function (options) {
                            options.success({
                                total: 1,
                                data: [
                                    { url: 'https://s3-eu-west-1.amazonaws.com/kidoju.test/s/en/55c9c75dcc8974a01a397472/item204.jpg', size: 3177 }
                                ]
                            });
                        },
                        create: function (options) {
                            $.noop(); // TODO
                        },
                        destroy: function (options) {
                            $.noop(); // TODO
                        }
                        // update is same as create
                    },
                    collections: [
                        {
                            name: 'G-Collection',
                            transport: {
                                read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/g_collection/svg/all/index.json'
                            }
                        },
                        {
                            name: 'O-Collection',
                            collections: [
                                {
                                    name: 'Dark Grey',
                                    transport: {
                                        read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/dark_grey/index.json'
                                    }
                                },
                                {
                                    name: 'Office',
                                    transport: {
                                        read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/office/index.json'
                                    }
                                },
                                {
                                    name: 'White',
                                    transport: {
                                        read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/o_collection/svg/white/index.json'
                                    }
                                }
                            ]
                        },
                        {
                            name: 'V-Collection',
                            collections: [
                                {
                                    name: 'Small',
                                    transport: {
                                        read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/32x32/index.json'
                                    }
                                },
                                {
                                    name: 'Medium',
                                    transport: {
                                        read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/64x64/index.json'
                                    }
                                },
                                {
                                    name: 'Large',
                                    transport: {
                                        read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/128x128/index.json'
                                    }
                                },
                                {
                                    name: 'Huge',
                                    transport: {
                                        read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/v_collection/png/256x256/index.json'
                                    }
                                }
                            ]
                        },
                        {
                            name: 'X-Collection',
                            collections: [
                                {
                                    name: 'Small',
                                    transport: {
                                        read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/x_collection/png/32x32/index.json'
                                    }
                                },
                                {
                                    name: 'Large',
                                    transport: {
                                        read: 'http://localhost:63342/Kidoju.Widgets/test/data/images/x_collection/png/128x128/index.json'
                                    }
                                }
                            ]
                        }
                    ],
                    schemes: {
                        cdn: 'https://d2rvsmwqptocm.cloudfront.net/'
                    }
                });
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
                        options.model.set(options.field, dialog.viewModel.get('url'));
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
        adapters.ValidationAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
                that.type = STRING;
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
                    var input = $('<div data-role="codeinput" />')
                        // Note: _library is added to the data bound PageComponent in its init method
                        .attr($.extend({}, options.attributes, { 'data-bind': 'value: ' + options.field + ', source: _library' }))
                        .appendTo(cell);
                    // We need a temporary textbox to calculate the height and align the button
                    var temp = $('<input type="text" class="k-textbox">')
                        .css({ visibility: 'hidden' })
                        .appendTo(cell);
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({
                            display: 'table-cell',
                            minWidth: '40px',
                            height: temp.css('height'), // $('input.k-textbox').last().css('height'),
                            margin: 0
                        })
                        .appendTo(table)
                        .on(CLICK, $.proxy(that.showDialog, that, options));
                    temp.remove();
                };
            },
            showDialog: function (options/*,evt*/) {
                var that = this;
                var dialog = that.getDialog();
                // Create viewModel (Cancel shall not save changes to main model)
                dialog.viewModel = kendo.observable({
                    code: options.model.get(options.field),
                    library: [CUSTOM].concat(that.library)
                });
                // Prepare UI
                dialog.title(options.title);
                var content = '<div class="k-edit-form-container">' +
                    '<div data-role="codeeditor" data-bind="value: code, source: library" data-default="' + that.defaultValue + '" data-solution="' + kendo.htmlEncode(JSON.stringify(options.model.get('properties.solution'))) + '"></div>' +
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
                    if (codeEditor instanceof kendo.ui.CodeEditor && codeEditor.codeMirror && $.isFunction(codeEditor.codeMirror.refresh)) {
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
        var Pointer = Tool.extend({
            id: POINTER,
            icon: 'mouse_pointer',
            cursor: CURSOR_DEFAULT,
            height: 0,
            width: 0,
            getHtmlContent: undefined
        });
        tools.register(Pointer);

        /**
         * @class Label tool
         * @type {void|*}
         */
        var Label = Tool.extend({
            id: 'label',
            icon: 'document_orientation_landscape',
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div style="#: attributes.style #">#: attributes.text #</div>'
            },
            height: 100,
            width: 300,
            attributes: {
                text: new adapters.StringAdapter({ title: 'Label', defaultValue: 'Label' }),
                style: new adapters.StyleAdapter({ title: 'Style' })
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                    if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
                        content.css('font-size', Math.floor(0.85 * content.height()));
                    }
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();

            }
        });
        tools.register(Label);

        /**
         * @class Image tool
         * @type {void|*}
         */
        var Image = Tool.extend({
            id: 'image',
            icon: 'painting_landscape',
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<img src="#: attributes.src$() #" alt="#: attributes.alt #">'
            },
            height: 250,
            width: 250,
            attributes: {
                src: new adapters.AssetAdapter({ title: 'Image', defaultValue: 'cdn://images/o_collection/svg/office/painting_landscape.svg' }),
                alt: new adapters.StringAdapter({ title: 'Text', defaultValue: 'Painting Landscape' })
            },

            /**
             * Get Html or jQuery content
             * @method getHtmlContent
             * @param component
             * @param mode
             * @returns {*}
             */
            getHtmlContent: function (component, mode) {
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                var template = kendo.template(this.templates.default);
                // The src$ function resolves urls with kidoju schemes like cdn://sample.jpg
                component.attributes.src$ = function () {
                    var url = component.attributes.get('src');
                    var schemes = kidoju.schemes || {};
                    for (var scheme in schemes) {
                        if (schemes.hasOwnProperty(scheme) && (new RegExp('^' + scheme + '://')).test(url)) {
                            url = url.replace(scheme + '://', schemes[scheme]);
                            break;
                        }
                    }
                    return url;
                };
                return template(component);
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('img');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }
        });
        tools.register(Image);

        var TEXTBOX = '<input type="text" id="#: properties.name #" class="k-textbox" style="#: attributes.style #" {0}>';
        /**
         * @class Textbox tool
         * @type {void|*}
         */
        var Textbox = Tool.extend({
            id: 'textbox',
            icon: 'text_field',
            cursor: CURSOR_CROSSHAIR,
            templates: {
                design: kendo.format(TEXTBOX, ''),
                play: kendo.format(TEXTBOX, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(TEXTBOX, 'data-#= ns #bind="value: #: properties.name #.value"') + Tool.fn.showResult()
            },
            height: 100,
            width: 300,
            attributes: {
                style: new adapters.StyleAdapter({ title: 'Style' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: 'Name' }),
                description: new adapters.StringAdapter({ title: 'Description' }),
                solution: new adapters.StringAdapter({ title: 'Solution' }),
                validation: new adapters.ValidationAdapter({
                    title: 'Validation'
                    // The following is now achieved in Tool.init
                    // solutionAdapter: new adapters.StringAdapter({ title: 'Solution' }),
                    // defaultValue: '// ' + adapters.StringAdapter.prototype.libraryDefault
                }),
                success: new adapters.ScoreAdapter({ title: 'Success', defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: 'Failure', defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: 'Omit', defaultValue: 0 })
            },

            /**
             * onEnable event handler
             * @class Textbox
             * @method onEnable
             * @param e
             * @param component
             * @param enabled
             */
            onEnable: function (e, component, enabled) {
                var stageElement = $(e.currentTarget);
                if (stageElement.is(ELEMENT_CLASS) && component instanceof PageComponent) {
                    stageElement.children('input')
                        .prop({
                            disabled: !enabled,
                            readonly: !enabled
                        });
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
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('input');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                    if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
                        content.css('font-size', Math.floor(0.65 * content.height()));
                    }
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }
        });
        tools.register(Textbox);

        var CHECKBOX = '<div><input id="#: properties.name #" type="checkbox" style="#: attributes.checkboxStyle #" {0}><label for="#: properties.name #" style="#: attributes.labelStyle #">#: attributes.text #</label></div>';
        /**
         * Checkbox tool
         * @class CheckBox
         * @type {void|*}
         */
        var CheckBox = Tool.extend({
            id: 'checkbox',
            icon: 'checkbox',
            cursor: CURSOR_CROSSHAIR,
            templates: {
                design: kendo.format(CHECKBOX, ''),
                play: kendo.format(CHECKBOX, 'data-#= ns #bind="checked: #: properties.name #.value"'),
                review: kendo.format(CHECKBOX, 'data-#= ns #bind="checked: #: properties.name #.value"') + Tool.fn.showResult()

            },
            height: 60,
            width: 300,
            attributes: {
                checkboxStyle: new adapters.StyleAdapter({ title: 'Checkbox Style' }),
                labelStyle: new adapters.StyleAdapter({ title: 'Label Style' }),
                text: new adapters.StringAdapter({ title: 'Text', defaultValue: 'text' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: 'Name' }),
                description: new adapters.StringAdapter({ title: 'Description' }),
                solution: new adapters.BooleanAdapter({ title: 'Solution' }),
                validation: new adapters.ValidationAdapter({
                    title: 'Validation'
                    // The following is now achieved in Tool.init
                    // solutionAdapter: new adapters.BooleanAdapter({ title: 'Solution' }),
                    // defaultValue: '// ' + adapters.StringAdapter.prototype.libraryDefault
                }),
                success: new adapters.ScoreAdapter({ title: 'Success', defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: 'Failure', defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: 'Omit', defaultValue: 0 })
            },

            /**
             * onEnable event handler
             * @class CheckBox
             * @method onEnable
             * @param e
             * @param component
             * @param enabled
             */
            onEnable: function (e, component, enabled) {
                var stageElement = $(e.currentTarget);
                if (stageElement.is(ELEMENT_CLASS) && component instanceof PageComponent) {
                    stageElement.children('input')
                        .prop({
                            disabled: !enabled,
                            readonly: !enabled
                        });
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
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div');
                var input = content.children('input');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                    if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
                        content.css('font-size', Math.floor(0.85 * content.height()));
                    }
                }
                var size = parseInt(content.css('font-size'), 10);
                content.children('input')
                    .height(0.6 * size)
                    .width(0.6 * size);
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }
        });
        tools.register(CheckBox);

        var QUIZ = '<div data-#= ns #role="quiz" data-#= ns #mode="#: attributes.mode #" {0} data-#= ns #source="#: JSON.stringify(attributes.data.trim().split(\'\\n\')) #" data-group-style="#: attributes.groupStyle #" data-#= ns #item-style="#: attributes.itemStyle #" data-#= ns #active-style="#: attributes.activeStyle #"></div>';
        /**
         * Quiz tool
         * @class Quiz
         * @type {void|*}
         */
        var Quiz = Tool.extend({
            id: 'quiz',
            icon: 'radio_button_group',
            cursor: CURSOR_CROSSHAIR,
            templates: {
                design: kendo.format(QUIZ, 'data-#= ns #enable="false"'),
                play: kendo.format(QUIZ, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(QUIZ, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 100,
            width: 300,
            attributes: {
                mode: new adapters.EnumAdapter({ title: 'Mode', defaultValue: 'button', enum: ['button', 'dropdown', 'radio'] }),
                groupStyle: new adapters.StyleAdapter({ title: 'Group Style' }),
                itemStyle: new adapters.StyleAdapter({ title: 'Item Style' }),
                activeStyle: new adapters.StyleAdapter({ title: 'Active Style' }),
                data: new adapters.TextAdapter({ title: 'Data', defaultValue: 'True\nFalse' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: 'Name' }),
                description: new adapters.StringAdapter({ title: 'Description' }),
                solution: new adapters.StringAdapter({ title: 'Solution' }),
                validation: new adapters.ValidationAdapter({
                    title: 'Validation'
                    // The following is now achieved in Tool.init
                    // solutionAdapter: new adapters.BooleanAdapter({ title: 'Solution' }),
                    // defaultValue: '// ' + adapters.StringAdapter.prototype.libraryDefault)
                }),
                success: new adapters.ScoreAdapter({ title: 'Success', defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: 'Failure', defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: 'Omit', defaultValue: 0 })
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                /* jshint maxcomplexity: 8 */
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div' + kendo.roleSelector('quiz'));
                var data = component.attributes.data;
                var length = data.trim().split('\n').length || 1;
                var height = $.type(component.height) === NUMBER ? component.height : 0;
                // var width = $.type(component.width) === NUMBER ? component.width : 0;
                // content.outerWidth(width);
                // content.outerHeight(height);
                switch (component.attributes.mode) {
                    case 'button':
                        content.css('font-size', Math.floor(0.57 * height));
                        break;
                    case 'dropdown':
                        content.css('font-size', Math.floor(0.5 * height));
                        break;
                    case 'radio':
                        var h = height / (length || 1);
                        content.css('font-size', Math.floor(0.9 * h));
                        content.find('input')
                            .height(0.6 * h)
                            .width(0.6 * h);
                        break;
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }

            /* jshint +W074 */

        });
        tools.register(Quiz);

        /**
         * Audio tool
         * @class Audio
         */
        var Audio = Tool.extend({
            id: 'audio',
            icon: 'loudspeaker3',
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-role="mediaplayer" data-mode="audio" data-autoplay="#: attributes.autoplay #" data-files="#: JSON.stringify([attributes.mp3, attributes.ogg]) #"></div>'
            },
            height: 100,
            width: 400,
            attributes: {
                autoplay: new adapters.BooleanAdapter({ title: 'Autoplay', defaultValue: false }),
                mp3: new adapters.AssetAdapter({ title: 'MP3 File' }),
                ogg: new adapters.AssetAdapter({ title: 'OGG File' })
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div' + kendo.roleSelector('mediaplayer'));
                var widget = content.data('kendoMediaPlayer');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                }
                widget.resize();
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }
        });
        tools.register(Audio);

        /**
         * Video tool
         * @class Video
         */
        var Video = Tool.extend({
            id: 'video',
            icon: 'movie',
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-role="mediaplayer" data-mode="video" data-autoplay="#: attributes.autoplay #" data-files="#: JSON.stringify([attributes.mp4, attributes.ogv, attributes.webm]) #" data-toolbar-height="#: attributes.toolbarHeight #"></div>'
            },
            height: 300,
            width: 600,
            attributes: {
                autoplay: new adapters.BooleanAdapter({ title: 'Autoplay', defaultValue: false }),
                toolbarHeight: new adapters.NumberAdapter({ title: 'Toolbar Height', defaultValue: 48 }),
                mp4: new adapters.AssetAdapter({ title: 'MP4 File' }),
                ogv: new adapters.AssetAdapter({ title: 'OGV File' }),
                wbem: new adapters.AssetAdapter({ title: 'WBEM File' })
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div' + kendo.roleSelector('mediaplayer'));
                var widget = content.data('kendoMediaPlayer');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                }
                widget.resize();
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }
        });
        tools.register(Video);

        /**
         * We could also consider
         * HTML
         * Drawing surface
         * Shape
         * Checkbox
         * Drop Target
         * Connector
         * Clock
         * Text-to-Speech
         * MathJax
         * Grid
         */

        /*****************************************************************************
         * TODO: Behaviours
         ******************************************************************************/

    }(window.jQuery));

    /* jshint +W071 */

    return window.kidoju;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
