/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

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
import '../../../src/js/widgets/widgets.unitinput.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { UnitInput }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = '<input>';
const ROLE = 'unitinput';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

const UNITINPUT2 = '<input id="unitinput2" data-role="unitinput">';

describe('widgets.unitinput', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoUnitInput).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const unitInput = element.kendoUnitInput().data('kendoUnitInput');
            expect(unitInput).to.be.an.instanceof(UnitInput);
            // expect(element).to.have.class('k-widget');
            // expect(element).to.have.class('kj-unitinput');
            expect(unitInput.wrapper).to.have.class('kj-unitinput');
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const options = {
                units: ['%', 'px'],
                nonUnits: ['auto', 'inherit', 'initial']
            };
            const unitInput = element
                .kendoUnitInput(options)
                .data('kendoUnitInput');
            expect(unitInput).to.be.an.instanceof(UnitInput);
            // expect(element).to.have.class('k-widget');
            // expect(element).to.have.class('kj-unitinput');
            expect(unitInput.wrapper).to.have.class('kj-unitinput');
        });

        it('from markup', () => {
            const element = $(UNITINPUT2).appendTo(FIXTURES);
            init(FIXTURES);
            const unitInput = element.data('kendoUnitInput');
            expect(unitInput).to.be.an.instanceof(UnitInput);
            // expect(element).to.have.class('k-widget');
            // expect(element).to.have.class('kj-unitinput');
            expect(unitInput.wrapper).to.have.class('kj-unitinput');
        });

        xit('from markup with attributes', () => {
            // TODO
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('Methods', () => {
        let element;
        let unitInput;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            unitInput = element.kendoUnitInput(options).data('kendoUnitInput');
        });

        xit('value', done => {
            expect(unitInput).to.be.an.instanceof(UnitInput);
        });

        xit('setOptions', () => {
            // TODO
        });

        xit('destroy', () => {
            expect(unitInput).to.be.an.instanceof(UnitInput);
            unitInput.destroy();
            expect(unitInput.element).to.be.empty;
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('MVVM (and UI interactions)', () => {
        let element;
        let unitInput;
        const options = {};
        let viewModel;
        let change;
        let destroy;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            unitInput = element.kendoUnitInput(options).data('kendoUnitInput');
            viewModel = observable({
                // TODO
            });
            change = sinon.spy();
            destroy = sinon.spy();
        });

        xit('TODO', () => {});

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });
    });

    describe('Events', () => {
        let element;
        let unitInput;
        const options = {};
        let event;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            unitInput = element.kendoUnitInput(options).data('kendoUnitInput');
            event = sinon.spy();
        });

        xit('TODO', () => {});

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.empty();
        });
    });
});
