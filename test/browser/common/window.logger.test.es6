/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import Logger from '../../../src/js/common/window.logger.es6';

const { afterEach, beforeEach, describe, it } = window;
const { expect } = chai;
chai.use(sinonChai);

const MODULE = 'logger.test';
const MESSAGE = 'My message';
// const METHOD = 'myMethod';
const TRACE = '1234567890';
const DATA = { a: 1, b: 2, c: 3 };
const ERROR = new SyntaxError('Bad syntax');
const LINEFEED = '\n';
const LINESEP = ', ';
const RX_SPACES = /\s+/g;
const SPACE = ' ';
const EQ = ': ';
const FIRST = ' ';
const SEP = '; '; // '  |  ';

function messageLog(level, message, data) {
    return `[${level.toUpperCase()}${
        level.length === 4 ? ' ' : ''
    }]${FIRST}message${EQ}${message}${SEP}module${EQ}${MODULE}${SEP}data${EQ}${JSON.stringify(
        data
    )}`;
}

function errorLog(level, message, data, error) {
    /* eslint-disable prettier/prettier */
    const stack =
        $.type(error.stack) === CONSTANTS.STRING // for PhantomJS
            ? `stack${EQ}${error.stack
                .split(LINEFEED)
                .join(LINESEP)
                .replace(RX_SPACES, SPACE)}${SEP}`
            : '';
    return `[${level.toUpperCase()}${
        level.length === 4 ? ' ' : ''
    }]${FIRST}message${EQ}${message}${SEP}module${EQ}${MODULE}${SEP}${stack}data${EQ}${JSON.stringify(
        data
    )}`;
    /* eslint-enable prettier/prettier */
}

