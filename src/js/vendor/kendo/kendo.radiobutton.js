/**
 * Kendo UI v2022.3.1109 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.toggleinputbase.js";
import "./kendo.html.input.js";

var __meta__ = {
    id: "radiobutton",
    name: "RadioButton",
    category: "web",
    description: "The RadioButton widget is used to display an input of type radio.",
    depends: [ "toggleinputbase", "html.input" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        ToggleInputBase = ui.ToggleInputBase;

    var RadioButton = ToggleInputBase.extend({
        init: function(element, options) {
            ToggleInputBase.fn.init.call(this, element, options);

            if (options && options.value && options.value.length) {
                this.element.attr("value", options.value);
            }
        },

        options: {
            name: "RadioButton",
            checked: null,
            value: "",
            enabled: true,
            encoded: true,
            label: null,
            size: "medium"
        },

        RENDER_INPUT: kendo.html.renderRadioButton,
        NS: ".kendoRadioButton"
    });

    kendo.cssProperties.registerPrefix("RadioButton", "k-radio-");

    ui.plugin(RadioButton);
})(window.kendo.jQuery);

