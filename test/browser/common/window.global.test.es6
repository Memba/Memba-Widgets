/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import app from '../../../src/js/common/window.global.es6';

const { describe, it } = window;
const { expect } = chai;

describe('window.global', () => {
    it('app.i18n should be an empty object', () => {
        if (window.__karma__) {
            expect(app.i18n).to.have.property('en');
        } else {
            expect(app.i18n).to.eql({});
        }
    });
});
