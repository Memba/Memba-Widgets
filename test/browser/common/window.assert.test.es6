/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved, max-classes-per-file
import $ from 'jquery';
import chai from 'chai';
// import JSC from 'jscheck';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import assert from '../../../src/js/common/window.assert.es6';

const { describe, it } = window;
const { expect } = chai;
const ERR_MSG = 'Oops!';
class Person {
    constructor(first, last) {
        this.firstName = first;
        this.lastName = last;
    }

    fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
class Company {
    constructor(name) {
        this.name = name;
    }

    advert() {
        return `${this.name} is a great company`;
    }
}

describe('window.assert', () => {
    describe('Legacy export', () => {
        it('Check window.assert', () => {
            expect(window.assert).to.be.a('function');
            expect(assert).to.be.a('function');
            expect(window.assert)
                .to.have.property('ok')
                .that.is.a('function');
            expect(assert)
                .to.have.property('ok')
                .that.is.a('function');
            if (!window.__karma__) {
                expect(window.assert).to.equal(assert);
            }
        });
    });

    describe('Assertions', () => {
        it('default (is `ok`)', () => {
            function fn() {
                assert(false, ERR_MSG);
            }
            expect(fn).to.throw(Error, ERR_MSG);
            expect(assert(true, ERR_MSG)).to.be.undefined;
        });

        it('enum', () => {
            expect(assert.messages.enum.default).to.be.a(CONSTANTS.STRING);
            function fn() {
                assert.enum(['a', 'b', 'c'], 'd', ERR_MSG);
            }
            expect(fn).to.throw(RangeError, ERR_MSG);
            expect(assert.enum(['a', 'b', 'c'], 'a', ERR_MSG)).to.be.undefined;
            expect(assert.enum(['a', 'b', 'c'], 'b', ERR_MSG)).to.be.undefined;
            expect(assert.enum(['a', 'b', 'c'], 'c', ERR_MSG)).to.be.undefined;
        });

        it('equal', () => {
            expect(assert.messages.equal.default).to.be.a(CONSTANTS.STRING);
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

        it('extends', () => {
            class Male extends Person {
                constructor(firstName, lastName) {
                    super(firstName, lastName);
                    this._male = true;
                }
            }
            expect(assert.messages.extends.default).to.be.a(CONSTANTS.STRING);
            function fn1() {
                assert.extends(Person, true, ERR_MSG);
            }
            function fn2() {
                assert.extends(Person, 10, ERR_MSG);
            }
            function fn3() {
                assert.extends(Person, 'a', ERR_MSG);
            }
            function fn4() {
                assert.extends(Person, {}, ERR_MSG);
            }
            function fn5() {
                assert.extends(Person, [], ERR_MSG);
            }
            expect(fn1).to.throw(TypeError, ERR_MSG);
            expect(fn2).to.throw(TypeError, ERR_MSG);
            expect(fn3).to.throw(TypeError, ERR_MSG);
            expect(fn4).to.throw(TypeError, ERR_MSG);
            expect(fn5).to.throw(TypeError, ERR_MSG);
            expect(assert.extends(Person, Male, ERR_MSG)).to.be.undefined;
        });

        it('extendsOrUndef', () => {
            class Male extends Person {
                constructor(firstName, lastName) {
                    super(firstName, lastName);
                    this._male = true;
                }
            }
            expect(assert.messages.extendsOrUndef.default).to.be.a(
                CONSTANTS.STRING
            );
            function fn1() {
                assert.extendsOrUndef(Person, true, ERR_MSG);
            }
            function fn2() {
                assert.extendsOrUndef(Person, 10, ERR_MSG);
            }
            function fn3() {
                assert.extendsOrUndef(Person, 'a', ERR_MSG);
            }
            function fn4() {
                assert.extendsOrUndef(Person, {}, ERR_MSG);
            }
            function fn5() {
                assert.extendsOrUndef(Person, [], ERR_MSG);
            }
            expect(fn1).to.throw(TypeError, ERR_MSG);
            expect(fn2).to.throw(TypeError, ERR_MSG);
            expect(fn3).to.throw(TypeError, ERR_MSG);
            expect(fn4).to.throw(TypeError, ERR_MSG);
            expect(fn5).to.throw(TypeError, ERR_MSG);
            expect(assert.extendsOrUndef(Person, undefined, ERR_MSG)).to.be
                .undefined;
            expect(assert.extendsOrUndef(Person, Male, ERR_MSG)).to.be
                .undefined;
        });

        it('format', () => {
            expect(assert.format('{0}', 1)).to.equal('1');
            expect(
                assert.format(
                    '{0},{1},{2},{3},{4},{5},{6},{7},{8},{9}',
                    'a',
                    'b',
                    'c',
                    'd',
                    'e',
                    'f',
                    'g',
                    'h',
                    'i',
                    'j'
                )
            ).to.equal('a,b,c,d,e,f,g,h,i,j');
        });

        it('hasLength', () => {
            expect(assert.messages.hasLength.default).to.be.a(CONSTANTS.STRING);
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
            expect(assert.hasLength(['a', 'b'], ERR_MSG)).to.be.undefined;
        });

        it('instanceof', () => {
            expect(assert.messages.instanceof.default).to.be.a(
                CONSTANTS.STRING
            );
            const p = new Person('John', 'Doe');
            const c = new Company('ACME');
            const el = $('<div>');
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

        it('isArray', () => {
            expect(assert.messages.isArray.default).to.be.a(CONSTANTS.STRING);
            const a = ['a', 'b', 'c'];
            const c = new Company('ACME');
            const el = $('<div>');
            const n = 3;
            function fn1() {
                assert.isArray(c, ERR_MSG);
            }
            function fn2() {
                assert.isArray(el, ERR_MSG);
            }
            function fn3() {
                assert.isArray(n, ERR_MSG);
            }
            expect(fn1).to.throw(TypeError, ERR_MSG);
            expect(fn2).to.throw(TypeError, ERR_MSG);
            expect(fn3).to.throw(TypeError, ERR_MSG);
            expect(assert.isArray(a, ERR_MSG)).to.be.undefined;
        });

        it('isDefined', () => {
            expect(assert.messages.isDefined.default).to.be.a(CONSTANTS.STRING);
            const a = true;
            function fn1() {
                assert.isDefined(undefined, ERR_MSG);
            }
            expect(fn1).to.throw(TypeError, ERR_MSG);
            expect(assert.isDefined(a, ERR_MSG)).to.be.undefined;
        });

        xit('isEmptyObject', () => {});

        xit('isFunction', () => {});

        it('isNonEmptyPlainObject', () => {
            expect(assert.messages.isNonEmptyPlainObject.default).to.be.a(
                CONSTANTS.STRING
            );
            const p = new Person('John', 'Doe');
            function fn1() {
                assert.isNonEmptyPlainObject(null, ERR_MSG);
            }
            function fn2() {
                assert.isNonEmptyPlainObject(true, ERR_MSG);
            }
            function fn3() {
                assert.isNonEmptyPlainObject('a', ERR_MSG);
            }
            function fn4() {
                // IMPORTANT: Empty object!!!!!!
                assert.isNonEmptyPlainObject({}, ERR_MSG);
            }
            function fn5() {
                // IMPORTANT: Prototyped Object!!!!!!
                assert.isNonEmptyPlainObject(p, ERR_MSG);
            }
            function fn6() {
                assert.isNonEmptyPlainObject(undefined, ERR_MSG);
            }
            expect(fn1).to.throw(TypeError, ERR_MSG);
            expect(fn2).to.throw(TypeError, ERR_MSG);
            expect(fn3).to.throw(TypeError, ERR_MSG);
            expect(fn4).to.throw(TypeError, ERR_MSG);
            expect(fn5).to.throw(TypeError, ERR_MSG);
            expect(fn6).to.throw(TypeError, ERR_MSG);
            expect(assert.isNonEmptyPlainObject({ prop: true }, ERR_MSG)).to.be
                .undefined;
        });

        it('isNonEmptyPlainObjectOrUndef', () => {
            expect(
                assert.messages.isNonEmptyPlainObjectOrUndef.default
            ).to.be.a(CONSTANTS.STRING);
            const p = new Person('John', 'Doe');
            function fn1() {
                assert.isNonEmptyPlainObjectOrUndef(null, ERR_MSG);
            }
            function fn2() {
                assert.isNonEmptyPlainObjectOrUndef(true, ERR_MSG);
            }
            function fn3() {
                assert.isNonEmptyPlainObjectOrUndef('a', ERR_MSG);
            }
            function fn4() {
                // IMPORTANT: Empty object!!!!!!
                assert.isNonEmptyPlainObjectOrUndef({}, ERR_MSG);
            }
            function fn5() {
                // IMPORTANT: Prototyped Object!!!!!!
                assert.isNonEmptyPlainObjectOrUndef(p, ERR_MSG);
            }
            expect(fn1).to.throw(TypeError, ERR_MSG);
            expect(fn2).to.throw(TypeError, ERR_MSG);
            expect(fn3).to.throw(TypeError, ERR_MSG);
            expect(fn4).to.throw(TypeError, ERR_MSG);
            expect(fn5).to.throw(TypeError, ERR_MSG);
            expect(assert.isNonEmptyPlainObjectOrUndef(undefined, ERR_MSG)).to
                .be.undefined;
            expect(assert.isNonEmptyPlainObjectOrUndef({ prop: true }, ERR_MSG))
                .to.be.undefined;
        });

        it('isPlainObject', () => {
            expect(assert.messages.isPlainObject.default).to.be.a(
                CONSTANTS.STRING
            );
            const p = new Person('John', 'Doe');
            function fn1() {
                assert.isPlainObject(true, ERR_MSG);
            }
            function fn2() {
                assert.isPlainObject(10, ERR_MSG);
            }
            function fn3() {
                assert.isPlainObject('a', ERR_MSG);
            }
            function fn4() {
                assert.isPlainObject([], ERR_MSG);
            }
            function fn5() {
                assert.isPlainObject(p, ERR_MSG);
            }
            expect(fn1).to.throw(TypeError, ERR_MSG);
            expect(fn2).to.throw(TypeError, ERR_MSG);
            expect(fn3).to.throw(TypeError, ERR_MSG);
            expect(fn4).to.throw(TypeError, ERR_MSG);
            expect(fn5).to.throw(TypeError, ERR_MSG);
            expect(assert.isPlainObject({}, ERR_MSG)).to.be.undefined;
            expect(assert.isPlainObject({ prop: true }, ERR_MSG)).to.be
                .undefined;
        });

        it('isPlainObjectOrUndef', () => {
            expect(assert.messages.isPlainObjectOrUndef.default).to.be.a(
                CONSTANTS.STRING
            );
            const p = new Person('John', 'Doe');
            function fn1() {
                assert.isPlainObjectOrUndef(true, ERR_MSG);
            }
            function fn2() {
                assert.isPlainObjectOrUndef(10, ERR_MSG);
            }
            function fn3() {
                assert.isPlainObjectOrUndef('a', ERR_MSG);
            }
            function fn4() {
                assert.isPlainObjectOrUndef([], ERR_MSG);
            }
            function fn5() {
                assert.isPlainObjectOrUndef(p, ERR_MSG);
            }
            expect(fn1).to.throw(TypeError, ERR_MSG);
            expect(fn2).to.throw(TypeError, ERR_MSG);
            expect(fn3).to.throw(TypeError, ERR_MSG);
            expect(fn4).to.throw(TypeError, ERR_MSG);
            expect(fn5).to.throw(TypeError, ERR_MSG);
            expect(assert.isPlainObjectOrUndef(undefined, ERR_MSG)).to.be
                .undefined;
            expect(assert.isPlainObjectOrUndef({}, ERR_MSG)).to.be.undefined;
            expect(assert.isPlainObjectOrUndef({ prop: true }, ERR_MSG)).to.be
                .undefined;
        });

        it('isUndefined', () => {
            expect(assert.messages.isUndefined.default).to.be.a(
                CONSTANTS.STRING
            );
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

        it('match', () => {
            expect(assert.messages.match.default).to.be.a(CONSTANTS.STRING);
            function fn() {
                assert.match(/abc/, 'cba', ERR_MSG);
            }
            expect(fn).to.throw(Error, ERR_MSG);
            expect(assert.match(/abc/, '9abcd', ERR_MSG)).to.be.undefined;
        });

        xit('nullableInstanceOrUndef', () => {});

        xit('nullableTypeOrUndef', () => {});

        it('ok', () => {
            expect(assert.messages.ok.default).to.be.a(CONSTANTS.STRING);
            function fn() {
                assert(false, ERR_MSG);
            }
            expect(fn).to.throw(Error, ERR_MSG);
            expect(assert(true, ERR_MSG)).to.be.undefined;
        });

        it('type', () => {
            expect(assert.messages.type.default).to.be.a(CONSTANTS.STRING);
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
                assert.type(CONSTANTS.ARRAY, undefined, ERR_MSG);
            }
            expect(fn1).to.throw(Error, ERR_MSG);
            expect(fn2).to.throw(Error, ERR_MSG);
            expect(fn3).to.throw(Error, ERR_MSG);
            expect(fn4).to.throw(Error, ERR_MSG);
            expect(fn5).to.throw(Error, ERR_MSG);
            expect(fn6).to.throw(Error, ERR_MSG);
            expect(fn7).to.throw(Error, ERR_MSG);
            expect(assert.type('undefined', undefined, ERR_MSG)).to.be
                .undefined;
            expect(assert.type('null', null, ERR_MSG)).to.be.undefined;
            expect(assert.type('boolean', true, ERR_MSG)).to.be.undefined;
            expect(assert.type('number', 10, ERR_MSG)).to.be.undefined;
            expect(assert.type('string', 'a', ERR_MSG)).to.be.undefined;
            expect(assert.type('object', {}, ERR_MSG)).to.be.undefined;
            expect(assert.type(CONSTANTS.ARRAY, [], ERR_MSG)).to.be.undefined;
        });

        it('typeOrUndef', () => {
            expect(assert.messages.typeOrUndef.default).to.be.a(
                CONSTANTS.STRING
            );
            function fn1() {
                assert.typeOrUndef('undefined', null, ERR_MSG);
            }
            function fn2() {
                assert.typeOrUndef('null', true, ERR_MSG);
            }
            function fn3() {
                assert.typeOrUndef('boolean', 10, ERR_MSG);
            }
            function fn4() {
                assert.typeOrUndef('number', 'a', ERR_MSG);
            }
            function fn5() {
                assert.typeOrUndef('string', {}, ERR_MSG);
            }
            function fn6() {
                assert.typeOrUndef('object', [], ERR_MSG);
            }
            function fn7() {
                assert.typeOrUndef(CONSTANTS.ARRAY, new Company('World'), ERR_MSG);
            }
            expect(fn1).to.throw(Error, ERR_MSG);
            expect(fn2).to.throw(Error, ERR_MSG);
            expect(fn3).to.throw(Error, ERR_MSG);
            expect(fn4).to.throw(Error, ERR_MSG);
            expect(fn5).to.throw(Error, ERR_MSG);
            expect(fn6).to.throw(Error, ERR_MSG);
            expect(fn7).to.throw(Error, ERR_MSG);
            expect(assert.typeOrUndef('undefined', undefined, ERR_MSG)).to.be
                .undefined;
            expect(assert.typeOrUndef('null', null, ERR_MSG)).to.be.undefined;
            expect(assert.typeOrUndef('boolean', true, ERR_MSG)).to.be
                .undefined;
            expect(assert.typeOrUndef('boolean', undefined, ERR_MSG)).to.be
                .undefined;
            expect(assert.typeOrUndef('number', 10, ERR_MSG)).to.be.undefined;
            expect(assert.typeOrUndef('number', undefined, ERR_MSG)).to.be
                .undefined;
            expect(assert.typeOrUndef('string', 'a', ERR_MSG)).to.be.undefined;
            expect(assert.typeOrUndef('string', undefined, ERR_MSG)).to.be
                .undefined;
            expect(assert.typeOrUndef('object', {}, ERR_MSG)).to.be.undefined;
            expect(assert.typeOrUndef('object', undefined, ERR_MSG)).to.be
                .undefined;
            expect(assert.typeOrUndef(CONSTANTS.ARRAY, [], ERR_MSG)).to.be.undefined;
            expect(assert.typeOrUndef(CONSTANTS.ARRAY, undefined, ERR_MSG)).to.be
                .undefined;
        });

        // assert.crud is a composition of the above.
        // assert.rapi is a composition of the above.
    });
});
