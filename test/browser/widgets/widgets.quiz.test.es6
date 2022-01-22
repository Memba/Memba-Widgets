/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.quiz.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    bind,
    data: { DataSource /* , ObservableArray */ },
    destroy,
    init,
    observable,
    ui: { DropDownList, roles, Quiz },
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'quiz';
const WIDGET = 'kendoQuiz';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const data = [
    {
        text: 'answer 1',
        image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_count_one.svg',
    },
    {
        text: 'answer 2',
        image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_point_up.svg',
    },
    {
        text: 'answer 3',
        image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_count_three.svg',
    },
    {
        text: 'answer 4',
        image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_four.svg',
    },
    {
        text: 'answer 5',
        image: 'https://cdn.kidoju.com/images/o_collection/svg/office/hand_spread.svg',
    },
];

describe('widgets.quiz', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(window.kendo).not.to.be.undefined;
            expect($.fn[WIDGET]).to.be.a(CONSTANTS.FUNCTION);
            expect(roles[ROLE]).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET]().data(WIDGET);
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('button');
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.dataSource.total()).to.equal(0);
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.dropDownList).to.be.undefined;
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                dataSource: data,
                mode: 'dropdown',
                itemStyle: { color: 'rgb(255, 0, 0)' },
                activeStyle: { backgroundColor: 'rgb(255, 224, 224)' },
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('dropdown');
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.dataSource.total()).to.equal(
                options.dataSource.length
            );
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.dropDownList).to.be.an.instanceof(DropDownList);
            expect(widget.dropDownList.items())
                .to.be.an.instanceof(window.HTMLCollection)
                .with.property('length', options.dataSource.length);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from markup', () => {
            const attributes = options2attributes({
                role: ROLE,
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('button');
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.dataSource.total()).to.equal(0);
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.dropDownList).to.be.undefined;
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from markup with attributes', () => {
            const attributes = options2attributes({
                activeStyle: 'background-color: rgb(255, 224, 224);',
                groupStyle: 'border: 1px solid rgb(255, 0, 0);',
                itemStyle: 'color: rgb(255, 0, 0);',
                mode: 'radio',
                role: ROLE,
                source: JSON.stringify(data),
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('radio');
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.dataSource.total()).to.equal(
                $.parseJSON(attributes['data-source']).length
            );
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.element.find('input[type="button"]')).not.to.exist;
            expect(widget.element.find('input[type="radio"]'))
                .to.be.an.instanceof($)
                .with.property(
                    'length',
                    $.parseJSON(attributes['data-source']).length
                );
            if (!window.PHANTOMJS) {
                // TODO fails in PhantomJS (and in Edge too)
                expect(widget.element.children()).to.have.attr(
                    'style',
                    attributes['data-item-style']
                );
            }
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options1 = {
            dataSource: data,
            mode: 'image',
            itemStyle: { color: 'rgb(255, 0, 0)' },
            activeStyle: { backgroundColor: 'rgb(255, 224, 224)' },
        };
        const options2 = {
            dataSource: data,
            mode: 'button',
            itemStyle: { color: 'rgb(0, 0, 255)' },
            activeStyle: { backgroundColor: 'rgb(224, 224, 255)' },
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options1).data(WIDGET);
        });

        it('value', () => {
            function fn1() {
                widget.value(1);
            }
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.value()).to.be.null; // Cannot use undefined
            expect(fn1).to.throw(TypeError);
            widget.value('dummy');
            expect(widget.value()).to.be.null;
            for (let i = 0; i < widget.dataSource.total(); i++) {
                const value = widget.dataSource.at(i).text;
                widget.value(value);
                expect(widget.value()).to.equal(value);
                widget.value('dummy');
                expect(widget.value()).to.be.null;
            }
        });

        it('enable', () => {
            // TODO button and radio???
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('image');
            // expect(widget.dropDownList).to.be.an.instanceof(DropDownList);
            // expect(widget.dropDownList.element.find('input')).to.have.prop('disabled', false);
            widget.enable(false);
            // expect(widget.dropDownList.element.find('input')).to.have.prop('disabled', true);
        });

        xit('setOptions and refresh', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal(options1.mode);
            // TODO
            widget.setOptions(options2);
            expect(widget.options.mode).to.equal(options1.mode);
            // TODO
        });

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            // expect($('div.k-list-container.k-popup')).to.exist;
            widget.destroy();
            // expect($('div.k-list-container.k-popup')).not.to.exist;
        });
    });

    describe('MVVM (and UI interactions) - buttons', () => {
        let element;
        let widget;
        const attributes = options2attributes({
            bind: 'source: data, value: current',
            mode: 'button',
            role: ROLE,
        });
        let change;
        let viewModel;

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).attr(attributes).appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data,
                current: null,
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
            viewModel.bind('change', () => {
                change();
            });
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('button');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                viewModel.set('current', value);
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`button.kj-quiz-button:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('button');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                widget.value(value);
                widget.trigger('change');
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`button.kj-quiz-button:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('click', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('button');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                widget.element
                    .find(`button.kj-quiz-button:eq(${i})`)
                    .simulate('click');
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`button.kj-quiz-button:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });
    });

    describe('MVVM (and UI interactions) - dropdown', () => {
        let element;
        let widget;
        const attributes = options2attributes({
            bind: 'source: data, value: current',
            mode: 'dropdown',
            role: ROLE,
        });
        let change;
        let viewModel;

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).attr(attributes).appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data,
                current: null,
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
            viewModel.bind('change', () => {
                change();
            });
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('dropdown');
            expect(widget.dropDownList).to.be.an.instanceof(DropDownList);
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                viewModel.set('current', value);
                expect(widget.dropDownList.value()).to.equal(value);
                expect(widget.dropDownList.text()).to.equal(value);
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
            }
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('dropdown');
            expect(widget.dropDownList).to.be.an.instanceof(DropDownList);
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                widget.value(value);
                widget.trigger('change');
                expect(widget.dropDownList.value()).to.equal(value);
                expect(widget.dropDownList.text()).to.equal(value);
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
            }
        });

        it('select', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('dropdown');
            expect(widget.dropDownList).to.be.an.instanceof(DropDownList);
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                widget.dropDownList.element.simulate('click');
                $('div.k-popup > .k-list')
                    .find(`li.k-list-item:eq(${i})`)
                    .simulate('click');
                expect(widget.dropDownList.value()).to.equal(value);
                expect(widget.dropDownList.text()).to.equal(value);
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
            }
        });
    });

    describe('MVVM (and UI interactions) - images', () => {
        let element;
        let widget;
        const attributes = options2attributes({
            bind: 'source: data, value: current',
            mode: 'image',
            role: ROLE,
        });
        let change;
        let viewModel;

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).attr(attributes).appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data,
                current: null,
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
            viewModel.bind('change', () => {
                change();
            });
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('image');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                viewModel.set('current', value);
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`div.kj-quiz-image:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('image');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                widget.value(value);
                widget.trigger('change');
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`div.kj-quiz-image:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('click', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('image');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                widget.element
                    .find(`div.kj-quiz-image:eq(${i})`)
                    .simulate('click');
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`div.kj-quiz-image:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });
    });

    describe('MVVM (and UI interactions) - links', () => {
        let element;
        let widget;
        const attributes = options2attributes({
            bind: 'source: data, value: current',
            mode: 'link',
            role: ROLE,
        });
        let change;
        let viewModel;

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).attr(attributes).appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data,
                current: null,
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
            viewModel.bind('change', () => {
                change();
            });
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('link');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                viewModel.set('current', value);
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`span.kj-quiz-link:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('link');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                widget.value(value);
                widget.trigger('change');
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`span.kj-quiz-link:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('click', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('link');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                widget.element
                    .find(`span.kj-quiz-link:eq(${i})`)
                    .simulate('click');
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`span.kj-quiz-link:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });
    });

    describe('MVVM (and UI interactions) - radios', () => {
        let element;
        let widget;
        const attributes = options2attributes({
            bind: 'source: data, value: current',
            mode: 'radio',
            role: ROLE,
        });
        let change;
        let viewModel;

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).attr(attributes).appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data,
                current: null,
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
            viewModel.bind('change', () => {
                change();
            });
        });

        it('A change in the viewModel raises a change of widget value', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('radio');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                viewModel.set('current', value);
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(widget.element.find(`input[type="radio"]:eq(${i})`)).to
                    .be.checked;
            }
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('radio');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                widget.value(value);
                widget.trigger('change');
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(widget.element.find(`input[type="radio"]:eq(${i})`)).to
                    .be.checked;
            }
        });

        it('click', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            expect(widget.options.mode).to.equal('radio');
            expect(widget.dropDownList).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = viewModel.data[i].text;
                widget.wrapper
                    .find(`input[type="radio"]:eq(${i})`)
                    .simulate('click');
                expect(widget.value()).to.equal(value);
                expect(viewModel.get('current')).to.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(widget.element.find(`input[type="radio"]:eq(${i})`)).to
                    .be.checked;
            }
        });
    });

    describe('Events', () => {
        let element;
        let widget;
        let change;
        const options = {
            dataSource: { data },
            mode: 'button',
            itemStyle: { color: 'rgb(0, 0, 255)' },
            activeStyle: { backgroundColor: 'rgb(224, 224, 255)' },
        };

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
            widget.bind('change', () => {
                change();
            });
        });

        it('change', () => {
            expect(widget).to.be.an.instanceof(Quiz);
            for (
                let i = 0, { length } = options.dataSource.data;
                i < length;
                i++
            ) {
                widget.value(widget.dataSource.at(i).text);
                widget.trigger('change');
                expect(change).to.have.callCount(i + 1);
            }
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
