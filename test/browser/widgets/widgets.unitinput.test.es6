/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

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
import '../../../src/js/widgets/widgets.unitinput.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    destroy,
    init,
    observable,
    ui: { UnitInput }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.INPUT}>`;
const ROLE = 'unitinput';

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
            expect($.fn.kendoUnitInput).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoUnitInput().data('kendoUnitInput');
            expect(widget).to.be.an.instanceof(UnitInput);
            // expect(element).to.have.class('k-widget');
            // expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                units: ['%', 'px'],
                nonUnits: ['auto', 'inherit', 'initial']
            };
            const widget = element
                .kendoUnitInput(options)
                .data('kendoUnitInput');
            expect(widget).to.be.an.instanceof(UnitInput);
            // expect(element).to.have.class('k-widget');
            // expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from markup', () => {
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoUnitInput');
            expect(widget).to.be.an.instanceof(UnitInput);
            // expect(element).to.have.class('k-widget');
            // expect(element).to.have.class(`kj-${ROLE}`);
            expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
        });

        xit('from markup with attributes', () => {
            // TODO
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoUnitInput(options).data('kendoUnitInput');
        });

        xit('value', done => {
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
        let destroy;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element.kendoUnitInput(options).data('kendoUnitInput');
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
            widget = element.kendoUnitInput(options).data('kendoUnitInput');
            event = sinon.spy();
        });

        xit('TODO', () => {});
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.empty();
    });
});
