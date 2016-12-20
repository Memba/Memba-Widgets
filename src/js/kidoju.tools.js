/**
 * Copyright (c) 2013-2016 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        // './vendor/kendo/kendo.binder',
        // './vendor/kendo/kendo.dialog',
        // './vendor/kendo/kendo.spreadsheet',
        './window.assert',
        './window.logger',
        './kidoju.data'
        // Note: The player does not need the assetmanager, the codeeditor and the styleeditor
        // './kidoju.widgets.assetmanager',
        // './kidoju.widgets.chargrid',
        // './kidoju.widgets.codeeditor',
        // './kidoju.widgets.codeinput',
        // './kidoju.widgets.connector',
        // './kidoju.widgets.dropzone',
        // './kidoju.widgets.mathexpression',
        // './kidoju.widgets.mediaplayer',
        // './kidoju.widgets.propertygrid',
        // './kidoju.widgets.quiz',
        // './kidoju.widgets.stage', !IMPORTANT: Stage needs to be loaded after tools
        // './kidoju.widgets.styleeditor'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var kidoju = window.kidoju = window.kidoju || {};
        var Model = kidoju.data.Model;
        var ObservableArray = kendo.data.ObservableArray;
        var PageComponent = kidoju.data.PageComponent;
        var Page = kidoju.data.Page;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.tools');
        var OBJECT = 'object';
        var ARRAY = 'array';
        var STRING = 'string';
        var NUMBER = 'number';
        var BOOLEAN = 'boolean';
        var DATE = 'date';
        var ERROR = 'error';
        var WARNING = 'warning';
        var CURSOR_DEFAULT = 'default';
        var CURSOR_CROSSHAIR = 'crosshair';
        var REGISTER = 'register';
        var ACTIVE = 'active';
        var POINTER = 'pointer';
        var ELEMENT_CLASS = '.kj-element';
        var DIALOG_DIV = '<div {0}"></div>';
        var DIALOG_SELECTOR = '.kj-dialog';
        var NO_PADDING_CLASS = 'no-padding';
        var CLICK = 'click';
        var RX_HTTP_S = /^https?:\/\//;
        var RX_FONT_SIZE = /font(-size)?:[^;]*[0-9]+px/;
        var RX_AUDIO = /^(cdn|data):\/\/[\s\S]+.mp3$/i;
        var RX_COLOR = /^#[0-9a-f]{6}$/i;
        var RX_DATA = /\S+/i;
        var RX_DESCRIPTION = /\S+/i; // question
        var RX_DROPVALUE = /\S+/i;
        var RX_FORMULA = /\S+/i;
        var RX_IMAGE = /^(cdn|data):\/\/[\s\S]+.(gif|jpe?g|png|svg)$/i;
        var RX_STYLE = /^(([\w-]+)\s*:([^;<>]+);\s*)+$/i;
        var RX_SOLUTION = /\S+/i;
        var RX_TEXT = /\S+/i;
        var RX_VALIDATION = /\S+/i;
        var RX_VIDEO = /^(cdn|data):\/\/[\s\S]+.mp4$/i;
        var FORMULA = 'function validate(value, solution, all) {\n\t{0}\n}';
        var JS_COMMENT = '// ';
        var CUSTOM = {
            name: 'custom',
            formula: kendo.format(FORMULA, '// Your code should return true when value is validated against solution.')
        };
        var util = {};

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
                ok: { text: '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg" class="k-image">OK' },
                cancel: { text: '<img alt="icon" src="https://cdn.kidoju.com/images/o_collection/svg/office/close.svg" class="k-image">Cancel' }
            },

            messages: {
                invalidAltText: 'A(n) {0} on page {1} requires some alternate text in display attributes.',
                invalidAudioFile: 'A(n) {0} on page {1} requires an mp3 file in display attributes.',
                invalidColor: 'A(n) {0} on page {1} has an invalid color in display attributes.',
                invalidData: 'A(n) {0} on page {1} requires values in display attributes.',
                invalidDescription: 'A(n) {0} named `{1}` on page {2} requires a question in test logic.',
                invalidDropValue: 'A(n) {0} on page {1} requires a drop value in test logic.',
                invalidFailure: 'A(n) {0} named `{1}` on page {2} has a failure score higher than the omit score or zero in test logic.',
                invalidFormula: 'A(n) {0} on page {1} requires a formula in display attributes.',
                invalidImageFile: 'A(n) {0} on page {1} requires an image file in display attributes.',
                invalidSolution: 'A(n) {0} named `{1}` on page {2} requires a solution in test logic.',
                invalidStyle: 'A(n) {0} on page {1} has an invalid style in display attributes.',
                invalidSuccess: 'A(n) {0} named `{1}` on page {2} has a success score lower than the omit score or zero in test logic.',
                invalidText: 'A(n) {0} on page {1} requires some text in display attributes.',
                invalidValidation: 'A(n) {0} named `{1}` on page {2} requires a validation formula in test logic.',
                invalidVideoFile: 'A(n) {0} on page {1} requires an mp4 file in display attributes.'
            },

            pointer: {
                description: 'Pointer'
            },

            audio: {
                description: 'Audio Player',
                attributes: {
                    autoplay: { title: 'Autoplay' },
                    mp3: { title: 'MP3 File' },
                    ogg: { title: 'OGG File' }
                }
            },

            chart: {
                description: 'Chart',
                attributes: {
                    type: { title: 'Type' },
                    title: { title: 'Title' },
                    categories: { title: 'Categories' },
                    values: { title: 'Values' },
                    legend: { title: 'Legend' },
                    data: { title: 'Data' },
                    style: { title: 'Style' }
                }
            },

            chargrid: {
                description: 'Character Grid',
                attributes: {
                    blank: { title: 'Blank' },
                    columns: { title: 'Columns' },
                    layout: { title: 'Layout' },
                    rows: { title: 'Rows' },
                    whitelist: { title: 'Whitelist' },
                    gridFill: { title: 'Grid Fill' },
                    gridStroke: { title: 'Grid Stroke' },
                    // blankFill = gridStroke
                    selectedFill: { title: 'Selection Fill' },
                    lockedFill: { title: 'Locked Fill' },
                    // lockedColor = valueColor = fontColor
                    fontColor: { title: 'Font Color' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            chargridadapter: {
                messages: {
                    layout: '<h3>Design the grid layout</h3><p>Any character you enter in the grid is locked and cannot be changed in play mode.</p><p>Use `{0}` to blank out cells.</p>',
                    solution: '<h3>Enter the solution</h3><p>Use any whitelisted character, i.e. `{0}`.</p>'
                }
            },

            checkbox: {
                description: 'CheckBox',
                attributes: {
                    data: { title: 'Values', defaultValue: 'Option 1\nOption 2' },
                    groupStyle: { title: 'Group Style' },
                    itemStyle: { title: 'Item Style' },
                    selectedStyle: { title: 'Select. Style' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            connector: {
                description: 'Connector',
                attributes: {
                    color: { title: 'Color' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            dropzone: {
                description: 'Drop Zone',
                attributes: {
                    center: { title: 'Centre', defaultValue: false },
                    style: { title: 'Style' },
                    text: { title: 'Text', defaultValue: 'Please drop here.' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            image: {
                description: 'Image',
                attributes: {
                    alt: { title: 'Text', defaultValue: 'Image' },
                    src: { title: 'Source', defaultValue: 'cdn://images/o_collection/svg/office/painting_landscape.svg' },
                    style: { title: 'Style' }
                },
                properties: {
                    draggable: { title: 'Draggable' },
                    dropValue: { title: 'Value' }
                }
            },

            label: {
                description: 'Label',
                attributes: {
                    style: { title: 'Style' },
                    text: { title: 'Text', defaultValue: 'Label' }
                },
                properties: {
                    draggable: { title: 'Draggable' },
                    dropValue: { title: 'Value' }
                }
            },

            mathexpression: {
                description: 'Mathematic Expression',
                attributes: {
                    formula: { title: 'Formula', defaultValue: '\\sum_{n=1}^{\\infty}2^{-n}=1' },
                    inline: { title: 'Inline', defaultValue: false },
                    style: { title: 'Style' }
                },
                properties: {
                    draggable: { title: 'Draggable' },
                    dropValue: { title: 'Value' }
                }
            },

            quiz: {
                description: 'Quiz',
                attributes: {
                    data: { title: 'Values', defaultValue: 'True\nFalse' },
                    groupStyle: { title: 'Group Style' },
                    itemStyle: { title: 'Item Style' },
                    mode: { title: 'Mode' },
                    selectedStyle: { title: 'Select. Style' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            table: {
                description: 'Static Table',
                attributes: {
                    columns: { title: 'Columns' },
                    rows: { title: 'Rows' },
                    data: { title: 'Data' }
                }
            },

            textarea: {
                description: 'TextArea',
                attributes: {
                    style: { title: 'Style' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            textbox: {
                description: 'TextBox',
                attributes: {
                    mask: { title: 'Mask' },
                    style: { title: 'Style' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            video: {
                description: 'Video Player',
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
            description: null,
            cursor: null,
            weight: 0,
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
                    ok: { text: i18n.dialogs.ok.text },
                    cancel: { text: i18n.dialogs.cancel.text }
                },
                messages: {
                    invalidAltText: i18n.messages.invalidAltText,
                    invalidAudioFile: i18n.messages.invalidAudioFile,
                    invalidColor: i18n.messages.invalidColor,
                    invalidData: i18n.messages.invalidData,
                    invalidDescription: i18n.messages.invalidDescription,
                    invalidDropValue: i18n.messages.invalidDropValue,
                    invalidFailure: i18n.messages.invalidFailure,
                    invalidFormula: i18n.messages.invalidFormula,
                    invalidImageFile: i18n.messages.invalidImageFile,
                    invalidSolution: i18n.messages.invalidSolution,
                    invalidStyle: i18n.messages.invalidStyle,
                    invalidSuccess: i18n.messages.invalidSuccess,
                    invalidText: i18n.messages.invalidText,
                    invalidValidation: i18n.messages.invalidValidation,
                    invalidVideoFile: i18n.messages.invalidVideoFile
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
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.top.title }, { 'data-decimals': 0, 'data-format': 'n0' }).getRow('top'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.left.title }, { 'data-decimals': 0, 'data-format': 'n0' }).getRow('left'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.height.title }, { 'data-decimals': 0, 'data-format': 'n0' }).getRow('height'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.width.title }, { 'data-decimals': 0, 'data-format': 'n0' }).getRow('width'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.rotate.title }, { 'data-decimals': 0, 'data-format': 'n0' }).getRow('rotate'));

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
             * Return the default value when playing the component as part of a test
             * @param component
             */
            getTestDefaultValue: function (component) {
                // TODO: consider removing as it seems useless
                return;
            },

            /**
             * Add the display of a success or failure icon to the corresponding stage element
             * @returns {string}
             */
            showResult: function () {
                // Contrary to https://css-tricks.com/probably-dont-base64-svg/, we need base64 encoded strings otherwise kendo templates fail
                return '<div class=".kj-element-result">' +
                    '<div data-#= ns #bind="visible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + Tool.fn.svg.success + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>' +
                    '<div data-#= ns #bind="invisible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + Tool.fn.svg.failure + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>' +
                    '</div>';
            },

            /**
             * Improved display of value in score grid
             * Note: search for getScoreArray in kidoju.data
             * @param value
             */
            value$: function (value) {
                return kendo.htmlEncode(value || '');
            },

            /**
             * Improved display of solution in score grid
             * Note: search for getScoreArray in kidoju.data
             * @param solution
             */
            solution$: function (solution) {
                return kendo.htmlEncode(solution || '');
            },

            // onEnable: function (e, component, enabled) {},
            // onMove: function (e, component) {},
            // onResize: function (e, component) {},
            // onRotate: function (e, component) {},

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                /* jshint maxcomplexity: 8 */
                assert.instanceof (PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.type(NUMBER, pageIdx, kendo.format(assert.messages.type.default, 'pageIdx', NUMBER));
                var ret = [];
                if (component.properties) {
                    var properties = component.properties;
                    var description = this.description; // tool description
                    var messages = this.i18n.messages;
                    var name = properties.name;
                    // TODO: test name? note that all components do not necessarily have a name
                    if (properties.draggable === true && !RX_DROPVALUE.test(properties.dropValue)) {
                        ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidDropValue, description, /*name,*/ pageIdx + 1) });
                    }
                    if ($.type(properties.description) === STRING && !RX_DESCRIPTION.test(properties.description)) {
                        ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidDescription, description, name, pageIdx + 1) });
                    }
                    if ($.type(properties.solution) === STRING && !RX_SOLUTION.test(properties.solution)) {
                        // TODO: what if solution is not a string but a number or something else ?
                        ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidSolution, description, name, pageIdx + 1) });
                    }
                    if ($.type(properties.validation) === STRING && !RX_VALIDATION.test(properties.validation)) {
                        // TODO: There is room for better validation of the validation formula
                        ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidValidation, description, name, pageIdx + 1) });
                    }
                    if ($.type(properties.failure) === NUMBER && $.type(properties.omit) === NUMBER && properties.failure > Math.min(properties.omit, 0)) {
                        ret.push({ type: WARNING, index: pageIdx, message: kendo.format(messages.invalidFailure, description, name, pageIdx + 1) });
                    }
                    if ($.type(properties.success) === NUMBER && $.type(properties.omit) === NUMBER && properties.success < Math.max(properties.omit, 0)) {
                        ret.push({ type: WARNING, index: pageIdx, message: kendo.format(messages.invalidSuccess, description, name, pageIdx + 1) });
                    }
                }
                return ret;
            }

            /* jshint +W074 */

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
            getDialog: function (options) {
                var that = this;
                var dialogWidget = $(DIALOG_SELECTOR).data('kendoDialog');
                assert.ok(kendo.ui.Dialog, '`kendo.dialog.js` is expected to be loaded');
                // Find or create dialog frame
                if (!(dialogWidget instanceof kendo.ui.Dialog)) {
                    // Create dialog
                    dialogWidget = $(kendo.format(DIALOG_DIV, DIALOG_SELECTOR.substr(1)))
                        .appendTo(document.body)
                        .kendoDialog({
                            actions: [
                                { text: Tool.fn.i18n.dialogs.ok.text, primary: true, action: $.proxy(that.onOkAction, that, options) },
                                { text: Tool.fn.i18n.dialogs.cancel.text }
                            ],
                            buttonLayout: 'normal',
                            modal: true,
                            visible: false,
                            width: 860,
                            close: function (e) {
                                // This is a reusable dialog, so we need to make sure it is ready for the next content
                                dialogWidget.element.removeClass(NO_PADDING_CLASS);
                                // The content method destroys widgets and unbinds data
                                dialogWidget.content('');
                                dialogWidget.viewModel = undefined;
                            }
                        })
                        .data('kendoDialog');
                    // Hides the display of "Fermer" after the "X" icon in the window title bar
                    dialogWidget.wrapper.find('.k-window-titlebar > .k-dialog-close > .k-font-icon.k-i-x').text('');
                }
                return dialogWidget;
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
                        .prop({ readonly: true })
                        .attr($.extend({}, settings.attributes, { 'data-bind': 'value: ' + settings.field }))// TODO: namespace???
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
            showDialog: function (options/*, e*/) {
                var that = this;
                var dialogWidget = that.getDialog(options);
                // Create viewModel (Cancel shall not save changes to main model)
                dialogWidget.viewModel = kendo.observable({
                    url: options.model.get(options.field)
                });
                // Prepare UI
                dialogWidget.title(options.title);
                dialogWidget.content('<div data-role="assetmanager" data-bind="value: url"></div>');
                assert.instanceof(PageComponent, options.model, kendo.format(assert.messages.instanceof.default, 'options.model', 'kidoju.data.PageComponent'));
                assert.instanceof(ToolAssets, assets[options.model.tool], kendo.format(assert.messages.instanceof.default, 'assets[options.model.tool]', 'kidoju.ToolAssets'));
                var assetManagerWidget = dialogWidget.element.find(kendo.roleSelector('assetmanager')).kendoAssetManager(assets[options.model.tool]).data('kendoAssetManager');
                kendo.bind(dialogWidget.element, dialogWidget.viewModel);
                dialogWidget.element.addClass(NO_PADDING_CLASS);
                // Show dialog
                assetManagerWidget.tabStrip.activateTab(0);
                dialogWidget.open();
            },
            onOkAction: function (options, e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(kendo.ui.Dialog, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Dialog'));
                options.model.set(options.field, e.sender.viewModel.get('url'));
            }
        });

        /**
         * Boolean adapter
         */
        adapters.BooleanAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = BOOLEAN;
                this.defaultValue = this.defaultValue || (this.nullable ? null : false);
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
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
         * CharGrid adapter
         */
        adapters.CharGridAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
                that.type = undefined;
                that.editor = function (container, settings) {
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({ margin: 0, width: '100%' })
                        .appendTo(container)
                        .on(CLICK, $.proxy(that.showDialog, that, settings));
                };
            },
            showDialog: function (options, evt) {
                var that = this;
                var dialogWidget = that.getDialog(options);
                var model = options.model;
                // Build data (resize array especially after changing rows and columns)
                var columns = model.get('attributes.columns');
                var rows = model.get('attributes.rows');
                var whitelist = model.get('attributes.whitelist');
                var layout = model.get('attributes.layout');
                var data = model.get(options.field);
                // Create viewModel (Cancel shall not save changes to main model)
                dialogWidget.viewModel = kendo.observable({
                    chargrid: kendo.ui.CharGrid._getCharGridArray(rows, columns, whitelist, layout, data)
                });
                // Prepare UI
                dialogWidget.title(options.title);
                dialogWidget.content('<div style="display:flex;flex-direction:row">' +
                    // character grid
                    '<div data-role="chargrid" data-bind="value: chargrid" data-scaler=".k-content" data-container=".k-content" ' +
                    'data-columns="' + model.get('attributes.columns') + '" data-rows="' + model.get('attributes.rows') + '" ' +
                    'data-blank="' + model.get('attributes.blank') + '" ' +
                    'data-whitelist="' + (options.field === 'properties.solution' ? model.get('attributes.whitelist') : '\\S') + '" ' +
                    (options.field === 'properties.solution' ? 'data-locked="' + kendo.htmlEncode(JSON.stringify(layout)) + '" ' : '') +
                    'data-grid-fill="' + model.get('attributes.gridFill') + '" ' +
                    'data-grid-stroke="' + model.get('attributes.gridStroke') + '" ' +
                    'data-blank-fill="' + model.get('attributes.gridStroke') + '" ' +
                    'data-selected-fill="' + model.get('attributes.selectedFill') + '" ' +
                    'data-locked-fill="' + model.get('attributes.lockedFill') + '" ' +
                    'data-locked-color="' + model.get('attributes.fontColor') + '" ' +
                    'data-value-color="' + model.get('attributes.fontColor') + '" ' +
                    'style="height:' + 0.7 * options.model.get('height') + 'px;width:' + 0.7 * options.model.get('width') + 'px;flex-shrink:0;padding:20px;"></div>' +
                    // Explanations
                    '<div style="padding:20px 0;">' +
                    (options.field === 'properties.solution' ? kendo.format(this.messages.solution, model.get('attributes.whitelist')) : kendo.format(this.messages.layout, model.get('attributes.blank'))) +
                    '</div>' +
                    // Close parent div
                    '</div>');
                kendo.bind(dialogWidget.element, dialogWidget.viewModel);
                dialogWidget.element.addClass(NO_PADDING_CLASS);
                // Show dialog
                dialogWidget.open();
            },
            onOkAction: function (options, e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(kendo.ui.Dialog, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Dialog'));
                options.model.set(options.field, e.sender.viewModel.get('chargrid'));
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return value && typeof value.equals === "function" && value.equals(solution);')
                }
            ],
            libraryDefault: 'equal',
            messages: {
                layout: i18n.chargridadapter.messages.layout,
                solution: i18n.chargridadapter.messages.solution
            }
        });

        /**
         * Chart adapter
         */
        adapters.ChartAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
                that.type = undefined;
                // This is the inline editor with a [...] button which triggers this.showDialog
                that.editor = function (container, settings) {
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({ margin: 0, width: '100%' })
                        .appendTo(container)
                        .on(CLICK, $.proxy(that.showDialog, that, settings));
                };
            },
            showDialog: function (options/*, e*/) {
                var that = this;
                var dialogWidget = that.getDialog(options);
                var model = options.model;
                var columns = model.get('attributes.categories') + 1;
                var rows = model.get('attributes.values') + 1;
                // Prepare UI
                dialogWidget.title(options.title);
                dialogWidget.content('<div data-role="spreadsheet"></div>');
                var spreadsheet = dialogWidget.element.find(kendo.roleSelector('spreadsheet'));
                assert.hasLength(spreadsheet, kendo.format(assert.messages.hasLength.default, 'spreadsheet'));
                var spreadsheetWidget = spreadsheet.kendoSpreadsheet({
                    columns: columns,
                    rows: rows,
                    sheetsbar: false,
                    toolbar: false
                }).data('kendoSpreadsheet');
                assert.instanceof(kendo.ui.Spreadsheet, spreadsheetWidget, kendo.format(assert.messages.instanceof.default, 'spreadsheetWidget', 'kendo.ui.Spreadsheet'));
                // Workaround for issue described at https://github.com/telerik/kendo-ui-core/issues/1990 and https://github.com/telerik/kendo-ui-core/issues/2156
                dialogWidget.one('show', function () {
                    kendo.resize(dialogWidget.element); // spreadsheetWidget.refresh();
                    spreadsheetWidget.activeSheet().range('A1:A1').select();
                });
                // Load JSON after resizing data to the predefined number of rows and columns
                spreadsheetWidget.fromJSON(util.resizeSpreadsheetData(model.get('attributes.data'), rows, columns));
                // Disable context menu
                spreadsheet.find('.k-spreadsheet-fixed-container').off('contextmenu');
                dialogWidget.element.addClass(NO_PADDING_CLASS);
                // Show dialog
                dialogWidget.open();
            },
            onOkAction: function (options, e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(kendo.ui.Dialog, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Dialog'));
                var spreadsheet = e.sender.element.find(kendo.roleSelector('spreadsheet'));
                assert.hasLength(spreadsheet, kendo.format(assert.messages.hasLength.default, 'spreadsheet'));
                var spreadsheetWidget = spreadsheet.data('kendoSpreadsheet');
                assert.instanceof(kendo.ui.Spreadsheet, spreadsheetWidget, kendo.format(assert.messages.instanceof.default, 'spreadsheetWidget', 'kendo.ui.Spreadsheet'));
                options.model.set(options.field, spreadsheetWidget.toJSON());
            }
        });

        /**
         * Color adapter
         */
        adapters.ColorAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '#000000');
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
                this.attributes[kendo.attr('role')] = 'colorpicker';
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).trim() === String(solution).trim();')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Connector adapter
         */
        adapters.ConnectorAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                // this.editor = 'input';
                // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
                this.editor = function (container, options) {
                    var input = $('<input/>')
                        .css({ width: '100%' })
                        .attr({ 'data-bind': 'value: ' + options.field }) // TODO namespace???
                        .appendTo(container);
                    input.kendoComboBox({
                        // dataSource: { data: [''] }, // We need a non-empty dataSource otherwise open is not triggered
                        /**
                         * Fill the drop down list when opening the popup (always up-to-date when adding/removing connectors)
                         * @param e
                         */
                        open: function (e) {
                            var solutions = [];
                            // find the design (mode) stage, avoiding navigation
                            var stage = $('[' + kendo.attr('role') + '="stage"][' + kendo.attr('mode') + '="design"]');
                            // find the handle box and the selected uid which should be a connector
                            var handleBox = stage.parent().children('.kj-handle-box');
                            var uid = handleBox.attr(kendo.attr('uid'));
                            // find all unselected connectors
                            assert.instanceof (PageComponent, options.model, kendo.format(assert.messages.instanceof.default, 'options.model', 'kidoju.data.PageModel'));
                            if (options.model.parent() instanceof kendo.Observable && options.model.parent().selectedPage instanceof Page) {
                                var components = options.model.parent().selectedPage.components;
                                $.each(components.data(), function (index, component) {
                                    if (component.tool === 'connector' && component.uid !== uid) {
                                        var solution = component.get(options.field);
                                        if ($.type(solution) === STRING && solution.length && solutions.indexOf(solution) === -1) {
                                            solutions.push(solution);
                                        }
                                    }
                                });
                                solutions.sort();
                            }
                            e.sender.setDataSource(solutions);
                        }
                    });
                };
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).trim() === String(solution).trim();')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Date adapter
         */
        adapters.DateAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = DATE;
                this.defaultValue = this.defaultValue || (this.nullable ? null : new Date());
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
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
         * Description Adapter
         */
        adapters.DescriptionAdapter = BaseAdapter.extend({
            init: function (options) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                // this.editor = 'input';
                // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
                this.editor = function (container, options) {
                    var input = $('<input/>')
                        .css({ width: '100%' })
                        .attr({ 'data-bind': 'value: ' + options.field }) // TODO namespace???
                        .appendTo(container);
                    input.kendoComboBox({
                        // dataSource: { data: [] }, // We need a non-empty dataSource otherwise open is not triggered
                        /**
                         * Fill the drop down list when opening the popup (always up-to-date when adding/removing connectors)
                         * @param e
                         */
                        open: function (e) {
                            var texts = [];
                            // find the design (mode) stage, avoiding navigation
                            var stage = $('[' + kendo.attr('role') + '="stage"][' + kendo.attr('mode') + '="design"]');
                            // find all labels
                            var labels = stage.find('.kj-element[' + kendo.attr('tool') + '="label"]>div');
                            labels.each(function (index, label) {
                                var text = $(label).html().replace(/<br\/?>/g, ' ');
                                if ($.type(text) === STRING && text.length) {
                                    texts.push(text);
                                }
                            });
                            texts.sort();
                            e.sender.setDataSource(texts);
                        }
                    });
                };
            }
        });

        /**
         * Enum adapter
         */
        adapters.EnumAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
                this.attributes[kendo.attr('role')] = 'dropdownlist';
                this.attributes[kendo.attr('source')] = JSON.stringify(options && options.enum ? options.enum : []); // kendo.htmlEncode??
            }
        });

        /**
         * Property name adapter
         */
        adapters.NameAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes, { type: 'text', class: 'k-textbox',  readonly: true });
            }
        });

        /**
         * Number adapter
         */
        adapters.NumberAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = NUMBER;
                this.defaultValue = this.defaultValue || (this.nullable ? null : 0);
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
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
         * Quiz adapter
         */
        adapters.QuizAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                // this.editor = 'input';
                // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
                this.editor = function (container, options) {
                    var input = $('<input/>')
                        .css({ width: '100%' })
                        .attr({ 'data-bind': 'value: ' + options.field }) // TODO namespace???
                        .appendTo(container);
                    input.kendoComboBox({
                        // dataSource: { data: [''] }, // We need a non-empty dataSource otherwise open is not triggered
                        /**
                         * Fill the drop down list when opening the popup (always up-to-date when adding/removing connectors)
                         * @param e
                         */
                        open: function (e) {
                            var data = options.model.get('attributes.data');
                            data = $.type(data) === STRING ? data.split('\n') : [];
                            data.sort();
                            e.sender.setDataSource(data);
                        }
                    });
                };
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).trim() === String(solution).trim();')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Score adapter
         */
        adapters.ScoreAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = NUMBER;
                this.defaultValue = this.defaultValue || (this.nullable ? null : 0);
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
                this.attributes[kendo.attr('role')] = 'numerictextbox';
            }
        });

        /**
         * String adapter
         */
        adapters.StringAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes, { type: 'text', class: 'k-textbox' });
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
         * String Array adapter
         */
        adapters.StringArrayAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'textarea';
                this.attributes = $.extend({}, this.attributes, attributes);
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, '// Note: value is an array and solution is a multiline string\n\t' +
                        'return String(value.sort()) === String(solution.trim().split("\\n").sort());')
                },
                {
                    name: 'sumEqual',
                    formula: kendo.format(FORMULA, '// Note: value is an array and solution is a multiline string\n\t' +
                        'var ret = 0;\t' +
                        'value.forEach(function(val){ ret += parseFloat((val || "").trim() || 0); });\t' +
                        'return ret === parseFloat(solution.trim());')
                }
            ],
            libraryDefault: 'equal'
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
                        .addClass('k-textbox') // or k-input
                        .css({ width: '100%' })
                        .attr($.extend({}, settings.attributes, { 'data-bind': 'value: ' + settings.field })) // TODO namespace?
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
            showDialog: function (options/*, e*/) {
                var that = this;
                var dialogWidget = that.getDialog(options);
                // Create viewModel (Cancel shall not save changes to main model)
                dialogWidget.viewModel = kendo.observable({
                    style: options.model.get(options.field)
                });
                // Prepare UI
                dialogWidget.title(options.title);
                dialogWidget.content('<div data-role="styleeditor" data-bind="value: style" data-height="400"></div>');
                kendo.bind(dialogWidget.element, dialogWidget.viewModel);
                var styleEditor = dialogWidget.element.find(kendo.roleSelector('styleeditor'));
                assert.hasLength(styleEditor, kendo.format(assert.messages.hasLength.default, 'styleEditor'));
                var styleEditorWidget = styleEditor.data('kendoStyleEditor');
                assert.instanceof(kendo.ui.StyleEditor, styleEditorWidget, kendo.format(assert.messages.instanceof.default, 'styleEditorWidget', 'kendo.ui.StyleEditor'));
                // Workaround for issue described at https://github.com/telerik/kendo-ui-core/issues/1990 and https://github.com/telerik/kendo-ui-core/issues/2156
                dialogWidget.one('show', function () {
                    styleEditorWidget.refresh();
                });
                dialogWidget.element.addClass(NO_PADDING_CLASS);
                // Show dialog
                dialogWidget.open();
            },
            onOkAction: function (options, e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(kendo.ui.Dialog, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Dialog'));
                options.model.set(options.field, e.sender.viewModel.get('style'));
            }
        });

        /**
         * Table adapter
         */
        adapters.TableAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
                that.type = undefined;
                // This is the inline editor with a [...] button which triggers this.showDialog
                that.editor = function (container, settings) {
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({ margin: 0, width: '100%' })
                        .appendTo(container)
                        .on(CLICK, $.proxy(that.showDialog, that, settings));
                };
            },
            showDialog: function (options/*, e*/) {
                var that = this;
                var dialogWidget = that.getDialog(options);
                var model = options.model;
                var columns = model.get('attributes.columns');
                var rows = model.get('attributes.rows');
                // Prepare UI
                dialogWidget.title(options.title);
                dialogWidget.content('<div data-role="spreadsheet"></div>');
                var spreadsheet = dialogWidget.element.find(kendo.roleSelector('spreadsheet'));
                assert.hasLength(spreadsheet, kendo.format(assert.messages.hasLength.default, 'spreadsheet'));
                var spreadsheetWidget = spreadsheet.kendoSpreadsheet({
                    columns: columns,
                    rows: rows,
                    columnWidth: 150,
                    rowHeight: 58,
                    sheetsbar: false,
                    toolbar: {
                        // TODO: merge and hide not included in v1
                        home: [['bold', 'italic', 'underline'], 'backgroundColor', 'textColor', 'borders', 'fontSize', 'fontFamily', 'alignment', 'textWrap', ['formatDecreaseDecimal', 'formatIncreateDecimal'], 'format'],
                        insert: false,
                        data: false
                    }
                }).data('kendoSpreadsheet');
                assert.instanceof(kendo.ui.Spreadsheet, spreadsheetWidget, kendo.format(assert.messages.instanceof.default, 'spreadsheetWidget', 'kendo.ui.Spreadsheet'));
                // Workaround for issue described at https://github.com/telerik/kendo-ui-core/issues/1990 and https://github.com/telerik/kendo-ui-core/issues/2156
                dialogWidget.one('show', function () {
                    kendo.resize(dialogWidget.element); // spreadsheetWidget.refresh();
                    spreadsheetWidget.activeSheet().range('A1:A1').select();
                });
                // Load JSON after resizing data to the predefined number of rows and columns
                spreadsheetWidget.fromJSON(util.resizeSpreadsheetData(model.get('attributes.data'), rows, columns));
                // Disable context menu
                spreadsheet.find('.k-spreadsheet-fixed-container').off('contextmenu');
                // Set default font size
                var activeSheet = spreadsheetWidget.activeSheet();
                activeSheet.range('R1C1:R' + rows + 'C' + columns).forEachCell(function (rowIndex, columnIndex) {
                    var range = activeSheet.range('R' + (rowIndex + 1) + 'C' + (columnIndex + 1));
                    range.fontSize(range.fontSize() || 48);
                });
                dialogWidget.element.addClass(NO_PADDING_CLASS);
                // Show dialog
                dialogWidget.open();
            },
            onOkAction: function (options, e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(kendo.ui.Dialog, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Dialog'));
                var spreadsheet = e.sender.element.find(kendo.roleSelector('spreadsheet'));
                assert.hasLength(spreadsheet, kendo.format(assert.messages.hasLength.default, 'spreadsheet'));
                var spreadsheetWidget = spreadsheet.data('kendoSpreadsheet');
                assert.instanceof(kendo.ui.Spreadsheet, spreadsheetWidget, kendo.format(assert.messages.instanceof.default, 'spreadsheetWidget', 'kendo.ui.Spreadsheet'));
                options.model.set(options.field, spreadsheetWidget.toJSON());
            }
        });

        /**
         * Text (multiline) adapter
         */
        adapters.TextAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'textarea';
                this.attributes = $.extend({}, this.attributes, attributes);
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).trim() === String(solution).trim();')
                },
                {
                    name: 'ignoreSpacesEqual',
                    formula: kendo.format(FORMULA, 'return String(value).replace(/\\s+/g, " ").trim() === String(solution).replace(/\\s+/g, " ").trim();')
                },
                {
                    name: 'ignorePunctiationEqual',
                    formula: kendo.format(FORMULA, 'return String(value).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim() === String(solution).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim();')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Property validation adapter
         */
        adapters.ValidationAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
                that.type = STRING;
                // this.defaultValue = this.defaultValue || (this.nullable ? null : '');
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
                    var input = $('<div data-role="codeinput" />') // TODO namespace???
                    // Note: _library is added to the data bound PageComponent in its init method
                        .attr($.extend({}, settings.attributes, { 'data-bind': 'value: ' + settings.field + ', source: _library' })) // TODO namespace???
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
                        .on(CLICK, $.proxy(that.showDialog, that, settings));
                    temp.remove();
                };
            },
            showDialog: function (options/*, e*/) {
                var that = this;
                var dialogWidget = that.getDialog(options);
                // Create viewModel (Cancel shall not save changes to main model)
                dialogWidget.viewModel = kendo.observable({
                    code: options.model.get(options.field),
                    library: [CUSTOM].concat(that.library)
                });
                // Prepare UI
                dialogWidget.title(options.title);
                dialogWidget.content('<div data-role="codeeditor" data-bind="value: code, source: library" data-default="' + that.defaultValue + '" data-solution="' + kendo.htmlEncode(JSON.stringify(options.model.get('properties.solution'))) + '"></div>');
                kendo.bind(dialogWidget.element, dialogWidget.viewModel);
                dialogWidget.element.addClass(NO_PADDING_CLASS);
                // Bind window activate handler
                dialogWidget.one('show', function () {
                    // IMPORTANT, we need13 to refresh codemirror here
                    // otherwise the open animation messes with CodeMirror calculations
                    // and gutter and line numbers are displayed at the wrong coordinates
                    var codeEditor = dialogWidget.element
                        .find('.kj-codeeditor')
                        .data('kendoCodeEditor');
                    if (codeEditor instanceof kendo.ui.CodeEditor && codeEditor.codeMirror && $.isFunction(codeEditor.codeMirror.refresh)) {
                        codeEditor.codeMirror.refresh();
                    }
                });
                // Show dialog
                dialogWidget.open();
            },
            onOkAction: function (options, e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                assert.instanceof(kendo.ui.Dialog, e.sender, kendo.format(assert.messages.instanceof.default, 'e.sender', 'kendo.ui.Dialog'));
                options.model.set(options.field, e.sender.viewModel.get('code'));
            }
        });

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
            description: i18n.pointer.description,
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
            description: i18n.audio.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-#= ns #role="mediaplayer" data-#= ns #mode="audio" data-#= ns #autoplay="#: attributes.autoplay #" data-#= ns #files="#: attributes.files$() #"></div>'
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
                assert.instanceof(Audio, that, kendo.format(assert.messages.instanceof.default, 'this', 'Audio'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.audio, kendo.format(assert.messages.instanceof.default, 'assets.audio', 'kidoju.ToolAssets'));
                var template = kendo.template(that.templates.default);
                // The files$ function resolves urls with schemes like cdn://audio.mp3 and returns a stringified array
                component.attributes.files$ = function () {
                    var mp3 = component.attributes.get('mp3');
                    var ogg = component.attributes.get('ogg');
                    var schemes = assets.audio.schemes;
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
                return template($.extend(component, { ns: kendo.ns }));
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
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                widget.resize();
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if (!RX_AUDIO.test(component.attributes.mp3)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidAudioFile, description, pageIdx + 1)
                        });
                    }
                    // Note: we are not testing for an ogg file
                }
                return ret;
            }

        });
        tools.register(Audio);

        /**
         * Build default chart data
         * @param categories
         * @param values
         * @returns {{sheets: *[]}}
         */
        util.defaultChartData = function (categories, values) {
            var YEAR = 1999;
            var MAX_VALUE = 500;
            var rowTotal = values + 1;
            var columnTotal = categories + 1;
            var rowIndex;
            var columnIndex;
            var data = { sheets: [{ name: 'Sheet1', rows: [] }] };
            var rows = data.sheets[0].rows;
            // Build the categories row
            var row = { index: 0, cells: [] };
            for (columnIndex = 1; columnIndex < columnTotal; columnIndex++) {
                row.cells.push({ index: columnIndex, value: YEAR + columnIndex });
            }
            rows.push(row);
            // Build the values rows
            for (rowIndex = 1; rowIndex < rowTotal; rowIndex++) {
                row = { index: rowIndex, cells: [] };
                row.cells.push({ index: 0, value: 'Series' + rowIndex });
                for (columnIndex = 1; columnIndex < columnTotal; columnIndex++) {
                    row.cells.push({ index: columnIndex, value: Math.floor(MAX_VALUE * Math.random()) });
                }
                rows.push(row);
            }
            return data;
        };

        /**
         * A utility function to resize spreadsheet data to a specified number of rows and columns
         * @param json
         * @param rowMax
         * @param columnMax
         */
        util.resizeSpreadsheetData = function (json, rowMax, columnMax) {
            var rows = json.sheets[0].rows;
            var rowFilter = function (row) { return row.index < rowMax; };
            var columnFilter = function (column) { return column.index < columnMax; };
            rows = rows.filter(rowFilter);
            for (var rowIndex = 0, rowTotal = rows.length; rowIndex < rowTotal; rowIndex++) {
                var cells = rows[rowIndex].cells;
                cells = cells.filter(columnFilter);
                rows[rowIndex].cells = cells;
            }
            json.sheets[0].rows = rows;
            return json;
        };

        /**
         * Chart tool
         * @class Chart
         */
        var Chart = Tool.extend({
            id: 'chart',
            icon: 'chart_area',
            description: i18n.chart.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-#= ns #role="chart" data-#= ns #chart-area="#: attributes.chartArea$() #" data-#= ns #series-defaults="#: attributes.seriesDefaults$() #" data-#= ns #title="#: attributes.title$() #" data-#= ns #legend="#: attributes.legend$() #" data-#= ns #series="#: attributes.series$() #" data-#= ns #category-axis="#: attributes.categoryAxis$() #" data-#= ns #value-axis="#: attributes.valueAxis$() #" style="#: attributes.style #"></div>'
            },
            height: 400,
            width: 400,
            attributes: {
                type: new adapters.EnumAdapter({ title: i18n.chart.attributes.type.title, defaultValue: 'column', enum: ['area', 'bar', 'column', 'line', 'radarArea', 'radarColumn', 'radarLine', 'smoothLine', 'stackBar', 'waterfall', 'verticalArea', 'verticalLine'] }, { style: 'width: 100%;' }),
                title: new adapters.StringAdapter({ title: i18n.chart.attributes.title.title }),
                categories: new adapters.NumberAdapter({ title: i18n.chart.attributes.categories.title, defaultValue: 4 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 10 }),
                values: new adapters.NumberAdapter({ title: i18n.chart.attributes.values.title, defaultValue: 2 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 10 }),
                legend: new adapters.EnumAdapter({ title: i18n.chart.attributes.legend.title, defaultValue: 'none', enum: ['none', 'top', 'bottom', 'left', 'right'] }, { style: 'width: 100%;' }),
                data: new adapters.ChartAdapter({ title: i18n.chart.attributes.data.title, defaultValue: util.defaultChartData(4, 2) }),
                style: new adapters.StyleAdapter({ title: i18n.chart.attributes.style.title })
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Get Html or jQuery content
             * @method getHtmlContent
             * @param component
             * @param mode
             * @returns {*}
             */
            getHtmlContent: function (component, mode) {
                var that = this;
                var types = {
                    area : { type: 'area' },
                    bar : { type: 'bar' },
                    // bubble : { type: 'bubble' },
                    // bullet : { type: 'bullet' },
                    // candlestick : { type: 'candlestick' },
                    column : { type: 'column' },
                    // donut: { type: 'donut' },                 // <--- Could work with a little bit of work to display labels
                    // funnel: { type: 'funnel' },
                    line: { type: 'line' },
                    // ohlc: { type: 'ohlc' },
                    // pie: { type: 'pie' },                     // <--- Nice to have
                    // polarArea: { type: 'polarArea' },
                    // polarLine: { type: 'polarLine' },
                    // polarScatter: { type: 'polarScatter' },
                    radarArea : { type: 'radarArea' },
                    radarColumn : { type: 'radarColumn' },
                    radarLine: { type: 'radarLine' },
                    smoothLine: { type: 'line', style: 'smooth' },
                    // scatter: { type: 'scatter' },
                    // scatterLine: { type: 'scatterLine' },     // <--- Nice to have
                    stackBar: { type: 'bar', stack: 'true' },
                    waterfall: { type: 'waterfall' },
                    verticalArea: { type: 'verticalArea' },
                    // verticalBullet: { type: 'verticalBullet' },
                    verticalLine: { type: 'verticalLine' }
                };
                assert.instanceof(Chart, that, kendo.format(assert.messages.instanceof.default, 'this', 'Chart'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var template = kendo.template(that.templates.default);
                var style = component.attributes.get('style');
                // Get font from style - @see http://www.telerik.com/forums/charts---changing-the-default-font
                var font = style.match(/font:([^;]+)/);
                font = $.isArray(font) ? font[1] : font;
                var fontSize = style.match(/font-size:([^;]+)/);
                fontSize = $.isArray(fontSize) ? fontSize[1] : fontSize;
                var fontFamily = style.match(/font-family:([^;]+)/);
                fontFamily = $.isArray(fontFamily) ? fontFamily[1] : fontFamily;
                // TODO: consider font-weight and font-style
                font = font || ((fontSize || '50px') + ' ' + (fontFamily || 'Arial'));
                var smallerFont = font;
                var numbersInFont = font.match(/([0-9])+/g);
                if ($.isArray(numbersInFont)) {
                    for (var i = 0, length = numbersInFont.length; i < length; i++) {
                        smallerFont = smallerFont.replace(numbersInFont[i], Math.ceil(0.6 * parseInt(numbersInFont[i], 10)));
                    }
                }
                // Get colors from style (a null color is transparent, wheras undefined reverts to chart defaults)
                var color = style.match(/color:([^;]+)/);
                color = $.isArray(color) ? color[1] : color || undefined;
                var background = style.match(/background-color:([^;]+)/);
                background = $.isArray(background) ? background[1] : background || undefined;
                // The chartArea$ function returns an object for chart's data-chart-area attribute binding
                component.attributes.chartArea$ = function () {
                    return JSON.stringify({
                        background: background
                    });
                };
                // The axisDefaults$ function returns an object chart's data-axis-defaults attribute binding
                // component.attributes.axisDefaults$ = function () {
                // We can't use axisDefaults, so we have categoryAxis$ and valueAxis$
                // because of https://github.com/telerik/kendo-ui-core/issues/2165
                // };
                // The seriesDefaults$ function returns an object for chart's data-series-defaults attribute binding
                component.attributes.seriesDefaults$ = function () {
                    return JSON.stringify(types[component.attributes.get('type')]);
                };
                // The title$ function returns an object for chart's data-title attribute binding
                component.attributes.title$ = function () {
                    var title = component.attributes.get('title');
                    return JSON.stringify({
                        text: title,
                        visible: !!(title.trim()),
                        font: font,
                        color: color
                    });
                };
                // The legend$ function returns an object for chart's data-legend attribute binding
                component.attributes.legend$ = function () {
                    var legend = component.attributes.get('legend');
                    return JSON.stringify({
                        position: legend !== 'none' ? legend : 'right',
                        visible: legend !== 'none',
                        labels: {
                            font: smallerFont,
                            color: color
                        }
                    });
                };
                // The series$ function returns an object for chart's data-series attribute binding
                component.attributes.series$ = function () {
                    var series = [];
                    var rowTotal = component.attributes.get('values') + 1;
                    var columnTotal = component.attributes.get('categories') + 1;
                    var rowIndex;
                    var columnIndex;
                    var rowFinder = function (row) { return row.index === rowIndex; };
                    var columnFinder = function (column) { return column.index === columnIndex; };
                    var json = component.attributes.get('data');
                    for (rowIndex = 1; rowIndex < rowTotal; rowIndex++) {
                        var serie = { name: '', data: [] };
                        var row = json.sheets[0].rows.find(rowFinder);
                        if (row && row.cells) {
                            columnIndex = 0;
                            var cell = row.cells.find(columnFinder);
                            if (cell && cell.value) {
                                serie.name = cell.value;
                            }
                            for (columnIndex = 1; columnIndex < columnTotal; columnIndex++) {
                                var data = 0;
                                cell = row.cells.find(columnFinder);
                                if (cell && $.type(cell.value) === 'number') {
                                    data = cell.value;
                                }
                                serie.data.push(data);
                            }
                        }
                        series.push(serie);
                    }
                    /*
                     return [
                     { name: 'Series 1', data: [200, 450, 300, 125] },
                     { name: 'Series 2', data: [200, 450, 300, 125] }
                     ];
                     */
                    return JSON.stringify(series);
                };
                // The categoryAxis$ function returns an object for chart's data-category-axis attribute binding
                component.attributes.categoryAxis$ = function () {
                    var categories = [];
                    var columnTotal = component.attributes.get('categories') + 1;
                    var rowIndex = 0;
                    var columnIndex;
                    var rowFinder = function (row) { return row.index === rowIndex; };
                    var columnFinder = function (column) { return column.index === columnIndex; };
                    var json = component.attributes.get('data');
                    var row = json.sheets[0].rows.find(rowFinder);
                    for (columnIndex = 1; columnIndex < columnTotal; columnIndex++) {
                        var category = '';
                        if (row && row.cells) {
                            var cell = row.cells.find(columnFinder);
                            if (cell && cell.value) {
                                category = cell.value;
                            }
                        }
                        categories.push(category);
                    }
                    // return { categories: [2000, 2001, 2002, 2003] }
                    return JSON.stringify({
                        categories: categories,
                        color: color,
                        labels: {
                            font: smallerFont,
                            color: color
                        }
                    });
                };
                // The valueAxis$ function returns an object for chart's data-value-axis attribute binding
                component.attributes.valueAxis$ = function () {
                    return JSON.stringify({
                        color: color,
                        labels: {
                            font: smallerFont,
                            color: color
                        }
                    });
                };
                return template($.extend(component, { ns: kendo.ns }));
            },

            /* jshint +W074 */

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
                var content = stageElement.children('div' + kendo.roleSelector('chart'));
                var widget = content.data('kendoChart');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                widget.resize();
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            /*
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if (!RX_AUDIO.test(component.attributes.mp3)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidAudioFile, description, pageIdx + 1)
                        });
                    }
                    // Note: we are not testing for an ogg file
                }
                return ret;
            }
            */

        });
        tools.register(Chart);

        var CHARGRID = '<div data-#= ns #role="chargrid" data-#= ns #scaler=".kj-stage" data-#= ns #container=".kj-stage>div[data-role=stage]" data-#= ns #columns="#: attributes.columns #" data-#= ns #rows="#: attributes.rows #" data-#= ns #blank="#: attributes.blank #" data-#= ns #whitelist="#: attributes.whitelist #" data-#= ns #grid-fill="#: attributes.gridFill #" data-#= ns #grid-stroke="#: attributes.gridStroke #" data-#= ns #blank-fill="#: attributes.gridStroke #" data-#= ns #selected-fill="#: attributes.selectedFill #" data-#= ns #locked-fill="#: attributes.lockedFill #" data-#= ns #locked-color="#: attributes.fontColor #" data-#= ns #value-color="#: attributes.fontColor #" {0}></div>';
        /**
         * @class CharGrid tool
         * @type {void|*}
         */
        var CharGrid = Tool.extend({
            id: 'chargrid',
            icon: 'dot_matrix',
            description: i18n.chargrid.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 8,
            templates: {
                design: kendo.format(CHARGRID, 'data-#= ns #value="#: JSON.stringify(attributes.layout) #" data-#= ns #locked="#: JSON.stringify(attributes.layout) #" data-#= ns #enable="false"'),
                play: kendo.format(CHARGRID, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #locked="#: JSON.stringify(attributes.layout) #"'),
                review: kendo.format(CHARGRID, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #locked="#: JSON.stringify(attributes.layout) #" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 400,
            width: 400,
            attributes: {
                columns: new adapters.NumberAdapter({ title: i18n.chargrid.attributes.columns.title, defaultValue: 9 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
                rows: new adapters.NumberAdapter({ title: i18n.chargrid.attributes.rows.title, defaultValue: 9 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
                blank: new adapters.StringAdapter({ title: i18n.chargrid.attributes.blank.title, defaultValue: '.' }),
                whitelist: new adapters.StringAdapter({ title: i18n.chargrid.attributes.whitelist.title, defaultValue: '1-9' }),
                layout: new adapters.CharGridAdapter({ title: i18n.chargrid.attributes.layout.title, defaultValue: null }),
                gridFill: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.gridFill.title, defaultValue: '#ffffff' }),
                gridStroke: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.gridStroke.title, defaultValue: '#000000' }),
                // blankFill = gridStroke
                selectedFill: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.selectedFill.title, defaultValue: '#ffffcc' }),
                lockedFill: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.lockedFill.title, defaultValue: '#e6e6e6' }),
                // lockedColor = valueColor = fontColor
                fontColor: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.fontColor.title, defaultValue: '#9999b6' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.chargrid.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.chargrid.properties.description.title }),
                solution: new adapters.CharGridAdapter({ title: i18n.chargrid.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.chargrid.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.omit.title, defaultValue: 0 })
            },

            /**
             * Improved display of value in score grid
             * @param value
             */
            value$: function (value) {
                // var ret = '<table>';
                var ret = '';
                if ($.isArray(value) || value instanceof ObservableArray) {
                    for (var r = 0, rowTotal = value.length; r < rowTotal; r++) {
                        var row = value[r];
                        // ret += '<tr>';
                        for (var c = 0, colTotal = row.length; c < colTotal; c++) {
                            // ret += '<td>' + kendo.htmlEncode(row[c] || '') + '</td>';
                            ret += kendo.htmlEncode(row[c] || '') + (c === colTotal - 1 ? '' : ',');
                        }
                        // ret += '</tr>';
                        ret += '<br/>';
                    }
                }
                // ret += '</table>';
                return ret;
            },

            /**
             * Improved display of solution in score grid
             * @param solution
             */
            solution$: function (solution) {
                // var ret = '<table>';
                var ret = '';
                if ($.isArray(solution) || solution instanceof ObservableArray) {
                    for (var r = 0, rowTotal = solution.length; r < rowTotal; r++) {
                        var row = solution[r];
                        // ret += '<tr>';
                        for (var c = 0, colTotal = row.length; c < colTotal; c++) {
                            // ret += '<td>' + kendo.htmlEncode(row[c] || '') + '</td>';
                            ret += kendo.htmlEncode(row[c] || '') + (c === colTotal - 1 ? '' : ',');
                        }
                        // ret += '</tr>';
                        ret += '<br/>';
                    }
                }
                // ret += '</table>';
                return ret;
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
                var content = stageElement.children('div.kj-chargrid');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                // Redraw the charGrid widget
                var charGridWidget = content.data('kendoCharGrid');
                assert.instanceof(kendo.ui.CharGrid, charGridWidget, kendo.format(assert.messages.instanceof.default, 'charGridWidget', 'kendo.ui.CharGrid'));
                charGridWidget.refresh();
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }

        });
        tools.register(CharGrid);

        var CHECKBOX = '<div data-#= ns #role="multicheckbox" {0} data-#= ns #source="#: JSON.stringify(attributes.data.trim().split(\'\\n\')) #" style="#: attributes.groupStyle #" data-#= ns #item-style="#: attributes.itemStyle #" data-#= ns #selected-style="#: attributes.selectedStyle #"></div>';
        /**
         * Checkbox tool
         * @class CheckBox
         * @type {void|*}
         */
        var CheckBox = Tool.extend({
            id: 'checkbox',
            icon: 'checkbox',
            description: i18n.checkbox.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(CHECKBOX, 'data-#= ns #enable="false"'),
                play: kendo.format(CHECKBOX, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(CHECKBOX, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 200,
            width: 350,
            attributes: {
                groupStyle: new adapters.StyleAdapter({ title: i18n.checkbox.attributes.groupStyle.title, defaultValue: 'font-size: 60px;' }),
                itemStyle: new adapters.StyleAdapter({ title: i18n.checkbox.attributes.itemStyle.title }),
                selectedStyle: new adapters.StyleAdapter({ title: i18n.checkbox.attributes.selectedStyle.title }),
                data: new adapters.TextAdapter(
                    { title: i18n.checkbox.attributes.data.title, defaultValue: i18n.checkbox.attributes.data.defaultValue },
                    { rows: 4, style: 'resize:vertical; width: 100%;' }
                )
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.checkbox.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.checkbox.properties.description.title }),
                solution: new adapters.StringArrayAdapter({ title: i18n.checkbox.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.checkbox.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.checkbox.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.checkbox.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.checkbox.properties.omit.title, defaultValue: 0 })
            },

            /**
             * Improved display of value in score grid
             * @param value
             */
            value$: function (value) {
                var ret = (value || []).slice();
                for (var i = 0; i < ret.length; i++) {
                    ret[i] = kendo.htmlEncode(ret[i]);
                }
                return ret.join('<br/>');
            },

            /**
             * Improved display of solution in score grid
             * @param solution
             */
            solution$: function (solution) {
                return kendo.htmlEncode(solution || '').split('\n').join('<br/>');
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
                var content = stageElement.children('div').first();
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                    // if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
                    //     content.css('font-size', Math.floor(0.85 * content.height()));
                    // }
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.groupStyle && !RX_STYLE.test(component.attributes.groupStyle)) ||
                        (component.attributes.itemStyle && !RX_STYLE.test(component.attributes.itemStyle)) ||
                        (component.attributes.selectedStyle && !RX_STYLE.test(component.attributes.selectedStyle))) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                    if (!RX_DATA.test(component.attributes.data)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidData, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(CheckBox);

        var CONNECTOR = '<div data-#= ns #role="connector" data-#= ns #id="#: properties.name #" data-#= ns #target-value="#: properties.solution #" data-#= ns #scaler=".kj-stage" data-#= ns #container=".kj-stage>div[data-#= ns #role=stage]" data-#= ns #color="#: attributes.color #" {0}></div>';
        /**
         * @class Connector tool
         * @type {void|*}
         */
        var Connector = Tool.extend({
            id: 'connector',
            icon: 'target',
            description: i18n.connector.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 0.25,
            templates: {
                design: kendo.format(CONNECTOR, 'data-#= ns #enable="false" data-#= ns #has-surface="false"'),
                play: kendo.format(CONNECTOR, 'data-#= ns #bind="value: #: properties.name #.value, source: connections"'),
                review: kendo.format(CONNECTOR, 'data-#= ns #bind="value: #: properties.name #.value, source: connections" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 70,
            width: 70,
            attributes: {
                color: new adapters.ColorAdapter({ title: i18n.connector.attributes.color.title, defaultValue: '#FF0000' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.connector.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.connector.properties.description.title }),
                solution: new adapters.ConnectorAdapter({ title: i18n.connector.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.connector.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.connector.properties.success.title, defaultValue: 0.5 }),
                failure: new adapters.ScoreAdapter({ title: i18n.connector.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.connector.properties.omit.title, defaultValue: 0 })
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
                var content = stageElement.children('div[' + kendo.attr('role') + '="connector"]');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                // Redraw the connector widget
                var connectorWidget = content.data('kendoConnector');
                assert.instanceof(kendo.ui.Connector, connectorWidget, kendo.format(assert.messages.instanceof.default, 'connectorWidget', 'kendo.ui.Connector'));
                connectorWidget._drawConnector();

                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if (component.attributes.color && !RX_COLOR.test(component.attributes.color)) {
                        ret.push({
                            type: WARNING,
                            index: pageIdx,
                            message: kendo.format(messages.invalidColor, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(Connector);

        var DROPZONE = '<div id="#: properties.name #" data-#= ns #role="dropzone" data-#= ns #scaler=".kj-stage" data-#= ns #container=".kj-stage>div[data-role=stage]" data-#= ns #draggable=".kj-element:has([data-draggable=true])" data-#= ns #center="#: attributes.center #" style="#: attributes.style #" {0}><div>#: attributes.text #</div></div>';
        /**
         * @class Connector tool
         * @type {void|*}
         */
        var DropZone = Tool.extend({
            id: 'dropzone',
            icon: 'elements_selection',
            description: i18n.dropzone.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(DROPZONE, 'data-#= ns #enable="false"'),
                play: kendo.format(DROPZONE, 'data-#= ns #bind="value: #: properties.name #.value, source: draggables"'),
                review: kendo.format(DROPZONE, 'data-#= ns #bind="value: #: properties.name #.value, source: draggables" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 250,
            width: 250,
            attributes: {
                center: new adapters.BooleanAdapter({ title: i18n.dropzone.attributes.center.title, defaultValue: i18n.dropzone.attributes.center.defaultValue }),
                text: new adapters.StringAdapter({ title: i18n.dropzone.attributes.text.title, defaultValue: i18n.dropzone.attributes.text.defaultValue }),
                style: new adapters.StyleAdapter({ title: i18n.dropzone.attributes.style.title, defaultValue: 'font-size: 30px; border: dashed 3px #e1e1e1;' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.dropzone.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.dropzone.properties.description.title }),
                solution: new adapters.StringArrayAdapter({ title: i18n.dropzone.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.dropzone.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.dropzone.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.dropzone.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.dropzone.properties.omit.title, defaultValue: 0 })
            },

            /**
             * Improved display of value in score grid
             * @param value
             */
            value$: function (value) {
                var ret = (value || []).slice();
                for (var i = 0; i < ret.length; i++) {
                    ret[i] = kendo.htmlEncode(ret[i]);
                }
                return ret.join('<br/>');
            },

            /**
             * Improved display of solution in score grid
             * @param solution
             */
            solution$: function (solution) {
                return kendo.htmlEncode(solution || '').split('\n').join('<br/>');
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
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    // Note: any text is acceptable
                    if (component.attributes.style && !RX_STYLE.test(component.attributes.style)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(DropZone);

        /**
         * @class Image tool
         * @type {void|*}
         */
        var Image = Tool.extend({
            id: 'image',
            icon: 'painting_landscape',
            description: i18n.image.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<img src="#: attributes.src$() #" alt="#: attributes.alt #" style="#: attributes.style #" data-#= ns #id="#: properties.id$() #" data-#= ns #draggable="#: properties.draggable #" data-#= ns #drop-value="#: properties.dropValue #">'
            },
            height: 250,
            width: 250,
            attributes: {
                alt: new adapters.StringAdapter({ title: i18n.image.attributes.alt.title, defaultValue: i18n.image.attributes.alt.defaultValue }),
                src: new adapters.AssetAdapter({ title: i18n.image.attributes.src.title, defaultValue: i18n.image.attributes.src.defaultValue }),
                style: new adapters.StyleAdapter({ title: i18n.image.attributes.style.title })
            },
            properties: {
                draggable: new adapters.BooleanAdapter({ title: i18n.image.properties.draggable.title, defaultValue: false }),
                dropValue: new adapters.StringAdapter({ title: i18n.image.properties.dropValue.title })
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
                // The id$ function returns the component id for draggable components
                component.properties.id$ = function () {
                    return component.properties.draggable && $.type(component.id) === STRING && component.id.length ? component.id : '';
                };
                return template($.extend(component, { ns: kendo.ns }));
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
                // Assuming we can get the natural size of the image, we shall keep proportions
                var naturalHeight = content[0].naturalHeight;
                var naturalWidth = content[0].naturalWidth;
                if (naturalHeight && naturalWidth) {
                    var height = component.get('height');
                    var width = component.get('width');
                    var rectLimitedByHeight = {
                        height: Math.round(height),
                        width: Math.round(height * naturalWidth / naturalHeight)
                    };
                    /*
                     // Note: comparing rectLimitedByHeight and rectLimitedByWidth does not work because
                     // we are using the component size and not the mouse position
                     // therefore, we can only reduce the size proportionnaly, not increase it
                     var rectLimitedByWidth = {
                     height: Math.round(width * naturalHeight / naturalWidth),
                     width: Math.round(width)
                     };
                     // if (rectLimitedByHeight.height * rectLimitedByHeight.width <= rectLimitedByWidth.height * rectLimitedByWidth.width) {
                     if (rectLimitedByHeight.width <= width) {
                     */
                    if (height !== rectLimitedByHeight.height) { // avoids a stack overflow
                        component.set('height', rectLimitedByHeight.height);
                    }
                    if (width !== rectLimitedByHeight.width) { // avoids a stack overflow
                        component.set('width', rectLimitedByHeight.width);
                    }
                    /*
                     } else if(rectLimitedByWidth.height <= height) {
                     if (height !== rectLimitedByWidth.height) {
                     component.set('height', rectLimitedByWidth.height);
                     }
                     if (width !== rectLimitedByWidth.width) {
                     component.set('width', rectLimitedByWidth.width);
                     }
                     }
                     */
                }
                // Set content size
                content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                /* jshint maxcomplexity: 8 */
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.alt === i18n.image.attributes.alt.defaultValue) || !RX_TEXT.test(component.attributes.alt)) {
                        ret.push({
                            type: WARNING,
                            index: pageIdx,
                            message: kendo.format(messages.invalidAltText, description, pageIdx + 1)
                        });
                    }
                    if ((component.attributes.src === i18n.image.attributes.src.defaultValue) || !RX_IMAGE.test(component.attributes.src)) {
                        ret.push({
                            type: (component.attributes.src === i18n.image.attributes.src.defaultValue) ? WARNING : ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidImageFile, description, pageIdx + 1)
                        });
                    }
                    if (component.attributes.style && !RX_STYLE.test(component.attributes.style)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

            /* jshint +W074 */

        });
        tools.register(Image);

        /**
         * @class Label tool
         * @type {void|*}
         */
        var Label = Tool.extend({
            id: 'label',
            icon: 'font',
            description: i18n.label.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div style="#: attributes.style #" data-#= ns #id="#: properties.id$() #" data-#= ns #draggable="#: properties.draggable #" data-#= ns #drop-value="#: properties.dropValue #">#= (kendo.htmlEncode(attributes.text) || "").replace(/\\n/g, "<br/>") #</div>'
            },
            height: 80,
            width: 300,
            attributes: {
                // text: new adapters.StringAdapter({ title: i18n.label.attributes.text.title, defaultValue: i18n.label.attributes.text.defaultValue }),
                text: new adapters.TextAdapter(
                    { title:i18n.label.attributes.text.title, defaultValue: i18n.label.attributes.text.defaultValue },
                    { rows: 2, style: 'resize:vertical; width: 100%;' }
                ),
                style: new adapters.StyleAdapter({ title: i18n.label.attributes.style.title, defaultValue: 'font-size: 60px;' })
            },
            properties: {
                draggable: new adapters.BooleanAdapter({ title: i18n.label.properties.draggable.title, defaultValue: false }),
                dropValue: new adapters.StringAdapter({ title: i18n.label.properties.dropValue.title })
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
                assert.instanceof(Label, that, kendo.format(assert.messages.instanceof.default, 'this', 'Label'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                var template = kendo.template(that.templates.default);
                // The id$ function returns the component id for draggable components
                component.properties.id$ = function () {
                    return component.properties.draggable && $.type(component.id) === STRING && component.id.length ? component.id : '';
                };
                return template($.extend(component, { ns: kendo.ns }));
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
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
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
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.text === i18n.label.attributes.text.defaultValue) || !RX_TEXT.test(component.attributes.text)) {
                        ret.push({
                            type: WARNING,
                            index: pageIdx,
                            message: kendo.format(messages.invalidText, description, pageIdx + 1)
                        });
                    }
                    if (component.attributes.style && !RX_STYLE.test(component.attributes.style)) {
                        // TODO: test small font-size incompatible with mobile devices
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(Label);

        /**
         * @class MathExpression tool
         * @type {void|*}
         */
        var MathExpression = Tool.extend({
            id: 'mathexpression',
            icon: 'formula',
            description: i18n.mathexpression.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-#= ns #role="mathexpression" style="#: attributes.style #" data-#= ns #id="#: properties.id$() #" data-#= ns #draggable="#: properties.draggable #" data-#= ns #drop-value="#: properties.dropValue #" data-#= ns #inline="#: attributes.inline #" data-#= ns #value="#: attributes.formula #" ></div>'
            },
            height: 180,
            width: 370,
            attributes: {
                formula: new adapters.TextAdapter(
                    { title: i18n.mathexpression.attributes.formula.title, defaultValue: i18n.mathexpression.attributes.formula.defaultValue },
                    { rows: 4, style: 'resize:vertical; width: 100%;' }
                ),
                inline: new adapters.BooleanAdapter (
                    { title: i18n.mathexpression.attributes.inline.title, defaultValue: i18n.mathexpression.attributes.inline.defaultValue }
                ),
                style: new adapters.StyleAdapter({ title: i18n.mathexpression.attributes.style.title, defaultValue: 'font-size: 50px;' })
            },
            properties: {
                draggable: new adapters.BooleanAdapter({ title: i18n.image.properties.draggable.title, defaultValue: false }),
                dropValue: new adapters.StringAdapter({ title: i18n.image.properties.dropValue.title })
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
                assert.instanceof(MathExpression, that, kendo.format(assert.messages.instanceof.default, 'this', 'MathExpression'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                var template = kendo.template(that.templates.default);
                // The id$ function returns the component id for draggable components
                component.properties.id$ = function () {
                    return component.properties.draggable && $.type(component.id) === STRING && component.id.length ? component.id : '';
                };
                return template($.extend(component, { ns: kendo.ns }));
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
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.formula === i18n.mathexpression.attributes.formula.defaultValue) || !RX_FORMULA.test(component.attributes.formula)) {
                        // TODO: improve RX_FORMULA
                        ret.push({
                            type: WARNING,
                            index: pageIdx,
                            message: kendo.format(messages.invalidFormula, description, pageIdx + 1)
                        });
                    }
                    if (component.attributes.style && !RX_STYLE.test(component.attributes.style)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(MathExpression);

        var QUIZ = '<div data-#= ns #role="quiz" data-#= ns #mode="#: attributes.mode #" {0} data-#= ns #source="#: JSON.stringify(attributes.data.trim().split(\'\\n\')) #" style="#: attributes.groupStyle #" data-#= ns #item-style="#: attributes.itemStyle #" data-#= ns #selected-style="#: attributes.selectedStyle #"></div>';
        /**
         * Quiz tool
         * @class Quiz
         * @type {void|*}
         */
        var Quiz = Tool.extend({
            id: 'quiz',
            icon: 'radio_button_group',
            description: i18n.quiz.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(QUIZ, 'data-#= ns #enable="false"'),
                play: kendo.format(QUIZ, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(QUIZ, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 200,
            width: 350,
            attributes: {
                mode: new adapters.EnumAdapter(
                    { title: i18n.quiz.attributes.mode.title, defaultValue: 'button', enum: ['button', 'dropdown', 'radio'] },
                    { style: 'width: 100%;' }
                ),
                groupStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.groupStyle.title, defaultValue: 'font-size: 60px;' }),
                itemStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.itemStyle.title }),
                selectedStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.selectedStyle.title }),
                data: new adapters.TextAdapter(
                    { title: i18n.quiz.attributes.data.title, defaultValue: i18n.quiz.attributes.data.defaultValue },
                    { rows: 4, style: 'resize:vertical; width: 100%;' }
                )
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.quiz.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.quiz.properties.description.title }),
                solution: new adapters.QuizAdapter({ title: i18n.quiz.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.quiz.properties.validation.title }),
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
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                /*
                 // Auto-resize algorithm is not great so let's wait until we find a better solution
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
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /* jshint +W074 */

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.groupStyle && !RX_STYLE.test(component.attributes.groupStyle)) ||
                        (component.attributes.itemStyle && !RX_STYLE.test(component.attributes.itemStyle)) ||
                        (component.attributes.selectedStyle && !RX_STYLE.test(component.attributes.selectedStyle))) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                    if (!RX_DATA.test(component.attributes.data)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidData, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(Quiz);

        /**
         * @class Static table tool
         * @type {void|*}
         */
        var Table = Tool.extend({
            id: 'table',
            icon: 'table',
            description: i18n.table.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-#= ns #role="table" style="#: attributes.style #" data-#= ns #columns="#: attributes.columns #" data-#= ns #rows="#: attributes.rows #" data-#= ns #value="#: JSON.stringify(attributes.data) #"></div>'
            },
            height: 350,
            width: 600,
            attributes: {
                columns: new adapters.NumberAdapter({ title: i18n.table.attributes.columns.title, defaultValue: 4 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
                rows: new adapters.NumberAdapter({ title: i18n.table.attributes.rows.title, defaultValue: 6 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
                data: new adapters.TableAdapter({ title: i18n.table.attributes.data.title, defaultValue: { sheets: [{ rows: [{ index:0, cells: [{ index:0, value: 'Table', fontSize: 48 }] }] }] } })
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
                var content = stageElement.children(kendo.roleSelector('table'));
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(Table);

        var TEXTAREA = '<textarea id="#: properties.name #" class="k-textbox" style="#: attributes.style #" {0}></textarea>';
        /**
         * @class Textarea tool
         * @type {void|*}
         */
        var Textarea = Tool.extend({
            id: 'textarea',
            icon: 'document_orientation_landscape',
            description: i18n.textarea.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 2,
            templates: {
                design: kendo.format(TEXTAREA, ''),
                play: kendo.format(TEXTAREA, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(TEXTAREA, 'data-#= ns #bind="value: #: properties.name #.value"') + Tool.fn.showResult()
            },
            height: 300,
            width: 500,
            attributes: {
                style: new adapters.StyleAdapter({ title: i18n.textarea.attributes.style.title, defaultValue: 'font-size:40px; resize:none;' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.textarea.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.textarea.properties.description.title }),
                solution: new adapters.TextAdapter({ title: i18n.textarea.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.textarea.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.textarea.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.textarea.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.textarea.properties.omit.title, defaultValue: 0 })
            },

            /**
             * onEnable event handler
             * @class Textarea
             * @method onEnable
             * @param e
             * @param component
             * @param enabled
             */
            onEnable: function (e, component, enabled) {
                var stageElement = $(e.currentTarget);
                if (stageElement.is(ELEMENT_CLASS) && component instanceof PageComponent) {
                    stageElement.children('textarea')
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
                var content = stageElement.children('textarea');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(Textarea);

        // Masks cannot be properly set via data attributes. An error is raised when masks only contain digits. See the workaround in onResize for more information
        var TEXTBOX = '<input type="text" id="#: properties.name #" data-#= ns #role="maskedtextbox" data-#= ns #prompt-char="\u25CA" style="#: attributes.style #" {0}>';
        /**
         * @class Textbox tool
         * @type {void|*}
         */
        var Textbox = Tool.extend({
            id: 'textbox',
            icon: 'text_field',
            description: i18n.textbox.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(TEXTBOX, ''),
                play: kendo.format(TEXTBOX, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(TEXTBOX, 'data-#= ns #bind="value: #: properties.name #.value"') + Tool.fn.showResult()
            },
            height: 80,
            width: 300,
            attributes: {
                mask: new adapters.StringAdapter({ title: i18n.textbox.attributes.mask.title }),
                style: new adapters.StyleAdapter({ title: i18n.textbox.attributes.style.title })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.textbox.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.textbox.properties.description.title }),
                solution: new adapters.StringAdapter({ title: i18n.textbox.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.textbox.properties.validation.title }),
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
                    content.outerWidth(component.get('width')  - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                    if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
                        content.css('font-size', Math.floor(0.65 * content.height()));
                    }
                }
                // This is a trick because of http://docs.telerik.com/kendo-ui/framework/mvvm/overview#important-notes
                // In other words it is impossible to set a mask that only contains digits declaratively (data-mask attribute)
                // See also http://docs.telerik.com/kendo-ui/api/javascript/ui/maskedtextbox#configuration-mask
                var maskedTextBoxWidget = content.data('kendoMaskedTextBox');
                if (kendo.ui.MaskedTextBox && maskedTextBoxWidget instanceof kendo.ui.MaskedTextBox &&
                    maskedTextBoxWidget.options.mask !== component.attributes.mask) {
                    maskedTextBoxWidget.setOptions({ mask: component.attributes.mask });
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    // Note: we are allowing any mask
                    if ((component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
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
            description: i18n.video.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-#= ns #role="mediaplayer" data-#= ns #mode="video" data-#= ns #autoplay="#: attributes.autoplay #" data-#= ns #files="#: attributes.files$() #" data-#= ns #toolbar-height="#: attributes.toolbarHeight #"></div>'
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
                assert.instanceof(ToolAssets, assets.video, kendo.format(assert.messages.instanceof.default, 'assets.video', 'kidoju.ToolAssets'));
                var template = kendo.template(this.templates.default);

                /* This function's cyclomatic complexity is too high. */
                /* jshint -W074 */

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

                /* jshint +W074 */

                return template($.extend(component, { ns: kendo.ns }));
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
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.get('width')  - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                var widget = content.data('kendoMediaPlayer');
                if (kendo.ui.MediaPlayer && widget instanceof kendo.ui.MediaPlayer) {
                    widget.resize();
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if (!RX_VIDEO.test(component.attributes.mp4)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidVideoFile, description, pageIdx + 1)
                        });
                    }
                    // Note: we are not testing for an ogv or wbem file
                }
                return ret;
            }

        });
        tools.register(Video);

        /**
         * We could also consider
         * HTML from Markdown (lists, tec)
         * Drawing surface
         * Shape
         * Clock
         * Text-to-Speech
         * Geogebra
         * Spreadsheet
         */

    }(window.jQuery));

    /* jshint +W071 */

    return window.kidoju;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
