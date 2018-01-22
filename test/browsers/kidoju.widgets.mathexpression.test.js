/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kendo = window.kendo;
    var ui = kendo.ui;
    var MathExpression = ui.MathExpression;
    var FIXTURES = '#fixtures';
    var MATHEXPRESSION1 = '<div id="mathexpression1"></div>';
    var MATHEXPRESSION2 = '<div id="mathexpression2" data-role="mathexpression"></div>';

    describe('kidoju.widgets.mathexpression', function () {

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
                expect($.fn.kendoMathExpression).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(MATHEXPRESSION1).appendTo(FIXTURES);
                var dropZone = element.kendoMathExpression().data('kendoMathExpression');
                expect(dropZone).to.be.an.instanceof(MathExpression);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-mathexpression');
                // TODO expect(dropZone).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
            });

            it('from code with options', function () {
                var element = $(MATHEXPRESSION1).appendTo(FIXTURES);
                var options = {

                };
                var dropZone = element.kendoMathExpression().data('kendoMathExpression');
                expect(dropZone).to.be.an.instanceof(MathExpression);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-mathexpression');
                // TODO expect(assetManager).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
            });

            it('from markup', function () {
                var element = $(MATHEXPRESSION2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var dropZone = element.data('kendoMathExpression');
                expect(dropZone).to.be.an.instanceof(MathExpression);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-mathexpression');
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
                element = $(MATHEXPRESSION1).appendTo(FIXTURES);
                dropZone = element.kendoMathExpression(options).data('kendoMathExpression');
            });

            xit('value', function (done) {
                expect(dropZone).to.be.an.instanceof(MathExpression);
            });

            xit('setOptions', function () {
                // TODO especially regarding filters (to be enforced)
            });

            xit('destroy', function () {
                expect(dropZone).to.be.an.instanceof(MathExpression);
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
                element = $(MATHEXPRESSION1).appendTo(FIXTURES);
                dropZone = element.kendoMathExpression(options).data('kendoMathExpression');
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
                element = $(MATHEXPRESSION1).appendTo(FIXTURES);
                dropZone = element.kendoMathExpression(options).data('kendoMathExpression');
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
