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
        './vendor/kendo/kendo.userevents',
        './vendor/kendo/kendo.draganddrop'
        // Popup
        // staticList

        // TODO: remove spreadhseet classes
    ], f);
})(function (mq) {

    'use strict';

    mq = window.MathQuill || mq;

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var ToolBar = kendo.ui.ToolBar;
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
        var RX_INNERFIELD = /\\MathQuillMathField/; // or /\\MathQuillMathField{[\}]*}/
        var KEYSTROKES = {
            BACKSPACE: 'Backspace',
            RIGHT: 'Right'
        };
        var TOOLBAR = [
            [
                'field',
                'backspace'
            ],
            'keypad',
            'basic',
            'lowergreek',
            'uppergreek',
            'operator',
            'expression',
            'group',
            'matrix',
            'statistics',
            'chemistry'
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
                logger.debug({ method: 'init', message: 'widget initialized' });
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
                value: [],
                enable: true,
                errorColor: '#cc0000',
                inline: false,
                // messages: {},
                toolbar: '#toolbar'
                // tools: TOOLS
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
                var that = this;
                if ($.isArray(value) || value instanceof kendo.data.ObservableArray) {
                    var hasChanged = false;
                    for (var i = 0, length = value.length; i < length; i++) {
                        if (that.mathFields[i] instanceof MQ.MathField && that.mathFields[i].latex() !== value[i]) {
                            logger.debug({ method: 'value', message: 'Setting value', data: { value: value }});
                            if ($.type(value[i]) === STRING) {
                                that.mathFields[i].latex(value[i]);
                            } else {
                                that.mathFields[i].latex(that.defaults[i]);
                            }
                            hasChanged = true;
                        }
                    }
                    if (hasChanged) {
                        that.trigger(CHANGE);
                    }
                } else if ($.type(value) === NULL) {
                    // null is the same as [] but we allow it for data bindings
                    that.value([]);
                } else if ($.type(value) === UNDEFINED) {
                    var ret = that.mathFields.map(function (mathField) { return mathField.latex() });
                    var isDefault = true;
                    for (var i = 0, length = ret.length; i < length; i++) {
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
                    }
                }

                // Return a fresh config that MathQuill can modify
                return {
                    // TODO: http://docs.mathquill.com/en/latest/Config/
                    // spaceBehavesLikeTab: true,
                    // leftRightIntoCmdGoes: 'up',
                    // restrictMismatchedBrackets: true,
                    // sumStartsWithNEquals: true,
                    // supSubsRequireOperand: true,
                    // charsThatBreakOutOfSupSub: '+-=<>',
                    // autoSubscriptNumerals: true,
                    // autoCommands: 'pi theta sqrt sum',
                    // autoOperatorNames: 'sin cos',
                    // substituteTextarea: function() { return document.createElement('textarea'); },
                    handlers: that._handlers
                };
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
                that.layout = that.element.text().trim();
                if ($.type(that.layout) === STRING && RX_INNERFIELD.test(that.layout)) {
                    // If the initial layout contains embedded fields
                    that.staticMath = MQ.StaticMath(element.get(0));
                    that.mathFields = that.staticMath.innerFields;
                } else {
                    // // If the initial layout doe snot contain embedded fields
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
            },

            /**
             * Event handler triggered when pressing the enter key
             * @see http://docs.mathquill.com/en/latest/Config/#entermathfield
             * @param mathField
             * @private
             */
            _onEnter: function (mathField) {
                this.trigger(CHANGE);
            },

            /**
             * Event handler triggered when losing focus
             * @see http://docs.mathquill.com/en/latest/Config/#outof-handlers
             * @param direction
             * @param mathField
             * @private
             */
            _onOutOf: function (direction, mathField) {
                window.console.log('_onOutOf')
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
                $(options.toolbar).children(kendo.roleSelector('mathinputtoolbar')).hide();
                // Show widget's toolbar
                if (this._activeField instanceof MQ.MathField) {
                    this.toolBar.wrapper.show();
                }
            },

            /**
             * Event handler for focusing out of the widget element (or any of its MathFields)
             * @param e
             * @private
             */
            _onFocusOut: function (e) {
                var that = this;
                /* This is how kendo.editor does it at ln 698
                setTimeout(function () {
                    // Check whether we are interacting with the toolbar
                    if (!that.toolBar.focused()) {
                        that.toolBar.wrapper.hide();
                    }
                }, 10);
                */
            },

            /**
             * Add a cursor (on mobile devices)
             * @private
             */
            _initCursor: function () {
                // TODO: see http://khan.github.io/math-input/custom.html
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
                that.toolBar = $(DIV)
                    .appendTo(options.toolbar)
                    .kendoMathInputToolBar({
                        tools: options.tools,
                        action: $.proxy(that._onToolBarAction, that),
                        dialog: $.proxy(that._onToolBarDialog, that)
                    })
                    .data('kendoMathInputToolBar');
                that.toolBar.wrapper.hide();
            },

            /**
             * Event handler for triggering an action event from the toolbar
             * @param e
             * @private
             */
            _onToolBarAction: function (e) {
                switch (e.command) {
                    case 'ToolbarFieldCommand':
                        // this._activeField.write('\\sqrt[]{}');
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
                        this._activeField.cmd('\\sqrt'); /// TODO
                        break;
                    case 'ToolbarBackspaceCommand':
                        this._activeField.keystroke(e.options.value);
                        break;
                    case 'ToolbarKeyPadCommand':
                        this._activeField.write(e.options.value);
                        break;
                    case 'ToolbarBasicCommand':
                        this._activeField.write(e.options.value);
                        break;
                    case 'ToolbarLowerGreekCommand':
                        this._activeField.keystroke(KEYSTROKES.BACKSPACE);
                        break;
                    case 'ToolbarUpperGreekCommand':
                        // Currently commented out because this requires a double backspace to delete
                        // if (/^\\text/.test(e.options.value)) {
                        //     this._activeField.write(e.options.value);
                        //     this._activeField.keystroke(KEYSTROKES.RIGHT);
                        // } else {
                        this._activeField.cmd(e.options.value);
                        // }
                        break;
                    case 'ToolbarOperatorCommand':
                        this._activeField.write(e.options.value);
                        break;
                    case 'ToolbarFunctionCommand':
                        this._activeField.write(e.options.value);
                        break;
                    case 'ToolbarSetCommand':
                        this._activeField.write(e.options.value);
                        break;
                    case 'ToolbarMatrixCommand':
                        this._activeField.write(e.options.value);
                        break;
                    case 'ToolbarStatisticsCommand':
                        this._activeField.write(e.options.value);
                        break;
                    case 'ToolbarChemistryCommand':
                        this._activeField.write(e.options.value);
                        break;
                    default:
                        $.noop();
                }
                // In case of focus issues, it might be worth considering implementing the mousedown event
                // on the toolbar to be able to cancel the click so as to keep the focus on the mathquill input
                this._activeField.focus();
            },

            /**
             * Event handler for triggering a dialog event from the toolbar
             * @param e
             * @private
             */
            _onToolBarDialog: function (e) {
                // debugger;
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
                window.console.log('refresh');
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

        /*********************************************************************************
         * MathInputToolBar Widget
         *********************************************************************************/

        kendo.mathinput = { messages: {} };

        var MESSAGES = kendo.mathinput.messages.toolbar = {
            field: 'Field',
            backspace: 'Backspace',
            keypadButtons: {
                comma: ',',
                stop: '.',
                n0: '0',
                n1: '1',
                n2: '2',
                n3: '3',
                n4: '4',
                n5: '5',
                n6: '6',
                n7: '7',
                n8: '8',
                n9: '9',
                a: 'a',
                b: 'b',
                c: 'c',
                i: 'i',
                j: 'j',
                k: 'k',
                n: 'n',
                p: 'p',
                x: 'x',
                y: 'y',
                z: 'z',
                infinity: 'Infinity',
                space: 'Space'
            },
            basicButtons: {

            },
            lowerGreekButtons: {
                alpha: 'Alpha',
                beta: 'Beta',
                gamma: 'Gamma',
                delta: 'Delta',
                epsilon: 'Epsilon', // varepsilon
                zeta: 'Zeta',
                eta: 'Eta',
                theta: 'Theta', // vartheta
                iota: 'Iota',
                kappa: 'Kappa', // varkappa
                lambda: 'Lambda',
                mu: 'Mu',
                nu: 'Nu',
                xi: 'Xi',
                omicron: 'Omicron',
                pi: 'Pi', // varpi
                rho: 'Rho', // varrho
                sigma: 'Sigma', // varsigma
                tau: 'Tau',
                upsilon: 'Upsilon',
                phi: 'Phi', // varphi
                chi: 'Chi',
                psi: 'Psi',
                omega: 'Omega'
            },
            upperGreekButtons: {
                alpha: 'Alpha',
                beta: 'Beta',
                gamma: 'Gamma',
                delta: 'Delta',
                epsilon: 'Epsilon', // varepsilon
                zeta: 'Zeta',
                eta: 'Eta',
                theta: 'Theta', // vartheta
                iota: 'Iota',
                kappa: 'Kappa', // varkappa
                lambda: 'Lambda',
                mu: 'Mu',
                nu: 'Nu',
                xi: 'Xi',
                omicron: 'Omicron',
                pi: 'Pi', // varpi
                rho: 'Rho', // varrho
                sigma: 'Sigma', // varsigma
                tau: 'Tau',
                upsilon: 'Upsilon',
                phi: 'Phi', // varphi
                chi: 'Chi',
                psi: 'Psi',
                omega: 'Omega'
            },
            operatorButtons: {

            },
            expressionButtons: {

            },
            groupButtons: {

            },
            matrixButtons: {

            },
            statisticsButtons: {

            },
            chemistryButtons: {

            }
        };
        var toolDefaults = {
            separator: { type: 'separator' },
            field: {
                type: 'button',
                command: 'ToolbarFieldCommand',
                iconClass: 'textbox'
            },
            backspace: {
                type: 'button',
                command: 'ToolbarBackspaceCommand',
                iconClass: 'rewind' // TODO -------------------- see stylesheet
            },
            keypad: {
                type: 'keypad',
                iconClass: 'n1'
            },
            basic: {
                type: 'basic',
                iconClass: 'alpha'
            },
            lowergreek: {
                type: 'lowergreek',
                iconClass: 'alpha'
            },
            uppergreek: {
                type: 'uppergreek',
                iconClass: 'alpha-maj'
            },
            operator: {
                type: 'operator',
                iconClass: 'beta'
            },
            expression: {
                type: 'expression',
                iconClass: 'gamma'
            },
            group: {
                type: 'group',
                iconClass: 'delta'
            },
            matrix: {
                type: 'matrix',
                iconClass: 'epsilon'
            },
            statistics: {
                type: 'statistics',
                iconClass: 'zeta'
            },
            chemistry: {
                type: 'chemistry',
                iconClass: 'alpha'
            }
        };

        /**
         * MathInputToolBar
         */
        var MathInputToolBar = ToolBar.extend({
            init: function (element, options) {
                options = options || {};
                options.items = this._expandTools(options.tools || MathInputToolBar.prototype.options.tools);
                ToolBar.fn.init.call(this, element, options);
                var handleClick = this._click.bind(this);
                this.element.addClass('k-spreadsheet-toolbar kj-mathinput-toolbar');
                this._addSeparators(this.element);
                this.bind({
                    click: handleClick,
                    toggle: handleClick
                });
            },
            _addSeparators: function (element) {
                var groups = element.children('.k-widget, a.k-button, .k-button-group');
                groups.before('<span class=\'k-separator\' />');
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            _expandTools: function (tools) {
                function expandTool(toolName) {
                    var options = $.isPlainObject(toolName) ? toolName : toolDefaults[toolName] || {};
                    var spriteCssClass = 'k-icon k-font-icon k-i-' + options.iconClass;
                    var type = options.type;
                    var typeDefaults = {
                        splitButton: { spriteCssClass: spriteCssClass },
                        button: { showText: 'overflow' },
                        colorPicker: { toolIcon: spriteCssClass }
                    };
                    var tool = $.extend({
                        name: options.name || toolName,
                        text: MESSAGES[options.name || toolName],
                        spriteCssClass: spriteCssClass,
                        attributes: { title: MESSAGES[options.name || toolName] }
                    }, typeDefaults[type], options);
                    if (type === 'splitButton') {
                        tool.menuButtons = tool.menuButtons.map(expandTool);
                    }
                    tool.attributes[kendo.attr('tool')] = toolName;
                    if (options.property) {
                        tool.attributes[kendo.attr('property')] = options.property;
                    }
                    return tool;
                }
                return tools.reduce(function (tools, tool) {
                    if ($.isArray(tool)) {
                        tools.push({
                            type: 'buttonGroup',
                            buttons: tool.map(expandTool)
                        });
                    } else {
                        tools.push(expandTool.call(this, tool));
                    }
                    return tools;
                }, []);
            },

            /* jshint +W074 */

            _click: function (e) {
                var toolName = e.target.attr(kendo.attr('tool'));
                var tool = toolDefaults[toolName] || {};
                var commandType = tool.command;
                if (!commandType) {
                    return;
                }
                var args = {
                    command: commandType,
                    options: {
                        property: tool.property || null,
                        value: tool.value || null
                    }
                };
                if (typeof args.options.value === 'boolean') {
                    args.options.value = e.checked ? true : null;
                }
                this.action(args);
            },
            events: [
                'click',
                'toggle',
                'open',
                'close',
                'overflowOpen',
                'overflowClose',
                'action',
                'dialog'
            ],
            options: {
                name: 'MathInputToolBar',
                resizable: false,
                tools: TOOLBAR
            },
            focused: function () {
                // TODO: from kendo.editor at ln 8410
                return this.element.find('.k-state-focused').length > 0; // || this.preventPopupHide || this.overflowPopup && this.overflowPopup.visible();
            },
            action: function (args) {
                this.trigger('action', args);
            },
            dialog: function (args) {
                this.trigger('dialog', args);
            },
            refresh: function (activeCell) {
                var range = activeCell;
                var tools = this._tools();
                function setToggle(tool, value) {
                    var toolbar = tool.toolbar;
                    var overflow = tool.overflow;
                    var togglable = toolbar && toolbar.options.togglable || overflow && overflow.options.togglable;
                    if (!togglable) {
                        return;
                    }
                    var toggle = false;
                    if (typeof value === 'boolean') {
                        toggle = value;
                    } else if (typeof value === 'string') {
                        toggle = toolbar.options.value === value;
                    }
                    toolbar.toggle(toggle);
                    if (overflow) {
                        overflow.toggle(toggle);
                    }
                }
                function update(tool, value) {
                    var toolbar = tool.toolbar;
                    var overflow = tool.overflow;
                    if (toolbar && toolbar.update) {
                        toolbar.update(value);
                    }
                    if (overflow && overflow.update) {
                        overflow.update(value);
                    }
                }
                for (var i = 0; i < tools.length; i++) {
                    var property = tools[i].property;
                    var tool = tools[i].tool;
                    var value = kendo.isFunction(range[property]) ? range[property]() : range;
                    if (property === 'gridLines') {
                        value = range.sheet().showGridLines();
                    }
                    if (tool.type === 'button') {
                        setToggle(tool, value);
                    } else {
                        update(tool, value);
                    }
                }
            },
            _tools: function () {
                return this.element.find('[' + kendo.attr('property') + ']').toArray().map(function (element) {
                    element = $(element);
                    return {
                        property: element.attr('data-property'),
                        tool: this._getItem(element)
                    };
                }.bind(this));
            },
            destroy: function () {
                this.element.find('[data-command],.k-button').each(function () {
                    var element = $(this);
                    var instance = element.data('instance');
                    if (instance && instance.destroy) {
                        instance.destroy();
                    }
                });
                ToolBar.fn.destroy.call(this);
            }
        });
        kendo.ui.plugin(MathInputToolBar);

        /*********************************************************************************
         * MathInputToolBar Tools
         *********************************************************************************/

        /**
         * PopupTool
         */
        var PopupTool = kendo.toolbar.Item.extend({
            init: function (options, toolbar) {
                this.element = $('<a href=\'#\' class=\'k-button k-button-icon\'>' + '<span class=\'' + options.spriteCssClass + '\'>' + '</span><span class=\'k-icon k-i-arrow-s\'></span>' + '</a>');
                this.element.on('click touchend', this.open.bind(this)).attr('data-command', options.command);
                this.options = options;
                this.toolbar = toolbar;
                this.attributes();
                this.addUidAttr();
                this.addOverflowAttr();
                this._popup();
            },
            destroy: function () {
                this.popup.destroy();
            },
            open: function (ev) {
                ev.preventDefault();
                this.popup.toggle();
            },
            _popup: function () {
                var element = this.element;
                this.popup = $('<div class=\'k-spreadsheet-popup kj-mathinput-popup\' />').appendTo(element).kendoPopup({
                    anchor: element
                }).data('kendoPopup');
            }
        });

        /*
         kendo.toolbar.registerComponent('dialog', kendo.toolbar.ToolBarButton.extend({
         init: function (options, toolbar) {
         kendo.toolbar.ToolBarButton.fn.init.call(this, options, toolbar);
         this._dialogName = options.dialogName;
         this.element.bind('click touchend', this.open.bind(this)).data('instance', this);
         },
         open: function () {
         this.toolbar.dialog({ name: this._dialogName });
         }
         }));
         kendo.toolbar.registerComponent('exportAsDialog', kendo.toolbar.Item.extend({
         init: function (options, toolbar) {
         this._dialogName = options.dialogName;
         this.toolbar = toolbar;
         this.element = $('<button class=\'k-button k-button-icon\' title=\'' + options.attributes.title + '\'>' + '<span class=\'k-icon k-font-icon k-i-xls\' />' + '</button>').data('instance', this);
         this.element.bind('click', this.open.bind(this)).data('instance', this);
         },
         open: function () {
         this.toolbar.dialog({ name: this._dialogName });
         }
         }));
         */

        /**
         * OverflowDialogButton
         */
        var OverflowDialogButton = kendo.toolbar.OverflowButton.extend({
            init: function (options, toolbar) {
                kendo.toolbar.OverflowButton.fn.init.call(this, options, toolbar);
                this.element.on('click touchend', this._click.bind(this));
                this.message = this.options.text;
                var instance = this.element.data('button');
                this.element.data(this.options.type, instance);
            },
            _click: $.noop
        });

        /**
         * KeyPadTool and KeyPadButton
         */
        var KeyPadTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'keypad',
                    keypad: this,
                    instance: this
                });
            },
            buttons: [
                {
                    value: '7',
                    iconClass: 'n7',
                    text: MESSAGES.keypadButtons.n7
                },
                {
                    value: '8',
                    iconClass: 'n8',
                    text: MESSAGES.keypadButtons.n8
                },
                {
                    value: '9',
                    iconClass: 'n9',
                    text: MESSAGES.keypadButtons.n9
                },
                {
                    value: 'a',
                    iconClass: 'a',
                    text: MESSAGES.keypadButtons.a
                },
                {
                    value: 'b',
                    iconClass: 'b',
                    text: MESSAGES.keypadButtons.b
                },
                {
                    value: 'c',
                    iconClass: 'c',
                    text: MESSAGES.keypadButtons.c
                },
                {
                    value: '4',
                    iconClass: 'n4',
                    text: MESSAGES.keypadButtons.n4
                },
                {
                    value: '5',
                    iconClass: 'n5',
                    text: MESSAGES.keypadButtons.n5
                },
                {
                    value: '6',
                    iconClass: 'n6',
                    text: MESSAGES.keypadButtons.n6
                },
                {
                    value: 'i',
                    iconClass: 'i',
                    text: MESSAGES.keypadButtons.i
                },
                {
                    value: 'j',
                    iconClass: 'j',
                    text: MESSAGES.keypadButtons.j
                },
                {
                    value: 'k',
                    iconClass: 'k',
                    text: MESSAGES.keypadButtons.k
                },
                {
                    value: '1',
                    iconClass: 'n1',
                    text: MESSAGES.keypadButtons.n1
                },
                {
                    value: '2',
                    iconClass: 'n2',
                    text: MESSAGES.keypadButtons.n2
                },
                {
                    value: '3',
                    iconClass: 'n3',
                    text: MESSAGES.keypadButtons.n3
                },
                {
                    value: 'n',
                    iconClass: 'n',
                    text: MESSAGES.keypadButtons.n
                },
                {
                    value: 'p',
                    iconClass: 'p',
                    text: MESSAGES.keypadButtons.p
                },
                {
                    value: 'q',
                    iconClass: 'q',
                    text: MESSAGES.keypadButtons.q
                },
                {
                    value: ',',
                    iconClass: 'comma',
                    text: MESSAGES.keypadButtons.comma
                },
                {
                    value: '0',
                    iconClass: 'n0',
                    text: MESSAGES.keypadButtons.n0
                },
                {
                    value: '.',
                    iconClass: 'stop',
                    text: MESSAGES.keypadButtons.stop
                },
                {
                    value: 'x',
                    iconClass: 'x',
                    text: MESSAGES.keypadButtons.x
                },
                {
                    value: 'y',
                    iconClass: 'y',
                    text: MESSAGES.keypadButtons.y
                },
                {
                    value: 'z',
                    iconClass: 'z',
                    text: MESSAGES.keypadButtons.z
                },
                {
                    value: '\\infinity',
                    iconClass: 'infinity',
                    text: MESSAGES.keypadButtons.infinity
                },
                {
                    value: ' ',
                    iconClass: 'space',
                    text: MESSAGES.keypadButtons.space
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarKeyPadCommand',
                    options: { value: value }
                });
            }
        });
        var KeyPadButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'keypad' });
            }
        });
        kendo.toolbar.registerComponent('keypad', KeyPadTool, KeyPadButton);

        /**
         * BasicTool and BasicButton
         */
        var BasicTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'basic',
                    basic: this,
                    instance: this
                });
            },
            buttons: [
                /*
                {
                    value: '\\alpha',
                    iconClass: 'alpha',
                    text: MESSAGES.basicButtons.alpha
                },
                */
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarBasicCommand',
                    options: { value: value }
                });
            }
        });
        var BasicButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'basic' });
            }
        });
        kendo.toolbar.registerComponent('basic', BasicTool, BasicButton);

        /**
         * LowerGreekTool and LowerGreekButton
         */
        var LowerGreekTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'lowergreek',
                    lowergreek: this,
                    instance: this
                });
            },
            buttons: [
                {
                    value: '\\alpha',
                    iconClass: 'alpha',
                    text: MESSAGES.lowerGreekButtons.alpha
                },
                {
                    value: '\\beta',
                    iconClass: 'beta',
                    text: MESSAGES.lowerGreekButtons.beta
                },
                {
                    value: '\\gamma',
                    iconClass: 'gamma',
                    text: MESSAGES.lowerGreekButtons.gamma
                },
                {
                    value: '\\delta',
                    iconClass: 'delta',
                    text: MESSAGES.lowerGreekButtons.delta
                },
                {
                    value: '\\epsilon',
                    iconClass: 'epsilon',
                    text: MESSAGES.lowerGreekButtons.epsilon
                },
                {
                    value: '\\zeta',
                    iconClass: 'zeta',
                    text: MESSAGES.lowerGreekButtons.zeta
                },
                {
                    value: '\\eta',
                    iconClass: 'eta',
                    text: MESSAGES.lowerGreekButtons.eta
                },
                {
                    value: '\\theta',
                    iconClass: 'theta',
                    text: MESSAGES.lowerGreekButtons.theta
                },
                {
                    value: '\\iota',
                    iconClass: 'iota',
                    text: MESSAGES.lowerGreekButtons.iota
                },
                {
                    value: '\\kappa',
                    iconClass: 'kappa',
                    text: MESSAGES.lowerGreekButtons.kappa
                },
                {
                    value: '\\lambda',
                    iconClass: 'lambda',
                    text: MESSAGES.lowerGreekButtons.lambda
                },
                {
                    value: '\\mu',
                    iconClass: 'mu',
                    text: MESSAGES.lowerGreekButtons.mu
                },
                {
                    value: '\\nu',
                    iconClass: 'nu',
                    text: MESSAGES.lowerGreekButtons.nu
                },
                {
                    value: '\\xi',
                    iconClass: 'xi',
                    text: MESSAGES.lowerGreekButtons.xi
                },
                {
                    value: '\\omicron',
                    iconClass: 'omicron',
                    text: MESSAGES.lowerGreekButtons.omicron
                },
                {
                    value: '\\pi',
                    iconClass: 'pi',
                    text: MESSAGES.lowerGreekButtons.pi
                },
                {
                    value: '\\rho',
                    iconClass: 'rho',
                    text: MESSAGES.lowerGreekButtons.rho
                },
                {
                    value: '\\sigma',
                    iconClass: 'sigma',
                    text: MESSAGES.lowerGreekButtons.sigma
                },
                {
                    value: '\\tau',
                    iconClass: 'tau',
                    text: MESSAGES.lowerGreekButtons.tau
                },
                {
                    value: '\\upsilon',
                    iconClass: 'upsilon',
                    text: MESSAGES.lowerGreekButtons.upsilon
                },
                {
                    value: '\\phi',
                    iconClass: 'phi',
                    text: MESSAGES.lowerGreekButtons.phi
                },
                {
                    value: '\\chi',
                    iconClass: 'chi',
                    text: MESSAGES.lowerGreekButtons.chi
                },
                {
                    value: '\\psi',
                    iconClass: 'psi',
                    text: MESSAGES.lowerGreekButtons.psi
                },
                {
                    value: '\\omega',
                    iconClass: 'omega',
                    text: MESSAGES.lowerGreekButtons.omega
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarLowerGreekCommand',
                    options: { value: value }
                });
            }
        });
        var LowerGreekButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'lowergreek' });
            }
        });
        kendo.toolbar.registerComponent('lowergreek', LowerGreekTool, LowerGreekButton);

        /**
         * UpperGreekTool and UpperGreekButton
         */
        var UpperGreekTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'uppergreek',
                    uppergreek: this,
                    instance: this
                });
            },
            buttons: [
                /*
                // Note: when deleting, you need two strokes to delete unicode characters, one for the unicode character and one for the text directive
                // TODO: So let us comment that for now
                {
                    value: '\\text{\u0391}',
                    iconClass: 'alpha-maj',
                    text: MESSAGES.upperGreekButtons.alpha
                },
                {
                    value: '\\text{\u0392}',
                    iconClass: 'beta-maj',
                    text: MESSAGES.upperGreekButtons.beta
                },
                */
                {
                    value: '\\Gamma',
                    iconClass: 'gamma-maj',
                    text: MESSAGES.upperGreekButtons.gamma
                },
                {
                    value: '\\Delta',
                    iconClass: 'delta-maj',
                    text: MESSAGES.upperGreekButtons.delta
                },
                /*
                {
                    value: '\\text{\u0395}',
                    iconClass: 'epsilon-maj',
                    text: MESSAGES.upperGreekButtons.epsilon
                },
                {
                    value: '\\text{\u0396}',
                    iconClass: 'zeta-maj',
                    text: MESSAGES.upperGreekButtons.zeta
                },
                {
                    value: '\\text{\u0397}',
                    iconClass: 'eta-maj',
                    text: MESSAGES.upperGreekButtons.eta
                },
                */
                {
                    value: '\\Theta',
                    iconClass: 'theta-maj',
                    text: MESSAGES.upperGreekButtons.theta
                },
                /*
                {
                    value: '\\text{\u0399}',
                    iconClass: 'iota-maj',
                    text: MESSAGES.upperGreekButtons.iota
                },
                {
                    value: '\\text{\u039a}',
                    iconClass: 'kappa-maj',
                    text: MESSAGES.upperGreekButtons.kappa
                },
                */
                {
                    value: '\\Lambda',
                    iconClass: 'lambda-maj',
                    text: MESSAGES.upperGreekButtons.lambda
                },
                /*
                {
                    value: '\\text{\u039c}',
                    iconClass: 'mu-maj',
                    text: MESSAGES.upperGreekButtons.mu
                },
                {
                    value: '\\text{\u039d}',
                    iconClass: 'nu-maj',
                    text: MESSAGES.upperGreekButtons.nu
                },
                */
                {
                    value: '\\Xi',
                    iconClass: 'xi-maj',
                    text: MESSAGES.upperGreekButtons.xi
                },
                /*
                {
                    value: '\\text{\u039f}',
                    iconClass: 'omicron-maj',
                    text: MESSAGES.upperGreekButtons.omicron
                },
                */
                {
                    value: '\\Pi',
                    iconClass: 'pi-maj',
                    text: MESSAGES.upperGreekButtons.pi
                },
                /*
                {
                    value: '\\text{\u03a1}',
                    iconClass: 'rho-maj',
                    text: MESSAGES.upperGreekButtons.rho
                },
                */
                {
                    value: '\\Sigma',
                    iconClass: 'sigma-maj',
                    text: MESSAGES.upperGreekButtons.sigma
                },
                /*
                {
                    value: '\\text{\u03a4}',
                    iconClass: 'tau-maj',
                    text: MESSAGES.upperGreekButtons.tau
                },
                */
                {
                    value: '\\Upsilon',
                    iconClass: 'upsilon-maj',
                    text: MESSAGES.upperGreekButtons.upsilon
                },
                {
                    value: '\\Phi',
                    iconClass: 'phi-maj',
                    text: MESSAGES.upperGreekButtons.phi
                },
                /*
                {
                    value: '\\text{\u03a7}',
                    iconClass: 'chi-maj',
                    text: MESSAGES.upperGreekButtons.chi
                },
                */
                {
                    value: '\\Psi',
                    iconClass: 'psi-maj',
                    text: MESSAGES.upperGreekButtons.psi
                },
                {
                    value: '\\Omega',
                    iconClass: 'omega-maj',
                    text: MESSAGES.upperGreekButtons.omega
                }
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarUpperGreekCommand',
                    options: { value: value }
                });
            }
        });
        var UpperGreekButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'uppergreek' });
            }
        });
        kendo.toolbar.registerComponent('uppergreek', UpperGreekTool, UpperGreekButton);

        /**
         * OperatorTool and OperatorButton
         */
        var OperatorTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'operator',
                    operator: this,
                    instance: this
                });
            },
            buttons: [
                /*
                 {
                 value: '\\alpha',
                 iconClass: 'alpha',
                 text: MESSAGES.operatorButtons.alpha
                 },
                 */
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarOperatorCommand',
                    options: { value: value }
                });
            }
        });
        var OperatorButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'operator' });
            }
        });
        kendo.toolbar.registerComponent('operator', OperatorTool, OperatorButton);

        /**
         * ExpressionTool and ExpressionButton
         */
        var ExpressionTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'expression',
                    expression: this,
                    instance: this
                });
            },
            buttons: [
                /*
                 {
                 value: '\\alpha',
                 iconClass: 'alpha',
                 text: MESSAGES.expressionButtons.alpha
                 },
                 */
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarExpressionCommand',
                    options: { value: value }
                });
            }
        });
        var ExpressionButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'expression' });
            }
        });
        kendo.toolbar.registerComponent('expression', ExpressionTool, ExpressionButton);

        /**
         * GroupTool and GroupButton
         */
        var GroupTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'group',
                    group: this,
                    instance: this
                });
            },
            buttons: [
                /*
                 {
                 value: '\\alpha',
                 iconClass: 'alpha',
                 text: MESSAGES.groupButtons.alpha
                 },
                 */
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarGroupCommand',
                    options: { value: value }
                });
            }
        });
        var GroupButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'group' });
            }
        });
        kendo.toolbar.registerComponent('group', GroupTool, GroupButton);

        /**
         * MatrixTool and MatrixButton
         */
        var MatrixTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'matrix',
                    matrix: this,
                    instance: this
                });
            },
            buttons: [
                /*
                 {
                 value: '\\alpha',
                 iconClass: 'alpha',
                 text: MESSAGES.matrixButtons.alpha
                 },
                 */
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarMatrixCommand',
                    options: { value: value }
                });
            }
        });
        var MatrixButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'matrix' });
            }
        });
        kendo.toolbar.registerComponent('matrix', MatrixTool, MatrixButton);

        /**
         * StatisticsTool and StatisticsButton
         */
        var StatisticsTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'statistics',
                    statistics: this,
                    instance: this
                });
            },
            buttons: [
                /*
                 {
                 value: '\\alpha',
                 iconClass: 'alpha',
                 text: MESSAGES.statisticsButtons.alpha
                 },
                 */
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarStatisticsCommand',
                    options: { value: value }
                });
            }
        });
        var StatisticsButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'statistics' });
            }
        });
        kendo.toolbar.registerComponent('statistics', StatisticsTool, StatisticsButton);

        /**
         * ChemistryTool and ChemistryButton
         */
        var ChemistryTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'chemistry',
                    chemistry: this,
                    instance: this
                });
            },
            buttons: [
                /*
                 {
                 value: '\\alpha',
                 iconClass: 'alpha',
                 text: MESSAGES.chemistryButtons.alpha
                 },
                 */
            ],
            destroy: function () {
                this.popup.element.off();
                PopupTool.fn.destroy.call(this);
            },
            _commandPalette: function () {
                var buttons = this.buttons;
                var element = $('<div />').appendTo(this.popup.element);
                buttons.forEach(function (options, index) {
                    var button = '<a title=\'' + options.text + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
                    if (index !== 0 && buttons[index - 1].iconClass !== options.iconClass) {
                        element.append($('<span class=\'k-separator\' />'));
                    }
                    element.append(button);
                });
            },
            _action: function (button) {
                var value = button.attr('data-value');
                this.toolbar.action({
                    command: 'ToolbarChemistryCommand',
                    options: { value: value }
                });
            }
        });
        var ChemistryButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'chemistry' });
            }
        });
        kendo.toolbar.registerComponent('chemistry', ChemistryTool, ChemistryButton);

        /*********************************************************************************
         * MathInputToolBar Dialogs
         *********************************************************************************/

        var MSG = kendo.mathinput.messages.dialogs = {
            apply: 'Apply',
            save: 'Save',
            cancel: 'Cancel',
            remove: 'Remove',
            retry: 'Retry',
            revert: 'Revert',
            okText: 'OK',
            keyPadDialog: {
                title: 'KeyPad',
                buttons: {
                    comma: ',',
                    stop: '.',
                    n0: '0',
                    n1: '1',
                    n2: '2',
                    n3: '3',
                    n4: '4',
                    n5: '5',
                    n6: '6',
                    n7: '7',
                    n8: '8',
                    n9: '9',
                    a: 'a',
                    b: 'b',
                    c: 'c',
                    i: 'i',
                    j: 'j',
                    k: 'k',
                    n: 'n',
                    p: 'p',
                    x: 'x',
                    y: 'y',
                    z: 'z',
                    infinity: 'Infinity',
                    space: 'Space'
                }
            },
            basicDialog: {
                title: 'Basic',
                buttons: {}
            },
            lowerGreekDialog: {
                title: 'Greek (Lower Case)',
                buttons: {
                    alpha: 'Alpha',
                    beta: 'Beta',
                    gamma: 'Gamma',
                    delta: 'Delta',
                    epsilon: 'Epsilon', // varepsilon
                    zeta: 'Zeta',
                    eta: 'Eta',
                    theta: 'Theta', // vartheta
                    iota: 'Iota',
                    kappa: 'Kappa', // varkappa
                    lambda: 'Lambda',
                    mu: 'Mu',
                    nu: 'Nu',
                    xi: 'Xi',
                    omicron: 'Omicron',
                    pi: 'Pi', // varpi
                    rho: 'Rho', // varrho
                    sigma: 'Sigma', // varsigma
                    tau: 'Tau',
                    upsilon: 'Upsilon',
                    phi: 'Phi', // varphi
                    chi: 'Chi',
                    psi: 'Psi',
                    omega: 'Omega'
                }
            },
            upperGreekDialog: {
                title: 'Greek (Upper Case)',
                buttons: {
                    alpha: 'Alpha',
                    beta: 'Beta',
                    gamma: 'Gamma',
                    delta: 'Delta',
                    epsilon: 'Epsilon', // varepsilon
                    zeta: 'Zeta',
                    eta: 'Eta',
                    theta: 'Theta', // vartheta
                    iota: 'Iota',
                    kappa: 'Kappa', // varkappa
                    lambda: 'Lambda',
                    mu: 'Mu',
                    nu: 'Nu',
                    xi: 'Xi',
                    omicron: 'Omicron',
                    pi: 'Pi', // varpi
                    rho: 'Rho', // varrho
                    sigma: 'Sigma', // varsigma
                    tau: 'Tau',
                    upsilon: 'Upsilon',
                    phi: 'Phi', // varphi
                    chi: 'Chi',
                    psi: 'Psi',
                    omega: 'Omega'
                }
            },
            operatorDialog: {
                title: 'Operators',
                buttons: {}
            },
            expressionDialog: {
                title: 'Functions',
                buttons: {}
            },
            groupDialog: {
                title: 'Sets',
                buttons: {}
            },
            matrixDialog: {
                title: 'Matrices',
                buttons: {}
            },
            statisticsDialog: {
                title: 'Statistics',
                buttons: {}
            },
            chemistryDialog: {
                title: 'Chemistry',
                buttons: {}
            }
        };

        /**
         * Dialog registry
         * @type {{}}
         */
        var registry = {};
        kendo.mathinput.dialogs = {
            register: function (name, dialogClass) {
                registry[name] = dialogClass;
            },
            registered: function (name) {
                return !!registry[name];
            },
            create: function (name, options) {
                var dialogClass = registry[name];
                if (dialogClass) {
                    return new dialogClass(options);
                }
            }
        };

        /**
         * MathInputDialog
         */
        var MathInputDialog = kendo.mathinput.MathInputDialog = kendo.Observable.extend({
            init: function (options) {
                kendo.Observable.fn.init.call(this, options);
                this.options = $.extend(true, {}, this.options, options);
                this.bind(this.events, options);
            },
            events: [
                'close',
                'activate'
            ],
            options: { autoFocus: true },
            dialog: function () {
                if (!this._dialog) {
                    this._dialog = $('<div class=\'k-spreadsheet-window k-action-window\' />').addClass(this.options.className || '').append(kendo.template(this.options.template)({
                        messages: kendo.spreadsheet.messages.dialogs || MESSAGES,
                        errors: this.options.errors
                    })).appendTo(document.body).kendoWindow({
                        autoFocus: this.options.autoFocus,
                        scrollable: false,
                        resizable: false,
                        modal: true,
                        visible: false,
                        width: this.options.width || 320,
                        title: this.options.title,
                        open: function () {
                            this.center();
                        },
                        close: this._onDialogClose.bind(this),
                        activate: this._onDialogActivate.bind(this),
                        deactivate: this._onDialogDeactivate.bind(this)
                    }).data('kendoWindow');
                }
                return this._dialog;
            },
            _onDialogClose: function () {
                this.trigger('close', { action: this._action });
            },
            _onDialogActivate: function () {
                this.trigger('activate');
            },
            _onDialogDeactivate: function () {
                this.trigger('deactivate');
                this.destroy();
            },
            destroy: function () {
                if (this._dialog) {
                    this._dialog.destroy();
                    this._dialog = null;
                }
            },
            open: function () {
                this.dialog().open();
            },
            apply: function () {
                this.close();
            },
            close: function () {
                this._action = 'close';
                this.dialog().close();
            }
        });

        /**
         * KeyPadDialog
         */
        var KeyPadDialog = MathInputDialog.extend({
                init: function (options) {
                    var messages = kendo.mathinput.messages.dialogs.keypadDialog || MSG; // TODO: review
                    var defaultOptions = {
                        title: messages.title,
                        buttons: [
                            /*
                             {
                             value: '\\alpha',
                             iconClass: 'alpha',
                             text: messages.keypadButtons.alpha
                             }
                             */
                        ]
                    };
                    MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                    this._list();
                },
                options: { template: '<ul class=\'k-list k-reset\'></ul>' },
                _list: function () {
                    var ul = this.dialog().element.find('ul');
                    this.list = new kendo.ui.StaticList(ul, {
                        dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                        template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                        change: this.apply.bind(this)
                    });
                    this.list.dataSource.fetch();
                },
                apply: function (e) {
                    var dataItem = e.sender.value()[0];
                    MathInputDialog.fn.apply.call(this);
                    this.trigger('action', {
                        command: 'ToolbarKeyPadCommand',
                        options: { value: dataItem.value }
                    });
                }
            });
        kendo.mathinput.dialogs.register('keypad', KeyPadDialog);

        /**
         * BasicDialog
         */
        var BasicDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.basicDialog || MSG; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.basicButtons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarBasicCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('basic', BasicDialog);

        /**
         * LowerGreekDialog
         */
        var LowerGreekDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.lowerGreekDialog || MSG; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        {
                            value: '\\alpha',
                            iconClass: 'alpha',
                            text: messages.lowerGreekButtons.alpha
                        },
                        {
                            value: '\\beta',
                            iconClass: 'beta',
                            text: messages.lowerGreekButtons.beta
                        },
                        {
                            value: '\\gamma',
                            iconClass: 'gamma',
                            text: messages.lowerGreekButtons.gamma
                        },
                        {
                            value: '\\delta',
                            iconClass: 'delta',
                            text: messages.lowerGreekButtons.delta
                        },
                        {
                            value: '\\epsilon',
                            iconClass: 'epsilon',
                            text: messages.lowerGreekButtons.epsilon
                        },
                        {
                            value: '\\zeta',
                            iconClass: 'zeta',
                            text: messages.lowerGreekButtons.zeta
                        },
                        {
                            value: '\\eta',
                            iconClass: 'eta',
                            text: messages.lowerGreekButtons.eta
                        },
                        {
                            value: '\\theta',
                            iconClass: 'theta',
                            text: messages.lowerGreekButtons.theta
                        },
                        {
                            value: '\\iota',
                            iconClass: 'iota',
                            text: messages.lowerGreekButtons.iota
                        },
                        {
                            value: '\\kappa',
                            iconClass: 'kappa',
                            text: messages.lowerGreekButtons.kappa
                        },
                        {
                            value: '\\lambda',
                            iconClass: 'lambda',
                            text: messages.lowerGreekButtons.lambda
                        },
                        {
                            value: '\\mu',
                            iconClass: 'mu',
                            text: messages.lowerGreekButtons.mu
                        },
                        {
                            value: '\\nu',
                            iconClass: 'nu',
                            text: messages.lowerGreekButtons.nu
                        },
                        {
                            value: '\\xi',
                            iconClass: 'xi',
                            text: messages.lowerGreekButtons.xi
                        },
                        {
                            value: '\\omicron',
                            iconClass: 'omicron',
                            text: messages.lowerGreekButtons.omicron
                        },
                        {
                            value: '\\pi',
                            iconClass: 'pi',
                            text: messages.lowerGreekButtons.pi
                        },
                        {
                            value: '\\rho',
                            iconClass: 'rho',
                            text: messages.lowerGreekButtons.rho
                        },
                        {
                            value: '\\sigma',
                            iconClass: 'sigma',
                            text: messages.lowerGreekButtons.sigma
                        },
                        {
                            value: '\\tau',
                            iconClass: 'tau',
                            text: messages.lowerGreekButtons.tau
                        },
                        {
                            value: '\\upsilon',
                            iconClass: 'upsilon',
                            text: messages.lowerGreekButtons.upsilon
                        },
                        {
                            value: '\\phi',
                            iconClass: 'phi',
                            text: messages.lowerGreekButtons.phi
                        },
                        {
                            value: '\\chi',
                            iconClass: 'chi',
                            text: messages.lowerGreekButtons.chi
                        },
                        {
                            value: '\\psi',
                            iconClass: 'psi',
                            text: messages.lowerGreekButtons.psi
                        },
                        {
                            value: '\\omega',
                            iconClass: 'omega',
                            text: messages.lowerGreekButtons.omega
                        }
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarLowerGreekCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('lowergreek', LowerGreekDialog);

        /**
         * UpperGreekDialog
         */
        var UpperGreekDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.upperGreekDialog || MSG; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        {
                            value: '\\Alpha',
                            iconClass: 'alpha-maj',
                            text: messages.upperGreekButtons.alpha
                        },
                        {
                            value: '\\Beta',
                            iconClass: 'beta-maj',
                            text: messages.upperGreekButtons.beta
                        },
                        {
                            value: '\\Gamma',
                            iconClass: 'gamma-maj',
                            text: messages.upperGreekButtons.gamma
                        },
                        {
                            value: '\\Delta',
                            iconClass: 'delta-maj',
                            text: messages.upperGreekButtons.delta
                        },
                        {
                            value: '\\Epsilon',
                            iconClass: 'epsilon-maj',
                            text: messages.upperGreekButtons.epsilon
                        },
                        {
                            value: '\\Zeta',
                            iconClass: 'zeta-maj',
                            text: messages.upperGreekButtons.zeta
                        },
                        {
                            value: '\\Eta',
                            iconClass: 'eta-maj',
                            text: messages.upperGreekButtons.eta
                        },
                        {
                            value: '\\Theta',
                            iconClass: 'theta-maj',
                            text: messages.upperGreekButtons.theta
                        },
                        {
                            value: '\\Iota',
                            iconClass: 'iota-maj',
                            text: messages.upperGreekButtons.iota
                        },
                        {
                            value: '\\Kappa',
                            iconClass: 'kappa-maj',
                            text: messages.upperGreekButtons.kappa
                        },
                        {
                            value: '\\Lambda',
                            iconClass: 'lambda-maj',
                            text: messages.upperGreekButtons.lambda
                        },
                        {
                            value: '\\Mu',
                            iconClass: 'mu-maj',
                            text: messages.upperGreekButtons.mu
                        },
                        {
                            value: '\\Nu',
                            iconClass: 'nu-maj',
                            text: messages.upperGreekButtons.nu
                        },
                        {
                            value: '\\Xi',
                            iconClass: 'xi-maj',
                            text: messages.upperGreekButtons.xi
                        },
                        {
                            value: '\\Omicron',
                            iconClass: 'omicron-maj',
                            text: messages.upperGreekButtons.omicron
                        },
                        {
                            value: '\\Pi',
                            iconClass: 'pi-maj',
                            text: messages.upperGreekButtons.pi
                        },
                        {
                            value: '\\Rho',
                            iconClass: 'rho-maj',
                            text: messages.upperGreekButtons.rho
                        },
                        {
                            value: '\\Sigma',
                            iconClass: 'sigma-maj',
                            text: messages.upperGreekButtons.sigma
                        },
                        {
                            value: '\\Tau',
                            iconClass: 'tau-maj',
                            text: messages.upperGreekButtons.tau
                        },
                        {
                            value: '\\Upsilon',
                            iconClass: 'upsilon-maj',
                            text: messages.upperGreekButtons.upsilon
                        },
                        {
                            value: '\\Phi',
                            iconClass: 'phi-maj',
                            text: messages.upperGreekButtons.phi
                        },
                        {
                            value: '\\Chi',
                            iconClass: 'chi-maj',
                            text: messages.upperGreekButtons.chi
                        },
                        {
                            value: '\\Psi',
                            iconClass: 'psi-maj',
                            text: messages.upperGreekButtons.psi
                        },
                        {
                            value: '\\Omega',
                            iconClass: 'omega-maj',
                            text: messages.upperGreekButtons.omega
                        }
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarUpperGreekCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('uppergreek', UpperGreekDialog);

        /**
         * OperatorDialog
         */
        var OperatorDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.operatorDialog || MSG; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.operatorButtons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarOperatorCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('operator', OperatorDialog);

        /**
         * ExpressionDialog
         */
        var ExpressionDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.expressionDialog || MSG; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.expressionButtons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarExpressionCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('expression', ExpressionDialog);

        /**
         * GroupDialog
         */
        var GroupDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.groupDialog || MSG; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.groupButtons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarGroupCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('group', GroupDialog);

        /**
         * MatrixDialog
         */
        var MatrixDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.matrixDialog || MSG; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.matrixButtons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarMatrixCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('matrix', MatrixDialog);

        /**
         * StatisticsDialog
         */
        var StatisticsDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.statisticsDialog || MSG; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.statisticsButtons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarStatisticsCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('statistics', StatisticsDialog);

        /**
         * ChemistryDialog
         */
        var ChemistryDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.chemistryDialog || MSG; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        /*
                         {
                         value: '\\alpha',
                         iconClass: 'alpha',
                         text: messages.chemistryButtons.alpha
                         }
                         */
                    ]
                };
                MathInputDialog.fn.init.call(this, $.extend(defaultOptions, options));
                this._list();
            },
            options: { template: '<ul class=\'k-list k-reset\'></ul>' },
            _list: function () {
                var ul = this.dialog().element.find('ul');
                this.list = new kendo.ui.StaticList(ul, {
                    dataSource: new kendo.data.DataSource({ data: this.options.buttons }),
                    template: '<a title=\'#=text#\' data-property=\'#=property#\' data-value=\'#=value#\'>' + '<span class=\'k-icon k-i-#=iconClass#\'></span>' + '#=text#' + '</a>',
                    change: this.apply.bind(this)
                });
                this.list.dataSource.fetch();
            },
            apply: function (e) {
                var dataItem = e.sender.value()[0];
                MathInputDialog.fn.apply.call(this);
                this.trigger('action', {
                    command: 'ToolbarChemistryCommand',
                    options: { value: dataItem.value }
                });
            }
        });
        kendo.mathinput.dialogs.register('chemistry', ChemistryDialog);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
