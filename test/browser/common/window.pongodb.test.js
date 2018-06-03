/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, expr: true, mocha: true */

;(function ($, undefined) {

    'use strict';

    var expect = window.chai.expect;
    var localforage = window.localforage;
    var pongodb = window.pongodb;
    var ObjectId = pongodb.ObjectId;
    var Database = pongodb.Database;
    var Collection = pongodb.Collection;
    var RX_MONGODB_ID = /^[0-9a-f]{24}$/;



    var PONGO_DB = 'pongo_db';
    var HEROES = 'heroes';
    var MOVIES = 'movies';
    var HERO1 = {
        firstName: 'Peter',
        lastName: 'Parker'
    };
    var HERO2 = {
        firstName: 'Clark',
        lastName: 'Kent'
    };
    var HERO3 = {
        firstName: 'Bruce',
        lastName: 'Wayne'
    };
    var MOVIE1 = {
        title: 'The Amazing Spider-Man',
        year: 2012
    };
    var MOVIE2 = {
        title: 'Man of Steel',
        year: 2013
    };
    var MOVIE3 = {
        title: 'The Dark Knight Rises',
        year: 2012
    };

    describe('pongodb', function () {

        describe('Database', function () {

            before(function (done) {
                // Hopefully this works since it has not been tested
                // Note: we would rather drop the entire database
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                $.when(
                    db[HEROES].clear(),
                    db[MOVIES].clear()
                )
                    .always(done);
            });

            it('Database constructor with valid params', function () {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                expect(db).to.have.property(MOVIES).that.is.an.instanceof(Collection);
            });

            it('it should INSERT into collection 1 with id', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                HERO1 = $.extend(HERO1, { id: (new ObjectId()).toString() });
                HERO2 = $.extend(HERO2, { id: (new ObjectId()).toString() });
                $.when(
                    db[HEROES].insert(HERO1),
                    db[HEROES].insert(HERO2)
                )
                    .done(function (doc1, doc2, doc3) {
                        expect(doc1).to.have.property('id').that.is.equal(HERO1.id);
                        expect(doc1).to.have.property('firstName').that.is.equal(HERO1.firstName);
                        expect(doc1).to.have.property('lastName').that.is.equal(HERO1.lastName);
                        expect(doc2).to.have.property('id').that.is.equal(HERO2.id);
                        expect(doc2).to.have.property('firstName').that.is.equal(HERO2.firstName);
                        expect(doc2).to.have.property('lastName').that.is.equal(HERO2.lastName);
                        db[HEROES]._localForage.length(function (err, length) {
                            if (err) {
                                done(err);
                            } else {
                                expect(length).to.equal(2);
                                done();
                            }
                        });
                    })
                    .fail(done);
            });

            it('it should INSERT into collection 1 without id', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                db[HEROES].insert(HERO3)
                    .done(function (doc3) {
                        expect(doc3).to.have.property('id').that.is.equal(HERO3.id);
                        expect(doc3).to.have.property('firstName').that.is.equal(HERO3.firstName);
                        expect(doc3).to.have.property('lastName').that.is.equal(HERO3.lastName);
                        HERO3 = doc3;
                        db[HEROES]._localForage.length(function (err, length) {
                            if (err) {
                                done(err);
                            } else {
                                expect(length).to.equal(3);
                                done();
                            }
                        });
                    })
                    .fail(done);
            });

            it('it should ** not ** INSERT into collection 1 an existing id', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                db[HEROES].insert(HERO3)
                    .done(function () {
                        done(new Error('Inserting a duplicate id should fail'));
                    })
                    .fail(function (xhr, status, error) {
                        done();
                    });
            });

            it('it should INSERT into collection 2', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(MOVIES).that.is.an.instanceof(Collection);
                MOVIE1 = $.extend(MOVIE1, { id: (new ObjectId()).toString() });
                MOVIE2 = $.extend(MOVIE2, { id: (new ObjectId()).toString() });
                MOVIE3 = $.extend(MOVIE3, { id: (new ObjectId()).toString() });
                $.when(
                    db[MOVIES].insert(MOVIE1),
                    db[MOVIES].insert(MOVIE2),
                    db[MOVIES].insert(MOVIE3)
                )
                    .done(function (doc1, doc2, doc3) {
                        expect(doc1).to.have.property('id').that.is.equal(MOVIE1.id);
                        expect(doc1).to.have.property('title').that.is.equal(MOVIE1.title);
                        expect(doc1).to.have.property('year').that.is.equal(MOVIE1.year);
                        expect(doc2).to.have.property('id').that.is.equal(MOVIE2.id);
                        expect(doc2).to.have.property('title').that.is.equal(MOVIE2.title);
                        expect(doc2).to.have.property('year').that.is.equal(MOVIE2.year);
                        expect(doc3).to.have.property('id').that.is.equal(MOVIE3.id);
                        expect(doc3).to.have.property('title').that.is.equal(MOVIE3.title);
                        expect(doc3).to.have.property('year').that.is.equal(MOVIE3.year);
                        db[MOVIES]._localForage.length(function (err, length) {
                            if (err) {
                                done(err);
                            } else {
                                expect(length).to.equal(3);
                                done();
                            }
                        });
                    })
                    .fail(done);
            });

            it('it should FIND documents based on id in collection 1', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                db[HEROES].find({ id: HERO2.id })
                    .progress(function (status) {
                        // There is actually no progress notified with an ObjectId
                        // expect(status.index).to.be.a('number').gte(0).and.lt(status.total);
                        throw new Error('Progress should not have been called');
                    })
                    .done(function (docs) {
                        expect(docs).to.be.an.instanceof(Array).with.property('length', 1);
                        expect(docs[0]).to.have.property('id').that.is.equal(HERO2.id);
                        expect(docs[0]).to.have.property('firstName').that.is.equal(HERO2.firstName);
                        expect(docs[0]).to.have.property('lastName').that.is.equal(HERO2.lastName);
                        done();
                    })
                    .fail(done);
            });

            it('it should ** not ** FIND documents based on unknown id in collection 1', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                db[HEROES].find({ id: (new ObjectId()).toString() })
                    .progress(function (status) {
                        // There is actually no progress notified with an ObjectId
                        // expect(status.index).to.be.a('number').gte(0).and.lt(status.total);
                        throw new Error('Progress should not have been called');
                    })
                    .done(function (docs) {
                        expect(docs).to.be.an.instanceof(Array).with.property('length', 0);
                        done();
                    })
                    .fail(done);
            });

            it('it should FIND documents based on complex queries in collection 2', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(MOVIES).that.is.an.instanceof(Collection);
                db[MOVIES].find({ year: { $lte: 2012 } })
                    .progress(function (status) {
                        expect(status.index).to.be.a('number').gte(0).and.lt(status.total);
                    })
                    .done(function (docs) {
                        expect(docs).to.be.an.instanceof(Array).with.property('length', 2);
                        // Note: we cannot predict the order which depends on random ObjectId
                        var doc1;
                        var doc3;
                        if (docs[0].id === MOVIE1.id) {
                            doc1 = docs[0];
                            doc3 = docs[1];
                        } else {
                            doc1 = docs[1];
                            doc3 = docs[0];
                        }
                        expect(doc1).to.have.property('id').that.is.equal(MOVIE1.id);
                        expect(doc1).to.have.property('title').that.is.equal(MOVIE1.title);
                        expect(doc1).to.have.property('year').that.is.equal(MOVIE1.year);
                        expect(doc3).to.have.property('id').that.is.equal(MOVIE3.id);
                        expect(doc3).to.have.property('title').that.is.equal(MOVIE3.title);
                        expect(doc3).to.have.property('year').that.is.equal(MOVIE3.year);
                        done();
                    })
                    .fail(done);
            });

            it('it should COUNT documents based on id in collection 1', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                db[HEROES].count({ id: HERO2.id })
                    .progress(function (status) {
                        // There is actually no progress notified with an ObjectId
                        // expect(status.index).to.be.a('number').gte(0).and.lt(status.total);
                        throw new Error('Progress should not have been called');
                    })
                    .done(function (count) {
                        expect(count).to.equal(1);
                        done();
                    })
                    .fail(done);
            });

            it('it should COUNT documents based on complex queries in collection 2', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(MOVIES).that.is.an.instanceof(Collection);
                db[MOVIES].count({ year: { $lte: 2012 } })
                    .progress(function (status) {
                        expect(status.index).to.be.a('number').gte(0).and.lt(status.total);
                    })
                    .done(function (count) {
                        expect(count).to.equal(2);
                        done();
                    })
                    .fail(done);
            });

            it('it should UPDATE documents based on id in collection 1', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                db[HEROES].update({ id: HERO2.id }, { mask: false, cape: true })
                    .progress(function (status) {
                        // There is actually no progress notified with an ObjectId
                        // expect(status.index).to.be.a('number').gte(0).and.lt(status.total);
                        throw new Error('Progress should not have been called');
                    })
                    .done(function (writeResult) {
                        expect(writeResult).to.have.property('nMatched').that.is.equal(1);
                        expect(writeResult).to.have.property('nUpserted').that.is.equal(0);
                        expect(writeResult).to.have.property('nModified').that.is.equal(1);
                        done();
                    })
                    .fail(done);
            });

            it('it should ** not ** UPDATE documents based on unknown id in collection 1', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                db[HEROES].update({ id: (new ObjectId()).toString() }, { mask: false, cape: true })
                    .progress(function (status) {
                        // There is actually no progress notified with an ObjectId
                        // expect(status.index).to.be.a('number').gte(0).and.lt(status.total);
                        throw new Error('Progress should not have been called');
                    })
                    .done(function (writeResult) {
                        expect(writeResult).to.have.property('nMatched').that.is.equal(0);
                        expect(writeResult).to.have.property('nUpserted').that.is.equal(0);
                        expect(writeResult).to.have.property('nModified').that.is.equal(0);
                        done();
                    })
                    .fail(done);
            });

            it('it should UPDATE documents based on complex queries in collection 2', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(MOVIES).that.is.an.instanceof(Collection);
                db[MOVIES].update({ title: { $regex: /^Man/ } }, { producer: 'DC Comics' })
                    .progress(function (status) {
                        expect(status.index).to.be.a('number').gte(0).and.lt(status.total);
                    })
                    .done(function (writeResult) {
                        expect(writeResult).to.have.property('nMatched').that.is.equal(3);
                        expect(writeResult).to.have.property('nUpserted').that.is.equal(0);
                        expect(writeResult).to.have.property('nModified').that.is.equal(1);
                        done();
                    })
                    .fail(done);
            });

            it('it should REMOVE documents based on id from collection 1', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                db[HEROES].remove({ id: HERO3.id })
                    .progress(function (status) {
                        // There is actually no progress notified with an ObjectId
                        // expect(status.index).to.be.a('number').gte(0).and.lt(status.total);
                        throw new Error('Progress should not have been called');
                    })
                    .done(function (writeResult) {
                        expect(writeResult).to.have.property('nRemoved').that.is.equal(1);
                        db[HEROES]._localForage.length(function (err, length) {
                            if (err) {
                                done(err);
                            } else {
                                expect(length).to.equal(2);
                                done();
                            }
                        });
                    })
                    .fail(done);
            });

            it('it should ** not ** REMOVE documents based on unknown id from collection 1', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                db[HEROES].remove({ id: (new ObjectId()).toString() })
                    .progress(function (status) {
                        // There is actually no progress notified with an ObjectId
                        // expect(status.index).to.be.a('number').gte(0).and.lt(status.total);
                        throw new Error('Progress should not have been called');
                    })
                    .done(function (writeResult) {
                        expect(writeResult).to.have.property('nRemoved').that.is.equal(0);
                        db[HEROES]._localForage.length(function (err, length) {
                            if (err) {
                                done(err);
                            } else {
                                expect(length).to.equal(2);
                                done();
                            }
                        });
                    })
                    .fail(done);
            });

            it('it should REMOVE documents based on complex query from collection 2', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(MOVIES).that.is.an.instanceof(Collection);
                db[MOVIES].remove({ producer: 'DC Comics' })
                    .progress(function (status) {
                        expect(status.index).to.be.a('number').gte(0).and.lt(status.total);
                    })
                    .done(function (writeResult) {
                        expect(writeResult).to.have.property('nRemoved').that.is.equal(1);
                        db[MOVIES]._localForage.length(function (err, length) {
                            if (err) {
                                done(err);
                            } else {
                                expect(length).to.equal(2);
                                done();
                            }
                        });
                    })
                    .fail(done);
            });

            it('it should CLEAR collection 1', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(HEROES).that.is.an.instanceof(Collection);
                db[HEROES].clear()
                    .done(function () {
                        db[HEROES]._localForage.length(function (err, length) {
                            if (err) {
                                done(err);
                            } else {
                                expect(length).to.equal(0);
                                done();
                            }
                        });
                    })
                    .fail(done);
            });

            it('it should CLEAR collection 2', function (done) {
                var db = new Database({ name: PONGO_DB, collections: [HEROES, MOVIES] });
                expect(db).to.be.an.instanceof(Database);
                expect(db).to.have.property(MOVIES).that.is.an.instanceof(Collection);
                db[MOVIES].clear()
                    .done(function () {
                        db[MOVIES]._localForage.length(function (err, length) {
                            if (err) {
                                done(err);
                            } else {
                                expect(length).to.equal(0);
                                done();
                            }
                        });
                    })
                    .fail(done);
            });

        });

        describe('Triggers', function () {
            // TODO
        });

        describe('Upgraded and Migrations', function () {
            // TODO
        });

        describe('Drop Collections and Databases', function () {
            // TODO
        });

    });


}(window.jQuery));
