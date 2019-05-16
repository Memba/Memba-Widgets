/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';

import './js/widgets/widgets.explorer.es6';
import './js/widgets/widgets.propertygrid.es6';
import { PageComponentDataSource } from './js/data/data.pagecomponent.es6';
import tools from './js/tools/tools.es6';

// Load tools and data
import './js/app/app.tools.es6';
import { getComponentArray } from './js/helpers/helpers.data.es6';

const {
    bind,
    observable,
    ui: { PropertyGrid }
} = window.kendo;

// Data source and viewModel
const data = getComponentArray();
const pageComponentDataSource = new PageComponentDataSource({ data });
const viewModel = observable({
    items: pageComponentDataSource,
    current: null
});

// Change binding
viewModel.bind('change', e => {
    if (e.field === 'current') {
        const grid1 = $('#grid1').data('kendoPropertyGrid');
        const grid2 = $('#grid2').data('kendoPropertyGrid');
        const tool = tools[e.sender.current.tool];
        const rows1 = tool.getAttributeRows();
        const rows2 = tool.getPropertyRows();
        if (grid1 instanceof PropertyGrid) {
            grid1.rows(rows1);
        }
        if (grid2 instanceof PropertyGrid) {
            grid2.rows(rows2);
        }
    }
});

// Page ready
$(() => {
    bind('body', viewModel);
    pageComponentDataSource.fetch().then(() => {
        viewModel.set('current', pageComponentDataSource.at(1));
    });
});
