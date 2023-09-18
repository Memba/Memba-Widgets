/**
 * Kendo UI v2023.2.829 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.timeselector.js";
import "./kendo.icons.js";

var __meta__ = {
    id: "timedurationpicker",
    name: "TimeDurationPicker",
    category: "web",
    description: "The TimeDurationPicker widget allows the end user to select a time range stored in milliseconds.",
    docsCategory: "editors",
    depends: [ "timeselector" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        html = kendo.html,
        map = $.map,
        extend = $.extend,
        mediaQuery = kendo.mediaQuery,
        OPEN = "open",
        FOCUS = "focus",
        CLOSE = "close",
        CHANGE = "change",
        CLICK = "click",
        SPAN = "<span></span>",
        KEYDOWN = "keydown",
        FOCUSOUT = "focusout",
        FOCUSED = "k-focus",
        MOUSEUP = "mouseup",
        MOUSEDOWN = "mousedown",
        PASTE = "paste",
        NS = ".kendoTimeDurationPicker",
        ARIA_EXPANDED = "aria-expanded",
        HOVEREVENTS = "mouseenter" + NS + " mouseleave" + NS,
        STRING = "string",
        INPUT = "input",
        HOVER = "k-hover",
        STATEDISABLED = "k-disabled",
        ARIA_HIDDEN = "aria-hidden",
        ARIA_DISABLED = "aria-disabled",
        ARIA_READONLY = "aria-readonly",
        ARIA_READONLY = "aria-readonly",
        DISABLED = "disabled",
        READONLY = "readonly",
        STATEINVALID = "k-invalid",
        MASKCHAR = "_",
        caret = kendo.caret,
        keys = kendo.keys,
        NS = ".kendoTimeDurationPicker";
        html = kendo.html;

    var defaultColumns = {
        "hours": {
            name: "hours",
            format: "## hours",
            divider: 3600000,
            min: 0,
            max: 23,
            step: 1
        },
        "minutes": {
            name: "minutes",
            format: "## mins",
            divider: 60000,
            min: 0,
            max: 59,
            step: 1
        },
        "seconds": {
            name: "seconds",
            format: "## sec",
            divider: 1000,
            min: 0,
            max: 59,
            step: 1
        },
        "milliseconds": {
            name: "milliseconds",
            format: "### msec",
            min: 0,
            max: 999,
            step: 1
        },
        "days": {
            format: "## days",
            name: "days",
            divider: 86400000,
            min: 0,
            max: 365,
            step: 1
        }
    };

    function convertToMsec(value) {
        return ((value.days || 0) * 86400000) + ((value.hours || 0) * 3600000) + ((value.minutes || 0) * 60000) + ((value.seconds || 0) * 1000) + (value.milliseconds || 0);
    }

    function getTimeParts(value) {
        var rest;
        var days = Math.floor(value / 86400000);
        rest = value % 86400000;
        var hours = Math.floor(rest / 3600000);
        rest = value % 3600000;
        var minutes = Math.floor(rest / 60000);
        rest = value % 60000;
        var seconds = Math.floor(rest / 1000);
        rest = value % 1000;

        return {
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            milliseconds: rest
        };
    }

    function normalizeColumns(columns) {
        return map(columns, function(column) {
            column = typeof column === STRING ? { name: column } : column;
            var extended = extend(true, {}, defaultColumns[column.name], column);
            extended.selectorFormat = "{0:" + "0".repeat(extended.format.match(/#/g).length) + "}";
            return extended;
        });
    }

    var TimeDurationPicker = Widget.extend({
        init: function(element, options) {
            var that = this;

            options = options || {};

            Widget.fn.init.call(that, element, options);

            that._columns = normalizeColumns(options.columns);
            that.options.columns = that._columns;
            that.options.readonly = options.readonly !== undefined ? options.readonly : Boolean(that.element.attr("readonly"));
            that.options.enable = options.enable !== undefined ? options.enable : !(Boolean(that.element.is("[disabled]") || $(element).parents("fieldset").is(':disabled')));

            that.bigScreenMQL = mediaQuery("large");
            if (that.options.adaptiveMode == "auto") {
                that.bigScreenMQL.onChange(()=> {
                    if (that._timeSelector) {
                        that._timeSelector.destroy();
                        that._timeSelector = null;
                    }

                    that._popupView();
                });
            }

            that._wrapper();
            that._button();
            that._applyCssClasses();
            that._input();
            that._popupView();

            that._buildMask();
            that._validation();
            that._editable({
                readonly: that.options.readonly,
                disable: !that.options.enable
            });
            that._ariaLabel(that._timeSelector._listsContainer);
            if (that.options.value) {
                that.value(options.value);
                that._old = that._maskedInput.val();
            }
            that._canUpdateLast = true;

            kendo.notify(that);
        },

        options: {
            name: "TimeDurationPicker",
            columns: [],
            separator: ",",
            shortcuts: [],
            value: null,
            adaptiveMode: "none",
            size: "medium",
            fillMode: "solid",
            rounded: "medium",
            messages: {
                set: "Set",
                cancel: "Cancel",
                days: "Days",
                hours: "Hours",
                minutes: "Minutes",
                milliseconds: "Milliseconds",
                seconds: "Seconds"
            }
        },

        events: [
            OPEN,
            CLOSE,
            CHANGE
        ],

        destroy: function() {
            var that = this;

            that.wrapper.off(NS);
            that._maskedInput.off(NS);
            if (that._timeSelector) {
                that._timeSelector.destroy();
                that._timeSelector = null;
            }


            if (that.bigScreenMQL) {
                that.bigScreenMQL.destroy();
            }
        },

        value: function(value) {
            var that = this;

            if (value === undefined) {
                return that._value;
            }

            if (typeof value === "number") {
                value = parseInt(value);
            } else {
                value = null;
            }

            that._value = value;
            that.element.val(that._value);
            that._timeSelector._value = that._value;
            that._updateValueFromTimeSelector();
        },

        _toggleHover: function(e) {
            $(e.currentTarget).toggleClass(HOVER, e.type === "mouseenter");
        },

        _editable: function(options) {
            var that = this,
                disable = options.disable,
                readonly = options.readonly,
                element = that._maskedInput.add(that.element).off(NS),
                wrapper = that.wrapper.off(NS);

            if (!readonly && !disable) {
                wrapper
                    .removeClass(STATEDISABLED)
                    .on(HOVEREVENTS, that._toggleHover);

                if (element && element.length) {
                    element.removeAttr(DISABLED);
                    element.removeAttr(READONLY);
                }
                element.attr(ARIA_DISABLED, false)
                       .attr(ARIA_READONLY, false);

                that._attachHandlers();
            } else {
                wrapper
                    .addClass(disable ? STATEDISABLED : "")
                    .removeClass(disable ? "" : STATEDISABLED);

                element.attr(DISABLED, disable)
                       .attr(READONLY, readonly)
                       .attr(ARIA_DISABLED, disable)
                       .attr(ARIA_READONLY, readonly);
            }
        },

        readonly: function(readonly) {
            this._editable({
                readonly: readonly === undefined ? true : readonly,
                disable: false
            });
        },

        enable: function(enable) {
            this._editable({
                readonly: false,
                disable: !(enable = enable === undefined ? true : enable)
            });
        },

        _popupView: function() {
            var that = this;
            var options = that.options;

            if (!that._timeSelector) {
                that._timeSelector = new kendo.ui.TimeSelector(that._maskedInput, {
                    id: that.element.attr("id") + "_timeSelector",
                    anchor: that.wrapper,
                    adaptiveMode: options.adaptiveMode,
                    columns: options.columns,
                    shortcuts: options.shortcuts,
                    value: options.value,
                    size: options.adaptiveMode != "auto" || that.bigScreenMQL.mediaQueryList.matches ? options.size : "large",
                    fillMode: options.fillMode,
                    rounded: options.rounded,
                    messages: options.messages,
                    focus: function() {
                        that._maskedInput.trigger("focus");
                        that._selectNearestSection(that._lastCaret || 0);
                    },
                    close: function(e) {
                        if (that.trigger(CLOSE)) {
                            e.preventDefault();
                        } else {
                            that._maskedInput.attr(ARIA_EXPANDED, false);
                            that._timeSelector._listsContainer.attr(ARIA_HIDDEN, true);
                        }
                    },
                    open: function(e) {
                        if (that.trigger(OPEN)) {
                            e.preventDefault();
                        } else {
                            that._maskedInput.attr(ARIA_EXPANDED, true);
                            that._timeSelector._listsContainer.attr(ARIA_HIDDEN, false);
                            that._lastCaret = caret(that._maskedInput)[0];
                            if (that._lastCaret === that._maskedInput.val().length) {
                                that._lastCaret = 0;
                            }
                        }
                    },
                    change: function(value) {
                        that._value = value;
                        that._updateValueFromTimeSelector();
                        that._removeInvalidState();
                        that.trigger(CHANGE);
                    }
                });
            }
        },

        _button: function() {
            var that = this,
                element = that.element,
                options = that.options,
                button;

            button = element.next("button.k-input-button");

            if (!button[0]) {
                button = $(html.renderButton('<button unselectable="on" tabindex="-1" class="k-input-button" aria-label="select"></button>', {
                    icon: "clock-arrow-rotate",
                    size: options.size,
                    fillMode: options.fillMode,
                    shape: "none",
                    rounded: "none"
                })).insertAfter(element);
            }

            that._button = button.attr({
                "role": "button"
            });
        },

        _buildMask: function() {
            var columns = this.options.columns;
            var format;
            var toAdd = "";
            var part;

            this._emtpyMask = "";
            this._maskParts = [];

            for (var i = 0; i < columns.length; i++) {
                part = {};
                format = columns[i].format;

                if (i) {
                    toAdd = this.options.separator;
                }

                toAdd += format.replace(/#/g, '_');
                this._emtpyMask += toAdd;
                part.end = this._emtpyMask.length - 1;
                part.mask = format.replace(/#/g, '_');
                part.symbolsLength = part.mask.match(/_/g).length;
                part.start = this._emtpyMask.indexOf(part.mask);
                part.numberEnd = this._emtpyMask.lastIndexOf(MASKCHAR) + 1;
                part.numberStart = this._emtpyMask.indexOf(MASKCHAR, part.start);

                this._maskParts.push(part);
            }

            this._old = this._emtpyMask;
            this._maskedInput.val(this._emtpyMask);
        },

        _input: function() {
            var that = this;

            that._maskedInput = $("<input />")
                        .attr(kendo.attr("validate"), false)
                        .attr({
                            "role": "combobox",
                            "aria-expanded": false,
                            "aria-controls": that.element.attr("id") + "_timeSelector",
                            "autocomplete": "off"
                        })
                        .addClass("k-input-inner")
                        .insertBefore(that.element);

            that.element.hide();
        },

        _wrapper: function() {
            var that = this,
                element = that.element,
                wrapper;

            wrapper = element.parents(".k-timedurationpicker");

            if (!wrapper[0]) {
                wrapper = element.wrap(SPAN).parent();
            }

            that.wrapper = wrapper.addClass("k-timedurationpicker k-input");
        },

        _attachHandlers: function() {
            var that = this;

            that._maskedInput
                    .on(KEYDOWN + NS, that._keydown.bind(that))
                    .on(INPUT + NS, that._inputHandler.bind(that))
                    .on(FOCUS + NS, that._focus.bind(that))
                    .on(FOCUSOUT + NS, that._focusout.bind(that))
                    .on(PASTE + NS, that._paste.bind(that))
                    .on(MOUSEDOWN + NS, that._mouseDown.bind(that))
                    .on(MOUSEUP + NS, that._mouseUp.bind(that));

            that.wrapper.on(CLICK + NS, ".k-input-button", that._click.bind(that));
        },

        _mouseDown: function() {
            this._mouseOnInput = true;
        },

        _mouseUp: function() {
            var selection = caret(this._maskedInput[0]);
            var value = this._maskedInput[0].value;
            if (selection[0] === selection[1]) {
                this._selectNearestSection(selection[1] == value.length ? value.length - 1 : selection[1]);
            }
        },

        _triggerChange: function() {
            if ((this._lastValue == undefined && this._value) || this._lastValue != this._value) {
                this._lastValue = this._value;
                this.trigger(CHANGE);
            }
        },

        _focusout: function() {
            this._updateValueFromInput();
            this._triggerChange();

            this._canUpdateLast = true;
            this.wrapper.removeClass(FOCUSED);
        },

        _focus: function() {
            var that = this;
            if (!that._mouseOnInput) {
                setTimeout(function() {
                    that._selectNearestSection(0);
                }, 10);
            }
            that._mouseOnInput = false;
            that.wrapper.addClass(FOCUSED);
        },

        _selectNearestSection: function(index) {
            var part;

            for (var i = 0; i < this._maskParts.length; i++ ) {
                part = this._maskParts[i];
                if (index >= part.start && index <= part.end) {
                    caret(this._maskedInput[0], part.numberStart, part.numberEnd);
                }
            }
        },

        _getPartValue: function(value, index) {
            var that = this;
            var separator = that.options.separator;
            var startSeparator = value.indexOf(separator,index);
            var lastSeparator = value.lastIndexOf(separator,index);
            return value.substring(lastSeparator < 0 ? 0 : lastSeparator + 1 , startSeparator < 0 ? value.length : startSeparator );
        },

        _getEmptyPart: function(index) {
            return this._getPartValue(this._emtpyMask, index);
        },

        _fillParts: function(clipNumber) {
            var parts = this._emtpyMask.split(this.options.separator);
            var symbols;
            clipNumber = clipNumber + "";

            for (var i = 0; i < parts.length; i++) {
                symbols = parts[i].match(/_/g).length;
                if (symbols > clipNumber.length) {
                    parts[i] = parts[i].replace(MASKCHAR.repeat(symbols), "0".repeat(symbols - clipNumber.length) + clipNumber);
                } else {
                    parts[i] = parts[i].replace(MASKCHAR.repeat(symbols), clipNumber.substring(0, symbols));
                    clipNumber = clipNumber.substring(symbols, symbols.length);
                }
            }
            return parts.join(this.options.separator);
        },

        _clearParts: function(value, start, end) {
            var parts = value.split(this.options.separator);
            var index = 0;
            var endBoundary;

            for (var i = 0; i < parts.length; i++) {
                endBoundary = index + parts[i].length;
                if ((index <= start && endBoundary >= start) || (index <= end && endBoundary >= end)) {
                    parts[i] = this._getEmptyPart(index);
                }
                index += (parts[i].length + 1);
            }
            return parts.join(this.options.separator);
        },

        _updatePart: function(oldValue, entered) {
            var emrtyPart = this._getEmptyPart(this._old.indexOf(oldValue));
            var current = oldValue.substring(emrtyPart.indexOf(MASKCHAR), emrtyPart.lastIndexOf(MASKCHAR) + 1);
            var format = "{0:" + "0".repeat(current.length) + "}";

            if (current.indexOf(MASKCHAR) >= 0 || !(oldValue[oldValue.search(/[0-9]/)] === "0") || entered.length > 1) {
                return oldValue.replace(current, kendo.format(format, parseInt(entered)));
            } else {
                return oldValue.replace(current, kendo.format(format, parseInt(current + entered)));
            }
        },

        _replacePart: function(oldValue, newPart, index) {
            return oldValue.replace(this._getPartValue(oldValue, index), newPart);
        },

        _click: function() {
            var that = this;

            if (!that._timeSelector) {
                return;
            }

            that._timeSelector.toggle();
        },

        _switchPart: function(options) {
            var separator = this.options.separator;
            var selection = options.caret != undefined ? options.caret : caret(this._maskedInput[0])[0];
            var value = this._maskedInput.val();
            var index;

            if (options.next) {
                index = value.indexOf(separator, selection);
                if (index < 0) {
                    index = value.length - 1;
                } else {
                    index++;
                }
            } else {
                index = value.lastIndexOf(separator, selection);
                if (index < 0 ) {
                    index = 0;
                } else {
                    index--;
                }
            }
            this._selectNearestSection(index);
        },

        _keydown: function(e) {
            var key = e.keyCode;
            var separator = this.options.separator;
            var selection;
            var value;
            var index;
            var future;
            var past;

            this._backward = key === keys.BACKSPACE;
            if (key == keys.LEFT || key == keys.RIGHT) {
                e.preventDefault();
                selection = caret(this._maskedInput[0])[0];
                value = this._maskedInput.val();
                future = value.indexOf(separator, selection);
                past = value.lastIndexOf(separator, selection);

                if ((future < 0 && key == keys.RIGHT) || (past < 0 && key == keys.LEFT)) {
                    return;
                }

                index = (key == keys.LEFT) ? (past - 1) : (future + 1);
                this._selectNearestSection(index);
                if (key == keys.LEFT) {
                    this._canUpdateLast = true;
                }
            } else if (this._timeSelector.popup.visible()) {
                this._timeSelector._scrollerKeyDownHandler(e);
            } else if (key == keys.UP || key == keys.DOWN) {
                e.preventDefault();
                if (e.altKey) {
                    this._timeSelector.toggle();
                }
            } else if (key == keys.ENTER) {
                this._updateValueFromInput();
                this._triggerChange();
            }
        },

        _updateValueFromTimeSelector: function() {
            var that = this;
            var valueParts = getTimeParts(that._value);
            var value = "";
            var column = this._columns[i];
            var part;
            var partValue;
            var masksToAdd;

            for (var i = 0; i < this._columns.length; i++) {
                column = this._columns[i];
                partValue = valueParts[column.name] + '';
                part = this._maskParts[i];

                if (i) {
                    value += that.options.separator;
                }

                if (!valueParts[column.name]) {
                    value += part.mask;
                    continue;
                }

                masksToAdd = part.symbolsLength - partValue.length;
                value += part.mask.replace(MASKCHAR.repeat(part.symbolsLength), "0".repeat(masksToAdd < 0 ? 0 : masksToAdd) + partValue);
            }

            that._maskedInput.val(value);
            that._old = value;
        },

        _validation: function() {
            var that = this;
            var element = that.element;

            that._validationIcon = $(kendo.ui.icon({ icon: "exclamation-circle", iconClass: "k-input-validation-icon k-hidden" })).insertAfter(element);
        },

        _addInvalidState: function() {
            this.wrapper.addClass(STATEINVALID);
            this._validationIcon.removeClass('k-hidden');
        },

        _removeInvalidState: function() {
            this.wrapper.removeClass(STATEINVALID);
            this._validationIcon.addClass('k-hidden');
        },

        _updateValueFromInput: function() {
            var val = this._maskedInput.val();
            var values = {};
            var valid = true;
            var column;
            var part;
            var colValue;

            for (var i = 0; i < this._columns.length; i++) {
                column = this._columns[i];
                part = this._maskParts[i];
                colValue = val.substring(part.numberStart, part.numberEnd).replace(/_/g, "");
                colValue = kendo.parseInt(colValue || 0);

                if (colValue >= column.min && colValue <= column.max) {
                    values[column.name] = colValue;
                } else {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                this._value = convertToMsec(values);
                this.element.val(this._value || "");
                this._timeSelector._value = this._value;
                this._removeInvalidState();
            } else {
                this._addInvalidState();
            }
        },

        _paste: function(e) {
            this._isPasted = true;
            this._pasted = (e.clipboardData || e.originalEvent.clipboardData).getData('Text');
            var emptyPart;

            var selection = caret(this._maskedInput);

            if (this._maskedInput.val().length == selection[1] && !selection[0]) {
                this._replaceEntire = true;
            } else {
                emptyPart = this._getEmptyPart(selection[0]);
                this._pasted = this._pasted.substring(0, emptyPart.match(/_/g).length);
            }
        },

        _inputHandler: function() {
            if (kendo._activeElement() !== this._maskedInput[0]) {
                return;
            }

            var that = this;
            var old = that._old;
            var separator = that.options.separator;
            var value = that._maskedInput[0].value;
            var selection = caret(that._maskedInput)[0];
            var lengthDiff = old.length - value.length;
            var entered;
            var validEntry;
            var updatedPart;
            var endSubstring;
            var startSubstring;
            var deletedPart;
            var emptyPart;
            var canUpdate;
            var restored;
            var oldpartValue;
            var nextSeparator;

            entered = that._isPasted ? that._pasted : value.substring(selection - 1, selection);
            validEntry = /\d/.test(entered);

            if (that._isPasted && that._replaceEntire && validEntry) {
                that._old = that._fillParts(parseInt(entered));
                that._maskedInput.val(that._old);
                that._selectNearestSection(0);
                that._isPasted = that._replaceEntire = false;
                return;
            }

            if (that._isPasted) {
                lengthDiff = 0;
            }

            that._isPasted = false;

            if ((entered === separator && !that._backward)) {
                that._maskedInput.val(that._old);
                that._switchPart({ caret: selection, next: true });
                return;
            }

            if (!value && that._backward) {
                that._old = that._emtpyMask;
                that._maskedInput.val(that._old);
                that._selectNearestSection(selection);
                return;
            }

            if ((!validEntry && !that._backward)) {
                that._maskedInput.val(that._old);
                that._selectNearestSection(selection);
                return;
            }

            if (!lengthDiff || lengthDiff > 0) {
                endSubstring = value.substring(selection, value.length);
                startSubstring = value.substring(0, selection);
                deletedPart = that._emtpyMask.substring(startSubstring.length, old.indexOf(endSubstring));

                restored = startSubstring + deletedPart + endSubstring;
                oldpartValue = that._getPartValue(that._old, selection);
                nextSeparator = that._old.indexOf(separator, that._old.indexOf(oldpartValue) + 1);

                if (that._backward) {
                    // if multiple parts
                    if (deletedPart.split(separator).length > 1) {
                        that._old = this._clearParts(restored, selection, selection + deletedPart.length);
                    } else {
                        emptyPart = this._getEmptyPart(selection);
                        if (emptyPart == oldpartValue) {
                            that._maskedInput.val(that._old);
                            that._switchPart({ caret: selection });
                            return;
                        }
                        that._old = that._replacePart(restored, emptyPart, selection);
                    }
                    that._maskedInput.val(that._old);
                    that._selectNearestSection(selection);
                    return;
                }

                if (nextSeparator < 0 && oldpartValue.indexOf(MASKCHAR) === -1 && !that._canUpdateLast) {
                    that._maskedInput.val(that._old);
                    that._selectNearestSection(selection);
                    return;
                }

                if (validEntry) {
                    updatedPart = that._updatePart(oldpartValue, entered);
                    canUpdate = updatedPart[updatedPart.search(/[0-9]/)] === "0";
                    restored = that._replacePart(restored, updatedPart, selection);
                    that._maskedInput.val(restored);
                    if (nextSeparator > 0 && !canUpdate) {
                        that._selectNearestSection(nextSeparator + 1, true);
                    } else {
                        that._selectNearestSection(selection);
                    }

                    that._canUpdateLast = !(nextSeparator < 0 && !canUpdate);
                }
                that._old = restored;
            } else if (lengthDiff < 0) {
                that._maskedInput.val(that._old);
                that._selectNearestSection(that._old.length - 1);
            }
        },

    });

    kendo.cssProperties.registerPrefix("TimeDurationPicker", "k-input-");

    kendo.cssProperties.registerValues("TimeDurationPicker", [{
        prop: "rounded",
        values: kendo.cssProperties.roundedValues.concat([['full', 'full']])
    }]);

    ui.plugin(TimeDurationPicker);

})(window.kendo.jQuery);
export default kendo;

