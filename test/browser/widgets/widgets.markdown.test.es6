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
const {
    attr,
    destroy,
    init,
    observable,
    ui: { Markdown, roles }
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'markdown';
const WIDGET = 'kendoMarkdown';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.markdown', () => {
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
            expect(widget).to.be.an.instanceof(Markdown);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-markdown');
        });

        it('from code with options', () => {
            const options = {
                // TODO Add options
            };
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(Markdown);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-markdown');
        });

        it('from markup', () => {
            const attributes = {};
            attributes[attr('role')] = ROLE;
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const markDown = element.data(WIDGET);
            expect(markDown).to.be.an.instanceof(Markdown);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-markdown');
        });

        xit('from markup with attributes', () => {});
    });

    describe('Methods', () => {
        let element;
        let widget;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
        });

        xit('destroy', () => {
            expect(widget).to.be.an.instanceof(Markdown);
            widget.destroy();
            expect(widget.element).to.be.empty;
        });

        xit('value', () => {
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
