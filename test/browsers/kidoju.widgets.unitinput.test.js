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
    var UnitInput = ui.UnitInput;
    var FIXTURES = '#fixtures';
    var UNITINPUT1 = '<input id="unitinput1">';
    var UNITINPUT2 = '<input id="unitinput2" data-role="unitinput">';

    describe('kidoju.widgets.unitinput', function () {

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
                expect($.fn.kendoUnitInput).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(UNITINPUT1).appendTo(FIXTURES);
                var unitInput = element.kendoUnitInput().data('kendoUnitInput');
                expect(unitInput).to.be.an.instanceof(UnitInput);
                // expect(element).to.have.class('k-widget');
                // expect(element).to.have.class('kj-unitinput');
                expect(unitInput.wrapper).to.have.class('kj-unitinput');
            });

            it('from code with options', function () {
                var element = $(UNITINPUT1).appendTo(FIXTURES);
                var options = {
                    units: ['%', 'px'],
                    nonUnits: ['auto', 'inherit', 'initial']
                };
                var unitInput = element.kendoUnitInput(options).data('kendoUnitInput');
                expect(unitInput).to.be.an.instanceof(UnitInput);
                // expect(element).to.have.class('k-widget');
                // expect(element).to.have.class('kj-unitinput');
                expect(unitInput.wrapper).to.have.class('kj-unitinput');
            });

            it('from markup', function () {
                var element = $(UNITINPUT2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var unitInput = element.data('kendoUnitInput');
                expect(unitInput).to.be.an.instanceof(UnitInput);
                // expect(element).to.have.class('k-widget');
                // expect(element).to.have.class('kj-unitinput');
                expect(unitInput.wrapper).to.have.class('kj-unitinput');
            });

            xit('from markup with attributes', function () {
                // TODO: AssetManager might be a bit complex to initialize with attributes...
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
            var unitInput;
            var options = {};

            beforeEach(function () {
                element = $(UNITINPUT1).appendTo(FIXTURES);
                unitInput = element.kendoUnitInput(options).data('kendoUnitInput');
            });

            xit('value', function (done) {
                expect(unitInput).to.be.an.instanceof(UnitInput);
            });

            xit('setOptions', function () {
                // TODO especially regarding filters (to be enforced)
            });

            xit('destroy', function () {
                expect(unitInput).to.be.an.instanceof(UnitInput);
                unitInput.destroy();
                expect(unitInput.element).to.be.empty;
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
            var unitInput;
            var options = {};
            var viewModel;
            var change;
            var destroy;

            beforeEach(function () {
                element = $(UNITINPUT1).appendTo(FIXTURES);
                unitInput = element.kendoUnitInput(options).data('kendoUnitInput');
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
            var unitInput;
            var options = {};
            var event;

            beforeEach(function () {
                element = $(UNITINPUT1).appendTo(FIXTURES);
                unitInput = element.kendoUnitInput(options).data('kendoUnitInput');
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
