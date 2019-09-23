/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
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
import '../../../src/js/widgets/widgets.multiquiz.es6';
import fixKendoRoles from '../_misc/test.roles.es6';

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
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'multiquiz';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const MULTIQUIZ_DATA = [
    {
        text: 'answer 1',
        image:
            'https://cdn.kidoju.com/images/o_collection/svg/office/hand_count_one.svg'
    },
    {
        text: 'answer 2',
        image:
            'https://cdn.kidoju.com/images/o_collection/svg/office/hand_point_up.svg'
    },
    {
        text: 'answer 3',
        image:
            'https://cdn.kidoju.com/images/o_collection/svg/office/hand_count_three.svg'
    },
    {
        text: 'answer 4',
        image:
            'https://cdn.kidoju.com/images/o_collection/svg/office/hand_four.svg'
    },
    {
        text: 'answer 5',
        image:
            'https://cdn.kidoju.com/images/o_collection/svg/office/hand_spread.svg'
    }
];

describe('widgets.multiquiz', () => {
    before(() => {
        if (window.__karma__) {
            if ($(`#${FIXTURES}`).length === 0) {
                $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
            }
            fixKendoRoles();
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoMultiQuiz).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoMultiQuiz().data('kendoMultiQuiz');
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
                dataSource: MULTIQUIZ_DATA,
                mode: 'multiselect',
                itemStyle: { color: 'rgb(255, 0, 0)' },
                activeStyle: { backgroundColor: 'rgb(255, 224, 224)' }
            };
            const widget = element
                .kendoMultiQuiz(options)
                .data('kendoMultiQuiz');
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
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoMultiQuiz');
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
            const attributes = {
                'data-source': JSON.stringify(MULTIQUIZ_DATA),
                'data-mode': 'checkbox',
                'data-group-style': 'border: 1px solid rgb(255, 0, 0);',
                'data-item-style': 'color: rgb(255, 0, 0);',
                'data-active-style': 'background-color: rgb(255, 224, 224);'
            };
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoMultiQuiz');
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
            dataSource: MULTIQUIZ_DATA,
            mode: 'image',
            itemStyle: { color: 'rgb(255, 0, 0)' },
            activeStyle: { backgroundColor: 'rgb(255, 224, 224)' }
        };
        const options2 = {
            dataSource: MULTIQUIZ_DATA,
            mode: 'button',
            itemStyle: { color: 'rgb(0, 0, 255)' },
            activeStyle: { backgroundColor: 'rgb(224, 224, 255)' }
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoMultiQuiz(options1).data('kendoMultiQuiz');
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
        let element;
        let widget;
        const attributes = {
            'data-mode': 'button',
            'data-bind': 'source: data, value: current'
        };
        let change;
        let viewModel;

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data: MULTIQUIZ_DATA,
                current: null
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data('kendoMultiQuiz');
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
                    widget.element.find(`button.kj-widget-button:eq(${i})`)
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
                    widget.element.find(`button.kj-widget-button:eq(${i})`)
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
                    .find(`button.kj-widget-button:eq(${i})`)
                    .simulate('click');
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`button.kj-widget-button:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });
    });

    describe('MVVM (and UI interactions) - checkboxes', () => {
        let element;
        let widget;
        const attributes = {
            'data-mode': 'checkbox',
            'data-bind': 'source: data, value: current'
        };
        let change;
        let viewModel;

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data: MULTIQUIZ_DATA,
                current: null
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data('kendoMultiQuiz');
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
        let element;
        let widget;
        const attributes = {
            'data-mode': 'image',
            'data-bind': 'source: data, value: current'
        };
        let change;
        let viewModel;

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data: MULTIQUIZ_DATA,
                current: null
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data('kendoMultiQuiz');
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
                    widget.element.find(`div.kj-widget-image:eq(${i})`)
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
                    widget.element.find(`div.kj-widget-image:eq(${i})`)
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
                    .find(`div.kj-widget-image:eq(${i})`)
                    .simulate('click');
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`div.kj-widget-image:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });
    });

    describe('MVVM (and UI interactions) - links', () => {
        let element;
        let widget;
        const attributes = {
            'data-mode': 'link',
            'data-bind': 'source: data, value: current'
        };
        let change;
        let viewModel;

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data: MULTIQUIZ_DATA,
                current: null
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data('kendoMultiQuiz');
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
                    widget.element.find(`span.kj-widget-link:eq(${i})`)
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
                    widget.element.find(`span.kj-widget-link:eq(${i})`)
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
                    .find(`span.kj-widget-link:eq(${i})`)
                    .simulate('click');
                expect(widget.value()).to.deep.equal(value);
                expect(viewModel.get('current').toJSON()).to.deep.equal(value);
                expect(change).to.have.callCount(i + 1);
                expect(
                    widget.element.find(`span.kj-widget-link:eq(${i})`)
                ).to.have.class('k-state-selected');
            }
        });
    });

    describe('MVVM (and UI interactions) - multiselect', () => {
        let element;
        let widget;
        const attributes = {
            'data-mode': 'multiselect',
            'data-bind': 'source: data, value: current'
        };
        let change;
        let viewModel;

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            viewModel = observable({
                data: MULTIQUIZ_DATA,
                current: null
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data('kendoMultiQuiz');
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
            dataSource: { data: MULTIQUIZ_DATA },
            mode: 'button',
            itemStyle: { color: 'rgb(0, 0, 255)' },
            activeStyle: { backgroundColor: 'rgb(224, 224, 255)' }
        };

        beforeEach(() => {
            change = sinon.spy();
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoMultiQuiz(options).data('kendoMultiQuiz');
            widget.bind('change', () => {
                change();
            });
        });

        it('change', () => {
            expect(widget).to.be.an.instanceof(MultiQuiz);
            for (
                let i = 0, length = options.dataSource.data.length;
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
        fixtures.empty();
    });
});
