/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import { preload } from '../common/window.image.es6';
import Logger from '../common/window.logger.es6';

const {
    destroy,
    ui: { plugin, Widget }
} = window.kendo;
const logger = new Logger('widgets.imageset');
const NS = '.kendoImageSet';
const WIDGET_CLASS = 'kj-imageset kj-interactive';

// TODO use Kendo UI Keyboard class and Kendo Keys
const KEYSTROKES = {
    ARROW_DOWN: 40,
    ARROW_LEFT: 37,
    ARROW_RIGHT: 39,
    ARROW_UP: 38,
    END: 35,
    HOME: 36,
    PAGE_DOWN: 34,
    PAGE_UP: 33,
    SPACE: 32
};

/**
 * ImageSet
 * @class ImageSet
 * @extends Widget
 */
const ImageSet = Widget.extend({
    /**
     * Constructor
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options) {
        const that = this;
        Widget.fn.init.call(that, element, options);
        logger.debug({ method: 'init', message: 'Widget initialized' });
        that._preload();
        that._render();
        that.value(that.options.value || '');
        that.enable(
            that.element.prop('disabled') ? false : that.options.enabled
        );
    },

    /**
     * Widget options
     * @property options
     */
    options: {
        name: 'ImageSet',
        value: null,
        images: [],
        enabled: true
    },

    /**
     * Events
     */
    events: [CONSTANTS.CHANGE],

    /**
     * Value
     * @method value
     * @param value
     * @return {*}
     */
    value(value) {
        const that = this;
        const images = that.options.images;
        if ($.type(value) === CONSTANTS.UNDEFINED) {
            if ($.isArray(images) && images[that._index]) {
                return images[that._index].text;
            }
        } else if (
            $.type(value) === CONSTANTS.STRING ||
            $.type(value) === CONSTANTS.NULL
        ) {
            that._index = 0;
            for (let i = 0, length = images.length; i < length; i++) {
                if (value === images[i].text) {
                    that._index = i;
                    break;
                }
            }
            that.refresh();
        } else {
            throw new TypeError(
                '`value` should be a nullable string or undefined.'
            );
        }
    },

    /**
     * Preload images
     * @private
     */
    _preload() {
        const images = this.options.images;
        for (let i = 0, length = images.length; i < length; i++) {
            $('<img>').attr('src', window.encodeURI(images[i].image));
            /*
            .on('load', function () {
                debugger; // Yippy! they load
            });
            */
        }
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const that = this;
        const element = that.element;
        if (!element.is('div')) {
            throw new Error('Use a div tag to instantiate an ImageSet widget.');
        }
        that.wrapper = element
            .css({
                cursor: 'pointer',
                outline: 0,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
            })
            .attr({
                role: 'button',
                tabindex: 0 // This is required for the element to get the focus and support keydown events
            })
            .addClass(WIDGET_CLASS);
    },

    /**
     * Enable user interactivity
     * @param enabled
     */
    enable(enabled) {
        const that = this;
        const element = that.element;
        element.off(NS);
        if ($.type(enabled) === CONSTANTS.UNDEFINED || !!enabled) {
            element.on(CONSTANTS.CLICK + NS, $.proxy(that._onClick, that));
            element.on(CONSTANTS.KEYDOWN + NS, $.proxy(that._onKeyDown, that));
        }
    },

    /**
     * Event handler for the click event
     * @private
     */
    _onClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const images = this.options.images;
        if (e.altKey || e.ctrlKey || e.shiftKey) {
            this._index =
                this._index === 0 ? images.length - 1 : this._index - 1;
        } else {
            this._index =
                this._index === images.length - 1 ? 0 : this._index + 1;
        }
        this.refresh();
        this.trigger(CONSTANTS.CHANGE);
    },

    /**
     * Event handler for the keydown event (which is enabled by tabindex=0)
     * @param e
     * @private
     */
    _onKeyDown(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(
                assert.messages.instanceof.default,
                'e',
                'jQuery.Event'
            )
        );
        const images = this.options.images;
        switch (e.which) {
            // TODO Consider handling numbers to display an image
            case KEYSTROKES.ARROW_DOWN:
            case KEYSTROKES.ARROW_LEFT:
                this._index =
                    this._index === 0 ? images.length - 1 : this._index - 1;
                break;
            case KEYSTROKES.ARROW_RIGHT:
            case KEYSTROKES.ARROW_UP:
            case KEYSTROKES.SPACE:
                this._index =
                    this._index === images.length - 1 ? 0 : this._index + 1;
                break;
            case KEYSTROKES.END:
            case KEYSTROKES.PAGE_UP:
                this._index = images.length - 1;
                break;
            case KEYSTROKES.HOME:
            case KEYSTROKES.PAGE_DOWN:
                this._index = 0;
                break;
        }
        this.refresh();
        this.trigger(CONSTANTS.CHANGE);
    },

    /**
     * Refresh the widget
     * @method refresh
     */
    refresh() {
        const {
            element,
            options: { images }
        } = this;
        this._index = Math.round(Math.abs(this._index)) % images.length || 0;
        if (Array.isArray(images) && images[this._index]) {
            // element.attr('alt', kendo.htmlEncode(images[this._index].text));
            // element.attr('src', kendo.htmlEncode(images[this._index].image));
            element.css({
                backgroundImage: `url(${window.encodeURI(
                    images[this._index].image
                )})`
            });
        }
        logger.debug({ method: 'refresh', message: 'Widget refreshed' });
    },

    /**
     * Destroy the widget
     * @method destroy
     */
    destroy() {
        const that = this;
        const wrapper = that.wrapper;
        // Unbind events
        that.element.off(NS);
        kendo.unbind(wrapper);
        // Clear references
        // Destroy widget
        Widget.fn.destroy.call(that);
        destroy(wrapper);
    }
});

plugin(ImageSet);
