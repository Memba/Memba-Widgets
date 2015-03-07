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
        NAVIGATION1 = '<div></div>',
        NAVIGATION2 = '<div data-role="navigation" data-bind="source: pages, selection: current"></div>';

    var pageCollectionData = [
        {
            id: kendo.guid(),
            components: [
                { id: kendo.guid(), tool : 'image', top: 50, left: 370, height: 250, width: 250, rotate: 0, attributes: { src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png' } },
                { id: kendo.guid(), tool : 'label', top: 300, left: 300, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #0000FF;', text: 'Company?' } },
                { id: kendo.guid(), tool : 'textbox', top: 450, left: 350, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield1' } }
            ]
        },
        {
            id: kendo.guid(),
            components: [
                { id: kendo.guid(), tool : 'label', top: 150, left: 280, height: 100, width: 300, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #FF0000;', text: 'Marignan?' } },
                { id: kendo.guid(), tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield2' } }
            ]
        },
        {
            id: kendo.guid(),
            components: [
                { id: kendo.guid(), tool : 'label', top: 120, left: 280, height: 150, width: 400, rotate: 0, attributes: { style: 'font-family: Georgia, serif; color: #00FF00;', text: 'Couleur du cheval blanc d\'Henri IV?' } },
                { id: kendo.guid(), tool : 'textbox', top: 300, left: 330, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield3' } }
            ]
        }
    ];

    describe('kidoju.widgets.navigation', function() {

        before(function() {
            if (window.__karma__ && $(FIXTURES).length === 0) {
                $('body').append('<div id="fixtures"></div>');
            }
        });

        describe('Availability', function() {

            it('requirements', function() {
                expect($).not.to.be.undefined;
                expect(kendo).not.to.be.undefined;
                expect(kendo.version).to.be.a('string');
                expect(kidoju).not.to.be.undefined;
                expect(kidoju.tools).not.to.be.undefined;
                expect(kidoju.Page).not.to.be.undefined;
                expect(kidoju.PageComponent).not.to.be.undefined;
                expect($.fn.kendoStage).to.be.an.instanceof(Function);
                expect($.fn.kendoNavigation).to.be.an.instanceof(Function);
            });

        });

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
                var element = $(NAVIGATION1).appendTo(FIXTURES);
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
                    element = $(NAVIGATION2).appendTo(FIXTURES);
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
                element = $(NAVIGATION1).appendTo(FIXTURES);
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
                var fn = function() {
                    navigation.selection(0);
                };
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(fn).to.throw(TypeError);
                for (var idx = 0; idx < pageCollectionData.length; idx++) {
                    var page = navigation.dataSource.at(idx);
                    navigation.selection(page);
                    expect(navigation.index()).to.equal(idx);
                    expect(navigation.id()).to.equal(page.id);
                }
            });

            it('index', function() {
                var fn1 = function() {
                    navigation.index('not a number');
                };
                var fn2 = function() {
                    navigation.index(300); //not in range
                };
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(fn1).to.throw(TypeError);
                expect(fn2).to.throw(RangeError);
                for (var idx = 0; idx < pageCollectionData.length; idx++) {
                    var page = navigation.dataSource.at(idx);
                    navigation.index(idx);
                    expect(navigation.selection()).to.equal(page);
                    expect(navigation.id()).to.equal(page.id);
                }
            });

            it('id', function() {
                var fn = function() {
                    navigation.id({});
                };
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(fn).to.throw(TypeError);
                for (var idx = 0; idx < pageCollectionData.length; idx++) {
                    var page = navigation.dataSource.at(idx);
                    navigation.id(page.id);
                    expect(navigation.selection()).to.equal(page);
                    expect(navigation.index()).to.equal(idx);
                }
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
