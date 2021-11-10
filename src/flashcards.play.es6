/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.appbar';
import 'kendo.scrollview';
import 'kendo.toolbar'
import stream from './flashcards.data.es6';

const {
    fx,
    resize,
    roleSelector,
    throttle,
    // ui: { appbar }
} = window.kendo;

$(() => {
    $(roleSelector('appbar')).kendoAppBar({
        positionMode: 'sticky',
        position: 'top',
        themeColor: 'dark',
        items: [
            { template: '<a class="k-button" href="\\#"><span class="k-icon k-i-menu"></span></a>', type: 'contentItem' },
            { width: 5, type: 'spacer' },
            { template: '<img src="./styles/images/KdjLogoBB.png" alt="Kidoju Logo" style="margin: -0.5rem 0;">', type: 'contentItem' },
        ]
    });

    $(roleSelector('toolbar')).kendoToolBar({
        items: [
            {
                type: 'button',
                text: 'Design'
            }
        ],
        click(e) {
            location.assign('./flashcards.design.html');
        }
    });

    $(roleSelector('scrollview'))
        .kendoScrollView({
            autoBind: true,
            dataSource: stream.pages,
            enablePager: false,
            // enableNavigationButtons: false,
            template: $('#scrollview-template').html(),
            contentHeight: '100%',
            change: e => {
                // e.preventDefault();
            }
        })
        .on('click', '.c', throttle(function(e) {
            const container = $(e.currentTarget)
            const a = container.children('.a')
            const q = container.children('.q')
            if (q.is(':visible') && a.is(':hidden')) {
                fx(container).flipHorizontal(q, a).duration(1000).stop().play();
            } else if (q.is(':hidden') && a.is(':visible')) {
                fx(container).flipHorizontal(q, a).duration(990).stop().reverse();
            } else {
                fx(container).flipHorizontal(q, a).duration(990).stop();
            }
        }, 1000));

    $(roleSelector('scrollview')).find('.k-scrollview-elements').toggle(!kendo.support.mobileOS);

    $(window).resize(() => {
        resize('body');
    })
});
