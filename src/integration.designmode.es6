/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.slider';
import 'kendo.splitter';
import 'kendo.toolbar';
import LocalStream from './integration.data.es6';
import Page from './js/data/models.page.es6';
import tools from './js/tools/tools.es6';
import BaseTool from './js/tools/tools.base.es6';
import './js/widgets/widgets.explorer.es6';
import './js/widgets/widgets.navigation.es6';
import './js/widgets/widgets.stage.es6';

const { location } = window;
const {
    bind,
    dataviz,
    mobile,
    observable,
    roleSelector,
    ui,
    ui: { Navigation, PropertyGrid, Stage }
} = window.kendo;

/**
 * viewModel
 */
const viewModel = observable({
    stream: new LocalStream(),
    selectedPage: undefined,
    selectedComponent: undefined
});

// Bind change event to map rows
viewModel.bind('change', e => {
    if (e.field === 'selectedPage') {
        viewModel.set('selectedComponent', undefined);
    } else if (e.field === 'selectedComponent') {
        const tool = tools[e.sender.get('selectedComponent.tool')];
        if (tool instanceof BaseTool) {
            const grid1 = $('#attributes').data('kendoPropertyGrid');
            const grid2 = $('#properties').data('kendoPropertyGrid');
            if (grid1 instanceof PropertyGrid) {
                grid1.rows(tool._getAttributeRows());
            }
            if (grid2 instanceof PropertyGrid) {
                grid2.rows(tool._getPropertyRows());
            }
        }
    }
});

// Bind set event to ensure property grid changes are passed to viewModel when changing selectedPage or selectedComponent
viewModel.bind('set', e => {
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

    const stage = $('#center-pane').find(roleSelector('stage'));

    const stageWidget = stage.data('kendoStage');
    if (navigationWidget instanceof Navigation) {
        navigationWidget.resize();
    }
    if (stageWidget instanceof Stage) {
        const width = $('#center-pane').width();

        const height = $('#center-pane').height();

        const scale = Math.min((0.9 * width) / 1024, (0.9 * height) / 768);
        stageWidget.scale(scale);
        $('.centered')
            .width(scale * stage.outerWidth())
            .height(scale * stage.outerHeight())
            .css('position', 'absolute')
            .css('top', '50%')
            .css('left', '50%')
            .css('margin-left', `-${(scale * stage.outerWidth()) / 2}px`)
            .css('margin-top', `-${(scale * stage.outerHeight()) / 2}px`);
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
            { id: 'play', type: 'button', text: 'Play', primary: true }
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
                    stage = $('#center-pane')
                        .find(roleSelector('stage'))
                        .data('kendoStage');
                    explorer = $('#right-pane')
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
        }
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

        // Init sliders
        $('#snap-angle')
            .data('kendoSlider')
            .bind('change', e => {
                const stage = $('#center-pane').find(roleSelector('stage'));
                const stageWidget = stage.data('kendoStage');
                stageWidget.snapAngle(e.sender.value());
            });
        $('#snap-grid')
            .data('kendoSlider')
            .bind('change', e => {
                const stage = $('#center-pane').find(roleSelector('stage'));
                const stageWidget = stage.data('kendoStage');
                stageWidget.snapGrid(e.sender.value());
            });
    });
});
