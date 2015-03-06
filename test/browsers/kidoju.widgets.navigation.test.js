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
        NAVIGATION1 = '<div id="navigation1"></div>',
        NAVIGATION2 = '<div id="navigation2"></div>',
        NAVIGATION3 = '<div data-role="navigation"></div>';




    describe('kidoju.widgets.navigation', function() {

        describe('Initialization', function() {

            it('from code', function() {
                var element = $(NAVIGATION1).appendTo(FIXTURES);
                var navigation = element.kendoNavigation().data('kendoNavigation');
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-navigation');
            });

            it('from code with dataSource', function() {
                var element = $(NAVIGATION2).appendTo(FIXTURES);
                var navigation = element.kendoNavigation({

                }).data('kendoNavigation');
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-navigation');
            });

            it('from markup', function() {
                var element = $(NAVIGATION3).appendTo(FIXTURES);
            });


        });

        describe('Methods', function() {

            it('TODO', function() {
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
