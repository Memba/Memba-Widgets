/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.buttonset.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { MultiQuiz, MultiSelect }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = '<input>';
const ROLE = 'multiinput';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

var MULTIQUIZ1 = '<div id="multiquiz1"></div>';
var MULTIQUIZ2 = '<div id="multiquiz2" data-role="multiquiz"></div>';
var MULTIQUIZ_DATA = [
    { text: 'answer 1', image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_count_one.svg' },
    { text: 'answer 2', image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_point_up.svg' },
    { text: 'answer 3', image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_count_three.svg' },
    { text: 'answer 4', image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_four.svg' },
    { text: 'answer 5', image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_spread.svg' }
];

describe('widgets.multiquiz', function () {

    before(function () {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', function () {

        it('requirements', function () {
            expect($).not.to.be.undefined;
            expect(kendo).not.to.be.undefined;
            expect(kendo.version).to.be.a('string');
            expect($.fn.kendoMultiQuiz).to.be.a(CONSTANTS.FUNCTION);
        });

    });

    describe('Initialization', function () {

        it('from code', function () {
            var element = $(MULTIQUIZ1).appendTo(FIXTURES);
            var multiquiz = element.kendoMultiQuiz().data('kendoMultiQuiz');
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('button');
            expect(multiquiz.dataSource).to.be.an.instanceof(DataSource);
            expect(multiquiz.dataSource.total()).to.equal(0);
            expect(multiquiz.element).to.be.an.instanceof($);
            expect(multiquiz.wrapper).to.be.an.instanceof($);
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(element.hasClass('k-widget')).to.be.false;
            expect(element.hasClass('kj-multiquiz')).to.be.true;
        });

        it('from code with options', function () {
            var element = $(MULTIQUIZ1).appendTo(FIXTURES);
            var options = {
                dataSource: MULTIQUIZ_DATA,
                mode: 'multiselect',
                itemStyle: { color: 'rgb(255, 0, 0)' },
                activeStyle: { backgroundColor: 'rgb(255, 224, 224)' }
            };
            var multiquiz = element.kendoMultiQuiz(options).data('kendoMultiQuiz');
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('multiselect');
            expect(multiquiz.dataSource).to.be.an.instanceof(DataSource);
            expect(multiquiz.dataSource.total()).to.equal(options.dataSource.length);
            expect(multiquiz.element).to.be.an.instanceof($);
            expect(multiquiz.wrapper).to.be.an.instanceof($);
            expect(multiquiz.multiSelect).to.be.an.instanceof(MultiSelect);
            expect(multiquiz.multiSelect.items()).to.be.an.instanceof(window.HTMLCollection).with.property('length', options.dataSource.length);
            expect(element.hasClass('k-widget')).to.be.false;
            expect(element.hasClass('kj-multiquiz')).to.be.true;
        });

        it('from markup', function () {
            var element = $(MULTIQUIZ2).appendTo(FIXTURES);
            kendo.init(FIXTURES);
            var multiquiz = element.data('kendoMultiQuiz');
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('button');
            expect(multiquiz.dataSource).to.be.an.instanceof(DataSource);
            expect(multiquiz.dataSource.total()).to.equal(0);
            expect(multiquiz.element).to.be.an.instanceof($);
            expect(multiquiz.wrapper).to.be.an.instanceof($);
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(element.hasClass('k-widget')).to.be.false;
            expect(element.hasClass('kj-multiquiz')).to.be.true;
        });

        it('from markup with attributes', function () {
            var attributes = {
                'data-source': JSON.stringify(MULTIQUIZ_DATA),
                'data-mode': 'checkbox',
                'data-group-style': 'border: 1px solid rgb(255, 0, 0);',
                'data-item-style': 'color: rgb(255, 0, 0);',
                'data-active-style': 'background-color: rgb(255, 224, 224);'
            };
            var element = $(MULTIQUIZ2).attr(attributes).appendTo(FIXTURES);
            kendo.init(FIXTURES);
            var multiquiz = element.data('kendoMultiQuiz');
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('checkbox');
            expect(multiquiz.dataSource).to.be.an.instanceof(DataSource);
            expect(multiquiz.dataSource.total()).to.equal($.parseJSON(attributes['data-source']).length);
            expect(multiquiz.element).to.be.an.instanceof($);
            expect(multiquiz.wrapper).to.be.an.instanceof($);
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.element.find('input[type="button"]')).not.to.exist;
            expect(multiquiz.element.find('input[type="checkbox"]')).to.be.an.instanceof($).with.property('length', $.parseJSON(attributes['data-source']).length);
            if (!window.PHANTOMJS) { // TODO fails in PhantomJS (and in Edge too)
                expect(multiquiz.element.children()).to.have.attr('style', attributes['data-item-style']);
            }
            expect(element.hasClass('k-widget')).to.be.false;
            expect(element.hasClass('kj-multiquiz')).to.be.true;

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
        var multiquiz;
        var options1 = {
            dataSource: MULTIQUIZ_DATA,
            mode: 'image',
            itemStyle: { color: 'rgb(255, 0, 0)' },
            activeStyle: { backgroundColor: 'rgb(255, 224, 224)' }
        };
        var options2 = {
            dataSource: MULTIQUIZ_DATA,
            mode: 'button',
            itemStyle: { color: 'rgb(0, 0, 255)' },
            activeStyle: { backgroundColor: 'rgb(224, 224, 255)' }
        };

        beforeEach(function () {
            element = $(MULTIQUIZ1).appendTo(FIXTURES);
            multiquiz = element.kendoMultiQuiz(options1).data('kendoMultiQuiz');
        });

        it('value', function () {
            function fn1() {
                multiquiz.value(1);
            }
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.value()).to.be.null; // Cannot use undefined
            expect(fn1).to.throw(TypeError);
            multiquiz.value(['dummy']);
            expect(multiquiz.value()).to.deep.equal([]);
            for (var i = 0; i < multiquiz.dataSource.total(); i++) {
                // TODO Make an array and push values, assign and compare
                var value = [multiquiz.dataSource.at(i).text];
                multiquiz.value(value);
                expect(multiquiz.value()).to.deep.equal(value);
                multiquiz.value(['dummy']);
                expect(multiquiz.value()).to.deep.equal([]);
            }
        });

        it('enable', function () {
            // TODO button and checkbox???
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('image');
            // expect(multiquiz.multiSelect).to.be.an.instanceof(MultiSelect);
            // expect(multiquiz.multiSelect.element.find('input')).to.have.prop('disabled', false);
            multiquiz.enable(false);
            // expect(multiquiz.multiSelect.element.find('input')).to.have.prop('disabled', true);

        });

        xit('setOptions and refresh', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal(options1.mode);
            // TODO
            multiquiz.setOptions(options2);
            expect(multiquiz.options.mode).to.equal(options1.mode);
            // TODO
        });

        it('destroy', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            multiquiz.destroy();
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
        var multiquiz;
        var attributes = {
            'data-mode': 'button',
            'data-bind': 'source: data, value: current'
        };
        var change;
        var viewModel;

        beforeEach(function () {
            change = sinon.spy();
            element = $(MULTIQUIZ2).attr(attributes).appendTo(FIXTURES);
            viewModel = kendo.observable({
                data: MULTIQUIZ_DATA,
                current: null
            });
            kendo.bind(FIXTURES, viewModel);
            multiquiz = element.data('kendoMultiQuiz');
            viewModel.bind('change', function () {
                change();
            });
        });

        it('A change in the viewModel raises a change of widget value', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('button');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (var i = 0; i < viewModel.data.length; i++) {
                var value = [viewModel.data[i].text];
                viewModel.set('current', value);
                // Note: multiquiz.value() is an ObservableArray of ObservableObject when value is an array of strings
                expect(multiquiz.value().toJSON()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('button.kj-multiquiz-button:eq(' + i + ')')).to.have.class('k-state-selected');
            }
        });

        it('A change of widget value raises a change in the viewModel', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('button');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (var i = 0; i < viewModel.data.length; i++) {
                var value = [viewModel.data[i].text];
                multiquiz.value(value);
                multiquiz.trigger('change');
                expect(multiquiz.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('button.kj-multiquiz-button:eq(' + i + ')')).to.have.class('k-state-selected');
            }
        });

        it('click', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('button');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            var value = [];
            for (var i = 0; i < viewModel.data.length; i++) {
                value.push(viewModel.data[i].text);
                multiquiz.element.find('button.kj-multiquiz-button:eq(' + i + ')').simulate('click');
                expect(multiquiz.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('button.kj-multiquiz-button:eq(' + i + ')')).to.have.class('k-state-selected');
            }
        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

    describe('MVVM (and UI interactions) - checkboxes', function () {

        var element;
        var multiquiz;
        var attributes = {
            'data-mode': 'checkbox',
            'data-bind': 'source: data, value: current'
        };
        var change;
        var viewModel;

        beforeEach(function () {
            change = sinon.spy();
            element = $(MULTIQUIZ2).attr(attributes).appendTo(FIXTURES);
            viewModel = kendo.observable({
                data: MULTIQUIZ_DATA,
                current: null
            });
            kendo.bind(FIXTURES, viewModel);
            multiquiz = element.data('kendoMultiQuiz');
            viewModel.bind('change', function () {
                change();
            });
        });

        it('A change in the viewModel raises a change of widget value', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('checkbox');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (var i = 0; i < viewModel.data.length; i++) {
                var value = [viewModel.data[i].text];
                viewModel.set('current', value);
                expect(multiquiz.value().toJSON()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('input[type="checkbox"]:eq(' + i + ')')).to.be.checked;
            }
        });

        it('A change of widget value raises a change in the viewModel', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('checkbox');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (var i = 0; i < viewModel.data.length; i++) {
                var value = [viewModel.data[i].text];
                multiquiz.value(value);
                multiquiz.trigger('change');
                expect(multiquiz.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('input[type="checkbox"]:eq(' + i + ')')).to.be.checked;
            }
        });

        it('click', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('checkbox');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            var value = [];
            for (var i = 0; i < viewModel.data.length; i++) {
                value.push(viewModel.data[i].text);
                multiquiz.wrapper.find('input[type="checkbox"]:eq(' + i + ')').simulate('click');
                expect(multiquiz.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('input[type="checkbox"]:eq(' + i + ')')).to.be.checked;
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
        var multiquiz;
        var attributes = {
            'data-mode': 'image',
            'data-bind': 'source: data, value: current'
        };
        var change;
        var viewModel;

        beforeEach(function () {
            change = sinon.spy();
            element = $(MULTIQUIZ2).attr(attributes).appendTo(FIXTURES);
            viewModel = kendo.observable({
                data: MULTIQUIZ_DATA,
                current: null
            });
            kendo.bind(FIXTURES, viewModel);
            multiquiz = element.data('kendoMultiQuiz');
            viewModel.bind('change', function () {
                change();
            });
        });

        it('A change in the viewModel raises a change of widget value', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('image');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (var i = 0; i < viewModel.data.length; i++) {
                var value = [viewModel.data[i].text];
                viewModel.set('current', value);
                // Note: multiquiz.value() is an ObservableArray of ObservableObject when value is an array of strings
                expect(multiquiz.value().toJSON()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('div.kj-multiquiz-image:eq(' + i + ')')).to.have.class('k-state-selected');
            }
        });

        it('A change of widget value raises a change in the viewModel', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('image');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (var i = 0; i < viewModel.data.length; i++) {
                var value = [viewModel.data[i].text];
                multiquiz.value(value);
                multiquiz.trigger('change');
                expect(multiquiz.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('div.kj-multiquiz-image:eq(' + i + ')')).to.have.class('k-state-selected');
            }
        });

        it('click', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('image');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            var value = [];
            for (var i = 0; i < viewModel.data.length; i++) {
                value.push(viewModel.data[i].text);
                multiquiz.element.find('div.kj-multiquiz-image:eq(' + i + ')').simulate('click');
                expect(multiquiz.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('div.kj-multiquiz-image:eq(' + i + ')')).to.have.class('k-state-selected');
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
        var multiquiz;
        var attributes = {
            'data-mode': 'link',
            'data-bind': 'source: data, value: current'
        };
        var change;
        var viewModel;

        beforeEach(function () {
            change = sinon.spy();
            element = $(MULTIQUIZ2).attr(attributes).appendTo(FIXTURES);
            viewModel = kendo.observable({
                data: MULTIQUIZ_DATA,
                current: null
            });
            kendo.bind(FIXTURES, viewModel);
            multiquiz = element.data('kendoMultiQuiz');
            viewModel.bind('change', function () {
                change();
            });
        });

        it('A change in the viewModel raises a change of widget value', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('link');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (var i = 0; i < viewModel.data.length; i++) {
                var value = [viewModel.data[i].text];
                viewModel.set('current', value);
                // Note: multiquiz.value() is an ObservableArray of ObservableObject when value is an array of strings
                expect(multiquiz.value().toJSON()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('span.kj-multiquiz-link:eq(' + i + ')')).to.have.class('k-state-selected');
            }
        });

        it('A change of widget value raises a change in the viewModel', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('link');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (var i = 0; i < viewModel.data.length; i++) {
                var value = [viewModel.data[i].text];
                multiquiz.value(value);
                multiquiz.trigger('change');
                expect(multiquiz.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('span.kj-multiquiz-link:eq(' + i + ')')).to.have.class('k-state-selected');
            }
        });

        it('click', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('link');
            expect(multiquiz.multiSelect).to.be.undefined;
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            var value = [];
            for (var i = 0; i < viewModel.data.length; i++) {
                value.push(viewModel.data[i].text);
                multiquiz.element.find('span.kj-multiquiz-link:eq(' + i + ')').simulate('click');
                expect(multiquiz.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(multiquiz.element.find('span.kj-multiquiz-link:eq(' + i + ')')).to.have.class('k-state-selected');
            }
        });

        afterEach(function () {
            var fixtures = $(FIXTURES);
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

    describe('MVVM (and UI interactions) - multiselect', function () {

        var element;
        var multiquiz;
        var attributes = {
            'data-mode': 'multiselect',
            'data-bind': 'source: data, value: current'
        };
        var change;
        var viewModel;

        beforeEach(function () {
            change = sinon.spy();
            element = $(MULTIQUIZ2).attr(attributes).appendTo(FIXTURES);
            viewModel = kendo.observable({
                data: MULTIQUIZ_DATA,
                current: null
            });
            kendo.bind(FIXTURES, viewModel);
            multiquiz = element.data('kendoMultiQuiz');
            viewModel.bind('change', function () {
                change();
            });
        });

        it('A change in the viewModel raises a change of widget value', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('multiselect');
            expect(multiquiz.multiSelect).to.be.an.instanceof(MultiSelect);
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (var i = 0; i < viewModel.data.length; i++) {
                var value = [viewModel.data[i].text];
                viewModel.set('current', value);
                expect(multiquiz.multiSelect.value()).to.deep.equal(value);
                // expect(multiquiz.multiSelect.text()).to.deep.equal(value);
                expect(multiquiz.value().toJSON()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
            }
        });

        it('A change of widget value raises a change in the viewModel', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('multiselect');
            expect(multiquiz.multiSelect).to.be.an.instanceof(MultiSelect);
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (var i = 0; i < viewModel.data.length; i++) {
                var value = [viewModel.data[i].text];
                multiquiz.value(value);
                multiquiz.trigger('change');
                expect(multiquiz.multiSelect.value()).to.deep.equal(value);
                // expect(multiquiz.multiSelect.text()).to.deep.equal(value);
                expect(multiquiz.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
            }
        });

        it('select', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            expect(multiquiz.options.mode).to.equal('multiselect');
            expect(multiquiz.multiSelect).to.be.an.instanceof(MultiSelect);
            expect(multiquiz.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            var value = [];
            for (var i = 0; i < viewModel.data.length; i++) {
                value.push(viewModel.data[i].text);
                multiquiz.multiSelect.element.simulate('click');
                $('div.k-list-container.k-popup').find('li.k-item:eq(' + i + ')').simulate('click');
                expect(multiquiz.multiSelect.value()).to.deep.equal(value);
                // expect(multiquiz.multiSelect.text()).to.deep.equal(value);
                expect(multiquiz.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
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

    describe('Events', function () {

        var element;
        var multiquiz;
        var change;
        var options = {
            dataSource: { data: MULTIQUIZ_DATA },
            mode: 'button',
            itemStyle: { color: 'rgb(0, 0, 255)' },
            activeStyle: { backgroundColor: 'rgb(224, 224, 255)' }
        };

        beforeEach(function () {
            change = sinon.spy();
            element = $(MULTIQUIZ1).appendTo(FIXTURES);
            multiquiz = element.kendoMultiQuiz(options).data('kendoMultiQuiz');
            multiquiz.bind('change', function () {
                change();
            });
        });

        it('change', function () {
            expect(multiquiz).to.be.an.instanceof(MultiQuiz);
            for (var i = 0, length = options.dataSource.data.length; i < length; i++) {
                multiquiz.value([multiquiz.dataSource.at(i).text]);
                multiquiz.trigger('change');
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
