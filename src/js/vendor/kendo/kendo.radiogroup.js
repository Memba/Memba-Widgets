/** 
 * Kendo UI v2021.1.224 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2021 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.radiogroup', [
        'kendo.core',
        'kendo.inputgroupbase'
    ], f);
}(function () {
    var __meta__ = {
        id: 'radiogroup',
        name: 'RadioGroup',
        category: 'web',
        description: 'The RadioGroup component.',
        depends: [
            'core',
            'inputgroupbase'
        ]
    };
    (function ($, undefined) {
        var kendo = window.kendo, ui = kendo.ui, InputGroupBase = ui.InputGroupBase, CHANGE = 'change', DOT = '.', CHECKED = 'checked', VERTICAL = 'vertical', AFTER = 'after';
        var RadioGroup = InputGroupBase.extend({
            options: {
                name: 'RadioGroup',
                inputName: '',
                enabled: true,
                labelPosition: AFTER,
                layout: VERTICAL,
                items: []
            },
            ITEM_TEMPLATE: '<li class="k-radio-item">' + '<input type="radio" class="k-radio" >' + '<label class="k-radio-label" ></label>' + '</li>',
            NS: '.kendoRadioGroup',
            GROUP_ROLE: 'radiogroup',
            groupStyles: {
                item: 'k-radio-item',
                input: 'k-radio',
                label: 'k-radio-label',
                list: 'k-radio-list',
                vertical: 'k-list-vertical',
                horizontal: 'k-list-horizontal',
                disabled: 'k-state-disabled'
            },
            item: function (index) {
                var checked = this.wrapper.find('input:checked');
                if (this._indexIsPresent(index)) {
                    return $(this.items().get(index));
                } else if (checked.length) {
                    return checked;
                }
            },
            value: function (value) {
                var that = this, selectedElement = that.element.find('[value=\'' + value + '\']');
                if (value === undefined) {
                    return that._value;
                } else if (value === null) {
                    that._value = null;
                    that.element.find(DOT + that.groupStyles.input).prop(CHECKED, false);
                }
                if (selectedElement.length > 0) {
                    that._value = value;
                    that.element.find(DOT + that.groupStyles.input).prop(CHECKED, false);
                    selectedElement.prop(CHECKED, true);
                }
            },
            _changeHandler: function (e) {
                var target = $(e.target), oldValue = this._value;
                if (this._targetForPreventedChange === e.target) {
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
            _dataValRequired: function (validationAttributes) {
                validationAttributes['data-val-required'] = this.wrapper.attr('data-val-required');
            }
        });
        ui.plugin(RadioGroup);
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));