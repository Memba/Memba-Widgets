/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from '../common/window.constants.es6';
import { getValueBinding } from '../data/data.util.es6';
import BaseAdapter from './adapters.base.es6';

const {
    attr,
    format,
    ui: { ComboBox, CodeInput, NumericTextBox }
} = window.kendo;
const ATTR_CONTAIN_SELECTOR = '[{0}*="{1}"]';

/**
 * DisabledAdapter
 * @class DisabledAdapter
 * @extends BaseAdapter
 */
const DisabledAdapter = BaseAdapter.extend({
    /**
     * Init
     * @constructor init
     * @param options
     */
    init(options /* , attributes */) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.BOOLEAN;
        this.defaultValue = this.defaultValue || (this.nullable ? null : false);
        // this.editor = 'input';
        // this.attributes = $.extend({}, this.attributes, attributes);
        // this.attributes[attr('role')] = 'switch';
        this.editor = function(container, settings) {
            const input = $('<div/>')
                .attr(getValueBinding(settings.field))
                .appendTo(container);
            const switchWidget = input
                .kendoMobileSwitch({
                    change(e) {
                        const tbody = e.sender.element.closest('tbody');
                        // Question
                        const questionWidget = tbody
                            .find(
                                format(
                                    ATTR_CONTAIN_SELECTOR,
                                    attr('bind'),
                                    'properties.question'
                                )
                            )
                            .data('kendoComboBox');
                        if (questionWidget instanceof ComboBox) {
                            questionWidget.enable(!e.checked);
                        }
                        // Solution - Note: cannot predict what solutionWidget is
                        /*
                        var solutionElement = tbody.find(format(ATTR_CONTAIN_SELECTOR, attr('bind'), 'properties.solution'));
                        var solutionWidget = kendo.widgetInstance(solutionElement);
                        if ($.isFunction(solutionWidget.enable)) {
                             solutionWidget.enable(!e.checked);
                        }
                        */
                        // Validation
                        const validationWidget = tbody
                            .find(
                                format(
                                    ATTR_CONTAIN_SELECTOR,
                                    attr('bind'),
                                    'properties.validation'
                                )
                            )
                            .data('kendoCodeInput');
                        if (validationWidget instanceof CodeInput) {
                            validationWidget.enable(!e.checked);
                            validationWidget.element
                                .closest('td[role="gridcell"]')
                                .find('button.k-button')
                                .prop('disabled', e.checked)
                                .toggleClass(
                                    CONSTANTS.DISABLED_CLASS,
                                    e.checked
                                );
                        }
                        // Success
                        const successWidget = tbody
                            .find(
                                format(
                                    ATTR_CONTAIN_SELECTOR,
                                    attr('bind'),
                                    'properties.success'
                                )
                            )
                            .data('kendoNumericTextBox');
                        if (successWidget instanceof NumericTextBox) {
                            successWidget.enable(!e.checked);
                        }
                        // Failure
                        const failureWidget = tbody
                            .find(
                                format(
                                    ATTR_CONTAIN_SELECTOR,
                                    attr('bind'),
                                    'properties.failure'
                                )
                            )
                            .data('kendoNumericTextBox');
                        if (failureWidget instanceof NumericTextBox) {
                            failureWidget.enable(!e.checked);
                        }
                        // Omit
                        const omitWidget = tbody
                            .find(
                                format(
                                    ATTR_CONTAIN_SELECTOR,
                                    attr('bind'),
                                    'properties.omit'
                                )
                            )
                            .data('kendoNumericTextBox');
                        if (omitWidget instanceof NumericTextBox) {
                            omitWidget.enable(!e.checked);
                        }
                    }
                })
                .data('kendoMobileSwitch');
            setTimeout(() => {
                // Note: switchWidget.check() before data bindings so we need to yield some time
                switchWidget.trigger(CONSTANTS.CHANGE, {
                    checked: switchWidget.check()
                });
            }, 0);
        };
    }
});

/**
 * Default export
 */
export default DisabledAdapter;
