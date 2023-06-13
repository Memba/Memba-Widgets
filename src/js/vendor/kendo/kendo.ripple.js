/**
 * Kendo UI v2023.1.425 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./util/ripple.js";

var __meta__ = {
    id: "ripplecontainer",
    name: "RippleContainer",
    category: "web",
    depends: [ "core" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        extend = $.extend,
        ripple = kendo.util.ripple;

    var RippleContainer = Widget.extend({
        init: function(element, options) {
            var that = this;

            Widget.fn.init.call(that, element);

            element = that.wrapper = that.element;

            that.options = extend({}, that.options, options);

            that.registerListeners();
        },

        options: {
            name: "RippleContainer",
            elements: [
                { selector: ".k-button:not(li)" },
                { selector: ".k-list > .k-item", options: { global: true } },
                { selector: ".k-checkbox-label, .k-radio-label" },
                {
                    selector: ".k-checkbox, .k-radio",
                    options: {
                        events: ["focusin"],
                        container: function(el) {
                            if (/\b(k-checkbox|k-radio)\b/.test(el.className)) {
                                return el.nextElementSibling;
                            }
                        }
                    }
                }
            ]
        },

        removeListeners: function() {},

        registerListeners: function() {
            var that = this;
            var root = that.element[0];
            var elements = that.options.elements;

            that.removeListeners();

            var callback = ripple.register(root, elements);

            that.removeListeners = callback;
        },

        destroy: function() {
            var that = this;

            Widget.fn.destroy.call(that);

            that.removeListeners();
        }
    });

    ui.plugin(RippleContainer);

})(window.kendo.jQuery);

