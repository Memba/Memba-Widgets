/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Rename into mathinput

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { randomVal } from '../../../src/js/common/window.util.es6';
import MathInputAdapter from '../../../src/js/tools/adapters.mathinput.es6';

const { describe, it } = window;
const { expect } = chai;

describe('adapters.math', () => {
    describe('MathInputAdapter', () => {
        const adapter = new MathInputAdapter();

        it('It should have descriptors', () => {
            expect(Object.keys(adapter)).to.have.lengthOf(13);
            expect(adapter)
                .to.have.property('attributes')
                .that.deep.equals({ 'data-role': 'datepicker' });
            expect(adapter)
                .to.have.property('defaultValue')
                .that.is.a('function');
            expect(adapter).to.have.property('editable').that.is.undefined;
            expect(adapter).to.have.property('editor', 'input');
            expect(adapter).to.have.property('field').that.is.undefined;
            expect(adapter).to.have.property('format').that.is.undefined;
            expect(adapter).to.have.property('from').that.is.undefined;
            expect(adapter).to.have.property('nullable').that.is.undefined;
            expect(adapter).to.have.property('parse').that.is.undefined;
            expect(adapter).to.have.property('template').that.is.undefined;
            expect(adapter).to.have.property('title').that.is.undefined;
            expect(adapter).to.have.property('type', CONSTANTS.DATE);
            expect(adapter).to.have.property('validation').that.is.undefined;
        });

        it('getField', () => {
            const field = adapter.getField();
            expect(field)
                .to.have.property('defaultValue')
                .that.is.a('function');
            expect(field.defaultValue()).to.be.a('date');
            expect(field).to.have.property('type', CONSTANTS.DATE);
        });

        it('getRow', () => {
            const field = randomVal();
            const row = adapter.getRow(field);
            expect(row).to.deep.equal({
                field,
                editor: 'input',
                attributes: { 'data-role': 'datepicker' }
            });
        });
    });
});
