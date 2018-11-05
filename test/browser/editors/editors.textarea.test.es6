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
import { randomVal } from '../../../src/js/common/window.util.es6';
import textarea from '../../../src/js/editors/editors.textarea.es6';

const { afterEach, before, describe, it } = window;
const { expect } = chai;
const { destroy } = window.kendo;
const FIXTURES = '#fixtures';

chai.use((c, u) => chaiJquery(c, u, $));

describe('editors.textarea', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $('body').append('<div id="fixtures"></div>');
        }
    });

    it('Initialization', () => {
        const field = `${randomVal()}.value`;
        textarea(FIXTURES, { field });
        const element = $(FIXTURES).children('textarea');
        expect(element).to.exist;
        expect(element).to.have.attr('data-bind', `value: ${field}`);
    });

    afterEach(() => {
        const fixtures = $(FIXTURES);
        destroy(fixtures);
        fixtures.empty();
    });
});
