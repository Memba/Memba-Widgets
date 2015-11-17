/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var sinon = window.sinon;
    // var kendo = window.kendo;
    // var FIXTURES = '#fixtures';
    var assert = window.assert;

    describe('window.log.test', function () {

        /*
        before(function () {
           if (window.__karma__ && $(FIXTURES).length === 0) {
               $('body').append('<div id="fixtures"></div>');
           }
        });
        */

        describe('logging without app.logger', function () {

            it('debug', function () {
                function fn() {
                    assert(false, ERR_MSG);
                }
                expect(fn).to.throw(Error, ERR_MSG);
                expect(assert(true, ERR_MSG)).to.be.undefined;
            });

            it('info', function () {

            });

            it('warn', function () {

            });

            it('error', function () {

            });

            it('crit', function () {

            });

        });

        describe('logging with app.logger', function () {

            var app = {
                logger: {
                    debug: sinon.spy(),
                    info: sinon.spy(),
                    warn: sinon.spy(),
                    error: sinon.spy(),
                    crit: sinon.spy()
                }
            };

            it('debug', function () {

            });

            it('info', function () {

            });

            it('warn', function () {

            });

            it('error', function () {

            });

            it('crit', function () {

            });

        });

    });

}(this, jQuery));
