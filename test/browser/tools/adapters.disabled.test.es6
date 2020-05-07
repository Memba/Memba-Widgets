/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { randomVal } from '../../../src/js/common/window.util.es6';
import DisabledAdapter from '../../../src/js/tools/adapters.disabled.es6';

const { describe, it } = window;
const { expect } = chai;

describe('adapters.disabled', () => {
    describe('DisabledAdapter', () => {
        const adapter = new DisabledAdapter();

        it('It should have descriptors', () => {
            expect(Object.keys(adapter)).to.have.lengthOf(14);
            expect(adapter).to.have.property('attributes').that.is.undefined;
            expect(adapter).to.have.property('defaultValue', false);
            expect(adapter).to.have.property('editable').that.is.undefined;
            expect(adapter).to.have.property('editor').that.is.a('function');
            expect(adapter).to.have.property('field').that.is.undefined;
            expect(adapter).to.have.property('format').that.is.undefined;
            expect(adapter).to.have.property('from').that.is.undefined;
            expect(adapter).to.have.property('help').that.is.undefined;
            expect(adapter).to.have.property('nullable').that.is.undefined;
            expect(adapter).to.have.property('parse').that.is.undefined;
            expect(adapter).to.have.property('template').that.is.undefined;
            expect(adapter).to.have.property('title').that.is.undefined;
            expect(adapter).to.have.property('type', CONSTANTS.BOOLEAN);
            expect(adapter).to.have.property('validation').that.is.undefined;
        });

        it('getField', () => {
            const field = adapter.getField();
            expect(field).to.deep.equal({
                defaultValue: false,
                type: CONSTANTS.BOOLEAN,
            });
        });

        it('getRow', () => {
            const field = randomVal();
            const row = adapter.getRow(field);
            /*
            expect(row).to.deep.equal({
                editor: 'input',
                field,
                attributes: { 'data-role': 'switch' }
            });
             */
            expect(Object.keys(row)).to.have.lengthOf(2);
            expect(row).to.have.property('field', field);
            expect(row).to.have.property('editor').that.is.a('function');
        });
    });
});
