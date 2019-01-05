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
import '../../../src/js/widgets/widgets.mathexpression.es6';

const { afterEach, before, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    destroy,
    init,
    observable,
    ui: { MathExpression }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'mathexpression';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.mathexpression', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoMathExpression).to.be.a('function');
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element
                .kendoMathExpression()
                .data('kendoMathExpression');
            expect(widget).to.be.an.instanceof(MathExpression);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const options = {};
            const widget = element
                .kendoMathExpression()
                .data('kendoMathExpression');
            expect(widget).to.be.an.instanceof(MathExpression);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from markup', () => {
            const element = $(ELEMENT)
                .attr(attr('role'), ROLE)
                .appendTo(FIXTURES);
            init(FIXTURES);
            const widget = element.data('kendoMathExpression');
            expect(widget).to.be.an.instanceof(MathExpression);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        xit('from markup with attributes', () => {
            // TODO: AssetManager might be a bit complex to initialize with attributes...
        });

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.empty();
        });
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element
                .kendoMathExpression(options)
                .data('kendoMathExpression');
        });

        xit('value', done => {
            expect(widget).to.be.an.instanceof(MathExpression);
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        xit('destroy', () => {
            expect(widget).to.be.an.instanceof(MathExpression);
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
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element
                .kendoMathExpression(options)
                .data('kendoMathExpression');
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
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element
                .kendoMathExpression(options)
                .data('kendoMathExpression');
            event = sinon.spy();
        });

        xit('TODO', () => {});
    });

    afterEach(() => {
        const fixtures = $(FIXTURES);
        destroy(fixtures);
        fixtures.empty();
    });
});
