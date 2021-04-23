/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import { randomVal } from '../../../src/js/common/window.util.es6';
import BaseAdapter from '../../../src/js/tools/adapters.base.es6';

const { describe, it } = window;
const { expect } = chai;

describe('adapters.base', () => {
    describe('BaseAdapter', () => {
        const adapter = new BaseAdapter();

        it('It should have descriptors', () => {
            expect(Object.keys(adapter)).to.have.lengthOf(14);
            expect(adapter).to.have.property('attributes').that.is.undefined;
            expect(adapter).to.have.property('defaultValue').that.is.undefined;
            expect(adapter).to.have.property('editable').that.is.undefined;
            expect(adapter).to.have.property('editor').that.is.undefined;
            expect(adapter).to.have.property('field').that.is.undefined;
            expect(adapter).to.have.property('format').that.is.undefined;
            expect(adapter).to.have.property('from').that.is.undefined;
            expect(adapter).to.have.property('help').that.is.undefined;
            expect(adapter).to.have.property('nullable').that.is.undefined;
            expect(adapter).to.have.property('parse').that.is.undefined;
            expect(adapter).to.have.property('template').that.is.undefined;
            expect(adapter).to.have.property('title').that.is.undefined;
            expect(adapter).to.have.property('type').that.is.undefined;
            expect(adapter).to.have.property('validation').that.is.undefined;
        });

        it('getField', () => {
            const field = adapter.getField();
            expect(field).to.deep.equal({ defaultValue: undefined });
        });

        it('getRow', () => {
            const field = randomVal();
            const row = adapter.getRow(field);
            expect(row).to.deep.equal({ field });
        });
    });
});
