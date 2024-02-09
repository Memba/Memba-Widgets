/**
 * Kendo UI v2024.1.130 (http://www.telerik.com/kendo-ui)
 * Copyright 2024 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";
import "./kendo-ooxml.js";
// import * as ooxml from "/kendo-ooxml/src/main.js";
// kendo.ooxml = ooxml;

(function ($) {

var Workbook = kendo.ooxml.Workbook;

kendo.ooxml.IntlService.register({
    toString: kendo.toString
});

var toDataURL = Workbook.prototype.toDataURL;

Object.assign(Workbook.prototype, {
    toDataURL: function() {
        var result = toDataURL.call(this);
        if (typeof result !== 'string') {
            throw new Error('The toDataURL method can be used only with jsZip 2. Either include jsZip 2 or use the toDataURLAsync method.');
        }

        return result;
    },

    toDataURLAsync: function() {
        var deferred = $.Deferred();
        var result = toDataURL.call(this);
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
