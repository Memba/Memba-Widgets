/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Use StyleSataSource
// TODO Consider renaming into StyleStrip
// TODO Remove dependency on kendo.spreadsheet
// TODO externalize data in html file
// TODO Should not need adapters and PageComponent

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.binder';
import 'kendo.tabstrip';
import 'kendo.spreadsheet';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
// import Style from '../common/window.style.es6';
import { PageComponent } from '../data/data.pagecomponent.es6';
import StyleAdapter from '../tools/adapters.style.es6';
import _tools from '../tools/tools.es6';
import { BaseTool } from '../tools/tools.base.es6';

const {
    attr,
    bind,
    Class,
    destroy,
    format,
    init,
    roleSelector,
    spreadsheet: { dialogs, ToolBar }, // TODO Remove! this is not kendo.ui.ToolBar;
    toCamelCase,
    toHyphens,
    ui: { plugin, TabStrip, Widget },
    unbind
} = window.kendo;
const logger = new Logger('widgets.formatstrip');

// const NS = '.kendoFormatStrip';
// const WIDGET_CLASS = 'kj-formatstrip'; // 'k-widget kj-formatstrip';

const FORMATBAR_DISABLED =
    '<div data-role="formatbar" data-enabled="false"></div>';
const FORMATBAR_DATABIND =
    '<div data-role="formatbar" data-bind="value: {0}"></div>';
const ATTR_SELECTOR = '[{0}="{1}"]';
const BORDERS = [
    'border',
    'border-bottom',
    'border-left',
    'border-right',
    'border-top'
];
const BORDER_STYLES = [
    'none',
    'hidden',
    'dotted',
    'dashed',
    'solid',
    'double',
    'groove',
    'ridge',
    'inset',
    'outset',
    'initial',
    'inherit'
];
const FONT_SIZE_DEFAULT = 14; // Check Kidoju
const FONT_FAMILY = [
    /* 'Arial', */ 'Courier New',
    'Georgia',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana'
];
const FONT_FAMILY_DEFAULT = 'Arial';
const TEXT_ALIGN = [/* 'left', */ 'center', 'right', 'justify'];
const TEXT_ALIGN_DEFAULT = 'left';
const VERTICAL_ALIGN = ['top', 'middle', 'bottom'];
const VERTICAL_ALIGN_DEFAULT = 'baseline';

/** *******************************************************************************
 * Helpers
 ******************************************************************************** */

const Style = Class.extend({
    /**
     * Converts an HTML style attribute into a Style class
     * @param style
     */
    init(style) {
        $.extend(this, this.defaults);
        if ($.type(style) === CONSTANTS.STRING) {
            const styles = style.split(CONSTANTS.SEMICOLON);
            for (let i = 0, total = styles.length; i < total; i++) {
                const pos = styles[i].indexOf(CONSTANTS.COLON);
                const { length } = styles[i];
                if (pos > 0 && pos < length - 1) {
                    let name = styles[i]
                        .substr(0, pos)
                        .trim()
                        .toLowerCase();
                    const value = styles[i].substr(pos + 1).trim();
                    if (/[\w\-_]+/.test(name) && value) {
                        if (BORDERS.indexOf(name) > -1) {
                            // break down border attribute into style, width and color
                            name = toCamelCase(name);
                            const matches = value.match(/[\w]+/g);
                            for (let j = 0; j < matches.length; j++) {
                                if (BORDER_STYLES.indexOf(matches[j]) > -1) {
                                    this[`${name}Style`] = matches[j];
                                } else if (
                                    !Number.isNaN(parseInt(matches[j], 10))
                                ) {
                                    this[`${name}Width`] = matches[j];
                                } else {
                                    this[`${name}Color`] = matches[j];
                                }
                            }
                        } else {
                            this[toCamelCase(name)] = value;
                        }
                    }
                }
            }
        }
    },

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
    equals(value) {
        if ($.type(value) === CONSTANTS.STRING) {
            value = new Style(value);
        }
        return (
            this.backgroundColor === value.backgroundColor &&
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
            this.whiteSpace === value.whiteSpace
        );
    },

    /**
     * Converts a Style class into an HTML style attribute
     * @returns {string}
     */
    toString() {
        let style = '';
        Object.keys(this).forEach(name => {
            if (
                Object.prototype.hasOwnProperty.call(this, name) &&
                $.type(this[name]) === CONSTANTS.STRING &&
                this[name].length
            ) {
                style +=
                    toHyphens(name) +
                    CONSTANTS.COLON +
                    this[name] +
                    CONSTANTS.SEMICOLON;
                // TODO: handle shortened borders
            }
        });
        return style;
    }
});

if (window.DEBUG) {
    window.Style = Style;
}

/** *******************************************************************************
 * Widgets
 ******************************************************************************** */

