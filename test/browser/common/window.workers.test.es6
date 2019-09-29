/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO Try josdejong/mathjs
// TODO Try kisonecat/math-expression
// TODO Try silentmatt/math-expr

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
// eslint-disable-next-line import/no-extraneous-dependencies
import chai from 'chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import support from '../../../src/js/common/window.support.es6';
import WorkerPool from '../../../src/js/common/window.workers.es6';
import baseUrl from '../../../src/js/helpers/helpers.base.es6';

const { before, describe, it, xdescribe } = window;
const { expect } = chai;

const libraries = [
    baseUrl('/src/js/vendor/jashkenas/underscore.js'),
    baseUrl('/src/js/vendor/khan/kas.js'),
    baseUrl('/src/js/workers/workers.lib.js')
];

function noop() {}

describe('window.workers', () => {
    (support.webworkers ? describe : xdescribe)('WorkerPool', () => {
        it('It should not create a WorkerPool from invalid values', () => {
            function fn1() {
                const pool = new WorkerPool(1, {});
                noop(pool); // to please eslint
            }

            function fn2() {
                const pool = new WorkerPool(true, 2);
                noop(pool); // to please eslint
            }

            expect(fn1).to.throw();
            expect(fn2).to.throw();
        });

        it('It should create a WorkerPool from valid values', () => {
            const pool = new WorkerPool(2, 500);
            expect(pool).to.have.property('ttl', 500);
            expect(pool)
                .to.have.property('tasks')
                .that.is.an(CONSTANTS.ARRAY)
                .with.property('length', 0);
            expect(pool)
                .to.have.property('workers')
                .that.is.an(CONSTANTS.ARRAY)
                .with.property('length', 2);
        });

        it('It should load a library', done => {
            const pool = new WorkerPool();
            pool.load(libraries)
                .then(() => {
                    try {
                        expect(pool)
                            .to.have.property('_library')
                            .that.is.a('string');
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .catch(done);
        });

        it('It should resolve an echo task', done => {
            const pool = new WorkerPool();
            pool.exec(
                'self.postMessage(e.data);',
                'echo', // e.data
                'dummy' // task name
            )
                .then(result => {
                    try {
                        expect(result).to.have.property('name', 'dummy');
                        expect(result).to.have.property('result', 'echo');
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .catch(done);
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
                    .then(done)
                    .catch(err => {
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
                .then(done)
                .catch(err => {
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
                .then((...args) => {
                    try {
                        for (let i = 0; i < 500; i++) {
                            expect(args[i]).to.have.property(
                                'name',
                                `task ${i}`
                            );
                            expect(args[i]).to.have.property('result', i + 1);
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .catch(done);
        });
    });

    (support.webworkers ? describe : xdescribe)('WorkerLib Functions', () => {
        const pool = new WorkerPool();

        before(done => {
            pool.load(libraries).then(() => {
                done();
            });
        });

        it('blacklisted unsafe functions', done => {
            const DATA = [
                // deactivated
                'ActiveXObject',
                'Blob',
                'clearInterval',
                'clearTimeout',
                'eval',
                'fetch',
                'Function',
                'importScripts', // This occurs after using it in window.workers.es6, so the library gets loaded
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
                'self.postMessage((typeof self[e.data] === "undefined") || (self[e.data] && typeof self[e.data].open === "undefined"));';
            DATA.forEach(data => {
                promises.push(pool.exec(script, data, data));
            });
            $.when(...promises)
                .then((...args) => {
                    try {
                        expect(args.length).to.equal(DATA.length);
                        for (let i = 0; i < args.length; i++) {
                            expect(args[i]).to.have.property('name', DATA[i]);
                            expect(args[i]).to.have.property('result', true);
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .catch(done);
        });

        it('soundex', done => {
            const DATA = [
                { name: 'Soundex', result: 'S532' },
                { name: 'Example', result: 'E251' },
                { name: 'Sownteks', result: 'S532' },
                { name: 'Ekzampul', result: 'E251' },
                { name: 'Euler', result: 'E460' },
                { name: 'Gauss', result: 'G200' },
                { name: 'Hilbert', result: 'H416' },
                { name: 'Knuth', result: 'K530' },
                { name: 'Lloyd', result: 'L300' },
                { name: 'Lukasiewicz', result: 'L222' },
                { name: 'Ellery', result: 'E460' },
                { name: 'Ghosh', result: 'G200' },
                { name: 'Heilbronn', result: 'H416' },
                { name: 'Kant', result: 'K530' },
                { name: 'Ladd', result: 'L300' },
                { name: 'Lissajous', result: 'L222' },
                { name: 'Wheaton', result: 'W350' },
                { name: 'Ashcraft', result: 'A226' },
                { name: 'Burroughs', result: 'B622' },
                { name: 'Burrows', result: 'B620' },
                { name: "O'Hara", result: 'O600' }
            ];
            const promises = [];
            const script = 'self.postMessage(soundex(e.data));';
            DATA.forEach(data => {
                promises.push(pool.exec(script, data.name, data.name));
            });
            $.when(...promises)
                .then((...args) => {
                    try {
                        expect(args.length).to.equal(DATA.length);
                        for (let i = 0; i < args.length; i++) {
                            expect(args[i]).to.have.property(
                                'name',
                                DATA[i].name
                            );
                            expect(args[i]).to.have.property(
                                'result',
                                DATA[i].result
                            );
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .catch(done);
        });

        it('metaphone', done => {
            const DATA = [
                { name: 'Gnu', result: 'N' },
                { name: 'bigger', result: 'BKR' },
                { name: 'accuracy', result: 'AKKRS' },
                { name: 'batch batcher', result: 'BXBXR' }
                // TODO we need more...
            ];
            const promises = [];
            const script = 'self.postMessage(metaphone(e.data));';
            DATA.forEach(data => {
                promises.push(pool.exec(script, data.name, data.name));
            });
            $.when(...promises)
                .then((...args) => {
                    try {
                        expect(args.length).to.equal(DATA.length);
                        for (let i = 0; i < args.length; i++) {
                            expect(args[i]).to.have.property(
                                'name',
                                DATA[i].name
                            );
                            expect(args[i]).to.have.property(
                                'result',
                                DATA[i].result
                            );
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .catch(done);
        });

        it('removeDiacritics', done => {
            const DATA = [
                {
                    name: 'La leçon est terminée',
                    result: 'La lecon est terminee'
                },
                { name: 'Cómo está usted', result: 'Como esta usted' },
                { name: 'można zapoznać się', result: 'mozna zapoznac sie' },
                {
                    name: 'Z przyjemnością prezentuje Państwu',
                    result: 'Z przyjemnoscia prezentuje Panstwu'
                }
                // TODO we need more...
            ];
            const promises = [];
            const script = 'self.postMessage(removeDiacritics(e.data));';
            DATA.forEach(data => {
                promises.push(pool.exec(script, data.name, data.name));
            });
            $.when(...promises)
                .then((...args) => {
                    try {
                        expect(args.length).to.equal(DATA.length);
                        for (let i = 0; i < args.length; i++) {
                            expect(args[i]).to.have.property(
                                'name',
                                DATA[i].name
                            );
                            expect(args[i]).to.have.property(
                                'result',
                                DATA[i].result
                            );
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .catch(done);
        });

        it('Array.equals', done => {
            const DATA = [
                { value: [1, 2, 3], solution: [1, 2, 3], result: true },
                { value: [1, 2], solution: [2, 1], result: false },
                {
                    value: ['a', 'b', 'c'],
                    solution: ['a', 'b', 'c'],
                    result: true
                },
                {
                    value: ['a', 'b', 'c'],
                    solution: ['c', 'b', 'a'],
                    result: false
                },
                {
                    value: ['a', 'b', 'c'],
                    solution: ['x', 'y', 'z'],
                    result: false
                }
            ];
            const script =
                'self.postMessage(e.data.value.equals(e.data.solution));';
            const promises = [];
            DATA.forEach((data, index) => {
                promises.push(pool.exec(script, data, `Task ${index}`));
            });
            $.when(...promises)
                .then((...args) => {
                    try {
                        expect(args.length).to.equal(DATA.length);
                        for (let i = 0; i < args.length; i++) {
                            expect(args[i]).to.have.property(
                                'name',
                                `Task ${i}`
                            );
                            expect(args[i]).to.have.property(
                                'result',
                                DATA[i].result
                            );
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .catch(done);
        });

        it('Formula.equals', done => {
            const DATA = [
                {
                    value: '(x-2)(x-1)',
                    solution: '(x-1)(x-2)',
                    result: true
                },
                { value: '(x-5)', solution: '-x-3', result: false },
                {
                    value: '(3x+7)/(x+4)',
                    solution: '(-3x-7)/(-x-4)',
                    result: true
                },
                {
                    value: '\\frac{x-1}{y}',
                    solution: '(x-1)/(y)',
                    result: true
                },
                { value: '(x-5)(x+5)', solution: 'x^2-25', result: true }
            ];
            const script =
                'self.postMessage(Formula(e.data.value).equals(e.data.solution));';
            const promises = [];
            DATA.forEach((data, index) => {
                promises.push(pool.exec(script, data, `Task ${index}`));
            });
            $.when(...promises)
                .then((...args) => {
                    try {
                        expect(args.length).to.equal(DATA.length);
                        for (let i = 0; i < args.length; i++) {
                            expect(args[i]).to.have.property(
                                'name',
                                `Task ${i}`
                            );
                            expect(args[i]).to.have.property(
                                'result',
                                DATA[i].result
                            );
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .catch(done);
        });
    });
});
