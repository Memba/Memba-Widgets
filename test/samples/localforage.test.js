/**
 * Copyright (c) 2013-2017 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jslint browser: true, expr: true */
/* jshint browser: true, expr: true */
/* global describe, it, before */

;(function (window, undefined) {

    'use strict';

    var expect = window.chai.expect,
        localforage = window.localforage,
        DB1 = 'db1',
        DB2 = DB1,
        // DB2 = 'db2',
        STORE1 = 'store1',
        STORE2 = 'store2',
        KEY1 = 'key1',
        KEY2 = 'key2',
        VALUE1 = 'A simple test',
        VALUE2 = 'A simple test';

    describe('localforage', function() {

        describe('Static', function() {
            it('it should write', function(done) {
                localforage.setItem(KEY1, VALUE1, function(err, value) {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE1);
                    done();
                });
            });
            it('it should read', function(done) {
                localforage.setItem(KEY2, VALUE2, function(err, value) {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE2);
                    done();
                });
            });
            it('it should clear', function(done) {
                localforage.clear(function(err) {
                    expect(err).to.be.null;
                    done();
                });
            });
        });

        describe('Instance', function() {
            var db = {};
            before(function(done) {
                db[STORE1] = localforage.createInstance({
                    name: DB1,
                    storeName: STORE1
                });
                db[STORE2] = localforage.createInstance({
                    name: DB2,
                    storeName: STORE2
                });
                db[STORE2].length(function(err, length) {
                    done();
                });
            });
            it('it should write to ' + STORE1, function(done) {
                db[STORE1].setItem(KEY1, VALUE1, function(err, value) {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE1);
                    done();
                });
            });
            it('it should write to ' + STORE2, function(done) {
                db[STORE2].setItem(KEY2, VALUE2, function(err, value) {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE2);
                    done();
                });
            });
            it('it should read ' + KEY1 + ' from ' + STORE1, function(done) {
                db[STORE1].getItem(KEY1, function(err, value) {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE1);
                    done();
                });
            });
            it('it should read ' + KEY2 + ' from ' + STORE2, function(done) {
                db[STORE2].getItem(KEY2, function(err, value) {
                    expect(err).to.be.null;
                    expect(value).to.equal(VALUE2);
                    done();
                });
            });
            it('it should fail to read ' + KEY2 + ' from ' + STORE1, function(done) {
                db[STORE1].getItem(KEY2, function(err, value) {
                    expect(err).to.be.null;
                    expect(value).to.be.null;
                    done();
                });
            });
            it('it should fail to read ' + KEY1 + ' from ' + STORE2, function(done) {
                db[STORE2].getItem(KEY1, function(err, value) {
                    expect(err).to.be.null;
                    expect(value).to.be.null;
                    done();
                });
            });
            it('it should remove ' + KEY1 + ' from ' + STORE1, function(done) {
                db[STORE1].removeItem(KEY1, function(err) {
                    expect(err).to.be.null;
                    done();
                });
            });
            it('it should remove ' + KEY2 + ' from ' + STORE2, function(done) {
                db[STORE2].removeItem(KEY2, function(err) {
                    expect(err).to.be.null;
                    done();
                });
            });
        });

    });

}(this));
