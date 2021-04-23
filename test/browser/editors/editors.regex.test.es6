/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { randomVal } from '../../../src/js/common/window.util.es6';
import regex from '../../../src/js/editors/editors.regex.es6';

const { afterEach, before, describe, it } = window;
const { expect } = chai;
const { attr, bind, destroy, observable } = window.kendo;
const FIXTURES = 'fixtures';

chai.use((c, u) => chaiJquery(c, u, $));

describe('editors.regex', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    it('Initialization', () => {
        const field = `${randomVal()}.value`;
        const fixtures = $(`#${FIXTURES}`);
        const viewModel = observable({ value: null });
        regex(fixtures, { field });
        bind(fixtures, viewModel);
        const element = fixtures.children('input');
        expect(element).to.exist;
        expect(element).to.have.attr(attr('bind'), `value: ${field}`);
    });

    afterEach(() => {
        const fixtures = $(`#${FIXTURES}`);
        destroy(fixtures);
        fixtures.find('*').off();
        fixtures.empty();
    });
});
