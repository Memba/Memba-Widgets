/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('kendo.multicolumncombobox',[ "./kendo.combobox" ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "multicolumncombobox",
    name: "MultiColumnComboBox",
    category: "web",
    description: "The MultiColumnComboBox widget allows the selection from pre-defined values or entering a new value where the list popup is rendered in table layout.",
    depends: [ "combobox" ],
    features: [ {
        id: "mobile-scroller",
        name: "Mobile scroller",
        description: "Support for kinetic scrolling in mobile device",
        depends: [ "mobile.scroller" ]
    }, {
        id: "virtualization",
        name: "VirtualList",
        description: "Support for virtualization",
        depends: [ "virtuallist" ]
    } ]
};

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        ComboBox = ui.ComboBox,
        percentageUnitsRegex = /^\d+(\.\d+)?%$/i,
        MCCOMBOBOX = "k-dropdowngrid",
        POPUPCLASS = "k-dropdowngrid-popup k-popup-flush";

    var MultiColumnComboBox = ComboBox.extend({
        init: function(element, options) {
            ComboBox.fn.init.call(this, element, options);
            this.list.parent().addClass(POPUPCLASS);

            if (this._allColumnsWidthsAreSet(this.options)) {
                this.list.parent().width(this._calculateDropDownWidth(this.options));
            } else if (this.options.dropDownWidth) {
                this.list.parent().width(this.options.dropDownWidth);
            }
        },

        options: {
            name: "MultiColumnComboBox",
            ns: ".kendoMultiColumnComboBox",
            columns: [],
            dropDownWidth: null,
            filterFields: []
        },

        setOptions: function(options) {
            ComboBox.fn.setOptions.call(this, options);
            if (this._allColumnsWidthsAreSet(options)) {
                this.list.parent().width(this._calculateDropDownWidth(options));
            } else if (this.options.dropDownWidth) {
                this.list.parent().width(this.options.dropDownWidth);
            }
        },

        _allColumnsWidthsAreSet: function (options) {
            var columns = options.columns;

            if (!columns || !columns.length) {
                return false;
            }

            for (var i = 0; i < columns.length; i++) {
                var currentWidth = columns[i].width;
                if(!currentWidth  || isNaN(parseInt(currentWidth, 10)) || percentageUnitsRegex.test(currentWidth)){
                    return false;
                }
            }

            return true;
        },

        _calculateDropDownWidth: function (options) {
            var columns = options.columns;
            var totalWidth = kendo.support.scrollbar();

            for (var i = 0; i < columns.length; i++) {
                var currentWidth = columns[i].width;
                totalWidth = totalWidth + parseInt(currentWidth, 10);
            }

            return totalWidth;
        },

        _wrapper: function() {
            ComboBox.fn._wrapper.call(this);
            this.wrapper.addClass(MCCOMBOBOX);
        }
    });

    ui.plugin(MultiColumnComboBox);

    kendo.cssProperties.registerPrefix("MultiColumnComboBox", "k-input-");

    kendo.cssProperties.registerValues("MultiColumnComboBox", [{
        prop: "rounded",
        values: kendo.cssProperties.roundedValues.concat([['full', 'full']])
    }]);
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });

