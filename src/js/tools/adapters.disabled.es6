/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */


// TODO There should be a more generic way to make sure it updates other stuff
// It is a boolean adapter with a callback that does stuff (make other adapters readonly)

var ATTR_CONTAIN_SELECTOR = '[{0}*="{1}"]';
/**
 * Disabled adapter
 */
adapters.DisabledAdapter = BaseAdapter.extend({
    init: function (options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = BOOLEAN;
        this.defaultValue = this.defaultValue || (this.nullable ? null : false);
        // this.editor = 'input';
        // this.attributes = $.extend({}, this.attributes, attributes);
        // this.attributes[kendo.attr('role')] = 'switch';
        this.editor = function (container, settings) {
            var binding = {};
            binding[kendo.attr('bind')] = 'value: ' + settings.field;
            var input = $('<div/>')
            .attr(binding)
            .appendTo(container);
            var switchWidget = input.kendoMobileSwitch({
                change: function (e) {
                    var tbody = e.sender.element.closest('tbody');
                    // Question
                    var questionWidget = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.question')).data('kendoComboBox');
                    if (questionWidget instanceof kendo.ui.ComboBox) {
                        questionWidget.enable(!e.checked);
                    }
                    // Solution - Note: cannot predict what solutionWidget is
                    /*
                    var solutionElement = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.solution'));
                    var solutionWidget = kendo.widgetInstance(solutionElement);
                    if ($.isFunction(solutionWidget.enable)) {
                         solutionWidget.enable(!e.checked);
                    }
                    */
                    // Validation
                    var validationWidget = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.validation')).data('kendoCodeInput');
                    if (validationWidget instanceof kendo.ui.CodeInput) {
                        validationWidget.enable(!e.checked);
                        validationWidget.element
                        .closest('td[role="gridcell"]')
                        .find('button.k-button')
                        .prop('disabled', e.checked)
                        .toggleClass(STATE_DISABLED, e.checked);
                    }
                    // Success
                    var successWidget = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.success')).data('kendoNumericTextBox');
                    if (successWidget instanceof kendo.ui.NumericTextBox) {
                        successWidget.enable(!e.checked);
                    }
                    // Failure
                    var failureWidget = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.failure')).data('kendoNumericTextBox');
                    if (failureWidget instanceof kendo.ui.NumericTextBox) {
                        failureWidget.enable(!e.checked);
                    }
                    // Omit
                    var omitWidget = tbody.find(kendo.format(ATTR_CONTAIN_SELECTOR, kendo.attr('bind'), 'properties.omit')).data('kendoNumericTextBox');
                    if (omitWidget instanceof kendo.ui.NumericTextBox) {
                        omitWidget.enable(!e.checked);
                    }
                }
            }).data('kendoMobileSwitch');
            setTimeout(function () {
                // Note: switchWidget.check() before data bindings so we need to yield some time
                switchWidget.trigger(CHANGE, { checked: switchWidget.check() });
            }, 0);
        };
    }
});
