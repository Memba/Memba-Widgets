/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO consider fallback from 'en-US' to 'en', then to default

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import Logger from '../common/window.logger.es6';
import app from '../common/window.global.es6';
import config from './app.config.jsx';

const { getter } = window.kendo;
const { i18n } = app;
const logger = new Logger('app.i18n');
const DEFAULT = 'en';

/*
const LANGUAGE = 'language';
let localStorage; // = window.localStorage;
// An exception is catched when localStorage is explicitly disabled in browser settings (Safari Private Browsing)
try {
    ({ localStorage } = window);
    // localStorage.getItem(LANGUAGE);
} catch (ex) {
    // To avoid an empty block and please eslint
    localStorage = undefined;
}
*/

/**
 * Return a localized string from an id
 * @param id
 * @private
 */
function __(id) {
    assert.match(
        /^[\w.]+$/,
        id,
        assert.format(assert.messages.match.default, id, '^[w.]+$')
    );
    const ret = getter(id, true)(i18n[__.locale] || {});
    return $.type(ret) === CONSTANTS.UNDEFINED ? '' : ret;
}

/**
 * Add getter for locale on __
 * Note: we effectively add a getter on a function
 */
Object.defineProperty(__, 'locale', {
    get() {
        // In Kidoju-WebApp, the locale is defined in the html tag
        return (
            document.getElementsByTagName('html')[0].getAttribute('lang') ||
            DEFAULT
        );

        // Kidoju-Mobile
        // Note: cordova-plugin-globalization has method navigator.globalization.getLocaleName
        // but this method is asynchronous, so it is called in onDeviceReady to set LANGUAGE in window.localStorage
        // ret = (localStorage && localStorage.getItem(LANGUAGE)) || DEFAULT;
    },
});

/**
 * Locale setter
 * @param value
 */
/*
set locale(value) {
    assert.type(
        CONSTANTS.STRING,
        value,
        assert.format(
            assert.messages.type.default,
            'value',
            CONSTANTS.STRING
        )
    );
    // Note: assume kendo is not yet loaded
    assert.isArray(
        config.locales,
        assert.format(assert.messages.isArray.default, 'config.locales')
    );
    assert.enum(
        config.locales,
        value,
        assert.format(
            assert.messages.enum.default,
            'value',
            config.locales
        )
    );
    assert.isUndefined(
        window.cordova,
        'This is not the way to change locale in phonegap/cordova'
    );

    const href = config.uris.webapp.locale.replace('{0}', value);
    if (window.top === window.self) {
        window.location.assign(href);
    } else {
        // This is an embedded player
        window.top.location.assign(href);
    }
}
*/

/**
 * Load culture file for locale
 * @param value
 */
__.load = function load(value) {
    const locale = value || __.locale;
    assert.isArray(
        config.locales,
        assert.format(assert.messages.isArray.default, 'config.locales')
    );
    assert.enum(
        config.locales,
        locale,
        assert.format(assert.messages.enum.default, 'locale', config.locales)
    );

    const dfd = $.Deferred();
    if ($.type(i18n[locale]) === CONSTANTS.UNDEFINED) {
        // https://webpack.js.org/api/module-methods#magic-comments
        import(
            /* webpackMode: "lazy" */
            /* webpackChunkName: "[request]" */
            `../cultures/app.culture.${locale}.es6`
        )
            .then((module) => {
                /*
                try {
                    localStorage.setItem(LANGUAGE, locale);
                } catch (exception) {
                    // A QuotaExceededError in raised in private browsing, which we do not care about
                    // @see https://github.com/jlchereau/Kidoju-Webapp/issues/181
                    // @see http://chrisberkhout.com/blog/localstorage-errors/
                    if (
                        !window.DOMException ||
                        !(exception instanceof window.DOMException) ||
                        exception.code !==
                            window.DOMException.QUOTA_EXCEEDED_ERR
                    ) {
                        throw exception;
                    }
                }
                */

                // Load culture
                i18n[locale] = i18n[locale] || {};
                $.extend(true, i18n[locale], module.default);
                // Log readiness
                logger.debug({
                    message: `${locale} locale loaded`,
                    method: 'load',
                });
                dfd.resolve();
            })
            .catch(dfd.reject);
    }
    return dfd.promise();
};

/**
 * Initialization
 */
/*
if ($.type(window.cordova) === CONSTANTS.UNDEFINED) {
    // In Kidoju-WebApp
    $(() => {
        // Load i18n locale
        __.load(__.locale).done(() => {
            // trigger event for localization
            $(document).trigger(CONSTANTS.LOADED);
        });
    });
} else {
    // In Kidoju-Mobile
    // Wait for Cordova to load
    document.addEventListener(
        'deviceready',
        () => {
            if (window.navigator && window.navigator.language) {
                // We have migrated from cordova-plugin-globalization
                // as recommended at https://cordova.apache.org/news/2017/11/20/migrate-from-cordova-globalization-plugin.html
                let locale =
                    __.locale || window.navigator.language.substr(0, 2);
                if (config.locales.indexOf(locale) === -1) {
                    locale = DEFAULT;
                }
                __.load(locale).done(() => {
                    // trigger event for localization
                    $(document).trigger(CONSTANTS.LOADED);
                });
            } else {
                // Without window.navigator.language
                __.load(__.locale || DEFAULT).done(() => {
                    // trigger event for localization
                    $(document).trigger(CONSTANTS.LOADED);
                });
            }
        },
        false
    );
}
*/

/**
 * Default export
 */
export default __;
