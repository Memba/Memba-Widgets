/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import JSC from 'jscheck';
import Style from '../../../src/js/common/window.style.es6';

const { describe, it } = window;
const { expect } = chai;

function noop() {}
const DATA = [
    {
        // Simple
        str: 'color: red;',
        json: { color: 'red' },
        whitelist: ['color']
    },
    {
        // With hyphen
        str: 'background-color: firebrick;',
        json: { backgroundColor: 'firebrick' },
        whitelist: ['background-color']
    },
    {
        // Complex
        str:
            'background-color: powderblue; border: solid 1px #000000; color: #ff0000; display: flex; height: 100px; opacity: 0.5; width: 100px;',
        json: {
            backgroundColor: 'powderblue',
            border: 'solid 1px #000000',
            color: '#ff0000',
            display: 'flex',
            height: '100px',
            opacity: '0.5',
            width: '100px'
        },
        whitelist: false
    }
];

describe('window.style', () => {
    describe('Style', () => {
        it('It should parse a string and convert to json', () => {
            function test(item) {
                const style = new Style(item.str, item.whitelist);
                expect(style.toString()).to.equal(item.str);
                expect(style.toJSON()).to.deep.equal(item.json);
            }
            DATA.forEach(test);
        });

        it('It should parse json and convert to string', () => {
            function test(item) {
                const style = new Style(item.json, item.whitelist);
                expect(style.toString()).to.equal(item.str);
                expect(style.toJSON()).to.deep.equal(item.json);
            }
            DATA.forEach(test);
        });

        it('It should throw with invalid data', () => {
            function test() {
                const style = new Style(
                    JSC.one_of([JSC.array(), JSC.falsy(), JSC.number()])()
                );
                noop(style); // to please eslint
            }
            expect(test).to.throw();
        });

        it('It should discard dummy strings', () => {
            const style = new Style(JSC.string()());
            expect(style.toString()).to.equal('');
            expect(style.toJSON()).to.deep.equal({});
        });

        it('It should discard dummy objects', () => {
            const style = new Style(JSC.object()());
            expect(style.toString()).to.equal('');
            expect(style.toJSON()).to.deep.equal({});
        });

        it('It should apply whitelist', () => {
            function test(item) {
                const noise = {};
                noise[
                    JSC.string(JSC.integer(3, 25), JSC.character('a', 'z'))()
                ] = JSC.string(JSC.integer(3, 25), JSC.character('a', 'z'))();
                const style = new Style(
                    Object.assign(noise, item.json),
                    item.whitelist
                );
                expect(style.toString()).to.equal(item.str);
                expect(style.toJSON()).to.deep.equal(item.json);
            }
            DATA.filter(data => Array.isArray(data.whitelist)).forEach(test);
        });

        it('It should merge without overwrite', () => {
            function test(item) {
                const style = new Style(item.str, item.whitelist);
                const merge = { color: '#c0c0c0' };
                style.merge(merge, false);
                expect(style.toString()).to.equal(item.str);
                expect(style.toJSON()).to.deep.equal(item.json);
            }
            DATA.filter(data => !data.whitelist).forEach(test);
        });

        it('It should merge with overwrite', () => {
            function test(item) {
                const style = new Style(item.str, item.whitelist);
                const merge = { color: '#c0c0c0' };
                style.merge(merge, true);
                expect(style.toString()).to.equal(
                    item.str.replace(/\scolor:[^;]+/, ' color: #c0c0c0')
                );
                expect(style.toJSON()).to.deep.equal(
                    Object.assign({}, item.json, merge)
                );
            }
            DATA.filter(data => !data.whitelist).forEach(test);
        });
    });
});
