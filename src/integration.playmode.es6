/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.data';
import 'kendo.grid';
import 'kendo.toolbar';
import CONSTANTS from './js/common/window.constants.es6';
import './js/cultures/all.en.es6';
import './js/widgets/widgets.playbar.es6';
import './js/widgets/widgets.stage.es6';
import LocalStream from './integration.data.es6';

const {
    bind,
    data: { DataSource },
    dataviz,
    mobile,
    observable,
    roleSelector,
    throttle,
    ui,
    ui: { Stage },
} = window.kendo;

/**
 * viewModel
 */
const viewModel = observable({
    stream: new LocalStream(),
    selectedPage: undefined,
    test: undefined,
    compute() {
        return viewModel.test
            .grade()
            .then(() => {
                const stageWidget = $(roleSelector('stage')).data('kendoStage');
                stageWidget.mode(stageWidget.modes.review);
                const grid = $('div[data-role="grid"]').data('kendoGrid');
                grid.setDataSource(
                    new DataSource({
                        data: viewModel.test.getScoreTable(),
                    })
                );
            })
            .catch((err) => {
                // debugger;
                // app.notification//
            });
    },
});

viewModel.bind(CONSTANTS.CHANGE, (e) => {
    if (e.field === 'selectedPage') {
        const style = e.sender.get('selectedPage.style');
        setTimeout(() => {
            const stage = $('.centered').find(roleSelector('stage'));
            const stageWidget = stage.data('kendoStage');
            if (stageWidget instanceof Stage) {
                stageWidget.style(style);
            }
        }, 0);
    }
});

// For debugging
window.viewModel = viewModel;

/**
 * Resize event handler
 */
function onResize() {
    const stage = $(roleSelector('stage'));
    const stageWidget = stage.data('kendoStage');
    if (stageWidget instanceof Stage) {
        const wrapper = $('#wrapper');
        const width = wrapper.width();
        const height = wrapper.height();
        const k = 0.9;
        const scale = Math.min((k * width) / 1024, (k * height) / 768);
        stageWidget.scale(scale);
        $('.centered')
            .width(scale * stage.outerWidth())
            .height(scale * stage.outerHeight());
        // .css('position', 'absolute')
        // .css('top', '50%')
        // .css('left', '50%')
        // .css('margin-left', `-${(scale * stage.outerWidth()) / 2}px`)
        // .css('margin-top', `-${(scale * stage.outerHeight()) / 2}px`);
    }
}
$(window).on('resize', throttle(onResize, 50));

/**
 * Page ready
 */
$(() => {
    $('#toolbar').kendoToolBar({
        items: [
            {
                template:
                    '<div data-role="playbar" data-bind="source: stream.pages, value: selectedPage" data-refresh="false" data-button-count="5" class="kj-top" style="width:450px;border:none;background:none;" ></div>',
            },
            { type: 'separator' },
            { type: 'button', id: 'submit', text: 'Submit', primary: true },
            { type: 'button', id: 'score', text: 'Score', hidden: true },
            { type: 'button', id: 'review', text: 'Review', enable: false },
            { type: 'separator' },
            { type: 'button', id: 'design', text: 'Design' },
        ],
        click(e) {
            const sections = $('div.centered>div');
            if (e.id === 'submit') {
                viewModel.compute().then(() => {
                    sections.first().css('display', 'none');
                    sections.last().css('display', 'block');
                });
                this.enable('#submit', false);
                this.enable('#review', true);
            } else if (e.id === 'score') {
                this.enable('#score', false);
                this.enable('#review', true);
                sections.first().css('display', 'none');
                sections.last().css('display', 'block');
            } else if (e.id === 'review') {
                this.hide('#submit');
                this.show('#score');
                this.enable('#score', true);
                this.enable('#review', false);
                const stage = $(roleSelector('stage'));
                const stageWidget = stage.data('kendoStage');
                if (stageWidget instanceof Stage) {
                    stageWidget.mode('review');
                    stageWidget.enable(false);
                }
                sections.first().css('display', 'block');
                sections.last().css('display', 'none');
            } else if (e.id === 'design') {
                window.location.assign('integration.designmode.html');
            }
        },
    });

    viewModel.stream.load().then(() => {
        const TestModel = viewModel.stream.getTestModel();
        viewModel.set('selectedPage', viewModel.stream.pages.at(0));
        viewModel.set('test', new TestModel());
        bind('body', viewModel, ui, mobile.ui, dataviz.ui);
        onResize();
    });
});
