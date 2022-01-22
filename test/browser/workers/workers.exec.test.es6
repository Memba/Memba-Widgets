/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import JSCheck from 'jscheck';
import poolExec from '../../../src/js/workers/workers.exec.es6';

const { describe, it } = window;
const { expect } = chai;
const jsc = JSCheck();

describe('workers.exec', () => {
    it('it should execute an equality validation that results to true', (done) => {
        const validation =
            'function validate(value, solution, all) { return value === solution; }';
        const value = jsc.wun_of([jsc.boolean(), jsc.number(), jsc.string()])();
        const data = {
            all: undefined,
            solution: value,
            value,
        };
        const name = jsc.string()();
        poolExec(validation, data, name)
            .then((response) => {
                expect(response.name).to.equal(name);
                expect(response.result).to.be.true;
                done();
            })
            .catch(done);
    });

    it('it should execute an equality validation that results to false', (done) => {
        const validation =
            'function validate(value, solution, all) { return value === solution; }';
        const value = jsc.wun_of([jsc.boolean(), jsc.number(), jsc.string()])();
        const data = {
            all: undefined,
            solution: Math.PI,
            value,
        };
        const name = jsc.string()();
        poolExec(validation, data, name)
            .then((response) => {
                expect(response.name).to.equal(name);
                expect(response.result).to.be.false;
                done();
            })
            .catch(done);
    });
});
