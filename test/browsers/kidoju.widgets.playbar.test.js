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
        PLAYBAR1 = '<div></div>',
        PLAYBAR2 = '<div data-role="playbar" data-bind="source: pages, value: current"></div>';

    var pageCollectionData1 = [
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

    var pageCollectionData2 = [];
    for (var i = 0; i < 30; i++) {
        pageCollectionData2.push({ id: kendo.guid(), components: [] });
    }

    describe('kidoju.widgets.playbar', function() {

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
                expect($.fn.kendoPlayBar).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function() {

            it('from code with all options', function() {
                var element = $(PLAYBAR1).appendTo(FIXTURES);
                var playbar = element.kendoPlayBar({
                    input: true
                }).data('kendoPlayBar');
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(playbar.dataSource.total()).to.equal(0);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-playbar');
                expect(element.find('a.k-pager-nav')).to.be.an.instanceof($).with.property('length', 5);
                expect(element.find('ul>li')).to.be.an.instanceof($).with.property('length', 1);
                expect(element.find('span.k-pager-input>input')).to.be.an.instanceof($).with.property('length', 1);
                expect(element.find('a.k-pager-refresh')).to.be.an.instanceof($).with.property('length', 1);
                expect(element.find('span.k-pager-info')).to.be.an.instanceof($).with.property('length', 1);
            });

            it('from code with minimal options', function() {
                var element = $(PLAYBAR1).appendTo(FIXTURES);
                var playbar = element.kendoPlayBar({
                    numeric: false,
                    info: false,
                    input: false,
                    previousNext: false,
                    tick: false,
                    refresh: false
                }).data('kendoPlayBar');
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(playbar.dataSource.total()).to.equal(0);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-playbar');
                expect(element.find('a.k-pager-nav')).to.be.an.instanceof($).with.property('length', 0);
                expect(element.find('ul>li')).to.be.an.instanceof($).with.property('length', 0);
                expect(element.find('span.k-pager-input>input')).to.be.an.instanceof($).with.property('length', 0);
                expect(element.find('a.k-pager-refresh')).to.be.an.instanceof($).with.property('length', 0);
                expect(element.find('span.k-pager-info')).to.be.an.instanceof($).with.property('length', 0);
                expect(element).to.be.empty;
            });

            it('from code with dataSource', function() {
                var element = $(PLAYBAR1).appendTo(FIXTURES);
                var playbar = element.kendoPlayBar({
                    dataSource: pageCollectionData1
                }).data('kendoPlayBar');
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(playbar.dataSource.total()).to.equal(pageCollectionData1.length);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-playbar');
                expect(element.find('a.k-pager-nav')).to.be.an.instanceof($).with.property('length', 5);
                expect(element.find('ul>li')).to.be.an.instanceof($).with.property('length', pageCollectionData1.length);
                expect(element.find('span.k-pager-input>input')).to.be.an.instanceof($).with.property('length', 0);
                expect(element.find('a.k-pager-refresh')).to.be.an.instanceof($).with.property('length', 1);
                expect(element.find('span.k-pager-info')).to.be.an.instanceof($).with.property('length', 1);
            });

            it('from code with large dataSource and options.buttonCount', function() {
                var element = $(PLAYBAR1).appendTo(FIXTURES);
                var playbar = element.kendoPlayBar({
                    dataSource: pageCollectionData2
                }).data('kendoPlayBar');
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(playbar.dataSource.total()).to.equal(pageCollectionData2.length);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-playbar');
                expect(element.find('a.k-pager-nav')).to.be.an.instanceof($).with.property('length', 5);
                expect(element.find('ul>li')).to.be.an.instanceof($).with.property('length', playbar.options.buttonCount + 1);
                expect(element.find('span.k-pager-input>input')).to.be.an.instanceof($).with.property('length', 0);
                expect(element.find('a.k-pager-refresh')).to.be.an.instanceof($).with.property('length', 1);
                expect(element.find('span.k-pager-info')).to.be.an.instanceof($).with.property('length', 1);
            });

            it('from markup', function() {
                var viewModel = kendo.observable({
                        pages: new kidoju.PageCollectionDataSource({ data: pageCollectionData1 }),
                        current: undefined
                    }),
                    element =  $(PLAYBAR2).appendTo(FIXTURES);
                kendo.bind(FIXTURES, viewModel);
                var playbar = element.data('kendoPlayBar');
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(playbar.dataSource.total()).to.equal(pageCollectionData1.length);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-playbar');
                expect(element.find('a.k-pager-nav')).to.be.an.instanceof($).with.property('length', 5);
                expect(element.find('ul>li')).to.be.an.instanceof($).with.property('length', pageCollectionData1.length);
                expect(element.find('span.k-pager-input>input')).to.be.an.instanceof($).with.property('length', 0);
                expect(element.find('a.k-pager-refresh')).to.be.an.instanceof($).with.property('length', 1);
                expect(element.find('span.k-pager-info')).to.be.an.instanceof($).with.property('length', 1);
            });
        });

        describe('Methods', function() {

            var element, playbar;

            beforeEach(function() {
                element = $(PLAYBAR1).appendTo(FIXTURES);
                playbar = element.kendoPlayBar({
                    dataSource: pageCollectionData1
                }).data('kendoPlayBar');
            });

            it('length', function() {
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(playbar.length()).to.equal(pageCollectionData1.length);
            });

            /*
            it('items', function() {
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                var items = playbar.items();
                expect(items).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData1.length);
                var check = sinon.spy();
                $.each(items, function (index, item) {
                    check();
                    expect($(item)).to.match('div');
                    expect($(item)).to.have.class('kj-item');
                });
                expect(check).to.have.callCount(pageCollectionData1.length);
            });
            */

            it('value', function() {
                var fn = function() {
                    playbar.value(0);
                };
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(fn).to.throw(TypeError);
                for (var idx = 0; idx < pageCollectionData1.length; idx++) {
                    var page = playbar.dataSource.at(idx);
                    playbar.value(page);
                    expect(playbar.index()).to.equal(idx);
                    expect(playbar.id()).to.equal(page.id);
                }
            });

            it('index', function() {
                var fn1 = function() {
                    playbar.index('not a number');
                };
                var fn2 = function() {
                    playbar.index(300); //not in range
                };
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(fn1).to.throw(TypeError);
                expect(fn2).to.throw(RangeError);
                for (var idx = 0; idx < pageCollectionData1.length; idx++) {
                    var page = playbar.dataSource.at(idx);
                    playbar.index(idx);
                    expect(playbar.value()).to.equal(page);
                    expect(playbar.id()).to.equal(page.id);
                }
            });

            it('id', function() {
                var fn = function() {
                    playbar.id({});
                };
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(fn).to.throw(TypeError);
                for (var idx = 0; idx < pageCollectionData1.length; idx++) {
                    var page = playbar.dataSource.at(idx);
                    playbar.id(page.id);
                    expect(playbar.value()).to.equal(page);
                    expect(playbar.index()).to.equal(idx);
                }
            });

            // TODO refresh
            // TODO: sorting.....................

        });

        describe('MVVM', function() {

            var element, playbar, viewModel;

            /*
             //For obscure reasons, setting the viewModel here does not work
             viewModel = kendo.observable({
             pages: new kidoju.PageCollectionDataSource({ data: pageCollectionData }),
             current: undefined
             });
             */

            beforeEach(function() {
                element = $(PLAYBAR2).appendTo(FIXTURES);
                viewModel = kendo.observable({
                    pages: new kidoju.PageCollectionDataSource({ data: pageCollectionData1 }),
                    current: undefined
                });
                kendo.bind(FIXTURES, viewModel);
                playbar = element.data('kendoPlayBar');
            });

            it('Adding a page to the viewModel adds the corresponding item to the playbar', function() {
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(playbar.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData1.length);
                viewModel.pages.add(new kidoju.Page({
                    id: kendo.guid(),
                    style: 'font-family: Georgia, serif; color: #FF0000;'
                }));
                expect(playbar.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData1.length + 1);
            });

            it('Removing a page from the viewModel removes the corresponding item from the playbar', function() {
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(playbar.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData1.length);
                viewModel.pages.remove(viewModel.pages.at(0));
                expect(playbar.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData1.length - 1);
            });

            // Note: Since kendo.ui.PlayBar is a collection of kendo.ui.Stage, we are assuming that
            // if kendo.ui.Stage properly handles a change of page content, kendo.ui.PlayBar also properly handles a change of page content

            it('Changing the selected page in the viewModel changes the corresponding item in the playbar', function() {
                //TODO: also test binding on id and index?
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(playbar.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageCollectionData1.length);
                var check = sinon.spy();
                $.each(viewModel.pages.data(), function(index, page) {
                    check();
                    viewModel.set('current', page);
                    expect($(playbar.items()[index]).find('span')).to.have.class('k-state-selected');
                });
                expect(check).to.have.callCount(pageCollectionData1.length);
            });

            it('Changing the selected page by clicking a number in the playbar, changes the corresponding page in the viewModel', function() {
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                var check = sinon.spy();
                /*
                //For whatever reason , second click does not work
                $.each(element.find('ul.k-pager-numbers>li>a.k-link'), function(index, item) {
                    check();
                    $(item).simulate('click');
                    expect(playbar.dataSource.indexOf(viewModel.get('current'))).to.equal(parseInt($(item).attr(kendo.attr('index')), 10));
                });
                expect(check).to.have.callCount(pageCollectionData1.length - 1);
                */
                var items = element.find('ul.k-pager-numbers>li>a.k-link');
                //$(items[0]).simulate('click');
                $(items[1]).simulate('click');
                expect(playbar.dataSource.indexOf(viewModel.get('current'))).to.equal(parseInt($(items[1]).attr(kendo.attr('index')), 10));
            });

            //TODO: first
            //TODO: previous
            //TODO: more...
            //TODO: next
            //TODO: last
            //TODO: input
            //TODO: refresh button

        });

        describe('Events', function() {

            var element, playbar;

            beforeEach(function() {
                element = $(PLAYBAR1).appendTo(FIXTURES);
            });

            it('dataBinding & dataBound', function() {
                var dataBinding = sinon.spy(),
                    dataBound = sinon.spy();
                playbar = element.kendoPlayBar({
                    dataSource: pageCollectionData2,
                    dataBinding: function(e) {
                        dataBinding(e.sender);
                    },
                    dataBound: function(e) {
                        dataBound(e.sender);
                    }
                }).data('kendoPlayBar');
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(dataBinding).to.have.been.calledOnce;
                expect(dataBinding).to.have.been.calledWith(playbar);
                expect(dataBound).to.have.been.calledOnce;
                expect(dataBound).to.have.been.calledWith(playbar);
                expect(dataBinding).to.have.been.calledBefore(dataBound);
            });

            it('change', function() {
                var change = sinon.spy();
                playbar = element.kendoPlayBar({
                    dataSource: pageCollectionData1,
                    change: function(e) {
                        change(e.value);
                    }
                }).data('kendoPlayBar');
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                expect(playbar.dataSource.data()).to.be.an.instanceof(kendo.data.ObservableArray).with.property('length', pageCollectionData1.length);
                var page = playbar.dataSource.at(1);
                expect(page).to.be.an.instanceof(kidoju.Page);
                playbar.value(page);
                expect(change).to.have.been.calledOnce;
                expect(change).to.have.been.calledWith(page);
            });

            it('click', function() {
                var click = sinon.spy();
                playbar = element.kendoPlayBar({
                    dataSource: pageCollectionData1,
                    click: function(e) {
                        click();
                    }
                }).data('kendoPlayBar');
                expect(playbar).to.be.an.instanceof(kendo.ui.PlayBar);
                expect(playbar.dataSource).to.be.an.instanceof(kidoju.PageCollectionDataSource);
                element.find('a.k-pager-tick').simulate('click');
                expect(click).to.have.been.calledOnce;
            });

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
