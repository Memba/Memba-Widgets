/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import $ from 'jquery';
import 'kendo.data';
import 'kendo.grid';
import chai from 'chai';
import sinon from 'sinon';
import 'sinon-chai';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import ObjectId from '../../../src/js/common/pongodb.objectid.es6';
import ArrayTransport from '../../../src/js/data/transports.array.es6';

const { describe, it } = window;
const { expect } = chai;

function noop() {}

describe('transports.array', () => {
    describe('Legacy export', () => {
        it('Check app.models.ArrayTransport', () => {
            expect(window.app.models.ArrayTransport).to.equal(ArrayTransport);
        });
    });

    describe('ArrayTransport', () => {
        const OPTIONS = {
            collection: 'contacts'
            // idField
            // partition
            // projection
            // parameterMap
        };
        const CONTACT1 = {
            firstName: 'Joe',
            lastName: 'Bloggs'
        };
        const CONTACT2 = {
            firstName: 'Jim',
            lastName: 'Smith'
        };

        it('it should not instantiate ArrayTransport from invalid values', () => {
            function fn1() {
                const transport = new ArrayTransport();
                noop(transport); // To please eslint
            }
            expect(fn1).to.throw;
        });

        it('it should instantiate ArrayTransport from valid values', () => {
            const transport = new ArrayTransport(OPTIONS);
            expect(transport.collection()).to.equal(OPTIONS.collection);
            expect(transport.idField()).to.equal('id');
            // expect(transport.partition).to.deep.equal(OPTIONS.partition);
            // expect(transport.projection).to.deep.equal(OPTIONS.projection);
            expect(transport.parameterMap(10)).to.equal(10);
        });

        it('it should CREATE', () => {
            function test(data) {
                const transport = new ArrayTransport(OPTIONS);
                const success = sinon.spy();
                const error = sinon.spy();
                transport.create({
                    data,
                    success,
                    error
                });
                expect(error).not.to.have.been.called;
                expect(success).to.have.been.calledWithMatch(data);
            }
            test(CONTACT1);
            test(CONTACT2);
        });

        it('it should ** not ** GET an unknown item', () => {
            const transport = new ArrayTransport(OPTIONS);
            const success = sinon.spy();
            const error = sinon.spy();
            transport.get({
                data: { id: new ObjectId().toString() },
                success,
                error
            });
            expect(error).not.to.have.been.calledWithMatch({
                // xhr: {},
                status: 'Error',
                errorThrown: CONSTANTS.NOT_FOUND_ERR
            });
            expect(success).not.to.have.been.called;
        });

        it('it should GET an existing item', () => {
            function test(data) {
                const transport = new ArrayTransport(OPTIONS);
                const success = sinon.spy();
                const error = sinon.spy();
                transport.get({
                    data: { id: data.id },
                    success,
                    error
                });
                expect(error).not.to.have.been.called;
                expect(success).to.have.been.calledWith(data);
            }
            test(CONTACT1);
            test(CONTACT2);
        });

        it('it should READ', () => {
            const transport = new ArrayTransport(OPTIONS);
            const success = sinon.spy();
            const error = sinon.spy();
            transport.read({
                data: {
                    sort: { lastName: 'desc' } // TODO: sort does not seem to work
                },
                success,
                error
            });
            expect(error).not.to.have.been.called;
            expect(success).to.have.been.calledWithMatch({
                total: 2,
                data: [CONTACT1, CONTACT2]
            });
        });

        it('it should UPDATE an existing item', () => {
            function test(data) {
                const transport = new ArrayTransport(OPTIONS);
                const success = sinon.spy();
                const error = sinon.spy();
                Object.assign(data, { gender: 'male' });
                transport.update({
                    data,
                    success,
                    error
                });
                expect(error).not.to.have.been.called;
                expect(success).to.have.been.calledWith();
            }
            test(CONTACT1);
            test(CONTACT2);
        });

        it('it should DESTROY an existing item', () => {
            function test(data) {
                const transport = new ArrayTransport(OPTIONS);
                const success = sinon.spy();
                const error = sinon.spy();
                transport.destroy({
                    data: { id: data.id },
                    success,
                    error
                });
                expect(error).not.to.have.been.called;
                expect(success).to.have.been.calledWith();
            }
            test(CONTACT1);
            test(CONTACT2);
        });
    });
});

const {
    data: { DataSource },
    guid
} = window.kendo;

function customBoolEditor(container /* , options */) {
    const id = guid();
    $(
        `<input class="k-checkbox" id="${id}" type="checkbox" name="Discontinued" data-type="boolean" data-bind="checked:Discontinued">`
    ).appendTo(container);
    $(`<label class="k-checkbox-label" for="${id}">&#8203;</label>`).appendTo(
        container
    );
}

const transport = new ArrayTransport({
    collection: 'contacts',
    idField: 'ProductID'
});
const dataSource = new DataSource({
    transport,
    // batch: true,
    // pageSize: 20,
    schema: {
        model: {
            id: 'ProductID',
            fields: {
                ProductID: { editable: false, nullable: true },
                ProductName: { validation: { required: true } },
                UnitPrice: {
                    type: 'number',
                    validation: { required: true, min: 1 }
                },
                Discontinued: { type: 'boolean' },
                UnitsInStock: {
                    type: 'number',
                    validation: { min: 0, required: true }
                }
            }
        }
    }
});

$('<div/>')
    .appendTo('#fixtures')
    .kendoGrid({
        dataSource,
        pageable: true,
        height: 550,
        toolbar: ['create'],
        columns: [
            'ProductName',
            {
                field: 'UnitPrice',
                title: 'Unit Price',
                format: '{0:c}',
                width: '120px'
            },
            { field: 'UnitsInStock', title: 'Units In Stock', width: '120px' },
            { field: 'Discontinued', width: '120px', editor: customBoolEditor },
            { command: ['edit', 'destroy'], title: '&nbsp;', width: '250px' }
        ],
        editable: 'inline'
    });
