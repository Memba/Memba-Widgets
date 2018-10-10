/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* eslint-disable no-unused-expressions */

// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
import $ from 'jquery';
import 'kendo.data';
import chai from 'chai';
import JSC from 'jscheck';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { assertBaseModel, tryCatch } from '../_misc/test.util.es6';
import { getPageArray, getTransport } from '../_misc/test.components.es6';
import ObjectId from '../../../src/js/common/pongodb.objectid.es6';
import CONSTANTS from '../../../src/js/common/window.constants.es6';
import { normalizeSchema } from '../../../src/js/data/data.util.es6';
import PageDataSource from '../../../src/js/data/datasources.page.es6';
import Page from '../../../src/js/data/models.page.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    Class,
    data: { DataSource, Model, ObservableArray }
} = window.kendo;
chai.use(sinonChai);

describe('datasources.page', () => {
    describe('PageDataSource', () => {
        describe('Initialization', () => {
            it('It should initialize without options', () => {
                const dataSource = new PageDataSource();
                expect(dataSource).to.be.an.instanceof(PageDataSource);
                expect(dataSource).to.be.an.instanceof(DataSource);
            });

            it('if initialized from an empty array, the count of pages should match', done => {
                const dataSource1 = new PageDataSource();
                const dataSource2 = new PageDataSource({
                    data: []
                });
                expect(dataSource1)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(dataSource2)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource1.options.schema.model()
                ).to.be.an.instanceof(Page);
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource2.options.schema.model()
                ).to.be.an.instanceof(Page);
                $.when(dataSource1.read(), dataSource2.read())
                    .then(
                        tryCatch(done)(() => {
                            expect(dataSource1.total()).to.equal(0);
                            expect(dataSource2.total()).to.equal(0);
                        })
                    )
                    .catch(done);
            });

            xit('if initialized from a stupid array, ...', done => {
                const books = [
                    { title: 'Gone with the wind' },
                    { title: 'OK Coral' },
                    { title: 'The third man' },
                    { title: 'The guns of Navarone' }
                ];
                const dataSource = new PageDataSource({
                    data: books
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            // TODO: any way to throw??????
                            expect(dataSource.total()).to.equal(books.length);
                        })
                    )
                    .catch(done);
            });

            xit('if initialized with a new model, it should throw', () => {
                const Book = Model.define({
                    idField: 'id',
                    fields: {
                        id: {
                            type: 'string'
                        },
                        title: {
                            type: 'string'
                        }
                    }
                });

                const books = [
                    { id: ObjectId(), title: 'Gone with the wind' },
                    { id: ObjectId(), title: 'OK Coral' },
                    { id: ObjectId(), title: 'The third man' },
                    { id: ObjectId(), title: 'The guns of Navarone' }
                ];
                function testFn() {
                    const dataSource = new PageDataSource({
                        data: books,
                        schema: {
                            model: Book
                        }
                    });
                    dataSource.read();
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a proper array, the count of pages should match and dirty === false', done => {
                const data = getPageArray();
                const dataSource = new PageDataSource({
                    data
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            expect(dataSource.total()).to.equal(data.length);
                            for (let i = 0; i < data.length; i++) {
                                expect(dataSource.at(i).dirty).to.be.false;
                            }
                        })
                    )
                    .catch(done);
            });

            xit('if initialized from a proper array, there should be page components', done => {
                function test(page) {
                    const dfd = $.Deferred();
                    expect(page).to.be.an.instanceof(Page);
                    expect(page.components).to.be.an.instanceof(
                        PageComponentCollectionDataSource
                    );
                    expect(page.components.parent()).to.equal(page);
                    expect(page.components.total()).to.equal(0);
                    page.load().then(() => {
                        expect(page.components.total()).to.be.gt(0);
                        dfd.resolve();
                    });
                    return dfd.promise();
                }
                const data = getPageArray();
                const dataSource = new PageDataSource({
                    data
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                dataSource.read().then(() => {
                    expect(dataSource.total()).to.equal(data.length);
                    const promises = [];
                    for (let i = 0; i < data.length; i++) {
                        promises.push(test(dataSource.at(i)));
                    }
                    $.when(...promises).always(done);
                });
            });

            it('if initialized from a kendo.data.DataSource, an exception should be raised', () => {
                const fn = function() {
                    const dataSource = PageDataSource.create(
                        new DataSource({ data: [] })
                    );
                };
                expect(fn).to.throw(Error);
            });

            it('if initialized from a PageDataSource, the number of pages should match', done => {
                const data = getPageArray();
                const dataSource1 = PageDataSource.create(data);
                const dataSource2 = PageDataSource.create(dataSource1);
                expect(dataSource1)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(dataSource2)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new dataSource1.options.schema.model()
                ).to.be.an.instanceof(Page);
                expect(
                    new dataSource2.options.schema.model()
                ).to.be.an.instanceof(Page);
                $.when(dataSource1.read(), dataSource2.read())
                    .then(
                        tryCatch(done)(() => {
                            expect(dataSource1.total()).to.equal(data.length);
                            expect(dataSource2.total()).to.equal(data.length);
                        })
                    )
                    .catch(done);
            });

            it('if initialized from a transport, the number of pages should match', done => {
                const data = getPageArray();
                const dataSource1 = PageDataSource.create(data);
                const dataSource2 = new PageDataSource({
                    transport: {
                        read(options) {
                            options.success(data);
                        }
                    }
                });
                expect(dataSource1)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(dataSource2)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new dataSource1.options.schema.model()
                ).to.be.an.instanceof(Page);
                expect(
                    new dataSource2.options.schema.model()
                ).to.be.an.instanceof(Page);
                $.when(dataSource1.read(), dataSource2.read())
                    .then(
                        tryCatch(done)(() => {
                            expect(dataSource1.total()).to.equal(data.length);
                            expect(dataSource2.total()).to.equal(data.length);
                        })
                    )
                    .catch(done);
            });

            xit('if initialized from $.ajax, the number of pages and components should match', done => {
                const dataSource = new PageDataSource({
                    transport: {
                        read: {
                            url: dataUrl('pageCollection.json'),
                            dataType: 'json'
                        }
                    }
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                $.when(
                    dataSource.read(),
                    $.getJSON(dataSource.options.transport.read.url)
                ).then((response1, response2) => {
                    expect(response2)
                        .to.be.an.instanceof(Array)
                        .that.has.property('length', 3);
                    expect(response2[0]).to.be.an.instanceof(Array);
                    const data = response2[0];
                    expect(dataSource.total()).to.equal(data.length);
                    const promises = [];
                    for (var i = 0; i < dataSource.total(); i++) {
                        var page = dataSource.at(i);
                        expect(page).to.be.an.instanceof(Page);
                        expect(page.components).to.be.an.instanceof(
                            PageComponentDataSource
                        );
                        expect(page.components.total()).to.equal(0);
                        /* jshint -W083 */
                        const promise = page.load().then(() => {
                            expect(page.components.total()).to.equal(
                                data[i].components.length
                            );
                        });
                        /* jshint +W083 */
                        promises.push(promise);
                    }
                    $.when(...promises).then(done);
                });
            });
        });

        describe('Adding and inserting', () => {
            it('It should handle duplicate ids', () => {});

            it('If dataSource initialized from in-memory array, there should be one page component more', done => {
                const data = getPageArray();
                const dataSource = new PageDataSource({
                    data
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                dataSource
                    .read()
                    .then(
                        tryCatch(done)(() => {
                            expect(dataSource.total()).to.equal(data.length);
                            dataSource.add(new Page());
                            expect(dataSource.at(data.length).isNew()).to.be
                                .true;
                            expect(dataSource.total()).to.equal(
                                data.length + 1
                            );
                        })
                    )
                    .catch(done);
            });

            it('If dataSource initialized from transport, it should only call create', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const data = getPageArray();
                const dataSource = new PageDataSource({
                    transport: {
                        read(options) {
                            options.success(data);
                        },
                        create(options) {
                            create(options);
                            options.success(options.data);
                        },
                        update(options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy(options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                dataSource
                    .read()
                    .then(() => {
                        expect(dataSource.total()).to.equal(data.length);
                        dataSource.add(new Page());
                        expect(dataSource.at(data.length).isNew()).to.be.true;
                        expect(dataSource.total()).to.equal(data.length + 1);
                        dataSource.sync().always(() => {
                            expect(create).to.have.been.called;
                            expect(update).not.to.have.been.called;
                            expect(destroy).not.to.have.been.called;
                            done();
                        });
                    })
                    .catch(done);
            });
        });

        describe('Updating', () => {
            it('If dataSource initialized from in-memory array, there should be one updated page', done => {
                const data = getPageArray();
                const dataSource = new PageDataSource({
                    data
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                dataSource.read().then(() => {
                    dataSource.at(0).set('style', 'background-color: #555555;');
                    expect(dataSource.at(0).dirty).to.be.true;
                    expect(dataSource.total()).to.equal(data.length);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call update', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const data = getPageArray();
                const dataSource = new PageDataSource({
                    transport: {
                        read(options) {
                            options.success(data);
                        },
                        create(options) {
                            create(options);
                            options.success(options.data);
                        },
                        update(options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy(options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                dataSource.read().then(() => {
                    dataSource.at(0).set('style', 'background-color: #555555;');
                    expect(dataSource.at(0).dirty).to.be.true;
                    expect(dataSource.total()).to.equal(data.length);
                    dataSource.sync().always(() => {
                        expect(create).not.to.have.been.called;
                        expect(update).to.have.been.called;
                        expect(destroy).not.to.have.been.called;
                        done();
                    });
                });
            });
        });

        describe('Removing', () => {
            it('If dataSource initialized from in-memory array, there should be one page less', done => {
                const data = getPageArray();
                const dataSource = new PageDataSource({
                    data
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                dataSource.read().then(() => {
                    expect(dataSource.total()).to.equal(data.length);
                    dataSource.remove(dataSource.at(0));
                    expect(dataSource.total()).to.equal(data.length - 1);
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call destroy', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const data = getPageArray();
                const dataSource = new PageDataSource({
                    transport: {
                        read(options) {
                            options.success(data);
                        },
                        create(options) {
                            create(options);
                            options.success(options.data);
                        },
                        update(options) {
                            update(options);
                            options.success(options.data);
                        },
                        destroy(options) {
                            destroy(options);
                            options.success(options.data);
                        }
                    }
                });
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                dataSource.read().then(() => {
                    expect(dataSource.total()).to.equal(data.length);
                    dataSource.remove(dataSource.at(0));
                    dataSource.sync().then(() => {
                        expect(create).not.to.have.been.called;
                        expect(update).not.to.have.been.called;
                        expect(destroy).to.have.been.called;
                        done();
                    });
                });
            });
        });

        // TODO Aggregating and grouping

        describe('Events', () => {});

        describe('Errors', () => {});

        describe('toJSON', () => {});
    });

    describe('PageDataSource.create', () => {
        it('It should create from an array', () => {});
    });
});

/** *******************************************************************************************************
 * PageDataSource
 ******************************************************************************************************** */

describe('Test PageDataSource', () => {
    describe('When initializing a PageDataSource', () => {});
});
