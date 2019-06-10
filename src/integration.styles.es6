/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import './js/cultures/all.en.es6';
import './js/widgets/widgets.explorer.es6';
import './js/widgets/widgets.formatstrip.es6';
import './js/widgets/widgets.styleeditor.es6';
import { PageComponentDataSource } from './js/data/data.pagecomponent.es6';
// import tools from './js/tools/tools.es6';

// Load tools and data
import './js/app/app.tools.es6';
import { getComponentArray } from './js/helpers/helpers.data.es6';

const { bind, observable } = window.kendo;

// Data source and viewModel
const data = getComponentArray();
const pageComponentDataSource = new PageComponentDataSource({ data });
const viewModel = observable({
    items: pageComponentDataSource,
    current: null
});

// Page ready
$(() => {
    bind('body', viewModel);
    pageComponentDataSource.fetch().then(() => {
        viewModel.set('current', pageComponentDataSource.at(1));
    });
});
