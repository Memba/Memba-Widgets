/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */
import chai from 'chai';
import sinon from 'sinon';
import 'sinon-chai';

const { describe, it } = window;
const { expect } = chai;

describe('Sample Test', () => {
    it('expect should work', () => {
        expect(true).to.be.true;
    });
    it('sinon should work', () => {
        const spy = sinon.spy();
        spy(true);
        expect(spy).to.have.been.calledWith(true);
    });
});
