/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { randomHexString } from '../../../src/js/common/window.util.es6';
import ObjectId from '../../../src/js/common/window.pongodb.objectid.es6';

const { describe, it } = window;
const { expect } = chai;

describe('window.pongodb.objectid', () => {
    describe('Legacy export', () => {
        it('Check window.pongodb.*', () => {
            expect(window.pongodb.ObjectId).to.equal(ObjectId);
            expect(window.kidoju.util.ObjectId).to.equal(ObjectId);
        });
    });

    describe('ObjectId', () => {
        it('It should fail to create an ObjectId from invalid values', () => {
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

        it('It should have a toString method returning a MongoDB ObjectId', () => {
            const hex = randomHexString(24);
            const objId1 = new ObjectId(hex);
            const objId2 = new ObjectId();
            expect(objId1.toString()).to.equal(hex);
            expect(objId2.toString()).to.match(CONSTANTS.RX_MONGODB_ID);
        });

        it('It should have an equals method', () => {
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

        it('It should have a getTimestamp method', () => {
            const objId = new ObjectId();
            const ts = objId.getTimestamp();
            expect(Date.now() - ts).to.be.lte(1000); // 1000ms
        });

        it('It should have an isMobileId method', () => {
            const objId1 = new ObjectId(randomHexString(24));
            const objId2 = new ObjectId();
            expect(objId1.isMobileId()).to.be.false;
            expect(objId2.isMobileId()).to.be.true;
        });

        it('It should have a toMobileId method', () => {
            const objId1 = new ObjectId(randomHexString(24));
            const objId2 = new ObjectId();
            expect(objId1.toMobileId().isMobileId()).to.be.true;
            expect(objId2.toMobileId().equals(objId2)).to.be.true;
        });
    });
});
