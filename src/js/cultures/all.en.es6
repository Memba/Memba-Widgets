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

import data from './data.en.es6';
import dialogs from './dialogs.en.es6';
import editors from './editors.en.es6';
import libraries from './libraries.en.es6';
import tools from './tools.en.es6';

// Widgets use Kendo UI globalization
import './widgets.en.es6';

const res = {
    data,
    dialogs,
    editors,
    libraries,
    tools
};

const { i18n } = app;
i18n.en = i18n.en || {};
$.extend(true, i18n.en, res);
