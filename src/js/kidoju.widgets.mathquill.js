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

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var ToolBar = kendo.ui.ToolBar;
        var MQ = mq.getInterface(mq.getInterface.MAX);
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.mathquill');
        var FUNCTION = 'function';
        var STRING = 'string';
        var NULL = 'null';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DOT = '.';
        var WIDGET = 'kendoMathQuill';
        var NS = DOT + WIDGET;
        var WIDGET_CLASS = 'kj-mathquill'; // 'k-widget kj-mathquill';
        var WIDGET_SELECTOR = DOT + 'kj-mathquill';
        var DIV = '<div/>';
        var SPAN = '<span/>';
        var ATTRIBUTE_SELECTOR = '[{0}="{1}"]';
        var TOOLS = [
            'cut',
            'copy',
            'paste'
        ];
        var TOOLBAR = [
            TOOLS
        ];

        /*********************************************************************************
         * MathQuill Widget
         *********************************************************************************/

        /**
         * MathQuill
         * @class MathQuill Widget (kendoMathQuill)
         */
        var MathQuill = Widget.extend({

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
                that.bind(CHANGE, $.proxy(that.refresh, that));
                that._layout();
                that.value(that.options.value);
                // see http://www.telerik.com/forums/kendo-notify()
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'MathQuill',
                value: null,
                errorColor: '#cc0000',
                inline: false,
                toolbar: '#toolbar'
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
                if ($.type(value) === STRING || $.type(value) === NULL) {
                    if (that.mathField.latex() !== value) {
                        that.mathField.latex(value);
                        that.trigger(CHANGE, { value: value });
                    }
                } else if ($.type(value) === UNDEFINED) {
                    return that.mathField.latex();
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
                that._initMathQuill();
                that._initToolBar();
            },

            /**
             * Initialize
             * @private
             */
            _initMathQuill: function () {
                var that = this;
                var element = that.element;
                if (element.is('span')) {
                    that.mathField = MQ.MathField(
                        element.get(0),
                        {
                            handlers: {
                                edit: $.proxy(that._onEdit, that)
                                // enter: function() { submitLatex(latex); }
                            }
                        }
                    );
                } else {
                    // TODO: height, width???
                    that.mathField = MQ.MathField(
                        $(SPAN).width('100%').appendTo(element).get(0),
                        {
                            handlers: {
                                edit: $.proxy(that._onEdit, that),
                                enter: $.proxy(that._onEnter, that)
                            }
                        }
                    );
                }
            },

            /**
             *
             * @see http://docs.mathquill.com/en/latest/Config/#editmathfield
             * @param mathField
             * @private
             */
            _onEdit: function (mathField) {
               this.trigger(CHANGE, { value: mathField.latex() });
            },

            /**
             *
             * @see http://docs.mathquill.com/en/latest/Config/#entermathfield
             * @param mathField
             * @private
             */
            _onEnter: function (mathField) {
                this.trigger(CHANGE, { value: mathField.latex() });
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
                    .kendoMathQuillToolBar({
                        tools: options.tools,
                        action: $.proxy(that._onToolBarAction, that),
                        dialog: $.proxy(that._onToolBarDialog, that)
                    })
                    .data('kendoMathQuillToolBar');
                // that._setTool('select');
            },

            /**
             * Set the current tool
             * @private
             */
            _setTool: function (tool) {
                assert.enum(TOOLS, tool, kendo.format(assert.messages.enum.default, 'tool', TOOLS));
                window.assert(MathQuillToolBar, this.toolBar, kendo.format(assert.messages.instanceof.default, 'this.toolBar', 'kendo.ui.MathQuillToolBar'));
                var buttonElement = this.toolBar.element.find(kendo.format(ATTRIBUTE_SELECTOR, kendo.attr('tool'), tool));
                this.toolBar.toggle(buttonElement, true);
                if (tool === 'select') {
                    this.wrapper.css({ cursor: 'default' });
                } else {
                    this.wrapper.css({ cursor: 'crosshair' });
                }
                this._tool = tool;
            },

            /**
             * Event handler for triggering an action event from the toolbar
             * @param e
             * @private
             */
            _onToolBarAction: function (e) {
                switch (e.command) {
                    case 'ToolbarCutCommand':
                        // this.mathField.write('\\sqrt[]{}');
                        this.mathField.cmd('\\sqrt');
                        break;
                    case 'ToolbarCopyCommand':
                        // this.mathField.write('^{}');
                        this.mathField.cmd('^');
                        // this.mathField.write('_{}');
                        // this.mathField.cmd('_');
                        break;
                    case 'ToolbarPasteCommand':
                        // this.mathField.write('\\sum_{}^{}');
                        this.mathField.cmd('\\sum');
                        // this.mathField.keystroke('Left');
                        // this.mathField.keystroke('Right');
                        break;
                    default:
                        $.noop();
                }
                // In case of focus issues, it might be worth considering implementing the mousedown event
                // on the toolbar to be able to cancel the click so as to keep the focus on the mathquill input
                this.mathField.focus();
            },

            /**
             * Event handler for triggering a dialog event from the toolbar
             * @param e
             * @private
             */
            _onToolBarDialog: function (e) {
                debugger;
            },

            /**
             * Add a cursor
             * @private
             */
            _setCursor: function () {
                // TODO: see http://khan.github.io/math-input/custom.html
            },

            /**
             * Refresh the widget
             */
            refresh: function () {

            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var element = that.element;
                // Unbind events
                // Release references
                that.toolBar.destroy();
                that.toolBar.element.remove();
                that.toolBar = undefined;
                that.mathField = undefined;
                // Destroy kendo
                Widget.fn.destroy.call(that);
                kendo.destroy(element);
                // Remove widget class
                element.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(MathQuill);

        /*********************************************************************************
         * MathQuillToolBar Widget
         *********************************************************************************/

        var MESSAGES = {
            copy: 'Copy',
            cut: 'Cut',
            paste: 'Paste'
        };
        var toolDefaults = {
            separator: { type: 'separator' },
            cut: {
                type: 'button',
                command: 'ToolbarCutCommand',
                iconClass: 'cut'
            },
            copy: {
                type: 'button',
                command: 'ToolbarCopyCommand',
                iconClass: 'copy'
            },
            paste: {
                type: 'button',
                command: 'ToolbarPasteCommand',
                iconClass: 'paste'
            }
        };

        var MathQuillToolBar = ToolBar.extend({
            init: function (element, options) {
                options = options || {};
                options.items = this._expandTools(options.tools || MathQuillToolBar.prototype.options.tools);
                ToolBar.fn.init.call(this, element, options);
                var handleClick = this._click.bind(this);
                this.element.addClass('k-spreadsheet-toolbar');
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
                name: 'MathQuillToolBar',
                resizable: false,
                tools: TOOLBAR
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

        kendo.ui.plugin(MathQuillToolBar);

        /*********************************************************************************
         * MathQuillToolBar Tools
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
                this.popup = $('<div class=\'k-spreadsheet-popup\' />').appendTo(element).kendoPopup({ anchor: element }).data('kendoPopup');
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

        // Color Picker
        /*
         var ColorPicker = PopupTool.extend({
         init: function (options, toolbar) {
         PopupTool.fn.init.call(this, options, toolbar);
         this.popup.element.addClass('k-spreadsheet-colorpicker');
         this.colorChooser = new kendo.spreadsheet.ColorChooser(this.popup.element, { change: this._colorChange.bind(this) });
         this.element.attr({ 'data-property': options.property });
         this.element.data({
         type: 'colorPicker',
         colorPicker: this,
         instance: this
         });
         },
         destroy: function () {
         this.colorChooser.destroy();
         PopupTool.fn.destroy.call(this);
         },
         update: function (value) {
         this.value(value);
         },
         value: function (value) {
         this.colorChooser.value(value);
         },
         _colorChange: function (e) {
         this.toolbar.action({
         command: 'PropertyChangeCommand',
         options: {
         property: this.options.property,
         value: e.sender.value()
         }
         });
         this.popup.close();
         }
         });
         var ColorPickerButton = OverflowDialogButton.extend({
         init: function (options, toolbar) {
         options.iconName = 'text';
         OverflowDialogButton.fn.init.call(this, options, toolbar);
         },
         _click: function () {
         this.toolbar.dialog({
         name: 'colorPicker',
         options: {
         title: this.options.property,
         property: this.options.property
         }
         });
         }
         });
         kendo.toolbar.registerComponent('colorPicker', ColorPicker, ColorPickerButton);
         */


        // border
        /*
         var BorderChangeTool = PopupTool.extend({
         init: function (options, toolbar) {
         PopupTool.fn.init.call(this, options, toolbar);
         this._borderPalette();
         this.element.data({
         type: 'borders',
         instance: this
         });
         },
         destroy: function () {
         this.borderPalette.destroy();
         PopupTool.fn.destroy.call(this);
         },
         _borderPalette: function () {
         var element = $('<div />').appendTo(this.popup.element);
         this.borderPalette = new kendo.spreadsheet.BorderPalette(element, { change: this._action.bind(this) });
         },
         _action: function (e) {
         this.toolbar.action({
         command: 'BorderChangeCommand',
         options: {
         border: e.type,
         style: {
         size: 1,
         color: e.color
         }
         }
         });
         }
         });
         var BorderChangeButton = OverflowDialogButton.extend({
         _click: function () {
         this.toolbar.dialog({ name: 'borders' });
         }
         });
         kendo.toolbar.registerComponent('borders', BorderChangeTool, BorderChangeButton);
         */

        // Alignment
        /*
         var AlignmentTool = PopupTool.extend({
         init: function (options, toolbar) {
         PopupTool.fn.init.call(this, options, toolbar);
         this.element.attr({ 'data-property': 'alignment' });
         this._commandPalette();
         this.popup.element.on('click', '.k-button', function (e) {
         this._action($(e.currentTarget));
         }.bind(this));
         this.element.data({
         type: 'alignment',
         alignment: this,
         instance: this
         });
         },
         buttons: [
         {
         property: 'textAlign',
         value: 'left',
         iconClass: 'justify-left',
         text: MESSAGES.alignmentButtons.justtifyLeft
         },
         {
         property: 'textAlign',
         value: 'center',
         iconClass: 'justify-center',
         text: MESSAGES.alignmentButtons.justifyCenter
         },
         {
         property: 'textAlign',
         value: 'right',
         iconClass: 'justify-right',
         text: MESSAGES.alignmentButtons.justifyRight
         },
         {
         property: 'textAlign',
         value: 'justify',
         iconClass: 'justify-full',
         text: MESSAGES.alignmentButtons.justifyFull
         },
         {
         property: 'verticalAlign',
         value: 'top',
         iconClass: 'align-top',
         text: MESSAGES.alignmentButtons.alignTop
         },
         {
         property: 'verticalAlign',
         value: 'center',
         iconClass: 'align-middle',
         text: MESSAGES.alignmentButtons.alignMiddle
         },
         {
         property: 'verticalAlign',
         value: 'bottom',
         iconClass: 'align-bottom',
         text: MESSAGES.alignmentButtons.alignBottom
         }
         ],
         destroy: function () {
         this.popup.element.off();
         PopupTool.fn.destroy.call(this);
         },
         update: function (range) {
         var textAlign = range.textAlign();
         var verticalAlign = range.verticalAlign();
         var element = this.popup.element;
         element.find('.k-button').removeClass('k-state-active');
         if (textAlign) {
         element.find('[data-property=textAlign][data-value=' + textAlign + ']').addClass('k-state-active');
         }
         if (verticalAlign) {
         element.find('[data-property=verticalAlign][data-value=' + verticalAlign + ']').addClass('k-state-active');
         }
         },
         _commandPalette: function () {
         var buttons = this.buttons;
         var element = $('<div />').appendTo(this.popup.element);
         buttons.forEach(function (options, index) {
         var button = '<a title=\'' + options.text + '\' data-property=\'' + options.property + '\' data-value=\'' + options.value + '\' class=\'k-button k-button-icon\'>' + '<span class=\'k-icon k-font-icon k-i-' + options.iconClass + '\'></span>' + '</a>';
         if (index !== 0 && buttons[index - 1].property !== options.property) {
         element.append($('<span class=\'k-separator\' />'));
         }
         element.append(button);
         });
         },
         _action: function (button) {
         var property = button.attr('data-property');
         var value = button.attr('data-value');
         this.toolbar.action({
         command: 'PropertyChangeCommand',
         options: {
         property: property,
         value: value
         }
         });
         }
         });
         var AlignmentButton = OverflowDialogButton.extend({
         _click: function () {
         this.toolbar.dialog({ name: 'alignment' });
         }
         });
         kendo.toolbar.registerComponent('alignment', AlignmentTool, AlignmentButton);
         */



    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
