/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
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
import select from '../../../src/js/editors/editors.select.es6';

const { afterEach, before, describe, it } = window;
const { expect } = chai;
const { attr, bind, destroy, observable } = window.kendo;
const FIXTURES = 'fixtures';

chai.use((c, u) => chaiJquery(c, u, $));

describe('editors.select', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    it('Initialization', () => {
        const component = randomVal();
        const field = `${component}.value`;
        const fixtures = $(`#${FIXTURES}`);
        const viewModel = observable({});
        viewModel.set(component, { value: null });
        const source = [
            { text: 'One', value: 1 },
            { text: 'Two', value: 2 }
        ];
        const attributes = {
            'data-text-field': 'text',
            'data-value-field': 'value'
        };
        select(fixtures, { attributes, field, source });
        bind(fixtures, viewModel);
        const element = fixtures.find('select'); // .children('select');
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
