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
    var MarkEditor = ui.MarkEditor;
    var FIXTURES = '#fixtures';
    var MARKEDITOR1 = '<div id="markeditor1"></div>';
    var MARKEDITOR2 = '<div id="markeditor2" data-role="markeditor"></div>';

    describe('kidoju.widgets.markeditor', function () {

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
                expect($.fn.kendoMarkEditor).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(MARKEDITOR1).appendTo(FIXTURES);
                var markEditor = element.kendoMarkEditor().data('kendoMarkEditor');
                expect(markEditor).to.be.an.instanceof(MarkEditor);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-markeditor');
            });

            it('from code with options', function () {
                var element = $(MARKEDITOR1).appendTo(FIXTURES);
                var options = {

                };
                var markEditor = element.kendoMarkEditor().data('kendoMarkEditor');
                expect(markEditor).to.be.an.instanceof(MarkEditor);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-markeditor');
            });

            it('from markup', function () {
                var element = $(MARKEDITOR2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var markEditor = element.data('kendoMarkEditor');
                expect(markEditor).to.be.an.instanceof(MarkEditor);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-markeditor');
            });

            xit('from markup with attributes', function () {

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
            var markEditor;
            var options = {};

            beforeEach(function () {
                element = $(MARKEDITOR1).appendTo(FIXTURES);
                markEditor = element.kendoMarkEditor(options).data('kendoMarkEditor');
            });

            xit('value', function (done) {
                expect(markEditor).to.be.an.instanceof(MarkEditor);
            });

            xit('setOptions', function () {

            });

            xit('destroy', function () {
                expect(markEditor).to.be.an.instanceof(MarkEditor);
                markEditor.destroy();
                expect(markEditor.element).to.be.empty;
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
            var markEditor;
            var options = {};
            var viewModel;
            var change;
            var destroy;

            beforeEach(function () {
                element = $(MARKEDITOR1).appendTo(FIXTURES);
                markEditor = element.kendoMarkEditor(options).data('kendoMarkEditor');
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
            var markEditor;
            var options = {};
            var event;

            beforeEach(function () {
                element = $(MARKEDITOR1).appendTo(FIXTURES);
                markEditor = element.kendoMarkEditor(options).data('kendoMarkEditor');
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
