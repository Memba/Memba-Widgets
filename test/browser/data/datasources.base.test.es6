/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.binder';
import 'kendo.data';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import 'jquery.mockjax';
import BaseModel from '../../../src/js/data/models.base.es6';
import ObjectId from '../../../src/js/common/pongodb.objectid.es6';

const { describe, it, kendo, xit } = window;
const { Model, DataSource } = kendo.data;
const { expect } = chai;
chai.use(sinonChai);

describe('models.datasources', () => {
    describe('Legacy export', () => {
        it('Check kidoju.data.Model', () => {
            expect(window.kidoju.data.Model).to.equal(BaseModel);
        });
    });
});
