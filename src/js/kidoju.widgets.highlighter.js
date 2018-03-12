/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './kidoju.util'
    ], f);
})(function (katX) {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var Widget = kendo.ui.Widget;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.highlighter');
        var util = window.kidoju.util;
        var BOOLEAN = 'boolean';
        var NULL = 'null';
        var NUMBER = 'number';
        var STRING = 'string';
        var UNDEFINED = 'undefined';
        var NS = '.kendoHighLighter';
        // var SELECTION_CHANGE = 'selectionchange';
        // var SELECT_START = 'selectstart';
        var MOUSEDOWN = 'mousedown';
        var MOUSEMOVE = 'mousemove';
        var MOUSEUP = 'mouseup';
        var TOUCHSTART = 'touchstart';
        var TOUCHMOVE = 'touchmove';
        var TOUCHEND = 'touchend';
        var CHANGE = 'change';
        var COMMA = ',';
        var HYPHEN = '-';
        var INDEX = 'index';
        var SPAN_SELECTOR = 'span';
        var ATTR_SELECTOR = '[{0}="{1}"]';
        var SPAN_OPEN = '<span>';
        var SPAN_WITH_INDEX = '<span ' + kendo.attr(INDEX) + '="{0}">';
        var SPAN_CLOSE = '</span>';
        var WIDGET_CLASS = 'kj-highlighter'; // 'k-widget kj-highlighter';
        var ACTIVE_SELECTOR = '.kj-highlighter-active';
        var HOVER_SELECTOR = '.kj-highlighter-hover';

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * HighLighter
         * @class HighLighter Widget (kendoHighLighter)
         */
        var HighLighter = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                options = options || {};
                Widget.fn.init.call(this, element, options);
                logger.debug({ method: 'init', message: 'widget initialized' });
                this.setOptions(this.options);
                // see http://www.telerik.com/forums/kendo-notify()
                kendo.notify(this);
            },

            /**
             * Widget options
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
                enable: true
            },

            /**
             * Reset options
             * @param options
             */
            setOptions: function (options) {
                this._split = $.type(options.split) === STRING && options.split.length ? new RegExp(options.split) : '';
                this._layout();
                this.value(options.value || '');
                this.enable(options.enable);
            },

            /**
             * Widget events
             */
            events: [CHANGE],

            /**
             * Value for MVVM binding
             * @param value
             */
            value: function (value) {
                var that = this;
                if ($.type(value) === NULL) {
                    value = '';
                }
                if ($.type(value) === STRING) {
                    if (that._format(that._value || []) !== value) {
                        var arr = that._parse(value);
                        for (var i = 0, length = arr.length; i < length; i++) {
                            that._add(arr[i]);
                        }
                        that.refresh();
                    }
                } else if ($.type(value) === UNDEFINED) {
                    return that._format(that._value);
                } else {
                    throw new TypeError('`value` is expected to be a string if not null or undefined');
                }
            },

            /**
             * Format value array as string
             * @param array
             * @private
             */
            _format: function (array) {
                assert.isArray(array, assert.format(assert.messages.isArray.default, 'array'));
                var value = '';
                for (var i = 0, length = array.length; i < length; i++) {
                    var selection = array[i];
                    if ($.isPlainObject(selection) && $.type(selection.start) === NUMBER && $.type(selection.end) === NUMBER  && selection.start <= selection.end) {
                        var start = selection.start;
                        var end = selection.end;
                        if (this._split instanceof RegExp) {
                            // Convert word indexes into span indexes when necessary
                            start = parseInt($(this.items.get(start)).attr(kendo.attr(INDEX)), 10);
                            assert.ok(!isNaN(start), '`start` should be the index of a word');
                            end = parseInt($(this.items.get(end)).attr(kendo.attr(INDEX)), 10);
                            assert.ok(!isNaN(end), '`end` should be the index of a word');
                        }
                        // Format our string value
                        value += start;
                        if (start < end) {
                            value += HYPHEN + end;
                        }
                        value += COMMA;
                    }
                }
                // Remove trailing comma
                if (value.slice(-COMMA.length) === COMMA) {
                    value = value.slice(0, -COMMA.length);
                }
                return value;
            },

            /**
             * Parse value string as array
             * @param value
             * @private
             */
            _parse: function (value) {
                assert.type(STRING, value, assert.format(assert.messages.type.default, 'value', STRING));
                var array = value.split(COMMA);
                for (var i = 0, length = array.length; i < length; i++) {
                    var selection = array[i].split(HYPHEN);
                    var start = parseInt(selection[0], 10);
                    var end = $.type(selection[1]) === UNDEFINED ? start : parseInt(selection[1], 10);
                    if (!isNaN(start) && !isNaN(end) && start <= end) {
                        if (this._split instanceof RegExp) {
                            // Convert word indexes into span indexes, which will automatically include punctuation and spaces between words into the highlighted selection
                            var startWord = this.items.filter(kendo.format(ATTR_SELECTOR, kendo.attr(INDEX), start));
                            assert.equal(1, startWord.length, assert.format(assert.messages.equal.default, 'startWord.length', 1));
                            start = this.items.index(startWord);
                            var endWord = this.items.filter(kendo.format(ATTR_SELECTOR, kendo.attr(INDEX), end));
                            assert.equal(1, endWord.length, assert.format(assert.messages.equal.default, 'endWord.length', 1));
                            end = this.items.index(endWord);
                        }
                        array[i] = { start: start, end: end };
                    }
                }
                return array;
            },

            /**
             * Round up span index to closest word
             * @param index
             * @private
             */
            _roundUp: function (index) {
                assert.type(NUMBER, index, assert.format(assert.messages.type.default, 'index', NUMBER));
                var word;
                var pos = index;
                if (this._split instanceof RegExp) {
                    while (isNaN(word) && pos < this.items.length) {
                        word = parseInt($(this.items.get(pos)).attr(kendo.attr(INDEX)), 10);
                        pos++;
                    }
                    pos--;
                }
                return pos;
            },

            /**
             * Round down span index to closest word
             * @param index
             * @private
             */
            _roundDown: function (index) {
                assert.type(NUMBER, index, assert.format(assert.messages.type.default, 'index', NUMBER));
                var word;
                var pos = index;
                if (this._split instanceof RegExp) {
                    while (isNaN(word) && pos >= 0) {
                        word = parseInt($(this.items.get(pos)).attr(kendo.attr(INDEX)), 10);
                        pos--;
                    }
                    pos++;
                }
                return pos;
            },

            /**
             * Add a new selection and possibly collapse adjoining selections
             * @param selection
             * @private
             */
            _add: function (selection) {
                // This is always a selection across all spans, whether breaking the sentence into words or characters
                assert.isPlainObject(selection, assert.format(assert.messages.isPlainObject.default, 'selection'));
                assert.type(NUMBER, selection.start, assert.format(assert.messages.type.default, 'selection.start', NUMBER));
                assert.type(NUMBER, selection.end, assert.format(assert.messages.type.default, 'selection.end', NUMBER));
                // Snap selection to words if necessary
                selection = {
                    start: this._roundUp(selection.start),
                    end: this._roundDown(selection.end)
                };
                var ret = [];
                var value = this._value || [];
                var added = false;
                for (var i = 0, length = value.length; i < length; i++) {
                    var existing = value[i];
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
                            end: Math.max (selection.end, existing.end)
                        };
                    }
                }
                if (!added) {
                    ret.push(selection);
                }
                this._value = ret;
                this.trigger(CHANGE);
            },

            /**
             * Substract a new selection and possibly break adjoining selections
             * @param selection
             * @private
             */
            _sub: function (selection) {
                // This is always a selection across all spans, whether breaking the sentence into words or characters
                assert.isPlainObject(selection, assert.format(assert.messages.isPlainObject.default, 'selection'));
                assert.type(NUMBER, selection.start, assert.format(assert.messages.type.default, 'selection.start', NUMBER));
                assert.type(NUMBER, selection.end, assert.format(assert.messages.type.default, 'selection.end', NUMBER));
                // Snap selection to words if necessary
                selection = {
                    start: this._roundUp(selection.start),
                    end: this._roundDown(selection.end)
                };
                var ret = [];
                var value = this._value || [];
                for (var i = 0, length = value.length; i < length; i++) {
                    var existing = value[i];
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
                                end: this._roundDown(selection.start - 1)
                            });
                        }
                        // Second break
                        if (selection.end < existing.end) {
                            ret.push({
                                start: this._roundUp(selection.end + 1),
                                end: existing.end
                            });
                        }
                    }
                }
                this._value = ret;
                this.trigger(CHANGE);
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                var options = that.options;
                that.wrapper = that.element;
                that.element.empty();
                that.element.addClass(WIDGET_CLASS);
                if (that._split instanceof RegExp) {
                    // Note: This is probably the most controversial part of the widget
                    // @see https://stackoverflow.com/questions/40881365/split-a-string-into-an-array-of-words-punctuation-and-spaces-in-javascript
                    // @see https://stackoverflow.com/questions/43876036/regex-split-string-into-array-based-on-punctuation-spaces?rq=1
                    var split =  options.text.split(that._split);
                    var html = '';
                    var wordIndex = 0;
                    for (var i = 0, length = split.length; i < length; i++) {
                        if (that._split.test(split[i])) {
                            html += SPAN_OPEN + split[i] + SPAN_CLOSE;
                        } else if (split[i].length) {
                            html += kendo.format(SPAN_WITH_INDEX, wordIndex) + split[i] + SPAN_CLOSE;
                            wordIndex++;
                        }
                    }
                    that.element.html(html);
                } else {
                    that.element.html(SPAN_OPEN + options.text.split('').join(SPAN_CLOSE + SPAN_OPEN) + SPAN_CLOSE);
                }
                // Keep a reference on all children to avoid recurring DOM queries
                that.items = that.element.children(SPAN_SELECTOR);
            },

            /**
             * enable for binding
             * @param enable
             */
            enable: function (enable) {
                enable = $.type(enable) === UNDEFINED ? true : !!enable;
                this.element.off(NS);
                if (enable) {
                    this.element
                        .on(MOUSEDOWN + NS + ' ' + TOUCHSTART + NS, SPAN_SELECTOR, this._onMouseDown.bind(this))
                        .on(MOUSEMOVE + NS + ' ' + TOUCHMOVE + NS, SPAN_SELECTOR, this._onMouseMove.bind(this))
                        .on(MOUSEUP + NS + ' ' + TOUCHEND + NS, SPAN_SELECTOR, this._onMouseUp.bind(this));
                }
            },

            /**
             * Mousedown event handler
             * @param e
             * @private
             */
            _onMouseDown: function (e) {
                var target = $(e.target);
                var index = this.items.index(target);
                this._action = {
                    active: !target.hasClass(ACTIVE_SELECTOR.substr(1)),
                    initial: index,
                    // This is always a selection across all spans, including spaces and punctuation
                    selection: {
                        // possibly we get end < start, and we do not have a selection
                        start: this._roundUp(index),
                        end: this._roundDown(index)
                    }
                };
            },

            /**
             * Mousemove event handler
             * @param e
             * @private
             */
            _onMouseMove: function (e) {
                if (this._action) {
                    var target = $(e.target);
                    var index = this.items.index(target);
                    // Make sure we can work both ways (right and left from initial mousedown)
                    if (index < this._action.initial) {
                        // We are selecting towards the left
                        this._action.selection.start = this._roundUp(index);
                        this._action.selection.end = this._roundDown(this._action.initial);
                    } else {
                        // We are selecting towards the right
                        this._action.selection.start = this._roundUp(this._action.initial);
                        this._action.selection.end = this._roundDown(index);
                    }
                    // This is always a selection across all spans, including spaces and punctuation
                    this._highlight(this._action.selection, this._action.active, true);
                }
            },

            /**
             * Mouseup event handler
             * @param e
             * @private
             */
            _onMouseUp: function (e) {
                this._onMouseMove(e);
                // Unselect text to show highlight
                var selection = window.getSelection();
                selection.removeAllRanges();
                // Store the selection and trigger a change event to refresh the UI
                if (this._action.active) {
                    this._add(this._action.selection);
                } else {
                    this._sub(this._action.selection);
                }
                // Action is now completed
                this._action = undefined;
                // Refresh th eUI
                this.refresh();
                this.trigger(CHANGE);
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Highlight/unhighlight a selection
             * @param selection
             * @param active
             * @param hover
             * @private
             */
            _highlight: function (selection, active, hover) {
                assert.isPlainObject(selection, assert.format(assert.messages.isPlainObject.default, 'selection'));
                assert.type(NUMBER, selection.start, assert.format(assert.messages.type.default, 'selection.start', NUMBER));
                assert.type(NUMBER, selection.end, assert.format(assert.messages.type.default, 'selection.end', NUMBER));
                assert.type(BOOLEAN, active, assert.format(assert.messages.type.default, 'active', BOOLEAN));
                var activeClass = ACTIVE_SELECTOR.substr(1);
                var hoverClass = HOVER_SELECTOR.substr(1);
                hover = !!hover;
                // Highlight selections both when hovering and refreshing
                if (active) { // Highlighting
                    if (hover) {
                        // Remove highlighting from any previous mouse selection
                        this.items.filter(HOVER_SELECTOR).removeClass(activeClass);
                    }
                    if (selection.end >= selection.start) {
                        // Add highlighting (and hovering) to the current (mouse) selection
                        this.items.slice(selection.start, selection.end + 1).addClass(hover ? activeClass + ' ' + hoverClass : activeClass);
                    }
                } else {
                    if (hover) { // un-highlighting
                        // Restore highlighting to the previous mouse selection
                        this.items.filter(HOVER_SELECTOR).addClass(activeClass);
                    }
                    if (selection.end >= selection.start) {
                        // Remove highlighting (and hovering) to the current (mouse) selection
                        this.items.slice(selection.start, selection.end + 1).removeClass(hover ? activeClass + ' ' + hoverClass : activeClass);
                    }
                }
                this.items.filter(':not(' + ACTIVE_SELECTOR + ')').removeAttr('style');
                this.items.filter(ACTIVE_SELECTOR).css(util.styleString2CssObject(this.options.highlightStyle));
            },

            /* jshint +W074 */

            /**
             * Refresh the widget
             */
            refresh: function () {
                // Clear all highlights
                this.items.filter(HOVER_SELECTOR).removeClass(HOVER_SELECTOR.substr(1));
                this.items.filter(ACTIVE_SELECTOR).removeClass(ACTIVE_SELECTOR.substr(1));
                // Paint new highlights from this._value
                for (var i = 0, length = this._value.length; i < length; i++) {
                    this._highlight(this._value[i], true, false);
                }
                logger.debug({ method: 'refresh', message: 'widget refreshed' });
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                var wrapper = that.wrapper;
                // Unbind events
                kendo.unbind(wrapper);
                // Release references
                that.items = undefined;
                that.element.off(NS);
                // Destroy kendo
                Widget.fn.destroy.call(that);
                kendo.destroy(wrapper);
                // Remove widget class
                // wrapper.removeClass(WIDGET_CLASS);
            }

        });

        kendo.ui.plugin(HighLighter);

    }(window.jQuery));

    /* jshint +W071 */

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
