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
    var Markdown = ui.Markdown;
    var FIXTURES = '#fixtures';
    var MARKDOWN1 = '<div id="markdown1"></div>';
    var MARKDOWN2 = '<div id="markdown2" data-role="markdown"></div>';

    describe('kidoju.widgets.markdown', function () {

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
                expect($.fn.kendoMarkdown).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(MARKDOWN1).appendTo(FIXTURES);
                var markDown = element.kendoMarkdown().data('kendoMarkdown');
                expect(markDown).to.be.an.instanceof(Markdown);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-markdown');
            });

            it('from code with options', function () {
                var element = $(MARKDOWN1).appendTo(FIXTURES);
                var options = {

                };
                var markDown = element.kendoMarkdown().data('kendoMarkdown');
                expect(markDown).to.be.an.instanceof(Markdown);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-markdown');
            });

            it('from markup', function () {
                var element = $(MARKDOWN2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var markDown = element.data('kendoMarkdown');
                expect(markDown).to.be.an.instanceof(Markdown);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-markdown');
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
            var markDown;
            var options = {};

            beforeEach(function () {
                element = $(MARKDOWN1).appendTo(FIXTURES);
                markDown = element.kendoMarkdown(options).data('kendoMarkdown');
            });

            xit('value', function (done) {
                expect(markDown).to.be.an.instanceof(Markdown);
            });

            xit('setOptions', function () {

            });

            xit('destroy', function () {
                expect(markDown).to.be.an.instanceof(Markdown);
                markDown.destroy();
                expect(markDown.element).to.be.empty;
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
            var markDown;
            var options = {};
            var viewModel;
            var change;
            var destroy;

            beforeEach(function () {
                element = $(MARKDOWN1).appendTo(FIXTURES);
                markDown = element.kendoMarkdown(options).data('kendoMarkdown');
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
            var markDown;
            var options = {};
            var event;

            beforeEach(function () {
                element = $(MARKDOWN1).appendTo(FIXTURES);
                markDown = element.kendoMarkdown(options).data('kendoMarkdown');
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
