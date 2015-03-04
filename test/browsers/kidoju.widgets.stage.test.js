/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect,
        sinon = window.sinon,
        kendo = window.kendo,
        kidoju = window.kidoju,
        FIXTURES = '#fixtures',
        STAGE1 = '<div id="stage1"></div>',
        STAGE2 = '<div data-role="stage"></div>';

    describe('kidoju.widgets.stage', function() {

        describe('Initialization', function() {

            it('from code with empty dataSource', function() {
                var element = $(STAGE1).appendTo(FIXTURES),
                    stage1 = element.kendoStage({
                        mode: kendo.ui.Stage.fn.modes.thumbnail,
                        dataSource: new kidoju.PageComponentCollectionDataSource()
                    }).data('kendoStage');
                expect(stage1).to.be.an.instanceof(kendo.ui.Stage);
            });

            it('from markup', function() {
                $.noop();
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
