/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect,
        kendo = window.kendo,
        kidoju = window.kidoju,
        FIXTURES = '#fixtures',
        EXPLORER = 'explorer',
        DIV = '<div id="{0}"></div>';


    describe('kidoju.widgets.explorer', function() {



        describe('Initialization', function() {

            it('from code', function() {
                var element = $(kendo.format(DIV, EXPLORER)).appendTo(FIXTURES);
                element.kendoExplorer();

            });

            it('from code with options', function() {
                var element = $(kendo.format(DIV, EXPLORER)).appendTo(FIXTURES);
                element.kendoExplorer();

            });

            it('from markup', function() {
                $.noop();
            });


        });

        describe('MVVM', function() {

            it('TODO', function() {
                $.noop();
            });

        });

        describe('Events', function() {

            it('TODO', function() {
                $.noop();
            });

        });

        afterEach(function() {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

}(this, jQuery));
