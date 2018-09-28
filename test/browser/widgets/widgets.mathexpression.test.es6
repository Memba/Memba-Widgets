/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import '../../../src/js/widgets/widgets.mathexpression.es6';

const { afterEach, before, describe, it } = window;
const { expect } = chai;
const {
    attr,
    destroy,
    ui: { MathExpression }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = '<div/>';
const ROLE = 'mathexpression';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.mathexpression', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $('body').append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($).not.to.be.undefined;
            expect(window.kendo).not.to.be.undefined;
            expect($.fn.kendoMathExpression).to.be.an.instanceof(Function);
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
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const options = {};
            const widget = element
                .kendoMathExpression()
                .data('kendoMathExpression');
            expect(widget).to.be.an.instanceof(MathExpression);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-mathexpression');
        });

        it('from markup', () => {
            const element = $(ELEMENT)
                .attr()
                .appendTo(FIXTURES);
            kendo.init(FIXTURES);
            const dropZone = element.data('kendoMathExpression');
            expect(dropZone).to.be.an.instanceof(MathExpression);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-mathexpression');
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

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.empty();
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
            viewModel = kendo.observable({
                // TODO
            });
            change = sinon.spy();
            destroy = sinon.spy();
        });

        xit('TODO', () => {});

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.empty();
        });
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

        afterEach(() => {
            const fixtures = $(FIXTURES);
            destroy(fixtures);
            fixtures.empty();
        });
    });
});