/**
 * FormatBar (kendoFormatBar)
 * @class FormatBar
 * @extends Widget
 */
const FormatBar = ToolBar.extend({
    /**
     * Initialize formatBar
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Object.assign(options, {
            tools: options.tools || FormatBar.prototype.options.tools
        });
        ToolBar.fn.init.call(this, element, options);
        this.ns = '.kendoFormatBar';
        this._dialogs = [];
        this._value = new Style();
        // this._FixBorderState();
        this.bind('action', this._onAction.bind(this));
        this.bind('dialog', this._onDialog.bind(this));
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
            ['bold', 'italic', 'underline'],
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
    value(value) {
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            assert.instanceof(
                Style,
                this._value,
                assert.format(
                    assert.messages.instanceof.default,
                    'this._value',
                    'Style'
                )
            );
            return this._value.toString();
        }
        if (
            $.type(value) === CONSTANTS.STRING ||
            $.type(value) === CONSTANTS.NULL
        ) {
            this._value = new Style(value);
            this.refresh();
        } else {
            return new TypeError(
                '`value` is expected to be a nullable string or undefined'
            );
        }
    },

    /**
     * Fix border buttons state
     * @private
     */
    _FixBorderState() {
        const that = this;
        that.element
            .find(`a${format(ATTR_SELECTOR, attr('tool'), 'borders')}`)
            .click(() => {
                that._enableBorderButtons(false);
            });
    },

    /**
     * Enable/Disable border buttons
     * @private
     */
    _enableBorderButtons(enable) {
        const enabled = $.type(enable) === CONSTANTS.UNDEFINED ? true : enable;
        const borderpalette = $(roleSelector('borderpalette'));
        $.each(
            [
                'allBorders',
                'insideBorders',
                'insideHorizontalBorders',
                'insideVerticalBorders'
            ],
            (index, borderType) => {
                borderpalette
                    .find(
                        format(ATTR_SELECTOR, attr('border-type'), borderType)
                    )
                    .toggleClass('k-state-disabled', !enabled);
            }
        );
    },

    /**
     * Action triggered when clicking a command button
     * @param e
     */
    _onAction(e) {
        // e.command is either BorderChangeCommand, PropertyChangeCommand or TextWrapCommand
        const command = this[`_${e.command}`];
        if ($.isFunction(command)) {
            command.call(this, e.options);
            this.trigger('change');
            this.refresh();
        }
    },

    /**
     * Dialog triggered when clicking a command button in overflow dropdown
     * @param e
     */
    _onDialog(e) {
        const dialog = dialogs.create(e.name, e.options);
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
    _destroyDialog() {
        this._dialogs.pop();
    },

    /**
     * Action triggered when clicking a border button
     * @param options
     * @private
     */
    _BorderChangeCommand(options) {
        assert.instanceof(
            Style,
            this._value,
            assert.format(
                assert.messages.instanceof.default,
                'this._value',
                'Style'
            )
        );
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
                this._value.borderBottomStyle =
                    this._value.borderBottomStyle || 'solid';
                this._value.borderBottomWidth =
                    this._value.borderBottomWidth || '2px'; // options.style.size
                break;
            case 'leftBorder':
                this._value.borderLeftColor = options.style.color;
                this._value.borderLeftStyle =
                    this._value.borderLeftStyle || 'solid';
                this._value.borderLeftWidth =
                    this._value.borderLeftWidth || '2px'; // options.style.size
                break;
            case 'rightBorder':
                this._value.borderRightColor = options.style.color;
                this._value.borderRightStyle =
                    this._value.borderRightStyle || 'solid';
                this._value.borderRightWidth =
                    this._value.borderRightWidth || '2px'; // options.style.size
                break;
            case 'topBorder':
                this._value.borderTopColor = options.style.color;
                this._value.borderTopStyle =
                    this._value.borderTopStyle || 'solid';
                this._value.borderTopWidth =
                    this._value.borderTopWidth || '2px'; // options.style.size
                break;
            default:
                break;
        }
        // this._enableBorderButtons();
    },

    /**
     * PropertyChangeCommand
     * @param options
     * @private
     */
    _PropertyChangeCommand(options) {
        assert.instanceof(
            Style,
            this._value,
            assert.format(
                assert.messages.instanceof.default,
                'this._value',
                'Style'
            )
        );
        // The spreadsheet toolbar assigns `center` instead of `middle`
        // to verticalAlign which needs to be fixed here
        const value =
            options.property === 'verticalAlign' && options.value === 'center'
                ? 'middle'
                : options.value;
        switch (options.property) {
            case 'background':
                this._value.backgroundColor = value || null;
                break;
            case 'bold':
                this._value.fontWeight = value ? 'bold' : null;
                break;
            case 'color':
                this._value.color = value || null;
                break;
            case 'fontFamily':
                this._value.fontFamily =
                    FONT_FAMILY.indexOf(value) > -1 ? value : null;
                break;
            case 'fontSize':
                this._value.fontSize =
                    $.type(value) === CONSTANTS.NUMBER &&
                    value !== FONT_SIZE_DEFAULT
                        ? `${value}px`
                        : null;
                break;
            case 'italic':
                this._value.fontStyle = value ? 'italic' : null;
                break;
            case 'textAlign':
                this._value.textAlign =
                    TEXT_ALIGN.indexOf(value) > -1 ? value : null;
                break;
            case 'underline':
                this._value.textDecoration = value ? 'underline' : null;
                break;
            case 'verticalAlign':
                this._value.verticalAlign =
                    VERTICAL_ALIGN.indexOf(value) > -1 ? value : null;
                break;
            default:
                break;
        }
    },

    /**
     * TextWrapCommand
     * @param options
     * @private
     */
    _TextWrapCommand(options) {
        // SpreadsheetTooolbar sets "white-space: pre-wrap; word-break: break-all;" when options.value === true, otherwise nothing
        this._value.whiteSpace = options.value ? null : 'nowrap';
        // this._value.wordBreak = options.value ? null : 'nowrap';
        // this._value.textOverflow = options.value ? null : 'ellipsis';
    },

    /**
     * Get the tool value from its property
     * @param property
     * @private
     */
    _getValue(property) {
        const that = this;
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
                return this._value.verticalAlign === 'middle'
                    ? 'center'
                    : this._value.verticalAlign || VERTICAL_ALIGN_DEFAULT;
            case 'wrap':
                return this._value.whiteSpace !== 'nowrap';
            case 'alignment':
                return {
                    textAlign() {
                        return that._value.textAlign || TEXT_ALIGN_DEFAULT;
                    },
                    verticalAlign() {
                        return that._value.verticalAlign === 'middle'
                            ? 'center'
                            : that._value.verticalAlign ||
                                  VERTICAL_ALIGN_DEFAULT;
                    }
                };
            default:
        }
    },

    _tools() {
        return this.element
            .find('[data-property]')
            .toArray()
            .map(element => {
                const $element = $(element);
                return {
                    property: $element.attr('data-property'),
                    tool: this._getItem($element)
                };
            });
    },

    /**
     * Refresh
     * @param e
     */
    refresh() {
        const tools = this._tools();
        function setToggle(tool, value) {
            const { overflow, toolbar } = tool;
            const togglable =
                (toolbar && toolbar.options.togglable) ||
                (overflow && overflow.options.togglable);
            if (!togglable) {
                return;
            }
            let toggle = false;
            if ($.type(value) === CONSTANTS.BOOLEAN) {
                toggle = value;
            } else if ($.type(value) === CONSTANTS.STRING) {
                toggle = toolbar.options.value === value;
            }
            toolbar.toggle(toggle);
            if (overflow) {
                overflow.toggle(toggle);
            }
        }
        function update(tool, value) {
            const { overflow, toolbar } = tool;
            if (toolbar && toolbar.update) {
                toolbar.update(value);
            }
            if (overflow && overflow.update) {
                overflow.update(value);
            }
        }
        for (let i = 0; i < tools.length; i++) {
            const { property, tool } = tools[i];
            const value = this._getValue(property);
            if (tool.type === 'button') {
                setToggle(tool, value);
            } else {
                update(tool, value);
            }
        }
    },

    /**
     * Enable/disable the toolbar
     * @param item
     * @param enabled
     */
    enable(item, enabled) {
        const that = this;
        if (
            $.type(item) === CONSTANTS.UNDEFINED &&
            $.type(enabled) === CONSTANTS.UNDEFINED
        ) {
            item = true;
        }
        if (
            $.type(item) === CONSTANTS.BOOLEAN &&
            $.type(enabled) === CONSTANTS.UNDEFINED
        ) {
            enabled = item;
            const tools = that.element.find(`[${attr(CONSTANTS.UID)}]`);
            $.each(tools, (index, tool) => {
                that.enable(tool, enabled);
            });
            const overflowTools = that.popup.element.find(
                `[${attr(CONSTANTS.UID)}]`
            );
            $.each(overflowTools, (index, tool) => {
                that.enable(tool, enabled);
            });
        } else {
            const tool = $(item);
            ToolBar.fn.enable.call(that, tool, enabled);
            if (tool.hasClass('k-dropdown')) {
                const dropDownList = tool.find(roleSelector('dropdownlist'));
                const dropDownListWidget = dropDownList.data(
                    'kendoDropDownList'
                );
                dropDownListWidget.enable(enabled);
            } else if (tool.hasClass('k-combobox')) {
                const comboBox = tool.find(roleSelector('combobox'));
                const comboBoxWidget = comboBox.data('kendoComboBox');
                comboBoxWidget.enable(enabled);
            } else if (
                tool.has('.k-font-icon') &&
                (tool.has('.k-i-arrow-s') || tool.has('.k-text'))
            ) {
                tool.toggleClass('k-state-disabled', !enabled); // Otherwise the border tool does not look disabled
                if (enabled) {
                    tool.off(CONSTANTS.CLICK + that.ns);
                } else {
                    tool.on(CONSTANTS.CLICK + that.ns, e => {
                        e.preventDefault(); // prevents anchors of overflow popup from navigating or reloading the page
                        e.stopImmediatePropagation(); // prevents following click handlers from executing
                    });
                    // Ensures the above click handler executes first;
                    $._data(tool[0]).events.click.reverse();
                }
            }
        }
    },

    /**
     * Destroy
     */
    destroy() {
        this.unbind('action');
        this.unbind('dialog');
        unbind(this.wrapper);
        ToolBar.fn.destroy.call(this);
    }
});

