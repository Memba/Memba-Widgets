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
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { randomVal } from '../../../src/js/common/window.util.es6';
import span from '../../../src/js/editors/editors.span.es6';

const { afterEach, before, describe, it } = window;
const { expect } = chai;
const { destroy } = window.kendo;
const FIXTURES = '#fixtures';

chai.use((c, u) => chaiJquery(c, u, $));

describe('editors.span', () => {
    before(() => {
        if (window.__karma__ && $(FIXTURES).length === 0) {
            $(CONSTANTS.BODY).append('<div id="fixtures"></div>');
        }
    });

    it('Initialization', () => {
        const field = `${randomVal()}.value`;
        span(FIXTURES, { field });
        const element = $(FIXTURES).children('span');
        expect(element).to.exist;
        expect(element).to.have.attr('data-bind', `text: ${field}`);
    });

    afterEach(() => {
        const fixtures = $(FIXTURES);
        destroy(fixtures);
        fixtures.empty();
    });
});
