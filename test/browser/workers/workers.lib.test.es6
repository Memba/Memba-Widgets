/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
// import $ from 'jquery';
// import 'jquery.simulate';
// import 'kendo.binder';
import chai from 'chai';
import '../../../src/js/vendor/jashkenas/underscore';
import '../../../src/js/vendor/khan/kas';
import '../../../src/js/workers/workers.lib';

const { __karma__, describe, it } = window;
const { expect } = chai;
const global = window;

/*
 * IMPORTANT!
 * We cannot run these tests in Karma, because blacklisting features like Blob
 * prevents other tests from working
 */
(__karma__ ? xdescribe : describe)('workers.lib', () => {
    it('Blacklisted globals', () => {
        expect(global.ActiveXObject).to.be.undefined;
        expect(global.Blob).to.be.undefined;
        expect(global.clearInterval).to.be.undefined;
        expect(global.clearTimeout).to.be.undefined;
        /* eslint-disable-next-line no-eval */
        expect(global.eval).to.be.undefined;
        expect(global.fetch).to.be.undefined;
        expect(global.Function).to.be.undefined;
        expect(global.importScripts).to.be.undefined;
        if (global.indexedDB && !global.PHANTOMJS) {
            // Note: test fails on PhantomJS
            expect(global.indexedDB.open).to.be.undefined;
            expect(global.indexedDB.deleteDatabase).to.be.undefined;
            expect(global.indexedDB.cmp).to.be.undefined;
        }
        if (global.mozIndexedDB) {
            expect(global.mozIndexedDB.open).to.be.undefined;
            expect(global.mozIndexedDB.deleteDatabase).to.be.undefined;
            expect(global.mozIndexedDB.cmp).to.be.undefined;
        }
        if (global.msIndexedDB) {
            expect(global.msIndexedDB.open).to.be.undefined;
            expect(global.msIndexedDB.deleteDatabase).to.be.undefined;
            expect(global.msIndexedDB.cmp).to.be.undefined;
        }
        expect(global.requestFileSystem).to.be.undefined;
        expect(global.requestFileSystemSync).to.be.undefined;
        expect(global.resolveLocalFileSystemURL).to.be.undefined;
        expect(global.resolveLocalFileSystemSyncURL).to.be.undefined;
        expect(global.setInterval).to.be.undefined;
        expect(global.setTimeout).to.be.undefined;
        expect(global.XMLHttpRequest).to.be.undefined;
        if (global.webkitIndexedDB && !global.PHANTOMJS) {
            // Note: test fails on PhantomJS
            expect(global.webkitIndexedDB.open).to.be.undefined;
            expect(global.webkitIndexedDB.deleteDatabase).to.be.undefined;
            expect(global.webkitIndexedDB.cmp).to.be.undefined;
        }
        expect(global.webkitRequestFileSystem).to.be.undefined;
        expect(global.webkitRequestFileSystemSync).to.be.undefined;
        expect(global.webkitResolveLocalFileSystemURL).to.be.undefined;
        expect(global.webkitResolveLocalFileSystemSyncURL).to.be.undefined;
        expect(global.Worker).to.be.undefined;
    });

    it('Soundex', () => {
        const DATA = [
            { name: 'Soundex', value: 'S532' },
            { name: 'Example', value: 'E251' },
            { name: 'Sownteks', value: 'S532' },
            { name: 'Ekzampul', value: 'E251' },
            { name: 'Euler', value: 'E460' },
            { name: 'Gauss', value: 'G200' },
            { name: 'Hilbert', value: 'H416' },
            { name: 'Knuth', value: 'K530' },
            { name: 'Lloyd', value: 'L300' },
            { name: 'Lukasiewicz', value: 'L222' },
            { name: 'Ellery', value: 'E460' },
            { name: 'Ghosh', value: 'G200' },
            { name: 'Heilbronn', value: 'H416' },
            { name: 'Kant', value: 'K530' },
            { name: 'Ladd', value: 'L300' },
            { name: 'Lissajous', value: 'L222' },
            { name: 'Wheaton', value: 'W350' },
            { name: 'Ashcraft', value: 'A226' },
            { name: 'Burroughs', value: 'B622' },
            { name: 'Burrows', value: 'B620' },
            { name: "O'Hara", value: 'O600' },
        ];
        for (let i = 0, { length } = DATA; i < length; i++) {
            expect(global.soundex(DATA[i].name)).to.equal(DATA[i].value);
        }
    });

    it('Metaphone', () => {
        const DATA = [
            { name: 'Gnu', value: 'N' },
            { name: 'bigger', value: 'BKR' },
            { name: 'accuracy', value: 'AKKRS' },
            { name: 'batch batcher', value: 'BXBXR' },
            // TODO we need more...
        ];
        for (let i = 0, { length } = DATA; i < length; i++) {
            expect(global.metaphone(DATA[i].name)).to.equal(DATA[i].value);
        }
    });

    it('removeDiacritics', () => {
        const DATA = [
            { name: 'La leçon est terminée', value: 'La lecon est terminee' },
            { name: 'Cómo está usted', value: 'Como esta usted' },
            { name: 'można zapoznać się', value: 'mozna zapoznac sie' },
            {
                name: 'Z przyjemnością prezentuje Państwu',
                value: 'Z przyjemnoscia prezentuje Panstwu',
            },
            // TODO we need more...
        ];
        for (let i = 0, { length } = DATA; i < length; i++) {
            expect(global.removeDiacritics(DATA[i].name)).to.equal(
                DATA[i].value
            );
        }
    });

    it('Array.equals', () => {
        const DATA = [
            { value: [1, 2, 3], solution: [1, 2, 3], result: true },
            { value: ['a', 'b', 'c'], solution: ['a', 'b', 'c'], result: true },
            { value: [1, 2], solution: [2, 1], result: false },
            {
                value: ['a', 'b', 'c'],
                solution: ['x', 'y', 'z'],
                result: false,
            },
        ];
        for (let i = 0, { length } = DATA; i < length; i++) {
            expect(DATA[i].value.equals(DATA[i].solution)).to.equal(
                DATA[i].result
            );
        }
    });

    it('KAS parse and compare', () => {
        const DATA = [
            { value: '(x-2)(x-1)', solution: '(x-1)(x-2)', result: true },
            { value: '(x-5)', solution: '-x-3', result: false },
            { value: '(3x+7)/(x+4)', solution: '(-3x-7)/(-x-4)', result: true },
            { value: '\\frac{x-1}{y}', solution: '(x-1)/(y)', result: true },
            { value: '(x-5)(x+5)', solution: 'x^2-25', result: true },
        ];
        for (let i = 0, { length } = DATA; i < length; i++) {
            const value = global.KAS.parse(DATA[i].value).expr;
            const solution = global.KAS.parse(DATA[i].solution).expr;
            const compare = global.KAS.compare(value, solution);
            expect(compare.equal).to.equal(DATA[i].result);
            // The following is actually the preferred way of comparing formulas
            expect(
                global.Formula(DATA[i].value).equals(DATA[i].solution)
            ).to.equal(DATA[i].result);
        }
    });
});
