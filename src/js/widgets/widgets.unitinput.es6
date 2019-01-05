/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO IMPORTANT: unwrap in destroy
// TODO Check keyboard use
// TODO handle properly the case when you enter `1 auto` (what todo with the number?)
// TODO Check in relation with styles

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.dropdownlist';
import 'kendo.numerictextbox';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    culture,
    destroy,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.unitinput');

// const NS = '.kendoUnitInput';
const WIDGET_CLASS = /* 'k-widget */ 'kj-unitinput';
const RX_UNIT = /^([\d.,]*)\s*([^\d.,]+)$/;

/**
 * UnitInput
 * @class UnitInput
 * @extends Widget
 */
const UnitInput = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.enable(
            this.element.prop('disabled') ? false : this.options.enabled
        );
        this.value(this.options.value);
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'UnitInput',
        decimals: 0,
        default: 0,
        enabled: true,
        format: 'n0',
        value: '',
        max: 100,
        min: 0,
        nonUnits: [], // These choices in the drop down list disable the numeric entry
        step: 1,
        units: []
    },

    /**
     * Value
     * @method value
     * @param value
     * @return {*}
     */
    value(value) {
        assert.nullableTypeOrUndef(
            CONSTANTS.STRING,
            value,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'value',
                CONSTANTS.STRING
            )
        );
        const { element /* , options */ } = this;
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = element.val();
        } else if (element.val() !== value) {
            const matches = value.match(RX_UNIT);
            if (
                $.isArray(matches) &&
                matches.length === 3 // &&
                // options.units.indexOf(matches[2]) !== -1
            ) {
                element.val(value);
                this.numericTextBox.value(matches[1]);
                this.dropDownList.value(matches[2]);
                this.enable(this._enabled);
            } /* else {
                throw new RangeError(
                    'Not a valid combination of number and unit'
                );
            } */
        }
        return ret;
    },

    /**
     * _render
     * @method _render
     * @private
     */
    _render() {
        const { element, options } = this;
        assert.ok(
            element.is(CONSTANTS.INPUT),
            'Please use an input tag to instantiate a UnitInput widget.'
            // otherwise kendo ui validators won't work
        );
        element.wrap(`<${CONSTANTS.SPAN}/>`);
        this.wrapper = element.parent();
        this.wrapper
            .addClass(WIDGET_CLASS)
            .css({ width: element.css(CONSTANTS.WIDTH) });
        element.hide();
        this.numericTextBox = $(`<${CONSTANTS.INPUT}>`)
            .appendTo(this.wrapper)
            .kendoNumericTextBox({
                change: this._onNumericTextBoxChange.bind(this),
                culture: culture(),
                decimals: options.decimals,
                format: options.format,
                max: options.max,
                min: options.min,
                step: options.step
            })
            .data('kendoNumericTextBox');
        this.dropDownList = $(`<${CONSTANTS.SELECT}/>`)
            .appendTo(this.wrapper)
            .kendoDropDownList({
                change: this._onDropDownListChange.bind(this),
                dataSource: {
                    data: options.units.concat(options.nonUnits)
                }
            })
            .data('kendoDropDownList');
    },

    /**
     * Event handler triggered when changing the value of the drop down list
     * @method _onDropDownListChange
     * @private
     */
    _onDropDownListChange() {
        const { dropDownList, element, numericTextBox, options } = this;
        const num = numericTextBox.value();
        const unit = dropDownList.value();
        const isUnit =
            options.units.indexOf(unit) > -1 &&
            options.nonUnits.indexOf(unit) === -1;
        if (isUnit && $.type(num) === CONSTANTS.NUMBER) {
            element.val(num + unit);
        } else if (isUnit) {
            numericTextBox.value(options.default);
            element.val(options.default + unit);
        } else {
            element.val(unit);
            numericTextBox.value('');
        }
        this.enable(this._enabled);
        this.trigger(CONSTANTS.CHANGE);
    },

    /**
     * Event handler triggered when changing the value of the numeric textbox
     * @method _onNumericTextBoxChange
     * @private
     */
    _onNumericTextBoxChange() {
        this.element.val(
            (this.numericTextBox.value() || '') + this.dropDownList.value()
        );
        this.trigger(CONSTANTS.CHANGE);
    },

    /**
     * Enable
     * @method enable
     * @param enable
     */
    enable(enable) {
        const {
            options: { nonUnits }
        } = this;
        this._enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        const hasNumber = Array.isArray(nonUnits)
            ? nonUnits.indexOf(this.dropDownList.value()) === -1
            : true;
        this.numericTextBox.enable(this._enabled && hasNumber);
        this.dropDownList.enable(this._enabled);
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        // remove wrapper and stars
        this.numericTextBox.destroy();
        this.dropDownList.destroy();
        this.numericTextBox = undefined;
        // TODO unwrap!
        this.dropDownList = undefined;
        Widget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(UnitInput);
