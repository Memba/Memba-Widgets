/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Consider triggering change with data-value-update="keyup"

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.buttonbox');
const NS = '.kendoButtonBox';
const WIDGET_CLASS = /* 'k-widget */ 'kj-buttonbox';

/**
 * ButtonBox
 * @class ButtonBox
 * @extends Widget
 */
const ButtonBox = Widget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.setOptions({
            enabled: this.element.prop('disabled')
                ? false
                : this.options.enabled,
            readonly: this.element.prop('readonly')
                ? true
                : this.options.readonly,
            value: this.options.value
        });
    },

    /**
     * Events
     * @property events
     */
    events: [CONSTANTS.CHANGE, CONSTANTS.CLICK],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'ButtonBox',
        enabled: true,
        readonly: false,
        value: '',
        iconClass: 'k-i-more-horizontal'
    },

    /**
     * setOptions
     * @method setOptions
     * @param options
     */
    setOptions(options) {
        this.enable(options.enabled);
        this.readonly(options.readonly);
        this.value(options.value);
    },

    /**
     * Value
     * Note: ES6 get/set won't work with MVVM
     * @method value
     * @param value
     */
    value(value) {
        const { element } = this;
        const val = element.val();
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = val;
        } else if (value !== val) {
            element.val(value);
        }
        return ret;
    },

    /**
     * _render
     * @private
     */
    _render() {
        const { element, options } = this;
        assert.ok(
            element.is(CONSTANTS.INPUT),
            'Please use an input tag to instantiate a ButtonBox widget.'
        );
        this._inputWrapper = element
            .wrap(`<${CONSTANTS.SPAN}/>`)
            .parent()
            .addClass('k-picker-wrap')
            .addClass(CONSTANTS.DEFAULT_CLASS);
        this.wrapper = this._inputWrapper
            .wrap(`<${CONSTANTS.SPAN}/>`)
            .parent()
            .addClass('k-widget k-datepicker')
            .addClass(WIDGET_CLASS)
            .addClass(element.attr('class'))
            .attr('style', element.attr('style'));
        this._button = $(`<${CONSTANTS.SPAN}/>`)
            .addClass(`k-icon ${options.iconClass}`)
            .wrap(`<${CONSTANTS.SPAN}/>`)
            .parent()
            .addClass('k-select')
            .attr({
                // ariaControls
                ariaLabel: 'select',
                role: 'button',
                unselectable: 'on'
            })
            .appendTo(this._inputWrapper);
        element
            .removeAttr('class')
            .addClass('k-input')
            .removeAttr('style')
            .css({ width: '100%' }); // .width('100%');
    },

    /**
     * Enable
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        const { _button, _inputWrapper, element } = this;
        _button.off(NS);
        _inputWrapper.off(NS);
        element.off(NS);
        if (enabled) {
            _button
                .on(`${CONSTANTS.MOUSEDOWN}${NS}`, e => e.preventDefault())
                .on(`${CONSTANTS.MOUSEUP}${NS}`, this._onClick.bind(this));
            _inputWrapper
                .addClass(CONSTANTS.DEFAULT_CLASS)
                .removeClass(CONSTANTS.DISABLED_CLASS)
                .on(
                    `${CONSTANTS.MOUSEENTER}${NS} ${CONSTANTS.MOUSELEAVE}${NS}`,
                    this._toggleHover.bind(this)
                );
            element
                .removeAttr(CONSTANTS.DISABLED)
                // .removeAttr(CONSTANTS.READONLY)
                .attr(CONSTANTS.ARIA_DISABLED, false)
                .on(`${CONSTANTS.CHANGE}${NS}`, this._onChange.bind(this))
                .on(`${CONSTANTS.FOCUSOUT}${NS}`, this._onBlur.bind(this))
                .on(`${CONSTANTS.FOCUS}${NS}`, this._onFocus.bind(this));
        } else {
            _inputWrapper
                .addClass(
                    enabled ? CONSTANTS.DEFAULT_CLASS : CONSTANTS.DISABLED_CLASS
                )
                .removeClass(
                    enabled ? CONSTANTS.DISABLED_CLASS : CONSTANTS.DEFAULT_CLASS
                );
            element
                .attr(CONSTANTS.DISABLED, !enabled)
                // .attr(CONSTANTS.READONLY, readonly)
                .attr(CONSTANTS.ARIA_DISABLED, !enabled);
        }
    },

    /**
     * Readonly
     * @param enable
     */
    readonly(enable) {
        const readonly =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        this.element.attr(CONSTANTS.READONLY, readonly);
    },

    /**
     * _onBlur
     * @private
     */
    _onBlur() {
        this._inputWrapper.removeClass(CONSTANTS.FOCUSED_CLASS);
    },

    /**
     * _keydown
     * @private
     */
    _onChange() {
        this.trigger(CONSTANTS.CHANGE);
    },

    /**
     * _onClick
     * @method _onClick
     * @private
     */
    _onClick() {
        this.element.blur();
        this.trigger(CONSTANTS.CLICK);
    },

    /**
     * _onFocus
     * @private
     */
    _onFocus() {
        this._inputWrapper.addClass(CONSTANTS.FOCUSED_CLASS);
    },

    /**
     * _toggleHover
     * @param e
     * @private
     */
    _toggleHover(e) {
        $(e.currentTarget).toggleClass(
            CONSTANTS.HOVER_CLASS,
            e.type === CONSTANTS.MOUSEENTER
        );
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        const { _button, _inputWrapper, element } = this;
        Widget.fn.destroy.call(this);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
        _button.off(NS);
        element.off(NS);
        _inputWrapper.off(NS);
        destroy(element);
    }
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'ButtonBox')) {
    // Prevents loading several times in karma
    plugin(ButtonBox);
}
