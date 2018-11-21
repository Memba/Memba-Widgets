/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import { tryCatch } from '../_misc/test.util.es6';
import {
    CUSTOM,
    arrayLibrary,
    booleanLibrary,
    charGridLibrary,
    dateLibrary,
    genericLibrary,
    mathLibrary,
    multiQuizLibrary,
    numberLibrary,
    stringLibrary,
    textLibrary
} from '../../../src/js/tools/util.libraries.es6';

const { describe, it } = window;
const { expect } = chai;

describe('util.libraries', () => {
    describe('CUSTOM', () => {
        xit('TODO', () => {});
    });

    describe('arrayLibrary', () => {
        xit('TODO', () => {});
    });

    describe('booleanLibrary', () => {
        it('equal', () => {
            // eslint-disable-next-line no-new-func
            const fn = Function(
                `"use strict";return ${booleanLibrary.library[0].formula};`
            )();
            expect(fn(true, true)).to.be.true;
            expect(fn(false, false)).to.be.true;
            expect(fn(true, false)).to.be.false;
            expect(fn(false, true)).to.be.false;
        });

        it('notEqual', () => {
            // eslint-disable-next-line no-new-func
            const fn = Function(
                `"use strict";return ${booleanLibrary.library[1].formula};`
            )();
            expect(fn(true, true)).to.be.false;
            expect(fn(false, false)).to.be.false;
            expect(fn(true, false)).to.be.true;
            expect(fn(false, true)).to.be.true;
        });
    });

    describe('charGridLibrary', () => {
        xit('TODO', () => {});
    });

    describe('dateLibrary', () => {
        xit('TODO', () => {});
    });

    describe('genericLibrary', () => {
        xit('TODO', () => {});
    });

    describe('mathLibrary', () => {
        xit('TODO', () => {});
    });

    describe('multiQuizLibrary', () => {
        xit('TODO', () => {});
    });

    describe('numberLibrary', () => {
        xit('TODO', () => {});
    });

    describe('stringLibrary', () => {
        xit('TODO', () => {});
    });

    describe('textLibrary', () => {
        xit('TODO', () => {});
    });

    describe('i18n', () => {
        it('It should internationalize names', done => {
            import('../../../src/js/cultures/libraries.fr.es6')
                .then(
                    tryCatch(done)(() => {
                        expect(CUSTOM).to.have.property('name', 'Personnalisé');
                        expect(arrayLibrary).to.have.nested.property(
                            'library.0.name',
                            'Égal'
                        );
                        expect(arrayLibrary).to.have.nested.property(
                            'library.1.name',
                            'Égal (sans maj.)'
                        );
                        expect(arrayLibrary).to.have.nested.property(
                            'library.2.name',
                            'Égal (sommes)'
                        );
                        // NOte: should we check them all?
                    })
                )
                .catch(done);
        });
    });
});
