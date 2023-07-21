/**
 * Kendo UI v2023.2.718 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";

(function($) {

    function createPromise() {
        return $.Deferred();
    }

    function promiseAll(promises) {
        return $.when.apply($, promises);
    }

    function extendStatic(dest, src) {
        if (!src) {
            return;
        }

        if (typeof src.__proto__ === 'function') {
            dest.__proto__ = src;
        } else {
            for (var member in src) {
                if (src.hasOwnProperty(member)) {
                    dest[member] = src[member];
                }
            }
        }
    }

    kendo.drawing.util = kendo.drawing.util || {};
    kendo.deepExtend(kendo.drawing.util, {
        createPromise: createPromise,
        promiseAll: promiseAll,
        extendStatic: extendStatic
    });

})(window.kendo.jQuery);

