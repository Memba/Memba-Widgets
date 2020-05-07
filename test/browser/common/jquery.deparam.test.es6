/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import chai from 'chai';
import JSC from 'jscheck';
import deparam from '../../../src/js/common/jquery.deparam.es6';

const { describe, it } = window;
const { expect } = chai;

describe('jquery.deparam', () => {
    const data = [
        {
            a: JSC.string()(),
            b: JSC.number()(),
            c: JSC.boolean()(),
            d: JSC.array(
                JSC.integer(5, 10),
                // With at least 3 chars, there is a low probability of a number to coerce
                JSC.string(JSC.integer(3, 10), JSC.character())
            )(),
        },
    ];

    it('It should plug $.deparam', () => {
        expect(deparam).to.be.a('function');
        expect($.deparam).to.be.a('function');
        expect($.deparam).to.equal(deparam);
    });

    it('It should deparam', () => {
        function test(item) {
            const obj = $.deparam($.param(item), true);
            // console.dir(item);
            // console.dir(obj);
            // console.log('-----------------');
            expect(obj).to.deep.equal(item);
        }
        data.forEach(test);
    });
});
