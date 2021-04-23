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
import '../../../src/js/experiments/widgets.buttonset.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { ButtonSet }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.INPUT}>`;
const ROLE = 'buttonset';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.buttonset', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoButtonSet).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoButtonSet().data('kendoButtonSet');
            expect(widget).to.be.an.instanceof(ButtonSet);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-buttonset');
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                buttonset: 'script1',
                value: 'Todd'
            };
            const widget = element
                .kendoButtonSet(options)
                .data('kendoButtonSet');
            expect(widget).to.be.an.instanceof(ButtonSet);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-buttonset');
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
        });

        it('from code with options and dataSource', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                buttonset: 'script2',
                value: 2,
                valueField: 'id',
                dataSource: [
                    { id: 1, name: 'London' },
                    { id: 2, name: 'New York' },
                    { id: 3, name: 'Paris' }
                ]
            };
            const widget = element
                .kendoButtonSet(options)
                .data('kendoButtonSet');
            expect(widget).to.be.an.instanceof(ButtonSet);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-buttonset');
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.options.buttonset).to.equal(options.buttonset);
            expect(widget.options.value).to.equal(options.value);
            expect(widget.options.valueField).to.equal(options.valueField);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(element.text()).to.include(
                widget.dataSource.get(options.value).name
            );
        });

        it('from markup', () => {
            const attributes = options2attributes({
                role: ROLE
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoButtonSet');
            expect(widget).to.be.an.instanceof(ButtonSet);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-buttonset');
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
        });

        it('from markup with attributes', () => {
            const attributes = options2attributes({
                role: ROLE
                // TODO more...
            });
            const element = $(ELEMENT)
            .attr(attributes)
            .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoButtonSet');
            expect(widget).to.be.an.instanceof(ButtonSet);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-buttonset');
            expect(widget.element).to.be.an.instanceof($);
            expect(widget.wrapper).to.be.an.instanceof($);
            expect(widget.options.buttonset).to.be.a('function');
            expect(widget.options.value).to.equal(attributes['data-value']);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            expect(element.text()).to.include(attributes['data-value']);
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoButtonSet(options).data('kendoButtonSet');
        });

        xit('value', done => {
            expect(widget).to.be.an.instanceof(ButtonSet);
        });

        xit('refresh', done => {
            expect(widget).to.be.an.instanceof(ButtonSet);
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        xit('destroy', () => {
            expect(widget).to.be.an.instanceof(ButtonSet);
            widget.destroy();
            expect(widget.element).to.be.empty;
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let widget;
        const options = {};
        let viewModel;
        let change;
        let destroy;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoButtonSet(options).data('kendoButtonSet');
            viewModel = observable({
                // TODO
            });
            change = sinon.spy();
            destroy = sinon.spy();
        });

        xit('TODO', () => {});
    });

    describe('Events', () => {
        let element;
        let widget;
        const options = {};
        let event;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoButtonSet(options).data('kendoButtonSet');
            event = sinon.spy();
        });

        xit('TODO', () => {});
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
