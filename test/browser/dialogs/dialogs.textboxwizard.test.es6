/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
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
import { tryCatch } from '../_misc/test.util.es6';
import openTextBoxWizard from '../../../src/js/dialogs/dialogs.textboxwizard.es6';

const { afterEach, describe, it } = window;
const { destroy } = window.kendo;
const { expect } = chai;

// const FIXTURES = '#fixtures';
const SELECTORS = {
    TITLE: '.k-dialog .k-dialog-titlebar .k-dialog-title',
    MESSAGE: '.k-dialog .k-notification .k-notification-wrap',
    INPUT: '.k-dialog .k-dialog-content input',
    TEXTAREA: '.k-dialog .k-dialog-content textarea',
    PRIMARY_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button.k-primary',
    OTHER_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button:not(.k-primary)'
};

chai.use((c, u) => chaiJquery(c, u, $));

describe('dialogs.textboxwizard', () => {
    describe('openTextBoxWizard', () => {
        it('It should open a textbox wizard with valid options', done => {
            const title = `">${JSC.string()()}`; // "> Checks XSS
            const question = JSC.string()();
            const solution = JSC.string()();
            openTextBoxWizard({ title })
                .then(
                    tryCatch(done)(resp => {
                        expect(resp.action).to.equal('ok');
                        expect(resp.data).to.have.property(
                            'question',
                            question
                        );
                        expect(resp.data).to.have.property(
                            'solution',
                            solution
                        );
                    })
                )
                .catch(done);
            expect($(SELECTORS.TITLE)).to.have.text(title);
            $(SELECTORS.INPUT)
                .val(question)
                .trigger('change');
            $(SELECTORS.TEXTAREA)
                .val(solution)
                .trigger('change');
            $(SELECTORS.PRIMARY_BUTTON).simulate(CONSTANTS.CLICK);
        });
    });

    afterEach(() => {
        // This is the dialog wrapper
        const dialog = $('.k-dialog');
        destroy(dialog);
        dialog.remove();
    });
});
