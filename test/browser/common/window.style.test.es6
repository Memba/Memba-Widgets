/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
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
        str: 'color: blue;',
        json: { color: 'blue' },
        whitelist: false
    },
    {
        // With hyphen
        str: 'background-color: powderblue;',
        json: { backgroundColor: 'powderblue' },
        whitelist: false
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
                    JSC.any([JSC.array(), JSC.falsy(), JSC.number()])()
                );
                noop(style); // to please eslint
            }
            expect(test).to.throw;
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
    });
});
