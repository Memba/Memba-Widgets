/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO review templates to match new buttongroup - seee https://demos.telerik.com/kendo-ui/buttongroup/index
// TODO: Add keyboard events to check buttons with Tab + Space or Tab + Enter
// TODO add imageUrl (we already have icons) - see splitButton

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    format,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.buttonset');

const NS = '.kendoButtonSet';
const WIDGET_CLASS = /* 'k-widget */ 'kj-buttonset';
const STATE_ACTIVE = `${CONSTANTS.ACTIVE_CLASS} km-state-active`;
const STATE_DISABLED = `${CONSTANTS.DISABLED_CLASS} km-state-disabled`;
const UL_TEMPLATE =
    '<ul class="km-widget km-buttongroup k-widget k-button-group" role="group"></ul>';
const BUTTON_TEMPLATE =
    '<li class="k-button km-button" tabindex="0" role="button"><span class="k-text km-text">{0}</span></li>';
const ICON_TEMPLATE = '<span class="k-icon k-i-{0}"></span>';

/**
 * ButtonSet
 * @class ButtonSet
 * @extends Widget
 */
const ButtonSet = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'Widget initialized' });
        this._render();
        this.enable(
            this.element.prop('disabled') ? false : !!this.options.enabled
        );
        this.value(options.value || 0);
        this.refresh();
    },

    /**
     * Events
     * @property events
     */
    events: [
        CONSTANTS.CHANGE // Clicking a button raises the change event
    ],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'ButtonSet',
        value: 0, // Nothing selected
        enabled: true,
        selection: 'multiple',
        buttons: [
            // { text: 'Option 1' },
            // { text: 'Option 2' }
        ]
    },

    /**
     * Value
     * @method value
     * @param value
     */
    value(value) {
        assert.nullableTypeOrUndef(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.nullableTypeOrUndef.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        const { element } = this;
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            // Read value form html input
            ret = parseInt(element.val(), 10);
        } else if (parseInt(element.val(), 10) !== value) {
            element.val(value);
            this._setStateAsBits(Math.trunc(value));
        }
        return ret;
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const {
            element,
            options: { buttons }
        } = this;
        assert.ok(
            element.is(CONSTANTS.INPUT),
            'Please use an input tag to instantiate a ButtonSet widget.'
            // otherwise kendo ui validators won't work
        );
        const id = element.attr(CONSTANTS.ID);
        element.attr('aria-owns', id ? `${id}_buttonset` : '').hide();
        this.wrapper = element
            .wrap(`<${CONSTANTS.DIV}/>`)
            .parent()
            .addClass(WIDGET_CLASS);
        this.ul = $(UL_TEMPLATE)
            .attr(CONSTANTS.ID, id ? `${id}_buttonset` : '')
            .appendTo(this.wrapper);
        if (Array.isArray(buttons)) {
            buttons.forEach(button => {
                const item = $(format(BUTTON_TEMPLATE, button.text));
                if (button.icon) {
                    item.prepend(format(ICON_TEMPLATE, button.icon));
                    item.addClass('k-button-icontext');
                }
                this.ul.append(item);
            });
        }
    },

    /**
     * enable
     * Note: called by the enabled/disabled bindings
     * @method: enable
     * @param enable
     */
    enable(enable) {
        assert.instanceof(
            $,
            this.ul,
            assert.format(
                assert.messages.instanceof.default,
                'this.ul',
                'jQuery'
            )
        );
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        const { ul } = this;
        ul.off(NS);
        ul.toggleClass(STATE_DISABLED, !enabled);
        if (enabled) {
            ul.on(
                CONSTANTS.CLICK + NS,
                'li.k-button.km-button',
                this._onButtonClick.bind(this)
            );
        }
    },

    /**
     * Event handler for clicking/tapping a button
     * @param e
     * @private
     */
    _onButtonClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        e.preventDefault();
        if (this.options.selection !== 'multiple') {
            this._reset();
        }
        $(e.currentTarget).toggleClass(STATE_ACTIVE);
        this.value(this._getStateAsBits());
        this.trigger(CONSTANTS.CHANGE);
    },

    /**
     * Get button states as bits (value)
     * @private
     */
    _getStateAsBits() {
        assert.instanceof(
            $,
            this.ul,
            assert.format(
                assert.messages.instanceof.default,
                'this.ul',
                'jQuery'
            )
        );
        let ret = 0;
        this.ul.children('li').each((index, item) => {
            if ($(item).hasClass(STATE_ACTIVE)) {
                // eslint-disable-next-line no-bitwise
                ret |= 2 ** index;
            }
        });
        return ret;
    },

    /**
     * Set button states as bits (value)
     * @param value
     * @private
     */
    _setStateAsBits(value) {
        assert.type(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.type.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        this.ul.children('li').each((index, item) => {
            const pow2 = 2 ** index;
            // eslint-disable-next-line no-bitwise
            $(item).toggleClass(STATE_ACTIVE, (value & pow2) === pow2);
        });
    },

    /**
     * Reset
     * @method _reset
     * @private
     */
    _reset() {
        this.value(0);
        this.ul.children('li').removeClass(STATE_ACTIVE);
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        this._setStateAsBits(this.value());
        logger.debug({ method: 'refresh', message: 'Widget refreshed' });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        this.ul.off(NS);
        this.ul.remove();
        this.ul = undefined;
        this.element.unwrap();
        this.wrapper = undefined;
        Widget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(ButtonSet);
