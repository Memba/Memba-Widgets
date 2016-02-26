/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kendo = window.kendo;
    var ui = kendo.ui;
    var Markdown = ui.Markdown;
    var CHANGE = 'change';
    var FIXTURES = '#fixtures';
    var MARKDOWN1 = '<div id="markdown1"></div>';
    var MARKDOWN2 = '<div id="markdown2" data-role="mediaplayer"></div>';

    /**
     * HTMLMediaElement is not supported in PhantomJS
     * @see https://github.com/ariya/phantomjs/issues/10839
     */
    if (window.PHANTOMJS) {
        return;
    }

    describe('kidoju.widgets.markdown', function () {

        // TODO

    });

}(this, jQuery));
