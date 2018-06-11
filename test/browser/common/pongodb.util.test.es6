/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import { randomHexString } from '../../../src/js/common/window.util.es6';
import {
    compareVersions,
    convertFilter,
    convertSort,
    getter,
    listFields,
    match,
    normalizeFilter,
    search,
    setter
} from '../../../src/js/common/pongodb.util.es6';

const { describe, it, xit } = window;
const { expect } = chai;

describe('pongodb.util', () => {
    describe('Legacy export', () => {
        it('Check window.pongodb.util.*', () => {
            expect(window.pongodb.util.compareVersions).to.equal(
                compareVersions
            );
            expect(window.pongodb.util.convertFilter).to.equal(convertFilter);
            expect(window.pongodb.util.convertSort).to.equal(convertSort);
            expect(window.pongodb.util.getter).to.equal(getter);
            expect(window.pongodb.util.listFields).to.equal(listFields);
            expect(window.pongodb.util.match).to.equal(match);
            expect(window.pongodb.util.normalizeFilter).to.equal(
                normalizeFilter
            );
            expect(window.pongodb.util.search).to.equal(search);
            expect(window.pongodb.util.setter).to.equal(setter);
        });
    });

    describe('error2xhr', () => {
        xit('It should ...', () => {});
    });

    describe('getter', () => {
        it('It should throw on invalid values', () => {
            function fn1() {
                getter();
            }
            function fn2() {
                getter(true);
            }
            function fn3() {
                getter('x', 'y');
            }
            function fn4() {
                getter({}, new Date());
            }
            expect(fn1).to.throw;
            expect(fn2).to.throw;
            expect(fn3).to.throw;
            expect(fn4).to.throw;
        });

        it('It should get any deep property from an object', () => {
            expect(getter({ a: 'x' }, 'a')).to.equal('x');
            expect(getter({ a: { b: { c: 10 } } }, 'a.b.c')).to.equal(10);
            expect(getter({ a: { b: { c: 10 } } }, 'a.b')).to.deep.equal({
                c: 10
            });
            expect(getter({ a: 'x' }, 'b')).to.be.undefined;
            expect(getter({ a: { b: { c: 10 } } }, 'b.a')).to.be.undefined;
        });
    });

    describe('setter', () => {
        it('It should throw on invalid values', () => {
            function fn1() {
                setter();
            }
            function fn2() {
                setter(true);
            }
            function fn3() {
                setter(1, {}, 'y');
            }
            function fn4() {
                setter({}, new Date(), 5);
            }
            expect(fn1).to.throw;
            expect(fn2).to.throw;
            expect(fn3).to.throw;
            expect(fn4).to.throw;
        });

        it('It should set any deep property of an object', () => {
            function test(obj, prop, value) {
                setter(obj, prop, value);
                expect(getter(obj, prop)).to.equal(value);
            }
            function testDeep(obj, prop, value) {
                setter(obj, prop, value);
                expect(getter(obj, prop)).to.deep.equal(value);
            }
            test({ a: 'x' }, 'a', 'y');
            test({ a: { b: { c: 10 } } }, 'a.b.c', 20);
            test({ a: { b: { c: 10 } } }, 'a.d', 'z');
            testDeep({}, 'a.b', { c: 10 });
            testDeep({ a: { b: { c: 10 } } }, 'd', { e: 'z' });
        });
    });

    describe('compareVersions', () => {
        it('It should throw on invalid values', () => {
            function fn1() {
                compareVersions(['v1.2.3'], '1.2.3');
            }
            function fn2() {
                compareVersions('v1.2.3', 1.2);
            }
            expect(fn1).to.throw;
            expect(fn2).to.throw;
        });

        it('It should compare versions', () => {
            // ===
            expect(compareVersions('v1.2.3', '1.2.3')).to.equal(0);
            expect(
                compareVersions({ a: 1, b: 'x', _version: '3.7.10' }, 'v3.7.10')
            ).to.equal(0);
            expect(
                compareVersions('0.100.1', { a: 1, b: 'x', version: '0.100.1' })
            ).to.equal(0);
            // <
            expect(compareVersions('v11.1.58', '11.1.59')).to.equal(-1);
            expect(
                compareVersions({ a: 1, b: 'x', _version: '3.2.7' }, '3.3.1')
            ).to.equal(-1);
            expect(
                compareVersions('1.10.1', { a: 1, b: 'x', version: '2.0.3' })
            ).to.equal(-1);
            // >
            expect(compareVersions('v0.1.7', 'v0.1.6')).to.equal(1);
            expect(
                compareVersions({ a: 1, b: 'x', _version: 'v5.5.5' }, '4.7.7')
            ).to.equal(1);
            expect(
                compareVersions('v8.10.1', { a: 1, b: 'x', version: '2.50.40' })
            ).to.equal(1);
        });
    });

    describe('listFields', () => {
        it('It should throw on invalid values', () => {
            function fn1() {
                listFields('a', 'b');
            }
            function fn2() {
                listFields({ a: 1 }, true);
            }
            expect(fn1).to.throw;
            expect(fn2).to.throw;
        });

        it('It should list fields', () => {
            function test(doc, fields) {
                expect(listFields(doc)).to.deep.equal(fields);
            }
            test({ a: 1 }, ['a']);
            test({ a: true, b: 'false' }, ['a', 'b']);
            test({ a: { b: 'x', c: 'y' }, d: false }, ['a.b', 'a.c', 'd']);
            test({ a: { b: { c: { d: { e: false } } } } }, ['a.b.c.d.e']);
        });
    });

    describe('search', () => {
        it('It should throw on invalid values', () => {
            function fn1() {
                search('a', 'b');
            }
            function fn2() {
                search({ a: 1 }, { b: 1 });
            }
            function fn3() {
                search('a', { text: 'a' }, true);
            }
            expect(fn1).to.throw;
            expect(fn2).to.throw;
            expect(fn3).to.throw;
        });

        it('It should search', () => {
            function successTest(str, doc, textFields) {
                expect(search(str, doc, textFields)).to.be.true;
            }
            function failTest(str, doc, textFields) {
                expect(search(str, doc, textFields)).to.be.false;
            }
            successTest('hello world', { text: ['hello', 'world'] });
            successTest('hello world', { first: 'hello', second: 'world' }, [
                'first',
                'second'
            ]);
            successTest('hello world', { a: 'hello', b: { c: 'world' } });
            successTest('hello world', { a: 'hello', b: { c: 'world' } }, [
                'a',
                'b.c'
            ]);
            failTest('hello world', { _text: ['hello', 'world'] });
            failTest('hello world', { first: 'hello', second: 'world' }, [
                'a',
                'b'
            ]);
        });
    });

    describe('match', () => {
        it('It should throw on invalid values', () => {
            function fn1() {
                match({ a: 1 }, 'b');
            }
            function fn2() {
                match(2, { b: 1 });
            }
            function fn3() {
                match({ text: 'a' }, { text: 'a' }, true);
            }
            expect(fn1).to.throw;
            expect(fn2).to.throw;
            expect(fn3).to.throw;
        });

        it('It should match', () => {
            function successTest(query, doc, textFields) {
                expect(match(query, doc, textFields)).to.be.true;
            }
            function failTest(query, doc, textFields) {
                expect(match(query, doc, textFields)).to.be.false;
            }
            const NOW = new Date();
            const ID = randomHexString(24);
            const DOC = {
                id: ID,
                a: {
                    b: 'dummay',
                    c: 100
                },
                d: ['hello', 'world'],
                e: {
                    f: 'Joe',
                    g: 'Bloggs'
                },
                h: true,
                created: NOW
            };
            // Simple match (no operator)
            successTest({ h: true }, DOC);
            failTest({ h: false }, DOC);
            // $eq on booleans
            successTest({ h: { $eq: true }, 'a.c': 100 }, DOC);
            failTest({ h: { $eq: true }, 'a.c': 0 }, DOC);
            // $eq on strings
            successTest({ 'e.f': { $eq: 'Joe' } }, DOC);
            failTest({ 'e.f': { $eq: 'Jim' } }, DOC);
            // $gt + $lt on numbers
            successTest({ 'a.c': { $gt: 99, $lt: 101 } }, DOC);
            failTest({ 'a.c': { $gt: 0, $lt: 3 } }, DOC);
            // $gte + $lte on numbers
            successTest({ 'a.c': { $gte: 100, $lte: 100 } }, DOC);
            failTest({ 'a.c': { $gte: 0, $lte: 0 } }, DOC);
            // $in on arrays
            successTest({ d: { $in: 'hello' } }, DOC);
            failTest({ d: { $in: 'bye' } }, DOC);
            // $ne on strings
            successTest({ 'e.g': { $ne: 'Smith' } }, DOC);
            failTest({ 'e.g': { $ne: 'Bloggs' } }, DOC);
            // $nin on arrays
            successTest({ d: { $nin: 'france' } }, DOC);
            failTest({ d: { $nin: 'world' } }, DOC);
            // $regex
            successTest({ 'a.b': { $regex: /MM/i } }, DOC);
            successTest({ 'a.b': { $regex: 'MM', $options: 'i' } }, DOC);
            failTest({ 'a.b': { $regex: /[0-9]+/i } }, DOC);
            // $search
            successTest({ $text: { $search: 'hello world' } }, DOC);
            failTest({ $text: { $search: 'mama mia' } }, DOC);
            // $bitsAnySet 100 = 2^6 + 2^5 + 2^2
            successTest({ 'a.c': { $bitsAnySet: 64 } }, DOC);
            successTest({ 'a.c': { $bitsAnySet: 32 } }, DOC);
            failTest({ 'a.c': { $bitsAnySet: 16 } }, DOC);
            failTest({ 'a.c': { $bitsAnySet: 8 } }, DOC);
        });
    });

    describe('normalizeFilter', () => {
        it('It should throw on invalid values', () => {
            function fn1() {
                normalizeFilter(true);
            }
            function fn2() {
                normalizeFilter({ a: 1, b: 1 });
            }
            function fn3() {
                normalizeFilter({ logic: 'and', filters: [] });
            }
            function fn4() {
                normalizeFilter({
                    logic: 'or',
                    filters: [{ field: 'text', operator: 'isnull' }]
                });
            }
            function fn5() {
                normalizeFilter({
                    logic: 'and',
                    filters: [{ field: 'text', operator: 'unsupported' }]
                });
            }
            expect(fn1).to.throw;
            expect(fn2).to.throw;
            expect(fn3).to.throw;
            expect(fn4).to.throw;
            expect(fn5).to.throw;
        });

        it('It should normalize', () => {
            function test(filter, normalized) {
                expect(normalizeFilter(filter)).to.deep.equal(normalized);
            }
            test(
                { field: 'text', operator: 'isnull' },
                {
                    logic: 'and',
                    filters: [{ field: 'text', operator: 'isnull' }]
                }
            );
            test(
                [
                    { field: 'count', operator: 'eq', value: 1 },
                    { field: 'included', operator: 'eq', value: true }
                ],
                {
                    logic: 'and',
                    filters: [
                        { field: 'count', operator: 'eq', value: 1 },
                        { field: 'included', operator: 'eq', value: true }
                    ]
                }
            );
            test(
                {
                    logic: 'and',
                    filters: [
                        { field: 'text', operator: 'isnotempty' },
                        { field: 'count', operator: 'gte', value: 10 }
                    ]
                },
                {
                    logic: 'and',
                    filters: [
                        { field: 'text', operator: 'isnotempty' },
                        { field: 'count', operator: 'gte', value: 10 }
                    ]
                }
            );
        });
    });

    describe('convertFilter', () => {
        xit('It should throw on invalid values', () => {});

        xit('It should convert', () => {});
    });

    describe('convertSort', () => {
        xit('It should throw on invalid values', () => {});

        xit('It should convert', () => {});
    });
});
