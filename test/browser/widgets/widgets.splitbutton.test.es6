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
// import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.splitbutton.es6';

const { afterEach, before, beforeEach, describe, it, xdescribe, xit } = window;
const {
    attr,
    // bind,
    destroy,
    init,
    observable,
    ui: { roles, SplitButton }
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'splitbutton';
const WIDGET = 'kendoSplitButton';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.splitbutton', () => {
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
            expect(widget).to.be.an.instanceof(SplitButton);
            expect(element).not.to.have.class('k-widget');
            // expect(element).to.have.class(`kj-${ROLE}`);
            // expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = {
                command: 'align',
                icon: 'align-justify',
                text: 'Align',
                menuButtons: [
                    {
                        command: 'left',
                        icon: 'align-left',
                        text: 'Align Left'
                    },
                    {
                        command: 'center',
                        icon: 'align-center',
                        text: 'Align Center'
                    },
                    {
                        command: 'right',
                        icon: 'align-right',
                        text: 'Align Right'
                    }
                ]
            };
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(SplitButton);
            expect(element).not.to.have.class('k-widget');
            // expect(element).to.have.class(`kj-${ROLE}`);
            // expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from markup', () => {
            const attributes = {};
            attributes[attr('role')] = ROLE;
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(SplitButton);
            expect(element).not.to.have.class('k-widget');
            // expect(element).to.have.class(`kj-${ROLE}`);
            // expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
        });

        it('from markup with attributes', () => {
            const attributes = {
                'data-command': 'align',
                'data-icon': 'align-justify',
                'data-text': 'Align',
                'data-menu-buttons': JSON.stringify([
                    {
                        command: 'left',
                        icon: 'align-left',
                        text: 'Align Left'
                    },
                    {
                        command: 'center',
                        icon: 'align-center',
                        text: 'Align Center'
                    },
                    {
                        command: 'right',
                        icon: 'align-right',
                        text: 'Align Right'
                    }
                ])
            };
            attributes[attr('role')] = ROLE;
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(SplitButton);
            expect(element).not.to.have.class('k-widget');
            // expect(element).to.have.class(`kj-${ROLE}`);
            // expect(widget.wrapper).to.have.class(`kj-${ROLE}`);
        });
    });

    xdescribe('Methods', () => {
        let element;
        let widget;
        const options = {};

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            widget = element[WIDGET](options).data(WIDGET);
        });

        xit('value', () => {
            expect(widget).to.be.an.instanceof(SplitButton);
        });

        xit('setOptions', () => {
            // TODO especially regarding filters (to be enforced)
        });

        xit('destroy', () => {
            expect(widget).to.be.an.instanceof(SplitButton);
            widget.destroy();
            expect(widget.element).to.be.empty;
        });
    });

    xdescribe('MVVM (and UI interactions)', () => {
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
            $.noop(change, viewModel, widget);
        });
    });

    xdescribe('Events', () => {
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
            $.noop(event, widget);
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
