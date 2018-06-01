/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './vendor/mathquill/mathquill', // Keep at the top considering function parameter below
        './common/window.assert.es6',
        './common/window.logger.es6',
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
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var MathInputToolBar = ui.MathInputToolBar;
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
        var WIDGET_CLASS = 'kj-mathinput kj-interactive'; // 'k-widget kj-mathinput';
        var DIV = '<div/>';
        var RX_CHARACTER = /^[\s\[\]\{\}\(\)\|]$/;
        var RX_SIMPLE_COMMAND = /^\\[a-z]+$/; // These are simple LaTeX commands
        var RX_COMPLEX_COMMAND = /^\\mathbb{[^\}]+}$/; // These are commands with parameters which should be passed to mathField.command instead of mathField.write
        var RX_PARAMS = /[\(\[\{][^\}\]\)]*[\}\]\)]/g;
        var RX_INNERFIELD = /\\MathQuillMathField/; // or /\\MathQuillMathField{[\}]*}/
        var KEYSTROKES = {
            BACKSPACE: 'Backspace',
            LEFT: 'Left',
            RIGHT: 'Right',
            SPACE: 'Spacebar'
        };
        var TOOLBAR = [
            'backspace',
            'field',
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
                // We need to set tools otherwise the options.toolbar.tools array is simply pasted over the TOOLBAR array, which creates duplicates in the overflow
                that.options.toolbar.tools = (options.toolbar || {}).tools || TOOLBAR;
                that._enabled = that.element.prop('disabled') ? false : that.options.enable;
                // that.bind(CHANGE, that.refresh.bind(that));
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
                value: null, // which is either converted to '' or [] depending on inner fields
                enable: true,
                errorColor: '#cc0000',
                mathquill: {
                    // See http://docs.mathquill.com/en/latest/Config/
                    spaceBehavesLikeTab: false, // Otherwise formulas cannot contain spaces
                    leftRightIntoCmdGoes: 'up',
                    restrictMismatchedBrackets: false,
                    sumStartsWithNEquals: true,
                    supSubsRequireOperand: true,
                    charsThatBreakOutOfSupSub: '+-=<>',
                    autoSubscriptNumerals: false, // Otherwise non-isolated numbers are subscript (true is good for chemistry)
                    autoCommands: 'int pi sqrt sum', // The ones you can type without \ in addition to autoOperatorNames
                    autoOperatorNames: 'arccos arcsin arctan cos deg det dim exp lim log ln sin tan', // Otherwise BuiltInOpNames like sin are not converted to \sin
                    // arg deg det dim exp gcd hom inf ker lg lim ln log max min sup limsup liminf injlim projlim Pr
                    // sin cos tan arcsin arccos arctan sinh cosh tanh sec cosec cotan csc cot coth ctg // why coth but not sech and csch, LaTeX?
                    substituteTextarea: function () { return document.createElement('textarea'); },
                    mouseEvents: true // TODO
                },
                toolbar: {
                    container: '',
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
                // We should only update if value has changed because this triggers _onEdit and a CHANGE event
                // which breaks that.trigger(DATABOUND); in kidoju.widgets.stage
                var latex = this.mathFields[0].latex();
                if ($.type(value) === STRING) {
                    if (value !== latex) {
                        this.mathFields[0].latex(value);
                    }
                } else if ($.type(value) === NULL) {
                    this._stringValue('');
                } else if ($.type(value) === UNDEFINED) {
                    return latex;
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
                        deleteOutOf: that._onOutOf.bind(that),
                        downOutOf: that._onOutOf.bind(that),
                        edit: that._onEdit.bind(that),
                        enter: that._onEnter.bind(that),
                        moveOutOf: that._onOutOf.bind(that),
                        selectOutOf: that._onOutOf.bind(that),
                        upOutOf: that._onOutOf.bind(that)
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
                var options = that.options;

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

                // Add focusin and focusout event handlers
                that.element.off(NS);
                // $(document).off(NS);
                if (that._enabled) {
                    that.element
                        .on(FOCUSIN + NS, that._onFocusIn.bind(that))
                        .on(FOCUSOUT + NS, that._onFocusOut.bind(that));
                    // $(document).on(FOCUSIN + NS, that._onFocusOut.bind(that));

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
                var container = $(options.toolbar.container);
                if (container.length) {
                    // $(document).find(kendo.roleSelector('mathinputtoolbar')).hide();
                    container
                        .children(kendo.roleSelector('mathinputtoolbar'))
                        .hide();
                    // Show widget's toolbar
                    if (that._activeField instanceof MQ.MathField && that.toolBar instanceof MathInputToolBar) {
                        setTimeout(function () { // Without setTimeout, iOS does not show the toolbar
                            that.toolBar.wrapper.show();
                        });
                    }
                }
                if (that.toolBar instanceof MathInputToolBar) {
                    that.toolBar.resize();
                }
                logger.debug({ method: '_onFocusIn', message: 'Focus in' });
            },

            /**
             * Event handler for focusing out of the widget element (or any of its MathFields)
             * @param e
             * @private
             */
            _onFocusOut: function (e) {
                var that = this;
                var options = that.options;
                var container = $(options.toolbar.container);
                if (container.length) {
                    // This is how kendo.editor does it at L#698
                    setTimeout(function () {
                        // Check whether we are interacting with the toolbar
                        if (that.toolBar instanceof MathInputToolBar &&
                            that.toolBar.wrapper.has(document.activeElement).length === 0 && // Prevents the toolbar from hiding when clicking buttons
                            !$(document.activeElement).is('.kj-floating')) { // Prevents the toolbar from hiding when moving the floating toolbar container
                            that.toolBar.wrapper.hide();
                        }
                    }, 10);
                }
                logger.debug({ method: '_onFocusOut', message: 'Focus out' });
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
                            resizable: options.toolbar.resizable,
                            action: that._onToolBarAction.bind(that),
                            dialog: that._onToolBarDialog.bind(that)
                        })
                        .data('kendoMathInputToolBar');
                    that.toolBar.wrapper.hide();
                } else if (!options.toolbar.container) {
                    that.element.wrap(DIV);
                    that.wrapper = container = that.element.parent();
                    that.wrapper.addClass('kj-mathinput-wrap');
                    that.toolBar = $(DIV)
                        .prependTo(container)
                        .kendoMathInputToolBar({
                            tools: options.toolbar.tools,
                            resizable: options.toolbar.resizable,
                            action: that._onToolBarAction.bind(that),
                            dialog: that._onToolBarDialog.bind(that)
                        })
                        .data('kendoMathInputToolBar');
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
                    case 'ToolbarBackspaceCommand':
                        this._activeField.keystroke(KEYSTROKES.BACKSPACE);
                        break;
                    case 'ToolbarFieldCommand':
                        // Note: MathQuillFields can be named as in \\MathQuillMathField[name]{}
                        // see https://github.com/mathquill/mathquill/issues/741
                        this._activeField.write('\\MathQuillMathField{}');
                        break;
                    case 'ToolbarKeyPadCommand':
                    case 'ToolbarBasicCommand':
                    case 'ToolbarGreekCommand':
                    case 'ToolbarOperatorsCommand':
                    case 'ToolbarExpressionsCommand':
                    case 'ToolbarSetsCommand':
                    case 'ToolbarMatricesCommand':
                    case 'ToolbarStatisticsCommand':
                    case 'ToolbarUnitsCommand':
                    case 'ToolbarChemistryCommand':
                        // MathQuill has `keystroke`, `typeText`, `write` and `cmd` methods
                        // see http://docs.mathquill.com/en/latest/Api_Methods/#editable-mathfield-methods
                        // `keystroke` is for special keys especially navigation keys and backspaces
                        // `typedText` is for non-latex text especially single characters
                        // Any latex should be passed to MathQuill using `write`
                        // `cmd` is actually a macro, for example
                        // this._activeField.cmd('\\sum');
                        //    is equivalent to
                        // this._activeField.write('\\sum_{}^{}');
                        if (RX_CHARACTER.test(e.params.value)) {
                            // Especially to type spaces
                            this._activeField.typedText(e.params.value);
                        } else if (RX_SIMPLE_COMMAND.test(e.params.value) || RX_COMPLEX_COMMAND.test(e.params.value)) {
                            this._activeField.cmd(e.params.value);
                            // With `cmd`, the cursor is positioned as expected


                            // } else if (/^\\text/.test(e.params.value)) {
                            //     // Currently commented out because this requires a double backspace to delete
                            //     this._activeField.write(e.params.value);
                            //     this._activeField.keystroke(KEYSTROKES.RIGHT);
                        } else if ($.type(e.params.value) === STRING) {
                            this._activeField.write(e.params.value);
                            // With `write`, the cursor is positioned at the end
                            /*
                            var matches = e.params.value.match(RX_PARAMS);
                            // TODO: Note _ and ^ might need to be counted too - see log_{}() which requires 3 keystrokes instead of 2
                            if ($.isArray(matches)) {
                                for (var i = 0, length = matches.length; i < length; i++) {
                                    var content = matches[i].replace(/\\[a-z]+/g, '').replace(/\s/g, '');
                                    if (content.length === 2) {
                                        this._activeField.keystroke(KEYSTROKES.LEFT);
                                    }
                                }
                            }
                            */
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
                var that = this;
                that._enabled = $.type(enabled) === UNDEFINED ? true : !!enabled;
                that._initHandlers();
                if (that.toolBar instanceof MathInputToolBar) {
                    that.toolBar.element.children('a.k-button').each(function (index, button) {
                            that.toolBar.enable(button, enabled);
                        });
                }
                // TODO: Consider hiding the toolbar when floating
                // Also Consider removing the cursor
            },

            /**
             * Refresh the widget
             */
            refresh: function () {
                logger.debug({ method: 'refresh', message: 'Widget refreshed' });
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
                var wrapper = that.wrapper;
                // Unbind events
                that.enable(false);
                kendo.unbind(wrapper);
                // Release references
                if (that.toolBar instanceof MathInputToolBar) {
                    that.toolBar.destroy();
                    that.toolBar.wrapper.remove();
                    that.toolBar = undefined;
                }
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
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(MathInput);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
