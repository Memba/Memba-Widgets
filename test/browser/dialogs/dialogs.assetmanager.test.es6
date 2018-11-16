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
import openAssetManager from '../../../src/js/dialogs/dialogs.assetmanager.es6';
import { tryCatch } from '../_misc/test.util.es6';
import ASSETS from '../_misc/test.assets.es6';

const { afterEach, describe, it } = window;
const { destroy, format } = window.kendo;
const { expect } = chai;

// const FIXTURES = '#fixtures';
const SELECTORS = {
    TITLE: '.k-dialog .k-dialog-titlebar .k-dialog-title',
    PRIMARY_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button.k-primary',
    OTHER_BUTTON: '.k-dialog .k-dialog-buttongroup .k-button:not(.k-primary)',
    ITEM: '.k-dialog .kj-assetmanager li.k-tile:has(img[alt="{0}"])'
};

chai.use((c, u) => chaiJquery(c, u, $));

describe('dialogs.assetmanager', () => {
    describe('openAssetManager', () => {
        it('It should open an assetmanager with valid options', done => {
            const title = `">${JSC.string()()}`; // "> Checks XSS
            const assets = {
                collections: [
                    ASSETS.G_COLLECTION,
                    ASSETS.O_COLLECTION,
                    ASSETS.V_COLLECTION,
                    ASSETS.X_COLLECTION
                ],
                extensions: ASSETS.IMAGE_EXT,
                schemes: ASSETS.SCHEMES
            };
            const image = JSC.one_of([
                '3d_glasses.svg',
                'add.svg',
                'address_book.svg',
                'adhesive_tape.svg',
                'airbrush.svg',
                'airplane.svg',
                'airplane2.svg',
                'airplane2_landing.svg',
                'airplane2_starting.svg',
                'airship.svg',
                'air_tube_carrier.svg',
                'alarm.svg'
            ])();
            openAssetManager({
                title,
                assets
            })
                .then(
                    tryCatch(done)(resp => {
                        expect(resp.action).to.equal('ok');
                        expect(resp.data).to.have.property(
                            'value',
                            `cdn://images/g_collection/svg/all/${image}`
                        );
                    })
                )
                .catch(done);
            // Check that a failed expect fails test without done
            // expect(true).to.be.false;
            expect($(SELECTORS.TITLE)).to.have.text(title);
            setTimeout(() => {
                // We need to give time for data to show
                $(format(SELECTORS.ITEM, image)).simulate(CONSTANTS.CLICK);
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
