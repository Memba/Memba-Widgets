/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO: check touch interfaces
// TODO: Add tooltip with value and/or description
// TODO: Should we bind to the DOM change event to be notified when input value changes?
// TODO: https://developers.google.com/structured-data/rich-snippets/reviews

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import { round } from '../common/window.util.es6';

const {
    attr,
    destroy,
    format,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.rating');

const NS = '.kendoRating';
const WIDGET_CLASS = 'kj-rating'; // 'k-widget kj-rating';
const STAR = 'star';
const STAR_P = '&#x2605;';
const STAR_O = '&#x2606;';
const STAR_SELECTOR = 'span.kj-rating-star';
const RATING_MIN = 0;
const RATING_MAX = 5;
const RATING_STEP = 1;

/** *****************************************************************************************
 * Rating
 * SEE: http://css-tricks.com/star-ratings/
 * SEE: http://www.fyneworks.com/jquery/star-rating/
 * SEE: http://www.enfew.com/5-best-jquery-star-rating-plugins-tutorials/
 ****************************************************************************************** */

/**
 * Rating
 * @class Rating
 * @extends Widget
 */
const Rating = Widget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        assert.instanceof(
            HTMLElement,
            element,
            assert.format(
                assert.messages.instanceof.default,
                'element',
                'HTMLElement'
            )
        );
        assert.isPlainOrEmptyObject(
            options,
            assert.format(assert.messages.isPlainObject.default, 'options')
        );
        const input = $(element);
        assert.ok(
            input.is(CONSTANTS.INPUT),
            '`element` should be an html input field'
        );
        const opts = $.extend(
            {
                enabled: !(
                    input.prop('readonly') ||
                    input.prop('disabled') ||
                    false
                ),
                max: parseFloat(input.attr('max') || RATING_MAX),
                min: parseFloat(input.attr('min') || RATING_MIN),
                step: parseFloat(input.attr('step') || RATING_STEP),
                value: parseFloat(input.attr('value') || RATING_MIN)
            },
            options
        );
        // See https://www.w3schools.com/tags/att_input_type_number.asp
        input.attr({
            max: opts.max,
            min: opts.min,
            step: opts.step,
            type: CONSTANTS.NUMBER
        });
        Widget.fn.init.call(this, element, opts);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.value(this.options.value);
        // value won't trigger refresh because it is already stored in element, so do it now
        this.refresh();
        this.enable(this.options.enabled);
    },

    /**
     * Events
     * @property events
     */
    events: [
        CONSTANTS.CHANGE // Changing the rating value by clicking a star raises the change event
    ],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Rating',
        enabled: true,
        min: RATING_MIN,
        max: RATING_MAX,
        step: RATING_STEP,
        value: RATING_MIN
    },

    /**
     * Gets or sets the rating value
     * @method value
     * @param value
     * @return {number}
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
        let ret;
        const { element, options } = this;
        const val = parseFloat(value);
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = parseFloat(element.val());
        } else if (val >= options.min && val <= options.max) {
            if (parseFloat(element.val()) !== val) {
                // store value with element
                element.val(val);
                // refresh
                this.refresh();
            }
        } else {
            throw new RangeError(
                format(
                    'Expecting a number between {0} and {1}',
                    options.min,
                    options.max
                )
            );
        }
        return ret;
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const { element, options } = this;
        element.wrap(`<${CONSTANTS.SPAN}/>`);
        // Hide the input
        element.hide();
        // Wrapper for visible/invisible bindings
        this.wrapper = element.parent().addClass(WIDGET_CLASS);
        // Number of stars to display
        const n = round((options.max - options.min) / options.step); // number of stars
        // Add stars to the DOM
        for (let i = 1; i <= n; i++) {
            this.wrapper.append(
                format(
                    '<span class="kj-rating-star" data-star="{0}">{1}</span>',
                    i,
                    STAR_O
                )
            );
        }
    },

    /**
     * Function called by the enabled/disabled bindings
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        const { element, wrapper } = this;
        wrapper.off(NS);
        element.prop({ disabled: !enabled });
        if (enabled) {
            wrapper.removeClass(CONSTANTS.DISABLED_CLASS);
            wrapper
                .on(
                    `${CONSTANTS.MOUSEENTER}${NS} ${CONSTANTS.MOUSELEAVE}${NS}`,
                    STAR_SELECTOR,
                    this._onStarHover.bind(this)
                )
                .on(
                    `${CONSTANTS.CLICK}${NS} ${CONSTANTS.TAP}${NS}`,
                    STAR_SELECTOR,
                    this._onStarClick.bind(this)
                );
        } else {
            wrapper.addClass(CONSTANTS.DISABLED_CLASS);
        }
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        const { options, wrapper } = this;
        const i = round((this.value() - options.min) / options.step);
        wrapper.find(STAR_SELECTOR).each((index, element) => {
            const star = $(element);
            if (parseFloat(star.attr(attr(STAR))) <= i) {
                star.html(STAR_P).addClass(CONSTANTS.SELECTED_CLASS);
            } else {
                star.html(STAR_O).removeClass(CONSTANTS.SELECTED_CLASS);
            }
        });
        logger.debug({ method: 'refresh', message: 'widget refreshed' });
    },

    /**
     * Event handler for clicking/tapping a star
     * @method _onStarClick
     * @param e
     * @private
     */
    _onStarClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const { options } = this;
        const idx = parseFloat($(e.currentTarget).attr(attr(STAR)));
        const value = options.min + idx * options.step;
        e.preventDefault();
        this.value(value);
        // The change event needs to be triggered once the value has been modified
        this.trigger(CONSTANTS.CHANGE);
    },

    /**
     * Event handler for hovering stars
     * @method _onStarHover
     * @param e
     * @private
     */
    _onStarHover(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const { wrapper } = this;
        const idx = parseFloat($(e.currentTarget).attr(attr(STAR)));
        wrapper.find(STAR_SELECTOR).each((index, element) => {
            const star = $(element);
            if (
                e.type === CONSTANTS.MOUSEENTER &&
                parseFloat(star.attr(attr(STAR))) <= idx
            ) {
                star.html(STAR_P).addClass(CONSTANTS.HOVER_CLASS);
            } else {
                star.html(
                    star.hasClass(CONSTANTS.SELECTED_CLASS) ? STAR_P : STAR_O
                ).removeClass(CONSTANTS.HOVER_CLASS);
            }
        });
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        // remove wrapper and stars
        if (this.wrapper) {
            this.wrapper
                .off(NS)
                .find(STAR_SELECTOR)
                .remove();
            this.element.unwrap();
            delete this.wrapper;
            this.element.show();
        }
        // Destroy
        Widget.fn.destroy.call(this);
        destroy(this.element);
    }
});

/**
 * Registration
 */
plugin(Rating);
