/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.core';
import chai from 'chai';
import JSC from 'jscheck';
import { tryCatch } from '../_misc/test.util.es6';
import {
    LIB_COMMENT,
    LIB_PARAMS,
    isCustomFormula,
    isLibraryFormula,
    stringifyLibraryItem,
    parseLibraryItem,
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
const { format } = window.kendo;
const { expect } = chai;

const key = JSC.string(JSC.integer(1, 15), JSC.character('a', 'z'))();
const params = JSC.object()();
const editor = function() {};
const library = [
    {
        key,
        formula: 'function (value, solution) {\n\treturn true;\n}',
        editor
    }
];
const formulas = {
    empty: LIB_COMMENT,
    spaces: `${LIB_COMMENT}      `,
    equal: `${LIB_COMMENT}equal`,
    withoutParams: `${LIB_COMMENT}${key}`,
    withParams: `${LIB_COMMENT}${key}${format(
        LIB_PARAMS,
        JSON.stringify(params)
    )}`,
    anyFunction: 'function (a) {\n\treturn a;\n}',
    custoom: `function validate(value, solution, all) {\n\treturn "${JSC.string()()}";\n}`
};

describe('util.libraries', () => {
    describe('isCustomFormula', () => {
        it('It should assess formulas', () => {
            expect(isCustomFormula(formulas.empty)).to.be.false;
            expect(isCustomFormula(formulas.spaces)).to.be.false;
            expect(isCustomFormula(formulas.equal)).to.be.false;
            expect(isCustomFormula(formulas.withoutParams)).to.be.false;
            expect(isCustomFormula(formulas.withParams)).to.be.false;
            expect(isCustomFormula(formulas.anyFunction)).to.be.false;
            expect(isCustomFormula(formulas.custoom)).to.be.true;
        });
    });

    describe('isLibraryFormula', () => {
        it('It should assess formulas', () => {
            expect(isLibraryFormula(formulas.empty)).to.be.false;
            expect(isLibraryFormula(formulas.spaces)).to.be.false;
            expect(isLibraryFormula(formulas.equal)).to.be.true;
            expect(isLibraryFormula(formulas.withoutParams)).to.be.true;
            expect(isLibraryFormula(formulas.withParams)).to.be.true;
            expect(isLibraryFormula(formulas.anyFunction)).to.be.false;
            expect(isLibraryFormula(formulas.custoom)).to.be.false;
        });
    });

    describe('stringifyLibraryItem', () => {
        it('It should stringify', () => {
            expect(stringifyLibraryItem({ key })).to.equal(
                formulas.withoutParams
            );
            expect(stringifyLibraryItem({ editor, key }, params)).to.equal(
                formulas.withParams
            );
        });
    });

    describe('parseLibraryItem', () => {
        it('it should parse', () => {
            expect(
                parseLibraryItem(formulas.withoutParams, library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.withParams, library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.withParams, library)
            ).to.have.property('params');
            expect(
                parseLibraryItem(formulas.equal, booleanLibrary.library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.equal, charGridLibrary.library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.equal, genericLibrary.library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.equal, numberLibrary.library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.equal, stringLibrary.library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.equal, textLibrary.library)
            ).to.have.property('item');
        });
    });

    describe('CUSTOM', () => {
        it('TODO', () => {});
    });

    describe('arrayLibrary', () => {
        xit('equal', () => {});
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
            const { libraries } = window.kendo.ex;
            expect(CUSTOM).to.equal(libraries.CUSTOM);
            expect(arrayLibrary).to.equal(libraries.arrayLibrary);
            expect(booleanLibrary).to.equal(libraries.booleanLibrary);
            expect(charGridLibrary).to.equal(libraries.charGridLibrary);
            expect(dateLibrary).to.equal(libraries.dateLibrary);
            expect(genericLibrary).to.equal(libraries.genericLibrary);
            expect(mathLibrary).to.equal(libraries.mathLibrary);
            expect(multiQuizLibrary).to.equal(libraries.multiQuizLibrary);
            expect(numberLibrary).to.equal(libraries.numberLibrary);
            expect(stringLibrary).to.equal(libraries.stringLibrary);
            expect(textLibrary).to.equal(libraries.textLibrary);
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
