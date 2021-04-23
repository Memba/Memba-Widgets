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
import '../../../src/js/widgets/widgets.multiquiz.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { MultiQuiz, MultiSelect, roles },
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'multiquiz';
const WIDGET = 'kendoMultiQuiz';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const data = [
    {
        text: 'answer 1',
        image:
            'https://cdn.kidoju.com/images/o_collection/svg/office/hand_count_one.svg',
    },
    {
        text: 'answer 2',
        image:
            'https://cdn.kidoju.com/images/o_collection/svg/office/hand_point_up.svg',
    },
    {
        text: 'answer 3',
        image:
            'https://cdn.kidoju.com/images/o_collection/svg/office/hand_count_three.svg',
    },
    {
        text: 'answer 4',
        image:
            'https://cdn.kidoju.com/images/o_collection/svg/office/hand_four.svg',
    },
    {
        text: 'answer 5',
        image:
            'https://cdn.kidoju.com/images/o_collection/svg/office/hand_spread.svg',
    },
];

describe('widgets.multiquiz', () => {
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
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('button');
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.dataSource.total()).to.equal(0);
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.multiSelect).to.be.undefined;
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                dataSource: data,
                mode: 'multiselect',
                itemStyle: { color: 'rgb(255, 0, 0)' },
                activeStyle: { backgroundColor: 'rgb(255, 224, 224)' },
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('multiselect');
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.dataSource.total()).to.equal(
                options.dataSource.length
            );
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.multiSelect).to.be.an.instanceof(MultiSelect);
            expect(widget.multiSelect.items())
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
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('button');
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.dataSource.total()).to.equal(0);
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.multiSelect).to.be.undefined;
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from markup with attributes', () => {
            const attributes = options2attributes({
                activeStyle: 'background-color: rgb(255, 224, 224);',
                groupStyle: 'border: 1px solid rgb(255, 0, 0);',
                itemStyle: 'color: rgb(255, 0, 0);',
                mode: 'checkbox',
                role: ROLE,
                source: JSON.stringify(data),
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('checkbox');
            expect(widget.dataSource).to.be.an.instanceof(DataSource);
            expect(widget.dataSource.total()).to.equal(
                $.parseJSON(attributes['data-source']).length
            );
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.element.find('input[type="button"]')).not.to.exist;
            expect(widget.element.find('input[type="checkbox"]'))
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
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.value()).to.be.null; // Cannot use undefined
            expect(fn1).to.throw(TypeError);
            widget.value(['dummy']);
            expect(widget.value()).to.deep.equal([]);
            for (let i = 0; i < widget.dataSource.total(); i++) {
                // TODO Make an array and push values, assign and compare
                const value = [widget.dataSource.at(i).text];
                widget.value(value);
                expect(widget.value()).to.deep.equal(value);
                widget.value(['dummy']);
                expect(widget.value()).to.deep.equal([]);
            }
        });

        it('enable', () => {
            // TODO button and checkbox???
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('image');
            // expect(widget.multiSelect).to.be.an.instanceof(MultiSelect);
            // expect(widget.multiSelect.element.find('input')).to.have.prop('disabled', false);
            widget.enable(false);
            // expect(widget.multiSelect.element.find('input')).to.have.prop('disabled', true);
        });

        xit('setOptions and refresh', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal(options1.mode);
            // TODO
            widget.setOptions(options2);
            expect(widget.options.mode).to.equal(options1.mode);
            // TODO
        });

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            widget.destroy();
        });
    });

    describe('MVVM (and UI interactions) - buttons', () => {
        const attributes = options2attributes({
            bind: 'source: data, value: current',
            mode: 'button',
            role: ROLE,
        });
        let element;
        let widget;
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
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('button');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = [viewModel.data[i].text];
                viewModel.set('current', value);
                // Note: widget.value() is an ObservableArray of ObservableObject when value is an array of strings
                expect(widget.value().toJSON()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`button.kj-multiquiz-button:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('button');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = [viewModel.data[i].text];
                widget.value(value);
                widget.trigger('change');
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`button.kj-multiquiz-button:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('click', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('button');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            const value = [];
            for (let i = 0; i < viewModel.data.length; i++) {
                value.push(viewModel.data[i].text);
                widget.element
                    .find(`button.kj-multiquiz-button:eq(${i})`)
                    .simulate('click');
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`button.kj-multiquiz-button:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });
    });

    describe('MVVM (and UI interactions) - checkboxes', () => {
        const attributes = options2attributes({
            bind: 'source: data, value: current',
            mode: 'checkbox',
            role: ROLE,
        });
        let element;
        let widget;
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
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('checkbox');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = [viewModel.data[i].text];
                viewModel.set('current', value);
                expect(widget.value().toJSON()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(widget.element.find(`input[type="checkbox"]:eq(${i})`))
                    .to.be.checked;
            }
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('checkbox');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = [viewModel.data[i].text];
                widget.value(value);
                widget.trigger('change');
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(widget.element.find(`input[type="checkbox"]:eq(${i})`))
                    .to.be.checked;
            }
        });

        it('click', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('checkbox');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            const value = [];
            for (let i = 0; i < viewModel.data.length; i++) {
                value.push(viewModel.data[i].text);
                widget.wrapper
                    .find(`input[type="checkbox"]:eq(${i})`)
                    .simulate('click');
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(widget.element.find(`input[type="checkbox"]:eq(${i})`))
                    .to.be.checked;
            }
        });
    });

    describe('MVVM (and UI interactions) - images', () => {
        const attributes = options2attributes({
            bind: 'source: data, value: current',
            mode: 'image',
            role: ROLE,
        });
        let element;
        let widget;
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
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('image');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = [viewModel.data[i].text];
                viewModel.set('current', value);
                // Note: widget.value() is an ObservableArray of ObservableObject when value is an array of strings
                expect(widget.value().toJSON()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`div.kj-multiquiz-image:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('image');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = [viewModel.data[i].text];
                widget.value(value);
                widget.trigger('change');
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`div.kj-multiquiz-image:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('click', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('image');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            const value = [];
            for (let i = 0; i < viewModel.data.length; i++) {
                value.push(viewModel.data[i].text);
                widget.element
                    .find(`div.kj-multiquiz-image:eq(${i})`)
                    .simulate('click');
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`div.kj-multiquiz-image:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });
    });

    describe('MVVM (and UI interactions) - links', () => {
        const attributes = options2attributes({
            bind: 'source: data, value: current',
            mode: 'link',
            role: ROLE,
        });
        let element;
        let widget;
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
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('link');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = [viewModel.data[i].text];
                viewModel.set('current', value);
                // Note: widget.value() is an ObservableArray of ObservableObject when value is an array of strings
                expect(widget.value().toJSON()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`span.kj-multiquiz-link:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('link');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = [viewModel.data[i].text];
                widget.value(value);
                widget.trigger('change');
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`span.kj-multiquiz-link:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });

        it('click', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('link');
            expect(widget.multiSelect).to.be.undefined;
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            const value = [];
            for (let i = 0; i < viewModel.data.length; i++) {
                value.push(viewModel.data[i].text);
                widget.element
                    .find(`span.kj-multiquiz-link:eq(${i})`)
                    .simulate('click');
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`span.kj-multiquiz-link:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });
    });

    describe('MVVM (and UI interactions) - multiselect', () => {
        const attributes = options2attributes({
            bind: 'source: data, value: current',
            mode: 'multiselect',
            role: ROLE,
        });
        let element;
        let widget;
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
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('multiselect');
            expect(widget.multiSelect).to.be.an.instanceof(MultiSelect);
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = [viewModel.data[i].text];
                viewModel.set('current', value);
                expect(widget.multiSelect.value()).to.deep.equal(value);
                // expect(widget.multiSelect.text()).to.deep.equal(value);
                expect(widget.value().toJSON()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
            }
        });

        it('A change of widget value raises a change in the viewModel', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('multiselect');
            expect(widget.multiSelect).to.be.an.instanceof(MultiSelect);
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            for (let i = 0; i < viewModel.data.length; i++) {
                const value = [viewModel.data[i].text];
                widget.value(value);
                widget.trigger('change');
                expect(widget.multiSelect.value()).to.deep.equal(value);
                // expect(widget.multiSelect.text()).to.deep.equal(value);
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
            }
        });

        it('select', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            expect(widget.options.mode).to.equal('multiselect');
            expect(widget.multiSelect).to.be.an.instanceof(MultiSelect);
            expect(widget.value()).to.be.null;
            expect(viewModel.get('current')).to.be.null;
            const value = [];
            for (let i = 0; i < viewModel.data.length; i++) {
                value.push(viewModel.data[i].text);
                widget.multiSelect.element.simulate('click');
                $('div.k-list-container.k-popup')
                    .find(`li.k-item:eq(${i})`)
                    .simulate('click');
                expect(widget.multiSelect.value()).to.deep.equal(value);
                // expect(widget.multiSelect.text()).to.deep.equal(value);
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
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
            expect(widget).to.be.an.instanceof(MultiQuiz);
            for (
                let i = 0, { length } = options.dataSource.data;
                i < length;
                i++
            ) {
                widget.value([widget.dataSource.at(i).text]);
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
