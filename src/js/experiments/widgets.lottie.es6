/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import lottie from '../vendor/airbnb/lottie';

const {
    destroy,
    ui: { plugin, Widget },
} = window.kendo;
const logger = new Logger('widgets.lottie');
const NS = '.kendoLottie';
const WIDGET_CLASS = 'k-widget kj-lottie';

/**
 * Lottie
 * @class Lottie
 * @extends Widget
 */
const Lottie = Widget.extend({
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
    // events: [CONSTANTS.CHANGE],

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Lottie',
        autoplay: true,
        loop: true,
        path: '../vendor/airbnb/data.json',
        renderer: 'svg', // 'svg/canvas/html',
        enabled: true,
        value: '',
    },

    /**
     * setOptions
     * @method setOptions
     */
    setOptions(/* options */) {
        // this.enable(options.enabled);
        // this.value(options.value);
    },

    /**
     * Value
     * Note: ES6 get/set won't work with MVVM
     * @method value
     * @param value
     */
    /*
    value(value) {
        let ret;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            ret = this._value;
        } else if (this._value !== value) {
            this._value = value;
            this.refresh();
        }
        return ret;
    },
    */

    /**
     * _render
     * @private
     */
    _render() {
        const { element, options } = this;
        this.wrapper = element;
        element.addClass(WIDGET_CLASS);
        this.animation = lottie.loadAnimation({
            autoplay: options.autoplay, // Optional
            container: element.get(0), // Required
            loop: options.loop, // Optional
            name: 'Hello World', // Name for future reference. Optional.
            path: options.path, // Required
            renderer: options.renderer, // Required
        });
    },

    /**
     * Refresh
     * @method refresh
     */
    refresh() {
        // this.element.text(this._value);
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
            element.on(CONSTANTS.CLICK + NS, this._onClick.bind(this));
            element.css('cursor', 'pointer');
        }
    },

    /**
     * _onClick
     * @method _onClick
     * @private
     */
    _onClick() {
        /**
        this.value('');
        this.trigger(CONSTANTS.CHANGE);
        */
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
plugin(Lottie);
