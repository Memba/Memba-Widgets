/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.core';
import 'kendo.data';
import 'jquery.simulate';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import JSC from 'jscheck';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import openCodeEditor from '../../../src/js/dialogs/dialogs.codeeditor.es6';
import { tryCatch } from '../_misc/test.util.es6';

const { afterEach, describe, it } = window;
const {
    data: { DataSource },
    destroy
} = window.kendo;
const { expect } = chai;

// const FIXTURES = '#fixtures';
const SELECTORS = {
    TITLE: '.k-dialog .k-dialog-titlebar .k-dialog-title',
    PRIMARY_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button.k-primary',
    OTHER_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button:not(.k-primary)'
};

chai.use((c, u) => chaiJquery(c, u, $));

describe('dialogs.codeeditor', () => {
    describe('openCodeEditor', () => {
        it('It should open a cde editor with valid options', done => {
            const title = `">${JSC.string()()}`; // "> Checks XSS
            openCodeEditor({
                title,
                data: {
                    value: '// equal',
                    library: new DataSource({
                        data: [
                            {
                                name: 'custom',
                                formula:
                                    'function validate(value, solution, all) {\n\t// Your code should return true when value is validated against solution.\n}'
                            },
                            {
                                name: 'equal',
                                formula:
                                    'function validate(value, solution, all) {\n\treturn value === solution;\n}'
                            }
                        ]
                    })
                }
            })
                .then(
                    tryCatch(done)(resp => {
                        expect(resp.action).to.equal('ok');
                        expect(resp.data).to.have.property('value', '// equal');
                    })
                )
                .catch(done);
            // Check that a failed expect fails test without done
            // expect(true).to.be.false;
            expect($(SELECTORS.TITLE)).to.have.text(title);
            setTimeout(() => {
                // We need to give time for data to show
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
