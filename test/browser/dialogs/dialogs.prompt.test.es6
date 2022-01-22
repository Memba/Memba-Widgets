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
import { tryCatch } from '../_misc/test.util.es6';
import openPrompt from '../../../src/js/dialogs/dialogs.prompt.es6';

const { afterEach, describe, it } = window;
const { destroy } = window.kendo;
const { expect } = chai;
const jsc = JSCheck();

// const FIXTURES = 'fixtures';
const SELECTORS = {
    TITLE: '.k-dialog .k-dialog-titlebar .k-dialog-title',
    MESSAGE: '.k-dialog .k-notification .k-notification-wrap',
    INPUT: '.k-dialog .k-dialog-content input',
    PRIMARY_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button.k-primary',
    OTHER_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button:not(.k-primary)',
};

chai.use((c, u) => chaiJquery(c, u, $));

describe('dialogs.prompt', () => {
    describe('openPrompt', () => {
        it('It should open a prompt with valid options', (done) => {
            const title = `">${jsc.string()()}`; // "> Checks XSS
            const message = `">${jsc.string()()}`; // "> Checks XSS
            const input = jsc.string()();
            openPrompt({
                title,
                message,
            })
                .then(
                    tryCatch(done)((resp) => {
                        expect(resp.action).to.equal('ok');
                        expect(resp.data).to.have.property('input', input);
                    })
                )
                .catch(done);
            expect($(SELECTORS.TITLE)).to.have.text(title);
            expect($(SELECTORS.MESSAGE)).to.have.text(message);
            $(SELECTORS.INPUT).val(input).trigger('change');
            $(SELECTORS.PRIMARY_BUTTON).simulate(CONSTANTS.CLICK);
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
