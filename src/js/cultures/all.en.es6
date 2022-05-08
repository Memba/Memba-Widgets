/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * This is a helper compatible with SystemJS
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import app from '../common/window.global.es6';
import res from './app.culture.en.es6';

const { i18n } = app;
i18n.en = i18n.en || {};
$.extend(true, i18n.en, res);