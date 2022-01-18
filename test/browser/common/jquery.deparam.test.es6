/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import chai from 'chai';
// eslint-disable-next-line import/no-named-as-default,import/no-named-as-default-member
import JSCheck from 'jscheck';
import deparam from '../../../src/js/common/jquery.deparam.es6';

const { describe, it } = window;
const { expect } = chai;
const jsc = JSCheck();

describe('jquery.deparam', () => {
    const data = [
        {
            a: jsc.string()(),
            b: jsc.number()(),
            c: jsc.boolean()(),
            d: jsc.array(
                jsc.integer(5, 10),
                // With at least 3 chars, there is a low probability of a number to coerce
                jsc.string(jsc.integer(3, 10), jsc.character())
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
