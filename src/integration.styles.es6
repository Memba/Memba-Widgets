/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import './js/widgets/widgets.explorer.es6';
import './js/widgets/widgets.formatstrip.es6';
import './js/widgets/widgets.styleeditor.es6';
import PageComponentDataSource from './js/data/datasources.pagecomponent.es6';
import './js/app/app.tools.es6';
import tools from './js/tools/tools.es6';

const {
    bind,
    guid,
    observable,
    ui: { PropertyGrid }
} = window.kendo;

// TODO explorer
// TODO tabstrip
// TODO styleeditor
