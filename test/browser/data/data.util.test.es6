/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.core';
import chai from 'chai';
import JSC from 'jscheck';
import {
    error2xhr,
    extendQueryWithPartition,
    getTextBinding,
    getValueBinding,
    normalizeSchema,
    xhr2error
} from '../../../src/js/data/data.util.es6';

const { describe, it, xit } = window;
const { ns } = window.kendo;
const { expect } = chai;

describe('data.util', () => {
    describe('dataSourceErrorHandler', () => {
        xit('TODO', () => {});
    });

    describe('error2xhr', () => {
        it('It should convert an error into an $.ajax failure', () => {
            const arr = error2xhr(new Error('Oops!'));
            expect(arr)
                .to.be.an('array')
                .with.property('length', 3);
            expect(arr[0]).to.have.property('readyState', 4);
            expect(arr[0]).to.have.property('responseJSON');
            expect(arr[0]).to.have.property('responseText');
            expect(arr[0]).to.have.property('status', 520);
            expect(arr[0]).to.have.property('statusText', 'error');
            expect(arr[1]).to.equal('error');
            expect(arr[2]).to.equal('Ajax error');
        });
    });

    describe('extendQueryWithPartition', () => {
        it('It should extend an empty query with a partition', () => {
            const q = {};
            const p = {
                language: 'en'
            };
            const query = extendQueryWithPartition(q, p);
            expect(query).to.deep.equal({
                filter: {
                    logic: 'and',
                    filters: [
                        {
                            field: 'language',
                            operator: 'eq',
                            value: 'en'
                        }
                    ]
                }
            });
        });

        it('It should extend a simple query with a partition', () => {
            const q = {
                a: 1,
                b: true,
                filter: {
                    field: 'title',
                    operator: 'startswith',
                    value: 'memba'
                }
            };
            const p = {
                language: 'en'
            };
            const query = extendQueryWithPartition(q, p);
            expect(query).to.deep.equal({
                a: 1,
                b: true,
                filter: {
                    logic: 'and',
                    filters: [
                        {
                            field: 'title',
                            operator: 'startswith',
                            value: 'memba'
                        },
                        {
                            field: 'language',
                            operator: 'eq',
                            value: 'en'
                        }
                    ]
                }
            });
        });

        xit('It should extend a complex query with a partition', () => {
            /*
            const q = {
                page: 1,
                pagseSize: 5,
                filter: {
                    field: 'name',
                    operator: 'eq',
                    value: 'memba'
                },
                sort: {}
            };
             */
            expect(true).to.be.false;
        });
    });

    describe('getTextBinding', () => {
        it('it should return a text binding', () => {
            const field = JSC.string()();
            const binding = {};
            binding[`data-${ns}bind`] = `text: ${field}`;
            expect(getTextBinding(field)).to.deep.equal(binding);
        });
    });

    describe('getValueBinding', () => {
        it('it should return a value binding', () => {
            const field = JSC.string()();
            const binding = {};
            binding[`data-${ns}bind`] = `value: ${field}`;
            expect(getValueBinding(field)).to.deep.equal(binding);
        });

        it('it should return a value binding with optional source binding', () => {
            const field = JSC.string()();
            const source = JSC.string()();
            const binding = {};
            binding[`data-${ns}bind`] = `value: ${field}, source: ${source}`;
            expect(getValueBinding(field, source)).to.deep.equal(binding);
        });
    });

    describe('normalizeSchema', () => {
        it('It should add data, total and error for rapi', () => {
            const schema = {
                // https://docs.telerik.com/kendo-ui/api/javascript/data/datasource/configuration/schema
                type: 'xml'
            };
            const normalized = normalizeSchema(schema);
            expect(normalized).to.have.property('type', schema.type);
            // expect(normalized === schema).to.be.true;
            expect(normalized)
                .to.have.property('data')
                .that.is.a('function');
            expect(normalized).to.have.property('errors', 'error');
            expect(normalized).to.have.property('total', 'total');
            const obj = JSC.object()();
            const res = { data: [obj], total: 1 };
            expect(normalized.data(obj) === obj).to.be.true;
            expect(normalized.data(res) === res.data).to.be.true;
        });
    });

    describe('xhr2error', () => {
        it('It should convert an $.ajax failure into an error', () => {
            const err = xhr2error({}, 'error', 'Not found');
            expect(err).to.be.an.instanceof(Error);
            expect(err).to.have.property('message', 'Not found');
        });
    });
});
