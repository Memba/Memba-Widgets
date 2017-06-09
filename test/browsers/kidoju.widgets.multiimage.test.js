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
    var MultiImage = ui.MultiImage;
    var FIXTURES = '#fixtures';
    var MULTIIMAGE1 = '<div id="multiimage1"></div>';
    var MULTIIMAGE2 = '<div id="multiimage2" data-role="multiimage"></div>';

    describe('kidoju.widgets.multiimage', function () {

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
                expect($.fn.kendoMultiImage).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(MULTIIMAGE1).appendTo(FIXTURES);
                var multiimage = element.kendoMultiImage().data('kendoMultiImage');
                expect(multiimage).to.be.an.instanceof(MultiImage);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-multiimage');
            });

            it('from code with options', function () {
                var element = $(MULTIIMAGE1).appendTo(FIXTURES);
                var options = {
                    multiimage: 'script1',
                    value: 'Todd'
                };
                var multiimage = element.kendoMultiImage(options).data('kendoMultiImage');
                expect(multiimage).to.be.an.instanceof(MultiImage);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-multiimage');
            });

            it('from markup', function () {
                var element = $(MULTIIMAGE2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var multiimage = element.data('kendoMultiImage');
                expect(multiimage).to.be.an.instanceof(MultiImage);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-multiimage');
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
            var multiimage;
            var options = {};

            beforeEach(function () {
                element = $(MULTIIMAGE1).appendTo(FIXTURES);
                multiimage = element.kendoMultiImage(options).data('kendoMultiImage');
            });

            xit('value', function (done) {
                expect(multiimage).to.be.an.instanceof(MultiImage);
            });

            xit('setOptions', function () {
                // TODO especially regarding filters (to be enforced)
            });

            xit('destroy', function () {
                expect(multiimage).to.be.an.instanceof(MultiImage);
                multiimage.destroy();
                expect(multiimage.element).to.be.empty;
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
            var multiimage;
            var options = {};
            var viewModel;
            var change;
            var destroy;

            beforeEach(function () {
                element = $(MULTIIMAGE1).appendTo(FIXTURES);
                multiimage = element.kendoMultiImage(options).data('kendoMultiImage');
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
            var multiimage;
            var options = {};
            var event;

            beforeEach(function () {
                element = $(MULTIIMAGE1).appendTo(FIXTURES);
                multiimage = element.kendoMultiImage(options).data('kendoMultiImage');
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
