/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/codemirror/lib/codemirror.js',
        './vendor/codemirror/mode/gfm/gfm.js', // loads markdown.js
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.window',
        './kidoju.widgets.markeditor.toolbar',
        './kidoju.widgets.markdown'

    ], f);
})(function (CodeMirror) {

    'use strict';

    // Depending how codemirror.js is loaded
    // We need `CodeMirror` for webpack and `window.CodeMirror` for grunt mocha
    CodeMirror = CodeMirror || window.CodeMirror;

    (function ($, undefined) {

        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.markeditor');
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var NULL = 'null';
        var CHANGE = 'change';
        var WIDGET_CLASS = 'k-widget kj-markeditor';
        var LINK = '[{0}]({1})';
        var IMAGE = '![{0}]({1})';
        var RX_MD_AT_BOL = /^((#{1,6}|\d+\.|-|>) )?[ \t]*(\S[^\n]*)$/gm;
        var TOOLS = [
            'undo',
            'redo',
            'headings',
            'bold',
            'italic',
            'bulleted',
            'numbered',
            'blockquote',
            'hrule',
            'link',
            'image',
            'code',
            'latex',
            'window'
        ];

        /*******************************************************************************************
         * MarkEditor Widget
         *******************************************************************************************/

        /**
         * MarkEditor (kendoTemplate)
         * @class MarkEditor
         * @extend Widget
         */
        var MarkEditor = Widget.extend({

            /**
             * Initializes the widget
             * @method init
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'Widget initialized' });
                that._layout();
                that.value(that.options.value);
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'MarkEditor',
                value: '',
                autoResize: false,
                gfm: false,
                lineNumbers: true,
                toolbar: {
                    resizable: true,
                    tools: TOOLS
                },
                messages: {
                    image: 'An undescribed image',
                    link: 'Click here'
                }
            },

            /**
             * Events
             */
            events: [
                CHANGE
            ],

            /**
             * Data to be merged with the template
             * @method value
             * @param value
             * @return {*}
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === UNDEFINED) {
                    return that.codeMirror.getValue();
                } else if ($.type(value) === NULL) {
                    this.value('');
                } else if ($.type(value) === STRING) {
                    if (that.codeMirror.getValue() !== value) {
                        that.codeMirror.setValue(value);
                    }
                } else {
                    throw new TypeError('`value` should be a string');
                }
            },

            /**
             * Builds the widget layout
             * @method _layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                that._setToolbar();
                that._setCodeMirror();
                that._resize(true);
            },

            /**
             * _resize is called by Widget.resize which is called by kendo.resize
             * @param size
             * @param force
             * @private
             */
            _resize: function (size, force) {
                this.toolBar.resize(force); // kendo.resize(this.toolBar.element);
                this.codeMirror.refresh();
            },

            /**
             * Set the toolbar
             */
            _setToolbar: function () {
                this.toolBar = $('<div class="kj-markeditor-toolbar"></div>')
                    .prependTo(this.element)
                    .kendoMarkEditorToolBar({
                        tools: this.options.toolbar.tools,
                        resizable: this.options.toolbar.resizable,
                        action: this._onToolBarAction.bind(this),
                        dialog: this._onToolBarDialog.bind(this)
                    })
                    .data('kendoMarkEditorToolBar');
            },

            /**
             * Set CodeMirror in markdown mode
             */
            _setCodeMirror: function () {
                var that = this;
                var options = that.options;
                var div = $('<div class="kj-markeditor-editor"></div>')
                    .appendTo(that.element);

                that.codeMirror = CodeMirror(div.get(0), {
                    // extraKeys?
                    lineNumbers: options.lineNumbers,
                    mode: options.gfm ? 'gfm' : 'markdown',
                    // theme: 'monokai', // TODO: Change theme
                    value: options.value,
                    viewportMargin: options.autoResize ? Number.POSITIVE_INFINITY : 10
                });

                if (options.autoResize) {
                    // @see https://codemirror.net/demo/resize.html
                    div.css({ height: 'auto' });
                    div.children('.CodeMirror').css({ height: 'auto' });
                }

                that.codeMirror.on(CHANGE, function (doc, change) {
                    if (change.origin !== 'setValue') {
                        that.trigger(CHANGE);
                    }
                });

                // that.codeMirror.on('beforeSelectionChange', that._onSelectionChanged.bind(that));
            },

            /**
             * Refresh the toolbar when the selection has changed
             * @param selected
             * @param deselected
             * @private
             */
            /*
            _onSelectionChanged: function (doc, selection) {
                // This is the place to refresh the toolbar
                // especially to toggle or disable buttons
                this.toolBar.refresh(selection);
            },
            */

            /**
             * Event handler triggered when calling a dialog
             * @param e
             * @private
             */
            _onToolBarDialog: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                this._openDialog(e.name, e.options);
            },

            /**
             * Open dialog
             * @param name
             * @param options
             * @returns {name}
             * @private
             */
            _openDialog: function (name, options) {
                // assert.type(STRING, name, kendo.format(assert.messages.type.default, 'name', STRING));
                // assert.isPlainObject(options, kendo.format(assert.messages.isPlainObject.default, 'options'));
                var dialog = kendo.markeditor.dialogs.create(name, options);
                if (!$.isArray(this._dialogs)) {
                    this._dialogs = [];
                }
                if (dialog) {
                    dialog.bind('action', this._onToolBarAction.bind(this));
                    dialog.bind('deactivate', this._destroyDialog.bind(this));
                    this._dialogs.push(dialog);
                    dialog.open();
                    return dialog;
                }
            },

            /***
             * Destroy dialog
             * @private
             */
            _destroyDialog: function () {
                this._dialogs.pop();
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Even handler triggered when calling an action
             * @param e
             * @private
             */
            _onToolBarAction: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                var options = this.options;
                // Note: as long as it is not too complex, we can use a dispatcher as below
                // In the future, maybe consider Command classes with execute methods that apply to a selection like in kendo.ui.spreadsheet
                switch (e.command) {
                    case 'ToolbarUndoCommand':
                        this.codeMirror.undoSelection();
                        break;
                    case 'ToolbarRedoCommand':
                        this.codeMirror.redoSelection();
                        break;
                    case 'ToolbarHeadingsCommand':
                        this._replaceInSelectionsWith(RX_MD_AT_BOL, e.params.value + ' ', '$3');
                        break;
                    case 'ToolbarBoldCommand':
                        this._wrapSelectionsWith('**', true);
                        break;
                    case 'ToolbarItalicCommand':
                        this._wrapSelectionsWith('_', true);
                        break;
                        /*
                    case 'ToolbarStrikethroughCommand':
                        this._wrapSelectionsWith('~~', true);
                        break;
                        */
                    case 'ToolbarBulletedCommand':
                        this._replaceInSelectionsWith(RX_MD_AT_BOL, '- ', '$3');
                        this._wrapSelectionsWith('\n\n', false);
                        break;
                    case 'ToolbarNumberedCommand':
                        this._replaceInSelectionsWith(RX_MD_AT_BOL, '1. ', '$3');
                        this._wrapSelectionsWith('\n\n', false);
                        break;
                    case 'ToolbarBlockquoteCommand':
                        this._replaceInSelectionsWith(RX_MD_AT_BOL, '> ', '$3');
                        break;
                    case 'ToolbarHruleCommand':
                        // Note: '___' and '***' should also work
                        this._replaceInSelectionsWith('---');
                        this._wrapSelectionsWith('\n', true);
                        break;
                    case 'ToolbarLinkCommand':
                        this._replaceInSelectionsWith(kendo.format(LINK, options.messages.link, e.params.value));
                        break;
                    case 'ToolbarImageCommand':
                        this._replaceInSelectionsWith(kendo.format(IMAGE, options.messages.image, e.params.value));
                        break;
                    case 'ToolbarCodeCommand':
                        this._wrapSelectionsWith('```', false);
                        break;
                    case 'ToolbarLatexCommand':
                        // @see https://github.com/codemirror/CodeMirror/issues/4857
                        break;
                    case 'ToolbarWindowCommand':
                        // TODO http://www.telerik.com/forums/get-the-view-model-from-a-given-dom-element
                        break;
                    // Note: Emojis could use auto completion as in GitHub
                    // see https://github.com/codemirror/CodeMirror/issues/4859
                    default:
                        $.noop();
                }
            },

            /* jshint +W074 */

            /**
             * This funtions is used by both bold, italic, strikethrough and code to wrap the selection respectively with **, _, ~~ and ```
             * Note: This currently works as in Github but there are many edge cases which are not properly handled, including
             * - Clicking twice on the same selection should do nothing: second click should cancel first click as in Github
             * - Selections spanning several lines (in markdown a new line is \n\n, not \n)
             * - Selections cutting words, i.e. abcd_efg is a word, which means ** and _ only work at the edge of words
             * - Selections across bold or italic words break everything
             * @param str
             * @param trim
             * @private
             */
            _wrapSelectionsWith: function (str, trim) {
                var cm = this.codeMirror;
                var selections = cm.getSelections();
                var trimmed;
                var leadingSpaces;
                var trailingSpaces;
                for (var i = 0, length = selections.length; i < length; i++) {
                    if (trim && selections[i].length) {
                        // Some selections cannot contain spaces on their edges ** dummy** is not valid (but ```  code ``` is valid)
                        // So we need to trim spaces from selections that require it, especially before making them it bold or italic
                        // then we need to restore spaces around it.
                        trimmed = selections[i].trim();
                        leadingSpaces = selections[i].search(/[^ ]/); // This is an index starting at 0 for the first char
                        if (leadingSpaces === -1) {
                            leadingSpaces = 0; // This means the selection only contains spaces
                        }
                        trailingSpaces = selections[i].length - trimmed.length - leadingSpaces;
                        selections[i] = ' '.repeat(leadingSpaces) + str + trimmed + str + ' '.repeat(trailingSpaces);
                    } else {
                        selections[i] = str + selections[i] + str;
                    }
                    if (selections[i] > 2 * str.length) {
                        // Cancel duplicate wrappings
                        str = '\\' + str.split('').join('\\'); // Escape characters, especially *
                        selections[i] = selections[i].replace(new RegExp('^' + str + str), '').replace(new RegExp(str + str + '$'), '');
                    }
                }
                cm.replaceSelections(selections, 'around');
                // TODO: restore empty selections
            },

            /**
             * This functions is used to replace selections with a hyperlink, an image or a latex expression
             * @param regex
             * @param str
             * @param match
             * @private
             */
            _replaceInSelectionsWith: function (regex, str, match) {
                var cm = this.codeMirror;
                var selections = cm.getSelections();
                if ($.type(str) === UNDEFINED) {
                    str = regex + '';
                    regex = undefined;
                }
                for (var i = 0, length = selections.length; i < length; i++) {
                    if ((typeof regex === STRING || regex instanceof RegExp) && selections[i].length) {
                        selections[i] = selections[i].replace(regex, str + '' + match);
                    } else {
                        selections[i] = str + '';
                    }
                }
                cm.replaceSelections(selections, 'around');
            },

            /**
             * This funtion is used by headings, blockquotes, numbered and bulleted lits to respectively add #, >, 1. and - at the begining of each selected line
             * Note: This currently works as in Github but there are many edge cases which are not handled
             * - Clicking twice on the same selection should do nothing: second click should cancel first click as in Github
             *
             * @param str
             * @private
             */
            _replaceAtBeginningOfLine: function (str, rx) {
                // TODO clicking twice should cancel
                // TODO spaces at the edge of selections
                // TODO if selection.length = 0, keep it that way
                var cm = this.codeMirror;
                var selections = cm.getSelections();
                var delimiters = cm.listSelections();
                var bol; // Beginning of line
                var eol; // End of line
                for (var i = 0, length = selections.length; i < length; i++) {
                    bol = (cm.posFromIndex(cm.indexFromPos(delimiters[i].anchor) - 1).line === delimiters[i].anchor.line && delimiters[i].anchor.line > 0) ? '\n\n' : '\n';
                    eol = (cm.posFromIndex(cm.indexFromPos(delimiters[i].head) + 1).line === delimiters[i].head.line) ? '\n\n' : '\n';
                    selections[i] = bol + str + selections[i].replace(/\n/g, '\n' + str) + eol;
                }
                cm.replaceSelections(selections, 'around');
            },

            /**
             * Enable/Disable component
             * @param enabled
             */
            enable: function (enabled) {
                enabled = $.type(enabled === UNDEFINED) ? true : !!enabled;
                this.toolBar.enable(enabled);
                this.codeMirror.setOption('readOnly', !enabled);
            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                kendo.unbind(wrapper);
                // Clear references

                // Destroy widget
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        ui.plugin(MarkEditor);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
