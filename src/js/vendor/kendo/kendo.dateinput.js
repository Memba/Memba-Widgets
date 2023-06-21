/**
 * Kendo UI v2023.2.606 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.core.js";
import "./kendo.label.js";
import "./kendo.icons.js";
import "./kendo.dateinput.common.js";

var __meta__ = {
    id: "dateinput",
    name: "DateInput",
    category: "web",
    description: "The DateInput widget allows to edit date by typing.",
    depends: [ "core", "label" ]
};

(function($, undefined) {
    var global = window;
    var kendo = global.kendo;
    var ui = kendo.ui;
    var Widget = ui.Widget;
    var DateInputCommon = ui.DateInputCommon;
    var ns = ".kendoDateInput";
    var objectToString = {}.toString;
    var isPlainObject = $.isPlainObject;


    var FOCUSED = "k-focus";
    var STATEDISABLED = "k-disabled";
    var STATEINVALID = "k-invalid";

    var DISABLED = "disabled";
    var READONLY = "readonly";
    var CHANGE = "change";

    var IntlService = kendo.Class.extend({
        init: function(options) {
            const info = options.culture ? kendo.getCulture(options.culture) : kendo.culture();
            this.messages = options.messages;
            this.cldr = { };
            this.cldr[info.name] = {
                name: info.name,
                calendar: info.calendar || {},
                numbers: info.numberFormat
            };
        },

        parseDate: function(value, format, culture) {
            return kendo.parseDate(value, format, culture);
        },

        formatDate: function(date, format, culture) {
            return kendo.toString(date, format, culture);
        },

        splitDateFormat: function(format) {
            return kendo.date.splitDateFormat(format);
        },

        dateFormatNames: function(locale, options) {
            return kendo.date.dateFormatNames(options);
        },

        dateFieldName: function(options) {
            return this.messages[options.type] || {};
        }
    });

    function buildKeys() {
        const cultureInfo = kendo.culture();
        let keys = [];

        keys.push(cultureInfo.calendars.standard["/"]);
        keys.push(cultureInfo.calendars.standard[":"]);

        return keys;
    }

    function getCultureFormat(culture, format) {
        if (!culture) {
            return format;
        }
        const cultureInfo = kendo.getCulture(culture);
        return cultureInfo.calendars.standard.patterns[format] || format;
    }

    var DateInput = Widget.extend({
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);
            element = that.element;

            options = that.options;
            options.format = kendo._extractFormat(options.format || kendo.getCulture(options.culture).calendars.standard.patterns.d);
            options.min = kendo.parseDate(element.attr("min")) || kendo.parseDate(options.min);
            options.max = kendo.parseDate(element.attr("max")) || kendo.parseDate(options.max);

            var wrapperClass = (element.parent().attr("class") || "");
            var skipStyling = wrapperClass.indexOf("picker") >= 0 && wrapperClass.indexOf("rangepicker") < 0;
            var initialValue = that.options.value || element.val();

            if (skipStyling) {
                that.wrapper = that.element.parent();
            } else {
                that.wrapper = element.wrap("<span class='k-dateinput k-input'></span>").parent();
                that.wrapper.addClass(element[0].className).removeClass('input-validation-error');
            }
            that.wrapper[0].style.cssText = element[0].style.cssText;
            element.css({
                height: element[0].style.height
            });


            that._validationIcon = $(kendo.ui.icon({ icon: "exclamation-circle", iconClass: "k-input-validation-icon k-hidden" })).insertAfter(element);

            that._form();

            that.dateInputInstance = new DateInputCommon(element[0], {
                format: getCultureFormat(options.culture, options.format),
                autoCorrectParts: options.autoCorrectParts,
                autoSwitchKeys: options.autoSwitchKeys.length ? options.autoSwitchKeys : buildKeys(),
                enableMouseWheel: options.enableMouseWheel,
                twoDigitYearMax: options.twoDigitYearMax,
                steps: options.steps,
                formatPlaceholder: options.messages,
                events: {
                    inputEnd: function(e) {
                        if (e.error) {
                            that._blinkInvalidState();
                        }
                    },
                    keydown: function(e) {
                        if (e.event.keyCode == kendo.keys.UP || e.event.keyCode == kendo.keys.DOWN) {
                            setTimeout(function() {
                                that.element.trigger(CHANGE);
                            });
                        }
                    },
                    blur: function(e) {
                        that._change();
                        e.preventDefault();
                    },
                },
                intlService: new IntlService({
                    culture: options.culture,
                    messages: that.options.messages
                }),
                autoSwitchParts: options.autoSwitchParts
            });

            that._emptyMask = this.element.val();
            if (options.value) {
                that.value(options.value);
            }

            that.element
                .addClass("k-input-inner")
                .attr("autocomplete", "off")
                .on("focus" + ns, function() {
                    that.wrapper.addClass(FOCUSED);
                })
                .on("focusout" + ns, function() {
                    that.wrapper.removeClass(FOCUSED);
                });

            try {
                element[0].setAttribute("type", "text");
            } catch (e) {
                element[0].type = "text";
            }

            var disabled = element.is("[disabled]") || $(that.element).parents("fieldset").is(':disabled');

            if (disabled) {
                that.enable(false);
            } else {
                that.readonly(element.is("[readonly]"));
            }
            that.value(initialValue);
            if (!skipStyling) {
                that._applyCssClasses();
            }

            if (options.label) {
                that._label();
            }

            kendo.notify(that);
        },

        options: {
            name: "DateInput",
            autoCorrectParts: true,
            autoSwitchKeys: [],
            autoSwitchParts: false,
            enableMouseWheel: true,
            culture: "",
            value: "",
            format: "",
            min: new Date(1900, 0, 1),
            max: new Date(2099, 11, 31),
            messages: {
                "year": "year",
                "month": "month",
                "day": "day",
                "weekday": "day of the week",
                "hour": "hours",
                "minute": "minutes",
                "second": "seconds",
                "milliseconds": "milliseconds",
                "dayperiod": "AM/PM"
            },
            size: "medium",
            steps: {
                year: 1,
                month: 1,
                day: 1,
                hour: 1,
                minute: 1,
                second: 1,
                millisecond: 1,
            },
            fillMode: "solid",
            rounded: "medium",
            label: null
        },

        events: [
            CHANGE
        ],

        min: function(value) {
            if (value !== undefined) {
                this.options.min = value;
            } else {
                return this.options.min;
            }
        },

        max: function(value) {
            if (value !== undefined) {
                this.options.max = value;
            } else {
                return this.options.max;
            }
        },

        setOptions: function(options) {
            var that = this;
            Widget.fn.setOptions.call(that, options);
            that.dateInputInstance.destroy();
            that.dateInputInstance = null;

            that.dateInputInstance = new DateInputCommon(this.element[0], {
                format: getCultureFormat(that.options.culture, that.options.format),
                autoSwitchKeys: that.options.autoSwitchKeys.length ? that.options.autoSwitchKeys : buildKeys(),
                autoCorrectParts: that.options.autoCorrectParts,
                enableMouseWheel: that.options.enableMouseWheel,
                steps: that.options.steps,
                twoDigitYearMax: that.options.twoDigitYearMax,
                formatPlaceholder: that.options.messages,
                events: {
                    inputEnd: function(e) {
                        if (e.error) {
                            that._blinkInvalidState();
                        }
                    },
                    keydown: function(e) {
                        if (e.event.keyCode == kendo.keys.UP || e.event.keyCode == kendo.keys.DOWN) {
                            setTimeout(function() {
                                that.element.trigger(CHANGE);
                            });
                        }
                    },
                    blur: function(e) {
                        that._change();
                        e.preventDefault();
                    },
                },
                intlService: new IntlService({
                    culture: that.options.culture,
                    messages: that.options.messages
                }),
                autoSwitchParts: that.options.autoSwitchParts
            });
        },

        destroy: function() {
            var that = this;
            that.element.off(ns);

            if (that._formElement) {
                that._formElement.off("reset", that._resetHandler);
            }

            if (that.label) {
                that.label.destroy();
            }

            Widget.fn.destroy.call(that);
        },

        value: function(value) {
            if (value === undefined) {
                return this.dateInputInstance.value;
            }

            if (value === null) {
                value = "";
            }

            if (objectToString.call(value) !== "[object Date]") {
                value = kendo.parseDate(value, this.options.format, this.options.culture);
            }

            if (value && !value.getTime()) {
                value = null;
            }

            this.dateInputInstance.writeValue(value);

            if (this.label && this.label.floatingLabel) {
                this.label.floatingLabel.refresh();
            }
        },

        _hasDateInput: function() {

            return this._emptyMask !== this.element.val();
        },

        readonly: function(readonly) {
            this._editable({
                readonly: readonly === undefined ? true : readonly,
                disable: false
            });

            if (this.label && this.label.floatingLabel) {
                this.label.floatingLabel.readonly(readonly === undefined ? true : readonly);
            }
        },

        enable: function(enable) {
            this._editable({
                readonly: false,
                disable: !(enable = enable === undefined ? true : enable)
            });

            if (this.label && this.label.floatingLabel) {
                this.label.floatingLabel.enable(enable = enable === undefined ? true : enable);
            }
        },

        _label: function() {
            var that = this;
            var options = that.options;
            var labelOptions = isPlainObject(options.label) ? options.label : {
                content: options.label
            };

            that.label = new kendo.ui.Label(null, $.extend({}, labelOptions, {
                widget: that,
                floatCheck: () => {
                    if (!that.value() && !that._hasDateInput() && document.activeElement !== that.element[0]) {
                        this.element.val("");
                        return true;
                    }

                    return false;
                }
            }));

            that._inputLabel = that.label.element;
        },

        _bindInput: function() {
            var that = this;
            that.element
                .on("focus" + ns, function() {
                    that.wrapper.addClass(FOCUSED);
                })
                .on("focusout" + ns, function() {
                    that.wrapper.removeClass(FOCUSED);
                });
        },

        _unbindInput: function() {
            this.element
                .off("focus" + ns)
                .off("focusout" + ns);
        },

        _editable: function(options) {
            var that = this;
            var element = that.element;
            var disable = options.disable;
            var readonly = options.readonly;
            var wrapper = that.wrapper;

            that._unbindInput();

            if (!readonly && !disable) {
                wrapper.removeClass(STATEDISABLED);
                if (element && element.length) {
                    element[0].removeAttribute(DISABLED);
                    element[0].removeAttribute(READONLY);
                }

                that._bindInput();
            } else {
                if (disable) {
                    wrapper.addClass(STATEDISABLED);
                    element.attr(DISABLED, disable);
                    if (element && element.length) {
                        element[0].removeAttribute(READONLY);
                    }
                }
                if (readonly) {
                    element.attr(READONLY, readonly);
                }
            }
        },

        _change: function() {
            var that = this;
            var oldValue = that._oldValue;
            var value = that.value();

            if (value && that.min() && value < that.min()) {
                that.value(that.min());
                value = that.value();
            }
            if (value && that.max() && value > that.max()) {
                that.value(that.max());
                value = that.value();
            }

            if (oldValue && value && value.getTime() !== oldValue.getTime() ||
                oldValue && !value ||
                !oldValue && value
            ) {
                that._oldValue = value;
                that.trigger(CHANGE);
                that.element.trigger(CHANGE);
            }
        },


        _blinkInvalidState: function() {
            var that = this;

            that._addInvalidState();
            clearTimeout(that._invalidStateTimeout);
            that._invalidStateTimeout = setTimeout(that._removeInvalidState.bind(that), 100);
        },

        _addInvalidState: function() {
            var that = this;

            that.wrapper.addClass(STATEINVALID);
            that._validationIcon.removeClass("k-hidden");
        },

        _removeInvalidState: function() {
            var that = this;

            that.wrapper.removeClass(STATEINVALID);
            that._validationIcon.addClass("k-hidden");
            that._invalidStateTimeout = null;
        },


        _form: function() {
            var that = this;
            var element = that.element;
            var formId = element.attr("form");
            var form = formId ? $("#" + formId) : element.closest("form");
            var initialValue = element[0].value;

            if (!initialValue && that.options.value) {
                initialValue = that.options.value;
            }

            if (form[0]) {
                that._resetHandler = function() {
                    setTimeout(function() {
                        that.value(initialValue);
                    });
                };

                that._formElement = form.on("reset", that._resetHandler);
            }
        },

        _paste: function(e) {
            e.preventDefault();
        },


    });

    kendo.cssProperties.registerPrefix("DateInput", "k-input-");

    kendo.cssProperties.registerValues("DateInput", [{
        prop: "rounded",
        values: kendo.cssProperties.roundedValues.concat([['full', 'full']])
    }]);

    ui.plugin(DateInput);

})(window.kendo.jQuery);

