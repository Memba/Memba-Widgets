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
    var Quiz = ui.Quiz;
    var DataSource = kendo.data.DataSource;
    var FIXTURES = '#fixtures';
    var QUIZ1 = '<div id="quiz1"></div>';
    var QUIZ2 = '<div id="quiz2" data-role="quiz"></div>';
    var QUIZ_DATA = [
        { text: 'answer 1', image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_count_one.svg' },
        { text: 'answer 2', image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_point_up.svg' },
        { text: 'answer 3', image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_count_three.svg' },
        { text: 'answer 4', image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_four.svg' },
        { text: 'answer 5', image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_spread.svg' }
    ];

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
                expect(element.hasClass('k-widget')).to.be.false;
                expect(element.hasClass('kj-quiz')).to.be.true;
            });

            it('from code with options', function () {
                var element = $(QUIZ1).appendTo(FIXTURES);
                var options = {
                    dataSource: QUIZ_DATA,
                    mode: 'dropdown',
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
                expect(element.hasClass('k-widget')).to.be.false;
                expect(element.hasClass('kj-quiz')).to.be.true;
            });

            it('from markup with attributes', function () {
                var attributes = {
                    'data-source': JSON.stringify(QUIZ_DATA),
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
                expect(quiz.element.find('input[type="button"]')).not.to.exist;
                expect(quiz.element.find('input[type="radio"]')).to.be.an.instanceof($).with.property('length', $.parseJSON(attributes['data-source']).length);
                if (!window.PHANTOMJS) { // TODO fails in PhantomJS (and in Edge too)
                    expect(quiz.element.children()).to.have.attr('style', attributes['data-item-style']);
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
                dataSource: QUIZ_DATA,
                mode: 'image',
                itemStyle: { color: 'rgb(255, 0, 0)' },
                activeStyle: { backgroundColor: 'rgb(255, 224, 224)' }
            };
            var options2 = {
                dataSource: QUIZ_DATA,
                mode: 'button',
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
                    quiz.value(quiz.dataSource.at(i).text);
                    expect(quiz.value()).to.equal(quiz.dataSource.at(i).text);
                    quiz.value('dummy');
                    expect(quiz.value()).to.equal(quiz.dataSource.at(i).text);
                }
            });

            it('enable', function () {
                // TODO button and radio???
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('image');
                // expect(quiz.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
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
                // expect($('div.k-list-container.k-popup')).to.exist;
                quiz.destroy();
                // expect($('div.k-list-container.k-popup')).not.to.exist;
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
                    data: QUIZ_DATA,
                    current: null
                });
                kendo.bind(FIXTURES, viewModel);
                quiz = element.data('kendoQuiz');
                viewModel.bind('change', function () {
                    change();
                });
            });

            it('A change in the viewModel raises a change of widget value', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('button');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    viewModel.set('current', value);
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('button.kj-quiz-button:eq(' + i + ')')).to.have.class('k-state-selected');
                }
            });

            it('A change of widget value raises a change in the viewModel', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('button');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    quiz.value(value);
                    quiz.trigger('change');
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('button.kj-quiz-button:eq(' + i + ')')).to.have.class('k-state-selected');
                }
            });

            it('click', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('button');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    quiz.element.find('button.kj-quiz-button:eq(' + i + ')').simulate('click');
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('button.kj-quiz-button:eq(' + i + ')')).to.have.class('k-state-selected');
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
                    data: QUIZ_DATA,
                    current: null
                });
                kendo.bind(FIXTURES, viewModel);
                quiz = element.data('kendoQuiz');
                viewModel.bind('change', function () {
                    change();
                });
            });

            it('A change in the viewModel raises a change of widget value', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('dropdown');
                expect(quiz.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    viewModel.set('current', value);
                    expect(quiz.dropDownList.value()).to.equal(value);
                    expect(quiz.dropDownList.text()).to.equal(value);
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                }
            });

            it('A change of widget value raises a change in the viewModel', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('dropdown');
                expect(quiz.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    quiz.value(value);
                    quiz.trigger('change');
                    expect(quiz.dropDownList.value()).to.equal(value);
                    expect(quiz.dropDownList.text()).to.equal(value);
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                }
            });

            it('select', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('dropdown');
                expect(quiz.dropDownList).to.be.an.instanceof(kendo.ui.DropDownList);
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    quiz.dropDownList.element.simulate('click');
                    $('div.k-list-container.k-popup').find('li.k-item:eq(' + i + ')').simulate('click');
                    expect(quiz.dropDownList.value()).to.equal(value);
                    expect(quiz.dropDownList.text()).to.equal(value);
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
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

        describe('MVVM (and UI interactions) - images', function () {

            var element;
            var quiz;
            var attributes = {
                'data-mode': 'image',
                'data-bind': 'source: data, value: current'
            };
            var change;
            var viewModel;

            beforeEach(function () {
                change = sinon.spy();
                element = $(QUIZ2).attr(attributes).appendTo(FIXTURES);
                viewModel = kendo.observable({
                    data: QUIZ_DATA,
                    current: null
                });
                kendo.bind(FIXTURES, viewModel);
                quiz = element.data('kendoQuiz');
                viewModel.bind('change', function () {
                    change();
                });
            });

            it('A change in the viewModel raises a change of widget value', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('image');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    viewModel.set('current', value);
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('div.kj-quiz-image:eq(' + i + ')')).to.have.class('k-state-selected');
                }
            });

            it('A change of widget value raises a change in the viewModel', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('image');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    quiz.value(value);
                    quiz.trigger('change');
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('div.kj-quiz-image:eq(' + i + ')')).to.have.class('k-state-selected');
                }
            });

            it('click', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('image');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    quiz.element.find('div.kj-quiz-image:eq(' + i + ')').simulate('click');
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('div.kj-quiz-image:eq(' + i + ')')).to.have.class('k-state-selected');
                }
            });

            afterEach(function () {
                var fixtures = $(FIXTURES);
                kendo.destroy(fixtures);
                fixtures.find('*').off();
                fixtures.empty();
            });

        });

        describe('MVVM (and UI interactions) - links', function () {

            var element;
            var quiz;
            var attributes = {
                'data-mode': 'link',
                'data-bind': 'source: data, value: current'
            };
            var change;
            var viewModel;

            beforeEach(function () {
                change = sinon.spy();
                element = $(QUIZ2).attr(attributes).appendTo(FIXTURES);
                viewModel = kendo.observable({
                    data: QUIZ_DATA,
                    current: null
                });
                kendo.bind(FIXTURES, viewModel);
                quiz = element.data('kendoQuiz');
                viewModel.bind('change', function () {
                    change();
                });
            });

            it('A change in the viewModel raises a change of widget value', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('link');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    viewModel.set('current', value);
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('span.kj-quiz-link:eq(' + i + ')')).to.have.class('k-state-selected');
                }
            });

            it('A change of widget value raises a change in the viewModel', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('link');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    quiz.value(value);
                    quiz.trigger('change');
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('span.kj-quiz-link:eq(' + i + ')')).to.have.class('k-state-selected');
                }
            });

            it('click', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('link');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    quiz.element.find('span.kj-quiz-link:eq(' + i + ')').simulate('click');
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('span.kj-quiz-link:eq(' + i + ')')).to.have.class('k-state-selected');
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
                    data: QUIZ_DATA,
                    current: null
                });
                kendo.bind(FIXTURES, viewModel);
                quiz = element.data('kendoQuiz');
                viewModel.bind('change', function () {
                    change();
                });
            });

            it('A change in the viewModel raises a change of widget value', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('radio');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    viewModel.set('current', value);
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('input[type="radio"]:eq(' + i + ')')).to.be.checked;
                }
            });

            it('A change of widget value raises a change in the viewModel', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('radio');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    quiz.value(value);
                    quiz.trigger('change');
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('input[type="radio"]:eq(' + i + ')')).to.be.checked;
                }
            });

            it('click', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(quiz.options.mode).to.equal('radio');
                expect(quiz.dropDownList).to.be.undefined;
                expect(quiz.value()).to.be.null;
                expect(viewModel.get('current')).to.be.null;
                for (var i = 0; i < viewModel.data.length; i++) {
                    var value = viewModel.data[i].text;
                    quiz.wrapper.find('input[type="radio"]:eq(' + i + ')').simulate('click');
                    expect(quiz.value()).to.equal(value);
                    expect(viewModel.get('current')).to.equal(value);
                    expect(change).to.have.callCount(i + 1);
                    expect(quiz.element.find('input[type="radio"]:eq(' + i + ')')).to.be.checked;
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
                dataSource: { data: QUIZ_DATA },
                mode: 'button',
                itemStyle: { color: 'rgb(0, 0, 255)' },
                activeStyle: { backgroundColor: 'rgb(224, 224, 255)' }
            };

            beforeEach(function () {
                change = sinon.spy();
                element = $(QUIZ1).appendTo(FIXTURES);
                quiz = element.kendoQuiz(options).data('kendoQuiz');
                quiz.bind('change', function () {
                    change();
                });
            });

            it('change', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                for (var i = 0, length = options.dataSource.data.length; i < length; i++) {
                    quiz.value(quiz.dataSource.at(i).text);
                    quiz.trigger('change');
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
