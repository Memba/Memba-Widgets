/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.dialog';

// import './js/widgets/kidoju.widgets.assetmanager.js';
import './js/widgets/widgets.codeinput.es6';
import './js/widgets/widgets.codeeditor.es6';
import './js/widgets/widgets.explorer.es6';
import './js/widgets/widgets.styleeditor.es6';
import './js/widgets/widgets.propertygrid.es6';

import PageComponentDataSource from './js/data/datasources.pagecomponent.es6';
import './js/app/app.tools.es6';
import tools from './js/tools/tools.es6';

const {
    bind,
    guid,
    observable,
    ui: { PropertyGrid }
} = window.kendo;

// Data source and viewModel
const data = [
    {
        id: guid(),
        tool: 'image',
        top: 50,
        left: 100,
        height: 250,
        width: 250,
        rotate: 45,
        attributes: {
            src:
                'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png'
        }
    },
    {
        id: guid(),
        tool: 'image',
        top: 300,
        left: 300,
        height: 250,
        width: 250,
        rotate: 315,
        attributes: {
            src:
                'http://4.bp.blogspot.com/_cPxcXn8pqkM/TCoCrLc7mVI/AAAAAAAABF0/8d6paccQU8A/s320/228_facebook.jpg'
        }
    },
    {
        id: guid(),
        tool: 'label',
        top: 250,
        left: 500,
        height: 100,
        width: 300,
        rotate: 90,
        attributes: {
            style: 'font-family: Georgia, serif; color: #FF0000;',
            text: 'World'
        }
    },
    {
        id: guid(),
        tool: 'textbox',
        top: 20,
        left: 20,
        height: 100,
        width: 300,
        rotate: 0,
        attributes: {},
        properties: {
            name: 'textfield3'
        }
    }
];
const pageComponentDataSource = new PageComponentDataSource({ data });
const viewModel = observable({
    items: pageComponentDataSource,
    current: null
});
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

// Page ready and bindings
$(() => {
    bind('body', viewModel);
    pageComponentDataSource.fetch().then(() => {
        viewModel.set('current', pageComponentDataSource.at(1));
    });
});
