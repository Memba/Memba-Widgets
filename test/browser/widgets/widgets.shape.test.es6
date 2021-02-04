/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-shape import/extensions, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import JSC from 'jscheck';
// import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { options2attributes } from '../_misc/test.util.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.shape.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    // bind,
    destroy,
    init,
    // observable,
    ui: { shape, roles },
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'shape';
const WIDGET = 'kendoShape';

function getOptions() {
    return {
        endCap: {
            fill: {
                color: '#999',
            },
            opacity: JSC.number(0, 1)(),
            scale: 3,
            shape: JSC.one_of(Object.values(shape.fn.shapes))(),
            stroke: {
                width: 0,
            },
        },
        graduations: {
            fill: {
                color: '#999',
            },
            opacity: JSC.number(0, 1)(),
            scale: 4,
            count: 0,
            stroke: {
                color: '#999',
                width: 2,
            },
        },
        shape: {
            // fill: {},
            opacity: JSC.number(0, 1)(),
            stroke: {
                color: '#999',
                dashType: 'solid',
                // lineCap: 'butt',
                // lineJoin: 'miter',
                // opacity: 1,
                width: 5,
            },
        },
        smallGraduations: {
            fill: {
                color: '#999',
            },
            opacity: JSC.number(0, 1)(),
            scale: 3,
            count: 0,
            stroke: {
                color: '#999',
                width: 1,
            },
        },
        startCap: {
            fill: {
                color: '#999',
            },
            opacity: JSC.number(0, 1)(),
            scale: 3,
            shape: JSC.one_of(Object.values(shape.fn.shapes))(),
            stroke: {
                width: 0,
            },
        },
    };
}

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.shape', () => {
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
            expect(widget).to.be.an.instanceof(shape);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            const options = getOptions();
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(shape);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
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
            expect(widget).to.be.an.instanceof(shape);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });

        it('from markup with attributes', () => {
            const attributes = options2attributes({
                role: ROLE,
            });
            const element = $(ELEMENT)
                .attr(attributes)
                .appendTo(`#${FIXTURES}`);
            init(`#${FIXTURES}`);
            const widget = element.data(WIDGET);
            expect(widget).to.be.an.instanceof(shape);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class(`kj-${ROLE}`);
        });
    });

    xdescribe('Methods', () => {
        let options;
        let element;
        let widget;

        beforeEach(() => {
            element = $(ELEMENT).appendTo(`#${FIXTURES}`);
            options = getOptions();
            widget = element[WIDGET](options).data(WIDGET);
        });

        // it('visible', () => {
        //     expect(widget).to.be.an.instanceof(shape);
        //     expect(widget.wrapper).to.be.an.instanceof($).with.property('length', 1);
        //     TODO
        // });

        it('destroy', () => {
            $.noop(widget);
        });
    });

    // describe('MVVM', () => {});

    // describe('UI Interactions', () => {});

    // describe('Events', () => {});

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
