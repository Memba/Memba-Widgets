/**
 * Kendo UI v2023.1.117 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";
import "./kendo-ooxml.js";

(function ($) {

var Workbook = kendo.ooxml.Workbook;

kendo.ooxml.IntlService.register({
    toString: kendo.toString
});

kendo.ooxml.Workbook = Workbook.extend({
    toDataURL: function() {
        var result = Workbook.fn.toDataURL.call(this);
        if (typeof result !== 'string') {
            throw new Error('The toDataURL method can be used only with jsZip 2. Either include jsZip 2 or use the toDataURLAsync method.');
        }

        return result;
    },

    toDataURLAsync: function() {
        var deferred = $.Deferred();
        var result = Workbook.fn.toDataURL.call(this);
        if (typeof result === 'string') {
            result = deferred.resolve(result);
        } else if (result && result.then){
            result.then(function(dataURI) {
                deferred.resolve(dataURI);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise();
    }
});

})(window.kendo.jQuery);
