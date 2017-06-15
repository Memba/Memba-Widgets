/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/mathquill/mathquill', // Keep at the top considering function parameter below
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.window',
        './kidoju.widgets.mathinput.toolbar'
    ], f);
})(function (mq) {

    'use strict';

    mq = window.MathQuill || mq;

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var MQ = mq.getInterface(mq.getInterface.MAX);
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.mathinput');
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var FOCUSIN = 'focusin';
        var FOCUSOUT = 'focusout';
        var DOT = '.';
        var WIDGET = 'kendoMathInput';
        var NS = DOT + WIDGET;
        var WIDGET_CLASS = 'kj-mathinput'; // 'k-widget kj-mathinput';
        // var WIDGET_SELECTOR = DOT + 'kj-mathinput';
        var DIV = '<div/>';
        // var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var RX_SIMPLE_COMMAND = /^\\[a-z]+$/; // These are simple LaTeX commands

        // TODO: review as \\mathbb commands do not seem to work
        var RX_COMPLEX_COMMAND = /^\\mathbb{[^\}]+}$/; // These are commands with parameters which can be passed to mathField.command instead of mathField.write
        var RX_PARAMS = /[\(\[\{][^\}\]\)]*[\}\]\)]/g;
        var RX_INNERFIELD = /\\MathQuillMathField/; // or /\\MathQuillMathField{[\}]*}/
        var KEYSTROKES = {
            BACKSPACE: 'Backspace',
            LEFT: 'Left',
            RIGHT: 'Right'
        };
        var TOOLBAR = [
            'backspace',
            'field',
            'keypad',
            'basic',
            'lowergreek',
            'uppergreek',
            'operator',
            'expression',
            'group',
            'matrix',
            'statistics'
            // 'units',
            // 'chemistry'
        ];

        /*********************************************************************************
         * MathInput Widget
         *********************************************************************************/

        /**
         * MathInput
         * @class MathInput Widget (kendoMathInput)
         */
        var MathInput = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'Widget initialized' });
                that._enabled = that.element.prop('disabled') ? false : that.options.enable;
                // that.bind(CHANGE, $.proxy(that.refresh, that));
                that._layout();
                that.value(that.options.value);
                that.enable(that._enabled);
                // see http://www.telerik.com/forums/kendo-notify()
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'MathInput',
                value: '',
                enable: true,
                errorColor: '#cc0000',
                inline: false,
                mathquill: {
                    // See http://docs.mathquill.com/en/latest/Config/
                    // TODO: These options seem to be global to all MathQuill fields on the same page
                    spaceBehavesLikeTab: true,
                    leftRightIntoCmdGoes: 'up',
                    restrictMismatchedBrackets: true,
                    sumStartsWithNEquals: true,
                    supSubsRequireOperand: true,
                    charsThatBreakOutOfSupSub: '+-=<>',
                    autoSubscriptNumerals: true,
                    autoCommands: 'pi theta sqrt sum',
                    autoOperatorNames: 'sin cos',
                    substituteTextarea: function () { return document.createElement('textarea'); },
                    // Added by JLC
                    showMathQuillFieldAsSymbol: true
                },
                // messages: {},
                toolbar: {
                    container: '#toolbar',
                    resizable: true,
                    tools: TOOLBAR
                }
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE
            ],

            /**
             * Value for MVVM binding
             * @param value
             */
            value: function (value) {
                if (this._hasInnerFields()) {
                    return this._arrayValue(value);
                } else {
                    return this._stringValue(value);
                }
            },

            /**
             * Checks when value should be an array
             * @returns {boolean}
             * @private
             */
            _hasInnerFields: function () {
                // Make sure RX_INNERFIELD does not have the /g option
                return RX_INNERFIELD.test(this.innerHTML);
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Handles value as an array
             * @param value
             * @returns {Array}
             * @private
             */
            _arrayValue: function (value) {
                var that = this;
                var i;
                var length;
                if ($.isArray(value) || value instanceof kendo.data.ObservableArray) {
                    for (i = 0, length = that.mathFields.length; i < length; i++) {
                        if (that.mathFields[i] instanceof MQ.MathField && that.mathFields[i].latex() !== (value[i] || that.defaults[i])) {
                            logger.debug({ method: 'value', message: 'Setting value', data: { value: value }});
                            if ($.type(value[i]) === STRING) {
                                that.mathFields[i].latex(value[i]);
                            } else {
                                that.mathFields[i].latex(that.defaults[i]);
                            }
                        }
                    }
                } else if ($.type(value) === NULL) {
                    that._arrayValue([]);
                } else if ($.type(value) === UNDEFINED) {
                    var ret = that.mathFields.map(function (mathField) { return mathField.latex(); });
                    var isDefault = true;
                    for (i = 0, length = ret.length; i < length; i++) {
                        if (ret[i] !== that.defaults[i]) {
                            isDefault = false;
                            break;
                        }
                    }
                    if (isDefault) {
                        ret = [];
                    }
                    return ret;
                } else {
                    throw new TypeError('`value` is expected to be an array if not undefined');
                }
            },

            /* jshint +W074 */

            /**
             * Handles value as string
             * @param value
             * @private
             */
            _stringValue: function (value) {
                if ($.type(value) === STRING) {
                    this.mathFields[0].latex(value);
                } else if ($.type(value) === UNDEFINED) {
                    return this.mathFields[0].latex();
                } else {
                    throw new TypeError('`value` is expected to be a string if not undefined');
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                that._initMathInput();
                that._initToolBar();
            },

            /**
             * Sets MQ configuration
             * Note: it would have been nice to set handler globally on the MQ object but we need to play nice we others
             * @see http://docs.mathquill.com/en/latest/Api_Methods/#mqconfigconfig
             * @see http://docs.mathquill.com/en/latest/Config/
             * @private
             */
            _getConfig: function () {
                // We cannot build return that.config for all MathFields because MathQuill modifies it and it cannot be reused.
                // Se we keep track of a single instance of handlers and return a new config object at each request.
                var that = this;
                var options = that.options;

                // Cache handlers
                if ($.type(that._handlers) === UNDEFINED) {
                    that._handlers = {
                        deleteOutOf: $.proxy(that._onOutOf, that),
                        downOutOf: $.proxy(that._onOutOf, that),
                        edit: $.proxy(that._onEdit, that),
                        enter: $.proxy(that._onEnter, that),
                        moveOutOf: $.proxy(that._onOutOf, that),
                        selectOutOf: $.proxy(that._onOutOf, that),
                        upOutOf: $.proxy(that._onOutOf, that)
                    };
                }

                // Return a fresh config that MathQuill can modify
                var config = $.extend({}, options.mathquill);
                config.substituteTextarea = options.mathquill.substituteTextarea;
                config.handlers = that._handlers;
                return config;
            },

            /**
             * Initialize
             * @private
             */
            _initMathInput: function () {
                var that = this;
                var element = that.element;
                var options = that.options;
                // Get initial layout within <div></div> or <span></span>
                that.innerHTML = that.element.text().trim();
                if (this._hasInnerFields()) {
                    // If the initial layout contains embedded fields
                    that.staticMath = MQ.StaticMath(element.get(0));
                    that.mathFields = that.staticMath.innerFields;
                    // Named fields are listed as innerFields[name] in addition to innerField[#num]
                    // Considering we do versioning, using field names has no benefit especially if naming cannot be enforced
                } else {
                    // If the initial layout does not contain embedded fields
                    that.mathFields = [MQ.MathField(element.get(0))];
                }
                // Gather defaults
                that.defaults = that.mathFields.map(function (mathField) {
                    return mathField.latex();
                });
            },

            /**
             * Initialize handlers
             * @private
             */
            _initHandlers: function () {
                var that = this;
                // Set config handlers on each field
                for (var i = 0, length = that.mathFields.length; i < length; i++) {
                    that.mathFields[i].config(that._enabled ? that._getConfig() : {});
                    // that.mathFields[i].__controller.editable = that._enabled;
                }
                // Enabled/Disable textareas
                that.element.find('textarea').each(function () {
                    $(this).prop('disabled', !that._enabled);
                });

                // TODO Check interesting code at https://github.com/mathquill/mathquill/blob/master/test/visual.html#L456
                /*
                 MQ.MathField($('#disable-typing')[0], {
                     substituteKeyboardEvents: function (textarea, handlers) {
                         return MQ.saneKeyboardEvents(textarea, $.extend({}, handlers, {
                             cut: $.noop,
                             paste: $.noop,
                             keystroke: $.noop,
                             typedText: $.noop
                     }));
                     }
                 });
                 */

                // Add focusin and mousedown event handlers
                that.element.off(NS);
                if (that._enabled) {
                    that.element
                        .on(FOCUSIN + NS, $.proxy(that._onFocusIn, that))
                        .on(FOCUSOUT + NS, $.proxy(that._onFocusOut, that));
                }
            },

            /**
             * Event handler triggered when MQ content has changed
             * @see http://docs.mathquill.com/en/latest/Config/#editmathfield
             * @param mathField
             * @private
             */
            _onEdit: function (mathField) {
                this.trigger(CHANGE);
                logger.debug({ method: '_onEdit', message: 'Edit' });
            },

            /**
             * Event handler triggered when pressing the enter key
             * @see http://docs.mathquill.com/en/latest/Config/#entermathfield
             * @param mathField
             * @private
             */
            _onEnter: function (mathField) {
                this.trigger(CHANGE);
                logger.debug({ method: '_onEnter', message: 'Enter' });
            },

            /**
             * Event handler triggered when losing focus
             * @see http://docs.mathquill.com/en/latest/Config/#outof-handlers
             * @param direction
             * @param mathField
             * @private
             */
            _onOutOf: function (direction, mathField) {
                logger.debug({ method: '_onOutOf', message: 'Not implemented' });
            },

            /**
             * Event handler for focusing into the widget element (or any of its MathFields)
             * @private
             */
            _onFocusIn: function (e) {
                var that = this;
                var options = that.options;
                // Record MathField with focus
                that._activeField = undefined;
                for (var i = 0, length = that.mathFields.length; i < length; i++) {
                    // if (!that.mathFields[i].__controller.blurred) {
                    if (this.mathFields[i].__controller.textarea.is(e.target)) {
                        that._activeField = that.mathFields[i];
                    }
                }
                // Hide all toolbars
                // $(document).find(kendo.roleSelector('mathinputtoolbar')).hide();
                $(options.toolbar.container).children(kendo.roleSelector('mathinputtoolbar')).hide();
                // Show widget's toolbar
                if (this._activeField instanceof MQ.MathField) {
                    this.toolBar.wrapper.show();
                    this.toolBar.resize();
                }
                logger.debug({ method: '_onFocusIn', message: 'FocusIn' });
            },

            /**
             * Event handler for focusing out of the widget element (or any of its MathFields)
             * @param e
             * @private
             */
            _onFocusOut: function (e) {
                var that = this;
                // This is how kendo.editor does it at ln 698
                setTimeout(function () {
                    // Check whether we are interacting with the toolbar
                    if (that.toolBar.wrapper.has(document.activeElement).length === 0) {
                        that.toolBar.wrapper.hide();
                    }
                }, 10);

                logger.debug({ method: '_onFocusOut', message: 'FocusOut' });
            },

            /**
             * Initialize toolbar
             * Note: let us make this a toolbar for now because it is easier considering existing kendo ui widgets
             * but ultimately we migh need a custom keyboard like http://khan.github.io/math-input/custom.html.
             * Alternatively focusing a math input on mobile devices might bring up a dialog where the toolbar
             * popups have more space to expand like a keyboard.
             * @private
             */
            _initToolBar: function () {
                var that = this;
                var options = that.options;
                var container = $(options.toolbar.container);
                if (container.length) {
                    that.toolBar = $(DIV)
                        .appendTo(container)
                        .kendoMathInputToolBar({
                            tools: options.toolbar.tools,
                            resizable:options.toolbar.resizable,
                            action: $.proxy(that._onToolBarAction, that),
                            dialog: $.proxy(that._onToolBarDialog, that)
                        })
                        .data('kendoMathInputToolBar');
                    that.toolBar.wrapper.hide();
                } else {
                    // TODO add toolbar and wrap
                    $.noop();
                }
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Event handler for triggering an action event from the toolbar
             * @param e
             * @private
             */
            _onToolBarAction: function (e) {
                switch (e.command) {
                    case 'ToolbarFieldCommand':
                        this._activeField.write('\\MathQuillMathField{}');
                        // this._activeField.cmd('\\MathQuillMathField');
                        // TODO: Apparently, MathQuillFields can have a name as in \\MathQuillMathField[name]{}
                        // https://github.com/mathquill/mathquill/issues/741
                        break;
                    case 'ToolbarBackspaceCommand':
                        this._activeField.keystroke(KEYSTROKES.BACKSPACE);
                        break;
                    case 'ToolbarKeyPadCommand':
                    case 'ToolbarBasicCommand':
                    case 'ToolbarLowerGreekCommand':
                    case 'ToolbarUpperGreekCommand':
                    case 'ToolbarOperatorCommand':
                    case 'ToolbarExpressionCommand':
                    case 'ToolbarGroupCommand':
                    case 'ToolbarMatrixCommand':
                    case 'ToolbarStatisticsCommand':
                    case 'ToolbarUnitsCommand':
                    case 'ToolbarChemistryCommand':
                        // this._activeField.write('^{}');
                        // this._activeField.cmd('^');
                        // this._activeField.write('_{}');
                        // this._activeField.cmd('_');
                        // \times\div\pm\pi\degree\ne\ge\le><
                        // \frac{ }{ }\sqrt{ }\sqrt[3]{}\sqrt[]{}\ ^{ }\ _{ }
                        // \angle\parallel\perp\triangle\parallelogram
                        // this._activeField.write('\\sum_{}^{}');
                        // this._activeField.cmd('\\sum');
                        // this._activeField.keystroke('Left');
                        // this._activeField.keystroke(KEYSTROKES.RIGHT);
                        // TODO Review RX_COMPLEX
                        if (RX_SIMPLE_COMMAND.test(e.options.value) || RX_COMPLEX_COMMAND.test(e.options.value)) {
                            this._activeField.cmd(e.options.value);
                            // } else if (/^\\text/.test(e.options.value)) {
                            //     // Currently commented out because this requires a double backspace to delete
                            //     this._activeField.write(e.options.value);
                            //     this._activeField.keystroke(KEYSTROKES.RIGHT);
                        } else if ($.type(e.options.value) === STRING) {
                            this._activeField.write(e.options.value);
                            var matches = e.options.value.match(RX_PARAMS);
                            // TODO: Note _ and ^ might need to be counted to - see log_{}() which requires 3 keystrokes instead of 2
                            if ($.isArray(matches)) {
                                for (var i = 0, length = matches.length; i < length; i++) {
                                    var content = matches[i].replace(/\\[a-z]+/g, '').replace(/\s/g, '');
                                    if (content.length === 2) {
                                        this._activeField.keystroke(KEYSTROKES.LEFT);
                                    }
                                }
                            }
                        }
                }
                // In case of focus issues, it might be worth considering implementing the mousedown event
                // on the toolbar to be able to cancel the click so as to keep the focus on the mathquill input
                this._activeField.focus();
            },

            /* jshint +W074 */

            /**
             * Event handler for triggering a dialog event from the toolbar
             * @param e
             * @private
             */
            _onToolBarDialog: function (e) {
                assert.isPlainObject(e, kendo.format(assert.messages.isPlainObject.default, 'e'));
                this._openDialog(e.name, e.options);
            },

            /**
             *
             * @param name
             * @param options
             * @returns {name}
             * @private
             */
            _openDialog: function (name, options) {
                var dialog = kendo.mathinput.dialogs.create(name, options);
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

            /**
             *
             * @private
             */
            _destroyDialog: function () {
                this._dialogs.pop();
            },

            /**
             * Enable
             * @param enabled
             */
            enable: function (enabled) {
                this._enabled = !!enabled;
                this._initHandlers();
                // TODO hide cursor
                // TODO hide toolbar
            },

            /**
             * Refresh the widget
             */
            refresh: function () {
                logger.debug({ method: 'refresh', message: 'Widget refreshed'});
            },

            /**
             * Return latex as text, especially for mathjs
             */
            text: function () {
                var that = this;
                if (that.staticMath instanceof MQ.StaticMath) {
                    return that.staticMath.text();
                } else if ($.isArray(that.mathFields) && that.mathFields.length === 1 && that.mathFields[0] instanceof MQ.MathField) {
                    return that.mathFields[0].text();
                }
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                // Unbind events
                that.enable(false);
                // Release references
                that.toolBar.destroy();
                that.toolBar.wrapper.remove();
                that.toolBar = undefined;
                // http://docs.mathquill.com/en/latest/Api_Methods/#revert
                if (that.staticMath instanceof MQ.StaticMath) {
                    that.staticMath.revert();
                    that.staticMath = undefined;
                } else if ($.isArray(that.mathFields) && that.mathFields.length === 1 && that.mathFields[0] instanceof MQ.MathField) {
                    that.mathFields[0].revert();
                    that.mathFields = undefined;
                }
                // Destroy kendo
                Widget.fn.destroy.call(that);
                kendo.destroy(element);
                // Remove widget class
                element.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(MathInput);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
