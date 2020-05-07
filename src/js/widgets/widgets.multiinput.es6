/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO keys
// TODO touchend for click

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { compareBasicArrays, isAnyArray } from '../common/window.util.es6';

const {
    destroy,
    format,
    getComputedStyles,
    htmlEncode,
    ui: { plugin, Widget },
    unbind,
} = window.kendo;
const logger = new Logger('widgets.multiinput');
const NS = '.kendoMultiInput';
const ARIA_DISABLED = 'aria-disabled';
const ARIA_READONLY = 'aria-readonly';
const DISABLED = 'disabled';
const READONLY = 'readonly';
const INITIAL_WIDTH = 25;
const STYLES = [
    'font-family',
    'font-size',
    'font-stretch',
    'font-style',
    'font-weight',
    'letter-spacing',
    'text-transform',
    'line-height',
];

/**
 * Parse string value into an array
 * @param value
 */
function parseString(value) {
    assert.type(
        CONSTANTS.STRING,
        value,
        assert.format(assert.messages.type.default, 'value', CONSTANTS.STRING)
    );
    let ret = [];
    if (value.length) {
        try {
            ret = JSON.parse(value);
        } catch (ex) {
            ret = [value];
        }
    }
    return ret;
}

/**
 * MultiInput
 * @class MultiInput
 * @extends Widget
 */
