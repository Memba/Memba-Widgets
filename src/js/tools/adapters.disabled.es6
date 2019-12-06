/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Review

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.combobox';
import 'kendo.numerictextbox';
import 'kendo.switch';
import CONSTANTS from '../common/window.constants.es6';
import '../widgets/widgets.codeinput.es6';
import { getAttributeBinding } from '../data/data.util.es6';
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
     * @param attributes
     */
    init(options, attributes) {
        BaseAdapter.fn.init.call(this, options);
        this.type = CONSTANTS.BOOLEAN;
        this.defaultValue = this.defaultValue || (this.nullable ? null : false);
        // this.editor = 'input';
        // this.attributes = $.extend({}, this.attributes, attributes);
        // this.attributes[attr(CONSTANTS.ROLE)] = 'switch';
        this.editor = (container, settings = {}) => {
            const input = $(`<${CONSTANTS.INPUT}>`)
                .attr({
                    name: settings.field,
                    ...settings.attributes,
                    ...getAttributeBinding(
                        CONSTANTS.BIND,
                        `value: ${settings.field}`
                    ),
                    ...attributes
                })
                .appendTo(container);
            const switchWidget = input
                .kendoSwitch({
                    change: this.onChange.bind(this)
                })
                .data('kendoSwitch');
            setTimeout(() => {
                // Note: switchWidget.check() before data bindings so we need to yield some time
                switchWidget.trigger(CONSTANTS.CHANGE, {
                    checked: switchWidget.check()
                });
            }, 0);
        };
    },

    /**
     * Event handler triggered when the value of the switch is changed
     * @param e
     */
    onChange(e) {
        const tbody = e.sender.element.closest('tbody');
        // Question
        const question = tbody
            .find(
                format(
                    ATTR_CONTAIN_SELECTOR,
                    attr(CONSTANTS.BIND),
                    'properties.question'
                )
            )
            .data('kendoComboBox');
        if (question instanceof ComboBox) {
            question.enable(!e.checked);
        }
        // Solution - Note: cannot predict what solutionWidget is
        /*
        var solutionElement = tbody.find(format(ATTR_CONTAIN_SELECTOR, attr(CONSTANTS.BIND), 'properties.solution'));
        var solutionWidget = kendo.widgetInstance(solutionElement);
        if ($.isFunction(solutionWidget.enable)) {
             solutionWidget.enable(!e.checked);
        }
        */
        // Validation
        const validation = tbody
            .find(
                format(
                    ATTR_CONTAIN_SELECTOR,
                    attr(CONSTANTS.BIND),
                    'properties.validation'
                )
            )
            .data('kendoCodeInput');
        if (validation instanceof CodeInput) {
            validation.enable(!e.checked);
            validation.element
                .closest('td[role="gridcell"]')
                .find('button.k-button')
                .prop('disabled', e.checked)
                .toggleClass(CONSTANTS.DISABLED_CLASS, e.checked);
        }
        // Success
        const success = tbody
            .find(
                format(
                    ATTR_CONTAIN_SELECTOR,
                    attr(CONSTANTS.BIND),
                    'properties.success'
                )
            )
            .data('kendoNumericTextBox');
        if (success instanceof NumericTextBox) {
            success.enable(!e.checked);
        }
        // Failure
        const failure = tbody
            .find(
                format(
                    ATTR_CONTAIN_SELECTOR,
                    attr(CONSTANTS.BIND),
                    'properties.failure'
                )
            )
            .data('kendoNumericTextBox');
        if (failure instanceof NumericTextBox) {
            failure.enable(!e.checked);
        }
        // Omit
        const omit = tbody
            .find(
                format(
                    ATTR_CONTAIN_SELECTOR,
                    attr(CONSTANTS.BIND),
                    'properties.omit'
                )
            )
            .data('kendoNumericTextBox');
        if (omit instanceof NumericTextBox) {
            omit.enable(!e.checked);
        }
    }
});

/**
 * Default export
 */
export default DisabledAdapter;
