/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/**
 * This is a helper compatible with SystemJS
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import app from '../common/window.global.es6';
import res from './app.culture.fr.es6';

const { i18n } = app;
i18n.fr = i18n.fr || {};
$.extend(true, i18n.fr, res);
