/**
 * Kendo UI v2023.3.1010 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.popup.js";
import "./kendo.html.button.js";
import "./kendo.actionsheet.js";

var __meta__ = {
    id: "timeselector",
    name: "TimeSelector",
    category: "web",
    description: "The TimeSelector widget allows the end user to select a time range from a popup",
    depends: [ "popup", "html.button", "actionsheet" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        encode = kendo.htmlEncode,
        Widget = ui.Widget,
        html = kendo.html,
        extend = $.extend,
        mediaQuery = kendo.mediaQuery,
        CHANGE = "change",
        CLICK = "click",
        SCROLL = "scroll",
        FOCUSED = "k-focus",
        keys = kendo.keys,
        NS = ".kendoTimeSelector",
        html = kendo.html;

    var listItemTemplate = ({ value }) => `<li class='k-item' data-value='${encode(value)}'><span>${encode(value)}</span></li>`;
    var listTemplate = ({ title, name }) => '<div class="k-time-list-wrapper">' +
                                          `<span class="k-title">${encode(title)}</span>` +
                                          '<div class="k-time-list">' +
                                              `<div class="k-content k-scrollable k-time-container" data-name="${encode(name)}">` +
                                                  '<ul class="k-reset"></ul>' +
                                                  '<div class="k-scrollable-placeholder"></div>' +
                                              '</div>' +
                                          '</div>' +
                                       '</div>';

    var TimeSelector = Widget.extend({
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            that.bigScreenMQL = mediaQuery("large");
            that.smallScreenMQL = mediaQuery("small");
            if (that.options.adaptiveMode == "auto" ) {
                that.smallScreenMQL.onChange(function() {
                    if (that.popup && kendo.isFunction(that.popup.fullscreen)) {
                        that.popup.fullscreen(that.smallScreenMQL.mediaQueryList.matches);
                    }
                });
            }

            that._wrappers();
            that._buttons();
            that._attchHandlers();
            that._shortCuts();
            that._columns();
            that._popup();
        },
        options: {
            name: "TimeSelector",
            columns: [],
            shortcuts: [],
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

        events: [CHANGE],

        addTranslate: function() {
            var lists = this._listsContainer.find(".k-time-container.k-content.k-scrollable");
            var length = lists.length;
            var list;
            var itemHeight;
            var listHeight;
            var topOffset;
            var translate;
            var bottomOffset;

            for (var i = 0; i < length; i++) {
                list = lists.eq(i);
                itemHeight = getItemHeight(list.find(".k-item:visible").eq(0));
                listHeight = list.outerHeight();
                topOffset = (listHeight - itemHeight) / 2;
                translate = "translateY(" + topOffset + "px)";
                bottomOffset = listHeight - itemHeight;
                list.find("ul").css({
                    transform: translate,
                    "-ms-transform": translate
                });
                list.find(".k-scrollable-placeholder").css({
                    height: list.find("ul").height() + bottomOffset
                });
                list.off(NS)
                    .on(CLICK + NS, ".k-item", this._itemClickHandler.bind(this))
                    .on(SCROLL + NS, this._listScrollHandler.bind(this));
            }
        },

        applyValue: function(value) {
            if (!value) {
                return;
            }
            var that = this;
            var lists = this._listsContainer.find('.k-time-container.k-content.k-scrollable');
            var values = getTimeParts(value);

            lists.each(function(index, list) {
                var column = that.options.columns[index];
                var columnVal = values[column.name];

                if (columnVal >= column.min && columnVal <= column.max) {
                    that._scrollListToPosition($(list), kendo.format(column.selectorFormat, columnVal));
                }
            });
        },

        toggle: function() {
            this.popup.toggle();
        },

        destroy: function() {
            this._listContainer.off(NS);
            this._timeSelectorWrapper.off(NS);

            if (this.popup) {
                this.popup.destroy();
                this.popup = null;
            }

            if (this.bigScreenMQL) {
                this.bigScreenMQL.destroy();
            }

            if (this.smallScreenMQL) {
                this.smallScreenMQL.destroy();
            }
        },

        _attchHandlers: function() {
            var that = this;

            that._listContainer.on("keydown" + NS, this._scrollerKeyDownHandler.bind(this));
            that._timeSelectorWrapper.on("click" + NS, ".k-time-fast-selection button", this._applyShortCut.bind(this));
            that._timeSelectorWrapper.on("click" + NS, ".k-timeduration-footer button.k-time-cancel", this._cancelClickHandler.bind(this));
            that._timeSelectorWrapper.on("click" + NS, ".k-timeduration-footer button.k-time-accept", this._setClickHandler.bind(this));
            that._listContainer.on("mouseover" + NS, ".k-time-list-wrapper", this._mouseOverHandler.bind(this));
        },

        _applyShortCut: function(e) {
            e.preventDefault();
            this._value = parseInt($(e.currentTarget).attr(kendo.attr("value")));
            this.options.change(this._value);
            this.popup.close();
            this.options.focus();
        },

        _scrollerKeyDownHandler: function(e) {
            var that = this,
                key = e.keyCode,
                list = $(e.currentTarget).find(".k-time-list-wrapper.k-focus"),
                lists = that._listContainer.find(".k-time-list-wrapper"),
                length = lists.length,
                index = lists.index(list),
                isRtl = kendo.support.isRtl(that.wrapper),
                itemHeight = getItemHeight(list.find(".k-item:visible").eq(0)),
                container = list.find(".k-time-container.k-content.k-scrollable");

            if (!list.length) {
                return;
            }

            if ((key == keys.UP || key == keys.DOWN) && e.altKey) {
                e.preventDefault();
                that.toggle();
                setTimeout(function() {
                    if (!that.popup.visible()) {
                        that.options.focus();
                    }
                }, 100);
                return;
            }

            if (key == keys.RIGHT && !isRtl || key == keys.LEFT && isRtl) {
                if (index + 1 < length) {
                    that._focusList(lists.eq(index + 1));
                }

            } else if (key == keys.LEFT && !isRtl || key == keys.RIGHT && isRtl) {
                if (index - 1 >= 0) {
                    that._focusList(lists.eq(index - 1));
                }
            } else if (key == keys.UP) {
                container.scrollTop(container.scrollTop() - itemHeight);
                e.preventDefault();
            } else if (key == keys.DOWN) {
                container.scrollTop(container.scrollTop() + itemHeight);
                e.preventDefault();
            } else if (key === keys.ENTER) {
                that._setClickHandler(e);
            } else if (key === keys.ESC) {
                that._cancelClickHandler(e);
            }
        },

        _mouseOverHandler: function(e) {
            this._focusList($(e.currentTarget));
        },

        _focusList: function(list) {
            this._listContainer.find(".k-time-list-wrapper").removeClass(FOCUSED);
            list.addClass(FOCUSED);
            this._listContainer.trigger("focus");
            this._scrollTop = list.find('.k-scrollable').scrollTop();
        },

        _setClickHandler: function(e) {
            if ($(kendo._activeElement()).attr(kendo.attr("value"))) {
                return;
            }

            e.preventDefault();
            this._value = convertToMsec(this._currentValues);
            this.options.change(this._value);
            this.popup.close();
            this.options.focus();
        },

        _cancelClickHandler: function(e) {
            if ($(kendo._activeElement()).attr(kendo.attr("value"))) {
                return;
            }
            e.preventDefault();
            this.popup.close();
            this.options.focus();
        },

        _itemClickHandler: function(e) {
            var list = $(e.originalEvent.currentTarget);
            var index = list.find(".k-item:visible").index($(e.currentTarget));
            var itemHeight = getItemHeight(list.find(".k-item:visible").eq(0));

            list.scrollTop(index * itemHeight);
        },

        _listScrollHandler: function(e) {
            var that = this;
            var itemHeight = getItemHeight($(e.currentTarget).find(".k-item:visible").eq(0));

            if (that._internalScroll) {
                return;
            }

            if (that._scrollingTimeout) {
                clearTimeout(that._scrollingTimeout);
            }

            that._scrollingTimeout = setTimeout(function() {
                if (e.currentTarget.scrollTop % itemHeight > 1) {
                    e.currentTarget.scrollTop += itemHeight - e.currentTarget.scrollTop % itemHeight;
                }
                that._scrollTop = e.currentTarget.scrollTop;
                that._updateCurrentlySelected();
            }, 100);
        },

        _findSelectedValue: function(list) {
            var firstOccurence = firstItemIndex(list.scrollTop(), getItemHeight(list.find(".k-item:visible").eq(0)));
            return list.find(".k-item:visible").eq(firstOccurence).attr("data-value");
         },

        _updateCurrentlySelected: function() {
            var that = this;
            var lists = this._listsContainer.find('.k-content.k-scrollable');

            if (!this._listsContainer.is(":visible")) {
                return;
            }

            that._currentValues = {};

            lists.each(function() {
                var list = $(this);
                that._currentValues[list.attr("data-name")] = parseInt(that._findSelectedValue(list));
            });
        },

        _scrollListToPosition: function(list, value) {
            var item = list.find('.k-item[data-value="' + value + '"]');
            var itemHeight = getItemHeight(item);

            list.scrollTop(list.find(".k-item:visible").index(item) * itemHeight);
        },

        _renderList: function(wrapper, options) {
            if (!options) {
                return;
            }
            var that = this;
            var list = $(listTemplate({ name: options.name, title: that.options.messages[options.name] }));
            var elements = "";

            for (var i = options.min; i <= options.max; i += options.step) {
                elements += listItemTemplate({ value: kendo.format(options.selectorFormat, i) });
            }
            list.find("ul").html(elements);
            list.appendTo(wrapper);
        },

        _columns: function() {
            var that = this;
            var column;
            var options = that.options;

            if (that._listsContainer) {
                for (var i = 0; i < options.columns.length; i++) {
                    column = options.columns[i];
                    that._renderList(that._listsContainer, column);
                }
            }
        },

        _shortCuts: function() {
            var that = this;
            var options = that.options;
            var shortcut;

            if (that._shortcuts) {
                for (var i = 0; i < options.shortcuts.length; i++) {
                    shortcut = options.shortcuts[i];

                    $(html.renderButton(`<button class="k-button ${kendo.getValidCssClass("k-button-", "size", that.options.size || "medium")} k-button-solid k-button-solid-base k-rounded-md">` + shortcut.text + '</button>', {
                        rounded: options.rounded
                    }))
                    .attr(kendo.attr("value"), shortcut.value)
                    .appendTo(that._shortcuts);
                }
            }
        },

        _buttons: function() {
            var that = this;
            var options = that.options;

            $("<div class='k-actions k-actions-stretched k-actions-horizontal k-timeduration-footer'>"
                +
                html.renderButton('<button class="k-time-cancel k-button">' + encode(options.messages.cancel) + '</button>', {
                 rounded: options.rounded,
                 size: options.size
                })
                +
                html.renderButton('<button class="k-time-accept k-button k-button-solid k-button-solid-primary">' + encode(options.messages.set) + '</button>', {
                 rounded: options.rounded,
                 size: options.size
                })
                +
            "</div>").appendTo(that._timeSelectorWrapper);
        },

        _wrappers: function() {
            var that = this;
            var options = that.options;

            that._timeSelectorWrapper = $("<div></div>");

            that._listContainer = $(`<div tabindex='0' class='k-timeselector ${kendo.getValidCssClass("k-timeselector-", "size", that.options.size || "medium")}'></div>`);
            that._listContainer.appendTo(that._timeSelectorWrapper);

            if (options.shortcuts) {
                that._shortcuts = $("<div class='k-actions k-actions-start k-actions-horizontal k-time-fast-selection'></div>").appendTo(that._listContainer);
            }

            if (options.columns.length) {
                that._listsContainer = $("<div class='k-time-list-container'><span class='k-time-highlight'></span></div>").appendTo(that._listContainer);
                that._listsContainer.attr("id", options.id);
            }
        },

        _popup: function() {
            var that = this,
                options = that.options;

            if (options.adaptiveMode == "auto" && !that.bigScreenMQL.mediaQueryList.matches) {
                that._timeSelectorWrapper.appendTo(document.body);
                that.popup = new ui.ActionSheet(that._timeSelectorWrapper, {
                    adaptive: true,
                    title: "Set time",
                    subtitle: "00/00/00",
                    closeButton: true,
                    fullscreen: that.smallScreenMQL.mediaQueryList.matches,
                    popup: extend(true, {}, options.popup, {
                        anchor: options.anchor,
                        open: options.open,
                        close: options.close,
                        isRtl: kendo.support.isRtl(options.anchor)
                    }),
                    activate: function() {
                        that.addTranslate();
                        if (that._value) {
                            that.applyValue(that._value);
                        } else {
                            that._updateCurrentlySelected();
                        }
                        that._focusList(that._listContainer.find(".k-time-list-wrapper").eq(0));
                    }
                });

                that._timeSelectorWrapper.find(".k-timeduration-footer").appendTo(that.popup.element);
            } else {
                that.popup = new ui.Popup(that._timeSelectorWrapper, extend(true, {}, options.popup, {
                    anchor: options.anchor,
                    open: options.open,
                    close: options.close,
                    isRtl: kendo.support.isRtl(options.anchor),
                    activate: function() {
                        that.addTranslate();
                        if (that._value) {
                            that.applyValue(that._value);
                        } else {
                            that._updateCurrentlySelected();
                        }
                        that._focusList(that._listContainer.find(".k-time-list-wrapper").eq(0));
                    }
                }));
            }
        }
    });

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

    function firstItemIndex(scrollTop, itemHeight) {
        return Math.max(Math.round(scrollTop / itemHeight), 0);
    }

    function getItemHeight(item) {
        return item.length && item[0].getBoundingClientRect().height;
    }

    ui.plugin(TimeSelector);

})(window.kendo.jQuery);
export default kendo;