const MultiInput = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        if (isAnyArray(this.options.value) && this.options.value.length) {
            this.value(this.options.value);
        } else {
            // Take value from this.element.val()
            this.refresh();
        }
        this._editable(this.options);
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'MultiInput',
        value: [],
        enabled: true,
        readonly: false,
        match: null, // RegExp match, e.g. for email addresses: separator does not trigger a new tag element unless there is a match
        separators: ',;\r\n\t', // string of separators
        messages: {
            clear: 'Clear',
            delete: 'Delete',
        },
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Get/set value
     * Note: value is stored as a stringified array in this.element
     * so as to be compatible with kendo.ui.Validator
     * @method value
     * @param value
     * @return {*}
     */
    value(value) {
        assert.ok(
            $.type(value) === CONSTANTS.UNDEFINED ||
                $.type(value) === CONSTANTS.NULL ||
                isAnyArray(value),
            '`value` is expected to be an Array or ObservableArray or null or undefined'
        );
        let ret;
        if ($.type(value) === CONSTANTS.NULL) {
            // eslint-disable-next-line no-param-reassign
            value = [];
        }
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = parseString(this.element.val());
        } else {
            const val = parseString(this.element.val());
            if (!compareBasicArrays(value, val)) {
                // TODO: what in case of a match option ????
                this.element.val(JSON.stringify(value));
                this.refresh();
            }
        }
        return ret;
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const {
            element,
            options: { messages },
        } = this;
        const id = element.attr(CONSTANTS.ID);
        // Add wrapper
        this.wrapper = element.wrap(`<${CONSTANTS.DIV}/>`).parent().attr({
            class:
                'k-widget k-multiselect k-multiselect-clearable kj-multiinput',
            unselectable: 'on',
        });
        // Add inner wrapper
        this._innerWrapper = $(`<${CONSTANTS.DIV}/>`)
            .attr({
                class: 'k-multiselect-wrap k-floatwrap',
                unselectable: 'on',
            })
            .prependTo(this.wrapper);
        // Add clear icon
        this._clear = $(`<${CONSTANTS.SPAN}/>`)
            .attr({
                class: 'k-icon k-clear-value k-i-close',
                role: 'button',
                tabindex: -1,
                title: messages.clear,
            })
            .prependTo(this._innerWrapper);
        // <span unselectable="on" className="k-icon k-clear-value k-i-close" title="clear" role="button" tabIndex="-1"></span>
        // Add input
        this.input = $(`<${CONSTANTS.INPUT}>`)
            .width(INITIAL_WIDTH)
            .attr({
                accesskey: '',
                autocomplete: 'off',
                class: 'k-input',
                role: 'listbox',
                tabindex: 0,
                'aria-owns': id ? `${id}_taglist` : '',
            })
            .prependTo(this._innerWrapper);
        // Add taglist
        this.tagList = $(`<${CONSTANTS.UL}/>`)
            .attr({
                class: 'k-reset',
                id: id ? `${id}_taglist` : '',
                role: 'listbox',
                unselectable: 'on',
            })
            .prependTo(this._innerWrapper);
        // Add text span used to scale input
        const computedStyles = getComputedStyles(element[0], STYLES);
        computedStyles.position = 'absolute';
        computedStyles.visibility = 'hidden';
        computedStyles.top = -3333;
        computedStyles.left = -3333;
        this.span = $(`<${CONSTANTS.SPAN}/>`)
            .css(computedStyles)
            .appendTo(this.wrapper);
        // Hide this.element
        this.element.hide();
    },

    /**
     * Scale input field
     * @method _scaleInput
     * @private
     */
    _scaleInput() {
        const { input, span, _innerWrapper, wrapper } = this;
        let wrapperWidth = _innerWrapper.width();
        span.text(input.val());
        let textWidth;
        if (!wrapper.is(':visible')) {
            span.appendTo(document.documentElement);
            textWidth = span.width() + INITIAL_WIDTH;
            wrapperWidth = textWidth;
            span.appendTo(wrapper);
        } else {
            textWidth = span.width() + INITIAL_WIDTH;
        }
        input.width(textWidth > wrapperWidth ? wrapperWidth : textWidth);
    },

    /**
     * Event handler triggered when the mousedown event occurs on the wrapper
     * @method _onWrapperMouseDown
     * @param e
     * @private
     */
    _onWrapperMouseDown(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        e.preventDefault();
        this.focus();
    },

    /**
     * Give the widget focus
     * @method focus
     */
    focus() {
        this.input.focus();
    },

    /**
     * Hide clear button
     * @method _hideClear
     * @private
     */
    _hideClear() {
        this._clear.addClass(CONSTANTS.HIDDEN_CLASS);
    },

    /**
     * Show clear button
     * @method _showClear
     * @private
     */
    _showClear() {
        this._clear.removeClass(CONSTANTS.HIDDEN_CLASS);
    },

    /**
     * Event handler triggered when clicking the clear button
     * @method _onClearClick
     * @param e
     * @private
     */
    _onClearClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        e.preventDefault();
        const value = [];
        this.value(value);
        this._hideClear();
        this.trigger(CONSTANTS.CHANGE, { value });
    },

    /**
     * Toggles between enabled and readonly modes
     * @method _editable
     * @param options
     * @private
     */
    _editable(options) {
        const { enabled, readonly } = options;
        const wrapper = this.wrapper.off(NS);
        const tagList = this.tagList.off(NS);
        const input = this.input.off(NS);
        const clear = this._clear.off(NS);

        if (!readonly && enabled) {
            wrapper
                .removeClass(`${CONSTANTS.DISABLED_CLASS} kj-readonly`)
                .on(
                    `${
                        CONSTANTS.MOUSEENTER
                    }${NS} ${`${CONSTANTS.MOUSELEAVE}${NS}`}`,
                    this._toggleHover.bind(this)
                )
                .on(
                    `${CONSTANTS.MOUSEDOWN}${NS} ${CONSTANTS.TOUCHSTART}${NS}`,
                    this._onWrapperMouseDown.bind(this)
                );

            input
                .removeAttr(DISABLED)
                .removeAttr(READONLY)
                .attr(ARIA_DISABLED, false)
                .attr(ARIA_READONLY, false)
                .on(
                    `${CONSTANTS.KEYDOWN}${NS}`,
                    this._onInputKeyDown.bind(this)
                )
                .on(
                    `${CONSTANTS.KEYPRESS}${NS}`,
                    this._onInputKeyPress.bind(this)
                )
                .on(
                    `${CONSTANTS.FOCUSOUT}${NS}`,
                    this._onInputFocusOut.bind(this)
                );

            clear.on(
                `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TOUCHEND}${NS}`,
                this._onClearClick.bind(this)
            );

            tagList
                .on(`${CONSTANTS.MOUSEENTER}${NS}`, CONSTANTS.LI, (e) => {
                    $(e.currentTarget).addClass(CONSTANTS.HOVER_CLASS);
                })
                .on(`${CONSTANTS.MOUSELEAVE}${NS}`, CONSTANTS.LI, (e) => {
                    $(e.currentTarget).removeClass(CONSTANTS.HOVER_CLASS);
                })
                .on(
                    `${CONSTANTS.CLICK}${NS}`,
                    'li.k-button .k-select',
                    this._onTagClick.bind(this)
                );
        } else {
            wrapper.toggleClass(CONSTANTS.DISABLED_CLASS, !enabled);
            wrapper.toggleClass('kj-readonly', readonly);
            input
                .attr(DISABLED, !enabled)
                .attr(READONLY, readonly)
                .attr(ARIA_DISABLED, !enabled)
                .attr(ARIA_READONLY, readonly);
        }
    },

    /**
     * Enable/disable the widget
     * @method enable
     * @param enable
     */
    enable(enable) {
        this._editable({
            readonly: false,
            enabled: $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable,
        });
    },

    /**
     * Make the widget readonly
     * @method readonly
     * @param readonly
     */
    readonly(readonly) {
        this._editable({
            readonly:
                $.type(readonly) === CONSTANTS.UNDEFINED ? true : !!readonly,
            enabled: true,
        });
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        this.tagList.empty();
        this._addTagElements(this.value());
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Add tag elements from a string or an array of strings
     * @method _addTagElements
     * @param tags
     */
    _addTagElements(tags) {
        if ($.type(tags) === CONSTANTS.STRING) {
            // eslint-disable-next-line no-param-reassign
            tags = [tags];
        }
        assert.ok(
            isAnyArray(tags),
            '`tags` is expected to be an array or an ObservableArray'
        );
        const {
            options: { messages },
            tagList,
        } = this;
        tags.forEach((tag) => {
            const tagElement = $(
                format(
                    '<li class="k-button" unselectable="on"><span unselectable="on">{0}</span><span unselectable="on" class="k-select" aria-label="{1}" title="{1}"><span class="k-icon k-i-close"></span></span></li>',
                    htmlEncode(tag),
                    messages.delete
                )
            );
            tagList.append(tagElement);
        });
    },

    /**
     * Remove a tag element
     * @method _removeTagElement
     * @param tagElement
     * @private
     */
    _removeTagElement(tagElement) {
        assert.instanceof(
            $,
            tagElement,
            assert.format(
                assert.messages.instanceof.default,
                'tagElement',
                'jQuery'
            )
        );
        const index = tagElement.index();
        tagElement.remove();
        return index;
    },

    /**
     * Event handler for clicking a tag element delete icon
     * @method _onTagClick
     * @param e
     * @private
     */
    _onTagClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const target = $(e.target);
        const tagElement = target.closest(CONSTANTS.LI);
        const index = this._removeTagElement(tagElement);
        const value = this.value();
        value.splice(index, 1);
        this.value(value);
        this.trigger(CONSTANTS.CHANGE, { value });
        // this._placeholder();
    },

    /**
     * Event handler triggered when pressing a key when the input has the focus
     * @method _onInputKeyDown
     * @private
     */
    _onInputKeyDown() {
        const that = this;
        setTimeout(() => {
            that._scaleInput();
        }, 0);
    },

    /**
     * Event handler triggered when pressing a key when the input has the focus
     * @method _onInputKeyPress
     * @param e
     * @private
     */
    _onInputKeyPress(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        let ret;
        if (
            (this.options.separators || '').indexOf(
                String.fromCharCode(e.which)
            ) > -1
        ) {
            this._fromInputToTag();
            return false; // cancel the key
        }
        return ret;
    },

    /**
     * Event handler triggered when the input loses the focus
     * @method _onInputFocusOut
     * @private
     */
    _onInputFocusOut() {
        this._fromInputToTag();
    },

    /**
     * Convert an input entry into a tag element assuming a match
     * @method _fromInputToTag
     * @private
     */
    _fromInputToTag() {
        const {
            input,
            options: { match },
        } = this;
        const tag = input.val().trim();
        if (tag.length) {
            const isMatch =
                $.type(match) === CONSTANTS.STRING && match.length
                    ? new RegExp(match).test(tag)
                    : true;
            if (isMatch) {
                const value = this.value();
                value.push(tag);
                // this._addTagElements(tag);
                input.val('');
                this.value(value);
                this.trigger(CONSTANTS.CHANGE, { value });
            }
        }
    },

    /**
     * Event handler triggered when mousing over
     * @method _toggleHover
     * @param e
     * @private
     */
    _toggleHover(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        $(e.currentTarget).toggleClass(
            CONSTANTS.HOVER_CLASS,
            e.type === CONSTANTS.MOUSEENTER
        );
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        // Unbind events
        this.wrapper.off(NS);
        this.tagList.off(NS);
        this.element.off(NS);
        unbind(this.wrapper);
        // Clear references
        this._innerWrapper = undefined;
        this.tagList = undefined;
        // Destroy widget
        Widget.fn.destroy.call(this);
        destroy(this.wrapper);
        // log
        logger.debug({ method: 'destroyed', message: 'widget destroyed' });
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'MultiInput')) {
    // Prevents loading several times in karma
    plugin(MultiInput);
}
