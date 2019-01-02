/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import JSC from 'jscheck';
import {
    localCache,
    sessionCache
} from '../../../src/js/common/window.cache.es6';
import { dateReviver } from '../../../src/js/common/window.util.es6';
import md5 from '../../../src/js/vendor/blueimp/md5';
import LZString from '../../../src/js/vendor/pieroxy/lz-string';

const { before, describe, it } = window;
const { expect } = chai;

const INVALID = [
    { key: JSC.number(1000)(), value: JSC.string()() },
    { key: JSC.falsy()(), value: JSC.string()() },
    { key: JSC.object()(), value: JSC.string()() }
];

const DATA = JSC.array(
    10, // array of 10 values
    JSC.object(
        // of type object
        JSC.array(
            JSC.integer(1, 10), // with 1 to 10 properties
            JSC.string() // with string names
        ),
        JSC.one_of([
            // with any of these values
            JSC.integer(),
            JSC.number(),
            JSC.string(),
            JSC.boolean(),
            // JSC.falsy(), <-- breaks deep.equal
            // Infinity, <-- breaks deep.equal
            // -Infinity, <-- breaks deep.equal
            Math.PI,
            Math.E,
            Number.EPSILON,
            new Date()
        ])
    )
)();

function getKey(index) {
    return `key_${index}`;
}

describe('window.cache', () => {
    describe('localCache', () => {
        const cache = localCache;
        const storage = window.localStorage;

        before(() => {
            storage.clear();
        });

        it('It should fail to setItem with an invalid key', () => {
            function test(data) {
                function fn() {
                    cache.setItem(data.key, data.value);
                }
                expect(fn).to.throw;
            }
            INVALID.forEach(test);
        });

        it('It should setItem', () => {
            function test(value, index) {
                const key = getKey(index);
                cache.setItem(key, value);
                const item = JSON.parse(
                    LZString.decompressFromUTF16(storage.getItem(key)),
                    dateReviver
                );
                expect(item).to.have.property('sig');
                expect(item).to.have.property('ts');
                expect(item).to.have.property('ttl');
                expect(item)
                    .to.have.property('value')
                    .that.eql(DATA[index]);
            }
            DATA.forEach(test);
        });

        it('It should fail to getItem with an invalid key', () => {
            function test(data) {
                function fn() {
                    cache.getItem(data.key);
                }
                expect(fn).to.throw;
            }
            INVALID.forEach(test);
        });

        it('It should getItem', () => {
            function test(value, index) {
                const key = getKey(index);
                const item = cache.getItem(key);
                expect(item).to.eql(value);
            }
            DATA.forEach(test);
        });

        it('It should fail to removeItems with an invalid key', () => {
            function test(data) {
                function fn() {
                    cache.removeItems(data.key);
                }
                expect(fn).to.throw;
            }
            INVALID.forEach(test);
        });

        it('It should removeItems', () => {
            function test(value, index) {
                const key = getKey(index);
                cache.removeItems(key);
                const item = storage.getItem(key);
                expect(item).to.be.null;
            }
            DATA.forEach(test);
        });

        it('It should discard expired items', () => {
            const key = JSC.string()();
            const lag = 1 + Math.floor(10000 * Math.random()); // in seconds
            storage.setItem(
                key,
                LZString.compressToUTF16(
                    JSON.stringify({
                        ttl: lag,
                        ts: Date.now() - 1000 * lag - 1,
                        value: DATA[0]
                    })
                )
            );
            const item = cache.getItem(key);
            expect(item).to.be.null;
        });

        it('It should discard tampered items', () => {
            const key = JSC.string()();
            const data = {
                // The signature does not match the object
                sig: md5(JSC.string()()),
                ttl: 24 * 60 * 60,
                ts: Date.now(),
                value: DATA[0]
            };
            storage.setItem(
                key,
                LZString.compressToUTF16(JSON.stringify(data))
            );
            const item = cache.getItem(key);
            expect(item).to.be.null;
        });
    });

    describe('sessionCache', () => {
        const cache = sessionCache;
        const storage = window.sessionStorage;

        before(() => {
            storage.clear();
        });

        it('It should fail to setItem with an invalid key', () => {
            function test(data) {
                function fn() {
                    cache.setItem(data.key, data.value);
                }
                expect(fn).to.throw;
            }
            INVALID.forEach(test);
        });

        it('It should setItem', () => {
            function test(value, index) {
                const key = getKey(index);
                cache.setItem(key, value);
                const item = JSON.parse(
                    LZString.decompressFromUTF16(storage.getItem(key)),
                    dateReviver
                );
                expect(item).to.have.property('sig');
                expect(item).to.have.property('ts');
                expect(item).to.have.property('ttl');
                expect(item)
                    .to.have.property('value')
                    .that.eql(DATA[index]);
            }
            DATA.forEach(test);
        });

        it('It should fail to getItem with an invalid key', () => {
            function test(data) {
                function fn() {
                    cache.getItem(data.key);
                }
                expect(fn).to.throw;
            }
            INVALID.forEach(test);
        });

        it('It should getItem', () => {
            function test(value, index) {
                const key = getKey(index);
                const item = cache.getItem(key);
                expect(item).to.eql(value);
            }
            DATA.forEach(test);
        });

        it('It should fail to removeItems with an invalid key', () => {
            function test(data) {
                function fn() {
                    cache.removeItems(data.key);
                }
                expect(fn).to.throw;
            }
            INVALID.forEach(test);
        });

        it('It should removeItems', () => {
            function test(value, index) {
                const key = getKey(index);
                cache.removeItems(key);
                const item = storage.getItem(key);
                expect(item).to.be.null;
            }
            DATA.forEach(test);
        });

        it('It should discard expired items', () => {
            const key = JSC.string()();
            const lag = 1 + Math.floor(10000 * Math.random()); // in seconds
            storage.setItem(
                key,
                LZString.compressToUTF16(
                    JSON.stringify({
                        ttl: lag,
                        ts: Date.now() - 1000 * lag - 1,
                        value: DATA[0]
                    })
                )
            );
            const item = cache.getItem(key);
            expect(item).to.be.null;
        });

        it('It should discard tampered items', () => {
            const key = JSC.string()();
            const data = {
                // The signature does not match the object
                sig: md5(JSC.string()()),
                ttl: 24 * 60 * 60,
                ts: Date.now(),
                value: DATA[0]
            };
            storage.setItem(
                key,
                LZString.compressToUTF16(JSON.stringify(data))
            );
            const item = cache.getItem(key);
            expect(item).to.be.null;
        });
    });
});
