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
import editors from '../../../src/js/tools/util.editors.es6';

const { afterEach, before, describe, it } = window;
const { expect } = chai;
const { destroy } = window.kendo;
const FIXTURES = '#fixtures';

chai.use((c, u) => chaiJquery(c, u, $));

describe('util.editors', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $('body').append('<div id="fixtures"></div>');
        }
    });

    it('input', () => {
        const field = `${randomVal()}.value`;
        editors.input(FIXTURES, { field });
        const input = $(FIXTURES).children('input');
        expect(input).to.exist;
        expect(input).to.have.attr('data-bind', `value: ${field}`);
    });

    it('span', () => {
        const field = `${randomVal()}.value`;
        editors.span(FIXTURES, { field });
        const span = $(FIXTURES).children('span');
        expect(span).to.exist;
        expect(span).to.have.attr('data-bind', `text: ${field}`);
    });

    it('template', () => {
        const field = `${randomVal()}.value`;
        const template = '<span data-bind="text: #: field #"></span>';
        editors.template(FIXTURES, { field, template });
        const span = $(FIXTURES).children('span');
        expect(span).to.exist;
        expect(span).to.have.attr('data-bind', `text: ${field}`);
    });

    it('textarea', () => {
        const field = `${randomVal()}.value`;
        editors.textarea(FIXTURES, { field });
        const textarea = $(FIXTURES).children('textarea');
        expect(textarea).to.exist;
        expect(textarea).to.have.attr('data-bind', `value: ${field}`);
    });

    afterEach(() => {
        const fixtures = $(FIXTURES);
        destroy(fixtures);
        fixtures.empty();
    });
});
