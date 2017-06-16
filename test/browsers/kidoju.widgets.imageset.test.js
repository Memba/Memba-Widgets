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
    var ImageSet = ui.ImageSet;
    var FIXTURES = '#fixtures';
    var IMAGESET1 = '<div id="imageset1"></div>';
    var IMAGESET2 = '<div id="imageset2" data-role="imageset"></div>';

    describe('kidoju.widgets.imageset', function () {

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
                expect($.fn.kendoImageSet).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(IMAGESET1).appendTo(FIXTURES);
                var imageset = element.kendoImageSet().data('kendoImageSet');
                expect(imageset).to.be.an.instanceof(ImageSet);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-imageset');
            });

            it('from code with options', function () {
                var element = $(IMAGESET1).appendTo(FIXTURES);
                var options = {
                    imageset: 'script1',
                    value: 'Todd'
                };
                var imageset = element.kendoImageSet(options).data('kendoImageSet');
                expect(imageset).to.be.an.instanceof(ImageSet);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-imageset');
            });

            it('from markup', function () {
                var element = $(IMAGESET2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var imageset = element.data('kendoImageSet');
                expect(imageset).to.be.an.instanceof(ImageSet);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-imageset');
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
            var imageset;
            var options = {};

            beforeEach(function () {
                element = $(IMAGESET1).appendTo(FIXTURES);
                imageset = element.kendoImageSet(options).data('kendoImageSet');
            });

            xit('value', function (done) {
                expect(imageset).to.be.an.instanceof(ImageSet);
            });

            xit('setOptions', function () {
                // TODO especially regarding filters (to be enforced)
            });

            xit('destroy', function () {
                expect(imageset).to.be.an.instanceof(ImageSet);
                imageset.destroy();
                expect(imageset.element).to.be.empty;
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
            var imageset;
            var options = {};
            var viewModel;
            var change;
            var destroy;

            beforeEach(function () {
                element = $(IMAGESET1).appendTo(FIXTURES);
                imageset = element.kendoImageSet(options).data('kendoImageSet');
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
            var imageset;
            var options = {};
            var event;

            beforeEach(function () {
                element = $(IMAGESET1).appendTo(FIXTURES);
                imageset = element.kendoImageSet(options).data('kendoImageSet');
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
