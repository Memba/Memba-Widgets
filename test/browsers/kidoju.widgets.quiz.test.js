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
    var Quiz = ui.Quiz;
    var DataSource = kendo.data.DataSource;
    var FIXTURES = '#fixtures';
    var QUIZ1 = '<div id="quiz1"></div>';
    var QUIZ2 = '<div id="quiz2" data-role="quiz"></div>';

    describe('kidoju.widgets.quiz', function () {

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
                expect($.fn.kendoQuiz).to.be.an.instanceof(Function);
            });

        });

        describe('Initialization', function () {

            it('from code', function () {
                var element = $(QUIZ1).appendTo(FIXTURES);
                var quiz = element.kendoQuiz().data('kendoQuiz');
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('button');
                expect(quiz.dataSource).to.be.an.instanceof(DataSource);
                expect(quiz.dataSource.total()).to.equal(0);
                expect(quiz.element).to.be.an.instanceof($);
                expect(quiz.wrapper).to.be.an.instanceof($);
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.groupList).to.be.an.instanceof($);
                expect(quiz.groupList).to.be.empty;
                expect(element.hasClass('k-widget')).to.be.false;
                expect(element.hasClass('kj-quiz')).to.be.true;
            });

            it('from code with options', function () {
                var element = $(QUIZ1).appendTo(FIXTURES);
                var options = {
                    dataSource: ['answer 1', 'answer 2', 'answer 3'],
                    mode: 'dropdown',
                    groupStyle: { border: '1px solid rgb(255, 0, 0)' },
                    itemStyle: { color: 'rgb(255, 0, 0)' },
                    activeStyle: { backgroundColor: 'rgb(255, 224, 224)' }
                };
                var quiz = element.kendoQuiz(options).data('kendoQuiz');
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('dropdown');
                expect(quiz.dataSource).to.be.an.instanceof(DataSource);
                expect(quiz.dataSource.total()).to.equal(options.dataSource.length);
                expect(quiz.element).to.be.an.instanceof($);
                expect(quiz.wrapper).to.be.an.instanceof($);
                expect(quiz.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
                expect(quiz.dropDownList.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', options.dataSource.length);
                expect(quiz.groupList).to.be.undefined;
                // expect(quiz.groupList).to.have.css('border', options.groupStyle);
                // expect(quiz.groupList.children()).to.have.css('color', options.itemStyle);
                expect(element.hasClass('k-widget')).to.be.false;
                expect(element.hasClass('kj-quiz')).to.be.true;
            });

            it('from markup', function () {
                var element = $(QUIZ2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var quiz = element.data('kendoQuiz');
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('button');
                expect(quiz.dataSource).to.be.an.instanceof(DataSource);
                expect(quiz.dataSource.total()).to.equal(0);
                expect(quiz.element).to.be.an.instanceof($);
                expect(quiz.wrapper).to.be.an.instanceof($);
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.groupList).to.be.an.instanceof($);
                expect(quiz.groupList).to.be.empty;
                expect(element.hasClass('k-widget')).to.be.false;
                expect(element.hasClass('kj-quiz')).to.be.true;
            });

            it('from markup with attributes', function () {
                var attributes = {
                    'data-source': JSON.stringify(['answer 1', 'answer 2', 'answer 3']),
                    'data-mode': 'radio',
                    'data-group-style': 'border: 1px solid rgb(255, 0, 0);',
                    'data-item-style': 'color: rgb(255, 0, 0);',
                    'data-active-style': 'background-color: rgb(255, 224, 224);'
                };
                var element = $(QUIZ2).attr(attributes).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var quiz = element.data('kendoQuiz');
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('radio');
                expect(quiz.dataSource).to.be.an.instanceof(DataSource);
                expect(quiz.dataSource.total()).to.equal($.parseJSON(attributes['data-source']).length);
                expect(quiz.element).to.be.an.instanceof($);
                expect(quiz.wrapper).to.be.an.instanceof($);
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.groupList).to.be.an.instanceof($);
                expect(quiz.groupList.find('input[type="button"]')).not.to.exist;
                expect(quiz.groupList.find('input[type="radio"]')).to.be.an.instanceof($).with.property('length', $.parseJSON(attributes['data-source']).length);
                if (!window.PHANTOMJS) { // TODO fails in PhantomJS (and in Edge too)
                    expect(quiz.groupList).to.have.attr('style', attributes['data-group-style']);
                    expect(quiz.groupList.children()).to.have.attr('style', attributes['data-item-style']);
                }
                expect(element.hasClass('k-widget')).to.be.false;
                expect(element.hasClass('kj-quiz')).to.be.true;

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
            var quiz;
            var options1 = {
                dataSource: ['answer 1', 'answer 2', 'answer 3'],
                mode: 'dropdown',
                groupStyle: { border: '1px solid rgb(255, 0, 0)' },
                itemStyle: { color: 'rgb(255, 0, 0)' },
                activeStyle: { backgroundColor: 'rgb(255, 224, 224)' }
            };
            var options2 = {
                dataSource: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                mode: 'button',
                groupStyle: { border: '1px solid rgb(0, 0, 255)' },
                itemStyle: { color: 'rgb(0, 0, 255)' },
                activeStyle: { backgroundColor: 'rgb(224, 224, 255)' }
            };

            beforeEach(function () {
                element = $(QUIZ1).appendTo(FIXTURES);
                quiz = element.kendoQuiz(options1).data('kendoQuiz');
            });

            it('value', function () {
                function fn1() {
                    quiz.value(1);
                }
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.value()).to.be.null; // Cannot use undefined
                expect(fn1).to.throw(TypeError);
                quiz.value('dummy');
                expect(quiz.value()).to.be.null;
                for (var i = 0; i < quiz.dataSource.total(); i++) {
                    quiz.value(quiz.dataSource.at(i));
                    expect(quiz.value()).to.equal(quiz.dataSource.at(i));
                    quiz.value('dummy');
                    expect(quiz.value()).to.equal(quiz.dataSource.at(i));
                }
            });

            it('enable', function () {
                // TODO button and radio???
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('dropdown');
                expect(quiz.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
                // expect(quiz.dropDownList.element.find('input')).to.have.prop('disabled', false);
                quiz.enable(false);
                // expect(quiz.dropDownList.element.find('input')).to.have.prop('disabled', true);

            });

            xit('setOptions and refresh', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal(options1.mode);
                // TODO
                quiz.setOptions(options2);
                expect(quiz.options.mode).to.equal(options1.mode);
                // TODO
            });

            it('destroy', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect($('div.k-list-container.k-popup')).to.exist;
                quiz.destroy();
                expect($('div.k-list-container.k-popup')).not.to.exist;
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('MVVM (and UI interactions) - buttons', function () {

            var element;
            var quiz;
            var attributes = {
                'data-mode': 'button',
                'data-bind': 'source: data, value: current'
            };
            var change;
            var viewModel;

            beforeEach(function () {
                change = sinon.spy();
                element = $(QUIZ2).attr(attributes).appendTo(FIXTURES);
                viewModel = kendo.observable({
                    data: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                    current: null
                });
                kendo.bind(FIXTURES, viewModel);
                quiz = element.data('kendoQuiz');
                viewModel.bind('change', function() {
                    change();
                });
            });

            it('A change in the viewModel raises a change of widget value', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('button');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.groupList).to.exist;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    viewModel.set('current', viewModel.data[i]);
                    expect(quiz.value()).to.equal(viewModel.data[i]);
                    expect(viewModel.get('current')).to.equal(viewModel.data[i]);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.groupList.find('input[type="button"]:eq(' + i + ')')).to.have.class('k-state-active');
                }
            });

            it('A change of widget value raises a change in the viewModel', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('button');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.groupList).to.exist;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    quiz.value(viewModel.data[i]);
                    expect(quiz.value()).to.equal(viewModel.data[i]);
                    expect(viewModel.get('current')).to.equal(viewModel.data[i]);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.groupList.find('input[type="button"]:eq(' + i + ')')).to.have.class('k-state-active');
                }
            });

            it('click', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('button');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.groupList).to.exist;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    quiz.groupList.find('input[type="button"]:eq(' + i + ')').simulate('click');
                    expect(quiz.value()).to.equal(viewModel.data[i]);
                    expect(viewModel.get('current')).to.equal(viewModel.data[i]);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.groupList.find('input[type="button"]:eq(' + i + ')')).to.have.class('k-state-active');
                }
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('MVVM (and UI interactions) - dropdown', function () {

            var element;
            var quiz;
            var attributes = {
                'data-mode': 'dropdown',
                'data-bind': 'source: data, value: current'
            };
            var change;
            var viewModel;

            beforeEach(function () {
                change = sinon.spy();
                element = $(QUIZ2).attr(attributes).appendTo(FIXTURES);
                viewModel = kendo.observable({
                    data: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                    current: null
                });
                kendo.bind(FIXTURES, viewModel);
                quiz = element.data('kendoQuiz');
                viewModel.bind('change', function() {
                    change();
                });
            });

            it('A change in the viewModel raises a change of widget value', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('dropdown');
                expect(quiz.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
                expect(quiz.groupList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    viewModel.set('current', viewModel.data[i]);
                    expect(quiz.dropDownList.value()).to.equal(viewModel.data[i]);
                    expect(quiz.dropDownList.text()).to.equal(viewModel.data[i]);
                    expect(quiz.value()).to.equal(viewModel.data[i]);
                    expect(viewModel.get('current')).to.equal(viewModel.data[i]);
                    expect(change).to.have.callCount(i + 1);
                }
            });

            it('A change of widget value raises a change in the viewModel', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('dropdown');
                expect(quiz.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
                expect(quiz.groupList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    quiz.value(viewModel.data[i]);
                    expect(quiz.dropDownList.value()).to.equal(viewModel.data[i]);
                    expect(quiz.dropDownList.text()).to.equal(viewModel.data[i]);
                    expect(quiz.value()).to.equal(viewModel.data[i]);
                    expect(viewModel.get('current')).to.equal(viewModel.data[i]);
                    expect(change).to.have.callCount(i + 1);
                }
            });

            it('select', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('dropdown');
                expect(quiz.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
                expect(quiz.groupList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    quiz.dropDownList.element.simulate('click');
                    $('div.k-list-container.k-popup').find('li.k-item:eq(' + i + ')').simulate('click');
                    expect(quiz.dropDownList.value()).to.equal(viewModel.data[i]);
                    expect(quiz.dropDownList.text()).to.equal(viewModel.data[i]);
                    expect(quiz.value()).to.equal(viewModel.data[i]);
                    expect(viewModel.get('current')).to.equal(viewModel.data[i]);
                    expect(change).to.have.callCount(i + 1);
                }
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('MVVM (and UI interactions) - radios', function () {

            var element;
            var quiz;
            var attributes = {
                'data-mode': 'radio',
                'data-bind': 'source: data, value: current'
            };
            var change;
            var viewModel;

            beforeEach(function () {
                change = sinon.spy();
                element = $(QUIZ2).attr(attributes).appendTo(FIXTURES);
                viewModel = kendo.observable({
                    data: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                    current: null
                });
                kendo.bind(FIXTURES, viewModel);
                quiz = element.data('kendoQuiz');
                viewModel.bind('change', function() {
                    change();
                });
            });

            it('A change in the viewModel raises a change of widget value', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('radio');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.groupList).to.exist;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    viewModel.set('current', viewModel.data[i]);
                    expect(quiz.value()).to.equal(viewModel.data[i]);
                    expect(viewModel.get('current')).to.equal(viewModel.data[i]);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.groupList.find('input[type="radio"]:eq(' + i + ')')).to.be.checked;
                }
            });

            it('A change of widget value raises a change in the viewModel', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('radio');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.groupList).to.exist;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    quiz.value(viewModel.data[i]);
                    expect(quiz.value()).to.equal(viewModel.data[i]);
                    expect(viewModel.get('current')).to.equal(viewModel.data[i]);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.groupList.find('input[type="radio"]:eq(' + i + ')')).to.be.checked;
                }
            });

            it('click', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('radio');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.groupList).to.exist;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    quiz.wrapper.find('input[type="radio"]:eq(' + i + ')').simulate('click');
                    expect(quiz.value()).to.equal(viewModel.data[i]);
                    expect(viewModel.get('current')).to.equal(viewModel.data[i]);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.groupList.find('input[type="radio"]:eq(' + i + ')')).to.be.checked;
                }
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
            var quiz;
            var change;
            var options = {
                dataSource: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                mode: 'button',
                groupStyle: { border: '1px solid rgb(0, 0, 255)' },
                itemStyle: { color: 'rgb(0, 0, 255)' },
                activeStyle: { backgroundColor: 'rgb(224, 224, 255)' }
            };

            beforeEach(function () {
                change = sinon.spy();
                element = $(QUIZ1).appendTo(FIXTURES);
                quiz = element.kendoQuiz(options).data('kendoQuiz');
                quiz.bind('change', function() {
                    change();
                });
            });

            it('change', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                for (var i = 0; i < options.dataSource.length; i++) {
                    quiz.value(options.dataSource[i]);
                    expect(change).to.have.callCount(i + 1);
                }
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
