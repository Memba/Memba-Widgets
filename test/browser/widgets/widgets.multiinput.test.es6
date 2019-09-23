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
import '../../../src/js/widgets/widgets.multiinput.es6';
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
    ui: { MultiInput }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.INPUT}>`;
const ROLE = 'multiinput';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.multiinput', () => {
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
            expect($.fn.kendoMultiInput).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoMultiInput().data('kendoMultiInput');
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget)
                .to.have.property('tagList')
                .that.is.an.instanceof($);
            const tagList = widget.tagList;
            expect(tagList).to.match('ul');
            expect(tagList).to.be.empty;
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            const wrapper = widget.wrapper;
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
            const widget = element
                .kendoMultiInput(options)
                .data('kendoMultiInput');
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget)
                .to.have.property('tagList')
                .that.is.an.instanceof($);
            const tagList = widget.tagList;
            expect(tagList).to.match('ul');
            expect(tagList).to.have.descendants('>li');
            expect(tagList.children('li'))
                .to.be.an.instanceof($)
                .with.property('length', options.value.length);
            // TODO: We could check that each li contains the correct value
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            const wrapper = widget.wrapper;
            expect(wrapper).to.match('div');
            expect(wrapper).to.have.class('k-widget');
            expect(wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from markup', () => {
            const options = {};
            const element = $(ELEMENT).attr(attr('role'), ROLE)
                .attr(options)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoMultiInput');
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget)
                .to.have.property('tagList')
                .that.is.an.instanceof($);
            const tagList = widget.tagList;
            expect(tagList).to.match('ul');
            expect(tagList).to.be.empty;
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            const wrapper = widget.wrapper;
            expect(wrapper).to.match('div');
            expect(wrapper).to.have.class('k-widget');
            expect(wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from markup with attributes', () => {
            const attributes = {
                'data-match': '^[a-z]+$',
                // value: JSON.stringify(['alpha', 'beta', 'gamma']) // <-- Does not work
                'data-value': JSON.stringify(['alpha', 'beta', 'gamma'])
            };
            const element = $(ELEMENT).attr(attr('role'), ROLE)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoMultiInput');
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget)
                .to.have.property('tagList')
                .that.is.an.instanceof($);
            const tagList = widget.tagList;
            expect(tagList).to.match('ul');
            expect(tagList).to.have.descendants('>li');
            expect(tagList.children('li'))
                .to.be.an.instanceof($)
                .with.property(
                    'length',
                    JSON.parse(attributes['data-value']).length
                );
            // TODO: We could check that each li contains the correct value
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            const wrapper = widget.wrapper;
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
            widget = element.kendoMultiInput(options).data('kendoMultiInput');
        });

        it('value', () => {
            const fn = function() {
                widget.value('alpha');
            };
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
            widget.element.on('focus', () => {
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
            expect(widget.element).to.exist;
            widget.enable(false);
            expect(widget.wrapper).to.match('.k-state-disabled');
            expect(widget.element).to.match('input:disabled');
            widget.enable(true);
            expect(widget.wrapper).not.to.match('.k-state-disabled');
            expect(widget.element).not.to.match('input:disabled');
        });

        it('refresh', () => {
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget.value()).to.deep.equal(options.value);
            expect(widget.tagList).to.exist;
            expect(widget.tagList.children('li').length).to.equal(
                options.value.length
            );
            const values = ['omega', 'psi'];
            widget._values = values;
            widget.refresh();
            expect(widget.value()).to.deep.equal(values);
            expect(widget.tagList.children('li').length).to.equal(
                values.length
            );
        });

        it('destroy', () => {
            expect(widget).to.be.an.instanceof(MultiInput);
            widget.destroy();
            expect(element.parent()).to.match(`#${FIXTURES}`);
            expect(element.data('kendoMultiInput')).to.be.undefined;
            expect(element).to.be.empty;
            expect(element).not.to.have.class('k-widget');
            expect(element).not.to.have.class(`kj-${ROLE}`);
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let widget;
        const attributes = {
            'data-match': '^[a-z]+$',
            'data-bind': 'value: value'
        };
        let change;
        let viewModel;

        beforeEach(() => {
            element = $(ELEMENT).attr(attr('role'), ROLE)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            change = sinon.spy();
            viewModel = observable({
                value: ['alpha', 'beta', 'gamma']
            });
            bind(`#${FIXTURES}`, viewModel);
            widget = element.data('kendoMultiInput');
            viewModel.bind('change', e => {
                change();
            });
        });

        it('change of viewModel changes widget value', () => {
            const length = viewModel.value.length;
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget.tagList).to.exist;
            expect(widget.tagList.children('li').length).to.equal(length);
            viewModel.value.pop(); // TODO: This triggers 2 changes
            expect(change).to.have.callCount(2);
            expect(widget.tagList.children('li').length).to.equal(length - 1);
            viewModel.value.push('omega'); // TODO: This triggers 2 changes
            expect(change).to.have.callCount(4);
            expect(widget.tagList.children('li').length).to.equal(length);
        });

        it('change of widget value changes the viewModel', () => {
            const length = viewModel.value.length;
            expect(widget).to.be.an.instanceof(MultiInput);
            expect(widget.tagList).to.exist;
            expect(widget.tagList.children('li').length).to.equal(length);
            let value = widget.value().slice();
            value.pop();
            widget.value(value);
            expect(change).to.have.callCount(1);
            expect(viewModel.value.length).to.equal(length - 1);
            value = widget.value().slice();
            value.push('omega');
            widget.value(value);
            expect(change).to.have.callCount(2);
            expect(viewModel.value.length).to.equal(length);
        });

        it('input', () => {
            const length = viewModel.value.length;
            const input = widget.element;
            expect(input).to.match('input');
            expect(widget).to.be.an.instanceof(MultiInput);
            widget.focus();
            input.val('omega');
            input.simulate('keypress', { keyCode: 44 }); // comma
            expect(viewModel.value.length).to.equal(length + 1);
            expect(widget.tagList.children('li').length).to.equal(length + 1);
            widget.focus();
            input.val('psi');
            input.simulate('keypress', { keyCode: 59 }); // semi-colon
            expect(viewModel.value.length).to.equal(length + 2);
            expect(widget.tagList.children('li').length).to.equal(length + 2);
        });

        it('delete', () => {
            const length = viewModel.value.length;
            expect(widget).to.be.an.instanceof(MultiInput);
            const closeButtons = widget.tagList.find('.k-i-close');
            expect(closeButtons.length).to.equal(length);
            closeButtons.last().simulate(CONSTANTS.CLICK);
            expect(viewModel.value.length).to.equal(length - 1);
            expect(widget.tagList.children('li').length).to.equal(length - 1);
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
            widget = element.kendoMultiInput().data('kendoMultiInput');
            change = sinon.spy();
        });

        it('Change event', () => {
            expect(widget).to.be.an.instanceof(MultiInput);
            widget.bind('change', e => {
                change(e.sender.value().join(','));
            });
            widget.value(['alpha', 'beta', 'gamma']);
            expect(change).to.have.been.calledWith(
                ['alpha', 'beta', 'gamma'].join(',')
            );
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.empty();
    });
});
