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
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import BaseAdapter from '../../../src/js/tools/adapters.base.es6';

const { describe, it, kendo, xit } = window;
const { expect } = chai;

describe('adapters.question', () => {
    describe('QuestionAdapter', () => {
        it('It should ...', () => {

        });
    });

    it('Validate QuestionAdapter', function () {
        var adapter = new adapters.NumberAdapter();
        var field = adapter.getField();
        var row = adapter.getRow('test');
        expect(field).to.have.property('type', adapter.type);
    });
});
