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
        STAGE2 = '<div id="stage2"></div>',
        STAGE3 = '<div data-role="stage"></div>';

    var pageComponentCollectionData = [
        { id: kendo.guid(), tool : 'image', top: 50, left: 100, height: 250, width: 250, rotate: 45, attributes: { src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png' } },
        { id: kendo.guid(), tool : 'image', top: 300, left: 300, height: 250, width: 250, rotate: 315, attributes: { src: 'http://4.bp.blogspot.com/_cPxcXn8pqkM/TCoCrLc7mVI/AAAAAAAABF0/8d6paccQU8A/s320/228_facebook.jpg' } },
        { id: kendo.guid(), tool : 'label', top: 250, left: 500, height: 100, width: 300, rotate: 90, attributes: { style: 'font-family: Georgia, serif; color: #FF0000;', text: 'World' } },
        { id: kendo.guid(), tool : 'textbox', top: 20, left: 20, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield3' } }
    ];


    describe('kidoju.widgets.stage', function() {

        describe('Initialization', function() {

            it('from code', function() {
                var element = $(STAGE1).appendTo(FIXTURES),
                    stage = element.kendoStage().data('kendoStage');
                expect(stage).to.be.an.instanceof(kendo.ui.Stage);
                expect(stage.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(stage.dataSource.total()).to.equal(0);
                expect(element.parent()).to.have.class('k-widget');
                expect(element.parent()).to.have.class('kj-stage');
                expect(element.parent()).to.have.descendants('div[data-role="stage"]');
                expect(element.parent()).to.have.descendants('div.kj-overlay');
            });

            it('from code with dataSource', function() {
                var element = $(STAGE1).appendTo(FIXTURES),
                    stage = element.kendoStage({
                        mode: kendo.ui.Stage.fn.modes.thumbnail,
                        dataSource: new kidoju.PageComponentCollectionDataSource()
                    }).data('kendoStage');
                expect(stage).to.be.an.instanceof(kendo.ui.Stage);
                expect(stage.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);

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
