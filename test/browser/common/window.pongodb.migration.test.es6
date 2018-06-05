/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import $ from 'jquery';
import chai from 'chai';
import sinon from 'sinon';
import 'sinon-chai';
import Migration from '../../../src/js/common/window.pongodb.migration.es6';
import Database from '../../../src/js/common/window.pongodb.database.es6';

const { after, before, describe, it } = window;
const { expect } = chai;
const PONGO_DB = 'pongo_db';

describe('window.pongodb.migration', () => {
    describe('Legacy export', () => {
        it('Check window.pongodb.*', () => {
            expect(window.pongodb.Migration).to.equal(Migration);
        });
    });

    describe('Migration', () => {
        const BOOKS = 'books';
        const VERSION = '1.0.0';
        let db;

        before(() => {
            db = new Database({
                name: PONGO_DB,
                collections: [BOOKS]
            });
        });

        it('It should create a migration from valid params', done => {
            const spies = [
                sinon.spy(),
                sinon.spy(),
                sinon.spy(),
                sinon.spy(),
                sinon.spy()
            ];
            const migration = new Migration({
                version: VERSION,
                scripts: spies.map(
                    spy =>
                        function map(...rest) {
                            spy(...rest);
                            return $
                                .Deferred()
                                .resolve()
                                .promise();
                        }
                )
            });
            expect(migration)
                .to.have.property('version')
                .that.is.equal(VERSION);
            migration
                .execute(db)
                .done(() => {
                    try {
                        for (let i = 0, { length } = spies; i < length; i++) {
                            expect(spies[i]).to.have.been.calledWith(db);
                        }
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        after(done => {
            db.dropDatabase().then(done);
        });
    });
});
