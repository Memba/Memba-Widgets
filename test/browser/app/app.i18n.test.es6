/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import __ from '../../../src/js/app/app.i18n.es6';

const { describe, it } = window;
const { expect } = chai;

describe('app.i18n', () => {
    it('Initialization', () => {
        expect(__).to.be.a('function');
        expect(__).to.have.property('locale', 'en');
    });

    it('Load', (done) => {
        __.load('en')
            .then(() => {
                // Note: consider more tests
                expect(__('libraries.custom.name')).to.equal('Custom');
                done();
            })
            .catch(done);
    });
});
