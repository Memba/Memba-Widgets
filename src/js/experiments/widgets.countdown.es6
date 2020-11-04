/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    format,
    ui: { plugin, Widget },
} = window.kendo;
const logger = new Logger('widgets.countdown');
const CHANGE = 'change';
const CLICK = 'click';
const NS = '.kendoCountDown';
const WIDGET_CLASS = 'k-widget kj-countdown';
const TTL = 500;

/**
 * CountDown
 * @class CountDown
 * @extends Widget
 */
const CountDown = Widget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._render();
        this.setOptions({
            enabled: this.element.prop('disabled')
                ? false
                : this.options.enabled,
            value: this.options.value,
        });
    },

    /**
     * Events
     * @property events
     */
    events: [CHANGE],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'CountDown',
        enabled: true,
        text: '{1:00}:{2:00}:{3:00}',
        value: 3600 * 1000, // in milliseconds
    },

    /**
     * setOptions
     * @method setOptions
     * @param options
     */
    setOptions(options) {
        this.enable(options.enabled);
        this.value(options.value);
    },

    /**
     * Value
     * @method value
     * @param value (in milliseconds)
     */
    value(value) {
        assert.typeOrUndef(
            CONSTANTS.NUMBER,
            value,
            assert.format(
                assert.messages.typeOrUndef.default,
                'value',
                CONSTANTS.NUMBER
            )
        );
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if (this._value !== value) {
            this._value = value;
            this.refresh();
        }
        return ret;
    },

    /**
     * _render
     * @private
     */
    _render() {
        this.wrapper = this.element;
        this.element.addClass(`${WIDGET_CLASS} k-info`);
        $(`<${CONSTANTS.SPAN}/>`).addClass('k-text').appendTo(this.element);
        $(`<${CONSTANTS.SPAN}/>`)
            .addClass('k-icon k-i-play')
            .appendTo(this.element);
    },

    /**
     * Resume
     */
    resume() {
        this._counting = true;
        this._initial = this.value();
        this._start = Date.now();
        this._interval = setInterval(() => {
            this.value(this._initial + (this._start - Date.now()));
            this.refresh();
        }, TTL);
        this.element
            .children('.k-icon')
            .toggleClass('k-i-pause', true)
            .toggleClass('k-i-play', false);
    },

    /**
     * Resume
     */
    pause() {
        this.stop(true);
    },

    /**
     * Start
     */
    start() {
        this.resume();
    },

    /**
     * Stop
     */
    stop(paused) {
        this._counting = false;
        this._initial = paused ? this.value() : undefined;
        this._start = undefined;
        clearInterval(this._interval);
        this._interval = undefined;
        this.element
            .children('.k-icon')
            .toggleClass('k-i-pause', false)
            .toggleClass('k-i-play', true);
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        const time = this.value();

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(time / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);

        // Display
        requestAnimationFrame(() => {
            // this.element.text(Math.floor(time / 1000));
            this.element
                .children('.k-text')
                .text(format(this.options.text, days, hours, minutes, seconds));
            logger.debug({ method: 'refresh', message: 'widget refreshed' });
        });
    },

    /**
     * Enable
     * @method enable
     * @param enable
     */
    enable(enable) {
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        const { element } = this;
        element.off(NS);
        element.css('cursor', 'default');
        if (enabled) {
            element.on(CLICK + NS, this._onClick.bind(this));
            element.css('cursor', 'pointer');
        }
    },

    /**
     * _onClick
     * @method _onClick
     * @private
     */
    _onClick() {
        if (this._counting) {
            this.pause();
        } else {
            this.resume();
        }
        this.trigger(CHANGE);
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        Widget.fn.destroy.call(this);
        destroy(this.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    },
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'CountDown')) {
    // Prevents loading several times in karma
    plugin(CountDown);
}
