/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import {
    dateReviver,
    escapeRegExp,
    isAnyArray,
    compareBasicArrays,
    getLocation,
    isGuid,
    jsonClone,
    randomColor,
    randomHexString,
    randomId,
    randomVal,
    round,
    shuffle,
    getSelection,
    setSelection,
    replaceSelection
} from '../../../src/js/common/window.util.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { ObservableArray },
    guid
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

    describe('compareBasicArrays', () => {
        it('It should compare string arrays', () => {
            const a = JSC.array(JSC.integer(10), JSC.string())();
            const b = new ObservableArray(a);
            expect(compareBasicArrays(a, b)).to.be.true;
        });

        it('It should compare number arrays', () => {
            const a = JSC.array(JSC.integer(10), JSC.number(100))();
            const b = new ObservableArray(a);
            expect(compareBasicArrays(b, a)).to.be.true;
        });

        it('It should compare boolean arrays', () => {
            const a = JSC.array(JSC.integer(10), JSC.boolean())();
            const b = new ObservableArray(a);
            expect(compareBasicArrays(b, a)).to.be.true;
        });

        it('It should compare mismatched arrays', () => {
            expect(compareBasicArrays([true, false], [false, true])).to.be
                .false;
            expect(compareBasicArrays([0, 1, 2, 3, 4], [3, 2, 1])).to.be.false;
            expect(compareBasicArrays(['a', 'b', 'c'], ['d', 'e', 'f'])).to.be
                .false;
        });
    });

    describe('getLocation', () => {
        const protocol = 'http:';
        const username = 'joe';
        const password = 'zzz';
        const hostname = 'www.example.com';
        const port = '8080';
        const pathname = '/a/b/c';
        const search = '?p=1&q=2';
        const hash = '#1234567890';
        const host = `${hostname}:${port}`;
        const origin = `${protocol}//${host}`;

        it('Absolute url', () => {
            const url = `${protocol}//${username}:${password}@${hostname}:${port}${pathname}${search}${hash}`;
            const location = getLocation(url);
            expect(location.hash).to.equal(hash);
            expect(location.host).to.equal(host);
            expect(location.hostname).to.equal(hostname);
            expect(location.href).to.equal(url);
            expect(location.origin).to.equal(origin);
            expect(location.password).to.equal(password);
            expect(location.pathname).to.equal(pathname);
            expect(location.port).to.equal(port);
            expect(location.protocol).to.equal(protocol);
            expect(location.search).to.equal(search);
            expect(location.username).to.equal(username);
        });

        it('Relative url', () => {
            const url = `${pathname}${search}${hash}`;
            const href = `${window.location.protocol}//${window.location.host}${url}`;
            const location = getLocation(url);
            expect(location.hash).to.equal(hash);
            expect(location.host).to.equal(window.location.host);
            expect(location.hostname).to.equal(window.location.hostname);
            expect(location.href).to.equal(href);
            expect(location.origin).to.equal(window.location.origin);
            expect(location.password).to.equal(window.location.password);
            expect(location.pathname).to.equal(pathname);
            expect(location.port).to.equal(window.location.port);
            expect(location.protocol).to.equal(window.location.protocol);
            expect(location.search).to.equal(search);
            expect(location.username).to.equal(window.location.username);
        });
    });

    describe('isGuid', () => {
        it('It should return true when testing a guid', () => {
            expect(isGuid(guid())).to.be.true;
        });

        it('It should return false when testing a non-guid', () => {
            expect(isGuid(JSC.any()())).to.be.false;
        });
    });

    describe('jsonClone', () => {
        it('It should parse dates in JSON documents', () => {
            // const obj = JSC.object()(); // Deep equal fails
            const obj = {
                a: JSC.boolean()(),
                b: JSC.number()(),
                c: JSC.string()(),
                d: new Date()
            };
            expect(jsonClone(obj)).to.deep.equal(obj);
        });
    });

    describe('randomColor', () => {
        it('It should return a random color', () => {
            const color = randomColor();
            expect(color).to.match(/#[a-f0-9]{6}/);
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

    describe('shuffle', () => {
        xit('TODO', () => {
            expect(true).to.be.false;
        });
    });

    describe('getSelection', () => {
        xit('TODO', () => {
            expect(true).to.be.false;
        });
    });

    describe('setSelection', () => {
        xit('TODO', () => {
            expect(true).to.be.false;
        });
    });

    describe('replaceSelection', () => {
        xit('TODO', () => {
            expect(true).to.be.false;
        });
    });
});
