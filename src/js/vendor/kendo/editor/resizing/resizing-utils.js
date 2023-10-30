/**
 * Kendo UI v2023.3.1010 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../main.js";

(function(kendo, undefined) {
    var global = window;
    var math = global.Math;
    var min = math.min;
    var max = math.max;
    var parseFloat = global.parseFloat;

    var $ = kendo.jQuery;
    var extend = $.extend;

    var Editor = kendo.ui.editor;

    var PERCENTAGE = "%";
    var PIXEL = "px";
    var REGEX_NUMBER_IN_PERCENTAGES = /(\d+)(\.?)(\d*)%/;
    var REGEX_NUMBER_IN_PIXELS = /(\d+)(\.?)(\d*)px/;
    var STRING = "string";

    function constrain(options) {
        var value = options.value;
        var lowerBound = options.min;
        var upperBound = options.max;

        return max(min(parseFloat(value), parseFloat(upperBound)), parseFloat(lowerBound));
    }

    function getScrollBarWidth(element) {
        if (element && !$(element).is("body") && element.scrollHeight > element.clientHeight) {
            return kendo.support.scrollbar();
        }

        return 0;
    }

    function calculatePercentageRatio(value, total) {
        if (inPercentages(value)) {
            return parseFloat(value);
        }
        else {
            return ((parseFloat(value) / total) * 100);
        }
    }

    function inPercentages(value) {
        return (typeof(value) === STRING && REGEX_NUMBER_IN_PERCENTAGES.test(value));
    }

    function inPixels(value) {
        return (typeof(value) === STRING && REGEX_NUMBER_IN_PIXELS.test(value));
    }

    function toPercentages(value) {
        return (parseFloat(value) + PERCENTAGE);
    }

    function toPixels(value) {
        return (parseFloat(value) + PIXEL);
    }

    var ResizingUtils = {
        constrain: constrain,
        getScrollBarWidth: getScrollBarWidth,
        calculatePercentageRatio: calculatePercentageRatio,
        inPercentages: inPercentages,
        inPixels: inPixels,
        toPercentages: toPercentages,
        toPixels: toPixels
    };

    extend(Editor, {
        ResizingUtils: ResizingUtils
    });
})(window.kendo);
