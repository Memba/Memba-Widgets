/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import app from '../common/window.global.es6';

const { i18n } = app;
const res = {
    editors: {}
};

/**
 * Load into i18n to make it easier to use with our widgets
 */
i18n.en = i18n.en || {};
$.extend(true, i18n.en, res);

/**
 * Default export for loader
 */
export default res;
