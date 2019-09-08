/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'jquery.simulate';
import chai from 'chai';
// import sinon from 'sinon';
// import 'sinon-chai';
// import 'jquery.mockjax';
import CONSTANTS from '../../../src/js/common/window.constants';

const { afterEach, describe, it } = window;
const { expect } = chai;
const { destroy } = window.kendo;

const FIXTURES = 'fixtures';

describe('widgets.basedialog', () => {
    before(() => {
        if (window.__karma__ && $(`#${FIXTURES}`).length === 0) {
            $(CONSTANTS.BODY).append(`<div id="${FIXTURES}"></div>`);
        }
    });

    describe('Test', () => {
        it('It should', () => {
            expect(true).to.be.false;
        });
    });

    afterEach(() => {
        // This is the dialog wrapper
        const dialog = $('.k-dialog');
        destroy(dialog);
        dialog.remove();
    });
});
