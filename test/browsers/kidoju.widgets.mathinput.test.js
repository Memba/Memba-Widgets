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
    var MathInput = ui.MathInput;
    var FIXTURES = '#fixtures';
    var TOOLBAR = '<div id="toolbar"></div>';
    var MATHINPUT1 = '<div id="mathinput1"></div>';
    var MATHINPUT2 = '<div id="mathinput2" data-role="mathinput"></div>';

    describe('kidoju.widgets.mathinput', function () {

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
                expect($.fn.kendoMathInput).to.be.an.instanceof(Function);
                // expect($.fn.kendoMathInputToolBar).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(MATHINPUT1).appendTo(FIXTURES);
                var dropZone = element.kendoMathInput().data('kendoMathInput');
                expect(dropZone).to.be.an.instanceof(MathInput);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-mathinput');
                // TODO expect(dropZone).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
            });

            it('from code with options', function () {
                var toolbar = $(TOOLBAR).appendTo(FIXTURES);
                var toolbar = $(TOOLBAR).appendTo(FIXTURES);
                var element = $(MATHINPUT1).appendTo(FIXTURES);
                var options = {

                };
                var dropZone = element.kendoMathInput().data('kendoMathInput');
                expect(dropZone).to.be.an.instanceof(MathInput);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-mathinput');
                // TODO expect(assetManager).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
            });

            it('from markup', function () {
                var element = $(MATHINPUT2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var dropZone = element.data('kendoMathInput');
                expect(dropZone).to.be.an.instanceof(MathInput);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-mathinput');
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
            var dropZone;
            var options = {};

            beforeEach(function () {
                element = $(MATHINPUT1).appendTo(FIXTURES);
                dropZone = element.kendoMathInput(options).data('kendoMathInput');
            });

            xit('value', function (done) {
                expect(dropZone).to.be.an.instanceof(MathInput);
            });

            xit('setOptions', function () {
                // TODO especially regarding filters (to be enforced)
            });

            xit('destroy', function () {
                expect(dropZone).to.be.an.instanceof(MathInput);
                dropZone.destroy();
                expect(dropZone.element).to.be.empty;
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
            var dropZone;
            var options = {};
            var viewModel;
            var change;
            var destroy;

            beforeEach(function () {
                element = $(MATHINPUT1).appendTo(FIXTURES);
                dropZone = element.kendoMathInput(options).data('kendoMathInput');
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
            var dropZone;
            var options = {};
            var event;

            beforeEach(function () {
                element = $(MATHINPUT1).appendTo(FIXTURES);
                dropZone = element.kendoMathInput(options).data('kendoMathInput');
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
