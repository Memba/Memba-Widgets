/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import {
    error2xhr,
    extendQueryWithPartition,
    xhr2error
} from '../../../src/js/data/data.util.es6';

const { describe, it, xit } = window;
const { expect } = chai;

describe('data.util', () => {
    describe('error2xhr', () => {
        it('It should convert an error into an $.ajax failure', () => {
            const arr = error2xhr(new Error('Oops!'));
            expect(arr)
                .to.be.an('array').with.property('length', 3);
            expect(arr[0]).to.have.property('readyState', 4);
            expect(arr[0]).to.have.property('responseJSON');
            expect(arr[0]).to.have.property('responseText');
            expect(arr[0]).to.have.property('status', 520);
            expect(arr[0]).to.have.property('statusText', 'error');
            expect(arr[1]).to.equal('error');
            expect(arr[2]).to.equal('Ajax error');
        });
    });

    describe('xhr2error', () => {
        it('It should convert an $.ajax failure into an error', () => {
            const err = xhr2error({}, 'error', 'Not found');
            expect(err).to.be.an.instanceof(Error);
            expect(err).to.have.property('message', 'Not found');
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
            expect(true).to.be.false;
        });
    });
});
