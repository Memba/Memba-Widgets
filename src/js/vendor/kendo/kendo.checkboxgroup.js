/** 
 * Kendo UI v2022.1.412 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function(f, define){
    define('kendo.checkboxgroup',[ "./kendo.core", "./kendo.inputgroupbase", "./kendo.checkbox" ], f);
})(function(){

var __meta__ = { // jshint ignore:line
    id: "checkboxgroup",
    name: "CheckBoxGroup",
    category: "web",
    description: "The CheckBoxGroup component.",
    depends: [ "core", "inputgroupbase", "checkbox" ]
};

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        InputGroupBase = ui.InputGroupBase,
        CHANGE = "change",
        DOT = ".",
        CHECKED = "checked",
        VERTICAL = "vertical",
        AFTER = "after";

    var CheckBoxGroup = InputGroupBase.extend({
        options: {
            name: "CheckBoxGroup",
            inputName: "",
            inputRounded: "medium",
            inputSize: "medium",
            enabled: true,
            labelPosition: AFTER,
            layout: VERTICAL,
            items: []
        },

        ITEM_TEMPLATE: '<li class="k-checkbox-item">' +
            '<input type="checkbox" class="k-checkbox" >' +
        '</li>',

        NS: ".kendoCheckBoxGroup",

        COMPONENT: "kendoCheckBox",

        groupStyles: {
            item: "k-checkbox-item",
            input: "k-checkbox",
            label: "k-checkbox-label",
            list: "k-checkbox-list",
            vertical: "k-list-vertical",
            horizontal: "k-list-horizontal",
            disabled: "k-disabled"
        },

        checkAll: function(shouldCheck) {
            var that = this,
                inputs = that.element.find("input"),
                getValues = function(i, input) {
                    that._value.push(input.value);
                };

            if(shouldCheck === true) {
                inputs.prop(CHECKED, true);
                that._value = [];
                inputs.each(getValues);
            } else if(shouldCheck === false) {
                inputs.prop(CHECKED, false);
                that._value = [];
            }
        },

        value: function(values) {
            var that = this,
                currentInput,
                selectedValues = [],
                selectedElements, updatedSelectedElements, i;

            if(values === undefined) {
                if(!that._value){
                    that._value = [];
                }
                return that._value;
            } else if(values === null || values == []) {
                that._value = [];
                that.element.find(DOT + that.groupStyles.input).prop(CHECKED, false);
                return;
            } else if(!values || values.length < 1) {
                return;
            }

            selectedElements = that.element.find("input[value='" + values[0] + "']");

            if(selectedElements.length) {
                selectedValues.push(values[0]);
            }

            for(i = 1; i < values.length; i++) {
                currentInput = that.element.find("input[value='" + values[i] + "']");
                updatedSelectedElements = selectedElements.add(currentInput);

                if(updatedSelectedElements.length > selectedElements.length) {
                    selectedElements = updatedSelectedElements;
                    selectedValues.push(values[i]);
                }
            }

            that._value = selectedValues;
            that.element.find(DOT + that.groupStyles.input).prop(CHECKED, false);
            selectedElements.prop(CHECKED, true);
        },

        _changeHandler: function(e) {
            var target = $(e.target),
                value = target.val(),
                filterOut = function(item){
                    return item !== value;
                };

            if(this._targetForPreventedChange === e.target) {
                this._targetForPreventedChange = null;
                return;
            }

            if(!this._value){
                this._value = [];
            }

            if(target.is(":checked")) {
                this._value.push(value);
            } else {
                this._value = this._value.filter(filterOut);
            }

            this.trigger(CHANGE, {
                target: target
            });
        },

        _dataValRequired: function(validationAttributes) {
            validationAttributes["data-msg-required"] = this.wrapper.attr("data-val-required");
            validationAttributes["data-rule-required"] = "true";
        }
    });

    kendo.cssProperties.registerPrefix("CheckBoxGroup", "k-checkbox-");

    kendo.cssProperties.registerValues("CheckBoxGroup", [{
        prop: "rounded",
        values: kendo.cssProperties.roundedValues.concat([['full', 'full']])
    }]);

    ui.plugin(CheckBoxGroup);
})(window.kendo.jQuery);

return window.kendo;

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
