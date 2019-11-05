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
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.multiinput.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    bind,
    destroy,
    init,
    observable,
    ui: { MultiInput, roles }
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.INPUT}>`;
const ROLE = 'multiinput';
const WIDGET = 'kendoMultiInput';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.multiinput', () => {
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
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget)
                .to.have.property('input')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('tagList')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            const { input, tagList, wrapper } = widget;
            expect(input).to.match('input');
            expect(tagList).to.match('ul');
            expect(tagList).to.be.empty;
            expect(wrapper).to.match('div');
            expect(wrapper).to.have.class('k-widget');
            expect(wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                match: '^[a-z]+$',
                value: ['alpha', 'beta', 'gamma']
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget)
                .to.have.property('input')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('tagList')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            const { input, tagList, wrapper } = widget;
            expect(input).to.match('input');
            expect(tagList).to.match('ul');
            expect(tagList).to.have.descendants('>li');
            expect(tagList.children('li'))
                .to.be.an.instanceof($)
                .with.property('length', options.value.length);
            // TODO: We could check that each li contains the correct value
            expect(wrapper).to.match('div');
            expect(wrapper).to.have.class('k-widget');
            expect(wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from markup', () => {
            const attributes = options2attributes({
                role: ROLE
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget)
                .to.have.property('input')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('tagList')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            const { input, tagList, wrapper } = widget;
            expect(input).to.match('input');
            expect(tagList).to.match('ul');
            expect(tagList).to.be.empty;
            expect(wrapper).to.match('div');
            expect(wrapper).to.have.class('k-widget');
            expect(wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from markup with attributes', () => {
            const attributes = options2attributes({
                match: '^[a-z]+$',
                role: ROLE,
                // value: JSON.stringify(['alpha', 'beta', 'gamma']) // <-- Does not work
                value: JSON.stringify(['alpha', 'beta', 'gamma'])
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget)
                .to.have.property('input')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('tagList')
                .that.is.an.instanceof($);
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            const { input, tagList, wrapper } = widget;
            expect(input).to.match('input');
            expect(tagList).to.match('ul');
            expect(tagList).to.have.descendants('>li');
            expect(tagList.children('li'))
                .to.be.an.instanceof($)
                .with.property(
                    'length',
                    JSON.parse(attributes['data-value']).length
                );
            // TODO: We could check that each li contains the correct value
            expect(wrapper).to.match('div');
            expect(wrapper).to.have.class('k-widget');
            expect(wrapper).to.have.class(`kj-${ROLE}`);
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {
            match: '^[a-z]+$',
            value: ['alpha', 'beta', 'gamma']
        };

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
        });

        it('value', () => {
            function fn() {
                widget.value('alpha');
            }
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget.value()).to.deep.equal(options.value);
            expect(widget.tagList).to.exist;
            expect(widget.tagList.children('li').length).to.equal(
                options.value.length
            );
            expect(fn).to.throw();
            const value = ['omega', 'psi'];
            widget.value(value);
            expect(widget.value()).to.deep.equal(value);
            expect(widget.tagList.children('li').length).to.equal(value.length);
            // TODO test match option
        });

        it('focus', done => {
            expect(widget).to.be.an.instanceof(MultiInput);
            const focus = sinon.spy();
            widget.input.on('focus', () => {
                focus();
            });
            widget.focus();
            // Create a new timer to ensure the expectation is executed after the focus event handler
            setTimeout(() => {
                expect(focus).to.have.been.calledOnce;
                done();
            }, 0);
        });

        xit('readonly', () => {
            expect(widget).to.be.an.instanceof(MultiInput);
            // TODO
        });

        it('enable', () => {
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget.wrapper).to.exist;
            expect(widget.input).to.exist;
            widget.enable(false);
            expect(widget.wrapper).to.match('.k-state-disabled');
            expect(widget.input).to.match('input:disabled');
            widget.enable(true);
            expect(widget.wrapper).not.to.match('.k-state-disabled');
            expect(widget.input).not.to.match('input:disabled');
        });

        it('refresh', () => {
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget.value()).to.deep.equal(options.value);
            expect(widget.tagList).to.exist;
            expect(widget.tagList.children('li').length).to.equal(
                options.value.length
            );
            const values = ['omega', 'psi'];
            widget.element.val(JSON.stringify(values));
            widget.refresh();
            expect(widget.value()).to.deep.equal(values);
            expect(widget.tagList.children('li').length).to.equal(
                values.length
            );
        });

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(MultiInput);
            widget.destroy();
            // expect(element.parent()).to.match(`#${FIXTURES}`);
            expect(element.data(WIDGET)).to.be.undefined;
            expect(element).to.be.empty;
            expect(element).not.to.have.class('k-widget');
            expect(element).not.to.have.class(`kj-${ROLE}`);
        });
    });

    describe('MVVM (and UI interactions)', () => {
        const attributes = options2attributes({
            bind: 'value: value',
            match: '^[a-z]+$',
            role: ROLE
        });
        let element;
        let widget;
        let change;
        let viewModel;

        beforeEach(() => {
            element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            change = sinon.spy();
            viewModel = observable({
                value: ['alpha', 'beta', 'gamma']
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data(WIDGET);
            viewModel.bind('change', e => {
                change(e);
            });
        });

        it('change of viewModel changes widget value', () => {
            const { length } = viewModel.value;
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget.tagList).to.exist;
            expect(widget.tagList.children('li').length).to.equal(length);
            viewModel.value.pop();
            expect(change).to.have.callCount(1);
            expect(widget.tagList.children('li').length).to.equal(length - 1);
            viewModel.value.push('omega');
            expect(change).to.have.callCount(2);
            expect(widget.tagList.children('li').length).to.equal(length);
        });

        it('change of widget value changes the viewModel', () => {
            const { length } = viewModel.value;
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget.tagList).to.exist;
            expect(widget.tagList.children('li').length).to.equal(length);
            let value = widget.value().slice();
            value.pop();
            widget.value(value);
            widget.trigger('change');
            expect(change).to.have.callCount(1);
            expect(viewModel.value.length).to.equal(length - 1);
            value = widget.value().slice();
            value.push('omega');
            widget.value(value);
            widget.trigger('change');
            expect(change).to.have.callCount(2);
            expect(viewModel.value.length).to.equal(length);
        });

        it('input', () => {
            const { length } = viewModel.value;
            const { input } = widget;
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(input).to.match('input');
            widget.focus();
            input.val('omega');
            input.simulate(CONSTANTS.KEYPRESS, { keyCode: 44 }); // comma
            input.blur();
            expect(widget.tagList.children('li').length).to.equal(length + 1);
            expect(viewModel.value.length).to.equal(length + 1);
            widget.focus();
            input.val('psi');
            input.simulate(CONSTANTS.KEYPRESS, { keyCode: 59 }); // semi-colon
            input.blur();
            expect(widget.tagList.children('li').length).to.equal(length + 2);
            expect(viewModel.value.length).to.equal(length + 2);
        });

        it('delete', () => {
            const { length } = viewModel.value;
            expect(widget).to.be.an.instanceof(MultiInput);
            let closeButtons = widget.tagList.find('.k-i-close');
            expect(closeButtons.length).to.equal(length);
            closeButtons.last().simulate(CONSTANTS.CLICK);
            expect(viewModel.value.length).to.equal(length - 1);
            expect(widget.tagList.children('li').length).to.equal(length - 1);
            closeButtons = widget.tagList.find('.k-i-close');
            closeButtons.first().simulate(CONSTANTS.CLICK);
            expect(viewModel.value.length).to.equal(length - 2);
            expect(widget.tagList.children('li').length).to.equal(length - 2);
        });
    });

    describe('Events', () => {
        let element;
        let widget;
        let change;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET]().data(WIDGET);
            change = sinon.spy();
        });

        it('Change event', () => {
            expect(widget).to.be.an.instanceof(MultiInput);
            widget.bind('change', e => {
                change(e.sender.value().join(','));
            });
            widget.value(['alpha', 'beta', 'gamma']);
            widget.trigger('change');
            expect(change).to.have.been.calledWith(
                ['alpha', 'beta', 'gamma'].join(',')
            );
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
