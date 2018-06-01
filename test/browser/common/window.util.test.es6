/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import {
    escapeRegExp,
    randomHexString,
    randomId
} from '../../../src/js/common/window.util.es6';

const { describe, it } = window;
const { expect } = chai;

describe('window.util', () => {
    describe('Legacy export', () => {
        it('Check window.kidoju.util.*', () => {
            expect(window.kidoju.util.escapeRegExp).to.equal(escapeRegExp);
            expect(window.kidoju.util.randomString).to.equal(randomHexString);
            expect(window.kidoju.util.randomId).to.equal(randomId);
        });
    });

    describe('escapeRegExp', () => {
        it('Should return an escaped regular expression', () => {
            expect(escapeRegExp('()')).to.equal('\(\)');
            expect(escapeRegExp('[]')).to.equal('\[\]');
            expect(escapeRegExp('{}')).to.equal('\{\}');
        });
    });

    describe('randomHexString', () => {
        it('Should return an hex string of any arbitrary length', () => {
            const length = Math.ceil(32 * Math.random());
            const hex = randomHexString(length);
            expect(hex).to.match(new RegExp(`^[a-f0-9]{${length}}$`));
        });
    });

    describe('randomId', () => {
        it('Should return an id with 6 random characters', () => {
            const id = randomId();
            expect(id).to.match(/^id_[a-f0-9]{6}$/);
        });
    });
});
