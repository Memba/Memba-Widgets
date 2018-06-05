/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import $ from 'jquery';
import chai from 'chai';
import sinon from 'sinon';
import 'sinon-chai';
import ObjectId from '../../../src/js/common/window.pongodb.objectid.es6';
import Database from '../../../src/js/common/window.pongodb.database.es6';
import Collection from '../../../src/js/common/window.pongodb.collection.es6';

const { after, before, describe, it } = window;
const { expect } = chai;
const PONGO_DB = 'pongo_db';

describe('window.pongodb.collection', () => {
    describe('Legacy export', () => {
        it('Check window.pongodb.*', () => {
            expect(window.pongodb.Collection).to.equal(Collection);
            expect(window.pongodb.Database).to.equal(Database);
        });
    });

    describe('Collection', () => {
        const HEROES = 'heroes';
        const MOVIES = 'movies';
        const HERO1 = {
            id: new ObjectId().toString(),
            firstName: 'Peter',
            lastName: 'Parker'
        };
        const HERO2 = {
            id: new ObjectId().toString(),
            firstName: 'Clark',
            lastName: 'Kent'
        };
        const HERO3 = {
            // id: new ObjectId().toString(),
            firstName: 'Bruce',
            lastName: 'Wayne'
        };
        const MOVIE1 = {
            id: new ObjectId().toString(),
            title: 'The Amazing Spider-Man',
            year: 2012
        };
        const MOVIE2 = {
            id: new ObjectId().toString(),
            title: 'Man of Steel',
            year: 2013
        };
        const MOVIE3 = {
            // id: new ObjectId().toString(),
            title: 'The Dark Knight Rises',
            year: 2012
        };
        let db;

        before(done => {
            db = new Database({
                name: PONGO_DB,
                collections: [HEROES, MOVIES]
            });
            $.when(db[HEROES].clear(), db[MOVIES].clear())
                .done(done)
                .fail(done);
        });

        it('it should INSERT heroes with ids', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            $.when(db[HEROES].insert(HERO1), db[HEROES].insert(HERO2))
                .done((doc1, doc2) => {
                    try {
                        expect(doc1)
                            .to.have.property('id')
                            .that.is.equal(HERO1.id);
                        expect(doc1)
                            .to.have.property('firstName')
                            .that.is.equal(HERO1.firstName);
                        expect(doc1)
                            .to.have.property('lastName')
                            .that.is.equal(HERO1.lastName);
                        expect(doc2)
                            .to.have.property('id')
                            .that.is.equal(HERO2.id);
                        expect(doc2)
                            .to.have.property('firstName')
                            .that.is.equal(HERO2.firstName);
                        expect(doc2)
                            .to.have.property('lastName')
                            .that.is.equal(HERO2.lastName);
                        db[HEROES]._localForage.length((err, length) => {
                            // setTimeout ensures AssertException is thrown in try/catch
                            setTimeout(() => {
                                expect(length).to.equal(2);
                                done(err);
                            }, 0);
                        });
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should INSERT heroes without id', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            db[HEROES].insert(HERO3)
                .done(doc3 => {
                    try {
                        expect(doc3).to.have.property('id');
                        // .that.is.equal(HERO3.id);
                        HERO3.id = doc3.id;
                        expect(doc3)
                            .to.have.property('firstName')
                            .that.is.equal(HERO3.firstName);
                        expect(doc3)
                            .to.have.property('lastName')
                            .that.is.equal(HERO3.lastName);
                        db[HEROES]._localForage.length((err, length) => {
                            // setTimeout ensures AssertException is thrown in try/catch
                            setTimeout(() => {
                                expect(length).to.equal(3);
                                done(err);
                            });
                        });
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should ** not ** INSERT heroes with existing ids', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            db[HEROES].insert(HERO1)
                .done(() => {
                    done(new Error('Inserting a duplicate id should fail'));
                })
                .fail(err => {
                    expect(err).to.be.an.instanceof(Error);
                    done();
                });
        });

        it('it should INSERT movies without ids', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(MOVIES)
                .that.is.an.instanceof(Collection);
            $.when(
                db[MOVIES].insert(MOVIE1),
                db[MOVIES].insert(MOVIE2),
                db[MOVIES].insert(MOVIE3)
            )
                .done((doc1, doc2, doc3) => {
                    try {
                        expect(doc1)
                            .to.have.property('id')
                            .that.is.equal(MOVIE1.id);
                        expect(doc1)
                            .to.have.property('title')
                            .that.is.equal(MOVIE1.title);
                        expect(doc1)
                            .to.have.property('year')
                            .that.is.equal(MOVIE1.year);
                        expect(doc2)
                            .to.have.property('id')
                            .that.is.equal(MOVIE2.id);
                        expect(doc2)
                            .to.have.property('title')
                            .that.is.equal(MOVIE2.title);
                        expect(doc2)
                            .to.have.property('year')
                            .that.is.equal(MOVIE2.year);
                        expect(doc3).to.have.property('id');
                        // .that.is.equal(MOVIE3.id);
                        MOVIE3.id = doc3.id;
                        expect(doc3)
                            .to.have.property('title')
                            .that.is.equal(MOVIE3.title);
                        expect(doc3)
                            .to.have.property('year')
                            .that.is.equal(MOVIE3.year);
                        db[MOVIES]._localForage.length((err, length) => {
                            // setTimeout ensures AssertException is thrown in try/catch
                            setTimeout(() => {
                                expect(length).to.equal(3);
                                done();
                            });
                        });
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should FIND heroes with existing ids', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            db[HEROES].find({ id: HERO2.id })
                .progress((/* status */) => {
                    // There is actually no progress notified when find returns a single object
                    throw new Error('Progress should not have been called');
                })
                .done(docs => {
                    try {
                        expect(docs)
                            .to.be.an.instanceof(Array)
                            .with.property('length', 1);
                        expect(docs[0])
                            .to.have.property('id')
                            .that.is.equal(HERO2.id);
                        expect(docs[0])
                            .to.have.property('firstName')
                            .that.is.equal(HERO2.firstName);
                        expect(docs[0])
                            .to.have.property('lastName')
                            .that.is.equal(HERO2.lastName);
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should ** not ** FIND heroes with unknown ids', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            db[HEROES].find({ id: new ObjectId().toString() })
                .progress((/* status */) => {
                    // There is actually no progress notified when find returns a single object
                    throw new Error('Progress should not have been called');
                })
                .done(docs => {
                    try {
                        expect(docs)
                            .to.be.an.instanceof(Array)
                            .with.property('length', 0);
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                });
        });

        it('it should FIND movies from complex queries', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(MOVIES)
                .that.is.an.instanceof(Collection);
            db[MOVIES].find({ year: { $lte: 2012 } })
                .progress(status => {
                    expect(status.index)
                        .to.be.a('number')
                        .gte(0)
                        .and.lt(status.total);
                })
                .done(docs => {
                    try {
                        expect(docs)
                            .to.be.an.instanceof(Array)
                            .with.property('length', 2);
                        // Note: we cannot predict the order which depends on random ObjectId
                        let movie1;
                        let movie3;
                        if (docs[0].id === MOVIE1.id) {
                            [movie1, movie3] = docs;
                        } else {
                            [movie3, movie1] = docs;
                        }
                        expect(movie1)
                            .to.have.property('id')
                            .that.is.equal(MOVIE1.id);
                        expect(movie1)
                            .to.have.property('title')
                            .that.is.equal(MOVIE1.title);
                        expect(movie1)
                            .to.have.property('year')
                            .that.is.equal(MOVIE1.year);
                        expect(movie3).to.have.property('id');
                        // .that.is.equal(MOVIE3.id);
                        expect(movie3)
                            .to.have.property('title')
                            .that.is.equal(MOVIE3.title);
                        expect(movie3)
                            .to.have.property('year')
                            .that.is.equal(MOVIE3.year);
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                });
        });

        it('it should COUNT heroes with existing ids', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            db[HEROES].count({ id: HERO2.id })
                .progress((/* status */) => {
                    // There is actually no progress notified when find returns a single object
                    throw new Error('Progress should not have been called');
                })
                .done(count => {
                    try {
                        expect(count).to.equal(1);
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should COUNT movies from full text searches', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(MOVIES)
                .that.is.an.instanceof(Collection);
            db.addFullTextIndex(MOVIES, ['title']);
            db[MOVIES].count({ $text: { $search: 'Man' } })
                .progress(status => {
                    expect(status.index)
                        .to.be.a('number')
                        .gte(0)
                        .and.lt(status.total);
                })
                .done(count => {
                    try {
                        expect(count).to.equal(2);
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should UPDATE heroes with existing ids', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            db[HEROES].update({ id: HERO2.id }, { mask: false, cape: true })
                .progress((/* status */) => {
                    // There is actually no progress notified when find returns a single object
                    throw new Error('Progress should not have been called');
                })
                .done(writeResult => {
                    try {
                        expect(writeResult)
                            .to.have.property('nMatched')
                            .that.is.equal(1);
                        expect(writeResult)
                            .to.have.property('nUpserted')
                            .that.is.equal(0);
                        expect(writeResult)
                            .to.have.property('nModified')
                            .that.is.equal(1);
                        db[HEROES].findOne({ id: HERO2.id })
                            .done(doc => {
                                try {
                                    expect(doc)
                                        .to.have.property('id')
                                        .that.is.equal(HERO2.id);
                                    expect(doc).to.have.property('mask');
                                    expect(doc).to.have.property('cape');
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

        it('it should ** not ** UPDATE heroes with unknown ids', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            db[HEROES].update(
                { id: new ObjectId().toString() },
                { mask: false, cape: true }
            )
                .progress((/* status */) => {
                    // There is actually no progress notified when find returns a single object
                    throw new Error('Progress should not have been called');
                })
                .done(writeResult => {
                    try {
                        expect(writeResult)
                            .to.have.property('nMatched')
                            .that.is.equal(0);
                        expect(writeResult)
                            .to.have.property('nUpserted')
                            .that.is.equal(0);
                        expect(writeResult)
                            .to.have.property('nModified')
                            .that.is.equal(0);
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should UPDATE movies from complex queries', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(MOVIES)
                .that.is.an.instanceof(Collection);
            db[MOVIES].update(
                { title: { $regex: /^Man/ } },
                { producer: 'DC Comics' }
            )
                .progress(status => {
                    expect(status.index)
                        .to.be.a('number')
                        .gte(0)
                        .and.lt(status.total);
                })
                .done(writeResult => {
                    try {
                        expect(writeResult)
                            .to.have.property('nMatched')
                            .that.is.equal(3);
                        expect(writeResult)
                            .to.have.property('nUpserted')
                            .that.is.equal(0);
                        expect(writeResult)
                            .to.have.property('nModified')
                            .that.is.equal(1);
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should REMOVE heroes with existing ids', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            db[HEROES].remove({ id: HERO3.id })
                .progress((/* status */) => {
                    // There is actually no progress notified when find returns a single object
                    throw new Error('Progress should not have been called');
                })
                .done(writeResult => {
                    try {
                        expect(writeResult)
                            .to.have.property('nRemoved')
                            .that.is.equal(1);
                        db[HEROES]._localForage.length((err, length) => {
                            // setTimeout ensures AssertException is thrown in try/catch
                            setTimeout(() => {
                                expect(length).to.equal(2);
                                done();
                            });
                        });
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should ** not ** REMOVE heroes with unknown ids', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            db[HEROES].remove({ id: new ObjectId().toString() })
                .progress((/* status */) => {
                    // There is actually no progress notified when find returns a single object
                    throw new Error('Progress should not have been called');
                })
                .done(writeResult => {
                    try {
                        expect(writeResult)
                            .to.have.property('nRemoved')
                            .that.is.equal(0);
                        db[HEROES]._localForage.length((err, length) => {
                            // setTimeout ensures AssertException is thrown in try/catch
                            setTimeout(() => {
                                expect(length).to.equal(2);
                                done();
                            });
                        });
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should REMOVE movies from complex queries', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(MOVIES)
                .that.is.an.instanceof(Collection);
            db[MOVIES].remove({ producer: { $eq: 'DC Comics' } })
                .progress(status => {
                    expect(status.index)
                        .to.be.a('number')
                        .gte(0)
                        .and.lt(status.total);
                })
                .done(writeResult => {
                    try {
                        expect(writeResult)
                            .to.have.property('nRemoved')
                            .that.is.equal(1);
                        db[MOVIES]._localForage.length((err, length) => {
                            // setTimeout ensures AssertException is thrown in try/catch
                            setTimeout(() => {
                                expect(length).to.equal(2);
                                done();
                            });
                        });
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should CLEAR heroes', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            db[HEROES].clear()
                .done(() => {
                    db[HEROES]._localForage.length((err, length) => {
                        // setTimeout ensures AssertException is thrown in try/catch
                        setTimeout(() => {
                            expect(length).to.equal(0);
                            done();
                        });
                    });
                })
                .fail(done);
        });

        it('it should CLEAR movies', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(MOVIES)
                .that.is.an.instanceof(Collection);
            db[MOVIES].clear()
                .done(() => {
                    db[MOVIES]._localForage.length((err, length) => {
                        // setTimeout ensures AssertException is thrown in try/catch
                        setTimeout(() => {
                            expect(length).to.equal(0);
                            done();
                        });
                    });
                })
                .fail(done);
        });

        it('it should DROP heroes', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(HEROES)
                .that.is.an.instanceof(Collection);
            db[HEROES].drop()
                .done(() => {
                    try {
                        expect(db[HEROES]).to.be.undefined;
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it should DROP movies', done => {
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(MOVIES)
                .that.is.an.instanceof(Collection);
            db[MOVIES].drop()
                .done(() => {
                    try {
                        expect(db[MOVIES]).to.be.undefined;
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

    describe('Triggers', () => {
        const CONTACTS = 'contacts';
        const ME = {
            id: new ObjectId().toString(),
            firstName: 'Joe',
            lastName: 'Bloggs',
            city: 'London',
            country: 'United Kingdom'
        };
        let db;

        before(done => {
            db = new Database({
                name: PONGO_DB,
                collections: [CONTACTS]
            });
            db[CONTACTS].clear()
                .done(done)
                .fail(done);
        });

        it('it shoud execute INSERT triggers', done => {
            const insert = sinon.spy();
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(CONTACTS)
                .that.is.an.instanceof(Collection);
            expect(db[CONTACTS]._triggers[Collection.triggers.insert])
                .to.be.an('array')
                .with.property('length')
                .that.is.equal(0);
            db.createTrigger(CONTACTS, Collection.triggers.insert, insert);
            expect(db[CONTACTS]._triggers[Collection.triggers.insert])
                .to.be.an('array')
                .with.property('length')
                .that.is.equal(1);
            db[CONTACTS].insert(ME)
                .done(doc => {
                    try {
                        expect(doc)
                            .to.have.property('id')
                            .that.is.equal(ME.id);
                        expect(insert).to.have.been.calledWith(doc);
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it shoud execute UPDATE triggers', done => {
            const update = sinon.spy();
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(CONTACTS)
                .that.is.an.instanceof(Collection);
            expect(db[CONTACTS]._triggers[Collection.triggers.update])
                .to.be.an('array')
                .with.property('length')
                .that.is.equal(0);
            db.createTrigger(CONTACTS, Collection.triggers.update, update);
            expect(db[CONTACTS]._triggers[Collection.triggers.update])
                .to.be.an('array')
                .with.property('length')
                .that.is.equal(1);
            db[CONTACTS].update(ME, { updated: new Date() })
                .done(result => {
                    try {
                        expect(result)
                            .to.have.property('nMatched')
                            .that.is.equal(1);
                        expect(result)
                            .to.have.property('nModified')
                            .that.is.equal(1);
                        expect(result)
                            .to.have.property('nUpserted')
                            .that.is.equal(0);
                        expect(update).to.have.been.calledWithMatch(ME);
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                })
                .fail(done);
        });

        it('it shoud execute REMOVE triggers', done => {
            const remove = sinon.spy();
            expect(db).to.be.an.instanceof(Database);
            expect(db)
                .to.have.property(CONTACTS)
                .that.is.an.instanceof(Collection);
            expect(db[CONTACTS]._triggers[Collection.triggers.remove])
                .to.be.an('array')
                .with.property('length')
                .that.is.equal(0);
            db.createTrigger(CONTACTS, Collection.triggers.remove, remove);
            expect(db[CONTACTS]._triggers[Collection.triggers.remove])
                .to.be.an('array')
                .with.property('length')
                .that.is.equal(1);
            db[CONTACTS].remove(ME)
                .done(result => {
                    try {
                        expect(result)
                            .to.have.property('nRemoved')
                            .that.is.equal(1);
                        expect(remove).to.have.been.calledWithMatch(ME);
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
