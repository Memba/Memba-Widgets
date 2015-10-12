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
    var FIXTURES = '#fixtures';
    var QUIZ1 = '<div id="quiz1"></div>';
    var QUIZ2 = '<div id="quiz2" data-role="quiz"></div>';

    // TODO ALL: nothing is completed (still show as TOOLBOX)

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
                expect(element.hasClass('k-widget')).to.be.false;
                expect(element.hasClass('kj-quiz')).to.be.true;
            });

            it('from code with options', function () {
                var element = $(QUIZ1).appendTo(FIXTURES);
                var quiz = element.kendoQuiz().data('kendoQuiz');
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(element.hasClass('k-widget')).to.be.false;
                expect(element.hasClass('kj-quiz')).to.be.true;
            });

            it('from markup', function () {
                var element = $(QUIZ2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var quiz = element.data('kendoQuiz');
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(element.hasClass('k-widget')).to.be.false;
                expect(element.hasClass('kj-quiz')).to.be.true;
            });

        });

        xdescribe('Methods', function () {

            var element;
            var quiz;

            beforeEach(function () {
                element = $(QUIZ1).appendTo(FIXTURES);
                quiz = element.kendoQuiz({ /* TODO */ }).data('kendoQuiz');
            });

            it('Set/Get the current tool with valid values', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
            });

            it('Set/Get the current tool with invalid values', function () {
                function fn1() {
                    quiz.tool(0);
                }
                function fn2() {
                    quiz.tool('dummy');
                }
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(fn1).to.throw(TypeError);
                expect(fn2).to.throw(RangeError);
            });

        });

        xdescribe('MVVM', function () {

            var element;
            var quiz;

            beforeEach(function () {
                element = $(QUIZ1).appendTo(FIXTURES);
                quiz = element.kendoQuiz({ /* TODO */ }).data('kendoQuiz');
            });

            it('A change of tool raises a change in the quiz', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
            });

        });

        xdescribe('Events', function () {

            var element;
            var quiz;

            beforeEach(function () {
                element = $(QUIZ1).appendTo(FIXTURES);
                quiz = element.kendoQuiz({ /* TODO */ }).data('kendoQuiz');
            });

            it('Change event', function () {
                var change = sinon.spy();
                expect(quiz).to.be.an.instanceof(Quiz);
                quiz.bind('change', function (e) {
                    change(e.value);
                });
                expect(change).to.have.been.calledWith('label');
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
