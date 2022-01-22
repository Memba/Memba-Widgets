/**
 * Copyright (c) 2013-2021 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// Load i18n resources
import '../../../src/js/cultures/all.en.es6';

import 'kendo.core';
import chai from 'chai';
import JSCheck from 'jscheck';
import __ from '../../../src/js/app/app.i18n.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import TOOLS from '../../../src/js/tools/util.constants.es6';
import {
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
    textLibrary,
} from '../../../src/js/tools/util.libraries.es6';
// import { tryCatch } from '../_misc/test.util.es6';

const { describe, it } = window;
const { format } = window.kendo;
const { expect } = chai;
const jsc = JSCheck();

const key = jsc.string(jsc.integer(1, 15), jsc.character('a', 'z'))();
const params = jsc.object()();
function editor() {
    return CONSTANTS.EMPTY;
}
const sampleLibrary = [
    {
        key,
        formula: 'function (value, solution) {\n\treturn true;\n}',
        editor,
    },
];
const formulas = {
    empty: TOOLS.LIB_COMMENT,
    spaces: `${TOOLS.LIB_COMMENT}      `,
    dummy: `${TOOLS.LIB_COMMENT}dummy`,
    equal: `${TOOLS.LIB_COMMENT}equal`,
    withoutParams: `${TOOLS.LIB_COMMENT}${key}`,
    withParams: `${TOOLS.LIB_COMMENT}${key}${format(
        TOOLS.LIB_PARAMS,
        JSON.stringify(params)
    )}`,
    anyFunction: 'function (a) {\n\treturn a;\n}',
    custom: `function validate(value, solution, all) {\n\treturn "${jsc.string()()}";\n}`,
};

describe('util.libraries', () => {
    describe('isCustomFormula', () => {
        it('It should assess formulas', () => {
            expect(isCustomFormula(formulas.empty)).to.be.false;
            expect(isCustomFormula(formulas.spaces)).to.be.false;
            expect(isCustomFormula(formulas.dummy)).to.be.false;
            expect(isCustomFormula(formulas.withoutParams)).to.be.false;
            expect(isCustomFormula(formulas.withParams)).to.be.false;
            expect(isCustomFormula(formulas.anyFunction)).to.be.false;
            expect(isCustomFormula(formulas.custom)).to.be.true;
        });
    });

    describe('isLibraryFormula', () => {
        it('It should assess formulas', () => {
            expect(isLibraryFormula(formulas.empty)).to.be.false;
            expect(isLibraryFormula(formulas.spaces)).to.be.false;
            expect(isLibraryFormula(formulas.dummy)).to.be.true;
            expect(isLibraryFormula(formulas.withoutParams)).to.be.true;
            expect(isLibraryFormula(formulas.withParams)).to.be.true;
            expect(isLibraryFormula(formulas.anyFunction)).to.be.false;
            expect(isLibraryFormula(formulas.custom)).to.be.false;
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
                parseLibraryItem(formulas.withoutParams, sampleLibrary)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.withParams, sampleLibrary)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.withParams, sampleLibrary)
            ).to.have.property('params');
            expect(
                parseLibraryItem(formulas.equal, booleanLibrary.library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.equal, charGridLibrary.library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.equal, dateLibrary.library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.equal, genericLibrary.library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.equal, mathLibrary.library)
            ).to.have.property('item');
            expect(
                parseLibraryItem(formulas.equal, multiQuizLibrary.library)
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
        xit('TODO', () => {});
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
        it('equal', () => {
            // eslint-disable-next-line no-new-func
            const fn = Function(
                `"use strict";return ${dateLibrary.library[0].formula};`
            )();
            expect(fn(new Date(1966, 2, 14), new Date(1966, 2, 14))).to.be.true;
            expect(fn(new Date(1966, 2, 14), new Date())).to.be.false;
        });
    });

    describe('genericLibrary', () => {
        it('equal', () => {
            // eslint-disable-next-line no-new-func
            const fn = Function(
                `"use strict";return ${genericLibrary.library[0].formula};`
            )();
            expect(fn('abcd', 'abcd')).to.be.true;
            expect(fn(123, 123)).to.be.true;
            expect(fn(true, true)).to.be.true;
        });
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

    xdescribe('i18n', () => {
        before((done) => {
            __.load('fr').then(done).catch(done);
        });

        it('It should internationalize names', () => {
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
        });
    });
});
