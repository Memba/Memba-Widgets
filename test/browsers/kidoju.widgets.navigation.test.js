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
        NAVIGATION1 = '<div></div>',
        NAVIGATION2 = '<div data-role="navigation" data-bind="source: pages, value: current"></div>';

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

            it('items', function() {
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                var items = navigation.items();
                expect(items).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData.length);
                var check = sinon.spy();
                $.each(items, function (index, item) {
                    check();
                    expect($(item)).to.match('div');
                    expect($(item)).to.have.class('kj-item');
                });
                expect(check).to.have.callCount(pageCollectionData.length);
            });

            it('value', function() {
                var fn = function() {
                    navigation.value(0);
                };
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(fn).to.throw(TypeError);
                for (var idx = 0; idx < pageCollectionData.length; idx++) {
                    var page = navigation.dataSource.at(idx);
                    navigation.value(page);
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
                    expect(navigation.value()).to.equal(page);
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
                    expect(navigation.value()).to.equal(page);
                    expect(navigation.index()).to.equal(idx);
                }
            });

            // TODO height
            // TODO width
            // TODO refresh
            // TODO: sorting.....................

        });

        describe('MVVM', function() {

            var element, navigation, viewModel;

            /*
            //For obscure reasons, setting the viewModel here does not work
            viewModel = kendo.observable({
                pages: new kidoju.PageCollectionDataSource({ data: pageCollectionData }),
                current: undefined
            });
            */

            beforeEach(function() {
                element = $(NAVIGATION2).appendTo(FIXTURES);
                viewModel = kendo.observable({
                    pages: new kidoju.PageCollectionDataSource({ data: pageCollectionData }),
                    current: undefined
                });
                kendo.bind(FIXTURES, viewModel);
                navigation = element.data('kendoNavigation');
            });

            it('Adding a page to the viewModel adds the corresponding item to the navigation', function() {
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(navigation.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData.length);
                viewModel.pages.add(new kidoju.Page({
                    id: kendo.guid(),
                    style: 'font-family: Georgia, serif; color: #FF0000;'
                }));
                expect(navigation.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData.length + 1);
            });

            it('Removing a page from the viewModel removes the corresponding item from the navigation', function() {
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(navigation.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData.length);
                viewModel.pages.remove(viewModel.pages.at(0));
                expect(navigation.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData.length - 1);
            });

            // Note: Since kendo.ui.Navigation is a collection of kendo.ui.Stage, we are assuming that
            // if kendo.ui.Stage properly handles a change of page content, kendo.ui.Navigation also properly handles a change of page content

            it('Changing the selected page in the viewModel changes the corresponding item in the navigation', function() {
                //TODO: also test binding on id and index?
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(navigation.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData.length);
                var check = sinon.spy();
                $.each(viewModel.pages.data(), function(index, page) {
                    check();
                    viewModel.set('current', page);
                    expect(navigation.element.find(kendo.format('[{0}="{1}"]', kendo.attr('uid'), page.uid))).to.have.class('k-state-selected');
                });
                expect(check).to.have.callCount(pageCollectionData.length);
            });

            it('Changing the selected page in the navigation, changes the corresponding page in the viewModel', function() {
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                var check = sinon.spy();
                $.each(navigation.element.find('div.kj-item'), function(index, item) {
                    check();
                    $(item).simulate('click');
                    expect(viewModel.get('current')).to.have.property('uid', $(item).attr(kendo.attr('uid')));
                });
                expect(check).to.have.callCount(pageCollectionData.length);
            });

        });

        describe('Events', function() {

            var element, navigation;

            beforeEach(function() {
                element = $(NAVIGATION1).appendTo(FIXTURES);
            });

            it('dataBinding & dataBound', function() {
                var dataBinding = sinon.spy(),
                    dataBound = sinon.spy();
                navigation = element.kendoNavigation({
                    dataSource: pageCollectionData,
                    dataBinding: function(e) {
                        dataBinding(e.sender);
                    },
                    dataBound: function(e) {
                        dataBound(e.sender);
                    }
                }).data('kendoNavigation');
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(dataBinding).to.have.been.calledOnce;
                expect(dataBinding).to.have.been.calledWith(navigation);
                expect(dataBound).to.have.been.calledOnce;
                expect(dataBound).to.have.been.calledWith(navigation);
                expect(dataBinding).to.have.been.calledBefore(dataBound);
            });

            it('change', function() {
                var change = sinon.spy();
                navigation = element.kendoNavigation({
                    dataSource: pageCollectionData,
                    change: function(e) {
                        change(e.value);
                    }
                }).data('kendoNavigation');
                expect(navigation).to.be.an.instanceof(kendo.ui.Navigation);
                expect(navigation.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(navigation.dataSource.data()).to.be.an.instanceof(kendo.data.ObservableArray).with.property('length', pageCollectionData.length);
                var page = navigation.dataSource.at(1);
                expect(page).to.be.an.instanceof(kidoju.Page);
                navigation.value(page);
                expect(change).to.have.been.calledOnce;
                expect(change).to.have.been.calledWith(page);
            });

            //TODO: select event

        });

        afterEach(function() {
            var fixtures = $(FIXTURES);
            kendo.unbind(fixtures);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

}(this, jQuery));
