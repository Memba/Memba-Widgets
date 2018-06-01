/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
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
        './common/window.assert.es6',
        './common/window.logger.es6',
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

    var kidoju = window.kidoju = window.kidoju || {};

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var Model = kidoju.data.Model;
        var ObservableArray = kendo.data.ObservableArray;
        var PageComponent = kidoju.data.PageComponent;
        var Page = kidoju.data.Page;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.tools');
        var OBJECT = 'object';
        var STRING = 'string';
        var NUMBER = 'number';
        var BOOLEAN = 'boolean';
        var DATE = 'date';
        var ERROR = 'error';
        var WARNING = 'warning';
        var CLICK = 'click';
        var CHANGE = 'change';
        var CURSOR_DEFAULT = 'default';
        var CURSOR_CROSSHAIR = 'crosshair';
        var REGISTER = 'register';
        var ACTIVE = 'active';
        var POINTER = 'pointer';
        var ELEMENT_SELECTOR = '.kj-element';
        var DIALOG_DIV = '<div {0}"></div>';
        var DIALOG_SELECTOR = '.kj-tools-dialog';
        var INTERACTIVE_CLASS = 'kj-interactive';
        var NO_PADDING_CLASS = 'kj-no-padding';
        var STATE_DISABLED = 'k-state-disabled';
        var RX_HTTP_S = /^https?:\/\//;
        var RX_FONT_SIZE = /font(-size)?:[^;]*[0-9]+px/;
        var RX_AUDIO = /^(cdn|data):\/\/[\s\S]+.mp3$/i;
        var RX_COLOR = /^#[0-9a-f]{6}$/i;
        var RX_DATA = /\S+/i;
        var RX_DESCRIPTION = /\S+/i; // question
        var RX_CONSTANT = /\S+/i;
        var RX_FORMULA = /\S+/i; // Math expression
        var RX_IMAGE = /^(cdn|data):\/\/[\s\S]+.(gif|jpe?g|png|svg)$/i;
        var RX_NAME = /val_[0-9a-f]{6}/;
        var RX_STYLE = /^(([\w-]+)\s*:([^;<>]+);\s*)+$/i;
        var RX_SOLUTION = /\S+/i;
        var RX_TEXT = /\S+/i;
        var RX_VALIDATION_LIBRARY = /^\/\/ ([^\s\[\n]+)( (\[[^\n]+\]))?$/;
        var RX_VALIDATION_CUSTOM = /^function[\s]+validate[\s]*\([\s]*value[\s]*,[\s]*solution[\s]*(,[\s]*all[\s]*)?\)[\s]*\{[\s\S]*\}$/;
        var RX_VIDEO = /^(cdn|data):\/\/[\s\S]+.mp4$/i;
        var VALIDATION_CUSTOM = 'function validate(value, solution, all) {\n\t{0}\n}';
        var LIB_COMMENT = '// ';
        var CUSTOM = {
            name: 'custom',
            formula: kendo.format(VALIDATION_CUSTOM, '// Your code should return true when value is validated against solution.')
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
                invalidConstant: 'A(n) {0} on page {1} requires a constant in test logic.',
                invalidFailure: 'A(n) {0} named `{1}` on page {2} has a failure score higher than the omit score or zero in test logic.',
                invalidFormula: 'A(n) {0} on page {1} requires a formula in display attributes.',
                invalidImageFile: 'A(n) {0} on page {1} requires an image file in display attributes.',
                invalidName: 'A(n) {0} named `{1}` on page {2} has an invalid name.',
                invalidShape: 'A(n) {0} named `{1}` on page {2} requires a shape in display attributes.',
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
                    question: { title: 'Question' },
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

            connector: {
                description: 'Connector',
                attributes: {
                    color: { title: 'Color' }
                },
                properties: {
                    name: { title: 'Name' },
                    question: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' },
                    disabled: { title: 'Disabled' }
                }
            },

            dropzone: {
                description: 'Drop Zone',
                attributes: {
                    center: { title: 'Centre', defaultValue: false },
                    empty: { title: 'Empty' },
                    style: { title: 'Style' },
                    text: { title: 'Text', defaultValue: 'Please drop here.' }
                },
                properties: {
                    name: { title: 'Name' },
                    question: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' },
                    disabled: { title: 'Disabled' }
                }
            },

            highlighter: {
                description: 'Highlighter',
                attributes: {
                    highlightStyle: { title: 'Highlight' },
                    split: { title: 'Split' },
                    style: { title: 'Style' },
                    text: { title: 'Text', defaultValue: 'Some text you can highlight.' }
                },
                properties: {
                    name: { title: 'Name' },
                    question: { title: 'Question' },
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
                    behavior: { title: 'Behaviour' },
                    constant: { title: 'Constant' }
                }
            },

            imageset: {
                description: 'Image Set',
                attributes: {
                    style: { title: 'Style' },
                    data: { title: 'Images', defaultValue: [{ text: 'Image set', image: 'cdn://images/o_collection/svg/office/photos.svg' }] }
                },
                properties: {
                    name: { title: 'Name' },
                    question: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            label: {
                description: 'Label',
                attributes: {
                    style: { title: 'Style' },
                    text: { title: 'Text', defaultValue: 'Label' }
                },
                properties: {
                    behavior: { title: 'Behaviour' },
                    constant: { title: 'Constant' }
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
                    behavior: { title: 'Behaviour' },
                    constant: { title: 'Constant' }
                }
            },

            mathinput: {
                description: 'Mathematic Input',
                attributes: {
                    // formula: { title: 'Formula', defaultValue: '' },
                    backspace: { title: 'Backspace' },
                    field: { title: 'Field' },
                    keypad: { title: 'Keypad' },
                    basic: { title: 'Basic' },
                    greek: { title: 'Greek' },
                    operators: { title: 'Operators' },
                    expressions: { title: 'Functions' },
                    sets: { title: 'Sets' },
                    matrices: { title: 'Matrices' },
                    statistics: { title: 'Statistics' },
                    style: { title: 'Style' }
                },
                properties: {
                    name: { title: 'Name' },
                    question: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            multiquiz: {
                description: 'MultiQuiz',
                attributes: {
                    data: { title: 'Values', defaultValue: [{ text: 'Option 1', image: 'cdn://images/o_collection/svg/office/hand_count_one.svg' }, { text: 'Option 2', image: 'cdn://images/o_collection/svg/office/hand_point_up.svg' }] },
                    groupStyle: { title: 'Group Style' },
                    itemStyle: { title: 'Item Style' },
                    mode: { title: 'Mode' },
                    selectedStyle: { title: 'Select. Style' },
                    shuffle: { title: 'Shuffle' }
                },
                properties: {
                    name: { title: 'Name' },
                    question: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            quiz: {
                description: 'Quiz',
                attributes: {
                    data: { title: 'Values', defaultValue: [{ text: 'True', image: 'cdn://images/o_collection/svg/office/ok.svg' }, { text: 'False', image: 'cdn://images/o_collection/svg/office/error.svg' }] },
                    groupStyle: { title: 'Group Style' },
                    itemStyle: { title: 'Item Style' },
                    mode: { title: 'Mode' },
                    selectedStyle: { title: 'Select. Style' },
                    shuffle: { title: 'Shuffle' }
                },
                properties: {
                    name: { title: 'Name' },
                    question: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            selector: {
                description: 'Selector',
                attributes: {
                    color: { title: 'Color' },
                    empty: { title: 'Empty' },
                    hitRadius: { title: 'Hit Radius' },
                    shape: { title: 'Shape' },
                    strokeWidth: { title: 'Stroke' }
                },
                properties: {
                    name: { title: 'Name' },
                    question: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' },
                    disabled: { title: 'Disabled' }
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
                    question: { title: 'Question' },
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
                    question: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            textgaps: {
                description: 'Text gaps',
                attributes: {
                    inputStyle: { title: 'Input Style' },
                    style: { title: 'Style' },
                    text: { title: 'Text', defaultValue: 'Some text with gaps like [] or [] to fill.' }
                },
                properties: {
                    name: { title: 'Name' },
                    question: { title: 'Question' },
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
                assert.isArray(collections, assert.format(assert.messages.isArray.default, 'options.collections'));
                assert.isArray(extensions, assert.format(assert.messages.isArray.default, 'options.extensions'));
                assert.type(OBJECT, schemes, assert.format(assert.messages.type.default, 'options.schemes', OBJECT));
                this.collections = collections;
                this.extensions = extensions;
                this.schemes = schemes;
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
                assert.type(OBJECT, Class.prototype, assert.format(assert.messages.type.default, 'Class.prototype', OBJECT));
                var obj = new Class();
                assert.instanceof(Tool, obj, assert.format(assert.messages.instanceof.default, 'obj', 'kidoju.Tool'));
                assert.type(STRING, obj.id, assert.format(assert.messages.type.default, 'obj.id', STRING));
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
                    invalidConstant: i18n.messages.invalidConstant,
                    invalidFailure: i18n.messages.invalidFailure,
                    invalidFormula: i18n.messages.invalidFormula,
                    invalidImageFile: i18n.messages.invalidImageFile,
                    invalidName: i18n.messages.invalidName,
                    invalidShape: i18n.messages.invalidShape,
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
                    this.properties.validation.defaultValue = LIB_COMMENT + this.properties.solution.libraryDefault;
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
                    if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
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
                var data = {};
                data[kendo.attr('decimals')] = 0;
                data[kendo.attr('format')] = 'n0';
                // Add top, left, height, width, rotation
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.top.title }, data).getRow('top'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.left.title }, data).getRow('left'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.height.title }, data).getRow('height'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.width.title }, data).getRow('width'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.rotate.title }, data).getRow('rotate'));

                // Add other attributes
                for (var attr in this.attributes) {
                    if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
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
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
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
                return '<div class=".kj-element-result" data-#= ns #bind="visible: #: properties.name #">' +
                    '<div data-#= ns #bind="visible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + Tool.fn.svg.success + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>' +
                    '<div data-#= ns #bind="invisible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + Tool.fn.svg.failure + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>' +
                    '</div>';
            },

            /**
             * Improved display of value in score grid
             * Note: search for getScoreArray in kidoju.data
             * @param testItem
             */
            value$: function (testItem) {
                return kendo.htmlEncode(testItem.value || '');
            },

            /**
             * Improved display of solution in score grid
             * Note: search for getScoreArray in kidoju.data
             * @param testItem
             */
            solution$: function (testItem) {
                return kendo.htmlEncode(testItem.solution || '');
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
                /* jshint maxcomplexity: 14 */
                assert.instanceof (PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.type(NUMBER, pageIdx, assert.format(assert.messages.type.default, 'pageIdx', NUMBER));
                var ret = [];
                if (component.properties && !component.properties.disabled) {
                    var properties = component.properties;
                    var messages = this.i18n.messages;
                    var description = this.description; // tool description
                    if ($.type(properties.behavior) === STRING && properties.behavior !== 'none') {
                        // Note: This test might be better suited to inherited tools (labels, images and math expressions)
                        if (!RX_CONSTANT.test(properties.constant)) {
                            ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidConstant, description, /*name,*/ pageIdx + 1) });
                        }
                    } else if ($.type(component.properties.name) === STRING) {
                        var name = properties.name;
                        if (!RX_NAME.test(name)) {
                            ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidName, description, name, pageIdx + 1) });
                        }
                        if (!properties.question || !RX_DESCRIPTION.test(properties.question)) {
                            ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidDescription, description, name, pageIdx + 1) });
                        }
                        if (!properties.solution || !RX_SOLUTION.test(properties.solution)) { // What if properties.solution is a number or a date?
                            ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidSolution, description, name, pageIdx + 1) });
                        }
                        if (!RX_VALIDATION_LIBRARY.test(properties.validation) && !RX_VALIDATION_CUSTOM.test(properties.validation)) {
                            ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidValidation, description, name, pageIdx + 1) });
                        }
                        if ($.type(properties.failure) === NUMBER && $.type(properties.omit) === NUMBER && properties.failure > Math.min(properties.omit, 0)) {
                            ret.push({ type: WARNING, index: pageIdx, message: kendo.format(messages.invalidFailure, description, name, pageIdx + 1) });
                        }
                        if ($.type(properties.success) === NUMBER && $.type(properties.omit) === NUMBER && properties.success < Math.max(properties.omit, 0)) {
                            ret.push({ type: WARNING, index: pageIdx, message: kendo.format(messages.invalidSuccess, description, name, pageIdx + 1) });
                        }
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
                    field.editable = this.editable;
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
                    var binding = {};
                    binding[kendo.attr('bind')] = 'value: ' + settings.field;
                    // We need a wrapper because container has { display: table-cell; }
                    var wrapper = $('<div/>')
                        .css({ display: 'flex' })
                        .appendTo(container);
                    var input = $('<input/>')
                        .addClass('k-textbox')
                        .css({
                            flex: 'auto',
                            width: '100%' // 'auto' seems to imply a min-width
                        })
                        .prop({ readonly: true })
                        .attr($.extend({}, settings.attributes, binding))
                        .appendTo(wrapper);
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({
                            flex: 'none',
                            marginRight: 0
                        })
                        .appendTo(wrapper)
                        .on(CLICK, $.proxy(that.showDialog, that, settings));
                };
            },
            showDialog: function (options/*, e*/) {
                assert.instanceof(PageComponent, options.model, assert.format(assert.messages.instanceof.default, 'options.model', 'kidoju.data.PageComponent'));
                assert.instanceof(ToolAssets, assets[options.model.tool], assert.format(assert.messages.instanceof.default, 'assets[options.model.tool]', 'kidoju.ToolAssets'));
                // TODO wrap in import('./dialogs/kidoju.dialogs.assetmanager.es6').then(function () {...});
                kidoju.dialogs.openAssetManager({
                    title: options.title,
                    data: {
                        value: options.model.get(options.field)
                    },
                    assets: assets[options.model.tool]
                })
                    .done(function (result) {
                        if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action) {
                            options.model.set(options.field, result.data.value);
                        }
                    })
                    .fail(function (err) {
                        // TODO
                    });
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
                    formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).toLowerCase() === String(solution).toLowerCase();')
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
                var model = options.model;
                // Build data (resize array especially after changing rows and columns)
                var columns = model.get('attributes.columns');
                var rows = model.get('attributes.rows');
                var whitelist = model.get('attributes.whitelist');
                var layout = model.get('attributes.layout');
                var data = model.get(options.field);
                var value = kendo.ui.CharGrid._getCharGridArray(rows, columns, whitelist, layout, data);
                // TODO wrap in import('./dialogs/kidoju.dialogs.chargrid.es6').then(function () {...});
                kidoju.dialogs.openCharGrid({
                    title: options.title,
                    message: options.field === 'properties.solution' ?
                        kendo.format(this.messages.solution, model.get('attributes.whitelist')) :
                        kendo.format(this.messages.layout, model.get('attributes.blank')),
                    charGrid: {
                        container: '.kj-dialog',
                        scaler: '.kj-dialog',
                        height: model.get('height'),
                        width: model.get('width'),
                        columns: columns,
                        rows: rows,
                        blank: model.get('attributes.blank'),
                        locked: options.field === 'properties.solution' ?
                            layout :
                            [],// Do not lock when designing layout, but lock when designing solution
                        whitelist: options.field === 'properties.solution' ?
                            model.get('attributes.whitelist') :
                            '\\S',// Do not whitelist when designing layout, but whitelist when designing solution
                        blankFill: model.get('attributes.blankFill'),
                        gridFill: model.get('attributes.gridFill'),
                        gridStroke: model.get('attributes.gridStroke'),
                        lockedFill: model.get('attributes.lockedFill'),
                        lockedColor: model.get('attributes.lockedColor'),
                        selectedFill: model.get('attributes.selectedFill'),
                        valueColor: model.get('attributes.valueColor')
                    },
                    data: {
                        value: value
                    }
                })
                    .done(function (result) {
                        if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action
                            // $.type(result.data.url) === STRING
                        ) {
                            options.model.set(options.field, result.data.value);
                        }
                    })
                    .fail(function (err) {
                        // TODO
                    });
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return value && typeof value.equals === "function" && value.equals(solution);')
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
                var model = options.model;
                var columns = model.get('attributes.categories') + 1;
                var rows = model.get('attributes.values') + 1;
                var data = util.resizeSpreadsheetData(model.get('attributes.data'), rows, columns);
                // TODO wrap in import('./dialogs/kidoju.dialogs.spreadsheet.es6').then(function () {...});
                kidoju.dialogs.openSpreadsheet({
                    title: options.title,
                    data: Object.assign(data, {
                        columns: columns,
                        rows: rows,
                        sheetsbar: false,
                        toolbar: false
                    })
                })
                    .done(function (result) {
                        if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action) {
                            // TODO test result.data???
                            options.model.set(options.field, result.data);
                        }
                    })
                    .fail(function (err) {
                        // TODO
                    });

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
                    formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')
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
                this.editor = function (container, settings) {
                    var binding = {};
                    binding[kendo.attr('bind')] = 'value: ' + settings.field;
                    var input = $('<input/>')
                        .css({ width: '100%' })
                        .attr($.extend({}, settings.attributes, binding))
                        .appendTo(container);
                    input.kendoComboBox({
                        autoWidth: true,
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
                            assert.instanceof (PageComponent, settings.model, assert.format(assert.messages.instanceof.default, 'settings.model', 'kidoju.data.PageModel'));
                            if (settings.model.parent() instanceof kendo.Observable && settings.model.parent().selectedPage instanceof Page) {
                                var components = settings.model.parent().selectedPage.components;
                                $.each(components.data(), function (index, component) {
                                    if (component.tool === 'connector' && component.uid !== uid) {
                                        var solution = component.get(settings.field);
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
                    formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')
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
                    formula: kendo.format(VALIDATION_CUSTOM, 'return new Date(value) - new Date(solution) === 0;')
                }
            ],
            libraryDefault: 'equal'
        });

        var ATTR_CONTAIN_SELECTOR = '[{0}*="{1}"]';
        /**
         * Disabled adapter
         */
        adapters.DisabledAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = BOOLEAN;
                this.defaultValue = this.defaultValue || (this.nullable ? null : false);
                // this.editor = 'input';
                // this.attributes = $.extend({}, this.attributes, attributes);
                // this.attributes[kendo.attr('role')] = 'switch';
                this.editor = function (container, settings) {
                    var binding = {};
                    binding[kendo.attr('bind')] = 'value: ' + settings.field;
                    var input = $('<div/>')
                        .attr(binding)
                        .appendTo(container);
                    var switchWidget = input.kendoMobileSwitch({
                        change: function (e) {
                            var tbody = e.sender.element.closest('tbody');
                            // Question
                            var questionWidget = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.question')).data('kendoComboBox');
                            if (questionWidget instanceof kendo.ui.ComboBox) {
                                questionWidget.enable(!e.checked);
                            }
                            // Solution - Note: cannot predict what solutionWidget is
                            /*
                            var solutionElement = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.solution'));
                            var solutionWidget = kendo.widgetInstance(solutionElement);
                            if ($.isFunction(solutionWidget.enable)) {
                                 solutionWidget.enable(!e.checked);
                            }
                            */
                            // Validation
                            var validationWidget = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.validation')).data('kendoCodeInput');
                            if (validationWidget instanceof kendo.ui.CodeInput) {
                                validationWidget.enable(!e.checked);
                                validationWidget.element
                                    .closest('td[role="gridcell"]')
                                    .find('button.k-button')
                                    .prop('disabled', e.checked)
                                    .toggleClass(STATE_DISABLED, e.checked);
                            }
                            // Success
                            var successWidget = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.success')).data('kendoNumericTextBox');
                            if (successWidget instanceof kendo.ui.NumericTextBox) {
                                successWidget.enable(!e.checked);
                            }
                            // Failure
                            var failureWidget = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.failure')).data('kendoNumericTextBox');
                            if (failureWidget instanceof kendo.ui.NumericTextBox) {
                                failureWidget.enable(!e.checked);
                            }
                            // Omit
                            var omitWidget = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.omit')).data('kendoNumericTextBox');
                            if (omitWidget instanceof kendo.ui.NumericTextBox) {
                                omitWidget.enable(!e.checked);
                            }
                        }
                    }).data('kendoMobileSwitch');
                    setTimeout(function () {
                        // Note: switchWidget.check() before data bindings so we need to yield some time
                        switchWidget.trigger(CHANGE, { checked: switchWidget.check() });
                    }, 0);
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
         * HighLighter adapter
         */
        adapters.HighLighterAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                var that = this;
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                // TODO: Not Disabled when setting teh Disabled switch
                // And not reset when changing teh value of split => might require a window like chargrid
                this.editor = function (container, settings) {
                    var binding = {};
                    binding[kendo.attr('bind')] = 'value: ' + settings.field;
                    var highLighter = $('<div/>')
                        .css({
                            width: '100%',
                            fontSize: '1em',
                            minHeight: '4.6em'
                        })
                        .attr($.extend(binding, attributes))
                        .appendTo(container);
                    var highLighterWidget = highLighter.kendoHighLighter({
                        text: settings.model.get('attributes.text'),
                        split: settings.model.get('attributes.split')
                    });
                };
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Image List Adapter (combines image and text)
         */
        adapters.ImageListBuilderAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
                that.type = undefined;
                that.defaultValue = that.defaultValue || [];
                // that.editor is the list editor where the insert image button triggers this.showDialog
                that.editor = function (container, settings) {
                    var binding = {};
                    binding[kendo.attr('bind')] = 'source: ' + settings.field;
                    var imageList = $('<div/>').attr(binding).appendTo(container);
                    var imageListWidget = imageList.kendoImageList({
                        schemes: assets.image.schemes,
                        click: $.proxy(that.showDialog, that, settings)
                    }).data('kendoImageList');
                    assert.instanceof(kendo.ui.ImageList, imageListWidget, assert.format(assert.messages.instanceof.default, 'imageListWidget', 'kendo.ui.ImageList'));
                    imageListWidget.dataSource.bind('change', function (e) {
                        // When the dataSource raises a change event on any of the quiz data items that is added, changed or removed
                        // We need to trigger a change event on the model field to ensure the stage element (which is not databound) is redrawn
                        if ($.type(e.action) === STRING) {
                            settings.model.trigger('change', { field: settings.field });
                        }
                    });
                };
            },
            showDialog: function (options, e) {
                // Note should return a promise to be used with app.notification?
                if (e.action === 'image') {
                    // TODO wrap in import('./dialogs/kidoju.dialogs.assetmanager.es6').then(function () {...});
                    kidoju.dialogs.openAssetManager({
                        title: options.title,
                        data: {
                            value: e.item.get('image')
                        },
                        assets: assets.image
                    })
                        .done(function (result) {
                            if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action) {
                                e.item.set('image', result.data.value);
                            }
                        })
                        .fail(function (err) {
                            // TODO
                        });
                }
            }
        });

        /**
         * Math input adapter
         */
        adapters.MathAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = function (container, settings) {
                    var binding = {};
                    binding[kendo.attr('bind')] = 'value: ' + settings.field;
                    var input = $('<div/>')
                        .css({
                            width: '100%',
                            fontSize: '1.25em',
                            minHeight: '4.6em'
                        })
                        .attr($.extend(binding, attributes))
                        .appendTo(container);
                    var mathInputWidget = input.kendoMathInput({
                        toolbar: {
                            // container: '',
                            resizable: true,
                            tools: [
                                // 'backspace',
                                // 'field',
                                'keypad',
                                'basic',
                                'greek',
                                'operators',
                                'expressions',
                                'sets',
                                'matrices',
                                'statistics'
                                // 'units',
                                // 'chemistry'
                            ]
                        }
                    });
                };
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')  // TODO several MathQuillMathField
                }/*,
                {
                    // TODO permutations
                    name: 'anyCommutations',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return shuntingYard(value).equals(solution);')
                }
                */
            ],
            libraryDefault: 'equal'
        });

        /**
         * MultiQuiz Solution adapter
         */
        adapters.MultiQuizSolutionAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = undefined;
                this.defaultValue = this.defaultValue || [];
                // this.editor = 'input';
                // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
                this.editor = function (container, settings) {
                    var binding = {};
                    binding[kendo.attr('bind')] = 'value: ' + settings.field;
                    var input = $('<div/>')
                        .attr(binding)
                        .appendTo(container);
                    input.kendoMultiQuiz({
                        mode: 'checkbox',
                        // checkboxTemplate: '<div class="kj-multiquiz-item kj-multiquiz-checkbox" data-' + kendo.ns + 'uid="#: data.uid #"><input id="{2}_#: data.uid #" name="{2}" type="checkbox" class="k-checkbox" value="#: data.{0} #"><label class="k-checkbox-label" for="{2}_#: data.uid #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1} #);"></span># } #<span class="k-text">#: data.{0} #</span></label></div>',
                        checkboxTemplate: '<div class="kj-multiquiz-item kj-multiquiz-checkbox" data-' + kendo.ns + 'uid="#: data.uid #"><input id="{2}_#: data.uid #" name="{2}" type="checkbox" class="k-checkbox" value="#: data.{0} #"><label class="k-checkbox-label" for="{2}_#: data.uid #"># if (data.{1}) { #<span class="k-image" style="background-image:url(#: data.{1}$() #);"></span># } #<span class="k-text">#: data.{0} #</span></label></div>',
                        dataSource: new kendo.data.DataSource({
                            data: settings.model.get('attributes.data'),
                            schema: {
                                model: kendo.data.Model.define({
                                    id: 'text',
                                    fields: {
                                        text: { type: STRING },
                                        image: { type: STRING }
                                    },
                                    image$: function () {
                                        var image = this.get('image');
                                        var schemes = assets.image.schemes;
                                        for (var scheme in schemes) {
                                            if (Object.prototype.hasOwnProperty.call(schemes, scheme) && (new RegExp('^' + scheme + '://')).test(image)) {
                                                image = image.replace(scheme + '://', schemes[scheme]);
                                                break;
                                            }
                                        }
                                        return image;
                                    }
                                })
                            }
                        })
                    });
                };
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(VALIDATION_CUSTOM, '// Note: both value and solution are arrays of strings\n\t' +
                        'return String(value.sort()) === String(solution.sort());')
                }
            ],
            libraryDefault: 'equal'
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
                this.attributes = $.extend({}, this.attributes, attributes, { type: 'text', class: 'k-textbox k-state-disabled',  disabled: true });
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
                    formula: kendo.format(VALIDATION_CUSTOM, 'return Number(value) === Number(solution);')
                },
                {
                    name: 'greaterThan',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return Number(value) > Number(solution);')
                },
                {
                    name: 'greaterThanOrEqual',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return Number(value) >= Number(solution);')
                },
                {
                    name: 'lowerThan',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return Number(value) < Number(solution);')
                },
                {
                    name: 'lowerThanOrEqual',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return Number(value) <= Number(solution);')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Question Adapter
         */
        adapters.QuestionAdapter = BaseAdapter.extend({
            init: function (options) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                // this.editor = 'input';
                // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
                this.editor = function (container, settings) {
                    var binding = {};
                    binding[kendo.attr('bind')] = 'value: ' + settings.field;
                    var input = $('<input/>')
                        .css({ width: '100%' })
                        .attr($.extend({}, settings.attributes, binding))
                        .appendTo(container);
                    input.kendoComboBox({
                        autoWidth: true,
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

        // Important: kj-quiz-item kj-quiz-dropdown defines background-position:vover;background-position:center,display:inline-block;height:1.1em;width:1.1em;
        var QUIZSOLUTION_TMPL = '<span class="kj-quiz-item kj-quiz-dropdown"># if (data.image) { #<span class="k-image" style="background-image:url(#: data.image$() #);"></span># } #<span class="k-text">#: data.text #</span></span>';
        /**
         * Quiz Solution adapter
         */
        adapters.QuizSolutionAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                // this.editor = 'input';
                // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
                this.editor = function (container, settings) {
                    var binding = {};
                    binding[kendo.attr('bind')] = 'value: ' + settings.field;
                    var input = $('<input/>')
                        .css({ width: '100%' })
                        .attr($.extend({}, settings.attributes, binding))
                        .appendTo(container);
                    input.kendoDropDownList({
                        autoWidth: true,
                        dataSource: new kendo.data.DataSource({
                            data: settings.model.get('attributes.data'),
                            schema: {
                                model: kendo.data.Model.define({
                                    id: 'text',
                                    fields: {
                                        text: { type: STRING },
                                        image: { type: STRING }
                                    },
                                    image$: function () {
                                        var image = this.get('image');
                                        var schemes = assets.image.schemes;
                                        for (var scheme in schemes) {
                                            if (Object.prototype.hasOwnProperty.call(schemes, scheme) && (new RegExp('^' + scheme + '://')).test(image)) {
                                                image = image.replace(scheme + '://', schemes[scheme]);
                                                break;
                                            }
                                        }
                                        return image;
                                    }
                                })
                            }
                        }),
                        dataTextField: 'text',
                        dataValueField: 'text',
                        optionLabel: kendo.ui.Quiz.fn.options.messages.optionLabel,
                        template: QUIZSOLUTION_TMPL,
                        valueTemplate: QUIZSOLUTION_TMPL
                    });
                };
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')
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
                    formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')
                },
                {
                    name: 'ignoreCaseEqual',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim().toUpperCase() === String(solution).trim().toUpperCase();')
                },
                {
                    name: 'ignoreCaseMatch',
                    // Do not use RegExp constructor because escaping backslashes is a nightmare
                    formula: kendo.format(VALIDATION_CUSTOM, 'return /{0}/i.test(String(value).trim());'),
                    param: 'Regular Expression'
                },
                {
                    name: 'ignoreDiacriticsEqual',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return removeDiacritics(String(value).trim().toUpperCase()) === removeDiacritics(String(solution).trim().toUpperCase());')
                },
                {
                    name: 'match',
                    // Do not use RegExp constructor because escaping backslashes is a nightmare
                    formula: kendo.format(VALIDATION_CUSTOM, 'return /{0}/.test(String(value).trim());'),
                    param: 'Regular Expression'
                },
                {
                    name: 'metaphone',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return metaphone(removeDiacritics(String(value).trim().toUpperCase())) === metaphone(removeDiacritics(String(solution).trim().toUpperCase()));')
                },
                {
                    name: 'soundex',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return soundex(removeDiacritics(String(value).trim().toUpperCase())) === soundex(removeDiacritics(String(solution).trim().toUpperCase()));')
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
                    // formula: kendo.format(VALIDATION_CUSTOM, 'return String(value.sort()) === String(solution.trim().split("\\n").sort());')
                    // With the formula here above, each string in the array cannot be trimmed properly
                    // because String(arr) is the same as join(',') and each value might contain commas
                    // So we use }-{ because there is little chance any value would contain this sequence
                    formula: kendo.format(VALIDATION_CUSTOM, '// Note: value is an array and solution is a multiline string\n\t' +
                        'return (value || []).sort().join("}-{").trim().replace(/\\s*}-{\\s*/g, "}-{") === String(solution).trim().split("\\n").sort().join("}-{").replace(/\\s*}-{\\s*/g, "}-{");')
                },
                {
                    name: 'ignoreCaseEqual',
                    formula: kendo.format(VALIDATION_CUSTOM, '// Note: value is an array and solution is a multiline string\n\t' +
                        'return (value || []).sort().join("}-{").trim().replace(/\\s*}-{\\s*/g, "}-{").toLowerCase() === String(solution).trim().split("\\n").sort().join("}-{").replace(/\\s*}-{\\s*/g, "}-{").toLowerCase();')
                },
                {
                    name: 'sumEqual',
                    formula: kendo.format(VALIDATION_CUSTOM, '// Note: value is an array and solution is a multiline string\n\t' +
                        'var ret = 0;\t' +
                        '(value || []).forEach(function(val){ ret += parseFloat((val || "").trim() || 0); });\t' +
                        'return ret === parseFloat(String(solution).trim());')
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
                    var binding = {};
                    binding[kendo.attr('bind')] = 'value: ' + settings.field;
                    // We need a wrapper because container has { display: table-cell; }
                    var wrapper = $('<div/>')
                        .css({ display: 'flex' })
                        .appendTo(container);
                    var input = $('<input/>')
                        .addClass('k-textbox')
                        .css({
                            flex: 'auto',
                            width: '100%' // 'auto' seems to imply a min-width
                        })
                        .prop({ readonly: true })
                        .attr($.extend({}, settings.attributes, binding))
                        .appendTo(wrapper);
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({
                            flex: 'none',
                            marginRight: 0
                        })
                        .appendTo(wrapper)
                        .on(CLICK, $.proxy(that.showDialog, that, settings));
                };
            },
            showDialog: function (options/*, e*/) {
                // TODO wrap in import('./dialogs/kidoju.dialogs.styleedtor.es6').then(function () {...});
                kidoju.dialogs.openStyleEditor({
                    title: options.title,
                    data: {
                        value: options.model.get(options.field)
                    }
                })
                    .then(function (result) {
                        if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action) {
                            options.model.set(options.field, result.data.value);
                        }
                    })
                    .fail(function (err) {
                        // TODO
                    });
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
                var model = options.model;
                var columns = model.get('attributes.columns');
                var rows = model.get('attributes.rows');
                var data = util.resizeSpreadsheetData(model.get('attributes.data'), rows, columns);
                // TODO wrap in import('./dialogs/kidoju.dialogs.spreadsheet.es6').then(function () {...});
                kidoju.dialogs.openSpreadsheet({
                    title: options.title,
                    data: Object.assign({
                        columns: columns,
                        rows: rows,
                        columnWidth: 150,
                        rowHeight: 58,
                        sheets: [],
                        sheetsbar: false,
                        toolbar: {
                            // Note: merge and hide not included in v1
                            home: [
                                ['bold', 'italic', 'underline'],
                                'backgroundColor',
                                'textColor',
                                'borders',
                                'fontSize',
                                'fontFamily',
                                'alignment',
                                'textWrap',
                                ['formatDecreaseDecimal', 'formatIncreateDecimal'],
                                'format'],
                            insert: false,
                            data: false
                        }
                    }, data)
                })
                    .done(function (result) {
                        if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action) {
                            options.model.set(options.field, result.data);
                        }
                    })
                    .fail(function (err) {
                        // TODO
                    });
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
                    formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).trim() === String(solution).trim();')
                },
                {
                    name: 'ignoreSpacesEqual',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).replace(/\\s+/g, " ").trim() === String(solution).replace(/\\s+/g, " ").trim();')
                },
                {
                    name: 'ignorePunctuationEqual',
                    formula: kendo.format(VALIDATION_CUSTOM, 'return String(value).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim() === String(solution).replace(/[\\.,;:\\?!\'"\\(\\)\\s]+/g, " ").trim();')
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
                    var binding = {};
                    // Note: _library is added to the data bound PageComponent in its init method
                    binding[kendo.attr('bind')] = 'value: ' + settings.field + ', source: _library';
                    // We need a wrapper because container has { display: table-cell; }
                    var wrapper = $('<div/>')
                        .css({ display: 'flex' })
                        .appendTo(container);
                    var codeInput = $('<div ' +
                        'data-' + kendo.ns + 'role="codeinput" ' +
                        'data-' + kendo.ns + 'default="' + settings.model.properties.defaults.validation + '" />')
                        .attr($.extend({}, settings.attributes, binding))
                        .css({ flex: 'auto' })
                        .appendTo(wrapper);
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({
                            flex: 'none',
                            marginRight: 0
                        })
                        .appendTo(wrapper)
                        .on(CLICK, $.proxy(that.showDialog, that, settings));
                };
            },
            showDialog: function (options/*, e*/) {
                var that = this;
                // TODO import('./dialogs/kidoju.dialogs.codeeditor.es6').then(function () {...});
                kidoju.dialogs.openCodeEditor({
                    title: options.title,
                    data: {
                        value: options.model.get(options.field),
                        library: [CUSTOM].concat(that.library),
                        defaultValue: that.defaultValue, // ????????????????????????
                        solution: kendo.htmlEncode(JSON.stringify(options.model.get('properties.solution')))
                    }
                })
                    .then(function (result) {
                        if (result.action === kendo.ui.BaseDialog.fn.options.messages.actions.ok.action) {
                            options.model.set(options.field, result.data.value);
                        }
                    })
                    .fail(function (err) {
                        // TODO
                    });
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
                default: '<div data-#= ns #role="mediaplayer" data-#= ns #mode="audio" data-#= ns #autoplay="#: attributes.autoplay #" data-#= ns #files="#: files$() #"></div>'
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
                assert.instanceof(Audio, that, assert.format(assert.messages.instanceof.default, 'this', 'Audio'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.audio, assert.format(assert.messages.instanceof.default, 'assets.audio', 'kidoju.ToolAssets'));
                var template = kendo.template(that.templates.default);
                // The files$ function resolves urls with schemes like cdn://audio.mp3 and returns a stringified array
                component.files$ = function () {
                    var mp3 = component.attributes.get('mp3');
                    var ogg = component.attributes.get('ogg');
                    var schemes = assets.audio.schemes;
                    for (var scheme in schemes) {
                        if (Object.prototype.hasOwnProperty.call(schemes, scheme)) {
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
                    // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
                    return ' ' + JSON.stringify(files);
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
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                if (!component.attributes ||
                    !RX_AUDIO.test(component.attributes.mp3)) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidAudioFile, description, pageIdx + 1)
                    });
                }
                // Note: we are not testing for an ogg file
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
                default: '<div data-#= ns #role="chart" data-#= ns #chart-area="#: chartArea$() #" data-#= ns #series-defaults="#: seriesDefaults$() #" data-#= ns #title="#: title$() #" data-#= ns #legend="#: legend$() #" data-#= ns #series="#: series$() #" data-#= ns #category-axis="#: categoryAxis$() #" data-#= ns #value-axis="#: valueAxis$() #" style="#: attributes.style #"></div>'
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
                assert.instanceof(Chart, that, assert.format(assert.messages.instanceof.default, 'this', 'Chart'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                // The axisDefaults$ function returns an object chart's data-axis-defaults attribute binding
                // component.attributes.axisDefaults$ = function () {
                // We can't use axisDefaults, so we have categoryAxis$ and valueAxis$
                // because of https://github.com/telerik/kendo-ui-core/issues/2165
                //
                // The chartArea$ function returns an object for chart's data-chart-area attribute binding
                component.chartArea$ = function () {
                    return JSON.stringify({
                        background: background
                    });
                };
                // The legend$ function returns an object for chart's data-legend attribute binding
                component.legend$ = function () {
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
                // The categoryAxis$ function returns an object for chart's data-category-axis attribute binding
                component.categoryAxis$ = function () {
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
                // The series$ function returns an object for chart's data-series attribute binding
                component.series$ = function () {
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

                    // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
                    return ' ' + JSON.stringify(series);
                };
                // The seriesDefaults$ function returns an object for chart's data-series-defaults attribute binding
                component.seriesDefaults$ = function () {
                    return JSON.stringify(types[component.attributes.get('type')]);
                };
                // The title$ function returns an object for chart's data-title attribute binding
                component.title$ = function () {
                    var title = component.attributes.get('title');
                    return JSON.stringify({
                        text: title,
                        visible: !!(title.trim()),
                        font: font,
                        color: color
                    });
                };
                // The valueAxis$ function returns an object for chart's data-value-axis attribute binding
                component.valueAxis$ = function () {
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
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                    // TODO
                }
                return ret;
            }
            */

        });
        tools.register(Chart);

        var CHARGRID = '<div data-#= ns #role="chargrid" data-#= ns #columns="#: attributes.columns #" data-#= ns #rows="#: attributes.rows #" data-#= ns #blank="#: attributes.blank #" data-#= ns #whitelist="#: attributes.whitelist #" data-#= ns #grid-fill="#: attributes.gridFill #" data-#= ns #grid-stroke="#: attributes.gridStroke #" data-#= ns #blank-fill="#: attributes.gridStroke #" data-#= ns #selected-fill="#: attributes.selectedFill #" data-#= ns #locked-fill="#: attributes.lockedFill #" data-#= ns #locked-color="#: attributes.fontColor #" data-#= ns #value-color="#: attributes.fontColor #" {0}></div>';
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
                question: new adapters.QuestionAdapter({ title: i18n.chargrid.properties.question.title }),
                solution: new adapters.CharGridAdapter({ title: i18n.chargrid.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.chargrid.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.omit.title, defaultValue: 0 })
            },

            /**
             * Pretiffy array for results grid
             * @param arr
             * @private
             */
            _prettify: function (arr) {
                // var ret = '<table>';
                var ret = '';
                if ($.isArray(arr) || arr instanceof ObservableArray) {
                    for (var r = 0, rowTotal = arr.length; r < rowTotal; r++) {
                        var row = arr[r];
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
             * Improved display of value in score grid
             * @param testItem
             */
            value$: function (testItem) {
                return this._prettify(testItem.value);
            },

            /**
             * Improved display of solution in score grid
             * @param testItem
             */
            solution$: function (testItem) {
                return this._prettify(testItem.solution);
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div.kj-chargrid');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                // Redraw the charGrid widget
                var charGridWidget = content.data('kendoCharGrid');
                assert.instanceof(kendo.ui.CharGrid, charGridWidget, assert.format(assert.messages.instanceof.default, 'charGridWidget', 'kendo.ui.CharGrid'));
                charGridWidget.refresh();
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
                    // TODO
                }
                return ret;
             }
             */

        });
        tools.register(CharGrid);

        var CONNECTOR = '<div data-#= ns #role="connector" data-#= ns #id="#: properties.name #" data-#= ns #target-value="#: properties.solution #" data-#= ns #color="#: attributes.color #" {0}></div>';
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
                design: kendo.format(CONNECTOR, 'data-#= ns #enable="false" data-#= ns #create-surface="false"'),
                play: kendo.format(CONNECTOR, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions"'),
                review: kendo.format(CONNECTOR, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 70,
            width: 70,
            attributes: {
                color: new adapters.ColorAdapter({ title: i18n.connector.attributes.color.title, defaultValue: '#FF0000' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.connector.properties.name.title }),
                question: new adapters.QuestionAdapter({ title: i18n.connector.properties.question.title }),
                solution: new adapters.ConnectorAdapter({ title: i18n.connector.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.connector.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.connector.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.connector.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.connector.properties.omit.title, defaultValue: 0 }),
                disabled: new adapters.DisabledAdapter({ title: i18n.connector.properties.disabled.title, defaultValue: false })
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div[' + kendo.attr('role') + '="connector"]');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                // Redraw the connector widget
                var connectorWidget = content.data('kendoConnector');
                assert.instanceof(kendo.ui.Connector, connectorWidget, assert.format(assert.messages.instanceof.default, 'connectorWidget', 'kendo.ui.Connector'));
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
                if (!component.attributes ||
                    !RX_COLOR.test(component.attributes.color)) {
                    ret.push({
                        type: WARNING,
                        index: pageIdx,
                        message: kendo.format(messages.invalidColor, description, pageIdx + 1)
                    });
                }
                if (component.properties && component.properties.disabled && !RX_SOLUTION.test(component.properties.solution)) {
                    // component.properties.disabled === false is already tested in Tool.fn.validate.call(this, component, pageIdx)
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidSolution, description, component.properties.name, pageIdx + 1)
                    });
                }
                // TODO: We should also check that there is a matching connector on the page
                // TODO: Check connectors on top of static images and labels
                return ret;
            }

        });
        tools.register(Connector);

        var DROPZONE = '<div id="#: properties.name #" data-#= ns #role="dropzone" data-#= ns #center="#: attributes.center #"  data-#= ns #empty="#: attributes.empty #" style="#: attributes.style #" {0}><div>#: attributes.text #</div></div>';
        // TODO: Check whether DROPZONE requires class="kj-interactive"
        /**
         * @class DropZone tool
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
                play: kendo.format(DROPZONE, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions"'),
                review: kendo.format(DROPZONE, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 250,
            width: 250,
            attributes: {
                center: new adapters.BooleanAdapter({ title: i18n.dropzone.attributes.center.title, defaultValue: i18n.dropzone.attributes.center.defaultValue }),
                empty: new adapters.StringAdapter({ title: i18n.dropzone.attributes.empty.title }),
                text: new adapters.StringAdapter({ title: i18n.dropzone.attributes.text.title, defaultValue: i18n.dropzone.attributes.text.defaultValue }),
                style: new adapters.StyleAdapter({ title: i18n.dropzone.attributes.style.title, defaultValue: 'font-size:30px;border:dashed 3px #e1e1e1;' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.dropzone.properties.name.title }),
                question: new adapters.QuestionAdapter({ title: i18n.dropzone.properties.question.title }),
                solution: new adapters.StringArrayAdapter({ title: i18n.dropzone.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.dropzone.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.dropzone.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.dropzone.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.dropzone.properties.omit.title, defaultValue: 0 }),
                disabled: new adapters.DisabledAdapter({ title: i18n.dropzone.properties.disabled.title, defaultValue: false })
            },

            /**
             * Improved display of value in score grid
             * @param testItem
             */
            value$: function (testItem) {
                var ret = (testItem.value || []).slice();
                for (var i = 0; i < ret.length; i++) {
                    ret[i] = kendo.htmlEncode((ret[i] || '').trim());
                }
                return ret.join('<br/>');
            },

            /**
             * Improved display of solution in score grid
             * @param testItem
             */
            solution$: function (testItem) {
                var ret = (testItem.solution || '').split('\n');
                for (var i = 0; i < ret.length; i++) {
                    ret[i] = kendo.htmlEncode((ret[i] || '').trim());
                }
                return ret.join('<br/>');
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                // Note: any text is acceptable
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                return ret;
                // TODO: we should also check that there are draggable components on the page
                // TODO: Check order of draggables 'on top' of drop zone
            }

        });
        tools.register(DropZone);

        var HIGHLIGHTER = '<div class="kj-interactive" data-#= ns #role="highlighter" data-#= ns #text="#: attributes.text #" data-#= ns #split="#: attributes.split #"  data-#= ns #highlight-style="#: attributes.highlightStyle #" style="#: attributes.style #" {0}></div>';
        /**
         * @class HighLighter tool
         * @type {void|*}
         */
        var HighLighter = Tool.extend({
            id: 'highlighter',
            icon: 'marker',
            description: i18n.highlighter.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(HIGHLIGHTER, 'data-#= ns #enable="false"'),
                play: kendo.format(HIGHLIGHTER, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions"'),
                review: kendo.format(HIGHLIGHTER, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 250,
            width: 250,
            attributes: {
                highlightStyle: new adapters.StyleAdapter({ title: i18n.highlighter.attributes.highlightStyle.title }),
                style: new adapters.StyleAdapter({ title: i18n.highlighter.attributes.style.title, defaultValue: 'font-size:32px;' }),
                text: new adapters.TextAdapter({ title: i18n.highlighter.attributes.text.title, defaultValue: i18n.highlighter.attributes.text.defaultValue }),
                split: new adapters.StringAdapter({ title: i18n.highlighter.attributes.split.title, defaultValue: '([\\s\\.,;:\\?¿!<>\\(\\)&"`«»\\[\\]{}])' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.highlighter.properties.name.title }),
                question: new adapters.QuestionAdapter({ title: i18n.highlighter.properties.question.title }),
                solution: new adapters.HighLighterAdapter({ title: i18n.highlighter.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.highlighter.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.highlighter.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.highlighter.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.highlighter.properties.omit.title, defaultValue: 0 })
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
                assert.instanceof(HighLighter, that, assert.format(assert.messages.instanceof.default, 'this', 'HighLighter'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                var template = kendo.template(that.templates[mode]);
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
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                /* jshint maxcomplexity: 12 */
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (!component.attributes ||
                    !component.attributes.text ||
                    (component.attributes.text === i18n.highlighter.attributes.text.defaultValue) ||
                    !RX_TEXT.test(component.attributes.text)) {
                    ret.push({
                        type: WARNING,
                        index: pageIdx,
                        message: kendo.format(messages.invalidText, description, pageIdx + 1)
                    });
                }
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.highlightStyle && !RX_STYLE.test(component.attributes.highlightStyle))) {
                    // TODO: test small font-size incompatible with mobile devices
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                    // TODO: test small font-size incompatible with mobile devices
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                // TODO also check that split regex is safe
                return ret;
            }

            /* jshint +W074 */

        });
        tools.register(HighLighter);

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
                default: '<img src="#: src$() #" alt="#: attributes.alt #" class="#: class$() #" style="#: attributes.style #" data-#= ns #id="#: id$() #" data-#= ns #behavior="#: properties.behavior #" data-#= ns #constant="#: properties.constant #">'
            },
            height: 250,
            width: 250,
            attributes: {
                alt: new adapters.StringAdapter({ title: i18n.image.attributes.alt.title, defaultValue: i18n.image.attributes.alt.defaultValue }),
                src: new adapters.AssetAdapter({ title: i18n.image.attributes.src.title, defaultValue: i18n.image.attributes.src.defaultValue }),
                style: new adapters.StyleAdapter({ title: i18n.image.attributes.style.title })
            },
            properties: {
                behavior: new adapters.EnumAdapter(
                    {
                        title: i18n.image.properties.behavior.title,
                        defaultValue: 'none',
                        enum: ['none', 'draggable', 'selectable']
                    },
                    {
                        style: 'width: 100%;'
                    }
                ),
                constant: new adapters.StringAdapter({ title: i18n.image.properties.constant.title })
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
                assert.instanceof(Image, that, assert.format(assert.messages.instanceof.default, 'this', 'Image'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.image, assert.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
                var template = kendo.template(that.templates.default);
                // The class$ function adds the kj-interactive class to draggable components
                component.class$ = function () {
                    return 'kj-image' + (component.properties.behavior === 'draggable' ? ' ' + INTERACTIVE_CLASS : '');
                };
                // The id$ function returns the component id for components that have a behavior
                component.id$ = function () {
                    return (component.properties.behavior !== 'none' && $.type(component.id) === STRING && component.id.length) ? component.id : '';
                };
                // The src$ function resolves urls with schemes like cdn://sample.jpg
                component.src$ = function () {
                    var src = component.attributes.get('src');
                    var schemes = assets.image.schemes;
                    for (var scheme in schemes) {
                        if (Object.prototype.hasOwnProperty.call(schemes, scheme) && (new RegExp('^' + scheme + '://')).test(src)) {
                            src = src.replace(scheme + '://', schemes[scheme]);
                            break;
                        }
                    }
                    return src;
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
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                /* jshint maxcomplexity: 12 */
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (!component.attributes ||
                    !component.attributes.alt ||
                    (component.attributes.alt === i18n.image.attributes.alt.defaultValue) ||
                    !RX_TEXT.test(component.attributes.alt)) {
                    ret.push({
                        type: WARNING,
                        index: pageIdx,
                        message: kendo.format(messages.invalidAltText, description, pageIdx + 1)
                    });
                }
                if (!component.attributes ||
                    !component.attributes.src ||
                    (component.attributes.src === i18n.image.attributes.src.defaultValue) ||
                    !RX_IMAGE.test(component.attributes.src)) {
                    ret.push({
                        type: (component.attributes.src === i18n.image.attributes.src.defaultValue) ? WARNING : ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidImageFile, description, pageIdx + 1)
                    });
                }
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                // TODO: We should also check that there is a dropZone/Selector on the page if draggable/selectable
                return ret;
            }

            /* jshint +W074 */

        });
        tools.register(Image);

        /**
         * @class ImageSet tool
         * @type {void|*}
         */
        var IMAGESET = '<div data-#= ns #role="imageset" data-#= ns #images="#: data$() #" style="#: attributes.style #" {0}></div>';
        var ImageSet = Tool.extend({
            id: 'imageset',
            icon: 'photos',
            description: i18n.imageset.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(IMAGESET, 'data-#= ns #enabled="false"'),
                play: kendo.format(IMAGESET, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(IMAGESET, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enabled="false"') + Tool.fn.showResult()
            },
            height: 250,
            width: 250,
            attributes: {
                // shuffle: new adapters.BooleanAdapter({ title: i18n.quiz.attributes.shuffle.title }),
                style: new adapters.StyleAdapter({ title: i18n.imageset.attributes.style.title }),
                data: new adapters.ImageListBuilderAdapter({ title: i18n.imageset.attributes.data.title, defaultValue: i18n.imageset.attributes.data.defaultValue })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.imageset.properties.name.title }),
                question: new adapters.QuestionAdapter({ title: i18n.imageset.properties.question.title }),
                solution: new adapters.QuizSolutionAdapter({ title: i18n.imageset.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.imageset.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.imageset.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.imageset.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.imageset.properties.omit.title, defaultValue: 0 })
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
                assert.instanceof(ImageSet, that, assert.format(assert.messages.instanceof.default, 'this', 'ImageSet'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.image, assert.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
                var template = kendo.template(that.templates[mode]);
                // The data$ function resolves urls with schemes like cdn://sample.jpg
                component.data$ = function () {
                    var data = component.attributes.get('data');
                    var clone = [];
                    var schemes = assets.image.schemes;
                    for (var i = 0, length = data.length; i < length; i++) {
                        var item = {
                            text: data[i].text,
                            image: ''
                        };
                        for (var scheme in schemes) {
                            if (Object.prototype.hasOwnProperty.call(schemes, scheme) && (new RegExp('^' + scheme + '://')).test(data[i].image)) {
                                item.image = data[i].image.replace(scheme + '://', schemes[scheme]);
                                break;
                            }
                        }
                        clone.push(item);
                    }
                    // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
                    return ' ' + JSON.stringify(clone);
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
                /* jshint maxcomplexity: 8 */
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div' + kendo.roleSelector('imageset'));
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
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                if (!component.attributes ||
                    !component.attributes.data ||
                    !RX_DATA.test(component.attributes.data)) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidData, description, pageIdx + 1)
                    });
                }
                // TODO: Check that solution matches one of the data
                return ret;
            }

            /* jshint +W074 */

        });
        tools.register(ImageSet);

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
                default: '<div class="#: class$() #" style="#: attributes.style #" data-#= ns #id="#: id$() #" data-#= ns #behavior="#: properties.behavior #" data-#= ns #constant="#: properties.constant #">#= (kendo.htmlEncode(attributes.text) || "").replace(/\\n/g, "<br/>") #</div>'
            },
            height: 80,
            width: 300,
            attributes: {
                // text: new adapters.StringAdapter({ title: i18n.label.attributes.text.title, defaultValue: i18n.label.attributes.text.defaultValue }),
                text: new adapters.TextAdapter(
                    { title:i18n.label.attributes.text.title, defaultValue: i18n.label.attributes.text.defaultValue },
                    { rows: 2, style: 'resize:vertical; width: 100%;' }
                ),
                style: new adapters.StyleAdapter({ title: i18n.label.attributes.style.title, defaultValue: 'font-size:60px;' })
            },
            properties: {
                behavior: new adapters.EnumAdapter(
                    {
                        title: i18n.label.properties.behavior.title,
                        defaultValue: 'none',
                        enum: ['none', 'draggable', 'selectable']
                    },
                    {
                        style: 'width: 100%;'
                    }
                ),
                constant: new adapters.StringAdapter({ title: i18n.label.properties.constant.title })
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
                assert.instanceof(Label, that, assert.format(assert.messages.instanceof.default, 'this', 'Label'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                var template = kendo.template(that.templates.default);
                // The class$ function adds the kj-interactive class to draggable components
                component.class$ = function () {
                    return 'kj-label' + (component.properties.behavior === 'draggable' ? ' ' + INTERACTIVE_CLASS : '');
                };
                // The id$ function returns the component id for components that have a behavior
                component.id$ = function () {
                    return (component.properties.behavior !== 'none' && $.type(component.id) === STRING && component.id.length) ? component.id : '';
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
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                if (!component.attributes ||
                    !component.attributes.text ||
                    (component.attributes.text === i18n.label.attributes.text.defaultValue) ||
                    !RX_TEXT.test(component.attributes.text)) {
                    ret.push({
                        type: WARNING,
                        index: pageIdx,
                        message: kendo.format(messages.invalidText, description, pageIdx + 1)
                    });
                }
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                    // TODO: test small font-size incompatible with mobile devices
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                // TODO: We should also check that there is a dropZone on the page if draggable
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
                default: '<div data-#= ns #role="mathexpression" class="#: class$() #" style="#: attributes.style #" data-#= ns #id="#: id$() #" data-#= ns #behavior="#: properties.behavior #" data-#= ns #constant="#: properties.constant #" data-#= ns #inline="#: attributes.inline #" data-#= ns #value="#: attributes.formula #" ></div>'
            },
            height: 180,
            width: 370,
            attributes: {
                formula: new adapters.MathAdapter(
                    { title: i18n.mathexpression.attributes.formula.title, defaultValue: i18n.mathexpression.attributes.formula.defaultValue }
                ),
                inline: new adapters.BooleanAdapter (
                    { title: i18n.mathexpression.attributes.inline.title, defaultValue: i18n.mathexpression.attributes.inline.defaultValue }
                ),
                style: new adapters.StyleAdapter({ title: i18n.mathexpression.attributes.style.title, defaultValue: 'font-size:50px;' })
            },
            properties: {
                behavior: new adapters.EnumAdapter(
                    {
                        title: i18n.mathexpression.properties.behavior.title,
                        defaultValue: 'none',
                        enum: ['none', 'draggable', 'selectable']
                    },
                    {
                        style: 'width: 100%;'
                    }
                ),
                constant: new adapters.StringAdapter({ title: i18n.image.properties.constant.title })
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
                assert.instanceof(MathExpression, that, assert.format(assert.messages.instanceof.default, 'this', 'MathExpression'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                var template = kendo.template(that.templates.default);
                // The class$ function adds the kj-interactive class to draggable components
                component.class$ = function () {
                    return component.properties.behavior === 'draggable' ? INTERACTIVE_CLASS : '';
                };
                // The id$ function returns the component id for components that have a behavior
                component.id$ = function () {
                    return (component.properties.behavior !== 'none' && $.type(component.id) === STRING && component.id.length) ? component.id : '';
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
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                if (!component.attributes ||
                    !component.attributes.formula ||
                    (component.attributes.formula === i18n.mathexpression.attributes.formula.defaultValue) ||
                    !RX_FORMULA.test(component.attributes.formula)) {
                    // TODO: replace RX_FORMULA with a LaTeX synthax checker
                    ret.push({
                        type: WARNING,
                        index: pageIdx,
                        message: kendo.format(messages.invalidFormula, description, pageIdx + 1)
                    });
                }
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                // TODO: We should also check that there is a dropZone on the page if draggable
                return ret;
            }

        });
        tools.register(MathExpression);

        var MATHINPUT = '<div data-#= ns #role="mathinput" data-#= ns #toolbar="#: JSON.stringify(toolbar$()) #" style="#: attributes.style #" {0}>#: attributes.formula #</div>';
        /**
         * @class MathInput tool
         * @type {void|*}
         */
        var MathInput = Tool.extend({
            id: 'mathinput',
            icon: 'formula_input',
            description: i18n.mathinput.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                design: kendo.format(MATHINPUT, 'data-#= ns #enable="false"'),
                play: kendo.format(MATHINPUT, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(MATHINPUT, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 120,
            width: 370,
            attributes: {
                // The formula is intended to set several MathQuillMathFields, which requires to make the solution an array of mathinputs
                // formula: new adapters.MathAdapter({ title: i18n.mathinput.attributes.formula.title }),
                // backspace: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.backspace.title, defaultValue: false }),
                // field: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.field.title, defaultValue: false }),
                keypad: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.keypad.title, defaultValue: true }),
                basic: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.basic.title, defaultValue: true }),
                greek: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.greek.title, defaultValue: false }),
                operators: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.operators.title, defaultValue: false }),
                expressions: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.expressions.title, defaultValue: false }),
                sets: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.sets.title, defaultValue: false }),
                matrices: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.matrices.title, defaultValue: false }),
                statistics: new adapters.BooleanAdapter({ title: i18n.mathinput.attributes.statistics.title, defaultValue: false }),
                style: new adapters.StyleAdapter({ title: i18n.mathinput.attributes.style.title, defaultValue: 'font-size:50px;' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.mathinput.properties.name.title }),
                question: new adapters.QuestionAdapter({ title: i18n.mathinput.properties.question.title }),
                solution: new adapters.MathAdapter({ title: i18n.mathinput.properties.solution.title, defaultValue: '' }),
                validation: new adapters.ValidationAdapter({ title: i18n.mathinput.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.mathinput.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.mathinput.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.mathinput.properties.omit.title, defaultValue: 0 })
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
                assert.instanceof(MathInput, that, assert.format(assert.messages.instanceof.default, 'this', 'MathInput'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                var template = kendo.template(that.templates[mode]);
                component.toolbar$ = function () {
                    var tools = [];
                    /*
                    if (this.get('attributes.backspace')) {
                        tools.push('backspace');
                    }
                    if (this.get('attributes.field')) {
                        tools.push('field');
                    }
                    */
                    if (this.get('attributes.keypad')) {
                        tools.push('keypad');
                    }
                    if (this.get('attributes.basic')) {
                        tools.push('basic');
                    }
                    if (this.get('attributes.greek')) {
                        tools.push('greek');
                    }
                    if (this.get('attributes.operators')) {
                        tools.push('operators');
                    }
                    if (this.get('attributes.expressions')) {
                        tools.push('expressions');
                    }
                    if (this.get('attributes.sets')) {
                        tools.push('sets');
                    }
                    if (this.get('attributes.matrices')) {
                        tools.push('matrices');
                    }
                    if (this.get('attributes.statistics')) {
                        tools.push('statistics');
                    }
                    return {
                        container: '#floating .kj-floating-content',
                        resizable: false,
                        tools: tools
                    };
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
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                /*
                if (!component.attributes ||
                    !component.attributes.formula ||
                    (component.attributes.formula === i18n.mathinput.attributes.formula.defaultValue) ||
                    !RX_FORMULA.test(component.attributes.formula)) {
                    // TODO: replace RX_FORMULA with a LaTeX synthax checker
                    ret.push({
                        type: WARNING,
                        index: pageIdx,
                        message: kendo.format(messages.invalidFormula, description, pageIdx + 1)
                    });
                }
                */
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                return ret;
            }

        });
        tools.register(MathInput);

        var MULTIQUIZ = '<div data-#= ns #role="multiquiz" data-#= ns #mode="#: attributes.mode #" data-#= ns #source="#: data$() #" style="#: attributes.groupStyle #" data-#= ns #item-style="#: attributes.itemStyle #" data-#= ns #selected-style="#: attributes.selectedStyle #" {0}></div>';
        /**
         * MultiQuiz tool
         * @class MultiQuiz
         * @type {void|*}
         */
        var MultiQuiz = Tool.extend({
            id: 'multiquiz',
            icon: 'checkbox_group',
            description: i18n.multiquiz.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(MULTIQUIZ, 'data-#= ns #enable="false"'),
                play: kendo.format(MULTIQUIZ, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #shuffle="#: attributes.shuffle #"'),
                review: kendo.format(MULTIQUIZ, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 150,
            width: 420,
            attributes: {
                mode: new adapters.EnumAdapter(
                    { title: i18n.multiquiz.attributes.mode.title, defaultValue: 'checkbox', enum: ['button', 'checkbox', 'image', 'link', 'multiselect'] },
                    { style: 'width: 100%;' }
                ),
                shuffle: new adapters.BooleanAdapter({ title: i18n.multiquiz.attributes.shuffle.title }),
                groupStyle: new adapters.StyleAdapter({ title: i18n.multiquiz.attributes.groupStyle.title, defaultValue: 'font-size:60px;' }),
                itemStyle: new adapters.StyleAdapter({ title: i18n.multiquiz.attributes.itemStyle.title }),
                selectedStyle: new adapters.StyleAdapter({ title: i18n.multiquiz.attributes.selectedStyle.title }),
                data: new adapters.ImageListBuilderAdapter({ title: i18n.multiquiz.attributes.data.title, defaultValue: i18n.multiquiz.attributes.data.defaultValue })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.multiquiz.properties.name.title }),
                question: new adapters.QuestionAdapter({ title: i18n.multiquiz.properties.question.title }),
                solution: new adapters.MultiQuizSolutionAdapter({ title: i18n.multiquiz.properties.solution.title, defaultValue: [] }),
                validation: new adapters.ValidationAdapter({ title: i18n.multiquiz.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.multiquiz.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.multiquiz.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.multiquiz.properties.omit.title, defaultValue: 0 })
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
                assert.instanceof(MultiQuiz, that, assert.format(assert.messages.instanceof.default, 'this', 'MultiQuiz'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.image, assert.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
                var template = kendo.template(that.templates[mode]);
                // The data$ function resolves urls with schemes like cdn://sample.jpg
                component.data$ = function () {
                    var data = component.attributes.get('data');
                    var clone = [];
                    var schemes = assets.image.schemes;
                    for (var i = 0, length = data.length; i < length; i++) {
                        var item = {
                            text: data[i].text,
                            image: ''
                        };
                        for (var scheme in schemes) {
                            if (Object.prototype.hasOwnProperty.call(schemes, scheme) && (new RegExp('^' + scheme + '://')).test(data[i].image)) {
                                item.image = data[i].image.replace(scheme + '://', schemes[scheme]);
                                break;
                            }
                        }
                        clone.push(item);
                    }
                    // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
                    return ' ' + JSON.stringify(clone);
                };
                return template($.extend(component, { ns: kendo.ns }));
            },

            /**
             * Improved display of value in score grid
             * @param testItem
             */
            value$: function (testItem) {
                var ret = (testItem.value || []).slice();
                for (var i = 0; i < ret.length; i++) {
                    ret[i] = kendo.htmlEncode(ret[i]);
                }
                return ret.join('<br/>');
            },

            /**
             * Improved display of solution in score grid
             * @param testItem
             */
            solution$: function (testItem) {
                var ret = (testItem.solution || []).slice();
                for (var i = 0; i < ret.length; i++) {
                    ret[i] = kendo.htmlEncode(ret[i]);
                }
                return ret.join('<br/>');
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                /* jshint maxcomplexity: 8 */
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.groupStyle && !RX_STYLE.test(component.attributes.groupStyle)) ||
                    (component.attributes.itemStyle && !RX_STYLE.test(component.attributes.itemStyle)) ||
                    (component.attributes.selectedStyle && !RX_STYLE.test(component.attributes.selectedStyle))) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                if (!component.attributes ||
                    !component.attributes.data ||
                    !RX_DATA.test(component.attributes.data)) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidData, description, pageIdx + 1)
                    });
                }
                return ret;
            }

            /* jshint +W074 */

        });
        tools.register(MultiQuiz);

        var QUIZ = '<div data-#= ns #role="quiz" data-#= ns #mode="#: attributes.mode #" data-#= ns #source="#: data$() #" style="#: attributes.groupStyle #" data-#= ns #item-style="#: attributes.itemStyle #" data-#= ns #selected-style="#: attributes.selectedStyle #" {0}></div>';
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
                play: kendo.format(QUIZ, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #shuffle="#: attributes.shuffle #"'),
                review: kendo.format(QUIZ, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 120,
            width: 490,
            attributes: {
                mode: new adapters.EnumAdapter(
                    { title: i18n.quiz.attributes.mode.title, defaultValue: 'button', enum: ['button', 'dropdown', 'image', 'link', 'radio'] },
                    { style: 'width: 100%;' }
                ),
                shuffle: new adapters.BooleanAdapter({ title: i18n.quiz.attributes.shuffle.title }),
                groupStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.groupStyle.title, defaultValue: 'font-size:60px;' }),
                itemStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.itemStyle.title }),
                selectedStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.selectedStyle.title }),
                data: new adapters.ImageListBuilderAdapter({ title: i18n.quiz.attributes.data.title, defaultValue: i18n.quiz.attributes.data.defaultValue })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.quiz.properties.name.title }),
                question: new adapters.QuestionAdapter({ title: i18n.quiz.properties.question.title }),
                solution: new adapters.QuizSolutionAdapter({ title: i18n.quiz.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.quiz.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.quiz.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.quiz.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.quiz.properties.omit.title, defaultValue: 0 })
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
                assert.instanceof(Quiz, that, assert.format(assert.messages.instanceof.default, 'this', 'Quiz'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.image, assert.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
                var template = kendo.template(that.templates[mode]);
                // The data$ function resolves urls with schemes like cdn://sample.jpg
                component.data$ = function () {
                    var data = component.attributes.get('data');
                    var clone = [];
                    var schemes = assets.image.schemes;
                    for (var i = 0, length = data.length; i < length; i++) {
                        var item = {
                            text: data[i].text,
                            image: ''
                        };
                        for (var scheme in schemes) {
                            if (Object.prototype.hasOwnProperty.call(schemes, scheme) && (new RegExp('^' + scheme + '://')).test(data[i].image)) {
                                item.image = data[i].image.replace(scheme + '://', schemes[scheme]);
                                break;
                            }
                        }
                        clone.push(item);
                    }
                    // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
                    return ' ' + JSON.stringify(clone);
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
                /* jshint maxcomplexity: 8 */
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.groupStyle && !RX_STYLE.test(component.attributes.groupStyle)) ||
                    (component.attributes.itemStyle && !RX_STYLE.test(component.attributes.itemStyle)) ||
                    (component.attributes.selectedStyle && !RX_STYLE.test(component.attributes.selectedStyle))) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                if (!component.attributes ||
                    !component.attributes.data ||
                    !RX_DATA.test(component.attributes.data)) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidData, description, pageIdx + 1)
                    });
                }
                // TODO: Check that solution matches one of the data
                return ret;
            }

            /* jshint +W074 */

        });
        tools.register(Quiz);

        var SELECTOR = '<div data-#= ns #role="selector" data-#= ns #id="#: properties.name #" data-#= ns #shape="#: attributes.shape #" data-#= ns #stroke="{ color: \'#: attributes.color #\', dashType: \'solid\', opacity: 1, width: \'#: attributes.strokeWidth #\' }" data-#= ns #empty="#: attributes.empty #" data-#= ns #hit-radius="#: attributes.hitRadius #" {0}></div>';
        /**
         * @class Selector tool
         * @type {void|*}
         */
        var Selector = Tool.extend({
            id: 'selector',
            icon: 'selector',
            description: i18n.selector.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: '<img src="https://cdn.kidoju.com/images/o_collection/svg/office/selector.svg" alt="selector">',
                // design: '<img src="#: icon$() #" alt="#: description$() #">',
                play: kendo.format(SELECTOR, 'data-#= ns #toolbar="\\#floating .kj-floating-content" data-#= ns #bind="value: #: properties.name #.value, source: interactions"'),
                review: kendo.format(SELECTOR, 'data-#= ns #bind="value: #: properties.name #.value, source: interactions" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 50,
            width: 50,
            attributes: {
                color: new adapters.ColorAdapter({ title: i18n.selector.attributes.color.title, defaultValue: '#FF0000' }),
                empty: new adapters.StringAdapter({ title: i18n.selector.attributes.empty.title }),
                hitRadius: new adapters.NumberAdapter({ title: i18n.selector.attributes.hitRadius.title, defaultValue: 15 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 15, 'data-max': 999 }),
                shape: new adapters.EnumAdapter(
                    { title: i18n.selector.attributes.shape.title, defaultValue: 'circle', enum: ['circle', 'cross', 'rect'] },
                    { style: 'width: 100%;' }
                ),
                strokeWidth: new adapters.NumberAdapter({ title: i18n.selector.attributes.strokeWidth.title, defaultValue: 12 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 50 })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.selector.properties.name.title }),
                question: new adapters.QuestionAdapter({ title: i18n.selector.properties.question.title }),
                solution: new adapters.StringArrayAdapter({ title: i18n.selector.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.selector.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.selector.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.selector.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.selector.properties.omit.title, defaultValue: 0 }),
                disabled: new adapters.DisabledAdapter({ title: i18n.selector.properties.disabled.title, defaultValue: false })
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div[' + kendo.attr('role') + '="selector"]');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                }
                // Redraw the selector widget
                // var selectorWidget = content.data('kendoSelector');
                // assert.instanceof(kendo.ui.Selector, selectorWidget, assert.format(assert.messages.instanceof.default, 'selectorWidget', 'kendo.ui.Selector'));
                // selectorWidget._drawPlaceholder();

                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Improved display of value in score grid
             * Note: search for getScoreArray in kidoju.data
             * @param testItem
             */
            value$: function (testItem) {
                if (testItem.result) {
                    return kendo.htmlEncode(testItem.solution || '');
                } else {
                    return 'N/A'; // TODO translate
                }
            },

            /**
             * Improved display of solution in score grid
             * Note: search for getScoreArray in kidoju.data
             * @param testItem
             */
            solution$: function (testItem) {
                return kendo.htmlEncode(testItem.solution || '');
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
                if (!component.attributes ||
                    !RX_COLOR.test(component.attributes.color)) {
                    ret.push({
                        type: WARNING,
                        index: pageIdx,
                        message: kendo.format(messages.invalidColor, description, pageIdx + 1)
                    });
                }
                // TODO: We should have a generic validation for  enumerators
                if (!component.attributes || ['circle', 'cross', 'rect'].indexOf(component.attributes.shape) === -1) {
                    ret.push({
                        type: WARNING,
                        index: pageIdx,
                        message: kendo.format(messages.invalidShape, description, pageIdx + 1)
                    });
                }
                // TODO: Check selectors on top of static images and labels
                return ret;
            }

        });
        tools.register(Selector);

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
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                    // TODO validate columns, rows and data
                }
                return ret;
            }

        });
        tools.register(Table);

        var TEXTAREA = '<textarea id="#: properties.name #" class="k-textbox kj-interactive" style="#: attributes.style #" {0}></textarea>';
        /**
         * @class Textarea tool
         * @type {void|*}
         */
        var Textarea = Tool.extend({
            id: 'textarea',
            icon: 'text_area',
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
                style: new adapters.StyleAdapter({ title: i18n.textarea.attributes.style.title, defaultValue: 'font-size:40px;resize:none;' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.textarea.properties.name.title }),
                question: new adapters.QuestionAdapter({ title: i18n.textarea.properties.question.title }),
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
                if (stageElement.is(ELEMENT_SELECTOR) && component instanceof PageComponent) {
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
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                return ret;
            }

        });
        tools.register(Textarea);

        // Masks cannot be properly set via data attributes. An error is raised when masks only contain digits. See the workaround in onResize for more information
        var TEXTBOX = '<input type="text" id="#: properties.name #" class="kj-interactive" data-#= ns #role="maskedtextbox" data-#= ns #prompt-char="\u25CA" style="#: attributes.style #" {0}>';
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
                question: new adapters.QuestionAdapter({ title: i18n.textbox.properties.question.title }),
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
                if (stageElement.is(ELEMENT_SELECTOR) && component instanceof PageComponent) {
                    stageElement.find('input')
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
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.find('input'); // span > input
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
                // TODO: validate mask
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                return ret;
            }

        });
        tools.register(Textbox);

        var TEXTGAPS = '<div data-#= ns #role="textgaps" data-#= ns #text="#: attributes.text #" data-#= ns #input-style="#: attributes.inputStyle #" style="#: attributes.style #" {0}></div>';
        /**
         * TextGaps tool
         * @class MultiQuiz
         * @type {void|*}
         */
        var TextGaps = Tool.extend({
            id: 'textgaps',
            icon: 'text_gaps',
            description: i18n.textgaps.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(TEXTGAPS, 'data-#= ns #enable="false"'),
                play: kendo.format(TEXTGAPS, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #shuffle="#: attributes.shuffle #"'),
                review: kendo.format(TEXTGAPS, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 150,
            width: 420,
            attributes: {
                inputStyle: new adapters.StyleAdapter({ title: i18n.textgaps.attributes.inputStyle.title }),
                style: new adapters.StyleAdapter({ title: i18n.textgaps.attributes.style.title, defaultValue: 'font-size:32px;' }),
                text: new adapters.StringAdapter({ title: i18n.textgaps.attributes.text.title, defaultValue: i18n.textgaps.attributes.text.defaultValue })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.textgaps.properties.name.title }),
                question: new adapters.QuestionAdapter({ title: i18n.textgaps.properties.question.title }),
                solution: new adapters.StringArrayAdapter({ title: i18n.textgaps.properties.solution.title, defaultValue: [] }),
                validation: new adapters.ValidationAdapter({ title: i18n.textgaps.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.textgaps.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.textgaps.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.textgaps.properties.omit.title, defaultValue: 0 })
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
                assert.instanceof(TextGaps, that, assert.format(assert.messages.instanceof.default, 'this', 'TextGaps'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                var template = kendo.template(that.templates[mode]);
                return template($.extend(component, { ns: kendo.ns }));
            },

            /**
             * Improved display of value in score grid
             * @param testItem
             */
            value$: function (testItem) {
                var ret = (testItem.value || []).slice();
                for (var i = 0; i < ret.length; i++) {
                    ret[i] = kendo.htmlEncode((ret[i] || '').trim());
                }
                return ret.join('<br/>');
            },

            /**
             * Improved display of solution in score grid
             * @param testItem
             */
            solution$: function (testItem) {
                var ret = (testItem.solution || '').split('\n');
                for (var i = 0; i < ret.length; i++) {
                    ret[i] = kendo.htmlEncode((ret[i] || '').trim());
                }
                return ret.join('<br/>');
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                /* jshint maxcomplexity: 8 */
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div' + kendo.roleSelector('textgaps'));
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

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                /* jshint maxcomplexity: 12 */
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (!component.attributes ||
                    !component.attributes.text ||
                    (component.attributes.text === i18n.textgaps.attributes.text.defaultValue) ||
                    !RX_TEXT.test(component.attributes.text)) {
                    ret.push({
                        type: WARNING,
                        index: pageIdx,
                        message: kendo.format(messages.invalidText, description, pageIdx + 1)
                    });
                }
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.inputStyle && !RX_STYLE.test(component.attributes.inputStyle))) {
                    // TODO: test small font-size incompatible with mobile devices
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                if (!component.attributes ||
                    // Styles are only checked if there is any (optional)
                    (component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                    // TODO: test small font-size incompatible with mobile devices
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                    });
                }
                // TODO also check that split regex is safe
                return ret;
            }

            /* jshint +W074 */

        });
        tools.register(TextGaps);

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
                default: '<div data-#= ns #role="mediaplayer" data-#= ns #mode="video" data-#= ns #autoplay="#: attributes.autoplay #" data-#= ns #files="#: files$() #" data-#= ns #toolbar-height="#: attributes.toolbarHeight #"></div>'
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
                assert.instanceof(Video, that, assert.format(assert.messages.instanceof.default, 'this', 'Video'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, assert.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.video, assert.format(assert.messages.instanceof.default, 'assets.video', 'kidoju.ToolAssets'));
                var template = kendo.template(this.templates.default);

                /* This function's cyclomatic complexity is too high. */
                /* jshint -W074 */

                // The files$ function resolves urls with schemes like cdn://video.mp4 and returns a stringified array
                component.files$ = function () {
                    var mp4 = component.attributes.get('mp4');
                    var ogv = component.attributes.get('ogv');
                    var wbem = component.attributes.get('wbem');
                    var schemes = assets.video.schemes;
                    for (var scheme in schemes) {
                        if (Object.prototype.hasOwnProperty.call(schemes, scheme)) {
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

                    // Adding a space is a workaround to https://github.com/telerik/kendo-ui-core/issues/2849
                    return ' ' + JSON.stringify(files);
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
                assert.ok(stageElement.is(ELEMENT_SELECTOR), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, assert.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
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
                if (!component.attributes ||
                    !RX_VIDEO.test(component.attributes.mp4)) {
                    ret.push({
                        type: ERROR,
                        index: pageIdx,
                        message: kendo.format(messages.invalidVideoFile, description, pageIdx + 1)
                    });
                }
                // Note: we are not testing for an ogv or wbem file
                return ret;
            }

        });
        tools.register(Video);

        /**
         * We could also consider
         * HTML from Markdown (lists, tec)
         * Vector drawing (shapes)
         * Text-to-Speech
         * Geogebra
         * Spreadsheet
         */

    }(window.jQuery));

    /* jshint +W071 */

    return kidoju;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
