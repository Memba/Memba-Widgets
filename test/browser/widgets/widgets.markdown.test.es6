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
import '../../../src/js/widgets/widgets.markdown.es6';

const { afterEach, before, describe, it } = window;
const { expect } = chai;
const {
    attr,
    destroy,
    init,
    observable,
    ui: { Markdown }
} = window.kendo;
const FIXTURES = '#fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'markdown';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.markdown', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            expect($.fn.kendoMarkdown).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element.kendoMarkdown().data('kendoMarkdown');
            expect(widget).to.be.an.instanceof(Markdown);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-markdown');
        });

        it('from code with options', () => {
            const options = {};
            const element = $(ELEMENT).appendTo(FIXTURES);
            const widget = element.kendoMarkdown(options).data('kendoMarkdown');
            expect(widget).to.be.an.instanceof(Markdown);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-markdown');
        });

        it('from markup', () => {
            const attributes = {};
            attributes[attr('role')] = ROLE;
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(FIXTURES);
            init(FIXTURES);
            const markDown = element.data('kendoMarkdown');
            expect(markDown).to.be.an.instanceof(Markdown);
            // expect(element).to.have.class('k-widget');
            expect(element).to.have.class('kj-markdown');
        });

        xit('from markup with attributes', () => {});
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(FIXTURES);
            widget = element.kendoMarkdown(options).data('kendoMarkdown');
        });

        xit('destroy', () => {
            expect(widget).to.be.an.instanceof(Markdown);
            widget.destroy();
            expect(widget.element).to.be.empty;
        });

        xit('value', done => {
            expect(widget).to.be.an.instanceof(Markdown);
        });

        xit('setOptions', () => {});
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
            widget = element.kendoMarkdown(options).data('kendoMarkdown');
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
            widget = element.kendoMarkdown(options).data('kendoMarkdown');
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
