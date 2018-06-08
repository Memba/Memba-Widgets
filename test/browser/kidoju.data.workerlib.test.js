/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, mocha: true, expr: true */

;(function (window, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;

    describe('kidoju.data.workerlib.test', function () {

        /* This function has too many statements. */
        /* jshint -W071 */

        it('Blacklisted globals', function () {
            expect(window.ActiveXObject).to.be.undefined;
            expect(window.Blob).to.be.undefined;
            expect(window.clearInterval).to.be.undefined;
            expect(window.clearTimeout).to.be.undefined;
            /* eval can be harmful. */
            /* jshint -W061 */
            expect(window.eval).to.be.undefined;
            /* jshint +W061 */
            expect(window.fetch).to.be.undefined;
            expect(window.Function).to.be.undefined;
            expect(window.importScripts).to.be.undefined;
            if (window.indexedDB && !window.PHANTOMJS) {
                // Note: test fails on PhantomJS
                expect(window.indexedDB.open).to.be.undefined;
                expect(window.indexedDB.deleteDatabase).to.be.undefined;
                expect(window.indexedDB.cmp).to.be.undefined;
            }
            if (window.mozIndexedDB) {
                expect(window.mozIndexedDB.open).to.be.undefined;
                expect(window.mozIndexedDB.deleteDatabase).to.be.undefined;
                expect(window.mozIndexedDB.cmp).to.be.undefined;
            }
            if (window.msIndexedDB) {
                expect(window.msIndexedDB.open).to.be.undefined;
                expect(window.msIndexedDB.deleteDatabase).to.be.undefined;
                expect(window.msIndexedDB.cmp).to.be.undefined;
            }
            expect(window.requestFileSystem).to.be.undefined;
            expect(window.requestFileSystemSync).to.be.undefined;
            expect(window.resolveLocalFileSystemURL).to.be.undefined;
            expect(window.resolveLocalFileSystemSyncURL).to.be.undefined;
            expect(window.setInterval).to.be.undefined;
            expect(window.setTimeout).to.be.undefined;
            expect(window.XMLHttpRequest).to.be.undefined;
            if (window.webkitIndexedDB && !window.PHANTOMJS) {
                // Note: test fails on PhantomJS
                expect(window.webkitIndexedDB.open).to.be.undefined;
                expect(window.webkitIndexedDB.deleteDatabase).to.be.undefined;
                expect(window.webkitIndexedDB.cmp).to.be.undefined;
            }
            expect(window.webkitRequestFileSystem).to.be.undefined;
            expect(window.webkitRequestFileSystemSync).to.be.undefined;
            expect(window.webkitResolveLocalFileSystemURL).to.be.undefined;
            expect(window.webkitResolveLocalFileSystemSyncURL).to.be.undefined;
            expect(window.Worker).to.be.undefined;
        });

        /* jshint +W071 */

        it('Soundex', function () {
            var DATA = [
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
                { name: 'O\'Hara', value: 'O600' }
            ];
            for (var i = 0, length = DATA.length; i < length; i++) {
                expect(window.soundex(DATA[i].name)).to.equal(DATA[i].value);
            }
        });

        it('Metaphone', function () {
            var DATA = [
                { name: 'Gnu', value: 'N' },
                { name: 'bigger', value: 'BKR' },
                { name: 'accuracy', value: 'AKKRS' },
                { name: 'batch batcher', value: 'BXBXR' }
                // TODO we need more...
            ];
            for (var i = 0, length = DATA.length; i < length; i++) {
                expect(window.metaphone(DATA[i].name)).to.equal(DATA[i].value);
            }
        });

        it('removeDiacritics', function () {
            var DATA = [
                { name: 'La leçon est terminée', value: 'La lecon est terminee' },
                { name: 'Cómo está usted', value: 'Como esta usted' },
                { name: 'można zapoznać się', value: 'mozna zapoznac sie' },
                { name: 'Z przyjemnością prezentuje Państwu', value: 'Z przyjemnoscia prezentuje Panstwu' }
                // TODO we need more...
            ];
            for (var i = 0, length = DATA.length; i < length; i++) {
                expect(window.removeDiacritics(DATA[i].name)).to.equal(DATA[i].value);
            }
        });

        it('Array.equals', function () {
            var DATA = [
                { value: [1, 2, 3], solution: [1, 2, 3], result: true },
                { value: ['a', 'b', 'c'], solution: ['a', 'b', 'c'], result: true },
                { value: [1, 2], solution: [2, 1], result: false },
                { value: ['a', 'b', 'c'], solution: ['x', 'y', 'z'], result: false }
            ];
            for (var i = 0, length = DATA.length; i < length; i++) {
                expect(DATA[i].value.equals(DATA[i].solution)).to.equal(DATA[i].result);
            }
        });

        it('KAS parse and compare', function () {
            var DATA = [
                { value: '(x-2)(x-1)', solution: '(x-1)(x-2)', result: true },
                { value: '(x-5)', solution: '-x-3', result: false },
                { value: '(3x+7)/(x+4)', solution: '(-3x-7)/(-x-4)', result: true },
                { value: '\\frac{x-1}{y}', solution: '(x-1)/(y)', result: true },
                { value: '(x-5)(x+5)', solution: 'x^2-25', result: true }
            ];
            for (var i = 0, length = DATA.length; i < length; i++) {
                var value = window.KAS.parse(DATA[i].value).expr;
                var solution = window.KAS.parse(DATA[i].solution).expr;
                var compare = window.KAS.compare(value, solution);
                expect(compare.equal).to.equal(DATA[i].result);
                // The following is actually the preferred way of comparing formulas
                expect(window.Formula(DATA[i].value).equals(DATA[i].solution)).to.equal(DATA[i].result);
            }
        });
    });

}(this));
