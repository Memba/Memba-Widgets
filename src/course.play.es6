/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.appbar'

const {
    bind,
    observable,
    roleSelector
    // ui: { appbar }
} = window.kendo;

const viewModel = observable({});

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
    })

    bind($('main'), viewModel);
});
