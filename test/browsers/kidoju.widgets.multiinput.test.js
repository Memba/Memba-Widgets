/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    var kendo = window.kendo;
    var ui = kendo.ui;
    var MultiInput = ui.MultiInput;
    var CLICK = 'click';
    var FIXTURES = '#fixtures';
    var MULTIINPUT1 = '<input id="multiinput1">';
    var MULTIINPUT2 = '<input id="multiinput2" data-role="multiinput">';

    describe('kidoju.widgets.multiinput', function () {

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
                expect($.fn.kendoMultiInput).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(MULTIINPUT1).appendTo(FIXTURES);
                var multiInput = element.kendoMultiInput().data('kendoMultiInput');
                expect(multiInput).to.be.an.instanceof(MultiInput);
                expect(multiInput).to.have.property('tagList').that.is.an.instanceof($);
                var tagList = multiInput.tagList;
                expect(tagList).to.match('ul');
                expect(tagList).to.be.empty;
                expect(multiInput).to.have.property('wrapper').that.is.an.instanceof($);
                var wrapper = multiInput.wrapper;
                expect(wrapper).to.match('div');
                expect(wrapper).to.have.class('k-widget');
                expect(wrapper).to.have.class('kj-multiinput');
            });

            it('from code with options', function () {
                var element = $(MULTIINPUT1).appendTo(FIXTURES);
                var options = {
                    match: '^[a-z]+$',
                    value: ['alpha', 'beta', 'gamma']
                };
                var multiInput = element.kendoMultiInput(options).data('kendoMultiInput');
                expect(multiInput).to.be.an.instanceof(MultiInput);
                expect(multiInput).to.have.property('tagList').that.is.an.instanceof($);
                var tagList = multiInput.tagList;
                expect(tagList).to.match('ul');
                expect(tagList).to.have.descendants('>li');
                expect(tagList.children('li')).to.be.an.instanceof($).with.property('length', options.value.length);
                // TODO: We could check that each li contains the correct value
                expect(multiInput).to.have.property('wrapper').that.is.an.instanceof($);
                var wrapper = multiInput.wrapper;
                expect(wrapper).to.match('div');
                expect(wrapper).to.have.class('k-widget');
                expect(wrapper).to.have.class('kj-multiinput');
            });

            it('from markup', function () {
                var options = {};
                var element = $(MULTIINPUT2).attr(options).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var multiInput = element.data('kendoMultiInput');
                expect(multiInput).to.be.an.instanceof(MultiInput);
                expect(multiInput).to.have.property('tagList').that.is.an.instanceof($);
                var tagList = multiInput.tagList;
                expect(tagList).to.match('ul');
                expect(tagList).to.be.empty;
                expect(multiInput).to.have.property('wrapper').that.is.an.instanceof($);
                var wrapper = multiInput.wrapper;
                expect(wrapper).to.match('div');
                expect(wrapper).to.have.class('k-widget');
                expect(wrapper).to.have.class('kj-multiinput');
            });

            it('from markup with attributes', function () {
                var attributes = {
                    'data-match': '^[a-z]+$',
                    // value: JSON.stringify(['alpha', 'beta', 'gamma']) // <-- Does not work
                    'data-value': JSON.stringify(['alpha', 'beta', 'gamma'])
                };
                var element = $(MULTIINPUT2).attr(attributes).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var multiInput = element.data('kendoMultiInput');
                expect(multiInput).to.be.an.instanceof(MultiInput);
                expect(multiInput).to.have.property('tagList').that.is.an.instanceof($);
                var tagList = multiInput.tagList;
                expect(tagList).to.match('ul');
                expect(tagList).to.have.descendants('>li');
                expect(tagList.children('li')).to.be.an.instanceof($).with.property('length', JSON.parse(attributes['data-value']).length);
                // TODO: We could check that each li contains the correct value
                expect(multiInput).to.have.property('wrapper').that.is.an.instanceof($);
                var wrapper = multiInput.wrapper;
                expect(wrapper).to.match('div');
                expect(wrapper).to.have.class('k-widget');
                expect(wrapper).to.have.class('kj-multiinput');
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
            var multiInput;
            var options = {
                match: '^[a-z]+$',
                value: ['alpha', 'beta', 'gamma']
            };

            beforeEach(function () {
                element = $(MULTIINPUT1).appendTo(FIXTURES);
                multiInput = element.kendoMultiInput(options).data('kendoMultiInput');
            });

            it('value', function () {
                var fn = function () {
                    multiInput.value('alpha');
                };
                expect(multiInput).to.be.an.instanceof(MultiInput);
                expect(multiInput.value()).to.deep.equal(options.value);
                expect(multiInput.tagList).to.exist;
                expect(multiInput.tagList.children('li').length).to.equal(options.value.length);
                expect(fn).to.throw;
                var value = ['omega', 'psi'];
                multiInput.value(value);
                expect(multiInput.value()).to.deep.equal(value);
                expect(multiInput.tagList.children('li').length).to.equal(value.length);
                // TODO test match option
            });

            it('focus', function (done) {
                expect(multiInput).to.be.an.instanceof(MultiInput);
                var focus = sinon.spy();
                multiInput.element.on('focus', function () {
                    focus();
                });
                multiInput.focus();
                // Create a new timer to ensure the expectation is executed after the focus event handler
                setTimeout(function () {
                    expect(focus).to.have.been.calledOnce;
                    done();
                }, 0);
            });

            xit('readonly', function () {
                expect(multiInput).to.be.an.instanceof(MultiInput);
                // TODO

            });

            it('enable', function () {
                expect(multiInput).to.be.an.instanceof(MultiInput);
                expect(multiInput.wrapper).to.exist;
                expect(multiInput.element).to.exist;
                multiInput.enable(false);
                expect(multiInput.wrapper).to.match('.k-state-disabled');
                expect(multiInput.element).to.match('input:disabled');
                multiInput.enable(true);
                expect(multiInput.wrapper).not.to.match('.k-state-disabled');
                expect(multiInput.element).not.to.match('input:disabled');
            });

            it('refresh', function () {
                expect(multiInput).to.be.an.instanceof(MultiInput);
                expect(multiInput.value()).to.deep.equal(options.value);
                expect(multiInput.tagList).to.exist;
                expect(multiInput.tagList.children('li').length).to.equal(options.value.length);
                var values = ['omega', 'psi'];
                multiInput._values = values;
                multiInput.refresh();
                expect(multiInput.value()).to.deep.equal(values);
                expect(multiInput.tagList.children('li').length).to.equal(values.length);
            });

            it('destroy', function () {
                expect(multiInput).to.be.an.instanceof(MultiInput);
                multiInput.destroy();
                expect(element.parent()).to.match(FIXTURES);
                expect(element.data('kendoMultiInput')).to.be.undefined;
                expect(element).to.be.empty;
                expect(element).not.to.have.class('k-widget');
                expect(element).not.to.have.class('kj-multiinput');

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
            var multiInput;
            var attributes = {
                'data-match': '^[a-z]+$',
                'data-bind': 'value: value'
            };
            var change;
            var viewModel;

            beforeEach(function () {
                element = $(MULTIINPUT2).attr(attributes).appendTo(FIXTURES);
                change = sinon.spy();
                viewModel = kendo.observable({
                    value: ['alpha', 'beta', 'gamma']
                });
                viewModel.bind('change', function (e) {
                    change();
                });
                kendo.bind(FIXTURES, viewModel);
                multiInput = element.data('kendoMultiInput');
            });

            it('change of viewModel changes widget value', function () {
                var length = viewModel.value.length;
                expect(multiInput).to.be.an.instanceof(MultiInput);
                expect(multiInput.tagList).to.exist;
                expect(multiInput.tagList.children('li').length).to.equal(length);
                viewModel.value.pop(); // TODO: This triggers 2 changes
                expect(change).to.have.callCount(3);
                expect(multiInput.tagList.children('li').length).to.equal(length - 1);
                viewModel.value.push('omega'); // TODO: This triggers 2 changes
                expect(change).to.have.callCount(5);
                expect(multiInput.tagList.children('li').length).to.equal(length);
            });

            it('change of widget value changes the viewModel', function () {
                var length = viewModel.value.length;
                expect(multiInput).to.be.an.instanceof(MultiInput);
                expect(multiInput.tagList).to.exist;
                expect(multiInput.tagList.children('li').length).to.equal(length);
                var value = multiInput.value().slice();
                value.pop();
                multiInput.value(value);
                expect(change).to.have.callCount(2);
                expect(viewModel.value.length).to.equal(length - 1);
                value = multiInput.value().slice();
                value.push('omega');
                multiInput.value(value);
                expect(change).to.have.callCount(3);
                expect(viewModel.value.length).to.equal(length);
            });

            it('input', function () {
                var length = viewModel.value.length;
                var input = multiInput.element;
                expect(input).to.match('input');
                expect(multiInput).to.be.an.instanceof(MultiInput);
                multiInput.focus();
                input.val('omega');
                input.simulate('keypress', { keyCode: 44 }); // comma
                expect(viewModel.value.length).to.equal(length + 1);
                expect(multiInput.tagList.children('li').length).to.equal(length + 1);
                multiInput.focus();
                input.val('psi');
                input.simulate('keypress', { keyCode: 59 }); // semi-colon
                expect(viewModel.value.length).to.equal(length + 2);
                expect(multiInput.tagList.children('li').length).to.equal(length + 2);
            });

            it('delete', function () {
                var length = viewModel.value.length;
                expect(multiInput).to.be.an.instanceof(MultiInput);
                var closeButtons = multiInput.tagList.find('.k-i-close');
                expect(closeButtons.length).to.equal(length);
                closeButtons.last().simulate(CLICK);
                expect(viewModel.value.length).to.equal(length - 1);
                expect(multiInput.tagList.children('li').length).to.equal(length - 1);
                closeButtons.first().simulate(CLICK);
                expect(viewModel.value.length).to.equal(length - 2);
                expect(multiInput.tagList.children('li').length).to.equal(length - 2);
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
            var multiInput;
            var change;

            beforeEach(function () {
                element = $(MULTIINPUT1).appendTo(FIXTURES);
                multiInput = element.kendoMultiInput().data('kendoMultiInput');
                change = sinon.spy();
            });

            it('Change event', function () {
                expect(multiInput).to.be.an.instanceof(MultiInput);
                multiInput.bind('change', function (e) {
                    change(e.sender.value().join(','));
                });
                multiInput.value(['alpha', 'beta', 'gamma']);
                expect(change).to.have.been.calledWith(['alpha', 'beta', 'gamma'].join(','));
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
