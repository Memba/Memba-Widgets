/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "./kendo-drawing.js";

(function($) {

    var kendo = window.kendo;
    var drawing = kendo.drawing;
    var drawDOM = drawing.drawDOM;

    drawing.drawDOM = function(element, options) {
        return drawDOM($(element)[0], options);
    };

    // Aliases used by spreadsheet/print.js
    drawing.drawDOM.drawText = drawing.drawText;
    drawing.drawDOM.getFontFaces = drawing.getFontFaces;

})(window.kendo.jQuery);
