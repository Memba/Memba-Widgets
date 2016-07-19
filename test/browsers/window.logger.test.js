/**
 * Copyright (c) 2013-2016 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var app = window.app = window.app || {};
    var expect = window.chai.expect;
    var sinon = window.sinon;
    // var kendo = window.kendo;
    // var FIXTURES = '#fixtures';
    var MODULE = 'window.logger.test';
    var MESSAGE = 'my message';
    var METHOD = 'myMethod';
    var TRACE = '1234567890';
    var DATA = { a: 1, b: 2, c: 3 };
    var ERROR = new SyntaxError('Bad syntax');

    var LINEFEED = '\n';
    var LINESEP = ', ';
    var SPACES = /\s+/g;
    var SPACE = ' ';
    var EQ = ': ';
    var FIRST = ' ';
    var SEP = '; '; // '  |  ';

    // Debug window.onerror
    // app.DEBUG = true;
    // app.level = 0;
    // throw new Error('oops');

    describe('window.logger.test', function () {

        /*
        before(function () {
           if (window.__karma__ && $(FIXTURES).length === 0) {
               $('body').append('<div id="fixtures"></div>');
           }
        });
        */

        describe('logging without app.logger at level 0', function () {

            var logger;
            var console;
            var ret;

            beforeEach(function () {
                app.DEBUG = true;
                app.level = 0;
                logger = new window.Logger(MODULE);
                console = window.console = {
                    log: sinon.spy(),
                    error: sinon.spy()
                };
            });

            it('log messages', function () {
                function fn() {
                    logger.log(MESSAGE, DATA);
                }
                expect(fn).to.throw;
                // DEBUG
                ret = logger.log('debug', { message: MESSAGE, data: DATA });
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith('[DEBUG]' + FIRST + 'message'  + EQ + MESSAGE + SEP + 'module'  + EQ + MODULE + SEP + 'data'  + EQ + JSON.stringify(DATA));
                // INFO
                ret = logger.log('info', MESSAGE, DATA);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(2);
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith('[INFO ]' + FIRST + 'message'  + EQ + MESSAGE + SEP + 'module'  + EQ + MODULE + SEP + 'data'  + EQ + JSON.stringify(DATA));
                // WARN
                ret = logger.log('warn', MESSAGE, DATA);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(3);
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith('[WARN ]' + FIRST + 'message'  + EQ + MESSAGE + SEP + 'module'  + EQ + MODULE + SEP + 'data'  + EQ + JSON.stringify(DATA));
            });

            it('log errors', function () {
                // ERROR
                ret = logger.log('error', { message: MESSAGE, data: DATA, error: ERROR });
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(1);
                // expect(console.log).to.have.been.calledWith('[ERROR]' + FIRST + 'message'  + EQ + MESSAGE + SEP + 'module'  + EQ + MODULE + SEP + 'data'  + EQ + JSON.stringify(DATA));
                // CRIT
                ret = logger.log('crit', ERROR);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(2);
                expect(console.error).to.have.callCount(2);
                // expect(console.log).to.have.been.calledWith('[CRIT ]' + FIRST + 'message'  + EQ + MESSAGE + SEP + 'module'  + EQ + MODULE + SEP + 'data'  + EQ + JSON.stringify(DATA));
            });

            it('DEBUG should log', function () {
                ret = logger.debug(MESSAGE, DATA);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith('[DEBUG]' + FIRST + 'message'  + EQ + MESSAGE + SEP + 'module'  + EQ + MODULE + SEP + 'data'  + EQ + JSON.stringify(DATA));
            });

            it('INFO should log', function () {
                ret = logger.info(MESSAGE, DATA);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith('[INFO ]' + FIRST + 'message'  + EQ + MESSAGE + SEP + 'module'  + EQ + MODULE + SEP + 'data'  + EQ + JSON.stringify(DATA));
            });

            it('WARN should log', function () {
                ret = logger.warn(MESSAGE, DATA);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith('[WARN ]' + FIRST + 'message'  + EQ + MESSAGE + SEP + 'module'  + EQ + MODULE + SEP + 'data'  + EQ + JSON.stringify(DATA));
            });

            it('ERROR should log', function () {
                ret = logger.error(ERROR);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(1);
            });

            it('CRIT should log', function () {
                ret = logger.crit(ERROR);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(1);
            });

        });

        describe('logging without app.logger at level 2', function () {

            var logger;
            var console;
            var ret;

            beforeEach(function () {
                app.DEBUG = true;
                app.level = 2;
                logger = new window.Logger(MODULE);
                console = window.console = {
                    log: sinon.spy(),
                    error: sinon.spy()
                };
            });

            it('DEBUG should not log', function () {
                ret = logger.debug(MESSAGE);
                expect(ret).to.be.false;
                expect(console.log).to.have.callCount(0);
                expect(console.error).to.have.callCount(0);
            });

            it('INFO should log', function () {
                ret  = logger.info(undefined);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith('[INFO ]' + FIRST + 'module'  + EQ + MODULE);
            });

            it('WARN should log', function () {
                var NOW = new Date();
                ret = logger.warn(NOW);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith('[WARN ]' + FIRST + 'module'  + EQ + MODULE + SEP + 'data'  + EQ + JSON.stringify(NOW));
            });

            it('ERROR should log', function () {
                var entry = new Error('Oops');
                entry.originalError = new TypeError('Oops with details');
                ret = logger.error(entry);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(1);
                // expect(console.log).to.have.been.calledWith('[ERROR]	message = Oops	original = Oops with details	module = window.logger.test	stack = TypeError: Oops with details;     at Context.<anonymous> (http://localhost:63342/Kidoju.Widgets/test/browsers/window.logger.test.js:170:39);     at callFn (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4202:21);     at Test.Runnable.run (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4195:7);     at Runner.runTest (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4661:10);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4768:12;     at next (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4581:14);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4591:7;     at next (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4523:14);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4554:7;     at done (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4163:5)');
            });

            it('CRIT should log', function () {
                var entry = new Error('Oops');
                entry.originalError = new TypeError('Oops with details');
                ret = logger.crit(entry);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(1);
                // expect(console.log).to.have.been.calledWith('[CRIT ]	message = Oops	original = Oops with details	module = window.logger.test	stack = TypeError: Oops with details;     at Context.<anonymous> (http://localhost:63342/Kidoju.Widgets/test/browsers/window.logger.test.js:180:39);     at callFn (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4202:21);     at Test.Runnable.run (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4195:7);     at Runner.runTest (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4661:10);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4768:12;     at next (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4581:14);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4591:7;     at next (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4523:14);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4554:7;     at done (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4163:5)');
            });

        });

        describe('logging without app.logger at level 4', function () {

            var logger;
            var console;
            var ret;

            beforeEach(function () {
                app.DEBUG = true;
                app.level = 4;
                logger = new window.Logger(MODULE);
                console = window.console = {
                    log: sinon.spy(),
                    error: sinon.spy()
                };
            });

            it('DEBUG should not log', function () {
                ret = logger.debug(MESSAGE);
                expect(ret).to.be.false;
                expect(console.log).to.have.callCount(0);
                expect(console.error).to.have.callCount(0);
            });

            it('INFO should not log', function () {
                ret = logger.debug(MESSAGE);
                expect(ret).to.be.false;
                expect(console.log).to.have.callCount(0);
                expect(console.error).to.have.callCount(0);
            });

            it('WARN should log', function () {
                var entry = { module: MODULE, method: METHOD,  message: MESSAGE, data: DATA };
                ret = logger.warn(entry);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith('[WARN ]' + FIRST + 'message'  + EQ + MESSAGE + SEP + 'module'  + EQ + MODULE + SEP + 'method'  + EQ + METHOD + SEP + 'data'  + EQ + JSON.stringify(DATA));
            });

            it('ERROR should log', function () {
                var entry = new Error('Oops');
                entry.originalError = new TypeError('Oops with details');
                ret = logger.error(entry);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(1);
                // expect(console.log).to.have.been.calledWith('[ERROR]	message = Oops	original = Oops with details	module = window.logger.test	stack = TypeError: Oops with details;     at Context.<anonymous> (http://localhost:63342/Kidoju.Widgets/test/browsers/window.logger.test.js:170:39);     at callFn (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4202:21);     at Test.Runnable.run (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4195:7);     at Runner.runTest (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4661:10);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4768:12;     at next (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4581:14);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4591:7;     at next (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4523:14);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4554:7;     at done (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4163:5)');
            });

            it('CRIT should log', function () {
                var entry = new Error('Oops');
                entry.originalError = new TypeError('Oops with details');
                ret = logger.crit(entry);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(1);
                // expect(console.log).to.have.been.calledWith('[CRIT ]	message = Oops	original = Oops with details	module = window.logger.test	stack = TypeError: Oops with details;     at Context.<anonymous> (http://localhost:63342/Kidoju.Widgets/test/browsers/window.logger.test.js:180:39);     at callFn (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4202:21);     at Test.Runnable.run (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4195:7);     at Runner.runTest (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4661:10);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4768:12;     at next (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4581:14);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4591:7;     at next (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4523:14);     at http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4554:7;     at done (http://localhost:63342/Kidoju.Widgets/test/vendor/mocha.js:4163:5)');
            });

        });

        describe('logging without app.logger at level 8', function () {

            var logger;
            var console;
            var ret;

            beforeEach(function () {
                app.DEBUG = true;
                app.level = 8;
                logger = new window.Logger(MODULE);
                console = window.console = {
                    log: sinon.spy(),
                    error: sinon.spy()
                };
            });

            it('DEBUG should not log', function () {
                ret = logger.debug(MESSAGE);
                expect(ret).to.be.false;
                expect(console.log).to.have.callCount(0);
                expect(console.error).to.have.callCount(0);
            });

            it('INFO should not log', function () {
                ret = logger.debug(MESSAGE);
                expect(ret).to.be.false;
                expect(console.log).to.have.callCount(0);
                expect(console.error).to.have.callCount(0);
            });

            it('WARN should not log', function () {
                ret = logger.debug(MESSAGE);
                expect(ret).to.be.false;
                expect(console.log).to.have.callCount(0);
                expect(console.error).to.have.callCount(0);
            });

            it('ERROR should not log', function () {
                var entry = new Error('Oops');
                entry.originalError = new TypeError('Oops with details');
                ret = logger.error(entry);
                expect(ret).to.be.false;
                expect(console.log).to.have.callCount(0);
                expect(console.error).to.have.callCount(0);
            });

            it('CRIT should not log', function () {
                var entry = new Error('Oops');
                entry.originalError = new TypeError('Oops with details');
                ret = logger.crit(entry);
                expect(ret).to.be.false;
                expect(console.log).to.have.callCount(0);
                expect(console.error).to.have.callCount(0);
            });

        });

        describe('logging with a trace', function () {

            var logger;
            var console;
            var ret;

            beforeEach(function () {
                app.DEBUG = true;
                app.level = 0;
                logger = new window.Logger(MODULE);
                console = window.console = {
                    log: sinon.spy(),
                    error: sinon.spy()
                };

                $('<input id="trace" type="hidden">')
                    .appendTo(document.body)
                    .val(TRACE);
            });

            it('ANY should log with a trace', function () {
                ret = logger.debug(MESSAGE);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith('[DEBUG]' + FIRST + 'message' + EQ + MESSAGE + SEP + 'module'  + EQ + MODULE + SEP + 'trace'  + EQ + TRACE);
            });

            afterEach(function () {
                $('#trace').remove();
            });

        });

        describe('logging with app.logger at level 0', function () {

            var logger;
            var console;
            var ret;

            beforeEach(function () {
                app.DEBUG = true;
                app.level = 0;
                app.logger = {
                    _debug: sinon.spy(),
                    _info: sinon.spy(),
                    _warn: sinon.spy(),
                    _error: sinon.spy(),
                    _crit: sinon.spy()
                };
                logger = new window.Logger(MODULE);
                console = window.console = {
                    log: sinon.spy(),
                    error: sinon.spy()
                };
            });

            it('debug', function () {
                ret = logger.debug(MESSAGE);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(0);
                expect(app.logger._debug).to.have.callCount(1);
                expect(app.logger._info).to.have.callCount(0);
                expect(app.logger._warn).to.have.callCount(0);
                expect(app.logger._error).to.have.callCount(0);
                expect(app.logger._crit).to.have.callCount(0);
            });

            it('info', function () {
                ret = logger.info(MESSAGE);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(0);
                expect(app.logger._debug).to.have.callCount(0);
                expect(app.logger._info).to.have.callCount(1);
                expect(app.logger._warn).to.have.callCount(0);
                expect(app.logger._error).to.have.callCount(0);
                expect(app.logger._crit).to.have.callCount(0);
            });

            it('warn', function () {
                ret = logger.warn(MESSAGE);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(0);
                expect(app.logger._debug).to.have.callCount(0);
                expect(app.logger._info).to.have.callCount(0);
                expect(app.logger._warn).to.have.callCount(1);
                expect(app.logger._error).to.have.callCount(0);
                expect(app.logger._crit).to.have.callCount(0);
            });

            it('error', function () {
                ret = logger.error(ERROR);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(1);
                expect(app.logger._debug).to.have.callCount(0);
                expect(app.logger._info).to.have.callCount(0);
                expect(app.logger._warn).to.have.callCount(0);
                expect(app.logger._error).to.have.callCount(1);
                expect(app.logger._crit).to.have.callCount(0);
            });

            it('crit', function () {
                ret = logger.crit(ERROR);
                expect(ret).to.be.true;
                expect(console.log).to.have.callCount(1);
                expect(console.error).to.have.callCount(1);
                expect(app.logger._debug).to.have.callCount(0);
                expect(app.logger._info).to.have.callCount(0);
                expect(app.logger._warn).to.have.callCount(0);
                expect(app.logger._error).to.have.callCount(0);
                expect(app.logger._crit).to.have.callCount(1);
            });

        });

    });

}(this, jQuery));
