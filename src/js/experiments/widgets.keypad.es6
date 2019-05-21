/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO See https://github.com/Khan/math-input
// TODO See also https://mathlive.io

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.fx';
import 'kendo.userevents';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';

const {
    applyEventMap,
    attr,
    destroy,
    fx,
    ns,
    ui: { plugin, Widget }
} = window.kendo;

const logger = new Logger('widgets.keypad');
const NS = '.kendoKeyPad';
const WIDGET_CLASS = 'k-widget kj-keypad';

/**
 * KeyPad
 * @class KeyPad
 * @extends Widget
 */
const KeyPad = Widget.extend({
    /**
     * Init
     * @constructor init
     * @param element
     * @param options
     */
    init(element, options = {}) {
        Widget.fn.init.call(this, element, options);
        logger.debug({ method: 'init', message: 'widget initialized' });
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
        name: 'KeyPad',
        enabled: true,
        filter: 'input, textarea',
        showOn: 'focus',
        hideOn: 'blur',
        layout: []
    },

    /**
     * Events
     */
    events: [CONSTANTS.CLICK],

    /**
     * Builds the widget layout
     * @method _render
     * @private
     */
    _render() {
        const { element } = this;
        assert.ok(
            element.is(CONSTANTS.DIV),
            'Please use a div tag to instantiate a KeyPad widget.'
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
        const {
            element,
            options: { layout }
        } = this;
        element.empty();
        let html = '';
        if (Array.isArray(layout)) {
            layout.forEach(keyboard => {
                if (Array.isArray(keyboard.pads) && keyboard.pads.length) {
                    html += '<div class="kj-keypad-board">';
                    keyboard.pads.forEach(pad => {
                        if (Array.isArray(pad)) {
                            html += '<div class="kj-keypad-pad">';
                            pad.forEach(row => {
                                if (Array.isArray(row)) {
                                    html += '<div class="kj-keypad-row">';
                                    row.forEach(button => {
                                        html += `<a class="kj-keypad-button" data-${ns}command="${
                                            button.cmd
                                        }">${button.key}</a>`;
                                    });
                                    html += '</div>';
                                }
                            });
                            html += '</div>';
                        }
                    });
                    html += '</div>';
                }
            });
        }
        element.append(html);
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
                    this._onKeyPadToggle.bind(this, false)
                )
                .on(
                    applyEventMap(showOn, NS.substr(1)),
                    filter,
                    this._onKeyPadToggle.bind(this, true)
                );
            element.on(
                `${CONSTANTS.CLICK}${NS}`,
                '.kj-keypad-button',
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
    _onKeyPadToggle(enabled, e) {
        // IMPORTANT! Without setTimeout, the click event does not occur
        const change = !$(e.currentTarget).is(this._activeTarget);
        this._activeTarget = $(e.currentTarget);
        const { element, _activeTarget } = this;
        const TTL = 350; // Above double-click threshold of 300ms
        /*
        console.log('_onKeyPadToggle', {
            change,
            enabled,
            clickInProgress: this._clickInProgress,
            activeTarget: e.currentTarget.tagName,
            activeElement: $(document.activeElement)[0].tagName
        });
         */
        if (!change && this._clickInProgress > 0) {
            const now = Date.now();
            if (now - this._clickInProgress < TTL) {
                this._clickInProgress = now;
            } else {
                this._clickInProgress = 0;
            }
        } else if (enabled) {
            console.log('show');
            this._clickInProgress = 0;
            if (change || element.height === 0) {
                setTimeout(() => {
                    // SHOW the keypad!
                    fx(element)
                        .expand('vertical')
                        .stop()
                        .play()
                        .then();
                }, TTL); // Give enough time for the click event to reset the focus
            }
        } else {
            console.log('hide');
            // Hide the keypad, unless we are still focusing on the same element
            // after refocusing in click event handler
            setTimeout(() => {
                if (!$(document.activeElement).is(_activeTarget)) {
                    // HIDE the keypad!
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
     * Event handler trigger when clicking a button
     * @param e
     * @private
     */
    _onClick(e) {
        this._clickInProgress = Date.now();
        const command = $(e.currentTarget).attr(attr('command'));
        this.trigger(CONSTANTS.CLICK, {
            // Note: activeTarget is the element that receives the commands
            activeTarget: this._activeTarget,
            command
        });
        this._activeTarget.focus();
    },

    /**
     * Default click handler (see bind method)
     * @param e
     * @private
     */
    _defaultClick(e) {
        const { activeTarget, command } = e;
        if (activeTarget instanceof $ && $.isFunction(activeTarget.val)) {
            activeTarget.val(activeTarget.val() + command);
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
    }
});

/**
 * Registration
 */
plugin(KeyPad);
