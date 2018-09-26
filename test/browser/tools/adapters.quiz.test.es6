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

describe('adapters.quiz', () => {
    describe('QuizAdapter', () => {
        it('It should ...', () => {

        });
    });

    it('Validate QuizDataAdapter', function () {
        var adapter = new adapters.QuizDataAdapter(); // => StringArray?
        var field = adapter.getField();
        var row = adapter.getRow('test');
        expect(field.type).to.be.undefined;
    });

    it('Validate QuizSolutionAdapter', function () {
        var adapter = new adapters.QuizSolutionAdapter();
        var field = adapter.getField();
        var row = adapter.getRow('test');
        expect(field).to.have.property('type', adapter.type);
    });
});
