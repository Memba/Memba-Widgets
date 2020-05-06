/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// Load i18n resources
import '../../../src/js/cultures/all.en.es6';

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
import { PageComponent } from '../../../src/js/data/data.pagecomponent.es6';
import openCodeEditor from '../../../src/js/dialogs/dialogs.codeeditor.es6';
import {
    getTextBox,
    getValidationLibrary,
} from '../../../src/js/helpers/helpers.components.es6';
import tools from '../../../src/js/tools/tools.es6';
import { tryCatch } from '../_misc/test.util.es6';

const { afterEach, describe, it } = window;
const {
    data: { DataSource },
    destroy,
} = window.kendo;
const { expect } = chai;

// const FIXTURES = 'fixtures';
const LIBRARY = getValidationLibrary();
const SELECTORS = {
    TITLE: '.k-dialog .k-dialog-titlebar .k-dialog-title',
    PRIMARY_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button.k-primary',
    OTHER_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button:not(.k-primary)',
};
const TOOL = 'textbox';
const TTL = 500;

chai.use((c, u) => chaiJquery(c, u, $));

describe('dialogs.codeeditor', () => {
    before((done) => {
        tools.load(TOOL).always(done);
    });

    // PageComponent imported here does not seem to be the same as in widgets.codeeditor.es6
    // so instanceof and asserts won't work when run from Karma
    (window.__karma__ ? xdescribe : describe)('openCodeEditor', () => {
        it('It should open a cde editor with valid options', (done) => {
            const textbox = getTextBox();
            const title = `">${JSC.string()()}`; // "> Checks XSS
            openCodeEditor({
                title,
                data: {
                    value: new PageComponent(textbox),
                    library: new DataSource({
                        data: LIBRARY,
                    }),
                },
            })
                .then(
                    tryCatch(done)((resp) => {
                        expect(resp.action).to.equal('ok');
                        expect(resp.data).to.have.property('value'); // .that.is.an.instanceof(PageComponent);
                        expect(resp.data.value).to.have.nested.property(
                            'properties.validation',
                            textbox.properties.validation
                        );
                    })
                )
                .catch(done);
            setTimeout(() => {
                // We need to give time for data to show
                // Note: widgets.codeeditor is lazy loaded
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
