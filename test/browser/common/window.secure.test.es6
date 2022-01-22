/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import JSCheck from 'jscheck';
import SecureStorage from '../../../src/js/common/window.secure.es6';

const { before, describe, it } = window;
const { expect } = chai;
const jsc = JSCheck();

const randomName = jsc.string(jsc.integer(5, 15), jsc.character('a', 'z'));
const randomKey = randomName;
const randomValue = jsc.any();

describe('window.secure', () => {
    describe('SecureStorage', () => {
        let secureStorage;
        let key;
        let value;

        before(() => {
            secureStorage = new SecureStorage({ name: randomName() });
            key = randomKey();
            value = randomValue();
        });

        it('it should write', (done) => {
            secureStorage
                .setItem(key, value)
                .then((k) => {
                    expect(k).to.equal(key);
                })
                .catch((err) => {
                    expect(err).to.be.null;
                })
                .always(() => {
                    done();
                });
        });

        it('it should read', (done) => {
            secureStorage
                .getItem(key)
                .then((v) => {
                    expect(v).to.deep.equal(value);
                })
                .catch((err) => {
                    expect(err).to.be.null;
                })
                .always(() => {
                    done();
                });
        });

        it('it should clear', (done) => {
            secureStorage
                .removeItem(key)
                .then((k) => {
                    expect(k).to.equal(key);
                })
                .catch((err) => {
                    expect(err).to.be.null;
                })
                .always(() => {
                    done();
                });
        });
    });
});
