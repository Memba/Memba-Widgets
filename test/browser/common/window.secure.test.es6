/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import JSC from 'jscheck';
import SecureStorage from '../../../src/js/common/window.secure.es6';

const { before, describe, it } = window;
const { expect } = chai;

const randomName = JSC.string(JSC.integer(5, 15), JSC.character('a', 'z'));
const randomKey = randomName;
const randomValue = JSC.any();

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
