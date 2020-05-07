/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Consider using kendo.caret

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import Style from '../common/window.style.es6';

const {
    attr,
    destroy,
    format,
    ui: { plugin, Widget },
} = window.kendo;
const logger = new Logger('widgets.highlighter');

const NS = '.kendoHighLighter';
const WIDGET_CLASS = 'kj-highlighter'; // 'k-widget kj-highlighter';

// var SELECTION_CHANGE = 'selectionchange';
// var SELECT_START = 'selectstart';
const INDEX = 'index';
const ATTR_SELECTOR = '[{0}="{1}"]';
const SPAN_OPEN = '<span>';
const SPAN_WITH_INDEX = `<span ${attr(INDEX)}="{0}">`;
const SPAN_CLOSE = '</span>';
const ACTIVE_SELECTOR = '.kj-highlighter-active';
const HOVER_SELECTOR = '.kj-highlighter-hover';

/** *******************************************************************************
 * Widget
 ******************************************************************************** */

/**
 * HighLighter
 * @class HighLighter
 * @extends Widget
 */
const HighLighter = Widget.extend({
    /**
     * Init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this.setOptions(this.options);
        // TODO this.enable
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'HighLighter',
        value: '',
        text: '',
        highlightStyle: '',
        // split is a regular expression which is going to be used highlight only certain parts of the text, for example to split the text into words
        // Unfortunately, splitting words on characters like punctuation does not work very well with words like U.N. or $10,000.000
        // You actually need a syntactic and semantic parser to do that accurately in any languages
        // A regular expression like \b works pretty well in English but is terrible in French because diacritics make word boundaries
        // It is important to split < and > because we cannot htmlEncode
        split: '', // The default splits the text into individual characters
        // split: '([\\s\\.,;:\\?¿!<>\\(\\)&"`«»\\[\\]{}])' // This uses the punctuation to split the text into words
        enabled: true,
    },

    /**
     * Reset options
     * @param options
     */
    setOptions(options) {
        this._split =
            $.type(options.split) === CONSTANTS.STRING && options.split.length
                ? new RegExp(options.split)
                : '';
        this._render();
        this.value(options.value || '');
        this.enable(options.enabled);
    },

    /**
     * Events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Value for MVVM binding
     * @param value
     */
    value(value) {
        const that = this;
        if ($.type(value) === CONSTANTS.NULL) {
            value = '';
        }
        if ($.type(value) === CONSTANTS.STRING) {
            if (that._format(that._value || []) !== value) {
                const arr = that._parse(value);
                for (let i = 0, { length } = arr; i < length; i++) {
                    that._add(arr[i]);
                }
                that.refresh();
            }
        } else if ($.type(value) === CONSTANTS.UNDEFINED) {
            return that._format(that._value);
        } else {
            throw new TypeError(
                '`value` is expected to be a string if not null or undefined'
            );
        }
    },

    /**
     * Format value array as string
     * @param array
     * @private
     */
    _format(array) {
        assert.isArray(
            array,
            assert.format(assert.messages.isArray.default, 'array')
        );
        let value = '';
        for (let i = 0, { length } = array; i < length; i++) {
            const selection = array[i];
            if (
                $.isPlainObject(selection) &&
                $.type(selection.start) === CONSTANTS.NUMBER &&
                $.type(selection.end) === CONSTANTS.NUMBER &&
                selection.start <= selection.end
            ) {
                let { start, end } = selection;
                if (this._split instanceof RegExp) {
                    // Convert word indexes into span indexes when necessary
                    start = parseInt(
                        $(this.items.get(start)).attr(attr(INDEX)),
                        10
                    );
                    assert.ok(
                        !Number.isNaN(start),
                        '`start` should be the index of a word'
                    );
                    end = parseInt(
                        $(this.items.get(end)).attr(attr(INDEX)),
                        10
                    );
                    assert.ok(
                        !Number.isNaN(end),
                        '`end` should be the index of a word'
                    );
                }
                // Format our string value
                value += start;
                if (start < end) {
                    value += CONSTANTS.HYPHEN + end;
                }
                value += CONSTANTS.COMMA;
            }
        }
        // Remove trailing comma
        if (value.slice(-CONSTANTS.COMMA.length) === CONSTANTS.COMMA) {
            value = value.slice(0, -CONSTANTS.COMMA.length);
        }
        return value;
    },

    /**
     * Parse value string as array
     * @param value
     * @private
     */
    _parse(value) {
        assert.type(
            CONSTANTS.STRING,
            value,
            assert.format(
                assert.messages.type.default,
                'value',
                CONSTANTS.STRING
            )
        );
        const array = value.split(CONSTANTS.COMMA);
        for (let i = 0, { length } = array; i < length; i++) {
            const selection = array[i].split(CONSTANTS.HYPHEN);
            let start = parseInt(selection[0], 10);
            let end =
                $.type(selection[1]) === CONSTANTS.UNDEFINED
                    ? start
                    : parseInt(selection[1], 10);
            if (!Number.isNaN(start) && !Number.isNaN(end) && start <= end) {
                if (this._split instanceof RegExp) {
                    // Convert word indexes into span indexes, which will automatically include punctuation and spaces between words into the highlighted selection
                    const startWord = this.items.filter(
                        format(ATTR_SELECTOR, attr(INDEX), start)
                    );
                    assert.equal(
                        1,
                        startWord.length,
                        assert.format(
                            assert.messages.equal.default,
                            'startWord.length',
                            1
                        )
                    );
                    start = this.items.index(startWord);
                    const endWord = this.items.filter(
                        format(ATTR_SELECTOR, attr(INDEX), end)
                    );
                    assert.equal(
                        1,
                        endWord.length,
                        assert.format(
                            assert.messages.equal.default,
                            'endWord.length',
                            1
                        )
                    );
                    end = this.items.index(endWord);
                }
                array[i] = { start, end };
            }
        }
        return array;
    },

    /**
     * Round up span index to closest word
     * @param index
     * @private
     */
    _roundUp(index) {
        assert.type(
            CONSTANTS.NUMBER,
            index,
            assert.format(
                assert.messages.type.default,
                'index',
                CONSTANTS.NUMBER
            )
        );
        let word;
        let pos = index;
        if (this._split instanceof RegExp) {
            while (Number.isNaN(word) && pos < this.items.length) {
                word = parseInt($(this.items.get(pos)).attr(attr(INDEX)), 10);
                pos += 1;
            }
            pos -= 1;
        }
        return pos;
    },

    /**
     * Round down span index to closest word
     * @param index
     * @private
     */
    _roundDown(index) {
        assert.type(
            CONSTANTS.NUMBER,
            index,
            assert.format(
                assert.messages.type.default,
                'index',
                CONSTANTS.NUMBER
            )
        );
        let word;
        let pos = index;
        if (this._split instanceof RegExp) {
            while (Number.isNaN(word) && pos >= 0) {
                word = parseInt($(this.items.get(pos)).attr(attr(INDEX)), 10);
                pos -= 1;
            }
            pos += 1;
        }
        return pos;
    },

    /**
     * Add a new selection and possibly collapse adjoining selections
     * @param selection
     * @private
     */
    _add(selection) {
        // This is always a selection across all spans, whether breaking the sentence into words or characters
        assert.isNonEmptyPlainObject(
            selection,
            assert.format(
                assert.messages.isNonEmptyPlainObject.default,
                'selection'
            )
        );
        assert.type(
            CONSTANTS.NUMBER,
            selection.start,
            assert.format(
                assert.messages.type.default,
                'selection.start',
                CONSTANTS.NUMBER
            )
        );
        assert.type(
            CONSTANTS.NUMBER,
            selection.end,
            assert.format(
                assert.messages.type.default,
                'selection.end',
                CONSTANTS.NUMBER
            )
        );
        // Snap selection to words if necessary
        selection = {
            start: this._roundUp(selection.start),
            end: this._roundDown(selection.end),
        };
        const ret = [];
        const value = this._value || [];
        let added = false;
        for (let i = 0, { length } = value; i < length; i++) {
            const existing = value[i];
            if (this._roundUp(existing.end + 1) < selection.start) {
                // There is no overlap so keep existing and continue to the next one
                ret.push(existing);
            } else if (this._roundUp(selection.end + 1) < existing.start) {
                // There is no overlap so we can safely add the selection (unless already added), keep existing and continue
                if (!added) {
                    ret.push(selection);
                    added = true;
                }
                ret.push(existing);
            } else {
                // There is an overlap, so we should merge existing and selection
                selection = {
                    start: Math.min(selection.start, existing.start),
                    end: Math.max(selection.end, existing.end),
                };
            }
        }
        if (!added) {
            ret.push(selection);
        }
        this._value = ret;
    },

    /**
     * Remove a new selection and possibly break adjoining selections
     * @param selection
     * @private
     */
    _remove(selection) {
        // This is always a selection across all spans, whether breaking the sentence into words or characters
        assert.isNonEmptyPlainObject(
            selection,
            assert.format(
                assert.messages.isNonEmptyPlainObject.default,
                'selection'
            )
        );
        assert.type(
            CONSTANTS.NUMBER,
            selection.start,
            assert.format(
                assert.messages.type.default,
                'selection.start',
                CONSTANTS.NUMBER
            )
        );
        assert.type(
            CONSTANTS.NUMBER,
            selection.end,
            assert.format(
                assert.messages.type.default,
                'selection.end',
                CONSTANTS.NUMBER
            )
        );
        // Snap selection to words if necessary
        selection = {
            start: this._roundUp(selection.start),
            end: this._roundDown(selection.end),
        };
        const ret = [];
        const value = this._value || [];
        for (let i = 0, { length } = value; i < length; i++) {
            const existing = value[i];
            if (selection.end < existing.start) {
                // There is no overlap so keep existing and continue to the next one
                ret.push(existing);
            } else if (existing.end < selection.start) {
                // There is no overlap so keep existing and continue to the next one
                ret.push(existing);
            } else {
                // We get zero (selection = existing) to two breaks (selection in the middle of existing) out of subtracting
                if (selection.start > existing.start) {
                    ret.push({
                        start: existing.start,
                        end: this._roundDown(selection.start - 1),
                    });
                }
                // Second break
                if (selection.end < existing.end) {
                    ret.push({
                        start: this._roundUp(selection.end + 1),
                        end: existing.end,
                    });
                }
            }
        }
        this._value = ret;
    },

    /**
     * Builds the widget layout
     * @private
     */
    _render() {
        const that = this;
        const { options } = that;
        that.wrapper = that.element;
        that.element.empty();
        that.element.addClass(WIDGET_CLASS);
        if (that._split instanceof RegExp) {
            // Note: This is probably the most controversial part of the widget
            // @see https://stackoverflow.com/questions/40881365/split-a-string-into-an-array-of-words-punctuation-and-spaces-in-javascript
            // @see https://stackoverflow.com/questions/43876036/regex-split-string-into-array-based-on-punctuation-spaces?rq=1
            const split = options.text.split(that._split);
            let html = '';
            let wordIndex = 0;
            for (let i = 0, { length } = split; i < length; i++) {
                if (that._split.test(split[i])) {
                    html += SPAN_OPEN + split[i] + SPAN_CLOSE;
                } else if (split[i].length) {
                    html +=
                        format(SPAN_WITH_INDEX, wordIndex) +
                        split[i] +
                        SPAN_CLOSE;
                    wordIndex += 1;
                }
            }
            that.element.html(html);
        } else {
            that.element.html(
                SPAN_OPEN +
                    options.text.split('').join(SPAN_CLOSE + SPAN_OPEN) +
                    SPAN_CLOSE
            );
        }
        // Keep a reference on all children to avoid recurring DOM queries
        that.items = that.element.children(CONSTANTS.SPAN);
    },

    /**
     * enable for binding
     * @param enable
     */
    enable(enable) {
        this._enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        this.element.off(NS);
        if ($.isFunction(this._onMouseUpHandler)) {
            $(document).off(NS, this._onMouseUpHandler);
            this._onMouseUpHandler = undefined;
        }
        if (this._enabled) {
            const data = {}; // Data to share across events
            // IMPORTANT: touchmove and touchend target is the same element that received the touchstart event
            // corresponding to the touch point, even if the touch point has moved outside that element.
            // See https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
            // So events cannot be delegated to spans to know which span to highlight
            this.element
                .on(
                    `${CONSTANTS.MOUSEDOWN + NS} ${CONSTANTS.TOUCHSTART}${NS}`,
                    data,
                    this._onMouseDown.bind(this)
                )
                .on(
                    `${CONSTANTS.MOUSEMOVE + NS} ${CONSTANTS.TOUCHMOVE}${NS}`,
                    data,
                    this._onMouseMove.bind(this)
                );
            // We need mouseup on the document to clean our data wherever the pointer is
            this._onMouseUpHandler = this._onMouseUp.bind(this);
            $(document).on(
                `${CONSTANTS.MOUSEUP + NS} ${CONSTANTS.TOUCHEND}${NS}`,
                data,
                this._onMouseUpHandler
            );
        }
    },

    /**
     * Get span from event
     * @param e
     * @private
     */
    _spanFromEvent(e) {
        const { originalEvent } = e;
        let clientX;
        let clientY;
        if (
            originalEvent &&
            originalEvent.touches &&
            originalEvent.touches.length
        ) {
            [{ clientX, clientY }] = originalEvent.touches;
        } else if (
            originalEvent &&
            originalEvent.changedTouches &&
            originalEvent.changedTouches.length
        ) {
            // See http://www.jacklmoore.com/notes/mouse-position/
            // See http://www.jqwidgets.com/community/topic/dragend-event-properties-clientx-and-clienty-are-undefined-on-ios/
            // See http://www.devinrolsen.com/basic-jquery-touchmove-event-setup/
            // ATTENTION: e.originalEvent.changedTouches instanceof TouchList, not Array
            [{ clientX, clientY }] = originalEvent.changedTouches;
        } else {
            ({ clientX, clientY } = e);
        }
        if (
            $.type(clientX) === CONSTANTS.NUMBER &&
            $.type(clientY) === CONSTANTS.NUMBER
        ) {
            const span = $(document.elementFromPoint(clientX, clientY));
            if (
                span.is(CONSTANTS.SPAN) &&
                $.contains(this.element.get(0), span.get(0))
            ) {
                return span;
            }
        }
    },

    /**
     * Mousedown event handler
     * @param e
     * @private
     */
    _onMouseDown(e) {
        if (e.type === CONSTANTS.MOUSEDOWN && e.data && e.data.touched) {
            // A tap triggers touchstart/touchend but also mousedown/mouseup which we do not want to execute twice
            return;
        }
        if (e.data && $.type(e.data.initial) === CONSTANTS.UNDEFINED) {
            const target = this._spanFromEvent(e);
            if (target instanceof $) {
                // console.log(e.type);
                const index = this.items.index(target);
                // We cannot reassign e.data because we need the same object throughout mouse/touch events
                e.data.active = !target.hasClass(ACTIVE_SELECTOR.substr(1));
                e.data.highlighter = this;
                e.data.initial = index;
                // This is always a selection across all spans, including spaces and punctuation
                e.data.selection = {
                    // possibly we get end < start, and we do not have a selection
                    start: this._roundUp(index),
                    end: this._roundDown(index),
                };
                e.data.touched = e.type === CONSTANTS.TOUCHSTART;
            }
        }
    },

    /**
     * Mousemove event handler
     * @param e
     * @private
     */
    _onMouseMove(e) {
        if (e.data && e.data.highlighter === this) {
            // same originating widget in case there are more on the page
            const target = this._spanFromEvent(e);
            if (target instanceof $) {
                // console.log(e.type);
                const index = this.items.index(target);
                // Make sure we can work both ways (right and left from initial mousedown)
                if (index < e.data.initial) {
                    // We are selecting towards the left
                    e.data.selection.start = this._roundUp(index);
                    e.data.selection.end = this._roundDown(e.data.initial);
                } else {
                    // We are selecting towards the right
                    e.data.selection.start = this._roundUp(e.data.initial);
                    e.data.selection.end = this._roundDown(index);
                }
                // This is always a selection across all spans, including spaces and punctuation
                this._highlight(e.data.selection, e.data.active, true);
            }
        }
    },

    /**
     * Mouseup event handler
     * The mouseup event handler is shared across widgets and cannot use this
     * @param e
     * @private
     */
    _onMouseUp(e) {
        if (e.type === CONSTANTS.MOUSEUP && e.data && e.data.touched) {
            e.data.touched = undefined;
            // A tap triggers touchstart/touchend but also mousedown/mouseup which we do not want to execute twice
        } else if (e.data && e.data.highlighter === this) {
            // same originating widget in case there are more on the page
            // console.log(e.type);
            // No need to unselect to show highlight since we have CSS style user-select: none;
            // window.getSelection().removeAllRanges();
            // Add/remove current highlighting to this._value
            if (e.data.active) {
                this._add(e.data.selection);
            } else {
                this._remove(e.data.selection);
            }
            // Clear data for next time
            // We cannot reassign e.data because we need the same object throughout mouse/touch events
            e.data.active = undefined;
            e.data.highlighter = undefined;
            e.data.initial = undefined;
            e.data.selection = undefined;
            e.data.touched = e.type === CONSTANTS.TOUCHEND;
            // Refresh the UI
            this.refresh();
            // Trigger a change event
            this.trigger(CONSTANTS.CHANGE);
        }
    },

    /**
     * Highlight/unhighlight a selection
     * @param selection
     * @param active
     * @param hover
     * @private
     */
    _highlight(selection, active, hover) {
        assert.isNonEmptyPlainObject(
            selection,
            assert.format(
                assert.messages.isNonEmptyPlainObject.default,
                'selection'
            )
        );
        assert.type(
            CONSTANTS.NUMBER,
            selection.start,
            assert.format(
                assert.messages.type.default,
                'selection.start',
                CONSTANTS.NUMBER
            )
        );
        assert.type(
            CONSTANTS.NUMBER,
            selection.end,
            assert.format(
                assert.messages.type.default,
                'selection.end',
                CONSTANTS.NUMBER
            )
        );
        assert.type(
            CONSTANTS.BOOLEAN,
            active,
            assert.format(
                assert.messages.type.default,
                'active',
                CONSTANTS.BOOLEAN
            )
        );
        const activeClass = ACTIVE_SELECTOR.substr(1);
        const hoverClass = HOVER_SELECTOR.substr(1);
        hover = !!hover;
        // Highlight selections both when hovering and refreshing
        if (active) {
            // Highlighting
            if (hover) {
                // Remove highlighting from any previous mouse selection
                this.items.filter(HOVER_SELECTOR).removeClass(activeClass);
            }
            if (selection.end >= selection.start) {
                // Add highlighting (and hovering) to the current (mouse) selection
                this.items
                    .slice(selection.start, selection.end + 1)
                    .addClass(
                        hover ? `${activeClass} ${hoverClass}` : activeClass
                    );
            }
        } else {
            if (hover) {
                // un-highlighting
                // Restore highlighting to the previous mouse selection
                this.items.filter(HOVER_SELECTOR).addClass(activeClass);
            }
            if (selection.end >= selection.start) {
                // Remove highlighting (and hovering) to the current (mouse) selection
                this.items
                    .slice(selection.start, selection.end + 1)
                    .removeClass(
                        hover ? `${activeClass} ${hoverClass}` : activeClass
                    );
            }
        }
        this.items.filter(`:not(${ACTIVE_SELECTOR})`).removeAttr('style');
        this.items
            .filter(ACTIVE_SELECTOR)
            .css(new Style(this.options.highlightStyle).toJSON());
    },

    /**
     * Refresh
     */
    refresh() {
        // Clear all highlights
        this.items.filter(HOVER_SELECTOR).removeClass(HOVER_SELECTOR.substr(1));
        this.items
            .filter(ACTIVE_SELECTOR)
            .removeClass(ACTIVE_SELECTOR.substr(1));
        // Paint new highlights from this._value
        for (let i = 0, { length } = this._value; i < length; i++) {
            this._highlight(this._value[i], true, false);
        }
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const that = this;
        const { wrapper } = that;
        // Release references
        that.items = undefined;
        that.element.off(NS);
        // Destroy kendo
        Widget.fn.destroy.call(that);
        destroy(wrapper);
        // Remove widget class
        // wrapper.removeClass(WIDGET_CLASS);
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'HighLighter')) {
    // Prevents loading several times in karma
    plugin(HighLighter);
}
