﻿/**
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
        var ARRAY = 'array';
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
        var DIALOG_DIV = '<div class="k-popup-edit-form {0}"></div>';
        var DIALOG_CLASS = '.kj-dialog';
        var CLICK = 'click';
        var RX_HTTP_S = /^https?:\/\//;
        var RX_FONT_SIZE = /font(-size)?:[^;]*[0-9]+px/;
        var FORMULA = 'function validate(value, solution, all) {\n\t{0}\n}';
        var JS_COMMENT = '// ';
        var CUSTOM = {
            name: 'custom',
            formula: kendo.format(FORMULA, '// Your code should return true when value is validated against solution.')
        };

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * Incors images for corrections
         */
        // Incors O-Collection check.svg
        // var SVG_SUCCESS = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#76A797" d="M3840 5760l3934 -3934c124,-124 328,-124 452,0l1148 1148c124,124 124,328 0,452l-5308 5308c-124,124 -328,124 -452,0l-2748 -2748c-124,-124 -124,-328 0,-452l1148 -1148c124,-124 328,-124 452,0l1374 1374z"/></svg>';
        var SVG_SUCCESS = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iIzc2QTc5NyIgZD0iTTM4NDAgNTc2MGwzOTM0IC0zOTM0YzEyNCwtMTI0IDMyOCwtMTI0IDQ1MiwwbDExNDggMTE0OGMxMjQsMTI0IDEyNCwzMjggMCw0NTJsLTUzMDggNTMwOGMtMTI0LDEyNCAtMzI4LDEyNCAtNDUyLDBsLTI3NDggLTI3NDhjLTEyNCwtMTI0IC0xMjQsLTMyOCAwLC00NTJsMTE0OCAtMTE0OGMxMjQsLTEyNCAzMjgsLTEyNCA0NTIsMGwxMzc0IDEzNzR6Ii8+PC9zdmc+';
        // Incors O-Collection delete.svg
        // var SVG_FAILURE = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#E68497" d="M1273 7156l2037 -2036 -2037 -2036c-124,-125 -124,-328 0,-453l1358 -1358c125,-124 328,-124 453,0l2036 2037 2036 -2037c125,-124 328,-124 453,0l1358 1358c124,125 124,328 0,453l-2037 2036 2037 2036c124,125 124,328 0,453l-1358 1358c-125,124 -328,124 -453,0l-2036 -2037 -2036 2037c-125,124 -328,124 -453,0l-1358 -1358c-124,-125 -124,-328 0,-453z"/></svg>';
        var SVG_FAILURE = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iI0U2ODQ5NyIgZD0iTTEyNzMgNzE1NmwyMDM3IC0yMDM2IC0yMDM3IC0yMDM2Yy0xMjQsLTEyNSAtMTI0LC0zMjggMCwtNDUzbDEzNTggLTEzNThjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMjAzNiAyMDM3IDIwMzYgLTIwMzdjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMTM1OCAxMzU4YzEyNCwxMjUgMTI0LDMyOCAwLDQ1M2wtMjAzNyAyMDM2IDIwMzcgMjAzNmMxMjQsMTI1IDEyNCwzMjggMCw0NTNsLTEzNTggMTM1OGMtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTIwMzYgLTIwMzcgLTIwMzYgMjAzN2MtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTEzNTggLTEzNThjLTEyNCwtMTI1IC0xMjQsLTMyOCAwLC00NTN6Ii8+PC9zdmc+';

        /**
         * All i18n messages
         */
        var i18n = {

            tool: {
                top: { title: 'Top' },
                left: { title: 'Left' },
                height: { title: 'Height' },
                width: { title: 'Width' },
                rotate: { title: 'Rotate' }
            },

            dialogs: {
                ok: { text: 'OK' },
                cancel: { text: 'Cancel' }
            },

            audio: {
                attributes: {
                    autoplay: { title: 'Autoplay' },
                    mp3: { title: 'MP3 File' },
                    ogg: { title: 'OGG File' }
                }
            },

            checkbox: {
                attributes: {
                    // checkboxStyle: { title: 'Checkbox Style' },
                    containerStyle: { title: 'Style' },
                    // labelStyle: { title: 'Label Style' },
                    text: { title: 'Text' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Description' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            image: {
                attributes: {
                    src: { title: 'Source' },
                    alt: { title: 'Text' }
                }
                // properties: {}
            },

            label: {
                attributes: {
                    style: { title: 'Style' },
                    text: { title: 'Text' }
                }
                // properties: {}
            },

            quiz: {
                attributes: {
                    activeStyle: { title: 'Active Style' },
                    data: { title: 'Values' },
                    groupStyle: { title: 'Group Style' },
                    itemStyle: { title: 'Item Style' },
                    mode: { title: 'Mode' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Description' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            textbox: {
                attributes: {
                    style: { title: 'Style' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Description' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            video: {
                attributes: {
                    autoplay: { title: 'Autoplay' },
                    toolbarHeight: { title: 'Toolbar Height' },
                    mp4: { title: 'MP4 File' },
                    ogv: { title: 'OGV File' },
                    wbem: { title: 'WBEM File' }
                }
            }

        };

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
         * Assets
         *********************************************************************************/

        var ToolAssets = kidoju.ToolAssets = kendo.Class.extend({
            init: function (options) {
                options = options || {};
                var collections = options.collections || [];
                var extensions = options.extensions || [];
                var schemes = options.schemes || {};
                var transport = options.transport || {};
                assert.type(ARRAY, collections, kendo.format(assert.messages.type.default, 'options.collections', ARRAY));
                assert.type(ARRAY, extensions, kendo.format(assert.messages.type.default, 'options.extensions', ARRAY));
                assert.type(OBJECT, schemes, kendo.format(assert.messages.type.default, 'options.schemes', OBJECT));
                assert.type(OBJECT, transport, kendo.format(assert.messages.type.default, 'options.transport', OBJECT));
                this.collections = collections;
                this.extensions = extensions;
                this.schemes = schemes;
                this.transport = transport;
            }
        });

        var assets = kidoju.assets = {
            // Assets for the audio tool
            audio : new ToolAssets(),
            // Assets for the image tool
            image: new ToolAssets(),
            // Assets for the video tool
            video: new ToolAssets()
        };

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
                assert.type(OBJECT, Class.prototype, kendo.format(assert.messages.type.default, 'Class.prototype', OBJECT));
                var obj = new Class();
                assert.instanceof(Tool, obj, kendo.format(assert.messages.instanceof.default, 'obj', 'kidoju.Tool'));
                assert.type(STRING, obj.id, kendo.format(assert.messages.type.default, 'obj.id', STRING));
                obj.id = obj.id.trim();
                assert.ok(obj.id.length > 0, 'A tool cannot have an empty id');
                assert.ok(obj.id !== ACTIVE && obj.id !== REGISTER, 'A tool cannot have `active` or `register` for id');
                assert.isUndefined(this[obj.id], 'Existing tools cannot be replaced');
                this[obj.id] = obj;
                if (obj.id === POINTER) {
                    this.active = POINTER;
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
            i18n: {
                // They are here to be translated in kidoju.messages.[locale].js
                tool: {
                    top: { title: i18n.tool.top.title },
                    left: { title: i18n.tool.left.title },
                    height: { title: i18n.tool.height.title },
                    width: { title: i18n.tool.width.title },
                    rotate: { title: i18n.tool.rotate.title }
                },
                dialogs: {
                    ok: { text: i18n.dialogs.ok.text }, // TODO : icon?
                    cancel: { text: i18n.dialogs.cancel.text }
                }
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
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.top.title }).getRow('top'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.left.title }).getRow('left'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.height.title }).getRow('height'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.width.title }).getRow('width'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.rotate.title }).getRow('rotate'));

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
         * Used to display values in a property grid
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
                this.attributes[kendo.attr('source')] = JSON.stringify(options && options.enum ? options.enum : []); // kendo.htmlEncode??
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
                    '<div class="k-edit-buttons k-state-default">' +
                    '<a class="k-primary k-button" data-command="ok" href="#">' + Tool.fn.i18n.dialogs.ok.text + '</a>' +
                    '<a class="k-button" data-command="cancel" href="#">' + Tool.fn.i18n.dialogs.cancel.text + '</a>' +
                    '</div></div>';
                dialog.content(content);
                kendo.bind(dialog.element, dialog.viewModel);
                dialog.element.addClass('no-padding');
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
                        dialog.element.removeClass('no-padding');
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
                // that.editor is the inline editor with a [...] button which triggers this.showDialog
                that.editor = function (container, settings) {
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
                        .addClass('k-textbox')
                        .css({ width: '100%' })
                        .attr($.extend({}, settings.attributes, { 'data-bind': 'value: ' + settings.field }))
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
                        .on(CLICK, $.proxy(that.showDialog, that, settings));
                };
            },
            showDialog: function (settings) {
                var that = this;
                var dialog = that.getDialog();
                // Create viewModel (Cancel shall not save changes to main model)
                dialog.viewModel = kendo.observable({
                    url: settings.model.get(settings.field)
                });
                // Prepare UI
                dialog.title(settings.title);
                var content = '<div class="k-edit-form-container">' +
                    '<div data-role="assetmanager" data-bind="value: url"></div>' +
                    '<div class="k-edit-buttons k-state-default">' +
                    '<a class="k-primary k-button" data-command="ok" href="#">' + Tool.fn.i18n.dialogs.ok.text + '</a>' +
                    '<a class="k-button" data-command="cancel" href="#">' + Tool.fn.i18n.dialogs.cancel.text + '</a>' +
                    '</div></div>';
                dialog.content(content);
                assert.instanceof(PageComponent, settings.model, kendo.format(assert.messages.instanceof.default, 'settings.model', 'kidoju.data.PageComponent'));
                assert.instanceof(ToolAssets, assets[settings.model.tool], kendo.format(assert.messages.instanceof.default, 'assets[settings.model.tool]', 'kidoju.ToolAssets'));
                dialog.element.find(kendo.roleSelector('assetmanager')).kendoAssetManager(assets[settings.model.tool]);
                kendo.bind(dialog.element, dialog.viewModel);
                dialog.element.addClass('no-padding');
                // Bind click handler for edit buttons
                dialog.element.on(CLICK, '.k-edit-buttons>.k-button', $.proxy(that.closeDialog, that, settings, dialog));
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
                        dialog.element.removeClass('no-padding');
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
        adapters.NameAdapter = adapters.StringAdapter.extend({
            init: function (options) {
                adapters.StringAdapter.fn.init.call(this, options);
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, { type: 'text', readonly: true, style: 'width: 100%;' });
            }
        });

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
                    '<div class="k-edit-buttons k-state-default">' +
                    '<a class="k-primary k-button" data-command="ok" href="#">' + Tool.fn.i18n.dialogs.ok.text + '</a>' +
                    '<a class="k-button" data-command="cancel" href="#">' + Tool.fn.i18n.dialogs.cancel.text + '</a>' +
                    '</div></div>';
                dialog.content(content);
                kendo.bind(dialog.element, dialog.viewModel);
                dialog.element.addClass('no-padding');
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
                        dialog.element.removeClass('no-padding');
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
         * Audio tool
         * @class Audio
         */
        var Audio = Tool.extend({
            id: 'audio',
            icon: 'loudspeaker3',
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-role="mediaplayer" data-mode="audio" data-autoplay="#: attributes.autoplay #" data-files="#: attributes.files$() #"></div>'
            },
            height: 100,
            width: 400,
            attributes: {
                autoplay: new adapters.BooleanAdapter({ title: i18n.audio.attributes.autoplay.title, defaultValue: false }),
                mp3: new adapters.AssetAdapter({ title: i18n.audio.attributes.mp3.title }),
                ogg: new adapters.AssetAdapter({ title: i18n.audio.attributes.ogg.title })
            },

            /**
             * Get Html or jQuery content
             * @method getHtmlContent
             * @param component
             * @param mode
             * @returns {*}
             */
            getHtmlContent: function (component, mode) {
                var that = this;
                assert.instanceof(Audio, that, kendo.format(assert.messages.instanceof.default, 'this', 'Image'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.audio, kendo.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
                var template = kendo.template(that.templates.default);
                // The files$ function resolves urls with schemes like cdn://audio.mp3 and returns a stringified array
                component.attributes.files$ = function () {
                    var mp3 = component.attributes.get('mp3');
                    var ogg = component.attributes.get('ogg');
                    var schemes = assets.video.schemes;
                    for (var scheme in schemes) {
                        if (schemes.hasOwnProperty(scheme)) {
                            var schemeRx = new RegExp('^' + scheme + '://');
                            if (schemeRx.test(mp3)) {
                                mp3 = mp3.replace(scheme + '://', schemes[scheme]);
                            }
                            if (schemeRx.test(ogg)) {
                                ogg = ogg.replace(scheme + '://', schemes[scheme]);
                            }
                        }
                    }
                    var files = [];
                    if (RX_HTTP_S.test(mp3)) {
                        files.push(mp3);
                    }
                    if (RX_HTTP_S.test(ogg)) {
                        files.push(ogg);
                    }
                    return JSON.stringify(files);
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

        // var CHECKBOX = '<div style="#: attributes.containerStyle #"><input id="#: properties.name #" type="checkbox" style="#: attributes.checkboxStyle #" {0}>&nbsp;<label for="#: properties.name #" style="#: attributes.labelStyle #">#: attributes.text #</label></div>';
        var CHECKBOX = '<div style="#: attributes.containerStyle #"><input id="#: properties.name #" type="checkbox" {0}>&nbsp;<label for="#: properties.name #">#: attributes.text #</label></div>';
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
            height: 70,
            width: 300,
            attributes: {
                // checkboxStyle: new adapters.StyleAdapter({ title: i18n.checkbox.attributes.checkboxStyle.title }),
                containerStyle: new adapters.StyleAdapter({ title: i18n.checkbox.attributes.containerStyle.title, defaultValue: 'font-size: 60px;' }),
                // labelStyle: new adapters.StyleAdapter({ title: i18n.checkbox.attributes.labelStyle.title }),
                text: new adapters.StringAdapter({ title: i18n.checkbox.attributes.text.title, defaultValue: 'text' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.checkbox.properties.name.title }),
                description: new adapters.StringAdapter({ title: i18n.checkbox.properties.description.title }),
                solution: new adapters.BooleanAdapter({ title: i18n.checkbox.properties.solution.title }),
                validation: new adapters.ValidationAdapter({
                    title: i18n.checkbox.properties.validation.title
                    // The following is now achieved in Tool.init
                    // solutionAdapter: new adapters.BooleanAdapter({ title: 'Solution' }),
                    // defaultValue: '// ' + adapters.StringAdapter.prototype.libraryDefault
                }),
                success: new adapters.ScoreAdapter({ title: i18n.checkbox.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.checkbox.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.checkbox.properties.omit.title, defaultValue: 0 })
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
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                    // if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
                    //     content.css('font-size', Math.floor(0.85 * content.height()));
                    // }
                }
                var size = 0.6 * parseInt(content.css('font-size'), 10);
                content.children('input[type="checkbox"]')
                    .height(size)
                    .width(size);
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }
        });
        tools.register(CheckBox);

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
                // TODO add style (border, shadow, ...)
            },

            /**
             * Get Html or jQuery content
             * @method getHtmlContent
             * @param component
             * @param mode
             * @returns {*}
             */
            getHtmlContent: function (component, mode) {
                var that = this;
                assert.instanceof(Image, that, kendo.format(assert.messages.instanceof.default, 'this', 'Image'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.image, kendo.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
                var template = kendo.template(that.templates.default);
                // The src$ function resolves urls with schemes like cdn://sample.jpg
                component.attributes.src$ = function () {
                    var src = component.attributes.get('src');
                    var schemes = assets.image.schemes;
                    for (var scheme in schemes) {
                        if (schemes.hasOwnProperty(scheme) && (new RegExp('^' + scheme + '://')).test(src)) {
                            src = src.replace(scheme + '://', schemes[scheme]);
                            break;
                        }
                    }
                    return src;
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
                text: new adapters.StringAdapter({ title: i18n.label.attributes.text.title, defaultValue: 'Label' }),
                style: new adapters.StyleAdapter({ title: i18n.label.attributes.style.title, defaultValue: 'font-size: 80px;' })
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
                    // if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
                    /*
                     * We make a best guess for the number of lines as follows
                     * Let's suppose the height (line-height, not font-size) and width of a character are respectively y and x
                     * We have y = x * sizeRatio
                     * How many of these character rectangles (x, y) can we fit in the content div (width, height)?
                     *
                     * the label only takes 1 line, if we have:
                     * y = height and length <= width/x, that is length <= width*sizeRatio/y or y = height <= length*sizeRatio/width, which is length >= width*sizeRatio/height
                     *
                     * the label takes 2 lines, if we have:
                     * y = height/2 and length <= width/x, that is length <= 2*width*sizeRatio/y or y = height/2 <= length*sizeRatio/width, which is length >= 4*width*sizeRatio/height
                     *
                     * the label takes n lines if we have sqrt((length*height)/sizeRatio*width) <= lines < sqrt(((length + 1)*height)/sizeRatio*width)
                     *
                     */
                    // var length = component.attributes.text.length;
                    // var sizeRatio = 1.6; // font-size being the height, this is the line-height/char-width ratio
                    // var lines = Math.max(1, Math.floor(Math.sqrt((length * component.height) / (width * sizeRatio))));
                    // We can now make a best guess for the font size
                    // var fontRatio = 1.2; // this is the line-height/font-size ration
                    // content.css('font-size', Math.floor(component.height / lines / fontRatio));
                    // Note: in previous versions, we have tried to iterate through a hidden clone
                    // to find that font size that does not trigger an overflow but it is too slow
                    // }
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }

        });
        tools.register(Label);

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
            height: 200,
            width: 350,
            attributes: {
                mode: new adapters.EnumAdapter({ title: i18n.quiz.attributes.mode.title, defaultValue: 'button', enum: ['button', 'dropdown', 'radio'] }),
                groupStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.groupStyle.title, defaultValue: 'font-size: 60px;' }),
                itemStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.itemStyle.title }),
                activeStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.activeStyle.title }),
                data: new adapters.TextAdapter({ title: i18n.quiz.attributes.data.title, defaultValue: 'True\nFalse' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.quiz.properties.name.title }),
                description: new adapters.StringAdapter({ title: i18n.quiz.properties.description.title }),
                solution: new adapters.StringAdapter({ title: i18n.quiz.properties.solution.title }),
                validation: new adapters.ValidationAdapter({
                    title: i18n.quiz.properties.validation.title
                    // The following is now achieved in Tool.init
                    // solutionAdapter: new adapters.BooleanAdapter({ title: 'Solution' }),
                    // defaultValue: '// ' + adapters.StringAdapter.prototype.libraryDefault)
                }),
                success: new adapters.ScoreAdapter({ title: i18n.quiz.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.quiz.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.quiz.properties.omit.title, defaultValue: 0 })
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
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                }
                /*
                var data = component.attributes.data;
                var length = data.trim().split('\n').length || 1;
                switch (component.attributes.mode) {
                    case 'button':
                        content.css('font-size', Math.floor(0.57 * component.height));
                        break;
                    case 'dropdown':
                        content.css('font-size', Math.floor(0.5 * component.height));
                        break;
                    case 'radio':
                        var h = component.height / (length || 1);
                        content.css('font-size', Math.floor(0.9 * h));
                        content.find('input')
                            .height(0.6 * h)
                            .width(0.6 * h);
                        break;
                }
                */
                var size = 0.6 * parseInt(content.css('font-size'), 10);
                content.find('input["type=radio"]')
                    .height(size)
                    .width(size);
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }

            /* jshint +W074 */

        });
        tools.register(Quiz);

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
                style: new adapters.StyleAdapter({ title: i18n.textbox.attributes.style.title })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.textbox.properties.name.title }),
                description: new adapters.StringAdapter({ title: i18n.textbox.properties.description.title }),
                solution: new adapters.StringAdapter({ title: i18n.textbox.properties.solution.title }),
                validation: new adapters.ValidationAdapter({
                    title: i18n.textbox.properties.validation.title
                    // The following is now achieved in Tool.init
                    // solutionAdapter: new adapters.StringAdapter({ title: 'Solution' }),
                    // defaultValue: '// ' + adapters.StringAdapter.prototype.libraryDefault
                }),
                success: new adapters.ScoreAdapter({ title: i18n.textbox.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.textbox.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.textbox.properties.omit.title, defaultValue: 0 })
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
                            // disabled: !enabled, // disabled elements do not receive mousedown events in Edge and cannot be selected in design mode
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

        /**
         * Video tool
         * @class Video
         */
        var Video = Tool.extend({
            id: 'video',
            icon: 'movie',
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-role="mediaplayer" data-mode="video" data-autoplay="#: attributes.autoplay #" data-files="#: attributes.files$() #" data-toolbar-height="#: attributes.toolbarHeight #"></div>'
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
             * Get Html or jQuery content
             * @method getHtmlContent
             * @param component
             * @param mode
             * @returns {*}
             */
            getHtmlContent: function (component, mode) {
                var that = this;
                assert.instanceof(Video, that, kendo.format(assert.messages.instanceof.default, 'this', 'Image'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.video, kendo.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
                var template = kendo.template(this.templates.default);
                // The files$ function resolves urls with schemes like cdn://video.mp4 and returns a stringified array
                component.attributes.files$ = function () {
                    var mp4 = component.attributes.get('mp4');
                    var ogv = component.attributes.get('ogv');
                    var wbem = component.attributes.get('wbem');
                    var schemes = assets.video.schemes;
                    for (var scheme in schemes) {
                        if (schemes.hasOwnProperty(scheme)) {
                            var schemeRx = new RegExp('^' + scheme + '://');
                            if (schemeRx.test(mp4)) {
                                mp4 = mp4.replace(scheme + '://', schemes[scheme]);
                            }
                            if (schemeRx.test(ogv)) {
                                ogv = ogv.replace(scheme + '://', schemes[scheme]);
                            }
                            if (schemeRx.test(wbem)) {
                                wbem = wbem.replace(scheme + '://', schemes[scheme]);
                            }
                        }
                    }
                    var files = [];
                    if (RX_HTTP_S.test(mp4)) {
                        files.push(mp4);
                    }
                    if (RX_HTTP_S.test(ogv)) {
                        files.push(ogv);
                    }
                    if (RX_HTTP_S.test(wbem)) {
                        files.push(wbem);
                    }
                    return JSON.stringify(files);
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
