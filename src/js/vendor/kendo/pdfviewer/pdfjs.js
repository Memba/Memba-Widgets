/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";

(function($, undefined) {
    var extend = $.extend;
    var isLoaded = function() {
        if (!window.pdfjsLib)
        {
            var console = window.console;

            if (console && console.error) {
                console.error("PDF.JS required.");
            }

            return false;
        }

        kendo.pdfviewer.pdfjs.lib = window.pdfjsLib;

        return true;
    };

    extend(kendo, {
        pdfviewer: {
            pdfjs: {
                lib: window.pdfjsLib,
                isLoaded: isLoaded
            }
        }
    });
})(window.kendo.jQuery);

