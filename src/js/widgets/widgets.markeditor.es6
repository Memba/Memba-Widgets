/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO add solution$() and value$()

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import CodeMirror from '../vendor/codemirror/lib/codemirror';
import '../vendor/codemirror/mode/gfm/gfm';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import './widgets.markeditor.toolbar.es6';

const {
    destroy,
    extensions: { markeditor },
    format,
    unbind,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.markeditor');
// const NS = '.kendoMarkEditor';
const WIDGET_CLASS = 'k-widget kj-markeditor';

const LINK = '[{0}]({1})';
const IMAGE = '![{0}]({1})';
const RX_MD_AT_BOL = /^((#{1,6}|\d+\.|-|>) )?[ \t]*(\S[^\n]*)$/gm;
const TOOLS = [
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
    'preview'
];

/** *****************************************************************************************
 * MarkEditor Widget
 ****************************************************************************************** */

/**
 * MarkEditor (kendoTemplate)
 * @class MarkEditor
 * @extends Widget
 */
const MarkEditor = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        const that = this;
        Widget.fn.init.call(that, element, options);
        logger.debug({ method: 'init', message: 'Widget initialized' });
        // We need to set tools otherwise the options.toolbar.tools array is simply pasted over the TOOLBAR array, which creates duplicates in the overflow
        that.options.toolbar.tools = (options.toolbar || {}).tools || TOOLS;
        that._layout();
        that.value(that.options.value);
        that.enable(
            that.element.prop('disabled') ? false : that.options.enable
        );
        // kendo.notify(that);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'MarkEditor',
        autoResize: false,
        enable: true,
        gfm: false,
        lineNumbers: true,
        messages: {
            image: 'An undescribed image',
            link: 'Click here'
        },
        schemes: {},
        // theme: 'monokai', // We have themed CodeMirror in Kidoju-WebApp - see codemirror.custom.less using Kendo UI less variables
        toolbar: {
            container: '',
            resizable: true,
            tools: TOOLS
        },
        value: ''
    },

    /**
     * Events
     */
    events: [CONSTANTS.CHANGE, 'command', 'dialog'],

    /**
     * Data to be merged with the template
     * @method value
     * @param value
     * @return {*}
     */
    value(value) {
        const that = this;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            return that.codeMirror.getValue();
        }
        if ($.type(value) === CONSTANTS.NULL) {
            this.value('');
        } else if ($.type(value) === CONSTANTS.STRING) {
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
    _layout() {
        this.wrapper = this.element.addClass(WIDGET_CLASS);
        this._setToolbar();
        this._setCodeMirror();
        this._resize(true);
    },

    /**
     * _resize is called by Widget.resize which is called by kendo.resize
     * @param size
     * @param force
     * @private
     */
    _resize(size, force) {
        this.toolBar.resize(force); // kendo.resize(this.toolBar.element);
        this.codeMirror.refresh();
    },

    /**
     * Set the toolbar
     */
    _setToolbar() {
        const container = $(this.options.toolbar.container);
        this.toolBar = $('<div class="kj-markeditor-toolbar"></div>')
            .prependTo(container.length === 1 ? container : this.element)
            .kendoMarkEditorToolBar({
                action: this._onToolBarAction.bind(this),
                dialog: this._onToolBarDialog.bind(this),
                resizable: this.options.toolbar.resizable,
                schemes: this.options.schemes, // Pass teh schemes to the toolbar
                tools: this.options.toolbar.tools
            })
            .data('kendoMarkEditorToolBar');
    },

    /**
     * Set CodeMirror in markdown mode
     */
    _setCodeMirror() {
        const that = this;
        const { options } = this;
        const div = $('<div class="kj-markeditor-editor"></div>').appendTo(
            this.element
        );

        this.codeMirror = CodeMirror(div.get(0), {
            // extraKeys?
            lineNumbers: options.lineNumbers,
            mode: options.gfm ? 'gfm' : 'markdown',
            // theme: options.theme,
            value: options.value,
            viewportMargin: options.autoResize ? Number.POSITIVE_INFINITY : 10
        });

        if (options.autoResize) {
            // @see https://codemirror.net/demo/resize.html
            div.css({ height: 'auto' });
            div.children('.CodeMirror').css({ height: 'auto' });
        }

        this.codeMirror.on(CONSTANTS.CHANGE, (doc, change) => {
            if (change.origin !== 'setValue') {
                that.trigger(CONSTANTS.CHANGE);
            }
        });

        // this.codeMirror.on('beforeSelectionChange', this._onSelectionChanged.bind(this));
    },

    /**
     * Refresh
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
    _onToolBarDialog(e) {
        assert.isNonEmptyPlainObject(
            e,
            assert.format(assert.messages.isNonEmptyPlainObject.default, 'e')
        );
        if (!this.trigger('dialog', { name: e.name, options: e.options })) {
            this._openDialog(e.name, e.options);
        }
    },

    /**
     * Open dialog
     * @param name
     * @param options
     * @returns {name}
     * @private
     */
    _openDialog(name, options) {
        // assert.type(CONSTANTS.STRING, name, assert.format(assert.messages.type.default, 'name', CONSTANTS.STRING));
        // assert.isNonEmptyPlainObject(options, assert.format(assert.messages.isNonEmptyPlainObject.default, 'options'));
        const dialog = markeditor.dialogs.create(name, options);
        if (!$.isArray(this._dialogs)) {
            this._dialogs = [];
        }
        if (dialog) {
            dialog.bind('action', this._onToolBarAction.bind(this));
            dialog.bind('deactivate', this._destroyDialog.bind(this));
            this._dialogs.push(dialog);
            // SpreadsheetDialog gets a renge here, but we might as well pass this which gives this.codeMirror to the dialog
            dialog.open(this);
        }
        return dialog;
    },

    /** *
     * Destroy dialog
     * @private
     */
    _destroyDialog() {
        this._dialogs.pop();
    },

    /**
     * Even handler triggered when calling an action
     * @param e
     * @private
     */
    _onToolBarAction(e) {
        assert.isNonEmptyPlainObject(
            e,
            assert.format(assert.messages.isNonEmptyPlainObject.default, 'e')
        );
        if (
            !this.trigger('command', { command: e.command, params: e.params })
        ) {
            const options = this.options;
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
                    this._replaceInSelectionsWith(
                        RX_MD_AT_BOL,
                        `${e.params.value} `,
                        '$3'
                    );
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
                    this._replaceInSelectionsWith(
                        format(LINK, options.messages.link, e.params.value)
                    );
                    break;
                case 'ToolbarImageCommand':
                    this._replaceInSelectionsWith(
                        format(IMAGE, options.messages.image, e.params.value)
                    );
                    break;
                case 'ToolbarCodeCommand':
                    this._wrapSelectionsWith('```', false);
                    break;
                case 'ToolbarLatexCommand':
                    // CodeMirror markdown/gfm mode does not highlight LaTeX
                    // but there are options to implement this - @see https://github.com/codemirror/CodeMirror/issues/4857
                    this._replaceInSelectionsWith(e.params.value.latex);
                    this._wrapSelectionsWith(
                        e.params.value.inline ? '$' : '$$',
                        true
                    );
                    break;
                case 'ToolbarPreviewCommand':
                    this.value(e.params.value);
                    this.trigger(CONSTANTS.CHANGE);
                    break;
                // Note: Emojis could use auto completion as in GitHub
                // see https://github.com/codemirror/CodeMirror/issues/4859
                default:
                    $.noop();
            }
        }
    },

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
    _wrapSelectionsWith(str, trim) {
        const cm = this.codeMirror;
        const selections = cm.getSelections();
        let trimmed;
        let leadingSpaces;
        let trailingSpaces;
        for (let i = 0, length = selections.length; i < length; i++) {
            if (trim && selections[i].length) {
                // Some selections cannot contain spaces on their edges ** dummy** is not valid (but ```  code ``` is valid)
                // So we need to trim spaces from selections that require it, especially before making them it bold or italic
                // then we need to restore spaces around it.
                trimmed = selections[i].trim();
                leadingSpaces = selections[i].search(/[^ ]/); // This is an index starting at 0 for the first char
                if (leadingSpaces === -1) {
                    leadingSpaces = 0; // This means the selection only contains spaces
                }
                trailingSpaces =
                    selections[i].length - trimmed.length - leadingSpaces;
                selections[i] =
                    ' '.repeat(leadingSpaces) +
                    str +
                    trimmed +
                    str +
                    ' '.repeat(trailingSpaces);
            } else {
                selections[i] = str + selections[i] + str;
            }
            if (selections[i] > 2 * str.length) {
                // Cancel duplicate wrappings
                str = `\\${str.split('').join('\\')}`; // Escape characters, especially *
                selections[i] = selections[i]
                    .replace(new RegExp(`^${str}${str}`), '')
                    .replace(new RegExp(`${str + str}$`), '');
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
    _replaceInSelectionsWith(regex, str, match) {
        const cm = this.codeMirror;
        const selections = cm.getSelections();
        if ($.type(str) === CONSTANTS.UNDEFINED) {
            str = `${regex}`;
            regex = undefined;
        }
        for (let i = 0, length = selections.length; i < length; i++) {
            if (
                (typeof regex === CONSTANTS.STRING ||
                    regex instanceof RegExp) &&
                selections[i].length
            ) {
                selections[i] = selections[i].replace(regex, `${str}${match}`);
            } else {
                selections[i] = `${str}`;
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
    _replaceAtBeginningOfLine(str, rx) {
        // TODO clicking twice should cancel
        // TODO spaces at the edge of selections
        // TODO if selection.length = 0, keep it that way
        const cm = this.codeMirror;
        const selections = cm.getSelections();
        const delimiters = cm.listSelections();
        let bol; // Beginning of line
        let eol; // End of line
        for (let i = 0, length = selections.length; i < length; i++) {
            bol =
                cm.posFromIndex(cm.indexFromPos(delimiters[i].anchor) - 1)
                    .line === delimiters[i].anchor.line &&
                delimiters[i].anchor.line > 0
                    ? '\n\n'
                    : '\n';
            eol =
                cm.posFromIndex(cm.indexFromPos(delimiters[i].head) + 1)
                    .line === delimiters[i].head.line
                    ? '\n\n'
                    : '\n';
            selections[i] =
                bol + str + selections[i].replace(/\n/g, `\n${str}`) + eol;
        }
        cm.replaceSelections(selections, 'around');
    },

    /**
     * Enable/Disable component
     * @param enable
     */
    enable(enable) {
        const that = this;
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        that.toolBar.element.children('a.k-button').each((index, element) => {
            that.toolBar.enable(element, enabled);
        });
        that.codeMirror.setOption('readOnly', !enabled);
        // Consider also doing https://github.com/codemirror/CodeMirror/issues/1099
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const that = this;
        const wrapper = that.wrapper;
        // Unbind events
        unbind(wrapper);
        // Clear references

        // Destroy widget
        Widget.fn.destroy.call(that);
        destroy(wrapper);
        // Remove widget class
        // wrapper.removeClass(WIDGET_CLASS);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(MarkEditor);
