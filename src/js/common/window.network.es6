/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import CONSTANTS from './window.constants.es6';
import { getLocation } from './window.util.es6';

const { Observable } = window.kendo;
const EVENTS = { OFFLINE: 'offline', ONLINE: 'online' };
const GLOBAL = { ERROR: 'ajaxError', SUCCESS: 'ajaxSuccess' };

/*
// OLD CODE: CAN BE REMOVED after checking opportunity to use below
if (
    ('Connection' in window &&
        window.navigator.connection.type === window.Connection.NONE) ||
    (window.device &&
        window.device.platform === 'browser' &&
        !window.navigator.onLine)
) {
    return dfd.resolve(false);
}
*/

/**
 * Network
 * @class Network
 * @see https://github.com/HubSpot/offline/blob/master/js/offline.js
 */
const Network = Observable.extend({
    /**
     * Init
     * @constructor init
     * @param options;
     */
    init(options) {
        Observable.fn.init.call(this, options);
        this._on = window.navigator.onLine;
        this.setOptions(options);
    },

    /**
     * @method setOptions
     * @param options
     */
    setOptions(options = {}) {
        this._ajaxOptions = options.ajax || {};
        this._globalOrigin = getLocation(this._ajaxOptions.url).origin;
        this.global(!!options.global);
        this.enable(options.enabled);
    },

    /**
     * Enable/disable events
     * @param enable
     * @returns {boolean}
     */
    enable(enable) {
        this._enabled =
            $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        if ($.isFunction(this._checkHandler)) {
            $(window).off(
                `${EVENTS.OFFLINE} ${EVENTS.ONLINE}`,
                this._checkHandler
            );
            this._checkHandler = undefined;
        }
        if (this._enabled) {
            this._checkHandler = this.check.bind(this);
            $(window).on(
                `${EVENTS.OFFLINE} ${EVENTS.ONLINE}`,
                this._checkHandler
            );
            // this._checkHandler();
        }
    },

    /**
     * Intercept all ajax requests
     * @see http://api.jquery.com/category/ajax/global-ajax-event-handlers/
     * @method global
     * @param enable
     */
    global(enable) {
        const global = $.type(enable) === CONSTANTS.UNDEFINED ? true : !!enable;
        if ($.isFunction(this._globalHandler)) {
            $(document).off(
                `${GLOBAL.ERROR} ${GLOBAL.SUCCESS}`,
                this._globalHandler
            );
            this._globalHandler = undefined;
        }
        if (global) {
            this._globalHandler = this._onGlobalAjaxResponse.bind(this);
            $(document).on(
                `${GLOBAL.ERROR} ${GLOBAL.SUCCESS}`,
                this._globalHandler
            );
        }
    },

    /**
     * Check network connection
     * @method check
     */
    check() {
        const that = this;
        const dfd = $.Deferred();
        if (this._enabled) {
            $.ajax(that._ajaxOptions)
                .always(that._onAjaxResponse.bind(that))
                .always(() => dfd.resolve(that._on));
        } else {
            dfd.resolve(that._on);
        }
        return dfd.promise();
    },

    /**
     * @method _onAjaxResponse
     * @param a
     * @param b
     * @param c
     * @private
     */
    _onAjaxResponse(a, b, c) {
        // (data, status, xhr) on success
        // (xhr, status, error) on error
        const xhr = $.type(c) === CONSTANTS.STRING ? a : c;
        this._onGlobalAjaxResponse(undefined, xhr);
    },

    /**
     * @method _onGlobalAjaxResponse
     * @see http://api.jquery.com/ajaxerror/
     * @see http://api.jquery.com/ajaxsuccess/
     * @param e
     * @param xhr
     * @param options
     * @private
     */
    _onGlobalAjaxResponse(e, xhr, options) {
        // Only catch global ajax events from the same origin as options.ajax.url
        // Global ajax events have e and options
        /*
        if (e instanceof $.Event) {
            // This is a global ajax event
            // debugger;
        }
        */
        if (
            !(
                e instanceof $.Event &&
                $.isPlainObject(options) &&
                getLocation(options.url).origin !== this._globalOrigin
            )
        ) {
            // Any xhr.status !== 0 is good including http 404
            this._setStatus(xhr.readyState === 4);
        }
    },

    /**
     * Set online status
     * Note: _setStatus can be used to simulate/test network connection state
     * - First disable events using network.enable(false)
     * - Then force connections state using network._setStatus(state);
     * @method _setStatus
     * @param on
     * @private
     */
    _setStatus(on) {
        const prev = this._on;
        this._on = on;
        if (this._on !== prev) {
            this.trigger(this._on ? EVENTS.ONLINE : EVENTS.OFFLINE);
        }
    },

    /**
     * Return online status
     * @method isOnline
     */
    isOnline() {
        return this._on;
    },

    /**
     * Return offline status
     * @method isOffline
     */
    isOffline() {
        return !this._on;
    },
});

/**
 * Default export
 */
export default Network;
