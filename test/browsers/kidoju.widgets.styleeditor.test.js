/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';


    /**
     *
     *
     * TODO : DESPERATELY INCOMPLETE
     *
     *
     *
     */


    var expect = window.chai.expect,
        sinon = window.sinon,
        kendo = window.kendo,
        ui = kendo.ui,
        StyleEditor = ui.StyleEditor,
        FIXTURES = '#fixtures',
        STYLEEDITOR1 = '<div id="styleeditor1"></div>',
        STYLEEDITOR2 = '<div id="styleeditor2" data-role="styleeditor"></div>';


    describe('kidoju.widgets.styleeditor', function () {

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
                expect($.fn.kendoStyleEditor).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(STYLEEDITOR1).appendTo(FIXTURES),
                    styleEditor = element.kendoStyleEditor({}).data('kendoStyleEditor');
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-styleeditor')).to.be.true;
                expect(element.hasClass('k-grid')).to.be.true;
                // TODO Check toolbar with New Style and Delete buttons
                // TODO Check grid
            });

            it('from code with options', function () {
                var element = $(STYLEEDITOR1).appendTo(FIXTURES),
                    styleEditor = element.kendoStyleEditor({}).data('kendoStyleEditor');
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-styleeditor')).to.be.true;
                expect(element.hasClass('k-grid')).to.be.true;
                // TODO Check toolbar with New Style and Delete buttons
                // TODO Check grid
            });

            it('from markup', function () {
                var element = $(STYLEEDITOR2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var styleEditor = element.data('kendoStyleEditor');
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-styleeditor')).to.be.true;
                expect(element.hasClass('k-grid')).to.be.true;
                // TODO Check toolbar with New Style and Delete buttons
                // TODO Check grid
            });

        });

        describe('Methods', function () {

            var element, styleEditor;

            beforeEach(function () {
                element = $(STYLEEDITOR1).appendTo(FIXTURES);
                styleEditor = element.kendoStyleEditor({}).data('kendoStyleEditor');
            });

            it('Set/Get the current tool with valid values', function () {
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
            });

            it('Set/Get the current tool with invalid values', function () {
                /*
                function fn1() {
                    styleEditor.tool(0);
                }
                function fn2() {
                    styleEditor.tool('dummy');
                }
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
                expect(fn1).to.throw(TypeError);
                expect(fn2).to.throw(RangeError);
                */
            });

            it('Reset', function () {
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
            });

        });

        describe('MVVM', function () {

            var element, styleEditor;

            beforeEach(function () {
                element = $(STYLEEDITOR1).appendTo(FIXTURES);
                styleEditor = element.kendoStyleEditor({}).data('kendoStyleEditor');
            });

            it('A change of tool raises a change in the styleEditor', function () {
                expect(styleEditor).to.be.an.instanceof(StyleEditor);
            });

        });

        describe('UI Interactions', function () {

            //TODO

        });

        describe('Events', function () {

            var element, styleEditor;

            beforeEach(function () {
                element = $(STYLEEDITOR1).appendTo(FIXTURES);
                styleEditor = element.kendoStyleEditor({}).data('kendoStyleEditor');
            });

            it('Change event', function () {
                // var change = sinon.spy();
                // expect(styleEditor).to.be.an.instanceof(StyleEditor);

                // expect(change).to.have.been.calledWith('label');
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
