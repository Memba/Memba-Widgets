/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO See https://github.com/Khan/math-input
// TODO See also https://mathlive.io

// TODO Add key popup on hold (like iPhone and mathlive)
// TODO: Add maj (caps lock) + alt + shift versions of keys (use layers?)
// TODO Add fonts/styles and images (html text)
// TODO Add sound and vibration

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.fx';
import 'kendo.tabstrip';
import 'kendo.userevents';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const { Audio, navigator } = window;
const {
    applyEventMap,
    attr,
    destroy,
    fx,
    ui: { plugin, TabStrip, Widget }
} = window.kendo;

const logger = new Logger('widgets.keyboard');
const NS = '.kendoKeyboard';
const WIDGET_CLASS = /* 'k-widget */ 'kj-keyboard';
const TTL = 350; // Above double-click threshold of 300ms

/**
 * Keyboard
 * @class Keyboard
 * @extends Widget
 */
const Keyboard = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
        this._audioSetup();
        this._render();
        this.enable(this.options.enabled);
    },

    /**
     * Bind
     * @param eventName
     * @param handlers
     * @param one
     */
    bind(eventName, handlers, one) {
        const isClick =
            eventName === CONSTANTS.CLICK ||
            (Array.isArray(eventName) &&
                eventName.indexOf(CONSTANTS.CLICK) > -1);
        // Remove default handler when binding a click
        if (isClick && $.isFunction(this._clickHandler)) {
            this.unbind(CONSTANTS.CLICK, this._clickHandler);
            this._clickHandler = undefined;
        }
        // Bind widget events
        Widget.fn.bind.call(this, eventName, handlers, one);
        // If there is no click event bound, bind default handler
        if (!Array.isArray(this._events[CONSTANTS.CLICK])) {
            this._clickHandler = this._defaultClick.bind(this);
            Widget.fn.bind.call(this, 'click', this._clickHandler);
        }
    },

    /**
     * Options
     * @property options
     */
    options: {
        name: 'Keyboard',
        enabled: true,
        filter: 'input, textarea',
        showOn: 'focus',
        hideOn: 'blur',
        layout: [],
        vibrate: true,
        sound: 'widgets.keyboard.wav'
    },

    /**
     * Events
     */
    events: [CONSTANTS.CLICK],

    /**
     * Setups the audio for typing sounds
     * @private
     */
    _audioSetup() {
        if ($.type(this.options.sound) === CONSTANTS.STRING && Audio) {
            this.sound = new Audio(this.options.sound);
        }
    },

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const { element } = this;
        assert.ok(
            element.is(CONSTANTS.DIV),
            'Please use a div tag to instantiate a Keyboard widget.'
        );
        this.wrapper = element;
        element.addClass(WIDGET_CLASS);
        element.height(0).hide();
        this.refresh();
    },

    /**
     * Refresh
     */
    refresh() {
        const that = this;
        const { element, options } = that;
        const dfd = Array.isArray(options.layout)
            ? // eslint-disable-next-line prettier/prettier
            $.Deferred().resolve(options.layout).promise()
            : $.getJSON(options.layout);
        return dfd
            .then(layout => {
                // Cache layout so that we won't have to fetch it for next refresh
                options.layout = layout;
                // Destroy tabstrip
                if (that.tabStrip instanceof TabStrip) {
                    that.tabStrip.destroy();
                }
                element.empty();
                if (Array.isArray(layout)) {
                    const $tabstrip = $(`<${CONSTANTS.DIV}/>`)
                        .addClass('kj-keyboard-tabstrip')
                        .appendTo(element);
                    const $ul = $(`<${CONSTANTS.UL}/>`).appendTo($tabstrip);
                    layout.forEach((tab, idx) => {
                        $(`<${CONSTANTS.LI}/>`)
                            .text(tab.name)
                            .appendTo($ul);
                        const $tab = $(`<${CONSTANTS.DIV}/>`)
                            .addClass('kj-keyboard-tab')
                            .appendTo(element);
                        if (Array.isArray(tab.pads) && tab.pads.length) {
                            tab.pads.forEach(pad => {
                                const $pad = $(`<${CONSTANTS.DIV}/>`)
                                    .addClass('kj-keyboard-pad')
                                    .attr('style', pad.style)
                                    .css('display', idx ? 'none' : 'flex')
                                    .appendTo($tab);
                                if (
                                    Array.isArray(pad.rows) &&
                                    pad.rows.length
                                ) {
                                    pad.rows.forEach(row => {
                                        const $row = $(`<${CONSTANTS.DIV}/>`)
                                            .addClass('kj-keyboard-row')
                                            .attr('style', row.style)
                                            .appendTo($pad);
                                        if (
                                            Array.isArray(row.keys) &&
                                            row.keys.length
                                        ) {
                                            row.keys.forEach(key => {
                                                $(`<${CONSTANTS.A}/>`)
                                                    .addClass(
                                                        'k-button kj-keyboard-button'
                                                    )
                                                    .attr(
                                                        attr(CONSTANTS.ACTION),
                                                        key.action
                                                    )
                                                    .attr('style', key.style)
                                                    .text(key.text)
                                                    .appendTo($row);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    that.tabStrip = $tabstrip
                        .kendoTabStrip()
                        .data('kendoTabStrip');
                }
                logger.debug({
                    method: 'refresh',
                    message: 'widget refreshed'
                });
            })
            .catch((xhr, status, errorThrown) => {
                // TODO Display error in keuboard
            });
    },

    /**
     * enable/disable
     * @method enable
     * @param enable
     * @private
     */
    enable(enable) {
        const {
            element,
            options: { filter, hideOn, showOn }
        } = this;
        const enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        $(document)
            .off(applyEventMap(hideOn, NS.substr(1)))
            .off(applyEventMap(showOn, NS.substr(1)));
        element.off(`${CONSTANTS.CLICK}${NS}`);
        if (enabled) {
            $(document)
                .on(
                    applyEventMap(hideOn, NS.substr(1)),
                    filter,
                    this._onKeyboardToggle.bind(this, false)
                )
                .on(
                    applyEventMap(showOn, NS.substr(1)),
                    filter,
                    this._onKeyboardToggle.bind(this, true)
                );
            element.on(
                `${CONSTANTS.CLICK}${NS}`,
                '.kj-keyboard-button',
                this._onClick.bind(this)
            );
        }
    },

    /**
     * Event handler triggered when showOn/hideOn events are triggered on jQuery elements designated in filter
     * @param enabled
     * @param e
     * @private
     */
    _onKeyboardToggle(enabled, e) {
        assert.type(
            CONSTANTS.BOOLEAN,
            enabled,
            assert.format(
                assert.messages.type.default,
                'enabled',
                CONSTANTS.BOOLEAN
            )
        );
        assert.instanceof(
            $.Event,
            e,
            assert.format(assert.messages.instanceof.default, 'e', '$.Event')
        );
        // IMPORTANT! Without setTimeout, the click event does not occur
        const change = !$(e.currentTarget).is(this._activeTarget);
        this._activeTarget = $(e.currentTarget);
        const { element, _activeTarget } = this;
        /*
        console.log('_onKeyboardToggle', {
            change,
            enabled,
            clickInProgress: (this._clickInProgress || []).length,
            activeTarget: e.currentTarget.tagName,
            activeElement: $(document.activeElement)[0].tagName
        });
         */
        if (enabled) {
            if (change || element.height() === 0) {
                setTimeout(() => {
                    // SHOW the keyboard!
                    fx(element)
                        .expand('vertical')
                        .stop()
                        .play()
                        .then(() => {
                            this._clickInProgress = [];
                        });
                }, TTL); // Give enough time for the click event to reset the focus
            }
        } else if (
            !Array.isArray(this._clickInProgress) ||
            this._clickInProgress.length === 0
        ) {
            // Hide the keyboard, unless we are still focusing on the same element
            // after refocusing in click event handler
            setTimeout(() => {
                if (
                    (!Array.isArray(this._clickInProgress) ||
                        this._clickInProgress.length === 0) &&
                    !$(document.activeElement).is(_activeTarget)
                ) {
                    // HIDE the keyboard!
                    fx(element)
                        .expand('vertical')
                        .stop()
                        .reverse()
                        .then(() => {
                            this._activeTarget = undefined;
                        });
                }
            }, TTL); // Give enough time for the click event to reset the focus
        }
    },

    /**
     * Event handler triggered when clicking a button from the keyboard
     * @param e
     * @private
     */
    _onClick(e) {
        assert.instanceof(
            $.Event,
            e,
            assert.format(assert.messages.instanceof.default, 'e', '$.Event')
        );
        // Record click in progress for _onKeyboardToggle
        this._clickInProgress.push(e);
        setTimeout(() => {
            const index = this._clickInProgress.indexOf(e);
            this._clickInProgress.splice(index, 1);
        }, TTL);
        // play sound (optional)
        if (this.sound && $.isFunction(this.sound.play)) {
            this.sound.play();
        }
        // vibrate (optional)
        if (
            this.options.vibrate &&
            navigator &&
            $.isFunction(navigator.vibrate)
        ) {
            navigator.vibrate(TTL);
        }
        // Execute action (send click event with action)
        const action = $(e.currentTarget).attr(attr('action'));
        this.trigger(CONSTANTS.CLICK, {
            // Note: activeTarget is the element that receives the actions
            activeTarget: this._activeTarget,
            action
        });
        // Focus back to the active target
        if (this._activeTarget && $.isFunction(this._activeTarget.focus)) {
            this._activeTarget.focus();
        }
    },

    /**
     * Default click handler for the widget (see bind method)
     * @param e
     * @private
     */
    _defaultClick(e) {
        assert.isPlainObject(
            e,
            assert.format(assert.messages.isPlainObject.default, 'e')
        );
        const { activeTarget, action } = e;
        if (activeTarget instanceof $ && $.isFunction(activeTarget.val)) {
            activeTarget.val(activeTarget.val() + action);
        }
    },

    /**
     * Destroy
     * @method destroy
     */
    destroy() {
        this.enable(false);
        Widget.fn.destroy.call(this);
        destroy(this.element);
        logger.debug({ method: 'destroy', message: 'widget destroyed' });
    }
});

/**
 * Registration
 */
if (!Object.prototype.hasOwnProperty.call(window.kendo.ui, 'Keyboard')) {
    // Prevents loading several times in karma
    plugin(Keyboard);
}
