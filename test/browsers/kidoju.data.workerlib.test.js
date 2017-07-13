/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
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

        xit('Blacklisted globals', function () {
            expect(window.ActiveXObject).to.be.undefined;
            expect(window.clearInterval).to.be.undefined;
            expect(window.clearTimeout).to.be.undefined;
            /* eval can be harmful. */
            /* jshint -W061 */
            expect(window.eval).to.be.undefined;
            /* jshint +W061 */
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

        xit('Soundex', function () {
            var SOUNDEX = [
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
            for (var i = 0, length = SOUNDEX.length; i < length; i++) {
                expect(window.soundex(SOUNDEX[i].name)).to.equal(SOUNDEX[i].value);
            }
        });

        xit('Metaphone', function () {
            var METAPHONE = [
                { name: 'Gnu', value: 'N' },
                { name: 'bigger', value: 'BKR' },
                { name: 'accuracy', value: 'AKKRS' },
                { name: 'batch batcher', value: 'BXBXR' }
                // TODO we need more...
            ];
            for (var i = 0, length = METAPHONE.length; i < length; i++) {
                expect(window.metaphone(METAPHONE[i].name)).to.equal(METAPHONE[i].value);
            }
        });

        xit('removeDiacritics', function () {
            var DIACRITICS = [
                { name: 'La leçon est terminée', value: 'La lecon est terminee' },
                { name: 'Cómo está usted', value: 'Como esta usted' },
                { name: 'można zapoznać się', value: 'mozna zapoznac sie' },
                { name: 'Z przyjemnością prezentuje Państwu', value: 'Z przyjemnoscia prezentuje Panstwu' }
                // TODO we need more...
            ];
            for (var i = 0, length = DIACRITICS.length; i < length; i++) {
                expect(window.removeDiacritics(DIACRITICS[i].name)).to.equal(DIACRITICS[i].value);
            }
        });

        xit('Array.equals', function () {
            var ARRAYS = [
                { a: [1, 2, 3], b: [1, 2, 3] },
                { a: ['a', 'b', 'c'], b: ['a', 'b', 'c'] }
            ];
            for (var i = 0, length = ARRAYS.length; i < length; i++) {
                expect(ARRAYS[i].a.equals(ARRAYS[i].b)).to.be.true;
            }
        });

        xit ('Latex Parsing', function () {
            var SAMPLE = [
                { latex: 'a^2+b^2=c^2', length: 5 },
                { latex: '\\left(a-b\\right)\\times\\left(a+b\\right)=a^2-b^2', length: 7 },
                { latex: '\\sin\\left(x\\right)^2+\\cos\\left(x\\right)^2=1', length: 9 },
                { latex: '2\\cdot\\sum_{n=0}^{\\infty}\\frac{1}{n+1}', length: 6 }
            ];

            for (var i = 0, length = SAMPLE.length; i < length; i++) {
                var tree = window.parseLatexTree(SAMPLE[i].latex);
                expect(tree.children.length).to.equal(SAMPLE[i].length);
                var latex = tree.latex();
                expect(latex).to.equal(SAMPLE[i].latex);
            }
        });

        it ('Latex Permutations', function () {

            var SAMPLE = [
                { latex: 'c=a\\times b+c\\times d', length: 4 }
            ];

            var tree = window.parseLatexTree(SAMPLE[0].latex);
            expect(tree.children.length).to.equal(SAMPLE[0].length);

        });

    });

}(this));
