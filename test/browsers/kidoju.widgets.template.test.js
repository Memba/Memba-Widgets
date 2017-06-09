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
    var DataSource = kendo.data.DataSource;
    var Template = ui.Template;
    var FIXTURES = '#fixtures';
    var TEMPLATE1 = '<div id="template1"></div>';
    var TEMPLATE2 = '<div id="template2" data-role="template"></div>';
    var SCRIPT1 = '<script id="script1" type="text/x-kendo-template"><div style="color: red;">#: data #</div></script>';
    var SCRIPT2 = '<script id="script2" type="text/x-kendo-template"><div style="color: blue;">#: data.name #</div></script>';

    describe('kidoju.widgets.template', function () {

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
                expect($.fn.kendoTemplate).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(TEMPLATE1).appendTo(FIXTURES);
                var template = element.kendoTemplate().data('kendoTemplate');
                expect(template).to.be.an.instanceof(Template);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-template');
                expect(template).to.have.property('dataSource').that.is.an.instanceof(DataSource);
            });

            it('from code with options', function () {
                $(SCRIPT1).appendTo(FIXTURES);
                var element = $(TEMPLATE1).appendTo(FIXTURES);
                var options = {
                    template: 'script1',
                    value: 'Todd'
                };
                var template = element.kendoTemplate(options).data('kendoTemplate');
                expect(template).to.be.an.instanceof(Template);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-template');
                expect(template).to.have.property('dataSource').that.is.an.instanceof(DataSource);
            });

            it('from code with options and dataSource', function () {
                $(SCRIPT2).appendTo(FIXTURES);
                var element = $(TEMPLATE1).appendTo(FIXTURES);
                var options = {
                    template: 'script2',
                    value: 2,
                    valueField: 'id',
                    dataSource: [
                        { id: 1, name: 'London' },
                        { id: 2, name: 'New York' },
                        { id: 3, name: 'Paris' }
                    ]
                };
                var template = element.kendoTemplate(options).data('kendoTemplate');
                expect(template).to.be.an.instanceof(Template);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-template');
                expect(template.element).to.be.an.instanceof($);
                expect(template.wrapper).to.be.an.instanceof($);
                expect(template.options.template).to.equal(options.template);
                expect(template.options.value).to.equal(options.value);
                expect(template.options.valueField).to.equal(options.valueField);
                expect(template).to.have.property('dataSource').that.is.an.instanceof(DataSource);
                expect(element.text()).to.include(template.dataSource.get(options.value).name);
            });

            it('from markup', function () {
                var element = $(TEMPLATE2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var template = element.data('kendoTemplate');
                expect(template).to.be.an.instanceof(Template);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-template');
                expect(template).to.have.property('dataSource').that.is.an.instanceof(DataSource);
            });

            it('from markup with attributes', function () {
                $(SCRIPT1).appendTo(FIXTURES);
                var attributes = {
                    'data-template': 'script1',
                    'data-value': 'Todd'
                };
                var element = $(TEMPLATE2).attr(attributes).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var template = element.data('kendoTemplate');
                expect(template).to.be.an.instanceof(Template);
                // expect(element).to.have.class('k-widget');
                expect(element).to.have.class('kj-template');
                expect(template.element).to.be.an.instanceof($);
                expect(template.wrapper).to.be.an.instanceof($);
                expect(template.options.template).to.be.a('function');
                expect(template.options.value).to.equal(attributes['data-value']);
                expect(template).to.have.property('dataSource').that.is.an.instanceof(DataSource);
                expect(element.text()).to.include(attributes['data-value']);
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
            var template;
            var options = {};

            beforeEach(function () {
                element = $(TEMPLATE1).appendTo(FIXTURES);
                template = element.kendoTemplate(options).data('kendoTemplate');
            });

            xit('value', function (done) {
                expect(template).to.be.an.instanceof(Template);
            });

            xit('setOptions', function () {
                // TODO especially regarding filters (to be enforced)
            });

            xit('destroy', function () {
                expect(template).to.be.an.instanceof(Template);
                template.destroy();
                expect(template.element).to.be.empty;
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
            var template;
            var options = {};
            var viewModel;
            var change;
            var destroy;

            beforeEach(function () {
                element = $(TEMPLATE1).appendTo(FIXTURES);
                template = element.kendoTemplate(options).data('kendoTemplate');
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
            var template;
            var options = {};
            var event;

            beforeEach(function () {
                element = $(TEMPLATE1).appendTo(FIXTURES);
                template = element.kendoTemplate(options).data('kendoTemplate');
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
