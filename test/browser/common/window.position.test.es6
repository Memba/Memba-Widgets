/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'jquery.simulate';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
// import JSCheck from 'jscheck';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import {
    getElementCenter,
    getMousePosition,
    getTransformRotation,
    getTransformScale,
} from '../../../src/js/common/window.position.es6';

const { describe, it } = window;
const { expect } = chai;
chai.use((c, u) => chaiJquery(c, u, $));

const FIXTURES = 'fixtures';

describe('window.position', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    describe('getElementCenter', () => {
        it('TODO', () => {
            expect(getElementCenter).to.be.a('function');
        });
    });

    describe('getMousePosition', () => {
        it('TODO', () => {
            expect(getMousePosition).to.be.a('function');
        });
    });

    describe('getTransformRotation', () => {
        xit('TODO', () => {
            expect(getTransformRotation).to.be.a('function');
        });
    });

    describe('getTransformScale', () => {
        xit('TODO', () => {
            expect(getTransformScale).to.be.a('function');
        });
    });
});
