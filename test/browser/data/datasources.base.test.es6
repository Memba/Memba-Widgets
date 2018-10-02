/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import BaseModel from '../../../src/js/data/models.base.es6';
import ObjectId from '../../../src/js/common/pongodb.objectid.es6';

const { describe, it, kendo, xit } = window;
const { Model, DataSource } = kendo.data;
const { expect } = chai;
chai.use(sinonChai);

describe('datasources.base', () => {
    describe('BaseDataSource', () => {
        xdescribe('Default values', () => {
            const definition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false
                    },
                    title: {
                        type: 'string',
                        defaultValue: 'hey'
                    },
                    dob: {
                        type: 'date'
                    },
                    age: {
                        type: 'number',
                        defaultValue() {
                            return 10;
                        }
                    }
                }
            };
            const DataModel = Model.define(definition);
            const data = [{ id: '1' }];

            it('kendo.data.DataSource does not assign default values', done => {
                const dataSource = new DataSource({
                    data,
                    schema: {
                        model: DataModel,
                        modelBase: DataModel
                    }
                });
                dataSource
                    .read()
                    .then(() => {
                        const item = dataSource.at(0);
                        debugger;
                        done();
                    })
                    .catch(done);
            });

            it('BaseDataSource should assign default values', () => {

            });
        });

        xdescribe('Parsing dates', () => {
            const definition = {
                id: 'id',
                fields: {
                    id: {
                        type: 'string',
                        nullable: true,
                        editable: false
                    },
                    date: {
                        type: 'date',
                        nullable: true,
                        editable: false
                    }
                }
            };
            const DataModel = Model.define(definition);
            const past = new Date(1966, 14, 2);
            const data = {
                id: new ObjectId().toString(),
                date: past.toISOString()
            };

            it('kendo.data.DataSource does not parse dates', done => {
                const dataSource = new DataSource({
                    data,
                    schema: {
                        model: DataModel,
                        modelBase: DataModel
                    }
                });
                dataSource
                    .read()
                    .then(() => {
                        const item = dataSource.at(0);
                        debugger;
                        done();
                    })
                    .catch(done);
            });

            it('BaseDataSource should parse dates', () => {
                const DataModel = BaseModel.define(definition);
                const model = new DataModel(data1);
                const change = sinon.spy();

                expect(model)
                .to.have.property('id')
                .that.is.equal(data1.id);
                // The fix in BaseModel is discussed and explained at http://www.telerik.com/forums/parsing-on-initialization-of-kendo-data-model
                expect(model)
                .to.have.property('date')
                .that.is.an.instanceof(Date);
                expect(model.date.getTime()).to.equal(past.getTime());

                model.bind('change', change);
                model.accept({
                    id: data2.id,
                    date: now.toISOString()
                });

                expect(model)
                .to.have.property('id')
                .that.is.equal(data2.id);
                expect(model).to.have.property('dirty').that.is.false;
                expect(change).not.to.have.been.called;

                // We have fixed our date parsing issue
                expect(model)
                .to.have.property('date')
                .that.is.an.instanceof(Date);
                expect(model.date.getTime()).to.equal(now.getTime());
            });
        });



        // TODO Check filtering, aggregating and grouping
    });
});
