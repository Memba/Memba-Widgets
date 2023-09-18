/**
 * Kendo UI v2023.2.829 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.core.js";
import "./kendo.html.chip.js";

var __meta__ = {
    id: "chip",
    name: "Chip",
    category: "web", // suite
    docsCategory: "navigation",
    description: "Displays a Chip that represents an input, attribute or an action",
    depends: ["core", "html.chip"] // dependencies
};

(function($, undefined) {
    var kendo = window.kendo;
    var Widget = kendo.ui.Widget;
    var html = kendo.html;
    var ui = kendo.ui,
        keys = kendo.keys,
        SELECT = "select",
        CLICK = "click",
        REMOVE = "remove";

    var NS = ".kendoChip",
        DOT = ".";


    var chipStyles = {
        widget: "k-chip",
        iconElement: "k-chip-icon",
        removeIconElement: "k-chip-remove-action",
        selected: "k-selected",
        disabled: "k-disabled",
        focus: "k-focus",
        avatarClass: "k-chip-avatar"
    };

    var Chip = Widget.extend({
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element, options);
            html.renderChip(element, $.extend({},that.options));

            that.wrapper = that.element.closest(".k-chip");
            that._enabled = that.options.enabled = options.enabled !== undefined ? options.enabled : !(Boolean(that.element.is("[disabled]")));
            that._selected = that.options.selected;
            that._selectable = that.options.selectable;

            that._setTabIndex();

            that._applyAriaAttributes();
            that._bindEvents();
            kendo.notify(that);
        },

        options: {
            name: 'Chip',
            enabled: true,
            selectable: false,
            selected: false,
            removable: false,
            icon: '',
            iconClass: '',
            avatarClass: '',
            label: '',
            removeIcon: 'x-circle',
            removeIconClass: '',
            fillMode: 'solid',
            rounded: 'medium',
            size: 'medium',
            themeColor: 'base'
        },

        events: [
            SELECT,
            CLICK,
            REMOVE
        ],

        destroy: function() {
            var that = this;

            that.wrapper.off(NS);
            Widget.fn.destroy.call(that);
        },

        setOptions: function(options) {
            var that = this;

            that.wrapper.off(NS);
            that.element.insertBefore(that.wrapper);
            that.wrapper.remove();

            Widget.fn.setOptions.call(that, options);

            that.element.empty();
            html.renderChip(that.element, that.options);

            that.wrapper = that.element.closest(".k-chip");

            that._setTabIndex();
            that._applyAriaAttributes();
            that._bindEvents();
        },

        enable: function(state) {
            var that = this;
            if (state === undefined) {
                return that._enabled;
            }

            that._enabled = state !== false;
            that.wrapper.toggleClass(chipStyles.disabled, !that._enabled);
            that.wrapper.attr("aria-disabled", !that._enabled);
        },

        select: function(state) {
            var that = this;

            if (state == undefined) {
                return that._selected;
            }

            state = state !== false;

            if (that._selectable) {
                that._selected = state;
                that.wrapper.toggleClass(chipStyles.selected, state);
            }

            that._applyAriaAttributes();
        },

        focus: function() {
            if (this._enabled) {
                this.wrapper.focus();
            }
        },

        _bindEvents: function() {
            var that = this,
                clickProxy = that._click.bind(that),
                removeProxy = that._remove.bind(that),
                keydownProxy = that._keydown.bind(that);

            that.wrapper.on(CLICK + " touchend" + NS, clickProxy)
                .on(CLICK + " touchend" + NS, DOT + chipStyles.removeIconElement, removeProxy)
                .on("keydown" + NS, keydownProxy);
        },

        _click: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var that = this;

            if (!that.enable()) {
                ev.preventDefault();
                return;
            }

            if (that.trigger(CLICK, { originalEvent: ev })) {
                return;
            }

            that._triggerSelect(that, ev);
        },

        _remove: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();

            var that = this;

            if (!that.enable()) {
                ev.preventDefault();
                return;
            }

            that.trigger(REMOVE, { originalEvent: ev });
        },

        _triggerSelect: function(item, ev) {
            var that = this;

            if (!that._selectable || !that._enabled || that.trigger(SELECT, { originalEvent: ev })) {
                return;
            }

            that._toggleSelect();
        },

        _toggleSelect: function() {
            var that = this;
            that.select(!that.select());
        },

        _keydown: function(ev) {
            var that = this,
                target = $(ev.target),
                key = ev.keyCode;

            if (key === keys.ENTER || key === keys.SPACEBAR) {
                if (!that.enable()) {
                    ev.preventDefault();
                    return;
                }

                if (that.trigger(CLICK, { originalEvent: ev })) {
                    return;
                }

                that._triggerSelect(target, ev);

                if (key === keys.SPACEBAR) {
                    ev.preventDefault();
                }
            } else if (key === keys.DELETE || key === keys.BACKSPACE) {
                if (that.options.removable) {
                    that.trigger(REMOVE, { originalEvent: ev });
                }
            }
        },

        _setTabIndex: function() {
            var that = this;
            var tabindex = that.enable() ? that.options.tabindex || "0" : "-1";
            if (that.options.attributes && that.options.attributes.class) {
                that.options.attributes.class = `${that.wrapper.attr("class") || ''} ${that.options.attributes.class}`;
            }

            that.wrapper.attr($.extend({}, that.options.attributes, {
                    tabindex: tabindex,
                    // skip rendering of this attribute
                    ariaSelectedAttributeName: null
                }));
        },

        _applyAriaAttributes: function() {
            var that = this;
            var role = (that.options.attributes || {}).role || "button";

            that.wrapper.attr("role", role);
            if (that._selectable && role == "button") {
                that.wrapper.attr("aria-pressed", that._selected);
            }
            that.wrapper.attr("aria-disabled", that.enable() === false);
        }
    });

    ui.plugin(Chip);

})(window.kendo.jQuery);
export default kendo;