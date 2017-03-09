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
    var CharGrid = ui.CharGrid;
    var FIXTURES = '#fixtures';
    var CHARGRID1 = '<div id="chargrid1"></div>';
    var CHARGRID2 = '<div id="chargrid2" data-role="chargrid"></div>';

    describe('kidoju.widgets.chargrid', function () {

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
                expect($.fn.kendoCharGrid).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(CHARGRID1).appendTo(FIXTURES);
                var charGrid = element.kendoCharGrid().data('kendoCharGrid');
                expect(charGrid).to.be.an.instanceof(CharGrid);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-chargrid');
                // TODO expect(charGrid).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
            });

            it('from code with options', function () {
                var element = $(CHARGRID1).appendTo(FIXTURES);
                var options = {

                };
                var charGrid = element.kendoCharGrid().data('kendoCharGrid');
                expect(charGrid).to.be.an.instanceof(CharGrid);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-chargrid');
            });

            it('from markup', function () {
                var element = $(CHARGRID2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var charGrid = element.data('kendoCharGrid');
                expect(charGrid).to.be.an.instanceof(CharGrid);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-chargrid');
            });

            xit('from markup with attributes', function () {
                // TODO
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
            var charGrid;
            var options = {};

            beforeEach(function () {
                element = $(CHARGRID1).appendTo(FIXTURES);
                charGrid = element.kendoCharGrid(options).data('kendoCharGrid');
            });

            xit('value', function (done) {
                expect(charGrid).to.be.an.instanceof(CharGrid);
            });

            xit('setOptions', function () {
                // TODO
            });

            xit('destroy', function () {
                expect(charGrid).to.be.an.instanceof(CharGrid);
                charGrid.destroy();
                expect(charGrid.element).to.be.empty;
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
            var charGrid;
            var options = {};
            var viewModel;
            var change;
            var destroy;

            beforeEach(function () {
                element = $(CHARGRID1).appendTo(FIXTURES);
                charGrid = element.kendoCharGrid(options).data('kendoCharGrid');
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
            var charGrid;
            var options = {};
            var event;

            beforeEach(function () {
                element = $(CHARGRID1).appendTo(FIXTURES);
                charGrid = element.kendoCharGrid(options).data('kendoCharGrid');
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
