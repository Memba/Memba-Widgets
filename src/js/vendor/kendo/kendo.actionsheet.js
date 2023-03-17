/**
 * Kendo UI v2023.1.314 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.core.js";
import "./kendo.popup.js";
import "./kendo.icons.js";

var __meta__ = {
    id: "ActionSheet",
    name: "ActionSheet",
    category: "web", // suite
    description: "The ActionSheet widget displays a set of choices related to a task the user initiates.",
    depends: ["core", "popup"] // dependencies
};

(function($, undefined) {
    var kendo = window.kendo;
    var encode = kendo.htmlEncode;
    var Widget = kendo.ui.Widget;
    var ui = kendo.ui;
    var ns = ".kendoActionSheet";
    var Popup = ui.Popup;
    var TabKeyTrap = Popup.TabKeyTrap;
    var DOCUMENT_ELEMENT = $(document.documentElement);
    var MOUSEDOWN = "down";
    var OPEN = "open";
    var CLOSE = "close";
    var ACTIVATE = "activate";
    var ACTION_SHEET_CONTAINER = "k-actionsheet-container";
    var OVERLAY = "k-overlay";
    var ACTION_SHEET = "k-actionsheet k-actionsheet-jq";
    var ACTION_SHEET_BOTTOM = "k-actionsheet-bottom";
    var STATEDISABLED = "k-disabled";
    var HIDDEN = "k-hidden";
    var HEADER_ID = "actionsheet-header";
    var extend = $.extend;
    var template = kendo.template;
    var CLICK = "click";
    var KEYDOWN = "keydown";
    var hexColor = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
    var HEADER_TEMPLATE = ({ title }) => `<span id="${HEADER_ID}" class="k-actionsheet-header">${title}</span>`;
    var ITEM_TEMPLATE = ({ disabled, icon, text, description }) => `<span role="button" tabindex="0" class="k-actionsheet-item ${disabled ? STATEDISABLED : ""}"><span class="k-actionsheet-action">${icon ? icon : ""}<span class="k-actionsheet-item-text"><span class="k-actionsheet-item-title">${encode(text)}</span>${description ? '<span class="k-actionsheet-item-description">' + encode(description) + '</span>' : ''}</span></span></span>`;
    var SEPARATOR = '<hr class="k-hr" />';
    var defaultItem = {
        text: "",
        description: "",
        iconClass: "",
        iconSize: 0,
        iconColor: "",
        click: $.noop,
        group: "top",
        disabled: false
    };

    function contains(container, target) {
        if (!container || !target) {
            return false;
        }
        return container === target || $.contains(container, target);
    }

    function createIcon(data) {
        var result;
        var inlineStyles = {};

        if (!data.iconClass && !data.icon) {
            return '';
        }

        result = $(kendo.html.renderIcon({ icon: data.icon, iconClass: data.iconClass + " k-actionsheet-item-icon" }));

        if (data.iconColor && hexColor.test(data.iconColor)) {
            inlineStyles.color = data.iconColor;
        } else if (data.iconColor) {
            result.addClass("k-text-" + data.iconColor);
        }

        if (data.iconSize) {
            inlineStyles.fontSize = data.iconSize;
        }

        if (Object.keys(inlineStyles).length) {
            result.css(inlineStyles);
        }

        return result;
    }

    var ActionSheet = Widget.extend({
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);

            that._hasItems = options.items && options.items.length;
            that._mapItems();
            that._wrapper();
            that._popup();
            that._header();
            that._items();
            that._footer();

            that._tabKeyTrap = new TabKeyTrap(that.wrapper);

            that.downEvent = kendo.applyEventMap(MOUSEDOWN, kendo.guid());
            that._mousedownProxy = that._mousedown.bind(that);
            that.wrapper.on(KEYDOWN + ns, that, that._keydown.bind(that));
        },

        events: [
            OPEN,
            CLOSE
        ],

        options: {
            name: "ActionSheet",
            title: "",
            items: [],
            popup: null
        },

        _mapItems: function() {
            var that = this;

            if (!that._hasItems) {
                return;
            }

            that.options.items = that.options.items.map(defaultItemsMapper);
        },

        _wrapper: function() {
            var that = this;
            var element = that.element;
            var wrapper;

            element.addClass(ACTION_SHEET + " " + ACTION_SHEET_BOTTOM + " k-popup");
            that.wrapper = wrapper = element.wrap("<div class='" + ACTION_SHEET_CONTAINER + " " + HIDDEN + "'></div>").parent();
            wrapper.prepend($('<div></div>').addClass(OVERLAY));

            element.attr({
                role: "dialog",
                "aria-modal": true,
                "aria-labelledby": HEADER_ID
            });
        },

        _popup: function() {
            var that = this;
            var options = that.options;

            that.popup = new Popup(that.element, extend(options.popup,
                options,
                {
                    name: "Popup",
                    isRtl: kendo.support.isRtl(options.anchor),
                    omitOriginOffsets: true,
                    appendTo: that.wrapper,
                    modal: true,
                    animation: false,
                    anchor: that.wrapper
                }));

            that.popup.bind(ACTIVATE, that._openHandler.bind(that));
        },

        _header: function() {
            var that = this;
            var options = that.options;

            if (!options.title) {
                return;
            }

            that.element.append(template(HEADER_TEMPLATE)(options));
        },

        _items: function() {
            var that = this;

            if (!that._hasItems) {
                return;
            }

            that._createItems(topGroupFilter);
        },

        _createItems: function(itemsFilter) {
            var that = this;
            var items = that.options.items.filter(itemsFilter);
            var idx;
            var item;
            var itemTemplate;
            var itemElement;
            var container = $("<div class='k-actionsheet-items' role='group'></div>");
            var icon;

            if (!items.length) {
                return;
            }

            that.element.append(container);
            itemTemplate = template(ITEM_TEMPLATE);

            for (idx = 0; idx < items.length; idx++) {
                item = items[idx];
                icon = createIcon(item);
                itemElement = $(itemTemplate(extend({}, item, { icon: icon && icon.prop('outerHTML') })));
                container.append(itemElement);

                if (item.click) {
                    itemElement.on(CLICK + ns, item.click.bind(that));
                }
            }
        },

        _footer: function() {
            var that = this;

            if (!that._hasItems) {
                return;
            }
            that.element.append(SEPARATOR);
            that._createItems(bottomGroupFilter);
        },

        destroy: function() {
            var that = this;

            Widget.fn.destroy.call(that);
            that.element.off(ns);
            that.wrapper.off(ns);
            that.popup.destroy();
        },

        open: function() {
            var that = this;

            that.wrapper.removeClass(HIDDEN);
            that._elementHeight = that._elementHeight || that.element.outerHeight();
            that.popup.open((that.wrapper.outerWidth() - that.element.outerWidth()) / 2, that.wrapper.outerHeight() - that._elementHeight);
            DOCUMENT_ELEMENT.off(that.downEvent, that._mousedownProxy)
                .on(that.downEvent, that._mousedownProxy);

            that._tabKeyTrap.trap();
        },

        close: function() {
            var that = this;

            that.popup.close();
            that.wrapper.addClass(HIDDEN);
            DOCUMENT_ELEMENT.off(that.downEvent, that._mousedownProxy);
        },

        _keydown: function(e) {
            var that = this;
            var keys = kendo.keys;
            var keyCode = e.keyCode;
            var target = $(e.target);

            if (keyCode == keys.ESC) {
                e.stopPropagation();
                that.close();
            } else if (target.hasClass("k-actionsheet-item ") && keyCode === keys.ENTER) {
                target.trigger(CLICK);
            }
        },

        _openHandler: function() {
            var that = this;

            that.element.find('.k-actionsheet-item').eq(0).trigger("focus");
        },

        _mousedown: function(e) {
            var that = this;
            var container = that.element[0];
            var target = kendo.eventTarget(e);

            if (!contains(container, target)) {
                that.close();
            }
        }
    });

    function topGroupFilter(item) {
        return item.group === "top";
    }

    function bottomGroupFilter(item) {
        return item.group !== "top";
    }

    function defaultItemsMapper(item) {
        return extend({}, defaultItem, item);
    }

    ui.plugin(ActionSheet);

})(window.kendo.jQuery);

