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
import PageDataSource from '../../../src/js/data/datasources.page.es6';
import Page from '../../../src/js/data/models.page.es6';
import ObjectId from '../../../src/js/common/pongodb.objectid';

const { describe, it } = window;
const { expect } = chai;
const {
    Class,
    data: { DataSource, ObservableArray }
} = window.kendo;
chai.use(sinonChai);

const someTransport = Class.extend({
    create(options) {
        options.success(
            Object.assign(options.data, { id: new ObjectId().toString() })
        );
    },
    destroy(options) {
        options.success(options.data);
    },
    read(options) {
        options.success({ data: DATA, total: DATA.length });
    },
    update(options) {
        options.success(options.data);
    }
});

describe('datasources.page', () => {
    describe('PageDataSource', () => {
        describe('Initialization', () => {
            it('It should initialize without options', () => {
                const dataSource = new PageDataSource();
                expect(dataSource).to.be.an.instanceof(PageDataSource);
                expect(dataSource).to.be.an.instanceof(DataSource);
            });

            it('if initialized from an empty array, the count of pages should match', done => {
                const pageCollectionDataSource1 = new PageCollectionDataSource();
                const pageCollectionDataSource2 = new PageCollectionDataSource({
                    data: []
                });
                expect(pageCollectionDataSource1)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(pageCollectionDataSource2)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource1.options.schema.model()
                ).to.be.an.instanceof(Page);
                expect(
                    new pageCollectionDataSource2.options.schema.model()
                ).to.be.an.instanceof(Page);
                $.when(
                    pageCollectionDataSource1.read(),
                    pageCollectionDataSource2.read()
                ).then(() => {
                    expect(pageCollectionDataSource1.total()).to.equal(0);
                    expect(pageCollectionDataSource2.total()).to.equal(0);
                    done();
                });
            });

            xit('if initialized from a stupid array, ...', done => {
                const books = [
                    { title: 'Gone with the wind' },
                    { title: 'OK Coral' },
                    { title: 'The third man' },
                    { title: 'The guns of Navarone' }
                ];
                const pageCollectionDataSource = new PageCollectionDataSource({
                    data: books
                });
                expect(pageCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(() => {
                    // TODO: any way to throw??????
                    expect(pageCollectionDataSource.total()).to.equal(
                        books.length
                    );
                    done();
                });
            });

            xit('if initialized with a new model, it should throw', () => {
                const Book = kendo.data.Model.define({
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
                    const pageCollectionDataSource = new PageCollectionDataSource(
                        {
                            data: books,
                            schema: {
                                model: Book
                            }
                        }
                    );
                    pageCollectionDataSource.read();
                }
                expect(testFn).to.throw(Error);
            });

            it('if initialized from a proper array, the count of pages should match and dirty === false', done => {
                const pageCollectionDataSource = new PageCollectionDataSource({
                    data: pageCollectionArray
                });
                expect(pageCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(() => {
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length
                    );
                    for (let i = 0; i < pageCollectionArray.length; i++) {
                        expect(pageCollectionDataSource.at(i).dirty).to.be
                            .false;
                    }
                    done();
                });
            });

            it('if initialized from a proper array, there should be page components', done => {
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
                const pageCollectionDataSource = new PageCollectionDataSource({
                    data: pageCollectionArray
                });
                expect(pageCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(() => {
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length
                    );
                    const promises = [];
                    for (let i = 0; i < pageCollectionArray.length; i++) {
                        promises.push(test(pageCollectionDataSource.at(i)));
                    }
                    $.when(...promises).always(done);
                });
            });

            it('if initialized from a kendo.data.DataSource, an exception should be raised', () => {
                const fn = function() {
                    const dataSource = PageCollectionDataSource.create(
                        new kendo.data.DataSource({ data: [] })
                    );
                };
                expect(fn).to.throw(Error);
            });

            it('if initialized from a PageCollectionDataSource, the number of pages should match', done => {
                const pageCollectionDataSource1 = PageCollectionDataSource.create(
                    pageCollectionArray
                );
                const pageCollectionDataSource2 = PageCollectionDataSource.create(
                    pageCollectionDataSource1
                );
                expect(pageCollectionDataSource1)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(pageCollectionDataSource2)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource1.options.schema.model()
                ).to.be.an.instanceof(Page);
                expect(
                    new pageCollectionDataSource2.options.schema.model()
                ).to.be.an.instanceof(Page);
                $.when(
                    pageCollectionDataSource1.read(),
                    pageCollectionDataSource2.read()
                ).then(() => {
                    expect(pageCollectionDataSource1.total()).to.equal(
                        pageCollectionArray.length
                    );
                    expect(pageCollectionDataSource2.total()).to.equal(
                        pageCollectionArray.length
                    );
                    done();
                });
            });

            it('if initialized from a transport, the number of pages should match', done => {
                const pageCollectionDataSource1 = PageCollectionDataSource.create(
                    pageCollectionArray
                );
                const pageCollectionDataSource2 = new PageCollectionDataSource({
                    transport: {
                        read(options) {
                            options.success(pageCollectionArray);
                        }
                    }
                });
                expect(pageCollectionDataSource1)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(pageCollectionDataSource2)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource1.options.schema.model()
                ).to.be.an.instanceof(Page);
                expect(
                    new pageCollectionDataSource2.options.schema.model()
                ).to.be.an.instanceof(Page);
                $.when(
                    pageCollectionDataSource1.read(),
                    pageCollectionDataSource2.read()
                ).then(() => {
                    expect(pageCollectionDataSource1.total()).to.equal(
                        pageCollectionArray.length
                    );
                    expect(pageCollectionDataSource2.total()).to.equal(
                        pageCollectionArray.length
                    );
                    done();
                });
            });

            it('if initialized from $.ajax, the number of pages and components should match', done => {
                const pageCollectionDataSource = new PageCollectionDataSource({
                    transport: {
                        read: {
                            url: dataUrl('pageCollection.json'),
                            dataType: 'json'
                        }
                    }
                });
                expect(pageCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                $.when(
                    pageCollectionDataSource.read(),
                    $.getJSON(
                        pageCollectionDataSource.options.transport.read.url
                    )
                ).done((response1, response2) => {
                    expect(response2)
                        .to.be.an.instanceof(Array)
                        .that.has.property('length', 3);
                    expect(response2[0]).to.be.an.instanceof(Array);
                    const pageCollectionArray = response2[0];
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length
                    );
                    const promises = [];
                    for (var i = 0; i < pageCollectionDataSource.total(); i++) {
                        var page = pageCollectionDataSource.at(i);
                        expect(page).to.be.an.instanceof(Page);
                        expect(page.components).to.be.an.instanceof(
                            PageComponentCollectionDataSource
                        );
                        expect(page.components.total()).to.equal(0);
                        /* jshint -W083 */
                        const promise = page.load().done(() => {
                            expect(page.components.total()).to.equal(
                                pageCollectionArray[i].components.length
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
                const pageCollectionDataSource = new PageCollectionDataSource({
                    data: pageCollectionArray
                });
                expect(pageCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(() => {
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length
                    );
                    pageCollectionDataSource.add(new Page());
                    expect(
                        pageCollectionDataSource
                            .at(pageCollectionArray.length)
                            .isNew()
                    ).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length + 1
                    );
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call create', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const pageCollectionDataSource = new PageCollectionDataSource({
                    transport: {
                        read(options) {
                            options.success(pageCollectionArray);
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
                expect(pageCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(() => {
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length
                    );
                    pageCollectionDataSource.add(new Page());
                    expect(
                        pageCollectionDataSource
                            .at(pageCollectionArray.length)
                            .isNew()
                    ).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length + 1
                    );
                    pageCollectionDataSource.sync().always(() => {
                        expect(create).to.have.been.called;
                        expect(update).not.to.have.been.called;
                        expect(destroy).not.to.have.been.called;
                        done();
                    });
                });
            });
        });

        describe('Updating', () => {
            it('If dataSource initialized from in-memory array, there should be one updated page', done => {
                const pageCollectionDataSource = new PageCollectionDataSource({
                    data: pageCollectionArray
                });
                expect(pageCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(() => {
                    pageCollectionDataSource
                        .at(0)
                        .set('style', 'background-color: #555555;');
                    expect(pageCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length
                    );
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call update', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const pageCollectionDataSource = new PageCollectionDataSource({
                    transport: {
                        read(options) {
                            options.success(pageCollectionArray);
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
                expect(pageCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(() => {
                    pageCollectionDataSource
                        .at(0)
                        .set('style', 'background-color: #555555;');
                    expect(pageCollectionDataSource.at(0).dirty).to.be.true;
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length
                    );
                    pageCollectionDataSource.sync().always(() => {
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
                const pageCollectionDataSource = new PageCollectionDataSource({
                    data: pageCollectionArray
                });
                expect(pageCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(() => {
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length
                    );
                    pageCollectionDataSource.remove(
                        pageCollectionDataSource.at(0)
                    );
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length - 1
                    );
                    done();
                });
            });

            it('If dataSource initialized from transport, it should only call destroy', done => {
                const create = sinon.spy();
                const update = sinon.spy();
                const destroy = sinon.spy();
                const pageCollectionDataSource = new PageCollectionDataSource({
                    transport: {
                        read(options) {
                            options.success(pageCollectionArray);
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
                expect(pageCollectionDataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    new pageCollectionDataSource.options.schema.model()
                ).to.be.an.instanceof(Page);
                pageCollectionDataSource.read().then(() => {
                    expect(pageCollectionDataSource.total()).to.equal(
                        pageCollectionArray.length
                    );
                    pageCollectionDataSource.remove(
                        pageCollectionDataSource.at(0)
                    );
                    pageCollectionDataSource.sync().then(() => {
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
 * PageCollectionDataSource
 ******************************************************************************************************** */

describe('Test PageCollectionDataSource', () => {
    describe('When initializing a PageCollectionDataSource', () => {});
});
