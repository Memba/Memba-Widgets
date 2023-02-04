/**
 * Kendo UI v2023.1.117 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.core.js";
import "./kendo.chip.js";
import "./kendo.html.chiplist.js";

var __meta__ = {
    id: "chiplist",
    name: "ChipList",
    category: "web",
    docsCategory: "navigation",
    description: "The ChipList component.",
    depends: ["core", "chip", "html.chiplist"]
};
(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        keys = kendo.keys,
        isPlainObject = $.isPlainObject,
        isEmptyObject = $.isEmptyObject,

        NS = ".kendoChipList",
        PREFIX = "k-chip-list-",
        DOT = ".",

        SELECT = "select",
        REMOVE = "remove";
    var html = kendo.html;

    var chipListStyles = {
        widget: "k-chip-list",
        item: "k-chip",
        selected: "k-selected",
        disabled: "k-disabled",
        enabledItemSelector: "k-chip:not(.k-disabled)"
    };

    var ChipList = Widget.extend({
        init: function(element, options) {
            var that = this;
            options = options || {};
            Widget.fn.init.call(that, element, options);

            html.renderChipList(element, $.extend({}, options));

            that._selectable = that.options.selectable;
            that._applyAriaAttributes();
            that._bindEvents();
            that._items();
        },

        options: {
            name: "ChipList",
            selectable: "none",
            items: [],
            fillMode: "solid",
            rounded: "medium",
            size: "medium",
            itemSize: "medium"
        },

        events: [
            SELECT,
            REMOVE
        ],

        destroy: function() {
            var that = this;

            if (that._keydownProxy) {
                that.unbind(that._keydownProxy);
                that._keydownProxy = null;
            }

            if (that._selectProxy) {
                that.unbind(that._selectProxy);
                that._selectProxy = null;
            }

            if (that._removeProxy) {
                that.unbind(that._removeProxy);
                that._removeProxy = null;
            }

            that.element.off(NS);
            that.element.find("[data-role='chip']").each(function() {
                that._getChipFromElement(this).destroy();
            });

            Widget.fn.destroy.call(this);
        },

        _applyAriaAttributes: function() {
            var that = this;
            if (that._selectable !== "none") {
                that.element.attr({
                    "aria-multiselectable": that._selectable === "multiple",
                    role: "listbox",
                    "aria-label": that.element.attr("id") + " listbox",
                    "aria-orientation": "horizontal"
                });
            }
        },

        _updateCssClasses: function() {
            var that = this,
                options = that.options,
                styles = chipListStyles;

            // Remove all class names
            that.element.removeClass(function(index, className) {
                if (className.indexOf('k-') === 0) {
                    that.element.removeClass(className);
                }
            });

            that.element.addClass(styles.widget);
            that.element.addClass(kendo.getValidCssClass(PREFIX, "size", options.size));
        },

        _getInitializeChipOptions: function(itemOptions) {
            var that = this,
                options = that.options;

            var attributes = $.extend(itemOptions.attributes || {}, {
                tabindex: "-1"
            });

            if (options.selectable !== "none") {
                attributes.role = "option";
                attributes["aria-selected"] = itemOptions.selected;
            }

            if (itemOptions.removable) {
                attributes["aria-keyshortcuts"] = "Enter Delete";
            }

            return $.extend({
                fillMode: options.fillMode,
                size: options.itemSize,
                rounded: options.rounded,
                selectable: options.selectable !== "none",
                removable: options.removable,
                remove: that._removeProxy,
                select: that._selectProxy,
            }, itemOptions, { attributes: attributes });
        },

        _getChipFromElement: function(element) {
            return $(element).getKendoChip() || $(element).find("[data-role='chip']").getKendoChip();
        },

        _items: function() {
            var that = this,
                options = that.options,
                items = options.items,
                chipOptions,
                selectedItems,
                chipEl,
                firstNavigatableItem,
                item;

            for (var i = 0; i < items.length; i++) {
                chipOptions = that._getInitializeChipOptions(items[i]);
                chipEl = $("<span></span>");
                that.element.append(chipEl);
                item = that._createChip(chipEl, chipOptions);
            }

            firstNavigatableItem = that._getFirstNavigatableItem();
            if (firstNavigatableItem) {
                that._applyTabIndex(that.items().index(firstNavigatableItem));
            }

            if (that._selectable === "single") {
                selectedItems = that.items().filter(DOT + chipListStyles.selected);
                selectedItems.each(function(ind, ch) {
                    if (ind !== selectedItems.length - 1) {
                        var chip = that._getChipFromElement(ch);
                        if (chip) {
                            chip.select(false);
                        }
                    }
                });
            }
        },

        _isItem: function(item) {
            var that = this;

            item = $(item);

            return item.is(DOT + chipListStyles.item) && !!that.element.find(item).length;
        },

        _applyTabIndex: function(index) {
            var that = this;
            var itemElement = that.item(+index ? +index : 0);

            that.items().each(function(ind, el) {
                $(el).attr("tabindex", "-1");
            });

            itemElement.attr("tabindex", "0");
        },

        _createChip: function(element, chipOptions) {
            return element.kendoChip(chipOptions);
        },

        _bindEvents: function() {
            var that = this;
            that._keydownProxy = that._keydown.bind(that);
            that._selectProxy = that._select.bind(that);
            that._removeProxy = that._remove.bind(that);

            that.element.on("keydown" + NS, DOT + chipListStyles.item, that._keydownProxy);
        },

        _select: function(ev) {
            var that = this,
                chip = ev.sender;

            if (that._selectable == "none") {
                ev.preventDefault();
                return;
            }

            that._triggerSelect(chip, ev);
        },

        _triggerSelect: function(item, ev) {
            var that = this,
                selectedItems;

            if (that.element.is(DOT + chipListStyles.disabled)) {
                return;
            }

            if (that.trigger(SELECT, { originalEvent: ev, item: item })) {
                return;
            }

            if (that._selectable === "single") {
                selectedItems = that.select();
                if (selectedItems.length > 0) {
                    selectedItems.each(function(ind, selectedChipElement) {
                        var chip = that._getChipFromElement(selectedChipElement);
                        if (chip && chip !== item) {
                            chip.select(false);
                        }
                    });
                }
            }
        },

        _remove: function(ev) {
            var that = this,
                chip = ev.sender;

            if (that.trigger(REMOVE, { originalEvent: ev, item: ev.sender })) {
                return;
            }

            that._removeItem(chip);
        },

        _removeItem: function(chip) {
            var that = this;
            if (chip) {
                var el = chip.wrapper;
                chip.destroy();
                el.remove();
                that._focusNavigatableItem();
            }
        },

        _keydown: function(ev) {
            // change the tabindex to the next/prev chip
            // and remove it from the others
            var that = this,
                target = $(ev.target).closest(DOT + chipListStyles.item),
                key = ev.keyCode;

            if (key === keys.LEFT || key === keys.RIGHT) {
                that._focusNavigatableItem(key, target);
            }
            // add support for Home and End keys?
        },

        _focusNavigatableItem: function(key, target) {
            var that = this;
            var nextCandidate = that._getNavigatableItem(key, target);
            if (nextCandidate) {
                that._applyTabIndex(that.items().index(nextCandidate));
                nextCandidate.focus();
            }
        },

        _getFirstNavigatableItem: function() {
            var that = this;
            return that.items().filter(DOT + chipListStyles.enabledItemSelector).first();
        },

        _getLastNavigatableItem: function() {
            var that = this;
            return that.items().filter(DOT + chipListStyles.enabledItemSelector).last();
        },

        _getNavigatableItem: function(key, target) {
            var that = this;
            var current;

            if (target) {
                current = target;
            } else {
                current = that._getFirstNavigatableItem();
            }

            if (key === keys.LEFT && target) {
                current = target.prevAll(DOT + chipListStyles.enabledItemSelector).first();
            }

            if (key === keys.RIGHT && target) {
                current = target.nextAll(DOT + chipListStyles.enabledItemSelector).first();
            }

            return current.length ? current : null;
        },

        items: function() {
            var that = this;
            return that.element.children();
        },

        select: function(item, state) {
            var that = this,
                chip,
                selectedItems = that.items().filter(DOT + chipListStyles.selected);

            if (!item) {
                return selectedItems;
            }

            state = state !== false;

            chip = that._getChipFromElement(item);
            if (chip) {
                if (that._selectable === "single") {
                    selectedItems = that.select();
                    if (selectedItems.length > 0) {
                        selectedItems.each(function(ind, selectedChipElement) {
                            var chip = that._getChipFromElement(selectedChipElement);
                            if (chip && chip !== item) {
                                chip.select(false);
                            }
                        });
                    }
                }

                chip.select(state);
            }
        },

        enable: function(item, state) {
            var chip = this._getChipFromElement(item);
            state = state !== false;

            if (chip) {
                chip.enable(state);
            }
        },

        item: function(index) {
            var that = this;

            if (isNaN(index)) {
                return null;
            }

            return that.items().eq(index);
        },

        itemById: function(id) {
            var that = this;

            return that.element.find("#" + id);
        },

        add: function(item, before) {
            // add validation to get element, options object and a Chip widget
            var that = this,
                method = "append",
                chip,
                chipEl,
                targetElement = that.element;

            if (before && that._isItem(before)) {
                method = "before";
                targetElement = $(before);
            }

            chip = that._getChipFromElement(item);
            if (chip) {
                targetElement[method](chip.wrapper);
            } else if (item && isPlainObject(item) && !isEmptyObject(item)) {
                chipEl = $("<span></span>");
                targetElement[method](chipEl);
                that._createChip(chipEl, that._getInitializeChipOptions(item));
            }
        },

        remove: function(item) {
            var that = this;

            if (item && that._isItem(item)) {
                kendo.destroy(item);
                item.remove();
                that._focusNavigatableItem();
            }
        },

        setOptions: function(options) {
            var that = this;

            Widget.fn.setOptions.call(this, options);
            that._updateCssClasses();

            if (options.items) {
                that.element.empty();
                that._items();
            }
        }
    });

    ui.plugin(ChipList);
})(window.kendo.jQuery);