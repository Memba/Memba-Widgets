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
import '../../../src/js/widgets/widgets.chargrid.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    destroy,
    init,
    observable,
    ui: { CharGrid }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'chargrid';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.chargrid', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoCharGrid).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element.kendoCharGrid().data('kendoCharGrid');
            expect(widget).to.be.an.instanceof(CharGrid);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-chargrid');
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                // TODO
            };
            const widget = element.kendoCharGrid(options).data('kendoCharGrid');
            expect(widget).to.be.an.instanceof(CharGrid);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-chargrid');
        });

        it('from markup', () => {
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data('kendoCharGrid');
            expect(widget).to.be.an.instanceof(CharGrid);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-chargrid');
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
            widget = element.kendoCharGrid(options).data('kendoCharGrid');
        });

        xit('destroy', () => {
            expect(widget).to.be.an.instanceof(CharGrid);
            widget.destroy();
            expect(widget.element).to.be.empty;
        });

        xit('refresh', () => {
            expect(widget).to.be.an.instanceof(CharGrid);
            // TODO
        });

        xit('setOptions', () => {
            expect(widget).to.be.an.instanceof(CharGrid);
            // TODO
        });

        xit('value', () => {
            expect(widget).to.be.an.instanceof(CharGrid);
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
            widget = element.kendoCharGrid(options).data('kendoCharGrid');
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
            widget = element.kendoCharGrid(options).data('kendoCharGrid');
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
