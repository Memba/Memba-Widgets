/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import './js/cultures/all.en.es6';
import './js/widgets/widgets.explorer.es6';
import './js/widgets/widgets.formatstrip.es6';
import './js/widgets/widgets.styleeditor.es6';
import { PageComponentDataSource } from './js/data/data.pagecomponent.es6';
// import tools from './js/tools/tools.es6';

// Component data
import { componentGenerator, getComponentArray } from './js/helpers/helpers.data.es6';
import tools from './js/tools/tools.es6';

const { bind, observable } = window.kendo;

// Load tools
const promises = Object.keys(componentGenerator).map((tool) => tools.load(tool));
$.when(...promises).then(() => {
    const data = getComponentArray();
    const pageComponentDataSource = new PageComponentDataSource({ data });
    const viewModel = observable({
        items: pageComponentDataSource,
        current: null,
    });

    // Page ready
    $(() => {
        pageComponentDataSource.fetch().then(() => {
            viewModel.set('current', pageComponentDataSource.at(1));
            // We need to set current before binding the viewModel
            // otherwise current.attributes.style is not available to the StyleEditor
            bind('body', viewModel);
        });
    });
});
