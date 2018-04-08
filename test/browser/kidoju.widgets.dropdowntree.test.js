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
    var DropDownTree = ui.DropDownTree;
    var FIXTURES = '#fixtures';
    var DROPDOWNTREE1 = '<div id="dropdowntree1"></div>';
    var DROPDOWNTREE2 = '<div id="dropdowntree2" data-role="dropdowntree"></div>';

    describe('kidoju.widgets.dropdowntree', function () {

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
                expect($.fn.kendoDropDownTree).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(DROPDOWNTREE1).appendTo(FIXTURES);
                var charGrid = element.kendoDropDownTree().data('kendoDropDownTree');
                expect(charGrid).to.be.an.instanceof(DropDownTree);
                // expect(element).to.have.class('k-widget');
                // expect(element).to.have.class('kj-dropdowntree');
                // TODO expect(charGrid).to.have.property('dataSource').that.is.an.instanceof(kendo.data.DataSource);
            });

            it('from code with options', function () {
                var element = $(DROPDOWNTREE1).appendTo(FIXTURES);
                var options = {

                };
                var charGrid = element.kendoDropDownTree().data('kendoDropDownTree');
                expect(charGrid).to.be.an.instanceof(DropDownTree);
                // expect(element).to.have.class('k-widget');
                // expect(element).to.have.class('kj-dropdowntree');
            });

            it('from markup', function () {
                var element = $(DROPDOWNTREE2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var charGrid = element.data('kendoDropDownTree');
                expect(charGrid).to.be.an.instanceof(DropDownTree);
                // expect(element).to.have.class('k-widget');
                // expect(element).to.have.class('kj-dropdowntree');
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
                element = $(DROPDOWNTREE1).appendTo(FIXTURES);
                charGrid = element.kendoDropDownTree(options).data('kendoDropDownTree');
            });

            xit('value', function (done) {
                expect(charGrid).to.be.an.instanceof(DropDownTree);
            });

            xit('setOptions', function () {
                // TODO
            });

            xit('destroy', function () {
                expect(charGrid).to.be.an.instanceof(DropDownTree);
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
                element = $(DROPDOWNTREE1).appendTo(FIXTURES);
                charGrid = element.kendoDropDownTree(options).data('kendoDropDownTree');
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
                element = $(DROPDOWNTREE1).appendTo(FIXTURES);
                charGrid = element.kendoDropDownTree(options).data('kendoDropDownTree');
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
