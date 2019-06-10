/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import assert from '../common/window.assert.es6';
import CONSTANTS from '../common/window.constants.es6';
import app from '../common/window.global.es6';

const { getter } = window.kendo;
const { i18n } = app;

i18n._default = 'en';
i18n._locale = i18n._default;

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
    // TODO consider fallback from 'en-US' to 'en', then to default
    const ret = getter(id, true)(i18n[i18n._locale] || {});
    return $.type(ret) === CONSTANTS.UNDEFINED ? '' : ret;
}

/**
 * Load a new locale
 * @param locale
 */
__.load = function load(locale) {
    $.noop(locale); // TODO
};

/**
 * Change user locale
 * @param locale
 */
__.setLocale = function setLocale(locale) {
    $.noop(locale); // TODO
};

/**
 * Get user locale
 */
__.getLocale = function getLocale() {
    return i18n._locale;
};

/**
 * Default export
 */
export default __;
