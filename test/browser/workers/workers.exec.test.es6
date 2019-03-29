/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import JSC from 'jscheck';
import poolExec from '../../../src/js/workers/workers.exec.es6';

const { describe, it } = window;
const { expect } = chai;

describe('workers.exec', () => {
    it('it should execute an equality validation', done => {
        const validation =
            'function validate(value, solution, all) { return value === solution; }';
        const data = {
            all: undefined,
            solution: true,
            value: true
        };
        const name = JSC.string()();
        poolExec(validation, data, name)
            .then(response => {
                expect(response.name).to.equal(name);
                expect(response.result).to.be.true;
                done();
            })
            .catch(done);
    });
});
