/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// Load i18n resources
import '../../../src/js/cultures/all.en.es6';

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'jquery.simulate';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import JSCheck from 'jscheck';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import openSpreadsheet from '../../../src/js/dialogs/dialogs.spreadsheet.es6';
import { tryCatch } from '../_misc/test.util.es6';

const { afterEach, describe, it } = window;
const { destroy } = window.kendo;
const { expect } = chai;
const jsc = JSCheck();

// const FIXTURES = 'fixtures';
const SELECTORS = {
    TITLE: '.k-dialog .k-dialog-titlebar .k-dialog-title',
    PRIMARY_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button.k-primary',
    OTHER_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button:not(.k-primary)',
};
const TTL = 500;

chai.use((c, u) => chaiJquery(c, u, $));

describe('dialogs.spreadsheet', () => {
    describe('openSpreadsheet', () => {
        it('It should open an spreadsheet with valid options', (done) => {
            const title = `">${jsc.string()()}`; // "> Checks XSS
            openSpreadsheet({ title })
                .then(
                    tryCatch(done)((resp) => {
                        expect(resp.action).to.equal('ok');
                        expect(resp.data).to.have.property(
                            'activeSheet',
                            'Sheet1'
                        );
                    })
                )
                .catch(done);
            setTimeout(() => {
                // We need to give time for data to show
                // Note: kendo.spreadsheet is lazy loaded
                try {
                    expect($(SELECTORS.TITLE)).to.have.text(title);
                    $(SELECTORS.PRIMARY_BUTTON).simulate(CONSTANTS.CLICK);
                } catch (ex) {
                    done(ex);
                }
            }, TTL);
        });
    });

    afterEach(() => {
        // This is the dialog wrapper
        const dialog = $('.k-dialog');
        destroy(dialog);
        dialog.remove();
        $('body > .k-overlay').remove();
        $('body > .k-popup').remove();
    });
});
