/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
// import 'kendo.core';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { makeInput } from '../../../src/js/tools/util.validators.es6';

const { describe, it } = window;
const { expect } = chai;

chai.use((c, u) => chaiJquery(c, u, $));
chai.use(sinonChai);

describe('util.validators', () => {
    describe('makeInput', () => {
        it('it should make an input from a property name and value', () => {
            const name = JSC.string(
                JSC.integer(1, 10),
                JSC.character('a', 'z')
            )();
            const value = JSC.string()();
            const input = makeInput(name, value);
            expect(input).to.match(`[name="${name}"]`);
            expect(input).to.have.value(value);
        });
    });


});
