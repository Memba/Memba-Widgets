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
import BaseAdapter from '../../../src/js/tools/adapters.readonly.es6';

const { describe, it, kendo, xit } = window;
const { expect } = chai;

describe('adapters.readonly', () => {
    describe('adapters.readonly', () => {
        it('getField', function() {
            var adapter = new adapters.StringAdapter();
            var field = adapter.getField();
            var row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });

        it('getRow', function() {
            var adapter = new adapters.StringAdapter();
            var field = adapter.getField();
            var row = adapter.getRow('test');
            expect(field).to.have.property('type', adapter.type);
        });
    });
});
