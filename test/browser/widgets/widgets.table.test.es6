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
import '../../../src/js/widgets/widgets.table.es6';

const { afterEach, before, beforeEach, describe, it } = window;
const {
    attr,
    bind,
    data: { DataSource, ObservableArray },
    destroy,
    init,
    observable,
    ui: { roles, Table }
} = window.kendo;
const { expect } = chai;

const FIXTURES = 'fixtures';
const ELEMENT = `<${CONSTANTS.DIV}/>`;
const ROLE = 'table';
const WIDGET = 'kendoTable';

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('widgets.table', () => {
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
        fixtures.find('*').off();
        fixtures.empty();
    });
});
