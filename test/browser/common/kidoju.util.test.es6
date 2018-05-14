/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// import $ from 'jquery';
import chai from 'chai';
// import sinon from 'sinon';
import 'sinon-chai';
import 'jquery.mockjax';
import CONSTANTS from '../../../src/js/window.constants.es6';
import {
    ObjectId,
    randomHexString,
    randomId
} from '../../../src/js/common/kidoju.util.es6';

const { describe, it, kidoju } = window;
const { expect } = chai;

describe('kidoju.util', () => {
    describe('Legacy export', () => {
        it('Check kidoju.util.*', () => {
            expect(kidoju.util.ObjectId).to.equal(ObjectId);
            expect(kidoju.util.randomString).to.equal(randomHexString);
            expect(kidoju.util.randomId).to.equal(randomId);
        });
    });

    describe('randomHexString', () => {
        it('Should return an hex string of any arbitrary length', () => {
            const length = Math.ceil(32 * Math.random());
            const hex = randomHexString(length);
            expect(hex).to.match(new RegExp(`^[a-f0-9]{${length}}$`));
        });
    });

    describe('randomId', () => {
        it('Should return an id with 6 random characters', () => {
            const id = randomId();
            expect(id).to.match(/^id_[a-f0-9]{6}$/);
        });
    });

    describe('ObjectId', () => {
        // TODO Check window.pongodb
        it('Should fail to build an ObjectId from unaccpetable values', () => {
            function test1() {
                return new ObjectId(true);
            }

            function test2() {
                return new ObjectId(100);
            }

            function test3() {
                return new ObjectId('Hello World');
            }

            function test4() {
                return new ObjectId(new Date());
            }

            expect(test1).to.throw;
            expect(test2).to.throw;
            expect(test3).to.throw;
            expect(test4).to.throw;
        });
        it('Should have a toString method returning a MongoDB ObjectId', () => {
            const hex = randomHexString(24);
            const objId1 = new ObjectId(hex);
            const objId2 = new ObjectId();
            expect(objId1.toString()).to.equal(hex);
            expect(objId2.toString()).to.match(CONSTANTS.RX_MONGODB_ID);
        });
        it('Should have an equals method', () => {
            const hex = randomHexString(24);
            const objId1 = new ObjectId(hex);
            const objId2 = new ObjectId(hex);
            const objId3 = new ObjectId();
            expect(objId1.equals(objId2)).to.be.true;
            expect(objId2.equals(objId1)).to.be.true;
            expect(objId1.equals(objId3)).to.be.false;
            expect(objId3.equals(objId1)).to.be.false;
            expect(objId2.equals(objId3)).to.be.false;
            expect(objId3.equals(objId2)).to.be.false;
        });
        it('Should have a getTimestamp method', () => {
            const objId = new ObjectId();
            const ts = objId.getTimestamp();
            expect(Date.now() - ts).to.be.lte(1000); // 1000ms
        });
        it('Should have an isMobileId method', () => {
            const hex = randomHexString(24);
            const objId1 = new ObjectId(hex);
            const objId2 = new ObjectId();
            expect(objId1.isMobileId()).to.be.false;
            expect(objId2.isMobileId()).to.be.true;
        });
    });
});
