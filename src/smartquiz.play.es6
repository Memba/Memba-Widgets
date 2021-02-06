/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.appbar';
import 'kendo.grid';
import 'kendo.toolbar';
import CONSTANTS from './js/common/window.constants.es6';
import './js/cultures/all.en.es6';
import './js/widgets/widgets.markdown.es6';
import './js/widgets/widgets.playbar.es6';
import './js/widgets/widgets.stage.es6';
import LocalStream from './smartquiz.data.es6';

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
    isFirstPage$() {
        const { pages } = this.stream;
        const p = this.get('selectedPage');
        return p && pages ? pages.indexOf(p) === 0 : true;
    },
    isLastPage$() {
        const { pages } = this.stream;
        const p = this.get('selectedPage');
        return p && pages ? pages.indexOf(p) === pages.total() - 1 : true;
    },
    previousPage() {
        const { pages } = this.stream;
        const p = this.get('selectedPage');
        const i = pages.indexOf(p);
        this.set('selectedPage', pages.at(i - 1));
    },
    nextPage() {
        const { pages } = this.stream;
        const p = this.get('selectedPage');
        const i = pages.indexOf(p);
        this.set('selectedPage', pages.at(i + 1));
    },
    compute() {
        return viewModel.test
            .grade()
            .then(() => {
                const stage = $(roleSelector('stage')).data('kendoStage');
                stage.mode(stage.modes.review);
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
            const stage = $(roleSelector('stage')).data('kendoStage');
            if (stage instanceof Stage) {
                stage.style(style);
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
    const $stage = $(roleSelector('stage'));
    const stage = $stage.data('kendoStage');
    if (stage instanceof Stage) {
        const wrapper = $stage.closest('.wrapper');
        const width = wrapper.width();
        const height = wrapper.height();
        const k = 0.9;
        const scale = Math.min((k * width) / 1024, (k * height) / 768);
        stage.scale(scale);
        $stage.closest('.centered')
            .width(scale * $stage.outerWidth())
            .height(scale * $stage.outerHeight());
        // .css('position', 'absolute')
        // .css('top', '50%')
        // .css('left', '50%')
        // .css('margin-left', `-${(scale * $stage.outerWidth()) / 2}px`)
        // .css('margin-top', `-${(scale * $stage.outerHeight()) / 2}px`);
    }
}
$(window).on('resize', throttle(onResize, 50));

/**
 * Page ready
 */
$(() => {
    $(roleSelector('appbar')).kendoAppBar({
        positionMode: 'sticky',
        position: 'top',
        themeColor: 'dark',
        items: [
            { template: '<a class="k-button" href="\\#"><span class="k-icon k-i-menu"></span></a>', type: 'contentItem' },
            { width: 5, type: 'spacer' },
            // { template: '<img src="./styles/images/KdjLogoBB.png" alt="Kidoju Logo" style="margin: -0.5rem 0;">', type: 'contentItem' },
            { template: '<h2 style="padding: 0; margin: 0; font-weight: bolder;">Eduthon</h2>', type: 'contentItem' },
        ]
    });

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
            const playerWrapper = $('#player-wrapper');
            const scoreWrapper = $('#score-wrapper');
            if (e.id === 'submit') {
                viewModel.compute().then(() => {
                    playerWrapper.css('display', 'none');
                    scoreWrapper.css('display', 'block');
                });
                this.enable('#submit', false);
                this.enable('#review', true);
            } else if (e.id === 'score') {
                this.enable('#score', false);
                this.enable('#review', true);
                playerWrapper.css('display', 'none');
                scoreWrapper.css('display', 'block');
            } else if (e.id === 'review') {
                this.hide('#submit');
                this.show('#score');
                this.enable('#score', true);
                this.enable('#review', false);
                const $stage = $(roleSelector('stage'));
                const stage = $stage.data('kendoStage');
                if (stage instanceof Stage) {
                    stage.mode('review');
                    stage.enable(false);
                }
                playerWrapper.css('display', 'flex');
                $('#instructions').css('display', 'none');
                $('#explanations').css('display', 'block')
                    .parent().children('h2').text('Explanations');
                scoreWrapper.css('display', 'none');
            } else if (e.id === 'design') {
                window.location.assign('smartquiz.design.html');
            }
        },
    });

    viewModel.stream.load().then(() => {
        const TestModel = viewModel.stream.getTestModel();
        viewModel.set('selectedPage', viewModel.stream.pages.at(0));
        viewModel.set('test', new TestModel());
        bind('body', viewModel, ui, mobile.ui, dataviz.ui);
        onResize();

        // hide loading
        $('.k-overlay.k-loading').hide();
    });
});
