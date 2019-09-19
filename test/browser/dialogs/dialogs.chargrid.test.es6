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
import chaiJquery from 'chai-jquery';
import JSC from 'jscheck';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import openCharGrid from '../../../src/js/dialogs/dialogs.chargrid.es6';
import { tryCatch } from '../_misc/test.util.es6';

const { afterEach, describe, it } = window;
const { destroy, format } = window.kendo;
const { expect } = chai;

// const FIXTURES = 'fixtures';
const SELECTORS = {
    TITLE: '.k-dialog .k-dialog-titlebar .k-dialog-title',
    PRIMARY_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button.k-primary',
    OTHER_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button:not(.k-primary)',
    CELL: '.k-dialog .kj-assetmanager li.k-tile:has(img[alt="{0}"])'
};

chai.use((c, u) => chaiJquery(c, u, $));

describe('dialogs.chargrid', () => {
    describe('openCharGrid', () => {
        it('It should open a character grid with valid options', done => {
            const title = `">${JSC.string()()}`; // "> Checks XSS
            const message = `">${JSC.string()()}`; // "> Checks XSS
            openCharGrid({
                title,
                message,
                charGrid: {
                    rows: 5,
                    cols: 5
                }
            })
                .then(
                    tryCatch(done)(resp => {
                        expect(resp.action).to.equal('ok');
                        expect(resp.data).to.have.property('value', []);
                    })
                )
                .catch(done);
            // Check that a failed expect fails test without done
            // expect(true).to.be.false;
            expect($(SELECTORS.TITLE)).to.have.text(title);
            setTimeout(() => {
                // We need to give time for data to show
                $(format(SELECTORS.CELL, 0)).simulate(CONSTANTS.CLICK);
                $(SELECTORS.PRIMARY_BUTTON).simulate(CONSTANTS.CLICK);
            }, 500);
        });
    });

    afterEach(() => {
        // This is the dialog wrapper
        const dialog = $('.k-dialog');
        destroy(dialog);
        dialog.remove();
    });
});
