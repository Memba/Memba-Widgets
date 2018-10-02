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
import Image from '../../../src/js/data/models.image.es6';
import BaseDataSource from '../../../src/js/data/datasources.base.es6';
import PageComponentDataSource from '../../../src/js/data/datasources.pagecomponent.es6';
import PageComponent from '../../../src/js/data/models.pagecomponent.es6';
import ObjectId from '../../../src/js/common/pongodb.objectid.es6';

// Load tools
import '../../../src/js/tools/tools.label.es6';

const { describe, it } = window;
const { expect } = chai;
const {
    data: { DataSource, ObservableArray }
} = window.kendo;
chai.use(sinonChai);

const DATA = [
    {
        text: 'error',
        url: 'https://cdn.kidoju.com/images/o_collection/svg/office/error.svg'
    },
    {
        text: 'success',
        url: 'https://cdn.kidoju.com/images/o_collection/svg/office/ok.svg'
    },
    {
        text: 'warning',
        url:
            'https://cdn.kidoju.com/images/o_collection/svg/office/sign_warning.svg'
    }
];
const LABEL = {
    attributes: {
        style: 'font-family: Georgia, serif; color: #FF0000;',
        text: 'World'
    },
    height: 100,
    id: new ObjectId().toString(),
    left: 500,
    properties: {
        behavior: 'none',
        constant: ''
    },
    rotate: 90,
    tool: 'label',
    top: 250,
    width: 300
};

