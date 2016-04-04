/**
 * Copyright (c) 2013-2016 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect;
    // var sinon = window.sinon;
    // var kendo = window.kendo;
    // var FIXTURES = '#fixtures';
    var assert = window.assert;
    var STRING = 'string';
    var ERR_MSG = 'Oops!';

    var Person = function (first, last) {
        this.firstName = first;
        this.lastName = last;
    };
    Person.prototype.fullName = function () {
        return this.firstName + ' ' + this.lastName;
    };

    var Company = function (name) {
        this.name = name;
    };
    Company.prototype.advert = function () {
        return this.name + ' is a great company';
    };

    describe('window.assert.test', function () {

        /*
        before(function () {
            if (window.__karma__ && $(FIXTURES).length === 0) {
                $('body').append('<div id="fixtures"></div>');
            }
        });
        */

        describe('Assertions', function () {

            it('default (is `ok`)', function () {
                function fn() {
                    assert(false, ERR_MSG);
                }
                expect(fn).to.throw(Error, ERR_MSG);
                expect(assert(true, ERR_MSG)).to.be.undefined;
            });

            it('enum', function () {
                expect(assert.messages.enum.default).to.be.a(STRING);
                function fn() {
                    assert.enum(['a', 'b', 'c'], 'd', ERR_MSG);
                }
                expect(fn).to.throw(RangeError, ERR_MSG);
                expect(assert.enum(['a', 'b', 'c'], 'a', ERR_MSG)).to.be.undefined;
                expect(assert.enum(['a', 'b', 'c'], 'b', ERR_MSG)).to.be.undefined;
                expect(assert.enum(['a', 'b', 'c'], 'c', ERR_MSG)).to.be.undefined;
            });

            it('equal', function () {
                expect(assert.messages.equal.default).to.be.a(STRING);
                function fn1() {
                    assert.equal(true, false, ERR_MSG);
                }
                function fn2() {
                    assert.equal(1, 0, ERR_MSG);
                }
                function fn3() {
                    assert.equal('a', 'b', ERR_MSG);
                }
                expect(fn1).to.throw(RangeError, ERR_MSG);
                expect(fn2).to.throw(RangeError, ERR_MSG);
                expect(fn3).to.throw(RangeError, ERR_MSG);
                expect(assert.equal(true, true, ERR_MSG)).to.be.undefined;
                expect(assert.equal(false, false, ERR_MSG)).to.be.undefined;
                expect(assert.equal(10, 10, ERR_MSG)).to.be.undefined;
                expect(assert.equal('a', 'a', ERR_MSG)).to.be.undefined;
            });

            it('hasLength', function () {
                expect(assert.messages.hasLength.default).to.be.a(STRING);
                function fn1() {
                    assert.hasLength(undefined, ERR_MSG);
                }
                function fn2() {
                    assert.hasLength(1, ERR_MSG);
                }
                function fn3() {
                    assert.hasLength({}, ERR_MSG);
                }
                function fn4() {
                    assert.hasLength([], ERR_MSG);
                }
                expect(fn1).to.throw(TypeError, ERR_MSG);
                expect(fn2).to.throw(TypeError, ERR_MSG);
                expect(fn3).to.throw(TypeError, ERR_MSG);
                expect(fn4).to.throw(TypeError, ERR_MSG);
                expect(assert.hasLength($(window), ERR_MSG)).to.be.undefined;
                expect(assert.hasLength($(document), ERR_MSG)).to.be.undefined;
                expect(assert.hasLength(['a','b'], ERR_MSG)).to.be.undefined;
            });

            it('instanceof', function () {
                expect(assert.messages.instanceof.default).to.be.a(STRING);
                var p = new Person('John', 'Doe');
                var c = new Company('ACME');
                var el = $('<div>');
                function fn1() {
                    assert.instanceof($, p, ERR_MSG);
                }
                function fn2() {
                    assert.instanceof(Person, c, ERR_MSG);
                }
                function fn3() {
                    assert.instanceof(Company, el, ERR_MSG);
                }
                expect(fn1).to.throw(TypeError, ERR_MSG);
                expect(fn2).to.throw(TypeError, ERR_MSG);
                expect(fn3).to.throw(TypeError, ERR_MSG);
                expect(assert.instanceof($, el, ERR_MSG)).to.be.undefined;
                expect(assert.instanceof(Person, p, ERR_MSG)).to.be.undefined;
                expect(assert.instanceof(Company, c, ERR_MSG)).to.be.undefined;
            });

            it('isOptionalObject', function () {
                expect(assert.messages.isOptionalObject.default).to.be.a(STRING);
                var p = new Person('John', 'Doe');
                function fn1() {
                    assert.isOptionalObject(null, ERR_MSG);
                }
                function fn2() {
                    assert.isOptionalObject(true, ERR_MSG);
                }
                function fn3() {
                    assert.isOptionalObject('a', ERR_MSG);
                }
                function fn4() {
                    // IMPORTANT: Empty object!!!!!!
                    assert.isOptionalObject({}, ERR_MSG);
                }
                function fn5() {
                    // IMPORTANT: Prototyped Object!!!!!!
                    assert.isOptionalObject(p, ERR_MSG);
                }
                expect(fn1).to.throw(TypeError, ERR_MSG);
                expect(fn2).to.throw(TypeError, ERR_MSG);
                expect(fn3).to.throw(TypeError, ERR_MSG);
                expect(fn4).to.throw(TypeError, ERR_MSG);
                expect(fn5).to.throw(TypeError, ERR_MSG);
                expect(assert.isOptionalObject(undefined, ERR_MSG)).to.be.undefined;
                expect(assert.isOptionalObject({ prop: true }, ERR_MSG)).to.be.undefined;
            });

            it('isPlainObject', function () {
                expect(assert.messages.isPlainObject.default).to.be.a(STRING);
                var p = new Person('John', 'Doe');
                function fn1() {
                    assert.isPlainObject(null, ERR_MSG);
                }
                function fn2() {
                    assert.isPlainObject(true, ERR_MSG);
                }
                function fn3() {
                    assert.isPlainObject('a', ERR_MSG);
                }
                function fn4() {
                    // IMPORTANT: Empty object!!!!!!
                    assert.isPlainObject({}, ERR_MSG);
                }
                function fn5() {
                    // IMPORTANT: Prototyped Object!!!!!!
                    assert.isPlainObject(p, ERR_MSG);
                }
                function fn6() {
                    assert.isPlainObject(undefined, ERR_MSG);
                }
                expect(fn1).to.throw(TypeError, ERR_MSG);
                expect(fn2).to.throw(TypeError, ERR_MSG);
                expect(fn3).to.throw(TypeError, ERR_MSG);
                expect(fn4).to.throw(TypeError, ERR_MSG);
                expect(fn5).to.throw(TypeError, ERR_MSG);
                expect(fn6).to.throw(TypeError, ERR_MSG);
                expect(assert.isPlainObject({ prop: true }, ERR_MSG)).to.be.undefined;
            });

            it('isUndefined', function () {
                expect(assert.messages.isUndefined.default).to.be.a(STRING);
                function fn1() {
                    assert.isUndefined(true, ERR_MSG);
                }
                function fn2() {
                    assert.isUndefined(10, ERR_MSG);
                }
                function fn3() {
                    assert.isUndefined('a', ERR_MSG);
                }
                function fn4() {
                    assert.isUndefined({}, ERR_MSG);
                }
                function fn5() {
                    assert.isUndefined([], ERR_MSG);
                }
                expect(fn1).to.throw(TypeError, ERR_MSG);
                expect(fn2).to.throw(TypeError, ERR_MSG);
                expect(fn3).to.throw(TypeError, ERR_MSG);
                expect(fn4).to.throw(TypeError, ERR_MSG);
                expect(fn5).to.throw(TypeError, ERR_MSG);
                expect(assert.isUndefined(undefined, ERR_MSG)).to.be.undefined;
            });

            it('match', function () {
                expect(assert.messages.match.default).to.be.a(STRING);
                function fn() {
                    assert.match(/abc/, 'cba', ERR_MSG);
                }
                expect(fn).to.throw(Error, ERR_MSG);
                expect(assert.match(/abc/, '9abcd', ERR_MSG)).to.be.undefined;
            });

            it('ok', function () {
                expect(assert.messages.ok.default).to.be.a(STRING);
                function fn() {
                    assert(false, ERR_MSG);
                }
                expect(fn).to.throw(Error, ERR_MSG);
                expect(assert(true, ERR_MSG)).to.be.undefined;
            });

            it('type', function () {
                expect(assert.messages.type.default).to.be.a(STRING);
                function fn1() {
                    assert.type('undefined', null, ERR_MSG);
                }
                function fn2() {
                    assert.type('null', true, ERR_MSG);
                }
                function fn3() {
                    assert.type('boolean', 10, ERR_MSG);
                }
                function fn4() {
                    assert.type('number', 'a', ERR_MSG);
                }
                function fn5() {
                    assert.type('string', {}, ERR_MSG);
                }
                function fn6() {
                    assert.type('object', [], ERR_MSG);
                }
                function fn7() {
                    assert.type('array', undefined, ERR_MSG);
                }
                expect(fn1).to.throw(Error, ERR_MSG);
                expect(fn2).to.throw(Error, ERR_MSG);
                expect(fn3).to.throw(Error, ERR_MSG);
                expect(fn4).to.throw(Error, ERR_MSG);
                expect(fn5).to.throw(Error, ERR_MSG);
                expect(fn6).to.throw(Error, ERR_MSG);
                expect(fn7).to.throw(Error, ERR_MSG);
                expect(assert.type('undefined', undefined, ERR_MSG)).to.be.undefined;
                expect(assert.type('null', null, ERR_MSG)).to.be.undefined;
                expect(assert.type('boolean', true, ERR_MSG)).to.be.undefined;
                expect(assert.type('number', 10, ERR_MSG)).to.be.undefined;
                expect(assert.type('string', 'a', ERR_MSG)).to.be.undefined;
                expect(assert.type('object', {}, ERR_MSG)).to.be.undefined;
                expect(assert.type('array', [], ERR_MSG)).to.be.undefined;
            });

        });

    });

}(this, jQuery));
