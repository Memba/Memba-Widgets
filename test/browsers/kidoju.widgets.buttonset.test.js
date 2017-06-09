/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kendo = window.kendo;
    var ui = kendo.ui;
    var DataSource = kendo.data.DataSource;
    var ButtonSet = ui.ButtonSet;
    var FIXTURES = '#fixtures';
    var BUTTONSET1 = '<input id="buttonset1">';
    var BUTTONSET2 = '<input data-role="buttonset">';

    describe('kidoju.widgets.buttonset', function () {

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
                expect($.fn.kendoButtonSet).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(BUTTONSET1).appendTo(FIXTURES);
                var buttonset = element.kendoButtonSet().data('kendoButtonSet');
                expect(buttonset).to.be.an.instanceof(ButtonSet);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-buttonset');
                expect(buttonset).to.have.property('dataSource').that.is.an.instanceof(DataSource);
            });

            it('from code with options', function () {
                var element = $(BUTTONSET1).appendTo(FIXTURES);
                var options = {
                    buttonset: 'script1',
                    value: 'Todd'
                };
                var buttonset = element.kendoButtonSet(options).data('kendoButtonSet');
                expect(buttonset).to.be.an.instanceof(ButtonSet);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-buttonset');
                expect(buttonset).to.have.property('dataSource').that.is.an.instanceof(DataSource);
            });

            it('from code with options and dataSource', function () {
                var element = $(BUTTONSET1).appendTo(FIXTURES);
                var options = {
                    buttonset: 'script2',
                    value: 2,
                    valueField: 'id',
                    dataSource: [
                        { id: 1, name: 'London' },
                        { id: 2, name: 'New York' },
                        { id: 3, name: 'Paris' }
                    ]
                };
                var buttonset = element.kendoButtonSet(options).data('kendoButtonSet');
                expect(buttonset).to.be.an.instanceof(ButtonSet);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-buttonset');
                expect(buttonset.element).to.be.an.instanceof($);
                expect(buttonset.wrapper).to.be.an.instanceof($);
                expect(buttonset.options.buttonset).to.equal(options.buttonset);
                expect(buttonset.options.value).to.equal(options.value);
                expect(buttonset.options.valueField).to.equal(options.valueField);
                expect(buttonset).to.have.property('dataSource').that.is.an.instanceof(DataSource);
                expect(element.text()).to.include(buttonset.dataSource.get(options.value).name);
            });

            it('from markup', function () {
                var element = $(BUTTONSET2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var buttonset = element.data('kendoButtonSet');
                expect(buttonset).to.be.an.instanceof(ButtonSet);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-buttonset');
                expect(buttonset).to.have.property('dataSource').that.is.an.instanceof(DataSource);
            });

            it('from markup with attributes', function () {
                var attributes = {
                    'data-buttonset': 'script1',
                    'data-value': 'Todd'
                };
                var element = $(BUTTONSET2).attr(attributes).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var buttonset = element.data('kendoButtonSet');
                expect(buttonset).to.be.an.instanceof(ButtonSet);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-buttonset');
                expect(buttonset.element).to.be.an.instanceof($);
                expect(buttonset.wrapper).to.be.an.instanceof($);
                expect(buttonset.options.buttonset).to.be.a('function');
                expect(buttonset.options.value).to.equal(attributes['data-value']);
                expect(buttonset).to.have.property('dataSource').that.is.an.instanceof(DataSource);
                expect(element.text()).to.include(attributes['data-value']);
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('Methods', function () {

            var element;
            var buttonset;
            var options = {};

            beforeEach(function () {
                element = $(BUTTONSET1).appendTo(FIXTURES);
                buttonset = element.kendoButtonSet(options).data('kendoButtonSet');
            });

            xit('value', function (done) {
                expect(buttonset).to.be.an.instanceof(ButtonSet);
            });

            xit('setOptions', function () {
                // TODO especially regarding filters (to be enforced)
            });

            xit('destroy', function () {
                expect(buttonset).to.be.an.instanceof(ButtonSet);
                buttonset.destroy();
                expect(buttonset.element).to.be.empty;
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('MVVM (and UI interactions)', function () {

            var element;
            var buttonset;
            var options = {};
            var viewModel;
            var change;
            var destroy;

            beforeEach(function () {
                element = $(BUTTONSET1).appendTo(FIXTURES);
                buttonset = element.kendoButtonSet(options).data('kendoButtonSet');
                viewModel = kendo.observable({
                    // TODO
                });
                change = sinon.spy();
                destroy = sinon.spy();
            });

            xit('TODO', function () {

            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('Events', function () {

            var element;
            var buttonset;
            var options = {};
            var event;

            beforeEach(function () {
                element = $(BUTTONSET1).appendTo(FIXTURES);
                buttonset = element.kendoButtonSet(options).data('kendoButtonSet');
                event = sinon.spy();
            });

            xit('TODO', function () {

            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });
    });

}(this, jQuery));
