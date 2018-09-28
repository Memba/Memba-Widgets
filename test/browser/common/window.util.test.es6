/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import {
    dateReviver,
    escapeRegExp,
    randomHexString,
    randomId,
    randomVal,
    round,
    isAnyArray,
    compareStringArrays,
    getSelection,
    setSelection,
    replaceSelection
} from '../../../src/js/common/window.util.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { ObservableArray }
} = window.kendo;

describe('window.util', () => {
    describe('dateReviver', () => {
        it('It should parse dates in JSON documents', () => {
            const date = new Date();
            const test1 = JSON.parse(JSON.stringify({ date }));
            const test2 = JSON.parse(JSON.stringify({ date }), dateReviver);
            expect(test1).to.have.property('date', date.toISOString());
            expect(test2)
                .to.have.property('date')
                .that.is.a('date');
            expect(test2.date.getTime()).to.equal(date.getTime());
        });
    });

    describe('escapeRegExp', () => {
        it('It should return an escaped regular expression', () => {
            expect(escapeRegExp('()')).to.equal('\\(\\)');
            expect(escapeRegExp('[]')).to.equal('\\[\\]');
            expect(escapeRegExp('{}')).to.equal('\\{\\}');
        });
    });

    describe('randomHexString', () => {
        it('It should return an hex string of any arbitrary length', () => {
            const length = Math.ceil(32 * Math.random());
            const hex = randomHexString(length);
            expect(hex).to.match(new RegExp(`^[a-f0-9]{${length}}$`));
        });
    });

    describe('randomId', () => {
        it('It should return an id with 6 random characters', () => {
            const id = randomId();
            expect(id).to.match(/^id_[a-f0-9]{6}$/);
        });
    });

    describe('randomVal', () => {
        it('It should return a val with 6 random characters', () => {
            const val = randomVal();
            expect(val).to.match(/^val_[a-f0-9]{6}$/);
        });
    });

    describe('round', () => {
        it('It should round with precision', () => {
            expect(round(1.23456789)).to.equal(1.23);
            expect(round(2.96754321, 4)).to.equal(2.9675);
        });
    });

    describe('isAnyArray', () => {
        it('it should check an array', () => {
            expect(isAnyArray(JSC.array()())).to.be.true;
        });

        it('it should check a Kendo UI ObservableArray', () => {
            expect(isAnyArray(new ObservableArray(JSC.array()()))).to.be.true;
        });

        it('it should not check other value types', () => {
            expect(isAnyArray(JSC.boolean()())).to.be.false;
            expect(isAnyArray(JSC.number(1000))).to.be.false;
            expect(isAnyArray(JSC.string())).to.be.false;
            expect(isAnyArray(JSC.object()())).to.be.false;
        });
    });

    describe('compareStringArrays', () => {
        it('TODO', () => {
            expect(true).to.be.false;
        });
    });

    describe('getSelection', () => {
        it('TODO', () => {
            expect(true).to.be.false;
        });
    });

    describe('setSelection', () => {
        it('TODO', () => {
            expect(true).to.be.false;
        });
    });

    describe('replaceSelection', () => {
        it('TODO', () => {
            expect(true).to.be.false;
        });
    });
});
