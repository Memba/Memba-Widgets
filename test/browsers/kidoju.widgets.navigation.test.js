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
        NAVIGATION3 = '<div data-role="navigation" data-bind="source: pages, selection: current"></div>';

    var pageCollectionData = [
        {
            id: '29c14ae2-496b-49f5-9551-e0d7e4aa6032',
            components: [
                { id: 'be1935d0-ff0e-4818-a5a8-762127f3b506', tool : 'image', top: 50, left: 370, height: 250, width: 250, rotate: 0, attributes: { src: '//marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png' } },
                { id: 'f2b4179e-3189-401b-bb17-65ceaf62b1eb', tool : 'label', top: 300, left: 300, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #0000FF;', text: 'Company?' } },
                { id: 'c3d46312-07c3-44dc-a1c9-987654949927', tool : 'textbox', top: 450, left: 350, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name : 'textfield1' } }
            ]
        },
        {
            id: 'c0878ced-8e3f-4161-a83a-049caed02d53',
            components: [
                { id: 'c745e385-d409-40d0-a4d7-1b7c14abc2f6', tool : 'label', top: 150, left: 280, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #FF0000;', text: 'Marignan?' } },
                { id: '25bd6088-dc9f-4c9c-a697-be32b8673ba9', tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name : 'textfield2' } }
            ]
        },
        {
            id: '9e3803f8-a91c-408e-bded-d1b86c68723c',
            components: [
                { id: 'f6725a70-20b2-4adf-8b3a-a2d3f84da50d', tool : 'label', top: 120, left: 280, height: 150, width: 400, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #00FF00;', text: 'Couleur du cheval blanc d\'Henri IV?' } },
                { id: '3894e35b-b740-46c8-be24-21f4a3b9c24d', tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name : 'textfield3' } }
            ]
        }
    ];

    describe('kidoju.widgets.navigation', function() {

        describe('Initialization', function() {

            it('from code', function() {
                var element = $(NAVIGATION1).appendTo(FIXTURES);
                var navigation = element.kendoNavigation().data('kendoNavigation');
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(navigation.dataSource.total()).to.equal(0);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-navigation');
                expect(element).to.be.empty;
            });

            it('from code with dataSource', function() {
                var element = $(NAVIGATION2).appendTo(FIXTURES);
                var navigation = element.kendoNavigation({
                    dataSource: pageCollectionData
                }).data('kendoNavigation');
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(navigation.dataSource.data()).to.be.an.instanceof(kendo.data.ObservableArray).with.property('length', pageCollectionData.length);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-navigation');
                expect(element.find('div.kj-item>div.kj-stage')).to.be.an.instanceof($).with.property('length', pageCollectionData.length);
            });

            it('from markup', function() {
                var viewModel = kendo.observable({
                        pages: new kidoju.PageCollectionDataSource({ data: pageCollectionData }),
                        current: undefined
                    }),
                    element = $(NAVIGATION3).appendTo(FIXTURES);
                kendo.bind(FIXTURES, viewModel);
                var navigation = element.data('kendoNavigation');
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(navigation.dataSource.data()).to.be.an.instanceof(kendo.data.ObservableArray).with.property('length', pageCollectionData.length);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-navigation');
                expect(element.find('div.kj-item>div.kj-stage')).to.be.an.instanceof($).with.property('length', pageCollectionData.length);
            });


        });

        describe('Methods', function() {

            var element, navigation;

            beforeEach(function() {
                element = $(NAVIGATION2).appendTo(FIXTURES);
                navigation = element.kendoNavigation({
                    dataSource: pageCollectionData
                }).data('kendoNavigation');
            });

            it('length', function() {
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(navigation.length()).to.equal(pageCollectionData.length);
            });

            it('selection', function() {
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                for (var idx = 0; idx < pageCollectionData.length; idx++) {
                    var page = navigation.dataSource.at(idx);
                    navigation.selection(page);
                    expect(navigation.index()).to.equal(idx);
                    expect(navigation.id()).to.equal(page.id);
                }
            });

            it('index', function() {
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                for (var idx = 0; idx < pageCollectionData.length; idx++) {
                    var page = navigation.dataSource.at(idx);
                    navigation.index(idx);
                    expect(navigation.selection()).to.equal(page);
                    expect(navigation.id()).to.equal(page.id);
                }
            });

            it('id', function() {
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                for (var idx = 0; idx < pageCollectionData.length; idx++) {
                    var page = navigation.dataSource.at(idx);
                    navigation.id(page.id);
                    expect(navigation.selection()).to.equal(page);
                    expect(navigation.index()).to.equal(idx);
                }
            });

            xit('items', function() {
                $.noop();
            });

        });

        describe('MVVM', function() {

            xit('TODO', function() {
                $.noop();
            });

        });

        describe('Events', function() {

            xit('dataBinding & dataBound', function() {
                $.noop();
            });

            xit('Change', function() {
                $.noop();
            });

            xit('Select', function() {
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
