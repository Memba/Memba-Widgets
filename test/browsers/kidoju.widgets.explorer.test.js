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
        EXPLORER3 = '<div data-role="explorer" data-bind="source: components, selection: current" data-icon-path="' + ICON_PATH + '"></div>';

    var pageComponentCollectionData = [
        { id: kendo.guid(), tool : 'image', top: 50, left: 100, height: 250, width: 250, rotate: 45, attributes: { src: 'http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png' } },
        { id: kendo.guid(), tool : 'image', top: 300, left: 300, height: 250, width: 250, rotate: 315, attributes: { src: 'http://4.bp.blogspot.com/_cPxcXn8pqkM/TCoCrLc7mVI/AAAAAAAABF0/8d6paccQU8A/s320/228_facebook.jpg' } },
        { id: kendo.guid(), tool : 'label', top: 250, left: 500, height: 100, width: 300, rotate: 90, attributes: { style: 'font-family: Georgia, serif; color: #FF0000;', text: 'World' } },
        { id: kendo.guid(), tool : 'textbox', top: 20, left: 20, height: 100, width: 300, rotate: 0, attributes: {}, properties: { name: 'textfield3' } }
    ];

    describe('kidoju.widgets.explorer', function() {

        describe('Initialization', function() {

            it('from code without datasource', function() {
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

            it('from code with datasource', function() {
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

            it('from markup', function() {
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

        describe('Methods', function() {

            var element, explorer;

            beforeEach(function() {
                element = $(EXPLORER1).appendTo(FIXTURES);
                explorer = element.kendoExplorer({
                    dataSource: pageComponentCollectionData,
                    iconPath: ICON_PATH
                }).data('kendoExplorer');
            });

            it('length', function() {
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                expect(explorer.length()).to.equal(pageComponentCollectionData.length);
            });

            it('selection', function() {
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                for (var idx = 0; idx < pageComponentCollectionData.length; idx++) {
                    var component = explorer.dataSource.at(idx);
                    explorer.selection(component);
                    expect(explorer.index()).to.equal(idx);
                    expect(explorer.id()).to.equal(component.id);
                }
            });

            it('index', function() {
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                for (var idx = 0; idx < pageComponentCollectionData.length; idx++) {
                    var component = explorer.dataSource.at(idx);
                    explorer.index(idx);
                    expect(explorer.selection()).to.equal(component);
                    expect(explorer.id()).to.equal(component.id);
                }
            });

            it('id', function() {
                expect(explorer).to.be.an.instanceof(kendo.ui.Explorer);
                expect(explorer.dataSource).to.be.an.instanceof(kidoju.PageComponentCollectionDataSource);
                for (var idx = 0; idx < pageComponentCollectionData.length; idx++) {
                    var component = explorer.dataSource.at(idx);
                    explorer.id(component.id);
                    expect(explorer.selection()).to.equal(component);
                    expect(explorer.index()).to.equal(idx);
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
