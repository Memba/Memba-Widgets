/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import ReadOnlyAdapter from '../../../src/js/tools/adapters.readonly.es6';

const { describe, it } = window;
const { expect } = chai;

describe('adapters.readonly', () => {
    describe('ReadOnlyAdapter', () => {
        it('getField', () => {
            const adapter = new ReadOnlyAdapter();
            debugger;
            const field = adapter.getField();
            expect(field).to.have.property('type', adapter.type);
        });

        it('getRow', () => {
            const adapter = new ReadOnlyAdapter();
            const row = adapter.getRow('test');
        });
    });
});
