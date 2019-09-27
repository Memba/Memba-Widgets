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
import '../../../src/js/widgets/widgets.vectordrawing.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const { expect } = chai;
const {
    attr,
    bind,
    data: { DataSource },
    destroy,
    init,
    observable,
    ui: { VectorDrawing }
} = window.kendo;
const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'vectordrawing';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.vectordrawing', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    describe('Availability', () => {
        it('requirements', () => {
            // TODO Toolbar
            expect($.fn.kendoVectorDrawing).to.be.a(CONSTANTS.FUNCTION);
        });
    });

    describe('Initialization', () => {
        it('from code', () => {
            expect(true).to.be.false;
        });

        it('from code with options', () => {
            expect(true).to.be.false;
        });

        it('from markup', () => {
            expect(true).to.be.false;
        });

        it('from markup with attributes', () => {
            expect(true).to.be.false;
        });
    });

    describe('Methods', () => {
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

    describe('MVVM (with UI interactions)', () => {
        it('It should...', () => {
            expect(true).to.be.false;
        });
    });

    describe('Events', () => {
        it('change', () => {
            expect(true).to.be.false;
        });
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.empty();
    });
});