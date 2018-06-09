/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import $ from 'jquery';
import chai from 'chai';
import sinon from 'sinon';
import 'sinon-chai';
import localForage from '../../../src/js/vendor/localforage/localforage.nopromises';
import Database from '../../../src/js/common/window.pongodb.database.es6';
import Collection from '../../../src/js/common/window.pongodb.collection.es6';
import Migration from '../../../src/js/common/window.pongodb.migration.es6';

const { before, describe, it } = window;
const { expect } = chai;

describe('window.pongodb.database', () => {
    describe('Legacy export', () => {
        it('Check window.pongodb.*', () => {
            expect(window.pongodb.Collection).to.equal(Collection);
            expect(window.pongodb.Database).to.equal(Database);
        });
    });

    describe('localForage', () => {
        const LF_DB = 'lf_db';
        const STORE1 = 'store1';
        const STORE2 = 'store2';
        const KEY1 = 'key1';
        const KEY2 = 'key2';
        const VALUE1 = 'A simple test 1';
        const VALUE2 = 'A simple test 2';

        describe('Static', () => {
            it('it should write', done => {
                localForage.setItem(KEY1, VALUE1, (err, value) => {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE1);
                    done();
                });
            });

            it('it should read', done => {
                localForage.getItem(KEY1, (err, value) => {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE1);
                    done();
                });
            });

            it('it should clear', done => {
                localForage.clear(err => {
                    expect(err).to.be.null;
                    done();
                });
            });

            it('it should drop a database', done => {
                localForage.dropInstance({}, err => {
                    expect(err).to.be.null;
                    done();
                });
            });
        });

        describe('Instance', () => {
            const db = {};

            before(done => {
                db[STORE1] = localForage.createInstance({
                    name: LF_DB,
                    storeName: STORE1
                });
                db[STORE2] = localForage.createInstance({
                    name: LF_DB,
                    storeName: STORE2
                });
                db[STORE2].length(() => {
                    done();
                });
            });

            it(`it should write to ${STORE1}`, done => {
                db[STORE1].setItem(KEY1, VALUE1, (err, value) => {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE1);
                    done();
                });
            });

            it(`it should write to ${STORE2}`, done => {
                db[STORE2].setItem(KEY2, VALUE2, (err, value) => {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE2);
                    done();
                });
            });

            it(`it should read ${KEY1} from ${STORE1}`, done => {
                db[STORE1].getItem(KEY1, (err, value) => {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE1);
                    done();
                });
            });

            it(`it should read ${KEY2} from ${STORE2}`, done => {
                db[STORE2].getItem(KEY2, (err, value) => {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE2);
                    done();
                });
            });

            it(`it should fail to read ${KEY2} from ${STORE1}`, done => {
                db[STORE1].getItem(KEY2, (err, value) => {
                    expect(err).to.be.null;
                    expect(value).to.be.null;
                    done();
                });
            });

            it(`it should fail to read ${KEY1} from ${STORE2}`, done => {
                db[STORE2].getItem(KEY1, (err, value) => {
                    expect(err).to.be.null;
                    expect(value).to.be.null;
                    done();
                });
            });

            it(`it should remove ${KEY1} from ${STORE1}`, done => {
                db[STORE1].removeItem(KEY1, err => {
                    expect(err).to.be.null;
                    done();
                });
            });

            it(`it should remove ${KEY2} from ${STORE2}`, done => {
                db[STORE2].removeItem(KEY2, err => {
                    expect(err).to.be.null;
                    done();
                });
            });

            it(`it should clear ${STORE1}`, done => {
                db[STORE1].clear(err => {
                    expect(err).to.be.null;
                    done();
                });
            });

            it(`it should clear ${STORE2}`, done => {
                db[STORE2].clear(err => {
                    expect(err).to.be.null;
                    done();
                });
            });

            it('it should drop store1', done => {
                localForage.dropInstance(
                    { name: LF_DB, storeName: STORE1 },
                    err => {
                        expect(err).to.be.null;
                        done();
                    }
                );
            });

            it('it should drop store2', done => {
                localForage.dropInstance(
                    { name: LF_DB, storeName: STORE2 },
                    err => {
                        expect(err).to.be.null;
                        done();
                    }
                );
            });

            it('it should drop local-forage-detect-blob-support', done => {
                localForage.dropInstance(
                    {
                        name: LF_DB,
                        storeName: 'local-forage-detect-blob-support'
                    },
                    err => {
                        expect(err).to.be.null;
                        done();
                    }
                );
            });

            it('it should drop a database', done => {
                localForage.dropInstance({ name: LF_DB }, err => {
                    expect(err).to.be.null;
                    done();
                });
            });
        });
    });

    describe('Database', () => {
        const PONGO_DB = 'pongo_db';
        const HEROES = 'heroes';
        const MOVIES = 'movies';

        it('It should fail to create a Database from invalid values', () => {
            function fn1() {
                // eslint-disable-next-line no-unused-vars
                const db = new Database();
            }
            function fn2() {
                // eslint-disable-next-line no-unused-vars
                const db = new Database({ name: { x: 1, y: false } }); // invalid name
            }
            function fn3() {
                // eslint-disable-next-line no-unused-vars
                const db = new Database({
                    name: PONGO_DB,
                    collections: { x: 1, y: false } // invalid collections
                });
            }
            expect(fn1).to.throw(TypeError);
            expect(fn2).to.throw(TypeError);
            expect(fn3).to.throw(TypeError);
        });

        it('It should create a Database', done => {
            const db = new Database({
                name: PONGO_DB,
                collections: [HEROES, MOVIES]
            });
            expect(db).to.be.an.instanceof(Database);
            expect(db.name).to.equal(PONGO_DB);
            expect(db.createCollection).to.throw;
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            expect(db)
                .to.have.property(MOVIES)
                .that.is.an.instanceof(Collection);
            db.version()
                .done(version => {
                    try {
                        expect(version).to.equal('0.0.0');
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('It should upgrade a Database', done => {
            const db = new Database({
                name: PONGO_DB,
                collections: [HEROES, MOVIES]
            });
            expect(db).to.be.an.instanceof(Database);
            const migration = sinon.spy();
            const VERSION = '1.0.0';
            db.addMigration(
                new Migration({
                    version: VERSION,
                    scripts: [
                        function script(options) {
                            migration(options);
                            return $.Deferred()
                                .resolve()
                                .promise();
                        }
                    ]
                })
            );
            db.upgrade()
                .done(() => {
                    try {
                        // Check that migration script has been executed
                        expect(migration).to.have.been.calledWith(db);
                        db.version()
                            .done(version => {
                                try {
                                    // Check that database version has been numped
                                    expect(version).to.equal(VERSION);
                                    done();
                                } catch (ex) {
                                    done(ex);
                                }
                            })
                            .fail(done);
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should drop a database', done => {
            const db = new Database({
                name: PONGO_DB,
                collections: [HEROES, MOVIES]
            });
            expect(db).to.be.an.instanceof(Database);
            db.dropDatabase().then(done);
        });
    });
});
