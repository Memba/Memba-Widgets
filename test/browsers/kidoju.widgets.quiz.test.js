/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect,
        sinon = window.sinon,
        kendo = window.kendo,
        ui = kendo.ui,
        Quiz = ui.Quiz,
        FIXTURES = '#fixtures',
        TOOLBOX1 = '<div id="quiz1"></div>',
        TOOLBOX2 = '<div id="quiz2" data-role="quiz"></div>';


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
                var element = $(TOOLBOX1).appendTo(FIXTURES),
                    quiz = element.kendoQuiz({ iconPath: ICON_PATH }).data('kendoQuiz');
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-quiz')).to.be.true;
                expect(element.find('img.kj-tool')).to.be.an.instanceof($).with.property('length').that.is.gte(1);
                expect(element.find('img.kj-tool').width()).to.equal(32);
                expect(element.find('img.kj-tool').height()).to.equal(32);
            });

            it('from code with options', function () {
                var element = $(TOOLBOX1).appendTo(FIXTURES),
                    quiz = element.kendoQuiz({ iconPath: ICON_PATH, size: 64 }).data('kendoQuiz');
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-quiz')).to.be.true;
                expect(element.find('img.kj-tool')).to.be.an.instanceof($).with.property('length').that.is.gte(1);
                expect(element.find('img.kj-tool').width()).to.equal(64);
                expect(element.find('img.kj-tool').height()).to.equal(64);
            });

            it('from markup', function () {
                var element = $(TOOLBOX2).appendTo(FIXTURES);
                kendo.init(FIXTURES);
                var quiz = element.data('kendoQuiz');
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(element.hasClass('k-widget')).to.be.true;
                expect(element.hasClass('kj-quiz')).to.be.true;
                expect(element.find('img.kj-tool')).to.be.an.instanceof($).with.property('length').that.is.gte(1);
                expect(element.find('img.kj-tool').width()).to.equal(48);
                expect(element.find('img.kj-tool').height()).to.equal(48);
            });

        });

        describe('Methods', function () {

            var element, quiz;

            beforeEach(function () {
                element = $(TOOLBOX1).appendTo(FIXTURES);
                quiz = element.kendoQuiz({ iconPath: ICON_PATH }).data('kendoQuiz');
            });

            it('Set/Get the current tool with valid values', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                expect(quiz.tool()).to.equal('pointer');
                quiz.tool('label');
                expect(quiz.tool()).to.equal('label');
                expect(kidoju.tools).to.have.property('active', 'label');
                quiz.tool('button');
                expect(quiz.tool()).to.equal('button');
                expect(kidoju.tools).to.have.property('active', 'button');
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

            it('Reset', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                quiz.tool('label');
                expect(kidoju.tools).to.have.property('active', 'label');
                quiz.reset();
                expect(kidoju.tools).to.have.property('active', 'pointer');
                quiz.tool('button');
                expect(kidoju.tools).to.have.property('active', 'button');
                quiz.reset();
                expect(kidoju.tools).to.have.property('active', 'pointer');
            });

        });

        describe('MVVM', function () {

            var element, quiz;

            beforeEach(function () {
                element = $(TOOLBOX1).appendTo(FIXTURES);
                quiz = element.kendoQuiz({ iconPath: ICON_PATH }).data('kendoQuiz');
            });

            it('A change of tool raises a change in the quiz', function () {
                expect(quiz).to.be.an.instanceof(Quiz);
                quiz.reset();
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                expect(quiz.tool()).to.equal('pointer');
                kidoju.tools.set('active', 'label');
                expect(quiz.tool()).to.equal('label');
                expect(element.find('img[data-selected]').attr('data-tool')).to.equal('label');
            });

        });

        describe('Events', function () {

            var element, quiz;

            beforeEach(function () {
                element = $(TOOLBOX1).appendTo(FIXTURES);
                quiz = element.kendoQuiz({ iconPath: ICON_PATH }).data('kendoQuiz');
            });

            it('Change event', function () {
                var change = sinon.spy();
                expect(quiz).to.be.an.instanceof(Quiz);
                quiz.reset();
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                quiz.bind('change', function (e) {
                    change(e.value);
                });
                quiz.tool('label');
                expect(change).to.have.been.calledWith('label');
            });

            it('Click event', function () {
                var click = sinon.spy();
                expect(quiz).to.be.an.instanceof(Quiz);
                quiz.reset();
                expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject).with.property('active', 'pointer');
                quiz.bind('click', function (e) {
                    click(e.value);
                });
                element.find('img[data-tool=button]').simulate('click');
                expect(click).to.have.been.calledWith('button');
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
