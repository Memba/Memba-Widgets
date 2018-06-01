/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './common/window.assert.es6',
        './common/window.logger.es6',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.tabstrip',
        './vendor/kendo/kendo.spreadsheet',
        './kidoju.data',
        './kidoju.tools'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        // shorten references to variables for uglification
        // var fn = Function;
        // var global = fn('return this')();
        var kendo = window.kendo;
        var ui = kendo.ui;
        var Widget = ui.Widget;
        var TabStrip = ui.TabStrip;
        var ToolBar = kendo.spreadsheet.ToolBar; // ATTENTION!, this is not kendo.ui.ToolBar;
        var kidoju = window.kidoju;
        var PageComponent = kidoju.data.PageComponent;
        var adapters = kidoju.adapters;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.formatstrip');
        var UNDEFINED = 'undefined';
        var NULL = 'null';
        var BOOLEAN = 'boolean';
        var NUMBER = 'number';
        var STRING = 'string';
        var CLICK = 'click';
        var DIV = '<div></div>';
        var FORMATBAR_DISABLED = '<div data-role="formatbar" data-enabled="false"></div>';
        var FORMATBAR_DATABIND = '<div data-role="formatbar" data-bind="value: {0}"></div>';
        var COLON = ':';
        var SEMI_COLON = ';';
        var ATTR_SELECTOR = '[{0}="{1}"]';
        var BORDERS = ['border', 'border-bottom', 'border-left', 'border-right', 'border-top'];
        var BORDER_STYLES = ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'initial', 'inherit'];
        var FONT_SIZE_DEFAULT = 14; // Check Kidoju
        var FONT_FAMILY = [/*'Arial', */'Courier New', 'Georgia', 'Times New Roman', 'Trebuchet MS', 'Verdana'];
        var FONT_FAMILY_DEFAULT = 'Arial';
        var TEXT_ALIGN = [/*'left', */'center', 'right', 'justify'];
        var TEXT_ALIGN_DEFAULT = 'left';
        var VERTICAL_ALIGN = [/*'top', */'middle', 'bottom'];
        var VERTICAL_ALIGN_DEFAULT = 'top';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        var Style = kendo.Class.extend({

            /* Blocks are nested too deeply. */
            /* jshint -W073 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Converts an HTML style attribute into a Style class
             * @param style
             */
            init: function (style) {
                $.extend(this, this.defaults);
                if ($.type(style) === STRING) {
                    var styles = style.split(SEMI_COLON);
                    for (var i = 0, total = styles.length; i < total; i++) {
                        var pos = styles[i].indexOf(COLON);
                        var length = styles[i].length;
                        if (pos > 0 && pos < length - 1) {
                            var name = styles[i].substr(0, pos).trim().toLowerCase();
                            var value = styles[i].substr(pos + 1).trim();
                            if (/[\w\-_]+/.test(name) && value) {
                                if (BORDERS.indexOf(name) > -1) {
                                    // break down border attribute into style, width and color
                                    name = kendo.toCamelCase(name);
                                    var matches = value.match(/[\w]+/g);
                                    for (var j = 0; j < matches.length; j++) {
                                        if (BORDER_STYLES.indexOf(matches[j]) > -1) {
                                            this[name + 'Style'] = matches[j];
                                        } else if (!isNaN(parseInt(matches[j], 10))) {
                                            this[name + 'Width'] = matches[j];
                                        } else {
                                            this[name + 'Color'] = matches[j];
                                        }
                                    }
                                } else {
                                    this[kendo.toCamelCase(name)] = value;
                                }
                            }
                        }
                    }
                }
            },

            /* jshint +W073 */

            /* jshint +W074 */

            /**
             * Default values
             */
            defaults: {
                backgroundColor: null,
                borderColor: null,
                borderStyle: null,
                borderWidth: null,
                _borderShortened: true,
                borderBottomColor: null,
                borderBottomStyle: null,
                borderBottomWidth: null,
                _borderBottomShortened: true,
                borderLeftColor: null,
                borderLeftStyle: null,
                borderLeftWidth: null,
                _borderLeftShortened: true,
                borderRightColor: null,
                borderRightStyle: null,
                borderRightWidth: null,
                _borderRightShortened: true,
                borderTopColor: null,
                borderTopStyle: null,
                borderTopWidth: null,
                _borderTopShortened: true,
                color: null,
                fontFamily: null,
                fontSize: null,
                fontStyle: null, // italic
                fontWeight: null, // bold
                textAlign: null,
                textDecoration: null, // underline
                verticalAlign: null,
                whiteSpace: null // nowrap
            },

            /**
             * Comparison
             * @param value
             */
            equals: function (value) {
                if ($.type(value) === STRING) {
                    value = new Style(value);
                }
                return this.backgroundColor === value.backgroundColor &&
                    this.borderColor === value.borderColor &&
                    this.borderStyle === value.borderStyle &&
                    this.borderWidth === value.borderWidth &&
                    this.borderBottomColor === value.borderBottomColor &&
                    this.borderBottomStyle === value.borderBottomStyle &&
                    this.borderBottomWidth === value.borderBottomWidth &&
                    this.borderLeftColor === value.borderLeftColor &&
                    this.borderLeftStyle === value.borderLeftStyle &&
                    this.borderLeftWidth === value.borderLeftWidth &&
                    this.borderRightColor === value.borderRightColor &&
                    this.borderRightStyle === value.borderRightStyle &&
                    this.borderRightWidth === value.borderRightWidth &&
                    this.borderTopColor === value.borderTopColor &&
                    this.borderTopStyle === value.borderTopStyle &&
                    this.borderTopWidth === value.borderTopWidth &&
                    this.color === value.color &&
                    this.fontFamily === value.fontFamily &&
                    this.fontSize === value.fontSize &&
                    this.fontStyle === value.fontStyle &&
                    this.fontWeight === value.fontWeight &&
                    this.textAlign === value.textAlign &&
                    this.textDecoration === value.textDecoration &&
                    this.verticalAlign === value.verticalAlign &&
                    this.whiteSpace === value.whiteSpace;
            },

            /**
             * Converts a Style class into an HTML style attribute
             * @returns {string}
             */
            toString: function () {
                var style = '';
                for (var name in this) {
                    if (this.hasOwnProperty(name) && $.type(this[name]) === STRING && this[name].length) {
                        style += kendo.toHyphens(name) + COLON + this[name] + SEMI_COLON;
                        // TODO: handle shortened borders
                    }
                }
                return style;
            }
        });

        if (window.DEBUG) {
            window.Style = Style;
        }

        /*********************************************************************************
         * Widgets
         *********************************************************************************/

        /**
         * FormatBar (kendoFormatBar)
         * @class FormatBar
         * @extend Widget
         */
        var FormatBar = ToolBar.extend({

            /**
             * Initialize formatBar
             * @param element
             * @param options
             */
            init: function (element, options) {
                options = options || {};
                options.tools = options.tools || FormatBar.prototype.options.tools;
                ToolBar.fn.init.call(this, element, options);
                this.ns = '.kendoFormatBar';
                this._dialogs = [];
                this._value = new Style();
                // this._FixBorderState();
                this.bind('action', $.proxy(this._onAction, this));
                this.bind('dialog', $.proxy(this._onDialog, this));
                this.enable(this.options.enabled);
            },

            /**
             * Options
             */
            options: {
                name: 'FormatBar',
                enabled: true,
                resizable: true,
                tools: [
                    [
                        'bold',
                        'italic',
                        'underline'
                    ],
                    'backgroundColor',
                    'textColor',
                    'borders',
                    'fontSize',
                    'fontFamily',
                    'alignment',
                    'textWrap'
                ]
            },

            /**
             * Value for style binding
             * @param value
             */
            value: function (value) {
                if ($.type(value) === UNDEFINED) {
                    assert.instanceof(Style, this._value, kendo.format(assert.messages.instanceof.default, 'this._value', 'Style'));
                    return this._value.toString();
                } else if ($.type(value) === STRING || $.type(value) === NULL) {
                    this._value = new Style(value);
                    this.refresh();
                } else {
                    return new TypeError('`value` is expected to be a nullable string or undefined');
                }
            },

            /**
             * Fix border buttons state
             * @private
             */
            _FixBorderState: function () {
                var that = this;
                that.element.find('a' + kendo.format(ATTR_SELECTOR, kendo.attr('tool'), 'borders')).click(function (e) {
                    that._enableBorderButtons(false);
                });
            },

            /**
             * Enable/Disable border buttons
             * @private
             */
            _enableBorderButtons: function (enable) {
                enable = $.type(enable) === UNDEFINED ? true : enable;
                var borderpalette = $(kendo.roleSelector('borderpalette'));
                $.each(['allBorders', 'insideBorders', 'insideHorizontalBorders', 'insideVerticalBorders'], function (index, borderType) {
                    borderpalette.find(kendo.format(ATTR_SELECTOR, kendo.attr('border-type'), borderType)).toggleClass('k-state-disabled', !enable);
                });
            },

            /**
             * Action triggered when clicking a command button
             * @param args
             */
            _onAction: function (e) {
                var command = this['_' + e.command]; // e.command is either BorderChangeCommand, PropertyChangeCommand or TextWrapCommand
                if ($.isFunction(command)) {
                    command.call(this, e.options);
                    this.trigger('change');
                    this.refresh();
                }
            },

            /**
             * Dialog triggered when clicking a command button in overflow dropdown
             * @param args
             */
            _onDialog: function (e) {
                var dialog = kendo.spreadsheet.dialogs.create(e.name, e.options);
                if (dialog) {
                    dialog.bind('action', this._onAction.bind(this));
                    dialog.bind('deactivate', this._destroyDialog.bind(this));
                    this._dialogs.push(dialog);
                    dialog.open();
                }
            },

            /**
             * Destroy dialog
             * @private
             */
            _destroyDialog: function () {
                this._dialogs.pop();
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Action triggered when clicking a border button
             * @param options
             * @private
             */
            _BorderChangeCommand: function (options) {
                assert.instanceof(Style, this._value, kendo.format(assert.messages.instanceof.default, 'this._value', 'Style'));
                switch (options.border) {
                    case 'noBorders':
                        this._value.borderColor = null;
                        this._value.borderStyle = null;
                        this._value.borderWidth = null;
                        this._value.borderBottomColor = null;
                        this._value.borderBottomStyle = null;
                        this._value.borderBottomWidth = null;
                        this._value.borderLeftColor = null;
                        this._value.borderLeftStyle = null;
                        this._value.borderLeftWidth = null;
                        this._value.borderRightColor = null;
                        this._value.borderRightStyle = null;
                        this._value.borderRightWidth = null;
                        this._value.borderTopColor = null;
                        this._value.borderTopStyle = null;
                        this._value.borderTopWidth = null;
                        break;
                    case 'outsideBorders':
                        this._value.borderColor = options.style.color;
                        this._value.borderStyle = this._value.borderStyle || 'solid';
                        this._value.borderWidth = this._value.borderWidth || '2px'; // options.style.size
                        break;
                    case 'bottomBorder':
                        this._value.borderBottomColor = options.style.color;
                        this._value.borderBottomStyle = this._value.borderBottomStyle || 'solid';
                        this._value.borderBottomWidth = this._value.borderBottomWidth || '2px'; // options.style.size
                        break;
                    case 'leftBorder':
                        this._value.borderLeftColor = options.style.color;
                        this._value.borderLeftStyle = this._value.borderLeftStyle || 'solid';
                        this._value.borderLeftWidth = this._value.borderLeftWidth || '2px'; // options.style.size
                        break;
                    case 'rightBorder':
                        this._value.borderRightColor = options.style.color;
                        this._value.borderRightStyle = this._value.borderRightStyle || 'solid';
                        this._value.borderRightWidth = this._value.borderRightWidth || '2px'; // options.style.size
                        break;
                    case 'topBorder':
                        this._value.borderTopColor = options.style.color;
                        this._value.borderTopStyle = this._value.borderTopStyle || 'solid';
                        this._value.borderTopWidth = this._value.borderTopWidth || '2px'; // options.style.size
                        break;
                }
                // this._enableBorderButtons();
            },

            /* jshint +W074 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * PropertyChangeCommand
             * @param options
             * @private
             */
            _PropertyChangeCommand: function (options) {
                assert.instanceof(Style, this._value, kendo.format(assert.messages.instanceof.default, 'this._value', 'Style'));
                switch (options.property) {
                    case 'background':
                        this._value.backgroundColor = options.value ? options.value : null;
                        break;
                    case 'bold':
                        this._value.fontWeight = options.value ? 'bold' : null;
                        break;
                    case 'color':
                        this._value.color = options.value ? options.value : null;
                        break;
                    case 'fontFamily':
                        this._value.fontFamily = FONT_FAMILY.indexOf(options.value) > -1 ? options.value : null;
                        break;
                    case 'fontSize':
                        this._value.fontSize = $.type(options.value) === NUMBER && options.value !== FONT_SIZE_DEFAULT ? options.value + 'px' : null;
                        break;
                    case 'italic':
                        this._value.fontStyle = options.value ? 'italic' : null;
                        break;
                    case 'textAlign':
                        this._value.textAlign = TEXT_ALIGN.indexOf(options.value) > -1 ? options.value : null;
                        break;
                    case 'underline':
                        this._value.textDecoration = options.value ? 'underline' : null;
                        break;
                    case 'verticalAlign':
                        this._value.verticalAlign = VERTICAL_ALIGN.indexOf(options.value) > -1 ? options.value : null;
                        break;
                }
            },

            /* jshint +W074 */

            /**
             * TextWrapCommand
             * @param options
             * @private
             */
            _TextWrapCommand: function (options) {
                // SpreadsheetTooolbar sets "white-space: pre-wrap; word-break: break-all;" when options.value === true, otherwise nothing
                this._value.whiteSpace = options.value ? null : 'nowrap';
                // this._value.wordBreak = options.value ? null : 'nowrap';
                // this._value.textOverflow = options.value ? null : 'ellipsis';
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Get the tool value from its property
             * @param property
             * @private
             */
            _getValue: function (property) {
                var that = this;
                switch (property) {
                    case 'noBorders':
                        return {
                            color: '',
                            size: 0
                        };
                    case 'outsideBorders':
                        return {
                            color: this._value.borderColor,
                            size: parseInt(this._value.borderWidth, 10)
                        };
                    case 'bottomBorder':
                        return {
                            color: this._value.borderBottomColor,
                            size: parseInt(this._value.borderBottomWidth, 10)
                        };
                    case 'leftBorder':
                        return {
                            color: this._value.borderLeftColor,
                            size: parseInt(this._value.borderLeftWidth, 10)
                        };
                    case 'rightBorder':
                        return {
                            color: this._value.borderRightColor,
                            size: parseInt(this._value.borderRightWidth, 10)
                        };
                    case 'topBorder':
                        return {
                            color: this._value.borderTopColor,
                            size: parseInt(this._value.borderTopWidth, 10)
                        };
                    case 'background':
                        return this._value.backgroundColor;
                    case 'bold':
                        return this._value.fontWeight === 'bold';
                    case 'color':
                        return this._value.color;
                    case 'fontFamily':
                        return this._value.fontFamily || FONT_FAMILY_DEFAULT;
                    case 'fontSize':
                        return parseInt(this._value.fontSize, 10) || FONT_SIZE_DEFAULT;
                    case 'italic':
                        return this._value.fontStyle === 'italic';
                    case 'textAlign':
                        return this._value.textAlign || TEXT_ALIGN_DEFAULT;
                    case 'underline':
                        return this._value.textDecoration === 'underline';
                    case 'verticalAlign':
                        return this._value.verticalAlign || VERTICAL_ALIGN_DEFAULT;
                    case 'wrap':
                        return this._value.whiteSpace !== 'nowrap';
                    case 'alignment':
                        return {
                            textAlign: function () { return that._value.textAlign || TEXT_ALIGN_DEFAULT; },
                            verticalAlign: function () { return that._value.verticalAlign || VERTICAL_ALIGN_DEFAULT; }
                        };
                    default:
                        return;
                }
            },

            /* jshint +W074 */

            _tools: function () {
                return this.element.find('[data-property]').toArray().map(function (element) {
                    element = $(element);
                    return {
                        property: element.attr('data-property'),
                        tool: this._getItem(element)
                    };
                }.bind(this));
            },

            /**
             * Refresh the toolbar when updating style value
             * @param e
             */
            refresh: function () {
                var tools = this._tools();
                function setToggle(tool, value) {
                    var toolbar = tool.toolbar;
                    var overflow = tool.overflow;
                    var togglable = toolbar && toolbar.options.togglable || overflow && overflow.options.togglable;
                    if (!togglable) {
                        return;
                    }
                    var toggle = false;
                    if (typeof value === BOOLEAN) {
                        toggle = value;
                    } else if (typeof value === STRING) {
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
                    var value = this._getValue(property);
                    if (tool.type === 'button') {
                        setToggle(tool, value);
                    } else {
                        update(tool, value);
                    }
                }
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Enable/disable the toolbar
             * @param item
             * @param enabled
             */
            enable: function (item, enabled) {
                var that = this;
                if ($.type(item) === UNDEFINED && $.type(enabled) === UNDEFINED) {
                    item = true;
                }
                if ($.type(item) === BOOLEAN && $.type(enabled) === UNDEFINED) {
                    enabled = item;
                    var tools = that.element.find('[' + kendo.attr('uid') + ']');
                    $.each(tools, function (index, tool) {
                        that.enable(tool, enabled);
                    });
                    var overflowTools = that.popup.element.find('[' + kendo.attr('uid') + ']');
                    $.each(overflowTools, function (index, tool) {
                        that.enable(tool, enabled);
                    });
                } else {
                    var tool = $(item);
                    ToolBar.fn.enable.call(that, tool, enabled);
                    if (tool.hasClass('k-dropdown')) {
                        var dropDownList = tool.find(kendo.roleSelector('dropdownlist'));
                        var dropDownListWidget = dropDownList.data('kendoDropDownList');
                        dropDownListWidget.enable(enabled);
                    } else if (tool.hasClass('k-combobox')) {
                        var comboBox = tool.find(kendo.roleSelector('combobox'));
                        var comboBoxWidget = comboBox.data('kendoComboBox');
                        comboBoxWidget.enable(enabled);
                    } else if (tool.has('.k-font-icon') && (tool.has('.k-i-arrow-s') || tool.has('.k-text'))) {
                        tool.toggleClass('k-state-disabled', !enabled); // Otherwise the border tool does not look disabled
                        if (enabled) {
                            tool.off(CLICK + that.ns);
                        } else {
                            tool.on(CLICK + that.ns, function (e) {
                                e.preventDefault(); // prevents anchors of overflow popup from navigating or reloading the page
                                e.stopImmediatePropagation(); // prevents following click handlers from executing
                            });
                            // Ensures the above click handler executes first;
                            $._data(tool[0]).events.click.reverse();
                        }
                    }
                }
            },

            /* jshint +W074 */

            /**
             * Destroy
             */
            destroy:  function () {
                this.unbind('action');
                this.unbind('dialog');
                kendo.unbind(this.wrapper);
                ToolBar.fn.destroy.call(this);
            }

        });

        ui.plugin(FormatBar);

        /**
         * FormatStrip (kendoFormatStrip)
         * @class FormatStrip
         * @extend Widget
         */
        var FormatStrip = Widget.extend({

            /**
             * Initializes the widget
             * @method init
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                that._layout();
                kendo.notify(that);
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'FormatStrip',
                messages: {
                    defaultTab: 'Style'
                }
            },

            /**
             * Gets/sets value (a PageComponent)
             * @param value
             * @returns {*}
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === UNDEFINED) {
                    return that._value;
                } else if (value instanceof PageComponent || $.type(value) === NULL) {
                    if (that._value !== value) {
                        that._value = value;
                        that.refresh();
                    }
                } else {
                    throw new TypeError('`value` should be undefined, null or a PageComponent.');
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
                that.element.addClass('kj-formatstrip');
                that._tabStrip();
            },

            /**
             * Create tabStrip
             * @private
             */
            _tabStrip: function () {
                if (!(this.tabStrip instanceof TabStrip)) {
                    this.tabStrip = $(DIV)
                        .appendTo(this.element)
                        .kendoTabStrip({ animation: false }).data('kendoTabStrip');
                }
            },

            /**
             * Get an array of tabs
             * @private
             */
            _tabs: function () {
                var that = this;
                var tabs = [];
                if (this._value instanceof PageComponent) {
                    var tool = that._value.tool;
                    assert.instanceof(kendo.Observable, kidoju.tools, kendo.format(assert.messages.instanceof.default, 'kidoju.tools', 'kendo.Observable'));
                    assert.instanceof(kidoju.Tool, kidoju.tools[tool], kendo.format(assert.messages.instanceof.default, 'kidoju.tools[tool]', 'kidoju.Tool'));
                    var attributes = kidoju.tools[tool].attributes;
                    for (var attr in attributes) {
                        if (attributes.hasOwnProperty(attr) && attributes[attr] instanceof adapters.StyleAdapter) {
                            var styleAdapter = attributes[attr];
                            tabs.push({
                                text: styleAdapter.title,
                                content: kendo.format(FORMATBAR_DATABIND, 'attributes.' + attr)
                            });
                        }
                    }
                }
                if (!tabs.length) {
                    tabs.push({
                        text: that.options.messages.defaultTab,
                        content: FORMATBAR_DISABLED
                    });
                }
                return tabs;
            },

            /**
             * Clear Tabs
             * @private
             */
            _clearTabs: function () {
                assert.instanceof(TabStrip, this.tabStrip, kendo.format(assert.messages.instanceof.default, 'this.tabStrip', 'kendo.ui.TabStrip'));
                var that = this;
                while (that.tabStrip.contentElements.length > 0) {
                    kendo.destroy(that.tabStrip.contentHolder(0));
                    that.tabStrip.contentHolder(0).empty();
                    that.tabStrip.remove(0);
                }
            },

            /**
             * Refresh
             * @param e
             */
            refresh: function () {
                var that = this;
                var tabs = that._tabs();
                that._tabStrip();
                // Clear tabs;
                that._clearTabs();
                // Add tabs
                that.tabStrip.append(tabs);
                // Initialize toolbars
                var formatBars = that.tabStrip.wrapper.find(kendo.roleSelector('formatbar'));
                if (that._value instanceof PageComponent) {
                    kendo.bind(formatBars, that._value);
                } else {
                    kendo.init(formatBars);
                }
                // Select first tab
                that.tabStrip.select(that.tabStrip.element.find('ul>li:first-child'));
            },

            /**
             * Function called by the enabled/disabled bindings
             * @param enabled
             */
            enable: function (enabled) {
                var that = this;
                enabled = $.type(enabled) === UNDEFINED ? true : enabled;
                var tabs = that.tabStrip.tabGroup.children();
                $.each(tabs, function (index, tab) {
                    that.tabStrip.enable(tab, enabled);
                    var formatbar = $(that.tabStrip.contentElements[index]).children(kendo.roleSelector('formatbar'));
                    var formatbarWidget = formatbar.data('kendoFormatBar');
                    formatbarWidget.enable(enabled);
                });
            },

            /**
             * Destroys the widget
             * @method destroy
             */
            destroy: function () {
                var that = this;
                this._clearTabs();
                Widget.fn.destroy.call(this);
            }
        });

        ui.plugin(FormatStrip);

    } (window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
