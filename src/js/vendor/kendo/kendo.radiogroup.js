/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('kendo.radiogroup',[ "./kendo.core", "./kendo.inputgroupbase", "./kendo.radiobutton" ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "radiogroup",
    name: "RadioGroup",
    category: "web",
    description: "The RadioGroup component.",
    depends: [ "core", "inputgroupbase", "radiobutton" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        InputGroupBase = ui.InputGroupBase,
        CHANGE = "change",
        DOT = ".",
        CHECKED = "checked",
        VERTICAL = "vertical",
        AFTER = "after",
        ROLE = "role",
        NONE = "none",
        GROUP_ROLE = "radiogroup";

    var RadioGroup = InputGroupBase.extend({
        options: {
            name: "RadioGroup",
            inputName: "",
            inputSize: "medium",
            enabled: true,
            labelPosition: AFTER,
            layout: VERTICAL,
            items: []
        },

        ITEM_TEMPLATE: '<li class="k-radio-item">' +
            '<input type="radio" class="k-radio" >' +
            '<label class="k-radio-label" ></label>' +
        '</li>',

        NS: ".kendoRadioGroup",

        COMPONENT: "kendoRadioButton",

        groupStyles: {
            item: "k-radio-item",
            input: "k-radio",
            label: "k-radio-label",
            list: "k-radio-list",
            vertical: "k-list-vertical",
            horizontal: "k-list-horizontal",
            disabled: "k-state-disabled"
        },

        item: function(index) {
            var checked = this.wrapper.find("input:checked");

            if(this._indexIsPresent(index)) {
                return $(this.items().get(index));
            } else if(checked.length) {
                return checked;
            }
        },

        value: function(value) {
            var that = this,
                selectedElement = that.element.find("[value='" + value + "']");

            if(value === undefined) {
                return that._value;
            } else if(value === null) {
                that._value = null;
                that.element.find(DOT + that.groupStyles.input).prop(CHECKED, false);
            }

            if(selectedElement.length > 0) {
                that._value = value;
                that.element.find(DOT + that.groupStyles.input).prop(CHECKED, false);
                selectedElement.prop(CHECKED, true);
            }
        },

        _changeHandler: function(e) {
            var target = $(e.target),
                oldValue = this._value;

            if(this._targetForPreventedChange === e.target) {
                this._targetForPreventedChange = null;
                return;
            }

            this._value = target.val();

            this.trigger(CHANGE, {
                oldValue: oldValue,
                newValue: this._value,
                target: target
            });
        },

        _dataValRequired: function(validationAttributes) {
            validationAttributes["data-val-required"] = this.wrapper.attr("data-val-required");
        },

        _wrapper: function() {
            InputGroupBase.fn._wrapper.call(this);

            this.wrapper.find(DOT + this.groupStyles.item).attr(ROLE, NONE);
            this.wrapper.attr(ROLE, GROUP_ROLE);
        }
    });

    ui.plugin(RadioGroup);
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
