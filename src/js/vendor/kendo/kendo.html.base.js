/**
 * Kendo UI v2023.1.314 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo.core.js";

var __meta__ = {
    id: "html.base",
    name: "Html.Base",
    category: "web",
    description: "",
    depends: ["core"],
    features: []
};

(function($, undefined) {
    var kendo = window.kendo,
        Class = kendo.Class;

    kendo.html = kendo.html || {};

    var HTMLBase = Class.extend({
        init: function(element, options) {
            var that = this;
            that.element = $(element);
            options = options || {};
            delete options.name;
            that._initOptions(options);
        },
        options: {
            stylingOptions: []
        },
        _addClasses: function() {
            var that = this,
                options = that.options,
                stylingOptions = options.stylingOptions,
                previouslyAddedClasses = that.wrapper.data("added-classes");

            stylingOptions = stylingOptions.map(function(option) {
                var validFill;

                if (option === "themeColor") {
                    validFill = kendo.cssProperties.getValidClass({
                        widget: options.name,
                        propName: "fillMode",
                        value: options.fillMode
                    });

                    if (!validFill || validFill.length === 0) {
                        return "";
                    }
                }

                return kendo.cssProperties.getValidClass({
                    widget: options.name,
                    propName: option,
                    value: options[option],
                    fill: options.fillMode
                });
            });

            if (previouslyAddedClasses) {
                that.wrapper.removeClass(previouslyAddedClasses.join(" "));
            }

            that.wrapper.data("added-classes", stylingOptions);
            that.wrapper.addClass(stylingOptions.join(" "));
        },
        html: function() {
            var that = this;

            return that.wrapper[0].outerHTML;
        }
    });

    $.extend(kendo.html, {
        HTMLBase: HTMLBase
    });

})(window.kendo.jQuery);

