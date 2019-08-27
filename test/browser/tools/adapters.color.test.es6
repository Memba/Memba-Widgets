/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { randomVal } from '../../../src/js/common/window.util.es6';
import ColorAdapter from '../../../src/js/tools/adapters.color.es6';

const { describe, it } = window;
const { expect } = chai;

describe('adapters.color', () => {
    describe('ColorAdapter', () => {
        const adapter = new ColorAdapter();

        it('It should have descriptors', () => {
            expect(Object.keys(adapter)).to.have.lengthOf(14);
            expect(adapter)
                .to.have.property('attributes')
                .that.deep.equals({ 'data-role': 'colorpicker' });
            expect(adapter).to.have.property('defaultValue', '#000000');
            expect(adapter).to.have.property('editable').that.is.undefined;
            expect(adapter).to.have.property('editor', 'input');
            expect(adapter).to.have.property('field').that.is.undefined;
            expect(adapter).to.have.property('format').that.is.undefined;
            expect(adapter).to.have.property('from').that.is.undefined;
            expect(adapter).to.have.property('help').that.is.undefined;
            expect(adapter).to.have.property('nullable').that.is.undefined;
            expect(adapter).to.have.property('parse').that.is.undefined;
            expect(adapter).to.have.property('template').that.is.undefined;
            expect(adapter).to.have.property('title').that.is.undefined;
            expect(adapter).to.have.property('type', CONSTANTS.STRING);
            expect(adapter).to.have.property('validation').that.is.undefined;
        });

        it('getField', () => {
            const field = adapter.getField();
            expect(field).to.deep.equal({
                defaultValue: '#000000',
                type: CONSTANTS.STRING
            });
        });

        it('getRow', () => {
            const field = randomVal();
            const row = adapter.getRow(field);
            expect(row).to.deep.equal({
                attributes: { 'data-role': 'colorpicker' },
                field,
                editor: 'input'
            });
        });
    });
});
