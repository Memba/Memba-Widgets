/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import app from '../common/window.global.es6';

import data from './data.fr.es6';
import dialogs from './dialogs.fr.es6';
import editors from './editors.fr.es6';
import libraries from './libraries.fr.es6';
import tools from './tools.fr.es6';

// Widgets use Kendo UI globalization
import './widgets.fr.es6';

const res = {
    data,
    dialogs,
    editors,
    libraries,
    tools
};

const { i18n } = app;
i18n.fr = i18n.fr || {};
$.extend(true, i18n.fr, res);