/**
 * Registration
 */
plugin(FormatBar);

/**
 * FormatStrip
 * @class FormatStrip
 * @extends Widget
 */
const FormatStrip = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        const that = this;
        Widget.fn.init.call(that, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        that._render();
        // kendo.notify(that);
    },

    /**
     * Options
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
    value(value) {
        const that = this;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            return that._value;
        }
        if (
            value instanceof PageComponent ||
            $.type(value) === CONSTANTS.NULL
        ) {
            if (that._value !== value) {
                that._value = value;
                that.refresh();
            }
        } else {
            throw new TypeError(
                '`value` should be undefined, null or a PageComponent.'
            );
        }
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const that = this;
        that.wrapper = that.element;
        that.element.addClass('kj-formatstrip');
        that._tabStrip();
    },

    /**
     * Create tabStrip
     * @private
     */
    _tabStrip() {
        if (!(this.tabStrip instanceof TabStrip)) {
            this.tabStrip = $(`<${CONSTANTS.DIV}/>`)
                .appendTo(this.element)
                .kendoTabStrip({ animation: false })
                .data('kendoTabStrip');
        }
    },

    /**
     * Get an array of tabs
     * @private
     */
    _tabs() {
        const that = this;
        const tabs = [];
        if (this._value instanceof PageComponent) {
            const { tool } = that._value;
            assert.instanceof(
                BaseTool,
                _tools(tool),
                assert.format(
                    assert.messages.instanceof.default,
                    'tools[tool]',
                    'BaseTool'
                )
            );
            const { attributes } = _tools(tool);
            for (const attr in attributes) {
                if (
                    Object.prototype.hasOwnProperty.call(attributes, attr) &&
                    attributes[attr] instanceof StyleAdapter
                ) {
                    const styleAdapter = attributes[attr];
                    tabs.push({
                        text: styleAdapter.title,
                        content: format(
                            FORMATBAR_DATABIND,
                            `attributes.${attr}`
                        )
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
    _clearTabs() {
        assert.instanceof(
            TabStrip,
            this.tabStrip,
            assert.format(
                assert.messages.instanceof.default,
                'this.tabStrip',
                'kendo.ui.TabStrip'
            )
        );
        const that = this;
        while (that.tabStrip.contentElements.length > 0) {
            destroy(that.tabStrip.contentHolder(0));
            that.tabStrip.contentHolder(0).empty();
            that.tabStrip.remove(0);
        }
    },

    /**
     * Refresh
     * @param e
     */
    refresh() {
        const that = this;
        const tabs = that._tabs();
        that._tabStrip();
        // Clear tabs;
        that._clearTabs();
        // Add tabs
        that.tabStrip.append(tabs);
        // Initialize toolbars
        const formatBars = that.tabStrip.wrapper.find(
            roleSelector('formatbar')
        );
        if (that._value instanceof PageComponent) {
            bind(formatBars, that._value);
        } else {
            init(formatBars);
        }
        // Select first tab
        that.tabStrip.select(that.tabStrip.element.find('ul>li:first-child'));
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },

    /**
     * Function called by the enabled/disabled bindings
     * @param enabled
     */
    enable(enable) {
        const that = this;
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        const tabs = that.tabStrip.tabGroup.children();
        $.each(tabs, (index, tab) => {
            that.tabStrip.enable(tab, enabled);
            const formatbar = $(that.tabStrip.contentElements[index]).children(
                roleSelector('formatbar')
            );
            const formatbarWidget = formatbar.data('kendoFormatBar');
            formatbarWidget.enable(enabled);
        });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        this._clearTabs();
        Widget.fn.destroy.call(this);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
plugin(FormatStrip);
