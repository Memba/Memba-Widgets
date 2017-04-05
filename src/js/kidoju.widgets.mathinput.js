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
        // TODO We may need kendo.spreadsheet for toolbar items
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
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var RX_INNERFIELD = /\\MathQuillMathField/; // or /\\MathQuillMathField{[\}]*}/
        var TOOLBAR = [
            [
                'field'
            ],
            'greek'
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
                } else if ($.type(value) === NULL) { // null is the same as [] but we allow it for data bindings
                    logger.debug({ method: 'value', message: 'Setting value', data: { value: null }});
                    // TODO
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
                        // this._activeField.keystroke('Right');
                        this._activeField.cmd('\\sqrt');
                        this._activeField.focus();
                        break;
                    case 'ToolbarGreekCommand':
                        this._activeField.cmd(e.options.value);
                        this._activeField.focus();
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
            greekButtons: {
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
        };
        var toolDefaults = {
            separator: { type: 'separator' },
            field: {
                type: 'button',
                command: 'ToolbarFieldCommand',
                iconClass: 'textbox'
            },
            greek: {
                type: 'greek',
                iconClass: 'alpha'
            }
        };

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

        var DropDownTool = kendo.toolbar.Item.extend({
            init: function (options, toolbar) {
                var dropDownList = $('<select />').kendoDropDownList({ height: 'auto' }).data('kendoDropDownList');
                this.dropDownList = dropDownList;
                this.element = dropDownList.wrapper;
                this.options = options;
                this.toolbar = toolbar;
                this.attributes();
                this.addUidAttr();
                this.addOverflowAttr();
                dropDownList.bind('open', this._open.bind(this));
                dropDownList.bind('change', this._change.bind(this));
                this.element.width(options.width).attr({
                    'data-command': 'PropertyChangeCommand',
                    'data-property': options.property
                });
            },
            _open: function () {
                var ddl = this.dropDownList;
                var list = ddl.list;
                var listWidth;
                list.css({
                    whiteSpace: 'nowrap',
                    width: 'auto'
                });
                listWidth = list.width();
                if (listWidth) {
                    listWidth += 20;
                } else {
                    listWidth = ddl._listWidth;
                }
                list.css('width', listWidth + kendo.support.scrollbar());
                ddl._listWidth = listWidth;
            },
            _change: function (e) {
                var instance = e.sender;
                var value = instance.value();
                var dataItem = instance.dataItem();
                var popupName = dataItem ? dataItem.popup : undefined;
                if (popupName) {
                    this.toolbar.dialog({ name: popupName });
                } else {
                    this.toolbar.action({
                        command: 'PropertyChangeCommand',
                        options: {
                            property: this.options.property,
                            value: value === 'null' ? null : value
                        }
                    });
                }
            },
            value: function (value) {
                if (value !== undefined) {
                    this.dropDownList.value(value);
                } else {
                    return this.dropDownList.value();
                }
            }
        });
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

        // Field
        // TODO: we cannot insert

        // Greek
        var GreekTool = PopupTool.extend({
            init: function (options, toolbar) {
                PopupTool.fn.init.call(this, options, toolbar);
                this.element.attr({ 'data-property': 'greek' });
                this._commandPalette();
                this.popup.element.on('click', '.k-button', function (e) {
                    this._action($(e.currentTarget));
                    this.popup.close();
                }.bind(this));
                this.element.data({
                    type: 'greek',
                    greek: this,
                    instance: this
                });
            },
            buttons: [
                {
                    value: '\\alpha',
                    iconClass: 'alpha',
                    text: MESSAGES.greekButtons.alpha
                },
                {
                    value: '\\beta',
                    iconClass: 'beta',
                    text: MESSAGES.greekButtons.beta
                },
                {
                    value: '\\gamma',
                    iconClass: 'gamma',
                    text: MESSAGES.greekButtons.gamma
                },
                {
                    value: '\\delta',
                    iconClass: 'delta',
                    text: MESSAGES.greekButtons.delta
                },
                {
                    value: '\\epsilon',
                    iconClass: 'epsilon',
                    text: MESSAGES.greekButtons.epsilon
                },
                {
                    value: '\\zeta',
                    iconClass: 'zeta',
                    text: MESSAGES.greekButtons.zeta
                },
                {
                    value: '\\eta',
                    iconClass: 'eta',
                    text: MESSAGES.greekButtons.eta
                },
                {
                    value: '\\theta',
                    iconClass: 'theta',
                    text: MESSAGES.greekButtons.theta
                },
                {
                    value: '\\iota',
                    iconClass: 'iota',
                    text: MESSAGES.greekButtons.iota
                },
                {
                    value: '\\kappa',
                    iconClass: 'kappa',
                    text: MESSAGES.greekButtons.kappa
                },
                {
                    value: '\\lambda',
                    iconClass: 'lambda',
                    text: MESSAGES.greekButtons.lambda
                },
                {
                    value: '\\mu',
                    iconClass: 'mu',
                    text: MESSAGES.greekButtons.mu
                },
                {
                    value: '\\nu',
                    iconClass: 'nu',
                    text: MESSAGES.greekButtons.nu
                },
                {
                    value: '\\xi',
                    iconClass: 'xi',
                    text: MESSAGES.greekButtons.xi
                },
                {
                    value: '\\omicron',
                    iconClass: 'omicron',
                    text: MESSAGES.greekButtons.omicron
                },
                {
                    value: '\\pi',
                    iconClass: 'pi',
                    text: MESSAGES.greekButtons.pi
                },
                {
                    value: '\\rho',
                    iconClass: 'rho',
                    text: MESSAGES.greekButtons.rho
                },
                {
                    value: '\\sigma',
                    iconClass: 'sigma',
                    text: MESSAGES.greekButtons.sigma
                },
                {
                    value: '\\tau',
                    iconClass: 'tau',
                    text: MESSAGES.greekButtons.tau
                },
                {
                    value: '\\upsilon',
                    iconClass: 'upsilon',
                    text: MESSAGES.greekButtons.upsilon
                },
                {
                    value: '\\phi',
                    iconClass: 'phi',
                    text: MESSAGES.greekButtons.phi
                },
                {
                    value: '\\chi',
                    iconClass: 'chi',
                    text: MESSAGES.greekButtons.chi
                },
                {
                    value: '\\psi',
                    iconClass: 'psi',
                    text: MESSAGES.greekButtons.psi
                },
                {
                    value: '\\omega',
                    iconClass: 'omega',
                    text: MESSAGES.greekButtons.omega
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
                    command: 'ToolbarGreekCommand',
                    options: { value: value }
                });
            }
        });
        var GreekButton = OverflowDialogButton.extend({
            _click: function () {
                this.toolbar.dialog({ name: 'greek' });
            }
        });
        kendo.toolbar.registerComponent('greek', GreekTool, GreekButton);

        // Function


        // Operators



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
            greekDialog: {
                title: 'Alignment',
                buttons: {
                    justifyLeft: 'Align left',
                    justifyCenter: 'Center',
                    justifyRight: 'Align right',
                    justifyFull: 'Justify',
                    alignTop: 'Align top',
                    alignMiddle: 'Align middle',
                    alignBottom: 'Align bottom'
                }
            }
        };

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

        var GreekDialog = MathInputDialog.extend({
            init: function (options) {
                var messages = kendo.mathinput.messages.dialogs.greekDialog || MSG; // TODO: review
                var defaultOptions = {
                    title: messages.title,
                    buttons: [
                        {
                            property: 'textAlign',
                            value: 'left',
                            iconClass: 'align-left',
                            text: messages.buttons.justifyLeft
                        },
                        {
                            property: 'textAlign',
                            value: 'center',
                            iconClass: 'align-center',
                            text: messages.buttons.justifyCenter
                        },
                        {
                            property: 'textAlign',
                            value: 'right',
                            iconClass: 'align-right',
                            text: messages.buttons.justifyRight
                        },
                        {
                            property: 'textAlign',
                            value: 'justify',
                            iconClass: 'align-justify',
                            text: messages.buttons.justifyFull
                        },
                        {
                            property: 'verticalAlign',
                            value: 'top',
                            iconClass: 'align-top',
                            text: messages.buttons.alignTop
                        },
                        {
                            property: 'verticalAlign',
                            value: 'center',
                            iconClass: 'align-middle',
                            text: messages.buttons.alignMiddle
                        },
                        {
                            property: 'verticalAlign',
                            value: 'bottom',
                            iconClass: 'align-bottom',
                            text: messages.buttons.alignBottom
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
                    command: 'PropertyChangeCommand',
                    options: {
                        property: dataItem.property,
                        value: dataItem.value
                    }
                });
            }
        });
        kendo.mathinput.dialogs.register('greek', GreekDialog);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
