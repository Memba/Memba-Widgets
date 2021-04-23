/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

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
// import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.unitinput.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    destroy,
    init,
    observable,
    ui: { UnitInput, roles },
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.INPUT}>`;
const ROLE = 'unitinput';
const WIDGET = 'kendoUnitInput';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.unitinput', () => {
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
            expect(widget).to.be.an.instanceof(UnitInput);
            expect(element).not.to.have.class('k-widget');
            // expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                units: ['%', 'px'],
                nonUnits: ['auto', 'inherit', 'initial'],
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(UnitInput);
            expect(widget.wrapper).not.to.have.class('k-widget');
            expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
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
            expect(widget).to.be.an.instanceof(UnitInput);
            expect(widget.wrapper).not.to.have.class('k-widget');
            expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from markup with attributes', () => {
            const attributes = options2attributes({
                nonUnits: ['auto', 'inherit', 'initial'],
                role: ROLE,
                units: ['%', 'px'],
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(UnitInput);
            expect(widget.wrapper).not.to.have.class('k-widget');
            expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
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
            expect(widget).to.be.an.instanceof(UnitInput);
        });

        xit('setOptions', () => {
            // TODO
        });

        xit('destroy', () => {
            expect(widget).to.be.an.instanceof(UnitInput);
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
            expect(element).to.be.an.instanceof($);
            expect(widget);
            expect(viewModel);
            expect(change);
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
            expect(element).to.be.an.instanceof($);
            expect(widget);
            expect(event);
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
