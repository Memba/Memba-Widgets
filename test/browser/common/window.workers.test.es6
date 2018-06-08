/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import $ from 'jquery';
import chai from 'chai';
import WorkerPool from '../../../src/js/common/window.workers.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';

const { before, describe, it, location } = window;
const { expect } = chai;
const url = `${location.protocol}//${location.host}${
    /^\/Kidoju.Widgets\//.test(location.pathname) ? '/Kidoju.Widgets' : ''
}/src/js/kidoju.data.workerlib.js`;

function noop() {}

describe('window.workers', () => {
    if (window.PHANTOMJS) {
        // PhantomJS does not support web workers
        return;
    }

    describe('WorkerPool', () => {
        it('It should not create a WorkerPool from invalid values', () => {
            function fn1() {
                const pool = new WorkerPool(1, {});
                noop(pool); // to please eslint
            }
            function fn2() {
                const pool = new WorkerPool(true, 2);
                noop(pool); // to please eslint
            }
            expect(fn1).to.throw;
            expect(fn2).to.throw;
        });

        it('It should create a WorkerPool from valid values', () => {
            const pool = new WorkerPool(2, 500);
            expect(pool).to.have.property('ttl', 500);
            expect(pool)
                .to.have.property('tasks')
                .that.is.an('array')
                .with.property('length', 0);
            expect(pool)
                .to.have.property('workers')
                .that.is.an('array')
                .with.property('length', 2);
        });

        it('It should load a library', done => {
            const pool = new WorkerPool();
            pool.load(url)
                .done(() => {
                    try {
                        expect(pool)
                            .to.have.property('_library')
                            .that.is.a('string');
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('It should resolve an echo task', done => {
            const pool = new WorkerPool();
            pool.exec(
                'self.postMessage(e.data);',
                'echo', // e.data
                'dummy' // task name
            )
                .done(result => {
                    try {
                        expect(result).to.have.property('name', 'dummy');
                        expect(result).to.have.property('value', 'echo');
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('It should report an error', done => {
            if (
                'chrome' in window &&
                $.type(window.StyleMedia) === CONSTANTS.UNDEFINED
            ) {
                const pool = new WorkerPool();
                pool.exec(
                    'self.postMessage(unknown(e.data));',
                    true, // e.data
                    'Task' // task name
                )
                    .done(done)
                    .fail(err => {
                        try {
                            expect(err).to.be.an.instanceof(Error);
                            expect(err).to.have.property('filename');
                            expect(err).to.have.property('colno');
                            expect(err).to.have.property('lineno');
                            done();
                        } catch (ex) {
                            done(ex);
                        }
                    });
            } else {
                // global.onerror is triggered in Edge and FF and the test would fail
                done();
            }
        });

        it('It should report a timeout', done => {
            const pool = new WorkerPool();
            pool.exec(
                'var i = e.data; while(i > -1) { i++ };self.postMessage(i);',
                0, // e.data
                'Task' // task name
            )
                .done(done)
                .fail(err => {
                    try {
                        expect(err).to.be.an.instanceof(Error);
                        expect(err).to.have.property('timeout');
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                });
        });

        it('It should exec a large number of tasks', done => {
            const pool = new WorkerPool();
            const promises = [];
            for (let i = 0; i < 500; i++) {
                promises.push(
                    pool.exec(
                        'self.postMessage(e.data + 1);',
                        i, // e.data
                        `task ${i}` // task name
                    )
                );
            }
            $.when(...promises)
                .done((...args) => {
                    try {
                        for (let i = 0; i < 500; i++) {
                            expect(args[i]).to.have.property(
                                'name',
                                `task ${i}`
                            );
                            expect(args[i]).to.have.property('value', i + 1);
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });
    });

    describe('WorkerLib Functions', () => {
        const pool = new WorkerPool();

        before(done => {
            pool.load(url).done(() => {
                done();
            });
        });

        it('blacklisted unsafe functions', done => {
            const UNSAFE = [
                // deactivated
                'ActiveXObject',
                'clearInterval',
                'clearTimeout',
                'eval',
                'fetch',
                'Function',
                'importScripts',
                'indexedDB',
                'mozIndexedDB',
                'webkitIndexedDB',
                'msIndexedDB',
                'requestFileSystem',
                'webkitRequestFileSystem',
                'setInterval',
                'setTimeout',
                'XMLHttpRequest',
                'webkitRequestFileSystemSync',
                'webkitResolveLocalFileSystemURL',
                'webkitResolveLocalFileSystemSyncURL',
                'Worker',

                // not deactivated (because it should not exist)
                'localStorage',
                'openDatabase',
                'sessionStorage',
                'SharedWorker'
            ];
            const promises = [];
            const script = // 'console.log(e.data + ": " + typeof self[e.data]); ' +
                'self.postMessage(typeof self[e.data] === "undefined" || typeof self[e.data].open === "undefined");';
            UNSAFE.forEach(unsafe => {
                promises.push(pool.exec(script, unsafe, unsafe));
            });
            $.when(...promises)
                .done((...args) => {
                    try {
                        expect(args.length).to.equal(UNSAFE.length);
                        for (let i = 0; i < args.length; i++) {
                            expect(args[i]).to.have.property('name', UNSAFE[i]);
                            expect(args[i]).to.have.property('value', true);
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('soundex', done => {
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
                { name: "O'Hara", value: 'O600' }
            ];
            const promises = [];
            const script = 'self.postMessage(soundex(e.data));';
            DATA.forEach(data => {
                promises.push(pool.exec(script, data.name, data.name));
            });
            $.when(...promises)
                .done((...args) => {
                    try {
                        expect(args.length).to.equal(DATA.length);
                        for (let i = 0; i < args.length; i++) {
                            expect(args[i]).to.have.property(
                                'name',
                                DATA[i].name
                            );
                            expect(args[i]).to.have.property(
                                'value',
                                DATA[i].value
                            );
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('metaphone', done => {
            const DATA = [
                { name: 'Gnu', value: 'N' },
                { name: 'bigger', value: 'BKR' },
                { name: 'accuracy', value: 'AKKRS' },
                { name: 'batch batcher', value: 'BXBXR' }
                // TODO we need more...
            ];
            const promises = [];
            const script = 'self.postMessage(metaphone(e.data));';
            DATA.forEach(data => {
                promises.push(pool.exec(script, data.name, data.name));
            });
            $.when(...promises)
                .done((...args) => {
                    try {
                        expect(args.length).to.equal(DATA.length);
                        for (let i = 0; i < args.length; i++) {
                            expect(args[i]).to.have.property(
                                'name',
                                DATA[i].name
                            );
                            expect(args[i]).to.have.property(
                                'value',
                                DATA[i].value
                            );
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('removeDiacritics', done => {
            const DATA = [
                {
                    name: 'La leçon est terminée',
                    value: 'La lecon est terminee'
                },
                { name: 'Cómo está usted', value: 'Como esta usted' },
                { name: 'można zapoznać się', value: 'mozna zapoznac sie' },
                {
                    name: 'Z przyjemnością prezentuje Państwu',
                    value: 'Z przyjemnoscia prezentuje Panstwu'
                }
                // TODO we need more...
            ];
            const promises = [];
            const script = 'self.postMessage(removeDiacritics(e.data));';
            DATA.forEach(data => {
                promises.push(pool.exec(script, data.name, data.name));
            });
            $.when(...promises)
                .done((...args) => {
                    try {
                        expect(args.length).to.equal(DATA.length);
                        for (let i = 0; i < args.length; i++) {
                            expect(args[i]).to.have.property(
                                'name',
                                DATA[i].name
                            );
                            expect(args[i]).to.have.property(
                                'value',
                                DATA[i].value
                            );
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        /*
        it('Array.equals', done => {
            done();
        });
        */
    });
});
