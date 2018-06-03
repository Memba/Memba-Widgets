/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import Database from '../../../src/js/common/window.pongodb.database.es6';
import Collection from '../../../src/js/common/window.pongodb.collection.es6';

const { describe, it } = window;
const { expect } = chai;

describe('window.pongodb.collection', () => {
    describe('Legacy export', () => {
        it('Check window.pongodb.*', () => {
            expect(window.pongodb.Collection).to.equal(Collection);
            expect(window.pongodb.Database).to.equal(Database);
        });
    });

    describe('Collection', () => {
        it('It should fail to create a Collection from invalid values', () => {

        });
    });
});