describe('datasources.pagecomponent', () => {
    describe('PageComponentDataSource', () => {
        describe('Initialization', () => {
            xit('It should initialize without options', done => {
                const dataSource = new PageComponentDataSource();
                expect(dataSource).to.be.an.instanceof(PageComponentDataSource);
                expect(dataSource).to.be.an.instanceof(BaseDataSource);
                expect(dataSource).to.be.an.instanceof(DataSource);
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                dataSource
                    .read()
                    .then(() => {
                        expect(dataSource.total()).to.equal(0);
                        done();
                    })
                    .catch(done);
            });

            xit('It should initialize from an empty array', done => {
                const dataSource = new PageComponentDataSource({ data: [] });
                expect(dataSource).to.be.an.instanceof(PageComponentDataSource);
                expect(dataSource).to.be.an.instanceof(BaseDataSource);
                expect(dataSource).to.be.an.instanceof(DataSource);
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                dataSource
                    .read()
                    .then(() => {
                        expect(dataSource.total()).to.equal(0);
                        done();
                    })
                    .catch(done);
            });

            xit('It should not initialize from a dummy array', () => {
                function test() {
                    const dataSource = new PageComponentDataSource({
                        data: JSC.array()()
                    });
                    dataSource.read();
                }

                expect(test).to.throw(Error);
            });

            it('It should add default values', done => {
                const dataSource = new PageComponentDataSource({
                    data: [{ tool: 'label' }]
                });
                expect(dataSource).to.be.an.instanceof(PageComponentDataSource);
                expect(dataSource).to.be.an.instanceof(BaseDataSource);
                expect(dataSource).to.be.an.instanceof(DataSource);
                expect(dataSource)
                    .to.have.nested.property('options.schema.model')
                    .that.is.a('function');
                expect(
                    // eslint-disable-next-line new-cap
                    new dataSource.options.schema.model()
                ).to.be.an.instanceof(PageComponent);
                dataSource
                    .read()
                    .then(() => {
                        expect(dataSource.total()).to.equal(1);
                        debugger;
                        done();
                    })
                    .catch(done);
            });
        });

        describe('Adding and inserting', () => {
            it('It should add a label', () => {
                const dataSource = new PageComponentDataSource();
                dataSource.add(LABEL);
                const total = dataSource.total();
                expect(total).to.equal(1);
                const data = dataSource.data();
                expect(data)
                    .to.be.an.instanceof(ObservableArray)
                    .with.lengthOf(1);
                expect(data[0]).to.be.an.instanceof(Image);
            });

            it('It should insert a label', done => {
                const dataSource = new PageComponentDataSource({ data: DATA });
                dataSource
                    .read()
                    .then(() => {
                        dataSource.insert(0, LABEL);
                        const total = dataSource.total();
                        expect(total).to.equal(DATA.length + 1);
                        const data = dataSource.data();
                        expect(data)
                            .to.be.an.instanceof(ObservableArray)
                            .with.lengthOf(DATA.length + 1);
                        expect(data[0]).to.be.an.instanceof(Image);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('Updating', () => {});

        describe('Removing', () => {});

        describe('More...', () => {
            it('It should raise events', () => {});

            it('It should handle duplicate ids', () => {});

            it('It should raise errors', () => {});
        });
    });

    describe('PageComponentDataSource.create', () => {
        it('It should create from an array', () => {});

        it('It should create from an ObservbaleArray', () => {});

        it('It should create from a PageComponentDataSource', () => {});
    });
});

/** *******************************************************************************************************
 * PageComponentCollectionDataSource
 ******************************************************************************************************** */

xdescribe('Test PageComponentCollectionDataSource', () => {
    describe('When initializing a PageComponentCollectionDataSource', done => {
        it('if initialized from an empty array, the count of components should match', done => {
            const pageComponentCollectionDataSource1 = new PageComponentCollectionDataSource();
            const pageComponentCollectionDataSource2 = new PageComponentCollectionDataSource(
                { data: [] }
            );
            expect(pageComponentCollectionDataSource1)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(pageComponentCollectionDataSource2)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource1.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            expect(
                new pageComponentCollectionDataSource2.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            $.when(
                pageComponentCollectionDataSource1.read(),
                pageComponentCollectionDataSource2.read()
            ).then(() => {
                expect(pageComponentCollectionDataSource1.total()).to.equal(0);
                expect(pageComponentCollectionDataSource2.total()).to.equal(0);
                done();
            });
        });

        it('if initialized from a stupid array (components have no valid tool), it should throw', () => {
            function testFn() {
                const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                    { data: [{ a: 1, b: 2 }, { a: '1', b: '2' }] }
                );
                pageComponentCollectionDataSource.read();
            }
            expect(testFn).to.throw(Error);
        });

        it('if initialized with a new model, it should throw', () => {
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
                const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                    {
                        data: books,
                        schema: {
                            model: Book
                        }
                    }
                );
                pageComponentCollectionDataSource.read();
            }
            expect(testFn).to.throw(Error);
        });

        it('if initialized from a proper array, the count of components should match and dirty === false', done => {
            const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                { data: pageComponentCollectionArray }
            );
            expect(pageComponentCollectionDataSource)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            pageComponentCollectionDataSource.read().then(() => {
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                for (let i = 0; i < pageComponentCollectionArray.length; i++) {
                    expect(pageComponentCollectionDataSource.at(i).dirty).to.be
                        .false;
                }
                done();
            });
        });

        it('if initialized from a proper array, attributes and properties should be instances of kendo.data.Model', done => {
            const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                { data: pageComponentCollectionArray }
            );
            expect(pageComponentCollectionDataSource)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            pageComponentCollectionDataSource.read().then(() => {
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                for (let i = 0; i < pageComponentCollectionArray.length; i++) {
                    expect(
                        pageComponentCollectionDataSource.at(i).attributes
                    ).to.be.an.instanceof(kendo.data.Model);
                    expect(
                        pageComponentCollectionDataSource.at(i).properties
                    ).to.be.an.instanceof(kendo.data.Model);
                }
                done();
            });
        });

        it('if initialized from a kendo.data.DataSource that is not a kendo.PageComponentCollectionDataSource, it should throw', () => {
            const testFn = function() {
                const dataSource = PageComponentCollectionDataSource.create(
                    new kendo.data.DataSource({ data: [] })
                );
            };
            expect(testFn).to.throw(Error);
        });

        it('if initialized from a PageComponentCollectionDataSource, the number of components should match', done => {
            const pageComponentCollectionDataSource1 = PageComponentCollectionDataSource.create(
                pageComponentCollectionArray
            );
            const pageComponentCollectionDataSource2 = PageComponentCollectionDataSource.create(
                pageComponentCollectionDataSource1
            );
            expect(pageComponentCollectionDataSource1)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(pageComponentCollectionDataSource2)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource1.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            expect(
                new pageComponentCollectionDataSource2.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            $.when(
                pageComponentCollectionDataSource1.read(),
                pageComponentCollectionDataSource2.read()
            ).then(() => {
                expect(pageComponentCollectionDataSource1.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                expect(pageComponentCollectionDataSource2.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                done();
            });
        });

        it('if initialized from a transport, the number of components should match', done => {
            const pageComponentCollectionDataSource1 = PageComponentCollectionDataSource.create(
                pageComponentCollectionArray
            );
            const pageComponentCollectionDataSource2 = new PageComponentCollectionDataSource(
                {
                    transport: {
                        read(options) {
                            options.success(pageComponentCollectionArray);
                        }
                    }
                }
            );
            expect(pageComponentCollectionDataSource1)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(pageComponentCollectionDataSource2)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource1.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            expect(
                new pageComponentCollectionDataSource2.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            $.when(
                pageComponentCollectionDataSource1.read(),
                pageComponentCollectionDataSource2.read()
            ).then(() => {
                expect(pageComponentCollectionDataSource1.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                expect(pageComponentCollectionDataSource2.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                done();
            });
        });

        it('if initialized from $.ajax, the number of components should match', done => {
            const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                {
                    transport: {
                        read: {
                            url: dataUrl('pageComponentCollection.json'),
                            dataType: 'json'
                        }
                    }
                }
            );
            expect(pageComponentCollectionDataSource)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            $.when(
                pageComponentCollectionDataSource.read(),
                $.getJSON(
                    pageComponentCollectionDataSource.options.transport.read.url
                )
            ).done((response1, response2) => {
                expect(response2)
                    .to.be.an.instanceof(Array)
                    .that.has.property('length', 3);
                expect(response2[0]).to.be.an.instanceof(Array);
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    response2[0].length
                );
                const pageComponent = pageComponentCollectionDataSource.at(0);
                expect(pageComponent).to.be.an.instanceof(PageComponent);
                done();
            });
        });
    });

    describe('When creating a page component', () => {
        it('If dataSource initialized from in-memory array, there should be one page component more', done => {
            const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                { data: pageComponentCollectionArray }
            );
            expect(pageComponentCollectionDataSource)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            pageComponentCollectionDataSource.read().then(() => {
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                pageComponentCollectionDataSource.add(
                    new PageComponent({ tool: 'label' })
                );
                expect(
                    pageComponentCollectionDataSource
                        .at(pageComponentCollectionArray.length)
                        .isNew()
                ).to.be.true;
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    pageComponentCollectionArray.length + 1
                );
                done();
            });
        });

        it('If dataSource initialized from transport, it should only call create', done => {
            const create = sinon.spy();
            const update = sinon.spy();
            const destroy = sinon.spy();
            const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                {
                    transport: {
                        read(options) {
                            options.success(pageComponentCollectionArray);
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
                }
            );
            expect(pageComponentCollectionDataSource)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            pageComponentCollectionDataSource.read().then(() => {
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                pageComponentCollectionDataSource.add(
                    new PageComponent({ tool: 'label' })
                );
                expect(
                    pageComponentCollectionDataSource
                        .at(pageComponentCollectionArray.length)
                        .isNew()
                ).to.be.true;
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    pageComponentCollectionArray.length + 1
                );
                pageComponentCollectionDataSource.sync().always(() => {
                    expect(create).to.have.been.called;
                    expect(update).not.to.have.been.called;
                    expect(destroy).not.to.have.been.called;
                    done();
                });
            });
        });
    });

    describe('When updating a page component', () => {
        it('If dataSource initialized from in-memory array, there should be one updated page component', done => {
            const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                { data: pageComponentCollectionArray }
            );
            expect(pageComponentCollectionDataSource)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            pageComponentCollectionDataSource.read().then(() => {
                pageComponentCollectionDataSource.at(0).set('top', 111);
                expect(pageComponentCollectionDataSource.at(0).dirty).to.be
                    .true;
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                done();
            });
        });

        it('If dataSource initialized from transport, it should only call update', done => {
            const create = sinon.spy();
            const update = sinon.spy();
            const destroy = sinon.spy();
            const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                {
                    transport: {
                        read(options) {
                            options.success(pageComponentCollectionArray);
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
                }
            );
            expect(pageComponentCollectionDataSource)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            pageComponentCollectionDataSource.read().then(() => {
                pageComponentCollectionDataSource.at(0).set('top', 111);
                expect(pageComponentCollectionDataSource.at(0).dirty).to.be
                    .true;
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                pageComponentCollectionDataSource.sync().always(() => {
                    expect(create).not.to.have.been.called;
                    expect(update).to.have.been.called;
                    expect(destroy).not.to.have.been.called;
                    done();
                });
            });
        });
    });

    describe('When removing a page component', () => {
        it('If dataSource initialized from in-memory array, there should be one page component less', done => {
            const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                { data: pageComponentCollectionArray }
            );
            expect(pageComponentCollectionDataSource)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            pageComponentCollectionDataSource.read().then(() => {
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                pageComponentCollectionDataSource.remove(
                    pageComponentCollectionDataSource.at(0)
                );
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    pageComponentCollectionArray.length - 1
                );
                done();
            });
        });

        it('If dataSource initialized from transport, it should only call destroy', done => {
            const create = sinon.spy();
            const update = sinon.spy();
            const destroy = sinon.spy();
            const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                {
                    transport: {
                        read(options) {
                            options.success(pageComponentCollectionArray);
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
                }
            );
            expect(pageComponentCollectionDataSource)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            pageComponentCollectionDataSource.read().then(() => {
                expect(pageComponentCollectionDataSource.total()).to.equal(
                    pageComponentCollectionArray.length
                );
                pageComponentCollectionDataSource.remove(
                    pageComponentCollectionDataSource.at(0)
                );
                pageComponentCollectionDataSource.sync().then(() => {
                    expect(create).not.to.have.been.called;
                    expect(update).not.to.have.been.called;
                    expect(destroy).to.have.been.called;
                    done();
                });
            });
        });
    });

    describe('toJSON', () => {
        it('it should implement toJSON', done => {
            const pageComponentCollectionDataSource = new PageComponentCollectionDataSource(
                { data: pageComponentCollectionArray }
            );
            expect(pageComponentCollectionDataSource)
                .to.have.nested.property('options.schema.model')
                .that.is.a('function');
            expect(
                new pageComponentCollectionDataSource.options.schema.model()
            ).to.be.an.instanceof(PageComponent);
            pageComponentCollectionDataSource.read().then(() => {
                expect(pageComponentCollectionDataSource)
                    .to.have.property('toJSON')
                    .that.is.a('function');
                const pageComponentCollectionJSON = pageComponentCollectionDataSource.toJSON();
                // Note: deep.equal of both arrays does not work
                expect(pageComponentCollectionJSON)
                    .to.be.an.instanceof(Array)
                    .with.property(
                        'length',
                        pageComponentCollectionArray.length
                    );
                for (let i = 0; i < pageComponentCollectionJSON.length; i++) {
                    expect(
                        pageComponentCollectionJSON[i].attributes.alt
                    ).to.equal(pageComponentCollectionArray[i].attributes.alt);
                    // expect(pageComponentCollectionJSON[i].attributes.dirty).to.equal(pageComponentCollectionArray[i].attributes.dirty);
                    expect(
                        pageComponentCollectionJSON[i].attributes.src
                    ).to.equal(pageComponentCollectionArray[i].attributes.src);
                    expect(pageComponentCollectionJSON[i].height).to.equal(
                        pageComponentCollectionArray[i].height
                    );
                    expect(pageComponentCollectionJSON[i].id).to.equal(
                        pageComponentCollectionArray[i].id
                    );
                    expect(pageComponentCollectionJSON[i].left).to.equal(
                        pageComponentCollectionArray[i].left
                    );
                    // expect(pageComponentCollectionJSON[i].properties.dirty).to.equal(pageComponentCollectionArray[i].properties.dirty);
                    expect(pageComponentCollectionJSON[i].rotate).to.equal(
                        pageComponentCollectionArray[i].rotate
                    );
                    // expect(pageComponentCollectionJSON[i].tag).to.equal(pageComponentCollectionArray[i].tag);
                    expect(pageComponentCollectionJSON[i].tool).to.equal(
                        pageComponentCollectionArray[i].tool
                    );
                    expect(pageComponentCollectionJSON[i].top).to.equal(
                        pageComponentCollectionArray[i].top
                    );
                    expect(pageComponentCollectionJSON[i].width).to.equal(
                        pageComponentCollectionArray[i].width
                    );
                }
                done();
            });
        });
    });

    // TODO Filter, Query, Group, Aggregate, Serialize
});
