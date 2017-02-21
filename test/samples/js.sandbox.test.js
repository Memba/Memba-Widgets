/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, expr: true */
/* jshint browser: true, expr: true */
/* global describe, it, before, xdescribe, xit */

;(function (window, undefined) {

    'use strict';

    var expect = window.chai.expect;

    describe('Sandboxing unsafe JavaScript code', function() {

        describe('Eval/new Function', function() {

            it('Simple: this and window give access to global scope', function () {
                //See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
                //var fn = new Function('value', 'debugger;\nreturn value;');
                var fn = new Function('value', 'return value;');
                expect(fn(true)).to.be.true;
                expect(fn(false)).to.be.false;
            });

            it('Improved: cannot create global variables but global objects like console or XMLHttpRequest are accessible', function () {
                //var fn = new Function('window', 'value', '"use strict";\ndebugger;\nreturn value;');
                var fn = new Function('window', 'value', '"use strict";\nreturn value;');
                expect(fn.call({}, {}, true)).to.be.true;
                expect(fn.call({}, {}, false)).to.be.false;
            });

        });

        describe('Web workers', function() {

            it('Web workers: first simple attempt', function(done) {
                // See http://www.html5rocks.com/en/tutorials/workers/basics/#toc-inlineworkers
                if (!!window.Worker) {
                    var blob = new Blob(["onmessage = function(e) {\n 'use strict';\n debugger;\n postMessage(e.data); }"]);
                    var blobURL = window.URL.createObjectURL(blob);
                    var worker = new Worker(blobURL);
                    worker.onmessage = function(e) {
                        expect(e.data).to.equal(7);
                        done();
                    };
                    worker.postMessage(7); // Start the worker.
                }
            });

            xit('Web workers: throw error', function(done) {
                //TODO
                done();
            });

            xit('Web workers: with timeout to terminate long workers', function(done) {
                done();
            });

            xit('Web workers: the stackoverflow way (with timeout and whitelist)', function(done) {
                //See: http://stackoverflow.com/questions/10653809/making-webworkers-a-safe-environment
                done();
            });

        });

    });

}(this));
