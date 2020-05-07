/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import 'kendo.binder';
import 'kendo.panelbar';
import 'kendo.slider';
import 'kendo.splitter';
import 'kendo.toolbar';
import './js/cultures/all.en.es6';
// import CONSTANTS from './js/common/window.constants.es6';
import { Page } from './js/data/data.page.es6';
import StyleAdapter from './js/tools/adapters.style.es6';
import tools from './js/tools/tools.es6';
import { BaseTool } from './js/tools/tools.base.es6';
import './js/widgets/widgets.explorer.es6';
import './js/widgets/widgets.formatstrip.es6';
import './js/widgets/widgets.markeditor.es6';
import './js/widgets/widgets.navigation.es6';
import './js/widgets/widgets.propertygrid.es6';
import './js/widgets/widgets.stage.es6';
import './js/widgets/widgets.toolbox.es6';
import LocalStream from './integration.data.es6';

const { location } = window;
const {
    bind,
    dataviz,
    data: { Model },
    mobile,
    observable,
    roleSelector,
    ui,
    ui: { Navigation, PropertyGrid, Stage },
} = window.kendo;

const Settings = Model.define({
    fields: {
        snapAngle: {
            type: 'number',
        },
        snapGrid: {
            type: 'number',
        },
        style: {
            type: 'string',
        },
    },
});

const $centerPane = $('#center-pane');
const $rightPane = $('#right-pane');
const $grid1 = $('#attributes');
const $grid2 = $('#properties');

/**
 * viewModel
 */
const viewModel = observable({
    stream: new LocalStream(),
    selectedPage: undefined,
    selectedComponent: undefined,
    settings: new Settings(),
});

// Bind change event to map rows
viewModel.bind('change', (e) => {
    // debugger;
    if (e.field === 'selectedPage') {
        e.sender.set('selectedComponent', undefined);
        e.sender.set('settings.style', e.sender.get('selectedPage.style'));
    } else if (e.field === 'selectedComponent') {
        const tool = tools(e.sender.get('selectedComponent.tool'));
        if (tool instanceof BaseTool) {
            const grid1 = $grid1.data('kendoPropertyGrid');
            const grid2 = $grid2.data('kendoPropertyGrid');
            if (grid1 instanceof PropertyGrid) {
                grid1.rows(tool.getAttributeRows());
            }
            if (grid2 instanceof PropertyGrid) {
                grid2.rows(tool.getPropertyRows());
            }
        }
    } else if (e.field === 'settings.snapAngle') {
        const stage = $centerPane.find(roleSelector('stage'));
        const stageWidget = stage.data('kendoStage');
        stageWidget.snapAngle(e.sender.get('settings.snapAngle'));
    } else if (e.field === 'settings.snapGrid') {
        const stage = $centerPane.find(roleSelector('stage'));
        const stageWidget = stage.data('kendoStage');
        stageWidget.snapGrid(e.sender.get('settings.snapGrid'));
    } else if (e.field === 'settings.style') {
        const style = e.sender.get('settings.style');
        e.sender.set('selectedPage.style', style);
        setTimeout(() => {
            const stage = $centerPane.find(roleSelector('stage'));
            const stageWidget = stage.data('kendoStage');
            stageWidget.style(style);
        });
    }
});

// Bind set event to ensure property grid changes are passed to viewModel when changing selectedPage or selectedComponent
viewModel.bind('set', (e) => {
    // IMPORTANT: by default changing selectedComponent does not trigger a blur event on the input holding the property grid value being edited if any.
    // So one may edit a component value in a property grid, click another component on stage, the selected component would then change on stage and in the property grid
    // and the value being edited would not have been changed in the view Model. Below is a fix.
    if (e.field === 'selectedComponent') {
        $(document.activeElement).blur();
    }
});

