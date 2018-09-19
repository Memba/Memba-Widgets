/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import BaseAdapter from './adapters.base.es6';

// TODO There should be a more generic way to make sure it updates other stuff
// It is a boolean adapter with a callback that does stuff (make other adapters readonly)
const { attr, format } = window.kendo;
const ATTR_CONTAIN_SELECTOR = '[{0}*="{1}"]';

/**
 * @class DisabledAdapter
 */
const DisabledAdapter = BaseAdapter.extend({
    /**
     * Constructor
     * @constructor
     * @param options
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.BOOLEAN;
        this.defaultValue = this.defaultValue || (this.nullable ? null : false);
        // this.editor = 'input';
        // this.attributes = $.extend({}, this.attributes, attributes);
        // this.attributes[kendo.attr('role')] = 'switch';
        this.editor = function(container, settings) {
            const binding = {};
            binding[kendo.attr('bind')] = `value: ${settings.field}`;
            const input = $('<div/>')
                .attr(binding)
                .appendTo(container);
            const switchWidget = input
                .kendoMobileSwitch({
                    change(e) {
                        const tbody = e.sender.element.closest('tbody');
                        // Question
                        const questionWidget = tbody
                            .find(
                                kendo.format(
                                    ATTR_CONTAIN_SELECTOR,
                                    kendo.attr('bind'),
                                    'properties.question'
                                )
                            )
                            .data('kendoComboBox');
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
                        const validationWidget = tbody
                            .find(
                                kendo.format(
                                    ATTR_CONTAIN_SELECTOR,
                                    kendo.attr('bind'),
                                    'properties.validation'
                                )
                            )
                            .data('kendoCodeInput');
                        if (validationWidget instanceof kendo.ui.CodeInput) {
                            validationWidget.enable(!e.checked);
                            validationWidget.element
                                .closest('td[role="gridcell"]')
                                .find('button.k-button')
                                .prop('disabled', e.checked)
                                .toggleClass(STATE_DISABLED, e.checked);
                        }
                        // Success
                        const successWidget = tbody
                            .find(
                                kendo.format(
                                    ATTR_CONTAIN_SELECTOR,
                                    kendo.attr('bind'),
                                    'properties.success'
                                )
                            )
                            .data('kendoNumericTextBox');
                        if (successWidget instanceof kendo.ui.NumericTextBox) {
                            successWidget.enable(!e.checked);
                        }
                        // Failure
                        const failureWidget = tbody
                            .find(
                                kendo.format(
                                    ATTR_CONTAIN_SELECTOR,
                                    kendo.attr('bind'),
                                    'properties.failure'
                                )
                            )
                            .data('kendoNumericTextBox');
                        if (failureWidget instanceof kendo.ui.NumericTextBox) {
                            failureWidget.enable(!e.checked);
                        }
                        // Omit
                        const omitWidget = tbody
                            .find(
                                kendo.format(
                                    ATTR_CONTAIN_SELECTOR,
                                    kendo.attr('bind'),
                                    'properties.omit'
                                )
                            )
                            .data('kendoNumericTextBox');
                        if (omitWidget instanceof kendo.ui.NumericTextBox) {
                            omitWidget.enable(!e.checked);
                        }
                    }
                })
                .data('kendoMobileSwitch');
            setTimeout(() => {
                // Note: switchWidget.check() before data bindings so we need to yield some time
                switchWidget.trigger(CHANGE, { checked: switchWidget.check() });
            }, 0);
        };
    }
});

/**
 * Default export
 */
export default DisabledAdapter;