describe('window.logger', () => {
    describe('Legacy export', () => {
        it('Check Logger', () => {
            expect(Logger).to.be.a('function');
            expect(window.Logger).to.be.a('function');
            if (!window.__karma__) {
                expect(window.Logger).to.equal(Logger);
            }
        });
    });

    describe('logging without plugin at level 0', () => {
        let logger;
        let console;

        beforeEach(() => {
            window.DEBUG = 0;
            logger = new Logger(MODULE);
            console = {
                log: sinon.spy(),
                error: sinon.spy()
            };
            window.console = console;
        });

        it('missing level should throw', () => {
            function test() {
                logger.log(MESSAGE, DATA);
            }
            expect(test).to.throw();
        });

        it('log messages with level param', () => {
            function test(level) {
                logger.log(level, { message: MESSAGE, data: DATA });
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith(
                    messageLog(level, MESSAGE, DATA)
                );
            }
            test('debug');
            test('info');
            test('warn');
        });

        it('log messages with level functions', () => {
            function test(level) {
                logger[level]({ message: MESSAGE, data: DATA });
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith(
                    messageLog(level, MESSAGE, DATA)
                );
            }
            test('debug');
            test('info');
            test('warn');
        });

        it('log errors with level param', () => {
            function test(level, count) {
                logger.log(level, {
                    message: MESSAGE,
                    data: DATA,
                    error: ERROR
                });
                expect(console.error).to.have.callCount(count);
                expect(console.log).to.have.callCount(count);
                expect(console.log).to.have.been.calledWith(
                    errorLog(level, MESSAGE, DATA, ERROR)
                );
            }
            test('error', 1);
            test('crit', 2);
        });

        it('log errors with level functions', () => {
            function test(level, count) {
                logger[level]({
                    message: MESSAGE,
                    data: DATA,
                    error: ERROR
                });
                expect(console.error).to.have.callCount(count);
                expect(console.log).to.have.been.calledWith(
                    errorLog(level, MESSAGE, DATA, ERROR)
                );
            }
            test('error', 1);
            test('crit', 2);
        });
    });

    describe('logging with plugin at level 2', () => {
        let logger;
        let console;
        let plugin;

        beforeEach(() => {
            window.DEBUG = 2;
            plugin = {
                log: sinon.spy()
            };
            Logger.register(plugin);
            logger = new Logger(MODULE);
            console = {
                log: sinon.spy(),
                error: sinon.spy()
            };
            window.console = console;
        });

        it('debug level should not log', () => {
            function test(level) {
                logger[level](MESSAGE);
                expect(console.log).to.have.callCount(0);
                expect(console.error).to.have.callCount(0);
                expect(plugin.log).to.have.callCount(1);
            }
            test('debug');
            // test('info');
            // test('warn');
        });

        it('other message levels should log', () => {
            function test(level) {
                logger[level]({ message: MESSAGE, data: DATA });
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith(
                    messageLog(level, MESSAGE, DATA)
                );
                expect(plugin.log).to.have.been.calledWithMatch({
                    level,
                    module: MODULE,
                    message: MESSAGE,
                    data: DATA
                });
            }
            // test('debug');
            test('info');
            test('warn');
        });

        it('error levels should log', () => {
            function test(level, count) {
                logger[level]({
                    message: MESSAGE,
                    data: DATA,
                    error: ERROR
                });
                expect(console.error).to.have.callCount(count);
                expect(console.log).to.have.been.calledWith(
                    errorLog(level, MESSAGE, DATA, ERROR)
                );
                expect(plugin.log).to.have.been.calledWithMatch({
                    level,
                    module: MODULE,
                    message: MESSAGE,
                    data: DATA
                });
            }
            test('error', 1);
            test('crit', 2);
        });
    });

    describe('logging with plugin at level 4', () => {
        let logger;
        let console;
        let plugin;

        beforeEach(() => {
            window.DEBUG = 4;
            plugin = {
                log: sinon.spy()
            };
            Logger.register(plugin);
            logger = new Logger(MODULE);
            console = {
                log: sinon.spy(),
                error: sinon.spy()
            };
            window.console = console;
        });

        it('debug/info levels should not log', () => {
            function test(level) {
                logger[level](MESSAGE);
                expect(console.log).to.have.callCount(0);
                expect(console.error).to.have.callCount(0);
                expect(plugin.log).to.have.been.calledWithMatch({
                    level,
                    module: MODULE,
                    message: MESSAGE
                    // data: DATA
                });
            }
            test('debug');
            test('info');
            // test('warn');
        });

        it('other message levels should log', () => {
            function test(level) {
                logger[level]({ message: MESSAGE, data: DATA });
                expect(console.error).to.have.callCount(0);
                expect(console.log).to.have.been.calledWith(
                    messageLog(level, MESSAGE, DATA)
                );
                expect(plugin.log).to.have.been.calledWithMatch({
                    level,
                    module: MODULE,
                    message: MESSAGE,
                    data: DATA
                });
            }
            // test('debug');
            // test('info');
            test('warn');
        });

        it('error levels should log', () => {
            function test(level, count) {
                logger[level]({
                    message: MESSAGE,
                    data: DATA,
                    error: ERROR
                });
                expect(console.error).to.have.callCount(count);
                expect(console.log).to.have.been.calledWith(
                    errorLog(level, MESSAGE, DATA, ERROR)
                );
                expect(plugin.log).to.have.been.calledWithMatch({
                    level,
                    module: MODULE,
                    message: MESSAGE,
                    data: DATA
                });
            }
            test('error', 1);
            test('crit', 2);
        });
    });

    describe('logging with plugin at level 8', () => {
        let logger;
        let console;
        let plugin;

        beforeEach(() => {
            window.DEBUG = 8;
            plugin = {
                log: sinon.spy()
            };
            Logger.register(plugin);
            logger = new Logger(MODULE);
            console = {
                log: sinon.spy(),
                error: sinon.spy()
            };
            window.console = console;
        });

        it('no level should log', () => {
            function test(level) {
                logger[level](MESSAGE);
                expect(console.log).to.have.callCount(0);
                expect(console.error).to.have.callCount(0);
                expect(plugin.log).to.have.been.calledWithMatch({
                    level,
                    module: MODULE,
                    message: MESSAGE
                    // data: DATA
                });
            }
            test('debug');
            test('info');
            test('warn');
            test('error');
            test('crit');
        });
    });

    describe('logging with a trace', () => {
        let logger;
        let console;
        let plugin;

        beforeEach(() => {
            window.DEBUG = true;
            plugin = {
                log: sinon.spy()
            };
            Logger.register(plugin);
            logger = new Logger(MODULE);
            console = {
                log: sinon.spy(),
                error: sinon.spy()
            };
            window.console = console;

            $('<input id="trace" type="hidden">')
                .appendTo(document.body)
                .val(TRACE);
        });

        it('Debug should log with a trace', () => {
            logger.debug(MESSAGE);
            expect(console.log).to.have.callCount(1);
            expect(console.error).to.have.callCount(0);
            expect(console.log).to.have.been.calledWith(
                `[DEBUG]${FIRST}message${EQ}${MESSAGE}${SEP}module${EQ}${MODULE}${SEP}trace${EQ}${TRACE}`
            );
            expect(plugin.log).to.have.been.calledWithMatch({
                level: 'debug',
                module: MODULE,
                message: MESSAGE
                // data: DATA
            });
        });

        afterEach(() => {
            $('#trace').remove();
        });
    });
});
