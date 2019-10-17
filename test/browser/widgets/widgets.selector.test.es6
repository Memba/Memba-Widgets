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
// import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import '../../../src/js/widgets/widgets.selector.es6';
import { getStageElement } from '../_misc/test.util.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    // attr,
    // bind,
    destroy,
    // init,
    // observable,
    ui: { roles, Selector }
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'selector';
const WIDGET = 'kendoSelector';
const STAGE_ELEMENT = 'div.kj-element';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.selector', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    beforeEach(() => {
        $(`#${FIXTURES}`).append(getStageElement());
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
            const element = $(ELEMENT).appendTo(STAGE_ELEMENT);
            const widget = element[WIDGET]().data(WIDGET);
            expect(widget).to.be.an.instanceof(Selector);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-selector');
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(widget.value()).to.be.empty;
        });

        it('from code with options', () => {
            const element = $(ELEMENT).appendTo(STAGE_ELEMENT);
            const options = {};
            const widget = element[WIDGET](options).data(WIDGET);
            expect(widget).to.be.an.instanceof(Selector);
            expect(element).not.to.have.class('k-widget');
            expect(element).to.have.class('kj-selector');
            expect(widget)
                .to.have.property('wrapper')
                .that.is.an.instanceof($);
            expect(widget.value()).to.be.empty;
        });

        it('from markup', () => {
            expect(true).to.be.false;
        });

        it('from markup with attributes', () => {
            expect(true).to.be.false;
        });
    });

    xdescribe('Methods', () => {
        it('value', () => {
            expect(true).to.be.false;
        });

        it('refresh', () => {
            expect(true).to.be.false;
        });

        it('destroy', () => {
            expect(true).to.be.false;
        });
    });

    xdescribe('MVVM (with UI interactions)', () => {
        it('It should...', () => {
            expect(true).to.be.false;
        });
    });

    xdescribe('Events', () => {
        it('change', () => {
            expect(true).to.be.false;
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
