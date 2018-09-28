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
import Page from '../../../src/js/data/models.page.es6';
// import BaseModel from '../../../src/js/data/models.base.es6';
// import ObjectId from '../../../src/js/common/pongodb.objectid.es6';

const { describe, it, kendo, xit } = window;
const { DataSource } = kendo.data;
const { expect } = chai;
chai.use(sinonChai);

describe('models.pagecomponent', () => {
    describe('Legacy export', () => {
        it('Check kidoju.data.Page', () => {
            expect(window.kidoju.data.Page).to.equal(Page);
        });
    });
});
