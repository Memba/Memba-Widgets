/**
 * Kendo UI v2022.1.119 (http://www.telerik.com/kendo-ui)
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
















 */
(function (f, define) {
    define('html/chiplist', ['html/htmlbase'], f);
}(function () {
    (function ($, undefined) {
        var kendo = window.kendo, HTMLBase = kendo.html.HTMLBase;
        var renderChipList = function (element, options) {
            if (arguments[0] === undefined || $.isPlainObject(arguments[0])) {
                options = element;
                element = $('<div></div>');
            }
            return new HTMLChipList(element, options).html();
        };
        var HTMLChipList = HTMLBase.extend({
            init: function (element, options) {
                var that = this;
                HTMLBase.fn.init.call(that, element, options);
                that.wrapper = that.element.addClass('k-chip-list');
                that._addClasses();
            },
            options: {
                name: 'HTMLChipList',
                size: 'medium',
                stylingOptions: ['size']
            }
        });
        $.extend(kendo.html, {
            renderChipList: renderChipList,
            HTMLChipList: HTMLChipList
        });
        kendo.cssProperties.registerPrefix('HTMLChipList', 'k-chip-list-');
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
