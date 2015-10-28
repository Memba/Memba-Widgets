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
                var multiinput = element.kendoMultiInput().data('kendoMultiInput');
                expect(multiinput).to.be.an.instanceof(MultiInput);
                expect(multiinput).to.have.property('tagList').that.is.an.instanceof($);
                var tagList = multiinput.tagList;
                expect(tagList).to.match('ul');
                expect(tagList).to.be.empty;
                expect(multiinput).to.have.property('wrapper').that.is.an.instanceof($);
                var wrapper = multiinput.wrapper;
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
                var multiinput = element.kendoMultiInput(options).data('kendoMultiInput');
                expect(multiinput).to.be.an.instanceof(MultiInput);
                expect(multiinput).to.have.property('tagList').that.is.an.instanceof($);
                var tagList = multiinput.tagList;
                expect(tagList).to.match('ul');
                expect(tagList).to.have.descendants('>li');
                expect(tagList.children('li')).to.be.an.instanceof($).with.property('length', options.value.length);
                // TODO: We could check that each li contains the correct value
                expect(multiinput).to.have.property('wrapper').that.is.an.instanceof($);
                var wrapper = multiinput.wrapper;
                expect(wrapper).to.match('div');
                expect(wrapper).to.have.class('k-widget');
                expect(wrapper).to.have.class('kj-multiinput');
            });

            it('from markup', function () {
                var options = {};
                var element = $(MULTIINPUT2).attr(options).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var multiinput = element.data('kendoMultiInput');
                expect(multiinput).to.be.an.instanceof(MultiInput);
                expect(multiinput).to.have.property('tagList').that.is.an.instanceof($);
                var tagList = multiinput.tagList;
                expect(tagList).to.match('ul');
                expect(tagList).to.be.empty;
                expect(multiinput).to.have.property('wrapper').that.is.an.instanceof($);
                var wrapper = multiinput.wrapper;
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
                var multiinput = element.data('kendoMultiInput');
                expect(multiinput).to.be.an.instanceof(MultiInput);
                expect(multiinput).to.have.property('tagList').that.is.an.instanceof($);
                var tagList = multiinput.tagList;
                expect(tagList).to.match('ul');
                expect(tagList).to.have.descendants('>li');
                expect(tagList.children('li')).to.be.an.instanceof($).with.property('length', JSON.parse(attributes['data-value']).length);
                // TODO: We could check that each li contains the correct value
                expect(multiinput).to.have.property('wrapper').that.is.an.instanceof($);
                var wrapper = multiinput.wrapper;
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
            var multiinput;
            var options = {
                match: '^[a-z]+$',
                value: ['alpha', 'beta', 'gamma']
            };

            beforeEach(function () {
                element = $(MULTIINPUT1).appendTo(FIXTURES);
                multiinput = element.kendoMultiInput(options).data('kendoMultiInput');
            });

            it('value', function () {
                var fn = function() {
                    multiinput.value('alpha');
                };
                expect(multiinput).to.be.an.instanceof(MultiInput);
                expect(multiinput.value()).to.deep.equal(options.value);
                expect(multiinput.tagList).to.exist;
                expect(multiinput.tagList.children('li').length).to.equal(options.value.length);
                expect(fn).to.throw;
                var value = ['omega', 'psi'];
                multiinput.value(value);
                expect(multiinput.value()).to.deep.equal(value);
                expect(multiinput.tagList.children('li').length).to.equal(value.length);
                // TODO test match option
            });

            it('focus', function (done) {
                expect(multiinput).to.be.an.instanceof(MultiInput);
                var focus = sinon.spy();
                multiinput.element.on('focus', function() {
                    focus();
                });
                multiinput.focus();
                // Create a new timer to ensure the expectation is executed after the focus event handler
                setTimeout(function() {
                    expect(focus).to.have.been.calledOnce;
                    done();
                }, 0);
            });

            xit('readonly', function () {
                expect(multiinput).to.be.an.instanceof(MultiInput);

            });

            xit('enable', function () {
                expect(multiinput).to.be.an.instanceof(MultiInput);

            });

            xit('refresh', function () {
                expect(multiinput).to.be.an.instanceof(MultiInput);

            });

            xit('destroy', function () {
                expect(multiinput).to.be.an.instanceof(MultiInput);

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
            var multiinput;
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
                viewModel.bind('change', function(e) {
                    change();
                });
                kendo.bind(FIXTURES, viewModel);
                multiinput = element.data('kendoMultiInput');
            });

            it('change of viewModel changes widget value', function () {
                var length = viewModel.value.length;
                expect(multiinput).to.be.an.instanceof(MultiInput);
                expect(multiinput.tagList).to.exist;
                expect(multiinput.tagList.children('li').length).to.equal(length);
                viewModel.value.pop(); // TODO: This triggers 2 changes
                expect(change).to.have.callCount(3);
                expect(multiinput.tagList.children('li').length).to.equal(length - 1);
                viewModel.value.push('omega'); // TODO: This triggers 2 changes
                expect(change).to.have.callCount(5);
                expect(multiinput.tagList.children('li').length).to.equal(length);
            });

            it('change of widget value changes the viewModel', function () {
                var length = viewModel.value.length;
                expect(multiinput).to.be.an.instanceof(MultiInput);
                expect(multiinput.tagList).to.exist;
                expect(multiinput.tagList.children('li').length).to.equal(length);
                var value = multiinput.value().slice();
                value.pop();
                multiinput.value(value);
                expect(change).to.have.callCount(2);
                expect(viewModel.value.length).to.equal(length - 1);
                value = multiinput.value().slice();
                value.push('omega');
                multiinput.value(value);
                expect(change).to.have.callCount(3);
                expect(viewModel.value.length).to.equal(length);
            });

            it('input', function () {
                var length = viewModel.value.length;
                var input = multiinput.element;
                expect(input).to.match('input');
                expect(multiinput).to.be.an.instanceof(MultiInput);
                multiinput.focus();
                input.val('omega');
                input.simulate('keypress', { keyCode: 44 }); // comma
                expect(viewModel.value.length).to.equal(length + 1);
                expect(multiinput.tagList.children('li').length).to.equal(length + 1);
                multiinput.focus();
                input.val('psi');
                input.simulate('keypress', { keyCode: 59 }); // semi-colon
                expect(viewModel.value.length).to.equal(length + 2);
                expect(multiinput.tagList.children('li').length).to.equal(length + 2);
            });

            it('delete', function () {
                var length = viewModel.value.length;
                expect(multiinput).to.be.an.instanceof(MultiInput);
                var closeButtons = multiinput.tagList.find('.k-i-close');
                expect(closeButtons.length).to.equal(length);
                closeButtons.last().simulate(CLICK);
                expect(viewModel.value.length).to.equal(length - 1);
                expect(multiinput.tagList.children('li').length).to.equal(length - 1);
                closeButtons.first().simulate(CLICK);
                expect(viewModel.value.length).to.equal(length - 2);
                expect(multiinput.tagList.children('li').length).to.equal(length - 2);
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
            var multiinput;
            var change;

            beforeEach(function () {
                element = $(MULTIINPUT1).appendTo(FIXTURES);
                multiinput = element.kendoMultiInput().data('kendoMultiInput');
                change = sinon.spy();
            });

            it('Change event', function () {
                expect(multiinput).to.be.an.instanceof(MultiInput);
                multiinput.bind('change', function (e) {
                    change(e.sender.value().join(','));
                });
                multiinput.value(['alpha', 'beta', 'gamma']);
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
