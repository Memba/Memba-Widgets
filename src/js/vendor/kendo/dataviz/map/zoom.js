/**
 * Kendo UI v2023.1.425 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../../kendo.core.js";
import "../../kendo.icons.js";

(function($) {
    var kendo = window.kendo;
    var Widget = kendo.ui.Widget;
    var keys = kendo.keys;

    // Helper functions =======================================================
    function button(dir, icon) {
       return `<button class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-icon-button k-zoom-${dir}" title="zoom-${dir}" aria-label="zoom-${dir}">${kendo.ui.icon({ icon: icon, iconClass: "k-button-icon" })}</button>`;
    }

    var NS = ".kendoZoomControl";
    var BUTTONS = button("in", "plus") + button("out", "minus");

    var PLUS = 187;
    var MINUS = 189;
    var FF_PLUS = 61;
    var FF_MINUS = 173;


    var ZoomControl = Widget.extend({
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);
            this._initOptions(options);

            this.element.addClass("k-widget k-zoom-control k-button-group k-group-horizontal")
                        .append(BUTTONS)
                        .on("click" + NS, ".k-button", this._click.bind(this));

            var parentElement = this.element.parent().closest("[" + kendo.attr("role") + "]");
            this._keyroot = parentElement.length > 0 ? parentElement : this.element;

            this._tabindex(this._keyroot);

            this._keydown = this._keydown.bind(this);
            this._keyroot.on("keydown", this._keydown);
        },

        options: {
            name: "ZoomControl",
            zoomStep: 1
        },

        events: [
            "change"
        ],

        _change: function(dir) {
            var zoomStep = this.options.zoomStep;
            this.trigger("change", {
                delta: dir * zoomStep
            });
        },

        _click: function(e) {
            var button = $(e.currentTarget);
            var dir = 1;

            if (button.is(".k-zoom-out")) {
                dir = -1;
            }

            this._change(dir);
            e.preventDefault();
        },

        _keydown: function(e) {
            switch (e.which) {
                case keys.NUMPAD_PLUS:
                case PLUS:
                case FF_PLUS:
                    this._change(1);
                    break;

                case keys.NUMPAD_MINUS:
                case MINUS:
                case FF_MINUS:
                    this._change(-1);
                    break;
            }
        }
    });


    // Exports ================================================================
    kendo.dataviz.ui.plugin(ZoomControl);

})(window.kendo.jQuery);
