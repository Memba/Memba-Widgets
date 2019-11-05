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
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.bitflags.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    // bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { BitFlags, roles }
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.INPUT}>`;
const ROLE = 'bitflags';
const WIDGET = 'kendoBitFlags';

const DATA = [
    { text: JSC.string()(), value: 1 },
    { text: JSC.string()(), value: 2 },
    { text: JSC.string()(), value: 4 },
    { text: JSC.string()(), value: 8 },
    { text: JSC.string()(), value: 16 },
    { text: JSC.string()(), value: 32 },
    { text: JSC.string()(), value: 64 },
    { text: JSC.string()(), value: 128 }
];

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.bitflags', () => {
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
            expect(widget).to.be.an.instanceof(BitFlags);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            const { wrapper } = widget;
            expect(wrapper).to.be.an.instanceof($);
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class('kj-bitflags');
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                dataTextField: 'text',
                dataValueField: 'value',
                autoBind: false,
                // dataSource: DATA,
                placeholder: JSC.string()()
                // value: JSC.integer(0, 255)()
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(BitFlags);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            const { wrapper } = widget;
            expect(wrapper).to.be.an.instanceof($);
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class('kj-bitflags');
        });

        it('from code with options and dataSource', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                textField: 'text',
                valueField: 'value',
                autoBind: false,
                dataSource: DATA,
                placeholder: JSC.string()(),
                // readonly: true,
                value: JSC.integer(0, 255)()
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(BitFlags);
            expect(widget.options.bitflags).to.equal(options.bitflags);
            expect(widget.options.value).to.equal(options.value);
            expect(widget.options.valueField).to.equal(options.valueField);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            const { wrapper } = widget;
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class('kj-bitflags');
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
            expect(widget).to.be.an.instanceof(BitFlags);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            const { wrapper } = widget;
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class('kj-bitflags');
        });

        it('from markup with attributes', () => {
            const attributes = options2attributes({
                source: JSON.stringify(DATA),
                role: ROLE,
                value: JSC.integer(0, 255)()
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(BitFlags);
            expect(widget.options.value).to.equal(attributes['data-value']);
            expect(widget)
                .to.have.property('dataSource')
                .that.is.an.instanceof(DataSource);
            const { wrapper } = widget;
            expect(wrapper).not.to.have.class('k-widget');
            expect(wrapper).to.have.class('kj-bitflags');
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
        });

        xit('value', () => {
            expect(widget).to.be.an.instanceof(BitFlags);
        });

        xit('refresh', () => {
            expect(widget).to.be.an.instanceof(BitFlags);
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        xit('destroy', () => {
            expect(widget).to.be.an.instanceof(BitFlags);
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

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
            viewModel = observable({
                // TODO
            });
            change = sinon.spy();
        });

        xit('TODO', () => {
            $.noop(widget, viewModel, change);
        });
    });

    describe('Events', () => {
        let element;
        let widget;
        const options = {};
        let event;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
            event = sinon.spy();
        });

        xit('TODO', () => {
            $.noop(widget, event);
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
