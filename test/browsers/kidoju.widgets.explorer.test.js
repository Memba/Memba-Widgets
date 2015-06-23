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
        ICON_PATH = '../../src/styles/images/',
        EXPLORER1 = '<div id="explorer1"></div>',
        EXPLORER2 = '<div id="explorer2"></div>',
        EXPLORER3 = '<div data-role="explorer" data-bind="source: components, value: current" data-icon-path="' + ICON_PATH + '"></div>';

    var pageComponentCollectionData = [
        { id: kendo.guid(), tool : 'image', top: 50, left: 100, height: 250, width: 250, rotate: 45, attributes: { src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png' } },
        { id: kendo.guid(), tool : 'image', top: 300, left: 300, height: 250, width: 250, rotate: 315, attributes: { src: 'http://4.bp.blogspot.com/_cPxcXn8pqkM/TCoCrLc7mVI/AAAAAAAABF0/8d6paccQU8A/s320/228_facebook.jpg' } },
        { id: kendo.guid(), tool : 'label', top: 250, left: 500, height: 100, width: 300, rotate: 90, attributes: { style: 'font-family: Georgia, serif; color: #FF0000;', text: 'World' } },
        { id: kendo.guid(), tool : 'textbox', top: 20, left: 20, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield3' } }
    ];

    describe('kidoju.widgets.explorer', function () {

        before(function () {
            if (window.__karma__ && $(FIXTURES).length === 0) {
                $('body').append('<div id="fixtures"></div>');
            }
        });

        describe('Availability', function () {

            it('requirements', function () {
                expect($).not.to.be.undefined;
                expect(kendo).not.to.be.undefined;
                expect(kendo.version).to.be.a('string');
                expect(kidoju).not.to.be.undefined;
                expect(kidoju.tools).not.to.be.undefined;
                expect(kidoju.Page).not.to.be.undefined;
                expect(kidoju.PageComponent).not.to.be.undefined;
                expect($.fn.kendoExplorer).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code without datasource', function () {
                var element = $(EXPLORER1).appendTo(FIXTURES),
                    explorer = element.kendoExplorer().data('kendoExplorer');
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(explorer.dataSource.total()).to.equal(0);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-explorer');
                expect(element).to.have.descendants('ul');
                expect(element.find('li')).to.be.an.instanceof($).with.property('length', 0);
            });

            it('from code with datasource', function () {
                var element = $(EXPLORER2).appendTo(FIXTURES),
                    explorer = element.kendoExplorer({
                        dataSource: pageComponentCollectionData,
                        iconPath: ICON_PATH
                    }).data('kendoExplorer');
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(explorer.dataSource.data()).to.be.an.instanceof(kendo.data.ObservableArray).with.property('length', pageComponentCollectionData.length);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-explorer');
                expect(element).to.have.descendants('ul');
                expect(element.find('li')).to.be.an.instanceof($).with.property('length', pageComponentCollectionData.length);
            });

            it('from markup', function () {
                var viewModel = kendo.observable({
                        components: new kidoju.PageComponentCollectionDataSource({ data: pageComponentCollectionData }),
                        current: undefined
                    }),
                    element = $(EXPLORER3).appendTo(FIXTURES);
                kendo.bind(FIXTURES, viewModel);
                var explorer = element.data('kendoExplorer');
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(explorer.dataSource.data()).to.be.an.instanceof(kendo.data.ObservableArray).with.property('length', pageComponentCollectionData.length);
                expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-explorer');
                expect(element).to.have.descendants('ul');
                expect(element.find('li')).to.be.an.instanceof($).with.property('length', pageComponentCollectionData.length);
            });

        });

        describe('Methods', function () {

            var element, explorer;

            beforeEach(function () {
                element = $(EXPLORER1).appendTo(FIXTURES);
                explorer = element.kendoExplorer({
                    dataSource: pageComponentCollectionData,
                    iconPath: ICON_PATH
                }).data('kendoExplorer');
            });

            it('length', function () {
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(explorer.length()).to.equal(pageComponentCollectionData.length);
            });

            it('items', function () {
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                var items = explorer.items();
                expect(items).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageComponentCollectionData.length);
                var check = sinon.spy();
                $.each(items, function (index, item) {
                    check();
                    expect($(item)).to.match('li');
                    expect($(item)).to.have.class('k-item');
                    expect($(item)).to.have.class('kj-item');
                });
                expect(check).to.have.callCount(pageComponentCollectionData.length);
            });

            it('value', function () {
                var fn = function () {
                    explorer.value(0);
                };
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(fn).to.throw(TypeError);
                for (var idx = 0; idx < pageComponentCollectionData.length; idx++) {
                    var component = explorer.dataSource.at(idx);
                    explorer.value(component);
                    expect(explorer.index()).to.equal(idx);
                    expect(explorer.id()).to.equal(component.id);
                }
            });

            it('index', function () {
                var fn1 = function () {
                    explorer.index('not a number');
                };
                var fn2 = function () {
                    explorer.index(300); // not in range
                };
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(fn1).to.throw(TypeError);
                expect(fn2).to.throw(RangeError);
                for (var idx = 0; idx < pageComponentCollectionData.length; idx++) {
                    var component = explorer.dataSource.at(idx);
                    explorer.index(idx);
                    expect(explorer.value()).to.equal(component);
                    expect(explorer.id()).to.equal(component.id);
                }
            });

            it('id', function () {
                var fn = function () {
                    explorer.id({});
                };
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(fn).to.throw(TypeError);
                for (var idx = 0; idx < pageComponentCollectionData.length; idx++) {
                    var component = explorer.dataSource.at(idx);
                    explorer.id(component.id);
                    expect(explorer.value()).to.equal(component);
                    expect(explorer.index()).to.equal(idx);
                }
            });

        });

        describe('MVVM', function () {

            var element, explorer, viewModel;

            /*
             // For obscure reasons, setting the viewModel here does not work
            viewModel = kendo.observable({
                components: new kidoju.PageComponentCollectionDataSource({ data: pageComponentCollectionData }),
                current: null
            });
            */

            beforeEach(function () {
                element = $(EXPLORER3).appendTo(FIXTURES);
                viewModel = kendo.observable({
                    components: new kidoju.PageComponentCollectionDataSource({ data: pageComponentCollectionData }),
                    current: null
                });
                kendo.bind(FIXTURES, viewModel);
                explorer = element.data('kendoExplorer');
            });

            it('Adding a component to the viewModel adds the corresponding item to the explorer', function () {
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(explorer.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageComponentCollectionData.length);
                viewModel.components.add(new kidoju.PageComponent({
                    id: kendo.guid(),
                    tool : 'label',
                    top: 250,
                    left: 500,
                    height: 100,
                    width: 300,
                    rotate: 90,
                    attributes: {
                        style: 'font-family: Georgia, serif; color: #FF0000;',
                        text: 'World'
                    }
                }));
                expect(explorer.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageComponentCollectionData.length + 1);
            });

            it('Removing a component from the viewModel removes the corresponding item from the explorer', function () {
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(explorer.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageComponentCollectionData.length);
                viewModel.components.remove(viewModel.components.at(0));
                expect(explorer.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageComponentCollectionData.length - 1);
            });

            // Currently, there is no point testing a change of component data in the viewModel
            // because the information we display (tool icon + tool id) cannot be changed

            it('Changing the selected component in the viewModel changes the corresponding item in the explorer', function () {
                // TODO: also test binding on id and index?
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(explorer.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', pageComponentCollectionData.length);
                var check = sinon.spy();
                $.each(viewModel.components.data(), function (index, component) {
                    check();
                    viewModel.set('current', component);
                    expect(explorer.element.find(kendo.format('[{0}="{1}"]', kendo.attr('uid'), component.uid))).to.have.class('k-state-selected');
                });
                expect(check).to.have.callCount(pageComponentCollectionData.length);
            });

            it('Changing the selected item in the explorer, changes the corresponding component in the viewModel', function () {
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                var check = sinon.spy();
                $.each(explorer.element.find('li.kj-item'), function (index, item) {
                    check();
                    $(item).simulate('click');
                    expect(viewModel.get('current')).to.have.property('uid', $(item).attr(kendo.attr('uid')));
                });
                expect(check).to.have.callCount(pageComponentCollectionData.length);
            });

        });

        describe('Events', function () {

            var element, explorer;

            beforeEach(function () {
                element = $(EXPLORER1).appendTo(FIXTURES);
            });

            it('dataBinding & dataBound', function () {
                var dataBinding = sinon.spy(),
                    dataBound = sinon.spy();
                explorer = element.kendoExplorer({
                    dataSource: pageComponentCollectionData,
                    iconPath: ICON_PATH,
                    dataBinding: function (e) {
                        dataBinding(e.sender);
                    },
                    dataBound: function (e) {
                        dataBound(e.sender);
                    }
                }).data('kendoExplorer');
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(dataBinding).to.have.been.calledOnce;
                expect(dataBinding).to.have.been.calledWith(explorer);
                expect(dataBound).to.have.been.calledOnce;
                expect(dataBound).to.have.been.calledWith(explorer);
                expect(dataBinding).to.have.been.calledBefore(dataBound);
            });

            it('change', function () {
                var change = sinon.spy();
                explorer = element.kendoExplorer({
                    dataSource: pageComponentCollectionData,
                    iconPath: ICON_PATH,
                    change: function (e) {
                        change(e.value);
                    }
                }).data('kendoExplorer');
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(explorer.dataSource.data()).to.be.an.instanceof(kendo.data.ObservableArray).with.property('length', pageComponentCollectionData.length);
                var component = explorer.dataSource.at(1);
                expect(component).to.be.an.instanceof(kidoju.PageComponent);
                explorer.value(component);
                expect(change).to.have.been.calledOnce;
                expect(change).to.have.been.calledWith(component);
            });

            xit('select', function () {
                $.noop();
            });

        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

}(this, jQuery));