// onResize event handler
function onResize() {
    const navigationWidget = $(roleSelector('navigation')).data(
        'kendoNavigation'
    );

    const stage = $centerPane.find(roleSelector('stage'));

    const stageWidget = stage.data('kendoStage');
    if (navigationWidget instanceof Navigation) {
        navigationWidget.resize();
    }
    if (stageWidget instanceof Stage) {
        const width = $centerPane.width();
        const height = $centerPane.height();
        const scale = Math.min((0.9 * width) / 1024, (0.9 * height) / 768);
        stageWidget.scale(scale);
        $('.centered')
            .width(scale * stage.outerWidth())
            .height(scale * stage.outerHeight());
        /*
            .css('position', 'absolute')
            .css('top', '50%')
            .css('left', '50%')
            .css('margin-left', `-${(scale * stage.outerWidth()) / 2}px`)
            .css('margin-top', `-${(scale * stage.outerHeight()) / 2}px`);
         */
    }
}

// When document is ready...
$(() => {
    // Init toolbar
    $(roleSelector('toolbar')).kendoToolBar({
        items: [
            { id: 'add', type: 'button', text: 'Add Page' },
            { id: 'duplicate', type: 'button', text: 'Duplicate Page' },
            { id: 'delete', type: 'button', text: 'Delete Page' },
            { id: 'save', type: 'button', text: 'Save' },
            { id: 'reset', type: 'button', text: 'Reset' },
            { id: 'play', type: 'button', text: 'Play', primary: true },
        ],
        click(e) {
            let explorer;
            let navigation;
            let page;
            let stage;
            switch (e.id) {
                case 'add':
                    viewModel.stream.pages.add({}); // consider index position
                    break;
                case 'duplicate':
                    navigation = $(roleSelector('navigation')).data(
                        'kendoNavigation'
                    );
                    page = navigation.value();
                    viewModel.stream.pages.add(page.clone()); // consider index position
                    break;
                case 'delete':
                    navigation = $(roleSelector('navigation')).data(
                        'kendoNavigation'
                    );
                    stage = $centerPane
                        .find(roleSelector('stage'))
                        .data('kendoStage');
                    explorer = $rightPane
                        .find(roleSelector('explorer'))
                        .data('kendoExplorer');
                    page = navigation.value();
                    if (page instanceof Page) {
                        viewModel.set('selectedComponent', undefined);
                        viewModel.set('selectedPage', undefined); // This does not trigger source binding on selectedPage.components
                        stage.setDataSource(undefined); // ... so we need to explicitely set the dataSource on the stage
                        explorer.setDataSource(undefined); // ... and on the explorer
                        viewModel.stream.pages.remove(page);
                    }
                    break;
                case 'save':
                    viewModel.stream.save();
                    break;
                case 'reset':
                    LocalStream.reset(true);
                    viewModel.stream.load().then(() => {
                        viewModel.set(
                            'selectedPage',
                            viewModel.stream.pages.at(0)
                        );
                    });
                    break;
                case 'play':
                    location.assign('integration.playmode.html');
                    break;
                default:
                    break;
            }
        },
    });

    // Load stream
    viewModel.stream.load().then(() => {
        viewModel.set('selectedPage', viewModel.stream.pages.at(0));
        bind('body', viewModel, ui, mobile.ui, dataviz.ui);

        // Bind resize events and resize (splitter is not available before kendo.bind)
        $('main')
            .find(roleSelector('splitter'))
            .data('kendoSplitter')
            .bind('resize', onResize);
        $(window).on('resize', onResize);
        onResize();

        // Init settings property grid
        $('#settings')
            .data('kendoPropertyGrid')
            .rows([
                {
                    field: 'snapAngle',
                    title: 'Snap Angle',
                    editor: 'slider',
                    attributes: {
                        min: 0,
                        max: 45,
                        smallStep: 1,
                        largeStep: 5,
                        'data-tick-placement': 'none',
                    },
                },
                {
                    field: 'snapGrid',
                    title: 'Snap Grid',
                    editor: 'slider',
                    attributes: {
                        min: 0,
                        max: 100,
                        smallStep: 1,
                        largeStep: 10,
                        'data-tick-placement': 'none',
                    },
                },
                new StyleAdapter({ title: 'Page Style' }).getRow('style'),
            ]);
    });
});
